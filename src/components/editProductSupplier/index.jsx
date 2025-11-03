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

  // 🟣 Novos estados para entrega
  const [deliveryTypes, setDeliveryTypes] = useState([]);
  const [deliveryFee, setDeliveryFee] = useState("R$ 0,00");

  // Quando o componente abre
  useEffect(() => {
    if (isEditOpen && selectedModel?.price != null) {
      const numericString = Math.round(
        Number(selectedModel.price) * 100
      ).toString();
      setSelectedModel((prev) => ({ ...prev, price: numericString }));
    }

    if (isEditOpen && selectedModel?.file_paths) {
      const existingImages = selectedModel.file_paths
        .split(",")
        .map((path) => path.trim().replace(/\\/g, "/"));
      setSelectedModel((prev) => ({ ...prev, existingImages }));
    }

    if (isEditOpen && selectedModel) {
      setDeliveryTypes(
        selectedModel.deliveryTypes
          ? selectedModel.deliveryTypes.split(",").map((t) => t.trim())
          : []
      );
      setDeliveryFee(
        selectedModel.deliveryFee
          ? `R$ ${Number(selectedModel.deliveryFee)
              .toFixed(2)
              .replace(".", ",")}`
          : "R$ 0,00"
      );
    }

    fetchInfo();
  }, [isEditOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      closeEditMenu();
      setIsClosing(false);
    }, 300);
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

  const formatPriceInput = (numericString) => {
    if (!numericString) return "R$ 0,00";
    const numberValue = Number(numericString) / 100;
    return `R$ ${numberValue.toFixed(2).replace(".", ",")}`;
  };

  // 🟣 Lida com checkboxes de entrega
  const handleDeliveryChange = (type) => {
    setDeliveryTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // 🟣 Formata taxa de entrega
  const formatDeliveryFee = (value) => {
    let numericValue = value.replace(/\D/g, "");
    numericValue = (numericValue / 100).toFixed(2);
    numericValue = numericValue.replace(".", ",");
    setDeliveryFee(`R$ ${numericValue}`);
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

      const colors = Array.isArray(selectedModel.colors)
        ? selectedModel.colors.join(",")
        : selectedModel.colors || "";
      const material = Array.isArray(selectedModel.material)
        ? selectedModel.material.join(",")
        : selectedModel.material || "";
      const finishing = Array.isArray(selectedModel.finishing)
        ? selectedModel.finishing.join(",")
        : selectedModel.finishing || "";

      if (
        (!selectedModel.existingImages ||
          selectedModel.existingImages.length === 0) &&
        newFiles.length === 0
      ) {
        alert("É necessário ter pelo menos uma imagem do produto.");
        setLoading(false);
        return;
      }

      const priceFloat = parseFloat(selectedModel.price) / 100;

      const formData = new FormData();
      formData.append("name", selectedModel.name);
      formData.append("description", selectedModel.description);
      formData.append("price", priceFloat);
      formData.append("size", JSON.stringify(size));
      formData.append("colors", colors);
      formData.append("material", material);
      formData.append("finishing", finishing);
      formData.append("category", selectedModel.category);
      formData.append("existingImages", selectedModel.existingImages.join(","));

      // 🟣 Entregas
      formData.append("deliveryTypes", deliveryTypes.join(","));
      const feeValue = deliveryTypes.includes("propria")
        ? Number(deliveryFee.replace(/\D/g, "")) / 100
        : 0;
      formData.append("deliveryFee", feeValue);

      newFiles.forEach((file) => formData.append("images", file));

      await axios.put(
        `${API_URL}model-supplier/update/${selectedModel.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

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
            {/* Nome */}
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

            {/* Descrição */}
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

            {/* Checkbox */}
            <div className={styles.checkboxGroup}>
              <label>Cores:</label>
              <div className={styles.checkboxGroupContainer}>
                {colorsArray.map((color) => (
                  <label key={color} className={styles.labelInput}>
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
                  <label key={m} className={styles.labelInput}>
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
                  <label key={f} className={styles.labelInput}>
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
                type="text"
                value={formatPriceInput(selectedModel.price)}
                onChange={(e) => {
                  const numericOnly = e.target.value.replace(/\D/g, "");
                  setSelectedModel({ ...selectedModel, price: numericOnly });
                }}
              />
            </div>

            {/* 🟣 Tipos de entrega */}
            <div className={styles.checkboxGroup}>
              <label>Formas de entrega:</label>
              <div className={styles.checkboxGroupContainer}>
                <label className={styles.labelInput}>
                  <input
                    type="checkbox"
                    checked={deliveryTypes.includes("retirada")}
                    onChange={() => handleDeliveryChange("retirada")}
                  />
                  Retirada
                </label>
                <label className={styles.labelInput}>
                  <input
                    type="checkbox"
                    checked={deliveryTypes.includes("propria")}
                    onChange={() => handleDeliveryChange("propria")}
                  />
                  Entrega própria
                </label>
                <label className={styles.labelInput}>
                  <input
                    type="checkbox"
                    checked={deliveryTypes.includes("correios")}
                    onChange={() => handleDeliveryChange("correios")}
                  />
                  Correios
                </label>
              </div>
              <span className={styles.helperText}>
                Retirada e entrega própria só podem ocorrer num raio de até 10
                km do endereço do fornecedor.
              </span>
            </div>

            {deliveryTypes.includes("propria") && (
              <div className={styles.group}>
                <label>Taxa de entrega:</label>
                <input
                  type="text"
                  placeholder="R$ 0,00"
                  value={deliveryFee}
                  onChange={(e) => formatDeliveryFee(e.target.value)}
                />
                <span className={styles.helperText}>
                  Esse valor será cobrado apenas nas entregas feitas por conta
                  própria.
                </span>
              </div>
            )}

            {/* Imagens */}
            <div className={styles.group}>
              <label>Imagens do produto</label>

              {/* Upload moderno */}
              {selectedModel.existingImages?.length + newFiles.length < 6 ? (
                <div className={styles.fileUploadContainer}>
                  <label
                    htmlFor="fileUpload"
                    className={styles.fileUploadLabel}
                  >
                    <span>Adicionar imagens</span>
                  </label>
                  <input
                    id="fileUpload"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />
                </div>
              ) : (
                <p className={styles.limitText}>
                  Limite máximo de 6 imagens atingido.
                </p>
              )}

              {/* Imagens existentes */}
              {selectedModel.existingImages?.length > 0 && (
                <div className={styles.previewContainer}>
                  {selectedModel.existingImages.map((path, index) => (
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
              )}

              {/* Novas imagens */}
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
