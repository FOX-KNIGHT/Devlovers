'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Terminal, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { telemetry } from '@/lib/observability/telemetry.js';

export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    telemetry.captureException(error, {
      componentStack: errorInfo?.componentStack,
      url: typeof window !== 'undefined' ? window.location.href : '',
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-[#06080F]/90 backdrop-blur-md rounded-2xl border border-rose-500/30 text-slate-200">
          <div className="max-w-lg w-full text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-2 animate-pulse">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <span className="hud-tag text-[10px] text-rose-400 border-rose-500/40">
                CRITICAL SUBSYSTEM RECOVERY
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Operational Exception Caught
              </h2>
              <p className="text-xs text-slate-400">
                The platform intercepted an uncaught render fault. Automated telemetry telemetry has captured the incident state.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-[#0C0F1D] border border-white/10 rounded-lg p-3 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-32">
                <span className="text-rose-400 font-semibold">{this.state.error.name}: </span>
                <span>{this.state.error.message}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                variant="cyber"
                size="sm"
                onClick={this.handleReset}
                className="gap-2 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reinitialize Subsystem</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReload}
                className="gap-2 text-xs border-white/10 text-slate-300 hover:text-white"
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Hard Reload</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (typeof window !== 'undefined') window.location.href = '/';
                }}
                className="gap-2 text-xs text-slate-400 hover:text-white"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Return Home</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
