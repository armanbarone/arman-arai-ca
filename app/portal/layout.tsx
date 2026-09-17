import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Client portal", template: "%s | Arman Arai portal" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
};

export const dynamic = "force-dynamic";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
