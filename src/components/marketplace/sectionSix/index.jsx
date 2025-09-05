import { useContext } from "react";
import { DataContext } from "../../../context/dataContext";
import { useGeolocation } from "../../../hooks/useGeolocation";
import CardsComponent from "../../cardsComponent";
import LoadingCards from "../../loadingCards";

// Função para calcular distância entre duas coordenadas (em km)
function getDistance(lat1, lon1, lat2, lon2) {
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

function SectionSix() {
  const { data, loading } = useContext(DataContext);
  const userLocation = useGeolocation(); // { latitude, longitude, error }

  if (loading || !data || !userLocation.latitude) {
    return <LoadingCards />;
  }

  // Unifica todos os produtos e filtra pela categoria "Outros"
  const allProducts = Object.values(data).flat();
  const filteredProducts = allProducts.filter(
    (produto) => produto.category === "Outros"
  );

  // Calcula a distância em relação ao usuário
  const cardsWithDistance = filteredProducts.map((produto) => {
    const supplier = produto.supplier;
    const distance =
      supplier?.latitude && supplier?.longitude
        ? getDistance(
            userLocation.latitude,
            userLocation.longitude,
            supplier.latitude,
            supplier.longitude
          )
        : Infinity;
    return { ...produto, distance };
  });

  // Ordena pelo mais próximo e limita a 4 produtos
  const sortedCards = cardsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4);

  return (
    <CardsComponent
      title="Outros"
      description="Para o que é único, diferente ou inesperado. Explore o que foge do padrão."
      button="Ver Mais"
      cards={sortedCards}
    />
  );
}

export default SectionSix;
