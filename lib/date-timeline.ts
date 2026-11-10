/**
 * Measured states from the user's 1280 × 576, 30 fps screen recording.
 * Frame numbers identify that recording, not the source motion project's frames.
 * The recording holds each visible state for 6–7 frames. Never interpolate
 * between recorded events when reproducing it. Alpha/mix thirds are estimates
 * from the captured pixels; unrecorded intermediate animation is unknown.
 */
export const DATE_FPS = 30;
export const DATE_START_FRAME = 51;
export const DATE_END_FRAME = 160;
export const DATE_TEXT = 'October 15 - November 14';
export const DATE_ROI = { x: 300, y: 328, width: 700, height: 88 } as const;
export const DATE_INK_BOUNDS = { x: 312, y: 341, width: 670, height: 61 } as const;
export const DATE_BLUE = [4, 42, 232] as const;
export const DATE_WHITE = [222, 223, 230] as const;
export const DATE_UPDATE_FRAMES = [64, 70, 77, 83, 89, 95, 102, 108, 114, 121, 127, 133, 139] as const;

type DateEvent = { frame: number; alpha: number; whiteMix: number };
export type DateGlyphTimeline = {
  index: number;
  char: string;
  /** Native recording pixel bounds, right/bottom exclusive; spaces have none. */
  bbox: readonly [number, number, number, number] | null;
  events: readonly DateEvent[];
};
export type DateCharacterState = {
  index: number;
  char: string;
  character: string;
  sourceFrame: number;
  phase: 'hidden' | 'blue' | 'white';
  sourcePhase: 'hidden' | 'blue' | 'blue_to_white' | 'white';
  alpha: number;
  opacity: number;
  whiteMix: number;
  /** Opaque rgb colour. Apply alpha separately, exactly once. */
  color: string;
  bbox: DateGlyphTimeline['bbox'];
};
export type DateTimingAdjustment = { amount?: number; detail?: number };

export const DATE_GLYPHS: readonly DateGlyphTimeline[] = [
  { index: 0, char: "O", bbox: [312, 341, 341, 402], events: [{ frame: 102, alpha: 1, whiteMix: 0 }, { frame: 133, alpha: 1, whiteMix: 1 }] },
  { index: 1, char: "c", bbox: [346, 352, 371, 402], events: [{ frame: 108, alpha: 1, whiteMix: 0 }, { frame: 139, alpha: 1, whiteMix: 1 }] },
  { index: 2, char: "t", bbox: [373, 341, 391, 402], events: [{ frame: 95, alpha: 1, whiteMix: 0 }, { frame: 102, alpha: 1, whiteMix: 1 / 3 }, { frame: 108, alpha: 1, whiteMix: 1 }] },
  { index: 3, char: "o", bbox: [394, 352, 419, 402], events: [{ frame: 70, alpha: 1, whiteMix: 0 }, { frame: 102, alpha: 1, whiteMix: 1 }] },
  { index: 4, char: "b", bbox: [424, 341, 449, 402], events: [{ frame: 83, alpha: 2 / 3, whiteMix: 0 }, { frame: 89, alpha: 1, whiteMix: 0 }, { frame: 95, alpha: 1, whiteMix: 2 / 3 }, { frame: 102, alpha: 1, whiteMix: 1 }] },
  { index: 5, char: "e", bbox: [453, 352, 478, 402], events: [{ frame: 64, alpha: 2 / 3, whiteMix: 0 }, { frame: 70, alpha: 1, whiteMix: 0 }, { frame: 114, alpha: 1, whiteMix: 1 }] },
  { index: 6, char: "r", bbox: [483, 352, 507, 402], events: [{ frame: 89, alpha: 1, whiteMix: 0 }, { frame: 114, alpha: 1, whiteMix: 1 }] },
  { index: 7, char: " ", bbox: null, events: [] },
  { index: 8, char: "1", bbox: [533, 341, 552, 402], events: [{ frame: 70, alpha: 1 / 3, whiteMix: 0 }, { frame: 77, alpha: 1, whiteMix: 0 }, { frame: 121, alpha: 1, whiteMix: 1 }] },
  { index: 9, char: "5", bbox: [563, 341, 592, 402], events: [{ frame: 77, alpha: 1, whiteMix: 0 }, { frame: 108, alpha: 1, whiteMix: 1 }] },
  { index: 10, char: " ", bbox: null, events: [] },
  { index: 11, char: "-", bbox: [613, 372, 627, 381], events: [{ frame: 102, alpha: 1 / 3, whiteMix: 0 }, { frame: 108, alpha: 1, whiteMix: 0 }, { frame: 114, alpha: 1, whiteMix: 1 }] },
  { index: 12, char: " ", bbox: null, events: [] },
  { index: 13, char: "N", bbox: [649, 341, 678, 402], events: [{ frame: 64, alpha: 1, whiteMix: 0 }, { frame: 95, alpha: 1, whiteMix: 1 }] },
  { index: 14, char: "o", bbox: [683, 352, 708, 402], events: [{ frame: 64, alpha: 1, whiteMix: 0 }, { frame: 114, alpha: 1, whiteMix: 1 }] },
  { index: 15, char: "v", bbox: [711, 353, 737, 402], events: [{ frame: 70, alpha: 1, whiteMix: 0 }, { frame: 127, alpha: 1, whiteMix: 1 }] },
  { index: 16, char: "e", bbox: [739, 352, 764, 402], events: [{ frame: 95, alpha: 2 / 3, whiteMix: 0 }, { frame: 102, alpha: 1, whiteMix: 0 }, { frame: 121, alpha: 1, whiteMix: 1 }] },
  { index: 17, char: "m", bbox: [769, 352, 809, 402], events: [{ frame: 83, alpha: 1, whiteMix: 0 }, { frame: 127, alpha: 1, whiteMix: 2 / 3 }, { frame: 133, alpha: 1, whiteMix: 1 }] },
  { index: 18, char: "b", bbox: [813, 341, 838, 402], events: [{ frame: 89, alpha: 1, whiteMix: 0 }, { frame: 114, alpha: 1, whiteMix: 1 / 3 }, { frame: 121, alpha: 1, whiteMix: 1 }] },
  { index: 19, char: "e", bbox: [843, 352, 868, 402], events: [{ frame: 89, alpha: 1, whiteMix: 0 }, { frame: 133, alpha: 1, whiteMix: 1 }] },
  { index: 20, char: "r", bbox: [872, 352, 896, 402], events: [{ frame: 95, alpha: 1, whiteMix: 0 }, { frame: 114, alpha: 1, whiteMix: 1 }] },
  { index: 21, char: " ", bbox: null, events: [] },
  { index: 22, char: "1", bbox: [923, 341, 942, 402], events: [{ frame: 89, alpha: 1, whiteMix: 0 }, { frame: 127, alpha: 1, whiteMix: 1 }] },
  { index: 23, char: "4", bbox: [951, 341, 982, 402], events: [{ frame: 108, alpha: 1, whiteMix: 1 }] },
];

/** A serializable evidence table for the archive's JSON export. */
export const DATE_TIMELINE = {
  source: {
    file: '8ebd65adb2e27827c2c737c2cb44cb70.mp4',
    type: 'user-uploaded-screen-recording',
    width: 1280, height: 576, fps: DATE_FPS, frameCount: 285,
    frameNumbering: 'zero-based recording frames',
    excludedOverlayFrames: [234, 284],
  },
  text: DATE_TEXT,
  startFrame: DATE_START_FRAME,
  endFrame: DATE_END_FRAME,
  firstVisibleFrame: 64,
  firstWhiteningFrame: 95,
  allWhiteFrame: 139,
  roi: DATE_ROI,
  updateFrames: DATE_UPDATE_FRAMES,
  palette: { blue: DATE_BLUE, white: DATE_WHITE },
  interpolation: 'hold',
  samplingNotes: [
    'The recording visibly updates in groups every 6 or 7 frames; unavailable intermediate source frames are not invented.',
    'Opacity and blue-to-white thirds are approximations measured from recorded pixels, not recovered source-project parameters.',
    'The final 4 first appears white in this recording; an unrecorded blue subframe cannot be ruled out.',
  ],
  observations: {
    visibleCharacters: 20,
    blueObservedCharacters: 19,
    last4FirstSeenWhite: true,
    repeatedDisappearanceObserved: false,
    whiteToBlueReversalObserved: false,
    intermediateAlphaAndMix: [0, 1 / 3, 2 / 3, 1],
  },
  characters: DATE_GLYPHS,
} as const;

const bounded = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

/** Clamp at F160; looping belongs to the player, never to this evidence module. */
export function dateSourceFrame(timeSeconds: number): number {
  const t = Number.isFinite(timeSeconds) ? Math.max(0, timeSeconds) : 0;
  return bounded(DATE_START_FRAME + Math.floor(t * DATE_FPS + 1e-7), DATE_START_FRAME, DATE_END_FRAME);
}

export function dateDemoTime(sourceFrame: number): number {
  const frame = Number.isFinite(sourceFrame) ? Math.round(sourceFrame) : DATE_START_FRAME;
  return (bounded(frame, DATE_START_FRAME, DATE_END_FRAME) - DATE_START_FRAME) / DATE_FPS;
}

/**
 * Returns exactly the last recorded state, including partial blue opacity and
 * mixed blue/white. Optional timing adjustments are study controls; defaults
 * amount=.7/detail=.5 leave every measured event frame unchanged.
 */
export function getDateStatesAtFrame(sourceFrame: number, adjustment: DateTimingAdjustment = {}): DateCharacterState[] {
  const frame = bounded(Math.floor(Number.isFinite(sourceFrame) ? sourceFrame : DATE_START_FRAME), 0, DATE_END_FRAME);
  const amount = bounded(adjustment.amount ?? .7, 0, 1);
  const detail = bounded(adjustment.detail ?? .5, 0, 1);
  const stagger = .55 + .9 * detail;
  const hold = .55 + (.45 / .7) * amount;
  return DATE_GLYPHS.map(glyph => {
    let alpha = 0, whiteMix = 0;
    const first = glyph.events[0]?.frame ?? DATE_END_FRAME;
    const entry = 64 + (first - 64) * stagger;
    for (const event of glyph.events) {
      const eventFrame = Math.round(entry + (event.frame - first) * hold);
      if (frame < eventFrame) break;
      alpha = event.alpha; whiteMix = event.whiteMix;
    }
    const sourcePhase = alpha === 0 ? 'hidden' : whiteMix === 1 ? 'white' : whiteMix > 0 ? 'blue_to_white' : 'blue';
    const phase = sourcePhase === 'blue_to_white' ? 'blue' : sourcePhase;
    const rgb = DATE_BLUE.map((channel, index) => Math.round(channel + (DATE_WHITE[index] - channel) * whiteMix));
    return {
      index: glyph.index, char: glyph.char, character: glyph.char,
      sourceFrame: frame, phase, sourcePhase, alpha, opacity: alpha, whiteMix,
      color: `rgb(${rgb.join(',')})`, bbox: glyph.bbox,
    };
  });
}

export function getDateCharacterStates(timeSeconds: number, adjustment: DateTimingAdjustment = {}): DateCharacterState[] {
  return getDateStatesAtFrame(dateSourceFrame(timeSeconds), adjustment);
}
