import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",              // export to ./out
  images: { unoptimized: true }, // next/image on static hosts
  trailingSlash: true,           // safer on many static hosts/CDNs
  async redirects() {
    return [
      {
        source: "/hafidh",
        destination: "https://forms.gle/tKYuZgKEddMQ6m4e9",
        permanent: false,
      },
      {
        source: "/masajid",
        destination: "https://forms.gle/qPeBBG9AjUKp4yiAA",
        permanent: false,
      },
      {
        source: "/masjid",
        destination: "https://forms.gle/qPeBBG9AjUKp4yiAA",
        permanent: false,
      },
      {
        source: "/apply/hafidh",
        destination: "https://forms.gle/tKYuZgKEddMQ6m4e9",
        permanent: false,
      },
      {
        source: "/apply/masajid",
        destination: "https://forms.gle/qPeBBG9AjUKp4yiAA",
        permanent: false,
      },
      {
        source: "/apply/masjid",
        destination: "https://forms.gle/qPeBBG9AjUKp4yiAA",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
