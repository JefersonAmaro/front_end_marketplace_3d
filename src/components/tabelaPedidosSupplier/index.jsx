import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./styles.module.css";
import StatusTag from "../statusTag";

function TabelaPedidos() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageClass, setMessageClass] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await axios.get(
          `${API_URL}budgets/supplier/list-all`
        );
        const dados = response.data;

        // Lógica de ordenação: do mais novo para o mais velho
        const pedidosOrdenados = dados.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        if (pedidosOrdenados.length === 0) {
          setError("Não há pedidos disponíveis no momento.");
          setMessageClass(styles.infoMessage);
        } else {
          setPedidos(pedidosOrdenados);
          setLoading(false);
        }
      } catch (err) {
        console.error(
          "Erro ao buscar os dados:",
          err.response ? err.response.status : err.message
        );

        if (err.response && err.response.status === 400) {
          setError("Não há pedidos disponíveis no momento.");
          setMessageClass(styles.infoMessage);
        } else {
          setError(
            "Ocorreu um erro ao carregar os pedidos. Por favor, tente novamente mais tarde."
          );
          setMessageClass(styles.errorMessage);
        }
        setLoading(false);
      }
    };
    fetchPedidos();
  }, [API_URL]);

  // Nova função para copiar o ID
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert("ID do pedido copiado!");
      })
      .catch((err) => {
        console.error("Erro ao copiar o texto:", err);
      });
  };

  if (loading) {
    return <div>Carregando pedidos...</div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={messageClass}>{error}</p>
      </div>
    );
  }

  // --- Lógica de Paginação
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = pedidos.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(pedidos.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const maxButtons = 7;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

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
            <th>Pagamento Status</th>
            <th>Pedido Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((pedido) => (
              <tr key={pedido.id}>
                <td 
                  className={styles.copyableId} 
                  onClick={() => handleCopy(pedido.id)}
                >
                  {pedido.id}
                </td>
                <td>{pedido.user ? pedido.user.name : "N/A"}</td>
                <td>{pedido.model ? pedido.model.name : "N/A"}</td>
                <td>{new Date(pedido.createdAt).toLocaleDateString()}</td>
                <td>
                  R$
                  {" "}
                  {Number(pedido.price).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td>{pedido.status}</td>
                <td>
                  <StatusTag status={pedido.status} />
                </td>
                <td>
                  <button className={styles.btnAcao}>Ver Detalhes</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">Nenhum pedido encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>

      {pedidos.length > 0 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={number === currentPage ? styles.activePage : ""}
            >
              {number}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}

export default TabelaPedidos;