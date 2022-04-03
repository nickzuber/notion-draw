import { useEffect, useState } from "react";
import withRequestAnimationFrame from "raf-schd";
import { getBox, screenToCanvas } from "../utils/canvas";
import { Point } from "../types/canvas";
import { point, roundPoint } from "../utils/shape";
import { useAppState } from "../state/state";

export type MouseAPI = {
  screenPosition: Point;
  canvasPosition: Point;
};

export const useMouse = (): MouseAPI => {
  const { camera } = useAppState();
  const [position, setPosition] = useState<Point>(point(0, 0));

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      const { clientX, clientY } = event;
      const { left, top } = getBox();
      const position = { x: clientX - left, y: clientY - top };

      setPosition(position);
    }

    const handleMouseMovePerf = withRequestAnimationFrame(handleMouseMove);
    document.addEventListener("mousemove", handleMouseMovePerf, {
      passive: false,
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMovePerf);
    };
  }, []);

  return {
    screenPosition: roundPoint(position),
    canvasPosition: roundPoint(screenToCanvas(position, camera)),
  };
};
