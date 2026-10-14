import { requireAdmin } from "@/lib/portal/auth";
import { listLeads, bySource, totalsFor } from "@/lib/portal/leads";
import { formatCad } from "@/lib/portal/money";
import LeadTracker from "@/components/portal/LeadTracker";
import { Card, Eyebrow } from "@/components/portal/Shell";

export const metadata = { title: "Inquiries" };

export default async function InquiriesPage() {
  await requireAdmin();
  const leads = await listLeads();
  const all = totalsFor(leads);
  const sources = bySource(leads);

  return (
    <>
      <h1>Inquiries</h1>
      <p className="wp-lead">
        Every inquiry the website takes, and what became of it. Keep the consult,
        booked and value columns up to date and this answers the question no ad
        platform can: not what a lead costs, but what a booking costs.
      </p>

      <LeadTracker leads={leads} />

      {sources.length > 0 && (
        <Card className="wp-doc-section">
          <Eyebrow>By source · all time</Eyebrow>
          <div className="wp-table-scroll">
            <table className="wp-table">
              <thead>
                <tr><th>Source</th><th>Inquiries</th><th>Consults</th><th>Booked</th><th>Close rate</th><th>Value</th></tr>
              </thead>
              <tbody>
                {sources.map(({ source, totals }) => (
                  <tr key={source}>
                    <td><strong>{source}</strong></td>
                    <td>{totals.leads}</td>
                    <td>{totals.consults}</td>
                    <td>{totals.booked}</td>
                    <td>{totals.closeRate === null ? "—" : `${Math.round(totals.closeRate * 100)}%`}</td>
                    <td>{totals.valueCents ? formatCad(totals.valueCents) : "—"}</td>
                  </tr>
                ))}
                <tr>
                  <td><strong>All sources</strong></td>
                  <td>{all.leads}</td>
                  <td>{all.consults}</td>
                  <td>{all.booked}</td>
                  <td>{all.closeRate === null ? "—" : `${Math.round(all.closeRate * 100)}%`}</td>
                  <td>{all.valueCents ? formatCad(all.valueCents) : "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Divide a channel&rsquo;s spend by its booked count for cost per booking.
            Meta and Google can only ever tell you cost per lead, because neither
            of them knows which lead signed.
          </p>
        </Card>
      )}
    </>
  );
}
