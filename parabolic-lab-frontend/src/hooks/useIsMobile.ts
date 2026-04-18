"use client";
import useBreakpoint from "./useBreakpoint";
import { SM } from "@/constants/breakpoints";

/**
 * Hook to check if the viewport is mobile (<= sm breakpoint)
 * @returns boolean indicating if the viewport is mobile (< 640px)
 */
const useIsMobile = () => {
  return useBreakpoint({ max: SM });
};

export default useIsMobile;
