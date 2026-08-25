import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../src/db/schema";

export function getDB(d1: D1Database) {
  return drizzle(d1, { schema });
}
