import { test, expect } from '@playwright/test';

for (const theme of ['dark', 'light']) {
  test(`${theme}: Janel code has readable syntax colors without JavaScript`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    // Set the theme even without the application's JavaScript.
    await page.locator('html').evaluate((element, theme) => element.dataset.theme = theme, theme);
    const code = page.locator('.code-block pre code').first();
    await expect(code).toContainText('from janelkit import state');
    expect(await code.locator('span[style]').count()).toBeGreaterThan(10);
    const result = await code.evaluate(element => {
      const rgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);
      const luminance = color => {
        const c = rgb(color).map(n => n / 255).map(n => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4);
        return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
      };
      const background = luminance(getComputedStyle(element.closest('.code-block')).backgroundColor);
      const colors = [...new Set([...element.querySelectorAll('span[style]')].filter(span => span.textContent.trim()).map(span => getComputedStyle(span).color))];
      return {
        colors,
        ratios: colors.map(color => {
          const foreground = luminance(color);
          return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
        })
      };
    });
    expect(result.colors.length).toBeGreaterThanOrEqual(4);
    for (const ratio of result.ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
    await page.locator('.code-block').first().screenshot({ path: `artifacts/highlighting-${theme}.png` });
    await context.close();
  });
}

test('documentation uses each snippet language and theme changes preserve source', async ({ page }) => {
  await page.goto('/docs/how-it-works/');
  const python = page.locator('code[data-language="python"]').first();
  const shell = page.locator('code[data-language="shell"]').first();
  await expect(python).toContainText('from pathlib import Path');
  await expect(shell).toContainText('janel parse src/App.janel');
  expect(await python.locator('span[style]').count()).toBeGreaterThan(5);
  expect(await shell.locator('span[style]').count()).toBeGreaterThan(5);
  const source = await python.textContent();
  const keyword = python.locator('span').filter({ hasText: /^from$/ }).first();
  const initialColor = await keyword.evaluate(element => getComputedStyle(element).color);
  await page.getByRole('button', { name: /Switch to .* theme/ }).click();
  await expect.poll(() => keyword.evaluate(element => getComputedStyle(element).color)).not.toBe(initialColor);
  expect(await python.textContent()).toBe(source);
  await page.goto('/docs/styling/');
  const css = page.locator('code[data-language="css"]').first();
  expect(await css.locator('span[style]').count()).toBeGreaterThan(5);
});
