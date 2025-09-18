import { useContext, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/authContext";

function PrivateRoute({ allowedRoles = [] }) {
  const { token, loading, user, openLoginModal } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token && !loading) {
      navigate("/marketplace", { replace: true });
      openLoginModal();
    } else if (token && user) {
      // Se allowedRoles definido e a role do usuário não está incluída
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        navigate("/marketplace", { replace: true });
      }
      // Redireciona fornecedor logado apenas se ele estiver na raiz "/"
      else if (user.role === "fornecedor" && location.pathname === "/") {
        navigate("/fornecedor", { replace: true });
      }
    }
  }, [token, loading, user, allowedRoles, navigate, openLoginModal, location.pathname]);

  if (loading) return <div>Carregando...</div>;
  if (!token) return null;

  return <Outlet />;
}

export default PrivateRoute;
