// HTML 파일을 A4 PDF로: node build/html2pdf.js <in.html> <out.pdf>
const path = require("path");
const { chromium } = require("playwright");

async function main() {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw new Error("usage: html2pdf.js <in.html> <out.pdf>");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file://" + path.resolve(input), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const title = await page.title();
  await page.pdf({
    path: output,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: `<div style="width:100%;font-size:7.5px;color:#7a8c83;padding:0 15mm;display:flex;justify-content:space-between;font-family:sans-serif"><span>${title}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
  });
  await browser.close();
  console.log("wrote", output);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
