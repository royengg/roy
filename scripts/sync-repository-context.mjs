import { execFileSync } from "node:child_process";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceRoot = process.env.REPOSITORY_SOURCE_DIR;

if (!sourceRoot) {
  throw new Error(
    "Set REPOSITORY_SOURCE_DIR to a directory containing the portfolio repository checkouts.",
  );
}

const repositories = [
  {
    slug: "savekaro",
    folder: "SaveKaro",
    url: "https://github.com/royengg/SaveKaro",
  },
  {
    slug: "one-auction",
    folder: "1auction",
    url: "https://github.com/royengg/1auction",
  },
  {
    slug: "homework-ai",
    folder: "homeworkai",
    url: "https://github.com/royengg/homeworkai",
  },
  {
    slug: "veda-ai",
    folder: "vedaai-assignment",
    url: "https://github.com/royengg/vedaai-assignment",
  },
  {
    slug: "litmus-ai",
    folder: "Litmus-AI",
    url: "https://github.com/royengg/Litmus-AI",
  },
  {
    slug: "leadly-live",
    folder: "leadly-live",
    url: "https://github.com/royengg/leadly-live",
  },
  {
    slug: "yunami-bot",
    folder: "yunami-bot",
    url: "https://github.com/royengg/yunami-bot",
  },
  {
    slug: "payme-app",
    folder: "payme-app",
    url: "https://github.com/royengg/PayMe-app",
  },
];

const ignoredSegments = new Set([
  ".git",
  ".next",
  ".turbo",
  ".vercel",
  "ai-transcripts",
  "backups",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "public",
]);

const ignoredNames = new Set([
  "next-env.d.ts",
  "package-lock.json",
  "bun.lock",
  "bun.lockb",
  "pnpm-lock.yaml",
  "tsconfig.tsbuildinfo",
  "yarn.lock",
]);

const acceptedExtensions = new Set([
  ".cjs",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".prisma",
  ".sql",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml",
]);

const maxTreeFiles = 500;
const maxContextFiles = 34;
const maxFileCharacters = 14_000;
const maxProjectCharacters = 100_000;

function shouldIgnore(relativePath) {
  const segments = relativePath.split(path.sep);
  const name = segments.at(-1) ?? "";

  return (
    segments.some((segment) => ignoredSegments.has(segment)) ||
    ignoredNames.has(name) ||
    name.startsWith(".env") ||
    name.endsWith(".lock") ||
    name.endsWith(".min.js") ||
    name.endsWith(".map")
  );
}

async function collectFiles(directory, root = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(root, absolutePath);

    if (shouldIgnore(relativePath)) continue;

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath, root)));
      continue;
    }

    if (!entry.isFile()) continue;

    const extension = path.extname(entry.name).toLowerCase();
    if (acceptedExtensions.has(extension) || entry.name === "Dockerfile") {
      files.push(relativePath.split(path.sep).join("/"));
    }
  }

  return files;
}

function filePriority(file) {
  const normalized = file.toLowerCase();
  let score = 0;

  if (normalized === "readme.md") score += 120;
  if (normalized.endsWith("/readme.md")) score += 85;
  if (normalized.endsWith("package.json")) score += 105;
  if (normalized.endsWith("schema.prisma")) score += 100;
  if (normalized.includes("docker-compose")) score += 80;
  if (normalized.includes("/src/") || normalized.startsWith("src/")) score += 55;
  if (/\b(index|app|server|main)\.(ts|tsx|js|jsx)$/.test(normalized)) score += 36;
  if (/(route|controller|service|worker|queue|processor|socket|event|schema|auth|lib|hook)/.test(normalized)) {
    score += 30;
  }
  if (/(page|component|feature)/.test(normalized)) score += 12;
  if (/\.(test|spec)\./.test(normalized) || normalized.includes("/tests/")) score -= 45;
  if (normalized.endsWith(".md") && normalized !== "readme.md") score -= 15;
  if (/config|eslint|tailwind|postcss/.test(normalized)) score -= 25;

  return score;
}

function readRevision(repositoryPath) {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repositoryPath,
    encoding: "utf8",
  }).trim();
}

async function buildSnapshot(repository) {
  const repositoryPath = path.join(sourceRoot, repository.folder);
  const repositoryStats = await stat(repositoryPath);
  if (!repositoryStats.isDirectory()) {
    throw new Error(`${repositoryPath} is not a directory.`);
  }

  const allFiles = (await collectFiles(repositoryPath)).sort();
  const selectedFiles = [...allFiles]
    .sort((left, right) => filePriority(right) - filePriority(left) || left.localeCompare(right))
    .slice(0, maxContextFiles);

  const files = [];
  let usedCharacters = 0;

  for (const file of selectedFiles) {
    const remainingCharacters = maxProjectCharacters - usedCharacters;
    if (remainingCharacters <= 0) break;

    const rawContent = await readFile(path.join(repositoryPath, file), "utf8");
    const content = rawContent.slice(0, Math.min(maxFileCharacters, remainingCharacters));
    usedCharacters += content.length;
    files.push({ path: file, content });
  }

  return {
    slug: repository.slug,
    repository: repository.url,
    revision: readRevision(repositoryPath),
    tree: allFiles.slice(0, maxTreeFiles),
    files,
  };
}

const snapshots = {};
for (const repository of repositories) {
  snapshots[repository.slug] = await buildSnapshot(repository);
}

const outputPath = path.join(process.cwd(), "src/data/repository-context.json");
await writeFile(
  outputPath,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), projects: snapshots }, null, 2)}\n`,
  "utf8",
);

console.log(`Wrote repository context for ${repositories.length} projects to ${outputPath}`);
