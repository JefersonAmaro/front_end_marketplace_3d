import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import styles from "./styles.module.css";

import Brinquedos from "../../../assets/marketplace/sectionOne/brinquedo.png";
import Engrenagem from "../../../assets/marketplace/sectionOne/engrenagem.png";
import DecoracaoArte from "../../../assets/marketplace/sectionOne/decoracaoarte.png";

function SectionOne() {
  const initialCards = [
    {
      title: "Brinquedos que ganham vida camada por camada",
      description:
        "Com tecnologia de impressão 3D, criamos peças exclusivas para brincar, aprender e colecionar.",
      button: "Explorar Brinquedos",
      img: Brinquedos,
    },
    {
      title: "Precisão em cada detalhe",
      description:
        "Desenvolvemos componentes sob medida para projetos mecânicos, robóticos e automotivos.",
      button: "Solicitar Orçamento",
      img: Engrenagem,
    },
    {
      title: "Decoração & Arte",
      description:
        "Transformando ideias em peças decorativas únicas com a precisão da impressora 3D.",
      button: "Explorar Modelos",
      img: DecoracaoArte,
    },
  ];

  const [order, setOrder] = useState([0, 1, 2]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrder((prevOrder) => {
        const newOrder = [...prevOrder];
        const last = newOrder.pop();
        newOrder.unshift(last);
        return newOrder;
      });
      setActiveIndex((prev) => (prev + 1) % 2); // alterna entre 0 e 1
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const cardPrincipal = initialCards[order[0]];
  const cardsSecundary = [initialCards[order[1]], initialCards[order[2]]];

  return (
    <div className={styles.sectionOne}>
      <div className={styles.cardWrapper}>
        {[0, 1].map((layerIndex) => {
          const isVisible = activeIndex === layerIndex;
          return (
            <AnimatePresence key={layerIndex} mode="wait">
              {isVisible && (
                <motion.div
                  key={`card-layer-${layerIndex}`}
                  className={
                    styles.contentCardContainer +
                    " " +
                    styles[`card-layer-${layerIndex}`]
                  }
                  initial={{ filter: "blur(2px) brightness(0.9)", opacity: 0.5 }}
                  animate={{ filter: "blur(0px) brightness(1)", opacity: 1 }}
                  exit={{ filter: "blur(1px) brightness(0.7)", opacity: 0.2 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                >
                  <div className={styles.cardPrincipal}>
                    <img src={cardPrincipal.img} alt={cardPrincipal.title} />
                    <div
                      className={
                        styles.cardContent + " " + styles.cardPrincipalContent
                      }
                    >
                      <h2>{cardPrincipal.title}</h2>
                      <p className={styles.cardPrincipalDescription}>
                        {cardPrincipal.description}
                      </p>
                      <button className={styles.cardPrincipalButton}>
                        {cardPrincipal.button}
                      </button>
                    </div>
                  </div>

                  <div className={styles.cardsSecundary}>
                    {cardsSecundary.map((card, index) => (
                      <div className={styles.cardSmall} key={index}>
                        <img src={card.img} alt={card.title} />
                        <div
                          className={
                            styles.cardContent + " " + styles.cardSmallContent
                          }
                        >
                          <h3>{card.title}</h3>
                          <p className={styles.cardSmallDescription}>
                            {card.description}
                          </p>
                          <button className={styles.cardSmallButton}>
                            {card.button}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
      </div>
    </div>
  );
}

export default SectionOne;
