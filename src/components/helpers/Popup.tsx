import { FC, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { ForeignObject } from "./Svg";
import AutoCurveSvg from "../../icons/auto-curve.svg";
import CurveSvg from "../../icons/curve.svg";
import TrashSvg from "../../icons/trash.svg";
import LockSvg from "../../icons/lock.svg";
import { Status } from "../../types/app";
import { app } from "../../state/state";
import { Line, Shape } from "../../types/shape";

const Size = {
  Divider: 9,
  Button: 36,
};

type PopupProps = {
  shapes: Shape[];
  x: number;
  y: number;
  z: number;
};

export const Popup: FC<PopupProps> = ({ shapes, ...props }) => {
  return shapes.length === 1 ? (
    <SingleItemPopup shape={shapes[0]} {...props} />
  ) : (
    <MultiItemPopup shapes={shapes} {...props} />
  );
};

export const MultiItemPopup: FC<PopupProps> = ({ shapes, x, y, z }) => {
  const { onDeleteSelectedShapes } = app;

  // Generate a unique key based on the selected items for the popup's render cycle.
  const key = shapes
    .slice()
    .sort()
    .map((shape) => shape.id)
    .join(",");

  const height = Size.Button;
  const width = Size.Button * 2 + Size.Divider;

  return (
    <ForeignObject
      interactive={false}
      style={{
        overflow: "visible",
        transform: `scale(${1 / z})`,
        transformOrigin: "0% 100%",
        transformBox: "fill-box",
      }}
      x={x}
      y={y}
      height={height}
      width={width}
    >
      <Wrapper>
        <Container key={key} height={height} width={width}>
          <Button onClick={() => console.info("lock item")}>
            <Icon src={LockSvg} />
          </Button>

          <Divider />

          <Button onClick={onDeleteSelectedShapes}>
            <Icon src={TrashSvg} />
          </Button>
        </Container>
      </Wrapper>
    </ForeignObject>
  );
};

export const SingleItemPopup: FC<
  Omit<PopupProps, "shapes"> & { shape: Shape }
> = ({ shape, x, y, z }) => {
  const { setStatus, onDeleteSelectedShapes, onAutoCurveLine } = app;

  // Generate a unique key based on the selected items for the popup's render cycle.
  const key = shape.id;

  const height = Size.Button;
  const width = Size.Button * 4 + Size.Divider;

  return (
    <ForeignObject
      interactive={false}
      style={{
        overflow: "visible",
        transform: `scale(${1 / z})`,
        transformOrigin: "0% 100%",
        transformBox: "fill-box",
      }}
      x={x}
      y={y}
      height={height}
      width={width}
    >
      <Wrapper>
        <Container key={key} height={height} width={width}>
          <Button onClick={() => console.info("lock item")}>
            <Icon src={LockSvg} />
          </Button>

          <Button onClick={() => setStatus(Status.CURVE)}>
            <Icon rotate={45 + 180} src={CurveSvg} />
          </Button>

          <Button
            onClick={() => {
              // There should only be one shape selected here anyway
              const success = onAutoCurveLine(shape as Line);
              console.info(success);
            }}
          >
            <Icon src={AutoCurveSvg} />
          </Button>

          <Divider />

          <Button onClick={onDeleteSelectedShapes}>
            <Icon src={TrashSvg} />
          </Button>
        </Container>
      </Wrapper>
    </ForeignObject>
  );
};

type Sizable = {
  size?: number;
  rotate?: number;
};

type Resizable = {
  height?: number;
  width?: number;
};

type Animatable = {
  opacity: number;
  topOffset: number;
};

const Container: FC<Resizable> = ({ height, width, children }) => {
  const delayMs = 5;
  const ts = useRef<ReturnType<typeof setTimeout>>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ts.current = setTimeout(() => setReady(true), delayMs);
    return () => {
      if (ts.current) clearTimeout(ts.current);
    };
  }, []);

  return (
    <Contents
      height={height}
      width={width}
      opacity={ready ? 1 : 0}
      topOffset={ready ? 0 : 8}
    >
      {children}
    </Contents>
  );
};

const Wrapper = styled.div`
  transform: translateX(-50%);
`;

const Contents = styled.div<Resizable & Animatable>`
  pointer-events: all;
  background: #222222;
  display: flex;
  align-items: center;
  overflow: hidden;
  border-radius: 4px;
  height: ${(p) => p.height}px;
  width: ${(p) => p.width}px;
  opacity: ${(p) => p.opacity};
  transform: translateY(${(p) => p.topOffset}px);
  transition: opacity 150ms ease, transform 150ms ease;
`;

const Button = styled.div<Resizable>`
  pointer-events: all;
  width: 36px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 100ms ease;

  &:hover {
    background: #000000;
  }
`;

const Icon = styled.img<Resizable & Sizable>`
  height: ${(p) => p.size || 18}px;
  transform: rotate(${(p) => p.rotate || 0}deg);
  filter: invert(1) brightness(0.7);
`;

const Divider = styled.div`
  width: 1px;
  background: #000000;
  height: 100%;
  margin: 0 4px;
`;
