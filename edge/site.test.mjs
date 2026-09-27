import test from "node:test";
import assert from "node:assert/strict";
import worker from "../dist/_worker.js";
import { fixture } from "./test-support.mjs";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
const { env, sqlite } = fixture();
const request = (path, method = "GET", data, token, extra = {}) =>
  worker.fetch(
    new Request("https://keyi.de5.net" + path, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Cookie: "token=" + token } : {}),
        ...extra,
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    }),
    env,
  );
sqlite
  .prepare(
    "INSERT INTO users(id,username,email,password_hash,role) VALUES(1,'admin','admin@example.test',?,'admin'),(2,'member','member@example.test',?,'user')",
  )
  .run(
    await bcrypt.hash(" spaced-password ", 10),
    await bcrypt.hash("member-password", 10),
  );
const token = await new SignJWT({ userId: 1 })
  .setProtectedHeader({ alg: "HS256" })
  .setExpirationTime("1h")
  .sign(new TextEncoder().encode(env.JWT_SECRET));
await test("village research dates evidence and does not attach a homonym from another district", async () => {
  const page = await request('/village-research/');
  assert.equal(page.status, 200);
  const content = await page.text();
  assert.match(content, /1998年7月第1版/);
  assert.match(content, /不是现状数据/);
  assert.equal((content.match(/class="village-card"/g) || []).length, 46);
  sqlite.prepare("INSERT INTO villages(id,name,district,township,status) VALUES(99001,'东寨子','滨城区','滨城镇','published'),(99002,'东寨子','惠民县','香翟乡','published')").run();
  assert.match(await (await request('/place/99001/')).text(), /1997年耕地1000亩/);
  assert.doesNotMatch(await (await request('/place/99002/')).text(), /1997年耕地1000亩/);
});
await test("guest cannot read draft by list, search, slug or page", async () => {
  assert.equal((await request("/api/posts?status=draft")).status, 401);
  assert.equal((await request("/api/posts?slug=private-draft")).status, 404);
  assert.equal((await request("/blog/private-draft/")).status, 404);
  assert.equal(
    (await (await request("/api/posts?search=保密")).json()).posts.length,
    0,
  );
});
await test("placeholder posts are excluded from all public article surfaces", async () => {
  sqlite.prepare("INSERT INTO posts(title,slug,content,status) VALUES('????','test-placeholder','????','published')").run();
  assert.equal((await request('/api/posts?slug=test-placeholder')).status,404);
  assert.equal((await request('/blog/test-placeholder/')).status,404);
  assert.doesNotMatch(await (await request('/blog/')).text(),/test-placeholder/);
});
await test('verified historical records replace conflicting summaries in both API and page', async () => {
  sqlite.prepare("INSERT INTO villages(id,name,district,township,population,farmland,status) VALUES(99003,'北关','滨城区','滨城镇','43664','55993亩','published'),(99004,'北关','惠民县','惠民镇','12','10亩','published')").run();
  const body=await (await request('/place/99003/')).text();
  assert.match(body,/625人/); assert.doesNotMatch(body,/43664/);
  const data=await (await request('/api/villages?id=99003')).json();
  assert.match(data.village.farmland,/797亩/);
  const other=await (await request('/api/villages?id=99004')).json();
  assert.equal(other.village.population,'12');
  assert.equal(sqlite.prepare('SELECT population FROM villages WHERE id=99003').get().population,'43664');
});
await test('肖韩 exposes complete gazetteer figures and corroborating local sources', async () => {
  sqlite.prepare("INSERT INTO villages(id,name,district,township,status) VALUES(99008,'肖韩','滨城区','滨城镇','published')").run();
  const data=await (await request('/api/villages?id=99008')).json();
  assert.match(data.village.population,/140户、547人/);
  assert.match(data.village.farmland,/650亩/);
  assert.match(data.village.sourceFile,/滨城年鉴1998/);
  assert.match(data.village.history,/滨州地区志/);
  const page=await (await request('/place/99008/')).text();
  assert.match(page,/547人/);
  assert.match(page,/滨城年鉴1998/);
});
await test('template village narratives are isolated until an original source is found', async () => {
  sqlite.prepare("INSERT INTO villages(id,name,district,township,history,status) VALUES(99009,'模板村','滨城区','滨城镇','带来了先进的农耕技术和手工艺，使村庄逐渐繁荣。','published')").run();
  const data=await (await request('/api/villages?id=99009')).json();
  assert.match(data.village.history,/模板化沿革/);
  assert.doesNotMatch(data.village.history,/先进的农耕技术/);
});
await test('孙家 preserves the page evidence even when the gazetteer records a later merger', async () => {
  sqlite.prepare("INSERT INTO villages(id,name,district,township,status) VALUES(99010,'孙家','滨城区','滨城镇','published')").run();
  const data=await (await request('/api/villages?id=99010')).json();
  assert.match(data.village.history,/1976年并入后山王大队/);
  assert.match(data.village.population,/13户、53人/);
  assert.match(data.village.sourceFile,/第218页/);
  assert.match(data.village.evolution,/独立自然村/);
  assert.match(data.village.versionTag,/逐字核对/);
  assert.match(data.village.remark,/逐字核对录入/);
});
await test('滨城镇 page records use the same field-by-field gazetteer standard', async () => {
  sqlite.prepare("INSERT INTO villages(id,name,district,township,status) VALUES(99011,'张家庵','滨城区','滨城镇','published'),(99012,'刘芳策','滨城区','滨城镇','published')").run();
  const z=await (await request('/api/villages?id=99011')).json();
  assert.match(z.village.population,/74户、289人/); assert.match(z.village.farmland,/397亩/); assert.match(z.village.sourceFile,/第207页/);
  const l=await (await request('/api/villages?id=99012')).json();
  assert.match(l.village.population,/88户、298人/); assert.match(l.village.surnames,/刘、王、罗/); assert.match(l.village.sourceFile,/第219页/);
  assert.match(await (await request('/place/99012/')).text(),/网络资料仅作交叉参考/);
});
await test('gazetteer stays primary and suspect values are quarantined only on exact matches', async () => {
  sqlite.prepare("INSERT INTO villages(id,name,district,township,population,farmland,status) VALUES(99005,'柳家','滨城区','滨城镇','43664','55993亩','published'),(99006,'东关','滨城区','滨城镇','43664','55993亩','published'),(99007,'东关','滨城区','滨城镇','123','456亩','published')").run();
  const primary=await (await request('/api/villages?id=99005')).json();
  assert.match(primary.village.population,/156人/);
  assert.match(primary.village.farmland,/205亩/);
  assert.match(primary.village.sourceFile,/184页/);
  assert.match(primary.village.sourceFile,/小康村志/);
  const page=await (await request('/place/99005/')).text();
  assert.match(page,/其他文献记载/);
  assert.match(page,/161人/);
  const suspect=await (await request('/api/villages?id=99006')).json();
  assert.match(suspect.village.population,/已隔离/);
  const changed=await (await request('/api/villages?id=99007')).json();
  assert.equal(changed.village.population,'123');
});
await test("public pages render and unknown routes return 404", async () => {
  for (const p of [
    "/",
    "/place/",
    "/place/1/",
    "/search/?q=黄河",
    "/blog/",
    "/blog/public-story/",
    "/product/",
    "/product/1/",
    "/login/",
    "/register/",
    "/contact/",
    "/about/",
    "/privacy/",
    "/terms/",
    "/credentials/",
    "/sitemap.xml",
  ])
    assert.equal((await request(p)).status, 200, p);
  assert.equal((await request("/not-found/")).status, 404);
});
await test("writes require admin and same origin; preview is read only", async () => {
  assert.equal(
    (await request("/api/posts", "POST", { title: "x" })).status,
    401,
  );
  assert.equal(
    (
      await request("/api/bookings", "POST", {}, null, {
        Origin: "https://evil.test",
      })
    ).status,
    403,
  );
  env.PREVIEW_READ_ONLY = "true";
  assert.equal((await request("/api/bookings", "POST", {})).status, 403);
  delete env.PREVIEW_READ_ONLY;
});
await test("new article renders immediately; HTML content is escaped", async () => {
  const r = await request(
    "/api/posts",
    "POST",
    {
      title: "<img src=x onerror=alert(1)>",
      slug: "new-article",
      content: "Hello <script>alert(1)</script>",
      coverImage: "/api/img/sample.jpg",
      status: "published",
    },
    token,
  );
  assert.equal(r.status, 200);
  const p = await request("/blog/new-article/");
  assert.equal(p.status, 200);
  const html = await p.text();
  assert.ok(!html.includes("<img src=x"));
  assert.ok(html.includes("&lt;img"));
  assert.equal((await request("/api/posts", "POST", {title:"<img src=x onerror=alert(1)>",slug:"duplicate-title",content:"another",coverImage:"/api/img/sample.jpg",status:"published"}, token)).status, 409);
});
await test("article detail shows previous and next navigation", async () => {
  const page = await (await request('/blog/public-story/')).text();
  assert.match(page,/文章导航/);
  assert.match(page,/上一篇|下一篇/);
  assert.match(page,/site\.css\?v=20260927/);
  const css = await (await request('/assets/site.css')).text();
  assert.match(css,/\.article-nav\s*\{[^}]*gap:\s*88px/s);
});
await test("daily articles require 600-1000 characters and a cover image", async () => {
  const short = await request("/api/posts", "POST", {title:"每日短文",slug:"daily-short",content:"太短",status:"published",coverImage:"/api/img/sample.jpg"}, token);
  assert.equal(short.status,400);
  const long = "滨州".repeat(350);
  const noCover = await request("/api/posts", "POST", {title:"每日无图",slug:"daily-no-cover",content:long,status:"published"}, token);
  assert.equal(noCover.status,400);
  const good = await request("/api/posts", "POST", {title:"每日合规文章",slug:"daily-valid",content:long,status:"published",coverImage:"/api/img/sample.jpg"}, token);
  assert.equal(good.status,200);
});
await test("login preserves password whitespace and cookie is protected", async () => {
  const r = await request("/api/auth/login", "POST", {
    account: "admin@example.test",
    password: " spaced-password ",
  });
  assert.equal(r.status, 200);
  assert.match(r.headers.get("Set-Cookie"), /HttpOnly; Secure; SameSite=Lax/);
  assert.ok(!JSON.stringify(await r.json()).includes("password_hash"));
});
await test("disabled users lose access even with an existing signed token", async () => {
  sqlite.exec("UPDATE users SET is_active=0 WHERE id=1");
  assert.equal((await request("/api/auth/me", "GET", null, token)).status, 401);
  sqlite.exec("UPDATE users SET is_active=1 WHERE id=1");
});
await test("admin pages and catalog writes use the existing schema", async () => {
  assert.equal((await request("/admin/", "GET", null, token)).status, 200);
  assert.equal(
    (
      await request(
        "/api/villages",
        "POST",
        { name: "New Village", history: "history" },
        token,
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await request(
        "/api/chronicles",
        "POST",
        { title: "Archive", content: "archive text" },
        token,
      )
    ).status,
    200,
  );
  assert.equal((await request("/chronicles/")).status, 200);
});
await test("editing an article preserves omitted image and AI attribution", async () => {
  sqlite.exec(
    "UPDATE posts SET cover_image='/api/img/sample.jpg',ai_generated=1 WHERE slug='new-article'",
  );
  assert.equal(
    (
      await request(
        "/api/posts/new-article/",
        "PUT",
        { title: "Updated", content: "updated content", status: "published" },
        token,
      )
    ).status,
    200,
  );
  const p = sqlite
    .prepare(
      "SELECT cover_image,ai_generated FROM posts WHERE slug='new-article'",
    )
    .get();
  assert.equal(p.cover_image, "/api/img/sample.jpg");
  assert.equal(p.ai_generated, 1);
});
await test("logout revokes token; stale admin claim cannot bypass DB role", async () => {
  sqlite.exec("UPDATE users SET role='user' WHERE id=1");
  assert.equal(
    (await request("/api/admin/overview", "GET", null, token)).status,
    403,
  );
  sqlite.exec("UPDATE users SET role='admin' WHERE id=1");
  assert.equal(
    (await request("/api/auth/logout", "POST", {}, token)).status,
    200,
  );
  assert.equal((await request("/api/auth/me", "GET", null, token)).status, 401);
});
await test("image proxy preserves image bytes and rejects missing files", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url) =>
    String(url).endsWith("sample.jpg")
      ? new Response(new Uint8Array([255, 216, 255]), {
          headers: { "Content-Type": "image/jpeg" },
        })
      : new Response(null, { status: 404 });
  try {
    const r = await request("/api/img/sample.jpg");
    assert.equal(r.status, 200);
    assert.equal((await r.arrayBuffer()).byteLength, 3);
    assert.equal((await request("/api/img/missing.jpg")).status, 404);
    assert.equal((await request("/api/img/no.html")).status, 404);
  } finally {
    globalThis.fetch = original;
  }
});
await test("private message list includes received messages but no unrelated messages", async () => {
  sqlite.exec(
    "INSERT INTO messages(sender_id,receiver_id,content) VALUES(1,2,'reply'),(1,1,'private')",
  );
  const t = await new SignJWT({ userId: 2 })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(env.JWT_SECRET));
  const r = await request("/api/messages", "GET", null, t);
  assert.equal((await r.json()).messages.length, 1);
});
await test("booking validation and pending comments persist correct state", async () => {
  assert.equal(
    (
      await request("/api/bookings", "POST", {
        name: "Test",
        phone: "bad",
        serviceType: "窗帘",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/api/bookings", "POST", {
        name: "Test",
        phone: "13000000000",
        serviceType: "窗帘",
      })
    ).status,
    200,
  );
  assert.equal(
    sqlite.prepare("SELECT status FROM bookings").get().status,
    "pending",
  );
});
