import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/portal/auth";
import { getBooking } from "@/lib/portal/store";
import {
  WEDDING_TEMPLATES,
  defaultDocumentFields,
  weddingData,
} from "@/lib/portal/wedding";
import NativeWeddingForm from "@/components/portal/NativeWeddingForm";
export default async function EditAnswers({
  params,
}: {
  params: Promise<{ ref: string; key: string }>;
}) {
  await requireAdmin();
  const { ref, key } = await params,
    b = await getBooking(ref),
    t = WEDDING_TEMPLATES.find(
      (t) => t.key === key && ["form", "request"].includes(t.action),
    );
  if (!b || !t) notFound();
  const f = weddingData(b).forms[key];
  return (
    <>
      <Link className="wp-back" href={`/admin/bookings/${ref}#client-answers`}>
        ← Wedding workspace
      </Link>
      <h1>{t.title}</h1>
      <p className="wp-lead">
        Update this couple’s planning answers. Studio edits are recorded in the
        activity log.
      </p>
      <NativeWeddingForm
        template={t}
        initial={{ ...defaultDocumentFields(t, b), ...f?.fields }}
        initialUpdatedAt={f?.updatedAt || null}
        bookingRef={ref}
        studioForm
      />
    </>
  );
}
