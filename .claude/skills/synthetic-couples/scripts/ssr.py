#!/usr/bin/env python3
"""
Semantic Similarity Rating scorer.

Projects free-text responses from synthetic couples onto a 1-5 Likert scale by
embedding similarity to anchor statements, following Maier et al. (2025),
"LLMs Reproduce Human Purchase Intent via Semantic Similarity Elicitation of
Likert Ratings" (arXiv:2510.08338), and matching the authors' reference
implementation at github.com/pymc-labs/semantic-similarity-rating.

The maths, per response text t against anchor set i:

    g(s_r, t) = (1 + cos(v_sr, v_t)) / 2
    p_i(r)   = [g(s_r,t) - min_r g + eps*d(argmin,r)] / [sum_r g - 5*min_r g + eps]
    p_i(r,T) = p_i(r)^(1/T), renormalised
    p(r)     = mean over anchor sets i
    P(r)     = mean over respondents

Usage:
    python3 ssr.py run.json [--out results.json]
    python3 ssr.py --selftest

Run `--selftest` to verify the maths against hand-computed values; it needs no
network and no API key.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import random
import sys
import urllib.error
import urllib.request
from pathlib import Path

try:
    import numpy as np
except ImportError:
    sys.exit("numpy is required:  pip install numpy")

HERE = Path(__file__).resolve().parent
SKILL_DIR = HERE.parent
DEFAULT_ANCHORS = SKILL_DIR / "assets" / "anchors.json"
DEFAULT_PERSONAS = SKILL_DIR / "assets" / "personas.json"

LIKERT = np.array([1, 2, 3, 4, 5], dtype=float)


# ─────────────────────────────── SSR core ────────────────────────────────────
# Kept free of I/O so --selftest can exercise exactly the code that runs for real.

def cosine_similarity_matrix(responses: np.ndarray, anchors: np.ndarray) -> np.ndarray:
    """(n_responses, dim) x (dim, 5) -> (n_responses, 5) similarities in [0,1].

    The (1+cos)/2 rescale is the reference implementation's, not a plain cosine.
    """
    if responses.shape[0] == 0:
        return np.empty((0, anchors.shape[1]))
    a = anchors / np.linalg.norm(anchors, axis=0)[None, :]
    r = responses / np.linalg.norm(responses, axis=1)[:, None]
    return (1.0 + r.dot(a)) / 2.0


def similarities_to_pmf(sim: np.ndarray, epsilon: float = 0.0) -> np.ndarray:
    """Min-subtract and normalise.

    Subtracting the row minimum is what makes this work at all: raw similarities
    between a response and five short anchor sentences differ only in the third
    decimal, so normalising them directly gives a near-flat distribution. The
    cost is that the least-similar anchor lands on exactly zero probability;
    epsilon offsets that. The paper leaves epsilon at 0.
    """
    sim = np.asarray(sim, dtype=float)
    if sim.shape[0] == 0:
        return np.empty_like(sim)
    sim_min = sim.min(axis=1, keepdims=True)
    numerator = sim - sim_min
    if epsilon > 0:
        numerator[np.arange(sim.shape[0]), np.argmin(sim, axis=1)] += epsilon
    denominator = sim.sum(axis=1, keepdims=True) - sim.shape[1] * sim_min + epsilon
    return numerator / denominator


def scale_pmfs(pmfs: np.ndarray, temperature: float) -> np.ndarray:
    """p^(1/T), renormalised. T<1 sharpens, T>1 smears. T=0 is one-hot at argmax."""
    pmfs = np.asarray(pmfs, dtype=float)
    if temperature == 1.0:
        return pmfs
    if temperature == 0.0:
        out = np.zeros_like(pmfs)
        out[np.arange(pmfs.shape[0]), np.argmax(pmfs, axis=1)] = 1.0
        uniform = np.all(pmfs == pmfs[:, :1], axis=1)
        out[uniform] = pmfs[uniform]
        return out
    scaled = pmfs ** (1.0 / temperature)
    return scaled / scaled.sum(axis=1, keepdims=True)


def response_pmfs(
    response_vecs: np.ndarray,
    anchor_sets: list[np.ndarray],
    temperature: float = 1.0,
    epsilon: float = 0.0,
) -> np.ndarray:
    """One PMF per response, averaged over every anchor set.

    Averaging across phrasings is not a detail: the paper is explicit that anchor
    wording shifts the mapping, and this is the mitigation.
    """
    per_set = [
        similarities_to_pmf(cosine_similarity_matrix(response_vecs, a), epsilon)
        for a in anchor_sets
    ]
    pmfs = np.array(per_set).mean(axis=0)
    return scale_pmfs(pmfs, temperature)


def mean_intent(pmf: np.ndarray) -> float:
    return float(np.dot(pmf, LIKERT))


# ───────────────────────────── embedding backends ────────────────────────────

def _post_json(url: str, payload: dict, headers: dict, timeout: int = 120) -> dict:
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")[:600]
        hint = ""
        if e.code in (401, 403):
            hint = (
                "\n\nThe key was rejected. Locally, export a valid OPENAI_API_KEY. In a Claude Code\n"
                "cloud session the proxy injects it, so check the credential is saved for this host.\n"
                "Or switch backend:  --backend local  (no key; needs pip install sentence-transformers)"
            )
        elif e.code == 429:
            hint = (
                "\n\nEither out of credits or rate limited. 'insufficient_quota' means the API account\n"
                "needs a balance - embeddings are about $0.0003 per test, so a small top-up lasts a long\n"
                "time. Otherwise wait and retry; already-embedded texts are cached, so a retry resumes\n"
                "rather than starting over. No-key alternative:  --backend local"
            )
        raise SystemExit(f"{url} returned HTTP {e.code}\n{body}{hint}") from None
    except urllib.error.URLError as e:
        raise SystemExit(f"Could not reach {url}: {e.reason}") from None


def embed_openai(texts: list[str], model: str = "text-embedding-3-small") -> np.ndarray:
    # In a Claude Code cloud session the proxy injects the real key, so a
    # placeholder in the header is correct and expected. Locally, export a real
    # OPENAI_API_KEY and it is used instead.
    key = os.environ.get("OPENAI_API_KEY") or "proxy-injected"
    out: list[list[float]] = []
    for i in range(0, len(texts), 256):
        batch = texts[i : i + 256]
        data = _post_json(
            "https://api.openai.com/v1/embeddings",
            {"model": model, "input": batch},
            {"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        )
        out.extend(d["embedding"] for d in sorted(data["data"], key=lambda d: d["index"]))
    return np.array(out, dtype=float)


def embed_voyage(texts: list[str], model: str = "voyage-3") -> np.ndarray:
    key = os.environ.get("VOYAGE_API_KEY") or "proxy-injected"
    out: list[list[float]] = []
    for i in range(0, len(texts), 128):
        data = _post_json(
            "https://api.voyageai.com/v1/embeddings",
            {"model": model, "input": texts[i : i + 128]},
            {"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        )
        out.extend(d["embedding"] for d in sorted(data["data"], key=lambda d: d["index"]))
    return np.array(out, dtype=float)


def embed_gemini(texts: list[str], model: str = "text-embedding-004") -> np.ndarray:
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or "proxy-injected"
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}"
        f":batchEmbedContents?key={key}"
    )
    out: list[list[float]] = []
    for i in range(0, len(texts), 100):
        payload = {
            "requests": [
                {"model": f"models/{model}", "content": {"parts": [{"text": t}]}}
                for t in texts[i : i + 100]
            ]
        }
        data = _post_json(url, payload, {"Content-Type": "application/json"})
        out.extend(e["values"] for e in data["embeddings"])
    return np.array(out, dtype=float)


def embed_local(texts: list[str], model: str = "all-MiniLM-L6-v2") -> np.ndarray:
    try:
        from sentence_transformers import SentenceTransformer
    except ImportError:
        raise SystemExit(
            "--backend local needs sentence-transformers:\n"
            "    pip install sentence-transformers\n"
            "(this is the default model in the paper authors' own package)"
        ) from None
    global _LOCAL_MODEL
    try:
        _LOCAL_MODEL
    except NameError:
        _LOCAL_MODEL = SentenceTransformer(model)
    return np.array(_LOCAL_MODEL.encode(texts), dtype=float)


BACKENDS = {
    "openai": (embed_openai, "text-embedding-3-small"),
    "voyage": (embed_voyage, "voyage-3"),
    "gemini": (embed_gemini, "text-embedding-004"),
    "local": (embed_local, "all-MiniLM-L6-v2"),
}


class Embedder:
    """Embeds with a disk cache, so re-scoring a run at a different temperature
    or epsilon costs nothing."""

    def __init__(self, backend: str, model: str | None, cache_path: Path | None):
        if backend not in BACKENDS:
            raise SystemExit(f"Unknown backend {backend!r}. Choose from: {', '.join(BACKENDS)}")
        self.fn, default_model = BACKENDS[backend]
        self.model = model or default_model
        self.backend = backend
        self.cache_path = cache_path
        self.cache: dict[str, list[float]] = {}
        if cache_path and cache_path.exists():
            try:
                self.cache = json.loads(cache_path.read_text())
            except (json.JSONDecodeError, OSError):
                self.cache = {}

    def _key(self, text: str) -> str:
        return hashlib.sha256(f"{self.backend}:{self.model}:{text}".encode()).hexdigest()

    def __call__(self, texts: list[str]) -> np.ndarray:
        missing = [t for t in texts if self._key(t) not in self.cache]
        if missing:
            uniq = list(dict.fromkeys(missing))
            vecs = self.fn(uniq, self.model)
            for t, v in zip(uniq, vecs):
                self.cache[self._key(t)] = list(map(float, v))
            if self.cache_path:
                try:
                    self.cache_path.write_text(json.dumps(self.cache))
                except OSError:
                    pass
        return np.array([self.cache[self._key(t)] for t in texts], dtype=float)


# ──────────────────────────────── analysis ───────────────────────────────────

def bootstrap_gap(
    by_persona: dict[str, dict[str, np.ndarray]],
    variant_a: str,
    variant_b: str,
    draws: int = 4000,
    seed: int = 20251009,
) -> tuple[float, float, float]:
    """Paired bootstrap over personas: (point estimate, lo, hi) at 90%.

    Personas are the sampling unit, and the same resampled personas are used for
    both variants, because the same couple reacting to A and to B is a paired
    observation. Treating responses as independent would understate the interval
    badly, and a panel this size needs an honest one - the whole point of the
    interval is to stop a 0.05 difference being read as a finding.
    """
    shared = [p for p, v in by_persona.items() if variant_a in v and variant_b in v]
    if len(shared) < 3:
        return (float("nan"), float("nan"), float("nan"))
    a = np.array([mean_intent(by_persona[p][variant_a]) for p in shared])
    b = np.array([mean_intent(by_persona[p][variant_b]) for p in shared])
    point = float(b.mean() - a.mean())
    rng = np.random.default_rng(seed)
    idx = rng.integers(0, len(shared), size=(draws, len(shared)))
    diffs = b[idx].mean(axis=1) - a[idx].mean(axis=1)
    return point, float(np.percentile(diffs, 5)), float(np.percentile(diffs, 95))


def bar(pmf: np.ndarray, width: int = 28) -> str:
    blocks = "▁▂▃▄▅▆▇█"
    top = max(pmf.max(), 1e-9)
    return " ".join(blocks[min(int(p / top * (len(blocks) - 1) + 0.5), len(blocks) - 1)] for p in pmf)


def load_json(path: Path, what: str) -> dict:
    if not path.exists():
        raise SystemExit(f"{what} not found: {path}")
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError as e:
        raise SystemExit(f"{what} is not valid JSON ({path}):\n  {e}") from None


# ───────────────────────────────── selftest ──────────────────────────────────

def selftest() -> int:
    """Verify against values derived by hand from the published formula.

    Anchors are the 5 standard basis vectors and the response is [1,2,3,4,5], so
    cos(r, e_k) = k/sqrt(55) and every step can be checked on paper. The formula
    collapses to exactly [0, 0.1, 0.2, 0.3, 0.4], mean 4.0.
    """
    ok = True

    def check(name: str, got, want, tol=1e-9):
        nonlocal ok
        good = np.allclose(got, want, atol=tol)
        ok &= good
        print(f"  {'PASS' if good else 'FAIL'}  {name}")
        if not good:
            print(f"        expected {np.round(want, 6)}\n        got      {np.round(got, 6)}")

    anchors = np.eye(5)
    resp = np.array([[1.0, 2.0, 3.0, 4.0, 5.0]])

    sim = cosine_similarity_matrix(resp, anchors)
    expected_sim = (1 + np.arange(1, 6) / np.sqrt(55.0)) / 2
    check("(1+cos)/2 similarity rescale", sim[0], expected_sim)

    pmf = similarities_to_pmf(sim)
    check("min-subtract + normalise -> [0,.1,.2,.3,.4]", pmf[0], [0.0, 0.1, 0.2, 0.3, 0.4])
    check("pmf sums to 1", pmf.sum(), 1.0)
    check("mean intent = 4.0", mean_intent(pmf[0]), 4.0)

    eps_pmf = similarities_to_pmf(sim, epsilon=0.1)
    gmin = expected_sim.min()
    denom = expected_sim.sum() - 5 * gmin + 0.1
    want_eps = (expected_sim - gmin + np.array([0.1, 0, 0, 0, 0])) / denom
    check("epsilon lifts the zero-probability anchor", eps_pmf[0], want_eps)

    t_half = scale_pmfs(pmf, 0.5)
    want_t = np.array([0.0, 0.01, 0.04, 0.09, 0.16]) / 0.30
    check("temperature T=0.5 sharpens as p^(1/T)", t_half[0], want_t)
    check("temperature T=1.0 is identity", scale_pmfs(pmf, 1.0)[0], pmf[0])

    averaged = response_pmfs(resp, [anchors, anchors])
    check("averaging identical anchor sets is a no-op", averaged[0], pmf[0])

    flipped = np.eye(5)[:, ::-1]
    mixed = response_pmfs(resp, [anchors, flipped])
    check("averaging opposed anchor sets gives a symmetric pmf",
          mixed[0], [0.2, 0.2, 0.2, 0.2, 0.2])

    check("empty input is handled", similarities_to_pmf(np.empty((0, 5))).shape, (0, 5))

    print("\n" + ("All checks passed - the maths matches the published formula."
                  if ok else "FAILURES above - do not trust results until fixed."))
    return 0 if ok else 1


# ────────────────────────────────── main ─────────────────────────────────────

def main() -> int:
    ap = argparse.ArgumentParser(
        description="Score synthetic-couple responses with Semantic Similarity Rating.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    ap.add_argument("run", nargs="?", help="run JSON file (see assets/run_template.json)")
    ap.add_argument("--out", help="write full results as JSON here")
    ap.add_argument("--construct", help="override the construct named in the run file")
    ap.add_argument("--anchors", default=str(DEFAULT_ANCHORS))
    ap.add_argument("--personas", default=str(DEFAULT_PERSONAS))
    ap.add_argument("--backend", default="openai", choices=list(BACKENDS))
    ap.add_argument("--model", help="override the embedding model for the backend")
    ap.add_argument("--temperature", type=float, default=1.0, help="SSR temperature T (paper: 1.0)")
    ap.add_argument("--epsilon", type=float, default=0.0, help="SSR epsilon (paper: 0.0)")
    ap.add_argument("--bootstrap", type=int, default=4000)
    ap.add_argument("--no-cache", action="store_true")
    ap.add_argument("--selftest", action="store_true", help="verify the maths offline and exit")
    args = ap.parse_args()

    if args.selftest:
        return selftest()
    if not args.run:
        ap.error("a run file is required (or use --selftest)")

    run_path = Path(args.run).resolve()
    run = load_json(run_path, "Run file")
    anchors_doc = load_json(Path(args.anchors), "Anchors file")
    personas_doc = load_json(Path(args.personas), "Personas file")
    persona_index = {p["id"]: p for p in personas_doc.get("personas", [])}

    construct = args.construct or run.get("construct", "booking_intent")
    if construct not in anchors_doc["constructs"]:
        raise SystemExit(
            f"Unknown construct {construct!r}. Available: "
            f"{', '.join(anchors_doc['constructs'])}"
        )
    cdef = anchors_doc["constructs"][construct]
    anchor_sets_text = cdef["sets"]

    variants = run.get("variants") or []
    if len(variants) < 2:
        print(
            "WARNING: fewer than two variants. SSR is validated for RANKING concepts, not for\n"
            "         absolute levels - a lone score has no safe interpretation. Add a comparison\n"
            "         (what is live today works well) before acting on this.\n",
            file=sys.stderr,
        )

    # Collect every text once so the whole run is a single embedding pass.
    texts: list[str] = []
    for a_set in anchor_sets_text.values():
        texts.extend(a_set)
    for v in variants:
        for r in v.get("responses", []):
            texts.append(r["text"])
    if not texts:
        raise SystemExit("No responses found in the run file.")

    cache_path = None if args.no_cache else run_path.with_suffix(".embcache.json")
    embed = Embedder(args.backend, args.model, cache_path)
    print(
        f"Embedding {len(set(texts))} unique texts with {embed.backend}/{embed.model} ...",
        file=sys.stderr,
    )
    vec_of = dict(zip(texts, embed(texts)))

    anchor_mats = [
        np.array([vec_of[s] for s in a_set]).T for a_set in anchor_sets_text.values()
    ]

    results: dict[str, dict] = {}
    by_persona: dict[str, dict[str, np.ndarray]] = {}

    for v in variants:
        vid = v["id"]
        responses = v.get("responses", [])
        if not responses:
            continue
        mat = np.array([vec_of[r["text"]] for r in responses])
        pmfs = response_pmfs(mat, anchor_mats, args.temperature, args.epsilon)

        grouped: dict[str, list[np.ndarray]] = {}
        for r, p in zip(responses, pmfs):
            grouped.setdefault(r.get("persona", "unknown"), []).append(p)
        # One PMF per persona first, so a couple who answered twice does not get
        # twice the weight in the panel.
        persona_pmfs = {pid: np.mean(ps, axis=0) for pid, ps in grouped.items()}
        for pid, p in persona_pmfs.items():
            by_persona.setdefault(pid, {})[vid] = p

        panel = np.mean(list(persona_pmfs.values()), axis=0)

        segments: dict[str, dict] = {}
        for pid, p in persona_pmfs.items():
            seg = persona_index.get(pid, {}).get("segment", "unclassified")
            segments.setdefault(seg, []).append(p)
        seg_summary = {
            s: {"n": len(ps), "mean": round(mean_intent(np.mean(ps, axis=0)), 3)}
            for s, ps in sorted(segments.items())
        }

        results[vid] = {
            "label": v.get("label", vid),
            "n_personas": len(persona_pmfs),
            "n_responses": len(responses),
            "distribution": [round(float(x), 4) for x in panel],
            "mean": round(mean_intent(panel), 3),
            "top_box": round(float(panel[4]) * 100, 1),
            "top_2_box": round(float(panel[3] + panel[4]) * 100, 1),
            "bottom_2_box": round(float(panel[0] + panel[1]) * 100, 1),
            "segments": seg_summary,
        }

    order = sorted(results, key=lambda k: results[k]["mean"], reverse=True)

    print(f"\n{'='*72}")
    print(f"  {run.get('run', run_path.stem)}")
    print(f"  construct: {construct}  |  \"{cdef['question']}\"")
    print(f"  {cdef['scale']}")
    print(f"  T={args.temperature}  eps={args.epsilon}  anchor sets={len(anchor_mats)}")
    print(f"{'='*72}\n")

    print(f"{'variant':<26} {'mean':>6} {'top2box':>8} {'bot2box':>8}  distribution 1→5")
    print("-" * 72)
    for vid in order:
        r = results[vid]
        print(
            f"{r['label'][:26]:<26} {r['mean']:>6.2f} {r['top_2_box']:>7.1f}% "
            f"{r['bottom_2_box']:>7.1f}%  {bar(np.array(r['distribution']))}"
        )
    print()

    gaps = []
    if len(order) >= 2:
        best = order[0]
        print("Gaps vs. best (paired bootstrap over personas, 90% interval):")
        for vid in order[1:]:
            point, lo, hi = bootstrap_gap(by_persona, vid, best, args.bootstrap)
            if np.isnan(point):
                print(f"  {results[best]['label']} vs {results[vid]['label']}: too few shared personas")
                continue
            verdict = "clears zero" if lo > 0 else "does NOT clear zero - treat as no detectable difference"
            print(
                f"  {results[best]['label'][:22]:<22} − {results[vid]['label'][:22]:<22} "
                f"= {point:+.3f}  [{lo:+.3f}, {hi:+.3f}]  {verdict}"
            )
            gaps.append(
                {"better": best, "worse": vid, "gap": round(point, 4),
                 "ci90": [round(lo, 4), round(hi, 4)], "clears_zero": bool(lo > 0)}
            )
        print()

    print("Segment means (n per segment in brackets - four couples is a hypothesis, not a finding):")
    all_segs = sorted({s for r in results.values() for s in r["segments"]})
    header = "  " + f"{'segment':<32}" + "".join(f"{results[v]['label'][:11]:>13}" for v in order)
    print(header)
    for s in all_segs:
        row = f"  {s[:32]:<32}"
        for v in order:
            cell = results[v]["segments"].get(s)
            text = f"{cell['mean']:.2f} (n={cell['n']})" if cell else "-"
            row += f"{text:>13}"
        print(row)

    print(
        "\nRead the free-text responses before acting. The scores say which variant won;\n"
        "only the responses say why, and the why is what you change.\n"
    )

    if args.out:
        payload = {
            "run": run.get("run", run_path.stem),
            "construct": construct,
            "question": cdef["question"],
            "parameters": {
                "temperature": args.temperature,
                "epsilon": args.epsilon,
                "backend": embed.backend,
                "model": embed.model,
                "anchor_sets": list(anchor_sets_text),
            },
            "variants": results,
            "ranking": order,
            "gaps": gaps,
        }
        Path(args.out).write_text(json.dumps(payload, indent=2))
        print(f"Full results written to {args.out}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
