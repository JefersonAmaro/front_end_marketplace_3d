import Loading from "../../loading";

import { useContext } from "react";
import { DataContext } from "../../../context/dataContext";

import CardsComponent from "../../cardsComponent";

function SectionThree() {
  const { data, loading } = useContext(DataContext);
  const cards = data.brinquedos || [];

  if (loading || !data) {
    return <Loading />;
  }

  return (
    <CardsComponent
      title="Brinquedos"
      description="Modelos criativos e divertidos para todas as idades. Perfeitos para brincar, aprender ou colecionar."
      button="Ver Mais"
      cards={cards}
    />
  );
}

export default SectionThree;
