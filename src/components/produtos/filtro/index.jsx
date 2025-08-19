import styles from "./styles.module.css";

function Filtro({ filters, setFilters }) {
  const categorias = [
    "Brinquedos",
    "Casa e Decoração",
    "Ferramentas",
    "Outros",
  ];
  const materiais = ["PLA", "PETG", "ABS", "TPU", "Nylon"];
  const cores = ["red", "blue", "yellow"];

  const handleCategoryChange = (categoria) => {
    setFilters((prev) => ({
      ...prev,
      categorias: prev.categorias.includes(categoria)
        ? prev.categorias.filter((c) => c !== categoria)
        : [...prev.categorias, categoria],
    }));
  };

  const handleMaterialChange = (material) => {
    setFilters((prev) => ({
      ...prev,
      materiais: prev.materiais.includes(material)
        ? prev.materiais.filter((m) => m !== material)
        : [...prev.materiais, material],
    }));
  };

  const handleColorChange = (color) => {
    setFilters((prev) => ({
      ...prev,
      cor: prev.cor === color ? null : color, // se já for a mesma, desmarca
    }));
  };

  const handlePrecoChange = (value) => {
    setFilters((prev) => ({ ...prev, preco: value }));
  };

  return (
    <div className={styles.container}>
      <h3>Filtrar</h3>

      {/* Categorias */}
      <div className={styles.contentSection}>
        <h4>Tipos de Produtos</h4>
        {categorias.map((categoria, index) => (
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

      {/* Materiais */}
      <div className={styles.contentSection}>
        <h4>Materiais</h4>
        {materiais.map((material, index) => (
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

      {/* Cores */}
      <div className={styles.contentSection}>
        <h4>Cores</h4>
        <div className={styles.colors}>
          {cores.map((color, index) => (
            <div
              key={index}
              className={`${styles.color} ${
                filters.cor === color ? styles.active : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
              title={color}
            />
          ))}
        </div>
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
            value={filters.preco ?? 0} // só para o slider
            onChange={(e) => handlePrecoChange(Number(e.target.value))} // converte para number
            className={styles.rangeInput}
          />
          <div
            className={styles.tooltip}
            style={{
              left: `${((filters.preco ?? 0) / 500) * 100}%`,
            }}
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
  );
}

export default Filtro;
