#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function run(cmd) {
  return execSync(cmd, { encoding: "utf-8" }).trim();
}

function runSafe(cmd) {
  try {
    return execSync(cmd, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch {
    return null;
  }
}

function normalize(str) {
  return str
    .replace(/@orderly\.network\//g, "@veltodefi/") // Treat as equivalent
    .replace(/\s+/g, ""); // Strip whitespace
}

/**
 * Deep merge two objects, with second object taking priority
 */
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * Check if package.json only differs in name/version fields
 * Uses TWO checks:
 * 1. Compare staged versions (ours/theirs) after removing name/version
 * 2. Check if working copy conflicts only contain name/version lines
 */
function packageJsonOnlyNameVersionDiff(file, ours, theirs) {
  // Method 1: Check staged versions
  try {
    const oursPkg = JSON.parse(ours);
    const theirsPkg = JSON.parse(theirs);

    // Create copies without name/version
    const oursWithout = { ...oursPkg };
    const theirsWithout = { ...theirsPkg };
    delete oursWithout.name;
    delete oursWithout.version;
    delete theirsWithout.name;
    delete theirsWithout.version;

    // Compare the rest (normalized)
    if (
      normalize(JSON.stringify(oursWithout)) ===
      normalize(JSON.stringify(theirsWithout))
    ) {
      return true;
    }
  } catch {
    // Fall through to method 2
  }

  // Method 2: Check actual working copy conflict markers
  // This catches cases where git auto-merged most of the file
  // and only name/version have actual conflict markers
  try {
    const workingCopy = fs.readFileSync(file, "utf-8");
    const conflictPattern =
      /^<<<<<<<[^\n]*\n([\s\S]*?)^=======\n([\s\S]*?)^>>>>>>>[^\n]*/gm;

    let allConflictsAreNameVersion = true;
    let hasConflicts = false;

    workingCopy.replace(conflictPattern, (match, oursBlock, theirsBlock) => {
      hasConflicts = true;
      // Check if conflict only contains "name" and/or "version" lines
      const nameVersionPattern = /^\s*"(name|version)"\s*:/;
      const oursLines = oursBlock
        .trim()
        .split("\n")
        .filter((l) => l.trim());
      const theirsLines = theirsBlock
        .trim()
        .split("\n")
        .filter((l) => l.trim());

      for (const line of [...oursLines, ...theirsLines]) {
        if (!nameVersionPattern.test(line)) {
          allConflictsAreNameVersion = false;
        }
      }
      return match;
    });

    return hasConflicts && allConflictsAreNameVersion;
  } catch {
    return false;
  }
}

// Get list of conflicted files
const conflictedFiles = run("git diff --name-only --diff-filter=U")
  .split("\n")
  .filter(Boolean);

console.log(`Found ${conflictedFiles.length} conflicted files\n`);

const whitespaceOnlyConflicts = [];
const versionOnlyConflicts = [];

for (const file of conflictedFiles) {
  // :2 is "ours", :3 is "theirs"
  const ours = runSafe(`git show ":2:${file}"`);
  const theirs = runSafe(`git show ":3:${file}"`);

  // Skip files that don't have both versions (e.g., delete conflicts)
  if (ours === null || theirs === null) {
    continue;
  }

  // Always accept incoming for version.ts files (find-and-replace will fix package names)
  if (file.endsWith("version.ts")) {
    versionOnlyConflicts.push(file);
    continue;
  }

  // Check for whitespace-only differences (with package name normalization)
  if (normalize(ours) === normalize(theirs)) {
    whitespaceOnlyConflicts.push(file);
    continue;
  }

  // Check for package.json files with only name/version changes
  if (
    file.endsWith("package.json") &&
    packageJsonOnlyNameVersionDiff(file, ours, theirs)
  ) {
    versionOnlyConflicts.push(file);
    continue;
  }
}

const filesToResolve = [...whitespaceOnlyConflicts, ...versionOnlyConflicts];

console.log(
  `Found ${whitespaceOnlyConflicts.length} files with whitespace-only differences`,
);
console.log(
  `Found ${versionOnlyConflicts.length} files with only name/version changes\n`,
);

if (filesToResolve.length === 0) {
  console.log("No auto-resolvable whitespace/version conflicts found.");
} else {
  if (whitespaceOnlyConflicts.length > 0) {
    console.log("Whitespace-only:");
    for (const file of whitespaceOnlyConflicts) {
      console.log(`  ${file}`);
    }
  }

  if (versionOnlyConflicts.length > 0) {
    console.log("\nName/version-only:");
    for (const file of versionOnlyConflicts) {
      console.log(`  ${file}`);
    }
  }

  console.log("\nAccepting incoming changes for these files...\n");

  for (const file of filesToResolve) {
    try {
      execSync(`git checkout --theirs "${file}"`, { stdio: "pipe" });
      execSync(`git add "${file}"`, { stdio: "pipe" });
      console.log(`  ✓ ${file}`);
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
    }
  }

  console.log("\nConflict resolution done!");
}

// Step 2: Merge locale JSON files (ours + theirs, theirs wins on duplicates)
console.log("\n" + "=".repeat(60));
console.log("Merging locale JSON files...\n");

// Get current conflicted files for locale merging
const localeConflicts = run("git diff --name-only --diff-filter=U")
  .split("\n")
  .filter(Boolean)
  .filter((f) => f.includes("/locales/") && f.endsWith(".json"));

console.log(`Found ${localeConflicts.length} conflicted locale JSON files\n`);

let localeMergeCount = 0;
for (const file of localeConflicts) {
  const ours = runSafe(`git show ":2:${file}"`);
  const theirs = runSafe(`git show ":3:${file}"`);

  if (ours === null || theirs === null) {
    console.error(`  ✗ ${file}: missing ours or theirs version`);
    continue;
  }

  try {
    const oursJson = JSON.parse(ours);
    const theirsJson = JSON.parse(theirs);

    // Merge: start with ours, overlay theirs (theirs wins on conflicts)
    const merged = deepMerge(oursJson, theirsJson);

    // Write merged result
    fs.writeFileSync(file, JSON.stringify(merged, null, 2) + "\n");
    execSync(`git add "${file}"`, { stdio: "pipe" });
    console.log(`  ✓ ${file}`);
    localeMergeCount++;
  } catch (err) {
    console.error(`  ✗ ${file}: ${err.message}`);
  }
}

console.log(`\nMerged ${localeMergeCount} locale files.`);

// Step 3: Accept deletions (files deleted in incoming branch)
console.log("\n" + "=".repeat(60));
console.log("Handling files deleted in incoming branch...\n");

const deletedByThem = run("git diff --name-only --diff-filter=U")
  .split("\n")
  .filter(Boolean)
  .filter((file) => {
    // Check if file was deleted by them (theirs doesn't exist)
    const theirs = runSafe(`git show ":3:${file}"`);
    return theirs === null;
  });

console.log(`Found ${deletedByThem.length} files deleted in incoming branch\n`);

let deletedCount = 0;
for (const file of deletedByThem) {
  try {
    execSync(`git rm "${file}"`, { stdio: "pipe" });
    console.log(`  ✓ ${file}`);
    deletedCount++;
  } catch (err) {
    console.error(`  ✗ ${file}: ${err.message}`);
  }
}

console.log(`\nDeleted ${deletedCount} files.`);

// Step 4: Accept incoming changes for CHANGELOG files
console.log("\n" + "=".repeat(60));
console.log("Accepting incoming changes for CHANGELOG files...\n");

const changelogConflicts = run("git diff --name-only --diff-filter=U")
  .split("\n")
  .filter(Boolean)
  .filter((f) => f.toUpperCase().includes("CHANGELOG"));

console.log(`Found ${changelogConflicts.length} conflicted CHANGELOG files\n`);

let changelogCount = 0;
for (const file of changelogConflicts) {
  try {
    execSync(`git checkout --theirs "${file}"`, { stdio: "pipe" });
    execSync(`git add "${file}"`, { stdio: "pipe" });
    console.log(`  ✓ ${file}`);
    changelogCount++;
  } catch (err) {
    console.error(`  ✗ ${file}: ${err.message}`);
  }
}

console.log(`\nResolved ${changelogCount} CHANGELOG files.`);

// Step 5: Resolve import-only conflicts (accept incoming)
console.log("\n" + "=".repeat(60));
console.log("Resolving import-only conflicts...\n");

/**
 * Check if all conflicts in a file are within the import section
 */
function isImportOnlyConflict(fileContent) {
  const lines = fileContent.split("\n");

  // Find conflict line numbers
  const conflictLines = [];
  let inConflict = false;
  lines.forEach((line, i) => {
    if (line.startsWith("<<<<<<<")) inConflict = true;
    if (inConflict) conflictLines.push(i);
    if (line.startsWith(">>>>>>>")) inConflict = false;
  });

  if (conflictLines.length === 0) return false;

  // Find where imports end (first non-import code line)
  const codeStartPattern =
    /^(export\s+)?(const|let|var|function|class|interface|type|enum|describe|it|test)\s/;

  let importSectionEnd = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Skip empty, comments, imports, conflict markers, "use client"/"use server"
    if (
      !line ||
      line.startsWith("//") ||
      line.startsWith("/*") ||
      line.startsWith("*") ||
      line.startsWith("import ") ||
      line.startsWith("import{") ||
      line.startsWith("<<<<<<<") ||
      line.startsWith("=======") ||
      line.startsWith(">>>>>>>") ||
      line.startsWith('"use ') ||
      line.startsWith("'use ")
    ) {
      continue;
    }

    if (codeStartPattern.test(line)) {
      importSectionEnd = i;
      break;
    }
  }

  // Check if all conflicts are within import section
  const maxConflictLine = Math.max(...conflictLines);
  return maxConflictLine < importSectionEnd;
}

const jsExtensions = [".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs"];
const importOnlyConflicts = run("git diff --name-only --diff-filter=U")
  .split("\n")
  .filter(Boolean)
  .filter((file) => jsExtensions.some((ext) => file.endsWith(ext)))
  .filter((file) => {
    // Read the conflicted working copy
    try {
      const content = fs.readFileSync(file, "utf-8");
      return isImportOnlyConflict(content);
    } catch {
      return false;
    }
  });

console.log(
  `Found ${importOnlyConflicts.length} files with import-only conflicts\n`,
);

let importOnlyCount = 0;
for (const file of importOnlyConflicts) {
  try {
    execSync(`git checkout --theirs "${file}"`, { stdio: "pipe" });
    execSync(`git add "${file}"`, { stdio: "pipe" });
    console.log(`  ✓ ${file}`);
    importOnlyCount++;
  } catch (err) {
    console.error(`  ✗ ${file}: ${err.message}`);
  }
}

console.log(`\nResolved ${importOnlyCount} import-only conflicts.`);

// Step 6: Resolve trivial conflict hunks individually
console.log("\n" + "=".repeat(60));
console.log("Resolving trivial conflict hunks...\n");

/**
 * Strip comments from code for comparison
 */
function stripComments(str) {
  return str
    .replace(/\/\/[^\n]*/g, "") // Single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, ""); // Multi-line comments
}

/**
 * Normalize content for comparison (package names, whitespace, comments)
 */
function normalizeForHunkComparison(str) {
  return stripComments(str)
    .replace(/@orderly\.network\//g, "@veltodefi/")
    .replace(/\s+/g, "");
}

/**
 * Check if a conflict hunk is trivial (can be auto-resolved)
 */
function isTrivialHunk(ours, theirs) {
  return (
    normalizeForHunkComparison(ours) === normalizeForHunkComparison(theirs)
  );
}

/**
 * Resolve trivial conflict hunks in file content, return updated content
 */
function resolveTrivialHunks(fileContent) {
  // Match conflict blocks: <<<<<<< ... ======= ... >>>>>>>
  const conflictPattern =
    /^<<<<<<<[^\n]*\n([\s\S]*?)^=======\n([\s\S]*?)^>>>>>>>[^\n]*/gm;

  let resolvedCount = 0;
  const result = fileContent.replace(conflictPattern, (match, ours, theirs) => {
    if (isTrivialHunk(ours, theirs)) {
      resolvedCount++;
      // Accept theirs, remove trailing newline if theirs doesn't end with one
      return theirs.replace(/\n$/, "");
    }
    // Keep conflict markers for manual resolution
    return match;
  });

  return { content: result, resolvedCount };
}

/**
 * Check if file still has conflict markers
 */
function hasConflictMarkers(content) {
  return content.includes("<<<<<<<") && content.includes(">>>>>>>");
}

const hunkConflictFiles = run("git diff --name-only --diff-filter=U")
  .split("\n")
  .filter(Boolean);

console.log(
  `Processing ${hunkConflictFiles.length} files with remaining conflicts...\n`,
);

let hunkResolvedFiles = 0;
let hunkResolvedTotal = 0;
let fullyResolvedFiles = 0;

for (const file of hunkConflictFiles) {
  try {
    const content = fs.readFileSync(file, "utf-8");
    const { content: updated, resolvedCount } = resolveTrivialHunks(content);

    if (resolvedCount > 0) {
      fs.writeFileSync(file, updated);
      hunkResolvedTotal += resolvedCount;
      hunkResolvedFiles++;

      if (!hasConflictMarkers(updated)) {
        // File is fully resolved, stage it
        execSync(`git add "${file}"`, { stdio: "pipe" });
        console.log(`  ✓ ${file} (${resolvedCount} hunks, fully resolved)`);
        fullyResolvedFiles++;
      } else {
        console.log(
          `  ~ ${file} (${resolvedCount} hunks resolved, conflicts remain)`,
        );
      }
    }
  } catch (err) {
    console.error(`  ✗ ${file}: ${err.message}`);
  }
}

console.log(
  `\nResolved ${hunkResolvedTotal} trivial hunks across ${hunkResolvedFiles} files.`,
);
console.log(`Fully resolved: ${fullyResolvedFiles} files.`);

// Step 7: Find-and-replace @orderly.network/ -> @veltodefi/ in non-conflicted files
console.log("\n" + "=".repeat(60));
console.log("Finding files to update @orderly.network/ -> @veltodefi/...\n");

// Get remaining conflicted files
const remainingConflicts = new Set(
  runSafe("git diff --name-only --diff-filter=U")
    ?.split("\n")
    .filter(Boolean) || [],
);

// Patterns to skip
const skipPatterns = [
  /node_modules/,
  /\.lock$/,
  /-lock\./,
  /lock\.yaml$/,
  /lock\.json$/,
  /resolve-conflicts\.js$/,
];

function shouldSkip(filePath) {
  if (remainingConflicts.has(filePath)) return true;
  return skipPatterns.some((pattern) => pattern.test(filePath));
}

function findFilesWithPattern(dir, pattern) {
  const results = [];
  const extensions = [".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".mdx"];

  function walk(currentDir) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(process.cwd(), fullPath);

      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".git") continue;
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (!extensions.includes(ext)) continue;
        if (shouldSkip(relativePath)) continue;

        try {
          const content = fs.readFileSync(fullPath, "utf-8");
          if (pattern.test(content)) {
            results.push({ path: fullPath, relativePath });
          }
        } catch {
          // Skip unreadable files
        }
      }
    }
  }

  walk(dir);
  return results;
}

const filesToUpdate = findFilesWithPattern(
  process.cwd(),
  /@orderly\.network\//,
);

console.log(`Found ${filesToUpdate.length} non-conflicted files to update\n`);

// Packages to keep as @orderly.network (not renamed)
const keepOriginalPackages = ["eslint-config", "prettier-config"];

function replacePackageNames(content) {
  // Replace @orderly.network/X with @veltodefi/X, except for keepOriginalPackages
  return content.replace(/@orderly\.network\/([\w-]+)/g, (match, pkgName) => {
    if (keepOriginalPackages.includes(pkgName)) {
      return match; // Keep original
    }
    return `@veltodefi/${pkgName}`;
  });
}

let updatedCount = 0;
for (const { path: filePath, relativePath } of filesToUpdate) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const updated = replacePackageNames(content);
    if (content !== updated) {
      fs.writeFileSync(filePath, updated);
      console.log(`  ✓ ${relativePath}`);
      updatedCount++;
    }
  } catch (err) {
    console.error(`  ✗ ${relativePath}: ${err.message}`);
  }
}

console.log(`\nUpdated ${updatedCount} files.`);

// Step 8: Replace lodash with lodash.merge
console.log("\n" + "=".repeat(60));
console.log("Replacing lodash with lodash.merge...\n");

// Get remaining conflicted files (refresh)
const remainingConflictsForLodash = new Set(
  runSafe("git diff --name-only --diff-filter=U")
    ?.split("\n")
    .filter(Boolean) || [],
);

// 8a: Handle package.json files via pnpm (proper version resolution)
const workspaceDirs = ["apps", "packages"];
let lodashPkgCount = 0;

for (const wsDir of workspaceDirs) {
  const wsDirPath = path.join(process.cwd(), wsDir);
  let entries;
  try {
    entries = fs.readdirSync(wsDirPath, { withFileTypes: true });
  } catch {
    continue;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const pkgJsonPath = path.join(wsDirPath, entry.name, "package.json");
    const relativePkgJson = path.relative(process.cwd(), pkgJsonPath);

    if (remainingConflictsForLodash.has(relativePkgJson)) continue;

    let pkgJson;
    try {
      pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
    } catch {
      continue;
    }

    const hasLodash =
      "lodash" in (pkgJson.dependencies || {}) ||
      "lodash" in (pkgJson.devDependencies || {});
    const hasTypesLodash =
      "@types/lodash" in (pkgJson.dependencies || {}) ||
      "@types/lodash" in (pkgJson.devDependencies || {});

    if (!hasLodash && !hasTypesLodash) continue;

    const pkgName = pkgJson.name;
    console.log(`  Processing ${relativePkgJson} (${pkgName})...`);

    // Determine which section each dep is in
    const lodashInDev = "lodash" in (pkgJson.devDependencies || {});
    const typesInDev = "@types/lodash" in (pkgJson.devDependencies || {});

    // Remove lodash and @types/lodash
    const toRemove = [];
    if (hasLodash) toRemove.push("lodash");
    if (hasTypesLodash) toRemove.push("@types/lodash");

    try {
      execSync(`pnpm --filter "${pkgName}" remove ${toRemove.join(" ")}`, {
        stdio: "pipe",
        cwd: process.cwd(),
      });
    } catch (err) {
      console.error(
        `    ✗ Failed to remove ${toRemove.join(", ")}: ${err.message}`,
      );
      continue;
    }

    // Install lodash.merge and @types/lodash.merge in the correct sections
    const addDeps = [];
    const addDevDeps = [];

    if (hasLodash) {
      if (lodashInDev) {
        addDevDeps.push("lodash.merge");
      } else {
        addDeps.push("lodash.merge");
      }
    }
    if (hasTypesLodash) {
      if (typesInDev) {
        addDevDeps.push("@types/lodash.merge");
      } else {
        addDeps.push("@types/lodash.merge");
      }
    }

    try {
      if (addDeps.length > 0) {
        execSync(`pnpm --filter "${pkgName}" add ${addDeps.join(" ")}`, {
          stdio: "pipe",
          cwd: process.cwd(),
        });
      }
      if (addDevDeps.length > 0) {
        execSync(`pnpm --filter "${pkgName}" add -D ${addDevDeps.join(" ")}`, {
          stdio: "pipe",
          cwd: process.cwd(),
        });
      }
      console.log(`    ✓ Swapped to lodash.merge`);
      lodashPkgCount++;
    } catch (err) {
      console.error(`    ✗ Failed to add lodash.merge: ${err.message}`);
    }
  }
}

console.log(
  `\nSwapped lodash → lodash.merge in ${lodashPkgCount} packages via pnpm.`,
);

// 8b: Handle source files (import/require replacements)
const lodashSourceFiles = findFilesWithPattern(
  process.cwd(),
  /["']lodash["']|["']@types\/lodash["']/,
).filter(({ relativePath }) => !relativePath.endsWith("package.json"));

console.log(
  `\nFound ${lodashSourceFiles.length} source files with lodash references\n`,
);

let lodashUpdatedCount = 0;
for (const { path: filePath, relativePath } of lodashSourceFiles) {
  if (remainingConflictsForLodash.has(relativePath)) continue;

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    let updated = content;

    // Replace "lodash" with "lodash.merge" (but not "lodash.merge" or "lodash.something")
    updated = updated.replace(/(["'])lodash\1/g, "$1lodash.merge$1");

    // Replace "@types/lodash" with "@types/lodash.merge"
    updated = updated.replace(
      /(["'])@types\/lodash\1/g,
      "$1@types/lodash.merge$1",
    );

    if (content !== updated) {
      fs.writeFileSync(filePath, updated);
      console.log(`  ✓ ${relativePath}`);
      lodashUpdatedCount++;
    }
  } catch (err) {
    console.error(`  ✗ ${relativePath}: ${err.message}`);
  }
}

console.log(`\nUpdated ${lodashUpdatedCount} source files.`);
console.log("\nAll done!");
