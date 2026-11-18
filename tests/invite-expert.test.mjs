import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import inviteExpert from "../api/invite-expert.js";

test("only an active administrator can send an expert invitation", async (t) => {
  let profile = { role: "admin", active: true };
  let existing = [];
  let invitation;
  const user = { id: "10000000-0000-4000-8000-000000000001", email: "owner@example.test" };
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    res.setHeader("Content-Type", "application/json");
    if (url.pathname === "/auth/v1/user") {
      if (req.headers.authorization === "Bearer user-session") return res.end(JSON.stringify(user));
      res.writeHead(401);
      return res.end(JSON.stringify({ message: "Invalid session" }));
    }
    if (url.pathname === "/rest/v1/profiles")
      return res.end(JSON.stringify(url.searchParams.has("id") ? [profile] : existing));
    if (url.pathname === "/auth/v1/invite") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      invitation = { body: JSON.parse(Buffer.concat(chunks)), redirect: url.searchParams.get("redirect_to") };
      return res.end(JSON.stringify({ id: "20000000-0000-4000-8000-000000000002" }));
    }
    res.writeHead(404);
    res.end();
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const origin = "https://studio.example.test";
  const env = {
    SUPABASE_URL: "http://127.0.0.1:" + server.address().port,
    SUPABASE_SECRET_KEY: "server-fixture",
    PUBLIC_SITE_ORIGIN: origin,
  };
  const body = { name: "New expert", email: "invitee@example.test" };
  async function invoke(bearer = "user-session") {
    const res = {
      code: 0,
      setHeader() {},
      status(code) {
        this.code = code;
        return this;
      },
      json() {},
    };
    await inviteExpert(
      {
        body,
        method: "POST",
        headers: {
          authorization: "Bearer " + bearer,
          origin,
          host: "studio.example.test",
          "content-type": "application/json",
        },
      },
      res,
      env,
    );
    return res.code;
  }
  assert.equal(await invoke("expired-session"), 401);
  profile = { role: "expert", active: true };
  assert.equal(await invoke(), 403);
  profile = { role: "admin", active: false };
  assert.equal(await invoke(), 403);
  assert.equal(invitation, undefined);
  profile = { role: "admin", active: true };
  existing = [user];
  assert.equal(await invoke(), 409);
  assert.equal(invitation, undefined);
  existing = [];
  assert.equal(await invoke(), 201);
  assert.equal(invitation.redirect, origin + "/account/password");
  assert.equal(invitation.body.email, body.email);
  assert.deepEqual(invitation.body.data, { display_name: body.name });
});

test("manual links are issued only to administrators for brand-new invitees and trusted redirects", async (t) => {
  const project = "https://project.example.test";
  const origin = "https://studio.example.test";
  const redirectTo = origin + "/account/password";
  const email = "new-expert@example.test";
  const action = new URL("/auth/v1/verify", project);
  action.search = new URLSearchParams({ token: "fake-test-token", type: "invite", redirect_to: redirectTo });
  let sessionUser = { role: "expert", active: true };
  let exists = false;
  let calls = 0;
  let returnedUrl = action.href;
  let newUser = true;
  t.mock.method(globalThis, "fetch", async (url, init) => {
    const target = new URL(url);
    assert.equal(target.origin, project);
    if (target.pathname === "/auth/v1/user") {
      return Response.json({ id: "10000000-0000-4000-8000-000000000001", email: "owner@example.test" });
    }
    if (target.pathname === "/rest/v1/profiles") {
      return Response.json(target.searchParams.has("id") ? [sessionUser] : exists ? [{ id: "existing" }] : []);
    }
    assert.equal(target.pathname, "/auth/v1/admin/generate_link");
    const input = JSON.parse(init.body);
    assert.equal(input.type, "invite");
    assert.equal(input.email, email);
    assert.equal(target.searchParams.get("redirect_to"), redirectTo);
    calls++;
    return Response.json({
      email,
      user_metadata: newUser ? input.data : {},
      action_link: returnedUrl,
      hashed_token: "fake-test-token",
      verification_type: "invite",
      redirect_to: redirectTo,
    });
  });
  async function invite() {
    const res = {
      setHeader() {},
      status(code) { this.code = code; return this; },
      json(data) { this.body = data; },
    };
    await inviteExpert({
      method: "POST", body: { delivery: "link", email, name: "Expert" },
      headers: { authorization: "Bearer session-fixture", host: new URL(origin).host, origin, "content-type": "application/json" },
    }, res, { SUPABASE_URL: project, SUPABASE_SECRET_KEY: "fixture", PUBLIC_SITE_ORIGIN: origin });
    return res;
  }
  assert.equal((await invite()).code, 403);
  sessionUser = { role: "admin", active: true };
  exists = true;
  assert.equal((await invite()).code, 409);
  assert.equal(calls, 0);
  exists = false;
  newUser = false;
  const raced = await invite();
  assert.equal(raced.code, 409);
  assert.equal(raced.body.inviteUrl, undefined);
  newUser = true;
  for (const invalid of [
    action.href.replace(project, "https://wrong.example.test"),
    action.href.replace("type=invite", "type=recovery"),
    action.href.replace("/verify?", "/other?"),
    action.href + "&redirect_to=https://wrong.example.test",
    action.href.replace("https://", "http://"),
  ]) {
    returnedUrl = invalid;
    const failed = await invite();
    assert.equal(failed.code, 502);
    assert.equal(failed.body.inviteUrl, undefined);
  }
  returnedUrl = action.href;
  const ready = await invite();
  assert.equal(ready.code, 201);
  assert.equal(ready.body.inviteUrl, action.href);
  assert.deepEqual(Object.keys(ready.body).sort(), ["inviteUrl", "message"]);
});
