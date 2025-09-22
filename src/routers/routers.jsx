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
import FinalizarCadastro from "../pages/finalizarCadastro";
import Pedidos from "../pages/pedidos";

import FornecedorDashboard from "../pages/fornecedor/dashboard";
import ProdutosFornecedor from "../pages/fornecedor/produtos";
import PedidosFornecedor from "../pages/fornecedor/pedidos";

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
      {path: "/finalizar-cadastro", element: <FinalizarCadastro />},

      // Rotas privadas CLIENTE
      {
        element: <PrivateRoute allowedRoles={["cliente"]} />,
        children: [
          { path: "perfil", element: <Perfil /> },
          { path: "solicitar-orcamento", element: <Orcamento /> },
          { path: "pedidos", element: <Pedidos /> },
        ],
      },

      // Rota privada FORNECEDOR
      {
        path: "/fornecedor",
        element: <PrivateRoute allowedRoles={["fornecedor"]} />,
        children: [
          { index: true, element: <FornecedorDashboard /> }, // /fornecedor
          { path: "produtos", element: <ProdutosFornecedor /> }, // /fornecedor/produtos
          { path: "pedidos", element: <PedidosFornecedor /> }, // /fornecedor/pedidos
        ],
      },
    ],
  },
]);
