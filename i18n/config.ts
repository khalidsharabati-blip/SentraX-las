export const locales = ["ar", "he", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";
export const rtlLocales: Locale[] = ["ar", "he"];

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}
