# Manager enquiry notifications

The existing `/get-a-quote` form submits to `/api/quote`. It validates the form,
checks consent and the honeypot, applies an origin check and rate limit, and saves
one enquiry through Payload's Local API in the private `quote-requests` collection.
Only after that save completes does it attempt the manager notification.
The current `/contact` page contains contact channels and a link to this quote flow;
it does not contain a separate submission form.

## Resend setup

Configure these server-only variables in `.env` or your deployment environment:

```dotenv
MANAGER_EMAIL=riyastech001@gmail.com
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=EPUBTRANS <info@epubtrans.com>
```

The sender must belong to a domain verified in your Resend account. Gmail is the
recipient here; use your verified domain as the sender. See the official
[Resend Node.js setup](https://resend.com/docs/send-with-nodejs).
Restart the app after editing environment values; recreate the app container for Docker.
`QUOTE_EMAIL_FROM` remains supported as a legacy sender setting.

The HTML and plain-text emails contain the reference, name, email, company,
service, languages, deadline, complete original project brief, consent, uploaded
file names and sizes, and an admin link. The project brief is preserved verbatim,
including leading/trailing whitespace and line breaks. HTML values are escaped.
Reply-To is the customer's validated email. Files stay private in Payload Admin.

Resend is used when its API key is present. The existing SMTP fallback is retained
when no Resend key is configured (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
`SMTP_PASSWORD`, optional `SMTP_FROM`). Both providers use `MANAGER_EMAIL`.

## Failure handling and verification

A database failure returns a submission error and does not send mail. An email
failure returns the saved reference with notification status `failed` or
`unavailable`; it never deletes the saved enquiry or files. Customer confirmation
distinguishes provider acceptance from unavailable mail. Acceptance does not
confirm inbox delivery.

The client disables the button and uses a synchronous submission guard to stop
repeated clicks. Notification attempts use the saved reference as a Resend
[idempotency key](https://resend.com/docs/dashboard/emails/idempotency-keys).
There is no automatic notification retry or durable HTTP submission deduplication;
reposting a submission after a lost response can create another record. To retry
mail, use the already-saved reference and data rather than posting the form again.

Run `npm run email:check` for configuration diagnostics (SMTP mode also checks
connection/authentication). This does not send mail or validate a Resend key.
After configuration, submit a quote, verify its record in Payload Admin and the
manager inbox/spam folder, compare the complete brief, and check Reply-To.
