"use client";
import { useEffect, useMemo, useState } from "react";
import type { Listing } from "@/lib/types";
import type { ReactNode } from "react";
import Link from "next/link";

type SortKey = keyof Listing;
type Sort = { key: SortKey; dir: "asc" | "desc" };

// Category chip palette (avoid green/red which are for status)
const CAT = {
  Taraweeh: "border-indigo-300 text-indigo-700 bg-indigo-50",
  Qiyaam:   "border-violet-300 text-violet-700 bg-violet-50",
  Jummah:   "border-amber-300  text-amber-700  bg-amber-50",
  Teaching: "border-sky-300    text-sky-700    bg-sky-50",
  Imam:   "border-teal-300   text-teal-700   bg-teal-50", // new
};
const chip = "inline-flex items-center rounded-full border px-2 py-0.5 text-xs";

export default function ListingsTable({ category, categories }: { category?: string; categories?: string[] }
) {
  const [rows, setRows] = useState<Listing[]>([]);
  const [q, setQ] = useState("");
  const [acc, _setAcc] = useState("All");
  const [sort, _setSort] = useState<Sort>({ key: "city", dir: "asc" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const url = `/listings.json?v=${Date.now()}`; // cache-bust
        const r = await fetch(url, { cache: "no-store" });
        if (!r.ok) throw new Error(`GET ${url} -> ${r.status}`);
        const data = await r.json();
        if (alive) setRows(Array.isArray(data) ? data.filter(x => x.approved ?? true) : []);
      } catch (err) {
        console.error("Failed to load listings.json:", err);
        if (alive) setRows([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Source set: filter by one or many categories (if supplied)
  const baseRows = useMemo(() => {
    if (categories?.length) {
      const set = new Set(categories.map(c => c.toLowerCase()));
      return rows.filter(r => set.has((r.category ?? "").toLowerCase()));
    }
    if (category) {
      return rows.filter(r => (r.category ?? "").toLowerCase() === category.toLowerCase());
    }
    return rows;
  }, [rows, category, categories]);

  // Text + accommodations filter + sort
  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return baseRows
      .filter(r => {
        const matchesText =
          !t ||
          [r.title, r.city, r.notes, r.category, r.description, r.accommodations, r.attendance]
            .join(" ")
            .toLowerCase()
            .includes(t);
        const matchesAcc =
          acc === "All" ||
          (r.accommodations ?? "").toLowerCase().includes(acc.toLowerCase());
        return matchesText && matchesAcc;
      })
      .sort((a, b) => {
        // 1. Primary Sort: Status (Open first, Filled last)
        const statusOrderA = a.available === "Open" ? 0 : 1;
        const statusOrderB = b.available === "Open" ? 0 : 1;

        if (statusOrderA !== statusOrderB) {
          return statusOrderA - statusOrderB;
        }

        // 2. Secondary Sort: Date Added (Newest first)
        // We use the index in the original 'rows' array. 
        // Higher index = added later = should be at the top.
        const indexA = rows.indexOf(a);
        const indexB = rows.indexOf(b);
        
        if (indexA !== indexB) {
          return indexB - indexA; // Descending order (newest at top)
        }

        // 3. Final Fallback: City (Alphabetical)
        const A = (a[sort.key] ?? "").toString().toLowerCase();
        const B = (b[sort.key] ?? "").toString().toLowerCase();
        return A.localeCompare(B);
      });
  }, [baseRows, q, acc, sort]);

  return (
    <section className="mx-auto max-w-6xl">
      {/* Controls */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          className="border border-[color:rgb(0_0_0_/_0.12)] rounded-xl px-3 py-2 max-w-70 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          placeholder={`Search ${categories?.length ? categories[0] : (category ?? "listings")}…`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="w-full py-2 flex sm:justify-end justify-start">
          <Link
            href="/apply"
            className="px-4 py-2 rounded-lg bg-[var(--brand)] text-white font-semibold hover:bg-[var(--brand-700)] transition-colors"
          >
            Submit a Listing
          </Link>
        </div>
      </div>

      {/* Accordion list */}
      <div className="space-y-3">
        {filtered.map((r, i) => (
          <details key={i} className="group rounded-2xl border border-[color:rgb(0_0_0_/_0.06)] bg-white">
            <summary className="cursor-pointer list-none p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 [&::-webkit-details-marker]:hidden">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--muted)]/30 text-[var(--muted)] transition-transform duration-300 group-open:rotate-180">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="font-semibold text-[var(--ink)]">
                  {r.title}{r.city ? ` • ${r.city}` : ""}
                </span>
              </div>

              {/* Chips */}
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:ml-3">
                {r.category && (
                  <span className={`${chip} ${CAT[r.category as keyof typeof CAT] ?? "border-slate-300 text-slate-700 bg-slate-50"}`}>
                    {r.category}
                  </span>
                )}
                {r.available && (
                  <span className={`${chip} ${
                    r.available === "Open"
                      ? "border-green-500 text-green-700 bg-green-50"
                      : "border-red-500 text-red-700 bg-red-50"
                  }`}>
                    {r.available === "Open" ? "Open" : "Filled"}
                  </span>
                )}
              </div>
            </summary>

            <div className="px-4 sm:px-5 pb-5 pt-0 text-[var(--ink)]/90">
              {r.description && <p className="mb-3">{r.description}</p>}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Address" value={r.address} />
                <Field label="Average Attendance" value={r.attendance} />
                <Field label="Notes" value={r.notes} />
                <Field label="Accommodations" value={r.accommodations} />
                <Field label="Start Date" value={fmtDate(r.startDate)} />
                {r.available !== "Filled" && (
                  <Field
                    label="Contact"
                    value={
                      r.contactNumber || r.contactEmail ? (
                        <>
                          {r.contactNumber && <div>{r.contactNumber}</div>}
                          {r.contactEmail && (
                            <a className="underline text-[var(--brand)]" href={`mailto:${r.contactEmail}`}>
                              {r.contactEmail}
                            </a>
                          )}
                        </>
                      ) : (
                        <Link href="/contact" className="underline text-[var(--brand)]">
                          Contact Us For More Details
                        </Link>
                      )
                    }
                  />
                )}
              </div>
            </div>
          </details>
        ))}

        {filtered.length === 0 && (
          <div className="p-6 text-[var(--ink)] rounded-2xl border border-[color:rgb(0_0_0_/_0.06)] bg-white">
            <p className="font-medium">No listings found right now.</p>
            <p className="mt-1 text-[var(--muted)]">
              Please check back soon to stay up to date. If you’d like to add a listing, please visit{" "}
              <Link href="/apply" className="underline text-[var(--brand)]">this page</Link>.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

type FieldProps = { label: string; value?: ReactNode };
function Field({ label, value }: FieldProps) {
  const isEmpty =
    value == null ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0);
  if (isEmpty) return null;
  return (
    <div className="rounded-xl border border-[color:rgb(0_0_0_/_0.06)] p-3 bg-white">
      <div className="text-xs font-semibold text-[var(--muted)]">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

function fmtDate(d?: string) {
  if (!d) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return d;
  const [, y, mm, dd] = m;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[Number(mm) - 1] ?? mm} ${Number(dd)}, ${y}`;
}
