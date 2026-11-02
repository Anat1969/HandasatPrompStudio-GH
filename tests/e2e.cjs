// בדיקת קצה לקצה: npm run build && node tests/e2e.cjs (מריץ vite preview בעצמו)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const BASE = 'http://localhost:4199/';
const fails = [];
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fails.push(msg); };
const AIMENU = fs.readFileSync(path.join(__dirname, '../public/ai-menu.js'));

(async () => {
  const srv = spawn('npx', ['vite', 'preview', '--port', '4199', '--strictPort'], { stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 2500));
  const b = await chromium.launch();
  try {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const p = await ctx.newPage();
    await p.route('**/appofapp-gh.vercel.app/ai-menu.js', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: AIMENU }));
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    // מוקים לשרת: סנכרון ו"הגרסה המלאה"
    const pushed = [];
    await ctx.route('**/rest/v1/rpc/hps_push', (r) => { pushed.push(JSON.parse(r.request().postData())); r.fulfill({ status: 200, contentType: 'application/json', body: '{"updated_at":"2026-11-02T00:00:00Z"}' }); });
    await ctx.route('**/rest/v1/rpc/hps_pull', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(JSON.parse(r.request().postData()).p_key === 'aaaaa-bbbbb-ccccc' ? { name: 'רון', state: { 'progress': { v: { '13': [true, true, true] }, t: 9999999999999 } }, works: [], updated_at: 'x' } : null) }));
    await ctx.route('**/rest/v1/rpc/hps_cohort', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
      { name: 'נועה', progress: { '1': [true, true, true], '7': [true, false, false] }, works: 2, updated_at: new Date().toISOString() },
      { name: 'רון', progress: { '1': [true, true, true], '7': [true, true, false], '6': [true, true, true] }, works: 0, updated_at: '2026-10-01T00:00:00Z' },
    ]) }));
    await ctx.route('**/functions/v1/hps-improve', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ provider: 'gemini', settings: 'ענה בעברית, בטון מקצועי.', project: 'אתה יועץ תכנון למבני חינוך.\nפרויקט: כיתה בבית ספר באשדוד.', chat: 'הצע תכנון לכיתה.', notes: [{ layer: 'project', change: 'נוסף תפקיד', why: 'המודל יודע מי הוא.' }] }) }));
    await p.goto(BASE, { waitUntil: 'networkidle' });

    ok((await p.locator('h1').innerText()).includes('שיעורים'), 'דף הבית: שורת התובנה');
    ok(await p.locator('svg.building .floor').count() === 5, 'הבניין: 5 קומות');
    ok(await p.locator('svg.building .win').count() === 24, 'הבניין: 24 חלונות');
    ok(await p.locator('ai-menu .logo').isVisible().catch(() => false) || await p.locator('ai-menu').isVisible(), 'כפתור הלוגו בסרגל');
    ok(!(await p.locator('header >> text=העתקת קישור').first().isVisible().catch(() => false)), 'אין כפתורי פיתוח חופשיים בסרגל');

    // ריחוף על המקרא מעמעם את שאר הקומות
    await p.locator('.legend-row').first().hover();
    ok(await p.locator('svg.building .floor.dim').count() === 4, 'מקרא מסונכרן: 4 קומות מעומעמות');

    // לחיצה על חלון פותחת שיעור
    await p.locator('svg.building .win').first().click({ force: true });
    await p.waitForURL(/#\/lesson\/\d+/);
    ok(/#\/lesson\/\d+/.test(p.url()), 'חלון בבניין פותח שיעור');

    // שיעור: סימון שלב נשמר אחרי רענון
    await p.goto(BASE + '#/lesson/7', { waitUntil: 'networkidle' });
    ok((await p.locator('h1').innerText()).includes('מעבר לשאלה'), 'שיעור 07 נפתח');
    await p.locator('.step-node').first().click();
    await p.reload({ waitUntil: 'networkidle' });
    ok(await p.locator('.step-node').first().getAttribute('aria-pressed') === 'true', 'סימון שלב נשמר אחרי רענון');
    await p.locator('textarea[aria-label="רפלקציה על השיעור"]').fill('שאלת מה אם פתחה כיוון חדש');
    await p.reload({ waitUntil: 'networkidle' });
    ok((await p.locator('textarea[aria-label="רפלקציה על השיעור"]').inputValue()).includes('מה אם'), 'רפלקציה נשמרת');

    // פרומפט פתיחה ומעבר לסטודיו
    await p.getByRole('button', { name: 'פרומפט פתיחה' }).first().click();
    ok((await p.locator('.prompt-box').innerText()).includes('[פרויקט]'), 'פרומפט פתיחה בשלוש שכבות');
    await p.getByRole('button', { name: 'פתח בסטודיו ומדוד' }).first().click();
    await p.waitForURL(/#\/studio/);
    ok((await p.locator('textarea[aria-label="שכבת הצ\'אט"]').inputValue()).includes('שאל שאלה ישירה'), 'הסטודיו נטען עם השלב מהשיעור');

    // מדד: צ'אט בלבד נמוך, שלוש שכבות גבוה
    await p.getByRole('button', { name: "רמת צ'אט בלבד" }).click();
    const low = Number(await p.locator('.gauge text').textContent());
    await p.getByRole('button', { name: 'שלוש שכבות: כיתה' }).click();
    const high = Number(await p.locator('.gauge text').textContent());
    ok(low < 50 && high === 100, `מדד: צ'אט בלבד ${low}, שלוש שכבות ${high}`);
    ok(await p.locator('section.checks').count() === 3, 'המדד מפורק לשלוש שכבות');
    await p.getByRole('button', { name: "הכול בצ'אט, בלי סדר" }).click();
    ok(await p.locator('.check small.move').count() >= 3, 'רכיב בשכבה הלא נכונה מקבל הוראה להעביר');
    await p.getByRole('button', { name: 'הראה איך זה צריך להיראות' }).click();
    await p.waitForSelector('#ideal');
    ok((await p.locator('#ideal .section-lead').innerText()).includes('100'), 'הגרסה המלאה מקבלת 100');
    ok(await p.locator('#ideal mark.added').count() > 3, 'השורות שנוספו מסומנות');
    ok(await p.locator('#ideal .note').count() >= 2, 'הסבר לכל תוספת');
    await p.getByRole('button', { name: 'החל את הגרסה המלאה' }).click();
    ok(Number(await p.locator('.gauge text').textContent()) === 100, 'אחרי החלה: הציון 100');
    await p.getByRole('button', { name: 'שלוש שכבות: כיתה' }).click();
    await p.getByRole('button', { name: 'שמור בספרייה' }).click();
    ok(await p.locator('.lib-row').count() === 1, 'שמירה בספרייה');

    // ניווט בסרגל ושם האפליקציה לבית
    for (const [label, hash] of [['שיעורים', '#/lessons'], ['תיק עבודות', '#/portfolio'], ['כתבות', '#/feature']]) {
      await p.locator('.tabs').getByRole('link', { name: label }).click();
      await p.waitForFunction((l) => document.querySelector('.tabs [aria-current="page"]')?.textContent === l, label, { timeout: 4000 }).catch(() => {});
      ok(await p.locator('.tabs [aria-current="page"]').innerText() === label, `לשונית ${label}`);
    }
    await p.locator('.brand').click();
    await p.waitForFunction(() => document.querySelector('h1')?.textContent.includes('קומות'), null, { timeout: 4000 }).catch(() => {});
    ok((await p.locator('h1').innerText()).includes('קומות'), 'שם האפליקציה מוביל לבית');

    // בורר קומות: לחיצה מחליפה, נשמר בכתובת
    await p.goto(BASE + '#/lessons', { waitUntil: 'networkidle' });
    await p.locator('.toolbar .chip-t', { hasText: 'עיר ומרחב' }).click();
    ok(await p.locator('.track-block').count() === 1 && p.url().includes('t=urban'), 'בורר: קומה אחת, במצב בכתובת');
    await p.locator('.toolbar .chip-add').first().click();
    ok(await p.locator('.track-block').count() === 2, 'בורר: "+" מוסיף קומה');
    await p.reload({ waitUntil: 'networkidle' });
    ok(await p.locator('.track-block').count() === 2, 'קישור מועתק פותח את אותו מצב');
    await p.locator('.toolbar .chip-t', { hasText: 'הכול' }).click();
    ok(await p.locator('.track-block').count() === 5, 'בורר: "הכול" מאפס');

    // חיפוש עברי: התאמה אחרי אותיות שימוש, וקצר חייב להיות שלם
    const search = p.getByLabel('חיפוש בקורס');
    await search.fill('לתקן');
    ok(await p.locator('.s-item').count() > 0, 'חיפוש "לתקן" מוצא "תקן"');
    await search.fill('אור');
    const orHits = await p.locator('.s-item').allInnerTexts();
    ok(!orHits.some((t) => t.includes('תאוריה')), 'מילה קצרה לא תופסת אמצע מילה');
    await search.fill('אין כזה דבר בכלל');
    ok(await p.getByText('לא נמצאה התאמה').isVisible(), 'חיפוש: מצב ריק מוסבר');
    await search.press('Escape');
    ok(await search.inputValue() === '', 'Esc מאפס חיפוש');

    // כתבות
    await p.goto(BASE + '#/feature', { waitUntil: 'networkidle' });
    ok(await p.locator('.article-card').count() === 5, 'חמש כתבות באינדקס');
    for (const id of ['patterns', 'jacobs', 'machine', 'vitruvius', 'minard']) {
      await p.goto(BASE + '#/feature/' + id, { waitUntil: 'networkidle' });
      const okA = await p.locator('.ft-quote').count() === 1 && await p.locator('.ft-haiku').count() === 1 && await p.locator('.ft-link').count() >= 4;
      ok(okA, `כתבה ${id}: ציטוט, הייקו, חיבורים`);
    }

    // מבט כיתה
    await p.goto(BASE + '#/class?c=kita-test-0000', { waitUntil: 'networkidle' });
    await p.waitForSelector('table.heat');
    ok(await p.locator('table.heat tbody tr').count() === 3, 'מבט כיתה: 2 משתתפים ושורת סיכום');
    ok(await p.locator('table.heat thead th').count() === 24 + 4, 'מבט כיתה: 24 עמודות שיעור');
    ok((await p.locator('.tone-problem').innerText()).includes('07'), 'מבט כיתה: מזהה את השיעור שנתקעים בו (07)');
    ok((await p.locator('.class-kpis').innerText()).includes('1'), 'מבט כיתה: מי שלא עדכן שבוע');
    ok(!(await p.locator('main').innerText()).includes('רפלקציה על'), 'מבט כיתה: בלי רפלקציות');

    // מצגת לכל שיעור
    for (const n of [7, 19, 30]) {
      await p.goto(BASE + '#/lesson/' + n, { waitUntil: 'networkidle' });
      await p.getByRole('button', { name: 'צפה במצגת השיעור' }).click();
      const top = await p.locator('.deck-top').innerText();
      ok(/1\/1[01]/.test(top), `מצגת שיעור ${n}: ${top.replace(/\s+/g, ' ')}`);
      await p.keyboard.press('Escape');
    }

    // סנכרון: קוד חדש דוחף, קוד קיים מושך וממזג
    await p.goto(BASE + '#/sync', { waitUntil: 'networkidle' });
    await p.getByLabel('השם שלך').fill('נועה');
    await p.getByRole('button', { name: 'צור קוד וסנכרן' }).click();
    await p.waitForFunction(() => document.querySelector('main')?.innerText.includes('קוד הסנכרון שלך'));
    await p.waitForTimeout(400);
    ok(pushed.length >= 1 && pushed.at(-1).p_name === 'נועה' && pushed.at(-1).p_state.progress, 'סנכרון: נדחף לשרת עם ההתקדמות');
    ok(/^[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}$/.test(pushed.at(-1).p_key), 'סנכרון: קוד בפורמט קבוע');
    await p.getByLabel(/קוד כיתה/).fill('kita-test-0000');
    await p.getByLabel(/קוד כיתה/).blur();
    await p.waitForTimeout(3500);
    ok(pushed.at(-1).p_cohort === 'kita-test-0000', 'סנכרון: קוד כיתה נשלח לשרת');
    await p.getByRole('button', { name: 'נתק את המכשיר הזה' }).click();
    await p.getByLabel('קוד סנכרון קיים').fill('aaaaa-bbbbb-ccccc');
    await p.getByRole('button', { name: 'חבר ומזג' }).click();
    await p.waitForTimeout(600);
    const prog = await p.evaluate(() => JSON.parse(localStorage.getItem('hps:progress') || '{}'));
    ok(prog['13'] && prog['13'][0] === true && prog['7'], 'סנכרון: מיזוג משרת שומר גם את המקומי');

    // מצגת שיעור 01
    await p.goto(BASE + '#/lesson/1', { waitUntil: 'networkidle' });
    await p.getByRole('button', { name: 'צפה במצגת השיעור' }).click();
    ok(await p.locator('.deck').isVisible(), 'מצגת נפתחת');
    await p.keyboard.press('ArrowLeft');
    ok((await p.locator('.deck-top').innerText()).includes('2/14'), 'חץ שמאלה מקדם שקף');
    await p.keyboard.press('Escape');
    ok(!(await p.locator('.deck').isVisible().catch(() => false)), 'Esc סוגר את המצגת');

    // תיק עבודות: משתתף ותמונה
    await p.goto(BASE + '#/portfolio?l=8', { waitUntil: 'networkidle' });
    await p.getByLabel('שם משתתף חדש').fill('נועה');
    await p.getByRole('button', { name: 'הוסף' }).click();
    await p.locator('input[type=file]').setInputFiles(path.join(__dirname, '../public/icon-192.png'));
    await p.waitForSelector('.drop img');
    await p.getByLabel('תיאור העבודה').fill('ניתוח רחוב הרצל');
    await p.getByRole('button', { name: 'שמור בתיק' }).click();
    await p.waitForSelector('.work');
    ok(await p.locator('.work').count() === 1, 'עבודה נשמרה בגלריה');
    await p.reload({ waitUntil: 'networkidle' });
    await p.waitForSelector('.work');
    ok(await p.locator('.work').count() === 1, 'העבודה נשמרת אחרי רענון');

    // שפה קבועה
    await p.goto(BASE + '#/studio', { waitUntil: 'networkidle' });
    const radius = await p.evaluate(() => [...document.querySelectorAll('button, .press, .field')].every((x) => getComputedStyle(x).borderRadius === '0px'));
    ok(radius, 'כל הכפתורים והשדות מרובעים');
    ok(await p.locator('.num').count() > 5, 'מספרים מודגשים אוטומטית');

    const cdp = await ctx.newCDPSession(p);
    await p.goto(BASE, { waitUntil: 'networkidle' });
    const inst = await cdp.send('Page.getInstallabilityErrors');
    ok(inst.installabilityErrors.length === 0, 'התקנה: ' + (JSON.stringify(inst.installabilityErrors) || 'אין שגיאות'));

    for (const vp of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
      await p.setViewportSize(vp);
      for (const h of ['', '#/lessons', '#/lesson/19', '#/studio', '#/portfolio', '#/feature', '#/feature/vitruvius', '#/feature/jacobs', '#/feature/minard', '#/sync', '#/class?c=kita-test-0000']) {
        await p.goto(BASE + h, { waitUntil: 'networkidle' });
        const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        ok(over <= 0, `בלי גלילה אופקית ${vp.width} ${h || 'בית'} (${over})`);
      }
    }
    const rm = await b.newPage({ reducedMotion: 'reduce' });
    await rm.route('**/appofapp-gh.vercel.app/ai-menu.js', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: AIMENU }));
    await rm.goto(BASE, { waitUntil: 'networkidle' });
    const anim = await rm.evaluate(() => getComputedStyle(document.querySelector('.rise')).animationName);
    ok(anim === 'none', 'הפחתת תנועה מבטלת אנימציות');
    ok(errors.length === 0, 'אין שגיאות JavaScript ' + errors.join(' | '));
  } finally {
    await b.close();
    srv.kill();
  }
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASS');
  process.exit(fails.length ? 1 : 0);
})();
