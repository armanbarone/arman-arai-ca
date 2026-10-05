import { requireBookingAccess, requireAdmin } from "@/lib/portal/auth";
import WeddingMoodboard from "@/components/portal/WeddingMoodboard";
export default async function Moodboard({ params }: { params: Promise<{ ref: string }> }) {
  await requireAdmin();
  const { ref } = await params, { booking } = await requireBookingAccess(ref);
  return <WeddingMoodboard booking={booking} />;
}
