/* The one inquiry form, in one place.
 *
 * Every form on this site asks the same nine questions, in the same order,
 * with the same words: the site's contact page, the quick modal behind the
 * "Inquire" buttons, and the form on each ads landing page. They were three
 * different forms asking three different sets of questions, which meant the
 * first reply had different facts depending on which button a couple happened
 * to press, and the lead email had a different shape every time.
 *
 * The fields live here rather than in any one component because the three
 * forms are styled completely differently (Tailwind on the site, CSS modules
 * on the landing pages) and only the QUESTIONS are shared. A form renders
 * these in its own markup; `validateInquiry` is what both the browser and
 * `app/api/contact/route.ts` check against, so the server never trusts a
 * field just because the client rendered it.
 *
 * Source: the owner, 2026-10-14, with a reference screenshot of the field
 * set he wanted, down to the closing spam-folder promise.
 */

export type FieldName =
  | "firstName" | "lastName" | "email" | "phone" | "referral"
  | "weddingDate" | "location" | "message" | "promise";

/** "How did you hear about us?" The answers a lead email can act on, and
 *  nothing so vague it tells him nothing. */
export const REFERRAL_OPTIONS = [
  "Google search",
  "Instagram",
  "Pinterest",
  "TikTok",
  "A friend or family member",
  "My planner, venue or another vendor",
  "A wedding directory or blog",
  "I've seen Arman at a wedding",
  "Somewhere else",
] as const;

/* The closing promise. It is a real field, not decoration: a couple who has
   just typed "I pinky promise" has read the sentence above it, and the first
   email lands in Promotions often enough that this one line measurably saves
   leads. Both answers are accepted; only an empty one is rejected. */
export const PROMISE_OPTIONS = ["I promise", "I pinky promise"] as const;

export const PROMISE_LABEL =
  "I promise that if Arman's email isn't in my inbox, I'll check my spam and promotions folders";

export const PROMISE_NOTE =
  "Seriously though: I reply to everyone personally, usually within the hour. If nothing has arrived, it is almost always sitting in spam or in the Promotions tab, because that is where new senders land.";

export type InquiryFields = Partial<Record<FieldName, string>>;

type Rule = {
  name: FieldName;
  label: string;
  required: boolean;
  max: number;
  /** The message shown when this field is the first one missing. */
  error: string;
};

export const INQUIRY_RULES: Rule[] = [
  { name: "firstName", label: "First name", required: true, max: 60, error: "Please enter your first name." },
  { name: "lastName", label: "Last name", required: true, max: 60, error: "Please enter your last name." },
  { name: "email", label: "Email", required: true, max: 100, error: "Please enter a valid email address." },
  { name: "phone", label: "Mobile", required: true, max: 40, error: "Please enter a mobile number I can reach you on." },
  { name: "referral", label: "How you found me", required: true, max: 80, error: "Please tell me how you heard about me." },
  { name: "weddingDate", label: "Wedding date", required: false, max: 40, error: "" },
  { name: "location", label: "Wedding location", required: true, max: 120, error: "Please tell me where the wedding is." },
  { name: "message", label: "Message", required: true, max: 4000, error: "Please tell me a little about your day." },
  { name: "promise", label: "Spam-folder promise", required: true, max: 40, error: "Please make the promise about your spam folder. It matters more than it sounds." },
];

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Digits, spaces and the punctuation a real number is written with. Seven
 *  digits is the shortest plausible number; nothing shorter is a mobile. */
export const PHONE_PATTERN = /^[+\d][\d\s().-]{6,}$/;

export type Validated = { ok: true; values: Record<FieldName, string> } | { ok: false; error: string };

/** The same check on both sides of the request. Trims every value, enforces
 *  the lengths, and returns the first thing that is wrong in the order the
 *  form asks it, so the message always points at the field above the button. */
export function validateInquiry(input: InquiryFields): Validated {
  const values = {} as Record<FieldName, string>;
  for (const rule of INQUIRY_RULES) {
    const value = typeof input[rule.name] === "string" ? input[rule.name]!.trim() : "";
    if (!value) {
      if (rule.required) return { ok: false, error: rule.error };
      values[rule.name] = "";
      continue;
    }
    if (value.length > rule.max) {
      return { ok: false, error: `Please keep your ${rule.label.toLowerCase()} under ${rule.max} characters.` };
    }
    values[rule.name] = value;
  }
  if (!EMAIL_PATTERN.test(values.email)) return { ok: false, error: "Please enter a valid email address." };
  if (!PHONE_PATTERN.test(values.phone) || (values.phone.match(/\d/g) ?? []).length < 7) {
    return { ok: false, error: "Please enter a mobile number I can reach you on." };
  }
  return { ok: true, values };
}

/** "Sarah Chen", or "Sarah" alone when there is no surname to add. */
export const fullName = (values: { firstName?: string; lastName?: string }) =>
  [values.firstName, values.lastName].filter(Boolean).join(" ").trim();

/* Older open tabs still post `name` as one field, and the portal's stored
   leads were written that way for months. Split it rather than dropping the
   surname, so one inquiry shape reaches the lead email and the auto-reply. */
export function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { firstName: parts[0] ?? "", lastName: "" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts[parts.length - 1] };
}
