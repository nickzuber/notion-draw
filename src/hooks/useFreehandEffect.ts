import { useEffect, useRef } from "react";
import withRequestAnimationFrame from "raf-schd";
import { FreehandStart, FreehandMove, FreehandEnd } from "../state/state";
import { Status } from "../types/app";
import { getBox } from "../utils/canvas";
import { PressuredPoint } from "../types/canvas";

export const useFreehandEffect = (
  svgRef: React.RefObject<SVGSVGElement>,
  status: Status,
  onFreehandStart: FreehandStart,
  onFreehandMove: FreehandMove,
  onFreehandEnd: FreehandEnd,
) => {
  const pointerRef = useRef<PressuredPoint | null>(null);

  // Handles drawing the pen lines.
  useEffect(() => {
    if (status !== Status.FREEHAND) return;

    function handleMouseDown(event: PointerEvent) {
      event.preventDefault();
      const { clientX, clientY } = event;
      const { left, top } = getBox();
      pointerRef.current = { x: clientX - left, y: clientY - top, pressure: event.pressure };

      onFreehandStart(pointerRef.current);
    }

    function handleMouseMove(event: PointerEvent) {
      if (!pointerRef.current) return;

      const { clientX, clientY } = event;
      const { left, top } = getBox();
      pointerRef.current = { x: clientX - left, y: clientY - top, pressure: event.pressure };

      onFreehandMove(pointerRef.current);
    }

    function handleMouseUp() {
      if (!pointerRef.current) return;
      onFreehandEnd();
      pointerRef.current = null;
    }

    const svgElement = svgRef.current;
    if (!svgElement) return;

    const handleMouseDownPerf = withRequestAnimationFrame(handleMouseDown);
    const handleMouseMovePerf = withRequestAnimationFrame(handleMouseMove);
    const handleMouseUpPerf = withRequestAnimationFrame(handleMouseUp);

    svgElement.addEventListener("pointerdown", handleMouseDownPerf, {
      passive: false,
    });
    document.addEventListener("pointermove", handleMouseMovePerf, {
      passive: false,
    });
    document.addEventListener("pointerup", handleMouseUpPerf, {
      passive: false,
    });

    return () => {
      svgElement.removeEventListener("pointerdown", handleMouseDownPerf);
      document.removeEventListener("pointermove", handleMouseMovePerf);
      document.removeEventListener("pointerup", handleMouseUpPerf);
    };
  }, [svgRef, status, onFreehandStart, onFreehandMove, onFreehandEnd]);

  return null;
};
