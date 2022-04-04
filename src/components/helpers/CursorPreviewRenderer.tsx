import { FC, useContext, useEffect } from "react";
import { CursorPreviewContext } from "../../contexts/preview";
import { Circle } from "./Svg";
import { Color } from "../../constants/color";
import { Status } from "../../types/app";
import { useAppState } from "../../state/state";
import { ActivityContext } from "../../contexts/activity";

type CursorPreviewProps = {
  status?: Status;
  scale: number;
};

export const CursorPreviewRenderer: FC<CursorPreviewProps> = ({ status, scale }) => {
  const { position, removePreview } = useContext(CursorPreviewContext);
  const active = useContext(ActivityContext);
  const { theme } = useAppState();

  useEffect(() => {
    if (status !== Status.FREEHAND && status !== Status.ERASE) {
      removePreview();
    }
  }, [status, removePreview]);

  if (!position || !active || (position.x === 0 && position.y === 0)) {
    return null;
  }

  switch (status) {
    case Status.FREEHAND:
      return (
        <Circle
          interactive={false}
          cx={position.x}
          cy={position.y}
          r={theme.penSize - 1.5}
          strokeWidth={theme.penSize / 3}
          stroke={theme.penColor}
          fill={Color.PenPreview.Secondary}
        />
      );
    case Status.ERASE:
      return (
        <Circle
          interactive={false}
          cx={position.x}
          cy={position.y}
          r={theme.eraserSize / scale}
          strokeWidth={theme.eraserSize / 3 / scale}
          stroke={Color.Palette.Black}
          fill={Color.PenPreview.Secondary}
        />
      );
    default:
      return null;
  }
};
