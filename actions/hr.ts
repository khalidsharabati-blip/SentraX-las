"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import {
  calculateFullSalary,
  OVERTIME_DAILY_THRESHOLD,
} from "@/lib/israeli-labor";

// ─── Create Employee ──────────────────────────────────────────

export async function createEmployee(locale: string, formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = (formData.get("email") as string) || "";
  const username = (formData.get("username") as string) || "";
  const password = (formData.get("password") as string) || "";

  let userId: number | null = null;
  const position = (formData.get("position") as string) || "employee";

  if (username && password) {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      throw new Error("Username already exists");
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username,
        email: email || `${username}@sentrax.local`,
        passwordHash,
        fullName,
        language: locale,
      },
    });
    userId = user.id;

    const roleName = position || "employee";
    let role = await prisma.role.findFirst({ where: { name: roleName } });
    if (!role) {
      role = await prisma.role.create({
        data: { name: roleName, displayName: roleName, description: `${roleName} role` },
      });
    }
    await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
  }

  const data = {
    fullName,
    idNumber: (formData.get("idNumber") as string) || "",
    phone: (formData.get("phone") as string) || "",
    email,
    position: (formData.get("position") as string) || "",
    department: (formData.get("department") as string) || "",
    salary: formData.get("salary") ? Number(formData.get("salary")) : 0,
    salaryType: (formData.get("salaryType") as any) || "MONTHLY",
    contractType: (formData.get("contractType") as any) || "FULL_TIME",
    hireDate: formData.get("hireDate")
      ? new Date(formData.get("hireDate") as string)
      : null,
    userId,
    taxCreditPoints: formData.get("taxCreditPoints") ? Number(formData.get("taxCreditPoints")) : 2.25,
    pensionRate: formData.get("pensionRate") ? Number(formData.get("pensionRate")) : 6.5,
    pensionEmployer: formData.get("pensionEmployer") ? Number(formData.get("pensionEmployer")) : 6.5,
    bituachLeumiRate: formData.get("bituachLeumiRate") ? Number(formData.get("bituachLeumiRate")) : 3.5,
    healthInsurance: formData.get("healthInsurance") ? Number(formData.get("healthInsurance")) : 3.1,
    travelAllowance: formData.get("travelAllowance") ? Number(formData.get("travelAllowance")) : 0,
    convalescenceDays: formData.get("convalescenceDays") ? Number(formData.get("convalescenceDays")) : 0,
    numChildren: formData.get("numChildren") ? Number(formData.get("numChildren")) : 0,
    bankName: (formData.get("bankName") as string) || "",
    bankBranch: (formData.get("bankBranch") as string) || "",
    bankAccount: (formData.get("bankAccount") as string) || "",
  };

  const employee = await prisma.employee.create({ data });
  revalidatePath(`/${locale}/hr`);
  revalidatePath(`/${locale}/hr/employees`);
  return { id: employee.id };
}

// ─── Update Employee ──────────────────────────────────────────

export async function updateEmployee(
  locale: string,
  employeeId: number,
  formData: FormData
) {
  const data = {
    fullName: formData.get("fullName") as string,
    idNumber: (formData.get("idNumber") as string) || "",
    phone: (formData.get("phone") as string) || "",
    email: (formData.get("email") as string) || "",
    position: (formData.get("position") as string) || "",
    department: (formData.get("department") as string) || "",
    salary: formData.get("salary") ? Number(formData.get("salary")) : 0,
    salaryType: (formData.get("salaryType") as any) || "MONTHLY",
    contractType: (formData.get("contractType") as any) || "FULL_TIME",
    hireDate: formData.get("hireDate")
      ? new Date(formData.get("hireDate") as string)
      : null,
    isActive: formData.get("isActive") === "on",
    taxCreditPoints: formData.get("taxCreditPoints") ? Number(formData.get("taxCreditPoints")) : 2.25,
    pensionRate: formData.get("pensionRate") ? Number(formData.get("pensionRate")) : 6.5,
    pensionEmployer: formData.get("pensionEmployer") ? Number(formData.get("pensionEmployer")) : 6.5,
    travelAllowance: formData.get("travelAllowance") ? Number(formData.get("travelAllowance")) : 0,
    convalescenceDays: formData.get("convalescenceDays") ? Number(formData.get("convalescenceDays")) : 0,
    numChildren: formData.get("numChildren") ? Number(formData.get("numChildren")) : 0,
    bankName: (formData.get("bankName") as string) || "",
    bankBranch: (formData.get("bankBranch") as string) || "",
    bankAccount: (formData.get("bankAccount") as string) || "",
  };

  await prisma.employee.update({ where: { id: employeeId }, data });
  revalidatePath(`/${locale}/hr`);
  revalidatePath(`/${locale}/hr/employees`);
  revalidatePath(`/${locale}/hr/employees/${employeeId}`);
}

// ─── Clock In ─────────────────────────────────────────────────

export async function clockIn(
  locale: string,
  employeeId: number,
  projectId?: number
) {
  const now = new Date();
  const workDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  await prisma.employeeAttendance.create({
    data: {
      employeeId,
      projectId: projectId || null,
      workDate,
      clockIn: now,
      totalHours: 0,
      overtime: 0,
      notes: "",
    },
  });

  revalidatePath(`/${locale}/hr/attendance`);
  revalidatePath(`/${locale}/hr/employees/${employeeId}`);
}

// ─── Clock Out (Israeli overtime: 8.6h threshold) ─────────────

export async function clockOut(locale: string, attendanceId: number) {
  const record = await prisma.employeeAttendance.findUnique({
    where: { id: attendanceId },
  });

  if (!record || !record.clockIn) return;

  const now = new Date();
  const diffMs = now.getTime() - record.clockIn.getTime();
  const totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  const overtime = totalHours > OVERTIME_DAILY_THRESHOLD
    ? Math.round((totalHours - OVERTIME_DAILY_THRESHOLD) * 100) / 100
    : 0;

  await prisma.employeeAttendance.update({
    where: { id: attendanceId },
    data: { clockOut: now, totalHours, overtime },
  });

  revalidatePath(`/${locale}/hr/attendance`);
  revalidatePath(`/${locale}/hr/employees/${record.employeeId}`);
}

// ─── Manual Attendance Entry ──────────────────────────────────

export async function addManualAttendance(
  locale: string,
  formData: FormData
) {
  const employeeId = Number(formData.get("employeeId"));
  const projectId = formData.get("projectId") ? Number(formData.get("projectId")) : null;
  const dateStr = formData.get("workDate") as string;
  const workDate = new Date(dateStr);
  const clockInStr = formData.get("clockIn") as string;
  const clockOutStr = formData.get("clockOut") as string;

  const clockIn = clockInStr ? new Date(`${dateStr}T${clockInStr}`) : null;
  const clockOut = clockOutStr ? new Date(`${dateStr}T${clockOutStr}`) : null;

  let totalHours = 0;
  let overtime = 0;

  if (clockIn && clockOut) {
    const diffMs = clockOut.getTime() - clockIn.getTime();
    totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    overtime = totalHours > OVERTIME_DAILY_THRESHOLD
      ? Math.round((totalHours - OVERTIME_DAILY_THRESHOLD) * 100) / 100
      : 0;
  }

  await prisma.employeeAttendance.create({
    data: {
      employeeId,
      projectId,
      workDate,
      clockIn,
      clockOut,
      totalHours,
      overtime,
      notes: (formData.get("notes") as string) || "",
    },
  });

  revalidatePath(`/${locale}/hr/attendance`);
}

// ─── Request Leave ────────────────────────────────────────────

export async function requestLeave(locale: string, formData: FormData) {
  const data = {
    employeeId: Number(formData.get("employeeId")),
    leaveType: (formData.get("leaveType") as any) || "ANNUAL",
    fromDate: new Date(formData.get("fromDate") as string),
    toDate: new Date(formData.get("toDate") as string),
    notes: (formData.get("notes") as string) || "",
  };

  await prisma.employeeLeave.create({ data });
  revalidatePath(`/${locale}/hr/leaves`);
}

// ─── Approve / Reject Leave ──────────────────────────────────

export async function approveLeave(
  locale: string,
  leaveId: number,
  approvedBy: number
) {
  await prisma.employeeLeave.update({
    where: { id: leaveId },
    data: { status: "APPROVED", approvedBy },
  });
  revalidatePath(`/${locale}/hr/leaves`);
}

export async function rejectLeave(locale: string, leaveId: number) {
  await prisma.employeeLeave.update({
    where: { id: leaveId },
    data: { status: "REJECTED" },
  });
  revalidatePath(`/${locale}/hr/leaves`);
}

// ─── Calculate Salary (Israeli Standards) ─────────────────────

export async function calculateSalary(
  locale: string,
  employeeId: number,
  month: number,
  year: number,
  bonuses: number = 0,
  extraDeductions: number = 0
) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) return;

  const baseSalary = Number(employee.salary);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const attendanceRecords = await prisma.employeeAttendance.findMany({
    where: {
      employeeId,
      workDate: { gte: startDate, lte: endDate },
    },
    orderBy: { workDate: "asc" },
  });

  const totalWorkDays = attendanceRecords.length;
  const totalHoursWorked = attendanceRecords.reduce(
    (sum, r) => sum + Number(r.totalHours),
    0
  );

  const overtimeHoursDaily = attendanceRecords.map((r) => ({
    date: r.workDate.toISOString().split("T")[0],
    regular: Math.min(Number(r.totalHours), OVERTIME_DAILY_THRESHOLD),
    overtime: Number(r.overtime),
  }));

  const result = calculateFullSalary({
    baseSalary,
    salaryType: employee.salaryType,
    totalHoursWorked,
    totalWorkDays,
    overtimeHoursDaily,
    taxCreditPoints: Number(employee.taxCreditPoints),
    pensionRate: Number(employee.pensionRate),
    travelAllowance: Number(employee.travelAllowance),
    convalescenceDays: Number(employee.convalescenceDays),
    bonuses,
    extraDeductions,
  });

  await prisma.employeeSalary.upsert({
    where: {
      employeeId_month_year: { employeeId, month, year },
    },
    update: {
      baseSalary,
      overtimePay: result.overtimePay,
      overtimeHours125: result.overtimeHours125,
      overtimeHours150: result.overtimeHours150,
      travelAllowance: result.travelAllowance,
      convalescence: result.convalescence,
      bonuses,
      grossSalary: result.grossSalary,
      incomeTax: result.incomeTax,
      bituachLeumi: result.bituachLeumi,
      healthInsurance: result.healthInsurance,
      pensionEmployee: result.pensionEmployee,
      pensionEmployer: result.pensionEmployer,
      totalDeductions: result.totalDeductions,
      deductions: extraDeductions,
      netSalary: result.netSalary,
      totalWorkDays: result.totalWorkDays,
      totalWorkHours: result.totalWorkHours,
    },
    create: {
      employeeId,
      month,
      year,
      baseSalary,
      overtimePay: result.overtimePay,
      overtimeHours125: result.overtimeHours125,
      overtimeHours150: result.overtimeHours150,
      travelAllowance: result.travelAllowance,
      convalescence: result.convalescence,
      bonuses,
      grossSalary: result.grossSalary,
      incomeTax: result.incomeTax,
      bituachLeumi: result.bituachLeumi,
      healthInsurance: result.healthInsurance,
      pensionEmployee: result.pensionEmployee,
      pensionEmployer: result.pensionEmployer,
      totalDeductions: result.totalDeductions,
      deductions: extraDeductions,
      netSalary: result.netSalary,
      totalWorkDays: result.totalWorkDays,
      totalWorkHours: result.totalWorkHours,
    },
  });

  revalidatePath(`/${locale}/hr/salaries`);
}

// ─── Mark Salary as Paid ──────────────────────────────────────

export async function markSalaryPaid(locale: string, salaryId: number) {
  await prisma.employeeSalary.update({
    where: { id: salaryId },
    data: { isPaid: true, paidAt: new Date() },
  });
  revalidatePath(`/${locale}/hr/salaries`);
}
