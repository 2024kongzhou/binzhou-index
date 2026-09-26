import test from 'node:test';import assert from 'node:assert/strict';
import worker from '../dist/_worker.js';import {fixture} from './test-support.mjs';
import {SignJWT} from 'jose';import bcrypt from 'bcryptjs';
const {env,sqlite}=fixture();
const request=(path,method='GET',data,token,extra={})=>worker.fetch(new Request('https://keyi.de5.net'+path,{method,headers:{...(data?{'Content-Type':'application/json'}:{}),...(token?{Cookie:'token='+token}:{}),...extra},...(data?{body:JSON.stringify(data)}:{})}),env);
sqlite.prepare("INSERT INTO users(id,username,email,password_hash,role) VALUES(1,'admin','admin@example.test',?,'admin'),(2,'member','member@example.test',?,'user')").run(await bcrypt.hash(' spaced-password ',10),await bcrypt.hash('member-password',10));
const token=await new SignJWT({userId:1}).setProtectedHeader({alg:'HS256'}).setExpirationTime('1h').sign(new TextEncoder().encode(env.JWT_SECRET));
await test('guest cannot read draft by list, search, slug or page',async()=>{
 assert.equal((await request('/api/posts?status=draft')).status,401);
 assert.equal((await request('/api/posts?slug=private-draft')).status,404);
 assert.equal((await request('/blog/private-draft/')).status,404);
 assert.equal((await (await request('/api/posts?search=保密')).json()).posts.length,0);
});
await test('public pages render and unknown routes return 404',async()=>{
 for(const p of ['/','/place/','/place/1/','/search/?q=黄河','/blog/','/blog/public-story/','/product/','/product/1/','/login/','/register/','/contact/','/about/','/privacy/','/terms/','/credentials/','/sitemap.xml'])assert.equal((await request(p)).status,200,p);
 assert.equal((await request('/not-found/')).status,404);
});
await test('writes require admin and same origin; preview is read only',async()=>{
 assert.equal((await request('/api/posts','POST',{title:'x'})).status,401);
 assert.equal((await request('/api/bookings','POST',{},null,{Origin:'https://evil.test'})).status,403);
 env.PREVIEW_READ_ONLY='true';assert.equal((await request('/api/bookings','POST',{})).status,403);delete env.PREVIEW_READ_ONLY;
});
await test('new article renders immediately; HTML content is escaped',async()=>{
 const r=await request('/api/posts','POST',{title:'<img src=x onerror=alert(1)>',slug:'new-article',content:'Hello <script>alert(1)</script>',status:'published'},token);assert.equal(r.status,200);
 const p=await request('/blog/new-article/');assert.equal(p.status,200);const html=await p.text();assert.ok(!html.includes('<img src=x'));assert.ok(html.includes('&lt;img'));
});
await test('login preserves password whitespace and cookie is protected',async()=>{
 const r=await request('/api/auth/login','POST',{account:'admin@example.test',password:' spaced-password '});assert.equal(r.status,200);assert.match(r.headers.get('Set-Cookie'),/HttpOnly; Secure; SameSite=Lax/);assert.ok(!JSON.stringify(await r.json()).includes('password_hash'));
});
await test('disabled users lose access even with an existing signed token',async()=>{
 sqlite.exec('UPDATE users SET is_active=0 WHERE id=1');assert.equal((await request('/api/auth/me','GET',null,token)).status,401);sqlite.exec('UPDATE users SET is_active=1 WHERE id=1');
});
await test('logout revokes token; stale admin claim cannot bypass DB role',async()=>{
 sqlite.exec("UPDATE users SET role='user' WHERE id=1");assert.equal((await request('/api/admin/overview','GET',null,token)).status,403);sqlite.exec("UPDATE users SET role='admin' WHERE id=1");
 assert.equal((await request('/api/auth/logout','POST',{},token)).status,200);assert.equal((await request('/api/auth/me','GET',null,token)).status,401);
});
await test('image proxy preserves image bytes and rejects missing files',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async(url)=>String(url).endsWith('sample.jpg')?new Response(new Uint8Array([255,216,255]),{headers:{'Content-Type':'image/jpeg'}}):new Response(null,{status:404});
 try{const r=await request('/api/img/sample.jpg');assert.equal(r.status,200);assert.equal((await r.arrayBuffer()).byteLength,3);assert.equal((await request('/api/img/missing.jpg')).status,404);assert.equal((await request('/api/img/no.html')).status,404);}finally{globalThis.fetch=original;}
});
await test('private message list includes received messages but no unrelated messages',async()=>{
 sqlite.exec("INSERT INTO messages(sender_id,receiver_id,content) VALUES(1,2,'reply'),(1,1,'private')");const t=await new SignJWT({userId:2}).setProtectedHeader({alg:'HS256'}).setExpirationTime('1h').sign(new TextEncoder().encode(env.JWT_SECRET));const r=await request('/api/messages','GET',null,t);assert.equal((await r.json()).messages.length,1);
});
await test('booking validation and pending comments persist correct state',async()=>{
 assert.equal((await request('/api/bookings','POST',{name:'Test',phone:'bad',serviceType:'窗帘'})).status,400);
 assert.equal((await request('/api/bookings','POST',{name:'Test',phone:'13000000000',serviceType:'窗帘'})).status,200);assert.equal(sqlite.prepare('SELECT status FROM bookings').get().status,'pending');
});
