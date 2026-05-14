export const titleize = (value?: string | null): string =>
  (value || "Item")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

export const money = (value?: number, currency = "EUR"): string => {
  if (value == null || Number.isNaN(Number(value))) return "Not set";

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value));
};

export const compact = (values: Array<string | number | null | undefined>): string[] =>
  values
    .map((value) => (value == null ? "" : String(value).trim()))
    .filter(Boolean);
