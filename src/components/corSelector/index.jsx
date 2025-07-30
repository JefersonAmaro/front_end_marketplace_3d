import { useState, useEffect } from "react";
import styles from "./styles.module.css";

export default function ColorSelector({ colors = [], setCor = () => {} }) {
  const [selectedColor, setSelectedColor] = useState(colors[0] || null);

  useEffect(() => {
    if (colors[0]) {
      setSelectedColor(colors[0]);
      setCor(colors[0]);
    }
  }, [colors, setCor]);

  return (
    <div className={styles.container}>
      <p>Selecione uma cor:</p>
      <div className={styles.colors}>
        {colors.map((color, index) => (
          <div
            key={index}
            className={`${styles.color} ${
              selectedColor === color ? styles.active : ""
            }`}
            style={{ backgroundColor: color }}
            onClick={() => {
              setSelectedColor(color);
              setCor(color);
            }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}
