import styles from "./styles.module.css";

function BarraFiltros() {
  return (
    <div className={styles.barraFiltros}>
      <div className={styles.secaoPesquisa}>
        <input type="text" placeholder="Pedido ID" />
        <input type="text" placeholder="Cliente" />
        <input type="text" placeholder="Produto" />
        <button className={styles.btnPesquisa}>
          {/* Ícone de pesquisa */}
        </button>
      </div>
      <div className={styles.secaoBotoes}>
        <button className={styles.btnFiltro}>Data</button>
        <button className={styles.btnFiltro}>Pagamento Status</button>
        <button className={styles.btnAcoes}>Pedido Status</button>
        <button className={styles.btnAcoes}>Total</button>
      </div>
    </div>
  );
}

export default BarraFiltros;
