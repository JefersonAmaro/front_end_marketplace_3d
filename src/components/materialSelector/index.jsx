import { useState, useEffect } from "react";
import styles from "./styles.module.css";

export default function MaterialSelector({ materials = [], setMaterial = () => {} }) {
  // Se for string, converte em array separando por vírgula
  const normalizedMaterials = Array.isArray(materials)
    ? materials
    : typeof materials === "string"
    ? materials.split(",").map(m => m.trim())
    : [];

  const [selected, setSelected] = useState(normalizedMaterials[0] || null);

  useEffect(() => {
    if (normalizedMaterials[0]) {
      setSelected(normalizedMaterials[0]);
      setMaterial(normalizedMaterials[0]);
    }
  }, [materials, setMaterial]);

  return (
    <div className={styles.container}>
      <p>Selecione um material:</p>
      <div className={styles.finishingContainer}>
        {normalizedMaterials.map((option, index) => (
          <button
            key={index}
            className={`${styles.finishing} ${selected === option ? styles.active : ""}`}
            onClick={() => {
              setSelected(option);
              setMaterial(option);
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
