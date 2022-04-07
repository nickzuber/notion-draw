import { Component } from "react";
import styled from "@emotion/styled";
import { Palette } from "../constants/color";

export class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
  } as {
    hasError: boolean;
    error: Error | null;
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({ error });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Container>
          <Title>An error occurred.</Title>
          <Text>Error: {this.state.error?.message}</Text>
        </Container>
      );
    }

    return this.props.children;
  }
}

const Container = styled.div`
  position: relative;
  height: 100vh;
  width: 100%;
  margin: 0;
  background: ${Palette.Black};
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
  color: #ffffff;
  margin: 4px auto 8px;
  text-align: center;
`;

const Title = styled(Text)`
  font-size: 18px;
  line-height: 19px;
  margin: 8px auto 12px;
`;
