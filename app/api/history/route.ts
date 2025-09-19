import { NextResponse } from "next/server";
import { getHistory, recordQuery } from "@/lib/mockDb";

export async function GET() {
  const entries = await getHistory();
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const payload = await request.json();
  if (!payload?.userId || !payload?.searchQuery || !payload?.intent) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  const entry = await recordQuery({
    userId: payload.userId,
    searchQuery: payload.searchQuery,
    intent: payload.intent,
    entities: payload.entities ?? {}
  });

  return NextResponse.json(entry, { status: 201 });
}
