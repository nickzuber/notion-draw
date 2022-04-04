import { FC, useContext, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Action, EditorOptions, Meta, Status, Theme } from "../types/app";
import { ReactComponent as TrashSvg } from "../icons/trash.svg";
import { ReactComponent as PencilSvg } from "../icons/pencil.svg";
import { ReactComponent as EraserSvg } from "../icons/eraser.svg";
import { ReactComponent as SquiggleSvg } from "../icons/squiggle.svg";
import { ReactComponent as LockSvg } from "../icons/lock.svg";
import { ReactComponent as LockOpenedSvg } from "../icons/lock-opened.svg";
import { app, DeleteSelectedShapes, Pinch, SetTheme } from "../state/state";
import { Shape, ShapeId } from "../types/shape";
import { Camera } from "../types/canvas";
import { Palette } from "../constants/color";
import { ActivityContext } from "../contexts/activity";

type ControlsProps = {
  status: Status;
  camera: Camera;
  meta: Meta;
  action: Action;
  shapes: Shape[];
  theme: Theme;
  setTheme: SetTheme;
  selectedIds: ShapeId[];
  onDeleteSelectedShapes: DeleteSelectedShapes;
  onPinch: Pinch;
  options: EditorOptions;
};

export const Controls: FC<ControlsProps> = ({
  status,
  camera,
  meta,
  action,
  theme,
  setTheme,
}) => {
  const { setStatus, setMeta, onDeleteAllShapes } = app;
  const [showStyles, setShowStyles] = useState(false);
  const active = useContext(ActivityContext) || true;

  const isDrawing = action === Action.DRAWING_FREEHAND;
  const hidden = !active || isDrawing;

  useEffect(() => {
    if (isDrawing) {
      setShowStyles(false);
    }
  }, [isDrawing]);

  return (
    <Container hide={hidden}>
      <RightContainer>
        <SidePanel style={{ width: 145 }}>
          <StyleSummary onClick={() => setShowStyles((s) => !s)}>
            <Group>
              <Text>Styles</Text>
              <SummaryStroke color={theme.penColor} />
            </Group>
            <Group>
              <Text>{Math.round(camera.z * 100)}%</Text>
            </Group>
          </StyleSummary>
        </SidePanel>
        {showStyles && (
          <SidePanel style={{ padding: "4px 12px", justifyContent: "flex-start" }}>
            <Section>
              <Label>
                <Text>Colors</Text>
              </Label>
              <Options>
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
              </Options>
            </Section>

            <Section>
              <Label>
                <Text>Sizes</Text>
              </Label>
              <Options>
                <StrokeSize
                  size={2}
                  color={theme.penColor}
                  selected={theme.penSize === 2}
                  onClick={() => setTheme({ penSize: 2 })}
                />
                <StrokeSize
                  size={4}
                  color={theme.penColor}
                  selected={theme.penSize === 4}
                  onClick={() => setTheme({ penSize: 4 })}
                />
                <StrokeSize
                  size={8}
                  color={theme.penColor}
                  selected={theme.penSize === 8}
                  onClick={() => setTheme({ penSize: 8 })}
                />
              </Options>
            </Section>
          </SidePanel>
        )}
      </RightContainer>

      <LeftContainer>
        <SidePanel>
          <DrawingOption
            selected={status === Status.FREEHAND}
            onClick={() => setStatus(Status.FREEHAND)}
          />
          <ErasingOption
            selected={status === Status.ERASE}
            onClick={() => setStatus(Status.ERASE)}
          />
        </SidePanel>

        <SidePanel>
          <DeleteOption onClick={() => onDeleteAllShapes()} />
          {meta.disablePanning ? (
            <LockOption onClick={() => setMeta({ disablePanning: false })} />
          ) : (
            <UnlockOption onClick={() => setMeta({ disablePanning: true })} />
          )}
        </SidePanel>
      </LeftContainer>
    </Container>
  );
};

const Container = styled.div<{ hide: boolean }>`
  transition: all 250ms ease;
  pointer-events: ${(props) => (props.hide ? "none" : "all")};
  opacity: ${(props) => (props.hide ? 0 : 1)};
`;

const LeftContainer = styled.div`
  position: absolute;
  background: transparent;
  min-height: 100px;
  width: 80px;
  top: 12px;
  left: 12px;
  bottom: 12px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: none;
  user-select: none;
`;

const RightContainer = styled.div`
  position: absolute;
  background: transparent;
  min-height: 100px;
  width: 215px;
  top: 24px;
  right: 12px;
  bottom: 0;

  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
  pointer-events: none;
  user-select: none;
`;

const SidePanel = styled.div`
  margin: 0 0 8px;
  background: #fefefe;
  min-height: 30px;
  padding: 4px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 16px -1px, rgba(0, 0, 0, 0.05) 0px 0px 16px -8px,
    rgba(0, 0, 0, 0.12) 0px 0px 16px -12px, rgba(0, 0, 0, 0.08) 0px 0px 2px 0px;
  box-sizing: border-box;
  border-radius: 6px;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  pointer-events: all;
`;

const StyleSummary = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  height: 30px;
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
  transition: all 100ms ease;

  &:hover {
    background: #eee;
  }

  &:active {
    background: #ccc;
  }
`;

const DrawingOption = styled(PencilSvg)<{ selected: boolean }>`
  position: relative;
  display: inline-block;
  margin: 2px;
  padding: 8px;
  height: 30px;
  width: 30px;
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
  margin: 2px;
  padding: 8px;
  height: 30px;
  width: 30px;
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

const DeleteOption = styled(TrashSvg)`
  position: relative;
  display: inline-block;
  margin: 2px;
  padding: 8px;
  height: 30px;
  width: 30px;
  border-radius: 100%;
  background: transparent;
  cursor: pointer;
  transition: all 100ms ease;

  &:hover {
    background: #eee;
  }

  &:active {
    background: #ccc;
  }

  path {
    stroke-width: 2px;
  }
`;

const LockOption = styled(LockSvg)`
  position: relative;
  display: inline-block;
  margin: 2px;
  padding: 8px;
  height: 30px;
  width: 30px;
  border-radius: 100%;
  background: transparent;
  cursor: pointer;
  transition: all 100ms ease;

  &:hover {
    background: #eee;
  }

  &:active {
    background: #ccc;
  }

  path {
    stroke-width: 2px;
  }
`;

const UnlockOption = styled(LockOpenedSvg)`
  position: relative;
  display: inline-block;
  margin: 2px;
  padding: 8px;
  height: 30px;
  width: 30px;
  border-radius: 100%;
  background: transparent;
  cursor: pointer;
  transition: all 100ms ease;

  &:hover {
    background: #eee;
  }

  &:active {
    background: #ccc;
  }

  path {
    stroke-width: 2px;
  }
`;

const SummaryStroke = styled(SquiggleSvg)<{ color: string; size?: number }>`
  position: relative;
  display: inline-block;
  margin: 2px;
  padding: 4px;
  height: 30px;
  width: 30px;
  border-radius: 100%;
  color: ${(props) => props.color};
  background: transparent;
  transform: rotate(192deg);
  cursor: pointer;
  transition: all 100ms ease;

  path {
    stroke-width: ${(props) => props.size || null};
  }
`;

const ColorOption = styled(SquiggleSvg)<{ color: string; selected: boolean }>`
  position: relative;
  display: inline-block;
  margin: 2px;
  padding: 4px;
  height: 30px;
  width: 30px;
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

const Text = styled.span`
  display: block;
  font-size: 13px;
  font-weight: 500;
  line-height: 14px;
`;

const Group = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Section = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;

  margin-bottom: 8px;
`;

const Label = styled.div`
  width: 42px;
  span {
    margin-top: 12px;
  }
`;

const Options = styled.div`
  flex: 3;
  padding-left: 12px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
`;

const StrokeSize = styled.div<{ color: string; selected: boolean; size: number }>`
  position: relative;
  margin: 2px;
  padding: 4px;
  height: 30px;
  width: 30px;
  border-radius: 100%;
  background: ${(props) => (props.selected ? "#ddd" : "transparent")};

  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 100ms ease;

  &:hover {
    background: ${(props) => (props.selected ? "#ddd" : "#eee")};
  }

  &:active {
    background: #ccc;
  }

  &:after {
    content: "";
    width: 20px;
    height: ${(props) => props.size}px;
    background: ${(props) => props.color};
    border-radius: 4px;
  }
`;
