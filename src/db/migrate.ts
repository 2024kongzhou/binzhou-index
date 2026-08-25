import { db } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

async function migrate() {
  console.log("Running migrations...");

  const admin = db.select().from(users).where(eq(users.email, "admin@keyi.de5.net")).get();
  if (!admin) {
    const hash = await hashPassword("admin123");
    db.insert(users).values({
      username: "admin",
      email: "admin@keyi.de5.net",
      passwordHash: hash,
      role: "admin",
    }).run();
    console.log("Admin user created: admin@keyi.de5.net / admin123");
  }

  console.log("Migrations complete!");
}

migrate().catch(console.error);
