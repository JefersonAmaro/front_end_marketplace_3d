import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./styles.module.css";

function Filtro({ filters, setFilters }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [open, setOpen] = useState(false);
  const [backendData, setBackendData] = useState({
    colors: [],
    material: [],
    category: [],
    finishing: [],
  });

  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Buscar dados do backend
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await fetch(`${API_URL}model-supplier/info`); // ajuste a rota conforme seu backend
        const data = await res.json();

        setBackendData({
          colors: data.colors || [],
          material: data.material || [],
          category: data.category || [],
          finishing: data.finishing || [],
        });
      } catch (err) {
        console.error("Erro ao buscar filtros do backend:", err);
      }
    };

    fetchFilters();
  }, [API_URL]);

  const limparURL = () => navigate(location.pathname, { replace: true });

  const handleCategoryChange = (categoria) => {
    setFilters((prev) => ({
      ...prev,
      categorias: prev.categorias.includes(categoria)
        ? prev.categorias.filter((c) => c !== categoria)
        : [...prev.categorias, categoria],
    }));
    limparURL();
  };

  const handleMaterialChange = (material) => {
    setFilters((prev) => ({
      ...prev,
      materiais: prev.materiais.includes(material)
        ? prev.materiais.filter((m) => m !== material)
        : [...prev.materiais, material],
    }));

    limparURL();
  };

  const handleColorChange = (color) => {
    setFilters((prev) => ({
      ...prev,
      cor: prev.cor === color ? null : color,
    }));
    limparURL();
  };

  const handlePrecoChange = (value) => {
    setFilters((prev) => ({ ...prev, preco: value }));
    limparURL();
  };

  return (
    <>
      <button className={styles.mobileButton} onClick={() => setOpen(true)}>
        Filtrar
      </button>

      <div
        className={`${styles.overlay} ${open ? styles.show : ""}`}
        onClick={() => setOpen(false)}
      />

      <div className={`${styles.container} ${open ? styles.open : ""}`}>
        <div className={styles.header}>
          <h3>Filtrar</h3>
          <button onClick={() => setOpen(false)} className={styles.closeBtn}>
            ×
          </button>
        </div>

        {/* Categorias */}
        <div className={`${styles.contentSection}`}>
          <h4>Tipos de Produtos</h4>
          <div className={styles.categoriesSection}>
            <div className={styles.categories}>
              {backendData.category.map((categoria, index) => (
                <div className={styles.categoria} key={index}>
                  <input
                    type="checkbox"
                    id={`categoria-${index}`}
                    checked={filters.categorias.includes(categoria)}
                    onChange={() => handleCategoryChange(categoria)}
                  />
                  <label htmlFor={`categoria-${index}`}>{categoria}</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Materiais */}
        <div className={styles.contentSection}>
          <h4>Materiais</h4>
          <div className={styles.materialsSection}>
            <div className={styles.materials}>
              {backendData.material.map((material, index) => (
                <div className={styles.material} key={index}>
                  <input
                    type="checkbox"
                    id={`material-${index}`}
                    checked={filters.materiais.includes(material)}
                    onChange={() => handleMaterialChange(material)}
                  />
                  <label htmlFor={`material-${index}`}>{material}</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cores */}
        <div className={styles.contentSection}>
          <h4>Cores</h4>
          <div className={styles.colorsWrapper}>
            {" "}
            {/* <-- Novo div */}
            <div className={styles.colors}>
              {backendData.colors.map((color, index) => (
                <div
                  key={index}
                  className={`${styles.color} ${
                    filters.cor === color ? styles.active : ""
                  }`}
                  style={{ backgroundColor: color.toLowerCase() }}
                  onClick={() => handleColorChange(color)}
                  title={color}
                />
              ))}
            </div>
          </div>{" "}
          {/* <-- Feche o div aqui */}
        </div>

        {/* Preço */}
        <div className={styles.contentSection}>
          <h4>Preço</h4>
          <div className={styles.rangeWrapper}>
            <input
              type="range"
              min="0"
              max="500"
              step="1"
              value={filters.preco ?? 0}
              onChange={(e) => handlePrecoChange(Number(e.target.value))}
              className={styles.rangeInput}
            />
            <div
              className={styles.tooltip}
              style={{ left: `${((filters.preco ?? 0) / 500) * 100}%` }}
            >
              <p>
                {filters.preco === null || filters.preco === 0
                  ? "Sem limite de preço"
                  : `Até R$ ${Number(filters.preco)
                      .toFixed(2)
                      .replace(".", ",")}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Filtro;
