# Unosend

Email delivery service. Simple REST API, 5,000 free emails/month.

**Docs**: https://www.unosend.co/docs

## Setup

1. Create account at [unosend.co/signup](https://www.unosend.co/signup)
2. Get API key from Dashboard → API Keys (starts with `un_`)
3. Add domain in Dashboard → Domains
4. Configure DNS records and verify

## Environment

```bash
UNOSEND_API_KEY=un_...  # Server only - never expose to client
```

## Usage

### Send Email

```typescript
// src/lib/email.ts
const UNOSEND_API_KEY = process.env.UNOSEND_API_KEY;

export async function sendEmail(options: {
  from: string;
  to: string[];
  subject: string;
  html: string;
}) {
  const response = await fetch('https://www.unosend.co/api/v1/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${UNOSEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    throw new Error(`Email failed: ${response.status}`);
  }

  return response.json();
}
```

### Example

```typescript
await sendEmail({
  from: 'hello@yourdomain.com',
  to: ['user@example.com'],
  subject: 'Welcome!',
  html: '<h1>Hello</h1><p>Welcome to our app.</p>',
});
```

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/emails` | POST | Send email |
| `/api/v1/domains` | POST | Add domain |
| `/api/v1/domains/{id}/verify` | POST | Verify domain |

## Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "from": "hello@yourdomain.com",
  "to": ["recipient@example.com"],
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

## Error Handling

```typescript
if (!response.ok) {
  const error = await response.json();
  // error.error.message = "Invalid or missing API key"
  // error.error.code = 401
  throw new Error(error.error.message);
}
```

| Status | Meaning |
|--------|---------|
| 401 | Invalid or missing API key |

## Limits

- Free: 5,000 emails/month
- API key prefix: `un_`
- Requires verified domain for production

## Security

- **Never** expose API key in client-side code
- Store in environment variables, not code
- Don't commit keys to version control
- Use different keys for dev/prod
- Rotate keys regularly
