"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileDown, GripVertical, Loader2, Users2, Wifi, WifiOff } from "lucide-react";
import { utils, writeFile } from "xlsx";

import { useAppFeedback } from "@/components/ui/feedback-provider";
import { getRoleBadgeClasses } from "@/lib/role-colors";
import { useNetworkStatus } from "@/hooks/use-network-status";
import type { Member, TeamKey } from "@/types/member";
import type { TeamAssignment as SavedLayout } from "@/types/team-assignment";
import { initialMembers } from "@/lib/mock-members";

type TeamColumn = {
  id: TeamKey;
  title: string;
  description: string;
};

const columns: TeamColumn[] = [
  { id: "unassigned", title: "Chưa xếp", description: "Danh sách thành viên chưa phân bố" },
  { id: "team-1", title: "Team 1", description: "Đội hình chính" },
  { id: "team-2", title: "Team 2", description: "Đội hình phụ" },
  { id: "team-3", title: "Team 3", description: "Đội hình chiến thuật" },
  { id: "team-4", title: "Team 4", description: "Đội hình hỗ trợ" },
  { id: "team-5", title: "Team 5", description: "Đội hình dự phòng" },
  { id: "bench", title: "Bench", description: "Thành viên dự bị" },
];

const baseMembers: Member[] = initialMembers.map((member) => ({ ...member }));

const createEmptyMembersByColumn = (): Record<TeamKey, Member[]> => ({
  unassigned: [],
  "team-1": [],
  "team-2": [],
  "team-3": [],
  "team-4": [],
  "team-5": [],
  bench: [],
});

const createDefaultMembersByColumn = (): Record<TeamKey, Member[]> => ({
  unassigned: [...baseMembers],
  "team-1": [],
  "team-2": [],
  "team-3": [],
  "team-4": [],
  "team-5": [],
  bench: [],
});

const initialLayoutName = "Layout mới";
const PENDING_SYNC_KEY = "team-assignment-pending-sync";

export function TeamAssignment() {
  const [membersByColumn, setMembersByColumn] = useState<Record<TeamKey, Member[]>>(createDefaultMembersByColumn());
  const [draggedMemberId, setDraggedMemberId] = useState<string | null>(null);
  const [layouts, setLayouts] = useState<SavedLayout[]>([]);
  const [activeLayoutId, setActiveLayoutId] = useState<string | null>(null);
  const [layoutName, setLayoutName] = useState(initialLayoutName);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingSync, setPendingSync] = useState(false);
  const { toast, confirm } = useAppFeedback();
  const isOnline = useNetworkStatus();

  const activeLayout = layouts.find((layout) => layout.id === activeLayoutId) ?? null;

  const totals = useMemo(() => {
    return columns.reduce(
      (acc, column) => {
        const members = membersByColumn[column.id] ?? [];
        acc[column.id] = {
          count: members.length,
          power: members.reduce((sum, member) => sum + Number(member.power), 0),
        };
        return acc;
      },
      {} as Record<TeamKey, { count: number; power: number }>
    );
  }, [membersByColumn]);

  const buildMembersByColumn = useCallback((assignments: Record<TeamKey, string[]>) => {
    const result = createEmptyMembersByColumn();

    baseMembers.forEach((member) => {
      const matchedColumn = columns.find(
        (column) => column.id !== "unassigned" && assignments[column.id]?.includes(member.id)
      );

      if (matchedColumn) {
        result[matchedColumn.id].push(member);
      } else {
        result.unassigned.push(member);
      }
    });

    return result;
  }, []);

  const loadLayout = useCallback(
    (layout: SavedLayout | null) => {
      if (!layout) {
        setActiveLayoutId(null);
        setLayoutName(initialLayoutName);
        setMembersByColumn(createDefaultMembersByColumn());
        return;
      }

      setActiveLayoutId(layout.id);
      setLayoutName(layout.name);
      setMembersByColumn(buildMembersByColumn(layout.assignments));
    },
    [buildMembersByColumn]
  );

  const fetchLayouts = useCallback(async () => {
    try {
      const response = await fetch("/api/team-assignments");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Không thể tải layouts.");
      }

      setLayouts(Array.isArray(data) ? data : []);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
      return [];
    }
  }, []);

  // Save pending changes to localStorage
  const savePendingToStorage = useCallback((payload: { name: string; assignments: Record<TeamKey, string[]> }) => {
    try {
      localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify({
        ...payload,
        ...(activeLayoutId ? { assignmentId: activeLayoutId } : {}),
        timestamp: Date.now(),
      }));
      setPendingSync(true);
    } catch {
      // localStorage might not be available
    }
  }, [activeLayoutId]);

  // Clear pending changes from localStorage
  const clearPendingFromStorage = useCallback(() => {
    try {
      localStorage.removeItem(PENDING_SYNC_KEY);
      setPendingSync(false);
    } catch {
      // localStorage might not be available
    }
  }, []);

  // Check for pending sync on mount
  useEffect(() => {
    try {
      const pending = localStorage.getItem(PENDING_SYNC_KEY);
      if (pending) {
        setPendingSync(true);
      }
    } catch {
      // localStorage might not be available
    }
  }, []);

  // Auto-sync when online
  useEffect(() => {
    if (isOnline && pendingSync) {
      const syncPending = async () => {
        try {
          const pending = localStorage.getItem(PENDING_SYNC_KEY);
          if (!pending) {
            setPendingSync(false);
            return;
          }

          const payload = JSON.parse(pending);
          const response = await fetch("/api/team-assignments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const data = await response.json();
          if (response.ok) {
            clearPendingFromStorage();
            await fetchLayouts();
            loadLayout(data);
            toast({ 
              title: "Đồng bộ thành công", 
              description: "Dữ liệu đã được đồng bộ lên Supabase.", 
              variant: "success" 
            });
          }
        } catch {
          // Will retry when online again
        }
      };

      void syncPending();
    }
  }, [isOnline, pendingSync, clearPendingFromStorage, fetchLayouts, loadLayout, toast]);

  useEffect(() => {
    const loadInitialLayouts = async () => {
      setIsInitializing(true);
      const savedLayouts = await fetchLayouts();
      if (savedLayouts.length > 0) {
        loadLayout(savedLayouts[0]);
      }
      setIsInitializing(false);
    };

    void loadInitialLayouts();
  }, [fetchLayouts, loadLayout]);

  // Get assignments from members state
  const getAssignmentsFromMembers = useCallback((members: Record<TeamKey, Member[]>) => {
    return columns.reduce((result, column) => {
      result[column.id] = members[column.id].map((member) => member.id);
      return result;
    }, {} as Record<TeamKey, string[]>);
  }, []);

  // Auto-save function
  const autoSave = useCallback(async (newMembersByColumn: Record<TeamKey, Member[]>) => {
    const payload = {
      name: layoutName.trim() || initialLayoutName,
      assignments: getAssignmentsFromMembers(newMembersByColumn),
      ...(activeLayoutId ? { assignmentId: activeLayoutId } : {}),
    };

    if (isOnline) {
      setIsSaving(true);
      try {
        const response = await fetch("/api/team-assignments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error ?? "Không thể lưu layout.");
        }

        clearPendingFromStorage();
        await fetchLayouts();
        loadLayout(data);
        setStatusMessage("Đã tự động lưu layout.");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : String(error));
        savePendingToStorage(payload);
      } finally {
        setIsSaving(false);
      }
    } else {
      // Offline: save to localStorage
      savePendingToStorage(payload);
      setStatusMessage("Đang chờ mạng để đồng bộ...");
    }
  }, [isOnline, activeLayoutId, layoutName, getAssignmentsFromMembers, clearPendingFromStorage, fetchLayouts, loadLayout, savePendingToStorage, setStatusMessage, setErrorMessage, setIsSaving]);

  const onDrop = (targetColumn: TeamKey) => {
    if (!draggedMemberId) {
      return;
    }

    setMembersByColumn((current) => {
      const sourceColumn = (Object.keys(current) as TeamKey[]).find((columnId) =>
        current[columnId].some((member) => member.id === draggedMemberId)
      );

      if (!sourceColumn || sourceColumn === targetColumn) {
        return current;
      }

      const movedMember = current[sourceColumn].find((member) => member.id === draggedMemberId);

      if (!movedMember) {
        return current;
      }

      const newMembers = {
        ...current,
        [sourceColumn]: current[sourceColumn].filter((member) => member.id !== draggedMemberId),
        [targetColumn]: [...current[targetColumn], movedMember],
      };

      // Auto-save after drop
      void autoSave(newMembers);

      return newMembers;
    });

    setDraggedMemberId(null);
  };

  const handleNewLayout = () => {
    setErrorMessage(null);
    setStatusMessage(null);
    clearPendingFromStorage();
    setActiveLayoutId(null);
    setLayoutName(initialLayoutName);
    setMembersByColumn(createDefaultMembersByColumn());
    toast({ title: "Đã tạo layout mới", description: "Bạn có thể bắt đầu sắp xếp team từ đầu.", variant: "info" });
  };

  const handleSaveLayout = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setIsSaving(true);

    try {
      const payload = {
        name: layoutName.trim() || initialLayoutName,
        assignments: getAssignmentsFromMembers(membersByColumn),
        ...(activeLayoutId ? { assignmentId: activeLayoutId } : {}),
      };

      const response = await fetch("/api/team-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Không thể lưu layout.");
      }

      clearPendingFromStorage();
      await fetchLayouts();
      loadLayout(data);
      setStatusMessage("Layout đã được lưu thành công.");
      toast({ title: "Lưu layout thành công", description: `Layout ${payload.name} đã được cập nhật.`, variant: "success" });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
      savePendingToStorage({
        name: layoutName.trim() || initialLayoutName,
        assignments: getAssignmentsFromMembers(membersByColumn),
        ...(activeLayoutId ? { assignmentId: activeLayoutId } : {}),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLayout = async () => {
    if (!activeLayoutId) {
      return;
    }

    const confirmed = await confirm({
      title: "Xóa layout",
      description: "Bạn có chắc muốn xóa layout đang chọn?",
      confirmText: "Xóa",
      cancelText: "Hủy",
      confirmVariant: "destructive",
    });

    if (!confirmed) {
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/team-assignments/${activeLayoutId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Không thể xóa layout.");
      }

      const savedLayouts = await fetchLayouts();
      if (savedLayouts.length > 0) {
        loadLayout(savedLayouts[0]);
      } else {
        handleNewLayout();
      }

      setStatusMessage("Layout đã được xóa.");
      toast({ title: "Xóa layout thành công", description: "Layout đã được loại bỏ khỏi hệ thống.", variant: "success" });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLayoutChange = (layoutId: string) => {
    const selectedLayout = layouts.find((layout) => layout.id === layoutId) ?? null;
    loadLayout(selectedLayout);
  };

  const handleExportTeam = () => {
    const exportRows = columns.flatMap((column) => {
      if (column.id === "unassigned") {
        return membersByColumn.unassigned.map((member) => ({
          layout: layoutName.trim() || initialLayoutName,
          team: column.title,
          nickname: member.nickname,
          className: member.className,
          role: member.role,
          power: member.power,
          note: member.note,
        }));
      }

      return membersByColumn[column.id as TeamKey].map((member) => ({
        layout: layoutName.trim() || initialLayoutName,
        team: column.title,
        nickname: member.nickname,
        className: member.className,
        role: member.role,
        power: member.power,
        note: member.note,
      }));
    });

    const worksheet = utils.json_to_sheet(exportRows);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "TeamLayout");
    writeFile(workbook, `${(layoutName.trim() || initialLayoutName).replace(/\s+/g, "-")}-team.xlsx`);
    setStatusMessage("Đã xuất Team hiện tại sang Excel.");
    toast({ title: "Xuất team thành công", description: "File Excel đã được chuẩn bị.", variant: "success" });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-[0_0_80px_rgba(0,0,0,0.25)]">
        <div className="mb-6 grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-200/70">Layout quản lý</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              Lưu và quản lý cách chia Team
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Mỗi layout sẽ lưu toàn bộ cách phân bố hiện tại của các team lên Supabase.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <button
              type="button"
              onClick={handleNewLayout}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:border-amber-400/30 hover:bg-amber-500/10"
            >
              Tạo Layout mới
            </button>
            <button
              type="button"
              onClick={handleExportTeam}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:border-amber-400/30 hover:bg-amber-500/10"
            >
              <span className="flex items-center justify-center gap-2">
                <FileDown className="h-4 w-4" />
                Export Team hiện tại
              </span>
            </button>
            <button
              type="button"
              onClick={handleSaveLayout}
              disabled={isSaving}
              className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition duration-200 hover:-translate-y-0.5 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </span>
              ) : (
                "Lưu Layout"
              )}
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-3">
            <label htmlFor="layout-name" className="text-sm font-medium text-slate-200">
              Tên Layout
            </label>
            <input
              id="layout-name"
              value={layoutName}
              onChange={(event) => setLayoutName(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="layout-select" className="text-sm font-medium text-slate-200">
                Layout đã lưu
              </label>
              <select
                id="layout-select"
                value={activeLayoutId ?? ""}
                onChange={(event) => handleLayoutChange(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              >
                <option value="">Layout mới / chưa lưu</option>
                {layouts.map((layout) => (
                  <option key={layout.id} value={layout.id}>
                    {layout.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              disabled={!activeLayoutId || isDeleting}
              onClick={handleDeleteLayout}
              className="w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Đang xóa..." : "Xóa Layout"}
            </button>
          </div>
        </div>

        {activeLayout && (
          <div className="mt-4 animate-fade-in-up rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300">
            <p>
              <strong>Chỉnh sửa layout:</strong> {activeLayout.name}
            </p>
            <p className="mt-2 text-slate-400">
              Cập nhật lần cuối: {new Date(activeLayout.updated_at ?? activeLayout.created_at ?? "").toLocaleString("vi-VN")}
            </p>
          </div>
        )}

        {/* Network status indicator */}
        <div className="mt-4 flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-emerald-400" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-400" />
          )}
          <span className={`text-sm ${isOnline ? "text-emerald-400" : "text-red-400"}`}>
            {isOnline ? "Đã kết nối" : "Mất kết nối"}
          </span>
          {pendingSync && isOnline && (
            <span className="text-xs text-amber-400 animate-pulse">(Đang đồng bộ...)</span>
          )}
        </div>

        {statusMessage ? (
          <div className="mt-4 animate-fade-in-up rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {statusMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-4 animate-fade-in-up rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : null}
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-[0_0_80px_rgba(0,0,0,0.25)]">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-200/70">Chia Team</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">
          Kéo thả thành viên giữa các Team và danh sách chưa xếp
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          Mỗi Team hiển thị số lượng thành viên và tổng power, cùng với danh sách chưa xếp.
        </p>
      </div>

      {isInitializing ? (
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5">
              <div className="h-4 w-28 rounded-full bg-white/10" />
              <div className="mt-4 h-6 w-40 rounded-full bg-white/10" />
              <div className="mt-4 h-24 rounded-[1.25rem] bg-white/10" />
            </div>
          ))}
        </div>
      ) : (
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5 transition duration-200 hover:border-amber-400/20">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-white">Chưa xếp</h4>
              <p className="text-sm text-slate-400">
                {totals.unassigned.count} thành viên còn chưa phân bổ
              </p>
            </div>
            <div className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-sm text-amber-200">
              {totals.unassigned.count} người
            </div>
          </div>

          <div
            className="min-h-[240px] rounded-[1.5rem] border border-dashed border-white/10 bg-white/5 p-3"
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => onDrop("unassigned")}
          >
            {membersByColumn.unassigned.map((member) => (
              <div
                key={member.id}
                draggable
                onDragStart={() => setDraggedMemberId(member.id)}
                onDragEnd={() => setDraggedMemberId(null)}
                className="mb-3 flex cursor-grab items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-3 transition duration-200 hover:-translate-y-0.5 hover:border-amber-400/20"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-amber-500/10 p-2 text-amber-300">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{member.nickname}</p>
                    <p className="text-sm text-slate-400">{member.className}</p>
                  </div>
                </div>
                <span className="text-sm text-amber-200">{member.power}</span>
              </div>
            ))}

            {membersByColumn.unassigned.length === 0 && (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Không còn thành viên chưa xếp.
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {columns.filter((column) => column.id !== "unassigned").map((column) => (
            <div
              key={column.id}
              className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-amber-400/20"
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => onDrop(column.id as TeamKey)}
            >
<div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-white">{column.title}</h4>
                  <p className="text-sm text-slate-400">{column.description}</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                  {totals[column.id as TeamKey].count} / {totals[column.id as TeamKey].power}
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <Users2 className="h-4 w-4 text-amber-300" />
                  {totals[column.id as TeamKey].count} thành viên
                </span>
                <span className="text-amber-200">Tổng Power {totals[column.id as TeamKey].power}</span>
              </div>

              <div className="min-h-[180px] rounded-[1.5rem] border border-white/10 bg-slate-900/50 p-3">
                {membersByColumn[column.id as TeamKey].map((member) => (
                  <div
                    key={member.id}
                    draggable
                    onDragStart={() => setDraggedMemberId(member.id)}
                    onDragEnd={() => setDraggedMemberId(null)}
                    className="mb-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 transition duration-200 hover:-translate-y-0.5 hover:border-amber-400/20"
                  >
                    <p className="font-medium text-white">{member.nickname}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`text-xs ${getRoleBadgeClasses(member.role)}`}>
                        {member.role}
                      </span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-xs text-slate-400">{member.className}</span>
                    </div>
                    <p className="mt-1 text-sm text-amber-200">Power {member.power}</p>
                  </div>
                ))}

                {membersByColumn[column.id as TeamKey].length === 0 && (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    Thả thành viên vào đây
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
      )}
    </div>
  );
}