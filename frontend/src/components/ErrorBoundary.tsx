/**
 * @file ErrorBoundary.tsx
 * @description React Error Boundary for catching and displaying UI-level crashes gracefully.
 */

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Professional Error Boundary component
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[UI CRASH] Uncaught error:', error, errorInfo);
  }

  public render() {
    const state = (this as any).state as State;
    const props = (this as any).props as Props;

    if (state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6">
          <div className="glass-panel p-8 max-w-md w-full text-center space-y-6 border-red-500/20">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/30">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-white">System Fault Detected</h1>
              <p className="text-sm text-zinc-400">
                The UI encountered a critical exception. This has been logged for engineering review.
              </p>
            </div>
            <div className="p-4 bg-black/40 rounded-lg border border-white/5 text-left">
              <p className="text-[10px] font-mono text-red-400 break-all">
                {state.error?.message || 'Unknown runtime error'}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-medium text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Restart Interface
            </button>
          </div>
        </div>
      );
    }

    return props.children;
  }
}

export default ErrorBoundary;
