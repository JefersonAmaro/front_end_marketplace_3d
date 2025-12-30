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
  const [user, setUser] = useState({});
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
      setUser({});
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
        const { name, email, role } = response.data.user;
        setUser({ name, email, role });

        // Redireciona fornecedor automaticamente apenas se não estiver em nenhuma rota /fornecedor
        if (
          role === "fornecedor" &&
          !window.location.pathname.startsWith("/fornecedor")
        ) {
          window.location.href = "/fornecedor";
        }

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
        await validateToken();
      } else {
        setToken(null);
        setUser({});
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
          if (!currentToken) {
            // Token removido, logout
            setUser({});
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

  function saveToken(newToken, needsAddress = false) {
    Cookies.set("token", newToken, { expires: 7 });
    Cookies.set("needsAddress", needsAddress, { expires: 7 }); // salva o flag
    setToken(newToken);
  }

  function logout() {
    Cookies.remove("token");
    setToken(null);
    setUser({});
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

      saveToken(response.data.token, response.data.needsAddress);

      await validateToken();

      setLoading(false);

      if (response.data.needsAddress) {
        window.location.href = "/finalizar-cadastro";
      }

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

      saveToken(response.data.token, response.data.needsAddress);

      await validateToken();

      setLoading(false);

      if (response.data.needsAddress) {
        window.location.href = "/finalizar-cadastro";
      }

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
        cpf_cnpj: user.cpfCnpj,
        email: user.email,
        telefone: user.tel,
        endereco: user.endereco,
        latitude: user.latitude,
        longitude: user.longitude,
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
        latitude: supplier.latitude,
        longitude: supplier.longitude,
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
      const result = await signInWithPopup(auth, provider);
      const userFirebase = result.user;
      const idToken = await userFirebase.getIdToken();

      const response = await axios.post(
        `${API_URL}auth/google?permission=${permission}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      saveToken(response.data.token, response.data.needsAddress);

      await validateToken();

      setLoading(false);

      if (response.data.needsAddress) {
        window.location.href = "/finalizar-cadastro";
      }

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
        user,
        loginUser,
        loginSupplier,
        registerUser,
        registerSupplier,
        loginWithGoogle,
        logout,
        errorMessage,
        setErrorMessage,
        validateToken,
        openLoginModal,
        closeLoginModal,
      }}
    >
      {children}
      <LoginModal isOpen={showLoginModal} onRequestClose={closeLoginModal} />
    </AuthContext.Provider>
  );
};
