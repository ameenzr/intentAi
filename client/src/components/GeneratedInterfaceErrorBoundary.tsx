import { Component, type ReactNode } from "react";

type GeneratedInterfaceErrorBoundaryProps = {
  children: ReactNode;
};

type GeneratedInterfaceErrorBoundaryState = {
  hasError: boolean;
};

class GeneratedInterfaceErrorBoundary extends Component<
  GeneratedInterfaceErrorBoundaryProps,
  GeneratedInterfaceErrorBoundaryState
> {
  state: GeneratedInterfaceErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Generated interface renderer failed", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="interface-error-card">
          <h2>Generated interface could not be rendered.</h2>
          <p>The response was malformed, but the rest of IntentUI is still safe.</p>
        </section>
      );
    }

    return this.props.children;
  }
}

export default GeneratedInterfaceErrorBoundary;
