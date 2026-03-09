import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const uploadDir = path.join(process.cwd(), "public", "plans");

function ensureDir() {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    ensureDir();

    const formData = await req.formData();
    const file = formData.get("file");
    const planType = (formData.get("planType") as string) || "MIXED";
    const projectId = formData.get("projectId")
      ? parseInt(formData.get("projectId") as string)
      : null;

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "لم يتم إرسال ملف" },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name).toLowerCase();
    const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];
    if (!allowed.includes(ext)) {
      return NextResponse.json(
        { success: false, message: "مسموح فقط PDF و صور (PNG, JPG, WEBP)" },
        { status: 400 }
      );
    }

    if (file.size > 200 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "الحد الأقصى 200MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const finalName = `${Date.now()}-${safeName}`;
    const finalPath = path.join(uploadDir, finalName);

    fs.writeFileSync(finalPath, buffer);

    const plan = await prisma.plan.create({
      data: {
        fileName: file.name,
        filePath: `/plans/${finalName}`,
        fileType: ext.replace(".", ""),
        planType: planType as "CCTV" | "FIRE_ALARM" | "INTRUSION" | "NETWORK" | "MIXED",
        projectId,
        pageCount: 1,
      },
    });

    return NextResponse.json({
      success: true,
      plan: {
        id: plan.id,
        fileName: plan.fileName,
        filePath: plan.filePath,
        planType: plan.planType,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "فشل رفع المخطط";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
