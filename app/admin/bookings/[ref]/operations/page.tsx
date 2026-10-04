import Link from "next/link";
import { notFound } from "next/navigation";
import { getBooking } from "@/lib/portal/store";
import { weddingData } from "@/lib/portal/wedding";
import WeddingOperations from "@/components/portal/WeddingOperations";
export default async function OperationsPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params,
    b = await getBooking(ref);
  if (!b) notFound();
  return (
    <>
      <Link className="wp-back" href={`/admin/bookings/${ref}`}>
        ← Wedding workspace
      </Link>
      <h1>Wedding operations</h1>
      <p className="wp-lead">
        Vendors, permits, timeline, shot list, deliverables, decisions and
        consent in one private workspace.
      </p>
      <WeddingOperations
        bookingRef={ref}
        initial={weddingData(b).operations || {}}
      />
    </>
  );
}
