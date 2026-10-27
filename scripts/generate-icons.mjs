// Gera os SVGs derivados e os PNGs de ícone/splash a partir de assets/logo/mark.svg.
// Uso: npm run icons
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assets = join(root, "assets");
const logoDir = join(assets, "logo");

const markSvg = readFileSync(join(logoDir, "mark.svg"), "utf8");
const mark = markSvg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");

const background = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1F7EE9"/>
      <stop offset="1" stop-color="#0068E1"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.3" cy="0.2" r="0.8">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>`;

const scaled = (scale) =>
  `<g transform="translate(512 512) scale(${scale}) translate(-512 -512)">${mark}</g>`;

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${body}\n</svg>\n`;

// Ícone quadrado (iOS arredonda sozinho; precisa ser opaco)
const iconSvg = svg(`${background}
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <rect width="1024" height="1024" fill="url(#glow)"/>
  ${scaled(0.86)}`);

// Ícone com cantos arredondados (splash e favicon)
const roundedSvg = svg(`${background}
  <rect width="1024" height="1024" rx="232" fill="url(#bg)"/>
  <rect width="1024" height="1024" rx="232" fill="url(#glow)"/>
  ${scaled(0.86)}`);

// Android adaptive: o launcher mostra só os ~66% centrais (72 de 108dp) e ainda recorta
// em círculo/squircle. O desenho ocupa ~45dp, deixando respiro dentro dessa área.
const adaptiveFgSvg = svg(scaled(0.66));
const adaptiveBgSvg = svg(`${background}
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <rect width="1024" height="1024" fill="url(#glow)"/>`);

writeFileSync(join(logoDir, "icon.svg"), iconSvg);
writeFileSync(join(logoDir, "icon-rounded.svg"), roundedSvg);

const renderPng = (source, file, size) => {
  const png = new Resvg(source, { fitTo: { mode: "width", value: size } }).render().asPng();
  writeFileSync(join(assets, file), png);
  console.log(`assets/${file} (${size}px)`);
};

renderPng(iconSvg, "icon.png", 1024);
renderPng(adaptiveFgSvg, "adaptive-icon.png", 1024);
renderPng(adaptiveBgSvg, "adaptive-icon-background.png", 1024);
renderPng(roundedSvg, "splash-icon.png", 1024);
renderPng(roundedSvg, "favicon.png", 196);
