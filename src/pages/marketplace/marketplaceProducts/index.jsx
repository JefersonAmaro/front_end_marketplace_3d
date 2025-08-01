import styles from "./styles.module.css";

import { useParams, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useMemo } from "react";
import { DataContext } from "../../../context/dataContext";

import Loading from "../../../components/loading";
import ColorSelector from "../../../components/corSelector";
import FinishingSelector from "../../../components/finishingSelector";

import CardsComponent from "../../../components/cardsComponent";

function MarketplaceProducts() {
  const { id } = useParams();
  const { data, loading } = useContext(DataContext);
  const navigate = useNavigate();

  const [randomFourProducts, setRandomFourProducts] = useState([]);
  const [productsRelated, setProductsRelated] = useState([]);
  const [quantidade, setQuantidade] = useState(1);
  const [cor, setCor] = useState(null);
  const [acabamento, setAcabamento] = useState(null);

  const aumentar = () => setQuantidade((q) => q + 1);
  const diminuir = () => setQuantidade((q) => (q > 1 ? q - 1 : 1));

  const allProducts = useMemo(() => {
    return [
      ...(data?.lancamentosRecentes || []),
      ...(data?.brinquedos || []),
      ...(data?.casaEDecoracao || []),
      ...(data?.ferramentas || []),
      ...(data?.outros || []),
    ];
  }, [data]);

  const produto = useMemo(() => {
    return allProducts.find((item) => item.id === id);
  }, [id, allProducts]);

  useEffect(() => {
    if (!produto) return;
    const outros = allProducts.filter((item) => item.id !== id);
    const aleatorios = [...outros].sort(() => 0.5 - Math.random()).slice(0, 4);
    setRandomFourProducts(aleatorios);

    const relacionados = outros
      .filter((item) => item.category === produto.category)
      .sort(() => 0.5 - Math.random()) // embaralha
      .slice(0, 4); // pega 4

    setProductsRelated(relacionados);
  }, [id, allProducts, produto]);

  if (loading) {
    return <Loading />;
  }

  if (!produto) {
    return <div className={styles.notFound}>Produto não encontrado.</div>;
  }

  function generateUUID() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    // Verifica se já existe produto com mesmo produto.id + cor + acabamento (se quiser diferenciar)
    const index = cart.findIndex(
      (item) =>
        item.produto.id === produto.id &&
        item.cor === cor &&
        item.acabamento === acabamento
    );

    if (index >= 0) {
      // Produto já existe: soma a quantidade
      cart[index].quantidade += quantidade;
    } else {
      // Produto novo
      cart.push({
        id: generateUUID(),
        produto,
        quantidade,
        cor,
        acabamento,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(
      new CustomEvent("cartUpdated", { detail: { open: true } })
    );
  };

  const { width, height, depth } = produto.size;

  return (
    <>
      <div className={styles.container}>
        <div className={styles.images}>
          <div className={styles.imagesSection}>
            <img src={produto.img} alt={produto.titulo} />
            <img src={produto.img} alt={produto.titulo} />
            <img src={produto.img} alt={produto.titulo} />
            <img src={produto.img} alt={produto.titulo} />
          </div>
          <div className={styles.image}>
            <img src={produto.img} alt={produto.titulo} />
          </div>
        </div>
        <div className={styles.info}>
          <div className={styles.text}>
            <div className={styles.title}>
              <h1>{produto.name}</h1>
              <p className={styles.tag}>{produto.category}</p>
            </div>
            <p className={styles.description}>{produto.description}</p>
            <p className={styles.material}>
              Material: {produto.material.join(", ")}
            </p>
            <p className={styles.size}>
              Tamanho: {height.toFixed(1)} x {width.toFixed(1)} x{" "}
              {depth.toFixed(1)} cm
            </p>
            <p className={styles.price}>R$ {produto.price}</p>
            <ColorSelector colors={produto.colors} setCor={setCor} />
            <FinishingSelector
              finishings={produto.finishing}
              setAcabamento={setAcabamento}
            />
          </div>
          <div className={styles.buy}>
            <div className={styles.quantidadeWrapper}>
              <button onClick={diminuir} className={styles.botao}>
                –
              </button>
              <span className={styles.valor}>{quantidade}</span>
              <button onClick={aumentar} className={styles.botao}>
                +
              </button>
            </div>

            <div className={styles.buttons}>
              <button className={styles.addToCart} onClick={() => addToCart()}>
                Adicionar ao Carrinho
              </button>
              <button className={styles.buyNow}>Comprar Agora</button>
            </div>
          </div>
        </div>
      </div>
    <CardsComponent
      title="Produtos do mesmo vendedor"
      description="Outras opções que este vendedor oferece"
      button="Ver Mais"
      cards={randomFourProducts}
    />
      <CardsComponent
      title="Produtos Relacionado"
      description="Confira outros produtos semelhantes"
      button="Ver Mais"
      cards={productsRelated}
    />
    </>
  );
}

export default MarketplaceProducts;
