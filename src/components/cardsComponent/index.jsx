import styles from "./styles.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGeo } from "../../context/geoContext";

function CardsComponent(props) {
  const API_URL = import.meta.env.VITE_API_URL;
  const { title, description, button, onClickButton, cards, status } = props;
  const { skipped } = useGeo();

  const navigate = useNavigate();

  const [quantidades, setQuantidades] = useState({});

  const aumentar = (id) => {
    setQuantidades((prev) => ({
      ...prev,
      [id]: (prev[id] || 1) + 1,
    }));
  };

  const diminuir = (id) => {
    setQuantidades((prev) => ({
      ...prev,
      [id]: prev[id] > 1 ? prev[id] - 1 : 1,
    }));
  };

  function generateUUID() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  const addToCart = (produto, quantidade) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const cor = Array.isArray(produto.colors)
      ? produto.colors[0]
      : produto.colors
      ? produto.colors.split(",")[0].trim()
      : null;

    const acabamento = Array.isArray(produto.finishing)
      ? produto.finishing[0]
      : produto.finishing
      ? produto.finishing.split(",")[0].trim()
      : null;

    const material = Array.isArray(produto.material)
      ? produto.material[0]
      : produto.material
      ? produto.material.split(",")[0].trim()
      : null;

    console.log("Adicionando ao carrinho:", {
      produto,
      cor,
      acabamento,
      material,
      quantidade,
    });

    const index = cart.findIndex(
      (item) =>
        item.produto.id === produto.id &&
        item.cor === cor &&
        item.acabamento === acabamento &&
        item.material === material
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
        material,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(
      new CustomEvent("cartUpdated", { detail: { open: true } })
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.containerTitle}>
        <div className={styles.contentTitle}>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className={styles.contentButton}>
          <button className={styles.contentButtonBtn} onClick={onClickButton}>
            {button}
          </button>
        </div>
      </div>

      <div
        className={styles.containerCards}
        style={
          cards.length > 3
            ? { justifyContent: "space-between" }
            : { justifyContent: "start" }
        }
      >
        {status === 404 && (
          <p className={styles.notFound}>
            Nenhum produto encontrado, tente novamente mais tarde.
          </p>
        )}
        {cards.map((card, index) => {
          const quantidadeAtual = quantidades[card.id] || 1;

          return (
            <div
              className={styles.card}
              key={index}
              onClick={() => navigate(`/marketplace/${card.id}`)}
            >
              <img
                src={`${API_URL}${card.file_paths.split(",")[0]}`}
                alt={card.name}
              />
              {!skipped && card.distance != null && (
                <p className={styles.distance}>
                  {card.distance?.toFixed(1)} km de você
                </p>
              )}
              <div className={styles.contentCard}>
                <div className={styles.contentTitleCard}>
                  <h4>{card.name}</h4>
                  <p>{card.category}</p>
                </div>
                <h4 className={styles.price}>
                  R${" "}
                  {card.price.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </h4>

                <div className={styles.contentBuy}>
                  <div className={styles.buy}>
                    <div className={styles.quantidadeWrapper}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          diminuir(card.id);
                        }}
                        className={styles.botao}
                      >
                        –
                      </button>
                      <span className={styles.valor}>{quantidadeAtual}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          aumentar(card.id);
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
                      addToCart(card, quantidadeAtual);
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

export default CardsComponent;
