import { useEffect } from "react";

const DOMAIN = "https://www.organizeshots.com";

export function useSeo(opts: {
  title: string;
  description?: string;
  path?: string;
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
  }, [opts.title, opts.description, opts.path]);
}
