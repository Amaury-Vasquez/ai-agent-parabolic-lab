"use client";
import { useEffect, useState } from "react";

type BreakpointOptions = { min?: number; max?: number } & (
  | { min: number }
  | { max: number }
);

/**
 * Hook to check if the viewport matches a media query breakpoint
 * @param options - Object with min and/or max breakpoint values (e.g., { min: 640, max: 1024 })
 * @returns boolean indicating if the viewport matches the breakpoint range
 */
const useBreakpoint = (options: BreakpointOptions) => {
  const { min, max } = options;
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const queries: string[] = [];

    if (typeof min === "number" && min >= 0) {
      queries.push(`(min-width: ${min}px)`);
    }

    if (typeof max === "number" && max >= 0) {
      queries.push(`(max-width: ${max - 1}px)`);
    }

    const query = queries.join(" and ");
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [min, max]);

  return matches;
};

export default useBreakpoint;
