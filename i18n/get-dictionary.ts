import type { Locale } from "./config";

const dictionaries = {
  ar: () => import("./dictionaries/ar.json").then((m) => m.default),
  he: () => import("./dictionaries/he.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
