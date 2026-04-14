import React from "react";
import Link from "next/link";

export default function QuraanPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 pt-12 pb-12">
      
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-[var(--brand)] py-4">
        Quraan Resources
      </h1>

      {/* Main Content Card */}
      <div className="rounded-2xl border border-[color:rgb(0_0_0_/_0.15)] bg-white p-6 mb-6 shadow-sm">
        <p className="text-[var(--brand)]/90 leading-relaxed">
          Welcome to the Quraan Resources section. This area is dedicated to connecting 
          students with qualified Quraan teachers and providing educational materials 
          for our community.
        </p>
        
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/"
            className="inline-flex items-center rounded-xl border border-[color:rgb(0_0_0_/_0.10)] bg-[var(--brand)] px-4 py-2 text-white hover:bg-[var(--brand-700)] font-semibold transition">
            Back to Home
          </Link>
        </div>
      </div>

      {/* Placeholder for future resource grid */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="p-4 rounded-xl border border-dashed border-[var(--brand)]/30 text-center">
          <span className="text-[var(--muted)]">Resource listings coming soon...</span>
        </div>
      </div>

    </section>
  );
}