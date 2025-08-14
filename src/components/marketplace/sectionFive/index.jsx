import { useContext } from "react";
import { DataContext } from "../../../context/dataContext";

import Loading from "../../loading";

import CardsComponent from "../../cardsComponent";

function SectionFive() {
  const { data, loading } = useContext(DataContext);
  const cards = data.ferramentas || [];

  if (loading || !data) {
    return <Loading />;
  }

  return (
    <CardsComponent
      title="Ferramentas"
      description=" Componentes funcionais e personalizados para turbinar seus projetos com precisão e eficiência."
      button="Ver Mais"
      cards={cards}
    />
  );
}

export default SectionFive;
