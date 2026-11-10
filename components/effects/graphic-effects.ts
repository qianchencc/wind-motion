import { drawDisplay, drawDisplayText, measureDisplay } from './display-glyphs';
import { DATE_INK_BOUNDS, DATE_ROI, getDateCharacterStates } from '../../lib/date-timeline';

export type GraphicOptions = {
  effect: string;
  amount: number;
  detail: number;
  text?: string;
};

const DISPLAY = "'Archive Display', Impact, 'Arial Narrow', sans-serif";
const BODY = "Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif";
const BLUE = '#233cff';
const WHITE = '#f5f5f1';
const INK = '#03040a';
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (v: number) => { const x = clamp(v); return x * x * (3 - 2 * x); };
const cycle = (v: number) => ((v % 6) + 6) % 6;

function font(ctx: CanvasRenderingContext2D, size: number, display = true) {
  ctx.font = `${display ? 700 : 400} ${Math.max(1, size)}px ${display ? DISPLAY : BODY}`;
}

function fitted(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, size: number) {
  font(ctx, size);
  const measured = ctx.measureText(text).width;
  const result = Math.min(size, size * maxWidth / Math.max(1, measured));
  font(ctx, result);
  return result;
}

function small(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color = '#9fa6bb') {
  ctx.fillStyle = color;
  font(ctx, size, false);
  ctx.fillText(text, x, y);
}

function background(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, strength = 1) {
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);
  const haze = ctx.createRadialGradient(w * .47, h * 1.08, 0, w * .47, h, w * .84);
  haze.addColorStop(0, `rgba(35,60,255,${.32 * strength})`);
  haze.addColorStop(.5, `rgba(17,27,113,${.14 * strength})`);
  haze.addColorStop(1, 'rgba(3,4,10,0)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, w, h);
  const hot = (Math.sin(time * Math.PI / 3) + 1) / 2;
  const edge = ctx.createLinearGradient(0, 0, w, 0);
  edge.addColorStop(0, 'rgba(35,60,255,0)');
  edge.addColorStop(clamp(hot, .03, .97), `rgba(131,164,255,${.78 * strength})`);
  edge.addColorStop(1, 'rgba(35,60,255,0)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, w, Math.max(1, h * .003));
  ctx.fillRect(0, h - Math.max(1, h * .003), w, Math.max(1, h * .003));
}

function phrase(text: string | undefined, fallback: string[], maxLines = 3) {
  if (!text?.trim()) return fallback;
  const clean = text.trim().toUpperCase();
  if (clean.includes('\n')) return clean.split('\n').filter(Boolean).slice(0, maxLines);
  const words = clean.split(/\s+/);
  if (words.length <= maxLines) return words;
  const result: string[] = [];
  const perLine = Math.ceil(words.length / maxLines);
  for (let i = 0; i < words.length; i += perLine) result.push(words.slice(i, i + perLine).join(' '));
  return result.slice(0, maxLines);
}

/** A dark framed field, with the blue light concentrated at its outer edges. */
function typeFrame(ctx: CanvasRenderingContext2D, w: number, h: number, top: number, time: number) {
  ctx.fillStyle = '#010406'; ctx.fillRect(0, 0, w, h);
  ctx.save(); ctx.beginPath(); ctx.rect(0, top, w, h - top); ctx.clip();
  for (const side of [0, 1]) {
    const x = side ? w : 0;
    const wash = ctx.createLinearGradient(x, 0, x + (side ? -1 : 1) * w * .12, 0);
    wash.addColorStop(0, '#283bc0'); wash.addColorStop(.16, '#102270');
    wash.addColorStop(.5, '#071129'); wash.addColorStop(1, 'rgba(1,4,6,0)');
    ctx.fillStyle = wash; ctx.fillRect(side ? w * .88 : 0, top, w * .12, h - top);
  }
  const lid = ctx.createLinearGradient(0, top, 0, top + h * .075);
  lid.addColorStop(0, '#3d59a5'); lid.addColorStop(.15, '#152543'); lid.addColorStop(1, 'rgba(1,4,6,0)');
  ctx.fillStyle = lid; ctx.fillRect(0, top, w, h * .075);
  ctx.strokeStyle = '#718dbf'; ctx.lineWidth = Math.max(.7, h * .0022);
  ctx.strokeRect(.6, top + .6, w - 1.2, h - top);
  const glintY = top + (h - top) * (.5 + .3 * Math.sin(time * Math.PI / 3));
  for (const x of [0, w]) {
    ctx.save(); ctx.translate(x, glintY); ctx.scale(w * .048, h * .38);
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    glow.addColorStop(0, 'rgba(190,213,255,.42)'); glow.addColorStop(.12, 'rgba(57,84,255,.23)'); glow.addColorStop(1, 'rgba(35,60,255,0)');
    ctx.fillStyle = glow; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
  }
  ctx.restore();
}

function peakBackground(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const top = h * 23 / 378;
  typeFrame(ctx, w, h, top, time);
  ctx.save(); ctx.beginPath(); ctx.rect(1, top, w - 2, h - top); ctx.clip();
  const sky = ctx.createLinearGradient(0, top, 0, h * .51);
  sky.addColorStop(0, '#0926b2'); sky.addColorStop(.45, '#0925c3'); sky.addColorStop(1, '#030a50');
  ctx.fillStyle = sky; ctx.fillRect(1, top, w - 2, h * .47);
  const mountain = ctx.createLinearGradient(0, top, 0, h * .91);
  mountain.addColorStop(0, '#07105f'); mountain.addColorStop(.4, '#030828'); mountain.addColorStop(1, '#010406');
  ctx.beginPath(); ctx.moveTo(w * .5, top); ctx.lineTo(w * 1.04, h * .49);
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.lineTo(-w * .04, h * .49); ctx.closePath();
  ctx.fillStyle = mountain; ctx.fill();
  ctx.save(); ctx.translate(w * .5, top); ctx.scale(w * .27, h * .24);
  const bloom = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  bloom.addColorStop(0, 'rgba(236,252,255,.97)'); bloom.addColorStop(.1, 'rgba(150,207,255,.87)');
  bloom.addColorStop(.3, 'rgba(55,99,255,.45)'); bloom.addColorStop(.65, 'rgba(35,60,255,.18)'); bloom.addColorStop(1, 'rgba(35,60,255,0)');
  ctx.fillStyle = bloom; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
  for (const side of [-1, 1]) {
    const x = w * (.5 + side * .5), y = h * .477;
    const light = ctx.createLinearGradient(w * .5, top, x, y);
    light.addColorStop(0, '#f5ffff'); light.addColorStop(.18, '#c4eaff'); light.addColorStop(.47, '#568fff'); light.addColorStop(.8, 'rgba(35,60,255,.15)'); light.addColorStop(1, 'rgba(35,60,255,0)');
    ctx.beginPath(); ctx.moveTo(w * .5, top); ctx.lineTo(x, y);
    ctx.strokeStyle = light; ctx.shadowColor = '#3e8cff';
    ctx.globalAlpha = .15; ctx.shadowBlur = h * .055;
    ctx.lineWidth = h * .052; ctx.stroke();
    ctx.globalAlpha = .33; ctx.shadowBlur = h * .035;
    ctx.lineWidth = h * .016; ctx.stroke();
    ctx.globalAlpha = 1; ctx.shadowBlur = h * .022;
    ctx.lineWidth = Math.max(1, h * .004); ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

type DateBox = { x: number; y: number; width: number; height: number };

/** Both views use the same fixed native glyph boxes and recorded colour states. */
function dateLine(ctx: CanvasRenderingContext2D, box: DateBox, time: number, o: GraphicOptions, detailView = false) {
  const source = detailView ? DATE_ROI : DATE_INK_BOUNDS;
  const states = getDateCharacterStates(time, { amount: o.amount, detail: o.detail });
  ctx.save(); ctx.translate(box.x, box.y);
  ctx.scale(box.width / source.width, box.height / source.height);
  ctx.translate(-source.x, -source.y);
  for (const state of states) {
    if (!state.bbox || state.alpha <= 0) continue;
    const [left, top, right, bottom] = state.bbox;
    ctx.save(); ctx.globalAlpha *= state.alpha; ctx.fillStyle = state.color;
    if (state.char === '-') {
      ctx.fillRect(left, top, right - left, bottom - top);
    } else {
      const lowercase = /^[ceomnrv]$/.test(state.char);
      const capHeight = (bottom - top) / (lowercase ? .82 : 1);
      const capTop = top - (lowercase ? capHeight * .18 : 0);
      drawDisplayText(ctx, state.char, left, capTop, right - left, capHeight, { variant: 'date', fill: state.color });
    }
    ctx.restore();
  }
  ctx.restore();
}

function dateDetail(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, o: GraphicOptions) {
  const field = ctx.createLinearGradient(0, 0, w * .1, h);
  field.addColorStop(0, '#030528'); field.addColorStop(.45, '#020419'); field.addColorStop(1, '#01030b');
  ctx.fillStyle = field; ctx.fillRect(0, 0, w, h);
  dateLine(ctx, { x: 0, y: 0, width: w, height: h }, time, o, true);
}

function digital(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, o: GraphicOptions) {
  peakBackground(ctx, w, h, time);
  const t = cycle(time);
  const settle = 1 - Math.exp(-t * .75);
  const titleW = w * mix(.898, .843, settle);
  const titleH = h * mix(.239, .219, settle);
  const titleY = h * mix(.324, .345, settle);
  const headline = o.text?.trim().replace(/\s+/g, ' ') || 'LOLESPORTS.COM';
  // The supplied shot starts with this line already white; only its scale settles.
  drawDisplayText(ctx, headline, (w - titleW) / 2, titleY, titleW, titleH, { fill: '#dededb' });
  dateLine(ctx, {
    x: w * 119 / 671, y: h * 245 / 378,
    width: w * 434 / 671, height: h * 40 / 378,
  }, t, o);
}

type TypePose = readonly [t: number, x: number, y: number, width: number, height: number, shearX?: number, shearY?: number];
// Pixel measurements in the 671 × 378 source viewport, starting at 149.8 s.
// A separate timeline for each word is essential: only MOMENT is huge at 151.18 s.
const THIS_KEYS: readonly TypePose[] = [
  [0, -230, -175, 720, 270, 20, 12], [.103, -170, -140, 650, 240, 0, 8],
  [.28, 147, 59, 229, 97, 11, 6], [.573, 147, 58, 229, 97, 11, 6],
  [.679, 179, 83, 198, 79, 2, 2], [.878, 179, 84, 198, 79, 2, 2],
  [.971, 189, 92, 188, 76], [1.174, 189, 92, 188, 76],
  [1.275, 194, 95, 183, 74], [1.377, 194, 95, 183, 74], [1.475, 194, 88, 183, 74],
  [1.673, 195, 89, 181, 73], [1.867, 195, 96, 181, 73], [1.932, 195, 96, 181, 72], [2.171, 196, 96, 180, 72],
];
const IS_KEYS: readonly TypePose[] = [
  [0, 780, -400, 420, 380], [.103, 720, -250, 350, 320],
  [.28, 439, -10, 180, 152, -6], [.573, 439, -11, 180, 152, -6],
  [.679, 406, 70, 99, 90, -2], [.878, 406, 71, 99, 90, -2],
  [.971, 400, 86, 85, 81, -1], [1.174, 400, 86, 85, 81, -1],
  [1.275, 396, 92, 82, 76], [1.377, 396, 92, 82, 76], [1.475, 396, 85, 82, 76],
  [1.673, 395, 87, 80, 74], [1.867, 395, 94, 80, 74], [1.932, 395, 95, 79, 73], [2.171, 395, 96, 79, 72],
];
const OUR_KEYS: readonly TypePose[] = [
  [.885, -20, 135, 710, 300], [.971, 184, 143, 300, 132], [1.174, 184, 143, 300, 132],
  [1.275, 235, 164, 199, 88], [1.377, 235, 164, 199, 88], [1.475, 235, 157, 199, 88],
  [1.673, 246, 162, 178, 79], [1.867, 246, 169, 178, 79], [1.932, 250, 171, 170, 75], [2.171, 252, 172, 166, 73],
];
const MOMENT_KEYS: readonly TypePose[] = [
  [1.2, -330, 390, 1340, 280], [1.275, -35, 281, 805, 170], [1.377, -35, 281, 805, 170],
  [1.475, -35, 274, 805, 170], [1.673, 113, 252, 443, 95], [1.867, 113, 259, 443, 95],
  [1.932, 139, 254, 392, 83], [2.171, 150, 252, 370, 78], [2.575, 150, 252, 370, 78],
  [2.67, 155, 251, 360, 76], [2.775, 157, 250, 356, 75],
];

function poseAt(keys: readonly TypePose[], t: number): TypePose {
  if (t <= keys[0][0]) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const a = keys[i - 1], b = keys[i];
      const f = smooth((t - a[0]) / Math.max(.001, b[0] - a[0]));
      return [t, mix(a[1], b[1], f), mix(a[2], b[2], f), mix(a[3], b[3], f), mix(a[4], b[4], f), mix(a[5] ?? 0, b[5] ?? 0, f), mix(a[6] ?? 0, b[6] ?? 0, f)];
    }
  }
  return keys[keys.length - 1];
}

function whiteWord(ctx: CanvasRenderingContext2D, text: string, keys: readonly TypePose[], t: number, gain: number) {
  if (!text || t < keys[0][0]) return;
  const p = poseAt(keys, t), end = keys[keys.length - 1];
  const x = mix(end[1], p[1], gain), y = mix(end[2], p[2], gain);
  const width = Math.max(1, mix(end[3], p[3], gain));
  const height = Math.max(1, mix(end[4], p[4], gain));
  const depth = height * .95 * clamp((width / end[3] - 1) / 1.15);
  const sweep = keys === MOMENT_KEYS ? depth * smooth((width / end[3] - 1.06) / .5) : 0;
  ctx.save(); ctx.transform(1, (p[6] ?? 0) * gain / width, (p[5] ?? 0) * gain / height, 1, x, y);
  ctx.beginPath();
  if (sweep > .5) {
    // The enlarged word's upper surface rises slightly toward its centre.
    // A rectangular clip incorrectly made this measured edge perfectly level.
    const bend = sweep / (height * .95);
    ctx.moveTo(0, 6 * bend);
    ctx.bezierCurveTo(width * .17, 2 * bend, width * .28, 0, width * .46, 0);
    ctx.bezierCurveTo(width * .64, 0, width * .82, 2 * bend, width, 14 * bend);
    ctx.lineTo(width, height); ctx.lineTo(0, height); ctx.closePath();
  } else ctx.rect(0, 0, width, height);
  ctx.clip();
  // In the enlarged source, white projected surfaces obscure the counters.
  // Same-colour back planes reach above the visible top while their lower edge
  // stays attached to the face. As the word settles, these planes collapse.
  const steps = depth > .5 ? 9 : 0;
  const ink = Math.min(1.25, height * .016);
  for (let layer = steps; layer >= 0; layer--) {
    const reach = steps ? depth * layer / steps : 0;
    for (const dx of [0, ink]) {
      drawDisplayText(ctx, text, dx, -reach, width - ink, height + reach, { fill: '#f7f7f5', letterSpacing: .025 });
    }
  }
  // O has a closed bowl; its inward-facing projected surfaces narrow its hole.
  // Keep this sweep inside that bowl so neighbouring letters and open notches
  // do not incorrectly fuse into a featureless white strip.
  const bowl = text.toUpperCase().indexOf('O');
  if (sweep > .5 && bowl >= 0) {
    const metrics = { letterSpacing: .025 };
    const scale = (width - ink) / measureDisplay(text, metrics);
    const bowlWidth = measureDisplay('O', metrics) * scale;
    const bowlLeft = (measureDisplay(text.slice(0, bowl + 1), metrics) - measureDisplay('O', metrics)) * scale;
    ctx.save(); ctx.beginPath();
    ctx.rect(bowlLeft + bowlWidth * .3, 0, bowlWidth * .4, height); ctx.clip();
    for (let layer = steps; layer > 0; layer--) {
      const reach = depth * layer / steps, spread = sweep * layer / steps;
      for (const dx of [-spread * .055, ink + spread * .025]) {
        drawDisplayText(ctx, text, dx, -reach, width - ink, height + reach, { fill: '#f7f7f5', letterSpacing: .025 });
      }
    }
    ctx.restore();
  }
  // The front edge sits lower during expansion, so its dark apertures open late.
  const front = depth * .075 + sweep * .02;
  if (depth > .5) drawDisplayText(ctx, text, 0, front, width, height - front, { fill: '#f7f7f5', letterSpacing: .025 });
  ctx.restore();
}

function faintCrest(ctx: CanvasRenderingContext2D, t: number) {
  const alpha = 1 - smooth((t - .85) / .18);
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(335, 201);
  const scale = mix(1.12, .8, smooth(t / .8)); ctx.scale(scale, scale);
  ctx.strokeStyle = '#2823aa'; ctx.lineWidth = 3.6; ctx.lineJoin = 'miter';
  ctx.shadowColor = '#3141ff'; ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.moveTo(-61, -53); ctx.lineTo(-48, -53); ctx.lineTo(-41, -62); ctx.lineTo(-33, -51);
  ctx.lineTo(-17, -58); ctx.lineTo(-8, -53); ctx.lineTo(0, -60); ctx.lineTo(8, -53);
  ctx.lineTo(22, -58); ctx.lineTo(36, -51); ctx.lineTo(45, -61); ctx.lineTo(49, -51); ctx.lineTo(61, -51);
  ctx.quadraticCurveTo(59, -12, 34, 15); ctx.lineTo(0, 53); ctx.lineTo(-35, 15); ctx.quadraticCurveTo(-59, -12, -61, -53);
  ctx.moveTo(-21, -27); ctx.lineTo(-9, -45); ctx.lineTo(7, -45); ctx.lineTo(20, -24); ctx.lineTo(12, -8); ctx.lineTo(-10, -8); ctx.closePath();
  ctx.moveTo(-17, -3); ctx.lineTo(16, -3); ctx.lineTo(48, 30); ctx.quadraticCurveTo(57, 43, 43, 43);
  ctx.lineTo(0, 9); ctx.lineTo(-40, 42); ctx.quadraticCurveTo(-56, 46, -49, 30); ctx.closePath();
  ctx.stroke(); ctx.restore();
}

function extrusion(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, o: GraphicOptions) {
  const t = cycle(time) * mix(.75, 1.25, o.detail);
  const top = t < .28 ? mix(10, 24, smooth((t - .103) / .177)) : 24;
  typeFrame(ctx, w, h, top / 378 * h, time);
  const lines = phrase(o.text, ['THIS IS', 'OUR', 'MOMENT'], 3);
  const first = lines[0].split(/\s+/), a = first.length > 1 ? first.slice(0, -1).join(' ') : first[0];
  const b = first.length > 1 ? first[first.length - 1] : '';
  const gain = mix(.2, 1.342857142857, o.amount); // .7 is the measured source amplitude.
  ctx.save(); ctx.scale(w / 671, h / 378);
  ctx.beginPath(); ctx.rect(0, top, 671, 378 - top); ctx.clip();
  faintCrest(ctx, t);
  whiteWord(ctx, a, THIS_KEYS, t, gain); whiteWord(ctx, b, IS_KEYS, t, gain);
  whiteWord(ctx, lines[1] ?? '', OUR_KEYS, t, gain); whiteWord(ctx, lines[2] ?? '', MOMENT_KEYS, t, gain);
  ctx.restore();
}

function emblem(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, variant: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  const sides = variant % 2 === 0 ? 6 : 3;
  for (let i = 0; i < sides; i++) {
    const a = Math.PI * 2 * i / sides - Math.PI / 2;
    const px = Math.cos(a) * radius;
    const py = Math.sin(a) * radius;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#eeefed';
  ctx.beginPath();
  ctx.moveTo(0, -radius * .55);
  ctx.lineTo(radius * .42, radius * .3);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function grid(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, o: GraphicOptions) {
  background(ctx, w, h, time, .5);
  const phase = cycle(time);
  const narrow = w / h < 1.3;
  const stack = narrow ? 1 : smooth((phase - 2) / .65) * (1 - smooth((phase - 4.8) / .65));
  const stackRatio = narrow ? mix(.34, .5, o.amount) : .43;
  const ratio = mix(.31, .61, o.amount);
  const titleW = mix(w * ratio, w, stack);
  const titleH = mix(h, h * stackRatio, stack);
  const panelX = mix(w * ratio, 0, stack);
  const panelY = mix(0, h * stackRatio, stack);
  const panelW = w - panelX;
  const panelH = h - panelY;
  const pad = Math.min(w, h) * .05;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, titleW, titleH); ctx.clip();
  const title = stack > .5 ? (narrow ? ['SWISS', 'STAGE'] : ['SWISS STAGE']) : ['ADVANCE', 'TO', 'SWISS', 'STAGE'];
  const gap = titleH * (narrow ? .31 : stack > .5 ? .45 : .17);
  const titleSize = Math.min(gap * .9, ...title.map(s => (titleW - pad * 2) / measureDisplay(s)));
  const startY = titleH * (narrow ? .44 : stack > .5 ? .65 : .25);
  title.forEach((s, i) => drawDisplay(ctx, s, pad, startY + i * gap - titleSize, titleSize, { fill: WHITE }));
  small(ctx, 'WORLDS 2026', pad, titleH * .08, Math.min(h * .022, titleH * .06));
  ctx.restore();
  ctx.fillStyle = '#eeefed'; ctx.fillRect(panelX, panelY, panelW, panelH);
  const strip = Math.max(2, Math.min(w, h) * .014);
  const stripe = ctx.createLinearGradient(panelX, panelY, panelX + panelW, panelY + panelH);
  stripe.addColorStop(0, '#9dfbe8'); stripe.addColorStop(.6, '#16cce0'); stripe.addColorStop(1, BLUE);
  ctx.fillStyle = stripe;
  if (stack > .5) ctx.fillRect(panelX, panelY, panelW, strip);
  else ctx.fillRect(panelX, panelY, strip, panelH);
  const items = ['Play-ins Winner', 'Top 4 Seeds', 'Regional Champion', 'Top 2 Seeds', 'Qualified Teams'];
  const rows = Math.round(mix(2, 5, o.detail));
  const rowH = panelH * .76 / rows;
  const left = panelX + pad * 1.1;
  const right = panelX + panelW - pad;
  for (let i = 0; i < rows; i++) {
    const y = panelY + panelH * .16 + rowH * i;
    ctx.strokeStyle = 'rgba(3,4,10,.35)'; ctx.lineWidth = Math.max(.5, h * .0012);
    ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
    const size = Math.min(rowH * .25, panelW * .043, h * .029);
    small(ctx, items[i], left, y + rowH * .54, size, INK);
    emblem(ctx, right - rowH * .23, y + rowH * .49, Math.min(rowH * .22, panelW * .055), i, INK);
  }
  small(ctx, 'QUALIFICATION / DEMO', left, panelY + panelH * .97, Math.min(h * .018, panelW * .027), '#62646c');
}

function ticker(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, o: GraphicOptions) {
  background(ctx, w, h, time, .5);
  const stripH = h * .075;
  const count = Math.round(mix(3, 8, o.detail));
  const unit = w / count;
  const laps = Math.round(mix(1, 12, o.amount));
  const offset = ((time / 6 * laps * unit) % unit + unit) % unit;
  for (let band = 0; band < 2; band++) {
    const y = band === 0 ? 0 : h - stripH;
    const fill = ctx.createLinearGradient(0, y, w, y);
    fill.addColorStop(0, '#a7ffee'); fill.addColorStop(.45, '#19c7ed'); fill.addColorStop(1, '#5565ff');
    ctx.fillStyle = fill; ctx.fillRect(0, y, w, stripH);
    ctx.save(); ctx.beginPath(); ctx.rect(0, y, w, stripH); ctx.clip();
    const shift = band === 0 ? -offset : offset;
    for (let i = -2; i <= count + 1; i++) {
      const cap = Math.min(stripH * .48, unit * .7 / measureDisplay('SWISS STAGE'));
      drawDisplay(ctx, 'SWISS STAGE', i * unit + shift + unit * .08, y + (stripH - cap) / 2, cap, { fill: INK });
      ctx.fillStyle = INK;
      ctx.fillRect(i * unit + shift + unit * .88, y + stripH * .45, stripH * .1, stripH * .1);
    }
    ctx.restore();
  }
  const main = phrase(o.text, ['SWISS', 'STAGE'], 2);
  const height = Math.min(h * .28, h * .61 / main.length);
  main.forEach((s, i) => {
    const size = Math.min(height * .88, w * .82 / measureDisplay(s));
    drawDisplay(ctx, s, w * .5, h * .5 - main.length * height / 2 + i * height + (height - size) / 2, size, { fill: WHITE, align: 'center' });
  });
  ctx.textAlign = 'left';
  small(ctx, 'OCTOBER / NOVEMBER', w * .055, h * .86, h * .019);
  if (o.detail > .65 && w > h * 1.2) {
    ctx.save(); ctx.translate(w - h * .035, h * .5); ctx.rotate(-Math.PI / 2);
    fitted(ctx, 'WORLD CHAMPIONSHIP', h * .65, h * .023);
    ctx.textAlign = 'center'; ctx.fillStyle = '#8a9bff'; ctx.fillText('WORLD CHAMPIONSHIP', 0, 0); ctx.restore();
  }
}

type Match = { x: number; y: number; teams: [number, number]; winner: number; round: number };

function bracket(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, o: GraphicOptions) {
  background(ctx, w, h, time, .45);
  const vertical = w < h * 1.1;
  const cardW = w * (vertical ? .205 : .235);
  const cardH = h * (vertical ? .09 : .112);
  const rowH = cardH / 2;
  const initial: Match[] = Array.from({ length: 4 }, (_, i) => ({
    x: vertical ? w * (.125 + i * .25) : w * .19,
    y: vertical ? h * .24 : h * (.235 + i * .19),
    teams: [i * 2 + 1, i * 2 + 2], winner: i * 2 + 1, round: 0,
  }));
  const semis: Match[] = [0, 1].map(i => ({
    x: vertical ? w * (.25 + i * .5) : w * .5,
    y: vertical ? h * .51 : h * (.33 + i * .38),
    teams: [i * 4 + 1, i * 4 + 3], winner: i * 4 + 1, round: 1,
  }));
  const final: Match = { x: vertical ? w * .5 : w * .81, y: vertical ? h * .77 : h * .52, teams: [1, 5], winner: 1, round: 2 };
  const progress = clamp(cycle(time) / 5.5 * mix(.95, 1.65, o.amount));
  const maxRound = o.detail < .15 ? 1 : 2;
  const groups = [initial, semis, [final]].slice(0, maxRound + 1);
  const stroke = Math.max(.65, Math.min(w, h) * .0016);
  for (let round = 0; round < groups.length - 1; round++) {
    const from = groups[round]; const to = groups[round + 1];
    from.forEach((node, i) => {
      const next = to[Math.floor(i / 2)];
      const active = progress > .19 + round * .31 + (i % 2) * .035;
      ctx.strokeStyle = active ? '#4e64ff' : '#40475d'; ctx.lineWidth = active ? stroke * 2 : stroke;
      ctx.beginPath();
      if (vertical) {
        const y1 = node.y + cardH / 2, y2 = next.y - cardH / 2;
        ctx.moveTo(node.x, y1); ctx.lineTo(node.x, (y1 + y2) / 2); ctx.lineTo(next.x, (y1 + y2) / 2); ctx.lineTo(next.x, y2);
      } else {
        const x1 = node.x + cardW / 2, x2 = next.x - cardW / 2;
        ctx.moveTo(x1, node.y); ctx.lineTo((x1 + x2) / 2, node.y); ctx.lineTo((x1 + x2) / 2, next.y); ctx.lineTo(x2, next.y);
      }
      ctx.stroke();
    });
  }
  groups.flat().forEach(node => {
    const left = node.x - cardW / 2, top = node.y - cardH / 2;
    const active = progress > .13 + node.round * .31;
    ctx.fillStyle = '#080d21'; ctx.fillRect(left, top, cardW, cardH);
    ctx.strokeStyle = active ? '#9aa7ed' : '#555d73'; ctx.lineWidth = stroke;
    ctx.strokeRect(left, top, cardW, cardH);
    ctx.beginPath(); ctx.moveTo(left, node.y); ctx.lineTo(left + cardW, node.y); ctx.stroke();
    node.teams.forEach((team, i) => {
      const winner = team === node.winner;
      const scoreW = cardW * .2;
      ctx.fillStyle = active && winner ? BLUE : '#1c2338';
      ctx.fillRect(left + cardW - scoreW, top + i * rowH, scoreW, rowH);
      const size = Math.min(cardW * .095, rowH * .42);
      small(ctx, `TEAM ${String(team).padStart(2, '0')}`, left + cardW * .07, top + rowH * (i + .65), size, active ? WHITE : '#8992ab');
      ctx.textAlign = 'center';
      small(ctx, active ? (winner ? '3' : '1') : '—', left + cardW - scoreW / 2, top + rowH * (i + .65), size, WHITE);
      ctx.textAlign = 'left';
    });
    if (o.detail > .45) small(ctx, ['QUARTERFINAL', 'SEMIFINAL', 'FINAL'][node.round], left, top - rowH * .23, Math.min(w * .016, h * .018), '#8c96ba');
  });
  fitted(ctx, 'ROAD TO THE FINAL', w * .8, h * .065);
  ctx.fillStyle = WHITE; ctx.fillText('ROAD TO THE FINAL', w * .055, h * .1);
  small(ctx, 'DEMO / 示例队伍', w * .055, h * .97, Math.min(h * .024, w * .032), '#a0abc6');
}

/** Pure frame renderer: arbitrary time, no timers, DOM access, or retained state. */
export function drawGraphicEffect(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, options: GraphicOptions): void {
  if (!(w > 0 && h > 0)) return;
  const o = { ...options, amount: clamp(options.amount), detail: clamp(options.detail) };
  const t = Number.isFinite(time) ? cycle(time) : 0;
  ctx.save();
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'miter'; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
  ctx.clearRect(0, 0, w, h);
  switch (o.effect) {
    case 'digital-type': digital(ctx, w, h, t, o); break;
    case 'date-detail': dateDetail(ctx, w, h, t, o); break;
    case 'faux-extrusion': extrusion(ctx, w, h, t, o); break;
    case 'responsive-grid': grid(ctx, w, h, t, o); break;
    case 'ticker': ticker(ctx, w, h, t, o); break;
    case 'bracket': bracket(ctx, w, h, t, o); break;
    default: background(ctx, w, h, t, .5);
  }
  ctx.restore();
}
