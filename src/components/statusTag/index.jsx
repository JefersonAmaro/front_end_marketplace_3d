import styles from "./styles.module.css";

const statusColors = {
  Pendente: "#ff6600ff",
  Enviado: "#007bf7ff",
  "A Caminho": "#bd00f7ff",
  Entregue: "#039616ff",
  Cancelado: "#e9071eff",
};

function StatusTag({ status }) {
  // Use um fallback para cor caso o status não seja mapeado
  const backgroundColor = statusColors[status] || "#000";

  return (
    <div
      className={styles.statusTag}
      style={{ backgroundColor: backgroundColor }}
    >
      {status}
    </div>
  );
}

export default StatusTag;
