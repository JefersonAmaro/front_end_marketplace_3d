import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import styles from "./styles.module.css";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";

function FinalizarCadastro() {
  const { user, token, validateToken, setErrorMessage } =
    useContext(AuthContext);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const isFornecedor = user.role === "fornecedor";

  const [cadastroEtapa, setCadastroEtapa] = useState("pessoal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    telefone: "",
    cep: "",
    numero: "",
    complemento: "",
    password: "",
    confirmPassword: "",
    cpf_cnpj: "",
    endereco: "",
    latitude: "",
    longitude: "",
  });

  const [dadosEndereco, setDadosEndereco] = useState({});
  const [cepValido, setCepValido] = useState(false);

  // ---------------------------------------------
  // 🔧 MONTA O ENDEREÇO COMPLETO
  // ---------------------------------------------
  function montarEndereco(endereco, numero, complemento, cep) {
    if (!endereco?.logradouro) return "";

    const partes = [
      `${endereco.logradouro}${numero ? `, ${numero}` : ""}`,
      complemento ? ` - ${complemento}` : "",
      endereco.bairro,
      `${endereco.localidade} - ${endereco.uf}`,
      cep ? `CEP: ${cep}` : "",
    ];

    return partes.filter(Boolean).join(", ").replace(",  -", " -");
  }

  // ---------------------------------------------
  // 📌 Funções de máscara
  // ---------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleTelefoneChange = (e) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 11) input = input.slice(0, 11);

    if (input.length > 6) {
      input = input.replace(
        /^(\d{2})(\d{1})(\d{4})(\d{0,4})$/,
        "($1) $2 $3-$4"
      );
    } else if (input.length > 2) {
      input = input.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    }

    setFormData((p) => ({ ...p, telefone: input }));
  };

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

    setFormData((p) => ({ ...p, cpf_cnpj: valor }));
  };

  // ---------------------------------------------
  // 📌 CEP
  // ---------------------------------------------
  const handleCepChange = (e) => {
    let cep = e.target.value.replace(/\D/g, "");
    if (cep.length > 8) cep = cep.slice(0, 8);

    setCepValido(false);
    setErrorMessage(null);

    setFormData((p) => ({ ...p, cep }));
  };

  // 🔍 Detecta autofill do CEP e faz a busca automaticamente
  useEffect(() => {
    if (formData.cep.length === 8) buscarCep(formData.cep);
  }, [formData.cep]);

  const buscarCep = async (cep) => {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

      if (response.data.erro) {
        setCepValido(false);
        setErrorMessage("CEP não encontrado");
        return;
      }

      const endereco = response.data;

      setDadosEndereco(endereco);
      setCepValido(true);

      // Busca coordenadas com fallback
      const buscarCoordenadas = async (texto) => {
        const tentativas = [
          texto,
          texto.replace(/\d+/, ""),
          `${endereco.logradouro}, ${endereco.localidade}, ${endereco.uf}`,
        ];

        for (const t of tentativas) {
          const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            t
          )}&format=json&limit=1`;

          const res = await axios.get(url, {
            headers: { "User-Agent": "GNConnectSystem/1.0" },
          });

          if (res.data.length > 0) return res.data[0];
        }

        return null;
      };

      const coords = await buscarCoordenadas(
        `${endereco.logradouro}, ${endereco.localidade}, ${endereco.uf}`
      );

      if (coords) {
        setFormData((p) => ({
          ...p,
          latitude: coords.lat,
          longitude: coords.lon,
        }));
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Erro ao buscar CEP");
    }
  };

  // ---------------------------------------------
  // 🔄 Atualiza endereço ao mudar número / complemento (inclui autofill)
  // ---------------------------------------------
  useEffect(() => {
    if (dadosEndereco.logradouro) {
      const completo = montarEndereco(
        dadosEndereco,
        formData.numero,
        formData.complemento,
        formData.cep
      );

      setFormData((p) => ({ ...p, endereco: completo }));
    }
  }, [formData.numero, formData.complemento]);

  const handleNumeroChange = (e) => {
    const numero = e.target.value.replace(/\D/g, "");
    setFormData((p) => ({ ...p, numero }));
  };

  const handleComplementoChange = (e) => {
    setFormData((p) => ({ ...p, complemento: e.target.value }));
  };

  // ---------------------------------------------
  // 🔘 NAVEGAÇÃO ENTRE ETAPAS
  // ---------------------------------------------
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setErrorMessage(null);

    if (cadastroEtapa === "pessoal") {
      if (!formData.telefone || !formData.cpf_cnpj) {
        return setError("Preencha todos os campos.");
      }
      return setCadastroEtapa("endereco");
    }

    if (cadastroEtapa === "endereco") {
      if (!formData.cep || !cepValido)
        return setError("Informe um CEP válido.");

      if (!formData.numero) return setError("Informe o número.");

      return setCadastroEtapa("senha");
    }

    if (cadastroEtapa === "senha") {
      if (!formData.password || !formData.confirmPassword)
        return setError("Preencha as duas senhas.");

      if (formData.password !== formData.confirmPassword)
        return setError("As senhas não coincidem.");
    }

    const enderecoFinal = montarEndereco(
      dadosEndereco,
      formData.numero,
      formData.complemento,
      formData.cep
    );

    // ---------------------------------------------
    // 🔒 Envio final
    // ---------------------------------------------
    try {
      setLoading(true);

      const payload = {
        telefone: formData.telefone,
        cpf_cnpj: formData.cpf_cnpj,
        endereco: enderecoFinal,
        latitude: formData.latitude,
        longitude: formData.longitude,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      await axios.post(
        `${API_URL}register/${
          isFornecedor ? "update-supplier" : "update-user"
        }`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Cookies.set("needsAddress", false, { expires: 7 });
      await validateToken();

      navigate(user.role === "usuario" ? "/marketplace" : "/fornecedor", {
        replace: true,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao finalizar cadastro");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------
  // 🖥️ RENDERIZAÇÃO POR ETAPA
  // ---------------------------------------------
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2>Finalizar Cadastro</h2>

        <form
          autoComplete="off"
          className={styles.form}
          onSubmit={handleSubmit}
        >
          {/* ---------------------------------- ETAPA 1 */}
          {cadastroEtapa === "pessoal" && (
            <>
              <h4>Informações Pessoais</h4>

              <label>
                CPF/CNPJ
                <input
                  type="text"
                  value={formData.cpf_cnpj}
                  onChange={handleCpfCnpjChange}
                  autoComplete="off"
                  placeholder="000.000.000.00 / 00.000.000/0000-00"
                />
              </label>

              <label>
                Telefone
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={handleTelefoneChange}
                  autoComplete="off"
                  placeholder="(00) 00000-0000"
                />
              </label>

              <div className={styles.buttonProx}>
                <button type="button" onClick={handleSubmit}>
                  <IoIosArrowForward />
                </button>
              </div>
            </>
          )}

          {/* ---------------------------------- ETAPA 2 */}
          {cadastroEtapa === "endereco" && (
            <>
              <h4>Endereço</h4>

              <label>
                CEP
                <input
                  type="text"
                  value={formData.cep}
                  onChange={handleCepChange}
                  autoComplete="off"
                  placeholder="00000-000"
                />
              </label>

              <label>
                Número
                <input
                  type="text"
                  value={formData.numero}
                  onChange={handleNumeroChange}
                  autoComplete="off"
                  placeholder="000"
                />
              </label>

              <label>
                Complemento
                <input
                  type="text"
                  value={formData.complemento}
                  onChange={handleComplementoChange}
                  autoComplete="off"
                  placeholder="Casa / Apartamento"
                />
              </label>

              <div className={styles.buttonProx}>
                <button
                  type="button"
                  onClick={() => setCadastroEtapa("pessoal")}
                >
                  <IoIosArrowBack />
                </button>

                <button type="button" onClick={handleSubmit}>
                  <IoIosArrowForward />
                </button>
              </div>
            </>
          )}

          {/* ---------------------------------- ETAPA 3 */}
          {cadastroEtapa === "senha" && (
            <>
              <h4>Crie uma senha</h4>

              <label>
                Senha
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="off"
                  placeholder="Digite sua senha"
                />
              </label>

              <label>
                Confirmar senha
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="off"
                  placeholder="Confirme sua senha"
                />
              </label>

              <div className={styles.buttonProx}>
                <button
                  type="button"
                  onClick={() => setCadastroEtapa("endereco")}
                >
                  <IoIosArrowBack />
                </button>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Finalizando..." : "Finalizar Cadastro"}
              </button>
            </>
          )}

          {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default FinalizarCadastro;
