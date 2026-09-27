import { esc } from "./core";

const safeImage = (value: string) => /^https:\/\//.test(value) || /^\/api\/img\/[\w.-]+$/.test(value);
const safeLink = (value: string) => /^https:\/\//.test(value) || /^\/(?!\/)[\w\-./#?=&%]+$/.test(value);

function inline(raw: string): string {
  const tokens: string[] = [];
  const save = (html: string) => {
    const token = `\u0001${tokens.length}\u0002`;
    tokens.push(html);
    return token;
  };
  let text = raw.replace(/`([^`\n]+)`/g, (_, code: string) => save(`<code>${esc(code)}</code>`));
  text = text.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (whole, label: string, href: string) =>
    safeLink(href) ? save(`<a href="${esc(href)}" rel="noopener noreferrer">${esc(label)}</a>`) : whole);
  text = text.replace(/https:\/\/[^\s<>"'，。；）)]+/g, (url: string) =>
    save(`<a href="${esc(url)}" rel="noopener noreferrer">${esc(url)}</a>`));
  text = esc(text).replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  return text.replace(/\u0001(\d+)\u0002/g, (_, index: string) => tokens[Number(index)]);
}

export function renderNoteBody(raw: unknown): string {
  const lines = String(raw ?? "").replace(/\r\n/g, "\n").split("\n");
  const parts: string[] = [];
  let paragraph: string[] = [];
  let list: "ul" | "ol" | "" = "";
  let code: string[] | null = null;
  const flushParagraph = () => {
    if (paragraph.length) parts.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const closeList = () => { if (list) parts.push(`</${list}>`); list = ""; };
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      flushParagraph(); closeList();
      if (code) { parts.push(`<pre><code>${esc(code.join("\n"))}</code></pre>`); code = null; }
      else code = [];
      continue;
    }
    if (code) { code.push(line); continue; }
    const value = line.trim();
    if (!value) { flushParagraph(); closeList(); continue; }
    const image = value.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (image && safeImage(image[2])) {
      flushParagraph(); closeList();
      parts.push(`<figure><img src="${esc(image[2])}" alt="${esc(image[1])}" loading="lazy"><figcaption>${esc(image[1])}</figcaption></figure>`);
      continue;
    }
    const heading = value.match(/^(#{1,3})\s+(.+)$/);
    if (heading) { flushParagraph(); closeList(); parts.push(`<h${heading[1].length + 1}>${inline(heading[2])}</h${heading[1].length + 1}>`); continue; }
    const item = value.match(/^([-*]|\d+\.)\s+(.+)$/);
    if (item) {
      flushParagraph();
      const kind = /\d/.test(item[1][0]) ? "ol" : "ul";
      if (list !== kind) { closeList(); parts.push(`<${kind}>`); list = kind; }
      parts.push(`<li>${inline(item[2])}</li>`);
      continue;
    }
    closeList();
    if (value.startsWith("> ")) { flushParagraph(); parts.push(`<blockquote>${inline(value.slice(2))}</blockquote>`); continue; }
    paragraph.push(value);
  }
  flushParagraph(); closeList();
  if (code) parts.push(`<pre><code>${esc(code.join("\n"))}</code></pre>`);
  return parts.join("");
}
