interface Env {
  IMAGE_ORIGIN?: string;
  DB: D1Database;
  CACHE: KVNamespace;
  JWT_SECRET: string;
  ORACLE_IMG_SERVER: string;
  AI_HUB_URL: string;
  AI_HUB_KEY: string;
  PREVIEW_READ_ONLY?: string;
}
declare module "*.css" {
  const text: string;
  export default text;
}
declare module "*?raw" {
  const text: string;
  export default text;
}
