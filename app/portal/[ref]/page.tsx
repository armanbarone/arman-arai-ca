import { requireBookingAccess } from "@/lib/portal/auth";
import WeddingDashboard from "@/components/portal/WeddingDashboard";
export const metadata = { title: "Your wedding" };
export default async function Overview({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const { session, booking } = await requireBookingAccess(ref);
  return <WeddingDashboard booking={booking} email={session.email} />;
}
