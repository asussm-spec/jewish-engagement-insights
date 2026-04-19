"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, FileSpreadsheet, Check, Plus, Lock, BarChart3, ClipboardList, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface FieldDef {
  id: string;
  key: string;
  label: string;
  category: string;
  data_type: string;
  match_patterns: string[];
}

type DataClass = "pii" | "demographic" | "event_specific";

// Classify a registry field into one of three UX-visible data classes.
function dataClassFor(field: FieldDef): DataClass {
  if (field.category === "identity") return "pii";
  if (field.category === "family" && /_name$/.test(field.key)) return "pii";
  if (field.category === "event_specific") return "event_specific";
  return "demographic";
}

const DATA_CLASS_META: Record<DataClass, { label: string; icon: typeof Lock; dotClass: string; badgeClass: string }> = {
  pii: {
    label: "PII — will be anonymized",
    icon: Lock,
    dotClass: "bg-navy",
    badgeClass: "bg-navy/10 text-navy border-navy/20",
  },
  demographic: {
    label: "Comparable demographic",
    icon: BarChart3,
    dotClass: "bg-emerald-600",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  event_specific: {
    label: "Event-specific (not compared)",
    icon: ClipboardList,
    dotClass: "bg-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
};

const DATA_CLASS_ORDER: DataClass[] = ["pii", "demographic", "event_specific"];

const DATA_CLASS_GROUP_LABELS: Record<DataClass, string> = {
  pii: "Personal identifiers (anonymized)",
  demographic: "Comparable demographics",
  event_specific: "Event-specific",
};

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

  // Field registry from Supabase
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [fieldsLoaded, setFieldsLoaded] = useState(false);

  // New field dialog
  const [showNewField, setShowNewField] = useState(false);
  const [newFieldColumn, setNewFieldColumn] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldDataClass, setNewFieldDataClass] = useState<DataClass>("demographic");
  const [newFieldType, setNewFieldType] = useState("text");

  // Load field registry on mount
  useEffect(() => {
    async function loadFields() {
      const { data } = await supabase
        .from("field_registry")
        .select("id, key, label, category, data_type, match_patterns")
        .order("category")
        .order("label");
      if (data) setFields(data);
      setFieldsLoaded(true);
    }
    loadFields();
  }, [supabase]);

  // Auto-detect column mapping using regex patterns from field registry.
  // Sort fields so more specific patterns (longer keys with numbers) are checked
  // before generic ones — e.g. child_1_dob before date_of_birth.
  function guessMapping(header: string): string {
    const h = header.toLowerCase().trim();

    // Sort: fields with numbers in the key first (more specific), then by key length descending
    const sorted = [...fields].sort((a, b) => {
      const aHasNum = /\d/.test(a.key) ? 0 : 1;
      const bHasNum = /\d/.test(b.key) ? 0 : 1;
      if (aHasNum !== bHasNum) return aHasNum - bHasNum;
      return b.key.length - a.key.length;
    });

    for (const field of sorted) {
      if (!field.match_patterns) continue;
      for (const pattern of field.match_patterns) {
        try {
          const regex = new RegExp(pattern, "i");
          if (regex.test(h)) return field.key;
        } catch {
          if (h.includes(pattern)) return field.key;
        }
      }
    }
    return "skip";
  }

  function processRows(data: Record<string, string>[], name: string) {
    if (data.length === 0) {
      setError("The file appears to be empty.");
      return;
    }
    const cols = Object.keys(data[0]);
    setHeaders(cols);
    setRows(data);
    setFileName(name);

    // First pass: regex-based auto-mapping
    const autoMappings: Record<string, string> = {};
    cols.forEach((col) => {
      autoMappings[col] = guessMapping(col);
    });
    setMappings(autoMappings);
    setStep("map");

    // Second pass: value-based detection for columns still mapped to "skip"
    // Look at sample values to infer the type
    const updatedMappings = { ...autoMappings };
    for (const col of cols) {
      if (updatedMappings[col] !== "skip") continue;
      const samples = data.slice(0, 8).map((row) => row[col]?.toString() || "").filter(Boolean);
      if (samples.length === 0) continue;

      // Check if values look like emails
      const emailCount = samples.filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)).length;
      if (emailCount >= samples.length * 0.5) {
        updatedMappings[col] = "email";
        continue;
      }

      // Check if values look like dates
      const dateCount = samples.filter((s) => /^\d{4}-\d{2}-\d{2}/.test(s) || /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(s)).length;
      if (dateCount >= samples.length * 0.5) {
        // It's a date — but which date field? Check the header for clues
        const h = col.toLowerCase();
        if (/kid|child|son|daughter/.test(h) && /2|two|second/.test(h)) {
          updatedMappings[col] = "child_2_dob";
        } else if (/kid|child|son|daughter/.test(h) && /3|three|third/.test(h)) {
          updatedMappings[col] = "child_3_dob";
        } else if (/kid|child|son|daughter/.test(h)) {
          updatedMappings[col] = "child_1_dob";
        } else {
          updatedMappings[col] = "date_of_birth";
        }
        continue;
      }

      // Check if values look like denominations
      const denomWords = ["reform", "conservative", "orthodox", "reconstructionist", "just jewish", "secular", "traditional"];
      const denomCount = samples.filter((s) => denomWords.some((d) => s.toLowerCase().includes(d))).length;
      if (denomCount >= samples.length * 0.3) {
        updatedMappings[col] = "denomination";
        continue;
      }

      // Check header for child name patterns (Kid 1, Second Kid, Child 2, etc.)
      const h = col.toLowerCase();
      if (/^(kid|child)\s*(1|one|#1)$/i.test(h) || /^first\s*(kid|child)$/i.test(h)) {
        updatedMappings[col] = "child_1_name";
      } else if (/^(kid|child)\s*(2|two|#2)$/i.test(h) || /^second\s*(kid|child)$/i.test(h)) {
        updatedMappings[col] = "child_2_name";
      } else if (/^(kid|child)\s*(3|three|#3)$/i.test(h) || /^third\s*(kid|child)$/i.test(h)) {
        updatedMappings[col] = "child_3_name";
      } else if (/^(kid|child)\s*(4|four|#4)$/i.test(h) || /^fourth\s*(kid|child)$/i.test(h)) {
        updatedMappings[col] = "child_4_name";
      }
    }
    setMappings(updatedMappings);
  }

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setError(null);

      const isExcel = /\.(xlsx|xls)$/i.test(file.name);

      if (isExcel) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const workbook = XLSX.read(evt.target?.result, { type: "array" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json<Record<string, string>>(
              firstSheet,
              { defval: "", raw: false }
            );
            processRows(data, file.name);
          } catch (err) {
            setError(
              `Failed to parse Excel file: ${err instanceof Error ? err.message : "Unknown error"}`
            );
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete(results) {
            processRows(results.data as Record<string, string>[], file.name);
          },
          error(err) {
            setError(`Failed to parse file: ${err.message}`);
          },
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fields]
  );

  function updateMapping(column: string, value: string) {
    if (value === "__new__") {
      setNewFieldColumn(column);
      setNewFieldLabel(column); // Pre-fill with the column header
      setShowNewField(true);
      return;
    }
    setMappings((prev) => ({ ...prev, [column]: value }));
  }

  async function handleCreateField() {
    const key = newFieldLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

    // Map the UX data class to a registry category value.
    const category =
      newFieldDataClass === "pii"
        ? "identity"
        : newFieldDataClass === "event_specific"
        ? "event_specific"
        : "demographics";

    const { data, error: insertError } = await supabase
      .from("field_registry")
      .insert({
        key,
        label: newFieldLabel,
        category,
        data_type: newFieldType,
        match_patterns: [key.replace(/_/g, ".?")],
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (data) {
      setFields((prev) => [...prev, data as FieldDef]);
      setMappings((prev) => ({ ...prev, [newFieldColumn]: key }));
    }
    setShowNewField(false);
  }

  const hasEmail = Object.values(mappings).includes("email");

  // Group fields by data class (3-tier UX grouping) for the select dropdown.
  const fieldsByDataClass = DATA_CLASS_ORDER.map((cls) => ({
    dataClass: cls,
    label: DATA_CLASS_GROUP_LABELS[cls],
    fields: fields
      .filter((f) => dataClassFor(f) === cls)
      .sort((a, b) => a.label.localeCompare(b.label)),
  })).filter((g) => g.fields.length > 0);

  // Lookup: field key → data class (for rendering the per-row badge).
  const dataClassByKey = new Map<string, DataClass>(
    fields.map((f) => [f.key, dataClassFor(f)])
  );

  // Count how many columns are mapped (not skipped)
  const mappedCount = Object.values(mappings).filter(
    (v) => v !== "skip"
  ).length;

  async function handleProcess() {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

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

  if (!fieldsLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
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
              <Badge variant="secondary">
                {mappedCount}/{headers.length} mapped
              </Badge>
            </div>
            <CardTitle className="text-xl">Map your columns</CardTitle>
            <CardDescription>
              We&apos;ve auto-detected column types using pattern matching and value analysis.
              Review and adjust the mappings below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Data class legend + privacy commitment */}
            <div className="mb-5 rounded-lg border bg-cream/40 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-navy mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-navy">
                    Personal identifiers are anonymized before they&apos;re shared.
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    Names, emails, phone numbers, and addresses are used only to
                    match the same person across your uploads. They are never
                    shown in community insights, shared with other organizations,
                    or displayed in charts.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-1 text-xs">
                {DATA_CLASS_ORDER.map((cls) => {
                  const meta = DATA_CLASS_META[cls];
                  const Icon = meta.icon;
                  const copy: Record<DataClass, string> = {
                    pii: "Anonymized, never charted or shared.",
                    demographic: "Aggregated into insights comparable across events.",
                    event_specific: "Stored with the event but not charted or compared.",
                  };
                  return (
                    <div key={cls} className="flex items-start gap-1.5 flex-1 min-w-[180px]">
                      <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">{DATA_CLASS_GROUP_LABELS[cls]}</p>
                        <p className="text-muted-foreground">{copy[cls]}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              {headers.map((header) => {
                const currentMapping = mappings[header] || "skip";
                const matchedField = fields.find(
                  (f) => f.key === currentMapping
                );
                const isAutoMapped =
                  currentMapping !== "skip" && matchedField;
                const cls = matchedField ? dataClassByKey.get(matchedField.key) : undefined;
                const classMeta = cls ? DATA_CLASS_META[cls] : null;
                const rowTint =
                  cls === "pii"
                    ? "bg-navy/[0.03] border-navy/20"
                    : cls === "demographic"
                    ? "bg-emerald-50/50 border-emerald-200"
                    : cls === "event_specific"
                    ? "bg-muted/40 border-border"
                    : "bg-white";
                return (
                  <div
                    key={header}
                    className={`flex items-center gap-4 rounded-lg border p-3 ${rowTint}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{header}</p>
                        {classMeta && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] gap-1 ${classMeta.badgeClass}`}
                          >
                            <classMeta.icon className="h-3 w-3" />
                            {classMeta.label}
                          </Badge>
                        )}
                        {isAutoMapped && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-green-100 text-green-700"
                          >
                            Auto
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        e.g. {rows[0]?.[header] || "—"}
                      </p>
                    </div>
                    <div className="w-56">
                      <Select
                        value={currentMapping}
                        onValueChange={(v) =>
                          updateMapping(header, v ?? "skip")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="skip">
                            — Skip this column —
                          </SelectItem>
                          {fieldsByDataClass.map((group) => (
                            <SelectGroup key={group.dataClass}>
                              <SelectLabel className="flex items-center gap-1.5">
                                <span
                                  className={`inline-block h-2 w-2 rounded-full ${DATA_CLASS_META[group.dataClass].dotClass}`}
                                />
                                {group.label}
                              </SelectLabel>
                              {group.fields.map((f) => (
                                <SelectItem key={f.key} value={f.key}>
                                  {f.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                          <SelectGroup>
                            <SelectLabel>Other</SelectLabel>
                            <SelectItem value="__new__">
                              <span className="flex items-center gap-1">
                                <Plus className="h-3 w-3" />
                                Create new field...
                              </span>
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
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
                {loading
                  ? "Processing..."
                  : `Process ${rows.length} attendees`}
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
              onClick={() => router.push(`/dashboard/events/${eventId}`)}
            >
              View event insights
            </Button>
          </CardContent>
        </Card>
      )}

      {/* New field dialog */}
      <Dialog open={showNewField} onOpenChange={setShowNewField}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new field type</DialogTitle>
            <DialogDescription>
              This column doesn&apos;t match any known field. Create a new one
              and it will be available for all future uploads.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Column from your file</Label>
              <Input value={newFieldColumn} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fieldLabel">Field name</Label>
              <Input
                id="fieldLabel"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                placeholder="e.g. Preschool enrollment"
              />
            </div>
            <div className="space-y-2">
              <Label>What kind of data is this?</Label>
              <div className="grid gap-2">
                {DATA_CLASS_ORDER.map((cls) => {
                  const meta = DATA_CLASS_META[cls];
                  const Icon = meta.icon;
                  const desc: Record<DataClass, string> = {
                    pii: "Identifies a specific person. Will be anonymized and never charted or shared.",
                    demographic: "A comparable population attribute (age, denomination, membership tier, etc.). Will appear in charts.",
                    event_specific: "Relevant to this event only (logistics, preferences). Stored but not compared across events.",
                  };
                  const selected = newFieldDataClass === cls;
                  return (
                    <button
                      type="button"
                      key={cls}
                      onClick={() => setNewFieldDataClass(cls)}
                      className={`text-left rounded-lg border p-3 transition-colors ${
                        selected
                          ? "border-navy bg-navy/5"
                          : "border-border hover:border-muted-foreground/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Icon className="h-4 w-4" />
                        {DATA_CLASS_GROUP_LABELS[cls]}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{desc[cls]}</p>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Data type</Label>
              <Select
                value={newFieldType}
                onValueChange={(v) => setNewFieldType(v ?? "text")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="boolean">Yes / No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowNewField(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={!newFieldLabel.trim()}
                onClick={handleCreateField}
              >
                Create field
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
