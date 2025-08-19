import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

import Busca from "../../assets/header/busca.png";

import LoginModal from "../loginModal";
import MenuPefil from "../menuPerfil";

function Header() {
  const { token, user, logout } = useContext(AuthContext);
  const [menuAberto, setMenuAberto] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);

  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const abrirLogin = () => setIsModalOpen(true);
  const fecharLogin = () => setIsModalOpen(false);

  if (isDesktop) {
    // Menu Desktop
    return (
      <header className={styles.header}>
        <h1 className={styles.title} onClick={() => navigate("/marketplace")}>
          Market3D
        </h1>
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
            {!token && (
              <button className={styles.loginButton} onClick={abrirLogin}>
                Login
              </button>
            )}
            {token && <MenuPefil user={user} logout={logout} />}
          </div>
        ) : (
          <div className={styles.buttonsMarketplace}>
            <div className={styles.inputBusca}>
              <input type="text" placeholder="Buscar na Market3D" />
              <button className={styles.pesquisarButton}>
                <img src={Busca} alt="Buscar" />
              </button>
            </div>
            <button className={styles.button} onClick={() => navigate("/produtos")}>
              Produtos{" "}
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
            <button
              className={styles.button + " " + styles.orcamentoButton}
              onClick={() => navigate("/solicitar-orcamento")}
            >
              Solicitar Orçamento
            </button>
            {!token && (
              <button className={styles.loginButton} onClick={abrirLogin}>
                Login
              </button>
            )}
            {token && <MenuPefil user={user} logout={logout} />}
          </div>
        )}

        {/* Modal de login */}
        <LoginModal isOpen={isModalOpen} onRequestClose={fecharLogin} />
      </header>
    );
  }

  // Menu Mobile com hamburger
  return (
    <header className={styles.headerMobile}>
      <div className={styles.headerContent}>
        <h1 className={styles.title} onClick={() => navigate("/marketplace")}>
          Market3D
        </h1>

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
            {!token && (
              <button className={styles.loginButton} onClick={abrirLogin}>
                Login
              </button>
            )}
            {token && <MenuPefil user={user} logout={logout} />}
          </div>
        ) : (
          <div className={styles.buttonsMarketplace}>
            <div className={styles.inputBusca}>
              <input type="text" placeholder="Buscar na Market3D" />
              <button className={styles.pesquisarButton}>
                <img src={Busca} alt="Buscar" />
              </button>
            </div>
            <button className={styles.button} onClick={() => navigate("/produtos")}>
              Produtos{" "}
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
            <button
              className={styles.button}
              onClick={() => navigate("/solicitar-orcamento")}
            >
              Solicitar Orçamento
            </button>
            {!token && (
              <button
                className={styles.loginButton}
                onClick={() => {
                  abrirLogin();
                  setMenuAberto(false); // fecha o menu após clicar
                }}
              >
                Login
              </button>
            )}
            {token && <MenuPefil user={user} logout={logout} />}
          </div>
        )}
      </nav>
      {/* Modal de login */}
      <LoginModal isOpen={isModalOpen} onRequestClose={fecharLogin} />
    </header>
  );
}

export default Header;
