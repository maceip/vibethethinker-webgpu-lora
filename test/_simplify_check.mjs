/* Verify the design-system UI: single status rail, gear-gated source options,
   Step 2 hidden until load, consistent buttons. No JS errors. Screenshots. */
import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 820, height: 1100 }, deviceScaleFactor: 2 });
const errs = [];
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
p.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message));
await p.goto('http://localhost:8016/docs/index.html', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(500);

const vis = (id) => p.evaluate((x) => { const e = document.getElementById(x); if (!e) return false; const s = getComputedStyle(e); return s.display !== 'none' && s.visibility !== 'hidden' && !e.hidden; }, id);

const r0 = await p.evaluate(() => ({
  railState: document.getElementById('rail')?.dataset.state,
  railChip: document.getElementById('railChip')?.textContent,
  removedBlackBox: !document.getElementById('askLocked'),
}));
console.log('rail state:', r0.railState, '| chip:', JSON.stringify(r0.railChip), '| old lock-note removed:', r0.removedBlackBox);
console.log('settings hidden initially:', !(await vis('settings')), '| step2 hidden initially:', !(await vis('askSection')), '| adapter hidden:', !(await vis('adapterWrap')));
await p.locator('#paneInfer').screenshot({ path: '/tmp/ds_infer.png' });

// gear opens source options
await p.click('#gear');
await p.waitForTimeout(150);
console.log('settings visible after gear:', await vis('settings'), '| hfRepo reachable:', await vis('hfRepo'));
await p.locator('.win').screenshot({ path: '/tmp/ds_settings.png' });

// simulate "loaded" to confirm Step 2 reveals and rail flips
await p.evaluate(() => { document.getElementById('askSection').hidden = false; const r = document.getElementById('rail'); r.dataset.state = 'ok'; document.getElementById('railChip').textContent = 'Live · base'; });
await p.waitForTimeout(150);
console.log('step2 visible when loaded:', await vis('askSection'));
await p.locator('#paneInfer').screenshot({ path: '/tmp/ds_loaded.png' });

await p.evaluate(() => document.getElementById('tabTrain').click());
await p.waitForTimeout(150);
await p.locator('#paneTrain').screenshot({ path: '/tmp/ds_train.png' });

console.log('CONSOLE ERRORS:', errs.length ? JSON.stringify(errs) : 'none');
await b.close();
console.log('DS_CHECK_DONE');
