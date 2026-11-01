import { test, expect } from '@playwright/test';
test('learn about JanelKit and try the counter', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Python');
  await page.getByRole('button', {name:'Increment counter'}).click();
  await expect(page.getByTestId('counter-value')).toHaveText('1');
  await page.getByRole('link', {name:'Start building', exact:true}).click();
  await expect(page).toHaveURL(/docs\/installation/);
  await expect(page.getByRole('heading', {level:1})).toContainText('Installation');
});
