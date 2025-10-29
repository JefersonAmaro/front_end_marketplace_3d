import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import axios from "axios";
import HeaderChildren from "../../../components/headerChildrenSupllier";
import BarraFiltros from "../../../components/barraFIltrosProdutosSupplier";
import EditProductSupplier from "../../../components/editProductSupplier";
import ModelItem from "../../../components/modalItem";

import { useNavigate } from "react-router-dom";

function Produtos() {
  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  // Estados gerais
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "ativos", "arquivados"
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth > 700);

  // Arrays do backend
  const [colorsArray, setColorsArray] = useState([]);
  const [materialsArray, setMaterialsArray] = useState([]);
  const [finishingsArray, setFinishingsArray] = useState([]);
  const [categoriesArray, setCategoriesArray] = useState([]);

  // Modal de edição
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  // Modal de exclusão
  const [modelToDelete, setModelToDelete] = useState(null);

  // Map para cores
  const colorMap = {
    Red: "Vermelho",
    Blue: "Azul",
    Green: "Verde",
    Yellow: "Amarelo",
    Black: "Preto",
    White: "Branco",
    Gray: "Cinza",
    Pink: "Rosa",
    Orange: "Laranja",
    Purple: "Roxo",
  };

  // ---------------- Funções ---------------- //

  // Função para alternar o filtro ciclicamente
  const toggleFilterStatus = () => {
    setFilterStatus((prev) =>
      prev === "all" ? "ativos" : prev === "ativos" ? "arquivados" : "all"
    );
  };

  const openEditMenu = (model) => {
    setSelectedModel(model);
    setIsEditOpen(true);
  };

  const closeEditMenu = () => {
    setIsEditOpen(false);
    setSelectedModel(null);
  };

  const handleDeleteFromList = (id) => {
    setModels((prev) => prev.filter((model) => model.id !== id));
    setModelToDelete(null);
  };

  // ---------------- API ---------------- //

  const fetchModels = async () => {
    setLoading(true);
    try {
      let data = [];

      if (filterStatus === "arquivados") {
        const response = await axios.get(
          `${API_URL}model-supplier/list-archived`
        );
        data = response.data;
      } else if (filterStatus === "all") {
        const [allResp, archivedResp] = await Promise.all([
          axios.get(`${API_URL}model-supplier/list-all`),
          axios.get(`${API_URL}model-supplier/list-archived`),
        ]);
        data = [...allResp.data, ...archivedResp.data];
      } else {
        const response = await axios.get(`${API_URL}model-supplier/list-all`);
        data = response.data;
      }

      const parsedData = data.map((model) => ({
        ...model,
        size:
          typeof model.size === "string" ? JSON.parse(model.size) : model.size,
        archived: model.deletedAt ? true : false,
      }));

      // Filtra ativos se filterStatus for "ativos"
      const filteredData =
        filterStatus === "ativos"
          ? parsedData.filter((m) => !m.archived)
          : parsedData;

      setModels(filteredData);
    } catch (error) {
      console.error("Erro ao buscar modelos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}model-supplier/info`);
      const data = response.data;
      setColorsArray(data.colors || []);
      setMaterialsArray(data.material || []);
      setFinishingsArray(data.finishing || []);
      setCategoriesArray(data.category || []);
    } catch (error) {
      console.error("Erro ao buscar infos:", error);
    } finally {
      setLoading(false);
    }
  };

  const archiveModel = async (model) => {
    try {
      await axios.put(`${API_URL}model-supplier/archive/${model.id}`);
    } catch (error) {
      console.error("Erro ao arquivar modelo:", error);
    }
  };

  const unarchiveModel = async (model) => {
    try {
      await axios.put(`${API_URL}model-supplier/unarchive/${model.id}`);
    } catch (error) {
      console.error("Erro ao desarquivar modelo:", error);
    }
  };

  // ---------------- useEffect ---------------- //

  useEffect(() => {
    fetchInfo();
    fetchModels();
  }, []);

  useEffect(() => {
    fetchModels();
  }, [filterStatus]);

  useEffect(() => {
    const handleResize = () => setIsWideScreen(window.innerWidth > 700);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredModelsByStatus = filteredModels; // só filtra pelo searchTerm

  // ---------------- Render ---------------- //
  return (
    <div className={styles.container}>
      <HeaderChildren titulo="Produtos" subtitle={filterStatus} />
      <BarraFiltros
        onAddProductClick={() =>
          navigate("/fornecedor/produtos/adicionar-produto")
        }
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        btn={
          filterStatus === "all"
            ? "Todos"
            : filterStatus === "ativos"
            ? "Ativos"
            : "Arquivados"
        }
        onArchivedClick={toggleFilterStatus}
      />

      <div className={styles.cardContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
          </div>
        ) : filteredModelsByStatus.length > 0 ? (
          filteredModelsByStatus.map((model) => (
            <div className={styles.card} key={model.id}>
              <div className={styles.imageContainer}>
                <img
                  src={`${API_URL}${
                    model.file_paths.split(",")[0]?.replace(/\\/g, "/") || ""
                  }`}
                  alt={model.name}
                  className={styles.cardImage}
                />
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardTitle}>
                  <div className={styles.cardName}>
                    <h3>{model.name}</h3>
                    <p>{model.description}</p>
                  </div>
                  {isWideScreen && (
                    <div className={styles.buttonCardContainer}>
                      <div className={styles.buttonContainer}>
                        <button
                          className={styles.editButton}
                          onClick={() => openEditMenu(model)}
                        >
                          Editar
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => setModelToDelete(model)}
                        >
                          Excluir
                        </button>
                      </div>
                      <div className={styles.switchContainer}>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={!model.archived}
                            onChange={async () => {
                              // Atualiza backend
                              if (model.archived) {
                                await unarchiveModel(model);
                              } else {
                                await archiveModel(model);
                              }
                              // Atualiza localmente a UI sem filtrar
                              setModels((prev) =>
                                prev.map((m) =>
                                  m.id === model.id
                                    ? { ...m, archived: !m.archived }
                                    : m
                                )
                              );
                            }}
                          />

                          <span className={styles.slider}></span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.cardDetails}>
                  <div className={styles.detailsContainer}>
                    <p>
                      Tamanho: {model.size.width} x {model.size.height} x{" "}
                      {model.size.depth}
                    </p>
                    <p>
                      Cores:{" "}
                      {model.colors
                        .split(",")
                        .map((c) => colorMap[c] || c)
                        .join(", ")}
                    </p>
                    <p>Material: {model.material?.split(",").join(", ")}</p>
                    <p>Acabamento: {model.finishing?.split(",").join(", ")}</p>
                    <p>Categoria: {model.category}</p>
                  </div>
                  <div className={styles.priceContainer}>
                    <p className={styles.price}>
                      Preço:{" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        minimumFractionDigits: 2,
                      }).format(model.price)}
                    </p>
                  </div>
                </div>

                {!isWideScreen && (
                  <div className={styles.buttonCardContainer}>
                    <button
                      className={styles.editButton}
                      onClick={() => openEditMenu(model)}
                    >
                      Editar
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => setModelToDelete(model)}
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyContainer}>
            <p className={styles.infoMessage}>Nenhum produto encontrado.</p>
          </div>
        )}
      </div>

      {/* Modal de edição */}
      <EditProductSupplier
        isEditOpen={isEditOpen}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        closeEditMenu={closeEditMenu}
        fetchModels={fetchModels}
        API_URL={API_URL}
      />

      {/* Modal de exclusão */}
      {modelToDelete && (
        <ModelItem model={modelToDelete} onDelete={handleDeleteFromList} />
      )}
    </div>
  );
}

export default Produtos;
