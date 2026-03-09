"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// ─── Update Company ───────────────────────────────────────────

export async function updateCompany(companyId: number, formData: FormData) {
  const data = {
    nameAr: (formData.get("nameAr") as string) || "",
    nameHe: (formData.get("nameHe") as string) || "",
    nameEn: (formData.get("nameEn") as string) || "",
    vatNumber: (formData.get("vatNumber") as string) || "",
    phone: (formData.get("phone") as string) || "",
    email: (formData.get("email") as string) || "",
    address: (formData.get("address") as string) || "",
  };

  await prisma.company.update({
    where: { id: companyId },
    data,
  });

  revalidatePath("/settings/company");
}

// ─── Create User ──────────────────────────────────────────────

export async function createUser(locale: string, formData: FormData) {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const language = (formData.get("language") as string) || "ar";
  const roleId = formData.get("roleId") ? Number(formData.get("roleId")) : null;

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      fullName,
      language,
    },
  });

  if (roleId) {
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId,
      },
    });
  }

  revalidatePath(`/${locale}/settings/users`);
  return { id: user.id };
}

// ─── Update User ──────────────────────────────────────────────

export async function updateUser(
  locale: string,
  userId: number,
  formData: FormData
) {
  const data: any = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    language: (formData.get("language") as string) || "ar",
  };

  const password = formData.get("password") as string;
  if (password && password.trim().length > 0) {
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  await prisma.user.update({
    where: { id: userId },
    data,
  });

  revalidatePath(`/${locale}/settings/users`);
}

// ─── Deactivate User ──────────────────────────────────────────

export async function deactivateUser(locale: string, userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  revalidatePath(`/${locale}/settings/users`);
}

// ─── Update Role Permissions ──────────────────────────────────

export async function updateRolePermissions(
  locale: string,
  roleId: number,
  permissionIds: number[]
) {
  // Remove all existing permissions for this role
  await prisma.rolePermission.deleteMany({
    where: { roleId },
  });

  // Add the new permissions
  if (permissionIds.length > 0) {
    await prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      })),
    });
  }

  revalidatePath(`/${locale}/settings/roles`);
}

// ─── Create Backup ────────────────────────────────────────────

export async function createBackup(locale: string) {
  await prisma.systemLog.create({
    data: {
      level: "INFO",
      message: `Manual backup initiated`,
      context: {
        type: "backup",
        timestamp: new Date().toISOString(),
        initiatedBy: "admin",
      },
    },
  });

  revalidatePath(`/${locale}/settings/backup`);
  return { success: true };
}
