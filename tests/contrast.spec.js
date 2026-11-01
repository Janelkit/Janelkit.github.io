import { test, expect } from '@playwright/test';

for(const theme of ['dark','light']){
  test(`${theme} text and accent tokens retain readable contrast`,async({page})=>{
    await page.addInitScript(theme=>localStorage.setItem('janelkit-theme',theme),theme);
    await page.goto('/');
    const ratios=await page.evaluate(()=>{
      const styles=getComputedStyle(document.documentElement);
      const token=name=>styles.getPropertyValue(name).trim();
      const luminance=hex=>{
        const rgb=hex.replace('#','').match(/../g).map(n=>parseInt(n,16)/255).map(c=>c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4);
        return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;
      };
      const contrast=(a,b)=>{const x=luminance(token(a)),y=luminance(token(b));return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)};
      return Object.fromEntries([
        ...['--text','--muted','--faint','--pink','--cyan','--lime'].map(name=>[name+' on background',contrast(name,'--bg')]),
        ['primary button',contrast('--ink','--pink')],
        ['primary hover',contrast('--ink','--pink-hover')],
        ['highlight label',contrast('--ink','--lime')],
        ['code',contrast('--code-text','--code-bg')]
      ]);
    });
    for(const [name,ratio] of Object.entries(ratios)) expect(ratio,`${theme}: ${name}`).toBeGreaterThanOrEqual(4.5);
  });
}
