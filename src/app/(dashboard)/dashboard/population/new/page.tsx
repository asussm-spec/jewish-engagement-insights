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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Upload, FileSpreadsheet, Check, Plus, UserPlus, UserCheck, UserMinus, AlertCircle } from "lucide-react";
import type { ValidationResult } from "@/app/api/population/validate-members/route";
import { findMockMember, diffMockMember } from "@/lib/mock-member-database";
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

type Step = "info" | "upload" | "map" | "validate" | "done";

const DEMO_VALIDATION: ValidationResult = {
  totalRows: 847,
  skippedRows: 12,
  newMembers: 43,
  updatedMembers: 186,
  unchangedMembers: 606,
  samples: [
    { status: "new", email: "j***@gmail.com", name: "Jessica Bloom" },
    { status: "new", email: "d***@outlook.com", name: "David Horowitz" },
    { status: "new", email: "r***@gmail.com", name: "Rachel Stern" },
    { status: "updated", email: "s***@gmail.com", name: "Sarah Goldstein", updatedFields: ["Address", "Membership Type"] },
    { status: "updated", email: "m***@yahoo.com", name: "Michael Katz", updatedFields: ["Phone", "Child 2 Name", "Child 2 Dob"] },
    { status: "updated", email: "a***@gmail.com", name: "Abigail Schwartz", updatedFields: ["Denomination"] },
    { status: "updated", email: "n***@gmail.com", name: "Noah Friedman", updatedFields: ["Is Volunteer"] },
    { status: "unchanged", email: "e***@gmail.com", name: "Eli Cohen" },
    { status: "unchanged", email: "h***@comcast.net", name: "Hannah Levy" },
  ],
};

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

  // Validation results
  const [validation, setValidation] = useState<ValidationResult | null>(null);

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

  async function handleValidate() {
    setLoading(true);
    setError(null);

    try {
      // Check if demo mode (cookie-based)
      const isDemo = document.cookie.includes("demo_mode=true");
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 1200));

        // Build column map: field_key → spreadsheet column name
        const columnMap: Record<string, string> = {};
        for (const [col, field] of Object.entries(mappings)) {
          if (field !== "skip" && field !== "__new__") columnMap[field] = col;
        }
        const emailCol = columnMap.email;

        let newCount = 0, updatedCount = 0, unchangedCount = 0, skipped = 0;
        const sampleRows: ValidationResult["samples"] = [];

        for (const row of rows) {
          const email = emailCol ? row[emailCol]?.toString().trim().toLowerCase() : "";
          if (!email || !email.includes("@")) { skipped++; continue; }

          const fn = columnMap.first_name ? row[columnMap.first_name]?.toString().trim() : "";
          const ln = columnMap.last_name ? row[columnMap.last_name]?.toString().trim() : "";
          const name = [fn, ln].filter(Boolean).join(" ") || "Unknown";
          const masked = email[0] + "***@" + email.split("@")[1];

          const existing = findMockMember(email);

          if (!existing) {
            newCount++;
            if (sampleRows.length < 12) sampleRows.push({ status: "new", email: masked, name });
          } else {
            const changedFields = diffMockMember(existing, row, columnMap);
            if (changedFields.length > 0) {
              updatedCount++;
              if (sampleRows.length < 12) sampleRows.push({ status: "updated", email: masked, name, updatedFields: changedFields });
            } else {
              unchangedCount++;
              if (sampleRows.length < 12 && sampleRows.filter((s) => s.status === "unchanged").length < 3) {
                sampleRows.push({ status: "unchanged", email: masked, name });
              }
            }
          }
        }

        setValidation({
          totalRows: rows.length,
          skippedRows: skipped,
          newMembers: newCount,
          updatedMembers: updatedCount,
          unchangedMembers: unchangedCount,
          samples: sampleRows,
        });
        setStep("validate");
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      const response = await fetch("/api/population/validate-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mappings,
          rows,
          organizationId: profile?.organization_id,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Validation failed");

      setValidation(result);
      setStep("validate");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleProcess() {
    setLoading(true);
    setError(null);

    try {
      // Demo mode — just go to done
      const isDemo = document.cookie.includes("demo_mode=true");
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 800));
        setProcessedCount(validation?.newMembers ?? 0 + (validation?.updatedMembers ?? 0));
        setStep("done");
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (!profile?.organization_id) throw new Error("No organization");

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
      if (!response.ok) throw new Error(result.error || "Failed to process members");

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
        {["Describe", "Upload", "Map columns", "Review"].map((label, i) => {
          const stepOrder: Step[] = ["info", "upload", "map", "validate", "done"];
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
                onClick={handleValidate}
              >
                {loading
                  ? "Validating..."
                  : `Review ${rows.length} members`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Validate / Review */}
      {step === "validate" && validation && (
        <div className="max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Review changes</CardTitle>
              <CardDescription>
                Here&apos;s what will happen when you import this data.
                {validation.skippedRows > 0 && (
                  <span className="text-amber-600"> {validation.skippedRows} rows will be skipped (no valid email).</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="rounded-lg border p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <UserPlus className="h-4 w-4 text-emerald-600" />
                    <span className="text-2xl font-bold text-emerald-600">{validation.newMembers}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">New members</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Not in system yet</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">{validation.updatedMembers}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Updated members</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Existing, new data</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <UserMinus className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{validation.unchangedMembers}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Unchanged</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Already up to date</p>
                </div>
              </div>

              {/* Sample table */}
              {validation.samples.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Sample of changes</p>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-24">Status</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Fields changing</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validation.samples.map((sample, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              {sample.status === "new" && (
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">New</Badge>
                              )}
                              {sample.status === "updated" && (
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Updated</Badge>
                              )}
                              {sample.status === "unchanged" && (
                                <Badge variant="secondary">No change</Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{sample.name}</TableCell>
                            <TableCell className="text-muted-foreground text-xs font-mono">{sample.email}</TableCell>
                            <TableCell>
                              {sample.updatedFields ? (
                                <span className="text-xs text-muted-foreground">
                                  {sample.updatedFields.join(", ")}
                                </span>
                              ) : sample.status === "new" ? (
                                <span className="text-xs text-muted-foreground">All fields (new record)</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

              <div className="flex justify-between gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep("map")}>
                  Back to mapping
                </Button>
                <Button onClick={handleProcess} disabled={loading}>
                  {loading
                    ? "Processing..."
                    : `Confirm & import ${validation.newMembers + validation.updatedMembers} members`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 5: Done */}
      {step === "done" && (
        <Card className="max-w-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <Check className="h-7 w-7 text-green-600" />
            </div>
            <CardTitle className="text-xl">
              Import complete
            </CardTitle>
            <CardDescription className="max-w-md mx-auto">
              {validation ? (
                <>
                  <span className="font-medium text-emerald-600">{validation.newMembers} new</span>
                  {" and "}
                  <span className="font-medium text-blue-600">{validation.updatedMembers} updated</span>
                  {" members have been merged into your population data."}
                </>
              ) : (
                `${processedCount} members have been processed and merged.`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-3 pb-8">
            <Button
              variant="outline"
              onClick={() => {
                setStep("info");
                setUploadName("");
                setUploadDescription("");
                setFileName("");
                setHeaders([]);
                setRows([]);
                setMappings({});
                setProcessedCount(0);
                setPopulationId(null);
                setValidation(null);
              }}
            >
              Upload another list
            </Button>
            <Button
              onClick={() => router.push("/dashboard/population")}
            >
              Review updated population
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
