const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const path = require("path");
const config = require("./config.json");

const OUTPUT_DIR = path.join(__dirname, "notebooks");

(async () => {
  await fs.ensureDir(OUTPUT_DIR);
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();

  for (const nb of config.notebooks) {
    console.log(`Exporting ${nb.url}...`);
    await page.goto(nb.url + "?embed=1", { waitUntil: "networkidle2" });

    // Dohvati samo div sa notebookom
    const notebookHTML = await page.evaluate(() => {
      const el = document.querySelector("observablehq-notebook");
      return el ? el.outerHTML : document.body.innerHTML;
    });

    // Kreiraj standalone HTML s Observable Runtime CDN-om
    const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${nb.name}</title>
  <script src="https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.min.js"></script>
</head>
<body>
  ${notebookHTML}
</body>
</html>`;

    const filePath = path.join(OUTPUT_DIR, `${nb.name}.html`);
    await fs.writeFile(filePath, fullHTML);
    console.log(`Saved ${filePath}`);
  }

  await browser.close();
})();
