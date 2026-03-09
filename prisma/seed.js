const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("admin123", 12);

  await prisma.company.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nameAr: "\u0634\u0631\u0643\u0629 \u0633\u0646\u062a\u0631\u0627\u0643\u0633 \u0644\u0644\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0623\u0645\u0646\u064a\u0629",
      nameHe: '\u05e1\u05e0\u05d8\u05e8\u05e7\u05e1 \u05de\u05e2\u05e8\u05db\u05d5\u05ea \u05d0\u05d1\u05d8\u05d7\u05d4 \u05d1\u05e2"\u05de',
      nameEn: "SentraX Security Systems Ltd.",
      vatNumber: "515000000",
      phone: "04-1234567",
      email: "info@sentrax.local",
      address: "\u062d\u064a\u0641\u0627\u060c \u0625\u0633\u0631\u0627\u0626\u064a\u0644",
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
    { name: "super_admin", displayName: "\u0645\u062f\u064a\u0631 \u0627\u0644\u0646\u0638\u0627\u0645" },
    { name: "ceo", displayName: "\u0627\u0644\u0645\u062f\u064a\u0631 \u0627\u0644\u0639\u0627\u0645" },
    { name: "accountant", displayName: "\u0645\u062d\u0627\u0633\u0628" },
    { name: "project_manager", displayName: "\u0645\u062f\u064a\u0631 \u0645\u0634\u0627\u0631\u064a\u0639" },
    { name: "sales", displayName: "\u0645\u0628\u064a\u0639\u0627\u062a" },
    { name: "technician", displayName: "\u0641\u0646\u064a" },
    { name: "storekeeper", displayName: "\u0623\u0645\u064a\u0646 \u0645\u062e\u0632\u0646" },
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
      fullName: "\u0645\u062f\u064a\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
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
    create: { name: "\u0627\u0644\u0645\u062e\u0632\u0646 \u0627\u0644\u0631\u0626\u064a\u0633\u064a", location: "\u062d\u064a\u0641\u0627" },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
