import { notFound } from "next/navigation";
import { getBooking } from "@/lib/portal/store";
import WeddingWorkspace from "@/components/portal/WeddingWorkspace";
export default async function AdminWedding({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ invite?: string }>;
}) {
  const { ref } = await params,
    b = await getBooking(ref);
  if (!b) notFound();
  const query = await searchParams;
  return (
    <>
      {query.invite === "retry" && (
        <p className="wp-message wp-message-error" role="alert">
          The wedding was created, but an invitation could not be emailed. Open
          Client dashboard & access to retry each partner’s invitation.
        </p>
      )}
      <WeddingWorkspace booking={b} />
    </>
  );
}
