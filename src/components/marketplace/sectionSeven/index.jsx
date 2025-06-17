import styles from "./styles.module.css";
import Orcamento from "../../../assets/marketplace/sectionSeven/orcamento.png";

function SectionFour() {
    return (
        <div className={styles.sectionSeven}>
            <div className={styles.container}>
                <img src={Orcamento} alt="Orçamento" className={styles.backgroundImage} />
                <div className={styles.overlay}></div>
                <div className={styles.content}>
                    <h3>Precisa de algo exclusivo?</h3>
                    <p>Encontre fornecedores que criam peças, protótipos e soluções sob medida para você ou sua empresa.</p>
                    <button className={styles.button}>Solicitar Orçamento</button>
                </div>
            </div>
        </div>
    );
}

export default SectionFour;
