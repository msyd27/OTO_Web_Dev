export default function ApplyPage() {
  const huffadhLink = "https://forms.gle/tKYuZgKEddMQ6m4e9";
  const masajidLink = "https://forms.gle/qPeBBG9AjUKp4yiAA";

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-[var(--brand)] mb-6">Apply</h1>

      <div className="rounded-2xl border border-[color:rgb(0_0_0_/_0.15)] bg-white p-5 mb-6">
        <p className="text-[var(--brand)]/90">
          Our secure database is a centralized system that allows:
          <br />
        </p>

        <ul className="list-disc list-outside text-black/80 pl-4">
          <br />
          <li>Huffadh to be considered for Taraweeh leadership roles during Ramadan</li>
          <li>Imams to be matched with part-time or full-time positions at Islamic centers</li>
          <li>Quraan teachers to find opportunities in weekend schools, full-time, or part-time programs</li>
          <li>Organizations to announce their listings, as well as browse and connect with qualified candidates quickly and efficiently</li>
        </ul>

        <br />
        <p>
          Please continue to spread the word. If you know of any Huffadh or Masajid who would benefit from this initiative,
          please let them know to fill in our form and join the community.
        </p>
        <br />
        <p>Jazakallahu Khair.</p>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:justify-center gap-4">
        <a
          href={huffadhLink}
          target="_blank"
          rel="noreferrer"
          className="w-full sm:flex-1 sm:w-auto sm:min-w-[260px] text-center inline-flex justify-center items-center gap-2 rounded-lg bg-[var(--brand)] px-6 py-3 text-lg text-white font-semibold hover:bg-[var(--brand-700)] transition-colors"
        >
          Sign up as a Hafidh
        </a>

        <a
          href={masajidLink}
          target="_blank"
          rel="noreferrer"
          className="w-full sm:flex-1 sm:w-auto sm:min-w-[260px] text-center inline-flex justify-center items-center gap-2 rounded-lg border border-[var(--brand)] bg-white text-[var(--brand)] text-lg font-semibold px-6 py-3 hover:bg-[var(--brand-50)] transition-colors"
        >
          Submit a listing as a Masjid/Musallah
        </a>
      </div>




      {/* <div className="rounded-2xl border border-[color:rgb(0_0_0_/_0.15)] bg-white p-3 mb-3">
        <div className="aspect-[3/4] w-full overflow-hidden rounded-xl ring-1 ring-[var(--ring)]/40">
          <iframe
            title="Application Form"
            src={link}
            className="w-full h-full border-0"
            loading="lazy"
          />
        </div>
        <p className="text-sm text-[var(--muted)] mt-3">
          Trouble loading?{" "}
          <a className="underline text-[var(--brand)]" href={link} target="_blank" rel="noreferrer">
            Open the form in a new tab
          </a>.
        </p>
      </div> */}

    </section>
  );
}
