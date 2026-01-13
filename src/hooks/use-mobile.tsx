import * as React from "react";

// Tailwind default breakpoints - DO NOT MODIFY
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type Breakpoint = "mobile" | "sm" | "md" | "lg" | "xl" | "2xl";

/**
 * Debounce utility for resize handlers
 */
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Get current breakpoint based on window width
 */
function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.sm) return "mobile";
  if (width < BREAKPOINTS.md) return "sm";
  if (width < BREAKPOINTS.lg) return "md";
  if (width < BREAKPOINTS.xl) return "lg";
  if (width < BREAKPOINTS["2xl"]) return "xl";
  return "2xl";
}

/**
 * Hook to get current responsive breakpoint (debounced, 150ms)
 * Uses Tailwind default breakpoints: sm:640, md:768, lg:1024, xl:1280, 2xl:1536
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>(() => {
    // SSR-safe: default to desktop, will update on mount
    if (typeof window === "undefined") return "lg";
    return getBreakpoint(window.innerWidth);
  });

  React.useEffect(() => {
    const handleResize = debounce(() => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    }, 150);

    // Set initial value on mount
    setBreakpoint(getBreakpoint(window.innerWidth));

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
}

/**
 * Hook to check if viewport is mobile (<768px)
 * Hydration-safe: defaults to false, updates on mount
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < BREAKPOINTS.md);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

/**
 * Hook to check if viewport is tablet (768px - 1023px)
 */
export function useIsTablet(): boolean {
  const [isTablet, setIsTablet] = React.useState<boolean>(false);

  React.useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= BREAKPOINTS.md && width < BREAKPOINTS.lg);
    };

    const handleResize = debounce(checkTablet, 150);

    checkTablet();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isTablet;
}

/**
 * Hook to get screen dimensions (debounced)
 */
export function useScreenSize(): { width: number; height: number } {
  const [size, setSize] = React.useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
  });

  React.useEffect(() => {
    const handleResize = debounce(() => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }, 150);

    setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}
