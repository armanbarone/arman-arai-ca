import { requireBookingAccess } from "@/lib/portal/auth";
import { PortalShell } from "@/components/portal/Shell";
export default async function WeddingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const { session } = await requireBookingAccess(ref);
  return (
    <PortalShell home="/portal" email={session.email} bookingRef={ref}>
      {children}
    </PortalShell>
  );
}
