# Environment Setup

## Required Variables

```bash
# Supabase (New API Key System)
NEXT_PUBLIC_SUPABASE_URL=               # or PUBLIC_SUPABASE_URL for SvelteKit
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=   # sb_publishable_... (browser safe)
SUPABASE_SECRET_KEY=                    # sb_secret_... (server only)

# App
NEXT_PUBLIC_APP_URL=                    # or PUBLIC_APP_URL for SvelteKit
```

## Supabase API Keys

**Use the new key format, NOT legacy JWT keys:**

| Key Type | Format | Use |
|----------|--------|-----|
| Publishable | `sb_publishable_...` | Browser/client |
| Secret | `sb_secret_...` | Server only, bypasses RLS |
| ~~anon~~ | JWT | LEGACY - do not use |
| ~~service_role~~ | JWT | LEGACY - do not use |

Get keys: Supabase Dashboard → Settings → API Keys

**Never commit `.env.local` or expose secret keys in client code**
