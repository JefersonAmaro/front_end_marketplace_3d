import React, { useState } from "react";
import Modal from "react-modal";
import Lottie from "lottie-react";
import impressao3dAnimation from "../../assets/lotties/impressora3d.json";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";

import styles from "./styles.module.css";

import { useContext } from "react";
import { AuthContext } from "../../context/authContext";

import axios from "axios";

Modal.setAppElement("#root"); // acessibilidade

export default function LoginModal({ isOpen, onRequestClose }) {
  const {
    loginUser,
    loginSupplier,
    registerUser,
    registerSupplier,
    loginWithGoogle,
    loading,
    errorMessage,
    setErrorMessage,
  } = useContext(AuthContext);

  const [loginCadastro, setLoginCadastro] = useState("login");
  const [loginOptions, setLoginOptions] = useState("cliente");
  const [cadastroEtapa, setCadastroEtapa] = useState("pessoal");

  const [message, setMessage] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    senha: "",
  });

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

  const [dadosEndereco, setDadosEndereco] = useState({
    logradouro: "",
    bairro: "",
    cidade: "",
    uf: "",
    complemento: "",
  });

  const [cepValido, setCepValido] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loginOptions === "fornecedor") {
      const response = await loginSupplier(loginData);

      if (response === 200) {
        onRequestClose();
      }
    }

    if (loginOptions === "cliente") {
      const response = await loginUser(loginData);

      if (response === 200) {
        onRequestClose();
      }
    }

    setLoginData({ email: "", senha: "" });
    setMessage("");
  };

  const handleGoogleLogin = async () => {
    let permission;
    switch (loginOptions) {
      case "fornecedor":
        permission = "fornecedor";
        break;
      case "cliente":
        permission = "cliente";
        break;
      default:
        break;
    }
    await loginWithGoogle(permission);
    onRequestClose();
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleVoltarEtapa = (e, etapa) => {
    setCadastroEtapa(etapa);
  };

  const handleCadastroSubmit = async (e, etapa) => {
    e.preventDefault();

    setErrorMessage(null); // Limpa o erro antes de validar

    if (cadastroEtapa === "pessoal") {
      if (
        !formData.nome.trim() ||
        (loginOptions === "fornecedor" && !formData.cpfCnpj.trim()) ||
        !formData.email.trim() ||
        !formData.tel.trim()
      ) {
        setErrorMessage("Preencha todos os campos pessoais.");
        return;
      }
    }

    if (cadastroEtapa === "endereco") {
      if (!formData.cep.trim() || !formData.numero.trim()) {
        setErrorMessage("Preencha pelo menos o CEP e o número.");
        return;
      }

      if (!cepValido) {
        setErrorMessage("CEP não encontrado");
        return; // bloqueia se o CEP não é válido
      }
    }

    if (cadastroEtapa === "senha") {
      if (!formData.senha || !formData.confirmSenha) {
        setErrorMessage("Preencha os dois campos de senha.");
        return;
      }
      if (formData.senha !== formData.confirmSenha) {
        setErrorMessage("As senhas não coincidem.");
        return;
      }

      if (errorMessage) return;

      // lógica de cadastro aqui
      if (loginOptions === "cliente") {
        const response = await registerUser(formData);
        if (response === 200) {
          setLoginCadastro("login");
          setMessage("Cadastro realizado com sucesso! Efetue o login.");
          setFormData({
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
        }
      }

      if (loginOptions === "fornecedor") {
        const response = await registerSupplier(formData);

        if (response === 200) {
          setLoginCadastro("login");
          setMessage("Cadastro realizado com sucesso! Efetue o login.");
          setFormData({
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
        }
      }
    }

    if (etapa) {
      setCadastroEtapa(etapa);
    }
  };

  const handleTelefoneChange = (e) => {
    let input = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número

    // Limita o número a no máximo 11 dígitos (DDD + número)
    if (input.length > 11) input = input.slice(0, 11);

    // Aplica a máscara (XX) X XXXX-XXXX
    if (input.length === 11) {
      input = input.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, "($1) $2 $3-$4");
    } else if (input.length === 10) {
      input = input.replace(/^(\d{2})(\d{1})(\d{4})(\d{3})$/, "($1) $2 $3-$4");
    } else if (input.length === 9) {
      input = input.replace(/^(\d{2})(\d{1})(\d{4})(\d{2})$/, "($1) $2 $3-$4");
    } else if (input.length === 8) {
      input = input.replace(/^(\d{2})(\d{1})(\d{4})(\d{1})$/, "($1) $2 $3-$4");
    } else if (input.length === 7) {
      input = input.replace(/^(\d{2})(\d{1})(\d{4})$/, "($1) $2 $3");
    } else if (input.length === 6) {
      input = input.replace(/^(\d{2})(\d{1})(\d{3})$/, "($1) $2 $3");
    } else if (input.length === 5) {
      input = input.replace(/^(\d{2})(\d{1})(\d{2})$/, "($1) $2 $3");
    } else if (input.length === 4) {
      input = input.replace(/^(\d{2})(\d{1})(\d{1})$/, "($1) $2 $3");
    } else {
      input = input.replace(/^(\d{2})(\d{1})$/, "($1) $2");
    }

    setFormData((prev) => ({ ...prev, tel: input }));
  };

  function handleCepChange(e) {
    let cep = e.target.value.replace(/\D/g, "");
    if (cep.length > 8) cep = cep.slice(0, 8);
    setFormData((prev) => ({ ...prev, cep }));

    setCepValido(false);
    setErrorMessage(null);

    if (cep.length === 8) {
      buscarCep(cep);
    }
  }

  async function buscarCep(cep) {
    if (cep.length !== 8) return;

    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

      if (response.data.erro) {
        setErrorMessage("CEP não encontrado");
        setCepValido(false);
        return;
      }

      setCepValido(true);
      setErrorMessage(null);

      const endereco = response.data;

      setDadosEndereco({
        logradouro: endereco.logradouro || "",
        bairro: endereco.bairro || "",
        cidade: endereco.localidade || "",
        uf: endereco.uf || "",
        complemento:
          endereco.complemento && endereco.complemento !== "-"
            ? endereco.complemento
            : "",
      });

      // Atualiza formData.endereco usando número e complemento atuais
      setFormData((prev) => ({
        ...prev,
        endereco: montarEnderecoCompleto(
          prev.numero,
          prev.complemento,
          endereco
        ),
      }));
    } catch (error) {
      console.error("Erro ao buscar CEP:", error.message);
    }
  }

  function handleNumeroChange(e) {
    const numero = e.target.value.replace(/\D/g, "");

    setFormData((prev) => ({
      ...prev,
      numero,
      endereco: montarEnderecoCompleto(numero, prev.complemento),
    }));
  }

  function handleComplementoChange(e) {
    const complementoUsuario = e.target.value;

    setFormData((prev) => ({
      ...prev,
      complemento: complementoUsuario,
      endereco: montarEnderecoCompleto(prev.numero, complementoUsuario),
    }));
  }

  // Agora recebe o objeto enderecoViaCep (opcional) para garantir dados atualizados
  function montarEnderecoCompleto(
    numero,
    complementoUsuario,
    enderecoViaCep = null
  ) {
    // Se recebeu o objeto enderecoViaCep, usa ele; senão usa dadosEndereco
    const dados = enderecoViaCep || dadosEndereco;

    const comp =
      complementoUsuario && complementoUsuario.trim() !== ""
        ? ` - ${complementoUsuario.trim()}`
        : dados.complemento && dados.complemento !== "-"
        ? ` - ${dados.complemento}`
        : "";

    return `${dados.logradouro}, ${numero}${comp}, ${dados.bairro}, ${dados.localidade}, ${dados.uf}`;
  }

  function handleCpfCnpjChange(e) {
    let valor = e.target.value.replace(/\D/g, ""); // remove tudo que não for número

    // Limita para no máximo 14 dígitos (CNPJ)
    if (valor.length > 14) valor = valor.slice(0, 14);

    // Formata CPF
    if (valor.length <= 11) {
      valor = valor
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    // Formata CNPJ
    else {
      valor = valor
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }

    setFormData((prev) => ({
      ...prev,
      cpfCnpj: valor,
    }));
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Login Modal"
      style={{
        overlay: { backgroundColor: "rgba(0,0,0,0.5)", zIndex: 2000 },
        content:
          window.innerWidth < 699
            ? {
                width: "80%",
                height: "95%",
                margin: "auto",
                borderRadius: "8px",
                padding: 0,
                border: "none",
              }
            : window.innerWidth < 1919
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
                {loading ? (
                  <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                  </div>
                ) : (
                  <>
                    <div className={styles.inputContainer}>
                      <label htmlFor="email">E-mail</label>
                      <input
                        type="email"
                        placeholder="Digite seu e-mail"
                        id="email"
                        value={loginData.email}
                        onChange={(e) => {
                          setLoginData({ ...loginData, email: e.target.value }),
                            setErrorMessage(null);
                        }}
                        required
                      />
                    </div>
                    <div className={styles.inputContainer}>
                      <label htmlFor="password">Senha</label>
                      <input
                        type="password"
                        placeholder="Digite sua senha"
                        id="password"
                        value={loginData.senha}
                        onChange={(e) => {
                          setLoginData({ ...loginData, senha: e.target.value }),
                            setErrorMessage(null);
                        }}
                        required
                      />
                    </div>
                    {message && <p className={styles.message}>{message}</p>}
                    {errorMessage && (
                      <p className={styles.errorMessage}>{errorMessage}</p>
                    )}
                    <button className={styles.loginButton} type="submit">
                      Entrar
                    </button>
                    <p>
                      Esqueceu sua senha? <a href="#">Clique aqui</a>
                    </p>
                    <div className={styles.loginForGoogle}>
                      <button
                        className={styles.loginWithGoogle}
                        type="button"
                        onClick={handleGoogleLogin}
                      >
                        <img src="https://img.icons8.com/color/48/000000/google-logo.png" />
                        Entrar com Google
                      </button>
                    </div>
                  </>
                )}
              </form>
            ) : (
              <div className={styles.cadastroContainer}>
                {loading ? (
                  <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                  </div>
                ) : (
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
                              onChange={handleCpfCnpjChange}
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
                            onChange={handleTelefoneChange}
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
                        {errorMessage && (
                          <p className={styles.errorMessage}>{errorMessage}</p>
                        )}
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
                            value={formData.cep || ""}
                            onChange={(e) => {
                              handleCepChange(e);
                              errorMessage === "CEP não encontrado"
                                ? setErrorMessage(null)
                                : null;
                            }}
                          />
                        </div>

                        <div className={styles.inputContainer}>
                          <label htmlFor="numero">Número</label>
                          <input
                            type="text"
                            placeholder="Digite o Número"
                            value={formData.numero || ""}
                            onChange={handleNumeroChange}
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
                            onChange={handleComplementoChange}
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
                        {errorMessage && (
                          <p className={styles.errorMessage}>{errorMessage}</p>
                        )}
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
                        {errorMessage && (
                          <p className={styles.errorMessage}>{errorMessage}</p>
                        )}
                        <button className={styles.loginButton} type="submit">
                          Cadastrar
                        </button>
                      </>
                    )}
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
