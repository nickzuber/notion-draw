import { useEffect, useState } from "react";

export const useActivity = (): boolean => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    function handleMouseEnter() {
      setActive(true);
    }

    function handleMouseLeave() {
      setActive(false);
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
