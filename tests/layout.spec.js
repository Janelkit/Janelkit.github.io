import { test, expect } from '@playwright/test';
for (const width of [320,360,768,1024,1440]) {
  test(`layout fits viewport at ${width}px`,async ({page})=>{
    await page.setViewportSize({width,height:900});
    for (const path of ['/','/guide/components/']) {
      await page.goto(path);
      expect(await page.evaluate(()=>({width:innerWidth,content:document.documentElement.scrollWidth}))).toEqual({width,content:width});
    }
  });
}

test('documentation remains readable with JavaScript disabled',async ({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:5173/reference/ai-agents/');
  await expect(page.getByRole('heading',{level:1})).toHaveText('Guide for AI coding agents');
  await expect(page.locator('article pre').first()).toBeVisible();
  await context.close();
});
