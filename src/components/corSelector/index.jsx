import { useState } from 'react';
import styles from './styles.module.css';

export default function ColorSelector({ colors = [] }) {
  const [selectedColor, setSelectedColor] = useState(colors[0] || null);

  return (
    <div className={styles.container}>
      <p>Selecione uma cor:</p>
      <div className={styles.colors}>
        {colors.map((color, index) => (
          <div
            key={index}
            className={`${styles.color} ${selectedColor === color ? styles.active : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => setSelectedColor(color)}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}
