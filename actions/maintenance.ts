"use server";

import { prisma } from "@/lib/prisma";
import { getNextNumber } from "@/lib/sequences";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ─── Create Contract ──────────────────────────────────────────

export async function createContract(locale: string, formData: FormData) {
  const contractNumber = await getNextNumber("contract");

  const data = {
    contractNumber,
    customerId: Number(formData.get("customerId")),
    projectId: formData.get("projectId")
      ? Number(formData.get("projectId"))
      : null,
    startDate: new Date(formData.get("startDate") as string),
    endDate: new Date(formData.get("endDate") as string),
    visitsPerYear: formData.get("visitsPerYear")
      ? Number(formData.get("visitsPerYear"))
      : 4,
    annualPrice: formData.get("annualPrice")
      ? Number(formData.get("annualPrice"))
      : 0,
    status: (formData.get("status") as string) || "ACTIVE",
    notes: (formData.get("notes") as string) || "",
  };

  await prisma.maintenanceContract.create({ data: data as any });
  revalidatePath(`/${locale}/maintenance`);
  redirect(`/${locale}/maintenance/contracts`);
}

// ─── Update Contract ──────────────────────────────────────────

export async function updateContract(
  locale: string,
  contractId: number,
  formData: FormData
) {
  await prisma.maintenanceContract.update({
    where: { id: contractId },
    data: {
      customerId: Number(formData.get("customerId")),
      projectId: formData.get("projectId")
        ? Number(formData.get("projectId"))
        : null,
      startDate: new Date(formData.get("startDate") as string),
      endDate: new Date(formData.get("endDate") as string),
      visitsPerYear: formData.get("visitsPerYear")
        ? Number(formData.get("visitsPerYear"))
        : 4,
      annualPrice: formData.get("annualPrice")
        ? Number(formData.get("annualPrice"))
        : 0,
      status: (formData.get("status") as "ACTIVE" | "EXPIRED" | "CANCELLED") || "ACTIVE",
      notes: (formData.get("notes") as string) || "",
    },
  });
  revalidatePath(`/${locale}/maintenance`);
  revalidatePath(`/${locale}/maintenance/contracts`);
  revalidatePath(`/${locale}/maintenance/contracts/${contractId}`);
  redirect(`/${locale}/maintenance/contracts/${contractId}`);
}

// ─── Delete Contract ──────────────────────────────────────────

export async function deleteContract(locale: string, contractId: number) {
  await prisma.maintenanceContract.delete({ where: { id: contractId } });
  revalidatePath(`/${locale}/maintenance`);
  revalidatePath(`/${locale}/maintenance/contracts`);
  redirect(`/${locale}/maintenance/contracts`);
}

// ─── Renew Contract ───────────────────────────────────────────

export async function renewContract(locale: string, contractId: number) {
  const old = await prisma.maintenanceContract.findUnique({
    where: { id: contractId },
  });
  if (!old) throw new Error("العقد غير موجود");

  const newStart = new Date(old.endDate);
  newStart.setDate(newStart.getDate() + 1);
  const newEnd = new Date(newStart);
  newEnd.setFullYear(newEnd.getFullYear() + 1);

  const contractNumber = await getNextNumber("contract");

  const renewed = await prisma.maintenanceContract.create({
    data: {
      contractNumber,
      customerId: old.customerId,
      projectId: old.projectId,
      startDate: newStart,
      endDate: newEnd,
      visitsPerYear: old.visitsPerYear,
      annualPrice: old.annualPrice,
      status: "ACTIVE",
      notes: `تجديد للعقد ${old.contractNumber}`,
    },
  });

  await prisma.maintenanceContract.update({
    where: { id: contractId },
    data: { status: "EXPIRED" },
  });

  revalidatePath(`/${locale}/maintenance`);
  revalidatePath(`/${locale}/maintenance/contracts`);
  redirect(`/${locale}/maintenance/contracts/${renewed.id}`);
}

// ─── Create Ticket ────────────────────────────────────────────

export async function createTicket(locale: string, formData: FormData) {
  const ticketNumber = await getNextNumber("ticket");

  const data = {
    ticketNumber,
    customerId: Number(formData.get("customerId")),
    projectId: formData.get("projectId")
      ? Number(formData.get("projectId"))
      : null,
    contractId: formData.get("contractId")
      ? Number(formData.get("contractId"))
      : null,
    assignedTechId: formData.get("assignedTechId")
      ? Number(formData.get("assignedTechId"))
      : null,
    issueType: (formData.get("issueType") as string) || "general",
    priority: (formData.get("priority") as string) || "MEDIUM",
    description: formData.get("description") as string,
    status: "OPEN",
  };

  const ticket = await prisma.serviceTicket.create({ data: data as any });
  revalidatePath(`/${locale}/maintenance`);
  redirect(`/${locale}/maintenance/tickets/${ticket.id}`);
}

// ─── Assign Tech ──────────────────────────────────────────────

export async function assignTech(
  locale: string,
  ticketId: number,
  techId: number
) {
  await prisma.serviceTicket.update({
    where: { id: ticketId },
    data: { assignedTechId: techId },
  });
  revalidatePath(`/${locale}/maintenance/tickets/${ticketId}`);
}

// ─── Add Visit ────────────────────────────────────────────────

export async function addVisit(
  locale: string,
  ticketId: number,
  formData: FormData
) {
  await prisma.serviceVisit.create({
    data: {
      ticketId,
      techId: formData.get("techId") ? Number(formData.get("techId")) : null,
      visitDate: new Date(formData.get("visitDate") as string),
      duration: formData.get("duration") ? Number(formData.get("duration")) : 0,
      workDone: (formData.get("workDone") as string) || "",
      result: (formData.get("result") as string) || "",
    },
  });
  revalidatePath(`/${locale}/maintenance/tickets/${ticketId}`);
}

// ─── Add Part ─────────────────────────────────────────────────

export async function addPart(
  locale: string,
  ticketId: number,
  formData: FormData
) {
  await prisma.servicePart.create({
    data: {
      ticketId,
      itemId: Number(formData.get("itemId")),
      qtyUsed: formData.get("qtyUsed") ? Number(formData.get("qtyUsed")) : 1,
      billable: formData.get("billable") === "on",
    },
  });
  revalidatePath(`/${locale}/maintenance/tickets/${ticketId}`);
}

// ─── Close Ticket ─────────────────────────────────────────────

export async function closeTicket(locale: string, ticketId: number) {
  await prisma.serviceTicket.update({
    where: { id: ticketId },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
    },
  });
  revalidatePath(`/${locale}/maintenance/tickets/${ticketId}`);
  revalidatePath(`/${locale}/maintenance`);
}

// ─── Update Ticket Status ─────────────────────────────────────

export async function updateTicketStatus(
  locale: string,
  ticketId: number,
  status: string
) {
  const data: any = { status };
  if (status === "CLOSED") {
    data.closedAt = new Date();
  }
  await prisma.serviceTicket.update({
    where: { id: ticketId },
    data,
  });
  revalidatePath(`/${locale}/maintenance/tickets/${ticketId}`);
  revalidatePath(`/${locale}/maintenance`);
}
