import type { BookingInput } from "@/app/admin/actions";
import { PACKAGES, defaultTaxesFor } from "./presets";
import { defaultFields } from "./workOrderFields";

const emptyClient = () => ({
  legalName: "", preferredName: "", email: "", phone: "",
  address: { line1: "", line2: "", city: "", province: "BC", postalCode: "" },
});

export function blankBookingInput(): BookingInput {
  const pkg = PACKAGES[0];
  return {
    clients: [emptyClient(), emptyClient()],
    packageKey: pkg.key,
    packageName: pkg.name,
    event: { date: "", backupDate: "", serviceDates: "", location: "", province: "BC", ceremonyType: "legal" },
    lines: [{ id: "l1", kind: "package", label: pkg.name, cents: 0 }],
    allocation: pkg.allocation,
    taxes: defaultTaxesFor("BC"),
    fields: defaultFields(),
    internalNotes: "",
    remindersPaused: false,
  };
}

