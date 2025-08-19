import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

function Products({ filters, onRemoveFilter, products }) {
  const { categorias = [], materiais = [], cor, preco } = filters;
  const temFiltros =
    categorias.length > 0 || materiais.length > 0 || cor || preco;
  const [orderBy, setOrderBy] = useState("data");

  const sortedProducts = [...products].sort((a, b) => {
    switch (orderBy) {
      case "maior":
        return (
          Number(b.price.replace(",", ".")) - Number(a.price.replace(",", "."))
        );
      case "menor":
        return (
          Number(a.price.replace(",", ".")) - Number(b.price.replace(",", "."))
        );
      case "data":
      default:
        // Se você tiver um campo de data, use ele. Caso não, mantém a ordem original
        return 0;
    }
  });

  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const navigate = useNavigate();

  // Controle de quantidades
  const [quantidades, setQuantidades] = useState({});

  const aumentar = (id) => {
    setQuantidades((prev) => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
  };

  const diminuir = (id) => {
    setQuantidades((prev) => {
      const atual = prev[id] || 1;
      return { ...prev, [id]: atual > 1 ? atual - 1 : 1 };
    });
  };

  function generateUUID() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  const addToCart = (produto, quantidade) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    console.log(produto);

    const cor = produto.colors?.[0] || null;
    const acabamento = produto.finishing?.[0] || null;

    const index = cart.findIndex(
      (item) =>
        item.produto.id === produto.id &&
        item.cor === cor &&
        item.acabamento === acabamento
    );

    if (index >= 0) {
      cart[index].quantidade += quantidade;
    } else {
      cart.push({
        id: generateUUID(),
        produto,
        quantidade,
        cor,
        acabamento,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(
      new CustomEvent("cartUpdated", { detail: { open: true } })
    );
  };

  // Drag e scroll
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

    // Eventos desktop
    slider.addEventListener("mousedown", startDrag);
    slider.addEventListener("mousemove", doDrag);
    slider.addEventListener("mouseleave", stopDrag);
    slider.addEventListener("mouseup", stopDrag);

    // Eventos mobile
    slider.addEventListener("touchstart", startDrag, { passive: false });
    slider.addEventListener("touchmove", doDrag, { passive: false });
    slider.addEventListener("touchend", stopDrag);

    // Scroll normal
    slider.addEventListener("scroll", updateFades);

    // Inicializa fades
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

  // Atualiza fades sempre que os filtros mudarem
  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;
    slider.classList.toggle(styles.fadeLeft, slider.scrollLeft > 0);
    slider.classList.toggle(
      styles.fadeRight,
      slider.scrollLeft < slider.scrollWidth - slider.clientWidth
    );
  }, [filters]);

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
                  onClick={() => onRemoveFilter("categorias", categoria)}
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
                  onClick={() => onRemoveFilter("materiais", material)}
                >
                  ×
                </span>
              </p>
            ))}

            {cor && (
              <p className={styles.filtro}>
                Cor: {cor}
                <span
                  className={styles.removeFiltro}
                  onClick={() => onRemoveFilter("cor")}
                >
                  ×
                </span>
              </p>
            )}

            {preco !== null && preco !== undefined && (
              <p className={styles.filtro}>
                Preço até: {preco > 0 ? `R$ ${preco}` : "Sem limite"}
                <span
                  className={styles.removeFiltro}
                  onClick={() => onRemoveFilter("preco")}
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
            <option value="data">Data de cadastro</option>
            <option value="maior">Maior Preço</option>
            <option value="menor">Menor Preço</option>
          </select>
        </div>
      </div>

      <div className={styles.products}>
        {sortedProducts.map((product, index) => {
          const quantidadeAtual = quantidades[product.id] || 1;

          return (
            <div
              className={styles.card}
              key={product.id || index}
              onClick={() => navigate(`/marketplace/${product.id}`)}
            >
              <img src={product.img} alt={product.name} />
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
