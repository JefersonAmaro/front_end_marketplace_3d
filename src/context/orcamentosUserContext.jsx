import axios from "axios";
import { createContext, useState, useEffect } from "react";

export const OrcamentosUserContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

export const OrcamentosUserContextProvider = ({ children }) => {
  const [orcamentos, setOrcamentos] = useState([]);
  const [orcamentosRecebidos, setOrcamentosRecebidos] = useState([]);

  /* Buscar listas */
  useEffect(() => {
    const fetchOrcamentos = async () => {
      try {
        const response = await axios.get(`${API_URL}budgets/custom/list-all`);
        setOrcamentos(response.data);
      } catch (error) {
        console.error("Erro ao buscar orçamentos:", error);
      }
    };
    fetchOrcamentos();
  }, []);

  // Buscar orçamentos recebidos
  useEffect(() => {
    const fetchOrcamentos = async () => {
      try {
        const response = await axios.get(`${API_URL}budgets/custom/list`);
        console.log(response.data);
        const normalizados = normalizarRecebidos(response.data);
        setOrcamentosRecebidos(normalizados);
      } catch (error) {
        console.error("Erro ao buscar orçamentos:", error);
      }
    };
    fetchOrcamentos();
  }, []);

  const normalizarRecebidos = (lista) => {
    return lista.map((item) => ({
      // Dados do orçamento recebido (prioridade)
      id: item.id,
      status: item.status, // <-- mantém "enviado"
      price: item.price,
      prazo_entrega: item.prazo_entrega,
      supplier_id: item.supplier_id,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,

      // Campos do modelo, mas ignorando status, id, etc
      name: item.custom_model.name,
      description: item.custom_model.description,
      material: item.custom_model.material,
      finishing: item.custom_model.finishing,
      colors: item.custom_model.colors,
      size: item.custom_model.size,
      file_paths: item.custom_model.file_paths,
      category: item.custom_model.category,
    }));
  };

  return (
    <OrcamentosUserContext.Provider value={{ orcamentos, orcamentosRecebidos }}>
      {children}
    </OrcamentosUserContext.Provider>
  );
};
