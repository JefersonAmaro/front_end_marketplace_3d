import { useContext } from "react";
import { OrcamentosContext } from "../../../context/orcamentosContext";
import HeaderChildren from "../../../components/headerChildrenSupllier";
import styles from "./styles.module.css";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import * as THREE from "three";
import { useEffect, useState, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { Link } from "react-router-dom";

import BarraFiltrosOrcamentosSupplier from "../../../components/barraFiltrosOrcamentosSupplier";

const API_URL = import.meta.env.VITE_API_URL;

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

function FornecedorOrcamentos() {
  const {
    orcamentos,
    orcamentosEnviados,
    loading,
    calcularDistancia,
    latitude,
    longitude,
  } = useContext(OrcamentosContext);

  const [mostrarEnviados, setMostrarEnviados] = useState(false);

  const [filtros, setFiltros] = useState({
    nome: "",
    categoria: "",
    acabamento: "",
    ordenar: "data", // "data" ou "proximidade"
    direcaoData: "desc", // "asc" ou "desc"
    direcaoProx: "", // "asc" ou "desc"
  });

  if (loading) return <div className={styles.loading}>Carregando...</div>;

  function alternarOrdenacao(tipo) {
    setFiltros((prev) => {
      if (tipo === "data") {
        return {
          ...prev,
          ordenar: "data",
          direcaoData: prev.direcaoData === "asc" ? "desc" : "asc",
        };
      }

      if (tipo === "proximidade") {
        return {
          ...prev,
          ordenar: "proximidade",
          direcaoProx: prev.direcaoProx === "asc" ? "desc" : "asc",
        };
      }

      return prev;
    });
  }

  const listaBase = mostrarEnviados ? orcamentosEnviados : orcamentos;

  // Normalizar estrutura entre pendentes e enviados
  const listaNormalizada = listaBase.map((item) => {
    const model = item.custom_model ? item.custom_model : item;

    return {
      ...item,
      nome: model.name,
      categoria: model.category,
      descricao: model.description,
      acabamento: model.finishing,
      material: model.material,
      cores: model.colors,
      tamanho: model.size,
      user: model.user,
      file_paths: model.file_paths,
      createdAt: model.createdAt ?? item.createdAt,
    };
  });

  const listaComDistancia = listaNormalizada.map((item) => ({
    ...item,
    distancia: calcularDistancia(
      latitude,
      longitude,
      item.user?.latitude,
      item.user?.longitude
    ),
  }));

  let listaFiltrada = listaComDistancia.filter((o) => {
    const nomeOk = filtros.nome
      ? o.name.toLowerCase().includes(filtros.nome.toLowerCase())
      : true;

    const categoriaOk = filtros.categoria
      ? o.category === filtros.categoria
      : true;

    const acabamentoOk = filtros.acabamento
      ? o.finishing === filtros.acabamento
      : true;

    return nomeOk && categoriaOk && acabamentoOk;
  });

  // Ordenar por data
  if (filtros.ordenar === "data") {
    listaFiltrada.sort((a, b) => {
      const diff = new Date(a.createdAt) - new Date(b.createdAt);
      return filtros.direcaoData === "asc" ? diff : -diff;
    });
  }

  // Ordenar por proximidade
  if (filtros.ordenar === "proximidade") {
    listaFiltrada.sort((a, b) => {
      const diff = a.distancia - b.distancia;
      return filtros.direcaoProx === "asc" ? diff : -diff;
    });
  }

  return (
    <div className={styles.container}>
      <HeaderChildren
        titulo={
          mostrarEnviados ? "Orçamentos - Enviados" : "Orçamentos - Pendentes"
        }
        btn={mostrarEnviados ? "Ver Recebidos" : "Orçamentos Enviados"}
        onClickBtn={() => setMostrarEnviados(!mostrarEnviados)}
      />

      <BarraFiltrosOrcamentosSupplier
        filtros={filtros}
        setFiltros={setFiltros}
        alternarOrdenacao={alternarOrdenacao}
      />

      {listaFiltrada.length === 0 && (
        <div className={styles.infoContainer}>
          <p className={styles.infoMessage}>
            {mostrarEnviados
              ? "Você ainda não enviou nenhum orçamento."
              : "Nenhum orçamento encontrado."}
          </p>
        </div>
      )}

      <div className={styles.grid}>
        {listaFiltrada.map((item) => (
          <div
            key={item.id}
            className={`${styles.card} ${styles[item.status]}`}
          >
            <div className={styles.topRow}>
              <div>
                <h3 className={styles.cardTitle}>{item.nome}</h3>
                <span className={styles.categoryBadge}>{item.categoria}</span>
              </div>
              <span className={styles.statusPill}>{item.status}</span>
            </div>

            {/* PREVIEW STL */}
            {item.file_paths ? (
              <STLViewerURL url={`${API_URL}${item.file_paths}`} />
            ) : (
              <div className={styles.stlPlaceholder}>
                Nenhum arquivo enviado
              </div>
            )}

            {/* DESCRIÇÃO */}
            {item.descricao && (
              <p className={styles.description}>{item.descricao}</p>
            )}

            {/* INFO GRID */}
            <div className={styles.infoGrid}>
              <div>
                <strong>Material:</strong>
                <span>{item.material}</span>
              </div>

              <div>
                <strong>Acabamento:</strong>
                <span>{item.acabamento}</span>
              </div>

              <div>
                <strong>Cores:</strong>
                <span>
                  {(() => {
                    if (!item.cores) return "-";

                    let parsed;
                    try {
                      parsed = JSON.parse(item.cores);
                    } catch {
                      return item.cores; // fallback caso venha string comum
                    }

                    if (Array.isArray(parsed) && parsed.length > 0) {
                      return parsed.join(", ");
                    }

                    return "-";
                  })()}
                </span>
              </div>

              <div>
                <strong>Tamanho:</strong>
                <span>
                  {(() => {
                    if (!item.tamanho) return "-";

                    let tamanho;

                    try {
                      tamanho = JSON.parse(item.tamanho);
                    } catch {
                      return "-";
                    }

                    return `${tamanho.width} × ${tamanho.height} × ${tamanho.depth} cm`;
                  })()}
                </span>
              </div>

              <div>
                <strong>Criado em:</strong>
                <span>
                  {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>

              <div>
                {calcularDistancia && latitude && longitude ? (
                  <>
                    <strong>Distância até o cliente:</strong>
                    <span>
                      {calcularDistancia(
                        latitude,
                        longitude,
                        item.user?.latitude,
                        item.user?.longitude
                      ).toFixed(2)}{" "}
                      km
                    </span>
                  </>
                ) : null}
              </div>
            </div>

            <Link
              to={`/fornecedor/orcamentos/${item.id}`}
              className={styles.detailsButton}
            >
              Ver detalhes →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FornecedorOrcamentos;
