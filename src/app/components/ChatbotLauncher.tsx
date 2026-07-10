"use client";

/** 우하단 플로팅 버튼으로 챗봇을 모달로 띄운다. host의 /embed를 iframe으로 로드하고 next-themes로 테마를 동기화한다. */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";

interface Props {
  /** 챗봇 호스트 origin. 예: https://portfolio-chatbot.vercel.app */
  host: string;
}

export function ChatbotLauncher({ host }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // 첫 오픈 때 iframe을 붙이고 이후 유지(불필요한 사전 로드 방지)
  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { resolvedTheme } = useTheme();

  const origin = useMemo(() => {
    try {
      return new URL(host).origin;
    } catch {
      return host;
    }
  }, [host]);

  // iframe → 부모 메시지 수신 (origin 검증)
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== origin) return;
      const data = e.data;
      if (data?.type === "chatbot:ready") setReady(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [origin]);

  // 블로그 테마 변경 시 iframe에 실시간 반영
  useEffect(() => {
    if (!ready || !resolvedTheme) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: "theme", value: resolvedTheme === "dark" ? "dark" : "light" },
      origin,
    );
  }, [resolvedTheme, ready, origin]);

  // 서버/클라이언트 모두 같은 값으로 시작해야 hydration이 깨지지 않음 — 항상 auto로 로드하고 ready 후 postMessage로 보정한다.
  const [src] = useState(() => `${origin}/embed?theme=auto`);

  // 모달이 열린 동안: Esc로 닫기 + 배경 스크롤 잠금 + 포커스 이동(닫을 때 버튼으로 복원)
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    iframeRef.current?.focus();
    const button = buttonRef.current;
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      button?.focus();
    };
  }, [open]);

  const toggle = () => {
    setMounted(true);
    setOpen((v) => !v);
  };

  return (
    <>
      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2147483000,
          background: "rgba(0,0,0,0.4)",
          transition: "opacity .22s ease",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="포트폴리오 챗봇"
        aria-hidden={!open}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          zIndex: 2147483001,
          width: "min(380px, calc(100vw - 40px))",
          height: "min(600px, calc(100vh - 140px))",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
          background: "transparent",
          transition: "opacity .22s ease, transform .22s ease",
          opacity: open ? 1 : 0,
          transform: open ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.96)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {mounted ? (
          <iframe
            ref={iframeRef}
            src={src}
            title="포트폴리오 챗봇"
            style={{ border: 0, width: "100%", height: "100%", display: "block" }}
          />
        ) : null}
      </div>

      <div
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 2147483002,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            background: "rgba(17,17,17,0.92)",
            color: "#fff",
            fontSize: 13,
            padding: "6px 10px",
            borderRadius: 8,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            opacity: hovered && !open ? 1 : 0,
            transform: hovered && !open ? "translateX(0)" : "translateX(6px)",
            transition: "opacity .15s ease, transform .15s ease",
          }}
        >
          포트폴리오 챗봇과 대화하기
        </span>

        <button
          ref={buttonRef}
          type="button"
          onClick={toggle}
          aria-label={open ? "챗봇 닫기" : "챗봇 열기"}
          aria-expanded={open}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: 0,
            cursor: "pointer",
            background: "#0d9488",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(13,148,136,0.45)",
            display: "grid",
            placeItems: "center",
            transition: "transform .2s ease, background .2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.06)";
            setHovered(true);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            setHovered(false);
          }}
        >
          {open ? <CloseIcon /> : <ChatIcon />}
        </button>
      </div>
    </>
  );
}

function Icon({ size, children }: { size: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function ChatIcon() {
  return (
    <Icon size={24}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Icon>
  );
}

function CloseIcon() {
  return (
    <Icon size={22}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Icon>
  );
}
