import { MemberManagement } from "@/components/admin/member-management";

export default function MembersPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,190,92,0.14),_transparent_36%),linear-gradient(135deg,_#050816_0%,_#111827_100%)] px-4 py-6 text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-slate-950/70 p-4 shadow-[0_0_90px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-6 lg:p-8">
        <MemberManagement />
      </div>
    </div>
  );
}
