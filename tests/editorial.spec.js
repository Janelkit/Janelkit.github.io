import { test, expect } from '@playwright/test';

test('homepage focuses on the product rather than the origin of the name',async({page})=>{
  await page.goto('/');
  await expect(page.locator('.name-story')).toHaveCount(0);
  await expect(page.getByText('PORTUGUESE / WINDOW',{exact:true})).toHaveCount(0);
  await expect(page.getByRole('heading',{level:1})).toContainText('Python');
});

test('docs do not publish obsolete platform verification or release disclaimers',async({request,page})=>{
  const response=await request.get('/llms-full.txt');
  expect(response.ok()).toBe(true);
  const text=await response.text();
  expect(text.includes('not verified Linux or macOS')).toBe(false);
  expect(text.includes('reports Windows verification')).toBe(false);
  expect(text.includes('does not independently verify package publication')).toBe(false);
  await page.goto('/guide/cli/');
  await expect(page.getByRole('heading',{name:'Separate validation from distribution',exact:true})).toHaveCount(0);
  await page.goto('/guide/installation/');
  await expect(page.locator('article')).toContainText('Linux / macOS');
});
