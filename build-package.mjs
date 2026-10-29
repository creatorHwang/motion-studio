import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const css=fs.readFileSync(path.join(root,"styles.css"),"utf8");
const composerCss=fs.readFileSync(path.join(root,"composer.css"),"utf8");
const js=fs.readFileSync(path.join(root,"app.js"),"utf8");
const standalone=html.replace('<link rel="stylesheet" href="styles.css">',`<style>${css}</style>`).replace('<link rel="stylesheet" href="composer.css">',`<style>${composerCss}</style>`).replace('<script src="app.js"></script>',`<script>${js}</script>`);
fs.writeFileSync(path.join(root,"THEHANSU_Motion_Preview_VisualUpgrade_v4.2.html"),standalone);
