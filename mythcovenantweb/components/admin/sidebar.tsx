"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  LayoutGrid,
  LogOut,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase-client";

const menuItems = [
  { icon: LayoutGrid, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Quản lý thành viên", href: "/admin/members" },
  { icon: Compass, label: "Chia Team", href: "/admin/teams" },
  { icon: Settings, label: "Cài đặt", href: "/admin/settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="hidden border-r border-white/10 bg-slate-950/80 p-5 lg:flex lg:flex-col lg:justify-between">
      <div>
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
              Myth Covenant
            </p>
            <p className="text-sm font-semibold text-white">Control Hall</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map(({ icon: Icon, label, href }) => {
            const active = pathname === href;

            return (
              <Link
                key={label}
                href={href}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
                  active
                    ? "bg-amber-500/15 text-amber-200 shadow-[0_0_0_1px_rgba(251,191,36,0.2)]"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        type="button"
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/login");
        }}
        className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
  );
}
