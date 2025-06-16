import styles from "./styles.module.css";

import Tigrinho from "../../../assets/marketplace/sectionSix/tigrinho.png";
import Banguela from "../../../assets/marketplace/sectionSix/banguela.png";
import Cookie from "../../../assets/marketplace/sectionSix/cookie.png";
import Suporte from "../../../assets/marketplace/sectionSix/suporte.png";

function SectionSix() {
  const cards = [
    {
      title: "Tigrinho articulável suporte para celular de mesa bichinho",
      tag: "Outros",
      price: "45,00",
      img: Tigrinho,
    },
    {
      title: "Chaveiro Banguela - Como treinar o seu dragão",
      tag: "Outros",
      price: "12,00",
      img: Banguela,
    },
    {
      title: "Cortador de Biscoito cookies Pasta Americana Macaco Animais",
      tag: "Outros",
      price: "8,90",
      img: Cookie,
    },
    {
      title: "Suporte para celular forma em onda",
      tag: "Outros",
      price: "25,00",
      img: Suporte,
    },
  ];
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
