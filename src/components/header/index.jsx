import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { DataContext } from "../../context/dataContext";
import { useGeo } from "../../context/geoContext"; // ✅ usar o contexto

import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

import LoginModal from "../loginModal";
import MenuPefil from "../menuPerfil";
import SearchBox from "../searchBox";

function Header() {
  const {
    latitude,
    longitude,
    street,
    postalCode,
    loading: geoLoading,
    error: geoError,
  } = useGeo(); // contexto
  const { token, user, logout } = useContext(AuthContext);
  const { data, loading } = useContext(DataContext);

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

  const products = Object.values(data).flat();

  // Layout Desktop
  if (isDesktop) {
    return (
      <header className={styles.header}>
        <div className={styles.container}>
          <h1 className={styles.title} onClick={() => navigate("/marketplace")}>
            Market3D
          </h1>
          {latitude && longitude && street && postalCode && (
            <div className={styles.locationContainer}>
              <div className={styles.location}>
                <p className={styles.locationTitle}>Localização:</p>
                <p className={styles.locationText}>
                  Rua {street}, {postalCode}
                </p>
              </div>
            </div>
          )}
        </div>

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
            <SearchBox
              products={products}
              onSearch={(term) =>
                navigate(`/produtos?search=${encodeURIComponent(term)}`)
              }
              setMenuAberto={setMenuAberto}
            />
            <button
              className={styles.button}
              onClick={() => navigate("/produtos")}
            >
              Produtos
            </button>
            <button
              className={styles.button}
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

        <LoginModal isOpen={isModalOpen} onRequestClose={fecharLogin} />
      </header>
    );
  }

  // Layout Mobile
  return (
    <header className={styles.headerMobile}>
      <div className={styles.headerContent}>
        <div className={styles.container}>
          <h1 className={styles.title} onClick={() => navigate("/marketplace")}>
            Market3D
          </h1>
          <div className={styles.locationContainer}>
            {/* {latitude && longitude && street && postalCode && (
              <div className={styles.location}>
                <p className={styles.locationTitle}>Localização:</p>
                <p className={styles.locationText}>
                  Rua {street}, {postalCode}
                </p>
              </div>
            )} */}
          </div>
        </div>

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
              <button
                className={styles.loginButton}
                onClick={() => {
                  abrirLogin();
                  setMenuAberto(false);
                }}
              >
                Login
              </button>
            )}
            {token && <MenuPefil user={user} logout={logout} />}
          </div>
        ) : (
          <div className={styles.buttonsMarketplace}>
            <SearchBox
              products={products}
              onSearch={(term) =>
                navigate(`/produtos?search=${encodeURIComponent(term)}`)
              }
              setMenuAberto={setMenuAberto}
            />
            <button
              className={styles.button}
              onClick={() => {
                navigate("/produtos");
                setMenuAberto(false);
              }}
            >
              Produtos
            </button>
            <button
              className={styles.button}
              onClick={() => {
                navigate("/solicitar-orcamento");
                setMenuAberto(false);
              }}
            >
              Solicitar Orçamento
            </button>
            {!token && (
              <button
                className={styles.loginButton}
                onClick={() => {
                  abrirLogin();
                  setMenuAberto(false);
                }}
              >
                Login
              </button>
            )}
            {token && <MenuPefil user={user} logout={logout} />}
          </div>
        )}
      </nav>

      <LoginModal isOpen={isModalOpen} onRequestClose={fecharLogin} />
    </header>
  );
}

export default Header;
