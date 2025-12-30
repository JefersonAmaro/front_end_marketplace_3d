import { useState, useContext, useMemo, useEffect } from "react";
import axios from "axios";
import styles from "./styles.module.css";
import { OrcamentosContext } from "../../../../context/orcamentosContext";

const API_URL = import.meta.env.VITE_API_URL;

// Peça exemplo fixa (didática)
const EXAMPLE_PIECE = {
  width: 10,
  height: 5,
  depth: 4,
};

/* =========================
   Helpers de moeda (R$)
========================= */
function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function parseCurrency(value) {
  const onlyNumbers = value.replace(/\D/g, "");
  return Number(onlyNumbers) / 100;
}

function PricingForm() {
  const { setPricing } = useContext(OrcamentosContext);

  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);

  useEffect(() => {
    async function fetchMaterials() {
      try {
        const response = await axios.get(`${API_URL}model-supplier/info`);
        setMaterials(response.data.material || []);
      } catch (err) {
        console.error("Erro ao buscar materiais do fornecedor", err);
      } finally {
        setMaterialsLoading(false);
      }
    }

    fetchMaterials();
  }, []);

  const [form, setForm] = useState({
    material: [],
    delivery_methods: [],
    price_per_cm3: 0.2,
    setup_fee: 2,
    minimum_price: 15,
    safety_factor: 1.2,
  });

  const [safetyInput, setSafetyInput] = useState(
    Math.round(1.2 * 100).toString()
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  /* =========================
     Handlers
  ========================= */
  function handleMaterialToggle(material) {
    setForm((prev) => ({
      ...prev,
      material: prev.material.includes(material)
        ? prev.material.filter((m) => m !== material)
        : [...prev.material, material],
    }));
  }

  function handleDeliveryToggle(method) {
    setForm((prev) => ({
      ...prev,
      delivery_methods: prev.delivery_methods.includes(method)
        ? prev.delivery_methods.filter((m) => m !== method)
        : [...prev.delivery_methods, method],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}supplier/pricing`,
        {
          ...form,
          material: JSON.stringify(form.material),
          delivery_methods: JSON.stringify(form.delivery_methods), // 👈 NOVO
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setPricing(response.data);
    } catch (err) {
      setError("Erro ao salvar configurações de pricing.");
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     Cálculos de impacto
  ========================= */
  const calculations = useMemo(() => {
    const volume =
      EXAMPLE_PIECE.width * EXAMPLE_PIECE.height * EXAMPLE_PIECE.depth;

    const baseVolumePrice = volume * form.price_per_cm3;
    const priceWithSetup = baseVolumePrice + form.setup_fee;
    const safetyIncrease = priceWithSetup * (form.safety_factor - 1);

    const finalPrice = Math.max(
      priceWithSetup + safetyIncrease,
      form.minimum_price
    );

    return {
      volume,
      baseVolumePrice,
      safetyIncrease,
      finalPrice,
      minimumApplied: finalPrice === form.minimum_price,
    };
  }, [form]);

  function validateForm() {
    const newErrors = {};

    if (!form.price_per_cm3 || form.price_per_cm3 <= 0) {
      newErrors.price_per_cm3 = "Informe um preço válido por cm³.";
    }

    if (!form.minimum_price || form.minimum_price < 0) {
      newErrors.minimum_price = "Informe um preço mínimo válido.";
    }

    if (!form.setup_fee || form.setup_fee < 0) {
      newErrors.setup_fee = "Informe uma taxa de setup válida.";
    }

    if (!form.safety_factor || form.safety_factor < 1) {
      newErrors.safety_factor = "O fator de segurança deve ser no mínimo 100%.";
    }

    if (!form.material || form.material.length === 0) {
      newErrors.material = "Selecione ao menos um material.";
    }

    if (!form.delivery_methods || form.delivery_methods.length === 0) {
      newErrors.delivery_methods = "Selecione ao menos uma forma de entrega.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Configuração de Preços</h2>

      {error && <p className={styles.error}>{error}</p>}

      {/* Preço por cm³ */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Preço por cm³</label>
        <input
          className={styles.input}
          type="text"
          inputMode="numeric"
          value={formatCurrency(form.price_per_cm3)}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              price_per_cm3: parseCurrency(e.target.value),
            }))
          }
          required
        />
        {errors.price_per_cm3 && (
          <small className={styles.error}>{errors.price_per_cm3}</small>
        )}
        <small className={styles.help}>
          Valor cobrado por centímetro cúbico de material impresso. Quanto
          maior, mais caro será qualquer peça.
        </small>
      </div>

      {/* Preço mínimo */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Preço mínimo</label>
        <input
          className={styles.input}
          type="text"
          inputMode="numeric"
          value={formatCurrency(form.minimum_price)}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              minimum_price: parseCurrency(e.target.value),
            }))
          }
        />
        {errors.minimum_price && (
          <small className={styles.error}>{errors.minimum_price}</small>
        )}
        <small className={styles.help}>
          Valor mínimo cobrado por impressão, mesmo para peças pequenas.
          {calculations.minimumApplied && (
            <>
              {" "}
              <strong>Este valor está sendo aplicado nesta simulação.</strong>
            </>
          )}
        </small>
      </div>

      {/* Taxa de setup */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Taxa de setup</label>
        <input
          className={styles.input}
          type="text"
          inputMode="numeric"
          value={formatCurrency(form.setup_fee)}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              setup_fee: parseCurrency(e.target.value),
            }))
          }
        />
        {errors.setup_fee && (
          <small className={styles.error}>{errors.setup_fee}</small>
        )}
        <small className={styles.help}>
          Taxa fixa para preparo da impressão (setup da máquina, ajustes e tempo
          inicial). Impacto direto:{" "}
          <strong>{formatCurrency(form.setup_fee)}</strong>
        </small>
      </div>

      {/* Safety factor */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Fator de segurança</label>

        <div className={styles.percentInput}>
          <input
            className={styles.input}
            type="text"
            inputMode="numeric"
            value={safetyInput}
            onChange={(e) => {
              // Permite digitação livre (somente números)
              const value = e.target.value.replace(/\D/g, "");
              setSafetyInput(value);

              setForm((prev) => ({
                ...prev,
                safety_factor: value ? Number(value) / 100 : 1,
              }));
            }}
            onBlur={() => {
              // Corrige apenas quando o usuário sai do campo
              let value = safetyInput;

              if (!value || Number(value) < 100) {
                value = "100";
              }

              setSafetyInput(value);

              setForm((prev) => ({
                ...prev,
                safety_factor: Number(value) / 100,
              }));
            }}
          />

          <span className={styles.percentSymbol}>%</span>
        </div>
        {errors.safety_factor && (
          <small className={styles.error}>{errors.safety_factor}</small>
        )}
        <small className={styles.help}>
          Margem adicional aplicada sobre o valor calculado, cobrindo riscos,
          falhas, retrabalho ou custos operacionais.
          <br />
          Acréscimo estimado:{" "}
          <strong>{formatCurrency(calculations.safetyIncrease)}</strong>
        </small>
      </div>

      {/* Materiais */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Materiais aceitos</label>

        {materialsLoading ? (
          <p className={styles.help}>Carregando materiais...</p>
        ) : (
          <div className={styles.checkboxGroup}>
            {materials.map((mat) => (
              <label key={mat} className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={form.material.includes(mat)}
                  onChange={() => handleMaterialToggle(mat)}
                />
                <span>{mat}</span>
              </label>
            ))}
          </div>
        )}
        {errors.material && (
          <small className={styles.error}>{errors.material}</small>
        )}
      </div>

      {/* Formas de entrega */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Formas de entrega</label>

        <div className={styles.checkboxGroup}>
          {["Retirada", "Entrega Própria", "Correios"].map((method) => (
            <label key={method} className={styles.checkbox}>
              <input
                type="checkbox"
                checked={form.delivery_methods.includes(method)}
                onChange={() => handleDeliveryToggle(method)}
              />
              <span>{method}</span>
            </label>
          ))}
        </div>
        {errors.delivery_methods && (
          <small className={styles.error}>{errors.delivery_methods}</small>
        )}
        <small className={styles.help}>
          Selecione as formas de entrega que você oferece para seus clientes.
        </small>
      </div>

      {/* Preview */}
      <div className={styles.previewBox}>
        <h3>Preço final estimado</h3>
        <strong className={styles.previewPrice}>
          {formatCurrency(calculations.finalPrice)}
        </strong>
        <small className={styles.help}>Peça exemplo: 10 × 5 × 4 cm</small>
      </div>

      <button className={styles.submitButton} type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Salvar configuração"}
      </button>
    </form>
  );
}

export default PricingForm;
