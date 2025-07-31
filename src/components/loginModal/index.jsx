import React, { useState } from "react";
import Modal from "react-modal";
import Lottie from "lottie-react";
import impressao3dAnimation from "../../assets/lotties/impressora3d.json";

import styles from "./styles.module.css";

Modal.setAppElement("#root"); // acessibilidade

export default function LoginModal({ isOpen, onRequestClose }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    // lógica de login aqui
    alert("Logou!");
    onRequestClose();
  };

  const [loginOptions, setLoginOptions] = useState("cliente");

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Login Modal"
      style={{
        overlay: { backgroundColor: "rgba(0,0,0,0.5)", zIndex: 2000 },
        content:
          window.innerWidth < 1919
            ? {
                width: "70%",
                height: "95%",
                margin: "auto",
                borderRadius: "8px",
                padding: 0,
                border: "none",
              }
            : {
                maxWidth: "1100px",
                margin: "auto",
                borderRadius: "8px",
                padding: 0,
                border: "none",
              },
      }}
    >
      <div className={styles.modalContainer}>
        <div className={styles.modalImage}>
          <div className={styles.imageContainer}>
            <h2>
              Inove em cada detalhe: da concepção digital à materialização
              física com impressão 3D
            </h2>
            <Lottie
              animationData={impressao3dAnimation}
              loop
              autoplay
              style={{ width: 400, height: "75%", overflow: "hidden" }}
            />
          </div>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h4>
              Novo usuário? <a href="#">Cadastre-se aqui</a>
            </h4>
            <button
              className={styles.close}
              onClick={onRequestClose}
              style={{ float: "right" }}
            >
              ×
            </button>
          </div>
          <div className={styles.formContainer}>
            <div className={styles.loginOptions}>
              <p
                className={loginOptions === "cliente" ? styles.active : ""}
                onClick={() => setLoginOptions("cliente")}
              >
                Cliente
              </p>
              <p
                className={loginOptions === "fornecedor" ? styles.active : ""}
                onClick={() => setLoginOptions("fornecedor")}
              >
                Fornecedor
              </p>
            </div>
            {loginOptions === "cliente" ? (
              <form onSubmit={handleSubmit}>
                <div className={styles.inputContainer}>
                  <label htmlFor="email">E-mail</label>
                  <input
                    type="email"
                    placeholder="Digite seu e-mail"
                    id="email"
                  />
                </div>
                <div className={styles.inputContainer}>
                  <label htmlFor="password">Senha</label>
                  <input
                    type="password"
                    placeholder="Digite sua senha"
                    id="password"
                  />
                </div>
                <button className={styles.loginButton} type="submit">
                  Entrar
                </button>
                <p>
                  Esqueceu sua senha? <a href="#">Clique aqui</a>
                </p>
                <div className={styles.loginForGoogle}>
                  <button className={styles.loginWithGoogle} type="button">
                    <img src="https://img.icons8.com/color/48/000000/google-logo.png" />
                    Entrar com Google
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className={styles.inputContainer}>
                  <label htmlFor="email">E-mail</label>
                  <input
                    type="email"
                    placeholder="Digite seu e-mail"
                    id="email"
                  />
                </div>
                <div className={styles.inputContainer}>
                  <label htmlFor="password">Senha</label>
                  <input
                    type="password"
                    placeholder="Digite sua senha"
                    id="password"
                  />
                </div>
                <button className={styles.loginButton} type="submit">
                  Entrar
                </button>
                <p>
                  Esqueceu sua senha? <a href="#">Clique aqui</a>
                </p>
                <div className={styles.loginForGoogle}>
                  <button className={styles.loginWithGoogle} type="button">
                    <img src="https://img.icons8.com/color/48/000000/google-logo.png" />
                    Entrar com Google
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
