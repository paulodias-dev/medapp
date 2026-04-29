import { Component, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    // Mantém no console para debug em produção
    console.error(error);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div style={{ padding: 16, fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto' }}>
        <h1 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Erro ao carregar o app</h1>
        <p style={{ marginTop: 8, marginBottom: 0, color: '#334155' }}>
          Abra o Console (F12) para mais detalhes.
        </p>
        <pre
          style={{
            marginTop: 12,
            padding: 12,
            background: '#0b1020',
            color: '#e2e8f0',
            borderRadius: 8,
            overflow: 'auto',
            fontSize: 12,
          }}>
          {this.state.error.message}
        </pre>
      </div>
    );
  }
}

