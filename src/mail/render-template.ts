import { readFileSync } from 'fs';
import { join } from 'path';

export function renderTemplate(
  templateName: string,
  variables: Record<string, string>,
): string {
  const templatePath = join(
    __dirname,
    'templates',
    `${templateName}.template.html`,
  );

  let html = readFileSync(templatePath, 'utf-8');

  for (const [key, value] of Object.entries(variables)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }

  return html;
}
