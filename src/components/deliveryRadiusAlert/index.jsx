// src/components/DeliveryRadiusAlert/index.jsx
import styles from "./styles.module.css";

function DeliveryRadiusAlert({ onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Aviso sobre retirada e entrega própria</h2>
        <p>
          Produtos com <strong>retirada ou entrega própria</strong> serão
          exibidos somente para clientes localizados em um raio de até{" "}
          <strong>10 km</strong>{" "}
          do endereço do fornecedor.
        </p>

        <button className={styles.confirmButton} onClick={onClose}>
          Entendi
        </button>
      </div>
    </div>
  );
}

export default DeliveryRadiusAlert;
