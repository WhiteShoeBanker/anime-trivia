import { createClient } from "@supabase/supabase-js";
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  createWriteStream,
  rmSync,
  existsSync,
} from "fs";
import { join } from "path";
import archiver from "archiver";

// ── Load .env.local ──────────────────────────────────────────

const envPath = join(__dirname, "..", ".env.local");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// ── Configuration ────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const PAGE_SIZE = 1000;

// ── Tables to back up ────────────────────────────────────────

interface TableConfig {
  name: string;
  columns?: string;
}

const TABLES: TableConfig[] = [
  {
    name: "user_profiles",
    columns:
      "id, username, age_group, subscription_tier, subscription_source, created_at",
  },
  { name: "anime_series" },
  { name: "questions" },
  { name: "badges" },
  { name: "user_badges" },
  { name: "leagues" },
  { name: "league_groups" },
  { name: "league_memberships" },
  { name: "admin_config" },
  { name: "duel_matches" },
  { name: "duel_stats" },
  { name: "friendships" },
  { name: "promo_codes" },
  { name: "promo_redemptions" },
  { name: "star_league_waitlist" },
];

// ── Paginated fetch ──────────────────────────────────────────

const fetchAllRows = async (table: TableConfig): Promise<unknown[]> => {
  const rows: unknown[] = [];
  let offset = 0;

  while (true) {
    const query = supabase
      .from(table.name)
      .select(table.columns ?? "*")
      .range(offset, offset + PAGE_SIZE - 1);

    const { data, error } = await query;

    if (error) {
      console.error(`  Error fetching ${table.name}: ${error.message}`);
      return rows;
    }

    if (!data || data.length === 0) break;

    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return rows;
};

// ── Zip helper ───────────────────────────────────────────────

const zipFolder = (sourceDir: string, outPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
};

// ── Main ─────────────────────────────────────────────────────

const main = async () => {
  const date = new Date().toISOString().slice(0, 10);
  const backupsRoot = join(__dirname, "..", "backups");
  const backupDir = join(backupsRoot, date);
  const zipPath = join(backupsRoot, `${date}.zip`);

  mkdirSync(backupDir, { recursive: true });

  console.log(`Backing up to backups/${date}/\n`);

  for (const table of TABLES) {
    const rows = await fetchAllRows(table);
    const filePath = join(backupDir, `${table.name}.json`);
    writeFileSync(filePath, JSON.stringify(rows, null, 2));
    console.log(`  Backed up ${rows.length} rows from ${table.name}`);
  }

  console.log(`\nZipping to backups/${date}.zip ...`);
  await zipFolder(backupDir, zipPath);

  // Remove unzipped folder after successful zip
  rmSync(backupDir, { recursive: true });

  console.log("Done!");
};

main().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
