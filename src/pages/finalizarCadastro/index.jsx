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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTelefoneChange = (e) => {
    let input = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número

    // Limita o número a no máximo 11 dígitos (DDD + número)
    if (input.length > 11) input = input.slice(0, 11);

    // Aplica a máscara (XX) X XXXX-XXXX
    if (input.length === 11) {
      input = input.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, "($1) $2 $3-$4");
    } else if (input.length === 10) {
      input = input.replace(/^(\d{2})(\d{1})(\d{4})(\d{3})$/, "($1) $2 $3-$4");
    } else if (input.length === 9) {
      input = input.replace(/^(\d{2})(\d{1})(\d{4})(\d{2})$/, "($1) $2 $3-$4");
    } else if (input.length === 8) {
      input = input.replace(/^(\d{2})(\d{1})(\d{4})(\d{1})$/, "($1) $2 $3-$4");
    } else if (input.length === 7) {
      input = input.replace(/^(\d{2})(\d{1})(\d{4})$/, "($1) $2 $3");
    } else if (input.length === 6) {
      input = input.replace(/^(\d{2})(\d{1})(\d{3})$/, "($1) $2 $3");
    } else if (input.length === 5) {
      input = input.replace(/^(\d{2})(\d{1})(\d{2})$/, "($1) $2 $3");
    } else if (input.length === 4) {
      input = input.replace(/^(\d{2})(\d{1})(\d{1})$/, "($1) $2 $3");
    } else {
      input = input.replace(/^(\d{2})(\d{1})$/, "($1) $2");
    }

    setFormData((prev) => ({ ...prev, telefone: input }));
  };

  function handleCpfCnpjChange(e) {
    let valor = e.target.value.replace(/\D/g, ""); // remove tudo que não for número

    // Limita para no máximo 14 dígitos (CNPJ)
    if (valor.length > 14) valor = valor.slice(0, 14);

    // Formata CPF
    if (valor.length <= 11) {
      valor = valor
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    // Formata CNPJ
    else {
      valor = valor
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }

    setFormData((prev) => ({
      ...prev,
      cpf_cnpj: valor,
    }));
  }

  const handleCepChange = (e) => {
    let cep = e.target.value.replace(/\D/g, "");
    if (cep.length > 8) cep = cep.slice(0, 8);
    setFormData((prev) => ({ ...prev, cep }));
    setCepValido(false);
    setErrorMessage(null);

    if (cep.length === 8) buscarCep(cep);
  };

  const buscarCep = async (cep) => {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (response.data.erro) {
        setErrorMessage("CEP não encontrado");
        setCepValido(false);
        return;
      }

      setCepValido(true);
      const endereco = response.data;
      setDadosEndereco(endereco);

      // Monta endereço completo sem campos vazios
      const enderecoCompleto = [
        endereco.logradouro,
        formData.numero,
        endereco.bairro,
        endereco.localidade,
        endereco.uf,
      ]
        .filter(Boolean)
        .join(", ");

      setFormData((prev) => ({
        ...prev,
        endereco: enderecoCompleto,
        latitude: "",
        longitude: "",
      }));

      // Busca coordenadas
      const coordsUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        enderecoCompleto
      )}&format=json&limit=1`;
      const coordsResponse = await axios.get(coordsUrl);
      if (coordsResponse.data.length > 0) {
        const { lat, lon } = coordsResponse.data[0];
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lon }));
      } else {
        console.warn("Não foi possível obter coordenadas para este endereço");
      }
    } catch (err) {
      console.error("Erro ao buscar CEP ou coordenadas:", err);
    }
  };

  const handleNumeroChange = (e) => {
    const numero = e.target.value.replace(/\D/g, "");
    const enderecoCompleto = [
      dadosEndereco.logradouro,
      numero,
      dadosEndereco.bairro,
      dadosEndereco.localidade,
      dadosEndereco.uf,
    ]
      .filter(Boolean)
      .join(", ");

    setFormData((prev) => ({
      ...prev,
      numero,
      endereco: enderecoCompleto,
    }));
  };

  const handleComplementoChange = (e) => {
    const comp = e.target.value;
    const enderecoCompleto = [
      dadosEndereco.logradouro,
      formData.numero,
      dadosEndereco.bairro,
      dadosEndereco.localidade,
      dadosEndereco.uf,
    ]
      .filter(Boolean)
      .join(", ");

    setFormData((prev) => ({
      ...prev,
      complemento: comp,
      endereco: comp ? `${enderecoCompleto} - ${comp}` : enderecoCompleto,
    }));
  };

  const handleVoltarEtapa = (etapa) => setCadastroEtapa(etapa);

  const handleSubmit = async (e, etapa) => {
    if (e) e.preventDefault();

    setError(""); // Limpa erro local
    setErrorMessage(null); // Limpa erro global do contexto

    // Validação por etapa
    if (cadastroEtapa === "pessoal") {
      if (!formData.telefone || (isFornecedor && !formData.cpf_cnpj)) {
        const msg = "Preencha todos os campos pessoais.";
        setError(msg); // Atualiza erro local para exibir na tela
        setErrorMessage(msg); // Também atualiza contexto se quiser
        return;
      }
      setCadastroEtapa("endereco");
      return;
    }

    if (cadastroEtapa === "endereco") {
      if (!formData.cep || !formData.numero) {
        const msg = "Preencha o CEP e o número.";
        setError(msg);
        setErrorMessage(msg);
        return;
      }
      if (!cepValido) {
        const msg = "CEP não encontrado.";
        setError(msg);
        setErrorMessage(msg);
        return;
      }
      setCadastroEtapa("senha");
      return;
    }

    if (cadastroEtapa === "senha") {
      if (!formData.password || !formData.confirmPassword) {
        const msg = "Preencha os dois campos de senha.";
        setError(msg);
        setErrorMessage(msg);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        const msg = "As senhas não coincidem.";
        setError(msg);
        setErrorMessage(msg);
        return;
      }
    }

    // Submissão final
    setLoading(true);
    try {
      const payload = {
        telefone: formData.telefone,
        endereco: formData.endereco,
        latitude: formData.latitude,
        longitude: formData.longitude,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };
      if (isFornecedor) payload.cpf_cnpj = formData.cpf_cnpj;

      console.log(payload);

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
      const msg = err.response?.data?.message || "Erro ao finalizar cadastro";
      setError(msg); // exibe erro embaixo
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Finalizar Cadastro</h2>
      <form
        className={styles.form}
        onSubmit={(e) => handleSubmit(e, cadastroEtapa)}
      >
        {cadastroEtapa === "pessoal" && (
          <>
            <h4>Informações Pessoais</h4>
            {isFornecedor && (
              <label>
                CPF/CNPJ
                <input
                  type="text"
                  value={formData.cpf_cnpj}
                  onChange={handleCpfCnpjChange}
                  required
                  placeholder="Digite seu CPF / CNPJ"
                />
              </label>
            )}
            <label>
              Telefone
              <input
                type="text"
                value={formData.telefone}
                onChange={handleTelefoneChange}
                required
                placeholder="Digite seu telefone"
              />
            </label>
            <div className={styles.buttonProx}>
              <button
                type="button"
                onClick={() => handleSubmit(null, "endereco")}
              >
                <IoIosArrowForward />
              </button>
            </div>
          </>
        )}

        {cadastroEtapa === "endereco" && (
          <>
            <h4>Endereço</h4>
            <label>
              CEP
              <input
                type="text"
                value={formData.cep}
                onChange={handleCepChange}
                required
                placeholder="Digite seu CEP"
              />
            </label>
            <label>
              Número
              <input
                type="text"
                value={formData.numero}
                onChange={handleNumeroChange}
                required
                placeholder="Digite o número do endereço"
              />
            </label>
            <label>
              Complemento (Opcional)
              <input
                type="text"
                value={formData.complemento}
                onChange={handleComplementoChange}
                placeholder="Digite o complemento do endereço"
              />
            </label>
            <div className={styles.buttonProx}>
              <button
                type="button"
                onClick={() => handleVoltarEtapa("pessoal")}
              >
                <IoIosArrowBack />
              </button>
              <button type="button" onClick={() => handleSubmit(null, "senha")}>
                <IoIosArrowForward />
              </button>
            </div>
          </>
        )}

        {cadastroEtapa === "senha" && (
          <>
            <h4>Crie uma senha</h4>
            <label>
              Senha
              <input
                type="password"
                value={formData.password}
                onChange={handleChange}
                name="password"
                required
                placeholder="Digite sua senha"
              />
            </label>
            <label>
              Confirmar Senha
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                name="confirmPassword"
                required
                placeholder="Confirme sua senha"
              />
            </label>
            <div className={styles.buttonProx}>
              <button
                type="button"
                onClick={() => handleVoltarEtapa("endereco")}
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
  );
}

export default FinalizarCadastro;
