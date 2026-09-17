import { Card, Eyebrow } from "@/components/portal/Shell";
import { BUSINESS, BUSINESS_ADDRESS_ONE_LINE } from "@/lib/portal/business";
import { formatDate } from "@/lib/portal/money";
import { getSettings } from "@/lib/portal/store";
import InsuranceForm from "./InsuranceForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Settings</Eyebrow>
        <h1 className="font-serif text-4xl font-light">Business and insurance</h1>
      </div>

      <Card>
        <Eyebrow>Merchant of record</Eyebrow>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[180px_1fr]">
          <dt className="text-blush">Legal name</dt><dd>{BUSINESS.legalName}, operating as {BUSINESS.tradeName}</dd>
          <dt className="text-blush">Business number</dt><dd>{BUSINESS.businessNumber}</dd>
          <dt className="text-blush">GST/HST</dt><dd>{BUSINESS.gstHstNumber}</dd>
          <dt className="text-blush">Address</dt><dd>{BUSINESS_ADDRESS_ONE_LINE}</dd>
          <dt className="text-blush">Phone / email</dt><dd>{BUSINESS.phone} · {BUSINESS.email}</dd>
          <dt className="text-blush">Governing law</dt><dd>{BUSINESS.governingProvince}</dd>
        </dl>
        <p className="mt-3 text-xs text-slate">These print on every agreement and receipt. They are set in lib/portal/business.ts.</p>
      </Card>

      <Card>
        <Eyebrow>Insurance record (agreement section 21)</Eyebrow>
        <p className="mb-5 text-sm leading-relaxed text-blush">
          Fill this in from the issued policy documents. It prints in section 21 of every agreement, and an agreement cannot be sent while this is missing or the policy expires before the elopement date.
          {settings.insurance && <> Last confirmed {formatDate(settings.insurance.confirmedAt.slice(0, 10))}.</>}
        </p>
        <InsuranceForm initial={settings.insurance} />
      </Card>
    </div>
  );
}
