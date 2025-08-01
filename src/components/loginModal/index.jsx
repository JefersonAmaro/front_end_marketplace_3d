import React, { useState } from "react";
import Modal from "react-modal";
import Lottie from "lottie-react";
import impressao3dAnimation from "../../assets/lotties/impressora3d.json";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";

import styles from "./styles.module.css";

Modal.setAppElement("#root"); // acessibilidade

export default function LoginModal({ isOpen, onRequestClose }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    // lógica de login aqui
    alert("Logou!");
    onRequestClose();
  };

  const [loginCadastro, setLoginCadastro] = useState("login");
  const [loginOptions, setLoginOptions] = useState("cliente");
  const [cadastroEtapa, setCadastroEtapa] = useState("pessoal");

  const [formData, setFormData] = useState({
    nome: "",
    cpfCnpj: "",
    email: "",
    tel: "",
    cep: "",
    numero: "",
    complemento: "",
    senha: "",
    confirmSenha: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleVoltarEtapa = (e, etapa) => {
    setCadastroEtapa(etapa);
  };

  const handleCadastroSubmit = (e, etapa) => {
    e.preventDefault();

    if (cadastroEtapa === "pessoal") {
      if (
        !formData.nome.trim() ||
        (loginOptions === "fornecedor" && !formData.cpfCnpj.trim()) ||
        !formData.email.trim() ||
        !formData.tel.trim()
      ) {
        alert("Preencha todos os campos pessoais.");
        return;
      }
    }

    if (cadastroEtapa === "endereco") {
      if (!formData.cep.trim() || !formData.numero.trim()) {
        alert("Preencha pelo menos o CEP e o número.");
        return;
      }
    }

    if (cadastroEtapa === "senha") {
      if (!formData.senha || !formData.confirmSenha) {
        alert("Preencha os dois campos de senha.");
        return;
      }
      if (formData.senha !== formData.confirmSenha) {
        alert("As senhas não coincidem.");
        return;
      }

      // lógica de cadastro aqui
      alert("Cadastro realizado com sucesso!");
      onRequestClose();
    }

    if (etapa) {
      setCadastroEtapa(etapa);
    }
  };

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
            {loginCadastro === "login" ? (
              <>
                <h1>Login</h1>
                <h2>Bem-vindo de volta! Acesse sua conta para continuar</h2>
              </>
            ) : (
              <>
                <h1>Cadastro</h1>
                <h2>Junte-se a nós! Crie sua conta e comece agora mesmo</h2>
              </>
            )}

            <Lottie
              animationData={impressao3dAnimation}
              loop
              autoplay
              style={{ width: 400, height: "65%", overflow: "hidden" }}
            />
          </div>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            {loginCadastro === "login" ? (
              <h4>
                Novo usuário?{" "}
                <button onClick={() => setLoginCadastro("cadastro")}>
                  Cadastre-se aqui
                </button>
              </h4>
            ) : (
              <h4>
                Já possui uma conta?{" "}
                <button onClick={() => setLoginCadastro("login")}>
                  Faça login
                </button>
              </h4>
            )}
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
            {loginCadastro === "login" ? (
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
              <div className={styles.cadastroContainer}>
                <form onSubmit={handleCadastroSubmit}>
                  {cadastroEtapa === "pessoal" && (
                    <>
                      <h4>Informações pessoais</h4>
                      <div className={styles.inputContainer}>
                        <label htmlFor="nome">Nome Completo</label>
                        <input
                          type="text"
                          placeholder="Digite seu Nome Completo"
                          id="nome"
                          value={formData.nome}
                          onChange={handleChange}
                        />
                      </div>
                      {loginOptions === "fornecedor" && (
                        <div className={styles.inputContainer}>
                          <label htmlFor="cpfCnpj">CPF / CNPJ</label>
                          <input
                            type="text"
                            placeholder="Digite seu CPF / CNPJ"
                            id="cpfCnpj"
                            value={formData.cpfCnpj}
                            onChange={handleChange}
                          />
                        </div>
                      )}
                      <div className={styles.inputContainer}>
                        <label htmlFor="email">E-mail</label>
                        <input
                          type="email"
                          placeholder="Digite seu e-mail"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                      <div className={styles.inputContainer}>
                        <label htmlFor="tel">Telefone</label>
                        <input
                          type="text"
                          placeholder="Digite seu telefone"
                          id="tel"
                          value={formData.tel}
                          onChange={handleChange}
                        />
                      </div>
                      <div className={styles.buttonProx}>
                        <button
                          type="button"
                          onClick={(e) => handleCadastroSubmit(e, "endereco")}
                        >
                          <IoIosArrowForward />
                        </button>
                      </div>
                    </>
                  )}

                  {cadastroEtapa === "endereco" && (
                    <>
                      <h4>Endereço</h4>
                      <div className={styles.inputContainer}>
                        <label htmlFor="cep">CEP</label>
                        <input
                          type="text"
                          placeholder="Digite o CEP"
                          id="cep"
                          value={formData.cep}
                          onChange={handleChange}
                        />
                      </div>

                      <div className={styles.inputContainer}>
                        <label htmlFor="numero">Número</label>
                        <input
                          type="text"
                          placeholder="Digite o Número"
                          id="numero"
                          value={formData.numero}
                          onChange={handleChange}
                        />
                      </div>

                      <div className={styles.inputContainer}>
                        <label htmlFor="complemento">
                          Complemento (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Digite o complemento"
                          id="complemento"
                          value={formData.complemento}
                          onChange={handleChange}
                        />
                      </div>

                      <div className={styles.buttonProx}>
                        <button
                          type="button"
                          onClick={(e) => handleVoltarEtapa(e, "pessoal")}
                        >
                          <IoIosArrowBack />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleCadastroSubmit(e, "senha")}
                        >
                          <IoIosArrowForward />
                        </button>
                      </div>
                    </>
                  )}

                  {cadastroEtapa === "senha" && (
                    <>
                      <h4>Crie uma senha</h4>
                      <div className={styles.inputContainer}>
                        <label htmlFor="senha">Senha</label>
                        <input
                          type="password"
                          placeholder="Digite sua senha"
                          id="senha"
                          value={formData.senha}
                          onChange={handleChange}
                        />
                      </div>
                      <div className={styles.inputContainer}>
                        <label htmlFor="confirmSenha">Confirmar senha</label>
                        <input
                          type="password"
                          placeholder="Confirme sua senha"
                          id="confirmSenha"
                          value={formData.confirmSenha}
                          onChange={handleChange}
                        />
                      </div>
                      <div className={styles.buttonProx}>
                        <button
                          type="button"
                          onClick={(e) => handleVoltarEtapa(e, "endereco")}
                        >
                          <IoIosArrowBack />
                        </button>
                      </div>
                      <button className={styles.loginButton} type="submit">
                        Cadastrar
                      </button>
                    </>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
