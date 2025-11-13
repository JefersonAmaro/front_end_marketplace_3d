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

  // 🔧 Função para montar o endereço completo
  function montarEndereco(endereco, numero, complemento, cep) {
    let enderecoCompleto = [
      endereco?.logradouro,
      numero,
      endereco?.bairro,
      endereco?.localidade,
      endereco?.uf,
    ]
      .filter(Boolean)
      .join(", ");

    if (complemento) enderecoCompleto += ` - ${complemento}`;
    if (cep) enderecoCompleto += `, CEP: ${cep}`;
    return enderecoCompleto;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTelefoneChange = (e) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 11) input = input.slice(0, 11);
    if (input.length > 6)
      input = input.replace(
        /^(\d{2})(\d{1})(\d{4})(\d{0,4})$/,
        "($1) $2 $3-$4"
      );
    else if (input.length > 2)
      input = input.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    setFormData((prev) => ({ ...prev, telefone: input }));
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
    setFormData((prev) => ({ ...prev, cpf_cnpj: valor }));
  };

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

      const endereco = response.data;
      setDadosEndereco(endereco);
      setCepValido(true);

      const enderecoCompleto = montarEndereco(
        endereco,
        formData.numero,
        formData.complemento,
        cep
      );

      setFormData((prev) => ({
        ...prev,
        endereco: enderecoCompleto,
        latitude: "",
        longitude: "",
      }));

      // Busca coordenadas com fallback
      const buscarCoordenadas = async (enderecoBase) => {
        const tentativas = [
          enderecoBase,
          enderecoBase.replace(/\d+/, ""),
          `${endereco.logradouro}, ${endereco.localidade}, ${endereco.uf}`,
        ];
        for (const tentativa of tentativas) {
          const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            tentativa
          )}&format=json&limit=1`;

          const resposta = await axios.get(url, {
            headers: {
              "User-Agent": "GNConnectSystem/1.0 (contato@gnconnect.com)",
            },
          });

          if (resposta.data.length > 0) return resposta.data[0];
        }
        return null;
      };

      const coordenadas = await buscarCoordenadas(enderecoCompleto);
      if (coordenadas) {
        setFormData((prev) => ({
          ...prev,
          latitude: coordenadas.lat,
          longitude: coordenadas.lon,
        }));
      }
    } catch (err) {
      console.error("Erro ao buscar CEP ou coordenadas:", err);
      setErrorMessage("Erro ao buscar CEP ou coordenadas");
    }
  };

  const handleNumeroChange = (e) => {
    const numero = e.target.value.replace(/\D/g, "");
    const enderecoCompleto = montarEndereco(
      dadosEndereco,
      numero,
      formData.complemento,
      formData.cep
    );
    setFormData((prev) => ({ ...prev, numero, endereco: enderecoCompleto }));
  };

  const handleComplementoChange = (e) => {
    const comp = e.target.value;
    const enderecoCompleto = montarEndereco(
      dadosEndereco,
      formData.numero,
      comp,
      formData.cep
    );
    setFormData((prev) => ({
      ...prev,
      complemento: comp,
      endereco: enderecoCompleto,
    }));
  };

  const handleVoltarEtapa = (etapa) => setCadastroEtapa(etapa);

  const handleSubmit = async (e, etapa) => {
    if (e) e.preventDefault();
    setError("");
    setErrorMessage(null);

    if (cadastroEtapa === "pessoal") {
      if (!formData.telefone || !formData.cpf_cnpj) {
        const msg = "Preencha todos os campos pessoais.";
        setError(msg);
        setErrorMessage(msg);
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

    // 🔒 Submissão final
    setLoading(true);
    try {
      const payload = {
        telefone: formData.telefone,
        cpf_cnpj: formData.cpf_cnpj,
        endereco: formData.endereco,
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
      const msg = err.response?.data?.message || "Erro ao finalizar cadastro";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2>Finalizar Cadastro</h2>
        <form
          className={styles.form}
          onSubmit={(e) => handleSubmit(e, cadastroEtapa)}
        >
          {cadastroEtapa === "pessoal" && (
            <>
              <h4>Informações Pessoais</h4>
              <label>
                CPF/CNPJ
                <input
                  type="text"
                  value={formData.cpf_cnpj}
                  onChange={handleCpfCnpjChange}
                  required
                  placeholder="Digite seu CPF/CNPJ"
                />
              </label>
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
                  placeholder="Digite o número"
                />
              </label>
              <label>
                Complemento (opcional)
                <input
                  type="text"
                  value={formData.complemento}
                  onChange={handleComplementoChange}
                  placeholder="Digite o complemento"
                />
              </label>
              <div className={styles.buttonProx}>
                <button
                  type="button"
                  onClick={() => handleVoltarEtapa("pessoal")}
                >
                  <IoIosArrowBack />
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(null, "senha")}
                >
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
    </div>
  );
}

export default FinalizarCadastro;
