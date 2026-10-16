import { redirect } from "next/navigation";

/* This route used to re-export the studio dashboard, so the same page lived at
   two URLs and nothing linked to this one. Kept as a redirect rather than
   deleted, so an old bookmark still lands somewhere real. */
export default function ClientsPage() {
  redirect("/admin");
}
