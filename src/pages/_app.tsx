// pages/_app.tsx
import type { AppProps } from "next/app";
import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Head from "next/head";
import Script from "next/script";

//GOOGLE ANALYTICS
const GA_MEASUREMENT_ID = "G-K6GLPB83EG";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* HEAD TAG CONTENT */}
      <Head>
        <title>Ontario Taraweeh Outreach</title>
        <meta
          name="description"
          content="Connecting Huffadh and Masajid across Ontario and beyond."
        />

        <link rel="icon" href="/favicon.png" sizes="336x336"/>

        <link rel="icon" href="/favicon-rounded.png" sizes="32x32" />

        <link rel="apple-touch-icon" href="/favicon.png" />

        <meta name="theme-color" content="#021733" />
      </Head>

      {/* GA4 Script Loader */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="ga-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

      {/* Page Content */}
      <div className="min-h-dvh flex flex-col">
        <Header />
        <main className="flex-1 mx-auto w-full max-w-6xl p-4">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </>
  );
}