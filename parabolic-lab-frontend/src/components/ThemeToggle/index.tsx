"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const [theme, setTheme] = useState<"winter" | "dim">("winter");
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar tema guardado al montar
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "winter" | "dim" | null;
    const htmlElement = document.documentElement;
    
    // Si hay tema guardado, usarlo. Si no, usar preferencia del sistema
    if (savedTheme) {
      setTheme(savedTheme);
      htmlElement.setAttribute("data-theme", savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = prefersDark ? "dim" : "winter";
      setTheme(initialTheme);
      htmlElement.setAttribute("data-theme", initialTheme);
    }
    setIsLoaded(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "winter" ? "dim" : "winter";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  if (!isLoaded) {
    return <div className="w-10 h-10" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-circle btn-sm"
      title={`Cambiar a tema ${theme === "winter" ? "oscuro" : "claro"}`}
      aria-label="Toggle theme"
    >
      {theme === "winter" ? (
        <Moon size={18} strokeWidth={2.5} />
      ) : (
        <Sun size={18} strokeWidth={2.5} />
      )}
    </button>
  );
};

export default ThemeToggle;
