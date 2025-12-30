import styles from "./styles.module.css";
import { useContext, useState, useEffect, useRef } from "react";
import { OrcamentosContext } from "../../../../context/orcamentosContext";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

import HeaderChildren from "../../../../components/headerChildrenSupllier";

/* ============================
   STLViewer para arquivo remoto
============================= */
function STLViewerURL({ url }) {
  const [geometry, setGeometry] = useState(null);

  useEffect(() => {
    if (!url) {
      setGeometry(null);
      return;
    }

    let cancelled = false;

    async function loadRemoteSTL() {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();

        const loader = new STLLoader();
        const geo = loader.parse(arrayBuffer);

        geo.computeVertexNormals();
        geo.computeBoundingBox();
        geo.center();

        if (!cancelled) setGeometry(geo);
      } catch (err) {
        console.error("Erro ao carregar STL remoto:", err);
        setGeometry(null);
      }
    }

    loadRemoteSTL();

    return () => (cancelled = true);
  }, [url]);

  if (!url)
    return <div className={styles.stlPlaceholder}>Nenhum arquivo enviado</div>;
  if (!geometry)
    return (
      <div className={styles.stlPlaceholder}>
        Carregando pré-visualização...
      </div>
    );

  return (
    <div className={styles.stlCanvas}>
      <Canvas camera={{ position: [0, 0, 150], fov: 45 }}>
        <ambientLight intensity={1.0} />
        <directionalLight position={[10, 10, 10]} intensity={1} />

        <OrbitControls enablePan={false} />

        <AutoFit geometry={geometry} />

        <mesh geometry={geometry}>
          <meshStandardMaterial
            color="#3b82f6"
            metalness={0.25}
            roughness={0.4}
          />
        </mesh>
      </Canvas>
    </div>
  );
}

/* ----------------- AutoFit (centraliza e ajusta zoom) ----------------- */
function AutoFit({ geometry }) {
  const ref = useRef();
  const { camera } = useThree();

  useEffect(() => {
    if (!geometry) return;

    const box = geometry.boundingBox;
    const size = new THREE.Vector3();
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);

    // Ajustar câmera para caber tudo
    const fov = camera.fov * (Math.PI / 180);
    const distance = (maxDim / Math.sin(fov / 2)) * 0.45;

    camera.position.set(distance, distance, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [geometry, camera]);

  return null;
}

function FornecedorDetalheOrcamento() {
  const { id } = useParams();
  const {
    orcamentos,
    orcamentosEnviados,
    calcularDistancia,
    latitude,
    longitude,
  } = useContext(OrcamentosContext);

  const [price, setPrice] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const item =
    orcamentos.find((o) => o.id === id) ||
    orcamentosEnviados.find((o) => o.id === id);

  const isEnviado =
    item?.status === "enviado" || !!orcamentosEnviados.find((o) => o.id === id);

  if (!item) {
    return <div className={styles.notFound}>Orçamento não encontrado.</div>;
  }

  const distancia = calcularDistancia(
    latitude,
    longitude,
    item.user?.latitude,
    item.user?.longitude
  );

  async function enviarProposta(e) {
    e.preventDefault();
    setFeedback("");
    setError("");

    if (!price || !deadline) {
      setError("Preencha preço e prazo antes de enviar.");
      return;
    }

    try {
      setLoading(true);

      const body = {
        price: currencyToNumber(price),
        prazo_entrega: Number(deadline),
      };

      const response = await axios.post(
        `${API_URL}custom-request/accept/${item.id}`,
        body
      );

      setPrice("");
      setDeadline("");
      setError("");
      setFeedback("");
      alert("Proposta enviada com sucesso!");
      navigate("/fornecedor/orcamentos");
    } catch (err) {
      console.error(err);
      setFeedback("Erro ao enviar proposta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Função para mostrar tamanho parseado
  function renderSize( item ) {
    try {
      const s = JSON.parse(item.size);
      return `${s.width} × ${s.height} × ${s.depth} cm`;
    } catch {
      return "-";
    }
  }

  function formatCurrency(value) {
    // remove tudo que não for número
    const onlyNumbers = value.replace(/\D/g, "");

    // transforma em centavos
    const numericValue = (Number(onlyNumbers) / 100).toFixed(2);

    // formata moeda brasileira
    return numericValue.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, "."); // adiciona pontos como milhar
  }

  function currencyToNumber(value) {
    if (!value) return 0;

    return Number(value.replace(/\./g, "").replace(",", "."));
  }

  if (isEnviado) {
    return (
      <div className={styles.container}>
        <HeaderChildren
          titulo="Detalhes da Proposta Enviada"
          voltar={() => navigate("/fornecedor/orcamentos")}
        />

        <div className={styles.userBox}>
          <p className={styles.title}>Informações do Cliente</p>

          <p>
            <strong>Nome:</strong>{" "}
            {item.custom_model?.user?.name || "Não informado"}
          </p>

          <p>
            <strong>Distância até o cliente:</strong>{" "}
            {item.custom_model?.user
              ? calcularDistancia(
                  latitude,
                  longitude,
                  item.custom_model.user.latitude,
                  item.custom_model.user.longitude
                ).toFixed(2) + " km"
              : "N/D"}
          </p>
        </div>

        <div className={styles.cardContainer}>
          {/* Info do modelo */}
          <div className={styles.card}>
            <h4 className={styles.title}>Modelo solicitado</h4>

            <p>
              <strong>Modelo:</strong> {item.custom_model?.name}
            </p>
            <p>
              <strong>Material:</strong> {item.custom_model?.material}
            </p>
            <p>
              <strong>Acabamento:</strong> {item.custom_model?.finishing}
            </p>
            <p>
              <strong>Cor:</strong>
              {item.custom_model?.colors
                ? JSON.parse(item.custom_model.colors).join(", ")
                : "-"}
            </p>
            <p>
              <strong>Tamanho:</strong> {renderSize(item.custom_model)}
            </p>

            <p>
              <strong>Descrição:</strong>
              <br />
              {item.custom_model?.description}
            </p>
          </div>

          {/* STL */}
          <div className={styles.stlPreview}>
            {item.custom_model?.file_paths ? (
              <>
                <STLViewerURL
                  url={`${API_URL}${item.custom_model.file_paths}`}
                />
                <a
                  className={styles.downloadButton}
                  href={`${API_URL}${item.custom_model.file_paths}`}
                  download
                >
                  Baixar arquivo
                </a>
              </>
            ) : (
              <div className={styles.stlPlaceholder}>
                Nenhum arquivo enviado
              </div>
            )}
          </div>
        </div>

        {/* Box da proposta já enviada */}
        <HeaderChildren titulo="Proposta Enviada" />
        <div className={styles.proposalBox}>
          <p>
            <strong>Preço ofertado:</strong> R$ {item.price.toFixed(2)}
          </p>
          <p>
            <strong>Prazo de entrega:</strong> {item.prazo_entrega} dias úteis
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={styles.statusPill}>{item.status}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <HeaderChildren
        titulo="Detalhes do Orçamento"
        voltar={() => navigate("/fornecedor/orcamentos")}
      />

      <div className={styles.userBox}>
        <p className={styles.title}>Informações do Cliente</p>

        <p>
          <strong>Nome:</strong> {item.user?.name || "Não informado"}
        </p>

        <p>
          <strong>Distância até o cliente:</strong>{" "}
          {distancia !== null ? `${distancia.toFixed(2)} km` : "N/D"}
        </p>
      </div>

      <div className={styles.cardContainer}>
        <div className={styles.card}>
          <h4 className={styles.title}>Informações do modelo</h4>
          <p>
            <strong>Modelo:</strong> {item.name}
          </p>
          <p>
            <strong>Material:</strong> {item.material}
          </p>
          <p>
            <strong>Acabamento:</strong> {item.finishing}
          </p>
          <p>
            <strong>Cor:</strong>{" "}
            {item.colors ? JSON.parse(item.colors).join(", ") : "-"}
          </p>
          <p>
            <strong>Tamanho:</strong> {renderSize( item )}
          </p>

          <p>
            <strong>Descrição:</strong>
            <br />
            {item.description}
          </p>
        </div>

        <div className={styles.stlPreview}>
          {/* PREVIEW STL */}
          {item.file_paths ? (
            <>
              <STLViewerURL url={`${API_URL}${item.file_paths}`} />
              <a
                className={styles.downloadButton}
                href={`${API_URL}${item.file_paths}`}
                download
              >
                Baixar arquivo
              </a>
            </>
          ) : (
            <div className={styles.stlPlaceholder}>Nenhum arquivo enviado</div>
          )}
        </div>
      </div>

      <HeaderChildren titulo="Enviar Proposta" />

      <form className={styles.form}>
        <div className={styles.formGroup}>
          <label>
            Preço (R$):
            <input
              type="text"
              value={price}
              onChange={(e) => {
                const formatted = formatCurrency(e.target.value);
                setPrice(formatted);
              }}
              placeholder="R$ 00,00"
            />
          </label>

          <label>
            Prazo de entrega (dias úteis):
            <input
              type="number"
              min="1"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="Ex: 3"
            />
          </label>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <button
          onClick={(e) => enviarProposta(e)}
          disabled={loading}
          className={styles.button}
        >
          {loading ? "Enviando..." : "Enviar proposta"}
        </button>

        {feedback && <div className={styles.feedback}>{feedback}</div>}
      </form>
    </div>
  );
}

export default FornecedorDetalheOrcamento;
