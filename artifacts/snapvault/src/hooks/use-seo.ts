import { useEffect } from "react";

const DOMAIN = "https://www.organizeshots.com";

export function useSeo(opts: {
  title: string;
  description?: string;
  path?: string;
  ogImage?: string;
  jsonLd?: object | object[];
}) {
  useEffect(() => {
    document.title = opts.title;

    if (opts.description) {
      const el = document.querySelector('meta[name="description"]');
      if (el) el.setAttribute("content", opts.description);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", opts.description);
      const twDesc = document.querySelector('meta[name="twitter:description"]');
      if (twDesc) twDesc.setAttribute("content", opts.description);
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute("href", DOMAIN + (opts.path ?? window.location.pathname));
    }
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute("content", DOMAIN + (opts.path ?? window.location.pathname));
    }

    const imgUrl = opts.ogImage
      ? DOMAIN + opts.ogImage
      : `${DOMAIN}/og-image.png`;
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) ogImg.setAttribute("content", imgUrl);
    const twImg = document.querySelector('meta[name="twitter:image"]');
    if (twImg) twImg.setAttribute("content", imgUrl);
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", opts.title);

    const prev = document.getElementById("__json-ld");
    if (prev) prev.remove();

    if (opts.jsonLd) {
      const schemas = Array.isArray(opts.jsonLd) ? opts.jsonLd : [opts.jsonLd];
      const script = document.createElement("script");
      script.id = "__json-ld";
      script.type = "application/ld+json";
      const output =
        schemas.length === 1
          ? schemas[0]
          : { "@context": "https://schema.org", "@graph": schemas.map((s: Record<string, unknown>) => { const { "@context": _ctx, ...rest } = s as Record<string, unknown>; return rest; }) };
      script.textContent = JSON.stringify(output);
      document.head.appendChild(script);
    }

    return () => {
      const el = document.getElementById("__json-ld");
      if (el) el.remove();
    };
  }, [opts.title, opts.description, opts.path, opts.jsonLd]);
}
