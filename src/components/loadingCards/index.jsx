import styles from "./styles.module.css";

function LoadingCards() {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.loading}></div>
        </div>
    );
}

export default LoadingCards