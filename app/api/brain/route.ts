import { NextRequest, NextResponse } from "next/server";

const TRIBE_URL = process.env.TRIBE_SERVICE_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const { text } = (await req.json()) as { text: string };

    const res = await fetch(`${TRIBE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(55_000),
    });

    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json(
        { error: `TRIBE v2 error: ${body}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { activation: null, top_regions: [], cached: false },
      { status: 200 }
    );
  }
}
