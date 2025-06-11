import styles from "./styles.module.css";
import Encontre from "../../../assets/home/sectionFour/encontre.png";
import Pedido from "../../../assets/home/sectionFour/pedido.png";
import Receba from "../../../assets/home/sectionFour/receba.png";

function SectionFour() {
  const cards = [
    {
      img: Encontre,
      title: "Encontre ou Envie",
      description:
        "Escolha entre milhares de modelos prontos ou envie seu próprio arquivo para impressão.",
    },
    {
      img: Pedido,
      title: "Faça seu Pedido",
      description:
        "Selecione material, cor e quantidade. Para modelos personalizados, receba orçamentos.",
    },
    {
      img: Receba,
      title: "Receba em Casa ou Retire",
      description:
        "Seu pedido é impresso com qualidade e enviado diretamente para seu endereço ou retirado com o fornecedor.",
    },
  ];
  return (
    <div className={styles.container}>
      <div className={styles.contentTitle}>
        <h3>Como Funciona?</h3>
      </div>
      <div className={styles.contentCards}>
        {cards.map((card, index) => (
          <div className={styles.card} key={index}>
            <div className={styles.img}>
              <img src={card.img} alt={card.title} />
            </div>
            <h4>{card.title}</h4>
            <p>{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SectionFour;
