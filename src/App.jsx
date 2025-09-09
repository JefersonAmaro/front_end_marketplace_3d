import "./App.css";
import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/authContext";
import Header from "./components/header";
import HeaderSupplier from "./components/headerSupplier";
import Footer from "./components/footer";

import ScrollToTop from "./components/scrollToTop";

import { CartPreview } from "./components/cartPreview";

function App() {
  const { user } = useContext(AuthContext);

  const isSupplier = user.role === "fornecedor";

  return (
    <>
      {isSupplier ? <HeaderSupplier /> : <Header />}
      <ScrollToTop />
      <Outlet />
      <CartPreview />
      {isSupplier ? null : <Footer />}
    </>
  );
}

export default App;
