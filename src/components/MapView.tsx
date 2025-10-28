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

L.Icon.Default.mergeOptions({
    iconUrl: "/leaflet/marker-icon.png",
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    shadowUrl: "/leaflet/marker-shadow.png"
});

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
                        ? "Location permission is blocked. Enable it in your browser settings and try again."
                        : "We couldn't get your location. Please try again."
                );
            },
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
        );
    };

    const nearest3 = useMemo(() => {
        if (!userPos || !places.length) return [];
        const u = normPos(userPos);
        return [...places]
            .map(p => ({ p, d: haversineKm(u, [p.lat, p.lng]) }))
            .sort((a, b) => a.d - b.d)
            .slice(0, 3);
    }, [userPos, places]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !userPos || nearest3.length === 0) return;

        const uPair = toTuple(userPos);
        const u = L.latLng(uPair[0], uPair[1]);
        const pts = nearest3.map(({ p }) => L.latLng(p.lat, p.lng));
        const bounds = L.latLngBounds([L.latLng(uPair[0], uPair[1]), ...pts]).pad(0.2);

        map.fitBounds(bounds);

        if (!highlightsRef.current) {
            highlightsRef.current = L.layerGroup().addTo(map);
        } else {
            highlightsRef.current.clearLayers();
        }
        nearest3.forEach(({ p }) => {
            L.circleMarker([p.lat, p.lng], {
                radius: 8,
                color: "#021733",
                weight: 2,
                fillColor: "#ffffff",
                fillOpacity: 1
            }).addTo(highlightsRef.current!);
        });

        L.popup({ offset: [0, -8] })
            .setLatLng(u)
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
                        type: (p.type ?? "Masjid") as PlaceType,
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
                    <LibertyLayer/>

                    {userPos && (
                        <Marker position={userPos} icon={pinIcon("#ef4444")}>
                            <Popup>You are here</Popup>
                        </Marker>
                    )}
                    {places.map((p) => (
                        <Marker key={p.id} position={[p.lat, p.lng]} icon={pinIcon(TYPE_COLOR[p.type] ?? "#64748b")}>
                            <Popup>
                                <div className="space-y-1">
                                    <div className="font-semibold text-[var(--ink)]">{p.name}</div>
                                    {p.address && <div className="text-sm text-[var(--muted)]">{p.address}</div>}
                                    {p.notes && <div className="text-sm">{p.notes}</div>}
                                    <div className="pt-1 flex gap-2">
                                        <a className="underline text-[var(--brand)]"
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                                            target="_blank" rel="noreferrer">Directions</a>
                                        {p.website && <a className="underline text-[var(--brand)]" href={p.website} target="_blank" rel="noreferrer">Website</a>}
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
