import { useContext } from "react";
import { DataContext } from "../../../context/dataContext";

import Loading from "../../loading";

import CardsComponent from "../../cardsComponent";

function SectionTwo() {
  const { data, loading } = useContext(DataContext);
  const cards = data?.lancamentosRecentes || [];

  if (loading || !data) {
    return <Loading />;
  }

  return (
    <CardsComponent
      title="Lançamentos Recentes"
      description="Peças que acabaram de sair da impressora. Confira as novidades fresquinhas do nosso catálogo!"
      button="Ver Mais"
      cards={cards}
    />
  );
}

export default SectionTwo;
