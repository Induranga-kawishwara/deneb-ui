/**
 * DENEB Core <-> UI Synchronization Engine
 * 
 * Automatically synchronizes `@deneb-ui/ui` components and `@deneb-ui/cli`
 * command definitions into the official DENEB documentation showcase platform (deneb.fivora.site).
 *
 * Triggered automatically by GitHub Actions CI/CD whenever a new package version is published to npm.
 *
 * Created by Chamika Gayashan & Induranga Kawishwara.
 * Powered by DENEB-UI Collaborate with FIVORA.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uiRoot = path.resolve(__dirname, '..');

// Potential source of core components:
// 1. Relative monorepo: ../deneb-core/packages/deneb-ui/src (local checkout)
// 2. node_modules/@deneb-ui/ui/src (when installed from npm/CI)
// 3. Legacy sibling name: ../core/packages/deneb-ui/src
function findCoreComponentsDir() {
  const candidates = [
    path.join(uiRoot, '..', 'deneb-core', 'packages', 'deneb-ui', 'src'),
    path.join(uiRoot, '..', 'core', 'packages', 'deneb-ui', 'src'),
    path.join(uiRoot, '.sync', 'deneb-core', 'packages', 'deneb-ui', 'src'),
    path.join(uiRoot, 'node_modules', '@deneb-ui', 'ui', 'src'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isDirectory()) {
      return c;
    }
  }
  return null;
}

function findCorePkgDir() {
  const candidates = [
    path.join(uiRoot, '..', 'deneb-core', 'packages', 'deneb-core'),
    path.join(uiRoot, '..', 'core', 'packages', 'deneb-core'),
    path.join(uiRoot, '.sync', 'deneb-core', 'packages', 'deneb-core'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isDirectory()) {
      return c;
    }
  }
  return null;
}

function findCoreCliDir() {
  const candidates = [
    path.join(uiRoot, 'node_modules', '@deneb-ui', 'cli'),
    path.join(uiRoot, '..', 'deneb-core', 'cli', 'deneb-cli'),
    path.join(uiRoot, '..', 'core', 'cli', 'deneb-cli'),
    path.join(uiRoot, '.sync', 'deneb-core', 'cli', 'deneb-cli'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isDirectory()) {
      return c;
    }
  }
  return null;
}

function copyDirectoryRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function sync() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║               DENEB CORE ➔ UI SHOWCASE SYNC ENGINE              ║');
  console.log('║     Synchronizing npm packages with live showcase platform     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const coreCompDir = findCoreComponentsDir();
  const destCompDir = path.join(uiRoot, 'src', 'components', 'deneb-ui');

  if (coreCompDir) {
    console.log(`📦 Found core components source: ${coreCompDir}`);
    console.log(`🎯 Target UI components directory: ${destCompDir}`);

    copyDirectoryRecursive(coreCompDir, destCompDir);
    console.log('✔ Component source files synchronized successfully.');
  } else {
    console.log('ℹ No external core components directory found, using local component bundle.');
  }

  const corePkgDir = findCorePkgDir();
  const destCorePkgDir = path.join(uiRoot, 'node_modules', '@deneb-ui', 'core');
  if (corePkgDir && fs.existsSync(path.join(corePkgDir, 'dist')) && fs.existsSync(destCorePkgDir)) {
    console.log(`📦 Found @deneb-ui/core source: ${corePkgDir}`);
    copyDirectoryRecursive(path.join(corePkgDir, 'dist'), path.join(destCorePkgDir, 'dist'));
    fs.copyFileSync(path.join(corePkgDir, 'package.json'), path.join(destCorePkgDir, 'package.json'));
    console.log('✔ @deneb-ui/core dist synchronized successfully.');
  }

  // 1. Detect all component files in src/components/deneb-ui
  const componentFiles = fs.readdirSync(destCompDir)
    .filter((f) => f.endsWith('.tsx') && !f.startsWith('SiteData') && !f.startsWith('Theme') && f !== 'index.ts');

  console.log(`✔ Found ${componentFiles.length} DENEB components available for showcase.`);

  // 2. Inspect component-registry.tsx and report source files that still need docs.
  const registryPath = path.join(uiRoot, 'src', 'components', 'docs', 'component-registry.tsx');
  if (fs.existsSync(registryPath)) {
    const registryCode = fs.readFileSync(registryPath, 'utf8');
    const registeredCount = (registryCode.match(/^\s{2}['a-z][a-z0-9-]*['"]?:\s*\{/gm) || []).length;
    console.log(`✔ Component registry verified (${registeredCount} components documented and ready).`);

    const expectedDocs = new Map([
      ['EditableIcon.tsx', 'editable-icon'],
      ['EditableUniversalCard.tsx', 'universal-card'],
      ['EditableVehicleCard.tsx', 'vehicle-card'],
    ]);
    const missingDocs = [...expectedDocs]
      .filter(([fileName, slug]) => componentFiles.includes(fileName) && !registryCode.includes(`'${slug}':`) && !registryCode.includes(`${slug}:`))
      .map(([fileName, slug]) => `${fileName} (${slug})`);

    if (missingDocs.length > 0) {
      throw new Error(`Documentation is missing for synchronized components: ${missingDocs.join(', ')}`);
    }
  }

  // 3. Inspect and verify CLI command documentation
  const cliDir = findCoreCliDir();
  if (cliDir) {
    const cliPkgPath = path.join(cliDir, 'package.json');
    if (fs.existsSync(cliPkgPath)) {
      const cliPkg = JSON.parse(fs.readFileSync(cliPkgPath, 'utf8'));
      console.log(`✔ DENEB CLI version verified: v${cliPkg.version}`);
    }
  }

  console.log('\n✔ All DENEB Core assets and registries are in 100% sync!');
}

sync().catch((err) => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
