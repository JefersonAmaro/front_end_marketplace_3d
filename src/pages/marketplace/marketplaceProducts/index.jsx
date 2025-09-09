import styles from "./styles.module.css";

import { useParams, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { DataContext } from "../../../context/dataContext";

import Loading from "../../../components/loading";
import ColorSelector from "../../../components/corSelector";
import FinishingSelector from "../../../components/finishingSelector";

import CardsComponent from "../../../components/cardsComponent";
import { useGeolocation } from "../../../hooks/useGeolocation";

import LoadingCards from "../../../components/loadingCards";

function MarketplaceProducts() {
  const { id } = useParams();
  const { data, loading } = useContext(DataContext);
  const userLocation = useGeolocation(); // { latitude, longitude, error }
  const navigate = useNavigate();

  const [randomFourProducts, setRandomFourProducts] = useState([]);
  const [productsRelated, setProductsRelated] = useState([]);
  const [quantidade, setQuantidade] = useState(1);
  const [cor, setCor] = useState(null);
  const [acabamento, setAcabamento] = useState(null);

  // Função para calcular distância entre duas coordenadas (em km)
  function getDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const aumentar = () => setQuantidade((q) => q + 1);
  const diminuir = () => setQuantidade((q) => (q > 1 ? q - 1 : 1));

  // Garante que data sempre seja array
  const allProducts = Array.isArray(data) ? data : [];

  // Calcula distância de cada produto até o usuário
  const productsWithDistance = allProducts.map((p) => {
    const supplier = p.supplier;
    const distance = supplier?.latitude
      ? getDistance(
          userLocation.latitude,
          userLocation.longitude,
          supplier.latitude,
          supplier.longitude
        )
      : Infinity;
    return { ...p, distance };
  });

  const produto = productsWithDistance.find((item) => item.id === id);

  useEffect(() => {
    if (!produto) return;

    // cria cópia com distância só uma vez
    const outros = allProducts
      .filter((item) => item.id !== id)
      .map((p) => {
        const supplier = p.supplier;
        const distance =
          supplier?.latitude && supplier?.longitude && userLocation.latitude
            ? getDistance(
                userLocation.latitude,
                userLocation.longitude,
                supplier.latitude,
                supplier.longitude
              )
            : Infinity;
        return { ...p, distance };
      });

    // Produtos do mesmo fornecedor
    const doMesmoFornecedor = outros.filter(
      (item) => item.supplier?.id === produto.supplier?.id
    );

    const aleatorios = doMesmoFornecedor
      .slice()
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);

    setRandomFourProducts(aleatorios);

    // Produtos relacionados (mesma categoria) ordenados pela distância
    const relacionados = outros
      .filter((item) => item.category === produto.category)
      .slice()
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4);

    setProductsRelated(relacionados);
  }, [id, allProducts, userLocation]);

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
    const index = cart.findIndex(
      (item) =>
        item.produto.id === produto.id &&
        item.cor === cor &&
        item.acabamento === acabamento
    );

    if (index >= 0) {
      cart[index].quantidade += quantidade;
    } else {
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

  const { width = 0, height = 0, depth = 0 } = produto.size || {};

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
              Material: {produto.material?.join(", ")}
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
              <button className={styles.addToCart} onClick={addToCart}>
                Adicionar ao Carrinho
              </button>
              <button className={styles.buyNow}>Comprar Agora</button>
            </div>
          </div>
        </div>
      </div>

      {loading || !data || !userLocation.latitude ? (
        <LoadingCards />
      ) : (
        <>
          <CardsComponent
            title="Produtos do mesmo fornecedor"
            description={`Outras opções que ${produto.supplier?.name} oferece`}
            button="Ver Mais"
            cards={randomFourProducts}
          />
          <CardsComponent
            title="Produtos Relacionados"
            description="Confira outros produtos semelhantes (ordenados por proximidade)"
            button="Ver Mais"
            cards={productsRelated}
          />
        </>
      )}
    </>
  );
}

export default MarketplaceProducts;
