import "./App.css";
import { Outlet } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "./context/authContext";
import { GeoProvider, useGeo } from "./context/geoContext";

import Header from "./components/header";
import HeaderSupplier from "./components/headerSupplier";
import Footer from "./components/footer";

import ScrollToTop from "./components/scrollToTop";
import { CartPreview } from "./components/cartPreview";

import { GeoBlocker } from "./components/geoBlocker.jsx";

import { FiMapPin } from "react-icons/fi";

function AppContent() {
  const { user } = useContext(AuthContext);
  const isSupplier = user?.role === "fornecedor";
  const [collapsed, setCollapsed] = useState(false);

  if (isSupplier) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <HeaderSupplier collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className={collapsed ? "sidebar-collapsed" : ""}>
          <ScrollToTop />
          <Outlet />
        </main>
      </div>
    );
  }

  // Apenas para usuários comuns, carregamos a geo
  const geo = useGeo();

  // Loader enquanto geolocalização está carregando
  if (geo.loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="header">
            <h1
              onClick={() => navigate("/marketplace")}
              className="title"
            >
              Market3D
            </h1>
          </div>

          <div className="iconWrapper">
            <div className="glow" />
            <div className="iconContainer">
              <div className="iconBackground">
                <FiMapPin className="icon" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="content">
            <p className="mainText">
              Carregando localização...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Se houver erro na geolocalização, exibimos o componente de erro
  if (geo.permissionDenied && !geo.skipped) {
    return (
      <GeoBlocker onRetry={() => window.location.reload()} permissionDenied onSkip={geo.skipLocation} />
    );
  }

  return (
    <>
      <Header />
      <ScrollToTop />
      <Outlet />
      <Footer />
      <CartPreview />
    </>
  );
}

function App() {
  return (
    <GeoProvider>
      <AppContent />
    </GeoProvider>
  );
}

export default App;
