import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("admin123", 12);

  const company = await prisma.company.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nameAr: "شركة سنتراكس للأنظمة الأمنية",
      nameHe: "סנטרקס מערכות אבטחה בע\"מ",
      nameEn: "SentraX Security Systems Ltd.",
      vatNumber: "515000000",
      phone: "04-1234567",
      email: "info@sentrax.local",
      address: "حيفا، إسرائيل",
      settings: {
        create: [
          { key: "vat_rate", value: "0.17" },
          { key: "currency", value: "ILS" },
          { key: "default_lang", value: "ar" },
        ],
      },
    },
  });

  const roles = [
    { name: "super_admin", displayName: "مدير النظام" },
    { name: "ceo", displayName: "المدير العام" },
    { name: "accountant", displayName: "محاسب" },
    { name: "project_manager", displayName: "مدير مشاريع" },
    { name: "sales", displayName: "مبيعات" },
    { name: "technician", displayName: "فني" },
    { name: "storekeeper", displayName: "أمين مخزن" },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }

  const modules = ["dashboard", "customers", "projects", "inventory", "finance", "hr", "maintenance", "reports", "settings"];
  const actions = ["view", "create", "edit", "delete", "export", "print"];

  for (const mod of modules) {
    for (const act of actions) {
      await prisma.permission.upsert({
        where: { module_action: { module: mod, action: act } },
        update: {},
        create: { module: mod, action: act },
      });
    }
  }

  const adminRole = await prisma.role.findUnique({ where: { name: "super_admin" } });
  if (adminRole) {
    const allPerms = await prisma.permission.findMany();
    for (const perm of allPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: adminRole.id, permissionId: perm.id },
      });
    }
  }

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@sentrax.local",
      passwordHash,
      fullName: "مدير النظام",
      language: "ar",
    },
  });

  if (adminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
      update: {},
      create: { userId: admin.id, roleId: adminRole.id },
    });
  }

  const docTypes = [
    { docType: "quote", prefix: "QT" },
    { docType: "invoice", prefix: "INV" },
    { docType: "payment", prefix: "PAY" },
    { docType: "delivery_note", prefix: "DN" },
    { docType: "project", prefix: "PRJ" },
    { docType: "ticket", prefix: "TK" },
    { docType: "contract", prefix: "MC" },
  ];

  const year = new Date().getFullYear();
  for (const dt of docTypes) {
    await prisma.documentSequence.upsert({
      where: { docType_year: { docType: dt.docType, year } },
      update: {},
      create: { ...dt, year, lastNumber: 0 },
    });
  }

  await prisma.warehouse.upsert({
    where: { id: 1 },
    update: {},
    create: { name: "المخزن الرئيسي", location: "حيفا" },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
