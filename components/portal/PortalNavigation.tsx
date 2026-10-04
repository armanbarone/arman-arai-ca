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
  const links = admin
    ? [
        ["01", "Overview", preview ? "/portal/preview/admin" : "/admin"],
        [
          "02",
          "New wedding",
          preview ? "/portal/preview/admin/new" : "/admin/bookings/new",
        ],
      ]
    : bookingRef || preview
      ? [
          ["01", "Your overview", base],
          ["02", "Agreements & approvals", `${base}/documents`],
          ["03", "Payments", `${base}/payments`],
          ["04", "Wedding planning", `${base}/planning`],
          ["05", "Photos & films", `${base}/delivery`],
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
