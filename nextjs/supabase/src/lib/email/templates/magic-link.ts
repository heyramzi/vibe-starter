import { baseTemplate } from "./base"

interface MagicLinkEmailOptions {
  code: string
  appName?: string
}

export function magicLinkEmail({
  code,
  appName = "Our App",
}: MagicLinkEmailOptions): { subject: string; html: string } {
  const content = `
    <h1 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 16px;">
      Your login code
    </h1>
    <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
      Enter this code to sign in to ${appName}:
    </p>
    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin: 0 0 24px;">
      <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #111827;">
        ${code}
      </span>
    </div>
    <p style="color: #9ca3af; font-size: 14px; line-height: 20px; margin: 0;">
      This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.
    </p>
  `

  return {
    subject: `${code} is your ${appName} login code`,
    html: baseTemplate({ content, previewText: `Your login code is ${code}` }),
  }
}
