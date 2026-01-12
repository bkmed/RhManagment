const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const localesDir = path.join(__dirname, '../src/i18n/locales');
const languages = ['en', 'fr', 'ar', 'de', 'es', 'zh', 'hi'];

// Recursively get all keys from a nested object
function getAllKeys(obj, prefix = '') {
  let keys = [];

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (
      typeof obj[key] === 'object' &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

// Load all translation files
function loadTranslations() {
  const translations = {};

  for (const lang of languages) {
    const filePath = path.join(localesDir, `${lang}.json`);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      translations[lang] = JSON.parse(content);
    } catch (error) {
      console.error(
        `${colors.red}Error loading ${lang}.json: ${error.message}${colors.reset}`,
      );
      process.exit(1);
    }
  }

  return translations;
}

// Verify translations
function verifyTranslations() {
  console.log(
    `${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`,
  );
  console.log(
    `${colors.cyan}║  Translation Keys Verification Script  ║${colors.reset}`,
  );
  console.log(
    `${colors.cyan}╚════════════════════════════════════════╝${colors.reset}\n`,
  );

  const translations = loadTranslations();
  const allKeys = {};

  // Get all keys for each language
  for (const lang of languages) {
    allKeys[lang] = new Set(getAllKeys(translations[lang]));
    console.log(
      `${colors.blue}${lang.toUpperCase()}:${colors.reset} ${
        allKeys[lang].size
      } keys`,
    );
  }

  console.log('');

  // Use English as the reference
  const referenceKeys = allKeys['en'];
  const missingKeys = {};
  const extraKeys = {};

  for (const lang of languages) {
    if (lang === 'en') continue;

    missingKeys[lang] = [];
    extraKeys[lang] = [];

    // Find missing keys
    for (const key of referenceKeys) {
      if (!allKeys[lang].has(key)) {
        missingKeys[lang].push(key);
      }
    }

    // Find extra keys
    for (const key of allKeys[lang]) {
      if (!referenceKeys.has(key)) {
        extraKeys[lang].push(key);
      }
    }
  }

  // Report results
  let hasIssues = false;

  for (const lang of languages) {
    if (lang === 'en') continue;

    if (missingKeys[lang].length > 0 || extraKeys[lang].length > 0) {
      hasIssues = true;
      console.log(
        `${colors.yellow}━━━ ${lang.toUpperCase()} Issues ━━━${colors.reset}`,
      );

      if (missingKeys[lang].length > 0) {
        console.log(
          `${colors.red}Missing ${missingKeys[lang].length} keys:${colors.reset}`,
        );
        missingKeys[lang].forEach(key => console.log(`  - ${key}`));
      }

      if (extraKeys[lang].length > 0) {
        console.log(
          `${colors.yellow}Extra ${extraKeys[lang].length} keys (not in English):${colors.reset}`,
        );
        extraKeys[lang].forEach(key => console.log(`  + ${key}`));
      }

      console.log('');
    }
  }

  if (!hasIssues) {
    console.log(
      `${colors.green}✓ All translation files are in sync!${colors.reset}`,
    );
    console.log(
      `${colors.green}✓ All ${referenceKeys.size} keys are present in all languages.${colors.reset}\n`,
    );
    return 0;
  } else {
    console.log(
      `${colors.red}✗ Translation files are out of sync!${colors.reset}`,
    );
    console.log(
      `${colors.yellow}⚠ Please fix the missing/extra keys above.${colors.reset}\n`,
    );
    return 1;
  }
}

// Run verification
const exitCode = verifyTranslations();
process.exit(exitCode);
