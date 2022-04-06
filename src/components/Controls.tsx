import { FC, useContext, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Action, EditorOptions, Meta, Status, Theme } from "../types/app";
import { ReactComponent as TrashSvg } from "../icons/trash.svg";
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
  const { setStatus, setMeta, onResetCamera, onDeleteAllShapes } = app;
  const [showStyles, setShowStyles] = useState(false);
  const active = useContext(ActivityContext);

  const isLocked = meta.locked;
  const isDrawing = action === Action.DRAWING_FREEHAND;
  const hidden = !active || isDrawing;

  useEffect(() => {
    setShowStyles(false);
  }, [hidden]);

  return (
    <Container>
      <RightContainer hide={hidden}>
        <SidePanel style={{ width: 145 }} hide={isLocked}>
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
          <TogglablePanel>
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
                  onClick={() => {
                    setStatus(Status.FREEHAND);
                    setTheme({ penSize: 2 });
                  }}
                />
                <StrokeSize
                  size={4}
                  color={theme.penColor}
                  selected={theme.penSize === 4}
                  onClick={() => {
                    setStatus(Status.FREEHAND);
                    setTheme({ penSize: 4 });
                  }}
                />
                <StrokeSize
                  size={8}
                  color={theme.penColor}
                  selected={theme.penSize === 8}
                  onClick={() => {
                    setStatus(Status.FREEHAND);
                    setTheme({ penSize: 8 });
                  }}
                />
              </Options>
            </Section>

            <Section>
              <Button onClick={() => onResetCamera()}>Reset zoom & center</Button>
            </Section>
          </TogglablePanel>
        )}
      </RightContainer>

      <LeftContainer hide={hidden}>
        <SidePanel hide={isLocked}>
          <DrawingOption
            selected={status === Status.FREEHAND}
            onClick={() => setStatus(Status.FREEHAND)}
          />
          <ErasingOption
            selected={status === Status.ERASE}
            onClick={() => {
              setStatus(Status.ERASE);
              setShowStyles(false);
            }}
          />
        </SidePanel>

        <SidePanel>
          {meta.locked ? (
            <LockOption onClick={() => setMeta({ locked: false })} />
          ) : (
            <UnlockOption onClick={() => setMeta({ locked: true })} />
          )}
          <DeleteOption onClick={() => onDeleteAllShapes()} />
        </SidePanel>
      </LeftContainer>
    </Container>
  );
};

const TogglablePanel: FC = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ts = setTimeout(() => setReady(true), 10);
    return () => clearTimeout(ts);
  }, []);

  return <AdjustableSidePanel hide={!ready}>{children}</AdjustableSidePanel>;
};

const Container = styled.div``;

const HidableContainer = styled.div<{ hide?: boolean }>`
  transition: all 250ms ease;
  pointer-events: ${(props) => (props.hide ? "none" : "all")};
  opacity: ${(props) => (props.hide ? 0 : 1)};
  transform: scale(${(props) => (props.hide ? 0.975 : 1)});

  cursor: ${(props) => (props.hide ? "default !important" : null)};

  * {
    cursor: ${(props) => (props.hide ? "default !important" : null)};
  }
`;

const LeftContainer = styled(HidableContainer)`
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

const RightContainer = styled(HidableContainer)`
  position: absolute;
  background: transparent;
  min-height: 100px;
  width: 215px;
  top: 32px;
  right: 12px;
  bottom: 0;

  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
  pointer-events: none;
  user-select: none;
`;

const SidePanel = styled(HidableContainer)`
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

const AdjustableSidePanel = styled(SidePanel)`
  padding: 8px 12px 0;
  justify-content: flex-start;

  @media (max-height: 240px) {
    width: 350px;
  }
`;

const StyleSummary = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  height: 30px;
  width: 100%;
  border-radius: 6px;
  cursor: pointer;
  transition: all 100ms ease;

  &:hover {
    background: #eee;
  }

  &:active {
    background: #ccc;
  }
`;

const DrawingOption = styled(SquiggleSvg)<{ selected: boolean }>`
  position: relative;
  display: inline-block;
  margin: 2px;
  padding: 4px;
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
`;

const ErasingOption = styled(EraserSvg)<{ selected: boolean }>`
  position: relative;
  display: inline-block;
  margin: 2px;
  padding: 4px;
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
`;

const DeleteOption = styled(TrashSvg)`
  position: relative;
  display: inline-block;
  margin: 2px;
  padding: 6px;
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
`;

const LockOption = styled(LockSvg)`
  position: relative;
  display: inline-block;
  margin: 2px;
  padding: 6px;
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
  padding: 6px;
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
  // transform: rotate(192deg);
  cursor: pointer;
  transition: all 100ms ease;

  path {
    fill: ${(props) => props.color}3b;
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
  // transform: rotate(192deg);
  cursor: pointer;
  transition: all 100ms ease;

  &:hover {
    background: ${(props) => (props.selected ? "#ddd" : "#eee")};
  }

  &:active {
    background: #ccc;
  }

  path {
    fill: ${(props) => props.color}3b;
  }
`;

const Text = styled.span`
  display: block;
  font-size: 13px;
  font-weight: 500;
  line-height: 14px;
`;

const Button = styled(Text)`
  padding: 4px 8px;
  height: 30px;
  width: 100%;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 100ms ease;

  &:hover {
    background: #eee;
  }

  &:active {
    background: #ccc;
  }
`;

const Group = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Section = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;

  margin-bottom: 8px;
`;

const Label = styled.div`
  width: 42px;
  span {
    margin-top: 10px;
  }
`;

const Options = styled.div`
  flex: 3;
  width: 100%;
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
  width: 40px;
  border-radius: 6px;
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
    width: 90%;
    height: ${(props) => props.size}px;
    background: ${(props) => props.color};
    border-radius: 4px;
  }
`;
