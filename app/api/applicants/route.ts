import { NextResponse } from "next/server";
import { addApplicant, getApplicantsList } from "@/lib/mockDb";

export async function GET() {
  const data = await getApplicantsList();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const payload = await request.json();
  if (!payload?.name || !payload?.role || !payload?.region) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }
  const applicant = await addApplicant(payload);
  return NextResponse.json(applicant, { status: 201 });
}
