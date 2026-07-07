import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("players")
    .select("id, nickname, class_name, role, power, note, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    data.map((item) => ({
      id: item.id,
      nickname: item.nickname,
      className: item.class_name,
      role: item.role,
      power: item.power,
      note: item.note,
      created_at: item.created_at,
    }))
  );
}

export async function POST(request: Request) {
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
    .insert([
      {
        nickname,
        class_name: className,
        role,
        power,
        note,
      },
    ])
    .select("id, nickname, class_name, role, power, note, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Unable to create player." }, { status: 500 });
  }

  const created = data;
  return NextResponse.json({
    id: created.id,
    nickname: created.nickname,
    className: created.class_name,
    role: created.role,
    power: created.power,
    note: created.note,
    created_at: created.created_at,
  });
}
