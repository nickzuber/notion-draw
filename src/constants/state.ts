import { Content, Meta, Theme } from "../types/app";
import { Camera } from "../types/canvas";
import { Palette } from "./color";

export const initialCamera: Camera = {
  x: -1150,
  y: -650,
  z: 1,
};

export const initialContent: Content = {
  shapes: [],
  selectedIds: [],
  hoveredIds: [],
};

export const initialTheme: Theme = {
  penColor: Palette.Black,
  penSize: 4,
  eraserSize: 8,
};

export const initialMeta: Meta = {
  disablePanning: false,
};
