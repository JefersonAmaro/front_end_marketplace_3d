import { createBrowserRouter } from "react-router-dom";
import PrivateRoute from "../components/privateRoute";
import App from "../App";
import Home from "../pages/home";
import Marketplace from "../pages/marketplace";
import MarketplaceLandingPage from "../pages/marketplace/marketplaceLandingPage";
import MarketplaceProducts from "../pages/marketplace/marketplaceProducts";
import Perfil from "../pages/perfil";
import Orcamento from "../pages/orcamento";
import Produtos from "../pages/produtos";

import FornecedorDashboard from "../pages/fornecedor/dashboard";
import ProdutosFornecedor from "../pages/fornecedor/produtos";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      {
        path: "/marketplace",
        element: <Marketplace />,
        children: [
          { path: "", element: <MarketplaceLandingPage /> },
          { path: ":id", element: <MarketplaceProducts /> },
        ],
      },
      { path: "/produtos", element: <Produtos /> },

      // Rotas privadas CLIENTE
      {
        element: <PrivateRoute allowedRoles={["cliente"]} />,
        children: [
          { path: "perfil", element: <Perfil /> },
          { path: "solicitar-orcamento", element: <Orcamento /> },
        ],
      },

      // Rota privada FORNECEDOR
      {
        path: "/fornecedor",
        element: <PrivateRoute allowedRoles={["fornecedor"]} />,
        children: [
          { index: true, element: <FornecedorDashboard /> }, // /fornecedor
          { path: "produtos", element: <ProdutosFornecedor /> }, // /fornecedor/produtos
        ],
      },
    ],
  },
]);
