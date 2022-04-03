import { FC, Fragment } from "react";

type DimensionsTextProps = {
  color: string;
  dimensions: number[];
  rotate?: number;
  x: number;
  y: number;
  z: number;
};

export const DimensionsText: FC<DimensionsTextProps> = ({
  color,
  dimensions,
  rotate = 0,
  x,
  y,
  z,
}) => {
  const pixelsAllocatedForSingleCharacter = 6.5;
  const dimensionsString = dimensions.map((d) => Math.round(d)).join(" × ");
  const objectHeight = 14 / z;
  const objectWidth =
    Math.max(dimensionsString.length * pixelsAllocatedForSingleCharacter, 25) /
    z;

  return (
    <Fragment>
      <rect
        fill={color}
        x={x - objectWidth / 2}
        y={y - 8 / z}
        rx={3 / z}
        ry={3 / z}
        height={objectHeight}
        width={objectWidth}
        style={{
          transformBox: "fill-box",
          transformOrigin: "center",
          transform: `rotate(${rotate}deg)`,
        }}
      />
      <text
        height={objectHeight}
        width={objectWidth}
        x={x}
        y={y}
        dominantBaseline="middle"
        textAnchor="middle"
        style={{
          fontSize: 10 / z,
          fontWeight: 500,
          fill: "#ffffff",
          userSelect: "none",
          transformBox: "fill-box",
          transformOrigin: "center",
          transform: `rotate(${rotate}deg)`,
        }}
      >
        {dimensionsString}
      </text>
    </Fragment>
  );
};
