import styled from "@emotion/styled";

type Interactable = {
  interactive?: boolean;
};

function interactiveRules({ interactive = true }): string {
  return `
    pointer-events: ${interactive ? "painted" : "none"};
    user-select: ${interactive ? "painted" : "none"};
  `;
}

export const Path = styled.path<Interactable>(interactiveRules);
export const Rect = styled.rect<Interactable>(interactiveRules);
export const Circle = styled.circle<Interactable>(interactiveRules);
export const Text = styled.text<Interactable>(interactiveRules);
export const ForeignObject =
  styled.foreignObject<Interactable>(interactiveRules);
