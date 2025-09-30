import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./styles.module.css";
import StatusTag from "../statusTag";

function TabelaPedidos({ busca, filtros }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageClass, setMessageClass] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- Fetch pedidos da API ---
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await axios.get(`${API_URL}budgets/supplier/list-all`);
        const dados = response.data;

        if (!dados.length) {
          setError("Não há pedidos disponíveis no momento.");
          setMessageClass(styles.infoMessage);
        } else {
          setPedidos(dados);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setError(
          "Ocorreu um erro ao carregar os pedidos. Por favor, tente novamente mais tarde."
        );
        setMessageClass(styles.errorMessage);
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [API_URL]);

  // --- Função copiar ID ---
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => alert("ID do pedido copiado!"))
      .catch((err) => console.error("Erro ao copiar:", err));
  };

  if (loading) return <div>Carregando pedidos...</div>;
  if (error) return <div className={styles.container}><p className={messageClass}>{error}</p></div>;

  // --- Filtro de busca e filtros aplicados ---
  let pedidosFiltrados = pedidos.filter((pedido) => {
    const matchId = pedido.id.toLowerCase().includes(busca.id.toLowerCase());
    const matchCliente = pedido.user?.name?.toLowerCase().includes(busca.cliente.toLowerCase());
    const matchProduto = pedido.model?.name?.toLowerCase().includes(busca.produto.toLowerCase());

    const matchStatus = filtros.status ? pedido.status === filtros.status : true;

    return matchId && matchCliente && matchProduto && matchStatus;
  });

  // --- Ordenação ---
  if (filtros.data) {
    pedidosFiltrados.sort((a, b) => {
      return filtros.data === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  if (filtros.total) {
    pedidosFiltrados.sort((a, b) => {
      const totalA = a.price * a.quantity;
      const totalB = b.price * b.quantity;
      return filtros.total === "maior" ? totalB - totalA : totalA - totalB;
    });
  }

  // --- Paginação ---
  const totalPages = Math.ceil(pedidosFiltrados.length / itemsPerPage);
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = pedidosFiltrados.slice(firstItemIndex, lastItemIndex);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const maxButtons = 7;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage + 1 < maxButtons) startPage = Math.max(1, endPage - maxButtons + 1);
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  // --- Render ---
  return (
    <div className={styles.tabelaContainer}>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Pedido ID</th>
            <th>Cliente</th>
            <th>Produto</th>
            <th>Data</th>
            <th>Total</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length ? (
            currentItems.map((pedido) => (
              <tr key={pedido.id}>
                <td className={styles.copyableId} onClick={() => handleCopy(pedido.id)}>{pedido.id}</td>
                <td>{pedido.user?.name || "N/A"}</td>
                <td>{pedido.model?.name || "N/A"}</td>
                <td>{new Date(pedido.createdAt).toLocaleDateString()}</td>
                <td>
                  R${(pedido.price * pedido.quantity).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td><StatusTag status={pedido.status} /></td>
                <td><button className={styles.btnAcao}>Ver Detalhes</button></td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="7">Nenhum pedido encontrado.</td></tr>
          )}
        </tbody>
      </table>

      {/* --- Paginação --- */}
      {pedidosFiltrados.length > 0 && (
        <div className={styles.pagination}>
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
          {pageNumbers.map((num) => (
            <button
              key={num}
              onClick={() => handlePageChange(num)}
              className={num === currentPage ? styles.activePage : ""}
            >
              {num}
            </button>
          ))}
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Próxima</button>
        </div>
      )}
    </div>
  );
}

export default TabelaPedidos;
