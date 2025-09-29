import styles from "./styles.module.css";
import HeaderChildren from "../../../components/headerChildrenSupllier";
import BarraFiltros from "../../../components/barraFiltrosPedidosSupplier";
import TabelaPedidos from "../../../components/tabelaPedidosSupplier";

function PedidosFornecedor() {
  return (
    <div className={styles.container}>
      <div className={styles.conteudoPrincipal}>
        <HeaderChildren titulo="Pedidos" />
        <BarraFiltros />
        <TabelaPedidos />
      </div>
    </div>
  );
}

export default PedidosFornecedor;
