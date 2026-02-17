import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    console.log("API /confirm-day HIT");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { ok: false, error: "Missing SUPABASE_URL or SUPABASE_ANON_KEY" },
      { status: 500 }
    );
  }

  const auth = req.headers.get("authorization");
  if (!auth?.toLowerCase().startsWith("bearer ")) {
    return NextResponse.json(
      { ok: false, error: "Missing Authorization bearer token" },
      { status: 401 }
    );
  }

  const body = await req.text();

  const resp = await fetch(`${supabaseUrl}/functions/v1/confirm-day`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": auth,
      "apikey": supabaseAnonKey,
    },
    body,
  });

  const text = await resp.text();
  return new NextResponse(text, {
    status: resp.status,
    headers: {
      "Content-Type": resp.headers.get("content-type") ?? "application/json",
    },
  });
}
