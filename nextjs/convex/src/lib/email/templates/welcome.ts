import { baseTemplate } from "./base"

interface WelcomeEmailOptions {
  name?: string
  appName?: string
  dashboardUrl?: string
}

export function welcomeEmail({
  name,
  appName = "Our App",
  dashboardUrl = "/dashboard",
}: WelcomeEmailOptions = {}): { subject: string; html: string } {
  const greeting = name ? `Hi ${name},` : "Hi there,"

  const content = `
    <h1 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 16px;">
      Welcome to ${appName}
    </h1>
    <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
      ${greeting}
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
      Thanks for signing up! We're excited to have you on board.
    </p>
    <a href="${dashboardUrl}" style="display: inline-block; background-color: #111827; color: #ffffff; font-size: 14px; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
      Go to Dashboard
    </a>
  `

  return {
    subject: `Welcome to ${appName}`,
    html: baseTemplate({ content, previewText: `Welcome to ${appName}!` }),
  }
}
