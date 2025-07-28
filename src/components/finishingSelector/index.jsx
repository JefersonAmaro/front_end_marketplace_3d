import { useState } from 'react';
import styles from './styles.module.css';

export default function FinishingSelector({ finishings = [] }) {
  const [selected, setSelected] = useState(finishings[0] || null);

  return (
    <div className={styles.container}>
      <p>Selecione um acabamento:</p>
      <div className={styles.finishingContainer}>
        {finishings.map((option, index) => (
          <button
            key={index}
            className={`${styles.finishing} ${selected === option ? styles.active : ''}`}
            onClick={() => setSelected(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
