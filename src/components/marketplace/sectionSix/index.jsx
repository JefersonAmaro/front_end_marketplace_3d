import styles from "./styles.module.css";

import { useContext } from "react";
import { DataContext } from "../../../context/dataContext";

import Loading from "../../loading";

import { useNavigate } from "react-router-dom";

function SectionSix() {
  const { data, loading } = useContext(DataContext);
  const cards = data.outros || [];

  const navigate = useNavigate();

  if (loading || !data) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.containerTitle}>
        <div className={styles.contentTitle}>
          <h2>Outros</h2>
          <p>
            Para o que é único, diferente ou inesperado. Explore o que foge do
            padrão.
          </p>
        </div>
        <div className={styles.contentButton}>
          <button>Ver Mais</button>
        </div>
      </div>

      <div className={styles.containerCards}>
        {cards.map((card, index) => (
          <div className={styles.card} key={index} onClick={() => navigate(`/marketplace/${card.id}`)}>
            <img src={card.img} alt={card.title} />
            <div className={styles.contentCard}>
              <div className={styles.contentTitleCard}>
                <h4>{card.name}</h4>
                <p>{card.category}</p>
              </div>
              <h4>R$ {card.price}</h4>

              {/* Bloquear o onClick do card */}
              <button onClick={(e) => e.stopPropagation()}>Comprar Agora</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SectionSix;
