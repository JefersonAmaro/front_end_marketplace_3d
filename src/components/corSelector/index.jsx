import { useState, useEffect, useMemo } from "react";
import styles from "./styles.module.css";

export default function ColorSelector({ colors = [], setCor = () => {} }) {
  // 🔹 Garante que colors sempre seja array
  const normalizedColors = useMemo(() => {
    if (Array.isArray(colors)) return colors;
    if (typeof colors === "string") {
      return colors.split(",").map((c) => c.trim());
    }
    return [];
  }, [colors]);

  const [selectedColor, setSelectedColor] = useState(
    normalizedColors[0] || null
  );

  useEffect(() => {
    if (normalizedColors[0]) {
      setSelectedColor(normalizedColors[0]);
      setCor(normalizedColors[0]);
    }
  }, [normalizedColors, setCor]);

  return (
    <div className={styles.container}>
      <p>Selecione uma cor:</p>
      <div className={styles.colors}>
        {normalizedColors.map((color, index) => (
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
