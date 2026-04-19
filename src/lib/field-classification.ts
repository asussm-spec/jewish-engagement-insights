import { Lock, BarChart3, ClipboardList, type LucideIcon } from "lucide-react";

export interface FieldDef {
  id: string;
  key: string;
  label: string;
  category: string;
  data_type: string;
  match_patterns: string[];
}

export type DataClass = "pii" | "demographic" | "event_specific";

// Classify a registry field into one of three UX-visible data classes.
export function dataClassFor(field: FieldDef): DataClass {
  if (field.category === "identity") return "pii";
  if (field.category === "family" && /_name$/.test(field.key)) return "pii";
  if (field.category === "event_specific") return "event_specific";
  return "demographic";
}

export const DATA_CLASS_META: Record<
  DataClass,
  { label: string; icon: LucideIcon; dotClass: string; badgeClass: string }
> = {
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
    label: "Specific to this upload (not compared)",
    icon: ClipboardList,
    dotClass: "bg-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
};

export const DATA_CLASS_ORDER: DataClass[] = ["pii", "demographic", "event_specific"];

export const DATA_CLASS_GROUP_LABELS: Record<DataClass, string> = {
  pii: "Personal identifiers (anonymized)",
  demographic: "Comparable demographics",
  event_specific: "Specific to this upload",
};

export const DATA_CLASS_DESCRIPTIONS: Record<DataClass, string> = {
  pii: "Anonymized, never charted or shared.",
  demographic: "Aggregated into insights comparable across events and organizations.",
  event_specific: "Stored with this upload but not charted or compared.",
};

export const DATA_CLASS_NEW_FIELD_DESCRIPTIONS: Record<DataClass, string> = {
  pii: "Identifies a specific person. Will be anonymized and never charted or shared.",
  demographic: "A comparable population attribute (age, denomination, membership tier, etc.). Will appear in charts.",
  event_specific: "Relevant to this upload only (logistics, preferences). Stored but not compared.",
};

// Map a UX data class choice back to a field_registry category.
export function categoryForDataClass(cls: DataClass): string {
  if (cls === "pii") return "identity";
  if (cls === "event_specific") return "event_specific";
  return "demographics";
}

// Tailwind class for the whole row background tint, by class.
export function rowTintForClass(cls: DataClass | undefined): string {
  if (cls === "pii") return "bg-navy/[0.03] border-navy/20";
  if (cls === "demographic") return "bg-emerald-50/50 border-emerald-200";
  if (cls === "event_specific") return "bg-muted/40 border-border";
  return "bg-white";
}
