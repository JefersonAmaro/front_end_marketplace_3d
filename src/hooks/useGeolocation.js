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
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
          );
          const result = await response.json();

          setData({
            latitude,
            longitude,
            street: result.address.road || result.address.neighbourhood || null,
            postalCode: result.address.postcode || null,
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
