import { useContext, useEffect, useRef } from "react";
import withRequestAnimationFrame from "raf-schd";
import { AnimationContext } from "../contexts/animation";
import { CursorPreviewContext } from "../contexts/preview";
import { PenMove, PenClick } from "../state/state";
import { Status } from "../types/app";
import { getBox } from "../utils/canvas";
import { Point } from "../types/canvas";
import { MouseContext } from "../contexts/mouse";
import { roundPoint } from "../utils/shape";

export const usePenEffect = (
  svgRef: React.RefObject<SVGSVGElement>,
  status: Status,
  onPenClick: PenClick,
  onPenMove: PenMove,
) => {
  const finalPositionRef = useRef<Point | null>(null);
  const { animateAtOnce } = useContext(AnimationContext);
  const { renderPenPreviewAt } = useContext(CursorPreviewContext);
  const { canvasPosition: mousePosition } = useContext(MouseContext);

  // Handles showing the pen circle preview.
  useEffect(() => {
    if (status === Status.PEN) {
      renderPenPreviewAt(finalPositionRef.current || mousePosition);
    }
  }, [status, mousePosition, renderPenPreviewAt]);

  // Handles drawing the pen lines.
  useEffect(() => {
    if (status !== Status.PEN) return;

    function handleClick(event: MouseEvent) {
      event.preventDefault();
      const { clientX, clientY } = event;
      const { left, top } = getBox();
      const position = { x: clientX - left, y: clientY - top };
      const ignoreSnap = event.shiftKey;

      if (finalPositionRef.current) {
        onPenClick({
          point: finalPositionRef.current,
          isProjected: true,
          ignoreSnap,
        });
      } else {
        onPenClick({ point: position, isProjected: false, ignoreSnap });
      }
    }

    function handleMouseMove(event: MouseEvent) {
      const { clientX, clientY } = event;
      const { left, top } = getBox();
      const position = { x: clientX - left, y: clientY - top };

      const { point: finalPoint, snapped: didMoveSnapToPoint } = onPenMove(
        position,
        event.shiftKey,
      );

      if (didMoveSnapToPoint) {
        animateAtOnce(finalPoint);
      }

      finalPositionRef.current = roundPoint(finalPoint);
    }

    const svgElement = svgRef.current;
    if (!svgElement) return;

    const handleClickPerf = withRequestAnimationFrame(handleClick);
    const handleMouseMovePerf = withRequestAnimationFrame(handleMouseMove);

    svgElement.addEventListener("mousedown", handleClickPerf, {
      passive: false,
    });
    document.addEventListener("mousemove", handleMouseMovePerf, {
      passive: false,
    });

    return () => {
      svgElement.removeEventListener("mousedown", handleClickPerf);
      document.removeEventListener("mousemove", handleMouseMovePerf);
      finalPositionRef.current = null;
    };
  }, [svgRef, status, onPenClick, onPenMove, animateAtOnce]);

  return null;
};
