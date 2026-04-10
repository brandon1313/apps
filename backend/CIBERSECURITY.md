# OWASP Security Assessment — Municipal Platform Backend

## A01 · Broken Access Control

### Well Designed
- **`JwtAuthGuard`** protects every sensitive route via `@UseGuards` — unauthenticated
  requests receive 401 before reaching any handler.
- **`RolesGuard` + `@Roles()` decorator** enforces RBAC on news management routes;
  `ADMIN` and `WRITER` are the only roles that can create or moderate posts.
- **`register()` hardcodes `role: Role.USER`** — users cannot self-assign elevated roles
  at registration time.
- **Profile mutations are scoped to `request.user.sub`** — users can only edit their
  own data (`PATCH /users/me`).
- **`DashboardController`** is entirely behind `@UseGuards(JwtAuthGuard)`.

### Gaps (not yet fixed)
- **No global guard (opt-in model).** Authentication is applied per-route with
  `@UseGuards`. Any new route added without the decorator is public by default.
  A safer default is registering `JwtAuthGuard` as a global `APP_GUARD` and using
  `@Public()` to opt out, which is already the pattern used for public routes.
- **`GET /ornato/:id/receipt`** — any authenticated user can fetch any receipt by ID.
  There is no ownership check (`ticket.userId === request.user.sub`).
- **`POST /ornato/:id/pay`** — same issue; any authenticated user can pay any ticket.
- **`GET /fines/:id`** — public endpoint, fine data readable by anyone with a UUID.

---

## A05 · Security Misconfiguration

### Well Designed
- **Zod env schema** validates all required variables at startup; the app crashes fast
  on missing or malformed config (`JWT_ACCESS_SECRET` enforces `min(32)`).
- **`ValidationPipe`** with `whitelist: true` and `forbidNonWhitelisted: true` strips
  and rejects unknown request fields globally.
- **No sensitive data in JWT payload** — only `sub`, `email`, and `role` are signed.
- **Argon2id** with default parameters is used for all password hashing, including
  refresh token hashes stored in the DB.

### Fixed
- **CORS `origin: true` → `FRONTEND_URL`** — the server now only accepts cross-origin
  requests from the configured frontend origin instead of any origin.

### Gaps (not yet fixed)
- **No Helmet.** HTTP security headers are absent: `Content-Security-Policy`,
  `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, etc.
  Installing `helmet` and calling `app.use(helmet())` in `main.ts` covers this.
- **`docker-compose.yml` ships placeholder JWT secrets** (`replace-with-...`) and
  `NODE_ENV: development`. In a real deployment these must be overridden via a
  secrets manager or `.env` file that is never committed.
- **Opt-in guard model** (also an A01 concern) — see above.

---

## A07 · Identification and Authentication Failures

### Well Designed
- **Argon2id** — the strongest standard algorithm for password hashing.
- **Password complexity enforced in DTO** — minimum 10 characters, must contain
  uppercase, lowercase, and a digit.
- **Generic login error message** — both "user not found" and "wrong password" return
  `"Invalid credentials"`, preventing user enumeration.
- **Refresh token rotation** — each use of a refresh token issues a new one and
  revokes the old one.
- **Full logout** — `revokeAllForUser()` invalidates every active refresh token on
  the server and clears the cookie on the client.
- **Refresh tokens are hashed in the DB** — raw tokens are never stored.

### Fixed in this session
| Gap | Fix |
|---|---|
| No rate limiting on `/login` / `/register` | `@Throttle({ auth: { limit: 5, ttl: 900_000 } })` — max 5 auth requests per IP per 15 min |
| No global rate limit | `ThrottlerModule` registered in `AppModule` as `APP_GUARD` — default 60 req/min |
| No account lockout | After 5 failed login attempts the account is locked for 15 minutes (`locked_until` column + DB migration) |
| CORS open to all origins | `origin: true` replaced with `config.getOrThrow('FRONTEND_URL')` |
| `/refresh` had dead `@UseGuards(JwtAuthGuard)` silently bypassed by `@Public()` | Removed the conflicting decorator — endpoint is intentionally public; security is the refresh token itself |
| Refresh token stored in `localStorage` (XSS-readable) | Moved to `HttpOnly; Secure; SameSite=Strict` cookie set by the backend. Frontend no longer has any JS access to it. Access token stays in `localStorage` but is short-lived (15 min) with no renewal path from JS |

### Token storage model (after fix)
| Token | Storage | JS-readable | Lifetime |
|---|---|---|---|
| Access token | `localStorage` | Yes — but 15 min TTL limits damage window | 15 min |
| Refresh token | `HttpOnly` cookie | No — immune to XSS | 30 days |

### Remaining Gap
- **No email verification on `/register`** (Medium) — accounts are active immediately,
  enabling mass fake-account creation. Closing this requires an email provider,
  a signed verification token, and a `GET /auth/verify-email` endpoint.
