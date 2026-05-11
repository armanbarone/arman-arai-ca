# StillVows — Wedding Photography Website

Built with **Next.js 15**, **Tailwind CSS**, and **TypeScript**.

---

## Getting Started

```bash
npm install
npm run dev
```

---

## Setting Up Email (REQUIRED for the inquiry form to work)

The inquiry popup and contact form send emails using [Resend](https://resend.com).

### Step 1 — Create a Resend account
Go to [resend.com](https://resend.com) and sign up (free, no credit card needed).

### Step 2 — Get your API key
In the Resend dashboard: **API Keys → Create API Key → Copy it**

### Step 3 — Add it to Vercel
1. Go to your project on [vercel.com](https://vercel.com)
2. Click **Settings → Environment Variables**
3. Add: `RESEND_API_KEY` = `re_xxxxxxxxxxxx` (your key)
4. Click **Save** and then **Redeploy**

### Step 4 (Optional) — Verify your domain
By default, emails send from `onboarding@resend.dev` (Resend's shared sender). 
To send from `noreply@armanarai.com`, verify your domain in Resend's dashboard and update `app/api/contact/route.ts`:

```ts
from: "StillVows <noreply@armanarai.com>",
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home |
| `/about` | About Arman |
| `/portfolio` | Page-flip photo album |
| `/destination` | Destination weddings + FAQ |
| `/stories` | Client testimonials |
| `/contact` | Full inquiry form |

---

## Adding / Swapping Images

Every image slot has its URL defined at the top of each page file as a constant. Just replace the URL string:

```tsx
// In app/page.tsx
const HERO_MAIN = "https://your-new-image.jpg";
```

---

## Color Palette

| Name | Hex |
|------|-----|
| Ivory | `#F7F3EC` |
| Linen | `#EDE7DA` |
| Parchment | `#D9CEBC` |
| Blush | `#C9A89A` |
| Rose | `#A67268` |
| Ink | `#2C2420` |
| Cream | `#FAF7F2` |
