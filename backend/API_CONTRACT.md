# BitPath Backend API Contract

Base URL for local development:

```text
http://127.0.0.1:8000
```

## Frontend Auth Header

For protected routes, the Next.js frontend sends the Supabase access token:

```http
Authorization: Bearer <supabase_access_token>
```

The backend verifies the token and uses the Supabase `sub` claim as the BitPath user id.

## CORS

Local frontend origins currently allowed:

```text
http://localhost:3000
http://127.0.0.1:3000
```

## Endpoints

### `GET /health`

Checks whether the backend is running.

Response:

```json
{
  "status": "ok",
  "service": "bitpath-backend",
  "environment": "development"
}
```

### `GET /api/auth/me`

Protected route for testing Supabase login integration.

Headers:

```http
Authorization: Bearer <supabase_access_token>
```

Response:

```json
{
  "user_id": "supabase-user-id",
  "email": "learner@example.com"
}
```

Error responses:

```json
{
  "detail": "Missing bearer token"
}
```

```json
{
  "detail": "Invalid or expired token"
}
```

## Frontend Fetch Example

```ts
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
});

const user = await response.json();
```