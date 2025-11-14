import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function MapPage() {
    return (
        <section className="mx-auto max-w-6xl px-4 py-8 text-center md:text-left">
            <h1 className="text-3xl font-bold text-[var(--brand)] mb-3">
                Masjid & Musallah Map - Canada
            </h1>
            <p className="text-[var(--brand)] mb-6 max-w-5xl">
                Find nearby Masajid, Musallahs, and Madaaris across Canada. You can open
                directions in Google Maps to see those closest to you.
            </p>
            <MapView />
        </section>

    );
}
