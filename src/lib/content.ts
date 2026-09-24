export function decodeEscapedText(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "")
    .replace(/\\t/g, "  ")
    .trim();
}

export function formatPopulation(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = Number.parseInt(digits, 10);
  if (!Number.isFinite(n) || n <= 0 || n > 20000) return null;
  return `${n.toLocaleString("zh-CN")}人`;
}

export function formatSourceRemark(remark: string | null | undefined): string | null {
  if (!remark) return null;
  return remark
    .replace(/^来源:\s*/i, "")
    .replace(/\.md$/i, "")
    .trim();
}
