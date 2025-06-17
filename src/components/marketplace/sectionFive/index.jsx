import styles from "./styles.module.css";

import Chave from "../../../assets/marketplace/sectionFive/chave.png";
import Suporte from "../../../assets/marketplace/sectionFive/suporte.png";
import Estilete from "../../../assets/marketplace/sectionFive/estilete.png";
import Abridor from "../../../assets/marketplace/sectionFive/abridor.png";

function SectionFive() {
  const cards = [
    {
      title: "Chave inglesa de boca ajustavel",
      tag: "Ferramentas",
      price: "25,00",
      img: Chave,
    },
    {
      title: "Suporte de prateleira mão francesa",
      tag: "Ferramentas",
      price: "15,00",
      img: Suporte,
    },
    {
      title: "Corpo do estilete, suporte de lâmina",
      tag: "Ferramentas",
      price: "45,00",
      img: Estilete,
    },
    {
      title: " Abridores de caixas, cortadores de fita e embalagem",
      tag: "Ferramentas",
      price: "85,00",
      img: Abridor,
    },
  ];
  return (
    <div className={styles.container}>
      <div className={styles.containerTitle}>
        <div className={styles.contentTitle}>
          <h2>Ferramentas</h2>
          <p>
            Componentes funcionais e personalizados para turbinar seus projetos
            com precisão e eficiência.
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

export default SectionFive;
