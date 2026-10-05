import { requireBookingAccess } from "@/lib/portal/auth";
import { serializeClientBooking } from "@/lib/portal/wedding";
import WeddingPayments from "@/components/portal/WeddingPayments";
import WeddingBilling from "@/components/portal/WeddingBilling";
export const metadata = { title: "Payments" };
export default async function Payments({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const { booking } = await requireBookingAccess(ref);
  const b = serializeClientBooking(booking);
  return (
    <>
      <WeddingBilling booking={b} />
      <WeddingPayments booking={b} />
    </>
  );
}
