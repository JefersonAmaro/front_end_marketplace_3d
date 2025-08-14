import { useContext } from "react";
import { DataContext } from "../../../context/dataContext";

import CardsComponent from "../../cardsComponent";

import Loading from "../../loading";
function SectionFour() {
  const { data, loading } = useContext(DataContext);
  const cards = data.casaEDecoracao || [];

  if (loading || !data) {
    return <Loading />;
  }
    
      return (
        <CardsComponent title="Casa e Decoração" description="Ferramentas e peças para tornar seu ambiente mais agradavel." button="Ver Mais" cards={cards} />
      );  
}

export default SectionFour;