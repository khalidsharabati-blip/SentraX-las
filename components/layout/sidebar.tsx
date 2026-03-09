"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Package,
  Receipt,
  HardHat,
  Wrench,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronLeft,
  Shield,
  Brain,
  Briefcase,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getAllowedNavKeys, type NavKey } from "@/lib/permissions";

const navItems: { key: NavKey; icon: any; href: string }[] = [
  { key: "dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { key: "customers", icon: Users, href: "/customers" },
  { key: "projects", icon: FolderKanban, href: "/projects" },
  { key: "inventory", icon: Package, href: "/inventory" },
  { key: "finance", icon: Receipt, href: "/finance" },
  { key: "hr", icon: HardHat, href: "/hr" },
  { key: "maintenance", icon: Wrench, href: "/maintenance" },
  { key: "reports", icon: BarChart3, href: "/reports" },
  { key: "aiPlans", icon: Brain, href: "/ai-plans" },
  { key: "employeePortal", icon: Briefcase, href: "/employee-portal" },
  { key: "settings", icon: Settings, href: "/settings" },
];

const labels: Record<string, Record<string, string>> = {
  ar: { dashboard: "لوحة التحكم", customers: "العملاء", projects: "المشاريع", inventory: "المخزن", finance: "الفواتير", hr: "الموظفون", maintenance: "الصيانة", reports: "التقارير", aiPlans: "تحليل المخططات", employeePortal: "بوابة الموظف", settings: "الإعدادات" },
  he: { dashboard: "לוח בקרה", customers: "לקוחות", projects: "פרויקטים", inventory: "מלאי", finance: "חשבוניות", hr: "משאבי אנוש", maintenance: "תחזוקה", reports: "דוחות", aiPlans: "ניתוח תוכניות", employeePortal: "פורטל עובד", settings: "הגדרות" },
  en: { dashboard: "Dashboard", customers: "Customers", projects: "Projects", inventory: "Inventory", finance: "Finance", hr: "HR", maintenance: "Maintenance", reports: "Reports", aiPlans: "AI Plans", employeePortal: "Employee Portal", settings: "Settings" },
};

export function Sidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params.locale as string) || "ar";
  const isRtl = locale === "ar" || locale === "he";
  const [collapsed, setCollapsed] = useState(false);
  const t = labels[locale] || labels.ar;

  const allowedKeys = getAllowedNavKeys(userRole || "admin");
  const visibleItems = navItems.filter((item) => allowedKeys.includes(item.key));

  const CollapseIcon = isRtl
    ? collapsed ? ChevronLeft : ChevronRight
    : collapsed ? ChevronRight : ChevronLeft;

  return (
    <aside
      className={cn(
        "h-screen bg-surface border-border flex flex-col transition-all duration-200 sticky top-0",
        isRtl ? "border-l" : "border-r",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="p-3 flex items-center gap-2 border-b border-border h-14">
        <img src="/logo.png" alt="SentraX" className="w-10 h-10 object-contain flex-shrink-0" />
        {!collapsed && (
          <span className="font-mono text-sm font-bold text-accent tracking-wider">
            SENTRAX
          </span>
        )}
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {visibleItems.map((item) => {
          const href = `/${locale}${item.href}`;
          const isActive = pathname === href || pathname.startsWith(href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={href}
              className={cn(
                "flex items-center gap-3 mx-2 my-0.5 px-3 py-2 rounded text-sm transition-colors",
                isActive
                  ? "bg-accent/10 text-accent border-accent"
                  : "text-text-dim hover:text-text hover:bg-surface2"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{t[item.key]}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-3 border-t border-border text-text-dim hover:text-text transition"
      >
        <CollapseIcon className="w-4 h-4 mx-auto" />
      </button>
    </aside>
  );
}
