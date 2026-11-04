import { Component, type ErrorInfo, type ReactNode } from "react";

interface PanelBoundaryProps {
  children: ReactNode;
}

interface PanelBoundaryState {
  hasError: boolean;
}

/**
 * Fault-tolerant wrapper for major dashboard panels: a runtime exception in a
 * panel renders a quiet placeholder instead of white-screening the page.
 */
export class PanelBoundary extends Component<PanelBoundaryProps, PanelBoundaryState> {
  override state: PanelBoundaryState = { hasError: false };

  static getDerivedStateFromError(): PanelBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(_error: unknown, _info: ErrorInfo) {
    // Silent on purpose — no diagnostic noise in the browser console.
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          This panel couldn't be rendered. Reload the page to restore it.
        </div>
      );
    }
    return this.props.children;
  }
}
