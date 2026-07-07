import { Activity, Crown, Flame, Sparkles, Users2 } from "lucide-react";

import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Thành viên hoạt động",
    value: "128",
    note: "+12% so với tuần trước",
    icon: Users2,
  },
  {
    title: "Team đang vận hành",
    value: "06",
    note: "2 team cần bổ sung nhân sự",
    icon: Crown,
  },
  {
    title: "Sự kiện hôm nay",
    value: "14",
    note: "3 sự kiện cần chú ý",
    icon: Flame,
  },
];

const members = [
  { name: "Linh Tâm", role: "Leader", status: "Online" },
  { name: "Vân Nhi", role: "Support", status: "Focus" },
  { name: "Thiên Long", role: "Strategist", status: "Away" },
];

const teams = [
  { name: "Aether Guard", members: 18, focus: "Nhiệm vụ ngoại vi" },
  { name: "Moonblade", members: 12, focus: "Đánh giá chiến thuật" },
  { name: "Ember Rift", members: 9, focus: "Hỗ trợ event" },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,190,92,0.16),_transparent_34%),linear-gradient(135deg,_#060816_0%,_#111827_100%)] text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <AdminSidebar />

        <div className="flex-1">
          <AdminTopbar />

          <main className="space-y-6 p-4 sm:p-6 lg:p-8">
            <section className="rounded-[2rem] border border-amber-400/20 bg-slate-950/70 p-6 shadow-[0_0_80px_rgba(0,0,0,0.3)]">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-sm text-amber-200">
                    <Sparkles className="h-4 w-4" />
                    Phong cách Dark Fantasy cho admin panel
                  </div>
                  <h3 className="text-3xl font-semibold text-white sm:text-4xl">
                    Theo dõi thế giới và điều phối đội ngũ một cách uyển chuyển.
                  </h3>
                  <p className="mt-3 text-base text-slate-300">
                    Giao diện quản lý được thiết kế để vừa đẹp mắt vừa tối ưu cho
                    việc giám sát thành viên, phân chia team và quản lý cài đặt.
                  </p>
                </div>
                <Button className="rounded-full bg-amber-500 px-6 text-slate-950 hover:bg-amber-400">
                  Tạo sự kiện mới
                </Button>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {stats.map(({ title, value, note, icon: Icon }) => (
                <article
                  key={title}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-slate-400">{title}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
                  <p className="mt-2 text-sm text-slate-300">{note}</p>
                </article>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Danh sách thành viên</p>
                    <h4 className="text-xl font-semibold text-white">
                      Thành viên nổi bật
                    </h4>
                  </div>
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10">
                    Xem tất cả
                  </Button>
                </div>

                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.name}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-white">{member.name}</p>
                        <p className="text-sm text-slate-400">{member.role}</p>
                      </div>
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
                        {member.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-amber-300" />
                  <div>
                    <p className="text-sm text-slate-400">Cập nhật gần đây</p>
                    <h4 className="text-xl font-semibold text-white">Hoạt động tuần này</h4>
                  </div>
                </div>

                <div className="space-y-3">
                  {teams.map((team) => (
                    <div key={team.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">{team.name}</p>
                        <span className="text-sm text-amber-200">{team.members} thành viên</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">{team.focus}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
