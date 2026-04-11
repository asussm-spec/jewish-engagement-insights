"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  Upload,
  LogOut,
  Building2,
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

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Events",
    href: "/dashboard/events",
    icon: CalendarDays,
  },
  {
    label: "Population",
    href: "/dashboard/population",
    icon: Users,
  },
  {
    label: "Insights",
    href: "/dashboard/insights",
    icon: BarChart3,
  },
];

export function DashboardShell({
  user,
  profile,
  children,
}: {
  user: User;
  profile: Profile | null;
  children: React.ReactNode;
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

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-64 flex-col border-r bg-white">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 border-b px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-white">
            <BarChart3 className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Engagement Insights
          </span>
        </div>

        {/* Org context */}
        {orgName && (
          <div className="border-b px-5 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              {orgName}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-navy/5 text-navy"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User menu */}
        <div className="border-t p-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-navy/10 text-navy text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  {profile?.role && (
                    <p className="text-xs text-muted-foreground capitalize">
                      {profile.role.replace("_", " ")}
                    </p>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
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

      {/* Main content */}
      <main className="flex-1 bg-cream/50">
        <div className="container mx-auto max-w-6xl px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
