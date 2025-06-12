import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";

import Busca from "../../assets/header/busca.png";
import Sacola from "../../assets/header/sacola.png";

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

  const isHome = window.location.pathname === "/";
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Market3D</h1>
      {isHome && (
        <div className={styles.buttonsHome}>
          <button
            className={styles.button}
            onClick={() => navigate("/marketplace")}
          >
            Modelos
          </button>
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
      )}

      {!isHome && (
        <div className={styles.buttonsMarketplace}>
          <div className={styles.inputBusca}>
            <input type="text" placeholder="Buscar na Market3D" />
            <button className={styles.pesquisarButton}>
              <img src={Busca} alt="Buscar" />
            </button>
          </div>
          <button className={styles.button}>
            Categorias{" "}
            <svg
              className={styles.seta}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="black"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <button className={styles.orcamentoButton}>
            Solicitar Orçamento
          </button>
          <button className={styles.sacolaButton}>
            <img src={Sacola} alt="Sacola" />0
          </button>
          <button className={styles.loginButton}>Login</button>
        </div>
      )}
    </header>
  );
}

export default Header;
