// Role icon definitions for consistent display across the website
export type RoleType = "Member" | "Leader" | "Tank" | "DPS" | "Healer" | "Flex";

// All available roles
export const allRoles: RoleType[] = ["Member", "Leader", "Tank", "DPS", "Healer", "Flex"];

// Role icons mapping
export const roleIcons: Record<string, string> = {
  Member: "👤",
  Leader: "👑",
  Tank: "🛡",
  DPS: "⚔",
  Healer: "💚",
  Flex: "🔄",
};

// Get role icon by role name
export const getRoleIcon = (role: string): string => {
  return roleIcons[role] ?? "";
};

// Parse role string to array (handles JSON string, single string, or array)
const parseRoleString = (roles: string | string[]): RoleType[] => {
  if (Array.isArray(roles)) {
    return roles.filter((r) => allRoles.includes(r as RoleType)) as RoleType[];
  }
  try {
    const parsed = JSON.parse(roles);
    if (Array.isArray(parsed)) {
      return parsed.filter((r) => allRoles.includes(r as RoleType)) as RoleType[];
    }
    return [roles as RoleType];
  } catch {
    return [roles as RoleType];
  }
};

// Get all role icons for a member (excluding Member)
export const getRoleIcons = (roles: string | string[]): string[] => {
  const roleArray = parseRoleString(roles);
  return roleArray
    .filter((role) => role !== "Member")
    .map((role) => roleIcons[role])
    .filter((icon): icon is string => Boolean(icon));
};

// Check if member has a specific role
export const hasRole = (roles: string | string[], role: RoleType): boolean => {
  const roleArray = parseRoleString(roles);
  return roleArray.includes(role);
};

// Check if member has Leader role
export const isLeader = (roles: string | string[]): boolean => {
  return hasRole(roles, "Leader");
};

// Get all role names for a member (excluding Member)
export const getRoleNames = (roles: string | string[]): RoleType[] => {
  const roleArray = parseRoleString(roles);
  return roleArray.filter((role) => role !== "Member");
};