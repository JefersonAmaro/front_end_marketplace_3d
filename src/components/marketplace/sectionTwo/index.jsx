import styles from "./styles.module.css";

import Lilo from "../../../assets/marketplace/sectionTwo/lilo.png";
import Escultura from "../../../assets/marketplace/sectionTwo/escultura.png";
import Chave from "../../../assets/marketplace/sectionTwo/chave.png";
import Tigrinho from "../../../assets/marketplace/sectionTwo/tigrinho.png";

function SectionTwo() {
  const cards = [
    {
      title:
        "Boneco Lilo e Stitch articulado brinquedo plástico coleção Disney figura decoraçao Stitch",
      tag: "Brinquedos",
      price: "65,00",
      img: Lilo,
    },
    {
      title: "Escultura postura meditação com vaso para suculentas",
      tag: "Casa e Decoração",
      price: "30,00",
      img: Escultura,
    },
    {
      title: "Chave inglesa de boca ajustavel",
      tag: "Ferramentas",
      price: "25,00",
      img: Chave,
    },
    {
      title: "Tigrinho articulável suporte para celular de mesa bichinho",
      tag: "Outros",
      price: "45,00",
      img: Tigrinho,
    },
  ];
  return (
    <div className={styles.container}>
      <div className={styles.containerTitle}>
        <div className={styles.contentTitle}>
          <h2>Lançamentos Recentes</h2>
          <p>
            Peças que acabaram de sair da impressora. Confira as novidades
            fresquinhas do nosso catálogo!
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

export default SectionTwo;
