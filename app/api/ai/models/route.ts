import { NextResponse } from "next/server";
import { listOllamaModels } from "@/lib/ollama";

export const runtime = "nodejs";

export async function GET() {
  const models = await listOllamaModels();
  return NextResponse.json({ models });
}
