import { requireBookingAccess } from "@/lib/portal/auth";
import WeddingPlanning from "@/components/portal/WeddingPlanning";
export const metadata = { title: "Wedding planning" };
export default async function Planning({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const { booking } = await requireBookingAccess(ref);
  return <WeddingPlanning booking={booking} />;
}
