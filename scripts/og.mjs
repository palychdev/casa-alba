import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const font = (file) => pathToFileURL(path.join(root, "assets", "fonts", file)).href;
const imageBuffer = await fs.readFile(path.join(root, "assets", "img", "masseria.jpg"));
const image = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: "Fraunces";
    src: url("${font("fraunces-roman.woff2")}") format("woff2");
    font-weight: 300 600;
    font-style: normal;
  }
  @font-face {
    font-family: "Fraunces";
    src: url("${font("fraunces-italic.woff2")}") format("woff2");
    font-weight: 300 600;
    font-style: italic;
  }
  @font-face {
    font-family: "Instrument Sans";
    src: url("${font("instrument-roman.woff2")}") format("woff2");
    font-weight: 400 600;
    font-style: normal;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 1200px; height: 630px; }
  body {
    background: #fff;
    color: #171711;
    font-family: "Instrument Sans", Arial, sans-serif;
    display: grid;
    grid-template-columns: 1fr 480px;
  }
  .copy {
    padding: 54px 56px 48px 64px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .eyebrow {
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #6c6b5f;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #e2ded2;
    padding-bottom: 14px;
  }
  h1 {
    font-family: "Fraunces", Georgia, serif;
    font-weight: 350;
    font-size: 96px;
    line-height: 0.9;
    letter-spacing: -0.035em;
    margin: 0;
  }
  h1 em { font-style: italic; }
  .tagline {
    font-family: "Fraunces", Georgia, serif;
    font-weight: 300;
    font-size: 29px;
    line-height: 1.15;
    letter-spacing: -0.015em;
    max-width: 13ch;
    margin: 22px 0 0;
  }
  .foot {
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #6c6b5f;
    border-top: 1px solid #e2ded2;
    padding-top: 14px;
  }
  .media { height: 630px; overflow: hidden; }
  .media img { width: 100%; height: 100%; object-fit: cover; filter: saturate(.9); }
</style>
</head>
<body>
  <div class="copy">
    <div class="eyebrow"><span>Ostuni, Puglia</span><span>40.729°N · 17.578°E</span></div>
    <div>
      <h1>Casa <em>Alba</em></h1>
      <p class="tagline">A white house in the olive groves.</p>
    </div>
    <div class="foot">Nine rooms · One long table · Six kilometres from the sea</div>
  </div>
  <div class="media"><img src="${image}" alt=""></div>
</body>
</html>`;

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "assets/og.jpg", type: "jpeg", quality: 92 });
await browser.close();
console.log("assets/og.jpg written");
