import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./styles.module.css";

function FormAddress({ supplierData, setSupplierData }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [baseAddress, setBaseAddress] = useState("");

  const [loadingCoords, setLoadingCoords] = useState(false);
  const [cepValido, setCepValido] = useState(false);

  const [originalData, setOriginalData] = useState(null);

  const [errors, setErrors] = useState({
    cep: "",
    numero: "",
  });

  const [formData, setFormData] = useState({
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    latitude: null,
    longitude: null,
  });

  // -------------------------------------------------------
  // MONTAR ENDEREÇO
  // -------------------------------------------------------
  const montarEndereco = (base, numero, complemento, cep) => {
    const complementoFmt = complemento ? ` - ${complemento}` : "";

    const partes = base.split(",");

    const logradouro = partes[0]?.trim() || "";
    const bairro = partes[1]?.trim() || "";
    const cidadeEstado = partes[2]?.trim() || "";

    return `${logradouro}, ${numero}${complementoFmt}, ${bairro}, ${cidadeEstado}, CEP: ${cep}`;
  };

  // -------------------------------------------------------
  // CARREGAR ENDEREÇO DO BANCO
  // -------------------------------------------------------
  useEffect(() => {
    if (supplierData) {
      const endereco = supplierData.endereco || "";

      const cepMatch = endereco.match(/CEP[:\s]*([0-9]{8})/);
      const cep = cepMatch ? cepMatch[1] : "";

      let semCep = endereco.replace(/,?\s*CEP[:\s]*[0-9]{8}/, "").trim();

      const numeroMatch = semCep.match(/,\s*(\d+)(?:\s*-\s*|,)/);
      const numero = numeroMatch ? numeroMatch[1] : "";

      const compMatch = semCep.match(/,\s*\d+\s*-\s*([^,]+)/);
      const complemento = compMatch ? compMatch[1].trim() : "";

      const logradouroMatch = semCep.match(/^(.*?),\s*\d+/);
      const logradouro = logradouroMatch ? logradouroMatch[1].trim() : "";

      const restoMatch = semCep.match(/,\s*\d+.*?,\s*(.*)$/);
      const resto = restoMatch ? restoMatch[1].trim() : "";

      const base = `${logradouro}, ${resto}`;
      setBaseAddress(base);

      const parsed = {
        cep,
        numero,
        complemento,
        latitude: supplierData.latitude || null,
        longitude: supplierData.longitude || null,
        endereco: montarEndereco(base, numero, complemento, cep),
      };

      setFormData(parsed);
      setOriginalData(parsed);
    }
  }, [supplierData]);

  // -------------------------------------------------------
  // ATUALIZA ENDEREÇO MONTADO
  // -------------------------------------------------------
  useEffect(() => {
    if (baseAddress) {
      setFormData((prev) => ({
        ...prev,
        endereco: montarEndereco(
          baseAddress,
          prev.numero,
          prev.complemento,
          prev.cep
        ),
      }));
    }
  }, [formData.numero, formData.complemento, baseAddress]);

  // -------------------------------------------------------
  // CEP CHANGE + VALIDAÇÃO
  // -------------------------------------------------------
  const handleCepChange = (value) => {
    const cepLimpo = value.replace(/\D/g, "").slice(0, 8);

    setFormData((prev) => ({
      ...prev,
      cep: cepLimpo,
    }));

    if (cepLimpo.length !== 8) {
      setErrors((prev) => ({ ...prev, cep: "CEP inválido" }));
      setCepValido(false);
    } else {
      setErrors((prev) => ({ ...prev, cep: "" }));
      setCepValido(true);
    }
  };

  // -------------------------------------------------------
  // VIA CEP + NOMINATIM
  // -------------------------------------------------------
  useEffect(() => {
    const fetchEnderecoCoords = async () => {
      if (!cepValido) return;

      setLoadingCoords(true);

      try {
        const cepRes = await axios.get(
          `https://viacep.com.br/ws/${formData.cep}/json/`
        );

        if (cepRes.data.erro) {
          setErrors((prev) => ({ ...prev, cep: "CEP não encontrado" }));
          return;
        }

        const { logradouro, bairro, localidade, uf } = cepRes.data;

        const novaBase = `${logradouro}, ${bairro}, ${localidade} - ${uf}`;
        setBaseAddress(novaBase);

        // atualizar endereço montado
        setFormData((prev) => ({
          ...prev,
          endereco: montarEndereco(
            novaBase,
            prev.numero,
            prev.complemento,
            prev.cep
          ),
        }));

        // Tentativas para buscar coordenadas
        const queries = [
          `${logradouro}, ${bairro}, ${localidade}, ${uf}`,
          `${logradouro}, ${localidade}, ${uf}`,
          `${bairro}, ${localidade}, ${uf}`,
          `${localidade}, ${uf}`,
        ];

        let coords = null;

        for (const q of queries) {
          const result = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              q
            )}&format=json&limit=1`,
            { headers: { "User-Agent": "GNConnectSystem/1.0" } }
          );

          if (result.data.length > 0) {
            coords = result.data[0];
            break;
          }
        }

        if (coords) {
          setFormData((prev) => ({
            ...prev,
            latitude: parseFloat(coords.lat),
            longitude: parseFloat(coords.lon),
          }));
        } else {
          setFormData((prev) => ({ ...prev, latitude: null, longitude: null }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setLoadingCoords(false);
      }
    };

    fetchEnderecoCoords();
  }, [cepValido, formData.cep]);

  // -------------------------------------------------------
  // CAMPOS ALTERADOS
  // -------------------------------------------------------
  const getChangedFields = () => {
    if (!originalData) return {};

    const changed = {};

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== originalData[key]) {
        changed[key] = formData[key];
      }
    });

    return changed;
  };

  // -------------------------------------------------------
  // SALVAR
  // -------------------------------------------------------
  const handleSave = async () => {
    if (errors.cep || errors.numero) {
      alert("Corrija os erros antes de salvar.");
      return;
    }

    const changed = getChangedFields();

    if (Object.keys(changed).length === 0) {
      return;
    }

    // Sempre enviar CPF
    changed.cpf_cnpj = supplierData.cpf_cnpj;

    try {
      await axios.put(`${API_URL}auth/supplier`, changed);
      alert("Endereço atualizado com sucesso!");

      // Atualiza o supplierData no componente pai
      if (setSupplierData) {
        setSupplierData((prev) => ({
          ...prev,
          ...changed,
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar endereço.");
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.title}>Editar Endereço</h3>

      {/* CEP */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>CEP</label>
        <input
          className={`${styles.input} ${errors.cep ? styles.inputError : ""}`}
          type="text"
          value={formData.cep}
          placeholder="00000-000"
          onChange={(e) => handleCepChange(e.target.value)}
        />
        {errors.cep && <p className={styles.errorText}>{errors.cep}</p>}
      </div>

      {/* Endereço montado */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Endereço</label>
        <input
          className={`${styles.input} ${styles.disabled}`}
          type="text"
          value={formData.endereco}
          disabled
        />
      </div>

      {/* Número */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Número</label>
        <input
          className={`${styles.input} ${
            errors.numero ? styles.inputError : ""
          }`}
          type="text"
          value={formData.numero}
          onChange={(e) => {
            const somenteNumeros = e.target.value.replace(/\D/g, "");

            setFormData({ ...formData, numero: somenteNumeros });

            if (!somenteNumeros.trim()) {
              setErrors((prev) => ({
                ...prev,
                numero: "Numero inválido",
              }));
            } else {
              setErrors((prev) => ({ ...prev, numero: "" }));
            }
          }}
        />
        {errors.numero && <p className={styles.errorText}>{errors.numero}</p>}
      </div>

      {/* Complemento */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Complemento</label>
        <input
          className={styles.input}
          type="text"
          value={formData.complemento}
          onChange={(e) =>
            setFormData({ ...formData, complemento: e.target.value })
          }
        />
      </div>

      <div>
        <button
          onClick={handleSave}
          className={`${styles.saveBtn} ${
            loadingCoords ? styles.btnDisabled : ""
          }`}
          disabled={loadingCoords}
        >
          {loadingCoords ? "Buscando coordenadas..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}

export default FormAddress;
