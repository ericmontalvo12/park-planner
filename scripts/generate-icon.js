/**
 * Generates a simple Park Planner icon (1024x1024 PNG).
 * Run: node scripts/generate-icon.js
 * Requires: npm install canvas
 */
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 1024;
const canvas = createCanvas(SIZE, SIZE);
const ctx = canvas.getContext('2d');

// Background
const bg = ctx.createLinearGradient(0, 0, 0, SIZE);
bg.addColorStop(0, '#3a9d5c');
bg.addColorStop(1, '#1a5c30');
ctx.fillStyle = bg;
ctx.roundRect(0, 0, SIZE, SIZE, 180);
ctx.fill();

// Mountain
ctx.fillStyle = 'rgba(255,255,255,0.95)';
ctx.beginPath();
ctx.moveTo(512, 200);
ctx.lineTo(820, 700);
ctx.lineTo(204, 700);
ctx.closePath();
ctx.fill();

// Snow cap
ctx.fillStyle = '#e8f5ec';
ctx.beginPath();
ctx.moveTo(512, 200);
ctx.lineTo(620, 390);
ctx.lineTo(404, 390);
ctx.closePath();
ctx.fill();

// Trees (foreground)
ctx.fillStyle = '#2D7D46';
[[300, 680, 60], [430, 700, 50], [560, 695, 55], [690, 685, 60]].forEach(([x, y, r]) => {
  ctx.beginPath();
  ctx.moveTo(x, y - r * 1.8);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x - r, y);
  ctx.closePath();
  ctx.fill();
});

// Sun
ctx.fillStyle = '#F59E0B';
ctx.beginPath();
ctx.arc(820, 220, 70, 0, Math.PI * 2);
ctx.fill();

const outDir = path.join(__dirname, '../assets');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const buf = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(outDir, 'icon.png'), buf);
fs.writeFileSync(path.join(outDir, 'splash.png'), buf);
fs.writeFileSync(path.join(outDir, 'adaptive-icon.png'), buf);
console.log('Icons written to assets/');
