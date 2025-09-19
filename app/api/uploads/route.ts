export const runtime = "nodejs";

import { createHash } from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary environment variables are missing." }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "File payload is required." }, { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signatureBase = `timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(signatureBase).digest("hex");

  const uploadForm = new FormData();
  uploadForm.append("file", file);
  uploadForm.append("api_key", apiKey);
  uploadForm.append("timestamp", String(timestamp));
  uploadForm.append("signature", signature);

  const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: uploadForm
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    return NextResponse.json({ error: "Cloudinary upload failed", detail: errorText }, { status: 502 });
  }

  const data = await uploadResponse.json();

  return NextResponse.json({
    url: data.secure_url ?? data.url,
    publicId: data.public_id,
    bytes: data.bytes,
    format: data.format,
    resourceType: data.resource_type,
    originalFilename: data.original_filename ?? "uploaded-file"
  });
}
