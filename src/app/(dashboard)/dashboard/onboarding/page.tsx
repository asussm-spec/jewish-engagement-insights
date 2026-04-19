"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Building2, CheckCircle2 } from "lucide-react";

const orgTypes = [
  { value: "synagogue", label: "Synagogue" },
  { value: "jcc", label: "JCC" },
  { value: "day_school", label: "Day School" },
  { value: "federation", label: "Federation" },
  { value: "camp", label: "Camp" },
  { value: "youth_org", label: "Youth Organization" },
  { value: "social_service", label: "Social Service" },
  { value: "other", label: "Other" },
];

// Subtype options by org type. Org types not listed here have no subtypes.
const subtypesByOrgType: Record<string, { value: string; label: string }[]> = {
  synagogue: [
    { value: "reform", label: "Reform" },
    { value: "conservative", label: "Conservative" },
    { value: "orthodox", label: "Orthodox" },
    { value: "reconstructionist", label: "Reconstructionist" },
    { value: "other", label: "Other" },
  ],
  day_school: [
    { value: "orthodox", label: "Orthodox" },
    { value: "non_orthodox", label: "Non-Orthodox" },
  ],
  camp: [
    { value: "day_camp", label: "Day Camp" },
    { value: "overnight", label: "Overnight" },
  ],
  social_service: [
    { value: "housing", label: "Housing" },
    { value: "food_bank", label: "Food Bank" },
    { value: "other", label: "Other" },
  ],
};

const roles = [
  { value: "program_manager", label: "Program Manager" },
  { value: "org_leader", label: "Organizational Leader" },
  { value: "communal_leader", label: "Communal Leader" },
];

interface MatchedOrg {
  id: string;
  name: string;
  org_type: string;
  subtype: string | null;
}

export default function OnboardingPage() {
  const [step, setStep] = useState<"loading" | "role" | "org">("loading");
  const [matchedOrg, setMatchedOrg] = useState<MatchedOrg | null>(null);
  const [role, setRole] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("");
  const [subtype, setSubtype] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // On mount, check if user's email domain matches a known org
  useEffect(() => {
    async function checkDomain() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) {
        setStep("role");
        return;
      }

      const domain = user.email.split("@")[1]?.toLowerCase();
      if (!domain) {
        setStep("role");
        return;
      }

      // Look for an org whose email_domains array contains this domain
      const { data: orgs } = await supabase
        .from("organizations")
        .select("id, name, org_type, subtype")
        .contains("email_domains", [domain]);

      if (orgs && orgs.length > 0) {
        setMatchedOrg(orgs[0]);
      }
      setStep("role");
    }
    checkDomain();
  }, [supabase]);

  async function handleRoleContinue() {
    if (matchedOrg) {
      // Auto-assign to matched org — skip org creation
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          role,
          organization_id: matchedOrg.id,
        })
        .eq("id", user.id);

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } else {
      setStep("org");
    }
  }

  async function handleOrgSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Create the organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: orgName,
        org_type: orgType,
        subtype: subtype || null,
      })
      .select()
      .single();

    if (orgError) {
      setError(orgError.message);
      setLoading(false);
      return;
    }

    // Update the user's profile with org and role
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role,
        organization_id: org.id,
      })
      .eq("id", user.id);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (step === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center"
            style={{
              background: "var(--ochre-100)",
              borderRadius: 10,
            }}
          >
            <Building2 className="h-5 w-5" style={{ color: "var(--ochre-500)" }} />
          </div>
          <CardTitle
            className="font-serif"
            style={{
              fontSize: 26,
              fontWeight: 500,
              color: "var(--ink-800)",
              letterSpacing: "-0.01em",
            }}
          >
            Set up your account
          </CardTitle>
          <CardDescription>
            {matchedOrg
              ? `We recognized your email — you're part of ${matchedOrg.name}. Just pick your role to get started.`
              : "Tell us about your role and organization so we can tailor your experience."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "role" ? (
            <div className="space-y-4">
              {/* Show matched org */}
              {matchedOrg && (
                <div className="flex items-center gap-3 rounded-lg border bg-green-50/50 p-4">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{matchedOrg.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {matchedOrg.org_type.replace("_", " ")}
                      {matchedOrg.subtype && ` · ${matchedOrg.subtype}`}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Auto-detected
                  </Badge>
                </div>
              )}

              <div className="space-y-2">
                <Label>What best describes your role?</Label>
                <Select value={role} onValueChange={(v) => setRole(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                className="w-full"
                disabled={!role || loading}
                onClick={handleRoleContinue}
              >
                {loading
                  ? "Setting up..."
                  : matchedOrg
                    ? "Complete setup"
                    : "Continue"}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleOrgSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We didn&apos;t recognize your email domain. Set up your
                organization below, or contact your admin to have it
                pre-registered.
              </p>

              <div className="space-y-2">
                <Label htmlFor="orgName">Organization name</Label>
                <Input
                  id="orgName"
                  placeholder="e.g. Temple Beth Shalom"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Organization type</Label>
                <Select value={orgType} onValueChange={(v) => { setOrgType(v ?? ""); setSubtype(""); }} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {subtypesByOrgType[orgType] && (
                <div className="space-y-2">
                  <Label>
                    {orgType === "synagogue" ? "Denomination" : "Subtype"}
                  </Label>
                  <Select value={subtype} onValueChange={(v) => setSubtype(v ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {subtypesByOrgType[orgType].map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("role")}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || !orgName || !orgType}
                >
                  {loading ? "Setting up..." : "Complete setup"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
