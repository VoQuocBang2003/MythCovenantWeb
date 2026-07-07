// Role color definitions for quick visual identification
export type RoleType = "Tank" | "DPS" | "Healer" | "Support" | "Member" | "Leader" | "Commander";

export const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  // Main roles with distinct colors
  Tank: {
    bg: "bg-red-500/15",
    text: "text-red-300",
    border: "border-red-400/20",
  },
  DPS: {
    bg: "bg-amber-500/15",
    text: "text-amber-300",
    border: "border-amber-400/20",
  },
  Healer: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-300",
    border: "border-emerald-400/20",
  },
  Support: {
    bg: "bg-blue-500/15",
    text: "text-blue-300",
    border: "border-blue-400/20",
  },
  // Default roles
  Member: {
    bg: "bg-slate-500/15",
    text: "text-slate-300",
    border: "border-slate-400/20",
  },
  Leader: {
    bg: "bg-purple-500/15",
    text: "text-purple-300",
    border: "border-purple-400/20",
  },
  Commander: {
    bg: "bg-indigo-500/15",
    text: "text-indigo-300",
    border: "border-indigo-400/20",
  },
};

// Get role color styles
export const getRoleColorStyles = (role: string) => {
  return roleColors[role] ?? roleColors.Member;
};

// Get role badge classes
export const getRoleBadgeClasses = (role: string) => {
  const colors = getRoleColorStyles(role);
  return `rounded-full border ${colors.border} ${colors.bg} ${colors.text}`;
};