"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function PortalNavigation({
  admin,
  bookingRef,
  preview,
}: {
  admin: boolean;
  bookingRef?: string;
  preview: boolean;
}) {
  const pathname = usePathname();
  const base = preview ? "/portal/preview" : `/portal/${bookingRef || ""}`;
  const foundRef =
    bookingRef || pathname.match(/^\/admin\/bookings\/([^/]+)/)?.[1];
  const activeRef = foundRef === "new" ? undefined : foundRef;
  const links = admin
    ? [
        [
          "01",
          "Weddings & clients",
          preview ? "/portal/preview/admin" : "/admin",
        ],
        [
          "02",
          "New wedding",
          preview ? "/portal/preview/admin/new" : "/admin/bookings/new",
        ],
        [
          "03",
          "All invoices",
          preview ? "/portal/preview/admin/invoices" : "/admin/invoices",
        ],
        [
          "04",
          "Payment settings",
          preview
            ? "/portal/preview/admin/payment-settings"
            : "/admin/payment-settings",
        ],
        [
          "05",
          "Document library",
          preview ? "/portal/preview/admin/documents" : "/admin/library",
        ],
        ...(activeRef
          ? [
              [
                "06",
                "Wedding workspace",
                preview
                  ? "/portal/preview/admin/booking"
                  : `/admin/bookings/${activeRef}`,
              ],
              [
                "07",
                "Client dashboard & access",
                preview
                  ? "/portal/preview/admin/portal"
                  : `/admin/bookings/${activeRef}/portal`,
              ],
              [
                "08",
                "Contract & collection",
                preview
                  ? "/portal/preview/admin/agreement"
                  : `/admin/bookings/${activeRef}/agreement`,
              ],
              [
                "09",
                "Invoices & payments",
                preview
                  ? "/portal/preview/admin/payments"
                  : `/admin/bookings/${activeRef}/payments`,
              ],
              [
                "10",
                "Operations workbook",
                preview
                  ? "/portal/preview/admin/operations"
                  : `/admin/bookings/${activeRef}/operations`,
              ],
            ]
          : []),
      ]
    : bookingRef || preview
      ? [
          ["01", "Your overview", base],
          ["02", "Your contract details", `${base}/agreement`],
          ["03", "Agreements & approvals", `${base}/documents`],
          ["04", "Payments", `${base}/payments`],
          ["05", "Wedding planning", `${base}/planning`],
          ["06", "Your people & moodboard", `${base}/moodboard`],
          ["07", "Photos & films", `${base}/delivery`],
        ]
      : [["01", "Your weddings", "/portal"]];
  return (
    <nav
      className="wp-nav"
      aria-label={admin ? "Studio navigation" : "Wedding navigation"}
    >
      <p>{admin ? "Studio" : "Your wedding"}</p>
      {links.map(([n, label, href]) => {
        const current =
          pathname === href ||
          (href !== base &&
            href !== "/admin" &&
            href !== "/portal/preview/admin" &&
            pathname.startsWith(href + "/"));
        return (
          <Link
            key={label}
            href={href}
            aria-current={current ? "page" : undefined}
            className={current ? "is-active" : ""}
          >
            <span aria-hidden>{n}</span>
            {label}
          </Link>
        );
      })}
      {preview && (
        <Link
          className="wp-preview-switch"
          href={admin ? "/portal/preview" : "/portal/preview/admin"}
        >
          {admin ? "View client preview" : "View studio preview"} ↗
        </Link>
      )}
    </nav>
  );
}
