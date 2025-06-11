import styles from "./styles.module.css";
import Venda from "../../../assets/home/sectionFive/venda.png";
import Ganhe from "../../../assets/home/sectionFive/ganhe.png";
import Gerencie from "../../../assets/home/sectionFive/gerencie.png";

function SectionFive() {
  const cards = [
    {
      img: Venda,
      title: "Venda seus modelos",
      description:
        "Monetize seus designs 3D e alcance clientes em todo o Brasil.",
    },
    {
      img: Ganhe,
      title: "Ganhe com impressão sob demanda",
      description:
        "Ofereça seus serviços de impressão e receba pedidos personalizados.",
    },
    {
      img: Gerencie,
      title: "Gerencie pedidos facilmente",
      description:
        "Painel completo para controlar vendas, entregas e pagamentos.",
    },
  ];
  return (
    <div className={styles.container}>
      <div className={styles.contentTitle}>
        <h3>Para Fornecedores</h3>
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
      <div className={styles.contentButton}>
        <button>Quero Vender</button>
      </div>
    </div>
  );
}

export default SectionFive;
