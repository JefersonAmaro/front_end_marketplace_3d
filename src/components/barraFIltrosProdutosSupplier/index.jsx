import styles from "./styles.module.css";

function BarraFiltros({ onAddProductClick, searchTerm, setSearchTerm, btn, onArchivedClick }) {
  return (
    <div className={styles.barraFiltros}>
      <div className={styles.secaoPesquisa}>
        <input
          type="text"
          placeholder="Produto"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className={styles.secaoBotoes}>
        <button onClick={onArchivedClick} className={styles.btnFiltro}>{btn}</button>
        <button className={styles.btnAcoes} onClick={onAddProductClick}>
          Cadastrar Produto
        </button>
      </div>
    </div>
  );
}

export default BarraFiltros;
