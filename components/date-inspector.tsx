"use client";

import { useState, type MutableRefObject } from "react";
import { EffectCanvas } from "./effect-canvas";
import reference from "@/public/references/date-frames.json";
import { DATE_FPS, DATE_START_FRAME, DATE_END_FRAME, dateSourceFrame, getDateCharacterStates } from "@/lib/date-timeline";

type Props = {
  time: number;
  amount: number;
  detail: number;
  parametersChanged: boolean;
  exportRef: MutableRefObject<HTMLCanvasElement | null>;
};

type CharacterState = ReturnType<typeof getDateCharacterStates>[number];

function stateDescription(state: CharacterState) {
  if (state.char === " ") return "空格，保留固定字位";
  if (state.phase === "hidden") return "尚未显出";
  if (state.phase === "white") return "白色定格";
  const opacity = Math.round(state.alpha * 100);
  const white = Math.round(state.whiteMix * 100);
  return white > 0 ? `蓝白过渡，白色混合约 ${white}%，不透明度 ${opacity}%` : `蓝色显像，不透明度约 ${opacity}%`;
}

export function DateInspector({ time, amount, detail, parametersChanged, exportRef }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const frame = Math.max(0, Math.round(time * DATE_FPS));
  const renderTime = frame / DATE_FPS;
  const sourceFrame = dateSourceFrame(renderTime);
  const tileIndex = Math.max(0, Math.min(reference.frameCount - 1, sourceFrame - reference.firstVideoFrame));
  const column = tileIndex % reference.columns;
  const row = Math.floor(tileIndex / reference.columns);
  const held = frame > DATE_END_FRAME - DATE_START_FRAME;
  const states = getDateCharacterStates(renderTime);
  const visibleCharacters = states.filter(state => state.char !== " ");
  const counts = { hidden: 0, blue: 0, white: 0 };
  visibleCharacters.forEach(state => { counts[state.phase] += 1; });
  const selected = states.find(state => state.index === selectedIndex);
  const aspectRatio = `${reference.tileWidth} / ${reference.tileHeight}`;

  return <section className="date-inspector" aria-label="日期区域逐帧对照">
    <div className="date-inspector-heading"><div><span className="eyebrow">DATE / FRAME BY FRAME</span><h3>把每一个字的变化放大看。</h3></div><span className="mono">录屏 {DATE_FPS} fps · F{String(DATE_START_FRAME).padStart(3, "0")}—F{String(DATE_END_FRAME).padStart(3, "0")}</span></div>
    <p className={`date-sync-status ${parametersChanged ? "is-adjusted" : ""}`}><strong>{parametersChanged ? "参数实验" : "逐帧对照"}</strong>{parametersChanged ? "两侧仍对应同一录屏帧；右侧复现参数已改变。恢复对照可回到实测状态。" : "原片日期区域与复现共用同一录屏帧。播放、拖动或前后逐帧，检查分组出现、透明蓝和蓝白过渡。"}</p>

    <div className="date-detail-pair">
      <figure><div className="frame-label"><span>参考 · 上传录屏的日期区域</span><span>录屏 F{String(sourceFrame).padStart(3, "0")}</span></div>
        <div className="date-detail-frame frame date-source-frame" role="img" aria-label={`用户上传录屏 F${sourceFrame} 的日期裁剪`} style={{
          aspectRatio,
          backgroundImage: "url('/references/date-frames.webp')",
          backgroundSize: `${reference.columns * 100}% ${reference.rows * 100}%`,
          backgroundPosition: `${reference.columns > 1 ? column / (reference.columns - 1) * 100 : 0}% ${reference.rows > 1 ? row / (reference.rows - 1) * 100 : 0}%`,
          backgroundRepeat: "no-repeat",
        }} />
        <figcaption>录屏位置 {(sourceFrame / DATE_FPS).toFixed(3)} s · {held ? "已到有效末帧，保持 F160" : "原始日期裁剪，随时间切帧"}</figcaption>
      </figure>
      <figure><div className="frame-label"><span>复现 · 日期区域</span><span>{parametersChanged ? "调整后的参数" : "实测状态表"}</span></div>
        <div className="date-detail-frame frame" style={{ aspectRatio }}><EffectCanvas effect="date-detail" time={renderTime} amount={amount} detail={detail} label={`日期复现，对照录屏 F${sourceFrame}`} exportRef={exportRef} /></div>
        <figcaption>{parametersChanged ? "同一帧号下观察参数对显像状态的影响" : `与录屏 F${String(sourceFrame).padStart(3, "0")} 对照 · 基准参数`}</figcaption>
      </figure>
    </div>

    <div className="date-character-panel">
      <div className="date-character-heading"><h4>原片事件状态 <span className="mono">录屏 F{String(sourceFrame).padStart(3, "0")}</span></h4><div className="date-state-legend"><span><i className="is-hidden" />未显 {counts.hidden}</span><span><i className="is-blue" />蓝显 / 过渡 {counts.blue}</span><span><i className="is-white" />白字 {counts.white}</span></div></div>
      <div className="date-character-strip" role="group" aria-label="日期24个字位，含4个空格">{states.map(state => <button key={state.index} className={`date-character is-${state.phase} ${state.char === " " ? "is-space" : ""} ${selectedIndex === state.index ? "selected" : ""}`} aria-pressed={selectedIndex === state.index} onClick={() => setSelectedIndex(state.index)} title={`第 ${state.index + 1} 位 ${state.char === " " ? "空格" : state.char}：${stateDescription(state)}`} aria-label={`第 ${state.index + 1} 位 ${state.char === " " ? "空格" : state.char}，${stateDescription(state)}`}>
        <span className="date-character-index">{String(state.index + 1).padStart(2, "0")}</span><span className="date-character-glyph" style={{ color: state.phase === "hidden" ? "#64718d" : state.color, opacity: state.phase === "hidden" ? .45 : state.alpha }}>{state.char === " " ? "·" : state.char}</span><span className="date-character-state">{state.char === " " ? "空" : state.phase === "hidden" ? "—" : state.phase === "white" ? "白" : state.whiteMix > 0 ? "混" : "蓝"}</span>
      </button>)}</div>
      <p className="date-character-readout">{selected ? `第 ${selected.index + 1} 位「${selected.char === " " ? "空格" : selected.char}」：${stateDescription(selected)}。` : "点击任意字位查看不透明度与蓝白混合比例。状态格依据原片事件表，空格保留位置，未计入字符数量。"}</p>
    </div>
    <p className="date-reference-note">帧号来自用户上传录屏按 30 fps 解码的采样，不代表原制作工程帧。只收录日期区域；F160 之后保持参考末帧，直到 6 秒循环重播。</p>
  </section>;
}
