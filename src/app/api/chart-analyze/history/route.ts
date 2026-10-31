import { NextResponse } from "next/server";
import { db } from "@/db";
import { chartAnalyses } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select()
      .from(chartAnalyses)
      .orderBy(desc(chartAnalyses.createdAt))
      .limit(30);

    return NextResponse.json({ history: list });
  } catch (error: any) {
    console.error("History fetch error:", error);
    return NextResponse.json({ history: [] });
  }
}
