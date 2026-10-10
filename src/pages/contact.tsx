export default function ContactPage() {
  const email = "ontariotaraweehoutreach@gmail.com";

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-[var(--brand)]">Contact Us</h1>

      {/* Intro Text Box */}
      <div className="rounded-2xl border border-[color:rgb(0_0_0_/_0.15)] bg-white p-5 mb-6">
        <p className="mb-4 text-[var(--brand)]/90">
          We are always looking to grow and connect with more communities across Ontario and beyond.
          If you would like to get in touch, please contact us with the details listed below.
        </p>
        <p className="mt-5 text-[var(--ink)]/90">
          Please also feel free to reach out to suggest any changes or improvements.
        </p>
      </div>

      {/* Contact Cards */}
      <div className="mt-8 flex flex-col gap-4">
        {[
          ["Email", "ontariotaraweehoutreach@gmail.com", "/email.svg"],
          ["Phone/WhatsApp", "(647) 581-6081 or (647) 410-7176", "/phone.svg"],
        ].map(([t, d, icon]) => {
          const isEmail = t === "Email";
          return (
            <div
              key={t}
              className="w-full rounded-xl border border-[color:rgb(0_0_0_/_0.15)] bg-white p-5 flex flex-col items-center text-center gap-3"
            >
              <div className="inline-flex items-center gap-2 text-md font-semibold text-[var(--brand)]">
                <img src={icon} alt={`${t} icon`} className="w-5 h-5" />
                {t}
              </div>

              <div className="text-[var(--muted)]">
                {isEmail ? (
                  <a href={`mailto:${d}`} className="hover:underline">
                    {d}
                  </a>
                ) : (
                  <>
                    <a href="tel:6475816081" className="hover:underline">
                      647-581-6081
                    </a>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* WhatsApp Button */}
      <div className="mt-8">
        <a
          href="https://chat.whatsapp.com/CRaq2olTvFs5Ipo1WaMuDA?mode=wwc"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex justify-center items-center gap-2 px-6 py-4 rounded-xl bg-white border border-[var(--brand)] text-[var(--brand)] text-md font-semibold hover:bg-[var(--brand-50)] transition-colors"
        >
          <img
            src="/whatsapp.svg"
            alt="WhatsApp icon"
            className="w-5 h-5"
          />
          Join WhatsApp Group
        </a>
      </div>
    </section>
  );
}
