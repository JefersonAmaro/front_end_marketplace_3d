import styles from "./styles.module.css";

import Escultura from "../../../assets/marketplace/sectionFour/escultura.png";
import Minions from "../../../assets/marketplace/sectionFour/minions.png";
import Monge from "../../../assets/marketplace/sectionFour/monge.png";
import Pole from "../../../assets/marketplace/sectionFour/pole.png";

function SectionFour() {
     const cards = [
        {
          title:
            "Escultura postura meditação com vaso para suculentas",
          tag: "Casa e Decoração",
          price: "30,00",
          img: Escultura,
        },
        {
          title: "Organizadores Minions porta treco divertido",
          tag: "Casa e Decoração",
          price: "90,00",
          img: Minions,
        },
        {
          title: "Estatua buda monge escultura decorativa",
          tag: "Casa e Decoração",
          price: "35,00",
          img: Monge,
        },
        {
          title: "Escultura artística Pole dance - troféu expressão corporal",
          tag: "Casa e Decoração",
          price: "60,00",
          img: Pole,
        },
      ];
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