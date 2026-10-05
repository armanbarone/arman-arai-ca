import { requireAdmin } from "@/lib/portal/auth";
import { REF_PATTERN } from "@/lib/portal/store";
import WeddingStudioGuide from "@/components/portal/WeddingStudioGuide";
export default async function Guide({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  await requireAdmin();
  const { ref } = await searchParams;
  return (
    <WeddingStudioGuide
      bookingRef={ref && REF_PATTERN.test(ref) ? ref : undefined}
    />
  );
}
