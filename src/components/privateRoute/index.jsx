import { useContext, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/authContext";

import Cookies from "js-cookie";

import styles from "./styles.module.css";

function PrivateRoute({ allowedRoles = [] }) {
  const { token, loading, user, openLoginModal } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const needsAddress = Cookies.get("needsAddress") === "true";

    if (!token && !loading) {
      navigate("/marketplace", { replace: true });
      openLoginModal();
    } else if (token && user) {
      // Se precisa cadastrar endereço
      if (needsAddress && location.pathname !== "/cadastrar-endereco") {
        navigate("/finalizar-cadastro", { replace: true });
      }
      // Se allowedRoles definido e a role do usuário não está incluída
      else if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        navigate("/marketplace", { replace: true });
      }
      // Redireciona fornecedor logado apenas se ele estiver na raiz "/"
      else if (user.role === "fornecedor" && location.pathname === "/") {
        navigate("/fornecedor", { replace: true });
      }
    }
  }, [
    token,
    loading,
    user,
    allowedRoles,
    navigate,
    openLoginModal,
    location.pathname,
  ]);

  if (loading)
    return (
      <div className={styles.loading}>
        <div className={styles.loader}></div>
      </div>
    );
  if (!token) return null;

  return <Outlet />;
}

export default PrivateRoute;
