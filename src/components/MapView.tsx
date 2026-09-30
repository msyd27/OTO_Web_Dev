"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, } from "react-leaflet";
import type { FeatureCollection, Feature, Point } from "geojson";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import LibertyLayer from "./LibertyLayer";
import { FullscreenControl } from 'react-leaflet-fullscreen';
import 'react-leaflet-fullscreen/styles.css';
import { locationData } from "@/lib/locationData";
import { searchCanadianAddress, type GeocodingResult } from "@/lib/geocoding";

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
        iconSize: [26, 34],
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
        iconSize: [26, 26],
        iconAnchor: [13, 13],
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
    city: string[];
    province: string; 
    region?: string[];
    address?: string;
    notes?: string;
    website?: string;
    iconUrl?: string;
    place_id?: string;
};

type LeafletMarkerWithMap = L.Marker & { _map?: L.Map };
type LeafletMapWithLoaded = L.Map & { _loaded?: boolean };

const TYPE_COLOR: Record<PlaceType, string> = {
    Masjid: "#0ea5e9",
    Musallah: "#a855f7",
    Madrasah: "#eab308"
};

const PROVINCE_BOUNDS: Record<string, L.LatLngBoundsExpression> = {
    "Alberta": [[49.50, -117.00], [57.00, -110.00]],
    "British Columbia": [[48.00, -135.00], [57.00, -114.00]],
    "Manitoba": [[49.00, -101.00], [56.00, -92.00]],
    "New Brunswick": [[43.50, -71.50], [49.50, -61.50]],
    "Newfoundland and Labrador": [[46.50, -59.50], [51.80, -52.50]],
    "Northwest Territories": [[64.00, -138.00], [72.00, -115.00]], 
    "Nova Scotia": [[43.39, -66.32], [47.03, -59.68]],
    "Nunavut": [[59.00, -90.00], [69.00, -55.00]],
    "Ontario": [[40.50, -88.00], [51.50, -74.00]], 
    "Prince Edward Island": [[45.95, -64.42], [47.06, -61.97]],
    "Quebec": [[44.99, -80.00], [51.00, -65.00]],
    "Saskatchewan": [[49.00, -110.00], [56.00, -101.00]],
    "Yukon": [[57.00, -141.00], [62.50, -128.00]] 
};

const CANADA_BOUNDS: L.LatLngBoundsExpression = [[40.0, -140.0], [65.0, -45.0]];

function SetMapRef({ onReady }: { onReady: (m: L.Map) => void }) {
    const map = useMap();
    const hasCalledRef = useRef(false);
    useEffect(() => {
        if (!hasCalledRef.current) {
            hasCalledRef.current = true;
            onReady(map);
        }
    }, [map, onReady]);
    return null;
}

function MobileFullscreenExit(_props: { isMobile?: boolean }) {
    return null;
}


function MapClickCloser({ onClick }: { onClick: () => void }) {
    useMapEvents({
        click() {
            onClick();
        },
    });
    return null;
}

function FullscreenTracker({
    onFullscreenChange,
    mapSectionRef,
}: {
    onFullscreenChange: (isFs: boolean) => void;
    mapSectionRef?: React.RefObject<HTMLDivElement | null>;
}) {
    const map = useMap();

    useEffect(() => {
        const updateState = (active: boolean) => {
            onFullscreenChange(active);
            if (typeof document !== "undefined") {
                document.documentElement.classList.toggle("is-fullscreen", active);
                document.body.classList.toggle("is-fullscreen", active);
            }
            if (!active) {
                (map as unknown as { _isFullscreen?: boolean })._isFullscreen = false;
                setTimeout(() => {
                    mapSectionRef?.current?.scrollIntoView({ behavior: "instant", block: "center" });
                }, 50);
            }
        };

        const handleEnter = () => updateState(true);
        const handleExit = () => updateState(false);

        const checkFullscreen = () => {
            const container = typeof map.getContainer === "function" ? map.getContainer() : null;
            const isPseudo = !!container?.classList.contains("leaflet-pseudo-fullscreen");
            const fsEl = typeof document !== "undefined"
                ? (document.fullscreenElement || (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement)
                : null;
            const isFs = Boolean(fsEl || isPseudo);
            updateState(isFs);
        };

        map.on("enterFullscreen", handleEnter);
        map.on("exitFullscreen", handleExit);
        map.on("fullscreenchange", checkFullscreen);
        document.addEventListener("fullscreenchange", checkFullscreen);
        document.addEventListener("webkitfullscreenchange", checkFullscreen);

        return () => {
            map.off("enterFullscreen", handleEnter);
            map.off("exitFullscreen", handleExit);
            map.off("fullscreenchange", checkFullscreen);
            document.removeEventListener("fullscreenchange", checkFullscreen);
            document.removeEventListener("webkitfullscreenchange", checkFullscreen);
            if (typeof document !== "undefined") {
                document.documentElement.classList.remove("is-fullscreen");
                document.body.classList.remove("is-fullscreen");
            }
        };
    }, [map, onFullscreenChange, mapSectionRef]);

    return null;
}

function SearchBarUI({
    searchQuery,
    setSearchQuery,
    searchOpen,
    setSearchOpen,
    searchMatches,
    refLocation,
    onSelectPlace,
    className = ""
}: {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    searchOpen: boolean;
    setSearchOpen: (open: boolean) => void;
    searchMatches: Place[];
    refLocation: { pos: [number, number]; label: string; source: "gps" | "address" } | null;
    onSelectPlace: (place: Place) => void;
    className?: string;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        L.DomEvent.disableClickPropagation(el);
        L.DomEvent.disableScrollPropagation(el);
    }, []);

    useEffect(() => {
        const input = inputRef.current;
        if (!input) return;
        const stopKey = (e: KeyboardEvent) => {
            e.stopPropagation();
        };
        input.addEventListener("keydown", stopKey);
        input.addEventListener("keyup", stopKey);
        input.addEventListener("keypress", stopKey);
        return () => {
            input.removeEventListener("keydown", stopKey);
            input.removeEventListener("keyup", stopKey);
            input.removeEventListener("keypress", stopKey);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`rounded-2xl border bg-white/95 shadow-sm overflow-hidden font-sans ${className}`}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
        >
            <div className="flex items-center gap-2 px-3 h-12 font-sans">
                <svg
                    className="h-4 w-4 text-[var(--muted)] shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        d="M15.5 15.5 20 20"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <circle
                        cx="11"
                        cy="11"
                        r="5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                </svg>

                <input
                    ref={inputRef}
                    type="search"
                    value={searchQuery}
                    onFocus={() => setSearchOpen(true)}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSearchOpen(true);
                    }}
                    onKeyDown={(e) => {
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                    }}
                    onKeyUp={(e) => {
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                    }}
                    placeholder="Search by name…"
                    className="w-full h-9 rounded-md border border-[color:rgb(0_0_0_/_0.06)] bg-white/90 px-2.5 text-base sm:text-sm text-[var(--ink)] shadow-sm placeholder:text-[var(--muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] font-sans"
                />
            </div>

            {/* Dropdown results */}
            {searchOpen && searchQuery && (
                <>
                    {searchMatches.length > 0 ? (
                        <ul
                            className="max-h-64 overflow-y-auto px-3 pb-2 space-y-1 text-sm text-left font-sans"
                            onWheel={(e) => e.stopPropagation()}
                        >
                            {searchMatches.map((p) => {
                                const distanceKm =
                                    refLocation != null
                                        ? haversineKm(refLocation.pos, [p.lat, p.lng])
                                        : null;

                                return (
                                    <li
                                        key={p.id}
                                        className="rounded-lg px-2 py-1.5 hover:bg-[var(--brand-50)]/40 cursor-pointer text-left font-sans"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectPlace(p);
                                        }}
                                    >
                                        <div className="min-w-0 font-sans">
                                            <div className="truncate font-medium text-[var(--ink)] font-sans">
                                                {p.name}
                                            </div>
                                            {p.address && (
                                                <div className="truncate text-xs text-[var(--muted)] font-sans">
                                                    {p.address}
                                                </div>
                                            )}
                                            <div className="text-xs text-[var(--muted)] text-left font-sans">
                                                {distanceKm !== null
                                                    ? `${p.type} - ${distanceKm.toFixed(1)} km away`
                                                    : p.type}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="px-3 pb-2 text-xs text-[var(--muted)] text-left font-sans">
                            No locations found.
                        </div>
                    )}
                </>
            )}
        </div>
    );
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

function getFlyToDuration(map: L.Map, targetCenter: L.LatLngExpression, targetZoom: number, speedMultiplier = 1.5): number {
    try {
        const size = map.getSize();
        const startZoom = map.getZoom();
        const from = map.project(map.getCenter());
        const to = map.project(targetCenter);
        const w0 = Math.max(size.x, size.y);
        const w1 = w0 * map.getZoomScale(startZoom, targetZoom);
        const u1 = to.distanceTo(from) || 1;
        const rho = 1.42;
        const rho2 = rho * rho;

        const r = (i: number) => {
            const s1 = i ? -1 : 1;
            const s2 = i ? w1 : w0;
            const t1 = w1 * w1 - w0 * w0 + s1 * rho2 * rho2 * u1 * u1;
            const b1 = 2 * s2 * rho2 * u1;
            const b = t1 / b1;
            const sq = Math.sqrt(b * b + 1) - b;
            return sq < 0.000000001 ? -18 : Math.log(sq);
        };

        const r0 = r(0);
        const S = (r(1) - r0) / rho;
        const defaultSec = S * 0.8;
        if (!isNaN(defaultSec) && defaultSec > 0) {
            return Math.max(0.2, defaultSec / speedMultiplier);
        }
    } catch {
        // Fallback
    }
    return 1.0 / speedMultiplier;
}

function extractWebsite(props: Record<string, unknown>): string | undefined {
    const direct = (props.website ?? props.Website ?? props.url ?? props.URL) as string | undefined;
    if (direct) return direct;

    const desc = (props.description ?? props.Description) as string | undefined;
    if (!desc) return undefined;

    const m = desc.match(/href="([^"]+)"/i) || desc.match(/(https?:\/\/[^\s"<]+)/i);
    return m?.[1];
}

function MapLegend({ isMapFullscreen }: { isMapFullscreen?: boolean } = {}) {
    return (
        <div
            className={`absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-[1000] bg-white p-2 sm:p-3 rounded-lg border border-[color:rgb(0_0_0_/_0.15)] shadow-sm text-[10px] sm:text-xs pointer-events-auto ${
                isMapFullscreen ? "hidden sm:block" : ""
            }`}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
        >
            <div className="flex items-center gap-1.5 sm:gap-2">
                <img
                    src={MASJID_ICON_BLUE.options.iconUrl!} 
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    alt="Masjid Icon"
                />
                <span>Masjid / Musallah</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
                <img
                    src={MADRASAH_ICON_ORANGE.options.iconUrl!} 
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    alt="Madrasah Icon"
                />
                <span>Madrasah</span>
            </div>
        </div>
    );
}

function MapBoundsTracker({ places, onBoundsChange }: { places: Place[], onBoundsChange: (visible: Place[]) => void }) {
    const map = useMapEvents({
        moveend: () => updateVisible(),
        zoomend: () => updateVisible(),
    });

    const updateVisible = () => {
        const bounds = map.getBounds();
        const visible = places.filter(p => bounds.contains([p.lat, p.lng]));
        onBoundsChange(visible);
    };

    // Run once on initial load
    useEffect(() => {
        if (!map) return;
        updateVisible();
    }, [map, places]);

    return null;
}

function googlePlaceUrl(p: Place) {
    // Best: place_id (if you add it to the JSON)
    if (p.place_id) {
        return `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(p.place_id)}`;
    }
    // Fallback: name + exact coordinates to get the right card
    const q = p.name ? `${p.name} ${p.lat},${p.lng}` : `${p.lat},${p.lng}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function googleDirectionsUrl(p: Place): string {
    const cityName = Array.isArray(p.city)
        ? p.city.filter((c) => c && c !== "Other" && c !== "All Cities" && c !== "All Areas").join(", ")
        : (p.city || "");
    const provName = p.province && p.province !== "Other" && p.province !== "All Provinces" ? p.province : "";

    let destinationQuery = "";

    if (p.address && p.address.trim()) {
        const parts = [p.name, p.address.trim(), cityName, provName].filter(Boolean);
        destinationQuery = parts.join(", ");
    } else if (p.name && (cityName || provName)) {
        const parts = [p.name, cityName, provName].filter(Boolean);
        destinationQuery = parts.join(", ");
    } else if (p.name) {
        destinationQuery = p.name;
    }

    if (!destinationQuery.trim()) {
        destinationQuery = `${p.lat},${p.lng}`;
    }

    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationQuery)}`;
}



function inferType(p: Record<string, unknown>): PlaceType {
    const name = (p.name ?? "").toString().toLowerCase();
    const styleUrl = (p.styleUrl ?? "").toString().toLowerCase();

    if (styleUrl.includes("f57c00")) {
        return "Madrasah";
    }

    return "Masjid";
}

// 1. Generate these exactly ONCE in memory when the file loads
const MASJID_ICON_BLUE = crescentStarIcon("#1d4ed8");
const MADRASAH_ICON_ORANGE = madrasahIcon("#f57c00");

function getLeafletIconForPlace(place: Place): L.Icon {
    if (place.type === "Madrasah") {
        return MADRASAH_ICON_ORANGE; // Return the cached instance
    }

    return MASJID_ICON_BLUE; // Return the cached instance
}

export default function MapView() {
    const [selectedProvince, setSelectedProvince] = useState("All Provinces");
    const [selectedRegion, setSelectedRegion] = useState("All Regions");
    const [selectedCity, setSelectedCity] = useState("All Cities");
    const [selectedRadius, setSelectedRadius] = useState<number | "All">("All");

    const availableRegions = useMemo(() => {
        // Return empty if All Provinces OR Current Location is selected
        if (selectedProvince === "All Provinces" || selectedProvince === "Current Location") return [];
        return Object.keys(locationData[selectedProvince] || {}).sort();
    }, [selectedProvince]);

    const availableCities = useMemo(() => {
        // Return empty if All Provinces OR Current Location is selected
        if (selectedProvince === "All Provinces" || selectedProvince === "Current Location") return [];
        if (selectedRegion !== "All Regions") {
            return (locationData[selectedProvince]?.[selectedRegion] || []).sort();
        }
        // Added a fallback (|| {}) just in case the dictionary lookup ever fails
        return Array.from(new Set(Object.values(locationData[selectedProvince] || {}).flat())).sort();
    }, [selectedProvince, selectedRegion]);

    const handleProvinceChange = (val: string) => {
        setSelectedProvince(val);
        setSelectedRegion("All Regions");
        setSelectedCity("All Cities");
    };

    const handleRegionChange = (val: string) => {
        setSelectedRegion(val);
        setSelectedCity("All Cities");
    };
    const [places, setPlaces] = useState<Place[]>([]);
    const [userPos, setUserPos] = useState<LatLngExpression | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRefs = useRef<Record<string, L.Marker | null>>({});
    const initialLocatedRef = useRef(false);
    const prevFiltersRef = useRef<{
        province: string;
        region: string;
        city: string;
        radius: number | "All";
        refPos: string | null;
    }>({
        province: selectedProvince,
        region: selectedRegion,
        city: selectedCity,
        radius: selectedRadius,
        refPos: null
    });
    const prevPlacesLenRef = useRef(0);

    type ReferenceLocation = {
        pos: [number, number];
        label: string;
        source: "gps" | "address";
    };

    const [refLocation, setRefLocation] = useState<ReferenceLocation | null>(null);
    const [addressInput, setAddressInput] = useState("");
    const [addressSuggestions, setAddressSuggestions] = useState<GeocodingResult[]>([]);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [showAddressDropdown, setShowAddressDropdown] = useState(false);
    const addressBoxRef = useRef<HTMLDivElement | null>(null);

    // Debounced address search
    useEffect(() => {
        const trimmed = addressInput.trim();
        if (!trimmed || trimmed.length < 3 || !showAddressDropdown) {
            setAddressSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsGeocoding(true);
            try {
                const results = await searchCanadianAddress(trimmed);
                setAddressSuggestions(results);
            } catch {
                setAddressSuggestions([]);
            } finally {
                setIsGeocoding(false);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [addressInput, showAddressDropdown]);

    // Close address suggestions when clicking outside
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (addressBoxRef.current && !addressBoxRef.current.contains(e.target as Node)) {
                setShowAddressDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const handleSelectAddress = (item: GeocodingResult) => {
        const coords: [number, number] = [item.lat, item.lng];
        const label = item.shortName || item.displayName;
        setAddressInput(label);
        setShowAddressDropdown(false);
        setRefLocation({
            pos: coords,
            label,
            source: "address"
        });

        if (mapRef.current) {
            if (selectedRadius && selectedRadius !== "All") {
                const latDelta = selectedRadius / 111.32;
                const lngDelta = selectedRadius / (111.32 * Math.cos((coords[0] * Math.PI) / 180));
                const radiusBounds = L.latLngBounds(
                    [coords[0] - latDelta, coords[1] - lngDelta],
                    [coords[0] + latDelta, coords[1] + lngDelta]
                );
                mapRef.current.flyToBounds(radiusBounds, { padding: [30, 30], duration: 1.0 });
            } else {
                mapRef.current.flyTo(coords, 13.5, { animate: true });
            }
        }
    };

    const handleAddressSubmit = async (queryText?: string) => {
        const query = (queryText ?? addressInput).trim();
        if (!query || query.length < 3) return;

        if (addressSuggestions.length > 0) {
            handleSelectAddress(addressSuggestions[0]);
            return;
        }

        setIsGeocoding(true);
        try {
            const results = await searchCanadianAddress(query);
            if (results.length > 0) {
                handleSelectAddress(results[0]);
            }
        } catch (err) {
            console.warn("Geocoding failed on submit:", err);
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleClearAddress = () => {
        setAddressInput("");
        setAddressSuggestions([]);
        setShowAddressDropdown(false);
        if (userPos) {
            const u = normPos(userPos);
            setRefLocation({
                pos: u,
                label: "Current Location",
                source: "gps"
            });
        } else {
            setRefLocation(null);
        }
    };

    const highlightsRef = useRef<L.LayerGroup | null>(null);
    const mapSectionRef = useRef<HTMLDivElement | null>(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [locPanelOpen, setLocPanelOpen] = useState(true);
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);

    const [needsUserGesture, setNeedsUserGesture] = useState(false);
    const [geoMsg, setGeoMsg] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);

    // --- Bottom Sheet Logic (Disabled until Mobile Bottom Sheet is active) ---
    // const [visiblePlaces, setVisiblePlaces] = useState<Place[]>([]);
    // const [sheetState, setSheetState] = useState<"collapsed" | "expanded">("collapsed");
    // const touchStartY = useRef(0);

    // const handleSheetTouchStart = (e: React.TouchEvent) => {
    //     touchStartY.current = e.touches[0].clientY;
    // };

    // const handleSheetTouchEnd = (e: React.TouchEvent) => {
    //     const touchEndY = e.changedTouches[0].clientY;
    //     const distance = touchStartY.current - touchEndY;
    //     if (distance > 40) {
    //         setSheetState("expanded");
    //     } else if (distance < -40) {
    //         setSheetState("collapsed");
    //     }
    // };

    // --- NEW: Mobile & Fullscreen Detection ---
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Detect mobile screen to adjust zoom limits
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    }, []);

    // Dynamically update the map's minimum zoom limit when screen size changes
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.setMinZoom(isMobile ? 2 : 3);
        }
    }, [isMobile]);

    //The following is for the sorting portion on the map (yusuf working on this dont change)
    //Filter the places based on selection
    const filteredPlaces = useMemo(() => {
        return places.filter((p) => {
            // Rule 1: Province Match
            if (selectedProvince && selectedProvince !== "All Provinces" && selectedProvince !== "Current Location") {
                if (p.province && p.province !== selectedProvince) {
                    return false;
                }
            }

            // Rule 2: Region Match (since a place can be in multiple regions, use .includes)
            if (selectedRegion && selectedRegion !== "All Regions") {
                if (p.region && Array.isArray(p.region)) {
                    if (!p.region.includes(selectedRegion)) {
                        return false;
                    }
                } else {
                    return false;
                }
            }

            // Rule 3: City Match
            if (selectedCity && selectedCity !== "All Cities" && selectedCity !== "All Areas") {
                if (p.city && Array.isArray(p.city)) {
                    if (!p.city.includes(selectedCity)) {
                        return false;
                    }
                } else {
                    return false;
                }
            }

            // Rule 4: Distance Match
            if (selectedRadius && selectedRadius !== "All" && refLocation) {
                const dist = haversineKm(refLocation.pos, [p.lat, p.lng]);
                if (dist > selectedRadius) {
                    return false;
                }
            }

            return true;
        });
    }, [places, selectedProvince, selectedRegion, selectedCity, selectedRadius, refLocation]);


    const searchMatches = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return [];
        return filteredPlaces 
            .filter((p) => p.name.toLowerCase().includes(q))
            .slice(0, 10);
    }, [searchQuery, filteredPlaces]);

    const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
    const openRetryRef = useRef<number | null>(null);


    const handleSelectPlace = (place: Place) => {
        const map = mapRef.current;
        if (!map) return;

        setSearchOpen(false);
        setSearchQuery(place.name);
        setActivePlaceId(place.id);

        // move map first (1.5x faster animation)
        const duration = getFlyToDuration(map, [place.lat, place.lng], 13, 1.5);
        map.flyTo([place.lat, place.lng], 13, { animate: true, duration });

        requestAnimationFrame(() => map.invalidateSize());
    };

    const handleExitFullscreen = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const map = mapRef.current as (L.Map & { toggleFullscreen?: () => void; fullscreenControl?: { toggleFullScreen?: () => void }; _isFullscreen?: boolean }) | null;
        if (map) {
            try {
                if (typeof map.toggleFullscreen === "function") {
                    map.toggleFullscreen();
                } else if (map.fullscreenControl && typeof map.fullscreenControl.toggleFullScreen === "function") {
                    map.fullscreenControl.toggleFullScreen();
                }
            } catch {
                // Fall through to DOM fallback
            }
            map._isFullscreen = false;
        }

        setIsMapFullscreen(false);

        if (typeof document !== "undefined") {
            document.documentElement.classList.remove("is-fullscreen");
            document.body.classList.remove("is-fullscreen");
            if (document.fullscreenElement || (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement) {
                const doc = document as unknown as { exitFullscreen?: () => Promise<void>; webkitExitFullscreen?: () => Promise<void> };
                const exitFn = doc.exitFullscreen || doc.webkitExitFullscreen;
                if (exitFn) exitFn.call(document).catch(() => {});
            }
        }

        if (map) {
            const container = typeof map.getContainer === "function" ? map.getContainer() : null;
            if (container) {
                container.classList.remove("leaflet-pseudo-fullscreen");
            }
            map._isFullscreen = false;
            map.invalidateSize();
            map.fire("exitFullscreen");
        }

        setTimeout(() => {
            mapSectionRef.current?.scrollIntoView({ behavior: "instant", block: "center" });
        }, 50);
    };


    useEffect(() => {
        const map = mapRef.current;
        if (!map || !activePlaceId) return;

        // clear any  retry loop
        if (openRetryRef.current) {
            window.clearTimeout(openRetryRef.current);
            openRetryRef.current = null;
        }

        let tries = 0;

        const tryOpen = () => {
            tries += 1;

            const marker = markerRefs.current[activePlaceId] as LeafletMarkerWithMap | null;

            const mapReady = !!((map as LeafletMapWithLoaded)._loaded);
            const markerOnMap = !!(marker?._map);


            if (mapReady && markerOnMap) {
                marker.openPopup();
                return;
            }

            if (tries < 10) {
                openRetryRef.current = window.setTimeout(tryOpen, 50);
            }
        };

        tryOpen();

        return () => {
            if (openRetryRef.current) {
                window.clearTimeout(openRetryRef.current);
                openRetryRef.current = null;
            }
        };
    }, [activePlaceId]);

    const centerOnUser = () => {
        const map = mapRef.current;
        if (!map) return;

        // if we already have userPos, just center
        if (userPos) {
            const u = normPos(userPos);
            setRefLocation({
                pos: u,
                label: "Current Location",
                source: "gps"
            });
            setAddressInput("");
            map.flyTo(userPos, 12, { animate: true });
            setSelectedProvince("Current Location");
            return;
        }

        // otherwise ask for it
        requestLocation();
    };

    const requestLocation = () => {
        if (!("geolocation" in navigator)) {
            setGeoMsg("Location not supported on this device.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords: LatLngExpression = [pos.coords.latitude, pos.coords.longitude];
                const uCoords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                setUserPos(coords);
                setRefLocation({
                    pos: uCoords,
                    label: "Current Location",
                    source: "gps"
                });
                setAddressInput("");
                mapRef.current?.setView(coords, 12);
                setSelectedProvince("Current Location");
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
        if (!refLocation || !filteredPlaces.length) return [];
        return [...filteredPlaces] 
            .map(p => ({ p, d: haversineKm(refLocation.pos, [p.lat, p.lng]) }))
            .sort((a, b) => a.d - b.d)
            .slice(0, 3);
    }, [refLocation, filteredPlaces]);

    useEffect(() => {
        const map = mapRef.current;
        // If filters result in 0 places, clear the layers and stop
        if (!map) return;

        if (!refLocation || nearest3.length === 0) {
            if (highlightsRef.current) {
                highlightsRef.current.clearLayers();
            }
            return;
        }

        map.whenReady(() => {
            const u = L.latLng(refLocation.pos[0], refLocation.pos[1]);

            const pts = nearest3.map(({ p }) => L.latLng(p.lat, p.lng));
            const bounds = L.latLngBounds([u, ...pts]).pad(0.2);

            if (!highlightsRef.current) {
                highlightsRef.current = L.layerGroup().addTo(map);
            } else {
                highlightsRef.current.clearLayers();
            }

            // nearest3.forEach(({ p }) => {
            //     L.circleMarker([p.lat, p.lng], {
            //         radius: 4,
            //         color: "#021733",
            //         weight: 2,
            //         fillColor: "#ffffff",
            //         fillOpacity: 1,
            //         interactive: false
            //     }).addTo(highlightsRef.current!);
            // });
        });

        // Cleanup function: This is the key part that removes old dots
        return () => {
            if (highlightsRef.current) {
                highlightsRef.current.clearLayers();
            }
        };
    }, [refLocation, nearest3, selectedProvince]); // Added selectedProvince to the dependency array

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch(`/locations.json?v=${Date.now()}`, { cache: "no-store" });
                const gj: FeatureCollection = await r.json();

                const pts: Place[] = gj.features
                    .filter((f): f is Feature<Point> => f.geometry?.type === "Point")
                    .map((f) => {
                        const [lng, lat] = f.geometry.coordinates;
                        const p = (f.properties ?? {}) as Record<string, unknown>;
                        const rawCity = (p.city as string) || "Other";
                        const cityArray = Array.isArray(p.city) ? (p.city as string[]) : [rawCity];
                        const rawRegion = (p.region as string) || "All Regions"; 
                        const regionArray = Array.isArray(p.region) ? (p.region as string[]) : [rawRegion];

                        return {
                            id: (p.id ?? p.place_id ?? p.name ?? `${lat},${lng}`) as string,
                            name: (p.name ?? "Unnamed").toString(),
                            city: cityArray, 
                            province: (p.province ?? "Other").toString(),
                            region: regionArray, 
                            type: inferType(p),
                            lat,
                            lng,
                            address: p.address as string | undefined,
                            notes: p.notes as string | undefined,
                            website: extractWebsite(p) || (p.website as string | undefined),
                            place_id: (p.place_id as string | undefined)
                        };
                    });

                setPlaces(pts);
            } catch (error) {
                console.error("Failed to load map data:", error);
            }
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
                const uCoords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                setUserPos(coords);
                setRefLocation({
                    pos: uCoords,
                    label: "Current Location",
                    source: "gps"
                });
                setSelectedProvince("Current Location");
                if (mapRef.current && !initialLocatedRef.current) {
                    initialLocatedRef.current = true;
                    mapRef.current.setView(coords, 12);
                }
                setNeedsUserGesture(false);
                setGeoMsg(null);
            },
            () => {
                setNeedsUserGesture(true);
                setGeoMsg("Enable location to see the three closest Masajid near you.");
            },
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 8000 }
        );
    }, []);
    
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const prev = prevFiltersRef.current;
        const currentRefPos = refLocation ? `${refLocation.pos[0].toFixed(5)},${refLocation.pos[1].toFixed(5)}` : null;
        const filterChanged =
            prev.province !== selectedProvince ||
            prev.region !== selectedRegion ||
            prev.city !== selectedCity ||
            prev.radius !== selectedRadius ||
            prev.refPos !== currentRefPos;

        const placesJustLoaded = places.length > 0 && prevPlacesLenRef.current === 0;
        prevPlacesLenRef.current = places.length;

        prevFiltersRef.current = {
            province: selectedProvince,
            region: selectedRegion,
            city: selectedCity,
            radius: selectedRadius,
            refPos: currentRefPos
        };

        // Don't auto-fly if filters didn't change and places didn't just load with an active filter
        if (!filterChanged && (!placesJustLoaded || (selectedProvince === "All Provinces" && selectedRadius === "All" && (!refLocation || refLocation.source !== "address")))) {
            return;
        }

        // 1. If an Address Reference Location is active
        if (refLocation && refLocation.source === "address") {
            if (selectedRadius && selectedRadius !== "All") {
                const latDelta = selectedRadius / 111.32;
                const lngDelta = selectedRadius / (111.32 * Math.cos((refLocation.pos[0] * Math.PI) / 180));
                const radiusBounds = L.latLngBounds(
                    [refLocation.pos[0] - latDelta, refLocation.pos[1] - lngDelta],
                    [refLocation.pos[0] + latDelta, refLocation.pos[1] + lngDelta]
                );
                map.flyToBounds(radiusBounds, {
                    padding: [30, 30],
                    duration: 1.0
                });
            } else if (prev.refPos !== currentRefPos) {
                map.flyTo(refLocation.pos, 13.5, { animate: true });
            }
            return;
        }

        // 2. Distance Radius Selected with GPS (highest specificity)
        if (selectedRadius && selectedRadius !== "All" && refLocation) {
            const latDelta = selectedRadius / 111.32;
            const lngDelta = selectedRadius / (111.32 * Math.cos((refLocation.pos[0] * Math.PI) / 180));
            const radiusBounds = L.latLngBounds(
                [refLocation.pos[0] - latDelta, refLocation.pos[1] - lngDelta],
                [refLocation.pos[0] + latDelta, refLocation.pos[1] + lngDelta]
            );
            map.flyToBounds(radiusBounds, {
                padding: [30, 30],
                duration: 1.0
            });
            return;
        }

        // If "Current Location" is selected and radius is "All", snap to userPos if radius was just cleared
        if (selectedProvince === "Current Location") {
            if (userPos && prev.radius !== "All") {
                map.flyTo(userPos, 12, { animate: true });
            }
            return;
        }

        // 3. If "All Provinces" is selected, snap to a fixed view of Canada
        if (selectedProvince === "All Provinces") {
            const CANADA_BOUNDS: L.LatLngBoundsExpression = [[40.0, -140.0], [65.0, -45.0]];
            map.flyToBounds(CANADA_BOUNDS, { 
                padding: [20, 20],
                duration: 1.5
            });
            return;
        }

        // 3. City Level Selected
        if (selectedCity && selectedCity !== "All Cities" && selectedCity !== "All Areas") {
            const cityPlaces = places.filter(p => 
                p.province === selectedProvince &&
                p.city && p.city.includes(selectedCity)
            );
            if (cityPlaces.length > 0) {
                const bounds = L.latLngBounds(cityPlaces.map(p => [p.lat, p.lng]));
                if (bounds.isValid()) {
                    map.flyToBounds(bounds, {
                        padding: [50, 50],
                        maxZoom: 12.5,
                        duration: 1.0
                    });
                    return;
                }
            }
        }

        // 4. Region Level Selected
        if (selectedRegion && selectedRegion !== "All Regions") {
            const regionPlaces = places.filter(p =>
                p.province === selectedProvince &&
                p.region && p.region.includes(selectedRegion)
            );
            if (regionPlaces.length > 0) {
                const bounds = L.latLngBounds(regionPlaces.map(p => [p.lat, p.lng]));
                if (bounds.isValid()) {
                    map.flyToBounds(bounds, {
                        padding: [40, 40],
                        maxZoom: 10.5,
                        duration: 1.0
                    });
                    return;
                }
            }
        }

        // 5. Province Level Selected
        if (selectedProvince && PROVINCE_BOUNDS[selectedProvince]) {
            map.flyToBounds(PROVINCE_BOUNDS[selectedProvince], {
                padding: [30, 30],
                maxZoom: 7.5,
                duration: 1.0
            });
        }
    }, [selectedProvince, selectedRegion, selectedCity, selectedRadius, refLocation, places, userPos]);

    return (
        <div ref={mapSectionRef} className="rounded-2xl border border-[color:rgb(0_0_0_/_0.06)] overflow-hidden">
            <div className="p-3 bg-white">
                <div className="text-[var(--ink)] font-semibold">Masjid & Musallah Map</div>
                <div className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs font-medium text-[var(--muted)] border-b border-[color:rgb(0_0_0_/_0.05)]">
                    <div>
                        Showing <span className="font-bold text-[var(--ink)]">{filteredPlaces.length}</span> of {places.length} locations
                    </div>
                    <div className="flex items-center gap-2">
                        {refLocation && refLocation.source === "address" && (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 text-[11px]">
                                📍 Ref: {refLocation.label}
                            </span>
                        )}
                        {refLocation && refLocation.source === "gps" && (
                            <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/80 text-[11px]">
                                📍 Ref: Your GPS Location
                            </span>
                        )}
                        {!refLocation && (
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80 text-[11px]">
                                ⚠️ {geoMsg === "Enable location to see the three closest Masajid near you." || !geoMsg
                                    ? "Location not enabled"
                                    : geoMsg}
                            </span>
                        )}
                    </div>
                </div>
                {/* Filter Controls Row */}
                <div className="mt-3 mb-2 rounded-xl bg-[var(--brand)]/5 p-3 sm:p-3.5 border border-[var(--brand)]/10">
                    <div className="flex flex-wrap lg:flex-nowrap items-end gap-2.5">
                        
                        {/* Province Filter */}
                        <div className="flex flex-col gap-1 w-full sm:w-[calc(50%-5px)] md:w-[calc(33.333%-7px)] lg:w-auto lg:flex-1 min-w-0">
                            <span className="text-[11px] font-bold text-[var(--brand)] uppercase tracking-wider pl-0.5 truncate">Province</span>
                            <select
                                value={selectedProvince}
                                onChange={(e) => handleProvinceChange(e.target.value)}
                                className="w-full rounded-lg border border-[color:rgb(0_0_0_/_0.15)] bg-white px-2.5 py-2 text-xs sm:text-sm text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--brand)] transition-all cursor-pointer shadow-sm h-[38px] truncate"
                            >
                                <option value="Current Location" hidden>📍 Auto-Located</option>
                                <option value="All Provinces">All Provinces</option>
                                {Object.keys(locationData).sort().map((prov) => (
                                    <option key={prov} value={prov}>{prov}</option>
                                ))}
                            </select>
                        </div>

                        {/* Region Filter */}
                        <div className="flex flex-col gap-1 w-full sm:w-[calc(50%-5px)] md:w-[calc(33.333%-7px)] lg:w-auto lg:flex-1 min-w-0">
                            <span className="text-[11px] font-bold text-[var(--brand)] uppercase tracking-wider pl-0.5 truncate">Region</span>
                            <select
                                value={selectedRegion}
                                onChange={(e) => handleRegionChange(e.target.value)}
                                disabled={selectedProvince === "All Provinces"}
                                className="w-full rounded-lg border border-[color:rgb(0_0_0_/_0.15)] bg-white px-2.5 py-2 text-xs sm:text-sm text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--brand)] transition-all cursor-pointer shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed h-[38px] truncate"
                            >
                                <option value="All Regions">All Regions</option>
                                {availableRegions.map((reg) => (
                                    <option key={reg} value={reg}>{reg}</option>
                                ))}
                            </select>
                        </div>

                        {/* City Filter */}
                        <div className="flex flex-col gap-1 w-full sm:w-[calc(50%-5px)] md:w-[calc(33.333%-7px)] lg:w-auto lg:flex-1 min-w-0">
                            <span className="text-[11px] font-bold text-[var(--brand)] uppercase tracking-wider pl-0.5 truncate">City / Area</span>
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                disabled={selectedProvince === "All Provinces"}
                                className="w-full rounded-lg border border-[color:rgb(0_0_0_/_0.15)] bg-white px-2.5 py-2 text-xs sm:text-sm text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--brand)] transition-all cursor-pointer shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed h-[38px] truncate"
                            >
                                <option value="All Cities">All Cities</option>
                                {availableCities.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        {/* Address / Postal Code Master Location Filter */}
                        <div ref={addressBoxRef} className="relative flex flex-col gap-1 w-full sm:w-[calc(50%-5px)] md:w-[calc(33.333%-7px)] lg:w-auto lg:flex-[1.25] min-w-0">
                            <span className="text-[11px] font-bold text-[var(--brand)] uppercase tracking-wider pl-0.5 truncate">
                                Address / Postal Code
                            </span>
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    value={addressInput}
                                    onChange={(e) => {
                                        setAddressInput(e.target.value);
                                        setShowAddressDropdown(true);
                                    }}
                                    onFocus={() => setShowAddressDropdown(true)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddressSubmit();
                                        }
                                    }}
                                    placeholder="e.g. L3S 0B5 or Markham"
                                    className="w-full rounded-lg border border-[color:rgb(0_0_0_/_0.15)] bg-white pl-2.5 pr-14 py-2 text-base sm:text-sm text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--brand)] transition-all shadow-sm placeholder:text-[var(--muted)] h-[38px]"
                                />
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                                    {addressInput && (
                                        <button
                                            type="button"
                                            onClick={handleClearAddress}
                                            className="p-1 text-gray-400 hover:text-gray-600 font-bold text-xs"
                                            title="Clear address"
                                        >
                                            ✕
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleAddressSubmit()}
                                        disabled={isGeocoding || !addressInput.trim()}
                                        className="p-1 text-[var(--brand)] hover:text-[var(--brand)]/80 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Search address"
                                    >
                                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Autocomplete suggestions dropdown */}
                            {showAddressDropdown && addressSuggestions.length > 0 && (
                                <ul className="absolute top-full left-0 right-0 sm:right-auto sm:min-w-[240px] z-[1100] mt-1 max-h-48 overflow-y-auto rounded-lg border border-[color:rgb(0_0_0_/_0.15)] bg-white p-1 text-xs shadow-lg divide-y divide-gray-100">
                                    {addressSuggestions.map((item, idx) => (
                                        <li
                                            key={idx}
                                            onClick={() => handleSelectAddress(item)}
                                            className="cursor-pointer rounded-md p-2 hover:bg-[var(--brand)]/10 text-left text-gray-800 transition-colors"
                                        >
                                            <div className="font-semibold text-[var(--ink)]">{item.shortName}</div>
                                            <div className="text-[10px] text-[var(--muted)] truncate">{item.displayName}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {showAddressDropdown && isGeocoding && (
                                <div className="absolute top-full left-0 right-0 sm:right-auto sm:min-w-[200px] z-[1100] mt-1 rounded-lg border border-gray-200 bg-white p-2 text-xs text-[var(--muted)] text-center shadow-lg">
                                    Searching address...
                                </div>
                            )}
                        </div>

                        {/* Distance Filter */}
                        <div className="flex flex-col gap-1 w-full sm:w-[calc(50%-5px)] md:w-[calc(33.333%-7px)] lg:w-auto lg:flex-1 min-w-0">
                            <span className="text-[11px] font-bold text-[var(--brand)] uppercase tracking-wider pl-0.5 truncate">Distance</span>
                            <select
                                value={selectedRadius}
                                onChange={(e) => {
                                    const val = e.target.value === "All" ? "All" : Number(e.target.value);
                                    setSelectedRadius(val);
                                    if (val !== "All" && !refLocation) {
                                        requestLocation();
                                    }
                                }}
                                className="w-full rounded-lg border border-[color:rgb(0_0_0_/_0.15)] bg-white px-2.5 py-2 text-xs sm:text-sm text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--brand)] transition-all cursor-pointer shadow-sm h-[38px] truncate"
                            >
                                <option value="All">Any Distance</option>
                                <option value={5}>Within 5 km</option>
                                <option value={10}>Within 10 km</option>
                                <option value={25}>Within 25 km</option>
                                <option value={50}>Within 50 km</option>
                            </select>
                        </div>

                        {/* Location / Center on Me Button */}
                        <div className="flex flex-col gap-1 w-full sm:w-[calc(50%-5px)] md:w-[calc(33.333%-7px)] lg:w-auto lg:flex-1 min-w-0">
                            <span className="text-[11px] font-bold text-transparent select-none uppercase tracking-wider pl-0.5 hidden sm:block">Action</span>
                            <button
                                type="button"
                                onClick={centerOnUser}
                                className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--brand)] bg-white px-2.5 py-2 text-xs sm:text-sm font-bold text-[var(--brand)] shadow-sm hover:bg-[var(--brand-50)] outline-none focus:ring-2 focus:ring-[var(--brand)] transition-all h-[38px] w-full whitespace-nowrap"
                            >
                                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s7-5 7-12a7 7 0 10-14 0c0 7 7 12 7 12z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span className="truncate">Center on me</span>
                            </button>
                        </div>

                    </div>
                </div>
                {/* 🔍 Search bar under heading */}
                <div className="mt-3">
                    <SearchBarUI
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        searchOpen={searchOpen}
                        setSearchOpen={setSearchOpen}
                        searchMatches={searchMatches}
                        refLocation={refLocation}
                        onSelectPlace={handleSelectPlace}
                    />
                </div>

            </div>

            <div className="relative z-0">
                <MapContainer
                    bounds={CANADA_BOUNDS}
                    boundsOptions={{ padding: [20, 20] }}
                    minZoom={isMobile ? 2 : 3}
                    zoomControl={false}
                    doubleClickZoom={false}
                    bounceAtZoomLimits={false}
                    style={{ height: 520, width: "100%" }}
                    maxBounds={[[-65, -190], [85, 190]]} 
                    maxBoundsViscosity={1.0} 
                    worldCopyJump={false} 
                    attributionControl={false}
                >
                    <SetMapRef onReady={(m) => { 
                        mapRef.current = m; 
                        if (userPos && !initialLocatedRef.current) {
                            initialLocatedRef.current = true;
                            m.setView(userPos, 12);
                        }
                    }} />

                    <MapClickCloser onClick={() => setSearchOpen(false)} />

                    <FullscreenControl position="topleft" />
                    <FullscreenTracker mapSectionRef={mapSectionRef} onFullscreenChange={setIsMapFullscreen} />
                    <MobileFullscreenExit isMobile={isMobile} />
                   
                    <LibertyLayer />

                    {/* <MapBoundsTracker places={filteredPlaces} onBoundsChange={setVisiblePlaces} /> */}

                    {refLocation && (
                        <Marker 
                            position={refLocation.pos} 
                            icon={refLocation.source === "gps" ? pinIcon("#ef4444") : pinIcon("#2563eb")}
                        >
                            <Popup autoPan={false}>
                                <div className="space-y-0.5 py-0.5">
                                    <div className="font-bold text-xs text-[var(--ink)]">
                                        {refLocation.source === "gps" ? "📍 You are here" : "📍 Master Reference Location"}
                                    </div>
                                    {refLocation.source === "address" && (
                                        <div className="text-[11px] text-[var(--muted)]">{refLocation.label}</div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    )}
                    {filteredPlaces.map((p) => {
                        // Logic to check if this place is in the top 3 closest
                        const nearInfo = nearest3.find((n) => n.p.id === p.id);
                        const isNearest = !!nearInfo;

                        return (
                            <Marker
                                key={p.id}
                                position={[p.lat, p.lng]}
                                icon={getLeafletIconForPlace(p)}
                                ref={(markerInstance) => {
                                    if (markerInstance) {
                                        markerRefs.current[p.id] = markerInstance;
                                    } else {
                                        delete markerRefs.current[p.id];
                                    }
                                }}
                                eventHandlers={{
                                    click: () => setActivePlaceId(p.id),
                                }}
                            >
                                <Popup autoPan={false}>
                                    <div className="space-y-1">
                                        {isNearest && nearInfo && (
                                            <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-[var(--brand)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--brand)] uppercase tracking-wider">
                                                {refLocation?.source === "address" ? "Closest to address" : "Closest to you"} ({nearInfo.d.toFixed(1)} km)
                                            </div>
                                        )}
                                        <div className="font-semibold text-[var(--ink)]">{p.name}</div>
                                        {p.address && (
                                            <div className="text-sm text-[var(--muted)]">{p.address}</div>
                                        )}
                                        {p.notes && <div className="text-sm italic text-[var(--muted)]">{p.notes}</div>}
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">{p.type}</div>
                                        <div className="pt-2 flex items-center gap-2 text-xs">
                                            <a
                                                className="font-bold underline text-[var(--brand)]"
                                                href={googleDirectionsUrl(p)}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Directions
                                            </a>
                                            <span className="text-gray-300">|</span>
                                            <a
                                                className="font-bold underline text-[var(--brand)]"
                                                href={googlePlaceUrl(p)}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Details
                                            </a>
                                            {p.website && (
                                                <>
                                                    <span className="text-gray-300">|</span>
                                                    <a
                                                        className="font-bold underline text-[var(--brand)]"
                                                        href={p.website}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        Website
                                                    </a>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}

                    {/* Fullscreen Search Bar (Desktop) */}
                    {isMapFullscreen ? (
                        <div
                            ref={(el) => {
                                if (el) {
                                    L.DomEvent.disableClickPropagation(el);
                                    L.DomEvent.disableScrollPropagation(el);
                                }
                            }}
                            className="hidden sm:block absolute top-3 left-14 z-[100000] pointer-events-auto font-sans sm:w-[clamp(280px,32vw,420px)]"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            onDoubleClick={(e) => e.stopPropagation()}
                            onWheel={(e) => e.stopPropagation()}
                        >
                            <SearchBarUI
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                searchOpen={searchOpen}
                                setSearchOpen={setSearchOpen}
                                searchMatches={searchMatches}
                                refLocation={refLocation}
                                onSelectPlace={handleSelectPlace}
                                className="shadow-md border-[color:rgb(0_0_0_/_0.15)]"
                            />
                        </div>
                    ) : null}

                    {/* Dedicated Mobile-only Fullscreen Overlay Wrapper */}
                    {isMapFullscreen ? (
                        <div className="absolute inset-0 z-[100000] flex flex-col justify-between h-full pointer-events-none p-2 sm:hidden font-sans">
                            {/* Compact Top Row: Search Bar (flex-1) + Exit Fullscreen (shrink-0) */}
                            <div className="w-full flex items-start gap-1.5 pointer-events-none">
                                <div className="flex-1 min-w-0 pointer-events-auto">
                                    <SearchBarUI
                                        searchQuery={searchQuery}
                                        setSearchQuery={setSearchQuery}
                                        searchOpen={searchOpen}
                                        setSearchOpen={setSearchOpen}
                                        searchMatches={searchMatches}
                                        refLocation={refLocation}
                                        onSelectPlace={handleSelectPlace}
                                        className="shadow-md border-[color:rgb(0_0_0_/_0.15)]"
                                    />
                                </div>
                                <div
                                    ref={(el) => {
                                        if (el) {
                                            L.DomEvent.disableClickPropagation(el);
                                            L.DomEvent.disableScrollPropagation(el);
                                        }
                                    }}
                                    className="shrink-0 pointer-events-auto relative z-[100000]"
                                >
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            handleExitFullscreen(e);
                                        }}
                                        className="h-12 px-3.5 rounded-2xl border border-[var(--brand)] bg-white/95 shadow-md text-xs font-bold text-[var(--brand)] hover:bg-[var(--brand-50)] flex items-center justify-center gap-1.5 pointer-events-auto font-sans cursor-pointer active:scale-95 transition-transform"
                                        title="Exit Fullscreen"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 21m0 0h6m-6 0v-6M15 9l6-6m0 0h-6m6 0v6" />
                                        </svg>
                                        <span>Exit</span>
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Fullscreen Bottom: Unified Row with Legend (Left) + Closest / Location Access (Right) */}
                            <div className="relative w-full flex justify-between items-end pointer-events-none gap-2">
                                {/* Left: Map Legend */}
                                <div
                                    className="pointer-events-auto bg-white/95 backdrop-blur-sm p-2 rounded-xl border border-[color:rgb(0_0_0_/_0.15)] shadow-md text-[10px] font-sans shrink-0"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                    onDoubleClick={(e) => e.stopPropagation()}
                                    onWheel={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <img
                                            src={MASJID_ICON_BLUE.options.iconUrl!}
                                            className="w-3.5 h-3.5"
                                            alt="Masjid Icon"
                                        />
                                        <span>Masjid / Musallah</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <img
                                            src={MADRASAH_ICON_ORANGE.options.iconUrl!}
                                            className="w-3.5 h-3.5"
                                            alt="Madrasah Icon"
                                        />
                                        <span>Madrasah</span>
                                    </div>
                                </div>

                                {/* Right: Closest to you / Location Access */}
                                <div className={`pointer-events-none flex flex-col items-end transition-all ${
                                    (userPos ? panelOpen : locPanelOpen)
                                        ? "absolute right-0 bottom-0 z-10 w-[min(320px,calc(100vw-1rem))]"
                                        : "w-auto"
                                }`}>
                                    {userPos && nearest3.length > 0 && (
                                        <div
                                            ref={(el) => {
                                                if (el) {
                                                    L.DomEvent.disableClickPropagation(el);
                                                    L.DomEvent.disableScrollPropagation(el);
                                                }
                                            }}
                                            className="pointer-events-auto rounded-2xl border bg-white/95 backdrop-blur shadow-lg overflow-hidden font-sans w-full"
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onClick={(e) => e.stopPropagation()}
                                            onDoubleClick={(e) => e.stopPropagation()}
                                            onWheel={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setPanelOpen(o => !o)}
                                                aria-expanded={panelOpen}
                                                aria-controls="closest-panel-mobile"
                                                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-[var(--brand-50)]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] font-sans"
                                            >
                                                <span className="text-xs sm:text-sm font-semibold text-[var(--ink)] font-sans whitespace-nowrap">
                                                    Closest to you
                                                </span>
                                                <svg
                                                    className={`h-4 w-4 text-[var(--muted)] transition-transform shrink-0 ${panelOpen ? "" : "-rotate-90"}`}
                                                    viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                                                >
                                                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                            {panelOpen && (
                                                <div id="closest-panel-mobile" className="px-3 py-3 font-sans">
                                                    <ul
                                                        className="space-y-2 max-h-56 overflow-y-auto font-sans pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
                                                        onWheel={(e) => e.stopPropagation()}
                                                    >
                                                        {nearest3.map(({ p, d }) => (
                                                            <li key={p.id} className="flex items-start justify-between gap-3 font-sans">
                                                                <div className="min-w-0 flex-1 pr-2 font-sans">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSelectPlace(p)}
                                                                        className="block w-full text-left font-medium text-[var(--ink)] text-sm break-words hover:underline font-sans"
                                                                        title="Open on map"
                                                                    >
                                                                        {p.name}
                                                                    </button>
                                                                    {p.address && (
                                                                        <div className="truncate text-xs text-[var(--muted)] font-sans">
                                                                            {p.address}
                                                                        </div>
                                                                    )}
                                                                    <div className="text-xs text-[var(--muted)] text-left font-sans">
                                                                        {d.toFixed(1)} km away - {p.type}
                                                                    </div>
                                                                </div>
                                                                <a
                                                                    className="shrink-0 rounded-lg border px-2 py-1 text-xs text-[var(--brand)] hover:bg-[var(--brand-50)] font-sans"
                                                                    href={googleDirectionsUrl(p)}
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
                                    )}

                                    {!userPos && (
                                        <div
                                            ref={(el) => {
                                                if (el) {
                                                    L.DomEvent.disableClickPropagation(el);
                                                    L.DomEvent.disableScrollPropagation(el);
                                                }
                                            }}
                                            className="pointer-events-auto rounded-xl border bg-white/95 backdrop-blur shadow-lg overflow-hidden font-sans w-full"
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onClick={(e) => e.stopPropagation()}
                                            onDoubleClick={(e) => e.stopPropagation()}
                                            onWheel={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setLocPanelOpen(o => !o)}
                                                className="w-full flex items-center justify-between gap-2 px-2.5 py-2 text-left hover:bg-[var(--brand-50)]/40 focus:outline-none font-sans"
                                            >
                                                <span className="text-xs font-semibold text-[var(--ink)] whitespace-nowrap">
                                                    Location Access
                                                </span>
                                                <svg
                                                    className={`h-3 w-3 text-[var(--muted)] transition-transform shrink-0 ${locPanelOpen ? "" : "-rotate-90"}`}
                                                    viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                                                >
                                                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                            {locPanelOpen && (
                                                <div className="px-2.5 pb-2.5">
                                                    <p className="text-[11px] text-[var(--muted)] leading-snug mb-2.5">
                                                        {geoMsg || "Enable location to see the three closest Masajid near you."}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={requestLocation}
                                                        className="text-[11px] font-bold text-white bg-[var(--brand)] px-3 py-1.5 rounded-lg hover:bg-[var(--brand-700)] transition-colors w-full text-center shadow-sm"
                                                    >
                                                        Request Access
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <MapLegend isMapFullscreen={isMapFullscreen} />

                    {/* Closest to you / Location Access Panel (Desktop and Mobile Non-Fullscreen) */}
                    {userPos && nearest3.length > 0 && (
                        <div className={`pointer-events-none absolute ${isMapFullscreen ? "hidden sm:block sm:top-3" : "top-2 sm:top-3"} right-1/2 translate-x-1/2 sm:right-4 sm:translate-x-0 z-[100000] w-[90vw] max-w-[320px] sm:w-80 font-sans`}>
                            <div
                                ref={(el) => {
                                    if (el) {
                                        L.DomEvent.disableClickPropagation(el);
                                        L.DomEvent.disableScrollPropagation(el);
                                    }
                                }}
                                className="pointer-events-auto rounded-2xl border bg-white/95 backdrop-blur shadow-lg overflow-hidden font-sans"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                                onDoubleClick={(e) => e.stopPropagation()}
                                onWheel={(e) => e.stopPropagation()}
                            >
                                <button
                                    type="button"
                                    onClick={() => setPanelOpen(o => !o)}
                                    aria-expanded={panelOpen}
                                    aria-controls="closest-panel"
                                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[var(--brand-50)]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] font-sans"
                                >
                                    <span className="text-sm font-semibold text-[var(--ink)] font-sans">Closest to you</span>
                                    <svg
                                        className={`h-4 w-4 text-[var(--muted)] transition-transform ${panelOpen ? "" : "-rotate-90"}`}
                                        viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                                    >
                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {panelOpen && (
                                    <div id="closest-panel" className="px-3 py-3 font-sans">
                                        <ul
                                            className="space-y-2 max-h-64 overflow-y-auto font-sans pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
                                            onWheel={(e) => e.stopPropagation()}
                                        >
                                        {nearest3.map(({ p, d }) => (
                                            <li key={p.id} className="flex items-start justify-between gap-3 font-sans">
                                                <div className="min-w-0 flex-1 pr-2 font-sans">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSelectPlace(p)}
                                                        className="block w-full text-left font-medium text-[var(--ink)] text-sm break-words hover:underline font-sans"
                                                        title="Open on map"
                                                    >
                                                        {p.name}
                                                    </button>


                                                    {p.address && (
                                                        <div className="truncate text-xs text-[var(--muted)] font-sans">
                                                            {p.address}
                                                        </div>
                                                    )}
                                                    <div className="text-xs text-[var(--muted)] text-left font-sans">
                                                        {d.toFixed(1)} km away - {p.type}
                                                    </div>

                                                </div>
                                                <a
                                                    className="shrink-0 rounded-lg border px-2 py-1 text-xs text-[var(--brand)] hover:bg-[var(--brand-50)] font-sans"
                                                    href={googleDirectionsUrl(p)}
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
                            className={`pointer-events-none absolute ${isMapFullscreen ? "hidden sm:block sm:top-3" : "top-2 sm:top-3"} right-1/2 translate-x-1/2 sm:right-4 sm:translate-x-0 z-[100000] w-[90vw] max-w-[320px] sm:w-80 font-sans`}
                        >
                            <div
                                ref={(el) => {
                                    if (el) {
                                        L.DomEvent.disableClickPropagation(el);
                                        L.DomEvent.disableScrollPropagation(el);
                                    }
                                }}
                                className="pointer-events-auto rounded-xl sm:rounded-2xl border bg-white/95 backdrop-blur shadow-lg overflow-hidden font-sans"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                                onDoubleClick={(e) => e.stopPropagation()}
                                onWheel={(e) => e.stopPropagation()}
                            >
                                <button
                                    type="button"
                                    onClick={() => setLocPanelOpen(o => !o)}
                                    className="w-full flex items-center justify-between px-2.5 py-2 sm:px-3 sm:py-2.5 text-left hover:bg-[var(--brand-50)]/40 focus:outline-none font-sans"
                                >
                                    <span className="text-xs sm:text-sm font-semibold text-[var(--ink)]">
                                        Location Access
                                    </span>
                                    <svg
                                        className={`h-3 w-3 sm:h-4 sm:w-4 text-[var(--muted)] transition-transform ${locPanelOpen ? "" : "-rotate-90"}`}
                                        viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                                    >
                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {locPanelOpen && (
                                    <div className="px-2.5 pb-2.5 sm:px-3 sm:pb-3">
                                        <p className="text-[11px] sm:text-sm text-[var(--muted)] leading-snug mb-2.5">
                                            {geoMsg || "Enable location to see the three closest Masajid near you."}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={requestLocation}
                                            className="text-[11px] sm:text-sm font-bold text-white bg-[var(--brand)] px-3 py-1.5 rounded-lg hover:bg-[var(--brand-700)] transition-colors w-full text-center shadow-sm"
                                        >
                                            Request Access
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </MapContainer>
            </div>
            {/* --- MOBILE BOTTOM SHEET (Will work on later)--- */}
            {/* <div
                className={`fixed bottom-0 left-0 right-0 z-[10000] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] transition-all duration-300 ease-out flex flex-col sm:hidden ${
                    sheetState === "expanded" ? "h-[85vh] translate-y-0" : "h-[180px] translate-y-0"
                }`}
            >
                
                <div
                    className="w-full flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0"
                    onTouchStart={handleSheetTouchStart}
                    onTouchEnd={handleSheetTouchEnd}
                    onClick={() => setSheetState(sheetState === "expanded" ? "collapsed" : "expanded")}
                >
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-3"></div>
                    <div className="w-full px-5 flex justify-between items-center">
                        <h3 className="font-bold text-[var(--ink)] text-lg">
                            {visiblePlaces.length} Locations Visible
                        </h3>
                        <span className="text-xs font-semibold text-[var(--brand)] bg-[var(--brand-50)] px-2 py-1 rounded-md">
                            {sheetState === "collapsed" ? "Swipe Up" : "Swipe Down"}
                        </span>
                    </div>
                </div>

                
                <div className={`w-full px-4 overflow-y-auto pb-6 ${sheetState === "collapsed" ? "overflow-hidden" : ""}`}>
                    {visiblePlaces.length === 0 ? (
                        <p className="text-sm text-[var(--muted)] mt-2">No locations in this area. Try zooming out.</p>
                    ) : (
                        <ul className="space-y-3 mt-1">
                            {visiblePlaces.map((p) => {
                                const distanceKm = userPosTuple != null ? haversineKm(userPosTuple, [p.lat, p.lng]) : null;
                                
                                return (
                                    <li key={p.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-[var(--brand-50)]/30 active:bg-[var(--brand-50)]">
                                        <div className="flex justify-between items-start mb-1">
                                            <button 
                                                onClick={() => handleSelectPlace(p)}
                                                className="font-bold text-[var(--ink)] text-left text-sm leading-tight hover:text-[var(--brand)]"
                                            >
                                                {p.name}
                                            </button>
                                            <span className="text-[10px] uppercase font-extrabold tracking-wider text-[var(--brand)] shrink-0 ml-2 bg-[var(--brand)]/10 px-2 py-0.5 rounded-full">
                                                {p.type}
                                            </span>
                                        </div>
                                        {p.address && <div className="text-xs text-[var(--muted)] mb-2 truncate">{p.address}</div>}
                                        <div className="flex items-center gap-3 text-xs">
                                            <a
                                                className="font-semibold text-[var(--brand)] hover:underline flex items-center gap-1"
                                                href={googleDirectionsUrl(p)}
                                                target="_blank" rel="noreferrer"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" /></svg>
                                                Directions
                                            </a>
                                            {distanceKm !== null && (
                                                <span className="text-gray-400 font-medium">{distanceKm.toFixed(1)} km away</span>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div> */}
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
