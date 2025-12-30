import { useState, useEffect } from "react";

export function useGeolocation() {
  const [data, setData] = useState({
    latitude: null,
    longitude: null,
    street: null,
    postalCode: null,
    error: null,
    loading: true,
    skipped: false, // 🔹 nova flag
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setData((prev) => ({ 
        ...prev, 
        error: "Geolocalização não suportada", 
        loading: false 
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          const lat = latitude.toFixed(6);
          const lon = longitude.toFixed(6);

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "pt-BR",
                "User-Agent": "MyReactApp/1.0 (https://example.com)"
              }
            }
          );

          const result = await response.json();
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
            loading: false,
            skipped: false,
          });
        } catch (err) {
          setData((prev) => ({ ...prev, loading: false, error: err.message }));
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setData((prev) => ({
            ...prev,
            loading: false,
            skipped: false, // usuário negou, mas ainda pode pular explicitamente
            error: "Permissão negada",
          }));
        } else {
          setData((prev) => ({
            ...prev,
            loading: false,
            error: err.message,
          }));
        }
      }
    );
  }, []);

  // Função para o usuário "continuar sem localização"
  const skipLocation = () => {
    setData((prev) => ({
      ...prev,
      latitude: null,
      longitude: null,
      street: null,
      postalCode: null,
      error: null,
      loading: false,
      skipped: true,
    }));
  };

  return { ...data, skipLocation };
}
