import fs from "node:fs";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const {chromium}=require("playwright");
const executablePath="C:\\Users\\ican1\\AppData\\Local\\Packages\\OpenAI.Codex_2p2nqsd0c76g0\\LocalCache\\Local\\ms-playwright\\chromium_headless_shell-1234\\chrome-headless-shell-win64\\chrome-headless-shell.exe";
const browser=await chromium.launch({headless:true,executablePath});
const page=await browser.newPage({viewport:{width:1280,height:900}});
const errors=[];
page.on("console",m=>{if(m.type()==="error")errors.push(m.text())});
page.on("pageerror",e=>errors.push(e.message));
await page.goto(new URL("./index.html",import.meta.url).href,{waitUntil:"load"});
await page.waitForSelector('.card[data-id="3"] canvas');
for(const id of [15]){
  await page.evaluate(id=>window.__MOTION_QA__.setTime(id,id===22?2.9:1.9),id);
  await page.waitForTimeout(100);
  await page.locator(`.card[data-id="${id}"] .visual`).screenshot({path:`visual-v4-${id}.png`});
}
const result={version:await page.evaluate(()=>window.__MOTION_QA__.version),cards:await page.locator(".card").count(),errors};
fs.writeFileSync("visual-qa-v4.json",JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
await browser.close();
