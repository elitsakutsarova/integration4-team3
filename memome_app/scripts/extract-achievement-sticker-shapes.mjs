import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const STICKER_DIR = path.join(PROJECT_ROOT, "public", "achievementStickers");
const OUTPUT_FILE = path.join(PROJECT_ROOT, "app", "data", "achievementStickerShapes.js");

function readStickerSvg(id) {
  const fileName = `a_sticker${Number(id)}.svg`;
  const filePath = path.join(STICKER_DIR, fileName);
  return fs.readFileSync(filePath, "utf8");
}

function parseViewBox(svg) {
  const match = svg.match(/viewBox\s*=\s*"([^"]+)"/i);
  if (!match) throw new Error("Missing viewBox");
  const viewBox = match[1].trim();
  const parts = viewBox.split(/\s+/).map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    throw new Error(`Invalid viewBox: ${viewBox}`);
  }
  const width = parts[2];
  const height = parts[3];
  return { viewBox, width, height };
}

function parseAttrs(tag) {
  const attrs = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

function getFirstMaskPathD(svg) {
  const maskMatch = svg.match(/<mask\b[\s\S]*?<\/mask>/i);
  if (!maskMatch) return null;
  const pathMatch = maskMatch[0].match(/<path\b[^>]*\bd\s*=\s*"([^"]+)"[^>]*>/i);
  return pathMatch ? pathMatch[1] : null;
}

function getFirstPathWithStrokeDasharrayD(svg) {
  const paths = svg.match(/<path\b[^>]*>/gi) || [];
  for (const pathTag of paths) {
    if (!/stroke-dasharray\s*=\s*"[^"]+"/i.test(pathTag)) continue;
    const d = pathTag.match(/\bd\s*=\s*"([^"]+)"/i)?.[1];
    if (d) return d;
  }
  return null;
}

function getFirstWhiteFillPathD(svg) {
  const paths = svg.match(/<path\b[^>]*>/gi) || [];
  for (const pathTag of paths) {
    const attrs = parseAttrs(pathTag);
    const fill = (attrs.fill || "").toLowerCase();
    if (fill !== "white" && fill !== "#fff" && fill !== "#ffffff") continue;
    if (attrs.d) return attrs.d;
  }
  return null;
}

function getDashedCircle(svg) {
  const circles = svg.match(/<circle\b[^>]*>/gi) || [];
  for (const circleTag of circles) {
    if (!/stroke-dasharray\s*=\s*"[^"]+"/i.test(circleTag)) continue;
    const attrs = parseAttrs(circleTag);
    if (attrs.cx && attrs.cy && attrs.r) {
      return { cx: Number(attrs.cx), cy: Number(attrs.cy), r: Number(attrs.r) };
    }
  }
  return null;
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

function extractShape(svg, id) {
  const maskPath = getFirstMaskPathD(svg);
  if (maskPath) {
    return { shapeKind: "path", d: maskPath };
  }

  const dashedCircle = getDashedCircle(svg);
  if (dashedCircle) {
    return {
      shapeKind: "circle",
      cx: dashedCircle.cx,
      cy: dashedCircle.cy,
      r: dashedCircle.r,
    };
  }

  const d =
    getFirstPathWithStrokeDasharrayD(svg) ||
    getFirstWhiteFillPathD(svg);

  if (!d) {
    throw new Error(`Sticker ${id}: no qualifying path found`);
  }

  return {
    shapeKind: "path",
    d,
  };
}

function buildRecord(id) {
  const svg = readStickerSvg(id);
  const { viewBox, width, height } = parseViewBox(svg);
  const shape = extractShape(svg, id);

  const questionMark = {
    x: round(width / 2),
    y: round(height * 0.55),
  };

  const fontSize = round(Math.min(width, height) * 0.18);

  return {
    id,
    viewBox,
    ...shape,
    questionMark,
    fontSize,
  };
}

function buildOutput() {
  const shapeEntries = [];
  for (let n = 1; n <= 13; n += 1) {
    const id = String(n).padStart(2, "0");
    shapeEntries.push([id, buildRecord(id)]);
  }

  const lines = ["export const ACHIEVEMENT_STICKER_SHAPES = {"];
  for (const [id, data] of shapeEntries) {
    lines.push(`  '${id}': ${JSON.stringify(data)},`);
  }
  lines.push("};", "");

  fs.writeFileSync(OUTPUT_FILE, `${lines.join("\n")}`, "utf8");
  return shapeEntries.length;
}

const count = buildOutput();
console.log(`Extracted ${count} achievement sticker shapes to ${OUTPUT_FILE}`);
