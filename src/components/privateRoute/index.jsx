import { useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";

function PrivateRoute({ allowedRoles = [] }) {
  const { token, loading, user, openLoginModal } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token && !loading) {
      navigate("/marketplace", { replace: true });
      openLoginModal();
    } else if (token && user) {
      // Se allowedRoles definido e a role do usuário não está incluída
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        navigate("/", { replace: true }); // ou página de acesso negado
      } else if (user.role === "fornecedor") {
        // Redireciona fornecedor logado diretamente para /fornecedor
        navigate("/fornecedor", { replace: true });
      }
    }
  }, [token, loading, user, allowedRoles, navigate, openLoginModal]);

  if (loading) return <div>Carregando...</div>;
  if (!token) return null;

  return <Outlet />;
}

export default PrivateRoute;
