import { useRef, useEffect, useState, useMemo, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGeo } from "../../../context/geoContext";

import styles from "./styles.module.css";

function Products({ filters, onRemoveFilter, products, status }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const navigate = useNavigate();

  const { latitude, longitude, loading: geoLoading, skipped } = useGeo(); // ✅ usar contexto

  const { categorias = [], materiais = [], cor, preco } = filters;
  const temFiltros =
    categorias.length > 0 || materiais.length > 0 || cor || preco > 0;

  const [orderBy, setOrderBy] = useState("distancia");
  const [quantidades, setQuantidades] = useState({});

  const params = new URLSearchParams(location.search);
  const search = params.get("search")?.toLowerCase() || "";

  // Função para calcular distância entre duas coordenadas (em km)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const productsWithDistance = useMemo(() => {
    // Se skipou, não calcula distância
    if (skipped || !latitude || !longitude)
      return products.map((p) => ({ ...p, distance: null }));

    return products.map((p) => {
      const supplier = p.supplier;
      const distance =
        supplier?.latitude && supplier?.longitude
          ? getDistance(
              latitude,
              longitude,
              supplier.latitude,
              supplier.longitude
            )
          : null;
      return { ...p, distance };
    });
  }, [products, latitude, longitude, skipped]);

  // 🔹 Mapeamento cores português → inglês
  const coresPTparaEN = {
    vermelho: "red",
    azul: "blue",
    verde: "green",
    preto: "black",
    branco: "white",
    amarelo: "yellow",
    rosa: "pink",
    cinza: "gray",
    laranja: "orange",
    marrom: "brown",
    roxo: "purple",
    ciano: "cyan",
    magenta: "magenta",
    dourado: "gold",
    prateado: "silver",
    bege: "beige",
    transparente: "transparent",
  };

  // 🔹 Mapa invertido inglês → português
  const coresENparaPT = Object.fromEntries(
    Object.entries(coresPTparaEN).map(([pt, en]) => [en, pt])
  );

  // 🔹 Traduzir cor pt → en (para filtro)
  const traduzirCorParaIngles = (corPt) => {
    if (!corPt) return null;
    return coresPTparaEN[corPt.toLowerCase()] || corPt.toLowerCase();
  };

  // 🔹 Função para capitalizar
  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // 🔹 Converte qualquer valor em array seguro
  const toArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
      return value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
    return [String(value)];
  };

  const handleRemoveFilter = (tipo, valor) => {
    onRemoveFilter(tipo, valor);
    navigate(location.pathname, { replace: true });
  };

  // 🔹 Filtragem dos produtos
  const filteredProducts = useMemo(() => {
    const filtroCategorias = toArray(categorias);
    const filtroMateriais = toArray(materiais);
    const corEmIngles = traduzirCorParaIngles(cor);
    const searchCorEmIngles = traduzirCorParaIngles(search);

    return products.filter((p) => {
      const materials = toArray(p.material);
      const colors = toArray(p.colors);
      const categories = toArray(p.category);
      const finishings = toArray(p.finishing);

      const precoProduto = Number(p.price) || 0;

      const matchesSearch =
        !search ||
        (p.name && p.name.toLowerCase().includes(search)) ||
        categories.some((cat) => cat.toLowerCase().includes(search)) ||
        materials.some((mat) => mat.toLowerCase().includes(search)) ||
        colors.some(
          (c) =>
            c.toLowerCase().includes(search) ||
            c.toLowerCase() === searchCorEmIngles
        );

      const matchesCategoria =
        filtroCategorias.length === 0 ||
        categories.some((cat) => filtroCategorias.includes(cat));

      const matchesMaterial =
        filtroMateriais.length === 0 ||
        materials.some((mat) => filtroMateriais.includes(mat));

      const matchesCor =
        !cor || colors.some((c) => c.toLowerCase() === corEmIngles);

      const matchesPreco = !preco || precoProduto <= preco;

      return (
        matchesSearch &&
        matchesCategoria &&
        matchesMaterial &&
        matchesCor &&
        matchesPreco
      );
    });
  }, [products, search, categorias, materiais, cor, preco]);

  // 🔹 Ordenação
  const sortedProducts = useMemo(() => {
    const prods = [...filteredProducts].map(
      (p) => productsWithDistance.find((pd) => pd.id === p.id) || p
    );

    return prods.sort((a, b) => {
      const precoA = Number(a.price) || 0;
      const precoB = Number(b.price) || 0;

      switch (orderBy) {
        case "distancia":
          // Se skipou, não ordena por distância
          if (skipped) return 0;
          return (a.distance || Infinity) - (b.distance || Infinity);
        case "maior":
          return precoB - precoA;
        case "menor":
          return precoA - precoB;
        case "data":
        default:
          return 0;
      }
    });
  }, [filteredProducts, orderBy, productsWithDistance]);

  // 🔹 Quantidade
  const aumentar = (id) =>
    setQuantidades((prev) => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
  const diminuir = (id) =>
    setQuantidades((prev) => ({
      ...prev,
      [id]: prev[id] > 1 ? prev[id] - 1 : 1,
    }));

  // 🔹 UUID para itens do carrinho
  const generateUUID = () =>
    Date.now().toString(36) + Math.random().toString(36).substring(2);

  // 🔹 Adicionar ao carrinho
  const addToCart = (produto, quantidade) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const corSelecionada = toArray(produto.colors)[0] || null;
    const acabamentoSelecionado = toArray(produto.finishing)[0] || null;
    const materialSelecionado = toArray(produto.material)[0] || null;

    const index = cart.findIndex(
      (item) =>
        item.produto.id === produto.id &&
        item.cor === corSelecionada &&
        item.acabamento === acabamentoSelecionado &&
        item.material === materialSelecionado
    );

    if (index >= 0) {
      cart[index].quantidade += quantidade;
    } else {
      cart.push({
        id: generateUUID(),
        produto,
        quantidade,
        cor: corSelecionada,
        acabamento: acabamentoSelecionado,
        material: materialSelecionado,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(
      new CustomEvent("cartUpdated", { detail: { open: true } })
    );
  };

  // 🔹 Drag & Scroll dos filtros
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;

    const updateFades = () => {
      slider.classList.toggle(styles.fadeLeft, slider.scrollLeft > 0);
      slider.classList.toggle(
        styles.fadeRight,
        slider.scrollLeft < slider.scrollWidth - slider.clientWidth
      );
    };

    const startDrag = (e) => {
      isDragging.current = true;
      startX.current = e.pageX || e.touches[0].pageX;
      scrollLeft.current = slider.scrollLeft;
      slider.classList.add(styles.dragging);
      e.preventDefault();
    };
    const stopDrag = () => {
      isDragging.current = false;
      slider.classList.remove(styles.dragging);
    };
    const doDrag = (e) => {
      if (!isDragging.current) return;
      const x = e.pageX || e.touches[0].pageX;
      slider.scrollLeft = scrollLeft.current - (x - startX.current);
      updateFades();
      e.preventDefault();
    };

    slider.addEventListener("mousedown", startDrag);
    slider.addEventListener("mousemove", doDrag);
    slider.addEventListener("mouseleave", stopDrag);
    slider.addEventListener("mouseup", stopDrag);
    slider.addEventListener("touchstart", startDrag, { passive: false });
    slider.addEventListener("touchmove", doDrag, { passive: false });
    slider.addEventListener("touchend", stopDrag);
    slider.addEventListener("scroll", updateFades);

    updateFades();

    return () => {
      slider.removeEventListener("mousedown", startDrag);
      slider.removeEventListener("mousemove", doDrag);
      slider.removeEventListener("mouseleave", stopDrag);
      slider.removeEventListener("mouseup", stopDrag);
      slider.removeEventListener("touchstart", startDrag);
      slider.removeEventListener("touchmove", doDrag);
      slider.removeEventListener("touchend", stopDrag);
      slider.removeEventListener("scroll", updateFades);
    };
  }, []);

  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;
    slider.classList.toggle(styles.fadeLeft, slider.scrollLeft > 0);
    slider.classList.toggle(
      styles.fadeRight,
      slider.scrollLeft < slider.scrollWidth - slider.clientWidth
    );
  }, [filters]);

  useEffect(() => {
    if (skipped && orderBy === "distancia") {
      setOrderBy("data");
    }
  }, [skipped]);

  // 🔹 Render
  return (
    <div className={styles.container}>
      <div className={styles.headerFiltros}>
        {temFiltros && (
          <div className={styles.filtros} ref={scrollRef}>
            {categorias.map((categoria) => (
              <p key={categoria} className={styles.filtro}>
                {categoria}
                <span
                  className={styles.removeFiltro}
                  onClick={() => handleRemoveFilter("categorias", categoria)}
                >
                  ×
                </span>
              </p>
            ))}
            {materiais.map((material) => (
              <p key={material} className={styles.filtro}>
                {material}
                <span
                  className={styles.removeFiltro}
                  onClick={() => handleRemoveFilter("materiais", material)}
                >
                  ×
                </span>
              </p>
            ))}
            {cor && (
              <p className={styles.filtro}>
                {capitalize(coresENparaPT[cor.toLowerCase()] || cor)}
                <span
                  className={styles.removeFiltro}
                  onClick={() => handleRemoveFilter("cor")}
                >
                  ×
                </span>
              </p>
            )}

            {preco > 0 && (
              <p className={styles.filtro}>
                {`Até R$ ${preco}`}
                <span
                  className={styles.removeFiltro}
                  onClick={() => handleRemoveFilter("preco")}
                >
                  ×
                </span>
              </p>
            )}
          </div>
        )}
        <div className={styles.order}>
          <p>Ordenar por:</p>
          <select value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
            {!skipped && <option value="distancia">Distância</option>}
            <option value="data">Lançamentos</option>
            <option value="maior">Maior Preço</option>
            <option value="menor">Menor Preço</option>
          </select>
        </div>
      </div>

      {status === 404 ? (
        <p className={styles.notFound}>
          Nenhum produto encontrado, tente novamente mais tarde.
        </p>
      ) : (
        <div className={styles.products}>
          {sortedProducts.length === 0 && (
            <div className={styles.empty}>
              <p>Nenhum produto encontrado</p>
              <button onClick={() => handleRemoveFilter("todos")}>
                Ver todos os produtos
              </button>
            </div>
          )}
          {sortedProducts.map((product, index) => {
            const quantidadeAtual = quantidades[product.id] || 1;

            return (
              <div
                className={styles.card}
                key={product.id || index}
                onClick={() => navigate(`/marketplace/${product.id}`)}
              >
                <img
                  src={`${API_URL}${toArray(product.file_paths)[0]?.replace(
                    /\\/g,
                    "/"
                  )}`}
                  alt={product.name}
                />
                {/* Mostrar distância apenas se não skipou */}
                {!skipped && product.distance != null && (
                  <p className={styles.distance}>
                    {product.distance.toFixed(1)} km de você
                  </p>
                )}

                <div className={styles.contentProduct}>
                  <div className={styles.contentTitleProduct}>
                    <h4>{product.name}</h4>
                    <p>{toArray(product.category).join(", ")}</p>
                  </div>
                  <h4>
                    R${" "}
                    {Number(product.price).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </h4>

                  <div className={styles.contentBuy}>
                    <div className={styles.buy}>
                      <div className={styles.quantidadeWrapper}>
                        <button
                          className={styles.botao}
                          onClick={(e) => {
                            e.stopPropagation();
                            diminuir(product.id);
                          }}
                        >
                          –
                        </button>
                        <span className={styles.valor}>{quantidadeAtual}</span>
                        <button
                          className={styles.botao}
                          onClick={(e) => {
                            e.stopPropagation();
                            aumentar(product.id);
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      className={styles.button}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product, quantidadeAtual);
                      }}
                    >
                      Adicionar ao Carrinho
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Products;
