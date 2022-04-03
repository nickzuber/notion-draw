import { useEffect, useRef } from "react";
import { app } from "../state/state";
import { Status } from "../types/app";

export const useSpaceBar = () => {
  const isSpacePressed = useRef(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === "Space") {
        event.preventDefault();
        isSpacePressed.current = true;
        app.setStatus(Status.PAN);
      }
    }

    function handleKeyUp() {
      if (isSpacePressed.current) {
        app.setStatus(Status.IDLE);
        isSpacePressed.current = false;
      }
    }

    document.addEventListener("keydown", handleKeyDown, {
      passive: false,
    });
    document.addEventListener("keyup", handleKeyUp, {
      passive: false,
    });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return null;
};
