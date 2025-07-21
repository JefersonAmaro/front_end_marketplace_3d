import styles from "./styles.module.css";

import { useContext } from "react";
import { DataContext } from "../../../context/dataContext";

import Loading from "../../loading";
function SectionFour() {
  const { data, loading } = useContext(DataContext);
  const cards = data.casaEDecoracao;

  if (loading) {
    return <Loading />;
  }
    
      return (
        <div className={styles.container}>
          <div className={styles.containerTitle}>
            <div className={styles.contentTitle}>
              <h2>Casa e Decoração</h2>
              <p>
                Deixe seu ambiente mais criativo com peças de decoração feitas camadas por camadas, modernas e personalizadas.
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

export default SectionFour;