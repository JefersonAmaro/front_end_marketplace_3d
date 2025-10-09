import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./styles.module.css";

function ModelItem({ model, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(true); // já aberto
  const API_URL = import.meta.env.VITE_API_URL;

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}model-supplier/delete/${model.id}`);
      onDelete(model.id); // Remove da lista
      setShowConfirm(false);
    } catch (error) {

      // Mostra a mensagem específica do backend, se existir
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        alert("Erro ao apagar modelo. Tente novamente.");
      }
    }
  };

  // Se o modal for fechado sem deletar
  const handleCancel = () => setShowConfirm(false);

  // Se o modal fechar, avisar ao pai para limpar o modelToDelete
  useEffect(() => {
    if (!showConfirm) {
      onDelete(null);
    }
  }, [showConfirm]);

  if (!showConfirm) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Tem certeza que deseja apagar?</h2>
        <p className={styles.modalText}>Esta ação não pode ser desfeita.</p>
        <div className={styles.modalButtons}>
          <button onClick={handleCancel} className={styles.cancelButton}>
            Cancelar
          </button>
          <button onClick={handleDelete} className={styles.confirmButton}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModelItem;
