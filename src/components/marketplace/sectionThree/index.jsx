import styles from "./styles.module.css";

import Loading from "../../loading";

import { useContext } from "react";
import { DataContext } from "../../../context/dataContext";

import { useNavigate } from "react-router-dom";

function SectionThree() {
  const { data, loading } = useContext(DataContext);
  const cards = data.brinquedos || [];

  const navigate = useNavigate();

  if (loading || !data) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.containerTitle}>
        <div className={styles.contentTitle}>
          <h2>Brinquedos</h2>
          <p>
            Modelos criativos e divertidos para todas as idades. Perfeitos para
            brincar, aprender ou colecionar.
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

export default SectionThree;
