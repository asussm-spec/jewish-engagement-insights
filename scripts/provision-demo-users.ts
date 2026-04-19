/**
 * Provision demo user accounts.
 *
 * Creates Supabase auth users for each demo persona and wires their
 * profile row to the right org + role. Idempotent — re-running updates the
 * existing profile without duplicating auth users.
 *
 *   demo.jcc.pm@example.com      → program_manager @ Greater Boston JCC
 *
 * (More personas will be added here as we build more demos.)
 *
 * Run: npx tsx scripts/provision-demo-users.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const envContent = readFileSync(join(__dirname, "..", ".env.local"), "utf-8");
function getEnv(key: string): string {
  const match = envContent.match(new RegExp(`${key}=(.+)`));
  if (!match) throw new Error(`Missing ${key} in .env.local`);
  return match[1].trim();
}

const supabase = createClient(
  getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  getEnv("SUPABASE_SERVICE_ROLE_KEY")
);

type DemoPersona = {
  email: string;
  password: string;
  fullName: string;
  role: "program_manager" | "org_leader" | "communal_leader";
  orgName: string;
};

const personas: DemoPersona[] = [
  {
    email: "demo.jcc.pm@example.com",
    password: "demo-jcc-pm-2026",
    fullName: "Maya Stern",
    role: "program_manager",
    orgName: "Greater Boston JCC",
  },
];

async function findUserByEmail(email: string): Promise<string | null> {
  // The admin listUsers API is paginated; we just scan the first page. For
  // the demo account volume we keep here this is fine.
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 200 });
  if (error) throw error;
  const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return match?.id ?? null;
}

async function main() {
  console.log("👤 Provisioning demo users...\n");

  for (const p of personas) {
    console.log(`— ${p.email}`);

    // Find org by name
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("name", p.orgName)
      .single();
    if (orgErr || !org) {
      console.error(`  ✗ Org "${p.orgName}" not found. Seed it first.`);
      continue;
    }

    // Find or create auth user
    let userId = await findUserByEmail(p.email);
    if (!userId) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: p.email,
        password: p.password,
        email_confirm: true,
        user_metadata: { full_name: p.fullName },
      });
      if (error) throw error;
      userId = data.user.id;
      console.log(`  + Created auth user ${userId.slice(0, 8)}`);
    } else {
      // Reset password in case it changed
      await supabase.auth.admin.updateUserById(userId, {
        password: p.password,
        user_metadata: { full_name: p.fullName },
      });
      console.log(`  ✓ Auth user exists (${userId.slice(0, 8)})`);
    }

    // Upsert profile row
    const { error: profErr } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          full_name: p.fullName,
          role: p.role,
          organization_id: org.id,
        },
        { onConflict: "id" }
      );
    if (profErr) {
      console.error(`  ✗ Profile error: ${profErr.message}`);
      continue;
    }

    console.log(`  ✓ Profile: ${p.fullName} · ${p.role} · ${org.name}`);
  }

  console.log("\n✅ Demo users provisioned.");
}

main().catch((err) => {
  console.error("Provision failed:", err);
  process.exit(1);
});
