import { supabase } from "./supabase";
import type { TeamAssignment, TeamAssignmentPayload } from "@/types/team-assignment";
import type { TeamKey } from "@/types/member";

type TeamAssignmentRow = {
  id: string;
  name: string;
  assignments: Record<TeamKey, string[]>;
  created_at: string | null;
  updated_at: string | null;
};

function mapToTeamAssignment(item: TeamAssignmentRow): TeamAssignment {
  return {
    id: item.id,
    name: item.name,
    assignments: item.assignments,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

export async function getTeamAssignments(): Promise<TeamAssignment[]> {
  const { data, error } = await supabase
    .from("team_assignments")
    .select("id, name, assignments, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapToTeamAssignment);
}

export async function getTeamAssignmentById(id: string): Promise<TeamAssignment | null> {
  const { data, error } = await supabase
    .from("team_assignments")
    .select("id, name, assignments, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapToTeamAssignment(data) : null;
}

export async function createTeamAssignment(
  payload: TeamAssignmentPayload
): Promise<TeamAssignment> {
  const { data, error } = await supabase
    .from("team_assignments")
    .insert([
      {
        name: payload.name,
        assignments: payload.assignments,
      },
    ])
    .select("id, name, assignments, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to create team assignment");
  }

  return mapToTeamAssignment(data);
}

export async function updateTeamAssignment(
  id: string,
  payload: TeamAssignmentPayload
): Promise<TeamAssignment> {
  const { data, error } = await supabase
    .from("team_assignments")
    .update({
      name: payload.name,
      assignments: payload.assignments,
    })
    .eq("id", id)
    .select("id, name, assignments, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to update team assignment");
  }

  return mapToTeamAssignment(data);
}

export async function deleteTeamAssignment(id: string): Promise<void> {
  const { error } = await supabase.from("team_assignments").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}