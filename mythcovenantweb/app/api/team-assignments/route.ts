import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const latest = url.searchParams.get("latest") === "true";

  if (latest) {
    const { data, error } = await supabaseServer
      .from("team_assignments")
      .select("id, name, assignments, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0] ?? null);
  }

  const { data, error } = await supabaseServer
    .from("team_assignments")
    .select("id, name, assignments, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name || "Untitled").trim();
  const assignments = body.assignments;

  if (!name || !assignments || typeof assignments !== "object") {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (body.assignmentId) {
    const { assignmentId } = body;
    const { data, error } = await supabaseServer
      .from("team_assignments")
      .update({ name, assignments })
      .eq("id", assignmentId)
      .select("id, name, assignments, created_at, updated_at");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0] ?? null);
  }

  const { data, error } = await supabaseServer
    .from("team_assignments")
    .insert([{ name, assignments }])
    .select("id, name, assignments, created_at, updated_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data?.[0] ?? null);
}
