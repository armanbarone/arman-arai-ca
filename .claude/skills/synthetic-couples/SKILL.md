---
name: synthetic-couples
description: Test a price, package, landing page, ad, or inquiry email on a synthetic panel of couples before it goes live, using Semantic Similarity Rating (SSR) to turn their free-text reactions into 1-5 booking-intent distributions plus the objections behind them. Use this whenever a change to the offer or the copy is on the table — repricing a package, adding or cutting inclusions, rewriting a hero section or landing page, drafting ads or inquiry-reply emails, naming a tier, choosing between two versions of anything — or when the question sounds like "would couples actually book this?", "is C$5,999 too much for Whistler?", "which of these two headlines pulls harder?", "who is this losing?", or "what would put a couple off about this page?". Works for both Arman Arai elopement curation and StillVows wedding photography.
---

# Synthetic couples: concept testing by Semantic Similarity Rating

Before a price or a page goes live, put it in front of a panel of synthetic couples, let them
react in their own words, and project those words onto a 1-5 booking-intent scale.

This implements Maier et al. (2025), *LLMs Reproduce Human Purchase Intent via Semantic Similarity
Elicitation of Likert Ratings* (arXiv:2510.08338, PyMC Labs + Colgate-Palmolive). Their finding, in
one line: **ask an LLM for a number and you get mush; ask it to talk and then measure the talk, and
you recover 90% of human test-retest reliability.** `references/method.md` has the mechanism, the
evidence, and the limits. Read it before the first run of a session, and any time a result looks
surprising enough to act on.

## The rule that keeps this honest

**Never test one thing alone. Always run at least two variants and report the gap between them.**

The paper's validated claim is that SSR ranks concepts the way a real panel ranks them. It makes no
claim that an absolute score predicts a real-world conversion rate — and their anchors were hand-fitted
to 57 surveys of *personal care products sold to US panels*, which is not this business. So:

- "B beats A by 0.42 on a 30-couple panel, and the Rockies segment drives all of it" — defensible.
- "This page will convert at 78%" — not defensible. Don't write sentences like that.

If someone asks for a single verdict on a single thing, construct the comparison yourself: test it
against what is live today, or against a deliberately weaker and a deliberately stronger version.
A number with nothing beside it will be over-trusted, and that is the main way this tool can do harm.

## Workflow

### 1. Frame the test

Decide the **construct** (what you are measuring) and write **two or more concept cards**.

Constructs available in `assets/anchors.json`:

| construct | question put to the couple | use it for |
|---|---|---|
| `booking_intent` | "How likely are you to book this?" | prices, packages, inclusions, whole offers |
| `inquiry_intent` | "Would you reach out about this?" | landing pages, ads, hero sections — the real funnel step |
| `value_for_money` | "Does this feel worth the money?" | price changes where the offer is unchanged |
| `relevance` | "Is this for couples like you?" | positioning, targeting, which city or tier to push |
| `trust` | "How much do you trust this person with your wedding day?" | about pages, reviews, credentials, new-market credibility |

Pick `inquiry_intent` for copy and `booking_intent` for offers. Mixing them is the commonest
mistake — a page can be great at starting conversations and the package behind it still be a hard sell.

A concept card is what the couple actually sees. Write it the way they would meet it in the wild:
for a package, the name, price, hours, and inclusions as the site words them; for a page, the real
copy. Keep variants identical apart from the one thing under test, or you will not know what moved
the number. `references/business.md` has the current ladder for both businesses — read prices from
there rather than recalling them, because they have drifted before.

### 2. Draw the panel

Read `assets/personas.json`. It holds the segments that actually inquire with these two businesses,
grounded in the real markets and price points.

Default panel: **30 personas, 2 samples each**. Drop to 12 x 1 for a quick read, go to 60 x 2 when a
real price change rides on it. The paper found n=2 samples per respondent enough for stable results.

Sample across segments rather than taking the first N — a panel of only Rockies adventure couples
will love a Banff package and tell you nothing. For a test specific to one market, weight toward it
but keep some outsiders in: the couples who say no are where the objections come from.

### 3. Let each couple talk

This is the step that does the work, so it is worth doing carefully.

For each persona, for each variant, write **2-4 sentences in first person** answering the construct's
question, in that couple's own voice and vocabulary.

Three things make or break the result:

**Never mention the scale.** The persona must not see, think about, or reference a 1-5 rating, a
score, or "how likely on a scale of". The entire premise is that the number is measured from
unconstrained language afterwards. A response that says "I'd give this a 4" has destroyed its own
measurement.

**Stay inside the persona's constraints.** Their budget, their city, who is paying, how far along
their planning is, what they have already seen elsewhere. The paper is blunt about this: strip the
demographics out and correlation with real data collapses from 92% to 50%, because an unprimed model
just likes everything. The constraints are not decoration — they *are* the signal.

**Let them be unimpressed.** Real couples find things expensive, confusing, generic, or not for them.
Synthetic panels are useful precisely because they are less polite than human ones. If every response
is warm, the panel has stopped measuring and started flattering — rewrite with the constraints
foregrounded.

Guard against the responses contaminating each other:

- Do one variant completely, then the next. A persona answering variant B should be answering B on
  its own terms, not scoring it against A.
- Do not let a response refer to another persona, another variant, or the test itself.
- Write each persona's two samples as genuinely separate reactions — a different thing caught their
  eye, not a paraphrase of the same sentence.

Write them into a run file shaped like `assets/run_template.json`. Repeat a `persona` id to add a
second sample for that couple.

### 4. Score it

```bash
cd .claude/skills/synthetic-couples        # paths below are relative to the skill directory
python3 scripts/ssr.py run.json --out results.json
```

Useful flags: `--construct` (defaults to the one named in the run file), `--personas` to point at a
different library, `--temperature` / `--epsilon` for the SSR levers (defaults T=1.0, eps=0.0 as in the
paper), `--no-cache` to force re-embedding.

The script embeds every response with `text-embedding-3-small`, compares it to six anchor sets,
averages the resulting distributions, and reports per-variant distributions, means, top-2-box,
segment splits, and bootstrap confidence intervals on every gap. Run `python3 scripts/ssr.py --selftest`
if you ever want to confirm the maths still matches the authors' reference implementation; it needs no
network.

If it reports no embedding backend, see "Setup" at the bottom.

### 5. Read it properly

The script prints what matters, but read it with these in mind:

- **The gap and its interval are the finding.** If the 90% interval on the gap straddles zero, the
  honest answer is "no detectable difference on this panel", and saying so is a real result — it means
  the thing under test is not where the leverage is. Say that rather than reaching for the point estimate.
- **Top-2-box moves differently from the mean.** A variant can lift the mean by pulling 2s up to 3s
  while producing no new bookings. Top-2-box is the closer proxy for someone actually inquiring.
- **Trust the age and budget splits more than the rest.** The paper replicated age and income patterns
  against real humans well; gender and region it did not. Treat a segment split with four couples in
  it as a hypothesis to go look at, not a finding.
- **Read the free text, always.** The quantitative result tells you *that* B won. Only the responses
  tell you *why*, and the why is what you actually change. The paper found synthetic rationales richer
  and more critical than the human ones they were compared against — this is the part of the output
  with the most value per token, and it is wasted if you only look at the score.

### 6. Report

```markdown
## [What was tested]
**Panel:** N couples, M responses, construct, date

### Result
| Variant | Mean | Top-2-box | Distribution |
|---|---|---|---|
[one row per variant, best first]

**[A] vs [B]:** +X.XX [90% CI: lo, hi] — [does this clear zero or not]

### What moved it
[2-4 findings drawn from the free text, each with a quoted response as evidence]

### Objections worth fixing
[the recurring ones, with how often they came up]

### Segments
[only where a split is large enough to mean something — name the n]

### What I'd do
[recommendation, scoped to what the evidence supports]

### Caveats
[always: synthetic panel, relative not absolute, anchors uncalibrated against this business's own
data — plus anything specific to this run]
```

## When not to use this

- **Legal, tax, or insurance wording.** A synthetic panel has an opinion about how it reads. That is
  not the question.
- **Anything where you already have real data.** Thirty real inquiries beat three hundred synthetic
  ones. Use this where real data is absent or too slow — early concepts, pages not yet live, prices
  not yet offered.
- **Fine-grained price laddering.** Testing C$3,999 against C$4,099 is below the resolution of this
  method. Test steps couples would actually notice.
- **Markets the model knows little about.** The paper is explicit that SSR works where the model has
  seen abundant real discussion. Wedding photography, Banff, the Amalfi Coast — well covered. An
  obscure micro-market with no online footprint — treat results as fiction.

## Making it better over time

The anchors here are written from the paper's design principles, not fitted to this business. Once
there are 20-30 real inquiries or bookings with known outcomes, they can be calibrated against reality
and the whole instrument gets sharper. `references/calibration.md` has that procedure, and it is worth
doing — it is the difference between a plausible tool and a measured one.

## Setup

Embeddings need a key for `api.openai.com`. In a Claude Code cloud session the proxy injects it, so
the script works with no environment variable set. Running locally, export your own:

```bash
export OPENAI_API_KEY=sk-...
```

Cost is negligible — a 30-couple, 2-variant test embeds roughly 15,000 tokens, about $0.0003.

Alternative backends if preferred: `--backend voyage` (needs `VOYAGE_API_KEY`), `--backend gemini`
(needs `GEMINI_API_KEY`), or `--backend local`, which uses `sentence-transformers` with
`all-MiniLM-L6-v2` — the default in the authors' own package — and needs no key but does need
`pip install sentence-transformers`.

## Files

- `references/method.md` — how SSR works, what the paper proved, where it breaks. Read once per session.
- `references/business.md` — the current offer ladder, prices, and markets for both businesses.
- `references/calibration.md` — fitting the anchors to real inquiry data once it exists.
- `assets/personas.json` — the panel library.
- `assets/anchors.json` — anchor statement sets per construct.
- `assets/run_template.json` — the input shape.
- `scripts/ssr.py` — the scorer. `--selftest` checks its maths offline.
- `evals/` — three test cases, runnable with `claude plugin eval . --allow-tools Write,Edit,Bash`.

This skill is committed to **both** repositories — `arman-arai-dark-20260506` (elopement) and
`arman-arai-ca` (StillVows) — so it loads whichever site is being worked on. They are copies, so a
change to one belongs in the other in the same session; `business.md` in particular goes stale
silently, and a stale price means every test downstream measures a product that does not exist.
