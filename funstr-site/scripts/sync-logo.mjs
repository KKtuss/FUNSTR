import { promises as fs } from "node:fs";
import path from "node:path";

async function exists(p) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

async function isDir(p) {
  try {
    const st = await fs.stat(p);
    return st.isDirectory();
  } catch {
    return false;
  }
}

async function pickLogoFile() {
  const cwd = process.cwd(); // funstr-site/
  const repoRoot = path.resolve(cwd, "..");

  const dirs = [
    path.join(repoRoot, "Stems"),
    path.join(repoRoot, "@Stems"),
    path.join(cwd, "Stems"),
    path.join(cwd, "@Stems"),
  ];

  const explicit = process.env.FUNSTR_LOGO_PATH;
  if (explicit && (await exists(explicit))) return explicit;

  // Higher in this list = higher priority when mtimes are similar.
  const preferred = [
    "@logoo.png",
    "logoo.png",
    "logo.png",
    "logo.webp",
    "logo.jpg",
    "logo.jpeg",
    "funstr.png",
    "funstrategy.png",
    "logo.svg",
  ];

  const candidates = [];

  for (const dir of dirs) {
    if (!(await isDir(dir))) continue;

    // Collect preferred-name candidates with a rank.
    for (let i = 0; i < preferred.length; i++) {
      const name = preferred[i];
      const p = path.join(dir, name);
      if (!(await exists(p))) continue;
      const st = await fs.stat(p);
      if (!st.isFile()) continue;
      candidates.push({ p, mtimeMs: st.mtimeMs, rank: preferred.length - i });
    }

    // Collect any image candidates (lower rank than explicit preferred names).
    const entries = await fs.readdir(dir);
    for (const name of entries) {
      if (!/\.(png|webp|jpe?g|svg)$/i.test(name)) continue;
      const p = path.join(dir, name);
      const st = await fs.stat(p);
      if (!st.isFile()) continue;
      candidates.push({ p, mtimeMs: st.mtimeMs, rank: 0 });
    }
  }

  if (!candidates.length) return null;

  // Prefer explicit filenames, then pick the newest among them.
  candidates.sort((a, b) => b.rank - a.rank || b.mtimeMs - a.mtimeMs);
  return candidates[0].p;
}

async function pickVideoFile() {
  const cwd = process.cwd(); // funstr-site/
  const repoRoot = path.resolve(cwd, "..");

  const dirs = [
    path.join(repoRoot, "Stems"),
    path.join(repoRoot, "@Stems"),
    path.join(cwd, "Stems"),
    path.join(cwd, "@Stems"),
  ];

  const explicit = process.env.FUNSTR_BG_VIDEO_PATH;
  if (explicit && (await exists(explicit))) return explicit;

  const preferredPatterns = [
    /^web bg\.mp4$/i,
    /^web-bg\.mp4$/i,
    /^bg\.mp4$/i,
    /^background\.mp4$/i,
  ];

  const candidates = [];
  for (const dir of dirs) {
    if (!(await isDir(dir))) continue;
    const entries = await fs.readdir(dir);
    for (const name of entries) {
      if (!/\.mp4$/i.test(name)) continue;
      const p = path.join(dir, name);
      const st = await fs.stat(p);
      if (!st.isFile()) continue;

      const rank =
        preferredPatterns.findIndex((rx) => rx.test(name)) === -1
          ? 0
          : 10 - preferredPatterns.findIndex((rx) => rx.test(name));
      candidates.push({ p, mtimeMs: st.mtimeMs, rank });
    }
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => b.rank - a.rank || b.mtimeMs - a.mtimeMs);
  return candidates[0].p;
}

async function main() {
  const src = await pickLogoFile();
  if (!src) {
    console.log("[sync-logo] No logo found in Stems/; leaving public/logo.* as-is.");
  } else {
    const outDir = path.resolve(process.cwd(), "public");
    await fs.mkdir(outDir, { recursive: true });

    const ext = path.extname(src).toLowerCase();
    const dest = path.join(outDir, ext === ".svg" ? "logo.svg" : "logo.png");
    const destLogoo = path.join(outDir, ext === ".svg" ? "logoo.svg" : "logoo.png");

    await fs.copyFile(src, dest);
    console.log(`[sync-logo] Copied ${src} -> ${dest}`);
    
    // Also copy as logoo.png for favicon
    await fs.copyFile(src, destLogoo);
    console.log(`[sync-logo] Copied ${src} -> ${destLogoo}`);
  }

  const videoSrc = await pickVideoFile();
  if (!videoSrc) {
    console.log("[sync-logo] No background video found in Stems/; leaving public/bg.mp4 as-is.");
    return;
  }

  const outDir = path.resolve(process.cwd(), "public");
  await fs.mkdir(outDir, { recursive: true });
  const dest = path.join(outDir, "bg.mp4");
  await fs.copyFile(videoSrc, dest);
  console.log(`[sync-logo] Copied ${videoSrc} -> ${dest}`);
}

await main();


