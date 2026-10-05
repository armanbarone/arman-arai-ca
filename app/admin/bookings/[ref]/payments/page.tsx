import { notFound } from "next/navigation";
import Link from "next/link";
import { getBooking } from "@/lib/portal/store";
import WeddingPayments from "@/components/portal/WeddingPayments";
import WeddingScheduleEditor from "@/components/portal/WeddingScheduleEditor";
import WeddingBilling from "@/components/portal/WeddingBilling";
import { stripeConfiguration } from "@/lib/portal/stripe";
export default async function Payments({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params,
    b = await getBooking(ref);
  if (!b) notFound();
  const stripe = await stripeConfiguration();
  return (
    <>
      <Link className="wp-back" href={`/admin/bookings/${ref}`}>
        ← Wedding workspace
      </Link>
      <WeddingBilling
        booking={b}
        admin
        stripeReady={
          stripe?.mode === "live" &&
          process.env.VERCEL_ENV === "production" &&
          !!process.env.STRIPE_SECRET_KEY
        }
      />
      <WeddingPayments booking={b} admin />
      <WeddingScheduleEditor
        bookingRef={ref}
        schedule={b.schedule}
        total={b.totals.totalCents}
        locked={b.status !== "draft"}
      />
    </>
  );
}
