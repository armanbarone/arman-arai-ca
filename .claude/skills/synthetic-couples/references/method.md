# Semantic Similarity Rating: the method, the evidence, and the limits

Source: Benjamin F. Maier, Ulf Aslak, Luca Fiaschi, Nina Rismal, Kemble Fletcher, Christian C.
Luhmann, Robbie Dow, Kli Pappas, Thomas V. Wiecki (2025). *LLMs Reproduce Human Purchase Intent via
Semantic Similarity Elicitation of Likert Ratings.* arXiv:2510.08338v3. PyMC Labs and
Colgate-Palmolive. Reference implementation: https://github.com/pymc-labs/semantic-similarity-rating

## The problem it solves

Ask an LLM "rate this product 1 to 5" and it answers 3. Almost always 3, occasionally 2 or 4,
essentially never 1 or 5. The paper measured this: direct Likert rating produced distributions whose
similarity to real human distributions was **0.26** (GPT-4o) and **0.39** (Gemini 2.0 Flash) on a
0-1 scale. Real panels, by contrast, answer mostly 4 and 5.

The instinct is to fix this by telling the model to use the whole scale. The paper tried that, and it
is worth knowing what happened: distributions got better and **ranking accuracy got worse**. The model
over-corrected, spreading its answers to satisfy the instruction while losing the signal about which
concept was actually better — which was the entire point of asking. A prompt patch moved the symptom,
not the cause.

The cause is the elicitation format. A single integer forces the model to collapse a nuanced reaction
into one token, and the safest token wins. So: don't ask for the number.

## The method

1. **Give the LLM a persona.** Demographics and circumstances of a specific consumer.
2. **Show it the concept.** The product, the price, what it includes.
3. **Ask it to talk.** "How likely are you to purchase the product?" — free text, no scale mentioned,
   kept brief.
4. **Embed the answer.** The paper used OpenAI `text-embedding-3-small`; `text-embedding-3-large`
   left results "virtually unchanged". The authors' own package defaults to the local
   `all-MiniLM-L6-v2`.
5. **Embed five anchor statements**, one per Likert point, forming a gradient from "purchase
   improbable" to "purchase probable".
6. **Turn similarity into a distribution** (formula below).
7. **Average over six anchor sets** — different phrasings of the same gradient — to stop any one set's
   wording from driving the result.
8. **Average over respondents** to get the panel distribution.

The output is a probability distribution over 1-5 per respondent, not a point estimate. That is the
second idea in the paper and it matters: a response like "I'd probably buy it, the price isn't bad"
genuinely sits between 4 and 5, and forcing it to one of them throws away real information.

## The formula

For response text *t* and anchor statements σ₁..σ₅ in set *i*:

```
γ(σ_r, t) = (1 + cos(v_σr, v_t)) / 2            similarity rescaled to [0,1]

p_i(r) ∝ γ(σ_r, t) − min_r γ(σ_r, t) + ε·δ_{ℓ,r}    ℓ = argmin_r γ

           γ(σ_r,t) − γ_min + ε·δ_{ℓ,r}
p_i(r) =  ─────────────────────────────
             Σ_r γ(σ_r,t) − 5·γ_min + ε

p_i(r, T) ∝ p_i(r)^(1/T)                         renormalised

p(r) = (1/m) Σ_i p_i(r, T)                       m = 6 anchor sets

P(r) = (1/N) Σ_respondents p(r)                  the panel distribution
```

**Why subtract the minimum.** In embedding space, "It's very unlikely that I'd buy it" and "It's very
likely that I'd buy it" are numerically close — both are short English sentences about buying. Raw
cosine similarities across the five anchors differ in the third decimal place, so normalising them
directly yields an almost flat distribution carrying no signal. Subtracting the smallest similarity
rescales the spread to fill the range. It is the step that makes the method work, and it has a visible
cost: the least-similar anchor gets exactly zero probability. ε exists to offset that; the paper
leaves it at 0.

**The levers.** ε = 0 and T = 1 throughout the paper, with the note that T = 1 is "a reasonable rule
of thumb" and that optima for both correlation and distributional similarity sit near it. T < 1 sharpens
each response toward its best-matching anchor; T > 1 smears it. Leave them alone unless calibrating
against real data (see `calibration.md`).

## What was actually demonstrated

57 personal-care product-concept surveys run by Colgate-Palmolive, 150-400 US participants each,
9,300 human responses in total. Real mean purchase intent across surveys: 4.0 ± 0.1 — a narrow band,
which is why the paper measures success against a test-retest ceiling rather than against a raw
correlation of 1.0.

**Correlation attainment (ρ)** — how much of the maximum achievable correlation was recovered, where
the maximum is estimated by splitting each real survey into two halves and correlating them:

| method | GPT-4o | Gemini 2.0 Flash |
|---|---|---|
| Direct Likert rating | ~80% | ~80% |
| Follow-up Likert (talk, then self-rate) | 85% | 90% |
| **SSR** | **90%** | **~90%** |

**Distributional similarity (KS similarity, 0-1):**

| method | GPT-4o | Gemini 2.0 Flash |
|---|---|---|
| Direct Likert rating | 0.26 | 0.39 |
| Follow-up Likert | 0.72 | 0.59 |
| **SSR** | **0.88** | **0.80** |

A supervised LightGBM model trained on half the real surveys reached ρ = 65%, against SSR's 88% with
no training data at all.

**Demographics are load-bearing.** Removing them from the persona prompt produced distributions that
looked *better* (KS 0.91, and mean PI matching the real 4.0 ± 0.1 exactly) while correlation
attainment fell from 92% to **50%**. The model rated everything positively and stopped discriminating
between concepts. A synthetic panel that produces beautiful-looking distributions can be measuring
nothing — distribution shape alone is not evidence the instrument works.

**What reproduced human behaviour:** age (concave — younger and older couples rate lower than
middle), income (personas primed with budget pressure rated lower), product category, price tier,
concept source.

**What did not:** gender, region, ethnicity. Subgroup conclusions along those lines are not supported.

**Generalisation beyond purchase intent:** one test on "How relevant was the concept?" with three
purpose-built anchor sets reached ρ = 82%, KS = 0.81. So other constructs work, but each needs its
own anchors and each is less proven than purchase intent.

## Limits that matter here

Stated by the authors, and each one bites in a wedding-photography context:

1. **Anchor wording changes the mapping.** Averaging over six sets mitigates it; it does not remove
   it. And their six sets were *manually optimised against those 57 surveys* — the authors say plainly
   that it "remains elusive how well they would perform for other surveys." The anchors in
   `assets/anchors.json` are written from the paper's design principles and have not been fitted to
   anything. This is the single biggest reason to read gaps rather than levels.

2. **Validity depends on the model having seen real discussion of the domain.** SSR worked for oral
   care because forums and reviews about toothpaste are abundant in training data. Weddings,
   photographer pricing, Banff, the Amalfi Coast are well covered. A new micro-market with no online
   footprint is not, and no amount of method fixes that.

3. **Human survey data was treated as ground truth** — data the paper itself describes as noisy and
   subject to satisficing, acquiescence, and positivity bias. 90% of test-retest reliability is 90% of
   a moving target.

4. **Synthetic consumers are more spread out than real ones.** Where a product is weak, LLM personas
   rate it lower than humans do. Useful for discriminating between concepts, misleading if read as a
   forecast of real-world response.

5. **No budget constraints, no cultural context, no marketing exposure.** A synthetic couple cannot
   actually run out of money, and has not spent six months being shown competitors' Instagram.

6. **A validated US personal-care panel is not a Canadian wedding panel.** Nothing in the paper
   licenses the absolute numbers produced here. The transferable claim is the mechanism: textual
   elicitation plus semantic projection ranks concepts better than asking for a number.

## Why this is still worth running

The alternative is not a real survey — it is a guess. Running a change past thirty constructed
couples with explicit budgets and circumstances, and reading what they object to, is a sharper
instrument than intuition, and it costs minutes. Keep the claims proportional to that and the tool
earns its place.
