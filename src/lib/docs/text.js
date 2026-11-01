export function docToText(doc) {
  const lines = [`# ${doc.title}`, `/docs/${doc.slug}/`, doc.description, ''];
  for (const section of doc.sections) {
    lines.push(`## ${section.title}`, section.body, '');
    if (section.steps) lines.push(...section.steps.map((s,i) => `${i+1}. ${s}`), '');
    if (section.table) lines.push(section.table.headers.join(' | '), ...section.table.rows.map(row => row.join(' | ')), '');
    if (section.code) lines.push('```' + (section.language || ''), section.code, '```', '');
    if (section.explanation) lines.push('### How it works', ...section.explanation.map((s,i) => `${i+1}. ${s}`), '');
    if (section.expected) lines.push('### What you should see', section.expected, '');
    if (section.pitfalls) lines.push('### Common mistakes', ...section.pitfalls.map(s => '- ' + s), '');
  }
  return lines.join('\n');
}
