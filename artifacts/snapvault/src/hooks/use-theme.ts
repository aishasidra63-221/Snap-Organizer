import { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("snapvault-theme");
      if (stored === "light" || stored === "dark") return stored;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("snapvault-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const root = document.documentElement;
    const style = document.createElement("style");
    style.textContent = "*,*::before,*::after{transition:none!important}";
    document.head.appendChild(style);
    setTheme((t) => (t === "dark" ? "light" : "dark"));
    requestAnimationFrame(() => requestAnimationFrame(() => style.remove()));
  };

  return { theme, toggleTheme };
}
