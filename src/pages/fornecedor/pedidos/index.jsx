import styles from './styles.module.css';
import HeaderPedidos from '../../../components/headerPedidosSupllier';
import BarraFiltros from '../../../components/barraFiltrosSupplier';
import TabelaPedidos from '../../../components/tabelaPedidosSupplier';

function PedidosFornecedor() {
  return (
    <div className={styles.container}>
      <div className={styles.conteudoPrincipal}>
        <HeaderPedidos />
        <BarraFiltros />
        <TabelaPedidos />
      </div>
    </div>
  );
}

export default PedidosFornecedor;