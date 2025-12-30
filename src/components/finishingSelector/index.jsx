import { useState, useEffect } from "react";
import styles from "./styles.module.css";

export default function FinishingSelector({ finishings = [], setAcabamento = () => {} }) {
  // Se for string, converte em array separando por vírgula
  const normalizedFinishings = Array.isArray(finishings)
    ? finishings
    : typeof finishings === "string"
    ? finishings.split(",").map(f => f.trim())
    : [];

  const [selected, setSelected] = useState(normalizedFinishings[0] || null);

  useEffect(() => {
    if (normalizedFinishings[0]) {
      setSelected(normalizedFinishings[0]);
      setAcabamento(normalizedFinishings[0]);
    }
  }, [finishings, setAcabamento]);

  return (
    <div className={styles.container}>
      <p>Selecione um acabamento:</p>
      <div className={styles.finishingContainer}>
        {normalizedFinishings.map((option, index) => (
          <button
            key={index}
            className={`${styles.finishing} ${selected === option ? styles.active : ""}`}
            onClick={() => {
              setSelected(option);
              setAcabamento(option);
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
