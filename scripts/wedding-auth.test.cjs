const test = require("node:test"),
  assert = require("node:assert/strict"),
  { loader } = require("./wedding-test-loader.cjs");
process.env.PORTAL_SECRET = "test-only-secret-is-long-enough-for-hmac-signing";
process.env.ADMIN_EMAILS = "i@armanarai.com";
const pure = loader(),
  token = pure("@/lib/portal/token"),
  b = pure("@/lib/portal/demo").sampleWedding();
function authFixture() {
  let cookie = "",
    sets = 0;
  const used = new Set();
  class ConflictError extends Error {}
  const load = loader({
    "next/headers": {
      cookies: async () => ({
        get: () => ({ value: cookie }),
        set: (_, v) => {
          cookie = v;
          sets++;
        },
        delete: () => {
          cookie = "";
        },
      }),
      headers: async () => new Headers(),
    },
    "next/navigation": {
      redirect: (url) => {
        throw Error("Redirect " + url);
      },
      notFound: () => {
        throw Error("Not found");
      },
    },
    "./store": {
      ConflictError,
      getBooking: async (ref) => (ref === b.ref ? b : null),
      listBookings: async () => [b],
      readJson: async () => null,
      writeJson: async (k) => {
        if (used.has(k)) throw new ConflictError();
        used.add(k);
      },
    },
    "./email": {},
  });
  return {
    auth: load("@/lib/portal/auth"),
    get sets() {
      return sets;
    },
    async session(email, role = "client") {
      cookie = await token.signToken({
        k: "session",
        e: email,
        r: role,
        x: Date.now() + 60000,
        j: "session",
      });
    },
  };
}
test("session tokens reject tampering, expiry and wrong token kinds", async () => {
  const payload = {
    k: "session",
    e: "maya@example.com",
    r: "client",
    x: Date.now() + 60000,
    j: "t",
  };
  const t = await token.signToken(payload);
  assert((await token.verifyToken(t, "session")).e === payload.e);
  assert.equal(await token.verifyToken(t + "x", "session"), null);
  assert.equal(await token.verifyToken(t, "login"), null);
  assert.equal(
    await token.verifyToken(
      await token.signToken({ ...payload, x: 1 }),
      "session",
    ),
    null,
  );
});
test("booking access and studio access are enforced on the server", async () => {
  const f = authFixture();
  await f.session("maya@example.com");
  assert((await f.auth.requireBookingAccess(b.ref)).booking.ref === b.ref);
  await assert.rejects(f.auth.requireAdmin(), /Redirect/);
  await f.session("stranger@example.com");
  await assert.rejects(f.auth.requireBookingAccess(b.ref), /Not found/);
  await f.session("i@armanarai.com", "admin");
  assert((await f.auth.requireAdmin()).role === "admin");
  await f.session("removed@example.com", "admin");
  assert.equal(await f.auth.getSession(), null);
});
test("login links are consumed once; external and malformed next destinations are rejected", async () => {
  const f = authFixture(),
    t = await token.signToken({
      k: "login",
      e: "maya@example.com",
      r: "client",
      x: Date.now() + 60000,
      j: "once",
      n: "/portal",
    });
  assert.equal(await f.auth.consumeLoginToken(t), "/portal");
  assert.equal(await f.auth.consumeLoginToken(t), null);
  assert.equal(f.sets, 1);
  for (const s of [
    "https://evil.example",
    "//evil.example",
    "/portal\\evil",
    "/portalevil",
    "/admin\nLocation: evil",
  ])
    assert.equal(f.auth.safeNext(s), undefined);
  assert.equal(
    f.auth.safeNext("/portal/AA-CA-2027-001/documents"),
    "/portal/AA-CA-2027-001/documents",
  );
});
