// The merchant of record for every armanarai.ca booking. These values print on
// contracts, work orders and receipts, so they live in one place.

export const BUSINESS = {
  legalName: "Arasaka Inc.",
  tradeName: "Arman Arai",
  businessNumber: "767392145",
  gstHstNumber: "767392145RT0001",
  address: {
    line1: "1529 West Pender St",
    city: "Vancouver",
    province: "BC",
    postalCode: "V6G 3J3",
    country: "Canada",
  },
  phone: "+1 (778) 302-5231",
  email: "i@armanarai.com",
  etransferEmail: "i@armanarai.com",
  governingProvince: "British Columbia",
  timezone: "America/Vancouver",
  lead: "Arman Arai",
} as const;

export const BUSINESS_ADDRESS_ONE_LINE =
  `${BUSINESS.address.line1}, ${BUSINESS.address.city}, ${BUSINESS.address.province} ${BUSINESS.address.postalCode}, ${BUSINESS.address.country}`;

export const APP_URL = (process.env.APP_URL || "https://www.armanarai.ca").replace(/\/$/, "");

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || BUSINESS.email)
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  return adminEmails().includes(email.trim().toLowerCase());
}
