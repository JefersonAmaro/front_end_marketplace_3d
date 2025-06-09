import styles from "./styles.module.css";

import CuboMagico from "../../../assets/home/sectionOne/cubo_magico.png";
import EngrenagemMecanica from "../../../assets/home/sectionOne/engrenagem_mecanica.png";
import Robo from "../../../assets/home/sectionCards/robo.png";
import Vaso from "../../../assets/home/sectionCards/vaso.png";
import Barco from "../../../assets/home/sectionCards/barco.png";
import Impressora from "../../../assets/home/sectionCards/impressora.png";

function SectionOne() {
  const cards = [
    {
      image: Robo,
      title: "Robo",
      price: "R$ 200,00",
    },
    {
      image: Vaso,
      title: "Vaso",
      price: "R$ 200,00",
    },
    {
      image: Barco,
      title: "Barco",
      price: "R$ 200,00",
    },
    {
      image: Impressora,
      title: "Impressora 3D",
      price: "R$ 200,00",
    },
  ];
  return (
    <div className={styles.sectionOne}>
      <div className={styles.contentContainer}>
        <img src={CuboMagico} alt="Cubo Mágico" />
        <div className={styles.content}>
          <h1>
            Descubra <span className={styles.spanModelos}>Modelos</span> para
            Impressão 3D
          </h1>
          <h3>
            Encontre peças prontas ou solicite impressão personalizada. Tudo em
            um só lugar.
          </h3>
          <button className={styles.button}>Explorar Modelos</button>
        </div>
        <img src={EngrenagemMecanica} alt="Engrenagem Mecânica" />
      </div>
      <div className={styles.sectionCards}>
        {cards.map((card, index) => (
          <div className={styles.card} key={index}>
            <img src={card.image} alt={card.title} />
            <p>{card.title}</p>
            <p className={styles.price}>{card.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SectionOne;
