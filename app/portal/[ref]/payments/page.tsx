import { requireBookingAccess } from "@/lib/portal/auth";
import { serializeClientBooking } from "@/lib/portal/wedding";
import WeddingPayments from "@/components/portal/WeddingPayments";
export const metadata = { title: "Payments" };
export default async function Payments({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const { booking } = await requireBookingAccess(ref);
  return <WeddingPayments booking={serializeClientBooking(booking)} />;
}
