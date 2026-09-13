import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

/** Return the request-scoped D1 client or throw when its binding is unavailable. */
export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Configure the DB binding in wrangler.jsonc before using the enquiry service."
    );
  }

  return drizzle(env.DB, { schema });
}
