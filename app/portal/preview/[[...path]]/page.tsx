import BookingForm from "@/components/portal/BookingForm";
import { blankBookingInput } from "@/lib/portal/blank";
import WeddingOperations from "@/components/portal/WeddingOperations";
import WeddingWorkspace from "@/components/portal/WeddingWorkspace";
import { notFound } from "next/navigation";
import Link from "next/link";
import { demoEnabled, sampleWedding } from "@/lib/portal/demo";
import { PortalShell, Eyebrow } from "@/components/portal/Shell";
import WeddingDashboard from "@/components/portal/WeddingDashboard";
import WeddingDocuments from "@/components/portal/WeddingDocuments";
import WeddingDocumentReader from "@/components/portal/WeddingDocumentReader";
import WeddingPlanning from "@/components/portal/WeddingPlanning";
import NativeWeddingForm from "@/components/portal/NativeWeddingForm";
import WeddingPayments from "@/components/portal/WeddingPayments";
import WeddingDelivery from "@/components/portal/WeddingDelivery";
import WeddingStudioOverview from "@/components/portal/WeddingStudioOverview";
import { studioRow } from "@/lib/portal/studio";
import {
  templateFor,
  WEDDING_TEMPLATES,
  seedFields,
  serializeClientBooking,
} from "@/lib/portal/wedding";
export const metadata = { title: "Wedding portal design preview" };
export default async function Preview({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  if (!demoEnabled()) notFound();
  const { path = [] } = await params,
    b = sampleWedding(),
    email = b.clients[0].email,
    admin = path[0] === "admin";
  let view: React.ReactNode;
  if (admin) {
    if (path[1] === "new")
      view = (
        <>
          <h1>New wedding</h1>
          <p className="wp-lead">
            Start with the couple, event and exact collection. This preview
            saves no real booking.
          </p>
          <BookingForm
            initial={blankBookingInput()}
            bookingRef={null}
            preview
          />
        </>
      );
    else if (path[1] === "booking")
      view = <WeddingWorkspace booking={b} preview />;
    else if (path[1] === "operations")
      view = (
        <>
          <h1>Wedding operations</h1>
          <WeddingOperations bookingRef={b.ref} initial={{}} preview />
        </>
      );
    else if (path[1] === "payments")
      view = <WeddingPayments booking={b} admin preview />;
    else if (path[1] === "documents" && path[2]) {
      const t = templateFor(path[2], b);
      view = (
        <>
          <h1>{t.title}</h1>
          <NativeWeddingForm
            template={t}
            initial={seedFields(t, b)}
            bookingRef={b.ref}
            admin
            preview
          />
        </>
      );
    } else if (path[1] === "documents")
      view = (
        <>
          <h1>Wedding document system</h1>
          <p className="wp-lead">
            Native forms, approvals and signed versions from the supplied
            wedding pack.
          </p>
          <div className="wp-doc-grid" style={{ marginTop: 25 }}>
            {WEDDING_TEMPLATES.map((t) => (
              <Link
                key={t.key}
                className="wp-card"
                href={
                  ["form", "request"].includes(t.action)
                    ? `/portal/preview/planning/${t.key}`
                    : `/portal/preview/admin/documents/${t.key}`
                }
              >
                <h3>{t.title}</h3>
                <p>
                  {t.audience === "client" ? "Client" : "Studio only"} ·{" "}
                  {t.stage}
                </p>
                <p style={{ marginTop: 12 }}>
                  {["form", "request"].includes(t.action)
                    ? "Open native client form"
                    : "Prepare document"}{" "}
                  →
                </p>
              </Link>
            ))}
          </div>
        </>
      );
    else {
      view = <WeddingStudioOverview rows={[studioRow(b)]} preview />;
    }
  } else if (path[0] === "documents" && path[1]) {
    const d = b.wedding!.documents.find((d) => d.id === path[1]);
    if (!d) notFound();
    view = (
      <WeddingDocumentReader
        document={d}
        bookingRef={b.ref}
        email={email}
        legalName={b.clients[0].legalName}
        preview
      />
    );
  } else if (path[0] === "documents")
    view = <WeddingDocuments booking={b} email={email} preview />;
  else if (path[0] === "payments")
    view = <WeddingPayments booking={serializeClientBooking(b)} preview />;
  else if (path[0] === "planning" && path[1]) {
    const t = templateFor(path[1]);
    view = (
      <>
        <h1>{t.title}</h1>
        <NativeWeddingForm
          template={t}
          initial={seedFields(t, b)}
          bookingRef={b.ref}
          preview
        />
      </>
    );
  } else if (path[0] === "planning")
    view = <WeddingPlanning booking={b} preview />;
  else if (path[0] === "delivery")
    view = <WeddingDelivery booking={b} preview />;
  else view = <WeddingDashboard booking={b} email={email} preview />;
  return (
    <PortalShell
      home={admin ? "/portal/preview/admin" : "/portal/preview"}
      email={admin ? "Studio preview" : email}
      admin={admin}
      bookingRef={b.ref}
      preview
    >
      {view}
    </PortalShell>
  );
}
