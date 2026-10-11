import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config({ quiet: true })
if (process.env.RESEND_API_KEY) {
  console.log(
    'Resend key is configured. Verify the sending domain in the Resend dashboard, then submit a quote to test delivery. This check does not validate the key or send email.',
  )
  process.exit(0)
}
const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD']
const missing = required.filter((key) => !process.env[key]?.trim())
if (missing.length) {
  console.error(
    `Email is not configured. Add RESEND_API_KEY for the free Resend service, or SMTP settings: ${missing.join(', ')}`,
  )
  process.exitCode = 1
} else {
  const port = Number(process.env.SMTP_PORT || 465)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error('SMTP_PORT must be a number between 1 and 65535.')
    process.exitCode = 1
  } else {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST.trim(),
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: { user: process.env.SMTP_USER.trim(), pass: process.env.SMTP_PASSWORD },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    })
    try {
      await transport.verify()
      console.log(
        `SMTP connection and authentication succeeded. Quote notifications target ${process.env.MANAGER_EMAIL?.trim() || 'riyastech001@gmail.com'}. No test email was sent.`,
      )
    } catch (error) {
      const reasons = {
        EAUTH: 'Authentication failed. Check SMTP_USER and the provider-issued password.',
        ECONNECTION: 'Connection failed. Check SMTP_HOST and SMTP_PORT.',
        ETIMEDOUT: 'Connection timed out. Check the host, port, and server outbound SMTP access.',
        ESOCKET: 'TLS or socket connection failed. Check the provider settings.',
      }
      console.error(
        reasons[error.code] ||
          'SMTP verification failed. Check your provider settings and server network access.',
      )
      process.exitCode = 1
    } finally {
      transport.close()
    }
  }
}
