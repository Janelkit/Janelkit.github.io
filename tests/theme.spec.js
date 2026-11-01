import { test, expect } from '@playwright/test';

test('theme switches, persists on reload and follows navigation', async ({page})=>{
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.getByRole('button',{name:'Switch to light theme'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await expect(page.getByRole('button',{name:'Switch to dark theme'})).toHaveAttribute('aria-pressed','true');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.getByRole('link',{name:'Start building',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.getByRole('button',{name:'Switch to dark theme'}).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});

test('saved light preference applies before hydration and docs remain readable without JS',async({browser})=>{
  const context=await browser.newContext();
  await context.addInitScript(()=>localStorage.setItem('janelkit-theme','light'));
  const page=await context.newPage();
  await page.route('**/*',route=>route.request().resourceType()==='script'?route.abort():route.continue());
  await page.goto('http://127.0.0.1:5173/docs/lifecycle/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await expect(page.locator('.theme-toggle')).toBeDisabled();
  await context.close();
  const nojs=await browser.newContext({javaScriptEnabled:false});
  const plain=await nojs.newPage();
  await plain.goto('http://127.0.0.1:5173/docs/introduction/');
  await expect(plain.getByRole('heading',{level:1})).toHaveText('Introduction');
  await nojs.close();
});

test('theme is usable when localStorage is blocked',async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage blocked');}})});
  await page.goto('/');
  await page.getByRole('button',{name:'Switch to light theme'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});

for(const width of [320,390,1024]){
  test(`light mode fits at ${width}px and exposes the theme control`,async({page})=>{
    await page.setViewportSize({width,height:844});
    await page.goto('/');
    await page.getByRole('button',{name:'Switch to light theme'}).click();
    for(const path of ['/','/docs/python-api/']){
      await page.goto(path);
      await expect(page.getByRole('button',{name:'Switch to dark theme'})).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
  });
}
