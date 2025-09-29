import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/authContext";
import styles from "./styles.module.css";

import HeaderPedidos from "../../components/headerPedidos";
import MeusPedidos from "../../components/meusPedidos";

function Pedidos() {
  const [cards, setCards] = useState([]);
  const { token } = useContext(AuthContext);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    async function fetchBudgets() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}budgets/user/list-all`
        );
        setCards(response.data);
      } catch (error) {
        console.error("Erro ao buscar orçamentos:", error);
      }
    }

    if (token) {
      fetchBudgets();
    }
  }, [token]);

  // ordenar do mais novo pro mais velho
  const sortedCards = cards
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // paginação
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = sortedCards.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(sortedCards.length / itemsPerPage);

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
    <div className={styles.container}>
      <HeaderPedidos
        currentPage={currentPage}
        totalPages={totalPages}
        pageNumbers={pageNumbers}
        onPageChange={setCurrentPage}
      />

      <div className={styles.content}>
        <MeusPedidos cards={currentItems} />
      </div>
    </div>
  );
}

export default Pedidos;
