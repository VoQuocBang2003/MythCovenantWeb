export type TeamKey =
  | "unassigned"
  | "team-1"
  | "team-2"
  | "team-3"
  | "team-4"
  | "team-5"
  | "bench";

export type RoleType = "Member" | "Leader" | "Tank" | "DPS" | "Healer" | "Flex";

export type Member = {
  id: string;
  nickname: string;
  className: string;
  role: string; // JSON string array of roles, e.g., '["Member","Tank"]'
  power: number;
  note: string;
  created_at?: string | null;
};

// Helper to parse roles from string
export const parseRoles = (roleString: string | null): RoleType[] => {
  if (!roleString) return ["Member"];
  try {
    const parsed = JSON.parse(roleString);
    if (Array.isArray(parsed)) {
      return parsed.filter((r): r is RoleType => 
        ["Member", "Leader", "Tank", "DPS", "Healer", "Flex"].includes(r)
      );
    }
    return [roleString as RoleType];
  } catch {
    return [roleString as RoleType];
  }
};

// Helper to stringify roles for storage
export const stringifyRoles = (roles: RoleType[]): string => {
  return JSON.stringify(roles);
};