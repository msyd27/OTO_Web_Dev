import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function QuraanPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 pt-2 pb-12">
      
      {/* Centered Bismillah Header (consistent with your Home page) */}
      <div className="flex justify-center my-8">
        <img
          src="/Bismillah.png"
          alt="Bismillah calligraphy"
          className="w-60 sm:w40 md:w-[20rem] lg:w-[20rem] xl:w-[20rem] h-auto drop-shadow-md"
        />
      </div>

      <h1 className="text-3xl font-bold text-[var(--brand)] py-4">
        Quraan Recordings
      </h1>

      <div className="rounded-2xl border border-[color:rgb(0_0_0_/_0.15)] bg-white p-5 mb-6">
        <p className="text-[var(--brand)]/90">
          This page will hold your Quraan recordings.
        </p>
        
        <div className="mt-6">
          <Link href="/" className="text-[var(--brand)] underline">
            Return Home
          </Link>
        </div>
      </div>

    </section>
  );
}