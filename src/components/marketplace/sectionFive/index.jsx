import { useContext } from "react";
import { DataContext } from "../../../context/dataContext";
import { useGeolocation } from "../../../hooks/useGeolocation";
import CardsComponent from "../../cardsComponent";
import LoadingCards from "../../loadingCards";


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

function SectionFive() {
  const { data, loading } = useContext(DataContext);
  const userLocation = useGeolocation(); // { latitude, longitude, error }

  if (loading || !data || !userLocation.latitude) {
    return <LoadingCards />;
  }

  // Filtra produtos pela categoria "Ferramentas"
  const ferramentas = Object.values(data)
    .flat()
    .filter((produto) => produto.category === "Ferramentas");

  const cardsWithDistance = ferramentas.map((produto) => {
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

  // Ordena do mais próximo ao mais distante e limita a 4 produtos
  const sortedCards = cardsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4);

  return (
    <CardsComponent
      title="Ferramentas"
      description="Componentes funcionais e personalizados para turbinar seus projetos com precisão e eficiência."
      button="Ver Mais"
      cards={sortedCards}
    />
  );
}

export default SectionFive;
