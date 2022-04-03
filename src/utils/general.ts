export function notEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function compare<T>(target: T, ...items: T[]) {
  return items.some((item) => item === target);
}

export function setCursor(style: string | null) {
  const bodyElement = document.querySelector("body");
  if (bodyElement) {
    bodyElement.style.cursor = style || "inherit";
  }
}
