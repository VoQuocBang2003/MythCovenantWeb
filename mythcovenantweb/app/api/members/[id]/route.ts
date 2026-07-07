import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

type PlayerRow = {
  id: string;
  nickname: string;
  class: string | null;
  role: string | null;
  power: number;
  note: string | null;
  created_at: string | null;
};

function mapToMember(item: PlayerRow) {
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const nickname = String(body.nickname || "").trim();
  const className = String(body.className || "").trim();
  const role = String(body.role || "").trim();
  const power = Number(body.power ?? 0);
  const note = String(body.note || "").trim();

  if (!nickname || !className || !role) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("players")
    .update({ nickname, class: className, role, power, note })
    .eq("id", id)
    .select("id, nickname, class, role, power, note, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(mapToMember(data));
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabaseServer.from("players").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}