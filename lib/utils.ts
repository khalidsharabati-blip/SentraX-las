import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
  }).format(num);
}

export function formatDate(date: Date | string, locale: string = "ar"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : locale === "he" ? "he-IL" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function formatDateTime(date: Date | string, locale: string = "ar"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : locale === "he" ? "he-IL" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function calculateVAT(subtotal: number, vatRate: number = 0.17): {
  vatAmount: number;
  total: number;
} {
  const vatAmount = subtotal * vatRate;
  return {
    vatAmount: Math.round(vatAmount * 100) / 100,
    total: Math.round((subtotal + vatAmount) * 100) / 100,
  };
}
