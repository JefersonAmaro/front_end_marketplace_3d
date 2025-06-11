import styles from "./styles.module.css";

function Header() {
  function scrollToWithOffset(id) {
    const element = document.getElementById(id);
    if (!element) return;

    const offset = window.innerHeight * 0.1; // 10% da altura da tela
    const elementPosition =
      element.getBoundingClientRect().top + window.pageYOffset;

    window.scrollTo({
      top: elementPosition - offset,
      behavior: "smooth",
    });
  }

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Market3D</h1>
      <div className={styles.buttons}>
        <button className={styles.button}>Modelos</button>
        <button
          className={styles.button}
          onClick={() => scrollToWithOffset("como-funciona")}
        >
          Como Funciona?
        </button>
        <button
          className={styles.button}
          onClick={() => scrollToWithOffset("quero-vender")}
        >
          Quero Vender
        </button>

        <button className={styles.loginButton}>Login</button>
      </div>
    </header>
  );
}

export default Header;
