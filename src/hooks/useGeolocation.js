import { useState, useEffect } from "react";

export function useGeolocation() {
  const [data, setData] = useState({
    latitude: null,
    longitude: null,
    street: null,
    postalCode: null,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setData((prev) => ({ ...prev, error: "Geolocalização não suportada" }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          // Arredonda as coordenadas (para evitar inconsistências)
          const lat = latitude.toFixed(6);
          const lon = longitude.toFixed(6);

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "pt-BR",
                "User-Agent": "MyReactApp/1.0 (https://example.com)" // Nominatim exige um User-Agent válido
              }
            }
          );

          const result = await response.json();

          console.log(result);

          const address = result.address || {};
          const street =
            address.road ||
            address.pedestrian ||
            address.neighbourhood ||
            address.suburb ||
            address.quarter ||
            address.village ||
            address.city_district ||
            result.display_name?.split(",")[0] ||
            "Endereço não identificado";

          setData({
            latitude: lat,
            longitude: lon,
            street,
            postalCode: address.postcode || null,
            error: null,
          });
        } catch (err) {
          setData((prev) => ({ ...prev, error: err.message }));
        }
      },
      (err) => setData((prev) => ({ ...prev, error: err.message }))
    );
  }, []);

  return data;
}
