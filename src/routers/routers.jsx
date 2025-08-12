import { createBrowserRouter } from "react-router-dom";
import PrivateRoute from "../components/privateRoute";
import App from "../App";
import Home from "../pages/home";
import Marketplace from "../pages/marketplace";
import MarketplaceLandingPage from "../pages/marketplace/marketplaceLandingPage";
import MarketplaceProducts from "../pages/marketplace/marketplaceProducts";
import Perfil from "../pages/perfil";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/marketplace",
        element: <Marketplace />,
        children: [
          {
            path: "",
            element: <MarketplaceLandingPage />, // <- onde estarão SectionOne a SectionSeven
          },
          {
            path: ":id",
            element: <MarketplaceProducts />,
          },
        ],
      },
      {
        element: <PrivateRoute />, // wrapper que protege as rotas filhas
        children: [
          {
            path: "perfil",
            element: <Perfil />,
          },
        ],
      },
    ],
  },
]);
