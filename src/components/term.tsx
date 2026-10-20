"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { GLOSSARY, type TermKey } from "@/lib/glossary";

const WIDTH = 288; // 말풍선 너비(px)
const GAP = 10; // 용어와 말풍선 사이 간격
const MARGIN = 8; // 화면 가장자리 여백

type Pos = { left: number; top: number; arrowLeft: number; placement: "top" | "bottom" };

/**
 * 지표 용어 + 말풍선 설명.
 * 마우스를 올리거나, 키보드로 포커스하거나, 모바일에서 탭하면 열린다.
 * 말풍선은 body에 fixed로 그려서 스크롤 표(overflow) 안에서도 잘리지 않는다.
 */
export function Term({
  k,
  children,
  className = "",
  iconOnly = false,
}: {
  k: TermKey;
  children?: ReactNode;
  className?: string;
  /** true면 글자는 그대로 두고 ⓘ 아이콘만 말풍선을 연다 (정렬되는 표 제목 등) */
  iconOnly?: boolean;
}) {
  const entry = GLOSSARY[k];
  const id = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false); // 탭/클릭으로 연 경우 마우스가 떠나도 유지
  const [pos, setPos] = useState<Pos | null>(null);

  const place = useCallback(() => {
    const t = triggerRef.current?.getBoundingClientRect();
    const b = bubbleRef.current;
    if (!t || !b) return;
    const h = b.offsetHeight;
    const vw = window.innerWidth;
    const width = Math.min(WIDTH, vw - MARGIN * 2);
    const center = t.left + t.width / 2;
    const left = Math.min(Math.max(center - width / 2, MARGIN), vw - width - MARGIN);
    const placement = t.top - h - GAP >= MARGIN ? "top" : "bottom";
    const top = placement === "top" ? t.top - h - GAP : t.bottom + GAP;
    setPos({ left, top, placement, arrowLeft: Math.min(Math.max(center - left, 14), width - 14) });
  }, []);

  const show = () => setOpen(true);
  const hide = () => {
    setOpen(false);
    setPinned(false);
    setPos(null);
  };
  // 말풍선이 DOM에 붙는 순간 크기를 재서 위치를 잡는다.
  const bubbleMount = useCallback(
    (el: HTMLDivElement | null) => {
      bubbleRef.current = el;
      if (el) place();
    },
    [place],
  );

  useEffect(() => {
    if (!open) return;
    const close = () => {
      setOpen(false);
      setPinned(false);
      setPos(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !bubbleRef.current?.contains(target)) close();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  return (
    <>
      {iconOnly && children}
      <span
        ref={triggerRef}
        tabIndex={0}
        role="button"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        aria-label={iconOnly ? `${entry.title} 설명` : undefined}
        className={`term ${iconOnly ? "term-icon-only" : ""} ${className}`}
        onMouseEnter={show}
        onMouseLeave={() => !pinned && hide()}
        onFocus={show}
        onBlur={() => !pinned && hide()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (pinned) {
            hide();
          } else {
            setPinned(true);
            setOpen(true);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (open) hide();
            else show();
          }
        }}
      >
        {!iconOnly && (children ?? entry.title)}
        <svg aria-hidden viewBox="0 0 16 16" className="term-icon">
          <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="8" cy="5" r="0.9" fill="currentColor" />
          <path d="M8 7.3v4.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </span>
      {open &&
        createPortal(
          <div
            ref={bubbleMount}
            id={id}
            role="tooltip"
            className="term-bubble"
            data-placement={pos?.placement ?? "top"}
            style={{
              width: `min(${WIDTH}px, calc(100vw - ${MARGIN * 2}px))`,
              left: pos?.left ?? -9999,
              top: pos?.top ?? -9999,
              visibility: pos ? "visible" : "hidden",
              ["--arrow-left" as string]: `${pos?.arrowLeft ?? 0}px`,
            }}
          >
            <div className="font-semibold text-ink">{entry.title}</div>
            <p className="mt-1">{entry.body}</p>
            {"formula" in entry && entry.formula && (
              <p className="mt-2 rounded-md bg-page px-2 py-1 font-mono text-[11px] text-ink">{entry.formula}</p>
            )}
            {"read" in entry && entry.read && (
              <p className="mt-2">
                <span className="font-medium text-ink">읽는 법 · </span>
                {entry.read}
              </p>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
