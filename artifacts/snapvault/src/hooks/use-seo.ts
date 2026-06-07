import { useEffect } from "react";

const DOMAIN = "https://www.organizeshots.com";

export function useSeo(opts: {
  title: string;
  description?: string;
  path?: string;
  jsonLd?: object | object[];
}) {
  useEffect(() => {
    document.title = opts.title;

    if (opts.description) {
      const el = document.querySelector('meta[name="description"]');
      if (el) el.setAttribute("content", opts.description);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", opts.description);
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute("href", DOMAIN + (opts.path ?? window.location.pathname));
    }
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute("content", DOMAIN + (opts.path ?? window.location.pathname));
    }

    const prev = document.getElementById("__json-ld");
    if (prev) prev.remove();

    if (opts.jsonLd) {
      const schemas = Array.isArray(opts.jsonLd) ? opts.jsonLd : [opts.jsonLd];
      const script = document.createElement("script");
      script.id = "__json-ld";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
      document.head.appendChild(script);
    }

    return () => {
      const el = document.getElementById("__json-ld");
      if (el) el.remove();
    };
  }, [opts.title, opts.description, opts.path, opts.jsonLd]);
}
