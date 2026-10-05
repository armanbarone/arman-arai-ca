import { requireAdmin } from "@/lib/portal/auth";
import { paymentSetupStatus } from "@/lib/portal/stripe";
import WeddingPaymentSetup from "@/components/portal/WeddingPaymentSetup";
export default async function Page() {
  await requireAdmin();
  return (
    <WeddingPaymentSetup
      status={{
        ...(await paymentSetupStatus()),
        emailConfigured: !!process.env.RESEND_API_KEY,
      }}
    />
  );
}
