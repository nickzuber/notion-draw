import { useEffect, useState } from "react";

const DelayMS = 1000;

export const useActivity = (): boolean => {
  const [active, setActive] = useState(true);

  useEffect(() => {
    let ts: ReturnType<typeof setTimeout> | null = null;

    function handleMouseEnter() {
      if (ts) clearTimeout(ts);
      setActive(true);
    }

    function handleMouseLeave() {
      ts = setTimeout(() => setActive(false), DelayMS);
    }

    document.addEventListener("mouseenter", handleMouseEnter, {
      passive: false,
    });
    document.addEventListener("mouseleave", handleMouseLeave, {
      passive: false,
    });

    return () => {
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return active;
};
