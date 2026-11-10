/**
 * Reference observations from Rofix's 04:26 Worlds visual-design video.
 * The three core techniques are our archival grouping. Code excerpts below
 * are original implementation examples, not recovered production source.
 */
export type ComparisonStage = {
  label: string;
  sourceTime: number;
  demoTime: number;
  recordingFrame?: number;
  reference: string;
  description: string;
};

export type Experiment = {
  id: string;
  index: string;
  title: string;
  en: string;
  family: "light" | "type" | "system";
  kind: "core" | "application";
  range: string;
  seconds: number;
  reference: string;
  summary: string;
  observations: string[];
  steps: { title: string; body: string }[];
  parameters: { amount: string; detail: string };
  differences: string[];
  code: string;
  related: string[];
  comparison?: {
    defaultStage: number;
    note: string;
    stages: ComparisonStage[];
  };
};

export const experiments: Experiment[] = [
  {
    id: "border-beam",
    index: "01",
    title: "边缘流光",
    en: "Border Beam",
    family: "light",
    kind: "core",
    range: "00:20–01:07",
    seconds: 23,
    reference: "/references/frame-023.jpg",
    summary: "把亮度集中在画面边界，让高光沿轮廓运行。蓝色晕光与黑色中心形成张力，同一机制还能进入回放框和舞台屏幕。",
    observations: [
      "约 00:23 的画面中，四周比中心明亮，边界的白色亮点向内扩散为蓝色光晕。字幕明确描述屏幕边缘持续流动的高光。",
      "00:43 的奖杯画面和 00:59 的比赛回放沿用同类边缘处理，表明它是跨内容使用的包装语言。",
    ],
    steps: [
      { title: "定义一条闭合边界", body: "先绘制低亮度矩形轮廓，再把周长换算为统一路径坐标。控制亮段在路径上的位置，避免四条边分别动画造成接缝。" },
      { title: "叠加亮核与光晕", body: "用同一段路径画三次：外层宽而暗，中层蓝色扩散，内层细而接近白色。让中心保留足够暗部，轮廓才有存在感。" },
      { title: "统一运动节奏", body: "用时间驱动亮段沿路径移动，两个亮段保持相位差。分别调节流光强度与光尾长度，检查停帧时是否仍能读出边界。" },
    ],
    parameters: { amount: "流光强度", detail: "光尾长度" },
    differences: [
      "复现使用 Canvas 路径和多层辉光近似边缘能量，原片的精确合成节点、亮度曲线与色彩管理未取得。",
      "演示内容与构图为便于观察机制而重新组织；没有将原赛事画面或官方标识作为复现素材。",
    ],
    code: `const w = width - 48, h = height - 48;
const perimeter = 2 * (w + h);
const beam = perimeter * 0.18;
ctx.save();
ctx.translate(24, 24);
ctx.beginPath(); ctx.rect(0, 0, w, h);
ctx.setLineDash([beam, perimeter - beam]);
ctx.lineDashOffset = -time * 90;
for (const [blur, color] of [[28, "#193bff"], [5, "#d5f5ff"]]) {
  ctx.shadowBlur = blur; ctx.shadowColor = color;
  ctx.strokeStyle = color; ctx.stroke();
}
ctx.restore();`,
    related: ["crest-sweep", "faceted-rim", "horizon"],
  },
  {
    "id": "digital-type",
    "index": "02",
    "title": "蓝白显像",
    "en": "Digital Type Reveal",
    "family": "type",
    "kind": "core",
    "range": "01:50–02:15",
    "seconds": 113.479384,
    "reference": "/references/digital-015.jpg",
    "summary": "日期在固定字位上分组出现，蓝色显像包含不同透明度和蓝白混色。用录屏逐帧状态表重建顺序，保留末位数字直接显白的实际表现。",
    "observations": [
      "补充录屏按 30 fps 解码：F64 首次出现日期蓝字，F139 全部转白，共有 13 个可见状态更新点。20 个非空字符中，19 个观察到蓝色；末位 4 在 F108 首次可见时已是白色。",
      "字符内容与字位固定，出场顺序分散。可见约 1/3、2/3 的蓝字不透明度和蓝白混色；未观察到乱码替换、再次消失或白退蓝。F 号指这段录屏的采样帧，并非原制作工程帧。"
    ],
    "steps": [
      {
        "title": "建立固定字位表",
        "body": "记录日期的 24 个字位，包括 4 个空格，保留大小写和每个字符的原始边界。日期区域单独放大，渲染时按自绘字形逐字落入固定边界，空格始终占位。"
      },
      {
        "title": "按实测事件保持状态",
        "body": "为每个字符记录录屏帧号、不透明度与白色混合比例。读取时间点之前最后一个事件，直到下一次事件再更新；不在录屏未提供的中间帧补插值。末位 4 的首个事件直接是白色，其余字符各自保留不同的透明蓝与混色阶段。"
      },
      {
        "title": "让原片与复现共用帧号",
        "body": "日期逐帧视图以录屏 F51 为零点，将 F51–F160 的日期裁剪与复现绑定到同一帧。前后帧按 1/30 秒步进，F160 后保持参考末帧；参数实验仅调整事件发生时间，颜色状态仍来自实测表。"
      }
    ],
    "parameters": {
      "amount": "蓝白间隔",
      "detail": "字符错峰"
    },
    "differences": [
      "原视频字体页列出 Compacta Pro Bold 与 Parabolica Regular。标题和日期均使用自绘几何字面，日期保留大小写并校准字符边界；它们不是原作字体文件。",
      "本次按 30 fps 录屏里可见的状态重建。录屏约每 6–7 帧才更新一次文字状态，未记录的原动画中间帧不能由此确定；约 1/3、2/3 的透明度与混色比例是像素测量近似。"
    ],
    "code": "const states = getDateCharacterStates(time); // 实测事件表；事件之间保持\nctx.save(); ctx.scale(w / 700, h / 88); ctx.translate(-300, -328);\nfor (const state of states) {\n  if (!state.bbox || state.alpha <= 0) continue;\n  const [left, top, right, bottom] = state.bbox;\n  const lower = /^[ceomnrv]$/.test(state.char);\n  const capHeight = (bottom - top) / (lower ? .82 : 1);\n  const capTop = top - (lower ? capHeight * .18 : 0);\n  ctx.save(); ctx.globalAlpha *= state.alpha; ctx.fillStyle = state.color;\n  if (state.char === \"-\") ctx.fillRect(left, top, right-left, bottom-top);\n  else drawDisplayText(ctx, state.char, left, capTop, right-left, capHeight, {variant:\"date\", fill:state.color});\n  ctx.restore();\n}\nctx.restore();",
    "related": [
      "faux-extrusion",
      "responsive-grid",
      "ticker"
    ],
    "comparison": {
      "defaultStage": 2,
      "note": "这六张全场景静帧来自原小红书视频，用于构图与阶段参考；标注时间仍是小红书采样位置。复现时间通过字符状态匹配到补充录屏 F64/89/108/114/133/150，两种来源不使用固定时间偏移。精确时序以“日期逐帧”的录屏 F 号为准。",
      "stages": [
        {
          "label": "稀疏蓝字",
          "sourceTime": 112.083973,
          "demoTime": 0.43333333333333335,
          "reference": "/references/digital-004.jpg",
          "description": "网址保持白色；日期只有少量分散字位呈现蓝色。",
          "recordingFrame": 64
        },
        {
          "label": "蓝字补齐",
          "sourceTime": 112.888217,
          "demoTime": 1.2666666666666666,
          "reference": "/references/digital-011.jpg",
          "description": "更多日期字符以蓝色进入，部分字位仍为空缺。",
          "recordingFrame": 89
        },
        {
          "label": "蓝白交错",
          "sourceTime": 113.479384,
          "demoTime": 1.9,
          "reference": "/references/digital-015.jpg",
          "description": "日期已可完整读出，不相邻的字符分别处于蓝色与白色阶段。",
          "recordingFrame": 108
        },
        {
          "label": "逐步白化",
          "sourceTime": 113.880261,
          "demoTime": 2.1,
          "reference": "/references/digital-018.jpg",
          "description": "固定字位上的白色字符继续增多，保留分散的蓝色字符。",
          "recordingFrame": 114
        },
        {
          "label": "最后白化",
          "sourceTime": 114.38917,
          "demoTime": 2.7333333333333334,
          "reference": "/references/digital-023.jpg",
          "description": "大部分日期字符已转白，October 中仍可见最后的蓝色字位。",
          "recordingFrame": 133
        },
        {
          "label": "白字定格",
          "sourceTime": 115.184369,
          "demoTime": 3.3,
          "reference": "/references/digital-030.jpg",
          "description": "网址与完整日期均保持白色，进入稳定阅读段。",
          "recordingFrame": 150
        }
      ]
    }
  },
  {
    "id": "faux-extrusion",
    "index": "03",
    "title": "伪三维挤出",
    "en": "Faux Extrusion",
    "family": "type",
    "kind": "core",
    "range": "02:20–02:35",
    "seconds": 151.176653,
    "reference": "/references/faux-012.jpg",
    "summary": "白色层投影把展开中的词组连成厚块，再按词组错峰回收。非均匀缩放、连续白面与逐渐打开的字腔共同形成伪三维空间感。",
    "observations": [
      "连续采样展示 THIS IS、OUR、MOMENT 三组白字依次进入与收束。约 02:30.97，OUR 仍明显高大；约 02:31.18，前两组已收回，MOMENT 仍横向展开并越过下边界。",
      "展开段的字面呈连续白色厚块，部分字腔被暂时遮住；约 02:31.47 三行已回到画面内，02:32.17 留下稳定标题。字幕称其为 faux 3D extrusion，并提到位移和缩放，画面没有可分辨的蓝色侧壁。"
    ],
    "steps": [
      {
        "title": "建立独立词组轨道",
        "body": "以参考里的高重量大写字为目标，自绘白色几何字面，分别固定 THIS、IS、OUR、MOMENT 的最终边界。每个词拥有自己的位置、宽高与倾斜关键帧，首行两个词也单独校准。"
      },
      {
        "title": "用同色投影连接白面",
        "body": "展开时在字面边界内叠加同色白色投影层：后层向上延展并保持下沿相接，前沿稍微下移。相邻白面合并为连续厚块，暂时遮住 M、O 等字腔；裁切保证投影留在当前字面范围内。"
      },
      {
        "title": "错峰回收并打开字腔",
        "body": "各词按自己的关键帧回收位置与横纵尺寸，投影深度随超出终态的宽度一起减小，字腔随后逐渐打开。以原片约 02:29.80 为复现零点核对六个阶段，最后保留完整三行标题供阅读。"
      }
    ],
    "parameters": {
      "amount": "入场扩张",
      "detail": "回收速度"
    },
    "differences": [
      "标题使用针对这组文案自绘的几何大写字形，不是 Compacta Pro Bold 原字体文件；笔画切角、曲线和字距仍属于图形近似。",
      "复现采用二维仿射变换、同色白色层投影和词组错峰，用合并白面与字腔后开拟合空间错觉；原作是否另含三维或其他合成方式，不能仅凭这些画面确定。"
    ],
    "code": "const p = poseAt(keys, t), end = keys[keys.length - 1]; // 每词独立轨道\nconst width = p[3], height = p[4];\nconst depth = height * .95 * clamp((width / end[3] - 1) / 1.15);\nconst steps = depth > .5 ? 9 : 0, ink = Math.min(1.25, height * .016);\nctx.save(); ctx.transform(1, (p[6] ?? 0)/width, (p[5] ?? 0)/height, 1, p[1], p[2]);\nctx.beginPath(); ctx.rect(0, 0, width, height); ctx.clip();\nfor (let layer = steps; layer >= 0; layer--) {\n  const reach = steps ? depth * layer / steps : 0;\n  for (const dx of [0, ink])\n    drawDisplayText(ctx, word, dx, -reach, width-ink, height+reach, {fill:\"#f7f7f5\", letterSpacing:.025});\n}\nif (depth > .5)\n  drawDisplayText(ctx, word, 0, depth*.075, width, height-depth*.075, {fill:\"#f7f7f5\", letterSpacing:.025});\nctx.restore();",
    "related": [
      "digital-type",
      "responsive-grid"
    ],
    "comparison": {
      "defaultStage": 3,
      "note": "参考来自 Rofix 小红书原视频的连续播放器采样，所示时间为近似播放位置；复现零点对应原片约 02:29.80。原片文字镜头约 02:32.67 结束，6 秒演示循环的剩余时段保持定格，便于观察。",
      "stages": [
        {
          "label": "首组展开",
          "sourceTime": 149.902704,
          "demoTime": 0.102704,
          "reference": "/references/faux-000.jpg",
          "description": "白色首组文字从画面上方以巨大尺度进入，部分字形越出上边界。"
        },
        {
          "label": "首组收束",
          "sourceTime": 150.47899,
          "demoTime": 0.67899,
          "reference": "/references/faux-005.jpg",
          "description": "THIS IS 收回上方排版位置，后续词组尚未出现。"
        },
        {
          "label": "中组展开",
          "sourceTime": 150.973508,
          "demoTime": 1.173508,
          "reference": "/references/faux-010.jpg",
          "description": "OUR 以高大的白色字面进入中部，和上方词组形成尺寸差。"
        },
        {
          "label": "底行展开",
          "sourceTime": 151.176653,
          "demoTime": 1.376653,
          "reference": "/references/faux-012.jpg",
          "description": "前两组已接近最终尺寸，MOMENT 向两侧和下边界大幅展开。"
        },
        {
          "label": "三行回收",
          "sourceTime": 151.472619,
          "demoTime": 1.672619,
          "reference": "/references/faux-014.jpg",
          "description": "三组文字均回到画面内，底行仍在向最终尺寸回收。"
        },
        {
          "label": "完整定格",
          "sourceTime": 152.171845,
          "demoTime": 2.371845,
          "reference": "/references/faux-020.jpg",
          "description": "三行白字收束为完整标题，保留稳定阅读时间。"
        }
      ]
    }
  },
  {
    id: "crest-sweep",
    index: "04",
    title: "徽标轮廓扫光",
    en: "Crest Sweep",
    family: "light",
    kind: "application",
    range: "00:03 / 01:03",
    seconds: 63,
    reference: "/references/frame-063.jpg",
    summary: "让光沿标识的外框与内部折线移动，局部亮起便能读出完整形象。它把边缘流光从屏幕边界延伸到了品牌符号本身。",
    observations: [
      "00:03 与 01:03 都展示中心徽标：整体轮廓保持深蓝，局部轮廓出现白蓝亮核和扩散光晕。",
      "高光并未均匀铺满整个标识；外框与内部线条的亮暗差使图形具有层次。",
    ],
    steps: [
      { title: "把图形拆成路径", body: "为外框和内部折线各建一条路径，先以低亮度绘制完整轮廓。这里使用原创几何徽标，保留观察扫光所需的转折与交汇。" },
      { title: "在路径上移动亮段", body: "沿路径长度采样亮段，再给不同路径增加小幅相位差。用长蓝尾和短白色亮核建立局部能量，让外框与内部结构错开亮起。" },
      { title: "限制光晕范围", body: "亮核保持细而锐利，蓝色光晕只在周围有限扩散。先在黑底检查轮廓，再分别调节光强与光尾在路径上的跨度。" },
    ],
    parameters: { amount: "扫光强度", detail: "光尾跨度" },
    differences: [
      "演示采用原创几何徽标，不是 Worlds 官方标识；原视频帧用于说明轮廓、亮段和运动关系。",
      "路径扫光和多层模糊是我们选择的近似方法，未复原原标识的精确几何、材质或原作灯光。",
    ],
    code: `const points = [[0,-80],[65,-36],[54,46],[0,82],[-54,46],[-65,-36]];
ctx.save(); ctx.translate(width / 2, height / 2);
ctx.beginPath();
points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
ctx.closePath();
ctx.strokeStyle = "#173ca8"; ctx.lineWidth = 4; ctx.stroke();
ctx.setLineDash([80, 420]); ctx.lineDashOffset = -time * 75;
ctx.shadowColor = "#244dff"; ctx.shadowBlur = 22;
ctx.strokeStyle = "#e4f5ff"; ctx.lineWidth = 2; ctx.stroke();
ctx.restore();`,
    related: ["border-beam", "faceted-rim"],
  },
  {
    id: "faceted-rim",
    index: "05",
    title: "暗折面高光",
    en: "Faceted Rim Light",
    family: "light",
    kind: "application",
    range: "02:42–02:55",
    seconds: 171,
    reference: "/references/frame-171.jpg",
    summary: "用接近黑色的折面藏住主体，只让轮廓边缘局部发亮。高光在折线之间移动，在信息页面背后形成克制的空间暗示。",
    observations: [
      "02:47–02:51 的左半画面有深色棱面与细蓝轮廓，右半仍是平整、清晰的赛事信息区。",
      "02:51 字幕直接描述高光沿轮廓移动；主体大部分维持暗色，没有被均匀照亮。",
    ],
    steps: [
      { title: "建立低对比折面", body: "把背景划分为数个不规则多边形，只给相邻面很小的明度差。先让折面在关闭辉光时仍然成立，再考虑灯光。" },
      { title: "计算边上的亮度峰", body: "沿每条边采样位置，令亮度峰随时间移动。只强调少数相邻边，避免所有轮廓同时发光而变成线框图。" },
      { title: "把亮光留给边缘", body: "在高亮边外添加弱蓝色晕光，面内保持暗部。让信息文字与折面背景分区，保证运动不会抢走正文的注意力。" },
    ],
    parameters: { amount: "高光强度", detail: "边缘跨度" },
    differences: [
      "实验使用 Canvas 多边形和边缘亮度近似，不包含原作三维模型、真实法线照明与材质反射。",
      "折面轮廓为重新设计的几何，重点对照暗面与局部亮边的关系；没有复制原片背景模型。",
    ],
    code: `const a = [40, 210], b = [width - 40, 90];
const peak = (time * 0.2) % 1;
for (let i = 0; i < 80; i++) {
  const u = i / 80, v = (i + 1) / 80;
  const light = Math.exp(-Math.pow((u - peak) / 0.13, 2));
  ctx.strokeStyle = "rgba(100,150,255," + light + ")";
  ctx.shadowColor = "#214bff"; ctx.shadowBlur = light * 20;
  ctx.beginPath();
  ctx.moveTo(a[0] + (b[0]-a[0])*u, a[1] + (b[1]-a[1])*u);
  ctx.lineTo(a[0] + (b[0]-a[0])*v, a[1] + (b[1]-a[1])*v);
  ctx.stroke();
}`, 
    related: ["border-beam", "crest-sweep", "horizon"],
  },
  {
    id: "horizon",
    index: "06",
    title: "地平线升光",
    en: "Luminous Horizon",
    family: "light",
    kind: "application",
    range: "02:59–03:11",
    seconds: 183,
    reference: "/references/frame-183.jpg",
    summary: "将宽阔蓝色亮度压在远处地平线上，近景用几条低伏弧面承接。中心的白色亮核与明暗分层建立开阔而克制的空间感。",
    observations: [
      "03:03 的画面远端是一条低平亮线，中心近白、两侧转为蓝色；大标题与日期放在上方暗区。",
      "前景存在多层弧形与折面轮廓，蓝白高光沿其边缘延伸，明亮区域与大面积暗部相互衬托。",
    ],
    steps: [
      { title: "先确定远近层次", body: "以低位置的地平线作为远景锚点，把多层弧线由远及近排开；越近的弧面跨度越大，层间距也随之增加。" },
      { title: "叠加中心亮核", body: "用横向拉长的径向渐变生成远端升光，再以细线强调地平线。不要把整个背景提亮，保留上方标题需要的暗区。" },
      { title: "让高光缓慢游移", body: "保持弧面几何稳定，用低频曲线移动亮核和弧边上的光尾。分别调节升光强度与高光宽度，避免多层亮部叠加后过曝。" },
    ],
    parameters: { amount: "升光强度", detail: "高光宽度" },
    differences: [
      "用 Canvas 渐变、弧线与多边形建立空间近似，没有原作三维场景的真实遮挡、反射或摄像机运动。",
      "近景几何与高光游移节奏由本项目重新设计；当前实验专注光与曲面关系，原片标识与正式赛程仅保留在参考帧中。",
    ],
    code: `const y = height * 0.58;
const x = width * (0.5 + Math.sin(time * 0.17) * 0.045);
ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.28);
const glow = ctx.createRadialGradient(0,0,0,0,0,width*0.55);
glow.addColorStop(0, "#c5ecff");
glow.addColorStop(0.04, "#477dff");
glow.addColorStop(1, "rgba(7,18,65,0)");
ctx.fillStyle = glow; ctx.fillRect(-width/2, -height, width, height * 2);
ctx.restore();
ctx.strokeStyle = "#517cff";
ctx.beginPath(); ctx.moveTo(0, y + 80);
ctx.quadraticCurveTo(width/2, y + 20, width, y + 80);
ctx.stroke();`,
    related: ["faceted-rim", "border-beam"],
  },
  {
    id: "responsive-grid",
    index: "07",
    title: "响应式信息网格",
    en: "Responsive Broadcast Grid",
    family: "system",
    kind: "application",
    range: "01:09–01:31 / 02:46",
    seconds: 167,
    reference: "/references/frame-167.jpg",
    summary: "让窄体大标题、细线数据行与动态背景共享一套网格。根据画幅重新分配区域，保持赛事信息的层级、对齐和阅读顺序。",
    observations: [
      "01:15 的字体页明确列出 Compacta Pro Bold 用于标题、Parabolica Regular 用于正文，二者承担不同信息层级。",
      "02:47 画面以垂直细带分隔两区：左侧是暗底大标题，右侧是浅底、细线划分的数据行。",
    ],
    steps: [
      { title: "定义少量稳定模块", body: "把标题、阶段标签、数据行与背景视为独立模块，给标题区和数据区建立共同的边距与对齐基准。" },
      { title: "用比例驱动布局", body: "演示在左右分栏与上下分区之间连续插值，展示同一信息系统的重排方式。比例参数控制横向标题栏宽度，边距与字级随可用空间计算。" },
      { title: "让动静信息各得其位", body: "动态背景留在标题或空白区，数据区使用稳定浅底。密度参数选择 2–5 行信息，并同步调整行高与字号，保持每行清楚可读。" },
    ],
    parameters: { amount: "标题区域占比", detail: "信息密度（2–5 行）" },
    differences: [
      "标题与正文字体使用开源替代方案；原视频所列商业字体没有嵌入本项目，字面比例和排版细节存在差异。",
      "实验使用示例赛程和原创几何标记，自动播放两种布局的插值过渡；原作完整的断点规则与所有画幅模板未取得。",
    ],
    code: `const smooth = v => { const x = Math.max(0, Math.min(1, v)); return x*x*(3-2*x); };
const phase = ((time % 6) + 6) % 6;
const stack = smooth((phase-2)/0.65) * (1-smooth((phase-4.8)/0.65));
const x = width * (0.31 + 0.30 * amount) * (1-stack);
const y = height * 0.43 * stack;
const rows = Math.round(2 + 3 * detail);
ctx.fillStyle = "#eeefed"; ctx.fillRect(x, y, width-x, height-y);
ctx.fillStyle = "#03040a";
for (let i = 0; i < rows; i++) {
  const rowY = y + (height-y) * (0.16 + i * 0.76 / rows);
  ctx.fillRect(x+24, rowY, width-x-48, 1);
  ctx.fillText("Qualification " + (i+1), x+24, rowY+24);
}`, 
    related: ["ticker", "bracket", "digital-type"],
  },
  {
    id: "ticker",
    index: "08",
    title: "阶段滚动信息带",
    en: "Stage Ticker",
    family: "system",
    kind: "application",
    range: "02:35 / 02:46",
    seconds: 155,
    reference: "/references/frame-155.jpg",
    summary: "将阶段名称压进一条连续细带，以重复、方向和局部色彩变化组织画面。它既能沿顶部运行，也能旋转成分栏之间的竖向标记。",
    observations: [
      "02:35 的晋级图顶部连续重复 PLAY-IN STAGE，细带包含青、蓝与浅色，字号明显小于主体标题。",
      "02:47 的同类细带采用竖向布局，位于大标题与数据区之间，内容重复 SWISS STAGE。静帧本身不确定其滚动方向和速度。",
    ],
    steps: [
      { title: "建立一个重复单元", body: "测量阶段文本的宽度，加上固定间隔作为循环单元。多绘制两个单元覆盖画面两端，避免滚动时露出空隙。" },
      { title: "用取模实现无缝移动", body: "把时间位移对单元宽度取模，再重复绘制文本。速度参数改变每个周期内的循环次数，重复密度决定画面内的单元数量。" },
      { title: "让色带承担层级", body: "用低高度的蓝青渐变托住文字，保持字与底色的对比。当前演示用上下两条带反向滚动呈现节奏，高密度时再加入侧边标签。" },
    ],
    parameters: { amount: "滚动速度", detail: "重复密度" },
    differences: [
      "重复间距、速度和渐变移动规则是本项目的实现选择，参考帧只能确认其版式、重复内容与色彩关系。",
      "演示采用开源窄体字体与示例阶段名称；没有嵌入原赛事字体或原作的整条动画素材。",
    ],
    code: `const label = "SWISS STAGE";
ctx.font = "bold 14px sans-serif";
const count = Math.round(3 + 5 * detail), unit = width / count;
const laps = Math.round(1 + 11 * amount);
const offset = ((time / 6 * laps * unit) % unit + unit) % unit;
const band = ctx.createLinearGradient(0,0,width,0);
band.addColorStop(0,"#21efff"); band.addColorStop(1,"#1b38ff");
ctx.fillStyle = band; ctx.fillRect(0,0,width,26);
ctx.fillStyle = "#07143b";
for (let x = -unit; x < width + unit; x += unit) {
  ctx.fillText(label, x - offset, 18);
}`, 
    related: ["responsive-grid", "bracket"],
  },
  {
    id: "bracket",
    index: "09",
    title: "晋级图布局",
    en: "Tournament Bracket",
    family: "system",
    kind: "application",
    range: "02:35 / 03:46–04:03",
    seconds: 235,
    reference: "/references/frame-235.jpg",
    summary: "以细线连接对阵，以蓝色强调比分与晋级结果。赛制说明、晋级树和决赛视图围绕同一组数据展开，形成连续的信息叙事。",
    observations: [
      "02:35 展示上下半区的晋级关系；03:46–04:03 依次出现赛制记录、双侧晋级树和决赛收束布局。",
      "节点由队名与独立比分格组成，细线表达连接关系，蓝色比分格提供强调；浅色背景还有低对比度的大标识。",
    ],
    steps: [
      { title: "将比赛与位置分开", body: "用数据记录示例队名、预设结果及下一场比赛的关系，再依据轮次计算节点位置。节点密度控制是否显示最后一轮及轮次标签。" },
      { title: "从节点端点生成连线", body: "连接线先水平伸出，再垂直转折，最后进入下一轮。让线避开文字与比分格，并保持各轮节点的对齐。" },
      { title: "按阅读顺序推进", body: "让已有节点与连线按轮次依次亮起，再用蓝色比分格强调预设胜者。速度参数控制晋级强调的推进，窄画幅改为从上向下阅读。" },
    ],
    parameters: { amount: "晋级推进速度", detail: "轮次与标签密度" },
    differences: [
      "本实验以示例队伍和预设结果展示信息布局，不连接实时赛果，也不将演示比分作为真实赛事信息。",
      "当前演示重建晋级树与逐轮强调；视频中的赛制说明、决赛整屏切换作为同一系统的参考，没有逐镜头复原。",
    ],
    code: `function connect(a, b, time, amount, round) {
  const cycle = ((time % 6) + 6) % 6;
  const progress = Math.min(1, cycle / 5.5 * (0.95 + 0.70 * amount));
  const active = progress > 0.19 + round * 0.31;
  const bend = (a.x + b.x) / 2;
  ctx.strokeStyle = active ? "#4e64ff" : "#40475d";
  ctx.lineWidth = active ? 2 : 1;
  ctx.beginPath(); ctx.moveTo(a.x,a.y);
  ctx.lineTo(bend,a.y); ctx.lineTo(bend,b.y); ctx.lineTo(b.x,b.y);
  ctx.stroke();
}`, 
    related: ["responsive-grid", "ticker", "faceted-rim"],
  },
];

export const chapters = [
  { time: "00:00", label: "开场与主题", description: "从 Worlds 2026 的品牌画面切入，建立蓝黑、窄体大字和边缘高光的整体印象。", ids: ["border-beam", "crest-sweep"] },
  { time: "00:20", label: "边缘的能量", description: "观察流光如何从屏幕边界进入徽标、回放和舞台等不同载体。", ids: ["border-beam", "crest-sweep"] },
  { time: "01:09", label: "字体与网格", description: "标题与正文承担不同层级，模块化布局让同一语言适应不同画幅。", ids: ["responsive-grid"] },
  { time: "01:50", label: "文字的显像", description: "拆解蓝色闪现、白色定格与字位之间的节奏，再观察文字向前挤出的变化。", ids: ["digital-type", "faux-extrusion"] },
  { time: "02:35", label: "信息与空间", description: "赛事信息带、晋级图和暗面亮边组合出现，随后以地平线升光打开空间。", ids: ["ticker", "bracket", "faceted-rim", "horizon"] },
  { time: "03:22", label: "历年视觉对照", description: "回看 2022 的字体与织物表达，再通过赛事图表观察长期系统和年度视觉的关系。", ids: ["responsive-grid", "bracket"] },
];

export const sourceLinks = [
  {
    title: "原视频 · Rofix",
    url: "https://xhslink.cn/o/5fOze671fxv",
    description: "《英雄联盟 S16 世界赛 视觉设计包装解析》，约 4 分 27 秒。本档案的时间点、关键帧和观察均以该视频为主；00:10 字幕将制作归因于 BUCK。",
  },
  {
    title: "BUCK · Worlds 品牌系统",
    url: "https://buck.co/work/riot-games-world-championships",
    description: "官网说明可延续的网格、动态语言与年度视觉表达；当前页面明确描述 2025 季节方案，用作系统背景资料，不能代替对 2026 全部效果制作归属的核验。",
  },
  {
    title: "Riot · Worlds 2026 Primer",
    url: "https://lolesports.com/en-GB/news/worlds-2026-primer",
    description: "官方赛事介绍确认 2026 英文主题 THIS IS OUR MOMENT，提供年份与主题背景，不提供本视频所拆解动画的工程文件。",
  },
];

export const historyNotes = [
  {
    id: "worlds-2022-type",
    title: "2022 · 一套不同的字体系统",
    range: "03:26–03:35",
    reference: "/references/frame-214.jpg",
    summary: "视频的历史对照明确展示 Manuka Bold 为主字体，Fraktion Sans Bold、Sans Regular 与 Mono Bold 为辅助系统。它们属于 2022 回顾，不是 2026 字体。",
    details: [
      "03:30 的样张写明 MANUKA BOLD；补充检查 03:34 画面，可直接读到三个 Fraktion 字体样式。",
      "巨型字与摄影叠置、出血裁切属于历史排版参考。本轮未嵌入这些商业字体，也未把字体样张计为完成的动态实验。",
    ],
    status: "参考收录",
  },
  {
    id: "worlds-2022-fabric",
    title: "2022 · 织物承载品牌",
    range: "03:22–03:39",
    reference: "/references/frame-219.jpg",
    summary: "多条带有标识和队伍图形的织物弯曲、叠合，材质和折皱成为画面的主体。视频在这一回顾段落提到 Tendril 工作室。",
    details: [
      "画面可以确认织物形态、印花与层叠关系；原作的模拟软件、碰撞设置和材质参数无法从这些画面直接得知。",
      "本轮保留原帧与分析，没有重建三维布料、褶皱或自碰撞，不计入 9 项可交互实验。",
    ],
    status: "参考收录 · 未重建布料",
  },
];
