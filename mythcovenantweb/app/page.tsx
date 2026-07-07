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
    title: "Bảo hộ linh hồn",
    description:
      "Hệ thống nhiệm vụ và lời khuyên được thiết kế để giữ cho hành trình của bạn luôn mạch lạc và đầy cảm hứng.",
  },
  {
    icon: Sword,
    title: "Đòn đánh thần thánh",
    description:
      "Giao diện sáng bóng, hiệu ứng chuyển động nhẹ và bố cục tối ưu cho thiết bị di động và màn hình lớn.",
  },
  {
    icon: Compass,
    title: "La bàn kỳ ảo",
    description:
      "Tìm thấy những ngõ hầm, bí cảnh và câu chuyện mới một cách tự nhiên trong mỗi trang chi tiết.",
  },
];

const highlights = [
  "Tối ưu cho trải nghiệm dark mode",
  "Phong cách game kiếm hiệp và huyền ảo",
  "Sẵn sàng mở rộng cho nội dung tương tác",
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
            Dark theme ready
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-sm text-amber-200">
              <Flame className="h-4 w-4" />
              Bản giao diện mới cho mùa xuân của các huyền thoại
            </div>
            <div className="space-y-4">
              <h2 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
                Khởi đầu một hành trình kiếm hiệp trong một thế giới đầy mây và
                lửa.
              </h2>
              <p className="max-w-xl text-lg text-slate-300 sm:text-xl">
                Myth Covenant mang đến một nền tảng đậm chất huyền ảo với giao
                diện tối, hiện đại và đầy cảm xúc, sẵn sàng trở thành nơi kể
                chuyện của bạn.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="rounded-full bg-amber-500 px-6 text-slate-950 hover:bg-amber-400">
                Khám phá hành trình
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                Xem bản đồ thế giới
              </Button>
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
                Trạng thái biểu đồ
              </span>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
                Online
              </span>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Sứ mệnh hôm nay</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  Dẫn dắt người chơi qua mê cung gió và lửa.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Cường hóa</p>
                  <p className="mt-2 text-2xl font-semibold text-white">+12%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Tín hiệu</p>
                  <p className="mt-2 text-2xl font-semibold text-white">3/3</p>
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
