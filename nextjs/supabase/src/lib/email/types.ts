export interface SendEmailOptions {
  from?: string
  to: string | string[]
  subject: string
  html: string
}

export interface EmailResponse {
  id: string
  from: string
  to: string[]
  created_at: string
}
