import styles from "./styles.module.css";

function HeaderChildren({ titulo }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.titulo}>{titulo}</h1>
    </header>
  );
}

export default HeaderChildren;
