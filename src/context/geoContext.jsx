import { createContext, useContext, useState, useEffect } from "react";

const GeoContext = createContext();

export function GeoProvider({ children }) {
  const [geo, setGeo] = useState({
    latitude: null,
    longitude: null,
    street: null,
    postalCode: null,
    loading: true,
    error: null,
    permissionDenied: false,
    skipped: false,
  });

  const skipLocation = () =>
    setGeo((prev) => ({ ...prev, loading: false, skipped: true }));

  useEffect(() => {
    if (geo.skipped) return;
    
    if (!navigator.geolocation) {
      setGeo((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocalização não suportada",
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
                "User-Agent": "MyReactApp/1.0 (https://example.com)",
              },
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

          setGeo({
            latitude: lat,
            longitude: lon,
            street,
            postalCode: address.postcode || null,
            loading: false,
            error: null,
            permissionDenied: false,
            skipped: false,
          });
        } catch (err) {
          setGeo((prev) => ({ ...prev, loading: false, error: err.message }));
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeo((prev) => ({
            ...prev,
            loading: false,
            permissionDenied: true,
          }));
        } else {
          setGeo((prev) => ({
            ...prev,
            loading: false,
            error: err.message,
          }));
        }
      }
    );
  }, []);

  return (
    <GeoContext.Provider value={{ ...geo, skipLocation }}>
      {children}
    </GeoContext.Provider>
  );
}

export function useGeo() {
  return useContext(GeoContext);
}
