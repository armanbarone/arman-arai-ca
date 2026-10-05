import { notFound } from "next/navigation";
import Link from "next/link";
import { requireBookingAccess } from "@/lib/portal/auth";
import { weddingData, visibleDocuments, serializeClientBooking } from "@/lib/portal/wedding";
import WeddingDocumentReader from "@/components/portal/WeddingDocumentReader";
export default async function DocumentPage({
  params,
}: {
  params: Promise<{ ref: string; id: string }>;
}) {
  const { ref, id } = await params;
  const { session, booking } = await requireBookingAccess(ref);
  const d = (
    session.role === "admin"
      ? weddingData(booking).documents
      : visibleDocuments(booking)
  ).find((d) => d.id === id);
  if (!d) notFound();
  return (
    <>
      <Link className="wp-back" href={`/portal/${ref}/documents`}>
        ← Agreements & approvals
      </Link>
      <WeddingDocumentReader
        booking={serializeClientBooking(booking)}
        document={{
          ...d,
          signatures: d.signatures.map((s) => ({
            ...s,
            ip: "",
            userAgent: "",
          })),
        }}
        bookingRef={ref}
        email={session.email}
        legalName={
          booking.clients.find((c) => c.email === session.email)?.legalName
        }
        admin={session.role === "admin"}
      />
    </>
  );
}
