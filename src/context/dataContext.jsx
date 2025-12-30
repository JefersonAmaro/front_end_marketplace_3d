import axios from "axios";
import { createContext, useState, useEffect } from "react";
import { useGeolocation } from "../hooks/useGeolocation"; // ajuste o caminho

export const DataContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

// Função utilitária para calcular distância entre 2 pontos (em km)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const DataContextProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categorias: [],
    materiais: [],
    cor: null,
    preco: 0,
  });
  const [status, setStatus] = useState(null);

  // Hook de geolocalização
  const { latitude, longitude, error: geoError } = useGeolocation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // 1. Dados locais (JSON)
        let localData = [];
        try {
          const response = await axios.get("/data.json");
          localData = response.data || [];
        } catch (err) {
          console.warn("Erro ao carregar dados locais:", err);
        }

        // 2. Dados do backend
        let backendData = [];
        try {
          const response = await axios.get(`${API_URL}model-supplier/list`);
          if (response.status === 200) {
            backendData = response.data || [];
          }
          setStatus(response.status);
        } catch (err) {
          if (err.response?.status === 404) {
            setStatus(404);
          } else {
            console.error("Erro ao buscar os dados do backend:", err);
            setStatus(err.response?.status || 500);
          }
        }

        // 3. Combina dados locais + backend
        const combinedData = [...localData, ...backendData];

        // 4. Filtra produtos conforme tipo de entrega
        const produtosFiltrados = combinedData.filter((produto) => {
          const delivery = produto.deliveryTypes?.split(",") || [];

          // Se tem "correios" → mostra sempre
          if (delivery.includes("correios")) return true;

          // Se não tem localização do fornecedor → não mostra
          if (!produto.latitude || !produto.longitude) return false;

          // Se usuário não tem geolocalização → por segurança, não mostra produtos locais
          if (!latitude || !longitude || geoError) return false;

          // Calcula distância entre usuário e fornecedor
          const distancia = calcularDistancia(
            latitude,
            longitude,
            produto.latitude,
            produto.longitude
          );

          // Se for retirada ou entrega própria → mostra apenas se <= 10km
          if (delivery.includes("retirada") || delivery.includes("propria")) {
            return distancia <= 10;
          }

          return false;
        });

        setData(produtosFiltrados);
      } finally {
        setLoading(false);
        setStatus(null);
      }
    };

    // Só busca quando já tiver geolocalização (ou se houver erro)
    if (latitude || longitude || geoError) {
      fetchData();
    }
  }, [latitude, longitude, geoError]);

  return (
    <DataContext.Provider
      value={{ data, loading, filters, setFilters, status }}
    >
      {children}
    </DataContext.Provider>
  );
};
