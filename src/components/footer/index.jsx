import styles from "./styles.module.css";
import { Link, useLocation } from "react-router-dom";

import Linkedin from "../../assets/footer/linkedin.png";
import Instagram from "../../assets/footer/instagram.png";
import Facebook from "../../assets/footer/facebook.png";

function Footer() {
  function scrollToWithOffset(id) {
    const element = document.getElementById(id);
    if (!element) return;

    const offset = window.innerHeight * 0.1; // 10% da altura da tela
    const elementPosition =
      element.getBoundingClientRect().top + window.pageYOffset;

    window.scrollTo({
      top: elementPosition - offset,
      behavior: "smooth",
    });
  }

  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <footer className={styles[isHome ? "footer" : "footer1"]}>
      <div className={styles.content}>
        <div className={styles[isHome ? "text" : "text1"]}>
          <h1>Market3D</h1>
          <p>
            O maior marketplace de impressão 3D do Brasil. Conectamos criadores,
            fornecedores e clientes em uma única plataforma.
          </p>
        </div>
        <div className={styles[isHome ? "links" : "links1"]}>
          <h1>Links Úteis</h1>
          <Link>Sobre nós</Link>
          <Link onClick={() => scrollToWithOffset("como-funciona")}>
            Como Funciona?
          </Link>
          <Link onClick={() => scrollToWithOffset("quero-vender")}>
            Quero Vender
          </Link>
          <Link>Termos de Uso</Link>
          <Link>Politica de Privacidade</Link>
        </div>
        <div className={styles[isHome ? "support" : "support1"]}>
          <h1>Suporte</h1>
          <Link>Central de Ajuda</Link>
          <Link>Contato</Link>
          <Link>FAQ</Link>
        </div>
      </div>
      <div className={styles[isHome ? "line" : "line1"]}></div>
      <div className={styles.content}>
        <div className={styles[isHome ? "copyright" : "copyright1"]}>
          <p>© 2025 Market3D. Todos os direitos reservados.</p>
          <p>
            Desenvolvido por{" "}
            <a href="https://www.gnconnectionsystem.com.br/" target="_blank">
              GNConnection System
            </a>
          </p>
        </div>

        <div className={styles[isHome ? "socialMedia" : "socialMedia1"]}>
          <img
            src={Linkedin}
            alt="Linkedin"
            onClick={() => {
              window.open(
                "https://www.linkedin.com/company/market3d/",
                "_blank"
              );
            }}
          />
          <img
            src={Instagram}
            alt="Instagram"
            onClick={() => {
              window.open("https://www.instagram.com/market3d/", "_blank");
            }}
          />
          <img
            src={Facebook}
            alt="Facebook"
            onClick={() => {
              window.open("https://www.facebook.com/market3d/", "_blank");
            }}
          />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
