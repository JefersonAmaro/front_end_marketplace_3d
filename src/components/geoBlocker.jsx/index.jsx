import { FiMapPin } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

export function GeoBlocker({ onRetry, permissionDenied, onSkip }) {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Logo/Brand - Clickable */}
        <div className={styles.header}>
          <h1
            onClick={() => navigate("/marketplace")}
            className={styles.title}
          >
            Market3D
          </h1>
        </div>

        {/* Icon with Spinner */}
        <div className={styles.iconWrapper}>
          <div className={styles.glow} />
          <div className={styles.iconContainer}>
            <div className={styles.iconBackground}>
              <FiMapPin className={styles.icon} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <p className={styles.mainText}>
            Precisamos da sua localização para mostrar fornecedores próximos.
          </p>

          {permissionDenied && (
            <p className={styles.secondaryText}>
              Você negou a permissão. Para continuar, habilite a localização nas
              configurações do navegador e recarregue a página.
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className={styles.buttonWrapper}>
          {permissionDenied ? (
            <div className={styles.buttonContainer}>
              <button onClick={() => window.location.reload()} className={styles.button}>
                Recarregar página
              </button>
              <button onClick={onSkip} className={styles.buttonSecondary}>
                Continuar sem localização
              </button>
            </div>
          ) : (
            <>
              <button onClick={onRetry} className={styles.button}>
                Permitir localização
              </button>
              <button onClick={onSkip} className={styles.buttonSecondary}>
                Continuar sem localização
              </button>
            </>
          )}
        </div>
      </div>

      {/* Help text */}
      {/* <p className={styles.helpText}>
        Precisa de ajuda? Confira como{" "}
        <a href="#" className={styles.helpLink}>
          habilitar a localização
        </a>
      </p> */}
    </div>
  );
}
