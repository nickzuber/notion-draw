import { FC, useContext } from "react";
import styled from "@emotion/styled";
import { EditorOptions, Status, Theme } from "../types/app";
import { ReactComponent as PencilSvg } from "../icons/pencil.svg";
import { ReactComponent as EraserSvg } from "../icons/eraser.svg";
import { ReactComponent as SquiggleSvg } from "../icons/squiggle.svg";
import { app, DeleteSelectedShapes, Pinch, SetTheme } from "../state/state";
import { Shape, ShapeId } from "../types/shape";
import { Camera } from "../types/canvas";
import { Palette } from "../constants/color";
import { ActivityContext } from "../contexts/activity";

type ControlsProps = {
  status: Status;
  camera: Camera;
  shapes: Shape[];
  theme: Theme;
  setTheme: SetTheme;
  selectedIds: ShapeId[];
  onDeleteSelectedShapes: DeleteSelectedShapes;
  onPinch: Pinch;
  options: EditorOptions;
};

export const Controls: FC<ControlsProps> = ({ status, theme, setTheme }) => {
  const { setStatus } = app;
  const active = useContext(ActivityContext);

  return (
    <Container hide={!active}>
      <RightContainer>
        <Swatches>
          {Object.values(Palette).map((color) => (
            <ColorOption
              key={color}
              color={color}
              selected={color === theme.penColor}
              onClick={() => {
                setStatus(Status.FREEHAND);
                setTheme({ penColor: color });
              }}
            />
          ))}
        </Swatches>
      </RightContainer>

      <LeftContainer>
        <DrawingControls>
          <DrawingOption
            selected={status === Status.FREEHAND}
            onClick={() => setStatus(Status.FREEHAND)}
          />
          <ErasingOption
            selected={status === Status.ERASE}
            onClick={() => setStatus(Status.ERASE)}
          />
        </DrawingControls>
      </LeftContainer>
    </Container>
  );
};

const Container = styled.div<{ hide: boolean }>`
  transition: all 100ms ease;
  opacity: ${(props) => (props.hide ? 0 : 1)};
`;

const LeftContainer = styled.div`
  position: absolute;
  background: transparent;
  min-height: 100px;
  width: 100px;
  top: 12px;
  left: 12px;
  bottom: 0;

  display: flex;
  align-items: flex-start;
  justify-content: center;
  pointer-events: none;
  user-select: none;
`;

const RightContainer = styled.div`
  position: absolute;
  background: transparent;
  min-height: 100px;
  width: 180px;
  top: 12px;
  right: 12px;
  bottom: 0;

  display: flex;
  align-items: flex-start;
  justify-content: center;
  pointer-events: none;
  user-select: none;
`;

const SidePanel = styled.div`
  margin: 0;
  background: #fefefe;
  padding: 8px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 16px -1px, rgba(0, 0, 0, 0.05) 0px 0px 16px -8px,
    rgba(0, 0, 0, 0.12) 0px 0px 16px -12px, rgba(0, 0, 0, 0.08) 0px 0px 2px 0px;
  box-sizing: border-box;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  pointer-events: all;
`;

const Swatches = styled(SidePanel)`
  border-radius: 6px;
`;

const DrawingControls = styled(SidePanel)`
  border-radius: 6px;
`;

const DrawingOption = styled(PencilSvg)<{ selected: boolean }>`
  position: relative;
  display: inline-block;
  margin: 4px;
  padding: 8px;
  height: 33px;
  width: 33px;
  border-radius: 100%;
  background: ${(props) => (props.selected ? "#ddd" : "transparent")};
  cursor: pointer;
  transition: all 100ms ease;

  &:hover {
    background: ${(props) => (props.selected ? "#ddd" : "#eee")};
  }

  &:active {
    background: #ccc;
  }

  path {
    stroke-width: 2px;
  }
`;

const ErasingOption = styled(EraserSvg)<{ selected: boolean }>`
  position: relative;
  display: inline-block;
  margin: 4px;
  padding: 8px;
  height: 33px;
  width: 33px;
  border-radius: 100%;
  background: ${(props) => (props.selected ? "#ddd" : "transparent")};
  cursor: pointer;
  transition: all 100ms ease;

  &:hover {
    background: ${(props) => (props.selected ? "#ddd" : "#eee")};
  }

  &:active {
    background: #ccc;
  }

  path {
    stroke-width: 2px;
  }
`;

const ColorOption = styled(SquiggleSvg)<{ color: string; selected: boolean }>`
  position: relative;
  display: inline-block;
  margin: 4px;
  padding: 4px;
  height: 33px;
  width: 33px;
  border-radius: 100%;
  color: ${(props) => props.color};
  background: ${(props) => (props.selected ? "#ddd" : "transparent")};
  transform: rotate(192deg);
  cursor: pointer;
  transition: all 100ms ease;

  &:hover {
    background: ${(props) => (props.selected ? "#ddd" : "#eee")};
  }

  &:active {
    background: #ccc;
  }

  path {
    stroke-width: 2px;
  }
`;
