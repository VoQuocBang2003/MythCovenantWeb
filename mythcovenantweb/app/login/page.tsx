"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/admin");
      }
    });
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.replace("/admin");
  };

  return (
    <div className="min-h-screen bg-[#050816] px-4 py-10 text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-[0_0_90px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-200/70">Admin Login</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">Đăng nhập quản trị</h1>
          <p className="mt-2 text-sm text-slate-400">
            Chỉ tài khoản admin đã được phê duyệt mới có thể truy cập trang quản trị.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 block w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-slate-100 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-200">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-2 block w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-slate-100 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>

          {error ? (
            <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
