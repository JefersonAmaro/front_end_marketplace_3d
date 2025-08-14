import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import styles from "./styles.module.css";
import UserProfile from "../../assets/header/user-profile.svg";
import Logout from "../../assets/header/logout.svg";

function MenuPefil({ user, logout }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMenuMounted, setIsMenuMounted] = useState(false); // controla se o portal existe
  const [isMenuVisible, setIsMenuVisible] = useState(false); // controla a animação
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Menu de perfil
  useEffect(() => {
    if (isProfileMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;

      let top;
      let right = 20;

      if (screenWidth < 1024) {
        top = "52dvh"; // 5dvh
        right = "5vw";
      } else if (screenHeight > 900) {
        top = `${screenHeight * 0.09}px`; // 9vh
      } else if (screenHeight > 600) {
        top = `${screenHeight * 0.1}px`; // 10vh
      } else {
        top = `${screenHeight * 0.15}px`; // fallback
      }

      setPosition({
        top,
        right,
      });
    }
  }, [isProfileMenuOpen]);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    if (isProfileMenuOpen) {
      setIsMenuMounted(true); // monta o portal
      setTimeout(() => setIsMenuVisible(true), 10); // animação de entrada
    } else {
      setIsMenuVisible(false); // inicia animação de saída
      const timer = setTimeout(() => setIsMenuMounted(false), 250); // desmonta portal após animação
      return () => clearTimeout(timer);
    }
  }, [isProfileMenuOpen]);

  return (
    <>
      <div
        className={styles.profileContainer}
        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
      >
        <button ref={buttonRef} className={styles.profileButton}>
          <img src={UserProfile} alt="Perfil" />
        </button>
        {/* Se o tamanho da tela for menor que 1024px, cria um <P>Meu Perfil</P> */}
        {window.innerWidth < 1024 && <p>Meu Perfil</p>}
      </div>

      {isMenuMounted &&
        ReactDOM.createPortal(
          <div
            ref={menuRef}
            className={`${styles.profileMenu} ${
              isMenuVisible ? styles.show : ""
            }`}
            style={{
              top: position.top,
              right: position.right,
              position: "fixed",
            }}
          >
            <div className={styles.profileInfo}>
              <p className={styles.name}>Olá, {user.name.split(" ")[0]}</p>
              <p className={styles.email}>{user.email}</p>
            </div>
            <div className={styles.profileOptions}>
              <button className={styles.btn}>Minha conta</button>
              <button className={styles.btn}>Meus Pedidos</button>
              <button className={styles.btn}>Meus Orçamentos</button>
              <button onClick={logout} className={styles.logoutButton}>
                Sair
                <img src={Logout} alt="Logout" />
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default MenuPefil;
