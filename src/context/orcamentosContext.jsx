import axios from "axios";
import { createContext, useState, useEffect } from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import { useLocation } from "react-router-dom";

export const OrcamentosContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

// Função utilitária para calcular distância entre 2 pontos (em km)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const OrcamentosContextProvider = ({ children }) => {
  const [orcamentos, setOrcamentos] = useState([]);
  const [ orcamentosEnviados, setOrcamentosEnviados ] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Pegar a URL atual
  const location = useLocation();
  const url = location.pathname;

  // Localização do fornecedor (usuário logado fornecedor)
  const { latitude, longitude, error: geoError } = useGeolocation();

  // Carregar pedidos / orçamentos
  useEffect(() => {
    async function loadOrcamentos() {
      try {
        const response = await axios.get(`${API_URL}custom-request/list`);
        setOrcamentos(response.data);
      } catch (err) {
        console.error("Erro ao buscar orçamentos:", err);
        setErro(err);
      } finally {
        setLoading(false);
      }
    }

    loadOrcamentos();
  }, [ url ]);

  useEffect(() => {
    async function loadOrcamentosEnviados() {
      try {
        const response = await axios.get(`${API_URL}custom-request/list-request`);
        setOrcamentosEnviados(response.data);
      } catch (err) {
        console.error("Erro ao buscar orçamentos:", err);
        setErro(err);
      } finally {
        setLoading(false);
      }
    }

    loadOrcamentosEnviados();
  }, [ url ]);


  return (
    <OrcamentosContext.Provider
      value={{
        orcamentos,
        orcamentosEnviados,
        loading,
        erro,
        latitude, // localização do fornecedor
        longitude, // localização do fornecedor
        geoError,
        calcularDistancia, // função para calcular distância
      }}
    >
      {children}
    </OrcamentosContext.Provider>
  );
};
