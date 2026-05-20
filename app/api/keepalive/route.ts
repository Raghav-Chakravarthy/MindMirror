import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const url = process.env.TRIBE_SERVICE_URL;
    if (!url) return NextResponse.json({ skipped: true });

    const res = await fetch(`${url}/health`, {
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json();
    return NextResponse.json({ ok: true, space: data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) });
  }
}
