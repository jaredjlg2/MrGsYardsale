"use client";

import { useEffect, useMemo, useState } from "react";

function formatTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}h ${m}m ${s}s`;
}

export function Countdown({ endAt, closed }: { endAt: string; closed: boolean }) {
  const endMs = useMemo(() => new Date(endAt).getTime(), [endAt]);
  const [left, setLeft] = useState(endMs - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setLeft(endMs - Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [endMs]);

  if (closed || left <= 0) return <p className="text-sm font-medium text-red-700">Closed</p>;
  return <p className="text-sm text-slate-700">Ends in {formatTime(left)}</p>;
}
