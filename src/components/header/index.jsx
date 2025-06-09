import styles from "./styles.module.css"

function Header() {
    return (
        <header className={styles.header}>
            <h1 className={styles.title}>Market3D</h1>
            <div className={styles.buttons}>
                <button className={styles.button}>Modelos</button>
                <button className={styles.button}>Como Funciona?</button>
                <button className={styles.button}>Quero Vender</button>
                <button className={styles.loginButton}>Login</button>
            </div>
        </header>
    )
}

export default Header