import Link from "next/link";

export interface CalendarRow {
  date: string;
  kind: "wedding" | "backup" | "commitment";
  label: string;
  ref?: string;
  href?: string;
}

/* The year at a glance. A wedding photographer sells dates, so the one thing
   the studio could not see anywhere was which of them are gone. Twelve months
   from this month, only the months that have something in them. */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function StudioCalendar({
  entries,
  today,
}: {
  entries: CalendarRow[];
  today: string;
}) {
  const ahead = entries.filter((e) => e.date >= today);
  const months = new Map<string, CalendarRow[]>();
  for (const e of ahead) {
    const key = e.date.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), e]);
  }

  if (ahead.length === 0)
    return (
      <div className="wp-empty">
        <h2>Nothing in the diary yet</h2>
        <p>
          Weddings appear here once a booking is past draft, with their weather
          backup dates beside them. Those are the dates the website stops
          offering to new couples.
        </p>
      </div>
    );

  return (
    <div className="wp-calendar">
      {[...months.entries()].map(([key, rows]) => {
        const [y, m] = key.split("-").map(Number);
        return (
          <section key={key} className="wp-cal-month">
            <h3>
              {MONTHS[m - 1]} <span>{y}</span>
            </h3>
            <ul>
              {rows.map((e, i) => {
                const dayNum = Number(e.date.slice(8, 10));
                const weekday = new Date(`${e.date}T12:00:00Z`).toLocaleDateString("en-CA", {
                  weekday: "short",
                  timeZone: "UTC",
                });
                const body = (
                  <>
                    <span className="wp-cal-day">
                      <strong>{dayNum}</strong>
                      <small>{weekday}</small>
                    </span>
                    <span className="wp-cal-what">
                      {e.label}
                      {e.ref && <small>{e.ref}</small>}
                    </span>
                    <span className={`wp-cal-tag is-${e.kind}`}>
                      {e.kind === "wedding" ? "Wedding" : e.kind === "backup" ? "Backup held" : "Committed"}
                    </span>
                  </>
                );
                return (
                  <li key={`${e.date}-${i}`} className={`wp-cal-row is-${e.kind}`}>
                    {e.href ? <Link href={e.href}>{body}</Link> : <div>{body}</div>}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
