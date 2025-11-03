import { useContext } from "react";
import { DataContext } from "../../../context/dataContext";
import { useGeo } from "../../../context/geoContext"; // ✅ usar o contexto
import CardsComponent from "../../cardsComponent";
import LoadingCards from "../../loadingCards";
import { useNavigate } from "react-router-dom";

// Função para calcular distância entre duas coordenadas (em km)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distância em km
}

function SectionTwo() {
  const { data, loading, filters, setFilters, status } =
    useContext(DataContext);
  const { latitude, longitude, loading: geoLoading, skipped } = useGeo();

  const navigate = useNavigate();

  if (loading || !data || geoLoading) {
    return <LoadingCards />; // mostra loading
  }

  // Unifica todos os produtos em um único array
  const allProducts = Object.values(data).flat();

  // Adiciona a distância sem ordenar por ela
  const cardsWithDistance = allProducts.map((produto) => {
    const supplier = produto.supplier;
    // Se o usuário skipou, não calcula a distância
    const distance =
      !skipped && supplier?.latitude && supplier?.longitude
        ? getDistance(
            latitude,
            longitude,
            supplier.latitude,
            supplier.longitude
          )
        : null;
    return { ...produto, distance };
  });

  // Ordena pelo campo de data de cadastro
  const sortedCards = cardsWithDistance
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <CardsComponent
      title="Lançamentos Recentes"
      description="Peças que acabaram de sair da impressora. Confira as novidades fresquinhas do nosso catálogo!"
      button="Ver Mais"
      onClickButton={() => {
        setFilters({ categorias: [], materiais: [], cor: null, preco: null }); // limpa filtros
        navigate("/produtos");
      }}
      cards={sortedCards}
      status={status}
    />
  );
}

export default SectionTwo;
