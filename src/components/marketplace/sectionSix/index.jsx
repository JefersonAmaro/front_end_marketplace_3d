import { useContext } from "react";
import { DataContext } from "../../../context/dataContext";

import Loading from "../../loading";

import CardsComponent from "../../cardsComponent";

function SectionSix() {
  const { data, loading } = useContext(DataContext);
  const cards = data.outros || [];

  if (loading || !data) {
    return <Loading />;
  }

   return (
    <CardsComponent
      title="Outros"
      description=" Para o que é único, diferente ou inesperado. Explore o que foge do padrão."
      button="Ver Mais"
      cards={cards}
    />
  );
}

export default SectionSix;
