import styles from "./styles.module.css";

function BarraFiltros({ onAddProductClick }) {
  return (
    <div className={styles.barraFiltros}>
      <div className={styles.secaoPesquisa}>
        <input type="text" placeholder="Produto" />
        <button className={styles.btnPesquisa}>
          {/* Ícone de pesquisa */}
        </button>
      </div>
      <div className={styles.secaoBotoes}>
        <button className={styles.btnAcoes} onClick={onAddProductClick}>
          Cadastrar Produto
        </button>
      </div>
    </div>
  );
}

export default BarraFiltros;
