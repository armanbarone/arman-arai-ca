"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveBookingAction, sendInviteAction } from "@/app/admin/actions";
import { blankBookingInput } from "@/lib/portal/blank";
import {
  PACKAGES,
  PROVINCES,
  TIMEZONES,
  defaultTaxesFor,
} from "@/lib/portal/presets";
import {
  collectionFor,
  collectionBookingFields,
  initialContractDetails,
} from "@/lib/portal/contract-details";
import {
  computeTotals,
  buildSchedule,
  todayInBusinessTz,
  formatCad,
} from "@/lib/portal/money";
import { defaultPlanning } from "@/lib/portal/planning";
import {
  templateFor,
  defaultDocumentFields,
  resolveBlocks,
} from "@/lib/portal/wedding";
import type { Booking } from "@/lib/portal/types";
import { useWeddingPreview } from "./WeddingPreviewProvider";
import { Card, Eyebrow, buttonCls } from "./Shell";
export default function WeddingQuickCreate({
  preview = false,
}: {
  preview?: boolean;
}) {
  const router = useRouter(),
    context = useWeddingPreview(),
    [value, setValue] = useState(blankBookingInput()),
    [invite, setInvite] = useState(false),
    [error, setError] = useState(""),
    [pending, start] = useTransition();
  const set = (fn: (v: typeof value) => void) =>
    setValue((old) => {
      const v = structuredClone(old);
      fn(v);
      return v;
    });
  const create = () =>
    start(async () => {
      setError("");
      if (
        value.clients.some(
          (c) =>
            c.legalName.trim().length < 3 || !/^\S+@\S+\.\S+$/.test(c.email),
        ) ||
        value.clients[0].email.toLowerCase() ===
          value.clients[1].email.toLowerCase() ||
        !value.event.date ||
        !value.event.location
      ) {
        setError(
          "Enter both names, distinct emails, wedding date and municipality.",
        );
        return;
      }
      if (preview && context) {
        const at = new Date().toISOString(),
          year = value.event.date.slice(0, 4),
          number =
            Math.max(
              0,
              ...context.bookings
                .filter((b) => b.ref.startsWith(`AA-CA-${year}-`))
                .map((b) => Number(b.ref.split("-").at(-1))),
            ) + 1,
          ref = `AA-CA-${year}-${String(number).padStart(3, "0")}`;
        const b: Booking = {
          ...structuredClone(value),
          schema: 1,
          ref,
          createdAt: at,
          updatedAt: at,
          status: "draft",
          internalNotes: value.internalNotes || "",
          remindersPaused: value.remindersPaused || false,
          eventType: "wedding",
          clients: value.clients.map((c, i) => ({
            ...c,
            email: c.email.toLowerCase(),
            id: `sample-${ref}-${i}`,
          })) as Booking["clients"],
          event: {
            ...value.event,
            serviceDates: value.event.serviceDates || value.event.date,
            timezone: TIMEZONES[value.event.province],
          },
          totals: computeTotals(value.lines, value.taxes),
          schedule: [],
          planning: defaultPlanning(value.event.date, {
            film: value.packageKey === "photo-film",
            album: value.packageKey !== "signature",
          }),
          payments: [],
          events: [
            {
              at,
              type: "practice_wedding_created",
              actor: "studio@example.com",
            },
          ],
          wedding: { documents: [], forms: {} },
        };
        b.schedule = buildSchedule(b, todayInBusinessTz());
        b.wedding!.intake = {
          values: initialContractDetails(b),
          status: "draft",
          updatedAt: at,
          actor: "studio@example.com",
        };
        for (const key of ["proposal", "agreement"]) {
          const t = templateFor(key, b),
            fields = defaultDocumentFields(t, b);
          b.wedding!.documents.push({
            id: `${key}-${ref}`,
            templateKey: key,
            title: t.title,
            version: 1,
            status: "draft",
            createdAt: at,
            fields,
            blocks: resolveBlocks(t, fields),
            requiredEmails: [],
            signatures: [],
          });
        }
        context.addBooking(b);
        router.push("/portal/preview/admin/booking");
        return;
      }
      const result = await saveBookingAction(null, value);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (invite) {
        const replies = await Promise.all(
          value.clients.map((c) => sendInviteAction(result.ref, c.email)),
        );
        if (replies.some((r) => !r.ok)) {
          router.push(`/admin/bookings/${result.ref}?invite=retry`);
          return;
        }
      }
      router.push(`/admin/bookings/${result.ref}`);
    });
  return (
    <>
      <Eyebrow>New wedding & contract</Eyebrow>
      <h1>Create a wedding.</h1>
      <p className="wp-lead">
        Start with the couple and collection. Their private portal, payment
        schedule, proposal and agreement drafts are created together. They can
        enter their remaining details themselves.
      </p>
      <div className="wp-doc-grid">
        {value.clients.map((c, i) => (
          <Card key={i}>
            <h2>{i === 0 ? "Bride / partner 1" : "Groom / partner 2"}</h2>
            <label className="wp-label">
              Full legal name
              <input
                className="wp-input"
                value={c.legalName}
                onChange={(e) =>
                  set((v) => {
                    v.clients[i].legalName = e.target.value;
                  })
                }
              />
            </label>
            <label className="wp-label">
              Email address
              <input
                className="wp-input"
                type="email"
                value={c.email}
                onChange={(e) =>
                  set((v) => {
                    v.clients[i].email = e.target.value;
                  })
                }
              />
            </label>
            <label className="wp-label">
              Preferred name (optional)
              <input
                className="wp-input"
                value={c.preferredName}
                onChange={(e) =>
                  set((v) => {
                    v.clients[i].preferredName = e.target.value;
                  })
                }
              />
            </label>
          </Card>
        ))}
      </div>
      <Card>
        <h2>The wedding</h2>
        <div className="wp-doc-grid">
          <label className="wp-label">
            Wedding date
            <input
              className="wp-input"
              type="date"
              value={value.event.date}
              onChange={(e) =>
                set((v) => {
                  v.event.date = e.target.value;
                  v.event.serviceDates = e.target.value;
                  Object.assign(
                    v.fields,
                    collectionBookingFields(
                      collectionFor(v.packageKey)!,
                      e.target.value,
                    ),
                  );
                })
              }
            />
          </label>
          <label className="wp-label">
            Municipality
            <input
              className="wp-input"
              value={value.event.location}
              onChange={(e) =>
                set((v) => {
                  v.event.location = e.target.value;
                })
              }
            />
          </label>
          <label className="wp-label">
            Province or territory
            <select
              className="wp-input"
              value={value.event.province}
              onChange={(e) =>
                set((v) => {
                  v.event.province = e.target.value;
                  v.taxes = defaultTaxesFor(e.target.value);
                })
              }
            >
              {PROVINCES.map((p) => (
                <option value={p.code} key={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="wp-label">
            Collection
            <select
              className="wp-input"
              value={value.packageKey}
              onChange={(e) =>
                set((v) => {
                  const pkg = PACKAGES.find((p) => p.key === e.target.value)!;
                  v.packageKey = pkg.key;
                  v.packageName = pkg.name;
                  v.lines[0].label = pkg.name;
                  v.lines[0].cents = pkg.priceCents!;
                  v.allocation = pkg.allocation;
                  const tier = collectionFor(pkg.key);
                  if (tier)
                    Object.assign(
                      v.fields,
                      collectionBookingFields(tier, v.event.date),
                    );
                })
              }
            >
              {PACKAGES.filter((p) => p.key !== "custom").map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name} · {formatCad(p.priceCents!)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p>
          You can customize the quote, coverage and deliverables after creating
          the wedding.
        </p>
        <label className="wp-checkbox">
          <input
            type="checkbox"
            checked={invite}
            onChange={(e) => setInvite(e.target.checked)}
          />
          Email each partner their own private portal invitation
        </label>
        <button className={buttonCls} disabled={pending} onClick={create}>
          {pending
            ? "Creating…"
            : invite
              ? "Create wedding & email invitations"
              : "Create wedding & contract drafts →"}
        </button>
      </Card>
      {error && (
        <p className="wp-message wp-message-error" role="alert">
          {error}
        </p>
      )}
      {preview && (
        <p className="wp-muted">
          Practice only. This creates a separate sample wedding in this browser
          and sends no email.
        </p>
      )}
    </>
  );
}
