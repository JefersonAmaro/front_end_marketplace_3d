import styles from "./styles.module.css";

function HeaderChildren({ titulo, subtitle, voltar, btn, onClickBtn }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.titulo}>
        {titulo} {subtitle && subtitle !== "all" ? "- " + subtitle : ""}{" "}
      </h1>
      {voltar && (
        <button className={styles.voltar} onClick={voltar}>
          Voltar
        </button>
      )}
      {btn && <button className={styles.btn} onClick={onClickBtn}>{btn}</button>}
    </header>
  );
}

export default HeaderChildren;
