import styles from "./styles.module.css";

import { useContext } from "react";
import { DataContext } from "../../../context/dataContext";

import Loading from "../../loading";

function SectionSix() {
  const { data, loading } = useContext(DataContext);
  const cards = data.outros;

  if (loading) {
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
          <div className={styles.card} key={index}>
            <img src={card.img} alt={card.title} />
            <div className={styles.contentCard}>
              <div className={styles.contentTitleCard}>
                <h4>{card.title}</h4>
                <p>{card.tag}</p>
              </div>
              <h4>R$ {card.price}</h4>
              <button>Adicionar a sacola</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SectionSix;
