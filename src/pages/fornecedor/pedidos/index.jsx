import { useState } from "react";
import styles from "./styles.module.css";
import HeaderChildren from "../../../components/headerChildrenSupllier";
import BarraFiltros from "../../../components/barraFiltrosPedidosSupplier";
import TabelaPedidos from "../../../components/tabelaPedidosSupplier";

function PedidosFornecedor() {
  const [busca, setBusca] = useState({ id: "", cliente: "", produto: "" });
  const [filtros, setFiltros] = useState({ data: "desc", pagamento: "", status: "", total: "" });

  return (
    <div className={styles.container}>
      <div className={styles.conteudoPrincipal}>
        <HeaderChildren titulo="Pedidos" />
        <BarraFiltros 
          busca={busca} 
          setBusca={setBusca} 
          filtros={filtros} 
          setFiltros={setFiltros} 
        />
        <TabelaPedidos busca={busca} filtros={filtros} />
      </div>
    </div>
  );
}

export default PedidosFornecedor;
