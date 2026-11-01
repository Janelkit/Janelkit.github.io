import { test, expect } from '@playwright/test';
import { docs } from '../src/lib/docs.js';

test('documentation search handles matching and empty queries', async ({ page }) => {
  await page.goto('/docs/introduction/');
  const search = page.getByRole('searchbox');
  await search.fill('background');
  await expect(page.getByRole('navigation', {name:'Documentation topics'}).getByRole('link', {name:'Async work'})).toBeVisible();
  await search.fill('zzzz-not-a-concept');
  await expect(page.getByRole('status')).toContainText('No topics found');
  await search.fill('');
  await expect(page.getByRole('navigation', {name:'Documentation topics'}).getByRole('link')).toHaveCount(docs.length);
});

for (const doc of docs) {
  test(`documentation renders ${doc.slug} with working section anchors`, async ({page}) => {
    const errors=[]; page.on('pageerror', error=> errors.push(error.message));
    await page.goto(`/docs/${doc.slug}/`);
    await expect(page.getByRole('heading', {level:1})).toHaveText(doc.title);
    for (const section of doc.sections) await expect(page.locator(`[id="${section.id}"]`)).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('mobile navigation, reset and horizontal layout', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.getByRole('button', {name:'Toggle navigation'}).click();
  await expect(page.getByRole('navigation',{name:'Main navigation'})).toBeVisible();
  await page.getByRole('link',{name:'Documentation',exact:true}).click();
  await expect(page).toHaveURL(/docs\/introduction/);
  await expect(page.getByRole('button',{name:'Toggle navigation'})).toHaveAttribute('aria-expanded','false');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/');
  await page.getByRole('button',{name:'Increment counter'}).click();
  await page.getByRole('button',{name:'Reset'}).click();
  await expect(page.getByTestId('counter-value')).toHaveText('0');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('copy code writes actual example to clipboard', async ({page,context}) => {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/docs/introduction/');
  await page.getByRole('button',{name:'Copy janel'}).first().click();
  await expect(page.getByRole('button',{name:'Copy janel'}).first()).toHaveText('Copied!');
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain('from janelkit import state');
});

test('agents can read the plain text guide without JavaScript', async ({request}) => {
  const response=await request.get('/llms.txt');
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('JanelKit');
  expect(await response.text()).toContain('/docs/ai-agents/');
});
