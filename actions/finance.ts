"use server";

import { prisma } from "@/lib/prisma";
import { calculateVAT } from "@/lib/utils";
import { getNextNumber } from "@/lib/sequences";
import { revalidatePath } from "next/cache";

// ========================
// QUOTES
// ========================

export async function createQuote(formDataOrObj: FormData | {
  customerId: number;
  discount: number;
  validUntil?: string;
  notes?: string;
  items: { itemId?: number; description: string; qty: number; unitPrice: number }[];
}) {
  let data: {
    customerId: number;
    discount: number;
    validUntil?: string;
    notes?: string;
    items: { itemId?: number; description: string; qty: number; unitPrice: number }[];
  };

  if (formDataOrObj instanceof FormData) {
    const fd = formDataOrObj;
    data = {
      customerId: parseInt(fd.get("customerId") as string),
      discount: parseFloat(fd.get("discount") as string) || 0,
      validUntil: (fd.get("validUntil") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
      items: JSON.parse(fd.get("items") as string || "[]"),
    };
  } else {
    data = formDataOrObj;
  }

  try {
  const quoteNumber = await getNextNumber("quote");

  const subtotal = data.items.reduce(
    (sum, item) => sum + item.qty * item.unitPrice,
    0
  );
  const afterDiscount = subtotal - (data.discount || 0);
  const { vatAmount, total } = calculateVAT(afterDiscount);

  const quote = await prisma.quote.create({
    data: {
      quoteNumber,
      customerId: data.customerId,
      subtotal,
      discount: data.discount || 0,
      vatRate: 0.17,
      vatAmount,
      total,
      status: "DRAFT",
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      notes: data.notes || "",
      items: {
        create: data.items.map((item) => ({
          itemId: item.itemId || null,
          description: item.description,
          qty: item.qty,
          unitPrice: item.unitPrice,
          total: Math.round(item.qty * item.unitPrice * 100) / 100,
        })),
      },
    },
  });

  revalidatePath("/finance");
  revalidatePath("/finance/quotes");
  return { success: true, quote };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "فشل إنشاء عرض السعر";
    return { success: false, error: msg };
  }
}

export async function updateQuoteStatus(
  quoteId: number,
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CONVERTED"
) {
  const quote = await prisma.quote.update({
    where: { id: quoteId },
    data: { status },
  });

  revalidatePath("/finance");
  revalidatePath("/finance/quotes");
  revalidatePath(`/finance/quotes/${quoteId}`);
  return quote;
}

export async function convertQuoteToInvoice(quoteId: number) {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { items: true },
  });

  if (!quote) throw new Error("Quote not found");
  if (quote.status === "CONVERTED") throw new Error("Quote already converted");

  const invoiceNumber = await getNextNumber("invoice");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await prisma.$transaction(async (tx: any) => {
    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        customerId: quote.customerId,
        quoteId: quote.id,
        invoiceType: "TAX_INVOICE",
        subtotal: quote.subtotal,
        discount: quote.discount,
        vatRate: quote.vatRate,
        vatAmount: quote.vatAmount,
        total: quote.total,
        paymentStatus: "UNPAID",
        items: {
          create: quote.items.map((item: { itemId: number | null; description: string; qty: unknown; unitPrice: unknown; total: unknown }) => ({
            itemId: item.itemId,
            description: item.description,
            qty: item.qty,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
    });

    await tx.quote.update({
      where: { id: quoteId },
      data: { status: "CONVERTED" },
    });

    return invoice;
  });

  revalidatePath("/finance");
  revalidatePath("/finance/quotes");
  revalidatePath(`/finance/quotes/${quoteId}`);
  revalidatePath("/finance/invoices");
  return result;
}

// ========================
// INVOICES
// ========================

export async function createInvoice(formDataOrObj: FormData | {
  customerId: number;
  projectId?: number;
  invoiceType: "TAX_INVOICE" | "TAX_INVOICE_RECEIPT" | "CREDIT_NOTE";
  discount: number;
  dueDate?: string;
  notes?: string;
  items: { itemId?: number; description: string; qty: number; unitPrice: number }[];
}) {
  let data: {
    customerId: number;
    projectId?: number;
    invoiceType: "TAX_INVOICE" | "TAX_INVOICE_RECEIPT" | "CREDIT_NOTE";
    discount: number;
    dueDate?: string;
    notes?: string;
    items: { itemId?: number; description: string; qty: number; unitPrice: number }[];
  };

  if (formDataOrObj instanceof FormData) {
    const fd = formDataOrObj;
    data = {
      customerId: parseInt(fd.get("customerId") as string),
      projectId: fd.get("projectId") ? parseInt(fd.get("projectId") as string) : undefined,
      invoiceType: (fd.get("invoiceType") as string as "TAX_INVOICE" | "TAX_INVOICE_RECEIPT" | "CREDIT_NOTE") || "TAX_INVOICE",
      discount: parseFloat(fd.get("discount") as string) || 0,
      dueDate: (fd.get("dueDate") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
      items: JSON.parse(fd.get("items") as string || "[]"),
    };
  } else {
    data = formDataOrObj;
  }

  try {
  const invoiceNumber = await getNextNumber("invoice");

  const subtotal = data.items.reduce(
    (sum, item) => sum + item.qty * item.unitPrice,
    0
  );
  const afterDiscount = subtotal - (data.discount || 0);
  const { vatAmount, total } = calculateVAT(afterDiscount);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      customerId: data.customerId,
      projectId: data.projectId || null,
      invoiceType: data.invoiceType || "TAX_INVOICE",
      subtotal,
      discount: data.discount || 0,
      vatRate: 0.17,
      vatAmount,
      total,
      paymentStatus: "UNPAID",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes || "",
      items: {
        create: data.items.map((item) => ({
          itemId: item.itemId || null,
          description: item.description,
          qty: item.qty,
          unitPrice: item.unitPrice,
          total: Math.round(item.qty * item.unitPrice * 100) / 100,
        })),
      },
    },
  });

  revalidatePath("/finance");
  revalidatePath("/finance/invoices");
  return { success: true, invoice };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "فشل إنشاء الفاتورة";
    return { success: false, error: msg };
  }
}

// ========================
// PAYMENTS
// ========================

export async function recordPayment(data: {
  invoiceId: number;
  amount: number;
  method: "CASH" | "CHECK" | "BANK_TRANSFER" | "CREDIT_CARD";
  reference?: string;
  paymentDate?: string;
  notes?: string;
}) {
  const paymentNumber = await getNextNumber("payment");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await prisma.$transaction(async (tx: any) => {
    const payment = await tx.payment.create({
      data: {
        paymentNumber,
        invoiceId: data.invoiceId,
        amount: data.amount,
        method: data.method,
        reference: data.reference || "",
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
        notes: data.notes || "",
      },
    });

    // Calculate total payments for this invoice
    const payments = await tx.payment.findMany({
      where: { invoiceId: data.invoiceId },
    });
    const totalPaid = payments.reduce(
      (sum: number, p: { amount: unknown }) => sum + Number(p.amount),
      0
    );

    const invoice = await tx.invoice.findUnique({
      where: { id: data.invoiceId },
    });

    if (invoice) {
      const invoiceTotal = Number(invoice.total);
      let paymentStatus: "UNPAID" | "PARTIAL" | "PAID" = "UNPAID";
      if (totalPaid >= invoiceTotal) {
        paymentStatus = "PAID";
      } else if (totalPaid > 0) {
        paymentStatus = "PARTIAL";
      }

      await tx.invoice.update({
        where: { id: data.invoiceId },
        data: { paymentStatus },
      });
    }

    return payment;
  });

  revalidatePath("/finance");
  revalidatePath("/finance/invoices");
  revalidatePath(`/finance/invoices/${data.invoiceId}`);
  revalidatePath("/finance/unpaid");
  return result;
}

// ========================
// DELIVERY NOTES
// ========================

export async function createDeliveryNote(data: {
  projectId?: number;
  invoiceId?: number;
  deliveryDate?: string;
  notes?: string;
  items: { description: string; qty: number }[];
}) {
  const deliveryNumber = await getNextNumber("delivery_note");

  const deliveryNote = await prisma.deliveryNote.create({
    data: {
      deliveryNumber,
      projectId: data.projectId || null,
      invoiceId: data.invoiceId || null,
      deliveryDate: data.deliveryDate
        ? new Date(data.deliveryDate)
        : new Date(),
      notes: data.notes || "",
      items: {
        create: data.items.map((item) => ({
          description: item.description,
          qty: item.qty,
        })),
      },
    },
  });

  revalidatePath("/finance");
  return deliveryNote;
}
