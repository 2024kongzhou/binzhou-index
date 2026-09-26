import http from "node:http";
import worker from "../dist/_worker.js";
import { fixture } from "./test-support.mjs";
const { env } = fixture();
env.PREVIEW_READ_ONLY = "true";
http
  .createServer(async (req, res) => {
    try {
      const r = await worker.fetch(
        new Request("http://localhost:3000" + req.url, {
          method: req.method,
          headers: req.headers,
        }),
        env,
      );
      res.writeHead(r.status, Object.fromEntries(r.headers));
      res.end(Buffer.from(await r.arrayBuffer()));
    } catch {
      res.writeHead(500);
      res.end("Development server error");
    }
  })
  .listen(3000, "127.0.0.1", () =>
    console.log("Local preview http://localhost:3000 (sample data, read only)"),
  );
