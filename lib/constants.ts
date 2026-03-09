export const VAT_RATE = 0.17;
export const CURRENCY = "ILS";
export const CURRENCY_SYMBOL = "\u20AA";

export const DOC_PREFIXES = {
  quote: "QT",
  invoice: "INV",
  payment: "PAY",
  delivery_note: "DN",
  project: "PRJ",
  ticket: "TK",
  contract: "MC",
} as const;

export const MODULES = [
  "dashboard",
  "customers",
  "projects",
  "inventory",
  "finance",
  "hr",
  "maintenance",
  "reports",
  "settings",
] as const;

export type Module = (typeof MODULES)[number];

export const MODULE_ICONS = {
  dashboard: "LayoutDashboard",
  customers: "Users",
  projects: "FolderKanban",
  inventory: "Package",
  finance: "Receipt",
  hr: "HardHat",
  maintenance: "Wrench",
  reports: "BarChart3",
  settings: "Settings",
} as const;
