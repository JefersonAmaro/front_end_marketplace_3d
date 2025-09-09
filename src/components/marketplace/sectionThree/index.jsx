import { useContext } from "react";
import { DataContext } from "../../../context/dataContext";
import { useGeolocation } from "../../../hooks/useGeolocation";
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

function SectionThree() {
  const { data, loading, setFilters } = useContext(DataContext);
  const userLocation = useGeolocation(); // { latitude, longitude, error }
  const navigate = useNavigate();

  if (loading || !data || !userLocation.latitude) {
    return <LoadingCards />;
  }

  // Unifica todos os produtos e filtra por categoria "Brinquedos"
  const brinquedos = Object.values(data)
    .flat()
    .filter((produto) => produto.category === "Brinquedos");

  const cardsWithDistance = brinquedos.map((produto) => {
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

  // Ordena do mais próximo ao mais distante
  const sortedCards = cardsWithDistance.sort((a, b) => a.distance - b.distance);

  return (
    <CardsComponent
      title="Brinquedos"
      description="Modelos criativos e divertidos para todas as idades. Perfeitos para brincar, aprender ou colecionar."
      button="Ver Mais"
      onClickButton={() => {
        setFilters({
          categorias: ["Brinquedos"],
          materiais: [],
          cor: null,
          preco: null,
        });
        navigate("/produtos");
      }}
      cards={sortedCards}
    />
  );
}

export default SectionThree;
