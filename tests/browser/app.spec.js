import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const {pills: collection} = JSON.parse(readFileSync(new URL('../../site/data/library.json', import.meta.url), 'utf8'));

test('daily ritual, bookmarks, progress, search and details work together',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-09-05T10:00:00+02:00')});
 await page.goto('/');
 await expect(page.locator('.pill-card')).toHaveCount(3);
 const concepts=await page.locator('.pill-card h3').allTextContents();
 await page.locator('[data-action=save]').first().click();
 await expect(page.locator('#saved-count')).toHaveText('1');
 for(const button of await page.locator('[data-action=read]').all())await button.click();
 await expect(page.locator('#completion')).toBeVisible();
 await page.reload();
 await expect(page.locator('#progress-label')).toHaveText('3 of 3 read');
 expect(await page.locator('.pill-card h3').allTextContents()).toEqual(concepts);
 await page.getByRole('link',{name:'Saved 1'}).click();
 await expect(page.locator('.pill-card')).toHaveCount(1);
 await page.locator('[data-action=save]').click();
 await expect(page.getByText('Nothing saved yet.')).toBeVisible();
 await page.getByRole('link',{name:'My library',exact:true}).click();
 await expect(page.locator('#collection-title')).toHaveText('My reading notes.');
 await page.getByRole('searchbox').fill('attention residue');
 await expect(page.locator('.pill-card')).toHaveCount(1);
 await expect(page.locator('.book-title')).toHaveText('Deep Work');
 await page.getByText('Explore further',{exact:true}).click();
 const furtherLinks=page.locator('.further a');
 await expect(furtherLinks).toHaveCount(2);
 await expect(furtherLinks.first()).toBeVisible();
 await expect(furtherLinks.first()).toHaveAttribute('href','https://www.washington.edu/news/2018/01/16/task-interrupted-a-plan-for-returning-helps-you-move-on/');
 await expect(furtherLinks.last()).toBeVisible();
 await expect(furtherLinks.last()).toHaveAttribute('href','https://calnewport.com/on-deep-breaks/');
 await page.getByRole('searchbox').fill('not-a-real-concept');
 await expect(page.getByText('No matching notes.')).toBeVisible();
 await page.getByRole('button',{name:'Clear filters'}).click();
 await expect(page.locator('.pill-card')).toHaveCount(collection.length);
 await page.getByRole('combobox').selectOption('Science');
 await expect(page.locator('.pill-card')).toHaveCount(collection.filter(p => p.topic === 'Science').length);
 await page.getByRole('button',{name:'About this notebook'}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog')).not.toBeVisible();
 expect(errors).toEqual([]);
});

test('mobile layout fits and a new local day refreshes the cards',async({page})=>{
 await page.setViewportSize({width:375,height:812});
 await page.clock.install({time:new Date('2026-09-05T23:59:50+02:00')});
 await page.goto('/');
 await expect(page.locator('.pill-card')).toHaveCount(3);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 const before=await page.locator('.pill-card h3').allTextContents();
 await page.screenshot({path:'test-results/mobile.png',fullPage:true});
 await page.clock.fastForward(31000);
 await expect(page.locator('#date-label')).toContainText('SEPTEMBER 6');
 const after=await page.locator('.pill-card h3').allTextContents();
 expect(after.every(title=>!before.includes(title))).toBe(true);
 await expect(page.locator('#progress-label')).toHaveText('0 of 3 read');
});

test('failed content request can be retried',async({page})=>{
 await page.route('**/data/library.json',route=>route.fulfill({status:503,body:'unavailable'}));
 await page.goto('/');
 await expect(page.getByText('The books didn’t open.')).toBeVisible();
 await page.unroute('**/data/library.json');
 await page.getByRole('button',{name:'Try again'}).click();
 await expect(page.locator('.pill-card')).toHaveCount(3);
});

test('blocked browser storage still supports in-memory bookmarks',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}}));
 await page.goto('/');
 await expect(page.locator('.pill-card')).toHaveCount(3);
 await page.locator('[data-action=save]').first().click();
 await expect(page.locator('#storage-warning')).toBeVisible();
 await page.getByRole('link',{name:'Saved 1'}).click();
 await expect(page.locator('.pill-card')).toHaveCount(1);
});

test('desktop screenshot',async({page})=>{
 await page.setViewportSize({width:1440,height:1100});
 await page.clock.install({time:new Date('2026-09-05T10:00:00+02:00')});
 await page.goto('/');
 await expect(page.locator('.pill-card')).toHaveCount(3);
 await page.screenshot({path:'test-results/desktop.png',fullPage:true});
});

test('skip link keeps the current library route and search',async({page})=>{
 await page.goto('/#library');
 await page.getByRole('searchbox').fill('attention residue');
 await expect(page.locator('.pill-card')).toHaveCount(1);
 const skip=page.getByRole('link',{name:'Skip to content'});
 await skip.focus();await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/#library$/);
 await expect(page.getByRole('searchbox')).toHaveValue('attention residue');
 await expect(page.locator('#main')).toBeFocused();
});

test('the app loads from a project subdirectory',async({page})=>{
 const failures=[];page.on('requestfailed',r=>failures.push(r.url()));
 await page.goto('http://127.0.0.1:4174/site/');
 await expect(page.locator('.pill-card')).toHaveCount(3);
 await expect(page.locator('.brand')).toHaveCSS('font-family',/Georgia/);
 await page.getByRole('link',{name:'My library',exact:true}).click();
 await expect(page.locator('#collection-title')).toHaveText('My reading notes.');
 await page.getByRole('searchbox').fill('Atomic Habits');
 await expect(page.locator('.pill-card')).toHaveCount(6);
 expect(failures).toEqual([]);
});
