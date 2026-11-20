import assert from "node:assert/strict";
import test from "node:test";
import inquiries from "../supabase/functions/_shared/inquiries.js";

test("expert registrations accept profile fields and stay in the private database", async t => {
  const registration = { kind: "expert", name: "A".repeat(160), email: "Applicant@example.test",
    requestId: "10000000-0000-4000-8000-000000000001",
    data: { expertRegistration: "true", department: "growth-studio", experience: "Campaign planning.",
      availability: "Weekdays", timeZone: "", portfolio: "" } };
  const crm = { UPSTASH_REDIS_REST_URL: "https://redis.example.test", UPSTASH_REDIS_REST_TOKEN: "fixture",
    KLEXFORD_INQUIRY_WEBHOOK: "https://crm.example.test" };
  const env = { ...crm, SUPABASE_URL: "https://project.example.test", SUPABASE_SECRET_KEY: "fixture" };
  let recorded, outcome = "created";
  t.mock.method(globalThis, "fetch", async (url, init) => {
    assert.equal(String(url), env.SUPABASE_URL + "/rest/v1/rpc/record_inquiry");
    recorded = JSON.parse(init.body);
    return Response.json(outcome);
  });
  async function submit(body, environment = env) {
    const res = { setHeader() {}, status(code) { this.code = code; return this; }, json(payload) { this.body = payload; } };
    await inquiries({ method: "POST", headers: { "content-type":"application/json" }, body }, res, environment);
    return res.code;
  }
  for (const patch of [
    { expertRegistration: "false" }, { availability: "" }, { experience: "Q".repeat(601) },
    { department: "unknown-specialty" }, { portfolio: "http://example.test/me" },
    { portfolio: "https://name:secret@example.test/me" },
    { password: "test-only" }, { role: "admin" }, { active: "true" },
  ]) {
    assert.equal(await submit({ ...registration, data: { ...registration.data, ...patch } }), 400);
  }
  assert.equal(await submit({ ...registration, name: "A".repeat(161) }), 400);
  assert.equal(await submit({ ...registration, name: "user@example.test" }), 400);
  assert.equal(await submit({ ...registration, password: "test-only" }), 400);
  assert.equal(await submit(registration, crm), 503);
  assert.equal(recorded, undefined);
  assert.equal(await submit(registration), 201);
  assert.equal(await submit({ ...registration, name: "Art@Studio" }), 201);
  assert.equal(recorded.contact_email, "applicant@example.test");
  assert.deepEqual(recorded.details, { ...registration.data, source: "/become-an-expert", owner: "Collaboration coordinator" });
  outcome = "duplicate";
  assert.equal(await submit(registration), 200);
  outcome = "limited";
  assert.equal(await submit(registration), 429);
});
