import { notFound } from "next/navigation";
import { getBooking } from "@/lib/portal/store";
import WeddingWorkspace from "@/components/portal/WeddingWorkspace";
export default async function AdminWedding({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params,
    b = await getBooking(ref);
  if (!b) notFound();
  return <WeddingWorkspace booking={b} />;
}
