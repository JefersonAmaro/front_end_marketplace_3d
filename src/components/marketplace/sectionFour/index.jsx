import { useContext } from "react";
import { DataContext } from "../../../context/dataContext";
import { useGeo } from "../../../context/geoContext"; // ✅ pegar do contexto
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

function SectionFour() {
  const { data, loading, setFilters, status } = useContext(DataContext);
  const { latitude, longitude, loading: geoLoading, skipped } = useGeo(); // ✅ do contexto
  const navigate = useNavigate();

  if (loading || !data || geoLoading) {
    return <LoadingCards />; // espera geolocalização
  }

  // Unifica todos os produtos e filtra por categoria "Casa e Decoração"
  const casaEDecoracao = Object.values(data)
    .flat()
    .filter((produto) => produto.category === "Casa e Decoração");

  // 🔹 Se nao houver produtos, nao renderiza nada
  if (!casaEDecoracao.length) {
    return null;
  }

  // Adiciona a distância sem ordenar por ela
  const cardsWithDistance = casaEDecoracao.map((produto) => {
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

  // Ordena do mais próximo ao mais distante e limita a 4 produtos
  const sortedCards = cardsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4);

  return (
    <CardsComponent
      title="Casa e Decoração"
      description="Ferramentas e peças para tornar seu ambiente mais agradável."
      button="Ver Mais"
      onClickButton={() => {
        setFilters({
          categorias: ["Casa e Decoração"],
          materiais: [],
          cor: null,
          preco: null,
        });
        navigate("/produtos");
      }}
      cards={sortedCards}
      status={status}
    />
  );
}

export default SectionFour;
