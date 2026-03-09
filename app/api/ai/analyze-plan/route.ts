import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ollamaVisionChat, ollamaChat } from "@/lib/ollama";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 300;

const SYSTEM_PROMPT = `You are an expert engineering plan analyzer specializing in security and safety systems (CCTV, Fire Alarm, Intrusion, Network).
You can read plans in Arabic (العربية), Hebrew (עברית), and English.

Your tasks:
1. Read the Legend/Key and identify every symbol and its meaning
2. Count all devices/elements in the plan
3. Analyze distribution and identify rooms/zones
4. Detect gaps and coverage issues
5. Provide improvement suggestions
6. Prepare a Bill of Quantities (BOQ)

Respond ONLY in valid JSON with this structure:
{
  "planType": "CCTV|FIRE_ALARM|INTRUSION|NETWORK|MIXED",
  "legend": [
    {"symbolName": "Symbol name in English", "label": "Description", "category": "Category", "count": number}
  ],
  "quantities": [
    {"item": "Device name", "itemEn": "English name", "count": number, "unit": "Unit", "notes": "Notes"}
  ],
  "rooms": [
    {"name": "Room/Zone name", "devices": ["device1", "device2"]}
  ],
  "summary": "Executive summary",
  "issues": ["Issue 1", "Issue 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "coverage": {
    "score": 0-100,
    "notes": "Coverage notes"
  }
}

Be precise in counting. If you cannot identify a symbol, mark it as "unknown" with description.
Read all text in the plan regardless of language (Arabic/Hebrew/English).
Respond with JSON ONLY, no extra text.`;

const VISION_MODELS = [
  "qwen3-vl:235b-cloud",
  "llava:latest",
  "llava:7b",
  "llava:13b",
  "llava:34b",
  "bakllava:latest",
  "moondream:latest",
];

const TEXT_MODELS = [
  "qwen3-vl:235b-cloud",
  "gemma3:27b",
  "gpt-oss:120b",
  "gpt-oss:20b",
  "minimax-m2:cloud",
  "glm-4.6:cloud",
];

async function analyzeWithOllama(
  model: string,
  userPrompt: string,
  base64Image: string,
  isVision: boolean
): Promise<string> {
  if (isVision) {
    return ollamaVisionChat({
      model,
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      imageBase64: base64Image,
      timeout: 300000,
    });
  }

  return ollamaChat({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `${userPrompt}\n\n[تم إرفاق صورة مخطط هندسي بصيغة base64 بحجم ${Math.round(base64Image.length / 1024)}KB]`,
        images: [base64Image],
      },
    ],
    timeout: 300000,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { planId, mode, engine, model, locale } = await req.json();

    if (!planId) {
      return NextResponse.json(
        { success: false, message: "planId مطلوب" },
        { status: 400 }
      );
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json(
        { success: false, message: "المخطط غير موجود" },
        { status: 404 }
      );
    }

    const filePath = path.join(process.cwd(), "public", plan.filePath);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: "ملف المخطط غير موجود على السيرفر" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(plan.fileName).toLowerCase();

    let imageBase64: string;

    if (ext === ".pdf") {
      try {
        const mupdf = await import("mupdf");
        const doc = mupdf.Document.openDocument(fileBuffer, "application/pdf");
        const pageCount = doc.countPages();
        const page = doc.loadPage(0);
        const bounds = page.getBounds();
        const w = bounds[2] - bounds[0];
        const h = bounds[3] - bounds[1];
        const scale = Math.min(2048 / w, 2048 / h, 2.0);
        const matrix = mupdf.Matrix.scale(scale, scale);
        const pixmap = page.toPixmap(matrix, mupdf.ColorSpace.DeviceRGB, false, true);
        const pngData = pixmap.asPNG();

        const resized = await sharp(Buffer.from(pngData))
          .resize(1536, 1536, { fit: "inside" })
          .png({ quality: 80 })
          .toBuffer();
        imageBase64 = resized.toString("base64");
      } catch (pdfErr: any) {
        return NextResponse.json(
          { success: false, message: `فشل تحويل PDF: ${pdfErr.message}` },
          { status: 400 }
        );
      }
    } else {
      const resized = await sharp(fileBuffer)
        .resize(1536, 1536, { fit: "inside" })
        .png({ quality: 80 })
        .toBuffer();
      imageBase64 = resized.toString("base64");
    }

    let userPrompt = "حلل هذا المخطط الهندسي بالكامل.";
    if (mode === "legend") {
      userPrompt = "ركز فقط على قراءة مفتاح الخريطة (Legend) واستخراج جميع الرموز ومعانيها.";
    } else if (mode === "count") {
      userPrompt = "عدّ جميع الأجهزة والعناصر في المخطط مع ذكر أماكنها.";
    } else if (mode === "coverage") {
      userPrompt = "حلل التغطية واكتشف النواقص والمناطق غير المغطاة.";
    }
    userPrompt += ` نوع المخطط المتوقع: ${plan.planType}`;

    const langMap: Record<string, string> = {
      ar: "أجب بالعربية.",
      he: "ענה בעברית.",
      en: "Answer in English.",
    };
    userPrompt += ` ${langMap[locale] || langMap.ar}`;

    let raw: string;

    const selectedModel = model || "llava:7b";
    const isVision = VISION_MODELS.some((v) => selectedModel.includes(v.split(":")[0]));
    raw = await analyzeWithOllama(selectedModel, userPrompt, imageBase64, isVision || true);

    let analysis;
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
    } catch {
      analysis = {
        summary: raw,
        quantities: [],
        legend: [],
        rooms: [],
        issues: [],
        recommendations: [],
        coverage: { score: 0, notes: "لم يتم التحليل بشكل منظم" },
      };
    }

    const report = await prisma.planAnalysisReport.create({
      data: {
        planId: plan.id,
        summary: analysis.summary || "",
        recommendations: JSON.stringify(analysis.recommendations || []),
        quantitiesJson: analysis.quantities || [],
        issuesJson: {
          issues: analysis.issues || [],
          legend: analysis.legend || [],
          rooms: analysis.rooms || [],
          coverage: analysis.coverage || {},
          planType: analysis.planType || plan.planType,
          engine: engine || "openai",
          model: model || "gpt-4o",
        },
      },
    });

    if (analysis.legend && analysis.legend.length > 0) {
      await prisma.planLegend.createMany({
        data: analysis.legend.map(
          (l: { symbolName: string; label: string; category: string }) => ({
            planId: plan.id,
            symbolName: l.symbolName || "",
            symbolLabel: l.label || "",
            symbolCategory: l.category || "",
            confidence: 0.8,
          })
        ),
      });
    }

    return NextResponse.json({
      success: true,
      reportId: report.id,
      analysis,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "فشل التحليل";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
