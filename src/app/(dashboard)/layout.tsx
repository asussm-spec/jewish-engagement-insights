import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";

const DEMO_USER = {
  id: "demo-user-id",
  email: "demo@templebethshalom.org",
  app_metadata: {},
  user_metadata: { full_name: "Demo User" },
  aud: "authenticated",
  created_at: "2025-01-01T00:00:00Z",
} as any;

const DEMO_PROFILE = {
  id: "demo-user-id",
  full_name: "Sarah Cohen",
  role: "program_manager",
  organization_id: "demo-org-id",
  organizations: {
    id: "demo-org-id",
    name: "Temple Beth Shalom",
    org_type: "synagogue",
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("demo_mode")?.value === "true";

  if (isDemo) {
    return (
      <DashboardShell user={DEMO_USER} profile={DEMO_PROFILE}>
        {children}
      </DashboardShell>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organizations(*)")
    .eq("id", user.id)
    .single();

  return (
    <DashboardShell user={user} profile={profile}>
      {children}
    </DashboardShell>
  );
}
