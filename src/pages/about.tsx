export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 space-y-10">
      {/* Who We Are */}
      <section>
        <h1 className="text-3xl font-bold text-[var(--brand)]">Who We Are</h1>
        <p className="mt-4 text-[var(--ink)]/80 leading-relaxed">
          Ontario Taraweeh Outreach is a dedicated initiative created to connect Huffadh, Imams, Ulamaa, and Qur’an teachers with Masajid, Musallahs, Islamic centres, and Madaris across Ontario and throughout North America.
          <br /><br />
          Our mission is simple: to strengthen our communities by making it easier for institutions to find qualified individuals, and for individuals to find meaningful opportunities to serve.
          <br /><br />
          Across the region, communities consistently seek knowledgeable Ulamaa, Imams, and teachers to serve in essential roles—teaching in Madaris, delivering Jumu‘ah khutbahs, conducting programs, leading prayers, and offering spiritual mentorship.
          <br /><br />
          Our goal is to support the growth and stability of Islamic institutions by ensuring they are empowered with dedicated individuals who can enrich their programs and spiritual services.
        </p>
      </section>

      {/* Why We Exist */}
      <section>
        <h1 className="text-3xl font-bold text-[var(--brand)]">Why We Exist</h1>
        <p className="mt-4 text-[var(--ink)]/80 leading-relaxed">
          Ontario Taraweeh Outreach was created to address a vital need within our communities by:
        </p>
        <ul className="list-disc list-outside text-black/80 pl-6 mt-4 space-y-2">
          <li>Connecting qualified Huffadh, Imams, Ulamaa, and Qur’an teachers with Masajid, Musallahs, and Madaris through a simple and transparent platform</li>
          <li>Helping institutions find reliable individuals while giving service-minded individuals access to meaningful opportunities</li>
          <li>Strengthening and uniting the Muslim community by improving access to strong religious leadership and dedicated Huffadh of the Qur’an</li>
          <li>Enriching community life and supporting a more spiritually connected environment across Ontario and beyond</li>
        </ul>
      </section>

      {/* Our Vision */}
      <section>
        <h1 className="text-3xl font-bold text-[var(--brand)]">Our Vision</h1>
        <p className="mt-4 text-[var(--ink)]/80 leading-relaxed">
          We envision a region where every Masjid, Musallah, and Madrasah can find the right people at the right time with ease, and where every Hafidh, Imam, and scholar has access to opportunities that help them teach, lead, and grow. By fostering these connections, we hope to strengthen the spiritual fabric of our communities and promote excellence in Islamic service throughout Canada and beyond.
        </p>
      </section>
    </article>
  );
}
