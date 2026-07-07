import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Flame,
  MoonStar,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Sword,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const features = [
  {
    icon: ShieldCheck,
    title: "Tổ đội leo tháp",
    description:
      "Luôn có các master speedrun hỗ trợ",
  },
  {
    icon: Sword,
    title: "Boss Guild Boss Tuần",
    description:
      "19:00 - 21:00 hàng ngày",
  },
  {
    icon: Compass,
    title: "Tận tâm hướng dẫn",
    description:
      "Định hướng võ học, hướng dẫn tất tần tật từ A-Z cho newbie",
  },
];

const highlights = [
  "Se duyên kết nghĩa PNS",
  "GA - phát thưởng hàng tháng cho các thành viên tích cực",
  "Phần thưởng thẻ tháng, battle pass, skin 60-1280 ngọc",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,190,92,0.18),_transparent_32%),linear-gradient(135deg,_#070b16_0%,_#111827_100%)] px-4 py-6 text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-[0_0_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">
        <header className="flex flex-col gap-4 rounded-[1.5rem] border border-amber-400/20 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/15 text-amber-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-amber-200/80">
                Myth Covenant
              </p>
              <h1 className="text-xl font-semibold text-white">
                Where Winds Meet
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <MoonStar className="h-4 w-4" />
            Dark theme
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-sm text-amber-200">
              <Flame className="h-4 w-4" />
              Bản quyền sử dụng thuộc về Myth Covenant
            </div>
            <div className="space-y-4">
              <h2 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
                Welcome to the world of Myth Covenant, where winds meet and stories unfold.
              </h2>
              <a
  href="https://discord.gg/EhEe7MrhX"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 rounded-xl border border-indigo-500 bg-indigo-600/90 px-6 py-3 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-indigo-500"
>
  🎮 Join Official Discord
</a>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/login">
                <Button className="rounded-full bg-amber-500 px-6 text-slate-950 hover:bg-amber-400">
                  Quản lý bang chiến
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                  lequocdinh
                </Button>
              </Link>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <ScrollText className="h-4 w-4 text-amber-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-800 p-6 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Thông tin GUILD
              </span>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
                Online
              </span>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Official name</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  Myth Covenant | ID: 10078114
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Xu hướng</p>
                  <p className="mt-2 text-2xl font-semibold text-white">PvP | PvE</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Xếp hạng GW</p>
                  <p className="mt-2 text-2xl font-semibold text-white">Jesting God</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}