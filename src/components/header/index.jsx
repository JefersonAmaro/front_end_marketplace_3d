import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

import Busca from "../../assets/header/busca.png";

function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);

  const navigate = useNavigate();
  const isHome = window.location.pathname === "/";

  function scrollToWithOffset(id) {
    const element = document.getElementById(id);
    if (!element) return;

    const offset = window.innerHeight * 0.1;
    const elementPosition =
      element.getBoundingClientRect().top + window.pageYOffset;

    window.scrollTo({
      top: elementPosition - offset,
      behavior: "smooth",
    });
  }

  // Atualiza isDesktop ao redimensionar a tela
  useEffect(() => {
    function handleResize() {
      const desktop = window.innerWidth > 1024;
      setIsDesktop(desktop);
      if (desktop) setMenuAberto(false); // fecha menu mobile no desktop
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isDesktop) {
    // Menu Desktop
    return (
      <header className={styles.header}>
        <h1 className={styles.title} onClick={() => navigate("/marketplace")}>Market3D</h1>
        {isHome ? (
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
        ) : (
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
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <button className={styles.button + " " + styles.orcamentoButton}>
              Solicitar Orçamento
            </button>
            <button className={styles.loginButton}>Login</button>
          </div>
        )}
      </header>
    );
  }

  // Menu Mobile com hamburger
  return (
    <header className={styles.headerMobile}>
      <div className={styles.headerContent}>
        <h1 className={styles.title} onClick={() => navigate("/marketplace")}>Market3D</h1>

        {/* Botão Hamburger */}
        <button
          className={styles.hamburgerButton}
          onClick={() => setMenuAberto((prev) => !prev)}
          aria-label="Menu"
          aria-expanded={menuAberto}
        >
          <div
            className={`${styles.bar} ${menuAberto ? styles.bar1Active : ""}`}
          />
          <div
            className={`${styles.bar} ${menuAberto ? styles.bar2Active : ""}`}
          />
          <div
            className={`${styles.bar} ${menuAberto ? styles.bar3Active : ""}`}
          />
        </button>
      </div>
      {/* Menu que desce com animação */}
      <nav
        className={`${styles.mobileMenu} ${
          menuAberto ? styles.mobileMenuOpen : styles.mobileMenuClosed
        }`}
      >
        {isHome ? (
          <div className={styles.buttonsHome}>
            <button
              className={styles.button}
              onClick={() => {
                navigate("/marketplace");
                setMenuAberto(false);
              }}
            >
              Modelos
            </button>
            <button
              className={styles.button}
              onClick={() => {
                scrollToWithOffset("como-funciona");
                setMenuAberto(false);
              }}
            >
              Como Funciona?
            </button>
            <button
              className={styles.button}
              onClick={() => {
                scrollToWithOffset("quero-vender");
                setMenuAberto(false);
              }}
            >
              Quero Vender
            </button>
            <button className={styles.loginButton}>Login</button>
          </div>
        ) : (
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
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <button className={styles.button}>
              Solicitar Orçamento
            </button>
            <button className={styles.loginButton}>Login</button>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
