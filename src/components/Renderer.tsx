import styled from "@emotion/styled";
import { FC, useRef } from "react";
import { useCursorStyles } from "../hooks/useCursorStyles";
import { useDrawingEffect } from "../hooks/useDrawingEffect";
import { useFreehandEffect } from "../hooks/useFreehandEffect";
import { useHoverEffect } from "../hooks/useHoverEffect";
import { useMousePanEffect } from "../hooks/useMousePanEffect";
import { useMouseSelectEffect } from "../hooks/useMouseSelectEffect";
import { usePenEffect } from "../hooks/usePenEffect";
import { useWheelEffect } from "../hooks/useWheelEffect";
import {
  CurveEnd,
  CurveMove,
  CurveStart,
  DrawEnd,
  DrawMove,
  DrawStart,
  FreehandStart,
  FreehandMove,
  FreehandEnd,
  MoveEnd,
  MoveSelectedShapes,
  Pan,
  PenClick,
  PenMove,
  Pinch,
  Select,
  SetHoveredShapes,
  MoveStart,
} from "../state/state";
import { Action, Content, EditorOptions, Status, Theme } from "../types/app";
import { Camera } from "../types/canvas";
import { Bounds } from "../utils/canvas";
import { drawShapesInDebugMode } from "../utils/debug";
import {
  drawMetaItems,
  drawSelectionState,
  drawSelectionStateForBox,
  drawSelectionStateForBoxHandles,
  drawShapeHoverState,
  drawShapes,
  drawShapeTools,
} from "../utils/shape";
import { AnimationRenderer } from "./helpers/AnimationRenderer";
import { CursorPreviewRenderer } from "./helpers/CursorPreviewRenderer";
import { ForeignObject } from "./helpers/Svg";

type RendererProps = {
  action: Action;
  status: Status;
  camera: Camera;
  content: Content;
  theme: Theme;
  onDrawStart: DrawStart;
  onDrawMove: DrawMove;
  onDrawEnd: DrawEnd;
  onPan: Pan;
  onPinch: Pinch;
  onSelect: Select;
  onMoveStart: MoveStart;
  onMove: MoveSelectedShapes;
  onMoveEnd: MoveEnd;
  onCurveStart: CurveStart;
  onCurveMove: CurveMove;
  onCurveEnd: CurveEnd;
  onSetHoveredShapes: SetHoveredShapes;
  onPenClick: PenClick;
  onPenMove: PenMove;
  onFreehandStart: FreehandStart;
  onFreehandMove: FreehandMove;
  onFreehandEnd: FreehandEnd;
  debug?: boolean;
  options: EditorOptions;
  svgStyle?: React.CSSProperties;
};

export const Renderer: FC<RendererProps> = ({
  camera,
  action,
  status,
  content,
  theme,
  onDrawStart,
  onDrawMove,
  onDrawEnd,
  onPan,
  onPinch,
  onSelect,
  onMoveStart,
  onMove,
  onMoveEnd,
  onCurveStart,
  onCurveMove,
  onCurveEnd,
  onSetHoveredShapes,
  onPenClick,
  onPenMove,
  onFreehandStart,
  onFreehandMove,
  onFreehandEnd,
  debug,
  options,
  svgStyle = {},
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const { shapes, selectedIds, hoveredIds } = content;
  const hoveredShapes = shapes.filter(({ id }) => hoveredIds.includes(id));
  const selectedShapes = shapes.filter(({ id }) => selectedIds.includes(id));

  // Panning
  useWheelEffect(svgRef, onPinch, onPan, options.disablePanning);
  useMousePanEffect(svgRef, status, onPan, options.disablePanning);

  // Cursor
  useHoverEffect(status, onSetHoveredShapes);
  useCursorStyles(svgRef, status);

  // Controls
  useDrawingEffect(svgRef, status, onDrawStart, onDrawMove, onDrawEnd);
  usePenEffect(svgRef, status, onPenClick, onPenMove);
  useFreehandEffect(svgRef, status, onFreehandStart, onFreehandMove, onFreehandEnd);
  useMouseSelectEffect(
    svgRef,
    status,
    onSelect,
    onCurveStart,
    onCurveMove,
    onCurveEnd,
    onMoveStart,
    onMove,
    onMoveEnd,
  );

  // Rendering variables.
  const transform = `scale(${camera.z}) translate(${camera.x}px, ${camera.y}px)`;

  return (
    <svg ref={svgRef} style={svgStyle}>
      {/* Actual content group */}
      <g style={{ transform }}>
        {/* Background Pattern */}
        {!options.hideBackgroundPattern && (
          <ForeignObject
            interactive={false}
            x={0}
            y={0}
            height={Bounds.maxY}
            width={Bounds.maxX}
          >
            <SVGBackground scale={camera.z} />
          </ForeignObject>
        )}

        {/** @NOTE
         * Because of the laws of SVG rendering, we need to render the selection box
         * separately from the rest of the selection state since we need it to be under
         * the shapes (for click-event-reasons).
         * https://www.w3.org/TR/SVG11/render.html#RenderingOrder */}
        {drawSelectionStateForBox(status, selectedShapes, camera.z)}

        {drawShapes(shapes)}
        {drawShapeHoverState(status, hoveredShapes, selectedIds, camera.z)}
        {drawSelectionState(status, action, selectedShapes, camera.z)}
        {drawShapeTools(status, selectedShapes, camera.z)}

        {/** @NOTE
         * Because of the laws of SVG rendering, we need to render the selection box
         * separately from the rest of the selection state since we need it to be under
         * the shapes (for click-event-reasons).
         * https://www.w3.org/TR/SVG11/render.html#RenderingOrder */}
        {drawSelectionStateForBoxHandles(status, selectedShapes, camera.z)}

        {drawMetaItems(status, action, selectedShapes, camera.z)}

        <AnimationRenderer />
        {status === Status.PEN ? (
          <CursorPreviewRenderer status={status} scale={camera.z} />
        ) : null}
      </g>

      {/* Debugging group */}
      {debug && (
        <g style={{ transform, pointerEvents: "none" }}>
          <polyline className="debug-lines" points="2,1798, 3600,2" />
          <polyline className="debug-lines" points="2,2, 3600,1798" />
          {drawShapesInDebugMode(shapes, camera.z)}
        </g>
      )}
    </svg>
  );
};

// =============================================================================

function getSizeAndOffsetFromScale(scale: number): [number, number] {
  const size = 10;
  const offset = 0.75;

  let multiplier = 1;

  if (scale < 0.75) {
    multiplier = 1.5;
  }

  if (scale < 0.5) {
    multiplier = 2.5;
  }

  return [size * multiplier, offset * multiplier];
}

type Scalable = {
  scale: number;
};

const SVGBackground = styled.div<Scalable>(({ scale }) => {
  const [size, offset] = getSizeAndOffsetFromScale(scale);

  return `
  height: 100%;
  width: 100%;
  background-color: #ffffff;
  background-image: radial-gradient(#d7d7d7 ${offset}px, #ffffff ${offset}px);
  background-size: ${size}px ${size}px;
  pointer-events: none;
  user-select: none;
`;
});
