export type GeocodingResult = {
  lat: number;
  lng: number;
  displayName: string;
  shortName: string;
};

/**
 * Searches for Canadian addresses, postal codes, and landmarks using
 * OpenStreetMap Nominatim with an automatic fallback to Photon (Komoot).
 */
export async function searchCanadianAddress(query: string): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 3) return [];

  // 1. Try Nominatim (Primary)
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=ca&addressdetails=1&limit=5&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: {
          lat: string;
          lon: string;
          display_name: string;
          name?: string;
          address?: Record<string, string>;
        }) => {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const addr = item.address || {};
          
          // Formulate a clean short name (e.g. "40 New Delhi Dr, Markham")
          const parts: string[] = [];
          if (addr.house_number && addr.road) {
            parts.push(`${addr.house_number} ${addr.road}`);
          } else if (addr.road) {
            parts.push(addr.road);
          } else if (item.name) {
            parts.push(item.name);
          }

          const cityPart = addr.city || addr.town || addr.municipality || addr.village || addr.county;
          if (cityPart && !parts.includes(cityPart)) {
            parts.push(cityPart);
          }
          if (addr.state) {
            parts.push(addr.state);
          }
          if (addr.postcode) {
            parts.push(addr.postcode);
          }

          const shortName = parts.length > 0 ? parts.join(', ') : item.display_name.split(',').slice(0, 3).join(', ');

          return {
            lat,
            lng,
            displayName: item.display_name,
            shortName
          };
        });
      }
    }
  } catch (err) {
    console.warn('Nominatim geocoding failed, trying fallback...', err);
  }

  // 2. Fallback: Photon (Komoot)
  try {
    const fallbackUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=5`;
    const res = await fetch(fallbackUrl);
    if (res.ok) {
      const geojson = await res.json();
      if (geojson && Array.isArray(geojson.features)) {
        return geojson.features
          .filter((f: { properties?: { countrycode?: string; country?: string } }) => {
            const cc = f.properties?.countrycode?.toUpperCase();
            const country = f.properties?.country?.toLowerCase();
            return cc === 'CA' || country === 'canada';
          })
          .map((f: {
            geometry: { coordinates: [number, number] };
            properties: {
              housenumber?: string;
              street?: string;
              name?: string;
              city?: string;
              state?: string;
              postcode?: string;
            };
          }) => {
            const [lng, lat] = f.geometry.coordinates;
            const props = f.properties;
            const parts: string[] = [];
            if (props.housenumber && props.street) {
              parts.push(`${props.housenumber} ${props.street}`);
            } else if (props.street) {
              parts.push(props.street);
            } else if (props.name) {
              parts.push(props.name);
            }
            if (props.city) parts.push(props.city);
            if (props.state) parts.push(props.state);
            if (props.postcode) parts.push(props.postcode);

            const label = parts.join(', ');
            return {
              lat,
              lng,
              displayName: label,
              shortName: label
            };
          });
      }
    }
  } catch (err) {
    console.warn('Photon geocoding fallback failed:', err);
  }

  return [];
}
