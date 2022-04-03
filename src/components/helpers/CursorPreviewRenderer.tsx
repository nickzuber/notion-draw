import { FC, useContext, useEffect } from "react";
import { CursorPreviewContext } from "../../contexts/preview";
import { Circle } from "./Svg";
import { Color } from "../../constants/color";
import { Status } from "../../types/app";

type CursorPreviewProps = {
  status?: Status;
  size?: number;
  scale: number;
};

export const CursorPreviewRenderer: FC<CursorPreviewProps> = ({
  status,
  size = 4,
  scale,
}) => {
  const { position, removePreview } = useContext(CursorPreviewContext);

  useEffect(() => {
    if (status !== Status.PEN) {
      removePreview();
    }
  }, [status, removePreview]);

  if (!position) {
    return null;
  }

  return (
    <Circle
      interactive={false}
      cx={position.x}
      cy={position.y}
      r={size / scale}
      strokeWidth={1.5 / scale}
      stroke={Color.PenPreview.Primary}
      fill={Color.PenPreview.Secondary}
    />
  );
};
