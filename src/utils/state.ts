import { Shape } from "../types/shape";

export function endEditing(shape: Shape) {
  return {
    ...shape,
    editing: false,
  };
}

export function beginEditing(shape: Shape) {
  return {
    ...shape,
    editing: true,
  };
}
