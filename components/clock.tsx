"use client";

import { useCallback, useEffect, useState } from "react";

type ApiTime = { serverTime: string };

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);
  const [error, setError] = useState(false);

  const fetchServerTime = useCallback(async () => {
    try {
      const res = await fetch("/api/time");
      const data: ApiTime = await res.json();
      setTime(new Date(data.serverTime));
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchServerTime();
    const serverInterval = setInterval(fetchServerTime, 1000 * 60 * 10);
    const tickInterval = setInterval(() => {
      setTime((prev) => (prev ? new Date(prev.getTime() + 1000) : prev));
    }, 1000);

    return () => {
      clearInterval(serverInterval);
      clearInterval(tickInterval);
    };
  }, [fetchServerTime]);

  if (!time && !error) return <div className="text-4xl">Loading...</div>;
  if (error) return <div className="text-4xl">Fetching error</div>;

  return (
    <div className="text-4xl" translate="no" suppressHydrationWarning>
      {time
        ? time.toLocaleDateString("tr-TR", {
            dateStyle: "long",
          })
        : null}
      {"\n"}
      {time
        ? time.toLocaleTimeString("tr-TR", {
            hour12: false,
            timeZone: "Europe/Istanbul",
          })
        : null}
    </div>
  );
}
