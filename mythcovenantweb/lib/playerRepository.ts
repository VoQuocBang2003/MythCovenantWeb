import { supabase } from "./supabase";
import type { Member } from "@/types/member";

type PlayerRow = {
  id: string;
  nickname: string;
  class: string | null;
  role: string | null;
  power: number;
  note: string | null;
  created_at: string | null;
};

type CreatePlayerInput = {
  nickname: string;
  className: string;
  role: string;
  power: number;
  note: string;
};

type UpdatePlayerInput = {
  nickname: string;
  className: string;
  role: string;
  power: number;
  note: string;
};

function mapToMember(item: PlayerRow): Member {
  return {
    id: item.id,
    nickname: item.nickname,
    className: item.class ?? "",
    role: item.role ?? "Member",
    power: item.power ?? 0,
    note: item.note ?? "",
    created_at: item.created_at,
  };
}

export async function getPlayers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from("players")
    .select("id, nickname, class, role, power, note, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapToMember);
}

export async function createPlayer(input: CreatePlayerInput): Promise<Member> {
  const { data, error } = await supabase
    .from("players")
    .insert([
      {
        nickname: input.nickname,
        class: input.className,
        role: input.role,
        power: input.power,
        note: input.note,
      },
    ])
    .select("id, nickname, class, role, power, note, created_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to create player");
  }

  return mapToMember(data);
}

export async function updatePlayer(
  id: string,
  input: UpdatePlayerInput
): Promise<Member> {
  const { data, error } = await supabase
    .from("players")
    .update({
      nickname: input.nickname,
      class: input.className,
      role: input.role,
      power: input.power,
      note: input.note,
    })
    .eq("id", id)
    .select("id, nickname, class, role, power, note, created_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to update player");
  }

  return mapToMember(data);
}

export async function deletePlayer(id: string): Promise<void> {
  const { error } = await supabase.from("players").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function searchPlayers(searchTerm: string): Promise<Member[]> {
  const normalized = searchTerm.toLowerCase().trim();

  const { data, error } = await supabase
    .from("players")
    .select("id, nickname, class, role, power, note, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .filter((item: PlayerRow) => {
      return [
        item.nickname,
        item.class,
        item.role,
        item.note,
        item.power,
      ].some((value) => String(value ?? "").toLowerCase().includes(normalized));
    })
    .map(mapToMember);
}