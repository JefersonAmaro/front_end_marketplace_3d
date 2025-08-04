import { useEffect, useState, useMemo } from "react";
import styles from "./styles.module.css";

import { useNavigate } from "react-router-dom";

import { useContext } from "react";
import { DataContext } from "../../context/dataContext";

import { FiTrash, FiShoppingCart } from "react-icons/fi";

export function CartPreview() {
  const { data, loading } = useContext(DataContext);
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const produtos = useMemo(
    () => ({
      lancamentosRecentes: data.lancamentosRecentes,
      brinquedos: data.brinquedos,
      casaEDecoracao: data.casaEDecoracao,
      ferramentas: data.ferramentas,
      outros: data.outros,
    }),
    [data]
  );

  const loadCart = () => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(stored);
  };

  useEffect(() => {
    loadCart();
    const handleCartChange = (event) => {
      loadCart();

      if (event?.detail?.open) {
        setIsOpen(true); // Abre automaticamente se for um "open"
      }
    };

    window.addEventListener("cartUpdated", handleCartChange);

    return () => {
      window.removeEventListener("cartUpdated", handleCartChange);
    };
  }, []);

  const toggleCart = () => setIsOpen(!isOpen);
  const totalItems = cart.reduce((acc, item) => acc + item.quantidade, 0);

  const aumentarQuantidade = (index) => {
    const updatedCart = [...cart];
    updatedCart[index].quantidade += 1;
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const diminuirQuantidade = (index) => {
    const updatedCart = [...cart];
    if (updatedCart[index].quantidade > 1) {
      updatedCart[index].quantidade -= 1;
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdated"));
    } else {
      // Remove item se quantidade for 1 e clicar em –
      updatedCart.splice(index, 1);
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  const removerItem = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  function traduzirCor(corInglesa) {
    const traducoes = {
      red: "vermelho",
      blue: "azul",
      green: "verde",
      black: "preto",
      white: "branco",
      yellow: "amarelo",
      pink: "rosa",
      gray: "cinza",
      grey: "cinza",
      orange: "laranja",
      brown: "marrom",
      purple: "roxo",
      cyan: "ciano",
      magenta: "magenta",
      gold: "dourado",
      silver: "prateado",
      beige: "bege",
      transparent: "transparente",
    };

    if (!corInglesa) return "Cor indefinida";

    const corNormalizada = corInglesa.toLowerCase();
    const corTraduzida = traducoes[corNormalizada] || corNormalizada;

    return corTraduzida.charAt(0).toUpperCase() + corTraduzida.slice(1);
  }

  const formatarPreco = (valor) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(valor);

  if (!data || loading) return <>Carregando</>;

  return (
    <>
      <div className={styles.floatingButton} onClick={toggleCart}>
        <FiShoppingCart sixe={20} /> {totalItems}
      </div>

      <div className={`${styles.cartPanel} ${isOpen ? styles.open : ""}`}>
        <button className={styles.closeBtn} onClick={toggleCart}>
          ×
        </button>
        <h2>
          Seu Carrinho tem{" "}
          <span className={styles.totalItems}>{totalItems} itens</span>
        </h2>

        {cart.length === 0 ? (
          <p className={styles.emptyMessage}>Seu carrinho está vazio.</p>
        ) : (
          <>
            <ul className={styles.cartList}>
              {cart.map((item, index) => (
                <div
                  key={index}
                  className={styles.cartItemContainer}
                  onClick={() => {
                    navigate(`/marketplace/${item.produto?.id}`);
                    toggleCart();
                  }}
                >
                  <div className={styles.cartItemImg}>
                    <img src={item.produto?.img} alt={item.produto?.name} />
                  </div>
                  <div className={styles.cartItemInfo}>
                    <li className={styles.cartItem}>
                      <div className={styles.cartItemTitle}>
                        <p className={styles.cartItemName}>
                          {item.produto?.name}
                        </p>
                        <div
                          className={styles.cartItemDelete}
                          onClick={(e) => {
                            e.stopPropagation();
                            removerItem(index);
                          }}
                        >
                          <FiTrash
                            size={18}
                            className={styles.cartItemDeleteIcon}
                          />
                        </div>
                      </div>
                      <div className={styles.cartItemDescription}>
                        <div className={styles.cartItemColorWrapper}>
                          <p>{traduzirCor(item.cor)}</p>
                          <div
                            className={styles.cartItemColor}
                            style={{ backgroundColor: item.cor }}
                          ></div>
                        </div>
                        <p>{item.acabamento}</p>
                      </div>
                      <div className={styles.cartItemDetails}>
                        <p className={styles.cartItemPrice}>
                          R$ {item.produto?.price}
                        </p>

                        <div className={styles.quantidadeWrapper}>
                          <button
                            className={styles.botao}
                            onClick={(e) => {
                              e.stopPropagation();
                              diminuirQuantidade(index);
                            }}
                            disabled={item.quantidade === 1}
                          >
                            –
                          </button>
                          <span className={styles.valor}>
                            {item.quantidade}
                          </span>
                          <button
                            className={styles.botao}
                            onClick={(e) => {
                              e.stopPropagation();
                              aumentarQuantidade(index);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </li>
                  </div>
                </div>
              ))}
            </ul>
            <div className={styles.cartTotalContainer}>
              <div className={styles.cartTotal}>
                <span className={styles.cartTotalLabel}>Total:</span>
                <span className={styles.cartTotalValue}>
                  {formatarPreco(
                    cart.reduce((acc, item) => {
                      const allProducts = Object.values(produtos).flat();
                      const produtoAtual = allProducts.find(
                        (p) => p.id === item.produto?.id
                      );

                      const preco =
                        parseFloat(
                          (produtoAtual?.price || "0").replace(",", ".")
                        ) || 0;
                      return acc + preco * item.quantidade;
                    }, 0)
                  )}
                </span>
              </div>
              <button className={styles.cartCheckoutButton}>
                Finalizar Compra
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
