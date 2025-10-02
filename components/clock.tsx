"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";

type ApiTime = { serverTime: string };
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Clock() {
  const { data, error, isLoading } = useSWR<ApiTime>("/api/time", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 1000 * 60 * 10,
  });

  const [time, setTime] = useState<Date | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!data?.serverTime) return;
    setTime(new Date(data.serverTime));

    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => (prev ? new Date(prev.getTime() + 1000) : prev));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [data?.serverTime]);

  if (isLoading) return <div className="text-4xl">Loading...</div>;
  if (error) return <div className="text-4xl">Fetching error</div>;

  return (
    <div className="text-4xl" translate="no" suppressHydrationWarning>
      {time
        ? time.toLocaleDateString("tr-TR", {
            // weekday: "long",
            // day: "numeric",
            // year: "numeric",
            // month: "long",
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
