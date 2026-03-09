"use server";

import { prisma } from "@/lib/prisma";
import { getNextNumber } from "@/lib/sequences";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProjectStatus, TaskStatus } from "@prisma/client";

// ─── Create Project ───────────────────────────────────────────

export async function createProject(locale: string, formData: FormData) {
  const projectNumber = await getNextNumber("project");

  const data = {
    projectNumber,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || "",
    customerId: Number(formData.get("customerId")),
    siteId: formData.get("siteId") ? Number(formData.get("siteId")) : null,
    projectManagerId: formData.get("projectManagerId")
      ? Number(formData.get("projectManagerId"))
      : null,
    projectType: (formData.get("projectType") as string) || "general",
    startDate: formData.get("startDate")
      ? new Date(formData.get("startDate") as string)
      : null,
    endDate: formData.get("endDate")
      ? new Date(formData.get("endDate") as string)
      : null,
    estimatedCost: formData.get("estimatedCost")
      ? Number(formData.get("estimatedCost"))
      : 0,
    hasCameras: formData.get("hasCameras") === "on",
    hasAlarm: formData.get("hasAlarm") === "on",
    hasFire: formData.get("hasFire") === "on",
    hasGates: formData.get("hasGates") === "on",
    hasAccessControl: formData.get("hasAccessControl") === "on",
  };

  const project = await prisma.project.create({ data });
  revalidatePath(`/${locale}/projects`);
  redirect(`/${locale}/projects/${project.id}`);
}

// ─── Update Project ───────────────────────────────────────────

export async function updateProject(
  locale: string,
  projectId: number,
  formData: FormData
) {
  const data = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || "",
    customerId: Number(formData.get("customerId")),
    siteId: formData.get("siteId") ? Number(formData.get("siteId")) : null,
    projectManagerId: formData.get("projectManagerId")
      ? Number(formData.get("projectManagerId"))
      : null,
    projectType: (formData.get("projectType") as string) || "general",
    status: ((formData.get("status") as string) || "DRAFT") as ProjectStatus,
    startDate: formData.get("startDate")
      ? new Date(formData.get("startDate") as string)
      : null,
    endDate: formData.get("endDate")
      ? new Date(formData.get("endDate") as string)
      : null,
    estimatedCost: formData.get("estimatedCost")
      ? Number(formData.get("estimatedCost"))
      : 0,
    actualCost: formData.get("actualCost")
      ? Number(formData.get("actualCost"))
      : 0,
    hasCameras: formData.get("hasCameras") === "on",
    hasAlarm: formData.get("hasAlarm") === "on",
    hasFire: formData.get("hasFire") === "on",
    hasGates: formData.get("hasGates") === "on",
    hasAccessControl: formData.get("hasAccessControl") === "on",
  };

  await prisma.project.update({ where: { id: projectId }, data });
  revalidatePath(`/${locale}/projects/${projectId}`);
  redirect(`/${locale}/projects/${projectId}`);
}

// ─── Delete Project ───────────────────────────────────────────

export async function deleteProject(locale: string, projectId: number) {
  await prisma.project.delete({ where: { id: projectId } });
  revalidatePath(`/${locale}/projects`);
  redirect(`/${locale}/projects`);
}

// ─── Create Task ──────────────────────────────────────────────

export async function createTask(
  locale: string,
  projectId: number,
  formData: FormData
) {
  await prisma.projectTask.create({
    data: {
      projectId,
      taskName: formData.get("taskName") as string,
      description: (formData.get("description") as string) || "",
      assignedTo: formData.get("assignedTo")
        ? Number(formData.get("assignedTo"))
        : null,
      dueDate: formData.get("dueDate")
        ? new Date(formData.get("dueDate") as string)
        : null,
    },
  });
  revalidatePath(`/${locale}/projects/${projectId}`);
}

// ─── Update Task Status ───────────────────────────────────────

export async function updateTaskStatus(
  locale: string,
  projectId: number,
  taskId: number,
  status: string
) {
  await prisma.projectTask.update({
    where: { id: taskId },
    data: { status: status as any },
  });
  revalidatePath(`/${locale}/projects/${projectId}`);
}

// ─── Add Material ─────────────────────────────────────────────

export async function addMaterial(
  locale: string,
  projectId: number,
  formData: FormData
) {
  await prisma.projectMaterial.create({
    data: {
      projectId,
      itemId: Number(formData.get("itemId")),
      qtyUsed: Number(formData.get("qtyUsed")),
      unitCost: Number(formData.get("unitCost")),
    },
  });
  revalidatePath(`/${locale}/projects/${projectId}`);
}
