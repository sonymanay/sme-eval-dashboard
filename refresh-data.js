#!/usr/bin/env node
/**
 * refresh-data.js — Owner script to embed Excel eval data into the dashboard HTML.
 *
 * Usage:
 *   node refresh-data.js <path-to-excel-file>
 *
 * Example:
 *   node refresh-data.js "C:\Users\smanay\Downloads\AAQ_HillClimb_EvalResults_032726 (1).xlsx"
 *
 * After running, commit and push:
 *   git add index.html && git commit -m "Refresh eval data" && git push
 *
 * The dashboard at https://sonymanay.github.io/sme-eval-dashboard/ will update in ~60s.
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const excelPath = process.argv[2];
if (!excelPath) {
  console.error('Usage: node refresh-data.js <path-to-excel-file>');
  console.error('Example: node refresh-data.js "C:\\Users\\smanay\\Downloads\\EvalResults.xlsx"');
  process.exit(1);
}

if (!fs.existsSync(excelPath)) {
  console.error(`File not found: ${excelPath}`);
  process.exit(1);
}

const htmlPath = path.join(__dirname, 'index.html');
if (!fs.existsSync(htmlPath)) {
  console.error(`index.html not found in ${__dirname}`);
  process.exit(1);
}

console.log(`Reading Excel: ${excelPath}`);
const wb = XLSX.readFile(excelPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { defval: '' });

console.log(`  Rows: ${data.length}`);
console.log(`  Columns: ${Object.keys(data[0] || {}).length}`);

// Get SBU distribution
const sbuCounts = {};
data.forEach(row => {
  const sbuKey = Object.keys(row).find(k => k.toLowerCase().includes('sbu'));
  const sbu = sbuKey ? String(row[sbuKey]).trim() : 'Unknown';
  sbuCounts[sbu] = (sbuCounts[sbu] || 0) + 1;
});
console.log(`  SBUs: ${Object.entries(sbuCounts).map(([k,v]) => `${k}(${v})`).join(', ')}`);

const jsonStr = JSON.stringify(data);
console.log(`  JSON size: ${(jsonStr.length / 1024).toFixed(1)} KB`);

console.log(`Embedding data into index.html...`);
let html = fs.readFileSync(htmlPath, 'utf-8');

// Replace the embedded data — look for the script tag pattern
const dataPattern = /const EMBEDDED_DATA = .*?;/s;
if (dataPattern.test(html)) {
  html = html.replace(dataPattern, `const EMBEDDED_DATA = ${jsonStr};`);
  fs.writeFileSync(htmlPath, html, 'utf-8');
  const sizeMB = (Buffer.byteLength(html) / (1024 * 1024)).toFixed(2);
  console.log(`\n✅ Done! index.html updated (${sizeMB} MB)`);
  console.log(`\nSBU-specific links for SMEs:`);
  Object.keys(sbuCounts).sort().forEach(sbu => {
    const encoded = encodeURIComponent(sbu);
    console.log(`  ${sbu}: https://sonymanay.github.io/sme-eval-dashboard/?sbu=${encoded}`);
  });
  console.log(`\nNext steps:`);
  console.log(`  git add index.html`);
  console.log(`  git commit -m "Refresh eval data - ${data.length} rows"`);
  console.log(`  git push`);
} else {
  console.error('ERROR: Could not find EMBEDDED_DATA placeholder in index.html');
  console.error('Make sure index.html contains: const EMBEDDED_DATA = ...;');
  process.exit(1);
}
