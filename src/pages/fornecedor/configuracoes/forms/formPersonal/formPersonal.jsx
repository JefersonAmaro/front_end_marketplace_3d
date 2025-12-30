import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function FormPersonal({ supplierData, setSupplierData  }) {
  const [formData, setFormData] = useState({
    name: "",
    cpf_cnpj: "",
    email: "",
    telefone: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    telefone: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supplierData) {
      setFormData({
        name: supplierData.name || "",
        cpf_cnpj: supplierData.cpf_cnpj || "",
        email: supplierData.email || "",
        telefone: supplierData.telefone || "",
      });
    }
  }, [supplierData]);

  // ==============================
  // Máscara + validação telefone
  // ==============================
  const handleTelefoneChange = (e) => {
    let value = e.target.value;
    let numeros = value.replace(/\D/g, "").slice(0, 11);

    if (numeros.length <= 2) {
      value = `(${numeros}`;
    } else if (numeros.length <= 7) {
      value = `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    } else {
      value = `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    }

    setFormData((prev) => ({ ...prev, telefone: value }));

    // Validação
    if (numeros.length < 11) {
      setErrors((prev) => ({
        ...prev,
        telefone: "O número deve ter 11 dígitos.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, telefone: "" }));
    }
  };

  // ==============================
  // Validação do nome
  // ==============================
  const handleNameChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({ ...prev, name: value }));

    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, name: "O nome é obrigatório." }));
    } else {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  // ==============================
  // Salvar alterações (PUT)
  // ==============================
  const handleSave = async () => {
    // Checagem final antes do envio
    let hasError = false;

    if (!formData.name.trim()) {
      setErrors((prev) => ({ ...prev, name: "O nome é obrigatório." }));
      hasError = true;
    }

    const numeros = formData.telefone.replace(/\D/g, "");
    if (numeros.length < 11) {
      setErrors((prev) => ({
        ...prev,
        telefone: "O número deve ter 11 dígitos.",
      }));
      hasError = true;
    }

    if (hasError) return;

    try {
      setLoading(true);

      const response = await axios.put(`${API_URL}auth/supplier`, {
        name: formData.name,
        telefone: formData.telefone,
        cpf_cnpj: formData.cpf_cnpj,
      });

      // Atualiza o estado do componente pai
      if (setSupplierData) {
        setSupplierData((prev) => ({
          ...prev,
          name: formData.name,
          telefone: formData.telefone,
        }));
      }
      
      alert("Informações atualizadas com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar informações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.title}>Editar Informações Pessoais</h3>

      {/* Nome */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Nome Completo</label>
        <input
          className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
          type="text"
          value={formData.name}
          onChange={handleNameChange}
          placeholder="Seu nome"
        />
        {errors.name && <p className={styles.errorText}>{errors.name}</p>}
      </div>

      {/* CPF */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>CPF / CNPJ</label>
        <input
          className={`${styles.input} ${styles.disabled}`}
          type="text"
          value={formData.cpf_cnpj}
          disabled
        />
      </div>

      {/* Email */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Email</label>
        <input
          className={`${styles.input} ${styles.disabled}`}
          type="email"
          value={formData.email}
          disabled
        />
      </div>

      {/* Telefone */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Telefone</label>
        <input
          className={`${styles.input} ${errors.telefone ? styles.inputError : ""}`}
          type="text"
          placeholder="(00) 00000-0000"
          value={formData.telefone}
          onChange={handleTelefoneChange}
        />
        {errors.telefone && (
          <p className={styles.errorText}>{errors.telefone}</p>
        )}
      </div>

      <div>
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}

export default FormPersonal;
