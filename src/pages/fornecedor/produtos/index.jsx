import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import axios from "axios";
import { s } from "framer-motion/client";

function Produtos() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dados do produto
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [depth, setDepth] = useState("");
  const [colors, setColors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [finishings, setFinishings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // Arrays que vêm do backend
  const [colorsArray, setColorsArray] = useState([]);
  const [materialsArray, setMaterialsArray] = useState([]);
  const [finishingsArray, setFinishingsArray] = useState([]);
  const [categoriesArray, setCategoriesArray] = useState([]);

  // Estado para erros
  const [errors, setErrors] = useState({});

  const toggleModal = () => {
    setIsOpen((prev) => !prev);
    setErrors({});
  };

  // 🔹 Buscar produtos
  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}model-supplier/list-all`);
      const data = response.data.map((model) => ({
        ...model,
        size:
          typeof model.size === "string" ? JSON.parse(model.size) : model.size,
      }));
      setModels(data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar modelos:", error);
      setLoading(false);
    }
  };

  // 🔹 Buscar infos fixas
  const fetchInfo = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}model-supplier/info`);
      const data = response.data;
      setColorsArray(data.colors || []);
      setMaterialsArray(data.material || []);
      setFinishingsArray(data.finishing || []);
      setCategoriesArray(data.category || []);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar infos:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
    fetchModels();
  }, []);

  useEffect(() => {
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
    return () => {
      newPreviews.forEach(URL.revokeObjectURL);
    };
  }, [files]);

  const handleCheckboxChange = (value, state, setState) => {
    if (state.includes(value)) {
      setState(state.filter((item) => item !== value));
    } else {
      setState([...state, value]);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 6) {
      setErrors((prev) => ({
        ...prev,
        files: "Você só pode enviar até 6 imagens",
      }));
      return;
    }
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    setErrors((prev) => ({ ...prev, files: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação
    const newErrors = {};
    if (!name) newErrors.name = "Campo obrigatório";
    if (!description) newErrors.description = "Campo obrigatório";
    if (!price) newErrors.price = "Campo obrigatório";
    if (!width) newErrors.width = "Campo obrigatório";
    if (!height) newErrors.height = "Campo obrigatório";
    if (!depth) newErrors.depth = "Campo obrigatório";
    if (colors.length === 0) newErrors.colors = "Selecione pelo menos uma cor";
    if (materials.length === 0)
      newErrors.materials = "Selecione pelo menos um material";
    if (finishings.length === 0)
      newErrors.finishings = "Selecione pelo menos um acabamento";
    if (categories.length === 0)
      newErrors.categories = "Selecione uma categoria";
    if (files.length === 0) newErrors.files = "Selecione pelo menos um arquivo";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const size = {
        width: Number(width),
        height: Number(height),
        depth: Number(depth),
      };
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("size", JSON.stringify(size));
      formData.append("colors", colors.join(","));
      formData.append("material", materials.join(","));
      formData.append("finishing", finishings.join(","));
      formData.append("category", categories[0] || "");
      files.forEach((file) => formData.append("images", file));

      await axios.post(`${API_URL}model-supplier/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 🔥 Atualiza lista de produtos após cadastrar
      await fetchModels();

      toggleModal();
    } catch (error) {
      console.error("Erro ao enviar produto:", error);
    }
  };

  const colorMap = {
    Red: "Vermelho",
    Blue: "Azul",
    Green: "Verde",
    Yellow: "Amarelo",
    Black: "Preto",
    White: "Branco",
    Gray: "Cinza",
    Pink: "Rosa",
    orange: "Laranja",
    Purple: "Roxo",
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.inputContainer}>
          <input type="text" placeholder="Pesquisar" />
        </div>
        <div className={styles.buttonContainer}>
          <button className={styles.button} onClick={toggleModal}>
            Adicionar Produto
          </button>
        </div>
      </div>

      <div className={styles.cardContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
          </div>
        ) : models.length > 0 ? (
          models.map((model) => (
            <div className={styles.card} key={model.id}>
              <div className={styles.imageContainer}>
                <img
                  src={`${API_URL}${model.file_paths.split(",")[0]?.replace(/\\/g, "/") || ""}`}
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
                  <div className={styles.buttonCardContainer}>
                    <button className={styles.editButton}>Editar</button>
                    <button className={styles.deleteButton}>Excluir</button>
                  </div>
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
                    <p>
                      Material:{" "}
                      {model.material
                        ?.split(",")
                        .map((m) => m.trim())
                        .join(", ")}
                    </p>
                    <p>
                      Acabamento:{" "}
                      {model.finishing
                        ?.split(",")
                        .map((f) => f.trim())
                        .join(", ")}
                    </p>
                    <p>Categoria: {model.category}</p>
                  </div>
                  <div className={styles.priceContainer}>
                    <p className={styles.price}>Preço: R$ {model.price}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyContainer}>
            <h3>Nenhum produto cadastrado</h3>
          </div>
        )}
      </div>

      {isOpen && (
        <div className={styles.modalOverlay} onClick={toggleModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Cadastrar Novo Produto</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.group}>
                <label>Nome do produto:</label>
                <input
                  type="text"
                  placeholder="Digite o nome do produto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className={styles.error}>{errors.name}</p>}
              </div>

              <div className={styles.group}>
                <label>Descrição:</label>
                <textarea
                  placeholder="Digite a descrição do produto"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                {errors.description && (
                  <p className={styles.error}>{errors.description}</p>
                )}
              </div>

              <div className={styles.sizeInputs}>
                <div className={styles.sizeContainer}>
                  <label>Largura:</label>
                  <input
                    type="number"
                    placeholder="Digite a largura do produto (cm)"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                  />
                  {errors.width && (
                    <p className={styles.error}>{errors.width}</p>
                  )}
                </div>
                <div className={styles.sizeContainer}>
                  <label>Altura:</label>
                  <input
                    type="number"
                    placeholder="Digite a altura do produto (cm)"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                  {errors.height && (
                    <p className={styles.error}>{errors.height}</p>
                  )}
                </div>
                <div className={styles.sizeContainer}>
                  <label>Profundidade:</label>
                  <input
                    type="number"
                    placeholder="Digite a profundidade do produto (cm)"
                    value={depth}
                    onChange={(e) => setDepth(e.target.value)}
                  />
                  {errors.depth && (
                    <p className={styles.error}>{errors.depth}</p>
                  )}
                </div>
              </div>

              {/* Cores */}
              <div className={styles.checkboxGroup}>
                <label>Cores:</label>
                <div className={styles.checkboxGroupContainer}>
                  {colorsArray.map((color) => (
                    <label key={color} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={colors.includes(color)}
                        onChange={() =>
                          handleCheckboxChange(color, colors, setColors)
                        }
                      />
                      {colorMap[color] || color}{" "}
                      {/* Traduz ou mostra original */}
                    </label>
                  ))}
                </div>
                {errors.colors && (
                  <p className={styles.error}>{errors.colors}</p>
                )}
              </div>

              {/* Materiais */}
              <div className={styles.checkboxGroup}>
                <label>Materiais:</label>
                <div className={styles.checkboxGroupContainer}>
                  {materialsArray.map((material) => (
                    <label key={material} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={materials.includes(material)}
                        onChange={() =>
                          handleCheckboxChange(
                            material,
                            materials,
                            setMaterials
                          )
                        }
                      />
                      {material}
                    </label>
                  ))}
                </div>
                {errors.materials && (
                  <p className={styles.error}>{errors.materials}</p>
                )}
              </div>

              {/* Acabamentos */}
              <div className={styles.checkboxGroup}>
                <label>Acabamentos:</label>
                <div className={styles.checkboxGroupContainer}>
                  {finishingsArray.map((finish) => (
                    <label key={finish} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={finishings.includes(finish)}
                        onChange={() =>
                          handleCheckboxChange(
                            finish,
                            finishings,
                            setFinishings
                          )
                        }
                      />
                      {finish}
                    </label>
                  ))}
                </div>
                {errors.finishings && (
                  <p className={styles.error}>{errors.finishings}</p>
                )}
              </div>

              {/* Categorias */}
              <div className={styles.category}>
                <label>Categoria:</label>
                <select
                  value={categories[0] || ""}
                  onChange={(e) => setCategories([e.target.value])}
                >
                  <option value="">Selecione uma categoria</option>
                  {categoriesArray.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.categories && (
                  <p className={styles.error}>{errors.categories}</p>
                )}
              </div>

              <div className={styles.group}>
                <label>Preço:</label>
                <input
                  type="number"
                  placeholder="Digite o preço do produto"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                {errors.price && <p className={styles.error}>{errors.price}</p>}
              </div>

              <div className={styles.group}>
                <input type="file" multiple onChange={handleFileChange} />
                {errors.files && <p className={styles.error}>{errors.files}</p>}

                {/* Pré-visualização das imagens */}
                <div className={styles.previewContainer}>
                  {files.map((file, index) => (
                    <div key={index} className={styles.previewWrapper}>
                      <img
                        src={previews[index]}
                        alt={`Preview ${index}`}
                        className={styles.previewImage}
                      />
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => {
                          setFiles((prevFiles) =>
                            prevFiles.filter((_, i) => i !== index)
                          );
                          setErrors((prev) => ({ ...prev, files: null }));
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.actions}>
                <button type="button" onClick={toggleModal}>
                  Cancelar
                </button>
                <button type="submit">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Produtos;
