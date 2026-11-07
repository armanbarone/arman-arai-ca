"use client";
import { useEffect, useState, type FormEvent } from "react";
import { dateLabel, timeLabel } from "@/lib/christmas/catalog";
import { SANTA_CHOICES, type FamilyQuestionnaire as Answers } from "@/lib/christmas/questionnaire-schema";
import "./christmas.css";
const empty: Answers = { peopleCount: 3, attendees: "", children: [], outfits: "", mustHavePhotos: "", santaComfort: "unsure", comfortNotes: "", interests: "", treats: "yes", allergyNotes: "", accessNotes: "", letterNames: "", questions: "", consent: true };
type Details = { date: string; time: string; name: string; letterNames: string; answers: Answers | null; submittedAt?: number; confirmationUrl: string };
export default function FamilyQuestionnaire({ preview = false }: { preview?: boolean }) {
  const [details, setDetails] = useState<Details | null>(preview ? { date: "2026-11-21", time: "10:00", name: "Alex", letterNames: "Sam and Riley", answers: null, confirmationUrl: "/christmas/confirmation/preview" } : null);
  const [answers, setAnswers] = useState<Answers>({ ...empty, letterNames: preview ? "Sam and Riley" : "" });
  const [consent, setConsent] = useState(false), [busy, setBusy] = useState(false), [saved, setSaved] = useState(false), [error, setError] = useState("");
  useEffect(() => {
    if (preview) return;
    let active = true;
    const p = new URLSearchParams(location.search), slot = p.get("slot") ?? "", token = p.get("token") ?? "";
    if (!slot || !token) { setError("Open the private questionnaire link in your booking email."); return; }
    fetch(`/api/christmas/questionnaire?slot=${encodeURIComponent(slot)}&token=${encodeURIComponent(token)}`, { cache: "no-store", referrerPolicy: "no-referrer" }).then(async r => {
      const d = await r.json(); if (!r.ok) throw Error(d.error || "This private questionnaire link could not be opened.");
      if (active) { setDetails(d); setAnswers(d.answers ?? { ...empty, letterNames: d.letterNames }); }
    }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [preview]);
  function value<K extends keyof Answers>(key: K, val: Answers[K]) { setAnswers(a => ({ ...a, [key]: val })); }
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(""); setBusy(true);
    if (preview) { setSaved(true); setBusy(false); return; }
    try {
      const p = new URLSearchParams(location.search);
      const r = await fetch("/api/christmas/questionnaire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slot: p.get("slot"), token: p.get("token"), answers: { ...answers, consent } }) });
      const d = await r.json(); if (!r.ok) throw Error(d.error || "Your answers could not be saved."); setSaved(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); }
    finally { setBusy(false); }
  }
  return <div className="xm xm-family"><div className="xm-family-card">
    {preview && <p className="xm-preview-bar">SAMPLE QUESTIONNAIRE · No answers are sent or saved</p>}
    <a className="xm-brand" href="/christmas">Christmas at Arman’s</a>
    <p className="xm-eyebrow">YOUR FAMILY · YOUR CHRISTMAS VISIT</p>
    <h1>{saved ? "Thank you." : "A little about"}<br /><em>{saved ? "We’ve got your details." : "your family."}</em></h1>
    {!details && !error && <p role="status">Opening your private questionnaire…</p>}
    {details && <p>{dateLabel(details.date, { weekday: "long", month: "long", day: "numeric" })} · {timeLabel(details.time)} Pacific</p>}
    {saved ? <><p>{preview ? "This is a sample. No answers were saved." : "Your answers are saved for Arman to use when planning your session. Your appointment remains confirmed."}</p><p>You can use this same private link to update your answers before your visit.</p><button className="xm-button" onClick={() => setSaved(false)}>Edit my answers ↗</button>{details && <p><a href={details.confirmationUrl}>Back to your booking ↗</a></p>}</>
    : details && <><p>This short form helps us plan for your family. Approximate ages are enough; dates of birth aren’t needed. Food and access notes are optional—share only what helps us prepare.</p><form className="xm-family-form" onSubmit={submit}>
      <fieldset><legend>1 · Who’s joining us?</legend>
        <label>How many people will be photographed?<input type="number" min={1} max={12} required value={answers.peopleCount} onChange={e => value("peopleCount", Number(e.target.value))} /></label>
        {answers.peopleCount > 5 && <p className="xm-form-note">Your package covers one household of up to five. Please contact Arman before the session so we can discuss a larger group.</p>}
        <label>Who is coming, and how are you related?<textarea required maxLength={1000} value={answers.attendees} onChange={e => value("attendees", e.target.value)} placeholder="For example: Alex and Taylor (parents), Sam and Riley (children). First names are enough." /></label>
        <p>Children’s first names and approximate ages. If no children are coming, leave this section empty.</p>
        {answers.children.map((child, i) => <div className="xm-child-row" key={i}><label>Child’s first name<input required maxLength={60} value={child.firstName} onChange={e => value("children", answers.children.map((c, n) => n === i ? { ...c, firstName: e.target.value } : c))} /></label><label>Approximate age<input maxLength={30} value={child.age} placeholder="e.g. 18 months or 6 years" onChange={e => value("children", answers.children.map((c, n) => n === i ? { ...c, age: e.target.value } : c))} /></label><button type="button" className="xm-small-button" aria-label={`Remove child ${i + 1}`} onClick={() => value("children", answers.children.filter((_, n) => n !== i))}>Remove</button></div>)}
        <button type="button" className="xm-small-button" disabled={answers.children.length >= 10} onClick={() => value("children", [...answers.children, { firstName: "", age: "" }])}>+ Add a child</button>
        <label>Names and spelling for Santa’s letter<input required maxLength={160} value={answers.letterNames} onChange={e => value("letterNames", e.target.value)} /></label>
      </fieldset>
      <fieldset><legend>2 · The photographs you have in mind</legend>
        <label>What clothes or colours are you thinking of wearing?<textarea maxLength={1500} value={answers.outfits} onChange={e => value("outfits", e.target.value)} placeholder="Outfits, colours, Christmas pyjamas, or a keepsake you’d love to include." /></label>
        <p className="xm-form-note">Cream, burgundy, olive and warm neutrals suit the sets. Comfortable clothes and coordinated colours work well; everyone does not need to match.</p>
        <label>Any must-have photographs or family groupings?<textarea maxLength={1500} value={answers.mustHavePhotos} onChange={e => value("mustHavePhotos", e.target.value)} placeholder="For example: all of us together, siblings, each child with Santa, a portrait with grandparents." /></label>
      </fieldset>
      <fieldset><legend>3 · A comfortable visit</legend>
        <label>How does your family feel about meeting Santa?<select value={answers.santaComfort} onChange={e => value("santaComfort", e.target.value as Answers["santaComfort"])}>{Object.entries(SANTA_CHOICES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label>What helps your children feel comfortable? (optional)<textarea maxLength={1500} value={answers.comfortNotes} onChange={e => value("comfortNotes", e.target.value)} placeholder="A parent nearby, a little distance from Santa, quieter music, a comfort toy, or taking it slowly. No medical details are needed." /></label>
        <label>Favourite interests, characters or things Santa can talk about (optional)<textarea maxLength={1000} value={answers.interests} onChange={e => value("interests", e.target.value)} /></label>
        <label>Cookies and warm milk<select value={answers.treats} onChange={e => value("treats", e.target.value as Answers["treats"])}><option value="yes">Yes, please</option><option value="skip">Please skip the treats</option><option value="discuss">Please discuss ingredients with us first</option></select></label>
        <label>Food allergies or dietary notes you want us to know (optional)<textarea maxLength={1000} value={answers.allergyNotes} onChange={e => value("allergyNotes", e.target.value)} /></label>
        <label>Arrival or access requests (optional)<textarea maxLength={1000} value={answers.accessNotes} onChange={e => value("accessNotes", e.target.value)} placeholder="Anything we should discuss before you arrive. You do not need to share a diagnosis." /></label>
        <label>Anything else you’d like to ask or tell Arman? (optional)<textarea maxLength={1500} value={answers.questions} onChange={e => value("questions", e.target.value)} /></label>
      </fieldset>
      <label className="xm-activity-consent"><input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} /><span>I am the booking adult or parent/guardian and agree to share these answers with Arman Arai to plan this session. Optional food and access notes stay private. This does not grant permission to publish our photographs.</span></label>
      {error && <p className="xm-error" role="alert">{error}</p>}<button className="xm-button" disabled={busy}>{busy ? "Saving…" : details.submittedAt ? "Update our details" : "Send our details"} ↗</button><p className="xm-small">Your appointment is already confirmed. This form does not take a payment.</p>
    </form></>}
    {!details && error && <p className="xm-error" role="alert">{error}</p>}<p className="xm-small">Questions? <a href="mailto:i@armanarai.com">i@armanarai.com</a></p>
  </div></div>;
}
