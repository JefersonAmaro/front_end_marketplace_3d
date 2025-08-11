import axios from "axios";
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  async function loginUser(loginData) {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/auth/user", {
        email: loginData.email,
        password: loginData.senha,
      });

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
      const response = await axios.post("http://localhost:3000/auth/supplier", {
        email: loginData.email,
        password: loginData.senha,
      });

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
      const response = await axios.post(
        "http://localhost:3000/register/user",
       {  
        name: user.nome,
        email: user.email,
        telefone: user.tel,
        endereco: user.endereco,
        password: user.senha
       }
      );

      console.log(response);

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
      const response = await axios.post(
        "http://localhost:3000/register/supplier",
        {
          name: supplier.nome,
          email: supplier.email,
          telefone: supplier.tel,
          endereco: supplier.endereco,
          cpf_cnpj: supplier.cpfCnpj,
          password: supplier.senha
        }
      );

      setLoading(false);
      return response.status;
    } catch (error) {
      setErrorMessage(error.response?.data.message);
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        loading,
        loginUser,
        loginSupplier,
        registerUser,
        registerSupplier,
        errorMessage,
        setErrorMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
