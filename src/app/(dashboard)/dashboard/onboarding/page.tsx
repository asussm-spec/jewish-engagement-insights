"use client";

import { useState } from "react";
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
import { Building2 } from "lucide-react";

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

const roles = [
  { value: "program_manager", label: "Program Manager" },
  { value: "org_leader", label: "Organizational Leader" },
  { value: "communal_leader", label: "Communal Leader" },
];

const denominations = [
  "Reform",
  "Conservative",
  "Orthodox",
  "Reconstructionist",
  "Just Jewish",
  "Non-denominational",
  "Other",
];

export default function OnboardingPage() {
  const [step, setStep] = useState<"role" | "org">("role");
  const [role, setRole] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("");
  const [subtype, setSubtype] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
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

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
            <Building2 className="h-6 w-6 text-gold" />
          </div>
          <CardTitle className="text-2xl">Set up your account</CardTitle>
          <CardDescription>
            Tell us about your role and organization so we can tailor your
            experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "role" ? (
            <div className="space-y-4">
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
              <Button
                className="w-full"
                disabled={!role}
                onClick={() => setStep("org")}
              >
                Continue
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Select value={orgType} onValueChange={(v) => setOrgType(v ?? "")} required>
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

              {orgType === "synagogue" && (
                <div className="space-y-2">
                  <Label>Denomination</Label>
                  <Select value={subtype} onValueChange={(v) => setSubtype(v ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select denomination" />
                    </SelectTrigger>
                    <SelectContent>
                      {denominations.map((d) => (
                        <SelectItem key={d} value={d.toLowerCase()}>
                          {d}
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
