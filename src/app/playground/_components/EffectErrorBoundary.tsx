"use client";

import { Component, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";

type Props = { children: ReactNode; onRetry: () => void };

export default class EffectErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-zinc-300">장면을 불러오지 못했습니다.</p>
        <button type="button" onClick={this.props.onRetry} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300">
          <RotateCcw aria-hidden="true" className="size-4" /> 다시 시도
        </button>
      </div>
    );
  }
}
