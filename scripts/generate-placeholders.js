#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const images = {
  "hero.jpg": { w: 1920, h: 1080, bg: "#2F3B25", text: "KindSkin Hero", accent: "#F7F3EA" },
  "about-story.jpg": { w: 800, h: 600, bg: "#4A5C3A", text: "Our Story", accent: "#F7F3EA" },
  "products/aloe-vera-gel.jpg": { w: 800, h: 800, bg: "#8A9A7B", text: "Aloe Vera Gel", accent: "#F7F3EA" },
  "products/aloe-texture.jpg": { w: 800, h: 800, bg: "#A8B89A", text: "Aloe Texture", accent: "#2F3B25" },
  "products/aloe-leaf.jpg": { w: 800, h: 800, bg: "#4A5C3A", text: "Aloe Leaf", accent: "#F7F3EA" },
  "products/lip-balm.jpg": { w: 800, h: 800, bg: "#C4785A", text: "Lip Balm", accent: "#F7F3EA" },
  "products/lip-balm-rose.jpg": { w: 800, h: 800, bg: "#D4956F", text: "Rose Petal", accent: "#F7F3EA" },
  "products/lip-balm-cocoa.jpg": { w: 800, h: 800, bg: "#8B6914", text: "Cocoa Butter", accent: "#F7F3EA" },
  "products/abhyang-tel.jpg": { w: 800, h: 800, bg: "#6B5B3A", text: "Abhyang Tel", accent: "#F7F3EA" },
  "products/abhyang-oil.jpg": { w: 800, h: 800, bg: "#8B7355", text: "Oil Texture", accent: "#F7F3EA" },
  "products/abhyang-herbs.jpg": { w: 800, h: 800, bg: "#4A5C3A", text: "Ayurvedic Herbs", accent: "#F7F3EA" },
  "ingredient/aloe-leaf.jpg": { w: 800, h: 600, bg: "#4A5C3A", text: "The Leaf", accent: "#F7F3EA" },
  "ingredient/aloe-extract.jpg": { w: 800, h: 600, bg: "#8A9A7B", text: "The Extract", accent: "#2F3B25" },
  "ingredient/aloe-gel.jpg": { w: 800, h: 600, bg: "#A8B89A", text: "The Gel", accent: "#2F3B25" },
  "testimonials/priya.jpg": { w: 200, h: 200, bg: "#C4785A", text: "P", accent: "#F7F3EA" },
  "testimonials/ananya.jpg": { w: 200, h: 200, bg: "#8A9A7B", text: "A", accent: "#F7F3EA" },
  "testimonials/meera.jpg": { w: 200, h: 200, bg: "#4A5C3A", text: "M", accent: "#F7F3EA" },
  "testimonials/kavya.jpg": { w: 200, h: 200, bg: "#6B5B3A", text: "K", accent: "#F7F3EA" },
  "articles/morning-routine.jpg": { w: 800, h: 500, bg: "#F7F3EA", text: "Morning Routine", accent: "#2F3B25" },
  "articles/aloe-benefits.jpg": { w: 800, h: 500, bg: "#8A9A7B", text: "Aloe Benefits", accent: "#F7F3EA" },
  "articles/lip-care-winter.jpg": { w: 800, h: 500, bg: "#C4785A", text: "Lip Care", accent: "#F7F3EA" },
  "articles/abhyanga-guide.jpg": { w: 800, h: 500, bg: "#6B5B3A", text: "Abhyanga", accent: "#F7F3EA" },
  "articles/dry-skin-remedies.jpg": { w: 800, h: 500, bg: "#A8B89A", text: "Dry Skin", accent: "#2F3B25" },
  "articles/skin-types.jpg": { w: 800, h: 500, bg: "#4A5C3A", text: "Skin Types", accent: "#F7F3EA" },
};

const baseDir = path.join(__dirname, "../frontend/public/images");

for (const [file, { w, h, bg, text, accent }] of Object.entries(images)) {
  const dir = path.dirname(path.join(baseDir, file));
  fs.mkdirSync(dir, { recursive: true });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Georgia,serif" font-size="${Math.min(w,h)/12}" fill="${accent}">${text}</text>
</svg>`;
  fs.writeFileSync(path.join(baseDir, file.replace(".jpg", ".svg")), svg);
}

console.log("Generated", Object.keys(images).length, "placeholder images");
