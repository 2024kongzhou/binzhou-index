import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
export function fixture(){
 const sqlite=new DatabaseSync(':memory:');
 sqlite.exec(fs.readFileSync(new URL('../drizzle/schema.sql',import.meta.url),'utf8'));
 sqlite.exec(`ALTER TABLE users ADD COLUMN phone TEXT;
 CREATE TABLE comments(id INTEGER PRIMARY KEY,post_id INTEGER,author_name TEXT,author_email TEXT,content TEXT,status TEXT,created_at INTEGER);
 CREATE TABLE bookings(id INTEGER PRIMARY KEY,name TEXT,phone TEXT,address TEXT,service_type TEXT,preferred_date TEXT,note TEXT,status TEXT,created_at INTEGER);
 INSERT INTO villages(name,district,township,history) VALUES('黄河村','滨城区','滨北街道','一份村庄历史。');
 INSERT INTO posts(title,slug,content,status) VALUES('公开故事','public-story','正文内容','published'),('保密草稿','private-draft','不能公开','draft');
 INSERT INTO products(name,price,description) VALUES('本地好物',99,'日常生活');`);
 const wrap=(sql,args=[])=>({bind(...values){return wrap(sql,values);},async all(){return {results:sqlite.prepare(sql).all(...args)};},async first(){return sqlite.prepare(sql).get(...args)||null;},async run(){return sqlite.prepare(sql).run(...args);}});
 const kv=new Map();return {sqlite,env:{DB:{prepare:wrap},CACHE:{async get(k){return kv.get(k)||null},async put(k,v){kv.set(k,v)}},JWT_SECRET:'test-only-secret-never-use-in-production',ORACLE_IMG_SERVER:'https://images.example.test'}};
}
