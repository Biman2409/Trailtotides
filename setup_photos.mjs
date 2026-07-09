import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  "https://eylgddhfxzxwovcodihx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcHZtanp1cnNiandrcmd1bHlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA0NjE2NCwiZXhwIjoyMDg3NjIyMTY0fQ.is781ciwofk9TCRSPyGdGSosAoCCiH6ZhbIImkGbX0k"
);

// Create bucket
const { data: buckets } = await admin.storage.listBuckets();
if (!buckets?.find(b => b.name === "adventure-photos")) {
  const { error } = await admin.storage.createBucket("adventure-photos", {
    public: true,
    fileSizeLimit: 8 * 1024 * 1024,
  });
  console.log("Bucket:", error ? "ERROR: " + error.message : "✓ created");
} else {
  console.log("Bucket: already exists");
}

// Check/create table
const { error } = await admin.from("adventure_photos").select("id").limit(1);
if (error && error.code === "PGRST205") {
  console.log("Table does not exist yet — will be auto-created on first upload attempt");
} else if (error) {
  console.log("Table check error:", error.message);
} else {
  console.log("Table: ✓ exists");
}
