import { useState, useEffect } from "react";
import { FaUser, FaPhoneAlt, FaHome } from "react-icons/fa";
import styles from "./styles.module.css";
import axios from "axios";

function MinhaConta() {
  const [activeForm, setActiveForm] = useState("pessoal");
  const [user, setUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  const [cepValido, setCepValido] = useState(false);
  const [loadingCoords, setLoadingCoords] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  // ==============================
  // Formatar usuário vindo do backend
  // ==============================
  const formatUser = (userData) => {
    if (!userData.endereco) return userData;

    const cepMatch = userData.endereco.match(/CEP:\s?(\d{5}-?\d{3})/);
    const cep = cepMatch ? cepMatch[1] : "";

    const enderecoLimpo = userData.endereco.replace(/,?\s?CEP:\s?\d{5}-?\d{3}/, "");
    const parts = enderecoLimpo.split(",");

    let rua = "";
    let numero = "";
    let complemento = "";
    let bairro = "";
    let cidade = "";
    let estado = "";

    // Extrai rua e número + complemento
    const primeiraParte = parts[0]?.trim() || "";
    const segundaParte = parts[1]?.trim() || "";

    if (segundaParte?.includes(" - ")) {
      [numero, complemento] = segundaParte.split(" - ").map((v) => v.trim());
    } else {
      numero = segundaParte || "";
    }

    rua = primeiraParte.replace(/\d+.*/, "").trim();
    bairro = parts[2]?.trim() || "";
    cidade = parts[3]?.trim() || "";

    const estadoMatch = userData.endereco.match(/,?\s([A-Z]{2}),\sCEP:/);
    estado = estadoMatch ? estadoMatch[1] : "";

    const formattedEndereco = `${rua}${numero ? `, ${numero}` : ""}${
      complemento ? ` - ${complemento}` : ""
    }${bairro ? `, ${bairro}` : ""}, ${cidade}, ${estado}, CEP: ${cep}`;

    return {
      ...userData,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep,
      endereco: formattedEndereco,
    };
  };

  // ==============================
  // Buscar usuário ao montar
  // ==============================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_URL}auth/user`);
        const formattedUser = formatUser(response.data);
        setUser(formattedUser);
        setOriginalUser(formattedUser);
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    };
    fetchUser();
  }, [API_URL]);

  // ==============================
  // Máscaras
  // ==============================
  const handleCpfCnpjChange = (e) => {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length > 14) valor = valor.slice(0, 14);

    if (valor.length <= 11) {
      valor = valor
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      valor = valor
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    setUser((prev) => ({ ...prev, cpf_cnpj: valor }));
  };

  const handleTelefoneChange = (e) => {
    let numeros = e.target.value.replace(/\D/g, "").slice(0, 11);
    let formatado = numeros;

    if (numeros.length > 2) formatado = `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length > 6) formatado = `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;

    setUser((prev) => ({ ...prev, telefone: formatado }));
  };

  const handleCepChange = (e) => {
    let cep = e.target.value.replace(/\D/g, "").slice(0, 8);
    setUser((prev) => ({ ...prev, cep }));
    setCepValido(cep.length === 8);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // ==============================
  // Buscar endereço via CEP
  // ==============================
  useEffect(() => {
    const fetchEndereco = async () => {
    if (cepValido && user?.cep) {
      setLoadingCoords(true);
      try {
        // 1️⃣ Busca endereço pelo CEP
        const cepRes = await axios.get(`https://viacep.com.br/ws/${user.cep}/json/`);
        if (cepRes.data.erro) {
          alert("CEP não encontrado.");
          setUser((prev) => ({ ...prev, cep: "" }));
          setLoadingCoords(false);
          return;
        }

        const { logradouro, bairro, localidade, uf } = cepRes.data;

        // Atualiza campos de endereço
        setUser((prev) => ({
          ...prev,
          rua: logradouro || "",
          bairro: bairro || "",
          cidade: localidade || "",
          estado: uf || "",
        }));

        // 2️⃣ Monta endereço completo
        const enderecoCompleto = `${logradouro}${user.numero ? `, ${user.numero}` : ""}${user.complemento ? ` - ${user.complemento}` : ""}${bairro ? `, ${bairro}` : ""}, ${localidade}, ${uf}`;

        // 3️⃣ Busca coordenadas via Nominatim
        const buscarCoordenadas = async (endereco) => {
          const tentativas = [
            endereco,
            endereco.replace(/\d+/, ""), // sem número
            `${logradouro}, ${localidade}, ${uf}`, // só rua + cidade + estado
          ];

          for (const tentativa of tentativas) {
            try {
              const resp = await axios.get(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                  tentativa
                )}&format=json&limit=1`,
                {
                  headers: {
                    "User-Agent": "GNConnectSystem/1.0 (contato@gnconnect.com)",
                  },
                }
              );
              if (resp.data.length > 0) return resp.data[0];
            } catch (err) {
              console.warn("Tentativa falhou para:", tentativa);
            }
          }
          return null;
        };

        const coordenadas = await buscarCoordenadas(enderecoCompleto);

        if (coordenadas) {
          setUser((prev) => ({
            ...prev,
            latitude: parseFloat(coordenadas.lat),
            longitude: parseFloat(coordenadas.lon),
          }));
        } else {
          setUser((prev) => ({ ...prev, latitude: null, longitude: null }));
        }
      } catch (err) {
        console.error("Erro ao buscar endereço ou coordenadas:", err);
      } finally {
        setLoadingCoords(false);
      }
    }
  };

    fetchEndereco();
  }, [cepValido, user?.cep, user?.numero, user?.complemento]);

  // ==============================
  // Salvar usuário
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loadingCoords) {
      alert("Aguarde a busca de coordenadas terminar antes de salvar.");
      return;
    }

    const updatedFields = { cpf_cnpj: user.cpf_cnpj };

    Object.keys(user).forEach((key) => {
      if (key !== "cpf_cnpj" && user[key] !== originalUser[key]) updatedFields[key] = user[key];
    });

    if (Object.keys(updatedFields).length === 0) {
      alert("Nenhuma alteração detectada.");
      return;
    }

    // Monta endereço final no formato correto
    if (["rua", "numero", "complemento", "bairro", "cidade", "estado", "cep"].some((k) => updatedFields[k] !== undefined)) {
      const { rua, numero, complemento, bairro, cidade, estado, cep } = user;
      updatedFields.endereco = `${rua}${numero ? `, ${numero}` : ""}${
        complemento ? ` - ${complemento}` : ""
      }${bairro ? `, ${bairro}` : ""}, ${cidade}, ${estado}, CEP: ${cep}`;
    }

    try {
      await axios.put(`${API_URL}auth/user`, updatedFields);
      alert("Dados atualizados com sucesso!");
      setOriginalUser((prev) => ({ ...prev, ...updatedFields }));
    } catch (err) {
      console.error("Erro ao salvar dados:", err.response?.data?.message || err.message);
      alert(`Erro ao salvar dados: ${err.response?.data?.message || err.message}`);
    }
  };

  // ==============================
  // Renderização dos formulários
  // ==============================
  const renderForm = () => {
    if (!user) return <p>Carregando...</p>;

    const saveDisabled = loadingCoords;

    const formPessoal = (
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.contentForm}>
          <div className={styles.formGroup}>
            <label>Nome completo</label>
            <input type="text" name="name" value={user.name || ""} onChange={handleChange} placeholder="Digite seu nome" required />
          </div>
          <div className={styles.formGroup}>
            <label>CPF/CNPJ</label>
            <input className={styles.disabled} type="text" disabled name="cpf_cnpj" value={user.cpf_cnpj || ""} placeholder="000.000.000-00 ou 00.000.000/0000-00" required />
          </div>
        </div>
        <button type="submit" disabled={saveDisabled} className={`${styles.saveBtn} ${saveDisabled ? styles.disabled : ""}`}>
          {loadingCoords ? "Buscando coordenadas..." : "Salvar"}
        </button>
      </form>
    );

    const formContato = (
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.contentForm}>
          <div className={styles.formGroup}>
            <label>E-mail</label>
            <input className={styles.disabled} type="email" disabled name="email" value={user.email || ""} placeholder="seuemail@exemplo.com" required />
          </div>
          <div className={styles.formGroup}>
            <label>Telefone</label>
            <input type="text" name="telefone" value={user.telefone || ""} onChange={handleTelefoneChange} placeholder="(00) 00000-0000" required />
          </div>
        </div>
        <button type="submit" disabled={saveDisabled} className={`${styles.saveBtn} ${saveDisabled ? styles.disabled : ""}`}>
          {loadingCoords ? "Buscando coordenadas..." : "Salvar"}
        </button>
      </form>
    );

    const formEndereco = (
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.contentForm}>
          <div className={styles.formGroup}>
            <label>CEP</label>
            <input type="text" name="cep" value={user.cep || ""} onChange={handleCepChange} placeholder="00000-000" required />
          </div>
          <div className={styles.formGroup}>
            <label>Endereço</label>
            <input className={styles.disabled} type="text" name="endereco" value={`${user.rua}${user.numero ? `, ${user.numero}` : ""}${user.complemento ? ` - ${user.complemento}` : ""}${user.bairro ? `, ${user.bairro}` : ""}, ${user.cidade}, ${user.estado}`} disabled placeholder="Rua, Número - Complemento, Bairro, Cidade, Estado" />
          </div>
          <div className={styles.formGroup}>
            <label>Número</label>
            <input type="text" name="numero" value={user.numero || ""} onChange={handleChange} placeholder="Número" required />
          </div>
          <div className={styles.formGroup}>
            <label>Complemento</label>
            <input type="text" name="complemento" value={user.complemento || ""} onChange={handleChange} placeholder="Apto, bloco, etc." />
          </div>
        </div>
        <button type="submit" disabled={saveDisabled} className={`${styles.saveBtn} ${saveDisabled ? styles.disabled : ""}`}>
          {loadingCoords ? "Buscando coordenadas..." : "Salvar"}
        </button>
      </form>
    );

    if (activeForm === "pessoal") return formPessoal;
    if (activeForm === "contato") return formContato;
    if (activeForm === "endereco") return formEndereco;

    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h4>Minha Conta</h4>
      </div>

      <div className={styles.cardsContainer}>
        <div className={`${styles.card} ${activeForm === "pessoal" ? styles.active : ""}`} onClick={() => setActiveForm("pessoal")}>
          <FaUser className={styles.icon} />
          <h4>Informações pessoais</h4>
          <p>Informações do seu documento de identidade.</p>
        </div>
        <div className={`${styles.card} ${activeForm === "contato" ? styles.active : ""}`} onClick={() => setActiveForm("contato")}>
          <FaPhoneAlt className={styles.icon} />
          <h4>Informações de contato</h4>
          <p>Informações de telefone e e-mail.</p>
        </div>
        <div className={`${styles.card} ${activeForm === "endereco" ? styles.active : ""}`} onClick={() => setActiveForm("endereco")}>
          <FaHome className={styles.icon} />
          <h4>Informações de endereço</h4>
          <p>Endereço residencial e comercial.</p>
        </div>
      </div>

      <div className={styles.formContainer}>{renderForm()}</div>
    </div>
  );
}

export default MinhaConta;
