import { test, expect } from '@playwright/test';
import { docs, zoneDocs, redirects } from '../src/lib/docs.js';

test('documentation search handles matching and empty queries', async ({ page }) => {
  await page.goto('/guide/introduction/');
  const search = page.getByRole('searchbox');
  await search.fill('background');
  await expect(page.getByRole('navigation', {name:'Documentation topics'}).getByRole('link', {name:'Async work'})).toBeVisible();
  await search.fill('zzzz-not-a-concept');
  await expect(page.getByRole('status')).toContainText('No topics found');
  await search.fill('');
  await expect(page.getByRole('navigation', {name:'Documentation topics'}).getByRole('link')).toHaveCount(zoneDocs('guide').length);
});

for (const doc of docs) {
  test(`documentation renders ${doc.slug} with working section anchors`, async ({page}) => {
    const errors=[]; page.on('pageerror', error=> errors.push(error.message));
    await page.goto(doc.href);
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
  await page.getByRole('link',{name:'Guide',exact:true}).click();
  await expect(page).toHaveURL(/guide\/introduction/);
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
  await page.goto('/guide/introduction/');
  await page.getByRole('button',{name:'Copy janel'}).first().click();
  await expect(page.getByRole('button',{name:'Copy janel'}).first()).toHaveText('Copied!');
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain('from janelkit import state');
});

test('agents can read the plain text guide without JavaScript', async ({request}) => {
  const response=await request.get('/llms.txt');
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('JanelKit');
  expect(await response.text()).toContain('/reference/ai-agents/');
});

test('search reaches every area and labels results by area', async ({page}) => {
  await page.goto('/guide/introduction/');
  await page.getByRole('searchbox').fill('clipboard');
  const topics = page.getByRole('navigation', {name:'Documentation topics'});
  await expect(topics.getByRole('link', {name:'Clipboard', exact:true})).toBeVisible();
  await expect(topics.getByText('Ecosystem · Desktop', {exact:true})).toBeVisible();
});

test('areas are separate: tabs switch the sidebar and only the guide has chapters', async ({page}) => {
  await page.goto('/guide/introduction/');
  const areas = page.getByRole('navigation', {name:'Documentation areas'});
  await expect(areas.getByRole('link', {name:'Guide'})).toHaveAttribute('aria-current', 'true');
  await expect(page.getByLabel('Learning path')).toContainText(`CHAPTER 01 / ${String(zoneDocs('guide').length).padStart(2,'0')}`);
  await areas.getByRole('link', {name:'Ecosystem'}).click();
  await expect(page).toHaveURL(/\/ecosystem\/$/);
  await expect(page.getByRole('navigation', {name:'Documentation topics'}).getByRole('link')).toHaveCount(zoneDocs('ecosystem').length);
  await expect(page.getByLabel('Learning path')).toHaveCount(0);
  await expect(page.getByRole('navigation', {name:'Chapter navigation'})).toHaveCount(0);
  await expect(page.getByRole('region', {name:'Packages'}).getByRole('link')).toHaveCount(5);
});

test('each package is a section whose pages lead from one to the next', async ({page}) => {
  await page.goto('/ecosystem/router/');
  await expect(page.getByLabel('Package pages')).toContainText('ROUTER · PAGE 1 /');
  await page.getByRole('navigation', {name:'Chapter navigation'}).getByRole('link', {name:/Page stacks/}).click();
  await expect(page).toHaveURL(/\/ecosystem\/router\/stacks\/$/);
  await expect(page.locator('.doc-origin')).toContainText('pip install janelkit-router');
});

test('every page states where its feature comes from', async ({page}) => {
  await page.goto('/guide/elements/');
  await expect(page.locator('.doc-origin')).toContainText('Included with janelkit');
  await expect(page.locator('article')).toContainText('Every element on this page is part of the core janelkit package');
  await page.goto('/ecosystem/desktop/');
  await expect(page.locator('.doc-origin')).toContainText('pip install janelkit-desktop');
  await expect(page.locator('.doc-origin')).toContainText('adds no interface controls');
});

test('old addresses redirect to the new page and keep the anchor', async ({page}) => {
  for (const from of Object.keys(redirects)) {
    const response = await page.request.get(from);
    expect(response.status(), from).toBe(200);
  }
  await page.goto('/docs/reactivity/#counter');
  await expect(page).toHaveURL(/\/guide\/state\/#counter$/);
  await expect(page.getByRole('heading', {level:1})).toHaveText('Reactive state');
  await page.goto('/docs/ecosystem/');
  await expect(page).toHaveURL(/\/ecosystem\/$/);
  await page.goto('/reference/');
  await expect(page).toHaveURL(/\/reference\/python-api\/$/);
  await page.goto('/packages/janelkit-desktop/');
  await expect(page).toHaveURL(/\/ecosystem\/desktop\/$/);
  await page.goto('/guide/navigation/');
  await expect(page).toHaveURL(/\/ecosystem\/router\/$/);
});
