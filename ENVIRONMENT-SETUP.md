# Environment keys and values

Reviewed application source, configuration, scripts, tests, Docker deployment, and existing environment templates. This is an environment-configuration review, not a full correctness or security audit of every source file. Secret values were not copied into this report. Existing `.env` credentials were not changed or validated against their providers.

## Main setup

Use `.env.example` for local development. Set `NEXT_PUBLIC_SERVER_URL` to the exact origin and port used by your server. On Vercel, use the deployed HTTPS origin, such as `https://epubtrans-v2.vercel.app`, instead of localhost. Rebuild after changing public variables.

| Key                    | Value or example                                                | Purpose                                                                                               |
| ---------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| DATABASE_URL           | `postgresql://epubtrans:YOUR_PASSWORD@127.0.0.1:5432/epubtrans` | Required PostgreSQL connection; use your actual database credentials and provider connection options. |
| PAYLOAD_SECRET         | A unique cryptographically random secret                        | Required CMS signing/encryption secret. Keep the existing value stable.                               |
| NEXT_PUBLIC_SERVER_URL | `http://localhost:3000` locally                                 | Public site origin, metadata, request-origin checks and email links.                                  |
| PREVIEW_SECRET         | A different random secret                                       | Required for protected CMS previews.                                                                  |
| CRON_SECRET            | Empty unless using authenticated scheduled jobs                 | Bearer token for running Payload jobs.                                                                |
| PRIVATE_UPLOAD_DIR     | `private-uploads`                                               | Local private quote attachments; default when Blob is absent.                                         |
| PORTFOLIO_PREVIEW_DIR  | `private-uploads/portfolio-previews`                            | Local private portfolio images.                                                                       |
| BLOB_READ_WRITE_TOKEN  | Your private Vercel Blob token                                  | Persistent private storage on Vercel; do not rely on serverless local disk for durable uploads.       |

Generate each new secret independently, for example with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Do not rotate the existing Payload secret just to fill a template.

## Email: choose Resend or SMTP

| Key                        | Value or example                                  | Purpose                                                           |
| -------------------------- | ------------------------------------------------- | ----------------------------------------------------------------- |
| MANAGER_EMAIL              | Your approved notification inbox                  | Quote notification recipient. No application fallback recipient.  |
| ENQUIRY_RECIPIENT_APPROVED | `false`; set `true` after verifying the recipient | Required gate for quote notification delivery.                    |
| RESEND_API_KEY             | Your Resend API key                               | Preferred email provider when populated.                          |
| RESEND_FROM_EMAIL          | `EPUBTRANS <info@epubtrans.com>`                  | Must be authorized by your verified sending domain.               |
| QUOTE_EMAIL_FROM           | Same verified sender                              | Legacy fallback when `RESEND_FROM_EMAIL` is empty.                |
| SMTP_HOST                  | Your provider's SMTP hostname                     | Alternative when Resend is not configured.                        |
| SMTP_PORT                  | `465` or your provider's port, often `587`        | 465 uses implicit TLS; other ports require STARTTLS in this code. |
| SMTP_USER                  | Your SMTP username                                | SMTP authentication.                                              |
| SMTP_PASSWORD              | Your SMTP password or app password                | SMTP authentication secret.                                       |
| SMTP_FROM                  | Your authorized sender address                    | Falls back to `SMTP_USER` when empty.                             |

A configured Resend key takes precedence; failed Resend delivery does not automatically retry via SMTP. `npm run email:check` does not send mail and does not validate a Resend key.

## Assistant and translation

| Key                               | Value/default                              | Purpose                                                      |
| --------------------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| GEMINI_API_KEY                    | Your Google Gemini API key                 | Required for AI assistant replies.                           |
| GEMINI_ASSISTANT_MODEL            | `gemini-3.5-flash-lite`                    | Current code default; provider availability was not checked. |
| ASSISTANT_DAILY_REQUEST_LIMIT     | `300`                                      | Assistant request cap.                                       |
| GOOGLE_TRANSLATE_API_KEY          | Empty or your Google Cloud Translation key | Without a key, translation uses MyMemory.                    |
| TRANSLATION_DAILY_CHARACTER_LIMIT | `250000`                                   | Application translation budget.                              |
| TRANSLATION_CACHE_DIR             | `.translation-cache`                       | Local translation cache directory.                           |

## Indexing and proxy configuration

| Key                         | Value/default                                                    | Purpose                                                                                    |
| --------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| SITE_NOINDEX                | `true` for staging                                               | Explicit noindex flag used by landing metadata; not a universal indexing switch.           |
| EPUBTRANS_INDEXING_APPROVED | `false` until publication is approved                            | Approval gate read by selected routes. Setting it alone does not remove all noindex rules. |
| TRUST_NGINX_PROXY           | `false` locally/Vercel; `true` behind the supplied trusted Nginx | Enables trusting Nginx request-address headers.                                            |

Some metadata is evaluated during the build. The `/contact` route currently sets `robots.index=false` directly. Check route metadata, sitemap policy, and response headers before assuming production indexing is enabled.

## Vercel/platform-provided keys

Normally do not enter these manually: `VERCEL` (`1` on Vercel), `VERCEL_ENV` (`production`, `preview`, or `development`), `VERCEL_URL`, `VERCEL_BRANCH_URL`, and `VERCEL_PROJECT_PRODUCTION_URL`. Vercel URL values are hostnames without `https://`. `NODE_ENV`, `PORT`, `HOSTNAME`, `NODE_OPTIONS`, `NEXT_TELEMETRY_DISABLED`, and internal `__NEXT_PRIVATE_ORIGIN` are runtime/build controls; avoid overriding framework internals.

## Docker/VPS only

| Key                   | Value/example                                        |
| --------------------- | ---------------------------------------------------- |
| SITE_HOST             | Your domain without protocol, e.g. `www.example.com` |
| POSTGRES_DB           | `epubtrans`                                          |
| POSTGRES_USER         | `epubtrans`                                          |
| POSTGRES_PASSWORD     | A strong unique database password                    |
| CERTIFICATE_DIRECTORY | `/etc/letsencrypt`                                   |

Docker Compose constructs `DATABASE_URL`, fixes `PRIVATE_UPLOAD_DIR=/app/private-uploads`, `TRANSLATION_CACHE_DIR=/app/translation-cache`, and `TRUST_NGINX_PROXY=true`. Special characters in a password embedded in a database URL need URL encoding.

**Deployment gap:** the current Compose environment allowlist does not pass `ENQUIRY_RECIPIENT_APPROVED`, `EPUBTRANS_INDEXING_APPROVED`, `SITE_NOINDEX`, `CRON_SECRET`, or `BLOB_READ_WRITE_TOKEN` into the app. Adding those keys to an env file alone will not enable them in Docker. This review did not modify deployment behavior.

## One-time administration and test scripts

| Key                  | Value/example                                           | Usage                                                                             |
| -------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------- |
| ADMIN_EMAIL          | Your administrator email                                | `scripts/create-admin.ts` only.                                                   |
| ADMIN_PASSWORD       | A unique password of at least 16 characters             | Admin creation script only; do not retain unnecessarily.                          |
| PLAYWRIGHT_BASE_URL  | `http://localhost:3000` for your running instance       | Playwright defaults to port 3001; other verification scripts can default to 3000. |
| AUDIT_BASE_URL       | `http://127.0.0.1:3000`                                 | Audit scripts.                                                                    |
| AUDIT_PORT           | `3000`                                                  | Audit production-server launcher.                                                 |
| COMPARE_LOCAL_URL    | `http://localhost:3000`                                 | Public-page comparison script.                                                    |
| INDUSTRIES_TEST_URL  | `http://localhost:3001`                                 | Industries verification script.                                                   |
| LIVE_ASSISTANT_TESTS | `true` only when explicitly running live provider tests | Enables real Gemini usage.                                                        |
| CI                   | Set by your CI platform                                 | Test runner retries, workers, and focused-test checks.                            |

## Current local status

The local `.env` has nonempty values for `DATABASE_URL`, `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `CRON_SECRET`, `GEMINI_API_KEY`, `MANAGER_EMAIL`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL`; presence does not prove validity. Its public origin is `http://localhost:3000`.

`ENQUIRY_RECIPIENT_APPROVED` is absent, so quote email notifications are currently gated off. Blob and Google Translation keys are absent from that file; local attachment storage and MyMemory are the corresponding fallbacks. Runtime/platform environment overrides were not inspected. Your private `.env` was left unchanged.
