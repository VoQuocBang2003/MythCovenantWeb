import type { TeamKey } from "@/types/member";

export type TeamAssignment = {
  id: string;
  name: string;
  assignments: Record<TeamKey, string[]>;
  created_at: string | null;
  updated_at: string | null;
};

export type TeamAssignmentPayload = {
  assignmentId?: string;
  name: string;
  assignments: Record<TeamKey, string[]>;
};
