import { useEffect, useState, useContext } from "react";
import { OrcamentosUserContext } from "../../context/orcamentosUserContext";
import styles from "./styles.module.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import * as THREE from "three";
import { useRef } from "react";
import { useThree } from "@react-three/fiber";

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

/* ============================
   Função para normalizar files
============================= */
function normalizeFiles(value) {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  // Se vier como string JSON
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  // Se vier como string simples (um arquivo só)
  if (typeof value === "string") return [value];

  return [];
}

function Orcamentos() {
  const { orcamentos, orcamentosRecebidos } = useContext(OrcamentosUserContext);

  const [filtro, setFiltro] = useState("pendente");

  const API_URL = import.meta.env.VITE_API_URL;

  const contadores = {
    pendente: orcamentos.filter((o) => o.status === "pendente").length,
    recebido: orcamentosRecebidos.filter((o) => o.status === "enviado").length,
    aprovado: orcamentos.filter((o) => o.status === "aprovado").length,
    rejeitado: orcamentos.filter((o) => o.status === "rejeitado").length,
    concluido: orcamentos.filter((o) => o.status === "concluido").length,
  };

  const orcamentosFiltrados =
    filtro === "recebido"
      ? orcamentosRecebidos
      : orcamentos.filter((o) => o.status === filtro);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h4>Orçamentos Enviados</h4>

        <Link to="/novo-orcamento" className={styles.addButton}>
          + Novo Orçamento
        </Link>
      </div>

      {/* ---- TABS ---- */}
      <div className={styles.tabs}>
        {["pendente", "recebido", "aprovado", "rejeitado", "concluido"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFiltro(status)}
              className={`${styles.tab} ${
                filtro === status ? styles.active : ""
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}{" "}
              <span className={`${styles.count} ${styles[status]} ${ orcamentosRecebidos.length > 0 ? styles.show : ""}`}>
                {contadores[status]}
              </span>
            </button>
          )
        )}
      </div>

      {/* ---- LISTA ---- */}
      <div className={styles.list}>
        {orcamentosFiltrados.length === 0 ? (
          <p>Nenhum orçamento encontrado.</p>
        ) : (
          orcamentosFiltrados.map((item) => {
            const colors = item.colors ? JSON.parse(item.colors) : [];
            const size = item.size ? JSON.parse(item.size) : null;

            const files = normalizeFiles(item.file_paths);

            // Corrigir path do backend
            const fileUrl =
              files.length > 0
                ? `${API_URL}${files[0].replace(/\\/g, "/")}`
                : null;

            return (
              <div
                key={item.id}
                className={`${styles.card} ${styles[item.status]}`}
              >
                {/* HEADER */}
                <div className={styles.topRow}>
                  <div>
                    <h3 className={styles.cardTitle}>{item.name}</h3>
                    <span className={styles.categoryBadge}>
                      {item.category}
                    </span>
                  </div>
                  <span className={styles.statusPill}>
                    {item.status === "enviado" ? "Recebido" : item.status}
                  </span>
                </div>

                {/* PREVIEW STL */}
                <STLViewerURL url={fileUrl} />

                {/* DESCRIÇÃO */}
                {item.description && (
                  <p className={styles.description}>{item.description}</p>
                )}

                {/* INFO GRID */}
                <div className={styles.infoGrid}>
                  <div>
                    <strong>Material:</strong>
                    <span>{item.material}</span>
                  </div>

                  <div>
                    <strong>Acabamento:</strong>
                    <span>{item.finishing}</span>
                  </div>

                  <div>
                    <strong>Cores:</strong>
                    <span>{colors.length ? colors.join(", ") : "-"}</span>
                  </div>

                  <div>
                    <strong>Tamanho:</strong>
                    <span>
                      {size
                        ? `${size.width} × ${size.height} × ${size.depth} cm`
                        : "-"}
                    </span>
                  </div>

                  <div>
                    <strong>Criado em:</strong>
                    <span>
                      {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/orcamentos/${item.id}`}
                  className={styles.detailsButton}
                >
                  Ver detalhes →
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Orcamentos;
