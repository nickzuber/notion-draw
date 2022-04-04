import { Fragment } from "react";
import { Color } from "../constants/color";
import { Freeform, Line, Shape, ShapeType } from "../types/shape";
import { notEmpty } from "./general";
import { getPointsFromLine } from "./shape";

function renderLineShape(line: Line, z: number) {
  const points = getPointsFromLine(line);

  return (
    <Fragment>
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4 / z} fill={Color.Debug.Primary} />
      ))}
    </Fragment>
  );
}

function renderFreeformShape(path: Freeform, z: number) {
  return (
    <Fragment>
      {path.points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4 / z} fill={Color.Debug.Primary} />
      ))}
    </Fragment>
  );
}

function renderShape(shape: Shape, z: number) {
  switch (shape.type) {
    case ShapeType.LINE:
      return renderLineShape(shape as Line, z);
    case ShapeType.FREEFORM:
      return renderFreeformShape(shape as Freeform, z);
    default:
      return null;
  }
}

export function drawShapesInDebugMode(shapes: Shape[], z: number) {
  return shapes.map((shape) => renderShape(shape, z)).filter(notEmpty);
}
