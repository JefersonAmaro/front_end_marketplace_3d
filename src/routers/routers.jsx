import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/home";
import Marketplace from "../pages/marketplace";
import MarketplaceLandingPage from "../pages/marketplace/marketplaceLandingPage";
import MarketplaceProducts from "../pages/marketplace/marketplaceProducts";

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
    ],
  },
]);
