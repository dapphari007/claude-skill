// Generates demo.gif — an animated terminal showing the triggerability score
// catching a vague description (30/100) and rewarding a sharp one (95/100).
//
// Pure JS, no ffmpeg/vhs: `npm i -D @napi-rs/canvas gifenc` then `node scripts/make-gif.mjs`.
import { createCanvas } from '@napi-rs/canvas';
import gifenc from 'gifenc';
import { writeFileSync } from 'node:fs';

const { GIFEncoder, quantize, applyPalette } = gifenc;

const W = 840;
const H = 392;
const FONT = '15px Consolas, monospace';

// Catppuccin Mocha — matches demo.svg.
const C = {
  bg: '#1e1e2e',
  bar: '#181825',
  dot1: '#f38ba8',
  dot2: '#f9e2af',
  dot3: '#a6e3a1',
  dim: '#6c7086',
  text: '#cdd6f4',
  blue: '#89b4fa',
  green: '#a6e3a1',
  red: '#f38ba8',
  yellow: '#f9e2af',
  sub: '#bac2de',
};

// Each line is an array of {t, c, s?} segments (s = use a symbol font for ✓), drawn at a y offset.
const seg = (t, c) => ({ t, c });
const sym = (t, c) => ({ t, c, s: true }); // glyphs Consolas lacks (✓)
const LINES = [
  { y: 74, parts: [seg('$ ', C.blue), seg('create-claude-skill new payment-flow ', C.text), seg('--description "a helper for various stuff"', C.dim)] },
  { y: 100, parts: [sym('✓ ', C.green), seg('created payment-flow/SKILL.md', C.text)] },
  { y: 124, parts: [seg('  triggerability ', C.text), seg('30/100', C.red)] },
  { y: 148, parts: [seg('    → ', C.yellow), seg('Add specific trigger conditions — what task should activate this?', C.sub)] },
  { y: 172, parts: [seg('    → ', C.yellow), seg('Name concrete keywords a user would actually type.', C.sub)] },
  { y: 196, parts: [seg('    → ', C.yellow), seg('Replace vague words (helper / utility / various).', C.sub)] },
  { y: 246, parts: [seg('$ ', C.blue), seg('create-claude-skill validate skills/escalate-smart', C.text)] },
  { y: 272, parts: [seg('  ', C.text), sym('✓ ', C.green), seg('frontmatter looks good', C.text)] },
  { y: 298, parts: [seg('  Triggerability ', C.text), seg('95/100 ', C.green), seg('██████████', C.green)] },
  { y: 322, parts: [seg('    ', C.sub), sym('✓ ', C.green), seg('this description should auto-trigger reliably', C.sub)] },
];
const FOOTER = { y: 364, parts: [seg('npx create-claude-skill new my-skill', C.dim)] };

// Reveal schedule: [linesShown, delayMs]. Cursor blinks while "typing".
const STEPS = [
  [1, 650], [2, 480], [3, 750], [4, 380], [5, 380], [6, 950],
  [7, 700], [8, 480], [9, 850], [10, 420],
];
const FOOTER_HOLD = 2300;

function drawFrame(ctx, nShown, showCursor, withFooter) {
  // backdrop
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  // title bar
  ctx.fillStyle = C.bar;
  ctx.fillRect(0, 0, W, 40);
  for (const [cx, col] of [[22, C.dot1], [44, C.dot2], [66, C.dot3]]) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(cx, 20, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.font = '13px Consolas, monospace';
  ctx.fillStyle = C.dim;
  ctx.textAlign = 'center';
  ctx.fillText('create-claude-skill', W / 2, 25);
  ctx.textAlign = 'left';

  ctx.font = FONT;
  let lastX = 24;
  let lastY = 74;
  for (let i = 0; i < nShown && i < LINES.length; i++) {
    const ln = LINES[i];
    let x = 24;
    for (const p of ln.parts) {
      ctx.font = p.s ? '15px "Segoe UI Symbol", "Segoe UI", Consolas' : FONT;
      ctx.fillStyle = p.c;
      ctx.fillText(p.t, x, ln.y);
      x += ctx.measureText(p.t).width;
    }
    ctx.font = FONT;
    lastX = x;
    lastY = ln.y;
  }
  if (withFooter) {
    ctx.font = '13px Consolas, monospace';
    ctx.fillStyle = C.dim;
    ctx.fillText(FOOTER.parts[0].t, 24, FOOTER.y);
    ctx.font = FONT;
  }
  // blinking block cursor after the most-recent line
  if (showCursor) {
    ctx.fillStyle = C.sub;
    ctx.fillRect(lastX + 2, lastY - 12, 8, 15);
  }
}

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// Build a stable global palette from the fullest frame.
drawFrame(ctx, LINES.length, false, true);
const fullData = ctx.getImageData(0, 0, W, H).data;
const palette = quantize(fullData, 256);

const gif = GIFEncoder();
const push = (nShown, delay, showCursor, withFooter = false) => {
  drawFrame(ctx, nShown, showCursor, withFooter);
  const { data } = ctx.getImageData(0, 0, W, H);
  const index = applyPalette(data, palette);
  gif.writeFrame(index, W, H, { palette, delay });
};

// two-frame cursor blink before typing starts
push(0, 450, true);
push(0, 450, false);
for (const [n, delay] of STEPS) {
  const isNewCommand = n === 1 || n === 7;
  push(n, delay, isNewCommand);
}
// final frame with footer, long hold, then loop
push(LINES.length, FOOTER_HOLD, false, true);
gif.finish();

writeFileSync(new URL('../demo.gif', import.meta.url), gif.bytes());
console.log('wrote demo.gif (' + gif.bytes().length + ' bytes)');
