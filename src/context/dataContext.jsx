import axios from "axios";
import { createContext, useState, useEffect } from "react";

export const DataContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // 🔹 1. Dados locais (JSON)
        let localData = [];
        try {
          const response = await axios.get("/data.json");
          localData = response.data || [];
        } catch (err) {
          console.warn("Erro ao carregar dados locais:", err);
        }

        // 🔹 2. Dados do backend
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

        // 🔹 3. Combina dados locais + backend
        const combinedData = [...localData, ...backendData];
        setData(combinedData);
      } finally {
        setLoading(false);
        setStatus(null);
      }
    };


    fetchData();
  }, []);

  return (
    <DataContext.Provider
      value={{ data, loading, filters, setFilters, status }}
    >
      {children}
    </DataContext.Provider>
  );
};
