import { test, expect } from '@playwright/test';

test('documentation offers a clear reading path and explained examples',async({page})=>{
  await page.goto('/guide/introduction/');
  await expect(page.getByLabel('Learning path')).toBeVisible();
  await expect(page.getByText('How to read this documentation', {exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Build your first app',exact:true})).toBeVisible();
});

test('lessons render walkthroughs, expected output and common mistakes',async({page})=>{
  await page.goto('/guide/lifecycle/');
  await expect(page.getByRole('heading',{name:'How it works',exact:true}).first()).toBeVisible();
  await expect(page.getByRole('heading',{name:'What you should see',exact:true}).first()).toBeVisible();
  await expect(page.getByRole('heading',{name:'Common mistakes',exact:true}).first()).toBeVisible();
});

test('the full API reference is searchable by its symbols',async({page})=>{
  await page.goto('/guide/introduction/');
  await page.getByRole('searchbox').fill('before_leave');
  await expect(page.getByRole('navigation',{name:'Documentation topics'}).getByRole('link',{name:'Python API reference',exact:true})).toBeVisible();
});
