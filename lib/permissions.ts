export const POSITIONS = [
  "admin",
  "manager",
  "accountant",
  "warehouse",
  "technician",
  "employee",
] as const;

export type Position = (typeof POSITIONS)[number];

export const POSITION_LABELS: Record<string, Record<Position, string>> = {
  ar: {
    admin: "مدير النظام",
    manager: "مدير",
    accountant: "محاسب",
    warehouse: "أمين مخزن",
    technician: "فني",
    employee: "موظف",
  },
  he: {
    admin: "מנהל מערכת",
    manager: "מנהל",
    accountant: "חשב",
    warehouse: "מחסנאי",
    technician: "טכנאי",
    employee: "עובד",
  },
  en: {
    admin: "System Admin",
    manager: "Manager",
    accountant: "Accountant",
    warehouse: "Warehouse Keeper",
    technician: "Technician",
    employee: "Employee",
  },
};

export type NavKey =
  | "dashboard"
  | "customers"
  | "projects"
  | "inventory"
  | "finance"
  | "hr"
  | "maintenance"
  | "reports"
  | "aiPlans"
  | "employeePortal"
  | "settings";

const ACCESS: Record<string, NavKey[]> = {
  admin: [
    "dashboard", "customers", "projects", "inventory",
    "finance", "hr", "maintenance", "reports", "aiPlans",
    "employeePortal", "settings",
  ],
  super_admin: [
    "dashboard", "customers", "projects", "inventory",
    "finance", "hr", "maintenance", "reports", "aiPlans",
    "employeePortal", "settings",
  ],
  manager: [
    "dashboard", "customers", "projects", "inventory",
    "finance", "hr", "maintenance", "reports", "aiPlans",
    "employeePortal",
  ],
  accountant: [
    "dashboard", "finance", "customers", "employeePortal",
  ],
  warehouse: [
    "dashboard", "inventory", "employeePortal",
  ],
  technician: [
    "dashboard", "projects", "maintenance", "employeePortal",
  ],
  employee: [
    "employeePortal",
  ],
};

export function getAllowedNavKeys(role: string): NavKey[] {
  return ACCESS[role || "employee"] || ACCESS.admin;
}

export function canAccess(role: string, navKey: NavKey): boolean {
  return getAllowedNavKeys(role).includes(navKey);
}

const ROUTE_TO_NAV: Record<string, NavKey> = {
  "/dashboard": "dashboard",
  "/customers": "customers",
  "/projects": "projects",
  "/inventory": "inventory",
  "/finance": "finance",
  "/hr": "hr",
  "/maintenance": "maintenance",
  "/reports": "reports",
  "/ai-plans": "aiPlans",
  "/employee-portal": "employeePortal",
  "/settings": "settings",
};

export function canAccessRoute(role: string, pathname: string): boolean {
  const stripped = pathname.replace(/^\/[a-z]{2}/, "");
  for (const [route, navKey] of Object.entries(ROUTE_TO_NAV)) {
    if (stripped === route || stripped.startsWith(route + "/")) {
      return canAccess(role, navKey);
    }
  }
  return true;
}
