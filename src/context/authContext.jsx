import axios from "axios";
import Cookies from "js-cookie";
import { createContext, useState, useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebaseConfig";

import LoginModal from "../components/loginModal";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [token, setToken] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Configura o Axios para sempre enviar o token do cookie
  axios.interceptors.request.use((config) => {
    const savedToken = Cookies.get("token");
    if (savedToken) {
      config.headers.Authorization = `Bearer ${savedToken}`;
    }
    return config;
  });

  // Função para validar token no backend
  async function validateToken() {
    const savedToken = Cookies.get("token");

    if (!savedToken) {
      setToken(null);
      return false;
    }

    try {
      const response = await axios.get(`${API_URL}auth/validate-token`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      if (response.data.valid) {
        setToken(savedToken);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error("Erro ao validar token:", error);
      logout();
      return false;
    }
  }

  // Ao iniciar, carrega token do cookie e valida
  useEffect(() => {
    async function checkToken() {
      const savedToken = Cookies.get("token");
      if (savedToken) {
        const valid = await validateToken();
        if (!valid) {
          setToken(null);
        }
      } else {
        setToken(null);
      }
      setLoading(false);
    }
    checkToken();
  }, []);

  // Polling pra monitorar mudanças no cookie (a cada 3s)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentToken = Cookies.get("token") || null;
      setToken((prevToken) => {
        if (prevToken !== currentToken) {
          // Se mudou o token, revalida ele
          if (!currentToken) {
            // Token removido, logout
            return null;
          } else {
            validateToken(); // revalida o novo token
            return currentToken;
          }
        }
        return prevToken;
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  function saveToken(newToken) {
    Cookies.set("token", newToken, { expires: 7 }); // expira em 7 dias
    setToken(newToken);
  }

  function logout() {
    Cookies.remove("token");
    setToken(null);
  }

  function openLoginModal() {
    setShowLoginModal(true);
  }

  function closeLoginModal() {
    setShowLoginModal(false);
  }

  async function loginUser(loginData) {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}auth/user`, {
        email: loginData.email,
        password: loginData.senha,
      });

      saveToken(response.data.token);

      setLoading(false);
      return response.status;
    } catch (error) {
      setErrorMessage(error.response?.data.message);
      setLoading(false);
    }
  }

  async function loginSupplier(loginData) {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}auth/supplier`, {
        email: loginData.email,
        password: loginData.senha,
      });

      saveToken(response.data.token);

      setLoading(false);
      return response.status;
    } catch (error) {
      setErrorMessage(error.response?.data.message);
      setLoading(false);
    }
  }

  async function registerUser(user) {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}register/user`, {
        name: user.nome,
        email: user.email,
        telefone: user.tel,
        endereco: user.endereco,
        password: user.senha,
      });

      setLoading(false);
      return response.status;
    } catch (error) {
      setErrorMessage(error.response?.data.message);
      setLoading(false);
    }
  }

  async function registerSupplier(supplier) {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}register/supplier`, {
        name: supplier.nome,
        email: supplier.email,
        telefone: supplier.tel,
        endereco: supplier.endereco,
        cpf_cnpj: supplier.cpfCnpj,
        password: supplier.senha,
      });

      setLoading(false);
      return response.status;
    } catch (error) {
      setErrorMessage(error.response?.data.message);
      setLoading(false);
    }
  }

  async function loginWithGoogle(permission) {
    setLoading(true);
    try {
      // 1. Login no Firebase
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 2. Pegar idToken do Firebase
      const idToken = await user.getIdToken();

      // 3. Chamar backend com token do Firebase
      const response = await axios.post(
        `${API_URL}auth/google?permission=${permission}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      // 4. Salvar token do backend
      saveToken(response.data.token);

      setLoading(false);
      return response.data;
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message);
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        loading,
        token,
        loginUser,
        loginSupplier,
        registerUser,
        registerSupplier,
        loginWithGoogle,
        logout,
        errorMessage,
        setErrorMessage,
        validateToken, // exporta para possível uso externo
        openLoginModal,
        closeLoginModal,
      }}
    >
      {children}
      <LoginModal isOpen={showLoginModal} onRequestClose={closeLoginModal} />
    </AuthContext.Provider>
  );
};
