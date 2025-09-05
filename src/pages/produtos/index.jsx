import styles from "./styles.module.css";

import Filtro from "../../components/produtos/filtro";
import Products from "../../components/produtos/products";

import { useContext, useState } from "react";
import { DataContext } from "../../context/dataContext";
import { useGeolocation } from "../../hooks/useGeolocation";

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

function Produtos() {
  const { data, loading } = useContext(DataContext);
  const userLocation = useGeolocation(); // { latitude, longitude, error }

  const [filters, setFilters] = useState({
    categorias: [],
    materiais: [],
    cor: null,
    preco: 0,
  });

  if (loading || !data || !userLocation.latitude) return null;

  // Junta todos os produtos
  const products = Object.values(data).flat();

  // Adiciona distância
  const productsWithDistance = products.map((product) => {
    const supplier = product.supplier;
    const distance =
      supplier?.latitude && supplier?.longitude
        ? getDistance(
            userLocation.latitude,
            userLocation.longitude,
            supplier.latitude,
            supplier.longitude
          )
        : Infinity;
    return { ...product, distance };
  });

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

  // Aplica filtros
  function filterProducts(products, filters) {
    return products.filter((product) => {
      if (
        filters.categorias.length > 0 &&
        !filters.categorias.includes(product.category)
      ) {
        return false;
      }

      if (filters.materiais.length > 0) {
        const temMaterial = product.material.some((m) =>
          filters.materiais.includes(m)
        );
        if (!temMaterial) return false;
      }

      if (filters.cor) {
        const temCor = product.colors.includes(filters.cor);
        if (!temCor) return false;
      }

      if (filters.preco) {
        const precoNumber = Number(product.price.replace(",", "."));
        if (precoNumber > filters.preco) return false;
      }

      return true;
    });
  }

  // Ordena por distância
  const sortedProducts = filterProducts(productsWithDistance, filters).sort(
    (a, b) => a.distance - b.distance
  );

  return (
    <div className={styles.container}>
      <Filtro filters={filters} setFilters={setFilters} />
      <Products
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
        products={sortedProducts}
      />
    </div>
  );
}

export default Produtos;
