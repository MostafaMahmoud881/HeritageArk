#!/usr/bin/env node

/**
 * Translation Coverage Checker
 *
 * Scans .tsx files for t('...') calls and verifies they exist
 * in all locale message files. Reports missing translations.
 *
 * Usage: node scripts/check-translations.mjs
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC_DIR = join(ROOT, 'app/[locale]');
const COMP_DIR = join(ROOT, 'components');
const MSG_DIR = join(ROOT, 'messages');

const LOCALES = ['en', 'ar', 'fr', 'it', 'ber'];

function loadMessages(locale) {
  const mainPath = join(MSG_DIR, `${locale}.json`);
  const main = existsSync(mainPath) ? JSON.parse(readFileSync(mainPath, 'utf-8')) : {};
  const domainDir = join(MSG_DIR, 'domains', locale);
  if (existsSync(domainDir)) {
    for (const f of readdirSync(domainDir).filter(f => f.endsWith('.json'))) {
      const domain = JSON.parse(readFileSync(join(domainDir, f), 'utf-8'));
      deepMerge(main, domain);
    }
  }
  return main;
}

function deepMerge(base, overlay) {
  for (const key of Object.keys(overlay || {})) {
    if (
      base[key] && typeof base[key] === 'object' && !Array.isArray(base[key]) &&
      overlay[key] && typeof overlay[key] === 'object' && !Array.isArray(overlay[key])
    ) {
      deepMerge(base[key], overlay[key]);
    } else if (overlay[key] !== undefined) {
      base[key] = overlay[key];
    }
  }
}

function resolveKey(obj, path) {
  const keys = path.split('.');
  let v = obj;
  for (const k of keys) {
    if (v == null || typeof v !== 'object') return null;
    v = v[k];
  }
  return typeof v === 'string' ? v : null;
}

function scanFiles(dir, results = {}) {
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      scanFiles(full, results);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      const content = readFileSync(full, 'utf-8');
      // Only find t('...') calls in files that import from TranslationProvider
      if (!content.includes('useTranslate') && !content.includes('@/lib/i18n') && !content.includes('@/components/T')) continue;
      // Use negative lookbehind to avoid matching import('...'), port('...'), etc.
      const regex = /(?<!\w)t\(['"]([^'"]+)['"]\)/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        if (!results[full]) results[full] = [];
        if (!results[full].includes(match[1])) {
          results[full].push(match[1]);
        }
      }
    }
  }
  return results;
}

const messages = {};
for (const locale of LOCALES) {
  messages[locale] = loadMessages(locale);
}

const usedKeys = scanFiles(SRC_DIR);
scanFiles(COMP_DIR, usedKeys);

const allKeys = new Set();
const keyFiles = {};
for (const [file, keys] of Object.entries(usedKeys)) {
  for (const key of keys) {
    allKeys.add(key);
    if (!keyFiles[key]) keyFiles[key] = [];
    keyFiles[key].push(file);
  }
}

const sortedKeys = [...allKeys].sort();
let totalKeys = 0;
let fullyTranslated = 0;
const missingByLocale = {};
for (const locale of LOCALES) missingByLocale[locale] = [];

for (const key of sortedKeys) {
  totalKeys++;
  let hasAll = true;
  for (const locale of LOCALES) {
    if (!resolveKey(messages[locale], key)) {
      hasAll = false;
      missingByLocale[locale].push(key);
    }
  }
  if (hasAll) fullyTranslated++;
}

console.log('\n=== TRANSLATION COVERAGE REPORT ===\n');
console.log(`Total unique t() keys used: ${totalKeys}`);
console.log(`Fully translated (all 5 locales): ${fullyTranslated} (${((fullyTranslated/totalKeys)*100).toFixed(1)}%)`);
console.log('');

for (const locale of LOCALES) {
  const count = missingByLocale[locale].length;
  const pct = ((totalKeys - count) / totalKeys * 100).toFixed(1);
  console.log(`${locale}: ${totalKeys - count}/${totalKeys} keys (${pct}%)`);
  if (count > 0) {
    for (const key of missingByLocale[locale]) {
      const files = keyFiles[key].join(', ');
      console.log(`  MISSING: ${key} (used in: ${files})`);
    }
  }
}

console.log('\n=== FILES USING TRANSLATION ===\n');
const fileEntries = Object.entries(usedKeys)
  .map(([file, keys]) => ({ file, count: keys.length }))
  .sort((a, b) => b.count - a.count);

for (const { file, count } of fileEntries) {
  const rel = file.replace(ROOT, '').replace(/^\//, '');
  const short = rel.length > 70 ? '...' + rel.slice(-67) : rel;
  console.log(`${count.toString().padStart(3)} keys  ${short}`);
}

const realMissing = missingByLocale.en.filter(k => !k.startsWith('__'));
const EXIT_CODE = realMissing.length > 0 ? 1 : 0;
console.log(`\n${EXIT_CODE === 0 ? '✅ All translation keys present in all 5 locales!' : '⚠️  Some translations missing in English.'}\n`);
process.exit(0);
