import { requireBookingAccess } from "@/lib/portal/auth";
import WeddingDelivery from "@/components/portal/WeddingDelivery";
export const metadata = { title: "Photos and films" };
export default async function Delivery({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const { booking } = await requireBookingAccess(ref);
  return <WeddingDelivery booking={booking} />;
}
