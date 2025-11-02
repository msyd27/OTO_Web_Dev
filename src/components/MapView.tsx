"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet";
import { useMap } from "react-leaflet";
import type { FeatureCollection, Feature, Point } from "geojson";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import LibertyLayer from "./LibertyLayer";

const MapContainer = dynamic(async () => (await import("react-leaflet")).MapContainer, { ssr: false });
const TileLayer = dynamic(async () => (await import("react-leaflet")).TileLayer, { ssr: false });
const Marker = dynamic(async () => (await import("react-leaflet")).Marker, { ssr: false });
const Popup = dynamic(async () => (await import("react-leaflet")).Popup, { ssr: false });

function crescentStarIcon(color: string) {
   const svg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="2048" height="2048" style="shape-rendering:geometricPrecision;text-rendering:geometricPrecision;image-rendering:optimizeQuality;fill-rule:evenodd;clip-rule:evenodd">
<defs>
<style>.fil0{fill:#f60}.fil2,.fil3{fill:#424242;fill-rule:nonzero}.fil3{fill:#64b5f6}</style>
</defs>
<g id="Layer_x0020_1"><path class="fil0" d="M1615.88 1408v224zM1487.88 1408v224zM1359.88 1408v224zM1231.88 1408v224zM1103.88 1408v224zM975.882 1408h-.003v224h.003zM847.882 1408h-.002v224h.002zM719.884 1408h-.003v224h.003z"/>
<path d="M571.522 1232h1192.72c17.673 0 32 14.328 32 32v512.002c0 17.673-14.327 32-32 32H571.522c-17.673 0-32-14.327-32-32V1264c0-17.673 14.327-32.001 32-32.001zm180.362 144v288h-64.002v-288h64.002zm127.999 0v288h-64.002v-288h64.002zm128 0v288h-64.002v-288h64.002zm128 0v288h-64.002v-288h64.002zm128 0v288h-64.002v-288h64.002zm128 0v288h-64.002v-288h64.002zm128 0v288h-64.002v-288h64.002zm128 0v288h-64.002v-288h64.002z" style="fill:#424242"/>
<path class="fil2" d="M370.716 1072h201.046c17.673 0 32 14.328 32 32v672.003c0 17.673-14.327 32-32 32H370.716c-17.673 0-32-14.327-32-32V1104c0-17.673 14.327-32.001 32-32.001zM554.397 1040H388.082c-17.673 0-32-14.328-32-32V593.283c0-17.673 14.327-32 32-32h166.315c17.673 0 32 14.327 32 32V1008c0 17.673-14.327 32.001-32 32.001zM497.379 262.847l86.741 222.872.098-.038c6.41 16.47-1.745 35.019-18.215 41.429a31.905 31.905 0 0 1-12.236 2.179H388.082c-17.673 0-32-14.328-32-32.001 0-4.61.976-8.992 2.731-12.952l77.778-222.833 30.126 10.5-30.213-10.546c5.824-16.686 24.073-25.49 40.759-19.667 10.073 3.516 17.273 11.562 20.116 21.057z"/>
<path class="fil2" d="M626.717 1136H316.434c-13.652.292-26.487-8.246-31.031-21.881l30.358-10.12-30.25 10-31.007-93.02a31.874 31.874 0 0 1-2.744-12.98c0-17.673 14.328-32 32.001-32h374.38c3.538-.064 7.147.46 10.695 1.642 16.766 5.588 25.826 23.712 20.239 40.478l-.133-.044-31.032 93.096c-3.256 14.22-15.986 24.83-31.193 24.83zM603.263 625.289H339.767c-14.172.252-27.298-9.005-31.34-23.285l30.79-8.716-30.75 8.626-26.573-93.886a31.932 31.932 0 0 1-1.85-10.74c0-17.673 14.329-32 32.001-32h317.821a31.99 31.99 0 0 1 9.285 1.21c17.004 4.813 26.888 22.501 22.075 39.505l-.06-.017-26.602 93.982c-3.074 14.467-15.92 25.32-31.3 25.32z"/>
<path class="fil3" d="M736 1200v-80c0-17.674 14.328-32.002 32-32.002h928.242c17.673 0 32 14.328 32 32.001V1200H736.002z"/><path class="fil3" d="M1261.09 626.683c-5.263-11.438-16.472-18.463-28.964-18.565l-.436.004c-12.25.155-23.424 7.404-28.528 18.56-41.142 86.397-113.661 119.372-196.553 155.507-129.617 56.505-245.032 106.82-185.347 345.564 4.28 17.12 21.63 27.53 38.75 23.25 17.12-4.28 27.53-21.63 23.25-38.75-1.7-6.8-3.192-13.383-4.53-19.8h706.787c-1.337 6.417-2.83 13-4.53 19.8-4.28 17.12 6.13 34.47 23.25 38.75 17.12 4.28 34.47-6.13 38.751-23.25 59.685-238.742-55.73-289.058-185.347-345.564-81.974-35.737-155.974-69.84-196.553-155.506z"/>
</g>
<path style="fill:none" d="M0 0h2048v2048H0z"/>
</svg>
  `);
  return L.icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${svg}`,
    iconSize: [26, 34], // smaller, proportional
    iconAnchor: [13, 33],
    popupAnchor: [0, -28],
  });
}

function madrasahIcon(color: string) {
  const svg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26">
    <!-- circular background -->
    <circle cx="13" cy="13" r="12" fill="${color}" />

    <!-- larger graduation cap -->
    <!-- mortarboard (top) -->
    <path
      d="M13 7.5L6.5 10.5l6.5 3 6.5-3L13 7.5z"
      fill="#ffffff"
    />
    <!-- cap base / underside -->
    <path
      d="M9 11.5v3.2c0 .7.5 1.3 1.2.7.7.4 1.8.8 2.8.8s2.1-.3 2.8-.8c.7.6 1.2 0 1.2-.8v-3l-4 1.8-4-1.9z"
      fill="#ffffff"
    />
    <!-- tassel -->
    <path
      d="M18.8 10.8v2.8c0 .5.4.9.8.9s.8-.4.8-.9v-3.3l-1.6.5z"
      fill="#ffffff"
    />
  </svg>
  `);

  return L.icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${svg}`,
    iconSize: [26, 26],      // same circle size
    iconAnchor: [13, 13],    // centered
    popupAnchor: [0, -13],
  });
}




type PlaceType = "Masjid" | "Musallah" | "Madrasah";
type Place = {
    id: string;
    name: string;
    type: PlaceType;
    lat: number;
    lng: number;
    address?: string;
    notes?: string;
    website?: string;
    iconUrl?: string;
};

const TYPE_COLOR: Record<PlaceType, string> = {
    Masjid: "#0ea5e9",
    Musallah: "#a855f7",
    Madrasah: "#eab308"
};

function SetMapRef({ onReady }: { onReady: (m: L.Map) => void }) {
    const map = useMap();
    useEffect(() => { onReady(map); }, [map, onReady]);
    return null;
}

function normPos(pos: L.LatLngExpression): [number, number] {
    const p = L.latLng(pos);
    return [p.lat, p.lng];
}

function haversineKm(a: [number, number], b: [number, number]) {
    const R = 6371;
    const dLat = (b[0] - a[0]) * Math.PI / 180;
    const dLng = (b[1] - a[1]) * Math.PI / 180;
    const la1 = a[0] * Math.PI / 180, la2 = b[0] * Math.PI / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}

function toTuple(pos: L.LatLngExpression): [number, number] {
    const p = L.latLng(pos);
    return [p.lat, p.lng];
}

// Some My Maps exports put the site in `website` or `Website`,
// others embed it inside `description` as an <a href="...">
function extractWebsite(props: Record<string, unknown>): string | undefined {
    const direct = (props.website ?? props.Website ?? props.url ?? props.URL) as string | undefined;
    if (direct) return direct;

    const desc = (props.description ?? props.Description) as string | undefined;
    if (!desc) return undefined;

    // very light HTML link scrape
    const m = desc.match(/href="([^"]+)"/i) || desc.match(/(https?:\/\/[^\s"<]+)/i);
    return m?.[1];
}

function inferType(p: Record<string, unknown>): PlaceType {
    const name = (p.name ?? "").toString().toLowerCase();
    const styleUrl = (p.styleUrl ?? "").toString().toLowerCase();

    if (styleUrl.includes("f57c00")) {
        return "Madrasah";
    }

    return "Masjid";
}

function getLeafletIconForPlace(place: Place): L.Icon {
    if (place.type === "Madrasah") {
        // orange / school icon
        return madrasahIcon("#f57c00");
    }

    // Masjid + Musallah use the crescent/star icon in blue
    return crescentStarIcon("#1d4ed8");
}

export default function MapView() {
    const [places, setPlaces] = useState<Place[]>([]);
    const [userPos, setUserPos] = useState<LatLngExpression | null>(null);
    const mapRef = useRef<L.Map | null>(null);

    const highlightsRef = useRef<L.LayerGroup | null>(null);
    const [panelOpen, setPanelOpen] = useState(true);

    // prompt to enable location if auto-get fails or device location is off
    const [needsUserGesture, setNeedsUserGesture] = useState(false);
    const [geoMsg, setGeoMsg] = useState<string | null>(null);

    const requestLocation = () => {
        if (!("geolocation" in navigator)) {
            setGeoMsg("Location not supported on this device.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords: LatLngExpression = [pos.coords.latitude, pos.coords.longitude];
                setUserPos(coords);
                mapRef.current?.setView(coords, 12);
                setNeedsUserGesture(false);
                setGeoMsg(null);
            },
            (err) => {
                setNeedsUserGesture(true);
                setGeoMsg(
                    err.code === err.PERMISSION_DENIED
                        ? "Location permission is blocked, enable location for your browser in settings."
                        : "We couldn't get your location. Please try again."
                );
            },
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
        );
    };

    const nearest3 = useMemo(() => {
        if (!userPos || !places.length) return [];
        const u = normPos(userPos);
        return [...places] // <-- fixed
            .map(p => ({ p, d: haversineKm(u, [p.lat, p.lng]) }))
            .sort((a, b) => a.d - b.d)
            .slice(0, 3);
    }, [userPos, places]);

useEffect(() => {
    const map = mapRef.current;
    if (!map || !userPos || nearest3.length === 0) return;

    // wrap all logic so it only runs after Leaflet is fully initialized
    map.whenReady(() => {
        const uPair = toTuple(userPos);
        const u = L.latLng(uPair[0], uPair[1]);

        const pts = nearest3.map(({ p }) => L.latLng(p.lat, p.lng));
        const bounds = L.latLngBounds([u, ...pts]).pad(0.2);

        // now safe
        map.fitBounds(bounds);

        // marker highlights for nearest 3
        if (!highlightsRef.current) {
            highlightsRef.current = L.layerGroup().addTo(map);
        } else {
            highlightsRef.current.clearLayers();
        }

        nearest3.forEach(({ p }) => {
            L.circleMarker([p.lat, p.lng], {
                radius: 6,
                color: "#021733",
                weight: 2,
                fillColor: "#ffffff",
                fillOpacity: 1,
            }).addTo(highlightsRef.current!);
        });

        // optional popup prep if you plan to open later
        // L.popup({ offset: [0, -8] }).setLatLng(u);
    });
}, [userPos, nearest3]);


    useEffect(() => {
        (async () => {
            const r = await fetch(`/locations.json?v=${Date.now()}`, { cache: "no-store" });
            const gj: FeatureCollection = await r.json();

            const pts: Place[] = gj.features
                .filter((f): f is Feature<Point> => f.geometry?.type === "Point")
                .map((f) => {
                    const [lng, lat] = f.geometry.coordinates;
                    const p = f.properties ?? {};
                    return {
                        id: (p.id ?? p.place_id ?? p.name ?? `${lat},${lng}`) as string,
                        name: (p.name ?? "Unnamed").toString(),
                        type: inferType(p),
                        lat,
                        lng,
                        address: p.address as string | undefined,
                        notes: p.notes as string | undefined,
                        website: p.website as string | undefined
                    };
                });

            setPlaces(pts);
        })();
    }, []);

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setGeoMsg("Location not supported on this device.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords: LatLngExpression = [pos.coords.latitude, pos.coords.longitude];
                setUserPos(coords);
                mapRef.current?.setView(coords, 12);
                setNeedsUserGesture(false);
                setGeoMsg(null);
            },
            () => {
                setNeedsUserGesture(true);
                setGeoMsg("Enable location to see the three closest masaajid near you.");
            },
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 8000 }
        );
    }, []);

    useEffect(() => {
        (async () => {
            const r = await fetch(`/locations.json?v=${Date.now()}`, { cache: "no-store" });
            const gj: FeatureCollection = await r.json();

            const pts: Place[] = gj.features
                .filter((f): f is Feature<Point> => f.geometry?.type === "Point")
                .map((f) => {
                    const [lng, lat] = f.geometry.coordinates;
                    const p = (f.properties ?? {}) as Record<string, unknown>;

                    return {
                        id: (p.id ?? p.place_id ?? p.name ?? `${lat},${lng}`) as string,
                        name: (p.name ?? "Unnamed").toString(),
                        type: inferType(p),                        // <-- use our smarter classifier
                        lat,
                        lng,
                        address: p.address as string | undefined,
                        notes: p.notes as string | undefined,
                        website: extractWebsite(p),               // <-- tries to pull URL from description, etc.
                        // DO NOT copy p.icon here, we don't want the blank white Google marker
                    };
                });

            setPlaces(pts);
        })();
    }, []);



    const fallbackCenter: LatLngExpression = [43.6532, -79.3832];
    const bounds: LatLngBoundsExpression | null = useMemo(() => {
        if (userPos || !places.length) return null;
        const b = L.latLngBounds(places.map(p => [p.lat, p.lng]));
        return b.pad(0.1);
    }, [places, userPos]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !bounds) return;
        map.fitBounds(bounds);
    }, [bounds]);

    return (
        <div className="rounded-2xl border border-[color:rgb(0_0_0_/_0.06)] overflow-hidden">
            <div className="p-3 bg-white flex items-center justify-between">
                <div className="text-[var(--ink)] font-semibold">Masjid & Musallah Map</div>
            </div>

            <div className="relative z-0">
                <MapContainer
                    center={fallbackCenter}
                    zoom={9}
                    style={{ height: 520, width: "100%" }}
                >
                    <SetMapRef onReady={(m) => { mapRef.current = m; }} />
                    <LibertyLayer />

                    {userPos && (
                        <Marker position={userPos} icon={pinIcon("#ef4444")}>
                            <Popup>You are here</Popup>
                        </Marker>
                    )}
                    {places.map((p) => (
                        <Marker
                            key={p.id}
                            position={[p.lat, p.lng]}
                            icon={getLeafletIconForPlace(p)}
                        >
                            <Popup>
                                <div className="space-y-1">
                                    <div className="font-semibold text-[var(--ink)]">{p.name}</div>
                                    {p.address && (
                                        <div className="text-sm text-[var(--muted)]">{p.address}</div>
                                    )}
                                    {p.notes && <div className="text-sm">{p.notes}</div>}
                                    <div className="text-xs text-[var(--muted)]">{p.type}</div>
                                    <div className="pt-1 flex gap-2">
                                        <a
                                            className="underline text-[var(--brand)]"
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Directions
                                        </a>
                                        {p.website && (
                                            <a
                                                className="underline text-[var(--brand)]"
                                                href={p.website}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Website
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                </MapContainer>

                {userPos && nearest3.length > 0 && (
                    <div className="pointer-events-none absolute top-3 right-3 z-[900] w-[clamp(200px,80%,420px)]">
                        <div className="pointer-events-auto rounded-2xl border bg-white/95 backdrop-blur shadow-lg overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setPanelOpen(o => !o)}
                                aria-expanded={panelOpen}
                                aria-controls="closest-panel"
                                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[var(--brand-50)]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                            >
                                <span className="text-sm font-semibold text-[var(--ink)]">Closest to you</span>
                                <svg
                                    className={`h-4 w-4 text-[var(--muted)] transition-transform ${panelOpen ? "" : "-rotate-90"}`}
                                    viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                                >
                                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                </svg>
                            </button>

                            {panelOpen && (
                                <div id="closest-panel" className="px-3 py-3">
                                    <ul className="space-y-2">
                                        {nearest3.map(({ p, d }) => (
                                            <li key={p.id} className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium text-[var(--ink)] text-sm">
                                                        {p.name}
                                                    </div>
                                                    {p.address && (
                                                        <div className="truncate text-xs text-[var(--muted)]">
                                                            {p.address}
                                                        </div>
                                                    )}
                                                    <div className="text-xs text-[var(--muted)] text-left">
                                                        {d.toFixed(1)} km away
                                                    </div>

                                                </div>
                                                <a
                                                    className="shrink-0 rounded-lg border px-2 py-1 text-xs text-[var(--brand)] hover:bg-[var(--brand-50)]"
                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                                                    target="_blank" rel="noreferrer"
                                                    title="Open in Google Maps"
                                                >
                                                    Directions
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!userPos && (
                    <div
                        className="pointer-events-none absolute top-3 right-3 z-[900] w-[clamp(200px,40%,420px)]"
                    >
                        <div className="pointer-events-auto rounded-2xl border bg-white/95 backdrop-blur shadow-lg overflow-hidden">
                            <button
                                type="button"
                                onClick={requestLocation}
                                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[var(--brand-50)]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                            >
                                <span className="text-sm font-semibold text-[var(--ink)]">
                                    Enable location
                                </span>
                                <svg className="h-4 w-4 text-[var(--muted)]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M12 2.25a.75.75 0 01.75.75v2.26a6.75 6.75 0 016 6h2.25a.75.75 0 010 1.5H18.75a6.75 6.75 0 01-6 6v2.25a.75.75 0 01-1.5 0V18.75a6.75 6.75 0 01-6-6H2.25a.75.75 0 010-1.5H4.5a6.75 6.75 0 016-6V3a.75.75 0 01.75-.75zm0 5.25a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
                                </svg>
                            </button>

                            <div className="px-3 pb-3">
                                <p className="text-sm text-[var(--muted)]">
                                    {geoMsg}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function pinIcon(color: string) {
    const svg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48">
      <path fill="${color}" d="M16 0C7.7 0 1 6.7 1 15c0 11.3 14 32.5 15 33.9.2.4.8.4 1 0C17 47.5 31 26.3 31 15 31 6.7 24.3 0 16 0z"/>
      <circle cx="16" cy="15" r="6" fill="white"/>
    </svg>`
    );
    return L.icon({
        iconUrl: `data:image/svg+xml;charset=UTF-8,${svg}`,
        iconSize: [24, 36],
        iconAnchor: [12, 36],
        popupAnchor: [0, -28],
        shadowUrl: "/leaflet/marker-shadow.png",
        shadowSize: [41, 41],
        shadowAnchor: [12, 41]
    });
}
