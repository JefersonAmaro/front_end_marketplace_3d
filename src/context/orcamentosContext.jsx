import axios from "axios";
import { createContext, useState, useEffect } from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import { useLocation } from "react-router-dom";

export const OrcamentosContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

// ==============================
// Função utilitária distância
// ==============================
function calcularDistancia(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

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
  const [orcamentosEnviados, setOrcamentosEnviados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // 🔥 PRICING
  const [pricing, setPricing] = useState(null);
  const [checkingPricing, setCheckingPricing] = useState(true);

  const location = useLocation();
  const url = location.pathname;

  const { latitude, longitude, error: geoError } = useGeolocation();

  // ==============================
  // Buscar pricing do fornecedor
  // ==============================
  async function checkSupplierPricing() {
    try {
      const response = await axios.get(`${API_URL}supplier/pricing/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setPricing(response.data);
      return response.data;
    } catch (err) {
      setPricing(null);
      return null;
    } finally {
      setCheckingPricing(false);
    }
  }

  // ==============================
  // Buscar orçamentos recebidos
  // ==============================
  async function loadOrcamentos() {
    try {
      const response = await axios.get(`${API_URL}custom-request/list`);
      setOrcamentos(response.data);
    } catch (err) {
      console.error("Erro ao buscar orçamentos:", err);
      setErro(err);
    }
  }

  // ==============================
  // Buscar orçamentos enviados
  // ==============================
  async function loadOrcamentosEnviados() {
    try {
      const response = await axios.get(`${API_URL}custom-request/list-request`);
      setOrcamentosEnviados(response.data);
    } catch (err) {
      console.error("Erro ao buscar orçamentos enviados:", err);
      setErro(err);
    }
  }

  // ==============================
  // Init
  // ==============================
  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([
        loadOrcamentos(),
        loadOrcamentosEnviados(),
        checkSupplierPricing(),
      ]);
      setLoading(false);
    }

    init();
  }, [url]);

  return (
    <OrcamentosContext.Provider
      value={{
        // orçamentos
        orcamentos,
        orcamentosEnviados,
        loading,
        erro,

        // localização
        latitude,
        longitude,
        geoError,
        calcularDistancia,

        // pricing
        pricing,
        setPricing,
        checkingPricing,
        hasPricing: !!pricing,
        checkSupplierPricing,
      }}
    >
      {children}
    </OrcamentosContext.Provider>
  );
};
