import Head from "next/head";
import { useEffect } from "react";

interface FormRedirectProps {
  title: string;
  url: string;
}

export default function FormRedirect({ title, url }: FormRedirectProps) {
  useEffect(() => {
    if (url) {
      window.location.replace(url);
    }
  }, [url]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta httpEquiv="refresh" content={`0;url=${url}`} />
        <link rel="canonical" href={url} />
      </Head>
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
        <p className="text-lg font-semibold text-[var(--ink)]">{title}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          If you are not redirected automatically,{" "}
          <a
            href={url}
            className="text-[var(--brand)] font-semibold underline hover:opacity-80 transition-opacity"
          >
            click here
          </a>
          .
        </p>
      </div>
    </>
  );
}
