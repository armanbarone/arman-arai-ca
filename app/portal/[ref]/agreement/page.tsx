import { requireBookingAccess } from "@/lib/portal/auth";
import { serializeClientBooking } from "@/lib/portal/wedding";
import WeddingContractDetails from "@/components/portal/WeddingContractDetails";
export default async function AgreementDetails({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params, { booking, session } = await requireBookingAccess(ref);
  return <WeddingContractDetails booking={session.role === "admin" ? booking : serializeClientBooking(booking)} admin={session.role === "admin"} />;
}
