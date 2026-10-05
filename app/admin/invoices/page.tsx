import { requireAdmin } from "@/lib/portal/auth";
import { listBookings } from "@/lib/portal/store";
import WeddingInvoiceOverview from "@/components/portal/WeddingInvoiceOverview";
export default async function Page() {
  await requireAdmin();
  return <WeddingInvoiceOverview bookings={await listBookings()} />;
}
