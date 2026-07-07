"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileDown, FileUp, PencilLine, Plus, Search, Shield, Trash2, X } from "lucide-react";
import { read, utils, writeFile } from "xlsx";

import { Button } from "@/components/ui/button";
import { useAppFeedback } from "@/components/ui/feedback-provider";
import { playerClasses } from "@/lib/player-constants";
import { getRoleBadgeClasses } from "@/lib/role-colors";
import {
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from "@/lib/playerRepository";
import type { Member } from "@/types/member";

const roleOptions = ["Member", "Leader", "Tank", "DPS", "Healer"] as const;

type MemberRole = (typeof roleOptions)[number];

const emptyForm: Omit<Member, "id" | "created_at"> = {
  nickname: "",
  className: playerClasses[0],
  role: "Member",
  power: 0,
  note: "",
};

const normalizeNickname = (value: string) => value.trim().toLowerCase();

const normalizeRole = (value: string): MemberRole => {
  const normalized = value.trim().toLowerCase();

  if (normalized === "leader") {
    return "Leader";
  }

  if (normalized === "tank") {
    return "Tank";
  }

  if (normalized === "dps") {
    return "DPS";
  }

  if (normalized === "healer") {
    return "Healer";
  }

  
  return "Member";
};

const resolveCellValue = (row: Record<string, unknown>, candidates: string[]) => {
  const normalizedCandidates = candidates.map((candidate) => candidate.toLowerCase().trim());
  const match = Object.entries(row).find(([key]) => normalizedCandidates.includes(key.toLowerCase().trim()));

  return match ? String(match[1] ?? "") : "";
};

export function MemberManagement() {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Member>("power");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Member, "id" | "created_at">>(emptyForm);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast, confirm } = useAppFeedback();

  useEffect(() => {
    const loadMembers = async () => {
      setIsLoading(true);
      try {
        const data = await getPlayers();
        setMembers(data);
      } catch {
        // Error handled silently
      } finally {
        setIsLoading(false);
      }
    };

    void loadMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    const normalized = searchTerm.toLowerCase();

    const filtered = members.filter((member) => {
      return [
        member.nickname,
        member.className,
        member.role,
        member.note,
        member.power,
      ].some((value) => String(value).toLowerCase().includes(normalized));
    });

    return filtered.sort((a, b) => {
      const first = a[sortField];
      const second = b[sortField];
      const multipler = sortOrder === "asc" ? 1 : -1;

      if (typeof first === "number" && typeof second === "number") {
        return (first - second) * multipler;
      }

      return String(first).localeCompare(String(second)) * multipler;
    });
  }, [members, searchTerm, sortField, sortOrder]);

  const openCreateModal = () => {
    setEditingMemberId(null);
    setForm(emptyForm);
    setFeedback(null);
    setIsModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setEditingMemberId(member.id);
    setForm({
      nickname: member.nickname,
      className: member.className,
      role: normalizeRole(member.role),
      power: member.power,
      note: member.note,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMemberId(null);
    setForm(emptyForm);
  };

  const handleImportMembers = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFeedback(null);
    setIsSubmitting(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

      if (!rows.length) {
        throw new Error("File không có dữ liệu.");
      }

      const payloads: Omit<Member, "id" | "created_at">[] = [];
      const errors: string[] = [];
      const seenNicknames = new Set<string>();
      const existingNicknames = new Set(members.map((member) => normalizeNickname(member.nickname)));

      rows.forEach((row, index) => {
        const nickname = resolveCellValue(row, ["nickname", "name", "member_name", "nick"]).trim();
        const className = resolveCellValue(row, ["className", "class", "class_name", "lớp"]).trim();
        const role = normalizeRole(resolveCellValue(row, ["role", "vai trò", "vai_tro"]).trim() || "Member");
        const powerRaw = resolveCellValue(row, ["power", "sức mạnh", "strength", "pow"]);
        const power = Number(powerRaw);
        const normalizedNickname = normalizeNickname(nickname);

        if (!nickname) {
          errors.push(`Dòng ${index + 2}: thiếu nickname.`);
          return;
        }

        if (!className) {
          errors.push(`Dòng ${index + 2}: thiếu className.`);
          return;
        }

        if (!Number.isFinite(power)) {
          errors.push(`Dòng ${index + 2}: power phải là số.`);
          return;
        }

        if (existingNicknames.has(normalizedNickname) || seenNicknames.has(normalizedNickname)) {
          errors.push(`Dòng ${index + 2}: nickname "${nickname}" bị trùng.`);
          return;
        }

        seenNicknames.add(normalizedNickname);
        payloads.push({
          nickname,
          className,
          role,
          power,
          note: resolveCellValue(row, ["note", "ghi chú", "ghi_chu"]).trim(),
        });
      });

      if (errors.length) {
        throw new Error(errors.slice(0, 4).join(" | "));
      }

      const createdMembers: Member[] = [];
      for (const payload of payloads) {
        const created = await createPlayer({
          nickname: payload.nickname,
          className: payload.className,
          role: payload.role,
          power: payload.power,
          note: payload.note,
        });
        createdMembers.push(created);
      }

      setMembers((current) => [...createdMembers, ...current]);
      setFeedback({ type: "success", message: `Đã nhập ${createdMembers.length} thành viên từ ${file.name}.` });
      toast({ title: "Import thành công", description: `Đã thêm ${createdMembers.length} thành viên.`, variant: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể nhập dữ liệu.";
      setFeedback({ type: "error", message });
      toast({ title: "Import thất bại", description: message, variant: "error" });
    } finally {
      setIsSubmitting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleExportMembers = () => {
    const exportRows = members.map((member) => ({
      nickname: member.nickname,
      className: member.className,
      role: member.role,
      power: member.power,
      note: member.note,
    }));

    const worksheet = utils.json_to_sheet(exportRows);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Members");
    writeFile(workbook, "members-export.xlsx");
    setFeedback({ type: "success", message: "Đã xuất danh sách thành viên sang Excel." });
    toast({ title: "Xuất file thành công", description: "Danh sách thành viên đã được tải xuống Excel.", variant: "success" });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!form.nickname.trim()) {
      setFeedback({ type: "error", message: "Nickname không được để trống." });
      setIsSubmitting(false);
      toast({ title: "Thiếu thông tin", description: "Nickname không được để trống.", variant: "error" });
      return;
    }

    const normalizedNickname = normalizeNickname(form.nickname);
    const duplicateMember = members.find(
      (member) => normalizeNickname(member.nickname) === normalizedNickname && member.id !== editingMemberId
    );

    if (duplicateMember) {
      setFeedback({ type: "error", message: `Nickname "${form.nickname.trim()}" đã tồn tại.` });
      setIsSubmitting(false);
      toast({ title: "Nickname trùng", description: `Tên "${form.nickname.trim()}" đã tồn tại.`, variant: "error" });
      return;
    }

    try {
      if (editingMemberId) {
        const updated = await updatePlayer(editingMemberId, {
          nickname: form.nickname.trim(),
          className: form.className,
          role: form.role,
          power: form.power,
          note: form.note.trim(),
        });
        setMembers((current) => current.map((member) => (member.id === updated.id ? updated : member)));
        setFeedback({ type: "success", message: "Cập nhật thành viên thành công." });
        toast({ title: "Cập nhật thành công", description: "Thông tin thành viên đã được lưu.", variant: "success" });
      } else {
        const created = await createPlayer({
          nickname: form.nickname.trim(),
          className: form.className,
          role: form.role,
          power: form.power,
          note: form.note.trim(),
        });
        setMembers((current) => [created, ...current]);
        setFeedback({ type: "success", message: "Tạo thành viên thành công." });
        toast({ title: "Tạo thành viên thành công", description: "Thành viên mới đã được thêm vào hệ thống.", variant: "success" });
      }

      closeModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể lưu thành viên.";
      setFeedback({ type: "error", message });
      toast({ title: "Lỗi", description: message, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (memberId: string) => {
    const confirmed = await confirm({
      title: "Xóa thành viên",
      description: "Bạn có chắc muốn xóa thành viên này khỏi danh sách?",
      confirmText: "Xóa",
      cancelText: "Hủy",
      confirmVariant: "destructive",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deletePlayer(memberId);
      setMembers((current) => current.filter((member) => member.id !== memberId));
      toast({ title: "Xóa thành công", description: "Thành viên đã được xóa khỏi danh sách.", variant: "success" });
    } catch {
      toast({ title: "Xóa thất bại", description: "Không thể xóa thành viên lúc này.", variant: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-[0_0_80px_rgba(0,0,0,0.25)] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-amber-200/70">
            Quản lý thành viên
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            Danh sách nhân vật trong covenant
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Dữ liệu được lưu trực tiếp trên Supabase.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleImportMembers}
          />
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="mr-2 h-4 w-4" />
            Import Excel
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={handleExportMembers}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button
            type="button"
            onClick={openCreateModal}
            className="rounded-full bg-amber-500 px-5 text-slate-950 hover:bg-amber-400"
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm thành viên
          </Button>
        </div>
      </div>

      {feedback ? (
        <div className={`rounded-[1.5rem] border px-4 py-3 text-sm backdrop-blur ${feedback.type === "error" ? "border-red-500/20 bg-red-500/10 text-red-200" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"}`}>
          {feedback.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between">
        <label className="flex flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400">
          <Search className="h-4 w-4" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm nickname, lớp, vai trò..."
            className="w-full bg-transparent outline-none placeholder:text-slate-500"
          />
        </label>

        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="text-sm text-slate-400">
            <span className="mb-1 block">Sắp xếp theo</span>
            <select
              value={sortField}
              onChange={(event) => setSortField(event.target.value as keyof Member)}
              className="rounded-full border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="nickname">Nickname</option>
              <option value="className">Class</option>
              <option value="role">Role</option>
              <option value="power">Power</option>
            </select>
          </label>

          <label className="text-sm text-slate-400">
            <span className="mb-1 block">Thứ tự</span>
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as "asc" | "desc")}
              className="rounded-full border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <div className="h-10 w-10 rounded-2xl bg-white/10" />
              <div className="mt-4 h-4 w-32 rounded-full bg-white/10" />
              <div className="mt-3 h-3 w-24 rounded-full bg-white/10" />
              <div className="mt-6 h-16 rounded-2xl bg-white/10" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredMembers.map((member) => (
            <article
              key={member.id}
              className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-[0_0_30px_rgba(0,0,0,0.15)] transition duration-200 hover:-translate-y-1 hover:border-amber-400/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-200">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      {member.nickname}
                    </h4>
                    <p className="text-sm text-slate-400">{member.className}</p>
                  </div>
                </div>

                <div className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-sm text-amber-200">
                  Power {member.power}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Role
                  </p>
                  <span className={`mt-1 inline-block px-2.5 py-0.5 text-sm font-medium ${getRoleBadgeClasses(member.role)}`}>
                    {member.role}
                  </span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Ghi chú
                  </p>
                  <p className="mt-1 text-sm text-slate-300">{member.note}</p>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => openEditModal(member)}
                >
                  <PencilLine className="mr-2 h-4 w-4" />
                  Sửa
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-rose-400/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                  onClick={() => handleDelete(member.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!isLoading && filteredMembers.length === 0 && (
        <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/5 p-8 text-center text-slate-400">
          Không tìm thấy thành viên phù hợp.
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl animate-fade-in-up rounded-[2rem] border border-white/10 bg-slate-950 p-6 shadow-[0_0_100px_rgba(0,0,0,0.4)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-amber-200/70">
                  {editingMemberId ? "Cập nhật" : "Thêm mới"}
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-white">
                  {editingMemberId ? "Sửa thông tin thành viên" : "Tạo thành viên mới"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-slate-300">
                  <span className="mb-2 block">Nickname</span>
                  <input
                    required
                    value={form.nickname}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, nickname: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
                    placeholder="Ví dụ: Thiên Lưu"
                  />
                </label>

                <label className="text-sm text-slate-300">
                  <span className="mb-2 block">Class</span>
                  <select
                    value={form.className}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, className: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-gray-700 bg-black px-3 py-2 text-white outline-none"
                  >
                    {playerClasses.map((className) => (
                      <option key={className} value={className}>
                        {className}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="text-sm text-slate-300">
                  <span className="mb-2 block">Vai trò</span>
                  <div className="flex flex-wrap gap-2">
                    {roleOptions.map((roleOption) => {
                      const isActive = form.role === roleOption;
                      const roleStyles = getRoleBadgeClasses(roleOption);
                      return (
                        <button
                          key={roleOption}
                          type="button"
                          onClick={() =>
                            setForm((current) => ({ ...current, role: roleOption }))
                          }
                          className={`rounded-full border px-3 py-2 text-sm transition ${
                            isActive
                              ? `${roleStyles} ring-2 ring-amber-400/40`
                              : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          {roleOption === "Member" ? "Member" : `👑 ${roleOption}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="text-sm text-slate-300">
                  <span className="mb-2 block">Power</span>
                  <input
                    type="number"
                    value={form.power}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        power: Number(event.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
                    placeholder="Ví dụ: 9200"
                  />
                </label>
              </div>

              <label className="block text-sm text-slate-300">
                <span className="mb-2 block">Ghi chú</span>
                <textarea
                  value={form.note}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, note: event.target.value }))
                  }
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
                  placeholder="Ghi chú về vai trò hoặc tình trạng hiện tại"
                />
              </label>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                  onClick={closeModal}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-amber-500 px-5 text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (editingMemberId ? "Đang lưu..." : "Đang tạo...") : editingMemberId ? "Lưu thay đổi" : "Tạo thành viên"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
