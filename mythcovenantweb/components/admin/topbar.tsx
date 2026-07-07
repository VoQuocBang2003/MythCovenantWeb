import { Bell, Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AdminTopbar() {
  return (
    <header className="border-b border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full border-white/10 bg-white/5 text-slate-200 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-sm text-slate-400">Bảng điều khiển</p>
            <h2 className="text-xl font-semibold text-white">Tổng quan hệ thống</h2>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400">
            <Search className="h-4 w-4" />
            <input
              className="w-full bg-transparent outline-none placeholder:text-slate-500 sm:w-48"
              placeholder="Tìm thành viên..."
            />
          </label>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full border-white/10 bg-white/5 text-slate-200"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20 text-sm font-semibold text-amber-200">
                AD
              </div>
              <div>
                <p className="text-sm font-medium text-white">Admin</p>
                <p className="text-xs text-slate-400">Quản trị cấp cao</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
