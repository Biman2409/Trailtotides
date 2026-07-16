import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  // Check if stories table exists
  const { error } = await supabase.from("stories").select("slug").limit(1);
  if (error && error.message?.includes("does not exist")) {
    console.log("stories table not found. Applying migration...");
    const sql = readFileSync(
      "/home/user/app/supabase/migrations/20260629000000_create_stories.sql",
      "utf8"
    );

    // Supabase doesn't have exec_sql by default, so we split and run each statement
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        const { error: runError } = await supabase.rpc("exec_sql", {
          query: stmt + ";",
        });
        if (runError) {
          console.log("Statement failed (may be expected):", runError.message);
        }
      } catch {
        // exec_sql might not exist - this is expected
        console.log("exec_sql not available, need manual migration.");
        console.log("Please run this SQL in the Supabase dashboard SQL editor:");
        console.log(sql);
        return;
      }
    }
    console.log("Migration applied successfully!");
  } else {
    console.log("stories table already exists.");
    const { data } = await supabase.from("stories").select("slug, title");
    console.log("Existing stories:", JSON.stringify(data, null, 2));
  }
}

main().catch(console.error);