# Scripts

## backup-db.ts

Exports critical database tables to JSON and zips them into `backups/YYYY-MM-DD.zip`.

### Prerequisites

Set these environment variables (via `.env.local` or shell):

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (has full access, keep secret)

### Usage

```bash
pnpm backup
```

### What it backs up

| Table | Notes |
|---|---|
| user_profiles | Excludes `parent_email` for privacy |
| anime_series | All fields |
| questions | All fields |
| badges | All fields |
| user_badges | All fields |
| leagues | All fields |
| league_groups | All fields |
| league_memberships | All fields |
| admin_config | All fields |
| duel_matches | All fields |
| duel_stats | All fields |
| friendships | All fields |
| promo_codes | All fields |
| promo_redemptions | All fields |
| star_league_waitlist | All fields |

### Output

Backups are saved to `backups/YYYY-MM-DD.zip` (git-ignored).
