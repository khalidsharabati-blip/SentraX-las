"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ========================
// SCHEMAS
// ========================

const createItemSchema = z.object({
  itemCode: z.string().min(1),
  nameAr: z.string().min(1),
  nameHe: z.string().optional().default(""),
  nameEn: z.string().optional().default(""),
  categoryId: z.coerce.number().optional().nullable(),
  brandId: z.coerce.number().optional().nullable(),
  unit: z.string().optional().default("unit"),
  itemType: z.string().optional().default("equipment"),
  purchasePrice: z.coerce.number().optional().default(0),
  sellPrice: z.coerce.number().optional().default(0),
  minStockAlert: z.coerce.number().int().optional().default(0),
  warrantyMonths: z.coerce.number().int().optional().default(0),
  description: z.string().optional().default(""),
  isActive: z.boolean().optional().default(true),
});

const updateItemSchema = createItemSchema.extend({
  id: z.coerce.number(),
});

const stockInSchema = z.object({
  itemId: z.coerce.number(),
  warehouseId: z.coerce.number(),
  qty: z.coerce.number().positive(),
  unitCost: z.coerce.number().optional().default(0),
  reference: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  serialNumbers: z.string().optional().default(""),
});

const stockOutSchema = z.object({
  itemId: z.coerce.number(),
  warehouseId: z.coerce.number(),
  projectId: z.coerce.number().optional().nullable(),
  qty: z.coerce.number().positive(),
  reference: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

const createSupplierSchema = z.object({
  name: z.string().min(1),
  contact: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  email: z.string().optional().default(""),
  vat: z.string().optional().default(""),
  address: z.string().optional().default(""),
});

// ========================
// ACTIONS
// ========================

export async function createItem(_prev: unknown, formData: FormData) {
  try {
    const raw = Object.fromEntries(formData.entries());
    raw.isActive = (formData.get("isActive") === "on" || formData.get("isActive") === "true") as unknown as string;
    raw.categoryId = raw.categoryId || (null as unknown as string);
    raw.brandId = raw.brandId || (null as unknown as string);

    const data = createItemSchema.parse(raw);

    await prisma.item.create({
      data: {
        itemCode: data.itemCode,
        nameAr: data.nameAr,
        nameHe: data.nameHe,
        nameEn: data.nameEn,
        categoryId: data.categoryId || null,
        brandId: data.brandId || null,
        unit: data.unit,
        itemType: data.itemType,
        purchasePrice: data.purchasePrice,
        sellPrice: data.sellPrice,
        minStockAlert: data.minStockAlert,
        warrantyMonths: data.warrantyMonths,
        description: data.description,
        isActive: data.isActive,
      },
    });

    revalidatePath("/inventory");
    return { success: true, error: null };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to create item";
    return { success: false, error: message };
  }
}

export async function updateItem(_prev: unknown, formData: FormData) {
  try {
    const raw = Object.fromEntries(formData.entries());
    raw.isActive = (formData.get("isActive") === "on" || formData.get("isActive") === "true") as unknown as string;
    raw.categoryId = raw.categoryId || (null as unknown as string);
    raw.brandId = raw.brandId || (null as unknown as string);

    const data = updateItemSchema.parse(raw);

    await prisma.item.update({
      where: { id: data.id },
      data: {
        itemCode: data.itemCode,
        nameAr: data.nameAr,
        nameHe: data.nameHe,
        nameEn: data.nameEn,
        categoryId: data.categoryId || null,
        brandId: data.brandId || null,
        unit: data.unit,
        itemType: data.itemType,
        purchasePrice: data.purchasePrice,
        sellPrice: data.sellPrice,
        minStockAlert: data.minStockAlert,
        warrantyMonths: data.warrantyMonths,
        description: data.description,
        isActive: data.isActive,
      },
    });

    revalidatePath("/inventory");
    return { success: true, error: null };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to update item";
    return { success: false, error: message };
  }
}

export async function stockIn(_prev: unknown, formData: FormData) {
  try {
    const raw = Object.fromEntries(formData.entries());
    const data = stockInSchema.parse(raw);

    await prisma.$transaction(async (tx) => {
      // 1. Create StockMovement with type IN
      await tx.stockMovement.create({
        data: {
          itemId: data.itemId,
          warehouseId: data.warehouseId,
          movementType: "IN",
          qty: data.qty,
          unitCost: data.unitCost,
          reference: data.reference,
          notes: data.notes,
        },
      });

      // 2. Upsert StockBalance - increment qtyAvailable
      await tx.stockBalance.upsert({
        where: {
          itemId_warehouseId: {
            itemId: data.itemId,
            warehouseId: data.warehouseId,
          },
        },
        update: {
          qtyAvailable: { increment: data.qty },
        },
        create: {
          itemId: data.itemId,
          warehouseId: data.warehouseId,
          qtyAvailable: data.qty,
        },
      });

      // 3. Optional serial numbers
      const serials = data.serialNumbers
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      if (serials.length > 0) {
        // Look up item warranty to compute warrantyEndDate
        const item = await tx.item.findUnique({
          where: { id: data.itemId },
          select: { warrantyMonths: true },
        });
        const warrantyEndDate =
          item && item.warrantyMonths > 0
            ? new Date(
                Date.now() + item.warrantyMonths * 30 * 24 * 60 * 60 * 1000
              )
            : null;

        await tx.serialNumber.createMany({
          data: serials.map((sn) => ({
            itemId: data.itemId,
            serialNumber: sn,
            status: "IN_STOCK" as const,
            warrantyEndDate,
          })),
        });
      }
    });

    revalidatePath("/inventory");
    return { success: true, error: null };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to record stock in";
    return { success: false, error: message };
  }
}

export async function stockOut(_prev: unknown, formData: FormData) {
  try {
    const raw = Object.fromEntries(formData.entries());
    raw.projectId = raw.projectId || (null as unknown as string);
    const data = stockOutSchema.parse(raw);

    await prisma.$transaction(async (tx) => {
      // Verify sufficient stock
      const balance = await tx.stockBalance.findUnique({
        where: {
          itemId_warehouseId: {
            itemId: data.itemId,
            warehouseId: data.warehouseId,
          },
        },
      });

      if (!balance || Number(balance.qtyAvailable) < data.qty) {
        throw new Error("Insufficient stock");
      }

      // 1. Create StockMovement with type OUT
      await tx.stockMovement.create({
        data: {
          itemId: data.itemId,
          warehouseId: data.warehouseId,
          projectId: data.projectId || null,
          movementType: "OUT",
          qty: data.qty,
          reference: data.reference,
          notes: data.notes,
        },
      });

      // 2. Update StockBalance - decrement qtyAvailable
      await tx.stockBalance.update({
        where: {
          itemId_warehouseId: {
            itemId: data.itemId,
            warehouseId: data.warehouseId,
          },
        },
        data: {
          qtyAvailable: { decrement: data.qty },
        },
      });
    });

    revalidatePath("/inventory");
    return { success: true, error: null };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to record stock out";
    return { success: false, error: message };
  }
}

export async function adjustStock(formData: FormData) {
  try {
    const itemId = parseInt(formData.get("itemId") as string);
    const warehouseId = parseInt(formData.get("warehouseId") as string) || 1;
    const newQty = parseFloat(formData.get("newQty") as string);
    const reason = (formData.get("reason") as string) || "";

    if (isNaN(itemId) || isNaN(newQty) || newQty < 0) {
      return { success: false, error: "بيانات غير صالحة" };
    }

    await prisma.$transaction(async (tx) => {
      const balance = await tx.stockBalance.findUnique({
        where: { itemId_warehouseId: { itemId, warehouseId } },
      });

      const currentQty = balance ? Number(balance.qtyAvailable) : 0;
      const diff = newQty - currentQty;

      if (diff === 0) return;

      await tx.stockMovement.create({
        data: {
          itemId,
          warehouseId,
          movementType: diff > 0 ? "IN" : "OUT",
          qty: Math.abs(diff),
          unitCost: 0,
          reference: "MANUAL_ADJUST",
          notes: reason || `تعديل يدوي: ${currentQty} → ${newQty}`,
        },
      });

      await tx.stockBalance.upsert({
        where: { itemId_warehouseId: { itemId, warehouseId } },
        update: { qtyAvailable: newQty },
        create: { itemId, warehouseId, qtyAvailable: newQty },
      });
    });

    revalidatePath("/inventory");
    return { success: true, error: null };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "فشل تعديل الكمية";
    return { success: false, error: message };
  }
}

export async function createSupplier(_prev: unknown, formData: FormData) {
  try {
    const raw = Object.fromEntries(formData.entries());
    const data = createSupplierSchema.parse(raw);

    await prisma.supplier.create({ data });

    revalidatePath("/inventory");
    return { success: true, error: null };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to create supplier";
    return { success: false, error: message };
  }
}
