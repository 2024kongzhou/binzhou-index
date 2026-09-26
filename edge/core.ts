import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
export type Row = Record<string, string | number | null>;
export type User = Row & {
  id: number;
  username: string;
  role: string;
  is_active: number;
};
export const esc = (v: unknown) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function cleanText(v: unknown) {
  return String(v ?? "")
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) =>
      String.fromCharCode(parseInt(h, 16)),
    )
    .replace(/\\n/g, "\n")
    .replace(/<[^>]*>/g, "")
    .trim();
}
export function json(data: unknown, status = 200, extra: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extra,
    },
  });
}
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const all = async (
  db: D1Database,
  sql: string,
  ...args: (string | number | null)[]
) =>
  (
    await db
      .prepare(sql)
      .bind(...args)
      .all<Row>()
  ).results;
export const one = async (
  db: D1Database,
  sql: string,
  ...args: (string | number | null)[]
) =>
  db
    .prepare(sql)
    .bind(...args)
    .first<Row>();
export function integer(
  v: string | null,
  fallback: number,
  min = 0,
  max = 100,
) {
  const n = Number(v);
  return v !== null && Number.isInteger(n) && n >= min && n <= max
    ? n
    : fallback;
}
export function camel(row: Row) {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [
      k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      k.endsWith("_at") && typeof v === "number"
        ? new Date(v > 1e12 ? v : v * 1000).toISOString()
        : v,
    ]),
  );
}
export function cookie(req: Request) {
  try {
    return decodeURIComponent(
      req.headers.get("Cookie")?.match(/(?:^|;\s*)token=([^;]+)/)?.[1] || "",
    );
  } catch {
    return "";
  }
}
export async function tokenHash(token: string) {
  return [
    ...new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)),
    ),
  ]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
export async function currentUser(
  req: Request,
  env: Env,
): Promise<User | null> {
  const token = cookie(req);
  if (!token || !env.JWT_SECRET) return null;
  let id: number;
  try {
    const p = (
      await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET), {
        algorithms: ["HS256"],
        clockTolerance: 30,
      })
    ).payload;
    id = Number(p.userId);
    if (!Number.isSafeInteger(id) || id < 1) return null;
  } catch {
    return null;
  }
  if (await env.CACHE.get("revoked:" + (await tokenHash(token)))) return null;
  const u = await one(
    env.DB,
    "SELECT id,username,email,phone,role,is_active FROM users WHERE id=?",
    id,
  );
  return u && u.is_active === 1 ? (u as User) : null;
}
export function requireUser(
  user: User | null,
  admin = false,
): asserts user is User {
  if (!user) throw new HttpError(401, "请先登录");
  if (admin && user.role !== "admin") throw new HttpError(403, "没有操作权限");
}
export function writeGuard(req: Request, env: Env) {
  if (env.PREVIEW_READ_ONLY === "true")
    throw new HttpError(403, "预览站只读，请到正式网站提交");
  const origin = req.headers.get("Origin");
  if (
    (origin && origin !== new URL(req.url).origin) ||
    req.headers.get("Sec-Fetch-Site") === "cross-site"
  )
    throw new HttpError(403, "请求来源不匹配，请刷新页面重试");
  if (!(req.headers.get("Content-Type") || "").includes("application/json"))
    throw new HttpError(415, "请使用 JSON 提交");
}
export async function body(req: Request): Promise<Record<string, unknown>> {
  if (Number(req.headers.get("Content-Length")) > 100000)
    throw new HttpError(413, "提交内容过长");
  const text = await req.text();
  if (text.length > 100000) throw new HttpError(413, "提交内容过长");
  try {
    const v = JSON.parse(text);
    if (!v || typeof v !== "object" || Array.isArray(v)) throw 0;
    return v;
  } catch {
    throw new HttpError(400, "提交内容格式不正确");
  }
}
export function field(
  b: Record<string, unknown>,
  name: string,
  max: number,
  required = false,
) {
  const v = b[name];
  if (v === undefined || v === null) {
    if (required) throw new HttpError(400, "请填写必填项");
    return "";
  }
  if (typeof v !== "string") throw new HttpError(400, "字段格式不正确");
  const s = v.trim();
  if (s.length > max || (required && !s))
    throw new HttpError(400, "字段为空或超过长度限制");
  return s;
}
function passwordField(b: Record<string, unknown>) {
  if (
    typeof b.password !== "string" ||
    !b.password ||
    new TextEncoder().encode(b.password).length > 72
  )
    throw new HttpError(400, "密码格式不正确");
  return b.password;
}
export async function limit(req: Request, env: Env, bucket: string, max = 10) {
  const ip = req.headers.get("CF-Connecting-IP") || "unknown";
  const key = `rate:${bucket}:${ip}:${Math.floor(Date.now() / 600000)}`;
  const count = Number((await env.CACHE.get(key)) || 0);
  if (count >= max) throw new HttpError(429, "操作较频繁，请十分钟后再试");
  await env.CACHE.put(key, String(count + 1), { expirationTtl: 660 });
}
async function issue(user: Row, env: Env) {
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 16)
    throw new HttpError(503, "登录服务暂不可用");
  const token = await new SignJWT({
    userId: user.id,
    role: user.role,
    username: user.username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setJti(crypto.randomUUID())
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(env.JWT_SECRET));
  return json({ user: camel(user) }, 200, {
    "Set-Cookie": `token=${token}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax`,
  });
}
export async function api(
  req: Request,
  env: Env,
  user: User | null,
): Promise<Response> {
  const url = new URL(req.url),
    path = url.pathname.replace(/\/+$/, ""),
    q = url.searchParams,
    db = env.DB;
  if (!["GET", "HEAD"].includes(req.method)) {
    writeGuard(req, env);
  }
  if (path === "/api/auth/me" && req.method === "GET") {
    requireUser(user);
    return json({ user: camel(user) });
  }
  if (path === "/api/auth/logout" && req.method === "POST") {
    const token = cookie(req);
    if (token)
      await env.CACHE.put("revoked:" + (await tokenHash(token)), "1", {
        expirationTtl: 604860,
      });
    return json({ ok: true }, 200, {
      "Set-Cookie": "token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax",
    });
  }
  if (path === "/api/auth/login" && req.method === "POST") {
    await limit(req, env, "login");
    const b = await body(req),
      account = field(
        b,
        b.account !== undefined
          ? "account"
          : b.email !== undefined
            ? "email"
            : "phone",
        254,
        true,
      ),
      password = passwordField(b);
    const u = await one(
      db,
      "SELECT * FROM users WHERE lower(email)=lower(?) OR phone=?",
      account,
      account,
    );
    const ok = await bcrypt.compare(
      password,
      String(
        u?.password_hash ||
          "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.",
      ),
    );
    if (!u || u.is_active !== 1 || !ok)
      throw new HttpError(401, "账号或密码不正确");
    const { password_hash, ...safe } = u;
    return issue(safe, env);
  }
  if (path === "/api/auth/register" && req.method === "POST") {
    await limit(req, env, "register", 4);
    const b = await body(req),
      username = field(b, "username", 40, true),
      email = field(b, "email", 254, true).toLowerCase(),
      password = passwordField(b);
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length < 10 ||
      new TextEncoder().encode(password).length > 72
    )
      throw new HttpError(400, "请填写有效邮箱，密码需为 10–72 字节");
    if (!env.JWT_SECRET) throw new HttpError(503, "注册服务暂不可用");
    if (
      await one(
        db,
        "SELECT id FROM users WHERE lower(email)=? OR username=?",
        email,
        username,
      )
    )
      throw new HttpError(409, "用户名或邮箱已被使用");
    let u: Row | null;
    try {
      u = await db
        .prepare(
          "INSERT INTO users(username,email,password_hash,role,is_active,created_at) VALUES(?,?,?,'user',1,unixepoch()) RETURNING id,username,email,role",
        )
        .bind(username, email, await bcrypt.hash(password, 10))
        .first<Row>();
    } catch {
      throw new HttpError(409, "用户名或邮箱已被使用");
    }
    return issue(u!, env);
  }
  if (path === "/api/stats" && req.method === "GET") {
    return json(
      await one(
        db,
        "SELECT (SELECT COUNT(*) FROM villages WHERE status='published') villages,(SELECT COUNT(*) FROM posts WHERE status='published') posts,(SELECT COUNT(*) FROM products WHERE status='active') products,(SELECT COUNT(*) FROM chronicles WHERE status='published') chronicles",
      ),
    );
  }
  if (path === "/api/villages" && req.method === "GET") {
    if (q.has("id")) {
      const v = await one(
        db,
        "SELECT * FROM villages WHERE id=? AND status='published'",
        integer(q.get("id"), 0, 1, 1e9),
      );
      return json({ village: v ? camel(v) : null }, v ? 200 : 404);
    }
    const where = ["status='published'"],
      args: (string | number)[] = [];
    for (const k of ["district", "township"])
      if (q.get(k)) {
        where.push(k + "=?");
        args.push(q.get(k)!);
      }
    if (q.get("search")) {
      where.push("(name LIKE ? OR township LIKE ?)");
      args.push(
        "%" + q.get("search")!.slice(0, 80) + "%",
        "%" + q.get("search")!.slice(0, 80) + "%",
      );
    }
    const n = integer(q.get("limit"), 24, 1, 100),
      offset = integer(q.get("offset"), 0, 0, 100000),
      w = where.join(" AND "),
      rows = await all(
        db,
        `SELECT * FROM villages WHERE ${w} ORDER BY id DESC LIMIT ? OFFSET ?`,
        ...args,
        n,
        offset,
      ),
      count = await one(
        db,
        `SELECT COUNT(*) total FROM villages WHERE ${w}`,
        ...args,
      );
    return json({
      villages: rows.map(camel),
      pagination: { total: count?.total || 0, limit: n, offset },
    });
  }
  if (path === "/api/posts" && req.method === "GET") {
    const requested = q.get("status") || "published";
    if (requested !== "published") requireUser(user, true);
    if (q.get("slug")) {
      const p = await one(
        db,
        "SELECT * FROM posts WHERE slug=? AND (status='published' OR ?=1)",
        q.get("slug")!,
        user?.role === "admin" ? 1 : 0,
      );
      return json({ post: p ? camel(p) : null }, p ? 200 : 404);
    }
    const where = ["status=?"],
      args: (string | number)[] = [requested];
    if (q.get("search")) {
      where.push("title LIKE ?");
      args.push("%" + q.get("search")!.slice(0, 80) + "%");
    }
    const n = integer(q.get("limit"), 100, 1, 100),
      offset = integer(q.get("offset"), 0, 0, 100000),
      w = where.join(" AND ");
    return json({
      posts: (
        await all(
          db,
          `SELECT * FROM posts WHERE ${w} ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?`,
          ...args,
          n,
          offset,
        )
      ).map(camel),
      pagination: {
        total:
          (
            await one(
              db,
              `SELECT COUNT(*) total FROM posts WHERE ${w}`,
              ...args,
            )
          )?.total || 0,
        offset,
        limit: n,
      },
    });
  }
  if (
    (path === "/api/posts" || path.startsWith("/api/posts/")) &&
    ["POST", "PUT"].includes(req.method)
  ) {
    requireUser(user, true);
    const b = await body(req),
      title = field(b, "title", 200, true),
      content = field(b, "content", 60000, true),
      slug = path.startsWith("/api/posts/")
        ? decodeURIComponent(path.slice(11))
        : field(b, "slug", 160, true),
      status = field(b, "status", 20) || "draft";
    if (
      !/^[\p{L}\p{N}_-]+$/u.test(slug) ||
      !["draft", "published", "archived", "pending"].includes(status)
    )
      throw new HttpError(400, "文章地址或状态不正确");
    const previous =
      req.method === "PUT"
        ? await one(
            db,
            "SELECT cover_image,ai_generated FROM posts WHERE slug=?",
            slug,
          )
        : null;
    const cover =
        b.coverImage === undefined
          ? String(previous?.cover_image || "")
          : field(b, "coverImage", 1000),
      excerpt = field(b, "excerpt", 500),
      ai =
        b.aiGenerated === undefined
          ? Number(previous?.ai_generated || 0)
          : b.aiGenerated === true || b.aiGenerated === "true"
            ? 1
            : 0;
    if (
      cover &&
      !/^\/api\/img\/[\w.-]+$/.test(cover) &&
      !/^https:\/\//.test(cover)
    )
      throw new HttpError(400, "封面地址不正确");
    let p: Row | null;
    if (req.method === "PUT")
      p = await db
        .prepare(
          "UPDATE posts SET title=?,content=?,excerpt=?,status=?,cover_image=?,ai_generated=? WHERE slug=? RETURNING *",
        )
        .bind(title, content, excerpt, status, cover, ai, slug)
        .first<Row>();
    else {
      if (await one(db, "SELECT id FROM posts WHERE slug=?", slug))
        throw new HttpError(409, "文章地址已存在，请编辑已有文章");
      p = await db
        .prepare(
          "INSERT INTO posts(title,slug,content,excerpt,status,cover_image,author_id,ai_generated,created_at,published_at) VALUES(?,?,?,?,?,?,?,?,unixepoch(),unixepoch()) RETURNING *",
        )
        .bind(title, slug, content, excerpt, status, cover, user.id, ai)
        .first<Row>();
    }
    if (!p) throw new HttpError(404, "文章不存在");
    return json({ post: camel(p) });
  }
  if (path === "/api/products" && req.method === "GET") {
    const rows = await all(
      db,
      "SELECT * FROM products WHERE status='active'" +
        (q.has("id") ? " AND id=?" : "") +
        " ORDER BY id",
      ...(q.has("id") ? [integer(q.get("id"), 0, 1, 1e9)] : []),
    );
    return q.has("id")
      ? json({ product: rows[0] ? camel(rows[0]) : null }, rows[0] ? 200 : 404)
      : json({ products: rows.map(camel) });
  }
  if (path === "/api/chronicles" && req.method === "GET") {
    return json({
      chronicles: (
        await all(
          db,
          "SELECT * FROM chronicles WHERE status='published' ORDER BY id DESC LIMIT 100",
        )
      ).map(camel),
    });
  }
  if (path === "/api/villages" && req.method === "POST") {
    requireUser(user, true);
    const b = await body(req),
      v = await db
        .prepare(
          "INSERT INTO villages(name,district,township,history,source_file,status,created_at) VALUES(?,?,?,?,?,'published',unixepoch()) RETURNING *",
        )
        .bind(
          field(b, "name", 120, true),
          field(b, "district", 40),
          field(b, "township", 80),
          field(b, "history", 20000),
          field(b, "sourceFile", 300),
        )
        .first<Row>();
    return json({ village: camel(v!) });
  }
  if (path === "/api/messages") {
    requireUser(user);
    if (req.method === "GET") {
      const rows =
        user.role === "admin"
          ? await all(
              db,
              "SELECT m.*,u.username sender_name FROM messages m LEFT JOIN users u ON u.id=m.sender_id ORDER BY m.id DESC LIMIT 100",
            )
          : await all(
              db,
              "SELECT m.*,u.username sender_name FROM messages m LEFT JOIN users u ON u.id=m.sender_id WHERE sender_id=? OR receiver_id=? ORDER BY m.id DESC LIMIT 100",
              user.id,
              user.id,
            );
      return json({ messages: rows.map(camel) });
    }
    if (req.method === "POST") {
      await limit(req, env, "message", 20);
      const b = await body(req),
        content = field(b, "content", 3000, true);
      const receiver =
        user.role === "admin" && Number(b.receiverId) > 0
          ? await one(
              db,
              "SELECT id FROM users WHERE id=?",
              Number(b.receiverId),
            )
          : await one(
              db,
              "SELECT id FROM users WHERE role='admin' AND is_active=1 ORDER BY id LIMIT 1",
            );
      if (!receiver) throw new HttpError(503, "暂时无法发送，请电话联系");
      const m = await db
        .prepare(
          "INSERT INTO messages(sender_id,receiver_id,content,created_at) VALUES(?,?,?,unixepoch()) RETURNING *",
        )
        .bind(user.id, receiver.id, content)
        .first<Row>();
      return json({ message: camel(m!) });
    }
  }
  if (path === "/api/bookings" && req.method === "POST") {
    await limit(req, env, "booking", 4);
    const b = await body(req),
      name = field(b, "name", 50, true),
      phone = field(b, "phone", 30, true),
      service = field(b, "serviceType", 80, true);
    if (!/^[+\d\s-]{7,20}$/.test(phone))
      throw new HttpError(400, "请填写有效联系电话");
    await db
      .prepare(
        "INSERT INTO bookings(name,phone,address,service_type,preferred_date,note,status,created_at) VALUES(?,?,?,?,?,?,'pending',?)",
      )
      .bind(
        name,
        phone,
        field(b, "address", 300),
        service,
        field(b, "preferredDate", 30),
        field(b, "note", 2000),
        Date.now(),
      )
      .run();
    return json({ ok: true, message: "预约已提交，我们会尽快与您联系" });
  }
  if (path === "/api/comments" && req.method === "GET") {
    return json({
      comments: (
        await all(
          db,
          "SELECT id,author_name,content,created_at FROM comments WHERE post_id=? AND status='approved' ORDER BY id DESC LIMIT 50",
          integer(q.get("postId"), 0, 1, 1e9),
        )
      ).map(camel),
    });
  }
  if (path === "/api/comments" && req.method === "POST") {
    requireUser(user);
    await limit(req, env, "comment", 10);
    const b = await body(req),
      content = field(b, "content", 2000, true),
      id = Number(b.postId);
    if (
      !(await one(
        db,
        "SELECT id FROM posts WHERE id=? AND status='published'",
        id,
      ))
    )
      throw new HttpError(404, "文章不存在");
    await db
      .prepare(
        "INSERT INTO comments(post_id,author_name,content,status,created_at) VALUES(?,?,?,'pending',?)",
      )
      .bind(id, user.username, content, Date.now())
      .run();
    return json({ ok: true, message: "评论已提交，审核通过后显示" });
  }
  if (path === "/api/admin/overview" && req.method === "GET") {
    requireUser(user, true);
    return json({
      posts: (
        await all(
          db,
          "SELECT id,title,slug,status,created_at FROM posts ORDER BY id DESC LIMIT 100",
        )
      ).map(camel),
      users: (
        await all(
          db,
          "SELECT id,username,email,role,is_active FROM users ORDER BY id DESC LIMIT 100",
        )
      ).map(camel),
      bookings: (
        await all(db, "SELECT * FROM bookings ORDER BY id DESC LIMIT 100")
      ).map(camel),
      comments: (
        await all(
          db,
          "SELECT id,post_id,author_name,content,status FROM comments ORDER BY id DESC LIMIT 100",
        )
      ).map(camel),
    });
  }
  if (path === "/api/admin/status" && req.method === "POST") {
    requireUser(user, true);
    const b = await body(req),
      kind = field(b, "kind", 20, true),
      status = field(b, "status", 20, true),
      tables: Record<string, string[]> = {
        comments: ["pending", "approved", "rejected"],
        bookings: ["pending", "contacted", "completed", "canceled"],
        posts: ["draft", "published", "archived"],
      };
    if (!tables[kind]?.includes(status)) throw new HttpError(400, "状态不正确");
    await db
      .prepare(`UPDATE ${kind} SET status=? WHERE id=?`)
      .bind(status, Number(b.id))
      .run();
    return json({ ok: true });
  }
  if (path === "/api/products" && req.method === "POST") {
    requireUser(user, true);
    const b = await body(req),
      name = field(b, "name", 120, true),
      price = Number(b.price);
    if (!Number.isFinite(price) || price < 0)
      throw new HttpError(400, "价格不正确");
    const p = await db
      .prepare(
        "INSERT INTO products(name,price,description,status,created_at) VALUES(?,?,?,'active',unixepoch()) RETURNING *",
      )
      .bind(name, price, field(b, "description", 4000))
      .first<Row>();
    return json({ product: camel(p!) });
  }
  if (path === "/api/chronicles" && req.method === "POST") {
    requireUser(user, true);
    const b = await body(req),
      title = field(b, "title", 160, true),
      content = field(b, "content", 50000, true);
    const p = await db
      .prepare(
        "INSERT INTO chronicles(title,content,status,created_at) VALUES(?,?,'published',unixepoch()) RETURNING *",
      )
      .bind(title, content)
      .first<Row>();
    return json({ chronicle: camel(p!) });
  }
  throw new HttpError(404, "接口不存在");
}
