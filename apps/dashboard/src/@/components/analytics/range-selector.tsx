"use client";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import type {
  DurationId,
  Range,
} from "@/components/analytics/date-range-selector";
import {
  DateRangeSelector,
  getLastNDaysRange,
} from "@/components/analytics/date-range-selector";
import { IntervalSelector } from "@/components/analytics/interval-selector";
import { useDashboardRouter } from "@/lib/DashboardRouter";

export function RangeSelector({
  range,
  interval,
}: {
  range?: Range;
  interval: "day" | "week";
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useDashboardRouter();
  const [localRange, setRange] = useState<Range>(
    range || getLastNDaysRange("last-120"),
  );
  const [localInterval, setInterval] = useState<"day" | "week">(interval);

  useQuery({
    queryFn: async () => {
      if (range) {
        setRange(range);
        return range;
      }
      if (searchParams) {
        const fromStringified = searchParams.get("from");
        const from = fromStringified
          ? new Date(fromStringified)
          : getLastNDaysRange("last-120").from;
        const toStringified = searchParams.get("to");
        const to = toStringified ? new Date(toStringified) : new Date();
        const type = (searchParams.get("type") as DurationId) || "last-120";
        setRange({ from, to, type });
        setInterval(interval);
        return { from, to, type } satisfies Range;
      }
      return getLastNDaysRange("last-120");
    },
    queryKey: ["analytics-range", searchParams?.toString(), range],
  });

  // prefetch for each interval and default range
  useQuery({
    queryFn: async () => {
      const newSearchParams = new URLSearchParams(searchParams || {});
      for (const interval of ["day", "week"] as const) {
        newSearchParams.set("interval", interval);
        for (const type of [
          "last-120",
          "last-60",
          "last-30",
          "last-7",
        ] as const) {
          const newRange = getLastNDaysRange(type);
          newSearchParams.set("from", newRange.from.toISOString());
          newSearchParams.set("to", newRange.to.toISOString());
          newSearchParams.set("type", newRange.type);
          router.prefetch(`${pathname}?${newSearchParams.toString()}`);
        }
      }
      return true;
    },
    queryKey: ["analytics-range", searchParams?.toString()],
  });

  return (
    <div className="flex justify-end gap-3 flex-col lg:flex-row">
      <DateRangeSelector
        className="rounded-full"
        range={localRange}
        setRange={(newRange) => {
          setRange(newRange);
          const newSearchParams = new URLSearchParams(searchParams || {});
          newSearchParams.set("from", newRange.from.toISOString());
          newSearchParams.set("to", newRange.to.toISOString());
          newSearchParams.set("type", newRange.type);
          router.push(`${pathname}?${newSearchParams.toString()}`);
        }}
      />
      <IntervalSelector
        className="bg-card rounded-full"
        intervalType={localInterval}
        setIntervalType={(newInterval) => {
          setInterval(newInterval);
          const newSearchParams = new URLSearchParams(searchParams || {});
          newSearchParams.set("interval", newInterval);
          router.push(`${pathname}?${newSearchParams.toString()}`);
        }}
      />
    </div>
  );
}
