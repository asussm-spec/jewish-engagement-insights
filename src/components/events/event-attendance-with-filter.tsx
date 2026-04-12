"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventAttendanceSection } from "./event-attendance-section";
import type { AttendanceComparison } from "@/lib/event-analytics";

interface Props {
  initialAttendance: AttendanceComparison;
  eventId: string;
  organizationId: string;
  eventType: string;
  orgName: string;
  eventTypeLabel: string;
  availableYears: number[];
}

interface TimeframeOption {
  label: string;
  value: string;
  startDate?: string;
  endDate?: string;
}

function buildTimeframeOptions(years: number[]): TimeframeOption[] {
  const currentYear = new Date().getFullYear();
  const options: TimeframeOption[] = [
    { label: "All time", value: "all" },
    {
      label: "This year",
      value: "this_year",
      startDate: `${currentYear}-01-01`,
      endDate: `${currentYear}-12-31`,
    },
  ];

  // Add past years (skip current year since "This year" covers it)
  for (const year of years) {
    if (year === currentYear) continue;
    options.push({
      label: String(year),
      value: String(year),
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
    });
  }

  return options;
}

export function EventAttendanceWithFilter({
  initialAttendance,
  eventId,
  organizationId,
  eventType,
  orgName,
  eventTypeLabel,
  availableYears,
}: Props) {
  const [timeframe, setTimeframe] = useState("all");
  const [attendance, setAttendance] = useState(initialAttendance);
  const [loading, setLoading] = useState(false);

  const options = buildTimeframeOptions(availableYears);

  useEffect(() => {
    if (timeframe === "all") {
      setAttendance(initialAttendance);
      return;
    }

    const selected = options.find((o) => o.value === timeframe);
    if (!selected) return;

    async function fetchFiltered() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          eventId,
          organizationId,
          eventType,
        });
        if (selected!.startDate) params.set("startDate", selected!.startDate);
        if (selected!.endDate) params.set("endDate", selected!.endDate);

        const res = await fetch(`/api/events/attendance?${params}`);
        if (res.ok) {
          const data = await res.json();
          setAttendance(data);
        }
      } catch (err) {
        console.error("Failed to fetch filtered attendance:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFiltered();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Event Attendance</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Timeframe:</span>
          <Select value={timeframe} onValueChange={(v) => setTimeframe(v ?? "all")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className={loading ? "opacity-50 transition-opacity" : ""}>
        <EventAttendanceSection
          attendance={attendance}
          orgName={orgName}
          eventTypeLabel={eventTypeLabel}
          organizationId={organizationId}
          eventType={eventType}
        />
      </div>
    </div>
  );
}
