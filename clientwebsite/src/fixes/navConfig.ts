// ─── NAV SCROLL / ROUTE CONFIG ────────────────────────────────────────────────
export const NAV_TARGETS: Record<string, { type: "hash" | "path"; value: string }> = {
  HOME: { type: "path", value: "/" },
  CATEGORIES: { type: "hash", value: "categories" },
  ADDRESS: { type: "path", value: "/store-locator" },
  "BULK QUERIES": { type: "hash", value: "bulk-queries" },
  "CONTACT US": { type: "path", value: "/contact" },
};
// TRACK ORDER and STORE LOCATOR removed — track order is in account dashboard, store info is in About Us
// ───────────────────────────────────────────────────────────────────────────────
