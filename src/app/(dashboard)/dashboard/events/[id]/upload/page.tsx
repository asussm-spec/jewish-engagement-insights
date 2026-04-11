"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, FileSpreadsheet, Check } from "lucide-react";
import Link from "next/link";

// Known field types the system can map to
const fieldMappings = [
  { value: "email", label: "Email address" },
  { value: "first_name", label: "First name" },
  { value: "last_name", label: "Last name" },
  { value: "full_name", label: "Full name" },
  { value: "age", label: "Age" },
  { value: "date_of_birth", label: "Date of birth" },
  { value: "denomination", label: "Denomination" },
  { value: "num_children", label: "Number of children" },
  { value: "spouse", label: "Spouse / Partner" },
  { value: "membership_type", label: "Membership type" },
  { value: "skip", label: "— Skip this column —" },
];

// Try to auto-detect what a column contains based on its header
function guessMapping(header: string): string {
  const h = header.toLowerCase().trim();
  if (h.includes("email") || h.includes("e-mail")) return "email";
  if (h === "first" || h === "first name" || h === "firstname") return "first_name";
  if (h === "last" || h === "last name" || h === "lastname") return "last_name";
  if (h === "name" || h === "full name" || h === "fullname") return "full_name";
  if (h === "age") return "age";
  if (h.includes("birth") || h === "dob") return "date_of_birth";
  if (h.includes("denom")) return "denomination";
  if (h.includes("child") || h.includes("kids")) return "num_children";
  if (h.includes("spouse") || h.includes("partner")) return "spouse";
  if (h.includes("member")) return "membership_type";
  return "skip";
}

type Step = "upload" | "map" | "confirm" | "done";

export default function UploadPage() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedCount, setProcessedCount] = useState(0);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name);
      setError(null);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete(results) {
          const data = results.data as Record<string, string>[];
          if (data.length === 0) {
            setError("The file appears to be empty.");
            return;
          }
          const cols = Object.keys(data[0]);
          setHeaders(cols);
          setRows(data);

          // Auto-map columns
          const autoMappings: Record<string, string> = {};
          cols.forEach((col) => {
            autoMappings[col] = guessMapping(col);
          });
          setMappings(autoMappings);
          setStep("map");
        },
        error(err) {
          setError(`Failed to parse file: ${err.message}`);
        },
      });
    },
    []
  );

  function updateMapping(column: string, value: string) {
    setMappings((prev) => ({ ...prev, [column]: value }));
  }

  const hasEmail = Object.values(mappings).includes("email");

  async function handleProcess() {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Process each row via an API route (server-side to access people_identities)
      const response = await fetch("/api/events/process-attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          mappings,
          rows,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process attendees");
      }

      setProcessedCount(result.processedCount);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link
        href={`/dashboard/events`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </Link>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {["Upload", "Map columns", "Process"].map((label, i) => {
          const stepOrder: Step[] = ["upload", "map", "confirm", "done"];
          const currentIndex = stepOrder.indexOf(step);
          const isActive = i <= currentIndex;
          return (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && (
                <div
                  className={`h-px w-8 ${isActive ? "bg-navy" : "bg-border"}`}
                />
              )}
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  isActive
                    ? "bg-navy text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-sm ${
                  isActive ? "font-medium" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Upload attendee data</CardTitle>
            <CardDescription>
              Upload a CSV or Excel file with your event attendees. The file
              should have at least an email column.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label
              htmlFor="file-upload"
              className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-12 transition-colors hover:border-gold/50 hover:bg-cream/50"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-navy/5">
                <Upload className="h-7 w-7 text-navy" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  CSV, TSV, or Excel files
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".csv,.tsv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {error && (
              <p className="mt-4 text-sm text-destructive">{error}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Map columns */}
      {step === "map" && (
        <Card className="max-w-3xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{fileName}</span>
              <Badge variant="secondary">{rows.length} rows</Badge>
            </div>
            <CardTitle className="text-xl">Map your columns</CardTitle>
            <CardDescription>
              We&apos;ve auto-detected some column types. Review and adjust the
              mappings below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {headers.map((header) => (
                <div
                  key={header}
                  className="flex items-center gap-4 rounded-lg border bg-white p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{header}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      e.g. {rows[0]?.[header] || "—"}
                    </p>
                  </div>
                  <div className="w-48">
                    <Select
                      value={mappings[header] || "skip"}
                      onValueChange={(v) => updateMapping(header, v ?? "skip")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldMappings.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            {!hasEmail && (
              <p className="mt-4 text-sm text-destructive">
                You must map at least one column to &quot;Email address&quot; to
                continue.
              </p>
            )}

            {error && (
              <p className="mt-4 text-sm text-destructive">{error}</p>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Upload different file
              </Button>
              <Button
                disabled={!hasEmail || loading}
                onClick={handleProcess}
              >
                {loading ? "Processing..." : `Process ${rows.length} attendees`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Done */}
      {step === "done" && (
        <Card className="max-w-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <Check className="h-7 w-7 text-green-600" />
            </div>
            <CardTitle className="text-xl">
              {processedCount} attendees processed
            </CardTitle>
            <CardDescription>
              Attendee data has been anonymized and added to the community
              dataset. View the insights for this event.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-3 pb-8">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/events")}
            >
              Back to events
            </Button>
            <Button
              onClick={() =>
                router.push(`/dashboard/events/${eventId}`)
              }
            >
              View event insights
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
