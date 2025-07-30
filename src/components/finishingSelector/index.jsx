import { useState, useEffect } from "react";
import styles from "./styles.module.css";

export default function FinishingSelector({ finishings = [], setAcabamento = () => {} }) {
  const [selected, setSelected] = useState(finishings[0] || null);

  useEffect(() => {
    if (finishings[0]) {
      setSelected(finishings[0]);
      setAcabamento(finishings[0]);
    }
  }, [finishings, setAcabamento]);

  return (
    <div className={styles.container}>
      <p>Selecione um acabamento:</p>
      <div className={styles.finishingContainer}>
        {finishings.map((option, index) => (
          <button
            key={index}
            className={`${styles.finishing} ${
              selected === option ? styles.active : ""
            }`}
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
