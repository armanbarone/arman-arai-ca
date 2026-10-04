import { requireBookingAccess } from "@/lib/portal/auth";
import WeddingDocuments from "@/components/portal/WeddingDocuments";
export const metadata = { title: "Agreements and approvals" };
export default async function Documents({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const { session, booking } = await requireBookingAccess(ref);
  return <WeddingDocuments booking={booking} email={session.email} />;
}
