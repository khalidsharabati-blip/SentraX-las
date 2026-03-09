"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CsvRow {
  sku: string;
  name: string;
  nameAr: string;
  nameEn: string;
  brand: string;
  model: string;
  purchasePrice: string;
  sellingPrice: string;
  quantity: string;
  minQuantity: string;
  unit: string;
  supplier: string;
  location: string;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(content: string): CsvRow[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headerLine = lines[0].replace(/^\uFEFF/, "");
  const headers = parseCsvLine(headerLine);

  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length < 2) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });
    rows.push(row as unknown as CsvRow);
  }
  return rows;
}

export async function importInventoryCsv(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { success: false, message: "لم يتم إرسال ملف", imported: 0, errors: 0 };

  const content = await file.text();
  const rows = parseCsv(content);

  if (rows.length === 0) {
    return { success: false, message: "الملف فارغ أو غير صالح", imported: 0, errors: 0 };
  }

  let imported = 0;
  let skipped = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  const defaultWarehouse = await prisma.warehouse.findFirst();
  const warehouseId = defaultWarehouse?.id || 1;

  const brandCache = new Map<string, number>();
  const supplierCache = new Map<string, number>();

  for (const row of rows) {
    try {
      if (!row.sku || !row.sku.trim()) {
        skipped++;
        continue;
      }

      const existing = await prisma.item.findUnique({
        where: { itemCode: row.sku.trim() },
      });

      if (existing) {
        skipped++;
        continue;
      }

      let brandId: number | null = null;
      if (row.brand && row.brand.trim()) {
        const brandName = row.brand.trim();
        if (brandCache.has(brandName)) {
          brandId = brandCache.get(brandName)!;
        } else {
          const brand = await prisma.itemBrand.upsert({
            where: { id: -1 },
            update: {},
            create: { name: brandName },
          }).catch(async () => {
            const found = await prisma.itemBrand.findFirst({ where: { name: brandName } });
            if (found) return found;
            return prisma.itemBrand.create({ data: { name: brandName } });
          });
          brandId = brand.id;
          brandCache.set(brandName, brandId);
        }
      }

      if (row.supplier && row.supplier.trim()) {
        const supplierName = row.supplier.trim();
        if (!supplierCache.has(supplierName)) {
          const sup = await prisma.supplier.findFirst({ where: { name: supplierName } });
          if (!sup) {
            const created = await prisma.supplier.create({ data: { name: supplierName } });
            supplierCache.set(supplierName, created.id);
          } else {
            supplierCache.set(supplierName, sup.id);
          }
        }
      }

      const purchasePrice = parseFloat(row.purchasePrice) || 0;
      const sellPrice = parseFloat(row.sellingPrice) || 0;
      const qty = parseInt(row.quantity) || 0;
      const minStock = parseInt(row.minQuantity) || 0;

      const item = await prisma.item.create({
        data: {
          itemCode: row.sku.trim(),
          nameAr: row.nameAr || row.name || row.sku,
          nameHe: row.name || "",
          nameEn: row.nameEn || "",
          brandId,
          unit: row.unit || "unit",
          itemType: "equipment",
          purchasePrice,
          sellPrice,
          minStockAlert: minStock,
          description: row.model ? `Model: ${row.model}` : "",
        },
      });

      if (qty > 0) {
        await prisma.stockBalance.create({
          data: {
            itemId: item.id,
            warehouseId,
            qtyAvailable: qty,
          },
        });

        await prisma.stockMovement.create({
          data: {
            itemId: item.id,
            warehouseId,
            movementType: "IN",
            qty,
            unitCost: purchasePrice,
            reference: "CSV Import",
            notes: "استيراد من ملف CSV",
          },
        });
      }

      imported++;
    } catch (e) {
      errors++;
      const msg = e instanceof Error ? e.message : "unknown error";
      if (errorDetails.length < 10) {
        errorDetails.push(`${row.sku}: ${msg}`);
      }
    }
  }

  revalidatePath("/ar/inventory");
  revalidatePath("/he/inventory");
  revalidatePath("/en/inventory");

  return {
    success: true,
    message: `تم استيراد ${imported} صنف | تخطي ${skipped} موجود | ${errors} خطأ`,
    imported,
    skipped,
    errors,
    errorDetails,
    total: rows.length,
  };
}
