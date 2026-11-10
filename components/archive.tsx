"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, Download, Layers2, Pause, Play, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { EffectCanvas } from "./effect-canvas";
import { DateInspector } from "./date-inspector";
import { experiments, chapters, historyNotes, sourceLinks, type Experiment } from "@/lib/archive-data";
import { DATE_FPS, DATE_TIMELINE, dateDemoTime, dateSourceFrame } from "@/lib/date-timeline";
import dateReference from "@/public/references/date-frames.json";

const sourceUrl = "https://xhslink.cn/o/5fOze671fxv";
const tabs = [{ id: "all", name: "全部实验" }, { id: "light", name: "光与材质" }, { id: "type", name: "文字动态" }, { id: "system", name: "信息系统" }];

function Mark() {
  return <svg className="brand-mark" viewBox="0 0 44 34" aria-hidden="true"><path d="M1 3H42L35 10H1M1 14H35L28 21H1M1 25H28L21 32H1" /></svg>;
}

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob), link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function sourceTimeLabel(seconds: number, precise = false) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toFixed(precise ? 2 : 0).padStart(precise ? 5 : 2, "0");
  return `${minutes}:${rest}`;
}

function StudyCard({ item, open, paused }: { item: Experiment; open: (item: Experiment) => void; paused: boolean }) {
  const [hovered, setHovered] = useState(false);
  const sampleTime: Record<string, number> = { "responsive-grid": .8, "faceted-rim": 1.8 };
  const previewTime = item.comparison?.stages[item.comparison.defaultStage]?.demoTime ?? sampleTime[item.id] ?? 2.8;
  return <button className="study-card" onClick={() => open(item)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocus={() => setHovered(true)} onBlur={() => setHovered(false)} aria-label={`打开实验 ${item.title}`}>
    <div className="card-visual">
      <EffectCanvas effect={item.id} animate={hovered && !paused} time={hovered && !paused ? undefined : previewTime} label={item.title} />
      <div className="card-top"><span className="card-index">/{item.index}</span><span className={`kind ${item.kind}`}>{item.kind === "core" ? "核心手法" : "应用实验"}</span></div>
      <span className="card-open"><ArrowUpRight size={21} /></span>
      <span className="card-play"><Play size={11} fill="currentColor" /> 进入实验</span>
    </div>
    <div className="card-caption"><div><h3>{item.title}</h3><p>{item.en}</p></div><span>{item.range.split(" / ")[0]}</span></div>
  </button>;
}

function Workbench({ item, onClose, onSelect }: { item: Experiment; onClose: () => void; onSelect: (item: Experiment) => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stages = item.comparison?.stages ?? [];
  const isDigital = item.id === "digital-type";
  const initialStageIndex = item.comparison?.defaultStage ?? 0;
  const [stageIndex, setStageIndex] = useState(initialStageIndex);
  const [freeExperiment, setFreeExperiment] = useState(false);
  const [time, setTime] = useState(isDigital ? dateDemoTime(108) : stages[initialStageIndex]?.demoTime ?? 2.8);
  const [playing, setPlaying] = useState(stages.length === 0);
  const [playbackRun, setPlaybackRun] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [amount, setAmount] = useState(.7);
  const [detail, setDetail] = useState(.5);
  const [text, setText] = useState("");
  const [view, setView] = useState<"detail" | "split" | "overlay" | "demo">(isDigital ? "detail" : "split");
  const [divider, setDivider] = useState(50);
  const [section, setSection] = useState<"compare" | "method" | "code">("compare");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const [format, setFormat] = useState("16 / 9");
  const position = experiments.findIndex(entry => entry.id === item.id);
  const stage = stages[stageIndex];
  const reference = stage?.reference ?? item.reference;
  const referenceTime = sourceTimeLabel(stage?.sourceTime ?? item.seconds, !!stage);
  const canvasLabel = stage && !freeExperiment ? "对应阶段 · 复现停帧" : "实时复现";
  const isDateDetail = isDigital && view === "detail";
  const dateParametersChanged = Math.abs(amount - .7) > .000001 || Math.abs(detail - .5) > .000001;
  const currentFrame = Math.max(0, Math.round(time * DATE_FPS));
  const lastPlaybackFrame = DATE_FPS * 6 - 1;
  const playheadRef = useRef(time);
  playheadRef.current = time;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
    return () => { document.body.style.overflow = before; dialog.close(); };
  }, []);

  useEffect(() => {
    if (!playing) return;
    let frame = 0, last = performance.now(), previousRender = 0, elapsed = playheadRef.current;
    const tick = (now: number) => {
      if (now - previousRender >= 30) {
        const delta = document.hidden ? 0 : Math.min((now - last) / 1000, .1) * speed;
        elapsed = (elapsed + delta) % 6;
        setTime(isDateDetail ? Math.floor(elapsed * DATE_FPS + 1e-7) / DATE_FPS : elapsed);
        last = now; previousRender = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, isDateDetail, playbackRun]);

  const selectStage = (index: number) => {
    const next = stages[index];
    if (!next) return;
    setStageIndex(index); setTime(next.demoTime); setPlaying(false); setFreeExperiment(false);
    setAmount(.7); setDetail(.5); setSpeed(1); setText(""); setFormat("16 / 9");
  };
  const enterFreeExperiment = () => { if (stage) setFreeExperiment(true); };
  const changeView = (next: typeof view) => {
    setView(next);
    if (next === "detail") { setPlaying(false); setTime(value => Math.min(lastPlaybackFrame, Math.round(value * DATE_FPS)) / DATE_FPS); }
    else if (isDateDetail && stage) selectStage(stageIndex);
  };
  const stepDateFrame = (direction: number) => {
    setPlaying(false);
    setTime(value => Math.max(0, Math.min(lastPlaybackFrame, Math.round(value * DATE_FPS) + direction)) / DATE_FPS);
  };
  const restartPlayback = () => {
    if (!isDateDetail) enterFreeExperiment();
    setTime(0); setPlaying(true); setPlaybackRun(value => value + 1);
  };
  const reset = () => {
    if (isDateDetail) {
      setAmount(.7); setDetail(.5); setSpeed(1); setText(""); setPlaying(false); setFreeExperiment(false);
      setTime(value => Math.round(value * DATE_FPS) / DATE_FPS);
      return;
    }
    if (stage) { selectStage(stageIndex); return; }
    setAmount(.7); setDetail(.5); setSpeed(1); setTime(0); setText(""); setFormat("16 / 9");
  };
  const exportFrame = () => canvasRef.current?.toBlob(blob => {
    if (blob) { downloadFile(blob, `wind-archive-${item.id}.png`); setNotice("当前实验画面已导出"); }
  }, "image/png");
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(item.code); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { setNotice("复制不可用，可以选择代码文本复制"); }
  };
  const canvas = <EffectCanvas key={`${item.id}-${view}`} effect={item.id} time={time} amount={amount} detail={detail} text={text || undefined} label={`${item.title} ${canvasLabel}`} exportRef={canvasRef} />;

  return <dialog ref={dialogRef} className="workbench" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }} aria-labelledby="workbench-title">
    <div className="workbench-inner">
      <header className="workbench-header">
        <div className="workbench-title"><span className="mono blue">EXPERIMENT / {item.index}</span><h2 id="workbench-title">{item.title}<span>{item.en}</span></h2></div>
        <button className="icon-button" onClick={onClose} aria-label="关闭实验"><X size={23} /></button>
      </header>
      <div className="workbench-tabs" role="tablist" aria-label="档案内容">
        <button role="tab" aria-selected={section === "compare"} onClick={() => setSection("compare")}>效果对照</button>
        <button role="tab" aria-selected={section === "method"} onClick={() => setSection("method")}>实现拆解</button>
        <button role="tab" aria-selected={section === "code"} onClick={() => setSection("code")}>核心算法</button>
        <a href={sourceUrl} target="_blank" rel="noreferrer">原视频 {item.range}<ArrowUpRight size={14} /></a>
      </div>
      <div className="workbench-content">
        <div className="compare-heading"><p>{item.summary}</p><div className="view-switch" aria-label="对照方式">{isDigital && <button className={view === "detail" ? "selected" : ""} onClick={() => changeView("detail")}>日期逐帧</button>}<button className={view === "split" ? "selected" : ""} onClick={() => changeView("split")}>并排</button><button className={view === "overlay" ? "selected" : ""} onClick={() => changeView("overlay")}>叠合</button><button className={view === "demo" ? "selected" : ""} onClick={() => changeView("demo")}>仅复现</button></div></div>
        {stage && !isDateDetail && <section className="reference-stages" aria-label="原片关键帧阶段选择">
          <div className="reference-stages-heading"><div><span className="eyebrow">KEYFRAME COMPARISON</span><h3>逐阶段对照</h3></div><span className="mono">{stages.length} 个原片关键帧</span></div>
          <div className="reference-stage-list" role="group" aria-label="选择阶段，同时切换参考图与复现时间">{stages.map((entry, index) => <button key={entry.reference} className={`reference-stage ${stageIndex === index ? "active" : ""}`} aria-pressed={stageIndex === index} onClick={() => selectStage(index)}>
            <img src={entry.reference} alt="" loading="lazy" />
            <span className="reference-stage-label"><strong>{String(index + 1).padStart(2, "0")} · {entry.label}</strong><span className="mono">约 {sourceTimeLabel(entry.sourceTime, true)}</span>{entry.recordingFrame !== undefined && <small>匹配录屏 F{entry.recordingFrame}</small>}</span>
          </button>)}</div>
          <p className={`comparison-status ${freeExperiment ? "is-free" : ""}`} role="status"><strong>{freeExperiment ? "自由实验" : "关键帧对照"}</strong> {freeExperiment ? "右侧时间或参数已改变，左侧保留当前原片关键帧。点击任一阶段或“恢复对照”，回到对应的基准画面。" : `${stage.description} 两侧按此阶段对照，原片参考为静帧。`}</p>
          <p className="reference-timing-note">{item.comparison?.note}</p>
        </section>}
        {isDateDetail ? <DateInspector time={time} amount={amount} detail={detail} parametersChanged={dateParametersChanged} exportRef={canvasRef} /> : view === "split" ? <div className="comparison split">
          <figure><div className="frame-label"><span>{stage ? "原片 · 对应关键帧" : "原视频 · 静帧"}</span><span>约 {referenceTime}</span></div><div className="frame"><img src={reference} alt={`Rofix 原视频：${item.title}，约 ${referenceTime}${stage ? `，${stage.label}` : ""}`} /></div><figcaption>{stage ? "Rofix · 原片采样静帧，非同步视频" : "参考画面 / Rofix"}</figcaption></figure>
          <figure><div className="frame-label"><span>{playing && <i />} {canvasLabel}</span><span>CANVAS 2D</span></div><div className="frame">{canvas}</div><figcaption>{stage && !freeExperiment ? `${stage.label} · 基准参数 · 复现 ${time.toFixed(2)} s` : "独立实现 · 可调整下方参数"}</figcaption></figure>
        </div> : view === "overlay" ? <div className="comparison overlay">
          <div className="frame-label"><span>左：原片关键帧 / 右：{stage && !freeExperiment ? "对应复现停帧" : "实时复现"}</span><span>约 {referenceTime}</span></div>
          <div className="frame"><img src={reference} alt={`${item.title}原片静帧，约 ${referenceTime}`} /><div className="overlay-canvas" style={{ clipPath: `inset(0 0 0 ${divider}%)` }}>{canvas}</div><div className="comparison-line" style={{ left: `${divider}%` }}><Layers2 size={17} /></div></div>
          <label className="overlay-control"><span>对照分界</span><input type="range" min="0" max="100" value={divider} onChange={event => setDivider(+event.target.value)} aria-label="对照分界" /></label>
        </div> : <div className="comparison demo" style={format === "9 / 16" ? {maxWidth: 350} : format === "1 / 1" ? {maxWidth: 560} : undefined}><div className="frame-label"><span>{playing && <i />} {canvasLabel}</span><span>{item.en}</span></div><div className="frame" style={{aspectRatio: format}}>{canvas}</div></div>}

        <div className="playback">
          <button className="icon-button playback-primary" onClick={() => { if (!playing && !isDateDetail) enterFreeExperiment(); setPlaying(!playing); }} aria-label={playing ? "暂停动画" : isDateDetail ? "播放日期逐帧对照" : "播放复现动画"}>{playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</button>
          <button className="icon-button" onClick={restartPlayback} aria-label={isDateDetail ? "重新播放日期对照" : "重新播放复现"}><RotateCcw size={17} /></button>
          {isDateDetail && <><button className="icon-button frame-step" onClick={() => stepDateFrame(-1)} disabled={currentFrame <= 0} aria-label="前一帧" title="前一帧 · 1/30 秒"><ArrowLeft size={15} /></button><button className="icon-button frame-step" onClick={() => stepDateFrame(1)} disabled={currentFrame >= lastPlaybackFrame} aria-label="后一帧" title="后一帧 · 1/30 秒"><ArrowRight size={15} /></button></>}
          <label className="time-range"><input aria-label={isDateDetail ? "日期对照时间，每步1/30秒" : "复现动画时间"} type="range" min="0" max={isDateDetail ? lastPlaybackFrame / DATE_FPS : 6} step={isDateDetail ? 1 / DATE_FPS : .01} value={time} onChange={event => { if (!isDateDetail) enterFreeExperiment(); setPlaying(false); setTime(isDateDetail ? Math.round(+event.target.value * DATE_FPS) / DATE_FPS : +event.target.value); }} /><span className="mono">{isDateDetail ? <>录屏 F{String(dateSourceFrame(time)).padStart(3, "0")} · 30 fps<br />{time.toFixed(3)} / 6.000 s</> : <>复现 {time.toFixed(2)} / 6.0 s</>}</span></label>
          <select aria-label="播放速度" value={speed} onChange={event => { if (!isDateDetail) enterFreeExperiment(); setSpeed(+event.target.value); }}><option value=".5">0.5×</option><option value="1">1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select>
          <button className="text-button export-frame" onClick={exportFrame}><Download size={15} /> 导出画面</button>
        </div>
        <div className="parameter-panel">
          <div className="parameter-title"><SlidersHorizontal size={16} /><span>调整实验</span><button onClick={reset}>{stage ? "恢复对照" : "重置"}</button></div>
          {item.id === "responsive-grid" && <label className="format-control">实验画幅<select aria-label="实验画幅" value={format} onChange={event => {setFormat(event.target.value); setView("demo");}}><option value="16 / 9">横屏 16:9</option><option value="1 / 1">方形 1:1</option><option value="9 / 16">竖屏 9:16</option></select></label>}
          <label>{item.parameters.amount}<span className="mono">{Math.round(amount * 100)}%</span><input type="range" min="0" max="1" step=".01" value={amount} onChange={event => { enterFreeExperiment(); setAmount(+event.target.value); }} /></label>
          <label>{item.parameters.detail}<span className="mono">{Math.round(detail * 100)}%</span><input type="range" min="0" max="1" step=".01" value={detail} onChange={event => { enterFreeExperiment(); setDetail(+event.target.value); }} /></label>
          {item.family === "type" && !isDateDetail && <label className="text-parameter">实验文字<input maxLength={48} value={text} placeholder={item.id === "digital-type" ? "LOLESPORTS.COM" : "THIS IS OUR MOMENT"} onChange={event => { enterFreeExperiment(); setText(event.target.value); }} /></label>}
        </div>
        {section === "compare" && <div className="observation-grid"><div><span className="eyebrow">OBSERVATION</span><h3>看什么</h3><ul>{item.observations.map(line => <li key={line}>{line}</li>)}</ul></div><div><span className="eyebrow">RECONSTRUCTION NOTES</span><h3>当前复现与差异</h3><ul>{item.differences.map(line => <li key={line}>{line}</li>)}</ul></div></div>}
        {section === "method" && <div className="method-panel"><p className="method-note">以下为本档案的独立实现方法，可用于继续开发。</p><div className="steps">{item.steps.map((step, index) => <article key={step.title}><span className="step-index">0{index + 1}</span><h3>{step.title}</h3><p>{step.body}</p></article>)}</div></div>}
        {section === "code" && <div className="code-panel"><div><span>Canvas / JavaScript · 核心算法示例</span><button className="text-button" onClick={copyCode}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "已复制" : "复制代码"}</button></div><pre><code>{item.code}</code></pre><p>{stage ? "摘录使用本项目的 drawDisplayText 自绘字形函数与已校准时序；省略字形路径、完整关键帧表和画布初始化。示例展示基准参数，实时实验可继续调整。" : "示例省略画布初始化与交互层；完整实时实现使用上方参数驱动。"}</p></div>}
        <div className="workbench-bottom"><button className="text-button" onClick={() => onSelect(experiments[(position - 1 + experiments.length) % experiments.length])}><ArrowLeft size={16} /> 上一个实验</button><span className="mono">{item.index} / 09</span><button className="text-button" onClick={() => onSelect(experiments[(position + 1) % experiments.length])}>下一个实验 <ArrowRight size={16} /></button></div>
        {notice && <button className="toast" role="status" onClick={() => setNotice("")}>{notice}<X size={14} /></button>}
      </div>
    </div>
  </dialog>;
}

export default function Archive() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Experiment | null>(null);
  const [paused, setPaused] = useState(false);
  const [menu, setMenu] = useState(false);
  const filtered = useMemo(() => experiments.filter(item => (category === "all" || item.family === category) && `${item.title} ${item.en} ${item.summary}`.toLowerCase().includes(search.toLowerCase())), [category, search]);

  useEffect(() => {
    const restore = () => {
      if (location.hash.startsWith("#effect=")) setSelected(experiments.find(item => item.id === location.hash.slice(8)) || null);
    };
    restore(); window.addEventListener("hashchange", restore);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
    return () => window.removeEventListener("hashchange", restore);
  }, []);

  const open = (item: Experiment) => { setSelected(item); history.replaceState(null, "", `#effect=${item.id}`); };
  const close = () => { setSelected(null); history.replaceState(null, "", location.pathname + location.search); };
  const exportIndex = () => downloadFile(new Blob([JSON.stringify({ title: "风起 · 动态设计档案馆", source: sourceUrl, scope: "3个核心手法 + 6个应用实验。历史参考单列，不计入复现数量。", experiments, chapters, historyNotes, sourceLinks, dateTimeline: DATE_TIMELINE, dateReference: { ...dateReference, sprite: "/references/date-frames.webp" } }, null, 2)], { type: "application/json;charset=utf-8" }), "wind-motion-archive.json");

  return <div className="archive-app">
    <a className="skip-link" href="#experiments">跳到效果档案</a>
    <header className="site-header"><a className="brand" href="#" aria-label="风起档案馆首页"><Mark /><strong>风起<span>MOTION ARCHIVE</span></strong></a>
      <nav className={menu ? "site-nav expanded" : "site-nav"} aria-label="主导航"><a href="#experiments" onClick={() => setMenu(false)}>效果档案<span>09</span></a><a href="#chapters" onClick={() => setMenu(false)}>逐段拆解</a><a href="#sources" onClick={() => setMenu(false)}>资料索引</a></nav>
      <a className="source-link" href={sourceUrl} target="_blank" rel="noreferrer">观看原视频 <ArrowUpRight size={16} /></a><button className="mobile-menu icon-button" aria-label="切换导航" onClick={() => setMenu(!menu)}><Layers2 size={20} /></button>
    </header>

    <main>
      <section className="hero-section">
        <div className="hero-top"><span className="mono"><b /> VOL. 001 — WORLDS VISUAL IDENTITY</span><span className="mono">RESEARCH → RECONSTRUCT → EXPLORE</span></div>
        <div className="hero-main">
          <div className="hero-copy"><div className="eyebrow">一支视频，九个设计实验</div><h1>让视觉<br /><span>流动起来。</span></h1><p>拆解世界赛视觉里的光、文字与秩序。<br />从原始画面出发，把设计变成可以<br className="desktop-break" />亲手调整的实验。</p><a className="primary-button" href="#experiments">进入效果档案 <ArrowDown size={17} /></a><div className="hero-credit">基于 Rofix《英雄联盟 S16 世界赛视觉设计包装解析》</div></div>
          <div className="hero-art"><EffectCanvas effect="hero" animate={!paused && !selected} amount={.85} detail={.62} label="蓝色光线与地平线构成的动态视觉实验" /><div className="hero-art-top"><span className="mono">FIELD NOTES / 2026</span><span className="live-label"><i /> LIVE RENDER</span></div><button className="hero-open" onClick={() => open(experiments[0])}><span>01 / 边缘流光</span><ArrowUpRight size={19} /></button><button className="hero-pause" aria-label={paused ? "播放首页动画" : "暂停首页动画"} onClick={() => setPaused(!paused)}>{paused ? <Play size={15} /> : <Pause size={15} />}</button></div>
        </div>
        <div className="hero-bottom"><div className="hero-note"><span className="tiny-cross">+</span> 观察原作，理解机制，重新实现。</div><div className="hero-numbers"><div><strong>03</strong><span>核心手法</span></div><div><strong>06</strong><span>应用实验</span></div><div><strong>04:26</strong><span>原视频时长</span></div></div></div>
      </section>

      <section id="experiments" className="catalogue page-section">
        <div className="section-heading"><div><span className="eyebrow">THE COLLECTION</span><h2>效果档案 <span>/ 09</span></h2></div><p>点开一项，比较画面，调整参数。</p><button className="text-button export-index" onClick={exportIndex}><Download size={15} /> 导出档案</button></div>
        <div className="catalogue-toolbar"><div className="filter-tabs" aria-label="实验分类">{tabs.map(tab => <button key={tab.id} className={category === tab.id ? "active" : ""} aria-pressed={category === tab.id} onClick={() => setCategory(tab.id)}>{tab.name}<span>{tab.id === "all" ? experiments.length : experiments.filter(e => e.family === tab.id).length}</span></button>)}</div><label className="search-field"><Search size={15} /><input value={search} onChange={event => setSearch(event.target.value)} aria-label="搜索效果" placeholder="搜索效果、技术…" />{search && <button onClick={() => setSearch("")} aria-label="清空搜索"><X size={14} /></button>}</label></div>
        <div className="experiment-grid">{filtered.map(item => <StudyCard key={item.id} item={item} open={open} paused={paused || !!selected} />)}</div>
        {filtered.length === 0 && <div className="empty-state"><Search size={28} /><h3>没有匹配的实验</h3><p>试试“流光”“文字”或“网格”。</p><button className="text-button" onClick={() => { setSearch(""); setCategory("all"); }}>查看全部实验 <ArrowRight size={15} /></button></div>}
        <p className="catalogue-footnote"><span /> 3 个核心手法与 6 个应用实验分别计数；同一手法的变体保留关联。</p>
      </section>

      <section id="chapters" className="chapter-section page-section">
        <div className="section-heading"><div><span className="eyebrow">FRAME BY FRAME</span><h2>沿着视频，看清设计。</h2></div><a className="text-button" href={sourceUrl} target="_blank" rel="noreferrer">打开完整视频 <ArrowUpRight size={16} /></a></div>
        <div className="chapter-layout"><div className="chapter-still"><img src="/references/frame-151.jpg" alt="原视频中伪三维挤出文字的画面，约02:31" loading="lazy" /><div><span className="mono">02:31 / ORIGINAL FRAME</span><p>一次伸展，让平面文字有了纵深。</p></div></div><div className="chapter-list">{chapters.map((chapter, index) => <button key={chapter.time} onClick={() => { const item = experiments.find(e => e.id === chapter.ids[0]); if (item) open(item); else document.getElementById("history")?.scrollIntoView({ behavior: "smooth" }); }}><span className="chapter-time mono">{chapter.time}</span><div><h3>{chapter.label}</h3><p>{chapter.description}</p></div><ArrowUpRight size={17} /><span className="chapter-order">{index + 1}</span></button>)}</div></div>
      </section>

      <section id="history" className="history-section page-section">
        <div className="section-heading"><div><span className="eyebrow">CONTEXT & CONTINUITY</span><h2>视觉会变，系统延续。</h2></div><p>视频里的历史回望，作为参考单独保存。</p></div>
        <div className="history-grid"><article><div className="history-image"><img src="/references/frame-075.jpg" alt="原视频展示2025沿用的字体系统样张：Compacta Pro Bold与Parabolica Regular" loading="lazy" /><span className="image-year">2025 → 2026</span></div><div className="history-copy"><span className="eyebrow">TYPE & STRUCTURE</span><h3>两款字体，一套信息层级</h3><p>视频 01:15 的样张标明标题用 Compacta Pro Bold、正文用 Parabolica Regular。大标题与精细数据共用响应式网格，构成稳定的赛事信息骨架。</p><a href="https://buck.co/work/riot-games-world-championships" target="_blank" rel="noreferrer">BUCK 品牌系统案例 <ArrowUpRight size={14} /></a></div></article>
        <article><div className="history-image"><img src="/references/frame-203.jpg" alt="视频回顾2022年的印花织带与布料品牌形象" loading="lazy" /><span className="image-year">2022 / REFERENCE</span></div><div className="history-copy"><span className="eyebrow">A DIFFERENT MATERIAL LANGUAGE</span><h3>织带与巨型文字的另一种表达</h3><p>视频 03:22 起回顾 Tendril 的 2022 视觉：织带载体、Manuka Bold 与 Fraktion 字体系统。本次保存画面与线索，布料褶皱及碰撞模拟留作后续独立实验。</p><span className="reference-only">已归档参考 · 未计入复现数量</span></div></article></div>
      </section>

      <section id="sources" className="sources-section page-section"><div className="source-intro"><span className="eyebrow">ABOUT THE ARCHIVE</span><h2>每个效果，<br />都有来处。</h2><p>原视频提供观察依据，独立实验展示实现路径。参考画面、时间点与当前差异随每一份档案保存。</p><button className="text-button" onClick={exportIndex}>下载完整索引 JSON <Download size={15} /></button></div><div className="source-list"><a href={sourceUrl} target="_blank" rel="noreferrer"><span className="source-number">01</span><div><span>原始研究视频</span><h3>Rofix · 英雄联盟 S16 世界赛视觉设计包装解析</h3><p>小红书 / 04:26 / 含参考静帧与时间索引</p></div><ArrowUpRight size={21} /></a><a href="https://buck.co/work/riot-games-world-championships" target="_blank" rel="noreferrer"><span className="source-number">02</span><div><span>品牌系统背景</span><h3>BUCK · Riot Games World Championships</h3><p>官网说明 2025 季节表达与跨年沿用的网格基础</p></div><ArrowUpRight size={21} /></a><a href="https://lolesports.com/en-GB/news/worlds-2026-primer" target="_blank" rel="noreferrer"><span className="source-number">03</span><div><span>主题核对</span><h3>Riot Games · Worlds 2026 Primer</h3><p>官方主题：THIS IS OUR MOMENT</p></div><ArrowUpRight size={21} /></a><div className="source-note">实验使用 Canvas 2D。文字重点以自绘几何窄体字面贴近参考，正文与不支持的字符使用替代字体；未使用原作字体文件。三维折面以程序绘制近似，布料模拟仅归档参考。</div></div></section>
    </main>
    <footer className="site-footer"><a className="footer-brand" href="#"><Mark /><span>风起 / MOTION ARCHIVE</span></a><p>观察，是复现的开始。</p><span className="mono">VOL. 001 — 2026</span></footer>
    {selected && <Workbench key={selected.id} item={selected} onClose={close} onSelect={open} />}
  </div>;
}
