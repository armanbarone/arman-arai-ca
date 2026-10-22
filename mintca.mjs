import fs from 'fs';
import crypto from 'crypto';
for (const l of fs.readFileSync('.env.local','utf8').split(/\r?\n/)) {
  const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g,'');
}
const b64url = (b) => Buffer.from(b).toString('base64url');
const email = (process.env.ADMIN_EMAILS||'').split(',')[0].trim().toLowerCase();
const payload = { k:'session', e: email, r:'admin', x: Date.now() + 1000*60*60*8, j: b64url(crypto.randomBytes(9)) };
const body = b64url(JSON.stringify(payload));
const sig = b64url(crypto.createHmac('sha256', process.env.PORTAL_SECRET).update(body).digest());
process.stdout.write(`${body}.${sig}`);
