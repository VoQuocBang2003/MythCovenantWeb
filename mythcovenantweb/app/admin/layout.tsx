"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!data.session) {
        router.replace("/login");
        return;
      }

      setIsLoading(false);
    };

    loadSession();

    const { data } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
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

  return <>{children}</>;
}
