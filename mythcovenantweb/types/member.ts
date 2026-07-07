export type TeamKey =
  | "unassigned"
  | "team-1"
  | "team-2"
  | "team-3"
  | "team-4"
  | "team-5"
  | "bench";

export type Member = {
  id: string;
  nickname: string;
  className: string;
  role: string;
  power: number;
  note: string;
  created_at?: string | null;
};
