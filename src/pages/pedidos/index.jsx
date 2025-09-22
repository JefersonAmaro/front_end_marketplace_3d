import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/authContext";
import CardPedidos from "../../components/cardPedidos";
import styles from "./styles.module.css";

function Pedidos() {
  const [cards, setCards] = useState([]);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

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

  return (
    <div className={styles.container}>
      <h4>Meus Pedidos</h4>
      <div className={styles.content}>
        {cards.length > 0 ? (
          cards
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // mais novo primeiro
            .map((card) => (
              <CardPedidos
                key={card.id}
                status={card.status}
                date={new Date(card.createdAt).toLocaleString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                file_paths={
                  card.model?.file_paths?.split(",")[0]?.replace(/\\/g, "/") ||
                  ""
                }
                title={card.model?.name}
                description={card.model?.description}
                color={card.color}
                material={card.material}
                finishing={card.finishing}
                quantity={card.quantity}
                supplier={card.supplier}
                price={card.price}
              />
            ))
        ) : (
          <div className={styles.emptyBox}>
            <p className={styles.emptyMessage}>
              Você ainda não possui pedidos feitos.
            </p>
            <button
              className={styles.emptyButton}
              onClick={() => navigate("/produtos")}
            >
              Veja os modelos agora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Pedidos;
