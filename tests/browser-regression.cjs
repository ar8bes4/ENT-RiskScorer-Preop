// 架空入力のみを使う、係数・境界・入力検証の回帰確認。
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
 const browser = await chromium.launch({executablePath: process.env.CHROME_PATH, headless:true, chromiumSandbox:true});
 try {
 const page = await browser.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
 const score=async id=>Number((await page.locator(id).innerText()).match(/^[\d.]+/)[0]);
 assert.equal(await score('#res_mica'),0.57);
 // 原著Table 2の手術係数で独立に期待値を計算。
 const coefficients=[.71,.18,1.60,.86,.40,1.40,-.16,-.25,-1.61,1.01,1.39,.59,1.14,.76,.80,1.13,.54,.21,-1.09,-.26,0];
 const options=await page.locator('#mica_op option').evaluateAll(nodes=>nodes.map(n=>Number(n.value)));
 assert.deepEqual(options,coefficients);
 let checks=1;
 for(const asa of ['1','2','3','4','5']) for(const op of coefficients) {
 await page.locator('#asa').selectOption(asa);await page.locator('#mica_op').selectOption(String(op));
 const x=-5.25+.02*65+[-5.17,-3.29,-1.92,-.95,0][Number(asa)-1]+op;
 assert.equal(await score('#res_mica'),Number((100/(1+Math.exp(-x))).toFixed(2)));checks++;
 }
 await page.locator('#age').fill('70'); await page.locator('#asa').selectOption('3'); await page.locator('#mica_op').selectOption('1.4');
 assert.equal(await score('#res_mica'),1.25); // 表の丸め済み係数。原著症例の1.22%とは丸め差あり。
 for(const age of ['', '-1','0','15','121','65.5']) {
 await page.locator('#age').fill(age);assert.equal(await page.locator('#copy_btn').isDisabled(),true);assert.equal(await page.locator('#res_mica').innerText(),'—');assert.equal(await page.locator('#validation_error').isVisible(),true);checks++;
 }
 await page.locator('#age').fill('16');assert.equal(await page.locator('#copy_btn').isEnabled(),true);
 await page.locator('#age').fill('120');assert.equal(await page.locator('#copy_btn').isEnabled(),true);
 await page.locator('#age').fill('50');
 await page.getByText('呼吸器系 (Resp)',{exact:true}).click();
 for(const [v,points] of [['0',0],['16',16],['23',23]]){await page.locator('#op_duration').selectOption(v);assert.equal(await score('#res_ariscat'),points);checks++;}
 assert.deepEqual(await page.locator('#op_duration option').allTextContents(),['2時間以下','2時間超〜3時間以下','3時間超']);
 await page.getByText('頭頸部・全身 (H&N/CCI)',{exact:true}).click();
 for(const [v,points] of [['0',9],['9',18],['17',26]]){await page.locator('#hnsri_optime').selectOption(v);assert.equal(await score('#res_hnsri'),points);checks++;}
 assert.deepEqual(await page.locator('#hnsri_optime option').allTextContents(),['4時間未満','4時間以上〜8時間以下','8時間超']);
 await page.evaluate(()=>{document.querySelector('#asa').selectedIndex=-1;calcAll()});assert.equal(await page.locator('#copy_btn').isDisabled(),true);
 await page.locator('#asa').selectOption('3');await page.locator('#copy_btn').click();await page.waitForTimeout(100);assert.equal(await page.locator('#copy_btn').innerText(),'コピーしました！');
 await page.waitForTimeout(2100);await page.evaluate(()=>Object.defineProperty(navigator.clipboard,'writeText',{value:()=>Promise.reject(new Error('拒否'))}));await page.locator('#copy_btn').click();await page.waitForTimeout(100);assert.match(await page.locator('#validation_error').innerText(),/コピーできません/);
 for(const width of [1280,390]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);if(process.env.QA_DIR)await page.screenshot({path:path.join(process.env.QA_DIR,`ent-${width}.png`),fullPage:true});}
 assert.deepEqual(errors,[]);console.log(`PASS: ${checks} 数値・入力・時間区分チェック、コピー成功/拒否、未選択、PC/モバイル表示`);
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
