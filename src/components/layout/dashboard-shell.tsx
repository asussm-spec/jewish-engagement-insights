"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BarChart3,
  CalendarDays,
  Users,
  LayoutDashboard,
  LogOut,
  Settings,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name: string | null;
  role: string;
  organization_id: string | null;
  organizations: {
    id: string;
    name: string;
    org_type: string;
  } | null;
}

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  section: "Workspace" | "Account";
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, section: "Workspace" },
  { label: "Events", href: "/dashboard/events", icon: CalendarDays, section: "Workspace" },
  { label: "Population", href: "/dashboard/population", icon: Users, section: "Workspace" },
  { label: "Community Insights", href: "/dashboard/insights", icon: BarChart3, section: "Workspace" },
];

const accountItems: NavItem[] = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings, section: "Account" },
  { label: "Help", href: "/dashboard/help", icon: HelpCircle, section: "Account" },
];

function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="5" fill="#1d2a5e" />
      <path
        d="M7 9.5L14 6L21 9.5V18.5L14 22L7 18.5V9.5Z"
        stroke="#b8892c"
        strokeWidth="1.4"
      />
      <circle cx="14" cy="14" r="2" fill="#b8892c" />
    </svg>
  );
}

export function DashboardShell({
  user,
  profile,
  children,
  isDemo = false,
}: {
  user: User;
  profile: Profile | null;
  children: React.ReactNode;
  isDemo?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() ?? "?";

  const displayName = profile?.full_name || user.email || "User";
  const orgName = profile?.organizations?.name;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div
      className="grid min-h-screen"
      style={{
        gridTemplateColumns: "232px 1fr",
        background: "var(--paper-50)",
      }}
    >
      {/* ── Sidebar ── */}
      <aside
        className="sticky top-0 flex h-screen flex-col px-3.5 py-5"
        style={{
          background: "var(--ds-bg-elevated)",
          borderRight: "1px solid var(--ds-border)",
        }}
      >
        <div
          className="flex items-center gap-2.5 px-2 pb-5 mb-3"
          style={{ borderBottom: "1px solid var(--ds-border)" }}
        >
          <BrandMark />
          <div
            className="font-serif leading-tight"
            style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-800)" }}
          >
            Engagement
            {orgName && (
              <div
                className="font-sans font-semibold uppercase"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  color: "var(--ochre-500)",
                  marginTop: 3,
                }}
              >
                {orgName}
              </div>
            )}
          </div>
        </div>

        {isDemo && (
          <Link
            href="/?demo=false"
            className="no-underline mx-2 mb-3 flex items-center justify-between gap-2 rounded-md px-2.5 py-2 transition-colors"
            style={{
              background: "var(--ochre-50, #faf2dc)",
              border: "1px solid var(--ochre-300, #e0c082)",
              fontSize: 11,
            }}
          >
            <span style={{ color: "var(--ink-800)", fontWeight: 600 }}>
              Demo mode
            </span>
            <span style={{ color: "var(--ochre-700, #8a6418)", fontWeight: 500 }}>
              Exit →
            </span>
          </Link>
        )}

        <div
          className="font-semibold uppercase px-2 pt-3 pb-1.5"
          style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            color: "var(--stone-400)",
          }}
        >
          Workspace
        </div>
        {navItems.map((item) => (
          <SidenavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}

        <div
          className="font-semibold uppercase px-2 pt-3 pb-1.5"
          style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            color: "var(--stone-400)",
          }}
        >
          Account
        </div>
        {accountItems.map((item) => (
          <SidenavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}

        <div className="mt-auto pt-3" style={{ borderTop: "1px solid var(--ds-border)" }}>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors"
              style={{ color: "var(--stone-500)" }}
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback
                  style={{
                    background: "var(--paper-100)",
                    color: "var(--ochre-500)",
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p
                  className="truncate"
                  style={{ fontSize: 13, color: "var(--ink-800)", fontWeight: 500 }}
                >
                  {displayName}
                </p>
                {profile?.role && (
                  <p
                    className="capitalize"
                    style={{ fontSize: 11, color: "var(--ds-fg-muted)" }}
                  >
                    {profile.role.replace("_", " ")}
                  </p>
                )}
              </div>
              <ChevronDown className="h-3.5 w-3.5" style={{ color: "var(--stone-400)" }} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                {user.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="min-w-0" style={{ padding: "28px 40px 80px" }}>
        {children}
      </main>
    </div>
  );
}

function SidenavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors"
      )}
      style={{
        color: active ? "var(--ink-800)" : "var(--stone-500)",
        background: active ? "var(--paper-100)" : "transparent",
        fontWeight: active ? 500 : 400,
      }}
    >
      {active && (
        <span
          className="absolute"
          style={{
            left: -3,
            top: 8,
            bottom: 8,
            width: 3,
            background: "var(--ochre-400)",
            borderRadius: "0 2px 2px 0",
          }}
        />
      )}
      <Icon
        className="h-3.5 w-3.5"
        style={{ color: active ? "var(--ochre-400)" : "var(--stone-400)" }}
      />
      {item.label}
    </Link>
  );
}
