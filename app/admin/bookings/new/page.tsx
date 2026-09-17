import BookingForm from "@/components/portal/BookingForm";
import { blankBookingInput } from "@/lib/portal/blank";
import { Eyebrow } from "@/components/portal/Shell";

export const metadata = { title: "New booking" };

export default function NewBookingPage() {
  return (
    <div>
      <Eyebrow>Canadian elopement</Eyebrow>
      <h1 className="mb-8 font-serif text-4xl font-light">New booking</h1>
      <BookingForm initial={blankBookingInput()} bookingRef={null} />
    </div>
  );
}
