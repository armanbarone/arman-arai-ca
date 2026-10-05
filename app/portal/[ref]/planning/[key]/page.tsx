import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBookingAccess } from "@/lib/portal/auth";
import {
  WEDDING_TEMPLATES,
  seedFields,
  weddingData,
} from "@/lib/portal/wedding";
import NativeWeddingForm from "@/components/portal/NativeWeddingForm";
export default async function PlanningForm({
  params,
}: {
  params: Promise<{ ref: string; key: string }>;
}) {
  const { ref, key } = await params;
  const { booking } = await requireBookingAccess(ref);
  const t = WEDDING_TEMPLATES.find(
    (t) => t.key === key && ["form", "request"].includes(t.action),
  );
  if (!t) notFound();
  return (
    <>
      <Link className="wp-back" href={`/portal/${ref}/planning`}>
        ← Wedding planning
      </Link>
      <h1>{t.title}</h1>
      <p className="wp-lead">
        Save your progress and come back whenever you need.
      </p>
      <NativeWeddingForm
        template={t}
        initialUpdatedAt={weddingData(booking).forms[key]?.updatedAt || null}
        initial={{
          ...seedFields(t, booking),
          ...weddingData(booking).forms[key]?.fields,
        }}
        bookingRef={ref}
      />
    </>
  );
}
