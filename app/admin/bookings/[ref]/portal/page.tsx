import { requireAdmin } from "@/lib/portal/auth";
import { getBooking } from "@/lib/portal/store";
import { notFound } from "next/navigation";
import WeddingPortalControls from "@/components/portal/WeddingPortalControls";
export default async function Page({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  await requireAdmin();
  const { ref } = await params,
    b = await getBooking(ref);
  if (!b) notFound();
  return <WeddingPortalControls key={b.updatedAt} booking={b} />;
}
