import assert from "node:assert/strict";
import { test } from "node:test";
import inquiries from "../api/inquiries.js";
import invitations from "../api/invite-expert.js";
import project from "../config/public-supabase.json" with { type: "json" };

const origin = project.siteOrigin;
const host = new URL(origin).host;
const production = { VERCEL_ENV: "production" };

async function call(handler, env, overrides = {}) {
  const req = {
    method: "GET",
    ...overrides,
    headers: { host, origin, "content-type": "application/json", ...overrides.headers },
  };
  const res = {
    headers: {},
    status(code) {
      this.code = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    json(data) {
      this.body = data;
    },
  };
  await handler(req, res, env);
  return res;
}

test("production discovers both Edge endpoints only for the configured Klexford site and project", async () => {
  assert.deepEqual((await call(inquiries, production)).body, { live: true, edge: true });
  assert.deepEqual((await call(invitations, production)).body, { edge: true });
  for (const [env, headers] of [
    [{}, {}],
    [{ VERCEL_ENV: "preview" }, {}],
    [{ ...production, VITE_SUPABASE_URL: "https://other.example.test" }, {}],
    [production, { host: "unrelated.example.test" }],
  ]) {
    assert.deepEqual((await call(inquiries, env, { headers })).body, { live: false });
    assert.deepEqual((await call(invitations, env, { headers })).body, { edge: false });
  }
  const server = { ...production, SUPABASE_URL: project.url, SUPABASE_SECRET_KEY: "private-fixture" };
  assert.deepEqual((await call(inquiries, server)).body, { live: true });
  assert.deepEqual((await call(invitations, server)).body, { edge: false });
  const crm = {
    ...production,
    UPSTASH_REDIS_REST_URL: "redis-fixture",
    UPSTASH_REDIS_REST_TOKEN: "local-fixture",
    KLEXFORD_INQUIRY_WEBHOOK: "crm-fixture",
  };
  assert.deepEqual((await call(inquiries, crm)).body, { live: true });
  assert.deepEqual((await call(invitations, crm)).body, { edge: true });
});

test("legacy inquiry submission redirects with its method and body preserved", async () => {
  const res = await call(inquiries, production, { method: "POST" });
  assert.equal(res.code, 307);
  assert.equal(res.headers.Location, project.url + "/functions/v1/klexford-workspace/inquiries");
});

test("POST-only invitation clients retain authorization through the compatibility endpoint", async (t) => {
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    requests.push({ url, options });
    return Response.json({ message: "Invitation sent." }, { status: 201 });
  });
  const options = {
    method: "POST",
    body: { email: "expert@example.test", name: "Expert" },
    headers: { authorization: "Bearer session-fixture", "x-forwarded-for": "untrusted" },
  };
  assert.equal((await call(invitations, production, { method: "POST" })).code, 401);
  assert.equal(
    (
      await call(invitations, production, {
        ...options,
        headers: { ...options.headers, origin: "https://other.example.test" },
      })
    ).code,
    403,
  );
  assert.equal(requests.length, 0);
  const res = await call(invitations, production, options);
  assert.equal(res.code, 201);
  assert.equal(res.body.message, "Invitation sent.");
  assert.equal(requests.length, 1);
  const { url, options: forwarded } = requests[0];
  assert.equal(url, project.url + "/functions/v1/klexford-workspace/invite-expert");
  assert.deepEqual(forwarded.headers, {
    Authorization: "Bearer session-fixture",
    "Content-Type": "application/json",
    Origin: origin,
  });
  assert.deepEqual(JSON.parse(forwarded.body), options.body);
  assert.equal(forwarded.redirect, "error");
});

test("the relay returns private invite links only for successful link creation", async (t) => {
  const fixture = "https://project.example.test/auth/v1/verify?type=invite&token=fake";
  let status = 201;
  t.mock.method(globalThis, "fetch", () => Response.json({ message: "Fixture", inviteUrl: fixture }, { status }));
  const options = {
    method: "POST",
    body: { name: "Fixture", email: "expert@example.test", delivery: "link" },
    headers: { authorization: "Bearer session-fixture" },
  };
  assert.equal((await call(invitations, production, options)).body.inviteUrl, fixture);
  status = 403;
  assert.equal((await call(invitations, production, options)).body.inviteUrl, undefined);
  status = 201;
  assert.equal((await call(invitations, production, { ...options, body: { ...options.body, delivery: "email" } })).body.inviteUrl, undefined);
});
