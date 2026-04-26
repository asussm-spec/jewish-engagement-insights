import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";

const DEMO_USER = {
  id: "demo-user-id",
  email: "demo@gbjcc.org",
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
    name: "Greater Boston JCC",
    org_type: "jcc",
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Real auth wins over demo mode. Middleware clears the demo cookie when
  // a real user is logged in, so by the time we get here we can trust:
  // if there's a Supabase user, that's who we are; otherwise the demo cookie
  // (when set) means render the mock org.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*, organizations(*)")
      .eq("id", user.id)
      .single();

    return (
      <DashboardShell user={user} profile={profile} isDemo={false}>
        {children}
      </DashboardShell>
    );
  }

  const cookieStore = await cookies();
  const isDemo = cookieStore.get("demo_mode")?.value === "true";

  if (isDemo) {
    return (
      <DashboardShell user={DEMO_USER} profile={DEMO_PROFILE} isDemo>
        {children}
      </DashboardShell>
    );
  }

  redirect("/login");
}
