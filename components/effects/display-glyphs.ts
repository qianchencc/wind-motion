/**
 * A small geometric display alphabet drawn for these motion studies.
 * These are our own paths, not outlines extracted from a commercial font file.
 *
 * Reference measurements use the stable video frames 075, 083, 111, 115 and 147:
 * cap height = 1000; O width ≈ 480, side stems ≈ 205, counter ≈ 65;
 * I = 210, E/L ≈ 335, M = 670, W = 790. Rounded bowls have long straight
 * walls and tiny vertical counters. They are not compressed elliptical letters.
 * The date variant preserves case: its measured x-height is ≈ 0.82 of the cap,
 * with slightly more open counters. The headline variant normalizes to capitals.
 */

export type DisplayVariant = "headline" | "date";
export type DisplayOptions = {
  fill?: string;
  /** Horizontal spacing as a fraction of capHeight, not CSS pixels. */
  letterSpacing?: number;
  /** Exact total horizontal advance in pixels; useful for squashing animation. */
  width?: number;
  variant?: DisplayVariant;
  align?: "left" | "center" | "right";
  /** Index includes spaces. The character is the actual rendered character. */
  glyphFill?: (index: number, character: string) => string;
};

type Glyph = { width: number; path: string; fallback?: string };
type LayoutGlyph = { glyph: Glyph; x: number; index: number; character: string };
const CAP = 1000;
const g = (width: number, path: string): Glyph => ({ width, path });

// The compact squared bowls use quadratic corners, retaining flat tops and
// nearly vertical walls. Counters use even-odd filling and remain independently
// defined, so heavier strokes never accidentally seal their narrow openings.
const HEADLINE: Record<string, Glyph> = {
  A: g(500, "M0 1000L120 0H380L500 1000H305L284 805H216L195 1000ZM250 200L218 650H282Z"),
  B: g(480, "M0 0H330Q480 0 480 150V355Q480 450 395 480Q480 510 480 615V850Q480 1000 330 1000H0ZM205 160V375H240Q275 375 275 340V195Q275 160 240 160ZM205 550V840H240Q275 840 275 805V585Q275 550 240 550Z"),
  C: g(480, "M150 0H330Q480 0 480 150V350H275V195Q275 160 240 160Q205 160 205 195V805Q205 840 240 840Q275 840 275 805V650H480V850Q480 1000 330 1000H150Q0 1000 0 850V150Q0 0 150 0Z"),
  D: g(480, "M0 0H330Q480 0 480 150V850Q480 1000 330 1000H0ZM205 160V840H240Q275 840 275 805V195Q275 160 240 160Z"),
  E: g(335, "M0 0H335V160H205V420H325V580H205V840H335V1000H0Z"),
  F: g(325, "M0 0H325V160H205V420H320V580H205V1000H0Z"),
  G: g(480, "M150 0H330Q480 0 480 150V330H275V195Q275 160 240 160Q205 160 205 195V805Q205 840 240 840Q275 840 275 805V640H240V480H480V850Q480 1000 330 1000H150Q0 1000 0 850V150Q0 0 150 0Z"),
  H: g(480, "M0 0H205V410H275V0H480V1000H275V580H205V1000H0Z"),
  I: g(210, "M0 0H210V1000H0Z"),
  J: g(430, "M225 0H430V850Q430 1000 280 1000H150Q0 1000 0 850V650H170V805Q170 840 198 840Q225 840 225 805Z"),
  K: g(505, "M0 0H205V405L300 0H500L370 455L505 1000H295L205 590V1000H0Z"),
  L: g(335, "M0 0H205V840H335V1000H0Z"),
  // M keeps a narrow, long upper notch and small lower splits: the stable
  // source is ~86% ink, rather than the open diagonals of a normal bold M.
  M: g(670, "M0 1000V0H275L320 350L335 600L350 350L395 0H670V1000H480V350L395 1000H275L190 350V1000Z"),
  N: g(480, "M0 1000V0H190L310 600V0H480V1000H290L170 400V1000Z"),
  O: g(480, "M150 0H330Q480 0 480 150V850Q480 1000 330 1000H150Q0 1000 0 850V150Q0 0 150 0ZM208 193V807Q208 840 240 840Q273 840 273 807V193Q273 160 240 160Q208 160 208 193Z"),
  P: g(480, "M0 0H330Q480 0 480 150V475Q480 625 330 625H205V1000H0ZM205 160V465H240Q275 465 275 430V195Q275 160 240 160Z"),
  Q: g(500, "M150 0H330Q480 0 480 150V825Q480 920 425 963L500 1000H300L267 980H150Q0 980 0 830V150Q0 0 150 0ZM205 193V790Q205 825 240 825Q275 825 275 790V193Q275 160 240 160Q205 160 205 193Z"),
  // The reference R has a nearly vertical right leg and a rounded shoulder;
  // its lower opening is a thin slot, not a wide triangular diagonal cut.
  R: g(480, "M0 1000V0H330Q480 0 480 150V350Q480 445 395 480Q480 510 480 625V1000H275V625Q275 585 240 585H205V1000ZM205 160V400H240Q275 400 275 365V195Q275 160 240 160Z"),
  S: g(480, "M150 0H330Q480 0 480 150V330H275V195Q275 160 240 160Q205 160 205 195V280Q205 315 250 345L390 440Q480 500 480 625V850Q480 1000 330 1000H150Q0 1000 0 850V665H205V805Q205 840 240 840Q275 840 275 805V720Q275 680 230 650L90 555Q0 495 0 370V150Q0 0 150 0Z"),
  T: g(400, "M0 0H400V160H305V1000H95V160H0Z"),
  U: g(480, "M0 0H205V805Q205 840 240 840Q275 840 275 805V0H480V850Q480 1000 330 1000H150Q0 1000 0 850Z"),
  V: g(500, "M0 0H200L250 650L300 0H500L310 1000H190Z"),
  W: g(790, "M0 0H200L255 650L295 0H495L535 650L590 0H790L675 1000H465L395 455L325 1000H115Z"),
  X: g(500, "M0 0H205L250 305L295 0H500L365 470L500 1000H295L250 650L205 1000H0L135 470Z"),
  Y: g(500, "M0 0H205L250 430L295 0H500L355 620V1000H145V620Z"),
  Z: g(480, "M0 0H480V155L205 840H480V1000H0V845L275 160H0Z"),
  "0": g(480, "M150 0H330Q480 0 480 150V850Q480 1000 330 1000H150Q0 1000 0 850V150Q0 0 150 0ZM205 195V805Q205 840 240 840Q275 840 275 805V195Q275 160 240 160Q205 160 205 195Z"),
  "1": g(330, "M0 100Q110 90 135 0H330V1000H120V220H0Z"),
  "2": g(480, "M150 0H330Q480 0 480 150V315Q480 405 435 505L215 840H480V1000H0V845L250 410Q275 365 275 315V195Q275 160 240 160Q205 160 205 195V330H0V150Q0 0 150 0Z"),
  "3": g(480, "M150 0H330Q480 0 480 150V355Q480 455 395 480Q480 515 480 615V850Q480 1000 330 1000H150Q0 1000 0 850V680H205V805Q205 840 240 840Q275 840 275 805V610Q275 575 240 575H155V415H240Q275 415 275 380V195Q275 160 240 160Q205 160 205 195V320H0V150Q0 0 150 0Z"),
  "4": g(510, "M260 0H455V650H510V810H455V1000H250V810H0V650ZM250 280L155 650H250Z"),
  "5": g(480, "M0 0H480V160H205V385Q245 350 325 350Q480 350 480 510V850Q480 1000 330 1000H150Q0 1000 0 850V690H205V805Q205 840 240 840Q275 840 275 805V545Q275 510 240 510Q205 510 205 545V590H0Z"),
  "6": g(480, "M150 0H330Q480 0 480 150V315H275V195Q275 160 240 160Q205 160 205 195V410Q250 370 330 370Q480 370 480 520V850Q480 1000 330 1000H150Q0 1000 0 850V150Q0 0 150 0ZM205 565V805Q205 840 240 840Q275 840 275 805V565Q275 530 240 530Q205 530 205 565Z"),
  "7": g(450, "M0 0H450V155L220 1000H10L245 160H0Z"),
  "8": g(480, "M150 0H330Q480 0 480 150V350Q480 440 400 480Q480 515 480 615V850Q480 1000 330 1000H150Q0 1000 0 850V615Q0 515 80 480Q0 440 0 350V150Q0 0 150 0ZM205 195V350Q205 385 240 385Q275 385 275 350V195Q275 160 240 160Q205 160 205 195ZM205 585V805Q205 840 240 840Q275 840 275 805V585Q275 550 240 550Q205 550 205 585Z"),
  "9": g(480, "M150 0H330Q480 0 480 150V850Q480 1000 330 1000H150Q0 1000 0 850V685H205V805Q205 840 240 840Q275 840 275 805V590Q230 630 150 630Q0 630 0 480V150Q0 0 150 0ZM205 195V435Q205 470 240 470Q275 470 275 435V195Q275 160 240 160Q205 160 205 195Z"),
  ".": g(160, "M0 840H160V1000H0Z"),
  "-": g(210, "M0 500H210V660H0Z"),
  ":": g(160, "M0 260H160V420H0ZM0 700H160V860H0Z"),
  "/": g(370, "M210 0H370L160 1000H0Z"),
  "?": g(480, "M150 0H330Q480 0 480 150V320Q480 390 430 450L320 580V700H115V550L240 385Q275 345 275 305V195Q275 160 240 160Q205 160 205 195V320H0V150Q0 0 150 0ZM115 810H320V1000H115Z"),
  " ": g(200, ""),
};

// Date numerals and capitals use the same construction, with counters opened
// slightly. Lowercase x-height starts at y=180; ascenders still reach y=0.
const DATE: Record<string, Glyph> = {
  O: g(480, "M145 0H335Q480 0 480 145V855Q480 1000 335 1000H145Q0 1000 0 855V145Q0 0 145 0ZM190 195V805Q190 845 240 845Q290 845 290 805V195Q290 155 240 155Q190 155 190 195Z"),
  N: g(480, "M0 1000V0H180L315 630V0H480V1000H300L165 375V1000Z"),
  b: g(410, "M0 0H175V215Q215 180 280 180Q410 180 410 310V870Q410 1000 280 1000Q205 1000 170 960V1000H0ZM175 350V830Q175 865 205 865Q235 865 235 830V350Q235 315 205 315Q175 315 175 350Z"),
  c: g(410, "M130 180H280Q410 180 410 310V465H235V350Q235 315 205 315Q175 315 175 350V830Q175 865 205 865Q235 865 235 830V715H410V870Q410 1000 280 1000H130Q0 1000 0 870V310Q0 180 130 180Z"),
  e: g(410, "M130 180H280Q410 180 410 310V650H175V830Q175 865 205 865Q235 865 235 830V760H410V870Q410 1000 280 1000H130Q0 1000 0 870V310Q0 180 130 180ZM175 350V510H235V350Q235 315 205 315Q175 315 175 350Z"),
  m: g(660, "M0 1000V180H170V220Q210 180 270 180Q350 180 390 225Q440 180 520 180Q660 180 660 315V1000H490V350Q490 315 460 315Q430 315 430 350V1000H260V350Q260 315 230 315Q200 315 200 350V1000Z"),
  n: g(410, "M0 1000V180H170V220Q215 180 280 180Q410 180 410 315V1000H235V350Q235 315 205 315Q175 315 175 350V1000Z"),
  o: g(410, "M130 180H280Q410 180 410 310V870Q410 1000 280 1000H130Q0 1000 0 870V310Q0 180 130 180ZM175 350V830Q175 865 205 865Q235 865 235 830V350Q235 315 205 315Q175 315 175 350Z"),
  r: g(380, "M0 1000V180H170V230Q225 170 300 180H380V365H270Q175 365 175 455V1000Z"),
  t: g(310, "M70 0H245V180H310V315H245V815Q245 865 285 865H310V1000H200Q70 1000 70 870V315H0V180H70Z"),
  v: g(430, "M0 180H175L215 745L255 180H430L310 1000H120Z"),
  "0": g(465, "M140 0H325Q465 0 465 140V860Q465 1000 325 1000H140Q0 1000 0 860V140Q0 0 140 0ZM185 195V805Q185 845 232 845Q280 845 280 805V195Q280 155 232 155Q185 155 185 195Z"),
  "1": g(310, "M0 110Q100 90 125 0H310V1000H115V230H0Z"),
  "4": g(510, "M260 0H450V650H510V805H450V1000H255V805H0V650ZM255 270L150 650H255Z"),
  "5": g(465, "M0 0H465V155H190V390Q235 350 320 350Q465 350 465 505V855Q465 1000 325 1000H140Q0 1000 0 855V695H185V805Q185 845 232 845Q280 845 280 805V550Q280 510 232 510Q190 510 190 550V590H0Z"),
  "-": g(180, "M0 570H180V695H0Z"),
  " ": g(290, ""),
};

// These pairs need optical overlap because their upper and lower silhouettes
// occupy different places. Do not compress every glyph to imitate condensation.
const KERN: Record<string, number> = {
  AY: -70, AT: -55, AV: -45, AW: -35, "Y-": -70, YA: -60,
  TA: -65, TO: -15, TY: -30, LT: -35, LY: -40, LA: -10,
  VA: -45, WA: -35, YO: -20, "Y.": -55, "T.": -40,
};
const PATHS = new Map<string, Path2D>();
const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\u3000-\u303f\uff01-\uff60]/u;

function fallbackGlyph(character: string): Glyph {
  return { width: CJK.test(character) ? CAP : CAP * .6, path: "", fallback: character };
}

// Custom text outside the study alphabet remains usable. Fit the browser font's
// actual ink box into the reserved cell instead of relying on its em/baseline.
function drawFallback(ctx: CanvasRenderingContext2D, glyph: Glyph) {
  const character = glyph.fallback!;
  ctx.font = '700 1000px "Noto Sans CJK SC", "Noto Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const metrics = ctx.measureText(character);
  const left = metrics.actualBoundingBoxLeft ?? 0;
  const right = metrics.actualBoundingBoxRight ?? metrics.width;
  const ascent = metrics.actualBoundingBoxAscent || CAP * .8;
  const descent = metrics.actualBoundingBoxDescent || 0;
  ctx.scale(glyph.width / Math.max(1, left + right), CAP / Math.max(1, ascent + descent));
  ctx.fillText(character, left, ascent);
}

function prepare(text: string, options: DisplayOptions) {
  const variant = options.variant ?? "headline";
  const line = text.replace(/[\r\n\t]/g, " ");
  return { variant, characters: Array.from(variant === "date" ? line : line.toUpperCase()) };
}

function layout(text: string, options: DisplayOptions): { glyphs: LayoutGlyph[]; width: number } {
  const { variant, characters } = prepare(text, options);
  const spacing = (options.letterSpacing ?? (variant === "date" ? .065 : .045)) * CAP;
  let cursor = 0;
  const glyphs = characters.map((character, index) => {
    const glyph = (variant === "date" && DATE[character]) || HEADLINE[character] || fallbackGlyph(character);
    if (index) cursor += spacing + (variant === "headline" ? KERN[characters[index - 1] + character] ?? 0 : 0);
    const entry = { glyph, x: cursor, index, character };
    cursor += glyph.width;
    return entry;
  });
  return { glyphs, width: cursor };
}

/** Natural single-line advance in cap-height units. Multiply by capHeight for px. */
export function measureDisplay(text: string, options: Pick<DisplayOptions, "letterSpacing" | "variant"> = {}): number {
  return layout(text, options).width / CAP;
}

/**
 * Draw one line with its capital top at y. x is the left edge unless align is set.
 * capHeight is the actual capital height, not a font em size. Returns drawn width.
 * Date lowercase shares the same baseline and begins 0.18 * capHeight below y.
 */
export function drawDisplay(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, capHeight: number, options: DisplayOptions = {}): number {
  if (!(capHeight > 0)) return 0;
  const result = layout(text, options);
  if (!(result.width > 0)) return 0;
  const width = options.width ?? result.width / CAP * capHeight;
  if (!(width > 0)) return 0;
  const offset = options.align === "center" ? width / 2 : options.align === "right" ? width : 0;
  ctx.save();
  ctx.translate(x - offset, y);
  ctx.scale(width / result.width, capHeight / CAP);
  for (const { glyph, x: left, index, character } of result.glyphs) {
    if (!glyph.path && !glyph.fallback) continue;
    ctx.save();
    ctx.translate(left, 0);
    ctx.fillStyle = options.glyphFill?.(index, character) ?? options.fill ?? "#f1f2ed";
    if (glyph.fallback) {
      drawFallback(ctx, glyph);
      ctx.restore();
      continue;
    }
    let path = PATHS.get(glyph.path);
    if (!path) {
      path = new Path2D(glyph.path);
      PATHS.set(glyph.path, path);
    }
    ctx.fill(path, "evenodd");
    ctx.restore();
  }
  ctx.restore();
  return width;
}

/** Convenience wrapper for an exact pixel rectangle; x/y denote its top left. */
export function drawDisplayText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, height: number, options: Omit<DisplayOptions, "width" | "align"> = {}): number {
  return drawDisplay(ctx, text, x, y, height, { ...options, width, align: "left" });
}
