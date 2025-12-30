import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./styles.module.css";
import HeaderChildren from "../../../components/headerChildrenSupllier";
import StatusTag from "../../../components/statusTag";
import {
  FiFileText,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

function DetalhesPedidos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const response = await axios.get(
          `${API_URL}budgets/supplier/list/${id}`
        );

        if (response.data.length > 0) {
          setPedido(response.data[0]);
        } else {
          setError("Pedido não encontrado.");
        }
      } catch (err) {
        console.error("Erro ao buscar pedido:", err);
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Erro ao carregar os detalhes do pedido.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPedido();
  }, [API_URL, id, navigate]);

  if (loading) return <p className={styles.loading}>Carregando...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!pedido) return null;

  const dataFormatada = new Date(pedido.createdAt).toLocaleDateString("pt-BR");
  const voltar = () => navigate("/fornecedor/pedidos");

  // Dados simulados de envio (podem vir do backend futuramente)
  const envio = {
    formaEnvio: "Correios PAC",
    codigoRastreio: "QW987654BR",
    ultimaAtualizacao: "10/10/2025 às 18:42",
  };

  return (
    <div className={styles.container}>
      <HeaderChildren titulo="Detalhes do Pedido" voltar={voltar} />

      <div className={styles.conteudoPrincipal}>
        {/* Resumo do Pedido */}
        <div className={styles.content}>
          <div className={styles.header}>
            <h3>Resumo do Pedido</h3>
            <StatusTag status={pedido.status} />
          </div>
          <div className={styles.info}>
            <p>
              <span>ID:</span> {pedido.id}
            </p>
            <p>
              <span>Data:</span> {dataFormatada}
            </p>
            <p>
              <span>Forma de Pagamento:</span> Não informado
            </p>
            <p>
              <span>Total:</span> R${" "}
              {pedido.price.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* Informações do Cliente */}
        <div className={styles.content}>
          <h3>Informações do Cliente</h3>
          <div className={styles.info}>
            <p>
              <span>Nome:</span> {pedido.user?.name}
            </p>
            <p>
              <span>Email:</span> {pedido.user?.email}
            </p>
            <p>
              <span>Telefone:</span> {pedido.user?.telefone}
            </p>
            <p>
              <span>Endereço:</span> {pedido.user?.endereco}
            </p>
          </div>
        </div>
      </div>

      {/* Itens do Pedido */}
      <div className={styles.content}>
        <h3>Itens do Pedido</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>NOME</th>
              <th>QUANTIDADE</th>
              <th>COR</th>
              <th>MATERIAL</th>
              <th>ACABAMENTO</th>
              <th>PREÇO UNITARIO</th>
              <th>SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{pedido.model?.name}</td>
              <td>{pedido.quantity}</td>
              <td>{pedido.color}</td>
              <td>{pedido.material}</td>
              <td>{pedido.finishing}</td>
              <td>
                R${" "}
                {pedido.model?.price.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td>
                R${" "}
                {pedido.price.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Detalhes da Entrega */}
      <div className={styles.content}>
        <div className={styles.header}>
          <h3>Detalhes da Entrega</h3>
          {/* Botão de avançar status */}
          {pedido.status !== "Entregue" && pedido.status !== "Cancelado" && (
            <div className={styles.avancarContainer}>
              <button
                className={styles.btnAvancar}
                onClick={async () => {
                  const statusOrder = [
                    "Pendente",
                    "Enviado",
                    "A Caminho",
                    "Entregue",
                  ];
                  const currentIndex = statusOrder.indexOf(pedido.status);
                  const nextStatus = statusOrder[currentIndex + 1];

                  if (!nextStatus) return;

                  try {
                    await axios.patch(
                      `${API_URL}budgets/supplier/update-status/${pedido.id}`,
                      {
                        status: nextStatus,
                      }
                    );

                    setPedido({ ...pedido, status: nextStatus });
                  } catch (err) {
                    console.error("Erro ao atualizar status:", err);
                    alert("Erro ao avançar status do pedido.");
                  }
                }}
              >
                Avançar para próxima etapa
              </button>
            </div>
          )}
        </div>

        <div
          className={styles.timeline}
          style={{
            "--progress-width": `${
              pedido.status === "Pendente"
                ? 20
                : pedido.status === "Enviado"
                ? 50
                : pedido.status === "A Caminho"
                ? 80
                : pedido.status === "Entregue"
                ? 100
                : 0
            }%`,
          }}
        >
          {[
            { label: "Pedido feito", icon: <FiFileText />, status: "Pendente" },
            { label: "Pedido enviado", icon: <FiPackage />, status: "Enviado" },
            {
              label: "Pedido a caminho",
              icon: <FiTruck />,
              status: "A Caminho",
            },
            {
              label: "Pedido entregue",
              icon: <FiCheckCircle />,
              status: "Entregue",
            },
          ].map((step, index) => {
            const statusOrder = [
              "Pendente",
              "Enviado",
              "A Caminho",
              "Entregue",
            ];
            const isActive =
              statusOrder.indexOf(pedido.status) >= index &&
              pedido.status !== "Cancelado";

            return (
              <div
                key={step.status}
                className={`${styles.timelineStep} ${
                  isActive ? styles.active : ""
                }`}
              >
                <div className={styles.iconCircle}>{step.icon}</div>
                <p>{step.label}</p>
              </div>
            );
          })}

          {pedido.status === "Cancelado" && (
            <div className={`${styles.timelineStep} ${styles.cancelado}`}>
              <div className={styles.iconCircle}>
                <FiXCircle />
              </div>
              <p>Pedido cancelado</p>
            </div>
          )}
        </div>

        {/* Novos dados de envio */}
        <div className={styles.info}>
          <p>
            <span>Forma de Envio:</span> {envio.formaEnvio}
          </p>
          <p>
            <span>Código de Rastreio:</span> {envio.codigoRastreio}
          </p>
          <p>
            <span>Última atualização:</span> {envio.ultimaAtualizacao}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DetalhesPedidos;
