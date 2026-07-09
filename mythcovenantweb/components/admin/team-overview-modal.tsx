"use client";

import { X } from "lucide-react";
import type { TeamKey } from "@/types/member";
import type { Member } from "@/types/member";
import { hasRole } from "@/lib/role-icons";
import { leaderHighlightClasses } from "@/lib/role-colors";
import { RenderRoleIcons } from "@/components/ui/role-icon";

interface TeamOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  membersByColumn: Record<TeamKey, Member[]>;
}

const teamColumns: { id: TeamKey; title: string }[] = [
  { id: "team-1", title: "Công 1" },
  { id: "team-2", title: "Công 2" },
  { id: "team-3", title: "Công 3" },
  { id: "team-4", title: "Thủ 1" },
  { id: "team-5", title: "Thủ 2" },
  { id: "bench", title: "Thủ 3" },
];

export function TeamOverviewModal({ isOpen, onClose, membersByColumn }: TeamOverviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl animate-fade-in-up rounded-[2rem] border border-amber-400/30 bg-slate-900 p-6 shadow-[0_0_100px_rgba(0,0,0,0.4)] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Tổng quan đội hình</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-amber-400/30 bg-amber-500/10 p-2 text-amber-200 transition hover:bg-amber-500/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Grid 6 Teams */}
        <div className="grid gap-3 md:grid-cols-3 max-h-[calc(90vh-80px)] overflow-y-auto pr-2">
          {teamColumns.map((team) => {
            const teamMembers = membersByColumn[team.id] ?? [];
            return (
              <div
                key={team.id}
                className="rounded-[1.5rem] border border-amber-400/20 bg-slate-800/50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-lg font-medium text-amber-200">{team.title}</h4>
                  <span className="text-sm text-slate-300">{teamMembers.length} người</span>
                </div>
                
                {teamMembers.length > 0 ? (
                  <div className="space-y-1.5">
                    {teamMembers.map((member) => {
                      const isLeaderMember = hasRole(member.role, "Leader");
                      
                      return (
                        <div
                          key={member.id}
                          className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 ${
                            isLeaderMember
                              ? `${leaderHighlightClasses.border} ${leaderHighlightClasses.background.replace('/5', '/10')}`
                              : "border-amber-400/10 bg-slate-800/30"
                          }`}
                        >
                          <span className={`text-sm ${isLeaderMember ? leaderHighlightClasses.name : "text-white"}`}>
                            {member.nickname}
                          </span>
                          <RenderRoleIcons roles={member.role} className="text-xs" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-xs text-slate-500 py-2">
                    Trống
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}