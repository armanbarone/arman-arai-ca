import { requireAdmin } from "@/lib/portal/auth";
import WeddingLibrary from "@/components/portal/WeddingLibrary";
export default async function Library(){await requireAdmin();return <WeddingLibrary/>;}
