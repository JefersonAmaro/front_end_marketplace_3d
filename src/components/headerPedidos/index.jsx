import styles from "./styles.module.css";

function HeaderPedidos({ currentPage, totalPages, pageNumbers, onPageChange }) {
  return (
    <div className={styles.container}>
      <h4>Meus Pedidos</h4>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>

          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => onPageChange(number)}
              className={number === currentPage ? styles.activePage : ""}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}

export default HeaderPedidos;
