import { useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";

function PrivateRoute() {
  const { token, loading, openLoginModal } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token && !loading) {
      navigate("/marketplace", { replace: true });
      openLoginModal();
    }
  }, [token, loading, navigate, openLoginModal]);

  if (loading) return <div>Carregando...</div>;

  if (!token) {
    return null; // evita renderização antes do redirecionamento
  }

  return <Outlet />;
}

export default PrivateRoute;
