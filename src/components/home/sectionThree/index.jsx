import styles from "./styles.module.css";

import Ultilidades from "../../../assets/home/sectionThree/ultilidades.png";
import Tecnicas from "../../../assets/home/sectionThree/tecnicas.png";
import Arte from "../../../assets/home/sectionThree/arte.png";

function SectionThree() {
  const categories = [
    {
      image: Ultilidades,
      title: "Utilidades Domésticas",
      description:
        "Objetos práticos para o dia a dia, como suportes, organizadores e peças funcionais.",
    },
    {
      image: Tecnicas,
      title: "Peças Técnicas",
      description:
        "Componentes personalizados para reparos, prototipagem ou projetos mecânicos.",
    },
    {
      image: Arte,
      title: "Decoração & Arte",
      description:
        "Esculturas, enfeites e designs criativos para personalizar qualquer ambiente.",
    },
  ];
  return (
    <div className={styles.container}>
      <div className={styles.contentTitle}>
        <h3>Pesquise por Categorias</h3>
        <h4>Encontre o modelo ideal para sua necessidade.</h4>
      </div>
      <div className={styles.contentCategories}>
        {categories.map((category, index) => (
          <div className={styles.category} key={index}>
            <img src={category.image} alt={category.title} />
            <h3>{category.title}</h3>
            <p>{category.description}</p>
          </div>
        ))}
      </div>
      <div className={styles.contentButton}>
        <h3>E ainda há muito mais para explorar.</h3>
        <button>Explorar Modelos</button>
      </div>
    </div>
  );
}

export default SectionThree;
