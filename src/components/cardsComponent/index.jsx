import styles from "./styles.module.css";

import { useNavigate } from "react-router-dom";

function CardsComponent(props) {
  const { title, description, button, cards } = props;
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.containerTitle}>
        <div className={styles.contentTitle}>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className={styles.contentButton}>
          <button>{button}</button>
        </div>
      </div>

      <div className={styles.containerCards}>
        {cards.map((card, index) => (
          <div
            className={styles.card}
            key={index}
            onClick={() => navigate(`/marketplace/${card.id}`)}
          >
            <img src={card.img} alt={card.title} />
            <div className={styles.contentCard}>
              <div className={styles.contentTitleCard}>
                <h4>{card.name}</h4>
                <p>{card.category}</p>
              </div>
              <h4>R$ {card.price}</h4>

              {/* Bloquear o onClick do card */}
              <button onClick={(e) => e.stopPropagation()}>
                Comprar Agora
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CardsComponent;
