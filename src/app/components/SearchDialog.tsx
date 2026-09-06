"use client";

import {
  Component,
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "./LocaleProvider";
import { createRetryableLoader } from "./retryable-loader";

const searchDialogLoader = createRetryableLoader(() =>
  import("./SearchDialogContent"),
);

type DialogContentProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

function createLazySearchDialogContent() {
  return lazy(searchDialogLoader.load);
}

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
  resetKey: number;
};

class SearchDialogErrorBoundary extends Component<
  ErrorBoundaryProps,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(previous: ErrorBoundaryProps) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) {
      this.setState({ failed: false });
    }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

type SearchContextValue = { open: boolean; setOpen: (open: boolean) => void };
const SearchContext = createContext<SearchContextValue | null>(null);

function useSearchDialog() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearchDialog must be used within SearchProvider");
  return ctx;
}

// 검색 다이얼로그는 헤더 안에서 데스크톱/모바일 두 곳에 트리거 버튼이 필요하지만
// 실제 다이얼로그(Root/Portal)는 한 번만 마운트해야 Ctrl/Cmd+K로 두 개가 동시에 열리지 않는다.
// Provider는 가벼운 상태와 단축키만 초기 로드하고, 실제 콘텐츠는 첫 사용 시 가져온다.
export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(false);
  const [activated, setActivated] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [LazySearchDialogContent, setLazySearchDialogContent] = useState<
    ComponentType<DialogContentProps>
  >(() => createLazySearchDialogContent());

  const setOpen = useCallback((next: boolean) => {
    if (next) setActivated(true);
    setOpenState(next);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setActivated(true);
        setOpenState((previous) => !previous);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const value = useMemo(() => ({ open, setOpen }), [open, setOpen]);
  const retryLoad = useCallback(() => {
    setLazySearchDialogContent(() => createLazySearchDialogContent());
    setRetryKey((key) => key + 1);
  }, []);

  return (
    <SearchContext.Provider value={value}>
      {children}
      {activated ? (
        <SearchDialogErrorBoundary
          resetKey={retryKey}
          fallback={
            <SearchDialogFallback
              open={open}
              setOpen={setOpen}
              failed
              onRetry={retryLoad}
            />
          }
        >
          <Suspense
            fallback={<SearchDialogFallback open={open} setOpen={setOpen} />}
          >
            <LazySearchDialogContent open={open} setOpen={setOpen} />
          </Suspense>
        </SearchDialogErrorBoundary>
      ) : null}
    </SearchContext.Provider>
  );
}

export function SearchTrigger() {
  const t = useT();
  const { setOpen } = useSearchDialog();

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("search.open")}
        onPointerEnter={() => void searchDialogLoader.warm()}
        onFocus={() => void searchDialogLoader.warm()}
        onClick={() => setOpen(true)}
        className="relative before:absolute before:-inset-1 before:content-['']"
      >
        <Search className="h-5 w-5" />
      </Button>
      <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline-block">
        ⌘K
      </kbd>
    </div>
  );
}

function SearchDialogFallback({
  open,
  setOpen,
  failed = false,
  onRetry,
}: DialogContentProps & { failed?: boolean; onRetry?: () => void }) {
  const t = useT();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <DialogPrimitive.Content
          id="search-dialog-loading"
          className="fixed left-1/2 top-[20%] z-50 w-[min(92vw,560px)] -translate-x-1/2 rounded-xl border bg-background p-4 shadow-2xl outline-none"
        >
          <DialogPrimitive.Title className="sr-only">
            {t("search.title")}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description
            role={failed ? "alert" : "status"}
            aria-live={failed ? "assertive" : "polite"}
            className="py-6 text-center text-sm text-muted-foreground"
          >
            {t(failed ? "search.loadError" : "search.loading")}
          </DialogPrimitive.Description>
          <div className="flex justify-center gap-2">
            {failed && onRetry ? (
              <Button type="button" variant="outline" onClick={onRetry}>
                {t("search.retry")}
              </Button>
            ) : null}
            <DialogPrimitive.Close asChild>
              <Button
                id="search-dialog-fallback-close"
                type="button"
                variant="ghost"
              >
                {t("search.close")}
              </Button>
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
