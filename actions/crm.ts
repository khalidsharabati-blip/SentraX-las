"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().min(2),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  idNumber: z.string().optional(),
  customerType: z.enum(["INDIVIDUAL", "BUSINESS"]),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

const contactSchema = z.object({
  customerId: z.number(),
  contactName: z.string().min(1),
  role: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

const siteSchema = z.object({
  customerId: z.number(),
  siteName: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
});

export async function createCustomer(data: z.infer<typeof customerSchema>) {
  const parsed = customerSchema.parse(data);
  const customer = await prisma.customer.create({
    data: {
      name: parsed.name,
      companyName: parsed.companyName || null,
      phone: parsed.phone || null,
      email: parsed.email || null,
      idNumber: parsed.idNumber || null,
      customerType: parsed.customerType,
      taxId: parsed.taxId || null,
      notes: parsed.notes || null,
    },
  });
  revalidatePath("/customers");
  return customer;
}

export async function updateCustomer(
  id: number,
  data: z.infer<typeof customerSchema>
) {
  const parsed = customerSchema.parse(data);
  const customer = await prisma.customer.update({
    where: { id },
    data: {
      name: parsed.name,
      companyName: parsed.companyName || null,
      phone: parsed.phone || null,
      email: parsed.email || null,
      idNumber: parsed.idNumber || null,
      customerType: parsed.customerType,
      taxId: parsed.taxId || null,
      notes: parsed.notes || null,
    },
  });
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  return customer;
}

export async function deleteCustomer(id: number) {
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
}

export async function createContact(data: z.infer<typeof contactSchema>) {
  const parsed = contactSchema.parse(data);
  const contact = await prisma.customerContact.create({
    data: {
      customerId: parsed.customerId,
      contactName: parsed.contactName,
      role: parsed.role || "",
      phone: parsed.phone || "",
      email: parsed.email || "",
      isPrimary: parsed.isPrimary || false,
    },
  });
  revalidatePath(`/customers/${parsed.customerId}`);
  return contact;
}

export async function deleteContact(id: number, customerId: number) {
  await prisma.customerContact.delete({ where: { id } });
  revalidatePath(`/customers/${customerId}`);
}

export async function createSite(data: z.infer<typeof siteSchema>) {
  const parsed = siteSchema.parse(data);
  const site = await prisma.customerSite.create({
    data: {
      customerId: parsed.customerId,
      siteName: parsed.siteName,
      address: parsed.address || "",
      city: parsed.city || "",
    },
  });
  revalidatePath(`/customers/${parsed.customerId}`);
  return site;
}

export async function deleteSite(id: number, customerId: number) {
  await prisma.customerSite.delete({ where: { id } });
  revalidatePath(`/customers/${customerId}`);
}
