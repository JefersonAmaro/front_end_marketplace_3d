import {
  FaBars,
  FaHome,
  FaBox,
  FaShoppingCart,
  FaCog,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";
import styles from "./styles.module.css";

function HeaderSupplier({ collapsed, setCollapsed }) {

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.headerTop}>
        <div className={`${styles.brand} ${collapsed ? styles.collapsed : ""}`}>
          <span className={styles.brandText}>Market3D</span>
          {collapsed ? (
            <FaBars
              onClick={() => setCollapsed(false)}
              style={{ cursor: "pointer" }}
              className={styles.navIcon}
            />
          ) : (
            <FaTimes
              onClick={() => setCollapsed(true)}
              style={{ cursor: "pointer" }}
              className={styles.navIcon}
            />
          )}
        </div>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navItem}>
          <FaHome className={styles.navIcon} />
          <span className={styles.navText}>Painel</span>
        </div>
        <div className={styles.navItem}>
          <FaBox className={styles.navIcon} />
          <span className={styles.navText}>Produtos</span>
        </div>
        <div className={styles.navItem}>
          <FaShoppingCart className={styles.navIcon} />
          <span className={styles.navText}>Pedidos</span>
        </div>
        <div className={styles.navItem}>
          <FaCog className={styles.navIcon} />
          <span className={styles.navText}>Configurações</span>
        </div>
      </nav>

      <div className={styles.footer}>
        <button className={`${styles.logoutBtn} ${collapsed ? styles.collapsed : ""}`}>
          <span className={styles.navText}>Sair</span>
          <FaSignOutAlt className={styles.navIcon} />
        </button>
      </div>
    </aside>
  );
}

export default HeaderSupplier;
