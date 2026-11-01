import { test, expect } from '@playwright/test';

test('agents receive a complete plain-text reference, not just a link list',async({request})=>{
  const full=await request.get('/llms-full.txt');
  expect(full.status()).toBe(200);
  expect(full.headers()['content-type']).toContain('text/plain');
  const text=await full.text();
  expect(text).toContain('before_leave');
  expect(text).toContain('Template');
  expect(text).toContain('What you should see');
  const index=await request.get('/llms.txt');
  expect(await index.text()).toContain('/llms-full.txt');
});
