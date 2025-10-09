import styles from "./styles.module.css";
import axios from "axios";
import { useEffect, useState } from "react";

function EditProductSupplier({
  isEditOpen,
  selectedModel,
  setSelectedModel,
  closeEditMenu,
  fetchModels,
  API_URL,
}) {
  const [colorsArray, setColorsArray] = useState([]);
  const [materialsArray, setMaterialsArray] = useState([]);
  const [finishingsArray, setFinishingsArray] = useState([]);
  const [categoriesArray, setCategoriesArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newFiles, setNewFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true); // dispara animação de saída
    setTimeout(() => {
      closeEditMenu(); // chama função para fechar de fato
      setIsClosing(false);
    }, 300); // tempo da animação
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
    Orange: "Laranja",
    Purple: "Roxo",
  };

  useEffect(() => {
    if (isEditOpen) {
      fetchInfo();
      // Cria array de imagens existentes
      if (selectedModel?.file_paths) {
        const existingImages = selectedModel.file_paths
          .split(",")
          .map((path) => path.trim().replace(/\\/g, "/"));
        setSelectedModel((prev) => ({ ...prev, existingImages }));
      }
    }
  }, [isEditOpen]);

  const fetchInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}model-supplier/info`);
      const data = response.data;
      setColorsArray(data.colors || []);
      setMaterialsArray(data.material || []);
      setFinishingsArray(data.finishing || []);
      setCategoriesArray(data.category || []);
    } catch (err) {
      console.error("Erro ao carregar informações fixas:", err);
    }
  };

  // ✅ Cria previews das novas imagens
  useEffect(() => {
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
    return () => newPreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [newFiles]);

  const handleCheckboxChange = (value, field) => {
    const current = Array.isArray(selectedModel[field])
      ? selectedModel[field]
      : selectedModel[field]?.split(",") || [];

    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    setSelectedModel({ ...selectedModel, [field]: updated });
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setNewFiles((prev) => [...prev, ...selected]);
  };

  const removeExistingImage = (index) => {
    const updated = selectedModel.existingImages.filter((_, i) => i !== index);
    setSelectedModel({ ...selectedModel, existingImages: updated });
  };

  const removeNewImage = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const size = {
        width: Number(selectedModel.size?.width),
        height: Number(selectedModel.size?.height),
        depth: Number(selectedModel.size?.depth),
      };

      // Converte arrays para string separada por vírgula
      const colors = Array.isArray(selectedModel.colors)
        ? selectedModel.colors.join(",")
        : selectedModel.colors || "";

      const material = Array.isArray(selectedModel.material)
        ? selectedModel.material.join(",")
        : selectedModel.material || "";

      const finishing = Array.isArray(selectedModel.finishing)
        ? selectedModel.finishing.join(",")
        : selectedModel.finishing || "";

      // 🔴 Verificação de imagens
      if (
        (!selectedModel.existingImages ||
          selectedModel.existingImages.length === 0) &&
        newFiles.length === 0
      ) {
        alert("É necessário ter pelo menos uma imagem do produto.");
        setLoading(false);
        return;
      }

      // Se tiver novas imagens, usamos multipart/form-data
      if (newFiles.length > 0) {
        const formData = new FormData();
        formData.append("name", selectedModel.name);
        formData.append("description", selectedModel.description);
        formData.append("price", selectedModel.price);
        formData.append("size", JSON.stringify(size));
        formData.append("colors", colors);
        formData.append("material", material);
        formData.append("finishing", finishing);
        formData.append("category", selectedModel.category);
        formData.append(
          "existingImages",
          selectedModel.existingImages.join(",")
        );

        newFiles.forEach((file) => formData.append("images", file));

        await axios.put(
          `${API_URL}model-supplier/update/${selectedModel.id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        // Sem novas imagens — atualização simples
        await axios.put(`${API_URL}model-supplier/update/${selectedModel.id}`, {
          name: selectedModel.name,
          description: selectedModel.description,
          price: selectedModel.price,
          size,
          colors,
          material,
          finishing,
          category: selectedModel.category,
          existingImages: selectedModel.existingImages.join(","),
        });
      }

      await fetchModels();
      handleClose();
    } catch (err) {
      console.error("Erro ao atualizar produto:", err);
    } finally {
      setLoading(false);
      setNewFiles([]);
    }
  };

  if (!isEditOpen || !selectedModel) return null;

  return (
    <div className={styles.editSidebarOverlay} onClick={handleClose}>
      <div
        className={`${styles.editSidebar} ${isClosing ? styles.exit : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.formContainer}>
          <h2>Editar Produto</h2>

          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Campos básicos */}
            <div className={styles.group}>
              <label>Nome do produto:</label>
              <input
                type="text"
                value={selectedModel.name || ""}
                onChange={(e) =>
                  setSelectedModel({ ...selectedModel, name: e.target.value })
                }
              />
            </div>

            <div className={styles.group}>
              <label>Descrição:</label>
              <textarea
                value={selectedModel.description || ""}
                onChange={(e) =>
                  setSelectedModel({
                    ...selectedModel,
                    description: e.target.value,
                  })
                }
              />
            </div>

            {/* Tamanhos */}
            <div className={styles.sizeInputs}>
              {["width", "height", "depth"].map((dim) => (
                <div className={styles.sizeContainer} key={dim}>
                  <label>
                    {dim === "width"
                      ? "Largura"
                      : dim === "height"
                      ? "Altura"
                      : "Profundidade"}
                    :
                  </label>
                  <input
                    type="number"
                    value={selectedModel.size?.[dim] || ""}
                    onChange={(e) =>
                      setSelectedModel({
                        ...selectedModel,
                        size: { ...selectedModel.size, [dim]: e.target.value },
                      })
                    }
                  />
                </div>
              ))}
            </div>

            {/* Checkbox grupos */}
            <div className={styles.checkboxGroup}>
              <label>Cores:</label>
              <div className={styles.checkboxGroupContainer}>
                {colorsArray.map((color) => (
                  <label key={color}>
                    <input
                      type="checkbox"
                      checked={
                        Array.isArray(selectedModel.colors)
                          ? selectedModel.colors.includes(color)
                          : selectedModel.colors?.split(",").includes(color)
                      }
                      onChange={() => handleCheckboxChange(color, "colors")}
                    />
                    {colorMap[color] || color}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.checkboxGroup}>
              <label>Materiais:</label>
              <div className={styles.checkboxGroupContainer}>
                {materialsArray.map((m) => (
                  <label key={m}>
                    <input
                      type="checkbox"
                      checked={
                        Array.isArray(selectedModel.material)
                          ? selectedModel.material.includes(m)
                          : selectedModel.material?.split(",").includes(m)
                      }
                      onChange={() => handleCheckboxChange(m, "material")}
                    />
                    {m}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.checkboxGroup}>
              <label>Acabamentos:</label>
              <div className={styles.checkboxGroupContainer}>
                {finishingsArray.map((f) => (
                  <label key={f}>
                    <input
                      type="checkbox"
                      checked={
                        Array.isArray(selectedModel.finishing)
                          ? selectedModel.finishing.includes(f)
                          : selectedModel.finishing?.split(",").includes(f)
                      }
                      onChange={() => handleCheckboxChange(f, "finishing")}
                    />
                    {f}
                  </label>
                ))}
              </div>
            </div>

            {/* Categoria */}
            <div className={styles.category}>
              <label>Categoria:</label>
              <select
                value={selectedModel.category || ""}
                onChange={(e) =>
                  setSelectedModel({
                    ...selectedModel,
                    category: e.target.value,
                  })
                }
              >
                <option value="">Selecione uma categoria</option>
                {categoriesArray.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Preço */}
            <div className={styles.group}>
              <label>Preço:</label>
              <input
                type="number"
                value={selectedModel.price || ""}
                onChange={(e) =>
                  setSelectedModel({ ...selectedModel, price: e.target.value })
                }
              />
            </div>

            {/* Imagens existentes */}
            <div className={styles.group}>
              <label>Imagens:</label>
              <div className={styles.previewContainer}>
                {selectedModel.existingImages?.map((path, index) => (
                  <div key={index} className={styles.previewWrapper}>
                    <img
                      src={`${API_URL}${path}`}
                      alt={`Imagem ${index}`}
                      className={styles.previewImage}
                    />
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => removeExistingImage(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Adicionar novas imagens */}
            <div className={styles.group}>
              {/* Só mostra o input se ainda não houver 6 imagens no total */}
              {selectedModel.existingImages?.length + newFiles.length < 6 ? (
                <input type="file" multiple onChange={handleFileChange} />
              ) : (
                <p className={styles.limitText}>
                  Limite máximo de 6 imagens atingido.
                </p>
              )}

              {previews.length > 0 && (
                <div className={styles.previewContainer}>
                  {previews.map((src, index) => (
                    <div key={index} className={styles.previewWrapper}>
                      <img
                        src={src}
                        alt={`Nova ${index}`}
                        className={styles.previewImage}
                      />
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeNewImage(index)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botões */}
            <div className={styles.actions}>
              <button type="button" onClick={handleClose}>
                Cancelar
              </button>
              <button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProductSupplier;
