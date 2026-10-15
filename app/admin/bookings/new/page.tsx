import WeddingQuickCreate from "@/components/portal/WeddingQuickCreate";
import { requireAdmin } from "@/lib/portal/auth";
import { getLead } from "@/lib/portal/leads";
import { blankBookingInput } from "@/lib/portal/blank";
import { PROVINCES } from "@/lib/portal/presets";

export const metadata = { title: "New booking" };

/** Split "Tricia Link" into the two fields the booking form keeps apart. */
const firstName = (full: string) => full.trim().split(/\s+/)[0] ?? "";

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  await requireAdmin();
  const { from } = await searchParams;
  if (!from) return <WeddingQuickCreate />;

  const lead = await getLead(from);
  if (!lead) return <WeddingQuickCreate />;

  /* Everything the inquiry already told us, carried across. Retyping a
     couple's names and email out of an email thread is the sort of work a CRM
     is supposed to remove. */
  const base = blankBookingInput();
  const province =
    PROVINCES.find((p) =>
      [lead.market, lead.venue].filter(Boolean).join(" ").toLowerCase().includes(p.name.toLowerCase()),
    )?.code ?? base.event.province;

  const prefill = {
    clients: [
      {
        ...base.clients[0],
        legalName: lead.name,
        preferredName: firstName(lead.name),
        email: lead.email,
        phone: lead.phone ?? "",
        address: { ...base.clients[0].address, province },
      },
      {
        ...base.clients[1],
        legalName: lead.partnerName ?? "",
        preferredName: lead.partnerName ? firstName(lead.partnerName) : "",
        address: { ...base.clients[1].address, province },
      },
    ] as typeof base.clients,
    event: {
      ...base.event,
      // Only a real date; "August 2027" is not one the form can hold.
      date: /^\d{4}-\d{2}-\d{2}$/.test(lead.weddingDate ?? "") ? lead.weddingDate! : "",
      location: lead.venue || lead.market || "",
      province,
    },
  };

  return (
    <>
      <div className="wp-message">
        Started from {lead.name}&rsquo;s inquiry of {lead.receivedAt.slice(0, 10)}
        {lead.source ? ` · ${lead.source}` : ""}. Their details are filled in
        below; the inquiry is marked booked and linked to this wedding once you
        create it.
      </div>
      <WeddingQuickCreate prefill={prefill} fromLeadId={lead.id} />
    </>
  );
}
