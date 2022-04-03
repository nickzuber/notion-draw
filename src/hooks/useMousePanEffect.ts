import { useEffect, useRef } from "react";
import withRequestAnimationFrame from "raf-schd";
import { Pan } from "../state/state";
import { Status } from "../types/app";
import { Point } from "../types/canvas";

export const useMousePanEffect = (
  svgRef: React.RefObject<SVGSVGElement>,
  status: Status,
  onPan: Pan,
  disable = false,
) => {
  const mouseRef = useRef<Point | null>(null);

  useEffect(() => {
    if (disable) return;
    if (status !== Status.PAN) return;

    function handleMouseDown(event: MouseEvent) {
      event.preventDefault();

      const { clientX, clientY } = event;
      mouseRef.current = { x: clientX, y: clientY };
    }

    function handleMouseMove(event: MouseEvent) {
      if (!mouseRef.current) return;

      const { clientX, clientY } = event;
      const deltaX = mouseRef.current.x - clientX;
      const deltaY = mouseRef.current.y - clientY;

      onPan(deltaX, deltaY);
      mouseRef.current = { x: clientX, y: clientY };
    }

    function handleMouseUp(event: MouseEvent) {
      mouseRef.current = null;
    }

    const svgElement = svgRef.current;
    if (!svgElement) return;

    const handleMouseDownPerf = withRequestAnimationFrame(handleMouseDown);
    const handleMouseMovePerf = withRequestAnimationFrame(handleMouseMove);
    const handleMouseUpPerf = withRequestAnimationFrame(handleMouseUp);

    svgElement.addEventListener("mousedown", handleMouseDownPerf, {
      passive: false,
    });
    document.addEventListener("mousemove", handleMouseMovePerf, {
      passive: false,
    });
    document.addEventListener("mouseup", handleMouseUpPerf, {
      passive: false,
    });

    return () => {
      svgElement.removeEventListener("mousedown", handleMouseDownPerf);
      document.removeEventListener("mousemove", handleMouseMovePerf);
      document.removeEventListener("mouseup", handleMouseUpPerf);
    };
  }, [svgRef, status, onPan, disable]);

  return null;
};
