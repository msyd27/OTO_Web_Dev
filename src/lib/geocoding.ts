export type GeocodingResult = {
  lat: number;
  lng: number;
  displayName: string;
  shortName: string;
};

/**
 * Regex matching standard Canadian Postal Codes (e.g. "L6B 0E3", "L6B0E3", "l6b-0e3").
 */
export const CANADIAN_POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

/**
 * Regex matching postal codes within full address strings to strip unreliable crowdsourced OSM data.
 */
export const POSTAL_CODE_IN_STRING_REGEX = /\b[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d\b/gi;

/**
 * Strips inaccurate/extrapolated Canadian postal codes from OSM display strings
 * while maintaining clean comma separation and formatting.
 */
export function stripPostalCode(text: string): string {
  if (!text) return '';
  const cleaned = text
    .replace(POSTAL_CODE_IN_STRING_REGEX, '')
    .replace(/\s*,\s*,\s*/g, ', ')
    .replace(/,\s*,/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .replace(/,\s*Canada$/i, ', Canada')
    .replace(/^[,\s]+|[,\s]+$/g, '')
    .trim();
  return cleaned || text;
}

/**
 * Searches for Canadian addresses, postal codes, and landmarks.
 * 1. Formats raw postal codes with " Canada" to force regional recognition.
 * 2. Enforces strict country bounding (&countrycodes=ca / countryCode=CAN).
 * 3. Strips unreliable crowdsourced postal codes from display strings.
 * 4. Gracefully falls back to ArcGIS and Photon when Nominatim lacks coverage.
 */
export async function searchCanadianAddress(query: string): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 3) return [];

  // Smart Query Formatting: append " Canada" for postal codes to force regional geocoding
  const isPostalCode = CANADIAN_POSTAL_CODE_REGEX.test(trimmed);
  const formattedQuery = isPostalCode ? `${trimmed.toUpperCase()} Canada` : trimmed;

  // 1. Try Nominatim (Primary OSM provider with strict countrycodes=ca)
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=ca&addressdetails=1&limit=5&q=${encodeURIComponent(formattedQuery)}`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'CanadaMasjidMap/1.0'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Filter out false-positive matches (e.g. street named 'Canada' in another province when searching a postal code)
        const valid = data.filter((item: { display_name?: string; address?: Record<string, string> }) => {
          if (isPostalCode) {
            const disp = (item.display_name || '').toLowerCase();
            const cleanP = trimmed.replace(/[\s-]+/g, '').toLowerCase();
            const pc = (item.address?.postcode || '').replace(/[\s-]+/g, '').toLowerCase();
            return pc.includes(cleanP) || disp.includes(cleanP);
          }
          return true;
        });

        if (valid.length > 0) {
          return valid.map((item: {
            lat: string;
            lon: string;
            display_name: string;
            name?: string;
            address?: Record<string, string>;
          }) => {
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lon);
            const addr = item.address || {};

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

            const rawShort = parts.length > 0 ? parts.join(', ') : item.display_name.split(',').slice(0, 3).join(', ');
            const shortName = isPostalCode ? trimmed.toUpperCase() : stripPostalCode(rawShort);
            const displayName = stripPostalCode(item.display_name);

            return {
              lat,
              lng,
              displayName,
              shortName
            };
          });
        }
      }
    }
  } catch (err) {
    console.warn('Nominatim geocoding failed, trying fallback...', err);
  }

  // 2. Fallback: ArcGIS World Geocoding (Direct Canadian postal code & parcel support without API key)
  try {
    const arcUrl = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&countryCode=CAN&maxLocations=5&singleLine=${encodeURIComponent(formattedQuery)}`;
    const arcRes = await fetch(arcUrl);
    if (arcRes.ok) {
      const arcData = await arcRes.json();
      if (arcData && Array.isArray(arcData.candidates) && arcData.candidates.length > 0) {
        return arcData.candidates
          .filter((c: { score?: number }) => (c.score ?? 0) >= 60)
          .map((c: { address: string; location: { x: number; y: number } }) => {
            const cleanAddr = stripPostalCode(c.address);
            return {
              lat: c.location.y,
              lng: c.location.x,
              displayName: cleanAddr,
              shortName: isPostalCode ? trimmed.toUpperCase() : cleanAddr
            };
          });
      }
    }
  } catch (err) {
    console.warn('ArcGIS fallback failed, trying Photon...', err);
  }

  // 3. Fallback: Photon (Komoot)
  try {
    const fallbackUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(formattedQuery)}&limit=5`;
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

            const label = stripPostalCode(parts.join(', '));
            return {
              lat,
              lng,
              displayName: label,
              shortName: isPostalCode ? trimmed.toUpperCase() : label
            };
          });
      }
    }
  } catch (err) {
    console.warn('Photon geocoding fallback failed:', err);
  }

  return [];
}
