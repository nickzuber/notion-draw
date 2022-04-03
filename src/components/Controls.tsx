import { FC, Fragment } from "react";
import styled from "@emotion/styled";
import { EditorOptions, Selectable, Status, Theme } from "../types/app";
// import EraserSvg from "../icons/eraser.svg";
import PointerSvg from "../icons/mouse-pointer.svg";
import FingerSwipeSvg from "../icons/finger-swipe.svg";
import DrawingSvg from "../icons/edit.svg";
import PenSvg from "../icons/pen-tool.svg";
import PencilSvg from "../icons/pencil.svg";
import TrashSvg from "../icons/trash.svg";
import { app, DeleteSelectedShapes, Pinch, SetTheme } from "../state/state";
import { Shape, ShapeId } from "../types/shape";
import { Camera } from "../types/canvas";
import { requestZoomIn, requestZoomOut } from "../utils/camera";
import { Color, Palette } from "../constants/color";

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

export const Controls: FC<ControlsProps> = ({
  status,
  camera,
  theme,
  setTheme,
  onDeleteSelectedShapes,
  onPinch,
  options,
}) => {
  const { setStatus } = app;

  return (
    <Fragment>
      {!options.hideHeader && (
        <TopContainer>
          <TopBar>
            <LeftSection>
              <Badge>{`Alpha`}</Badge>
            </LeftSection>

            <Section>
              <Name>{"Spectre Demo"}</Name>
            </Section>

            <RightSection>
              <Button
                onClick={() => {
                  const zoomRequest = requestZoomOut(camera);
                  onPinch(zoomRequest.center, zoomRequest.dz);
                }}
              >
                <ZoomText>{"–"}</ZoomText>
              </Button>
              <TextButton>{`${Math.round(camera.z * 100)}%`}</TextButton>
              <Button
                onClick={() => {
                  const zoomRequest = requestZoomIn(camera);
                  onPinch(zoomRequest.center, zoomRequest.dz);
                }}
              >
                <ZoomText rotate={45}>{"×"}</ZoomText>
              </Button>
            </RightSection>
          </TopBar>
        </TopContainer>
      )}

      {options.embedMode && (
        <RightContainer>
          <Swatches>
            {Object.values(Palette).map((color) => (
              <ColorOption
                key={color}
                color={color}
                selected={color === theme.penColor}
                onClick={() => {
                  setTheme({ penColor: color });
                }}
              />
            ))}
          </Swatches>
        </RightContainer>
      )}

      {!options.hideControls ? (
        <BottomContainer>
          <Panel>
            <LeftSideContainer>
              <SideControl
                onClick={() => setStatus(Status.IDLE)}
                selected={status === Status.IDLE}
              >
                <Icon size={16} src={PointerSvg} />
              </SideControl>
              <SideControl
                onClick={() => setStatus(Status.PAN)}
                selected={status === Status.PAN}
              >
                <Icon size={14} src={FingerSwipeSvg} />
              </SideControl>
            </LeftSideContainer>
            <Control
              selected={status === Status.FREEHAND}
              onClick={() => setStatus(Status.FREEHAND)}
            >
              <Icon size={18} src={PencilSvg} />
            </Control>

            <Control selected={status === Status.DRAW} onClick={() => setStatus(Status.DRAW)}>
              <Icon size={22} src={DrawingSvg} />
            </Control>

            <Control selected={status === Status.PEN} onClick={() => setStatus(Status.PEN)}>
              <Icon size={22} rotate={335} src={PenSvg} />
            </Control>

            <Divider />

            <Control onClick={() => onDeleteSelectedShapes()}>
              <Icon size={22} src={TrashSvg} />
            </Control>
          </Panel>
        </BottomContainer>
      ) : (
        <LeftContainer>
          <SideControls>
            <SmallControl
              onClick={() => setStatus(Status.IDLE)}
              selected={status === Status.IDLE}
            >
              <Icon size={16} src={PointerSvg} />
            </SmallControl>
            <SmallControl
              selected={status === Status.FREEHAND}
              onClick={() => setStatus(Status.FREEHAND)}
            >
              <Icon size={18} src={PencilSvg} />
            </SmallControl>
          </SideControls>
        </LeftContainer>
      )}
    </Fragment>
  );
};

type Sizable = {
  size?: number;
  rotate?: number;
};
const Icon = styled.img<Sizable>`
  height: ${(p) => p.size || 16}px;
  transform: rotate(${(p) => p.rotate || 0}deg);
`;

const Divider = styled.div`
  width: 1px;
  background: #e5e5e5;
  height: 100%;
  margin-left: 12px;
`;

const TopContainer = styled.div`
  position: absolute;
  background: transparent;
  height: 42px;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  user-select: none;
`;

const BottomContainer = styled.div`
  position: absolute;
  background: transparent;
  height: 72px;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  user-select: none;
`;

const LeftContainer = styled.div`
  position: absolute;
  background: transparent;
  min-height: 100px;
  width: 60px;
  top: 0;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  user-select: none;
`;

const RightContainer = styled.div`
  position: absolute;
  background: transparent;
  min-height: 100px;
  width: 60px;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  user-select: none;
`;

const SidePanel = styled.div`
  margin: 0;
  background: #fefefe;
  padding: 8px 16px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 16px -1px, rgba(0, 0, 0, 0.05) 0px 0px 16px -8px,
    rgba(0, 0, 0, 0.12) 0px 0px 16px -12px, rgba(0, 0, 0, 0.08) 0px 0px 2px 0px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: all;
`;

const Swatches = styled(SidePanel)`
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
  margin-right: -8px;
`;

const SideControls = styled(SidePanel)`
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  margin-left: 7px;
`;

const ColorOption = styled.div<{ color: string; selected: boolean }>`
  position: relative;
  display: block;
  margin: 8px auto;
  height: 25px;
  width: 25px;
  border-radius: 100%;
  background: ${(props) => props.color}88;
  border: 3px solid ${(props) => props.color};

  ${(props) =>
    props.selected &&
    `&:after {
      content: "";
      position: absolute;
      display: block;
      background: #26a2f8;
      height: 100%;
      width: 6px;
      left: -100%;
      transform: scaleY(1.5);
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }`}
`;

const TopBar = styled.div`
  margin: 0;
  background: #ffffff;
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
  user-select: all;
`;

const Section = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  bottom: 0;
  pointer-events: all;
  user-select: all;
`;

const LeftSection = styled(Section)`
  left: 8px;
`;

const RightSection = styled(Section)`
  right: 8px;
`;

const Badge = styled.span`
  color: ${Color.SelectionBox.Primary};
  background: ${Color.SelectionBox.Primary}33;
  font-weight: 500;
  font-size: 12px;
  padding: 3px 6px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 11px;
  margin: 0 8px;
  user-select: none;
`;

const Name = styled.h1`
  user-select: none;
  font-weight: 400;
  font-size: 14px;
`;

const Panel = styled.div`
  pointer-events: all;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 0 0 32px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  height: 72px;
  border-radius: 12px;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  overflow: hidden;
`;

const SideControl = styled.div<Selectable>`
  pointer-events: all;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50%;
  width: 42px;
  background: ${(p) => (p.selected ? Color.SelectionBox.Primary : "transparent")};

  transition: all 0ms ease;
  cursor: pointer;

  &:hover {
    background: ${(p) => (p.selected ? Color.SelectionBox.Primary : "#fafafa")};
  }

  &:active {
    background: ${(p) => (p.selected ? Color.SelectionBox.Primary : "#e8e8e8")};
  }

  img {
    filter: ${(p) => (p.selected ? "invert(1)" : null)};
  }
`;

const LeftSideContainer = styled.div`
  width: 42px;
  height: 70px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-right: 1px solid #e5e5e5;

  div:first-child {
    border-bottom: 1px solid #e5e5e5;
  }
`;

const Control = styled.div<Selectable>`
  pointer-events: all;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 12px 0 12px 12px;
  background: ${(p) => (p.selected ? Color.SelectionBox.Primary : "transparent")};
  border: 1px solid ${(p) => (p.selected ? Color.SelectionBox.Primary : "#e5e5e5")};
  border-radius: 8px;
  height: 42px;
  width: 42px;
  padding: 8px;
  transition: all 0ms ease;
  cursor: pointer;

  &:last-child {
    margin: 12px;
  }

  &:hover {
    background: ${(p) => (p.selected ? Color.SelectionBox.Primary : "#fafafa")};
  }

  &:active {
    background: ${(p) => (p.selected ? Color.SelectionBox.Primary : "#e8e8e8")};
  }

  img {
    filter: ${(p) => (p.selected ? "invert(1)" : null)};
  }
`;

const SmallControl = styled(Control)`
  margin: 6px 0 6px 6px;
  border-radius: 100%;
  height: 40px;
  width: 40px;
  padding: 0px;
  margin: 8px auto !important;
`;

const Button = styled.button`
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
  border: 0;
  width: 40px;
  border: 1px solid #e5e5e5;
  border-right: 0;
  height: 32px;
  font-weight: 400;
  user-select: none;
  transition: all 0ms ease;
  cursor: pointer;

  &:hover {
    background: #fafafa;
  }

  &:active {
    background: #e8e8e8;
  }

  &:first-of-type {
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
  }

  &:last-of-type {
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
    border-right: 1px solid #e5e5e5;
  }
`;

const TextButton = styled(Button)`
  width: 58px;
  font-size: 12px;
  font-weight: 400;
`;

type Rotatable = { rotate?: number };
const ZoomText = styled(Name)<Rotatable>`
  width: 58px;
  font-size: 16px;
  font-weight: 200;
  transform: rotate(${(p) => p.rotate || 0}deg);
`;
