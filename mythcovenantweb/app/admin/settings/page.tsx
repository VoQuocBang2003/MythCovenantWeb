import { Settings2, Sparkles } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,190,92,0.14),_transparent_36%),linear-gradient(135deg,_#050816_0%,_#111827_100%)] px-4 py-6 text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-[0_0_90px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-10">
        <div className="flex items-center gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-500/15 text-amber-300">
            <Settings2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-200/70">Cài đặt quản trị</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Trang cài đặt</h1>
          </div>
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-8 text-slate-300">
          <div className="flex items-center gap-3 text-amber-200">
            <Sparkles className="h-5 w-5" />
            <p className="text-sm">Tính năng đang được phát triển.</p>
          </div>
          <p className="mt-4 text-sm leading-6">
            Đây là khu vực để thêm các cài đặt nâng cao trong tương lai. Hiện tại, bạn có thể quản lý Layout chia team tại trang &quot;Chia Team&quot;.
          </p>
        </div>
      </div>
    </div>
  );
}
