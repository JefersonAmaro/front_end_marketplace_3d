import styles from "./styles.module.css";
import Orcamento from "../../../assets/marketplace/sectionSeven/orcamento.png";

import { useNavigate } from "react-router-dom";

function SectionFour() {
    const navigate = useNavigate();
    return (
        <div className={styles.sectionSeven}>
            <div className={styles.container}>
                <img src={Orcamento} alt="Orçamento" className={styles.backgroundImage} />
                <div className={styles.overlay}></div>
                <div className={styles.content}>
                    <h3>Precisa de algo exclusivo?</h3>
                    <p>Encontre fornecedores que criam peças, protótipos e soluções sob medida para você ou sua empresa.</p>
                    <button className={styles.button} onClick={() => navigate("/solicitar-orcamento")}>Solicitar Orçamento</button>
                </div>
            </div>
        </div>
    );
}

export default SectionFour;
