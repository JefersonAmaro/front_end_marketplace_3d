import styles from "./styles.module.css";

import StatusTag from "../statusTag";

function CardPedidos(props) {
  const API_URL = import.meta.env.VITE_API_URL;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.date}>{props.date}</p>
        <div className={styles.statusTag}>
          <StatusTag status={props.status} />
        </div>
      </div>
      <div className={styles.content}>
        <img src={`${API_URL}${props.file_paths}`} alt={props.title} />

        <div className={styles.info}>
          <div className={styles.text}>
            <div className={styles.titleDescription}>
              <h2 className={styles.title}>{props.title}</h2>
              <p className={styles.description}>{props.description}</p>
            </div>
            <div className={styles.details}>
              <p>{props.quantity} unidade(s)</p>
              <div className={styles.separator}></div>
              <p>Cor: {props.color}</p>
              <div className={styles.separator}></div>
              <p>Material: {props.material}</p>
              <div className={styles.separator}></div>
              <p>Acabamento: {props.finishing}</p>
            </div>
          </div>

          <div className={styles.supplier}>
            <h2 className={styles.title}>Fornecedor</h2>
            <p className={styles.supplierName}>{props.supplier.name}</p>
            <a href="">Ver mais</a>
          </div>
          <div className={styles.buttons}>
            <p className={styles.price}>
              R${" "}
              {Number(props.price).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>

            <div className={styles.button}>
              <button>Ver Compra</button>
              <button className={styles.buttonComprarNovamente}>
                Comprar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardPedidos;
