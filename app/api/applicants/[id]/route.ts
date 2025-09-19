import { NextResponse } from "next/server";
import { removeApplicant } from "@/lib/mockDb";

interface Params {
  params: { id: string };
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!params?.id) {
    return NextResponse.json({ message: "Missing id" }, { status: 400 });
  }

  const success = await removeApplicant(params.id);
  if (!success) {
    return NextResponse.json({ message: "Applicant not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
