import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, PortalShell } from "@/components/portal/Shell";
import { bookingsForEmail, getSession } from "@/lib/portal/auth";
import { formatDate } from "@/lib/portal/money";

export const metadata = { title: "Your bookings" };

export default async function PortalHome() {
  const session = await getSession();
  if (!session) redirect("/portal/login");
  if (session.role === "admin") redirect("/admin");

  const bookings = await bookingsForEmail(session.email);
  if (bookings.length === 1) redirect(`/portal/${bookings[0].ref}`);

  return (
    <PortalShell home="/portal" email={session.email}>
      <h1 className="mb-8 font-serif text-4xl font-light">Your bookings</h1>
      {bookings.length === 0 ? (
        <p className="text-blush">There is no active booking on this email address. If you think that is wrong, write to i@armanarai.com.</p>
      ) : (
        <div className="grid gap-4">
          {bookings.map((b) => (
            <Link key={b.ref} href={`/portal/${b.ref}`}>
              <Card className="transition hover:border-rose">
                <p className="text-xs uppercase tracking-[0.2em] text-rose">{b.ref}</p>
                <p className="font-serif text-2xl">{b.packageName}, {b.event.location}</p>
                <p className="text-sm text-blush">{formatDate(b.event.date)}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PortalShell>
  );
}
