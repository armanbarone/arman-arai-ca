import { requireAdmin, requireBookingAccess } from "@/lib/portal/auth";
import WeddingAdminDocuments from "@/components/portal/WeddingAdminDocuments";
export default async function AdminDocuments({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  await requireAdmin();
  const { ref } = await params,
    { booking } = await requireBookingAccess(ref);
  return <WeddingAdminDocuments booking={booking} />;
}
