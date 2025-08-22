import styles from "./styles.module.css";

import Filtro from "../../components/produtos/filtro";
import Products from "../../components/produtos/products";

import { useContext, useState } from "react";
import { DataContext } from "../../context/dataContext";

function Produtos() {
  const { data, loading } = useContext(DataContext);

  const [filters, setFilters] = useState({
    categorias: [],
    materiais: [],
    cor: null,
    preco: 0,
  });

  if (loading || !data) return null;

  // Junta todos os produtos em um array só
  const products = [
    ...data.lancamentosRecentes,
    ...data.brinquedos,
    ...data.ferramentas,
    ...data.casaEDecoracao,
    ...data.outros,
  ];

  // Função para remover filtros
  function handleRemoveFilter(type, value) {
    setFilters((prev) => {
      switch (type) {
        case "categorias":
          return {
            ...prev,
            categorias: prev.categorias.filter((c) => c !== value),
          };
        case "materiais":
          return {
            ...prev,
            materiais: prev.materiais.filter((m) => m !== value),
          };
        case "cor":
          return { ...prev, cor: null };
        case "preco":
          return { ...prev, preco: null };
        default:
          return prev;
      }
    });
  }

  // Função que aplica os filtros
  function filterProducts(products, filters) {
    return products.filter((product) => {
      // Filtra categorias
      if (
        filters.categorias.length > 0 &&
        !filters.categorias.includes(product.category)
      ) {
        return false;
      }

      // Filtra materiais
      if (filters.materiais.length > 0) {
        const temMaterial = product.material.some((m) =>
          filters.materiais.includes(m)
        );
        if (!temMaterial) return false;
      }

      // Filtra cores
      if (filters.cor) {
        const temCor = product.colors.includes(filters.cor);
        if (!temCor) return false;
      }

      // Filtra preço
      if (filters.preco) {
        const precoNumber = Number(product.price.replace(",", "."));
        if (precoNumber > filters.preco) return false;
      }

      return true;
    });
  }

  // Produtos já filtrados
  const filteredProducts = filterProducts(products, filters);

  return (
    <div className={styles.container}>
      <Filtro filters={filters} setFilters={setFilters} />
      <Products
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
        products={filteredProducts}
      />
    </div>
  );
}

export default Produtos;
