// BarraFiltrosOrcamentosSupplier.jsx
import styles from "./styles.module.css";

function BarraFiltrosOrcamentosSupplier({
  filtros,
  setFiltros,
  alternarOrdenacao,
}) {
  return (
    <div className={styles.container}>
      <input
        className={styles.searchInput}
        type="text"
        placeholder="Nome do modelo"
        value={filtros.nome}
        onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })}
      />

      <div className={styles.filters}>
        <select
          value={filtros.categoria}
          onChange={(e) =>
            setFiltros({ ...filtros, categoria: e.target.value })
          }
          className={styles.categoriaSelect}
        >
          <option value="">Categoria</option>
          <option value="categoria1">Categoria 1</option>
          <option value="categoria2">Categoria 2</option>
          <option value="categoria3">Categoria 3</option>
        </select>

        <select
          value={filtros.acabamento}
          onChange={(e) =>
            setFiltros({ ...filtros, acabamento: e.target.value })
          }
          className={styles.acabamentoSelect}
        >
          <option value="">Acabamento</option>
          <option value="status1">Acabamento 1</option>
          <option value="status2">Acabamento 2</option>
          <option value="status3">Acabamento 3</option>
        </select>

        <button
          onClick={() => alternarOrdenacao("data")}
          className={styles.btnFiltro}
        >
          Data{" "}
          {filtros.ordenar === "data"
            ? filtros.direcaoData === "asc"
              ? "↑"
              : "↓"
            : ""}
        </button>

        <button
          onClick={() => alternarOrdenacao("proximidade")}
          className={styles.btnFiltro}
        >
          Proximidade{" "}
          {filtros.ordenar === "proximidade"
            ? filtros.direcaoProx === "asc"
              ? "↑"
              : "↓"
            : ""}
        </button>
      </div>
    </div>
  );
}

export default BarraFiltrosOrcamentosSupplier;
