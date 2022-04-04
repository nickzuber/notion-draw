import { useContext, useEffect, useRef } from "react";
import withRequestAnimationFrame from "raf-schd";
import { EraseStart, EraseMove, EraseEnd } from "../state/state";
import { Status } from "../types/app";
import { getBox } from "../utils/canvas";
import { Point, PressuredPoint } from "../types/canvas";
import { CursorPreviewContext } from "../contexts/preview";
import { MouseContext } from "../contexts/mouse";

export const useEraseEffect = (
  svgRef: React.RefObject<SVGSVGElement>,
  status: Status,
  onEraseStart: EraseStart,
  onEraseMove: EraseMove,
  onEraseEnd: EraseEnd,
) => {
  const pointerRef = useRef<PressuredPoint | null>(null);
  const finalPositionRef = useRef<Point | null>(null);
  const { canvasPosition: mousePosition } = useContext(MouseContext);
  const { renderPenPreviewAt } = useContext(CursorPreviewContext);

  // Handles showing the pen circle preview.
  useEffect(() => {
    if (status === Status.ERASE) {
      renderPenPreviewAt(finalPositionRef.current || mousePosition);
    }
  }, [status, mousePosition, renderPenPreviewAt]);

  // Handles drawing the pen lines.
  useEffect(() => {
    if (status !== Status.ERASE) return;

    function handleMouseDown(event: PointerEvent) {
      event.preventDefault();
      const { clientX, clientY } = event;
      const { left, top } = getBox();
      pointerRef.current = { x: clientX - left, y: clientY - top, pressure: event.pressure };

      onEraseStart(pointerRef.current);
    }

    function handleMouseMove(event: PointerEvent) {
      if (!pointerRef.current) return;

      const { clientX, clientY } = event;
      const { left, top } = getBox();
      pointerRef.current = { x: clientX - left, y: clientY - top, pressure: event.pressure };

      onEraseMove(pointerRef.current);
    }

    function handleMouseUp() {
      if (!pointerRef.current) return;
      onEraseEnd();
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
  }, [svgRef, status, onEraseStart, onEraseMove, onEraseEnd]);

  return null;
};
