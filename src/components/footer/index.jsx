import styles from "./styles.module.css";
import { Link } from "react-router-dom";

import Linkedin from "../../assets/footer/linkedin.png";
import Instagram from "../../assets/footer/instagram.png";
import Facebook from "../../assets/footer/facebook.png";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.text}>
          <h1>Market3D</h1>
          <p>
            O maior marketplace de impressão 3D do Brasil. Conectamos criadores,
            fornecedores e clientes em uma única plataforma.
          </p>
        </div>
        <div className={styles.links}>
          <h1>Links Úteis</h1>
          <Link>Sobre nós</Link>
          <Link>Como Funciona</Link>
          <Link>Quero Vender</Link>
          <Link>Termos de Uso</Link>
          <Link>Politica de Privacidade</Link>
        </div>
        <div className={styles.support}>
          <h1>Suporte</h1>
          <Link>Central de Ajuda</Link>
          <Link>Contato</Link>
          <Link>FAQ</Link>
        </div>
      </div>
      <div className={styles.line}></div>
      <div className={styles.content}>
        <div className={styles.copyright}>
          <p>
            © 2025 Market3D. Todos os direitos reservados.
          </p>
          <p>Desenvolvido por <a href="https://www.gnconnectionsystem.com.br/" target="_blank">GNConnection System</a></p>
        </div>

        <div className={styles.socialMedia}>
          <img src={Linkedin} alt="Linkedin" onClick={() => {window.open("https://www.linkedin.com/company/market3d/", "_blank")}}/>
          <img src={Instagram} alt="Instagram" onClick={() => {window.open("https://www.instagram.com/market3d/", "_blank")}}/>
          <img src={Facebook} alt="Facebook" onClick={() => {window.open("https://www.facebook.com/market3d/", "_blank")}}/>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
