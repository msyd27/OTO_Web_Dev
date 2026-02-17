import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function MapPage() {
    return (
        <section className="mx-auto max-w-6xl px-4 py-8 text-center md:text-left">
            <h1 className="text-3xl font-bold text-[var(--brand)] mb-3">
                Masjid & Musallah Map - Canada
            </h1>
            <p className="text-[var(--brand)] mb-6 max-w-5xl">
                Find nearby Masajid, Musallahs, and Madaris across Canada. You can open
                directions in Google Maps to see those closest to you.
            </p>
            <p className="text-[var(--brand)]/90 mb-4">
                If you want to add any Masjid or Musallah or edit the information regarding a location please use the form below:
            </p>
            {/* Form Link Section - Moved Above Map */}
            <div className="mb-8">
                
                
                <div className="flex flex-col sm:flex-row sm:justify-start">
                    <a
                        href="https://forms.gle/o3zXp6qELFzEJtV66"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto sm:min-w-[260px] text-center inline-flex justify-center items-center gap-2 rounded-lg bg-[var(--brand)] px-6 py-3 text-lg text-white font-semibold hover:bg-[var(--brand-700)] transition-colors"
                    >
                       Map Edit/Addition Request Form
                    </a>
                </div>
            </div>
            
            <MapView />
        </section>
    );
}