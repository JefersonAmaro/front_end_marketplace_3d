import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";
import Busca from "../../assets/header/busca.png";

function SearchBox({ products, setMenuAberto }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownCoords, setDropdownCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // 🔹 Tradução cores PT → EN (para comparar com colors do produto)
  const coresPTparaEN = {
    vermelho: "red",
    azul: "blue",
    verde: "green",
    preto: "black",
    branco: "white",
    amarelo: "yellow",
    rosa: "pink",
    cinza: "gray",
    laranja: "orange",
    marrom: "brown",
    roxo: "purple",
    ciano: "cyan",
    magenta: "magenta",
    dourado: "gold",
    prateado: "silver",
    bege: "beige",
    transparente: "transparent",
  };

  const traduzirCorParaIngles = (cor) =>
    coresPTparaEN[cor?.toLowerCase()] || cor?.toLowerCase();

  // 🔹 Filtra produtos
  const filteredProducts = useMemo(() => {
    const termo = searchTerm.toLowerCase();

    return products
      .filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(termo);
        const categoryMatch = p.category.toLowerCase().includes(termo);
        const materialMatch = Array.isArray(p.material)
          ? p.material.some((m) => m.toLowerCase().includes(termo))
          : p.material.toLowerCase().includes(termo);

        const colorMatch = Array.isArray(p.colors)
          ? p.colors.some(
              (c) =>
                c.toLowerCase().includes(termo) ||
                c.toLowerCase() === traduzirCorParaIngles(termo)
            )
          : p.colors?.toLowerCase() === traduzirCorParaIngles(termo);

        const precoMatch =
          !isNaN(Number(termo.replace(",", "."))) &&
          Number(p.price.replace(",", ".")) <= Number(termo.replace(",", "."));

        return (
          nameMatch ||
          categoryMatch ||
          materialMatch ||
          colorMatch ||
          precoMatch
        );
      })
      .slice(0, 4);
  }, [products, searchTerm]);

  // Atualiza posição do dropdown sempre que input muda ou abre
  useEffect(() => {
    if (
      inputRef.current &&
      filteredProducts.length > 0 &&
      searchTerm.trim() !== ""
    ) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      });
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [searchTerm, filteredProducts.length]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (productId) => {
    navigate(`/marketplace/${productId}`);
    setSearchTerm("");
    setIsOpen(false);
    setMenuAberto(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      navigate(`/produtos?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setIsOpen(false);
      setMenuAberto(false);
    }
  };

  return (
    <>
      <form className={styles.searchBox} onSubmit={handleSearch}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.input}
        />
        <button className={styles.iconContainer} type="submit">
          <img src={Busca} alt="Busca" className={styles.icon} />
        </button>
      </form>

      {isOpen &&
        filteredProducts.length > 0 &&
        createPortal(
          <div
            ref={dropdownRef}
            className={styles.dropdown}
            style={{
              position: "fixed",
              top: dropdownCoords.top,
              left: dropdownCoords.left,
              width: dropdownCoords.width,
              zIndex: 9999,
            }}
          >
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className={styles.item}
                onClick={() => handleSelectProduct(p.id)}
              >
                <div className={styles.imgContainer}>
                  <img src={p.img} alt={p.name} className={styles.img} />
                </div>
                <p>{p.name}</p>
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

export default SearchBox;
