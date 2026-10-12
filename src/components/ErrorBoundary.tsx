import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  declare props: Props;
  declare state: State;
  declare setState: (state: Partial<State> | ((prevState: State) => Partial<State>)) => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 my-2 rounded-2xl bg-zinc-900 border border-zinc-800 text-white flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>{this.props.label ? `${this.props.label} encountered an issue` : 'Component encountered an issue'}</span>
          </div>
          <p className="text-xs text-zinc-400">
            {this.state.error?.message || 'A temporary error occurred while rendering this module.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="self-start text-[11px] font-mono px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
