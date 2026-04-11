import { NextRequest, NextResponse } from "next/server";

const TRIBE_URL = process.env.TRIBE_SERVICE_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const { texts } = (await req.json()) as { texts: string[] };

    const res = await fetch(`${TRIBE_URL}/warmup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts }),
      signal: AbortSignal.timeout(5_000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "warmup failed" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: "sidecar unavailable" }, { status: 200 });
  }
}
