import { requireBookingAccess, requireAdmin } from "@/lib/portal/auth";
import WeddingContractDetails from "@/components/portal/WeddingContractDetails";
export default async function Details({ params }: { params: Promise<{ ref: string }> }) {
  await requireAdmin();
  const { ref } = await params, { booking } = await requireBookingAccess(ref);
  return <WeddingContractDetails booking={booking} admin />;
}
