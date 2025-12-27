interface BaseTemplateOptions {
  content: string
  previewText?: string
}

// Clean, minimal email template
export function baseTemplate({ content, previewText }: BaseTemplateOptions): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${previewText ? `<meta name="x-apple-disable-message-reformatting">` : ""}
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px;">
  ${previewText ? `<span style="display: none; max-height: 0; overflow: hidden;">${previewText}</span>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; margin: 0 auto;">
    <tr>
      <td style="background-color: #ffffff; border-radius: 8px; padding: 40px;">
        ${content}
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()
}
