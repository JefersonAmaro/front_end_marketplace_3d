import styles from "./styles.module.css";

import { useContext } from "react";
import { DataContext } from "../../../context/dataContext";

import { useNavigate } from "react-router-dom";

import Loading from "../../loading";
function SectionFour() {
  const { data, loading } = useContext(DataContext);
  const cards = data.casaEDecoracao || [];

  const navigate = useNavigate();

  if (loading || !data) {
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
              <div className={styles.card} key={index} onClick={() => navigate(`/marketplace/${card.id}`)}>
                <img src={card.img} alt={card.title} />
                <div className={styles.contentCard}>
                  <div className={styles.contentTitleCard}>
                    <h4>{card.name}</h4>
                    <p>{card.category}</p>
                  </div>
                  <h4>R$ {card.price}</h4>

                  {/* Bloquear o onClick do card */}
                  <button onClick={(e) => e.stopPropagation()}>Adicionar a sacola</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
}

export default SectionFour;