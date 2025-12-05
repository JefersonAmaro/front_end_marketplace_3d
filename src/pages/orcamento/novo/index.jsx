import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

/* ----------------- STLViewer (preview apenas) ----------------- */
function STLViewer({ file }) {
  const [geometry, setGeometry] = useState(null);

  useEffect(() => {
    if (!file) {
      setGeometry(null);
      return;
    }

    let cancelled = false;
    const reader = new FileReader();

    reader.onload = () => {
      if (cancelled) return;
      try {
        const loader = new STLLoader();
        const geo = loader.parse(reader.result);

        geo.computeVertexNormals();
        geo.computeBoundingBox();

        // Centraliza o modelo no eixo (0,0,0)
        geo.center();

        setGeometry(geo);
      } catch (err) {
        console.error("Erro ao carregar STL:", err);
        setGeometry(null);
      }
    };

    reader.readAsArrayBuffer(file);

    return () => {
      cancelled = true;
    };
  }, [file]);

  if (!file)
    return (
      <div className={styles.stlPlaceholder}>Nenhum arquivo selecionado</div>
    );
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
    const distance = maxDim / Math.sin(fov / 2);

    camera.position.set(distance, distance, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [geometry, camera]);

  return null;
}

/* ----------------- NovoOrcamento (página completa) ----------------- */
export default function NovoOrcamento() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [hasFile, setHasFile] = useState(null); // null, "yes", "no"

  const [form, setForm] = useState({
    name: "",
    largura: "",
    altura: "",
    profundidade: "",
    colors: [],
    description: "",
    category: "",
    material: "",
    finishing: "",
  });

  const navigate = useNavigate();

  // API base (garante /)
  const API_URL =
    (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "") + "/";

  const [colorsArray, setColorsArray] = useState([]);
  const [materialsArray, setMaterialsArray] = useState([]);
  const [finishingsArray, setFinishingsArray] = useState([]);
  const [categoriesArray, setCategoriesArray] = useState([]);

  useEffect(() => {
    fetchInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInfo = async () => {
    try {
      const res = await axios.get(`${API_URL}model-supplier/info`);
      const data = res.data || {};
      setColorsArray(data.colors || []);
      setMaterialsArray(data.material || []);
      setFinishingsArray(data.finishing || []);
      setCategoriesArray(data.category || []);
    } catch (err) {
      console.error("Erro ao buscar infos:", err);
      // fallback vazios
      setColorsArray([]);
      setMaterialsArray([]);
      setFinishingsArray([]);
      setCategoriesArray([]);
    }
  };

  const toggleColor = (color) => {
    setForm((prev) => {
      const exists = prev.colors.includes(color);
      const updated = exists
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color];

      return { ...prev, colors: updated };
    });
  };

  const validateStep = (s = step) => {
    const newErrors = {};

    if (s === 1) {
      if (!form.name) newErrors.name = "Informe o nome do modelo.";
      if (!form.largura) newErrors.largura = "Informe a largura.";
      if (!form.altura) newErrors.altura = "Informe a altura.";
      if (!form.profundidade)
        newErrors.profundidade = "Informe a profundidade.";
      if (!form.description) newErrors.description = "Descreva o modelo.";
    }

    if (s === 2) {
      if (!form.category) newErrors.category = "Selecione uma categoria.";
      if (!form.material) newErrors.material = "Selecione um material.";
      if (!form.colors.length)
        newErrors.colors = "Selecione pelo menos uma cor.";
      if (!form.finishing) newErrors.finishing = "Selecione um acabamento.";
    }

    if (s === 3) {
      if (hasFile === "yes" && !file) {
        newErrors.file = "Envie um arquivo STL.";
      }
      if (hasFile === null) {
        newErrors.file = "Responda se possui o arquivo STL.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(4, s + 1));
  };

  const prevStep = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      return;
    }

    const formData = new FormData();

    // exemplo caso use largura/altura/profundidade
    form.size = JSON.stringify({
      width: form.largura ?? 0,
      height: form.altura ?? 0,
      depth: form.profundidade ?? 0,
    });

    // 🔥 Serializar corretamente
    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === "object" && value !== null) {
        // objetos como size também precisam de JSON
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value ?? "");
      }
    });

    // 🔥 Enviar o arquivo STL
    if (file) {
      formData.append("modelo3d", file);
    }

    try {
      const response = await axios.post(`${API_URL}budgets/custom`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });

      alert("Orçamento enviado com sucesso!");
      setUploadProgress(0);
      navigate("/orcamentos");
    } catch (err) {
      console.error("Erro no envio:", err);
      alert("Erro inesperado ao enviar.");
      setUploadProgress(0);
    }
  };

  const progressPct = Math.round(((step - 1) / 3) * 100);

  const stepLabel = (i, label) => (
    <div
      className={`${styles.stepItem} ${step === i ? styles.activeStep : ""}`}
    >
      <div className={styles.stepBullet}>{i}</div>
      <div className={styles.stepText}>{label}</div>
    </div>
  );

  // Mapeamento de rótulos para exibição em português na tela de revisão
  const reviewLabels = {
    name: "Nome",
    largura: "Largura (cm)",
    altura: "Altura (cm)",
    profundidade: "Profundidade (cm)",
    colors: "Cores",
    description: "Descrição",
    category: "Categoria",
    material: "Material",
    finishing: "Acabamento",
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h4>Solicitar Orçamento</h4>
        <p className={styles.headerSubtitle}>
          Preencha as informações por etapas
        </p>
      </header>

      <main className={styles.main}>
        <div className={styles.mainSidebar}>
          {/* SIDEBAR STEP */}
          <aside className={styles.sidebar}>
            <div className={styles.stepperCard}>
              <div className={styles.stepperTop}>
                <div className={styles.stepProgressBar}>
                  <div
                    className={styles.stepProgressFill}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className={styles.stepCount}>Etapa {step} de 4</div>
              </div>

              <nav className={styles.stepsList}>
                {stepLabel(1, "Informações")}
                {stepLabel(2, "Técnica")}
                {stepLabel(3, "Upload")}
                {stepLabel(4, "Revisão")}
              </nav>
            </div>
          </aside>

          <div className={styles.mainContent}>
            <p>
              Seu pedido será avaliado por nossos fornecedores, que entrarão em
              contato com você para fornecer orçamentos e prazos.
            </p>
          </div>
        </div>
        {/* CARD PRINCIPAL */}
        <section className={styles.cardWrapper}>
          <div className={styles.card}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  <h2 className={styles.cardTitle}>Informações do Modelo</h2>

                  <label className={styles.label}>
                    Nome do Modelo
                    <input
                      type="text"
                      placeholder="Ex: Suporte de celular"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                    {errors.name && (
                      <span className={styles.error}>{errors.name}</span>
                    )}
                  </label>

                  <div className={styles.sizeGrid}>
                    <label className={styles.labelSmall}>
                      Largura (cm)
                      <input
                        type="number"
                        placeholder="Ex: 12"
                        value={form.largura}
                        onChange={(e) =>
                          setForm({ ...form, largura: e.target.value })
                        }
                      />
                      {errors.largura && (
                        <span className={styles.error}>{errors.largura}</span>
                      )}
                    </label>

                    <label className={styles.labelSmall}>
                      Altura (cm)
                      <input
                        type="number"
                        placeholder="Ex: 8"
                        value={form.altura}
                        onChange={(e) =>
                          setForm({ ...form, altura: e.target.value })
                        }
                      />
                      {errors.altura && (
                        <span className={styles.error}>{errors.altura}</span>
                      )}
                    </label>

                    <label className={styles.labelSmall}>
                      Profundidade (cm)
                      <input
                        type="number"
                        placeholder="Ex: 5"
                        value={form.profundidade}
                        onChange={(e) =>
                          setForm({ ...form, profundidade: e.target.value })
                        }
                      />
                      {errors.profundidade && (
                        <span className={styles.error}>
                          {errors.profundidade}
                        </span>
                      )}
                    </label>
                  </div>

                  <label className={styles.label}>
                    Descrição
                    <textarea
                      placeholder="Descreva detalhes importantes do modelo..."
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                    {errors.description && (
                      <span className={styles.error}>{errors.description}</span>
                    )}
                  </label>

                  <div className={styles.actionsRow}>
                    <div />
                    <button
                      className={`${styles.btn} ${styles.btnPrimary}`}
                      onClick={nextStep}
                    >
                      Próximo
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  <h2 className={styles.cardTitle}>Escolha Técnica</h2>

                  <label className={styles.label}>
                    Categoria
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    >
                      <option value="">Selecione</option>
                      {categoriesArray.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <span className={styles.error}>{errors.category}</span>
                    )}
                  </label>

                  <label className={styles.label}>
                    Material
                    <select
                      value={form.material}
                      onChange={(e) =>
                        setForm({ ...form, material: e.target.value })
                      }
                    >
                      <option value="">Selecione</option>
                      {materialsArray.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    {errors.material && (
                      <span className={styles.error}>{errors.material}</span>
                    )}
                  </label>

                  <div className={styles.label}>
                    <span>Cores (múltiplas)</span>
                    <div className={styles.colorGrid}>
                      {colorsArray.length ? (
                        colorsArray.map((c) => (
                          <button
                            key={c}
                            type="button"
                            className={`${styles.colorBtn} ${
                              form.colors.includes(c)
                                ? styles.colorBtnActive
                                : ""
                            }`}
                            onClick={() => toggleColor(c)}
                          >
                            {c}
                          </button>
                        ))
                      ) : (
                        <p>Nenhuma cor disponível</p>
                      )}
                    </div>
                    {errors.colors && (
                      <span className={styles.error}>{errors.colors}</span>
                    )}
                    <small className={styles.helperText}>
                      Clique para selecionar uma ou várias cores
                    </small>
                  </div>

                  <label className={styles.label}>
                    Acabamento
                    <select
                      value={form.finishing}
                      onChange={(e) =>
                        setForm({ ...form, finishing: e.target.value })
                      }
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {finishingsArray.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                    {errors.finishing && (
                      <span className={styles.error}>{errors.finishing}</span>
                    )}
                  </label>

                  <div className={styles.actionsRow}>
                    <button
                      className={`${styles.btn} ${styles.btnGhost}`}
                      onClick={prevStep}
                    >
                      Voltar
                    </button>
                    <button
                      className={`${styles.btn} ${styles.btnPrimary}`}
                      onClick={nextStep}
                    >
                      Próximo
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="s3"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  <h2 className={styles.cardTitle}>Modelo 3D (STL)</h2>

                  {/* PERGUNTA SE POSSUI O ARQUIVO */}
                  <div className={styles.label}>
                    <span>Você possui o arquivo STL?</span>

                    <div className={styles.radioRow}>
                      <label>
                        <input
                          type="radio"
                          name="hasFile"
                          value="yes"
                          checked={hasFile === "yes"}
                          onChange={() => {
                            setHasFile("yes");
                            setFile(null);
                          }}
                        />
                        Sim
                      </label>

                      <label>
                        <input
                          type="radio"
                          name="hasFile"
                          value="no"
                          checked={hasFile === "no"}
                          onChange={() => {
                            setHasFile("no");
                            setFile(null);
                          }}
                        />
                        Não
                      </label>
                    </div>

                    {errors.file && (
                      <span className={styles.error}>{errors.file}</span>
                    )}
                  </div>

                  {/* INPUT SÓ APARECE SE A RESPOSTA FOR SIM */}
                  {hasFile === "yes" && (
                    <label className={styles.uploadButton}>
                      <span>Enviar arquivo STL</span>
                      <input
                        type="file"
                        accept=".stl"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  )}

                  {/* PRÉ-VISUALIZAÇÃO */}
                  {hasFile === "yes" && file && (
                    <div className={styles.previewCard}>
                      <div className={styles.previewInfo}>
                        <strong>{file.name}</strong>
                        <span className={styles.previewSmall}>
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <div className={styles.previewViewer}>
                        <STLViewer file={file} />
                      </div>
                    </div>
                  )}

                  <div className={styles.actionsRow}>
                    <button
                      className={`${styles.btn} ${styles.btnGhost}`}
                      onClick={prevStep}
                    >
                      Voltar
                    </button>
                    <button
                      className={`${styles.btn} ${styles.btnPrimary}`}
                      onClick={nextStep}
                    >
                      Próximo
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="s4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  <h2 className={styles.cardTitle}>Revisão</h2>

                  <div className={styles.reviewBox}>
                    {Object.entries(form).map(([k, v]) => (
                      <div key={k} className={styles.reviewRow}>
                        <div className={styles.reviewKey}>
                          {reviewLabels[k] ?? k}
                        </div>
                        <div className={styles.reviewValue}>
                          {Array.isArray(v) ? v.join(", ") : v || "—"}
                        </div>
                      </div>
                    ))}

                    <div className={styles.reviewRow}>
                      <div className={styles.reviewKey}>Arquivo</div>
                      <div className={styles.reviewValue}>
                        {file?.name || "—"}
                      </div>
                    </div>

                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className={styles.uploadBar}>
                        <div
                          className={styles.uploadFill}
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className={styles.actionsRow}>
                    <button
                      className={`${styles.btn} ${styles.btnGhost}`}
                      onClick={prevStep}
                    >
                      Voltar
                    </button>
                    <button
                      className={`${styles.btn} ${styles.btnSuccess}`}
                      onClick={handleSubmit}
                    >
                      Enviar Pedido
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}
