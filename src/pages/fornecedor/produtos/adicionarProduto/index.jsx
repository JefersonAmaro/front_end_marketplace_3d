import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import HeaderChildren from "../../../../components/headerChildrenSupllier";

import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";

function AdicionarProduto() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // estados principais
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // campos
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [depth, setDepth] = useState("");
  const [price, setPrice] = useState("");
  const [colors, setColors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [finishings, setFinishings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // opções
  const [colorsArray, setColorsArray] = useState([]);
  const [materialsArray, setMaterialsArray] = useState([]);
  const [finishingsArray, setFinishingsArray] = useState([]);
  const [categoriesArray, setCategoriesArray] = useState([]);

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

  const fetchInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}model-supplier/info`);
      const data = response.data;
      setColorsArray(data.colors || []);
      setMaterialsArray(data.material || []);
      setFinishingsArray(data.finishing || []);
      setCategoriesArray(data.category || []);
    } catch (error) {
      console.error("Erro ao buscar infos:", error);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const handleCheckboxChange = (value, state, setState) => {
    setState(
      state.includes(value)
        ? state.filter((i) => i !== value)
        : [...state, value]
    );
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
    setFiles((prev) => [...prev, ...selectedFiles]);
    setErrors((prev) => ({ ...prev, files: null }));
  };

  useEffect(() => {
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
    return () => newPreviews.forEach(URL.revokeObjectURL);
  }, [files]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name) newErrors.name = "Campo obrigatório";
    if (!description) newErrors.description = "Campo obrigatório";
    const numericPrice = Number(price.replace(/\D/g, "")) / 100;
    if (isNaN(numericPrice) || numericPrice <= 0) {
      newErrors.price = "Informe o preço";
    }
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
      setLoading(true);
      const size = {
        width: Number(width),
        height: Number(height),
        depth: Number(depth),
      };
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      const rawPrice = Number(price.replace(/\D/g, "")) / 100;
      formData.append("price", rawPrice);
      formData.append("size", JSON.stringify(size));
      formData.append("colors", colors.join(","));
      formData.append("material", materials.join(","));
      formData.append("finishing", finishings.join(","));
      formData.append("category", categories[0] || "");
      files.forEach((file) => formData.append("images", file));

      await axios.post(`${API_URL}model-supplier/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/fornecedor/produtos");
    } catch (error) {
      console.error("Erro ao enviar produto:", error);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Render seções ----------
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className={styles.title}>
              <p>Etapa 1 de 3</p>
              <h2>Preencha as informações do produto</h2>
            </div>
            <div className={styles.content}>
              <div className={styles.group}>
                <label>Nome do produto:</label>
                <input
                  type="text"
                  value={name}
                  placeholder="Digite o nome do produto"
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? styles.inputError : ""}
                />
                {errors.name && <p className={styles.error}>{errors.name}</p>}
              </div>

              <div className={styles.group}>
                <label>Descrição:</label>
                <textarea
                  placeholder="Digite a descrição do produto"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={errors.description ? styles.inputError : ""}
                />
                {errors.description && (
                  <p className={styles.error}>{errors.description}</p>
                )}
              </div>
              <div className={styles.fileUploadContainer}>
                <label htmlFor="fileUpload" className={styles.fileUploadLabel}>
                  <span>Adicionar imagens</span>
                </label>
                <input
                  id="fileUpload"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
                {errors.files && <p className={styles.error}>{errors.files}</p>}
              </div>

              <div className={styles.previewContainer}>
                {previews.map((src, i) => (
                  <div key={i} className={styles.previewWrapper}>
                    <img src={src} alt="" className={styles.previewImage} />
                    <button
                      type="button"
                      onClick={() => {
                        setFiles((prev) =>
                          prev.filter((_, index) => index !== i)
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
          </>
        );

      case 2:
        return (
          <>
            <div className={styles.title}>
              <p>Etapa 2 de 3</p>
              <h2>Preencha as informações técnicas do produto</h2>
            </div>
            <div className={styles.content}>
              <div className={styles.sizeInputs}>
                <div className={styles.groupInputs}>
                  <label>Largura:</label>
                  <input
                    type="number"
                    placeholder="Largura (cm)"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className={errors.width ? styles.inputError : ""}
                  />
                  {errors.width && (
                    <p className={styles.error}>{errors.width}</p>
                  )}
                </div>
                <div className={styles.groupInputs}>
                  <label>Altura:</label>
                  <input
                    type="number"
                    placeholder="Altura (cm)"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className={errors.height ? styles.inputError : ""}
                  />
                  {errors.height && (
                    <p className={styles.error}>{errors.height}</p>
                  )}
                </div>
                <div className={styles.groupInputs}>
                  <label>Profundidade:</label>
                  <input
                    type="number"
                    placeholder="Profundidade (cm)"
                    value={depth}
                    onChange={(e) => setDepth(e.target.value)}
                    className={errors.depth ? styles.inputError : ""}
                  />
                  {errors.depth && (
                    <p className={styles.error}>{errors.depth}</p>
                  )}
                </div>
              </div>

              <div className={styles.group}>
                <label>Cores</label>
                <div className={styles.checkboxGroupContainer}>
                  {colorsArray.map((color) => (
                    <label key={color}>
                      <input
                        type="checkbox"
                        checked={colors.includes(color)}
                        onChange={() =>
                          handleCheckboxChange(color, colors, setColors)
                        }
                      />
                      {colorMap[color] || color}
                    </label>
                  ))}
                </div>
                {errors.colors && (
                  <p className={styles.error}>{errors.colors}</p>
                )}
              </div>

              <div className={styles.group}>
                <label>Materiais</label>
                <div className={styles.checkboxGroupContainer}>
                  {materialsArray.map((mat) => (
                    <label key={mat}>
                      <input
                        type="checkbox"
                        checked={materials.includes(mat)}
                        onChange={() =>
                          handleCheckboxChange(mat, materials, setMaterials)
                        }
                      />
                      {mat}
                    </label>
                  ))}
                </div>
                {errors.materials && (
                  <p className={styles.error}>{errors.materials}</p>
                )}
              </div>

              <div className={styles.group}>
                <label>Acabamentos</label>
                <div className={styles.checkboxGroupContainer}>
                  {finishingsArray.map((f) => (
                    <label key={f}>
                      <input
                        type="checkbox"
                        checked={finishings.includes(f)}
                        onChange={() =>
                          handleCheckboxChange(f, finishings, setFinishings)
                        }
                      />
                      {f}
                    </label>
                  ))}
                </div>
                {errors.finishings && (
                  <p className={styles.error}>{errors.finishings}</p>
                )}
              </div>

              <div className={styles.group}>
                <label>Categoria</label>
                <select
                  value={categories[0] || ""}
                  onChange={(e) => setCategories([e.target.value])}
                  className={errors.categories ? styles.inputError : ""}
                >
                  <option value="" disabled>
                    Selecione
                  </option>
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
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className={styles.title}>
              <p>Etapa 3 de 3</p>
              <h2>Preencha as informações de preço e entrega</h2>
            </div>
            <div className={styles.content}>
              <div className={styles.group}>
                <label>Preço:</label>
                <input
                  type="text"
                  placeholder="R$ 0,00"
                  value={price}
                  onChange={(e) => formatPrice(e.target.value)}
                  className={errors.price ? styles.inputError : ""}
                />

                {errors.price && <p className={styles.error}>{errors.price}</p>}
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!name) newErrors.name = "Digite o nome do produto";
      if (!description) newErrors.description = "Digite a descrição";
      if (files.length === 0) newErrors.files = "Selecione ao menos uma imagem";
    }

    if (step === 2) {
      if (!width) newErrors.width = "Informe a largura";
      if (!height) newErrors.height = "Informe a altura";
      if (!depth) newErrors.depth = "Informe a profundidade";
      if (colors.length === 0) newErrors.colors = "Selecione ao menos uma cor";
      if (materials.length === 0)
        newErrors.materials = "Selecione ao menos um material";
      if (finishings.length === 0)
        newErrors.finishings = "Selecione ao menos um acabamento";
      if (categories.length === 0)
        newErrors.categories = "Selecione uma categoria";
    }

    if (step === 3) {
      // remove tudo que não é número e divide por 100
      const numericPrice = Number(price.replace(/\D/g, "")) / 100;
      if (isNaN(numericPrice) || numericPrice <= 0) {
        newErrors.price = "Informe o preço";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // retorna true se não há erros
  };

  const formatPrice = (value) => {
    // remove tudo que não é número
    let numericValue = value.replace(/\D/g, "");

    // transforma em reais (divide por 100 para ter centavos)
    numericValue = (numericValue / 100).toFixed(2);

    // adiciona vírgula como separador de centavos
    numericValue = numericValue.replace(".", ",");

    // adiciona R$
    setPrice(`R$ ${numericValue}`);
  };

  const voltar = () => navigate("/fornecedor/produtos");

  return (
    <div className={styles.container}>
      <HeaderChildren titulo="Adicionar Produto" voltar={voltar} />
      <form onSubmit={handleSubmit} className={styles.form}>
        {renderStep()}

        <div className={styles.actions}>
          {step > 1 && (
            <button type="button" onClick={() => setStep(step - 1)}>
              <IoIosArrowBack />
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (validateStep()) {
                  setStep((prev) => prev + 1);
                  setTimeout(() => setErrors({}), 50); // 🔥 limpa erros depois que o step atualiza
                }
              }}
            >
              <IoIosArrowForward />
            </button>
          ) : (
            <button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default AdicionarProduto;
