"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";

export function DynamicHeight(props: {
  children: React.ReactNode;
  maxHeight?: string;
  transition?: string;
}) {
  const { height, elementRef } = useHeightObserver();

  return (
    <div
      style={{
        height: typeof height === "number" ? `${height}px` : "auto",
        transition:
          props.transition ||
          "height 210ms cubic-bezier(0.175, 0.885, 0.32, 1.1)",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        ref={elementRef}
        style={{
          maxHeight: props.maxHeight,
        }}
      >
        {props.children}
      </div>
    </div>
  );
}

function useHeightObserver() {
  const elementRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      setHeight(element.scrollHeight);
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return { height, elementRef: elementRef };
}
