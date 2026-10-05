import { requireBookingAccess } from "@/lib/portal/auth";
import { serializeClientBooking } from "@/lib/portal/wedding";
import WeddingMoodboard from "@/components/portal/WeddingMoodboard";
export default async function Moodboard({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params, { booking } = await requireBookingAccess(ref);
  return <WeddingMoodboard booking={serializeClientBooking(booking)} />;
}
