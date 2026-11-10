import { drawDisplay, measureDisplay } from './display-glyphs';

export type LightOptions = {
  effect: string;
  amount: number;
  detail: number;
  text?: string;
};

type Point = readonly [number, number];
type LightState = { ctx: CanvasRenderingContext2D; w: number; h: number; t: number; a: number; d: number; unit: number };
const TAU = Math.PI * 2;
const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const fract = (v: number) => v - Math.floor(v);
const blue = (a: number) => `rgba(35,60,255,${clamp(a)})`;
const white = (a: number) => `rgba(225,242,255,${clamp(a)})`;
// t is one normalized six-second cycle. Open beams fully leave the path before
// re-entering, so their own phase offsets also wrap without a visible cut.
const openSweep = (t: number, span: number, offset = 0) => fract(t + offset) * (1 + span + .16) - .08;

function polygon(ctx: CanvasRenderingContext2D, points: readonly Point[], close = true) {
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  if (close) ctx.closePath();
}

function scaled(points: readonly Point[], w: number, h: number): Point[] {
  return points.map(([x, y]) => [x * w, y * h]);
}

function glow(s: LightState, x: number, y: number, rx: number, ry: number, opacity: number, core = false) {
  const { ctx } = s;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(Math.max(1, rx), Math.max(1, ry));
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  g.addColorStop(0, core ? white(opacity * .68) : blue(opacity));
  g.addColorStop(.13, blue(opacity * .8));
  g.addColorStop(.4, blue(opacity * .28));
  g.addColorStop(1, blue(0));
  ctx.fillStyle = g;
  ctx.fillRect(-1, -1, 2, 2);
  ctx.restore();
}

function sampler(points: readonly Point[], close = false) {
  const ps = close ? [...points, points[0]] : points;
  const ends = [0];
  for (let i = 1; i < ps.length; i++) ends.push(ends[i - 1] + Math.hypot(ps[i][0] - ps[i - 1][0], ps[i][1] - ps[i - 1][1]));
  const length = ends[ends.length - 1];
  return (position: number): Point => {
    const distance = (close ? fract(position) : clamp(position)) * length;
    let i = 1;
    while (i < ends.length - 1 && ends[i] < distance) i++;
    const u = (distance - ends[i - 1]) / Math.max(.001, ends[i] - ends[i - 1]);
    return [ps[i - 1][0] + (ps[i][0] - ps[i - 1][0]) * u, ps[i - 1][1] + (ps[i][1] - ps[i - 1][1]) * u];
  };
}

// Moving energy is evaluated along arc length. A short white core rides on a
// longer blue tail; this approximates glancing light, not a uniform neon outline.
function beam(s: LightState, points: readonly Point[], head: number, span: number, power: number, close = false, thickness = 1) {
  const { ctx, unit } = s;
  const at = sampler(points, close);
  const count = 80;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  // Adjacent round caps accumulate in screen blending and form beads. Butt caps
  // meet without additive overlap; dense arc-length samples keep the light smooth.
  ctx.lineCap = "butt";
  for (let i = 0; i < count; i++) {
    const u = i / count;
    const p = head - span + u * span;
    if (!close && (p < 0 || p > 1)) continue;
    const v = Math.sin(Math.PI * u) ** 1.6;
    const hot = Math.exp(-(((u - .7) / .17) ** 2));
    const a = at(p);
    const b = at(p + span / count);
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.strokeStyle = blue(v * power * .15);
    ctx.lineWidth = Math.max(2, unit * 13 * thickness);
    ctx.stroke();
    ctx.strokeStyle = blue(v * power * .45);
    ctx.lineWidth = Math.max(1.2, unit * 4.2 * thickness);
    ctx.stroke();
    ctx.strokeStyle = white(hot * power * .92);
    ctx.lineWidth = Math.max(.6, unit * .95 * thickness);
    ctx.stroke();
  }
  ctx.restore();
}

function border(s: LightState, gain = 1) {
  const { ctx, w, h, t, a, d, unit } = s;
  const inset = Math.max(1, unit * 2.3);
  const points: Point[] = [[inset, inset], [w - inset, inset], [w - inset, h - inset], [inset, h - inset]];
  const at = sampler(points, true);
  const travel = fract(t + .19);
  const span = .20 + d * .19;
  ctx.save();
  polygon(ctx, points);
  ctx.strokeStyle = blue(.15 * gain);
  ctx.lineWidth = unit * .8;
  ctx.stroke();
  ctx.globalCompositeOperation = "screen";
  for (const phase of [travel - span * .3, travel + .48]) {
    const p = at(phase);
    const nearVertical = p[0] < inset + 1 || p[0] > w - inset - 1;
    glow(s, p[0], p[1], nearVertical ? w * .13 : w * .32, nearVertical ? h * .5 : h * .16, a * .38 * gain);
  }
  beam(s, points, travel, span, a * gain, true, .75 + d * .4);
  beam(s, points, travel + .49, span * .77, a * gain * .6, true, .8);
  ctx.restore();
}

function crest(s: LightState) {
  const { ctx, w, h, t, a, d, unit } = s;
  const size = Math.min(w * .39, h * .67);
  const x = w * .5, y = h * .49;
  // Original split-ridge crest. It deliberately does not reproduce Riot's mark.
  const outer: Point[] = [[0, -.5], [.14, -.31], [.29, -.4], [.27, -.24], [.44, -.24], [.38, .13], [.21, .33], [0, .52], [-.21, .33], [-.38, .13], [-.44, -.24], [-.27, -.24], [-.29, -.4], [-.14, -.31]];
  const map = (ps: readonly Point[]) => ps.map(([u, v]) => [x + u * size, y + v * size] as Point);
  const frame = map(outer);
  glow(s, x, y, size * .74, size * .68, .1 * a);
  polygon(ctx, frame);
  const ink = ctx.createLinearGradient(x - size * .5, y, x + size * .4, y + size * .3);
  ink.addColorStop(0, "#080b27"); ink.addColorStop(.46, "#02030b"); ink.addColorStop(1, "#080925");
  ctx.fillStyle = ink;
  ctx.fill();
  ctx.strokeStyle = blue(.48);
  ctx.lineWidth = Math.max(1.5, size * .013);
  ctx.lineJoin = "miter";
  ctx.stroke();
  const facets: Point[][] = [
    [[0, -.31], [-.19, .12], [0, .03], [.19, .12], [0, -.31]],
    [[-.19, .12], [0, .38], [0, .03]],
    [[.19, .12], [0, .38], [0, .03]],
    [[-.32, -.15], [-.24, .13], [-.14, .23]],
    [[.32, -.15], [.24, .13], [.14, .23]],
  ];
  facets.forEach((p, i) => {
    const facet = map(p);
    polygon(ctx, facet, i < 3);
    ctx.fillStyle = i === 2 ? "#0b102e" : "#040713";
    if (i < 3) ctx.fill();
    ctx.strokeStyle = blue(.37);
    ctx.lineWidth = Math.max(.8, unit * 1.8);
    ctx.stroke();
    const span = .3 + d * .3;
    beam(s, facet, openSweep(t, span, i * .23), span, a * (i < 3 ? .96 : .42));
  });
  beam(s, frame, t + .22, .18 + d * .22, a, true, 1.2);
  const tip = sampler(frame, true)(t + .22 - .08);
  glow(s, tip[0], tip[1], size * .13, size * .13, a * .35);
  border(s, .33);
}

function faceted(s: LightState) {
  const { ctx, w, h, t, a, d, unit } = s;
  const r = Math.min(w * .38, h * .48);
  const cx = w * .51, cy = h * .53;
  const rotation = -.25 + Math.sin(TAU * t) * .055;
  const hub: Point = [cx - r * .09, cy + r * .04];
  const points: Point[] = Array.from({ length: 14 }, (_, i) => {
    const angle = i / 14 * TAU + rotation;
    const radius = r * (i % 2 ? .3 + .09 * Math.sin(i * 2.3) : .86 + .12 * Math.sin(i * 1.8));
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius * .87];
  });
  glow(s, cx - r * .3, cy + r * .3, r * 1.2, r * .9, a * .13);
  points.forEach((p, i) => {
    const q = points[(i + 1) % points.length];
    const light = .5 + .5 * Math.cos(TAU * t - i * .7);
    const fill = ctx.createLinearGradient(p[0], p[1], hub[0], hub[1]);
    fill.addColorStop(0, `rgb(${3 + light * 3},${5 + light * 5},${17 + light * 20})`);
    fill.addColorStop(.25, "#03040d"); fill.addColorStop(1, i % 2 ? "#06081d" : "#02030a");
    polygon(ctx, [hub, p, q]); ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = blue(.055); ctx.lineWidth = unit * .6; ctx.stroke();
    const reflection = Math.max(0, Math.cos(TAU * t - i * .9)) ** 7;
    if (reflection > .018) {
      const path: Point[] = [q, p, hub];
      const span = .3 + d * .2;
      const head = openSweep(t, span, i * .14);
      beam(s, path, head, span, reflection * a * 1.05, false, .68);
      const hotPosition = head - span * .3;
      const fade = clamp(hotPosition / .08) * clamp((1 - hotPosition) / .08);
      const pLight = sampler(path)(hotPosition);
      glow(s, pLight[0], pLight[1], r * .13, r * .09, reflection * a * .24 * fade);
    }
  });
  // Broad, low-opacity reflections make the edge read as a solid folded surface.
  const reflectionAxis = TAU * t;
  for (let i = 0; i < 3; i++) {
    const p = points[(i * 4 + 2) % 14];
    const strength = Math.max(0, Math.cos(reflectionAxis + i * 2.1)) ** 5;
    const g = ctx.createLinearGradient(p[0], p[1], hub[0], hub[1]);
    g.addColorStop(0, blue(strength * a * .45));
    g.addColorStop(.15, blue(strength * a * .13)); g.addColorStop(.8, blue(0));
    polygon(ctx, [p, [hub[0] + r * .04, hub[1]], [hub[0], hub[1] + r * .035]]);
    ctx.fillStyle = g; ctx.fill();
  }
}

function cubic(a: Point, b: Point, c: Point, d: Point, count = 48): Point[] {
  return Array.from({ length: count + 1 }, (_, i) => {
    const u = i / count, v = 1 - u;
    return [v ** 3 * a[0] + 3 * v ** 2 * u * b[0] + 3 * v * u ** 2 * c[0] + u ** 3 * d[0], v ** 3 * a[1] + 3 * v ** 2 * u * b[1] + 3 * v * u ** 2 * c[1] + u ** 3 * d[1]];
  });
}

function horizon(s: LightState, hero = false) {
  const { ctx, w, h, t, a, d, unit } = s;
  const horizonY = hero ? .59 : .45;
  const shift = horizonY - .45;
  const p = (x: number, y: number): Point => [x * w, (y + shift) * h];
  const center = .5 + Math.sin(TAU * t) * .045;
  // A compressed luminous horizon plus black foreground, rather than a full-frame bloom.
  glow(s, w * center, h * (horizonY - .035), w * .67, h * .28, a * .9);
  const ground = ctx.createLinearGradient(0, h * horizonY, 0, h);
  ground.addColorStop(0, "#02051c"); ground.addColorStop(.22, "#02030e"); ground.addColorStop(1, "#010208");
  polygon(ctx, [p(0, .486), p(.25, .455), p(.5, .448), p(.77, .463), p(1, .485), [w, h], [0, h]]);
  ctx.fillStyle = ground; ctx.fill();
  const far = cubic(p(-.04, .5), p(.27, .434), p(.69, .437), p(1.04, .5));
  beam(s, far, .76 + Math.sin(TAU * t) * .12, .55 + d * .15, a * .9, false, .56);
  glow(s, w * center, h * (horizonY + .004), w * .3, h * .027, a * .95, true);
  const bands: { top: Point[]; depth: number; power: number }[] = [
    { top: cubic(p(-.12, .74), p(.2, .54), p(.57, .44), p(1.1, .73)), depth: .12, power: .74 },
    { top: cubic(p(-.12, .92), p(.24, .53), p(.67, .53), p(1.16, .91)), depth: .16, power: .6 },
  ];
  bands.forEach(({ top, depth, power }, i) => {
    const lower = top.map(([x, y]) => [x, y + h * depth] as Point).reverse();
    polygon(ctx, [...top, ...lower]);
    const face = ctx.createLinearGradient(0, h * (.56 + shift), 0, h * (.87 + shift));
    face.addColorStop(0, "#060d4a"); face.addColorStop(.16, "#02092b"); face.addColorStop(.53, "#010416"); face.addColorStop(1, "#010208");
    ctx.fillStyle = face; ctx.fill();
    polygon(ctx, top, false); ctx.lineWidth = unit * .65; ctx.strokeStyle = blue(.24 * a); ctx.stroke();
    beam(s, top, .6 + Math.sin(TAU * t + i * 1.7) * .29, .4 + d * .25, a * power, false, .8);
  });
  const fold = scaled([[.04, 1.08 + shift], [.22, .78 + shift], [.48, .85 + shift], [.77, .77 + shift], [.95, 1.1 + shift]], w, h);
  polygon(ctx, [...fold, [w, h * 1.3], [0, h * 1.3]]);
  const front = ctx.createLinearGradient(0, h * (.79 + shift), 0, h * (1.12 + shift));
  front.addColorStop(0, "#040a38"); front.addColorStop(.32, "#010515"); front.addColorStop(1, "#010208");
  ctx.fillStyle = front; ctx.fill();
  beam(s, fold, .85 + Math.sin(TAU * t) * .21, .69, a * .96, false, 1 + d * .35);
  // A triangular specular reflection reveals the bend without adding a new object.
  const reflection = ctx.createLinearGradient(w * .18, 0, w * .52, 0);
  reflection.addColorStop(0, blue(0)); reflection.addColorStop(.89, blue(a * .22)); reflection.addColorStop(1, blue(a * .5));
  polygon(ctx, [p(.16, .616), p(.49, .521), p(.49, .641)]);
  ctx.fillStyle = reflection; ctx.fill();
}

function heroText(s: LightState, text: string | undefined) {
  if (text === "") return;
  const { ctx, w, h } = s;
  const lines = (text ?? "THIS IS\nOUR MOMENT").split("\n").slice(0, 3);
  const capHeight = Math.min(h * .158, w * .105);
  ctx.save();
  lines.forEach((line, i) => {
    const width = Math.min(w * .76, measureDisplay(line) * capHeight);
    drawDisplay(ctx, line, (w - width) / 2, h * .14 + i * capHeight * 1.04,
      capHeight, { width, fill: '#f3f3ef' });
  });
  ctx.restore();
}

/** Stateless Canvas2D studies of the observed light mechanisms, not production
 * shaders or copied brand assets. `time` is in seconds; all motion loops every six
 * seconds and stays seekable when driven by either a timeline or a live clock. */
export function drawLightEffect(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, options: LightOptions): void {
  if (!(w > 0 && h > 0)) return;
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash([]);
  ctx.fillStyle = "#03040a";
  ctx.fillRect(0, 0, w, h);
  const s: LightState = { ctx, w, h, t: Number.isFinite(time) ? fract(time / 6) : 0, a: clamp(options.amount), d: clamp(options.detail), unit: Math.max(.5, Math.min(w / 1000, h / 560)) };
  switch (options.effect) {
    case "crest-sweep": crest(s); break;
    case "faceted-rim": faceted(s); break;
    case "horizon": horizon(s); break;
    case "hero": horizon(s, true); border(s, .86); heroText(s, options.text); break;
    default: border(s);
  }
  ctx.restore();
}
