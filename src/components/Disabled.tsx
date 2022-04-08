import { FC } from "react";
import styled from "@emotion/styled";
import { Palette } from "../constants/color";

export const Disabled: FC = () => {
  return (
    <Container>
      <Title>Something went wrong.</Title>
      <Text>
        This board doesn't work on mobile devices.
        <br />
        To learn more please visit{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://github.com/nickzuber/notion-draw#faq"
        >
          the FAQ
        </a>
        .
      </Text>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  height: 100vh;
  width: 100%;
  margin: 0;
  background: #ffffff;
  box-sizing: border-box;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  border-radius: 0;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Text = styled.p`
  font-size: 13px;
  font-weight: 500;
  line-height: 17px;
  color: ${Palette.Black};
  margin: 4px auto 8px;
  text-align: center;
`;

const Title = styled(Text)`
  font-size: 18px;
  line-height: 19px;
  margin: 8px auto 12px;
`;
