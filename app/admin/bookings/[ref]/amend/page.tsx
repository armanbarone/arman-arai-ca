import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getBooking} from '@/lib/portal/store';
import {existingBookingInput} from '@/lib/portal/blank';
import BookingForm from '@/components/portal/BookingForm';
export default async function AmendmentPage({params}:{params:Promise<{ref:string}>}){const{ref}=await params,b=await getBooking(ref);if(!b)notFound();return <><Link className="wp-back" href={`/admin/bookings/${ref}`}>← Wedding workspace</Link><h1>Prepare a booking revision</h1><p className="wp-lead">Set the exact revised date, coverage, price and payment terms. You will review and countersign the change order before either client is asked to sign.</p><BookingForm initial={existingBookingInput(b)} bookingRef={ref} amendment/></>;}
