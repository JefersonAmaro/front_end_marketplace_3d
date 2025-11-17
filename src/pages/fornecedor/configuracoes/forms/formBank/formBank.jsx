import { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import styles from "./styles.module.css";

function FormBank({ supplierData, setSupplierData }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    banco: "",
    agencia: "",
    conta: "",
    digito_conta: "",
    tipo_conta: "",
    conta_formatada: "",
  });

  const [errors, setErrors] = useState({});
  const [bancos, setBancos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  // ==============================
  // Carregar lista de bancos
  // ==============================
  useEffect(() => {
    async function carregarBancos() {
      try {
        const res = await fetch("https://brasilapi.com.br/api/banks/v1");
        const data = await res.json();

        const bancosValidos = data
          .filter((banco) => banco.code !== null)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((banco) => ({
            value: String(banco.code), // converter para string garante consistência
            label: `${banco.code} - ${banco.name}`,
          }));

        setBancos(bancosValidos);
      } catch (error) {
        console.error("Erro ao buscar bancos:", error);
      }
    }

    carregarBancos();
  }, []);

  // ==============================
  // Preencher dados existentes
  // ==============================
  useEffect(() => {
    if (
      supplierData?.banco &&
      supplierData?.agencia &&
      supplierData?.conta &&
      supplierData?.tipo_conta
    ) {
      const conta_formatada =
        supplierData.conta +
        (supplierData.digito_conta ? "-" + supplierData.digito_conta : "");

      const parsed = {
        banco: String(supplierData.banco), // converter para string
        agencia: supplierData.agencia,
        conta: supplierData.conta,
        digito_conta: supplierData.digito_conta || "",
        tipo_conta: supplierData.tipo_conta,
        conta_formatada,
      };

      setFormData(parsed);
      setOriginalData(parsed);
      setMostrarFormulario(true);
    }
  }, [supplierData]);

  const naoTemBanco =
    !supplierData?.banco ||
    !supplierData?.agencia ||
    !supplierData?.conta ||
    !supplierData?.tipo_conta;

  // ==============================
  // Conta + Dígito
  // ==============================
  const handleContaChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (!value) {
      setFormData((prev) => ({
        ...prev,
        conta: "",
        digito_conta: "",
        conta_formatada: "",
      }));
      return;
    }

    let numero = value.slice(0, -1);
    let digito = value.slice(-1);

    if (value.length === 1) {
      numero = value;
      digito = "";
    }

    let conta_formatada = numero + (digito ? "-" + digito : "");

    setFormData((prev) => ({
      ...prev,
      conta: numero,
      digito_conta: digito,
      conta_formatada,
    }));
  };

  // ==============================
  // Verificar campos alterados
  // ==============================
  const getChangedFields = () => {
    if (!originalData) {
      const { conta_formatada, ...rest } = formData;
      return rest;
    }

    const changed = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== originalData[key]) {
        changed[key] = formData[key];
      }
    });

    return changed;
  };

  // ==============================
  // Enviar formulário
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});

    const newErrors = {};
    if (!formData.banco) newErrors.banco = "Selecione um banco";
    if (!formData.agencia) newErrors.agencia = "Digite a agência";
    if (!formData.conta) newErrors.conta = "Digite a conta";
    if (!formData.tipo_conta)
      newErrors.tipo_conta = "Selecione o tipo de conta";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const changed = getChangedFields();
    if (Object.keys(changed).length === 0 && originalData) return;

    changed.cpf_cnpj = supplierData.cpf_cnpj;

    try {
      await axios.put(`${API_URL}auth/supplier`, changed);
      alert("Dados bancários atualizados com sucesso!");
      setOriginalData({ ...originalData, ...changed });
      setMostrarFormulario(true);

      // Atualiza o supplierData no componente pai
      if (setSupplierData) {
        setSupplierData((prev) => ({ ...prev, ...changed }));
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar dados bancários.");
    }
  };

  return (
    <div className={styles.container}>
      {naoTemBanco && !mostrarFormulario ? (
        <div className={styles.naoTemBanco}>
          <p>Nenhuma conta bancária cadastrada.</p>
          <button onClick={() => setMostrarFormulario(true)}>
            Cadastrar Conta Bancária
          </button>
        </div>
      ) : (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
          <h3 className={styles.title}>
            {naoTemBanco ? "Cadastrar Conta Bancária" : "Editar Conta Bancária"}
          </h3>

          {/* Banco */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Banco</label>
            <Select
              className={styles.selectSearch}
              classNamePrefix="react-select"
              options={bancos}
              placeholder="Buscar banco..."
              value={
                bancos.find(
                  (b) => String(b.value) === String(formData.banco)
                ) || null
              }
              onChange={(option) =>
                setFormData({ ...formData, banco: option.value })
              }
            />
            {errors.banco && (
              <span className={styles.errorText}>{errors.banco}</span>
            )}
          </div>

          {/* Agência */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Agência</label>
            <input
              className={styles.input}
              type="text"
              value={formData.agencia}
              placeholder="Somente números"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  agencia: e.target.value.replace(/\D/g, ""),
                })
              }
            />
            {errors.agencia && (
              <span className={styles.errorText}>{errors.agencia}</span>
            )}
          </div>

          {/* Conta + Dígito */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Conta</label>
            <input
              className={styles.input}
              type="text"
              placeholder="12345-6"
              value={formData.conta_formatada}
              onChange={handleContaChange}
            />
            {errors.conta && (
              <span className={styles.errorText}>{errors.conta}</span>
            )}
          </div>

          {/* Tipo de Conta */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Tipo de Conta</label>
            <select
              className={styles.input}
              value={formData.tipo_conta}
              onChange={(e) =>
                setFormData({ ...formData, tipo_conta: e.target.value })
              }
            >
              <option value="" disabled>
                Selecione...
              </option>
              <option value="conta_corrente">Conta Corrente</option>
              <option value="conta_poupanca">Conta Poupança</option>
            </select>
            {errors.tipo_conta && (
              <span className={styles.errorText}>{errors.tipo_conta}</span>
            )}
          </div>

          <div>
            <button className={styles.saveBtn} type="submit">
              Salvar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default FormBank;
