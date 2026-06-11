import React, { StrictMode, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in react app:", error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
          <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h1 className="text-red-400 text-lg font-bold mb-2">⚠️ 小程序运行发生异常</h1>
            <p className="text-zinc-400 text-xs mb-4">
              页面加载失败，可能是由于本地缓存配置或不一致的数据结构引起的。请点击下方按钮清空理智操盘手本地缓存：
            </p>
            <div className="bg-black/45 p-3 rounded-xl mb-4 font-mono text-[10px] text-red-300 break-words max-h-40 overflow-y-auto">
              {this.state.error?.stack || this.state.error?.message}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors"
              >
                清理全部缓存并重试
              </button>
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-zinc-300 font-bold text-xs transition-colors"
              >
                刷新
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

