import { useEffect, useRef } from "react";
import { CurveEnd, CurveMove, CurveStart, Select } from "../state/state";
import { Status } from "../types/app";
import { Point } from "../types/canvas";
import { PathItem, ShapeType } from "../types/shape";
import {
  CanvasTarget,
  getBox,
  getIdFromEventTarget,
  getCanvasTargetFromEvent,
} from "../utils/canvas";
import { distanceBetweenPoints } from "../utils/shape";

export const useCurvingEffect = (
  svgRef: React.RefObject<SVGSVGElement>,
  status: Status,
  onSelect: Select,
  onCurveStart: CurveStart,
  onCurveMove: CurveMove,
  onCurveEnd: CurveEnd,
) => {
  const mouseRef = useRef<Point | null>(null);

  useEffect(() => {
    if (status !== Status.CURVE) return;

    function handleClick(event: MouseEvent) {
      const target = getCanvasTargetFromEvent(event);
      if (target === CanvasTarget.OTHER) {
        onSelect(null);
      }

      if (target === CanvasTarget.SHAPE) {
        onSelect(getIdFromEventTarget(event.target));
      }
    }

    function handleMouseDown(event: MouseEvent) {
      event.preventDefault();
      const { clientX, clientY } = event;
      const { left, top } = getBox();
      mouseRef.current = { x: clientX - left, y: clientY - top };
      onCurveStart();
    }

    function handleMouseMove(event: MouseEvent) {
      if (!mouseRef.current) return;
      const { clientX, clientY } = event;
      const { left, top } = getBox();
      mouseRef.current = { x: clientX - left, y: clientY - top };
      onCurveMove(mouseRef.current);
    }

    function handleMouseUp() {
      onCurveEnd();
      mouseRef.current = null;
    }

    const curveHandleElement = document.querySelector(
      `#${PathItem.CURVE_HANDLE}`,
    ) as SVGPathElement | null;
    const svgElement = svgRef.current;
    if (!curveHandleElement || !svgElement) return;

    svgElement.addEventListener("click", handleClick, {
      passive: false,
    });
    curveHandleElement.addEventListener("mousedown", handleMouseDown, {
      passive: false,
    });
    document.addEventListener("mousemove", handleMouseMove, {
      passive: false,
    });
    document.addEventListener("mouseup", handleMouseUp, {
      passive: false,
    });

    return () => {
      svgElement.removeEventListener("click", handleClick);
      curveHandleElement.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [svgRef, status, onSelect, onCurveStart, onCurveMove, onCurveEnd]);

  return null;
};
