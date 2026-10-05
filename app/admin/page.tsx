import { listBookings } from "@/lib/portal/store";
import { studioRow } from "@/lib/portal/studio";
import WeddingStudioOverview from "@/components/portal/WeddingStudioOverview";
export default async function AdminHome() {
  return <WeddingStudioOverview rows={(await listBookings()).map(studioRow)} />;
}
