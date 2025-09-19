import { NextResponse } from "next/server";
import { generateWhatIfPrediction } from "@/lib/mockDb";

export async function POST(request: Request) {
  const payload = await request.json();
  if (!payload?.region || !payload?.orderVolume || !payload?.submitsPerWeek) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }
  const result = await generateWhatIfPrediction(payload);
  return NextResponse.json(result);
}
