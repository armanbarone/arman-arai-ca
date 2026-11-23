# Calibrating the panel against reality

The anchors in `assets/anchors.json` were written from the paper's design principles. They have not
been fitted to anything. The paper's own anchors were "manually optimised for the 57 surveys subject
to this study", and the authors say plainly that it "remains elusive how well they would perform for
other surveys."

So: this instrument is currently *plausible*, not *measured*. Everything below turns the first into
the second. Until it is done, the honest framing in every report is "ranking signal, uncalibrated
levels".

## What you need before starting

**20-30 real inquiries with known outcomes.** Both businesses already capture the raw material — the
inquiry form, the Calendly bookings, the portal, the attribution capture. What matters is pairing each
inquiry with what happened next:

| field | why |
|---|---|
| what they saw | which page, price and city — the concept they actually reacted to |
| what they wrote | their own words in the inquiry; this is the gold standard for response style |
| outcome | inquired only / call booked / quoted / booked / went elsewhere |
| if lost, why | in their words if you have it, your read if not |
| their circumstances | city, budget signal, timeline, guest count, who is paying |

Thirty rows is enough to start. Sixty is comfortable. This is the single highest-value thing to
collect, because it feeds every step below.

## Step 1: fix the response style first

Before touching anchors, check that synthetic couples *write* like real ones.

Take ten real inquiry messages. Take ten synthetic responses to the same concept. Read them side by
side. The usual failure is that synthetic couples are too articulate, too complete, and too fair —
they name three pros and two cons in balanced sentences. Real inquiries are shorter, lopsided,
fixated on one thing (the date, the price, whether you have shot at their venue), and frequently
ignore most of what the page said.

If they do not match, fix the response-writing guidance in `SKILL.md` before anything else. Anchors
calibrated against unrealistic responses will faithfully measure the wrong thing — and this is the
cheapest fix available, because it needs no new data at all.

## Step 2: get real responses onto the same scale

For each real inquiry, assign the booking intent its message actually expressed — not the outcome,
the *intent at the time of writing*. "Are you free on the 14th?" is a 4 or 5. "Just gathering prices
for next summer" is a 2 or 3. Rate them yourself; you know these couples better than any model does.

Keep the rationale for anything you rate 1, 2 or 5. Extremes carry most of the calibration signal and
are the easiest to second-guess later.

## Step 3: check the anchors against those ratings

Score the real inquiry texts through `ssr.py` exactly as if they were synthetic:

```bash
python3 scripts/ssr.py real-inquiries.json --out real-scored.json
```

Compare SSR's mean per message with your own rating. Three things to look for:

**Systematic offset.** If SSR reads every message ~0.6 high, the anchors sit low relative to how these
couples write. Rewrite the anchor statements in the voice of your actual inquiries, not in survey
English.

**Compression.** If your ratings span 1-5 and SSR spans 2.8-4.1, the anchors are too close together
semantically. Push the end anchors further apart — the lowest to something flatly dismissive, the
highest to something unambiguously committed.

**Specific misreads.** A message you rated 2 that scores 4.3 is the most informative row in the table.
Read which anchor it latched onto. Usually a polite opener ("this looks lovely, but…") is dominating a
short message, which tells you the anchors are measuring warmth rather than intent.

## Step 4: fit T and epsilon

Only once the anchors read correctly. These are the paper's two levers, left at T=1.0 and eps=0.0
there, with the note that optima sit near T=1.

```bash
for T in 0.6 0.8 1.0 1.2 1.6; do
  echo "T=$T"; python3 scripts/ssr.py real-inquiries.json --temperature $T | head -12
done
```

Pick the T whose output distribution best matches the distribution of your own ratings. The embedding
cache means the sweep costs nothing after the first run. Raise epsilon above 0 only if the zero-probability
anchor is visibly distorting short messages.

Record the chosen values and use them for every subsequent test, or results stop being comparable
across runs.

## Step 5: build personas from real couples

Replace invented personas with derived ones. For each distinct real couple, write a persona using
their actual city, budget signal, timeline and stated concern — then write the `voice` field from how
they actually wrote.

Keep the segment labels stable so results stay comparable over time. Retire an invented persona when a
real one covers the same ground; keep `wedding-price-led-06` or an equivalent regardless, because a
panel needs someone who says no.

## Step 6: the test that actually matters

Hold back five real concepts whose real-world outcome you know — a price that worked, one that didn't,
a page that converted, one that didn't. Run them as a single multi-variant test and check whether SSR
ranks them the way reality did.

This is the paper's own success criterion (correlation attainment), scaled down. If the ranking comes
out right, you have a calibrated instrument and can raise your confidence in its verdicts accordingly.
If it comes out wrong, you have learned something more valuable than any individual test would have
told you — and the right response is to go back to step 1, not to adjust the test.

## Keeping it honest afterwards

Re-run step 6 whenever the offer changes materially, and note the calibration date in reports. A panel
calibrated against 2026 inquiries will quietly drift as the market, the pricing and the portfolio move.
When reporting from a calibrated panel, say so and say when — "calibrated against 34 inquiries,
March 2027" is worth far more to a future reader than a confident number with no provenance.
