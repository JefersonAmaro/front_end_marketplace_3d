import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/home";
import Marketplace from "../pages/marketplace";

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
            },
        ]
    },
]);

