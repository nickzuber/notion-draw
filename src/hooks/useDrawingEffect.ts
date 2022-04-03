import { useContext, useEffect, useRef } from "react";
import withRequestAnimationFrame from "raf-schd";
import { AnimationContext } from "../contexts/animation";
import { DrawEnd, DrawMove, DrawStart } from "../state/state";
import { Status } from "../types/app";
import { Point } from "../types/canvas";
import { ShapeType } from "../types/shape";
import { getBox } from "../utils/canvas";

export const useDrawingEffect = (
  svgRef: React.RefObject<SVGSVGElement>,
  status: Status,
  onDrawStart: DrawStart,
  onDrawMove: DrawMove,
  onDrawEnd: DrawEnd,
) => {
  const mouseRef = useRef<Point | null>(null);
  const { animateAtOnce } = useContext(AnimationContext);

  useEffect(() => {
    if (status !== Status.DRAW) return;

    function handleMouseDown(event: MouseEvent) {
      event.preventDefault();
      const { clientX, clientY } = event;
      const { left, top } = getBox();
      mouseRef.current = { x: clientX - left, y: clientY - top };
      onDrawStart(ShapeType.LINE, mouseRef.current);
    }

    function handleMouseMove(event: MouseEvent) {
      if (!mouseRef.current) return;

      const { clientX, clientY } = event;
      const { left, top } = getBox();
      mouseRef.current = { x: clientX - left, y: clientY - top };

      const positionSnappedToAnotherLine = onDrawMove(
        ShapeType.LINE,
        mouseRef.current,
        event.shiftKey,
      );

      if (positionSnappedToAnotherLine) {
        animateAtOnce(positionSnappedToAnotherLine);
      }
    }

    function handleMouseUp() {
      if (!mouseRef.current) return;
      onDrawEnd();
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
  }, [svgRef, status, onDrawStart, onDrawMove, onDrawEnd, animateAtOnce]);

  return null;
};
