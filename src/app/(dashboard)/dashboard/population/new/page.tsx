"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ArrowLeft, Upload, FileSpreadsheet, Check, Plus } from "lucide-react";
import Link from "next/link";

interface FieldDef {
  id: string;
  key: string;
  label: string;
  category: string;
  data_type: string;
  match_patterns: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  identity: "Identity",
  demographics: "Demographics",
  family: "Family",
  jewish_identity: "Jewish Identity",
  engagement: "Engagement",
  geographic: "Geographic",
};

const CATEGORY_ORDER = [
  "identity",
  "demographics",
  "family",
  "jewish_identity",
  "engagement",
  "geographic",
];

type Step = "info" | "upload" | "map" | "done";

export default function NewPopulationUploadPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("info");

  // Step 1: Upload info
  const [uploadName, setUploadName] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");

  // Step 2-3: File & mapping
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [populationId, setPopulationId] = useState<string | null>(null);

  // Field registry from Supabase
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [fieldsLoaded, setFieldsLoaded] = useState(false);

  // New field dialog
  const [showNewField, setShowNewField] = useState(false);
  const [newFieldColumn, setNewFieldColumn] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldCategory, setNewFieldCategory] = useState("demographics");
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

  function guessMapping(header: string): string {
    const h = header.toLowerCase().trim();
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

    // Second pass: value-based detection for unmapped columns
    const updatedMappings = { ...autoMappings };
    for (const col of cols) {
      if (updatedMappings[col] !== "skip") continue;
      const samples = data.slice(0, 8).map((row) => row[col]?.toString() || "").filter(Boolean);
      if (samples.length === 0) continue;

      const emailCount = samples.filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)).length;
      if (emailCount >= samples.length * 0.5) {
        updatedMappings[col] = "email";
        continue;
      }

      const dateCount = samples.filter((s) => /^\d{4}-\d{2}-\d{2}/.test(s) || /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(s)).length;
      if (dateCount >= samples.length * 0.5) {
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

      const denomWords = ["reform", "conservative", "orthodox", "reconstructionist", "just jewish", "secular", "traditional"];
      const denomCount = samples.filter((s) => denomWords.some((d) => s.toLowerCase().includes(d))).length;
      if (denomCount >= samples.length * 0.3) {
        updatedMappings[col] = "denomination";
        continue;
      }

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
    setStep("map");
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
      setNewFieldLabel(column);
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

    const { data, error: insertError } = await supabase
      .from("field_registry")
      .insert({
        key,
        label: newFieldLabel,
        category: newFieldCategory,
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

  const fieldsByCategory = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat] || cat,
    fields: fields.filter((f) => f.category === cat),
  })).filter((g) => g.fields.length > 0);

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

      // Get user's org
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (!profile?.organization_id) throw new Error("No organization");

      // Create the population upload record
      const { data: popUpload, error: popError } = await supabase
        .from("population_uploads")
        .insert({
          organization_id: profile.organization_id,
          created_by: user.id,
          name: uploadName || fileName,
          description: uploadDescription || null,
        })
        .select("id")
        .single();

      if (popError) throw popError;
      setPopulationId(popUpload.id);

      // Process members
      const response = await fetch("/api/population/process-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          populationId: popUpload.id,
          mappings,
          rows,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process members");
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
        href="/dashboard/population"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to population
      </Link>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {["Describe", "Upload", "Map columns"].map((label, i) => {
          const stepOrder: Step[] = ["info", "upload", "map", "done"];
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

      {/* Step 1: Name & describe */}
      {step === "info" && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Upload population data</CardTitle>
            <CardDescription>
              Upload a membership list, contact list, or any dataset of people
              associated with your organization. This data will be anonymized and
              merged with existing profiles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Upload name</Label>
              <Input
                id="name"
                placeholder="e.g. 2025 Membership List, Preschool Families, High Holiday Attendees"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Any notes about this data set..."
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                rows={2}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex justify-end">
              <Button
                disabled={!uploadName.trim()}
                onClick={() => setStep("upload")}
              >
                Next: Upload file
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Upload file */}
      {step === "upload" && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl">{uploadName}</CardTitle>
            <CardDescription>
              Upload a CSV or Excel file. The file should have at least an email
              column so we can match people across organizations.
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
            <div className="flex justify-start mt-4">
              <Button variant="outline" onClick={() => setStep("info")}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Map columns */}
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
              We&apos;ve auto-detected column types. Review and adjust the
              mappings below. People who already exist in the system (by email)
              will have their profiles enriched with the new data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {headers.map((header) => {
                const currentMapping = mappings[header] || "skip";
                const matchedField = fields.find(
                  (f) => f.key === currentMapping
                );
                const isAutoMapped =
                  currentMapping !== "skip" && matchedField;
                return (
                  <div
                    key={header}
                    className={`flex items-center gap-4 rounded-lg border p-3 ${
                      isAutoMapped
                        ? "bg-green-50/50 border-green-200"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{header}</p>
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
                          {fieldsByCategory.map((group) => (
                            <SelectGroup key={group.category}>
                              <SelectLabel>{group.label}</SelectLabel>
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

            <div className="flex justify-between gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Upload different file
              </Button>
              <Button
                disabled={!hasEmail || loading}
                onClick={handleProcess}
              >
                {loading
                  ? "Processing..."
                  : `Process ${rows.length} members`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Done */}
      {step === "done" && (
        <Card className="max-w-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <Check className="h-7 w-7 text-green-600" />
            </div>
            <CardTitle className="text-xl">
              {processedCount} members processed
            </CardTitle>
            <CardDescription>
              Member data has been anonymized and merged into the community
              dataset. People who already existed have been enriched with the new data.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-3 pb-8">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/population")}
            >
              Back to population
            </Button>
            <Button
              onClick={() => {
                // Reset for another upload
                setStep("info");
                setUploadName("");
                setUploadDescription("");
                setFileName("");
                setHeaders([]);
                setRows([]);
                setMappings({});
                setProcessedCount(0);
                setPopulationId(null);
              }}
            >
              Upload another list
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
                placeholder="e.g. Membership tier"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newFieldCategory}
                  onValueChange={(v) => setNewFieldCategory(v ?? "demographics")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_ORDER.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
