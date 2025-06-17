import styles from "./styles.module.css";

import Lilo from "../../../assets/marketplace/sectionThree/lilo.png";
import Pinoquio from "../../../assets/marketplace/sectionThree/pinoquio.png";
import OnePiece from "../../../assets/marketplace/sectionThree/onepiece.png";
import Woody from "../../../assets/marketplace/sectionThree/woody.png";

function SectionThree() {
  const cards = [
    {
      title:
        "Boneco Lilo e Stitch articulado brinquedo plástico coleção Disney figura decoraçao Stitch",
      tag: "Brinquedos",
      price: "65,00",
      img: Lilo,
    },
    {
      title: "Boneco Pinóquio articulado - figura Pinocchio impressão 3D",
      tag: "Brinquedos",
      price: "75,00",
      img: Pinoquio,
    },
    {
      title: "Boneco One Piece Luffy caveira Anime Brinquedo articulado",
      tag: "Brinquedos",
      price: "55,00",
      img: OnePiece,
    },
    {
      title: "Boneco Woody articulável brinquedo Toy Story Xerife 18 cm",
      tag: "Brinquedos",
      price: "85,00",
      img: Woody,
    },
  ];
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

export default SectionThree;
