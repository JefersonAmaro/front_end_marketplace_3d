import { useRef, useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./styles.module.css";

function Products({ filters, onRemoveFilter, products }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { categorias = [], materiais = [], cor, preco } = filters;
  const temFiltros =
    categorias.length > 0 || materiais.length > 0 || cor || preco > 0;

  const [orderBy, setOrderBy] = useState("data");
  const [quantidades, setQuantidades] = useState({});

  const params = new URLSearchParams(location.search);
  const search = params.get("search")?.toLowerCase() || "";

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

  const traduzirCorParaIngles = (corPt) => {
    return coresPTparaEN[corPt?.toLowerCase()] || corPt?.toLowerCase();
  };

  // 🔹 Função que remove filtro e limpa a URL
  const handleRemoveFilter = (tipo, valor) => {
    onRemoveFilter(tipo, valor);
    navigate(location.pathname, { replace: true }); // limpa query string
  };

  // 🔹 Filtragem dos produtos
  const filteredProducts = useMemo(() => {
    const searchLower = search.toLowerCase();
    const searchCorEmIngles = traduzirCorParaIngles(searchLower);

    return products.filter((p) => {
      // Busca pelo nome, categoria, material ou cor
      const matchesSearch =
        !searchLower ||
        (typeof p.name === "string" &&
          p.name.toLowerCase().includes(searchLower)) ||
        (typeof p.category === "string" &&
          p.category.toLowerCase().includes(searchLower)) ||
        (Array.isArray(p.material)
          ? p.material.some(
              (m) =>
                typeof m === "string" && m.toLowerCase().includes(searchLower)
            )
          : typeof p.material === "string" &&
            p.material.toLowerCase().includes(searchLower)) ||
        (Array.isArray(p.colors)
          ? p.colors.some(
              (c) =>
                typeof c === "string" &&
                (c.toLowerCase().includes(searchLower) ||
                  c.toLowerCase() === searchCorEmIngles)
            )
          : typeof p.colors === "string" &&
            (p.colors.toLowerCase().includes(searchLower) ||
              p.colors.toLowerCase() === searchCorEmIngles));

      // Categoria
      const matchesCategoria =
        categorias.length === 0 || categorias.includes(p.category);

      // Material
      const matchesMaterial =
        materiais.length === 0 ||
        (Array.isArray(p.material)
          ? materiais.some((m) => p.material.includes(m))
          : materiais.includes(p.material));

      // Cor (filtro específico)
      const corEmIngles = traduzirCorParaIngles(cor);
      const matchesCor =
        !cor ||
        (Array.isArray(p.colors)
          ? p.colors.some((c) => c.toLowerCase() === corEmIngles)
          : p.colors?.toLowerCase() === corEmIngles);

      // Preço
      const matchesPreco = !preco || Number(p.price.replace(",", ".")) <= preco;

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
    return [...filteredProducts].sort((a, b) => {
      switch (orderBy) {
        case "maior":
          return (
            Number(b.price.replace(",", ".")) -
            Number(a.price.replace(",", "."))
          );
        case "menor":
          return (
            Number(a.price.replace(",", ".")) -
            Number(b.price.replace(",", "."))
          );
        case "data":
        default:
          return 0;
      }
    });
  }, [filteredProducts, orderBy]);

  // 🔹 Controle de quantidades
  const aumentar = (id) =>
    setQuantidades((prev) => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
  const diminuir = (id) =>
    setQuantidades((prev) => ({
      ...prev,
      [id]: prev[id] > 1 ? prev[id] - 1 : 1,
    }));

  const generateUUID = () =>
    Date.now().toString(36) + Math.random().toString(36).substring(2);

  const addToCart = (produto, quantidade) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cor = produto.colors?.[0] || null;
    const acabamento = produto.finishing?.[0] || null;
    const index = cart.findIndex(
      (item) =>
        item.produto.id === produto.id &&
        item.cor === cor &&
        item.acabamento === acabamento
    );
    if (index >= 0) cart[index].quantidade += quantidade;
    else
      cart.push({ id: generateUUID(), produto, quantidade, cor, acabamento });

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(
      new CustomEvent("cartUpdated", { detail: { open: true } })
    );
  };

  // 🔹 Drag & Scroll
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
                {cor}
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
            <option value="data">Lançamentos</option>
            <option value="maior">Maior Preço</option>
            <option value="menor">Menor Preço</option>
          </select>
        </div>
      </div>

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
              <img src={product.img} alt={product.name} />
              <p className={styles.distance}>
                {product.distance?.toFixed(1)} km de você
              </p>
              <div className={styles.contentProduct}>
                <div className={styles.contentTitleProduct}>
                  <h4>{product.name}</h4>
                  <p>{product.category}</p>
                </div>
                <h4>R$ {product.price}</h4>
                <div className={styles.contentBuy}>
                  <div className={styles.buy}>
                    <div className={styles.quantidadeWrapper}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          diminuir(product.id);
                        }}
                        className={styles.botao}
                      >
                        –
                      </button>
                      <span className={styles.valor}>{quantidadeAtual}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          aumentar(product.id);
                        }}
                        className={styles.botao}
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
    </div>
  );
}

export default Products;
