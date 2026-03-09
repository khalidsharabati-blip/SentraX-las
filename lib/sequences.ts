import { prisma } from "./prisma";
import { DOC_PREFIXES } from "./constants";

export async function getNextNumber(
  docType: keyof typeof DOC_PREFIXES
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = DOC_PREFIXES[docType];

  const result = await prisma.$transaction(async (tx) => {
    const seq = await tx.documentSequence.upsert({
      where: { docType_year: { docType, year } },
      update: { lastNumber: { increment: 1 } },
      create: { docType, prefix, year, lastNumber: 1 },
    });
    return seq.lastNumber;
  });

  return `${prefix}-${year}-${String(result).padStart(4, "0")}`;
}
