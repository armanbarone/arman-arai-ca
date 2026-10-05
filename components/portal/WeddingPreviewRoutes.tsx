"use client";
import { useWeddingPreview } from "./WeddingPreviewProvider";
import { PortalShell } from "./Shell";
import { blankBookingInput } from "@/lib/portal/blank";
import { existingBookingInput } from "@/lib/portal/blank";
import {
  templateFor,
  defaultDocumentFields,
  resolveBlocks,
  weddingData,
  type WeddingDocument,
} from "@/lib/portal/wedding";
import { studioRow } from "@/lib/portal/studio";
import BookingForm from "./BookingForm";
import WeddingOperations from "./WeddingOperations";
import WeddingWorkspace from "./WeddingWorkspace";
import WeddingDashboard from "./WeddingDashboard";
import WeddingDocuments from "./WeddingDocuments";
import WeddingDocumentReader from "./WeddingDocumentReader";
import WeddingPlanning from "./WeddingPlanning";
import NativeWeddingForm from "./NativeWeddingForm";
import WeddingPayments from "./WeddingPayments";
import WeddingDelivery from "./WeddingDelivery";
import WeddingStudioOverview from "./WeddingStudioOverview";
import WeddingContractDetails from "./WeddingContractDetails";
import WeddingMoodboard from "./WeddingMoodboard";
import WeddingLibrary from "./WeddingLibrary";
export default function WeddingPreviewRoutes({ path }: { path: string[] }) {
  const c = useWeddingPreview()!,
    b = c.booking,
    admin = path[0] === "admin",
    p = admin ? path.slice(1) : path,
    tkey = p[0] === "documents" ? (p[1] === "template" ? p[2] : p[1]) : p[1];
  let view: React.ReactNode;
  if (admin) {
    if (p[0] === "new" || p[0] === "settings")
      view = (
        <>
          <h1>
            {p[0] === "new" ? "New wedding" : "Customize collection & quote"}
          </h1>
          <p className="wp-lead">
            Start with the website collection, then adjust its coverage,
            deliverables, prices and taxes before publishing.
          </p>
          <BookingForm
            key={b.wedding?.intake?.approvedAt}
            initial={
              p[0] === "new" ? blankBookingInput() : existingBookingInput(b)
            }
            bookingRef={p[0] === "new" ? null : b.ref}
            preview
            locked={b.wedding?.documents.some(
              (d) =>
                d.templateKey === "agreement" &&
                d.signatures.some((s) => s.party === "client"),
            )}
          />
        </>
      );
    else if (p[0] === "booking")
      view = <WeddingWorkspace booking={b} preview />;
    else if (p[0] === "agreement")
      view = <WeddingContractDetails booking={b} admin preview />;
    else if (p[0] === "moodboard")
      view = <WeddingMoodboard booking={b} preview />;
    else if (p[0] === "operations")
      view = (
        <>
          <h1>Wedding operations</h1>
          <WeddingOperations
            bookingRef={b.ref}
            initial={weddingData(b).operations || {}}
            preview
          />
        </>
      );
    else if (p[0] === "payments")
      view = <WeddingPayments booking={b} admin preview />;
    else if (p[0] === "documents" && tkey) {
      const t = templateFor(tkey, b),
        d = b
          .wedding!.documents.filter(
            (d) => d.templateKey === tkey && d.status === "draft",
          )
          .at(-1);
      view = (
        <>
          <h1>{t.title}</h1>
          <NativeWeddingForm
            key={tkey + (b.wedding?.intake?.approvedAt || "")}
            template={t}
            initial={{ ...defaultDocumentFields(t, b), ...d?.fields }}
            bookingRef={b.ref}
            draftId={d?.id}
            admin
            preview
          />
        </>
      );
    } else if (p[0] === "documents" || p[0] === "library")
      view = <WeddingLibrary bookingRef={b.ref} preview />;
    else view = <WeddingStudioOverview rows={[studioRow(b)]} preview />;
  } else if (p[0] === "agreement")
    view = <WeddingContractDetails booking={b} preview />;
  else if (p[0] === "moodboard")
    view = <WeddingMoodboard booking={b} preview />;
  else if (p[0] === "documents" && tkey) {
    let d = b.wedding!.documents.find((d) => d.id === tkey);
    if (!d) {
      const t = templateFor(tkey, b),
        fields = defaultDocumentFields(t, b);
      d = {
        id: `${t.key}-explore`,
        templateKey: t.key,
        title: t.title,
        version: 1,
        status: "draft",
        createdAt: b.createdAt,
        fields,
        blocks: resolveBlocks(t, fields),
        requiredEmails: [],
        signatures: [],
      };
    }
    view = (
      <WeddingDocumentReader
        key={d.id}
        document={d}
        booking={b}
        bookingRef={b.ref}
        email={c.email}
        legalName={b.clients.find((x) => x.email === c.email)?.legalName}
        preview
      />
    );
  } else if (p[0] === "documents")
    view = <WeddingDocuments booking={b} email={c.email} preview />;
  else if (p[0] === "payments") view = <WeddingPayments booking={b} preview />;
  else if (p[0] === "planning" && tkey) {
    const t = templateFor(tkey, b),
      f = b.wedding!.forms[tkey];
    view = (
      <>
        <h1>{t.title}</h1>
        <NativeWeddingForm
          key={tkey}
          template={t}
          initial={f?.fields || defaultDocumentFields(t, b)}
          initialUpdatedAt={f?.updatedAt || null}
          bookingRef={b.ref}
          preview
        />
      </>
    );
  } else if (p[0] === "planning")
    view = <WeddingPlanning booking={b} preview />;
  else if (p[0] === "delivery") view = <WeddingDelivery booking={b} preview />;
  else view = <WeddingDashboard booking={b} email={c.email} preview />;
  return (
    <PortalShell
      home={admin ? "/portal/preview/admin" : "/portal/preview"}
      email={admin ? "Studio preview" : c.email}
      admin={admin}
      bookingRef={b.ref}
      preview
    >
      {!admin && (
        <div className="wp-preview-person">
          <label>
            Practice as{" "}
            <select
              className="wp-input"
              value={c.email}
              onChange={(e) => c.setEmail(e.target.value)}
            >
              {b.clients.map((x) => (
                <option key={x.email} value={x.email}>
                  {x.legalName}
                </option>
              ))}
            </select>
          </label>
          <span>Local sample · no real signature or email</span>
          <button className="wp-text-button" onClick={c.reset}>
            Reset sample
          </button>
        </div>
      )}
      {view}
    </PortalShell>
  );
}
