# 风起 · 动态设计档案馆

An interactive visual archive based on Rofix's video **英雄联盟 S16 世界赛 视觉设计包装解析**.

## Included

- 3 core studies: Border Beam, blue-to-white digital type reveal, faux 3D extrusion.
- 6 applications: crest sweep, faceted rim light, luminous horizon, responsive information grid, stage ticker, tournament bracket.
- Reference video stills, approximate timestamps, observations, independent implementation steps and recorded differences.
- Side-by-side / overlay comparison, a six-second timeline, replay, pause, speed, two parameters per experiment, editable type, PNG export, JSON archive export.
- Landscape, square and portrait formats for the responsive grid.
- 2022 type and textile references, explicitly excluded from the nine reproduced experiments.

## Sources and provenance

- Video: https://xhslink.cn/o/5fOze671fxv
- BUCK background case: https://buck.co/work/riot-games-world-championships
- Official 2026 theme: https://lolesports.com/en-GB/news/worlds-2026-primer

The video is the direct visual reference. The BUCK webpage describes its 2025 seasonal expression and long-term grid system; it is not presented as proof of every 2026 shot. The grouping into three core studies is this archive's analysis. Observation positions are recorded in `research/frame-index.json` and are approximate, not frame-exact edit boundaries. Reference stills remain attributed to the source. No original production files were obtained.

Our renderers are independently authored Canvas 2D approximations. The title lettering now uses hand-authored vector glyphs whose cap height, narrow counters, stroke weight and spacing were checked against the video. It does not use or redistribute the Compacta font software. The date lettering preserves the reference's mixed case. Compacta, Parabolica, Manuka and Fraktion font files are not bundled; Open Sans Condensed remains a fallback for unsupported editable text. Its licensing information is in `public/fonts/LICENSE.txt`. The crest is an original study shape. Real cloth simulation, original 3D assets and exact compositing/color-management reconstruction are outside this version.

## Typography correction

The original implementation misread the typography. It used a light condensed font, a generic two-line slogan for digital reveal, and shaded blue extruded side faces. The correction uses additional slow-play browser observations of the actual video:

- **Digital reveal, approximately 111.6–116.9 seconds:** the headline is `LOLESPORTS.COM`; the secondary line is `October 15 - November 14`, with smaller lowercase letters. Date characters appear in scattered blue groups at fixed positions and independently settle to white. The reference cuts to an already-white headline, so a speculative headline blue flash is not represented as an observed event.
- **Faux extrusion, approximately 149.9–152.5 seconds:** `THIS` and `IS`, then `OUR`, then `MOMENT` enter with exaggerated white shapes, position and scale. The last line extends outside the lower and side boundaries before shrinking into the three-line lockup. There are no blue shaded letter side faces in this reference sequence.
- Both typography workbenches have six paired full-scene reference stages. Selecting a stage changes the source image and reconstructed time together, and pauses at that comparison. Playing, scrubbing or changing parameters in these still-image comparisons enters a clearly labelled free experiment state. In the date inspector, playback and frame stepping keep both moving sides synchronized; changing effect parameters is labelled separately.

Capture timestamps are approximate browser playback positions, not recovered source frame timecodes. Selected stills retain the video's Chinese narration subtitles. The recreation does not copy narration subtitles. The independently drawn glyph shapes and interpolated curves still have differences from the original font and animation.

### Date appearance: frame-by-frame correction

A subsequently supplied 1280 × 576 screen recording contains 285 frames at 30 fps. The date was decoded and examined frame by frame. The archived comparison includes only its 700 × 88 date crop, recording frames 51–160, stored losslessly in `public/references/date-frames.webp` with matching metadata. This is a recording frame clock, not the original production frame rate. Its reference remains on frame 160 for the rest of the six-second experiment loop.

The target string has 24 character positions, including four spaces. The 20 visible glyphs retain fixed positions and identities. No random character substitution, repeated disappearance, or white-to-blue reversal was observed. There are thirteen recorded update groups:

`64, 70, 77, 83, 89, 95, 102, 108, 114, 121, 127, 133, 139`.

At F64, October's `e` and November's `No` appear first. F95 begins the white transition while the leading `O` and `c` are still hidden. The final `4` is first visible already white at F108. The entire date is white at F139. Nineteen glyphs have an observed blue phase; an unrecorded blue subframe for `4` is not invented. Recorded intermediate levels include approximately one-third and two-thirds opacity and blue-to-white mixing. The reconstruction therefore uses independent `alpha` and `whiteMix` tracks, with recorded holds between update groups, rather than a universal hidden/blue/white delay rule.

The date inspector displays the actual crop and reconstructed lettering at the same recording frame, supports single-frame stepping, and shows the current state of every character. The complete index export includes the reusable event table. Full-scene browser stills remain contextual references, with their own approximate source timestamps.

## Source structure

- `components/archive.tsx`: catalogue, workbench, controls and exports.
- `components/date-inspector.tsx`: synchronized date crop, reconstruction and per-character state inspection.
- `components/effect-canvas.tsx`: responsive Canvas lifecycle and animation scheduling.
- `components/effects/light-effects.ts`: light and material renderers.
- `components/effects/graphic-effects.ts`: typography and information-system renderers.
- `components/effects/display-glyphs.ts`: measured, independently drawn condensed lettering and date glyphs.
- `lib/archive-data.ts`: typed research catalogue, timestamps, implementation examples, known differences and sources.
- `lib/date-timeline.ts`: recording-frame event table, measured glyph boxes and independent opacity/colour state tracks.
- `public/references/`: video reference stills used for comparison and context.
- `research/`: reference index and visual QA evidence.

The rendering functions accept arbitrary time values and avoid global retained drawing state. Animation pauses when the document is hidden, honours reduced-motion preferences by default, and is user-pausable. Workbench timeline states are deterministic for inspection and export.

## Development

Use the supplied Sites setup and dependency helpers. The project uses the retained Vinext/React starter with its Sites and Cloudflare integrations.

```sh
npm run dev
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

The authoritative Site identity is in `.openai/hosting.json`.

## Verification

- TypeScript project check.
- Desktop browser inspection and actual 390px iframe viewport inspection: no horizontal document or dialog overflow.
- All nine catalogue entries present, category filtering and search checked.
- Real keyboard scrubbing pauses the animation; replay and comparison views checked.
- Portrait grid rendering checked in the browser.
- PNG and JSON downloads completed through the actual UI.
- Source images loaded successfully; no application console errors.
- Light-renderer frames at 0s and 6s matched in an in-memory render check.
- Responsive-grid samples at landscape, square and portrait proportions checked for text bounds.
- Date event states independently checked against the recording analysis for all 110 retained frames (2,640 character-position states); all frame/time conversions and six-second reference holds checked.
- Date inspector visually checked at F64, F95 and F108, including partially transparent blue, blue/white mixture and the final digit's first white appearance. Frame stepping, playback synchronization, restart during playback, parameter restoration and date-only PNG export checked through the actual browser UI.

The temporary responsive QA route is not part of the delivered Site.

## GitHub Pages

**Browser demo:** https://qianchencc.github.io/wind-motion/

The visual motion studies are statically exported from the Next.js client. Original reference images and in-browser effect controls remain local to the viewer.

GitHub Pages is active. Deployments run independently through [this repository's workflow](.github/workflows/pages.yml) when application source changes on `main`. GitHub Pages is limited to browser-side functionality and does not host server-only features.
