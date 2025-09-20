import "./App.css";
import { Outlet } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "./context/authContext";
import Header from "./components/header";
import HeaderSupplier from "./components/headerSupplier";
import Footer from "./components/footer";

import ScrollToTop from "./components/scrollToTop";
import { CartPreview } from "./components/cartPreview";

function App() {
  const { user } = useContext(AuthContext);

  const isSupplier = user?.role === "fornecedor";
  const [collapsed, setCollapsed] = useState(false);

  if (isSupplier) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <HeaderSupplier collapsed={collapsed} setCollapsed={setCollapsed} />
        <main
          className={collapsed ? "sidebar-collapsed" : ""}
          style={{
            flex: 1,
            padding: "1rem",
            transition: "margin-left 0.3s ease",
          }}
        >
          <ScrollToTop />
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <>
      <Header />
      <ScrollToTop />
      <Outlet />
      <CartPreview />
      <Footer />
    </>
  );
}

export default App;
