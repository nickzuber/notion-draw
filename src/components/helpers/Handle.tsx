import { FC } from "react";

export enum HandleType {
  CIRCLE,
  SQUARE,
}

type HandleBoxProps = {
  id?: string;
  x: number;
  y: number;
  z: number;
  outerColor?: string;
  innerColor?: string;
  type?: HandleType;
};

export const Handle: FC<HandleBoxProps> = ({
  id,
  x,
  y,
  z,
  outerColor = "#000000",
  innerColor = "#ffffff",
  type = HandleType.SQUARE,
}) => {
  const boxSize = 8 / z;
  const boxWidth = 1 / z;

  return type === HandleType.SQUARE ? (
    <rect
      id={id}
      fill={innerColor}
      stroke={outerColor}
      strokeWidth={boxWidth}
      x={x - boxSize / 2}
      y={y - boxSize / 2}
      height={boxSize}
      width={boxSize}
    />
  ) : (
    <circle
      id={id}
      fill={innerColor}
      stroke={outerColor}
      strokeWidth={boxWidth}
      cx={x}
      cy={y}
      r={boxSize / 1.75}
    />
  );
};
