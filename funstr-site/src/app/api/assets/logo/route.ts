import { promises as fs } from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function contentTypeFor(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

async function fileExists(p: string) {
  try {
    const st = await fs.stat(p);
    return st.isFile();
  } catch {
    return false;
  }
}

async function dirExists(p: string) {
  try {
    const st = await fs.stat(p);
    return st.isDirectory();
  } catch {
    return false;
  }
}

async function findLogoFile(): Promise<string | null> {
  const explicit = process.env.FUNSTR_LOGO_PATH;
  if (explicit && (await fileExists(explicit))) return explicit;

  // Next runs with CWD = `funstr-site/`, so repo root is 1 level up.
  const repoRoot = path.resolve(process.cwd(), "..");
  const candidatesDirs = [
    path.join(repoRoot, "@Stems"),
    path.join(repoRoot, "Stems"),
    path.join(process.cwd(), "@Stems"),
    path.join(process.cwd(), "Stems"),
  ];

  // Optional fallback if someone wants to serve from `public/` instead.
  if (process.env.FUNSTR_LOGO_ALLOW_PUBLIC === "1") {
    candidatesDirs.push(path.join(process.cwd(), "public"));
  }

  const preferredNames = [
    "logo.svg",
    "logo.png",
    "logo.webp",
    "logo.jpg",
    "logo.jpeg",
    "funstrategy.svg",
    "funstrategy.png",
    "funstrategy.webp",
    "funstr.svg",
    "funstr.png",
    "funstr.webp",
  ];

  for (const dir of candidatesDirs) {
    if (!(await dirExists(dir))) continue;

    for (const name of preferredNames) {
      const p = path.join(dir, name);
      if (await fileExists(p)) return p;
    }

    const entries = await fs.readdir(dir);
    const images = entries
      .filter((n) => /\.(png|jpe?g|webp|gif|svg)$/i.test(n))
      .sort((a, b) => a.localeCompare(b));
    if (images.length > 0) return path.join(dir, images[0]);
  }

  return null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const logoPath = await findLogoFile();
  if (!logoPath) {
    if (url.searchParams.get("debug") === "1") {
      // Help diagnose why a logo isn't being picked up.
      const repoRoot = path.resolve(process.cwd(), "..");
      return NextResponse.json(
        {
          found: false,
          cwd: process.cwd(),
          repoRoot,
          hint:
            "Place your logo in `Stems/` (repo root) or `funstr-site/Stems/` and name it `logo.png` or `logo.svg`.",
        },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        error:
          "Logo not found. Put your logo into `Stems/` (repo root) or set FUNSTR_LOGO_PATH in .env.local.",
      },
      { status: 404 }
    );
  }

  const st = await fs.stat(logoPath);
  const etag = `"${st.size}-${st.mtimeMs}"`;
  const ifNoneMatch = req.headers.get("if-none-match");
  if (ifNoneMatch && ifNoneMatch === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const buf = await fs.readFile(logoPath);
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": contentTypeFor(logoPath),
      "Cache-Control": "public, max-age=3600",
      ETag: etag,
    },
  });
}


