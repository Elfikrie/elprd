// QA nyata memakai browser lokal terpasang; tidak memerlukan unduhan browser.
import { chromium, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, acceptDownloads: true });
const page = await context.newPage(); const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  await page.goto('http://127.0.0.1:5178/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await expect(page.getByRole('heading', { name: /Ide di kepala/ })).toBeVisible();
  await page.screenshot({ path: 'artifacts/home-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Buat rancangan' }).click();
  await expect(page.getByRole('alert')).toContainText('minimal 20');
  await page.getByRole('button', { name: 'Aplikasi booking', exact: true }).click();
  await page.getByRole('button', { name: 'Atur kebutuhan' }).click();
  await page.getByLabel('Nama produk').fill('Studio Abu');
  await page.getByRole('button', { name: 'Buat rancangan' }).click();
  await expect(page.getByRole('heading', { name: 'Studio Abu', exact: true }).first()).toBeVisible();
  await expect(page.locator('.diagram-render svg')).toHaveCount(3, { timeout: 30000 });
  await page.screenshot({ path: 'artifacts/plan-desktop.png', fullPage: false });
  const downloaded = page.waitForEvent('download'); await page.getByRole('button', { name: 'Unduh .md' }).click();
  const download = await downloaded; await download.saveAs('artifacts/test-export.md');
  const exported = await readFile('artifacts/test-export.md', 'utf8'); if (!exported.includes('Studio Abu') || !exported.includes('```mermaid')) throw new Error('Ekspor tidak lengkap.');
  await page.getByRole('button', { name: 'Markdown', exact: true }).click(); await expect(page.locator('.raw-markdown')).toContainText('Studio Abu');
  await page.getByRole('link', { name: 'Riwayat', exact: true }).first().click();
  await expect(page.locator('.history-row')).toHaveCount(1);
  await page.reload(); await expect(page.locator('.history-row')).toHaveCount(1);
  await page.getByLabel('Cari rancangan').fill('tidak ada'); await expect(page.getByText('Rancangan tidak ditemukan.')).toBeVisible();
  await page.getByLabel('Cari rancangan').fill('');
  await page.getByRole('button', { name: 'Arsipkan Studio Abu' }).click(); await expect(page.locator('.history-row')).toHaveCount(0);
  await page.getByRole('button', { name: /Arsip 1/ }).click(); await expect(page.locator('.history-row')).toHaveCount(1);
  await page.getByRole('button', { name: 'Pulihkan Studio Abu' }).click();
  await page.getByRole('button', { name: /Semua plan 1/ }).click();
  await page.getByRole('button', { name: 'Hapus Studio Abu' }).click();
  await page.getByRole('button', { name: 'Batal', exact: true }).click(); await expect(page.locator('.history-row')).toHaveCount(1);
  await page.getByRole('button', { name: 'Hapus Studio Abu' }).click(); await page.getByRole('button', { name: 'Hapus rancangan', exact: true }).click(); await expect(page.locator('.history-row')).toHaveCount(0);
  await page.getByRole('link', { name: 'Template', exact: true }).click(); await expect(page.locator('.template-card')).toHaveCount(6);
  await page.getByRole('button', { name: 'Pendidikan', exact: true }).click(); await expect(page.locator('.template-card')).toHaveCount(1);
  await page.getByRole('link', { name: 'Gunakan template' }).click(); await expect(page.getByLabel('Apa yang ingin kamu bangun?')).toHaveValue(/Platform kursus/);
  await page.setViewportSize({ width: 375, height: 812 }); await page.goto('http://127.0.0.1:5178/#/?baru=1'); await expect(page.locator('.toast')).not.toHaveClass(/visible/, { timeout: 6000 }); await page.screenshot({ path: 'artifacts/home-mobile.png', fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth); if (overflow) throw new Error('Overflow pada mobile.');
  await page.getByRole('button', { name: 'Mode lokal' }).click(); await expect(page.getByRole('dialog')).toBeVisible(); await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Platform belajar', exact: true }).click(); await page.getByRole('button', { name: 'Buat rancangan' }).click();
  await expect(page.locator('.diagram-render svg')).toHaveCount(3, { timeout: 30000 });
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Overflow dokumen mobile.');
  await page.screenshot({ path: 'artifacts/plan-mobile.png', fullPage: false });
  if (errors.length) throw new Error('Browser errors: ' + errors.join('; '));
  await writeFile('artifacts/browser-result.json', JSON.stringify({ status: 'passed', desktop: '1440x1100', mobile: '375x812', diagrams: 3, download: download.suggestedFilename(), errors, flows: ['input validation', 'template fill', 'generate', 'Mermaid render', 'download', 'Markdown', 'reload persistence', 'search', 'archive', 'restore', 'delete cancel', 'delete confirm', 'template filter', 'mobile generation', 'dialog Escape'] }, null, 2));
  console.log('Browser QA passed: desktop, mobile, generation, diagrams, download, persistence, history, and dialogs.');
} finally { await browser.close(); }



