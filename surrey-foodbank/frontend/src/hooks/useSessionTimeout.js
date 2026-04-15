import { useEffect, useRef, useCallback } from "react";

const INACTIVITY_MS = 8 * 60 * 60 * 1000; // 8 * 60 minutes = 8 HOURS
const WARNING_MS = 60 * 1000;          // warn 1 minute before logout

export function useSessionTimeout(onTimeout, onWarning) {
  const timer = useRef(null);
  const warnTimer = useRef(null);

  const reset = useCallback(() => {
    clearTimeout(timer.current);
    clearTimeout(warnTimer.current);
    warnTimer.current = setTimeout(onWarning, INACTIVITY_MS - WARNING_MS);
    timer.current = setTimeout(onTimeout, INACTIVITY_MS);
  }, [onTimeout, onWarning]);

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer.current);
      clearTimeout(warnTimer.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [reset]);

  return reset; 
}
