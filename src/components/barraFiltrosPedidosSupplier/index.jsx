import styles from "./styles.module.css";

const statusOptions = ["", "Pendente", "Enviado", "Entregue", "Cancelado"];

function BarraFiltros({ busca, setBusca, filtros, setFiltros, onSearch }) {
  const handleNextStatus = () => {
    const currentIndex = statusOptions.indexOf(filtros.status);
    const nextIndex = (currentIndex + 1) % statusOptions.length;
    setFiltros({ ...filtros, status: statusOptions[nextIndex] });
  };

  const handleClearFilters = () => {
    setBusca({ id: "", cliente: "", produto: "" });
    setFiltros({ ...filtros, status: "", total: "" });
  };

  return (
    <div className={styles.barraFiltros}>
      {/* --- Busca por ID, Cliente e Produto --- */}
      <div className={styles.secaoPesquisa}>
        <input
          type="text"
          placeholder="Pedido ID"
          value={busca.id}
          onChange={(e) => setBusca({ ...busca, id: e.target.value })}
        />
        <input
          type="text"
          placeholder="Cliente"
          value={busca.cliente}
          onChange={(e) => setBusca({ ...busca, cliente: e.target.value })}
        />
        <input
          type="text"
          placeholder="Produto"
          value={busca.produto}
          onChange={(e) => setBusca({ ...busca, produto: e.target.value })}
        />
      </div>

      {/* --- Filtros de Pedido --- */}
      <div className={styles.secaoBotoes}>
        <button
          onClick={() =>
            setFiltros({ ...filtros, data: filtros.data === "asc" ? "desc" : "asc" })
          }
          className={styles.btnFiltro}
        >
          Data {filtros.data === "asc" ? "↑" : filtros.data === "desc" ? "↓" : ""}
        </button>

        <button onClick={handleNextStatus} className={styles.btnFiltro}>
          Status: {filtros.status || "Todos"}
        </button>

        <button
          onClick={() =>
            setFiltros({
              ...filtros,
              total: filtros.total === "maior" ? "menor" : "maior",
            })
          }
          className={styles.btnFiltro}
        >
          Total {filtros.total === "maior" ? "↓" : filtros.total === "menor" ? "↑" : ""}
        </button>

        <button onClick={handleClearFilters} className={styles.btnLimpar}>
          Limpar filtros
        </button>
      </div>
    </div>
  );
}

export default BarraFiltros;
