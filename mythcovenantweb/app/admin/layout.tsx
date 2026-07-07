"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if logged in via cookie
    const isLoggedIn = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("admin_logged_in="))
      ?.split("=")[1];

    if (isLoggedIn !== "true") {
      router.replace("/login");
      return;
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] text-slate-50">
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 px-8 py-10 text-center shadow-[0_0_90px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-200/70">Đang xác thực</p>
          <p className="mt-4 text-lg font-semibold text-white">Vui lòng chờ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,190,92,0.16),_transparent_34%),linear-gradient(135deg,_#060816_0%,_#111827_100%)] text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <AdminSidebar />
        <div className="flex-1">
          <AdminTopbar />
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}