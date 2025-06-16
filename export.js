const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const path = require("path");
const config = require("./config.json");

const OUTPUT_DIR = path.join(__dirname, "notebooks");
const cookie = process.env.OBSERVABLE_COOKIE;

(async () => {
  await fs.ensureDir(OUTPUT_DIR);
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();

await page.setCookie({
  name: 'ab.storage.sessionId.751c046f-5dc2-4baf-b9b5-47d4099ce470',
  value: process.env.OBSERVABLE_COOKIE,
  domain: '.observablehq.com',
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'Lax',
});


  for (const nb of config.notebooks) {
    console.log(`⏬ Downloading ${nb.url}...`);
    await page.goto(nb.url + "?embed=1", { waitUntil: "networkidle2" });
    const html = await page.content();
    const filePath = path.join(OUTPUT_DIR, `${nb.name}.html`);
    await fs.writeFile(filePath, html);
    console.log(`✅ Saved to ${filePath}`);
  }

  await browser.close();
})();
