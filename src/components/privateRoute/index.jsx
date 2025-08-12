import { useContext, useEffect } from "react";
import { Outlet} from "react-router-dom";
import { AuthContext } from "../../context/authContext";

function PrivateRoute() {
  const { token, loading, openLoginModal } = useContext(AuthContext);

  useEffect(() => {
    if (!token) {
      openLoginModal();
    }
  }, [token, openLoginModal]);

  if (loading) return <div>Carregando...</div>;

  if (!token) {
    // Não retorna nada aqui para evitar setState no render
    return null;
  }

  return <Outlet />;
}

export default PrivateRoute;
