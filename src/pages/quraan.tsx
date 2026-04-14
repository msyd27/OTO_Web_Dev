import React from "react";
import Link from "next/link";

export default function QuraanPage() {
  const resourceCards = [
    { 
      title: "Quraan in Surahs", 
      desc: "Download or stream the Quraan organized by individual Surahs.", 
      link: "https://www.aswaatulqurraa.com/downloads/quran-audio/quran-in-surahs" 
    },
    { 
      title: "Quraan in Parahs", 
      desc: "Access audio files organized by Juzz/Parah (30 Parts).", 
      link: "https://www.aswaatulqurraa.com/downloads/quran-audio/quran-in-parahs" 
    },
    { 
      title: "Quraan in Quarters", 
      desc: "Study and listen to the Quraan divided into quarters (Rub-el-Hizb).", 
      link: "https://www.aswaatulqurraa.com/downloads/quran-audio/quran-in-quarters" 
    },
    { 
      title: "Quraan in Pages", 
      desc: "Specific audio resources divided by page for precise memorization.", 
      link: "https://www.aswaatulqurraa.com/downloads/quran-audio/quran-in-pages" 
    },
  ];

  return (
    <section className="mx-auto max-w-4xl px-4 pt-12 pb-12">
      
      <h1 className="text-3xl font-bold text-[var(--brand)] py-4">
        Quraan Audio Resources
      </h1>

      <div className="rounded-2xl border border-[color:rgb(0_0_0_/_0.15)] bg-white p-6 mb-8 shadow-sm">
        <p className="text-[var(--brand)]/90 leading-relaxed">
          High-quality Quraan audio downloads provided by Aswaatul Qurraa. 
          Select a format below to access the library.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {resourceCards.map((card, index) => (
          <a 
            key={index} 
            href={card.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between rounded-2xl border border-[color:rgb(0_0_0_/_0.15)] bg-white p-6 transition-all duration-200 hover:bg-[var(--brand-50)] hover:border-[var(--brand)]/40 hover:-translate-y-1"
          >
            <div>
              <h2 className="text-xl font-bold text-[var(--brand)]">
                {card.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)] font-normal leading-snug">
                {card.desc}
              </p>
            </div>
            
            <div className="mt-6 flex">
              <span className="inline-flex items-center rounded-lg border border-[var(--brand)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--brand)] transition-all duration-200 group-hover:bg-[var(--brand)] group-hover:text-white">
                Go Now
                <svg 
                  className="ml-2 w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--brand)] underline underline-offset-4">
          Back to Homepage
        </Link>
      </div>

    </section>
  );
}