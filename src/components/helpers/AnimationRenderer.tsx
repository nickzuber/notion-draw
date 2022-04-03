import { FC, useContext } from "react";
import styled from "@emotion/styled";
import { keyframes, css } from "@emotion/react";
import { AnimationContext } from "../../contexts/animation";
import { ForeignObject } from "./Svg";
import { ANIMATION_TIME } from "../../hooks/useAnimation";
import { stringOfPoint } from "../../utils/geometry";
import { Color } from "../../constants/color";

const EASING_FUNCTION = "cubic-bezier(0.065, 0.835, 0.595, 0.895)";
const SLIDE_DISTANCE = 10;

type AnimationRendererProps = {
  size?: number;
};

export const AnimationRenderer: FC<AnimationRendererProps> = ({
  size = 40,
}) => {
  const { position } = useContext(AnimationContext);

  if (!position) {
    return null;
  }

  return (
    <ForeignObject
      key={stringOfPoint(position)}
      interactive={false}
      x={position.x - size / 2}
      y={position.y - size / 2}
      height={size}
      width={size}
    >
      <AnimationContainer>
        <AnimatedDotCenter size={size} />
        <AnimatedDotSliding size={size} rotation={45} />
        <AnimatedDotSliding size={size} rotation={45 * 3} />
        <AnimatedDotSliding size={size} rotation={45 * 5} />
        <AnimatedDotSliding size={size} rotation={45 * 7} />
      </AnimationContainer>
    </ForeignObject>
  );
};

type Sized = {
  size: number;
};

type Rotated = {
  rotation: number;
};

const fadingFrames = keyframes`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }

  100% {
    opacity: 0;
  }
`;

const getSlidingFrames = (rotation: number, distance: number) => keyframes`
  0% {
    transform: rotate(${rotation}deg) translate(0);
    opacity: 1;
  }

  50% {
    transform: rotate(${rotation}deg) translate(${distance}px);
    opacity: 0;
  }

  100% {
    transform: rotate(${rotation}deg) translate(${distance}px);
    opacity: 0;
  }
`;

const AnimatedDot = styled.div<Sized>(({ size }) => {
  const height = 2;
  const width = 5;

  return css`
    position: absolute;
    top: ${size / 2 - height / 2}px;
    left: ${size / 2 - width / 2}px;
    pointer-events: none;
    user-select: none;
    background: ${Color.Burst.Primary};
    border-radius: 1px;
    height: ${height}px;
    width: ${width}px;
  `;
});

const AnimatedDotCenter = styled(AnimatedDot)(({ size }) => {
  const d = 2;

  return css`
    border-radius: 100%;
    top: ${size / 2 - d / 2}px;
    left: ${size / 2 - d / 2}px;
    height: ${d}px;
    width: ${d}px;
    animation: ${fadingFrames} ${ANIMATION_TIME * 1.1}ms ${EASING_FUNCTION};
  `;
});

const AnimatedDotSliding = styled(AnimatedDot)<Rotated>`
  animation: ${(p) => getSlidingFrames(p.rotation, SLIDE_DISTANCE)}
    ${ANIMATION_TIME * 1.1}ms ${EASING_FUNCTION};
`;

const AnimationContainer = styled.div`
  pointer-events: none;
  user-select: none;
  background: none;
  height: 100%;
  width: 100%;
`;
