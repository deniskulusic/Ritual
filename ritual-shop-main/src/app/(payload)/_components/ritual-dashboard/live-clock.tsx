"use client";

import { useEffect, useState } from "react";

const formatDateLabel = (value: Date): string =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(value);

const formatTimeLabel = (value: Date): string =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const initialFrame = window.setTimeout(() => {
      setNow(new Date());
    }, 0);

    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearTimeout(initialFrame);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="ritual-dashboard__hero-clock" aria-label="Current date and time">
      <span>{now ? formatDateLabel(now) : "Local time"}</span>
      <strong suppressHydrationWarning>{now ? formatTimeLabel(now) : "--:--:--"}</strong>
    </div>
  );
}
