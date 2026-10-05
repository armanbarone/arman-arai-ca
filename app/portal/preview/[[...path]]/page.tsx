import { notFound } from "next/navigation";
import { demoEnabled, sampleWedding } from "@/lib/portal/demo";
import { WeddingPreviewProvider } from "@/components/portal/WeddingPreviewProvider";
import WeddingPreviewRoutes from "@/components/portal/WeddingPreviewRoutes";
export const metadata = { title: "Wedding portal design preview" };
export default async function Preview({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  if (!demoEnabled()) notFound();
  const { path = [] } = await params;
  return (
    <WeddingPreviewProvider initial={sampleWedding()}>
      <WeddingPreviewRoutes path={path} />
    </WeddingPreviewProvider>
  );
}
