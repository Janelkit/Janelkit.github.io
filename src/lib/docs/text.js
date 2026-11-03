import { origins } from '../origins.js';

// Plain-text rendering of a page, used by /llms-full.txt.
export function docToText(doc) {
  const origin = doc.origin ? [`Package: ${origins[doc.origin].package} (${origins[doc.origin].kind})`] : [];
  const lines = [`# ${doc.title}`, doc.href, ...origin, doc.description, ''];
  if (doc.learn?.length) lines.push('## What you will learn', ...doc.learn.map(s => '- ' + s), '');
  for (const section of doc.sections) {
    lines.push(`## ${section.title}`, section.body, '');
    if (section.steps) lines.push(...section.steps.map((s,i) => `${i+1}. ${s}`), '');
    if (section.table) lines.push(section.table.headers.join(' | '), ...section.table.rows.map(row => row.join(' | ')), '');
    if (section.code) lines.push('```' + (section.language || ''), section.code, '```', '');
    if (section.explanation) lines.push('### How it works', ...section.explanation.map((s,i) => `${i+1}. ${s}`), '');
    if (section.expected) lines.push('### What you should see', section.expected, '');
    if (section.pitfalls) lines.push('### Common mistakes', ...section.pitfalls.map(s => '- ' + s), '');
    if (section.see) lines.push('Learn more: ' + section.see.join(', '), '');
  }
  if (doc.summary?.length) lines.push('## Key points', ...doc.summary.map(s => '- ' + s), '');
  return lines.join('\n');
}
