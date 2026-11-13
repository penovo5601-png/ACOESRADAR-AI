import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { uploads } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const note = String(form.get("note") ?? "");
    if (!(file instanceof File)) return NextResponse.json({ error: "Nenhum ficheiro recebido." }, { status: 400 });
    if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: "Ficheiro demasiado grande (máx. 25 MB)." }, { status: 413 });
    const buf = Buffer.from(await file.arrayBuffer());
    const [row] = await db.insert(uploads).values({
      filename: file.name || "ficheiro.pdf",
      mimeType: file.type || "application/pdf",
      sizeBytes: file.size,
      note: note || null,
      dataBase64: buf.toString("base64"),
    }).returning({ id: uploads.id, filename: uploads.filename, sizeBytes: uploads.sizeBytes, createdAt: uploads.createdAt });
    return NextResponse.json({ success: true, upload: row });
  } catch (e: any) {
    return NextResponse.json({ error: "Falha ao guardar o ficheiro.", details: e?.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    const list = await db.select({ id: uploads.id, filename: uploads.filename, mimeType: uploads.mimeType, sizeBytes: uploads.sizeBytes, note: uploads.note, createdAt: uploads.createdAt }).from(uploads).orderBy(desc(uploads.createdAt)).limit(50);
    return NextResponse.json({ uploads: list });
  }
  const [row] = await db.select().from(uploads).where(eq(uploads.id, Number(id)));
  if (!row) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  const buf = Buffer.from(row.dataBase64, "base64");
  return new NextResponse(buf, { headers: { "Content-Type": row.mimeType, "Content-Disposition": `inline; filename="${encodeURIComponent(row.filename)}"`, "Content-Length": String(buf.length) } });
}
