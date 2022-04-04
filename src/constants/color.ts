export const CurveTool = {
  Primary: "#cf00ff",
  Secondary: "#ffffff",
};

export const SelectionBox = {
  Primary: "#27A2F8",
  Secondary: "#ffffff",
};

export const HoverState = {
  Primary: "#27A2F8",
  Secondary: "#ffffff",
  Empty: "none",
};

export const Shape = {
  Primary: "#10293c",
  Secondary: "none",
};

export const Debug = {
  Primary: "#EE3F46",
  Secondary: "#ffffff",
};

export const Burst = {
  Primary: "#27A2F8",
};

export const PenPreview = {
  Primary: "#27A2F8",
  Secondary: "#FFFFFF",
};

export const Palette = {
  Black: "#10293c",
  Blue: "#339af0",
  Green: "#37b24d",
  Red: "#f03e3e",
  Cyan: "#3bc9db",
  Yellow: "#fcc419",
  Orange: "#fd7e14",
  Purple: "#845ef7",
};

export const Color = {
  Palette,
  Shape,
  CurveTool,
  SelectionBox,
  HoverState,
  Debug,
  Burst,
  PenPreview,
};

export function withOpacity(color: string) {
  return `${color}05`;
}
