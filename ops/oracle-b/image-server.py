#!/usr/bin/env python3
"""Lightweight image upload & serving server for binzhou-index.
Listens on 0.0.0.0:8001.
POST /upload   (Bearer token auth, multipart/form-data) -> {"url": "...", "filename": "...", "size": ...}
GET  /images/<filename>                                  -> image file
GET  /health                                              -> {"ok": true}
DELETE /images/<filename>                                -> {"ok": true}
"""

import os
import hmac
import urllib.request
import urllib.error
import re
import hashlib
import time
import json
import uuid
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

UPLOAD_DIR = "/var/www/binzhou-images"
AUTH_TOKEN = os.environ.get("IMAGE_SERVER_TOKEN", "")
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"}
EXT_MAP = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "image/svg+xml": ".svg"}
MIME_MAP = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml"}

os.makedirs(UPLOAD_DIR, exist_ok=True)


def parse_multipart(body: bytes, boundary: str):
    boundary_bytes = boundary.encode("utf-8")
    parts = body.split(b"--" + boundary_bytes)
    files = []
    for part in parts[1:-1]:
        if part[:2] == b"\r\n":
            part = part[2:]
        if part[-2:] == b"\r\n":
            part = part[:-2]
        header_end = part.find(b"\r\n\r\n")
        if header_end == -1:
            continue
        header_raw = part[:header_end].decode("utf-8", errors="replace")
        file_data = part[header_end + 4:]
        name_match = re.search(r'name="([^"]+)"', header_raw)
        filename_match = re.search(r'filename="([^"]+)"', header_raw)
        ctype_match = re.search(r'Content-Type:\s*(\S+)', header_raw, re.IGNORECASE)
        if not name_match:
            continue
        files.append({
            "name": name_match.group(1),
            "filename": filename_match.group(1) if filename_match else None,
            "content_type": ctype_match.group(1) if ctype_match else "application/octet-stream",
            "data": file_data,
        })
    return files


class ImageHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _hub(self, path, method="GET"):
        key = os.environ.get("API_KEY", "")
        if not key or not hmac.compare_digest(self.headers.get("X-API-Key", ""), key):
            return self._send_json(401, {"error": "Unauthorized"})
        if len(path) > 30000:
            return self._send_json(413, {"error": "Request too large"})
        try:
            request = urllib.request.Request("http://127.0.0.1:8000" + path, headers={"X-API-Key": key}, method=method)
            with urllib.request.urlopen(request, timeout=55) as response:
                data = json.loads(response.read(1000000))
            return self._send_json(200, data)
        except urllib.error.HTTPError as error:
            return self._send_json(error.code, {"error": "AI service unavailable"})
        except Exception:
            return self._send_json(502, {"error": "AI service unavailable"})

    def _send_json(self, code, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_cors(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self._send_cors()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/hub/health":
            return self._hub("/health")
        if parsed.path == "/health":
            file_count = len(os.listdir(UPLOAD_DIR)) if os.path.isdir(UPLOAD_DIR) else 0
            self._send_json(200, {"ok": True, "dir": UPLOAD_DIR, "files": file_count})
            return
        if parsed.path.startswith("/images/"):
            if not re.fullmatch(r"/images/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|gif)", parsed.path):
                return self._send_json(404, {"error": "Not found"})
            self._serve_image(parsed.path[1:])
            return
        self._send_json(404, {"error": "Not found"})

    def do_DELETE(self):
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/images/"):
            self._send_json(404, {"error": "Not found"})
            return
        auth = self.headers.get("Authorization", "")
        if not AUTH_TOKEN or not hmac.compare_digest(auth, f"Bearer {AUTH_TOKEN}"):
            self._send_json(401, {"error": "Unauthorized"})
            return
        filename = os.path.basename(parsed.path[1:])
        filepath = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(filepath):
            os.remove(filepath)
            self._send_json(200, {"ok": True, "deleted": filename})
        else:
            self._send_json(404, {"error": "File not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/hub/ai/generate":
            return self._hub("/ai/generate?" + parsed.query, "POST")
        if parsed.path != "/upload":
            self._send_json(404, {"error": "Not found"})
            return

        auth = self.headers.get("Authorization", "")
        if not AUTH_TOKEN or not hmac.compare_digest(auth, f"Bearer {AUTH_TOKEN}"):
            self._send_json(401, {"error": "Unauthorized"})
            return

        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in content_type:
            self._send_json(400, {"error": "Expected multipart/form-data"})
            return

        boundary_match = re.search(r'boundary=(.+)', content_type)
        if not boundary_match:
            self._send_json(400, {"error": "No boundary in content type"})
            return

        content_length = int(self.headers.get("Content-Length", 0))
        if content_length <= 0 or content_length > MAX_FILE_SIZE + 4096:
            self._send_json(413, {"error": f"Request too large (max {MAX_FILE_SIZE // 1024 // 1024}MB)"})
            return

        body = self.rfile.read(content_length)
        boundary = boundary_match.group(1).strip().strip('"')
        files = parse_multipart(body, boundary)

        if not files:
            self._send_json(400, {"error": "No file provided"})
            return

        file_info = files[0]
        file_data = file_info["data"]
        mime = file_info["content_type"]

        if len(file_data) > MAX_FILE_SIZE:
            self._send_json(413, {"error": f"File too large (max {MAX_FILE_SIZE // 1024 // 1024}MB)"})
            return

        if mime not in ALLOWED_TYPES:
            self._send_json(400, {"error": f"Type {mime} not allowed", "allowed": list(ALLOWED_TYPES)})
            return

        ext = EXT_MAP.get(mime, ".bin")
        file_hash = hashlib.sha256(file_data).hexdigest()[:16]
        timestamp = int(time.time())
        filename = f"{timestamp}_{file_hash}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        with open(filepath, "wb") as f:
            f.write(file_data)

        self._send_json(200, {
            "filename": filename,
            "size": len(file_data),
            "url": f"/images/{filename}",
        })

    def _serve_image(self, path):
        filename = os.path.basename(path)
        filepath = os.path.join(UPLOAD_DIR, filename)
        if not os.path.exists(filepath):
            self._send_json(404, {"error": "Image not found"})
            return

        ext = os.path.splitext(filepath)[1].lower()
        mime = MIME_MAP.get(ext, "application/octet-stream")

        file_size = os.path.getsize(filepath)
        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(file_size))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        self.end_headers()

        with open(filepath, "rb") as f:
            while True:
                chunk = f.read(65536)
                if not chunk:
                    break
                self.wfile.write(chunk)

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {self.command} {urlparse(self.path).path}")


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8001), ImageHandler)
    print(f"Image server running on 0.0.0.0:8001")
    print(f"Upload dir: {UPLOAD_DIR}")
    print(f"Max file size: {MAX_FILE_SIZE // 1024 // 1024}MB")
    # Credentials must never be logged.
    server.serve_forever()
