/* ============================================================
   TimeAgent Web · 应用逻辑
   - 克隆自参考鸿蒙项目 TimeAgent_FuBen 的核心功能
   - 纯前端（原生 JS），可直接双击 index.html 运行
   - 商业级 UI / 完善边界处理 / 跨页面刷新联动
   ============================================================ */
(function () {
  "use strict";

  /* ----------------------- 小工具 ----------------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pad = (n) => (n < 10 ? "0" + n : "" + n);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = (s) =>
    String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const uid = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  // 实时时间信息（注入 AI prompt）：日期+星期+时分，让模型知道"现在是几点"，日报/复盘更贴合实际
  const nowInfo = () => {
    const d = new Date();
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${weekLabel(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const weekLabel = (d = new Date()) =>
    ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][d.getDay()];
  const formatTodayLabel = () => {
    const d = new Date();
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${weekLabel(d)}`;
  };

  /* ----------------------- SVG 图标库 ----------------------- */
  const I = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1v-9"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5S20 17 20 21"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M4 12.5 9 17.5 20 6.5"/>',
    trash: '<path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
    tag: '<path d="M3 12V4.5h7.5L21 15l-7.5 7z"/><circle cx="7.5" cy="8" r="1.3"/>',
    sparkle: '<path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4L12 3z"/><path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z"/>',
    send: '<path d="M21 3 10 14M21 3l-6.5 18-4-8-8-4L21 3z"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.9 1 .9 1.6V16h5.2v-.5c0-.6.4-1.2.9-1.6A6 6 0 0 0 12 3z"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    report: '<path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v6h6M9 13h6M9 17h6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.3 2.5h4l.3-2.5a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/>',
    sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/>',
    moon: '<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8z"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z"/>',
    heart: '<path d="M12 20s-7-4.5-9.2-9C1.3 8 2.8 4.5 6.2 4.5c2 0 3.3 1.2 4 2.3.7-1.1 2-2.3 4-2.3 3.4 0 4.9 3.5 3.4 6.5C19 15.5 12 20 12 20z"/>',
    brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5.5A3 3 0 0 0 7 18a3 3 0 0 0 5 1V5a3 3 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 1 5.5A3 3 0 0 1 17 18a3 3 0 0 1-5 1"/>',
    headphones: '<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="13" width="4" height="7" rx="2"/><rect x="17" y="13" width="4" height="7" rx="2"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>',
    repeat: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.7-1 .9-1.8-.8-.8-.3-2.2.9-2.2H17a4 4 0 0 0 4-4c0-5-4-10-9-10z"/><circle cx="7.5" cy="11" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="7.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="16.5" cy="11" r="1.1" fill="currentColor" stroke="none"/>',
    save: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h7"/><path d="M8 21v-7h8v7"/>',
    share: '<circle cx="6" cy="12" r="2.6"/><circle cx="17" cy="5.5" r="2.6"/><circle cx="17" cy="18.5" r="2.6"/><path d="M8.3 10.8l6.5-3.8M8.3 13.2l6.5 3.8"/>',
    shield: '<path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  };
  const svg = (name, cls = "") =>
    `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[name] || ""}</svg>`;

  /* ----------------------- 标签 / 分类系统 ----------------------- */
  const DEFAULT_TAGS = [
    { tag: "学习", color: "#2563EB" },
    { tag: "工作", color: "#0891B2" },
    { tag: "运动", color: "#EF4444" },
    { tag: "社交", color: "#8B5CF6" },
    { tag: "休息", color: "#10B981" },
    { tag: "生活", color: "#F59E0B" },
    { tag: "饮食", color: "#EC4899" },
    { tag: "外出", color: "#64748B" },
    { tag: "其他", color: "#A1A1AA" },
  ];
  const TAG_MAP = Object.fromEntries(DEFAULT_TAGS.map((t) => [t.tag, t.color]));
  // 精选调色板：按色相均匀铺开，相邻色差明显，便于区分
  const TAG_PALETTE = [
    "#DC2626", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E",
    "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
    "#8B5CF6", "#A855F7", "#D946EF", "#EC4899", "#F43F5E", "#64748B",
  ];
  // 预设色块 + 自定义取色器，三处（添加/编辑/新建分类）共用
  function paletteDots(selected, withAct) {
    return TAG_PALETTE.map(
      (c) =>
        `<span class="color-dot ${selected === c ? "sel" : ""}"${withAct ? ' data-act="pick-color"' : ""} data-color="${c}" style="--c:${c};background:${c}"></span>`
    ).join("");
  }
  function customColorInput(selected, ctx) {
    const isCustom = !TAG_PALETTE.includes(selected);
    return `<label class="color-custom ${isCustom ? "active" : ""}"${isCustom ? ` style="background:${selected}"` : ""} title="自定义颜色">
      <input type="color" class="color-custom-input" data-ctx="${ctx}" value="${isCustom ? selected : "#3B82F6"}" />
      ${svg("palette")}
    </label>`;
  }
  function colorPickerHTML(selected, ctx) {
    return `<div class="color-dots">${paletteDots(selected)}${customColorInput(selected, ctx)}</div>`;
  }

  function getColorForTag(tag) {
    if (TAG_MAP[tag]) return TAG_MAP[tag];
    const custom = Store.state.customTags.find((t) => t.tag === tag);
    return custom ? custom.color : "#A1A1AA";
  }
  // 标签 → 正经大类：内置标签大类=自身；自定义标签取 cat 字段（默认"其他"），
  // 让"中二风格"的自定义标签也能归到学习/工作等正经大类统计
  const CATS = ["学习", "工作", "运动", "饮食", "休息", "社交", "其他"];
  function tagCategory(tag) {
    if (TAG_MAP[tag]) return tag;
    const custom = Store.state.customTags.find((t) => t.tag === tag);
    return custom && CATS.includes(custom.cat) ? custom.cat : "其他";
  }
  function tagIcon(tag, color) {
    return `<span class="tag-icon" style="background:${color}" aria-hidden="true">${esc(tag.charAt(0))}</span>`;
  }
  // 是否已完成：普通日程看 isCompleted；重复日程看该出现日期是否在 doneDates 中（按次完成）
  // 回迁鸿蒙时可对应「单个重复实例的完成态」
  function isDone(it) {
    if (it && it.repeat && it.repeat !== "none") return !!(it.doneDates && it.doneDates.indexOf(it.date) >= 0);
    return !!(it && it.isCompleted);
  }
  function allTags() {
    return DEFAULT_TAGS.concat(Store.state.customTags);
  }
  function contrastText(hex) {
    if (!hex) return "#fff";
    let h = hex.replace("#", "");
    if (h.length === 3)
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (h.length !== 6) return "#fff";
    const r = parseInt(h.slice(0, 2), 16),
      g = parseInt(h.slice(2, 4), 16),
      b = parseInt(h.slice(4, 6), 16);
    const br = (r * 299 + g * 587 + b * 114) / 1000;
    return br > 150 ? "#16223A" : "#fff";
  }
  // 颜色相似度：返回 [0,1]，1=完全相同（RGB 归一化欧氏距离）
  function colorSimilarity(a, b) {
    const parse = (hex) => {
      let h = String(hex || "").replace("#", "");
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      if (h.length !== 6) return null;
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    };
    const pa = parse(a),
      pb = parse(b);
    if (!pa || !pb) return 0;
    const dist = Math.sqrt(pa.reduce((s, v, i) => s + (v - pb[i]) * (v - pb[i]), 0));
    return Math.max(0, 1 - dist / Math.sqrt(3 * 255 * 255));
  }
  // 标签重名/近色检测：返回所有需要提醒的文案（供 agent 与用户共用）
  // mode: "create"（新建，查重名+近色）/ "recolor"（改色，只查近色）
  function tagDupeWarnings(name, color, mode) {
    const warns = [];
    if (!name) return warns;
    const tags = allTags();
    if (mode !== "recolor") {
      const same = tags.find((t) => t.tag === name);
      if (same) warns.push(`标签「${name}」已存在，无需重复创建`);
    }
    const near = tags.filter((t) => t.tag !== name && colorSimilarity(t.color, color) > 0.88);
    near.forEach((t) => warns.push(`标签「${t.tag}」的颜色与「${name}」的 ${color} 很接近（${t.color}），区分度不高，建议换个颜色`));
    return warns;
  }

  /* ============================================================
     时间自然语言解析（移植并增强自参考项目）
     ============================================================ */
  function detectPeriod(text) {
    let isPm = false,
      isNoon = false;
    if (/凌晨|清晨|早上|早晨|上午/.test(text)) {
    } else if (/中午/.test(text)) {
      isNoon = true;
    } else if (/下午|傍晚|晚上|夜里|夜晚|深夜/.test(text)) {
      isPm = true;
    }
    return { isPm, isNoon };
  }
  function cnHourToNum(s) {
    if (/^\d+$/.test(s)) return +s;
    const d = { 零: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };
    if (d[s] !== undefined) return d[s];
    if (s === "十") return 10;
    if (s.startsWith("二十")) return s.length > 2 ? 20 + (d[s[s.length - 1]] ?? 0) : 20; // 二十 / 二十一~二十三
    if (s.startsWith("十")) return 10 + (d[s[1]] ?? 0); // 十一~十九
    if (s.endsWith("十")) return (d[s[0]] ?? 0) * 10; // 二十/三十…
    if (s.length === 2) return (d[s[0]] ?? 0) * 10 + (d[s[1]] ?? 0);
    return NaN;
  }
  function parseTime(text, ctx) {
    const periodCtx = ctx ? ctx : detectPeriod(text);
    const isPm = periodCtx.isPm,
      isNoon = periodCtx.isNoon;
    const H = "(\\d{1,2}|[零一二两三四五六七八九十]+)"; // 小时：阿拉伯数字或中文数字
    let hour = -1,
      minute = 0,
      raw = "",
      m;
    m = text.match(H + "\\s*[:：]\\s*(\\d{1,2})");
    if (m) {
      hour = cnHourToNum(m[1]);
      minute = +m[2];
      raw = m[0];
    } else {
      m = text.match(H + "\\s*点\\s*(\\d{1,2}|[零一二两三四五六七八九十]+)\\s*分");
      if (m) {
        hour = cnHourToNum(m[1]);
        minute = cnHourToNum(m[2]);
        raw = m[0];
      } else {
        m = text.match(H + "\\s*点\\s*([一二三四])\\s*刻");
        if (m) {
          hour = cnHourToNum(m[1]);
          const q = m[2];
          minute = q === "一" ? 15 : q === "二" ? 30 : q === "三" ? 45 : 60;
          raw = m[0];
        } else {
          m = text.match(H + "\\s*点\\s*半");
          if (m) {
            hour = cnHourToNum(m[1]);
            minute = 30;
            raw = m[0];
          } else {
            m = text.match(H + "\\s*(?:点|时(?!\s*间))");
            if (m) {
              hour = cnHourToNum(m[1]);
              minute = 0;
              raw = m[0];
            }
          }
        }
      }
    }
    if (hour === -1 || isNaN(hour)) return { found: false, valid: false, hour: -1, minute: 0, raw: "" };
    if (isPm) {
      if (hour === 12) hour = 0;
      else if (hour < 12) hour += 12;
    }
    // 中午：不偏移（"中午11点半"=11:30，"中午12点"=12:00；用户已用时段词限定，无需再 +12）
    const valid = hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
    return { found: true, valid, hour, minute, raw };
  }
  function cnToNum(s) {
    const map = {
      一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
    };
    return map[s] ?? 1;
  }
  function parseDuration(text) {
    let m;
    m = text.match(/(\d+(?:\.\d+)?)\s*小时/);
    if (m) return { found: true, minutes: Math.round(parseFloat(m[1]) * 60), raw: m[0] };
    m = text.match(/([一两二三四五六七八九十])\s*小时/);
    if (m) return { found: true, minutes: cnToNum(m[1]) * 60, raw: m[0] };
    m = text.match(/([一两二三四五六七八九十]?)\s*个半小时/);
    if (m) {
      const n = m[1] ? cnToNum(m[1]) : 1;
      return { found: true, minutes: n * 60 + 30, raw: m[0] };
    }
    if (/半小时/.test(text)) return { found: true, minutes: 30, raw: "半小时" };
    m = text.match(/(\d+)\s*分钟/);
    if (m) return { found: true, minutes: +m[1], raw: m[0] };
    return { found: false, minutes: 0, raw: "" };
  }
  function parseEndTime(text, fullText) {
    const m = text.match(/(?:到|至|直到|—|-)\s*(.+)$/);
    if (!m) return { found: false, valid: false, hour: -1, minute: 0, raw: "" };
    return parseTime(m[1], detectPeriod(fullText));
  }
  const isTimeValid = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
  function isRangeValid(t) {
    if (!t || !isTimeValid(t.startTime) || !isTimeValid(t.endTime)) return false;
    const s = +t.startTime.split(":")[0] * 60 + +t.startTime.split(":")[1];
    const e = +t.endTime.split(":")[0] * 60 + +t.endTime.split(":")[1];
    return e - s > 0;
  }

  // 免费演示模式：本地关键词解析 + 多轮补齐（保持与参考项目一致的鲁棒规则）
  function buildFreeDemoTasks(userInput, fallbackNote, draft) {
    const text = (userInput || "").trim();
    if (text.length === 0)
      return { tasks: [], question: "请输入您想安排的日程内容，例如「下午3点去健身房运动2小时」。" };

    let title,
      tag = "其他",
      tagColor = "#A1A1AA",
      startTime = "";
    const dateFor = draft ? draft.date || todayStr() : relDateFromText(text) || todayStr();

    if (draft) {
      title = draft.title;
      tag = draft.tag;
      tagColor = draft.tagColor;
      startTime = draft.startTime || "";
      const durAns = parseDuration(text);
      const endAns = parseEndTime(text, text);
      if (!(durAns.found || endAns.found)) {
        const t = parseTime(text);
        if (t.found && t.valid) {
          startTime = `${pad(t.hour)}:${pad(t.minute)}`;
        } else if (t.found && !t.valid) {
          return {
            tasks: [],
            question: `您补充的「${t.raw}」不是有效时间哦（小时 0–23，分钟 0–59）。请重新告诉我，例如：「下午3点」或「15:00」。`,
            pending: { title, tag, tagColor, startTime, date: dateFor },
          };
        }
      }
    } else {
      const tagRules = {
        学习: ["学习", "看书", "读书", "复习", "自习", "考研", "考试", "网课", "背单词"],
        工作: ["工作", "开会", "项目", "开发", "写代码", "办公", "需求", "汇报"],
        运动: ["运动", "跑步", "健身", "打球", "瑜伽", "游泳", "锻炼", "跳绳"],
        饮食: ["吃饭", "午餐", "晚餐", "早餐", "聚餐", "吃点", "喝点", "吃", "喝"],
        休息: ["休息", "睡觉", "午睡", "放松", "摸鱼", "躺平"],
        社交: ["聚会", "聊天", "约", "社交", "见朋友", "团建", "逛街"],
      };
      for (const key of Object.keys(tagRules)) {
        if (tagRules[key].some((k) => text.includes(k))) {
          tag = key;
          break;
        }
      }
      tagColor = getColorForTag(tag);
      let clean = text
        .replace(/(\d{1,2})\s*点\s*(\d{1,2})\s*分/g, "")
        .replace(/(\d{1,2})\s*点\s*([一二三四])\s*刻/g, "")
        .replace(/(\d{1,2})\s*点\s*半/g, "")
        .replace(/(\d{1,2})\s*[:：]\s*(\d{2})/g, "")
        .replace(/(\d{1,2})\s*(?:点|时)/g, "")
        .replace(/(\d+(?:\.\d+)?)\s*小时/g, "")
        .replace(/(\d+)\s*分钟/g, "")
        .replace(/[一两二三四五六七八九十]\s*个?(?:小时|分钟)/g, "")
        .replace(/半小时/g, "")
        .replace(/[到至直到]/g, "")
        .replace(/[。.，,！!？?\s]/g, "")
        .trim();
      title = clean.length > 0 ? (clean.length > 10 ? clean.slice(0, 10) : clean) : `${tag}待办`;

      // 解析开始时间：先剔除「到X点/至X点」的结束时间片段，避免把结束时间误当开始时间
      // （例：「读书到中午11点半」→ 只给结束时间，开始时间留空待追问，而不是 start=end 报错）
      const endFirst = parseEndTime(text, text);
      const startSearch = endFirst.found && endFirst.raw ? text.replace(endFirst.raw, " ") : text;
      const t = parseTime(startSearch, detectPeriod(text));
      if (!t.found)
        return {
          tasks: [],
          question: `好的，我已记下「${title}」（${tag}）。不过还缺少一个开始时间，请告诉我几点开始？\n例如：「下午3点」或「15:00」。`,
          pending: { title, tag, tagColor, date: dateFor },
        };
      if (!t.valid)
        return {
          tasks: [],
          question: `您输入的「${t.raw}」不是有效时间哦（小时 0–23，分钟 0–59）。请重新告诉我，例如：「下午3点」或「15:00」。`,
          pending: { title, tag, tagColor, date: dateFor },
        };
      startTime = `${pad(t.hour)}:${pad(t.minute)}`;
    }

    if (!startTime)
      return {
        tasks: [],
        question: `还差最后一步～请告诉我「${title}」从几点开始？例如：「下午3点」或「15:00」。`,
        pending: { title, tag, tagColor, date: dateFor },
      };

    const sh = +startTime.slice(0, 2),
      sm = +startTime.slice(3, 5);
    let eh = -1,
      em = -1,
      resolved = false;
    const end = parseEndTime(text, text);
    if (end.found) {
      if (!end.valid)
        return {
          tasks: [],
          question: `您补充的结束时间「${end.raw}」不是有效时间哦。请重新告诉我，例如：「到17:00」或「2小时」。`,
          pending: { title, tag, tagColor, startTime, date: dateFor },
        };
      if (end.hour * 60 + end.minute <= sh * 60 + sm)
        return {
          tasks: [],
          question: `结束时间需要晚于开始时间 ${startTime} 哦。请重新告诉我，例如：「到17:00」或「2小时」。`,
          pending: { title, tag, tagColor, startTime, date: dateFor },
        };
      eh = end.hour;
      em = end.minute;
      resolved = true;
    } else {
      const dur = parseDuration(text);
      if (dur.found && dur.minutes > 0) {
        const total = sh * 60 + sm + dur.minutes;
        if (total > 1439)
          return {
            tasks: [],
            question: `按您说的时长，结束时间会超过当天 23:59 啦。请告诉我一个更合适的时长，例如：「1.5小时」或「到22:00」。`,
            pending: { title, tag, tagColor, startTime, date: dateFor },
          };
        eh = Math.floor(total / 60);
        em = total % 60;
        resolved = true;
      }
    }
    if (!resolved)
      return {
        tasks: [],
        question: `好的，已记下「${title}」（${tag}）从 ${startTime} 开始。还需要多久呢？\n例如：「2小时」「90分钟」或「到17:00」。`,
        pending: { title, tag, tagColor, startTime, date: dateFor },
      };

    const endTime = `${pad(eh)}:${pad(em)}`;
    const descParts = [];
    if (fallbackNote) descParts.push(fallbackNote);
    descParts.push("（离线演示模式）已根据您提供的时间与时长自动排期。");
    return {
      tasks: [
        { title, startTime, endTime, desc: descParts.join(" "), tag, tagColor, date: dateFor },
      ],
    };
  }

  /* ============================================================
     全局状态仓库（发布订阅 + 本地持久化 + 安全解析）
     ============================================================ */
  const STORE_KEY = "timeagent_web_v1";
  const Store = {
    state: {
      schedule: [],
      chat: [],
      apiKey: "",
      apiBase: "https://api.siliconflow.cn/v1",
      apiModel: "deepseek-ai/DeepSeek-V3",
      advice: "",
      customTags: [],
      prefs: { defaultView: "day", freshHighlight: true },
    },
    subs: [],
    load() {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) {
          const p = JSON.parse(raw);
          if (p && typeof p === "object") {
            this.state.schedule = Array.isArray(p.schedule)
              ? p.schedule
                  .filter((i) => i && i.title != null)
                  .map((i) => Object.assign({ date: todayStr(), isCompleted: false, isFresh: false, desc: "", repeat: "none", remind: false, remindOffset: 10, doneDates: [], priority: "中", doneAt: null, doneAtMap: null }, i))
              : [];
            this.state.chat = Array.isArray(p.chat) ? p.chat : [];
            this.state.apiKey = typeof p.apiKey === "string" ? p.apiKey : "";
            this.state.apiBase = typeof p.apiBase === "string" && p.apiBase ? p.apiBase : "https://api.siliconflow.cn/v1";
            this.state.apiModel = typeof p.apiModel === "string" && p.apiModel ? p.apiModel : "deepseek-ai/DeepSeek-V3";
            this.state.advice = typeof p.advice === "string" ? p.advice : "";
            this.state.customTags = Array.isArray(p.customTags) ? p.customTags : [];
            this.state.prefs = Object.assign(
              { defaultView: "day", freshHighlight: true },
              p.prefs && typeof p.prefs === "object" ? p.prefs : {}
            );
          }
        }
      } catch (e) {
        console.warn("本地数据解析失败，已重置：", e);
        toast("本地存档已损坏，已安全重置", "warn");
      }
    },
    save() {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(this.state));
      } catch (e) {
        toast("存储空间不足，部分数据可能未保存", "err");
      }
    },
    notify() {
      this.save();
      this.subs.forEach((fn) => {
        try {
          fn();
        } catch (e) {
          console.error(e);
        }
      });
    },
    subscribe(fn) {
      this.subs.push(fn);
    },
    addSchedule(item) {
      const it = Object.assign(
        { id: uid(), isCompleted: false, date: todayStr(), isFresh: false, desc: "", repeat: "none", remind: false, remindOffset: 10, doneDates: [], priority: "中", doneAt: null, doneAtMap: null },
        item
      );
      this.state.schedule.push(it);
      this.notify();
      return it;
    },
    updateSchedule(id, patch) {
      const i = this.state.schedule.findIndex((x) => x.id === id);
      if (i >= 0) {
        this.state.schedule[i] = Object.assign({}, this.state.schedule[i], patch);
        this.notify();
      }
    },
    removeSchedule(id) {
      const i = this.state.schedule.findIndex((x) => x.id === id);
      if (i >= 0) {
        const [removed] = this.state.schedule.splice(i, 1);
        this.notify();
        return removed;
      }
    },
    toggleSchedule(id, date) {
      const i = this.state.schedule.findIndex((x) => x.id === id);
      if (i < 0) return;
      const it = this.state.schedule[i];
      const ts = Date.now();
      if (it.repeat && it.repeat !== "none") {
        // 重复日程：按出现日期切换完成态，互不影响
        const arr = it.doneDates ? it.doneDates.slice() : [];
        const k = arr.indexOf(date);
        if (k >= 0) arr.splice(k, 1);
        else arr.push(date);
        it.doneDates = arr;
        // 记录本次完成时间（按日期键），供计划偏差分析
        const m = it.doneAtMap ? Object.assign({}, it.doneAtMap) : {};
        if (k >= 0) delete m[date];
        else m[date] = ts;
        it.doneAtMap = m;
      } else {
        it.isCompleted = !it.isCompleted;
        it.doneAt = it.isCompleted ? ts : null;
      }
      this.notify();
    },
  };

  /* ============================================================
     统计计算（首页 / 统计页共用）
     ============================================================ */
  function parseHM(t) {
    const p = t.split(":");
    return +p[0] + +p[1] / 60;
  }
  /* ============ 日期 / 范围 工具 ============ */
  function fmtDate(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  function parseDate(s) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  function addDays(s, n) {
    const d = parseDate(s);
    d.setDate(d.getDate() + n);
    return fmtDate(d);
  }
  const WK = { 日: 0, 天: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6 };
  function weekBounds(s) {
    const d = parseDate(s);
    const diff = d.getDay() === 0 ? -6 : 1 - d.getDay();
    const mon = new Date(d);
    mon.setDate(d.getDate() + diff);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return [fmtDate(mon), fmtDate(sun)];
  }
  function monthBounds(s) {
    const d = parseDate(s);
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return [fmtDate(first), fmtDate(last)];
  }
  function mdShort(s) {
    const d = parseDate(s);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }
  function formatDateLabel(s) {
    const d = parseDate(s);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${weekLabel(d)}`;
  }
  function humanDateLabel(s) {
    const t = todayStr();
    if (s === t) return "今天";
    if (s === addDays(t, 1)) return "明天";
    if (s === addDays(t, 2)) return "后天";
    const d = parseDate(s);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  }
  function relDateFromText(text) {
    if (/今天|今日|当天|当日|今儿/.test(text)) return todayStr();
    if (/大后天/.test(text)) return addDays(todayStr(), 3);
    if (/明[早早晚日天]/.test(text)) return addDays(todayStr(), 1);
    if (/后[天日]/.test(text)) return addDays(todayStr(), 2);
    const nwk = text.match(/下周([一二三四五六日天])/);
    if (nwk) {
      const target = WK[nwk[1]];
      const cur = new Date();
      const diff = (target - cur.getDay() + 7) % 7;
      return addDays(todayStr(), diff === 0 ? 7 : diff + 7);
    }
    const wk = text.match(/(?:星期|周|礼拜)([一二三四五六日天])/);
    if (wk) {
      const target = WK[wk[1]];
      const cur = new Date();
      const diff = (target - cur.getDay() + 7) % 7;
      return addDays(todayStr(), diff);
    }
    const md1 = text.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*[日号]?/);
    if (md1) {
      const y = new Date().getFullYear(),
        mo = +md1[1],
        da = +md1[2];
      if (mo >= 1 && mo <= 12 && da >= 1 && da <= 31) {
        let r = new Date(y, mo - 1, da);
        if (r < parseDate(todayStr())) r = new Date(y + 1, mo - 1, da);
        return fmtDate(r);
      }
    }
    const md2 = text.match(/(\d{1,2})[./](\d{1,2})/);
    if (md2) {
      const y = new Date().getFullYear(),
        mo = +md2[1],
        da = +md2[2];
      if (mo >= 1 && mo <= 12 && da >= 1 && da <= 31) {
        let r = new Date(y, mo - 1, da);
        if (r < parseDate(todayStr())) r = new Date(y + 1, mo - 1, da);
        return fmtDate(r);
      }
    }
    const md3 = text.match(/(\d{1,2})\s*号/);
    if (md3) {
      const da = +md3[1];
      const t = parseDate(todayStr());
      let r = new Date(t.getFullYear(), t.getMonth(), da);
      if (r < parseDate(todayStr())) r.setMonth(r.getMonth() + 1);
      return fmtDate(r);
    }
    return "";
  }
  function scopeItems(list, sc) {
    const norm = (i) => i.date || todayStr();
    const [rs, re] = scopeRange(sc);
    // 展开重复日程为范围内具体日期的实例（与鸿蒙端逻辑一致，便于回迁）
    const expanded = [];
    list.forEach((it) => {
      if (!it.repeat || it.repeat === "none") {
        expanded.push(it);
        return;
      }
      let cur = norm(it);
      if (cur < rs) cur = rs;
      const baseDow = parseDate(norm(it)).getDay();
      while (cur <= re) {
        const ok = it.repeat === "daily" || parseDate(cur).getDay() === baseDow;
        if (ok) expanded.push(Object.assign({}, it, { date: cur, repeatInstance: true }));
        cur = addDays(cur, 1);
      }
    });
    if (sc.mode === "day") return expanded.filter((i) => norm(i) === sc.anchor);
    if (sc.mode === "week") {
      const [a, b] = weekBounds(sc.anchor);
      return expanded.filter((i) => {
        const d = norm(i);
        return d >= a && d <= b;
      });
    }
    if (sc.mode === "month") {
      const d = parseDate(sc.anchor);
      const y = d.getFullYear(),
        m = d.getMonth();
      return expanded.filter((i) => {
        const x = parseDate(norm(i));
        return x.getFullYear() === y && x.getMonth() === m;
      });
    }
    return expanded;
  }
  // 当前范围的起止日期（含）
  function scopeRange(sc) {
    if (sc.mode === "day") return [sc.anchor, sc.anchor];
    if (sc.mode === "week") return weekBounds(sc.anchor);
    const d = parseDate(sc.anchor);
    const y = d.getFullYear(),
      m = d.getMonth();
    const first = `${y}-${pad(m + 1)}-01`;
    const last = `${y}-${pad(m + 1)}-${pad(new Date(y, m + 1, 0).getDate())}`;
    return [first, last];
  }
  function scopeTitle(sc) {
    if (sc.mode === "day")
      return {
        title: sc.anchor === todayStr() ? "今日概览" : humanDateLabel(sc.anchor),
        sub: formatDateLabel(sc.anchor),
      };
    if (sc.mode === "week") {
      const [a, b] = weekBounds(sc.anchor);
      const isThis = weekBounds(todayStr())[0] === a;
      return { title: isThis ? "本周概览" : "周概览", sub: `${mdShort(a)} – ${mdShort(b)}` };
    }
    const d = parseDate(sc.anchor);
    return { title: `${d.getFullYear()}年${d.getMonth() + 1}月概览`, sub: "" };
  }
  // 当前查看范围（日/周/月，anchor 为基准日期）
  let scope = { mode: "day", anchor: todayStr() };

  function computeStatsFor(list) {
    const map = {};
    let total = 0;
    list.forEach((it) => {
      const d = parseHM(it.endTime) - parseHM(it.startTime);
      if (d > 0) {
        map[it.tag] = (map[it.tag] || 0) + d;
        total += d;
      }
    });
    const dist = Object.keys(map)
      .map((tag) => ({
        tag,
        hours: map[tag],
        percent: total ? +((map[tag] / total) * 100).toFixed(1) : 0,
        color: getColorForTag(tag),
      }))
      .sort((a, b) => b.hours - a.hours);
    return {
      timeDist: dist,
      totalHours: total,
      totalCount: list.length,
      completedCount: list.filter((i) => isDone(i)).length,
      efficiency: list.length ? Math.round((list.filter((i) => isDone(i)).length / list.length) * 100) : 0,
    };
  }
  // 大类汇总：把 timeDist 按"标签所属正经大类"聚合（自定义/趣味标签归入大类）
  function catDistOf(stats) {
    const cm = {};
    (stats.timeDist || []).forEach((d) => {
      const c = tagCategory(d.tag);
      cm[c] = (cm[c] || 0) + d.hours;
    });
    const total = Object.values(cm).reduce((s, v) => s + v, 0);
    return Object.keys(cm)
      .map((cat) => ({ cat, hours: cm[cat], percent: total ? Math.round((cm[cat] / total) * 100) : 0, color: getColorForTag(cat) }))
      .sort((a, b) => b.hours - a.hours);
  }
  function computeStats() {
    return computeStatsFor(Store.state.schedule);  }

  // 空闲时段推荐
  function freeSlots() {
    const nowH = new Date().getHours();
    const today = Store.state.schedule.filter((i) => (i.date || todayStr()) === todayStr());
    const sorted = [...today].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const future = sorted.filter((i) => +i.startTime.split(":")[0] >= nowH);
    const slots = [];
    if (future.length) {
      const first = +future[0].startTime.split(":")[0];
      if (first > nowH) slots.push(`${pad(nowH)}:00 - ${pad(first)}:00`);
      for (let i = 0; i < future.length - 1; i++) {
        const ce = +future[i].endTime.split(":")[0];
        const ns = +future[i + 1].startTime.split(":")[0];
        if (ce < ns) slots.push(`${pad(ce)}:00 - ${pad(ns)}:00`);
      }
    }
    return slots;
  }

  /* ============================================================
     目标系统（教练层）：用户设定目标 → AI 守护进度
     - prefs.goals = [{ id, title, cat(大类), period("day"|"week"), hours }]
     - goalProgress() 统计当前周期(今天/本周)目标大类的投入时长与达标情况
     ============================================================ */
  function goalProgress() {
    const goals = Store.state.prefs.goals || [];
    const t = todayStr();
    return goals.map((gl) => {
      const items =
        gl.period === "day"
          ? scopeItems(Store.state.schedule, { mode: "day", anchor: t })
          : scopeItems(Store.state.schedule, { mode: "week", anchor: t });
      const hours = items
        .filter((i) => tagCategory(i.tag) === gl.cat)
        .reduce((s, i) => s + Math.max(0, parseHM(i.endTime) - parseHM(i.startTime)), 0);
      return {
        ...gl,
        hours,
        done: hours >= gl.hours,
        pct: gl.hours ? Math.min(100, Math.round((hours / gl.hours) * 100)) : 0,
        remain: Math.max(0, Math.round((gl.hours - hours) * 10) / 10),
      };
    });
  }
  function goalText(g) {
    return `${g.title}（${g.period === "day" ? "每天" : "每周"} ${g.hours}h · ${g.cat}类）`;
  }
  // 近 30 天完成时间偏差均值（≥15 分钟才返回，供动态提醒补偿）
  function lateMinAvg() {
    const t = todayStr();
    const dev = [];
    Store.state.schedule.forEach((i) => {
      if (!isDone(i) || !i.doneAt) return;
      const d = i.date || t;
      if (d < addDays(t, -30) || d > t) return;
      const dt = new Date(i.doneAt);
      dev.push(dt.getHours() * 60 + dt.getMinutes() - parseHM(i.endTime));
    });
    if (dev.length < 3) return 0;
    const avg = dev.reduce((s, v) => s + v, 0) / dev.length;
    return avg >= 15 ? Math.round(avg) : 0;
  }

  // 生成日程上下文（供 AI 感知用户真实日程，避免模型臆造/撞期）
  // range: "day"=仅今日 | "week"=本周 | "month"=本月 | "all"=全局摘要 | {from,to}=自定义区间
  const CHAT_MEMORY_OPTS = [
    { key: "day", label: "仅当日" },
    { key: "week", label: "本周" },
    { key: "month", label: "本月" },
    { key: "all", label: "全局" },
    { key: "custom", label: "自定义" },
  ];
  function chatMemoryLabel(key) {
    const o = CHAT_MEMORY_OPTS.find((x) => x.key === key);
    return o ? o.label : "本周";
  }
  function scheduleContext(range) {
    const t = todayStr();
    const dayLine = (d, label) => {
      const items = scopeItems(Store.state.schedule, { mode: "day", anchor: d });
      if (!items.length) return "";
      const row = items
        .slice()
        .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))
        .map((it) => `${it.startTime}-${it.endTime} ${it.title}${isDone(it) ? "（已完成）" : ""}${it.tag ? " /" + it.tag : ""}`)
        .join("；");
      return `${label}：${row}`;
    };
    // 区间明细：逐日展开，上限 40 条防 token 爆炸
    const rangeLines = (from, to, label) => {
      const out = [];
      let d = from;
      let guard = 0;
      while (d <= to && guard < 800 && out.length < 40) {
        const items = scopeItems(Store.state.schedule, { mode: "day", anchor: d });
        items
          .slice()
          .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))
          .forEach((it) =>
            out.push(`${d} ${it.startTime}-${it.endTime} ${it.title}${isDone(it) ? "（已完成）" : ""}${it.tag ? " /" + it.tag : ""}`)
          );
        d = addDays(d, 1);
        guard++;
      }
      const total = Store.state.schedule.length;
      return out.length
        ? `${label}（共 ${total} 条记录，展示前 ${out.length} 条）：\n${out.join("\n")}`
        : `${label}暂无日程`;
    };
    if (range === "day") return dayLine(t, "今天") || "今天暂无日程";
    if (range === "week") {
      const [a, b] = weekBounds(t);
      return rangeLines(a, b, `本周（${a}~${b}）`);
    }
    if (range === "month") {
      const [a, b] = monthBounds(t);
      return rangeLines(a, b, `本月（${a}~${b}）`);
    }
    if (range === "all") {
      const total = Store.state.schedule.length;
      const summary = `全局共 ${total} 条日程记录`;
      const recent = rangeLines(addDays(t, -3), addDays(t, 14), "近期（前3天~后14天）");
      return `${summary}\n${recent}`;
    }
    if (range && range.from && range.to) return rangeLines(range.from, range.to, `自定义区间（${range.from}~${range.to}）`);
    return dayLine(t, "今天") || "今天暂无日程";
  }

  function buildAdvice(stats, sc) {
    const sc_ = sc || scope;
    const isToday = sc_.mode === "day" && sc_.anchor === todayStr();
    const label = sc_.mode === "week" ? "本周" : sc_.mode === "month" ? "本月" : "今日";
    const scoped = scopeItems(Store.state.schedule, sc_);
    if (!scoped.length) {
      if (!Store.state.schedule.length)
        return "还没有任何安排哦。点击右上角 AI 图标或直接告诉我，就能智能规划你的时间啦～";
      return `${label}暂时还没有日程，去首页规划一件小事吧，比如「明早 8 点背单词 1 小时」。`;
    }
    const timeStr = (it) =>
      it.startTime ? (it.endTime && it.endTime !== it.startTime ? `${it.startTime}-${it.endTime}` : it.startTime) : "";
    const sorted = [...scoped].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
    const done = stats.completedCount,
      total = stats.totalCount;
    const parts = [];
    if (total === 1) {
      // 仅 1 项：聚焦该事项本身，不谈"分类失衡/多任务协调"
      const it = sorted[0];
      const itDone = isDone(it);
      parts.push(`${label}只规划了「${it.title}」一项${timeStr(it) ? `（${timeStr(it)}）` : ""}${itDone ? "，已完成，节奏不错" : "，还没完成"}。`);
      parts.push(
        itDone
          ? "可以再补 1-2 件小事，或留一段空白休息，让一天更从容。"
          : `建议现在就做：把「${it.title}」拆成 25 分钟的小步骤开始，动起来就不会觉得难了。`
      );
    } else {
      parts.push(`${label}已规划 ${stats.totalHours.toFixed(1)} 小时，完成 ${done}/${total} 项。`);
      const nxt = sorted.find((i) => !isDone(i));
      if (nxt) parts.push(`优先处理「${nxt.title}」${nxt.startTime ? `（${nxt.startTime} 开始）` : ""}，先啃最要紧的一块。`);
      else if (total > 0) parts.push("全部完成，执行力很棒，记得留点时间休息。");
    }
    const slots = isToday ? freeSlots() : [];
    if (slots.length) parts.push(`空闲时段 ${slots.join("、")}，适合休息或碎片化学习。`);
    return parts.join(" ");
  }

  /* ============================================================
     首页 AI 洞察（P0）：API 优先生成"今日/本周/本月"一句话洞察
     - 5 分钟缓存，避免反复切换范围重复调用浪费 token
     - 无 Key / 调用失败 → 回退离线 buildAdvice，保证零依赖
     ============================================================ */
  // 多槽缓存：按「日/周/月 + 日期 + 数据指纹」各自缓存，切换范围后切回能直接命中（避免离线闪屏 + 重复消耗 token）
  const insightCache = new Map();
  function insightKey(stats) {
    const sc = scope;
    // 仅用「当前查看范围」的维度，避免依赖全局 schedule.length 造成 stale 命中
    return `${sc.mode}:${sc.anchor}:${stats.completedCount}:${stats.totalCount}:${Math.round(stats.totalHours * 10)}`;
  }
  async function genInsight(stats) {
    const key = insightKey(stats);
    const hit = insightCache.get(key);
    // 缓存只存模型结果，命中即「AI 在线」
    if (hit && Date.now() - hit.at < 90 * 1000) return { text: hit.text, via: "ai" };
    if (!apiReady()) return { text: buildAdvice(stats, scope), via: "offline" };
    const label = scope.mode === "week" ? "本周" : scope.mode === "month" ? "本月" : "今日";
    const withDate = scope.mode !== "day";
    const scoped = scopeItems(Store.state.schedule, scope);
    const rows = scoped
      .map(
        (it) =>
          `${withDate ? (it.date || todayStr()) + " " : ""}${it.startTime}-${it.endTime} ${it.title}${isDone(it) ? "（已完成）" : "（未完成）"}${it.tag ? " /" + it.tag : ""}`
      )
      .join("\n");
    const prompt =
      `你是用户的私人时间管理洞察助手。今天真实日期：${todayStr()}。\n` +
      `关于用户的长期习惯观察（供参考，与下方日程矛盾时以下方日程为准）：${buildUserProfile() || "（历史数据不足）"}\n` +
      `用户当前查看「${label}」概览，该周期严格只有下面列出的 ${scoped.length} 个日程（${withDate ? "日期 " : ""}时间 事项 状态 /分类）：\n${rows || "（该周期暂无日程）"}\n` +
      `【硬性要求】你的分析必须完全基于上述真实日程，严禁臆造任何未列出的日程、数字或完成情况；若只有 1 个日程，就不要谈"分类失衡/多任务协调"，请聚焦这一个事项本身给建议。` +
      `用户的自定义标签可能是个性化/趣味命名（如中二风格），请依据日程标题理解其真实性质，并按标签所属的正经大类（学习/工作/运动/饮食/休息/社交/其他）归类分析，不要被标签名字迷惑。\n` +
      `请输出最多 3 句：① 一句话贴合实际的总评；② 1 条针对现有日程的具体可执行改进建议（如把某事项提前、补全休息、降低密度）；③ 如需，1 句鼓励。` +
      `全文 90 字以内，自然中文，不用列表符号、不用加粗、不用 emoji、不夸张。`;
    try {
      const text = await callLLM(
        [
          { role: "system", content: `你是严谨又温暖的私人时间管理洞察助手。${personaPromptLine()}` },
          { role: "user", content: prompt },
        ],
        { temperature: 0.6, maxTokens: 500, timeoutMs: 30000 }
      );
      const clean = text.replace(/\s*\n+\s*/g, " ").trim().slice(0, 200);
      insightCache.set(key, { text: clean, at: Date.now() });
      if (insightCache.size > 12) insightCache.clear(); // 防止跨天累积无限增长
      logWeeklyInsight(clean);
      return { text: clean, via: "ai" };
    } catch (e) {
      const fb = buildAdvice(stats, scope);
      logWeeklyInsight(fb);
      return { text: fb, via: "offline" };
    }
  }

  /* ============================================================
     Toast / 浮层工具
     ============================================================ */
  let toastSeq = 0;
  function toast(msg, type = "ok", action) {
    const actions = Array.isArray(action) ? action : action ? [action] : [];
    const wrap = $("#toastWrap");
    const id = "t" + toastSeq++;
    const node = document.createElement("div");
    node.className = "toast " + type;
    node.id = id;
    node.innerHTML =
      (type !== "ok" && type !== "warn" && type !== "err" ? "" : `<span>${svg(type === "ok" ? "check" : type === "warn" ? "bulb" : "close")}</span>`) +
      `<span>${esc(msg)}</span>` +
      actions.map((a) => `<button class="act">${esc(a.label)}</button>`).join("");
    wrap.appendChild(node);
    const ttl = actions.length ? 6000 : 2600;
    const timer = setTimeout(() => dismiss(), ttl);
    function dismiss() {
      clearTimeout(timer);
      node.classList.add("out");
      setTimeout(() => node.remove(), 300);
    }
    actions.forEach((a, i) => {
      const btn = node.querySelectorAll(".act")[i];
      if (btn)
        btn.addEventListener("click", () => {
          a.onClick && a.onClick();
          dismiss();
        });
    });
    // 超过 3 条自动清理最旧
    while (wrap.children.length > 3) wrap.firstChild.remove();
  }

  /* ---------- 触感反馈（安卓 WebView 支持 navigator.vibrate） ---------- */
  function haptic(ms = 20) {
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(ms);
    } catch (e) {}
  }

  /* ---------- 去重检测：同日同名视为重复 ---------- */
  function findDupes(item) {
    const date = item.date || todayStr();
    return Store.state.schedule.filter((x) => x.id !== item.id && (x.date || todayStr()) === date && x.title === item.title);
  }

  /* ---------- 统一撤销：单条快照 + toast 撤销按钮 ---------- */
  let undoSnap = null;
  function undoableToast(msg, tone, snap) {
    undoSnap = snap;
    toast(msg, tone, {
      label: "撤销",
      onClick: () => {
        const s = undoSnap;
        undoSnap = null;
        if (!s) return;
        try {
          if (s.kind === "remove") Store.addSchedule(Object.assign({}, s.item));
          else if (s.kind === "patch") Store.updateSchedule(s.id, s.before);
          else if (s.kind === "adds") s.ids.forEach((x) => Store.removeSchedule(x));
        } catch (e) {}
        renderCurrent();
        toast("已撤销", "ok");
      },
    });
  }

  const overlay = $("#overlay");
  /* ---------- 功能按钮提示系统：给 data-act 元素补 title 说明（已有 title 不覆盖） ---------- */
  const ACT_HINTS = {
    "optimize-today": "按优先级和空闲时间，一键重排今天未完成的事项",
    "open-chat": "打开 AI 时间管家，可对话、调教语气、操作日程",
    "weekly-review": "回顾上周 AI 建议的执行情况，生成周复盘",
    "gen-report": "生成当前范围的 AI 日报",
    "toggle-form": "展开 / 收起添加日程表单",
    "save-api": "保存 API 配置（填 Key 即启用在线 AI）",
    "open-persona": "调教 AI 的语气风格，可命名备份多套人格",
    "open-goals": "设定每天/每周在某大类的投入目标，AI 会跟踪并提醒进度",
    "open-catman": "管理分类标签：自定义命名、归入正经大类",
    "del-cat": "删除自定义分类（内置分类不可删）",
    "open-history": "查看历史日程记录",
    "open-prefs": "AI 偏好设置",
    "open-backup": "备份 / 恢复本地数据",
    "open-privacy": "查看隐私政策",
    "open-terms": "查看用户协议",
    "open-help": "帮助与反馈",
    "stat-detail": "点击查看该项详细数据",
    "open-issues": "查看冲突 / 过载预警详情",
  };
  function applyActHints(root) {
    (root || document).querySelectorAll("[data-act]").forEach((el) => {
      if (el.hasAttribute("title")) return;
      const h = ACT_HINTS[el.dataset.act];
      if (h) el.title = h;
    });
  }

  function openSheet(html, opts = {}) {
    overlay.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
    overlay.classList.add("show");
    overlay.setAttribute("aria-hidden", "false");
    overlay.querySelectorAll("[data-close]").forEach((btn) => btn.addEventListener("click", closeSheet));
    if (opts.onOpen) opts.onOpen(overlay.querySelector(".sheet"));
    applyActHints(overlay.querySelector(".sheet"));
    return overlay.querySelector(".sheet");
  }
  function closeSheet() {
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");
    setTimeout(() => (overlay.innerHTML = ""), 260);
  }
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay && !overlay.querySelector(".sheet.noclose")) closeSheet();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("show")) closeSheet();
  });

  /* ============================================================
     环形图（SVG 动画绘制）
     ============================================================ */
  function renderRing(mount, dist, totalHours) {
    const size = 132,
      stroke = 13,
      r = (size - stroke) / 2,
      c = 2 * Math.PI * r,
      cx = size / 2;
    let parts = `<circle class="track" cx="${cx}" cy="${cx}" r="${r}"></circle>`;
    let acc = 0;
    dist.forEach((d) => {
      const frac = d.percent / 100;
      const dash = frac * c;
      // 起点统一由 CSS .ring svg 的 rotate(-90) 处理，这里只累加各段角度，避免双重旋转导致错位/重叠
      const rot = acc * 360;
      acc += frac;
      // 初始 offset = dash 把实线藏到 gap 之后，动画到 0 即从起点展开正确弧长
      parts += `<circle class="seg" cx="${cx}" cy="${cx}" r="${r}" stroke="${d.color}" stroke-dasharray="${dash.toFixed(2)} ${c.toFixed(2)}" stroke-dashoffset="${dash.toFixed(2)}" transform="rotate(${rot.toFixed(2)} ${cx} ${cx})" data-final="0"></circle>`;
    });
    mount.innerHTML = `<svg viewBox="0 0 ${size} ${size}">${parts}</svg>
      <div class="center"><div class="num">${totalHours.toFixed(1)}h</div><div class="lbl">已规划时长</div></div>`;
    requestAnimationFrame(() => {
      $$(".seg", mount).forEach((s) => (s.style.strokeDashoffset = s.dataset.final));
    });
  }

  /* ============================================================
     页面路由 + 视图渲染
     ============================================================ */
  const view = $("#view");
  let currentTab = 0;
  const freshTimers = new Set();

  function navigate(idx) {
    currentTab = idx;
    $$(".tab-item", $("#tabbar")).forEach((t, i) => {
      t.classList.toggle("active", i === idx);
      t.classList.toggle("has-badge", i === 0 && hasFresh());
    });
    view.scrollTop = 0;
    renderCurrent();
  }
  function hasFresh() {
    return Store.state.schedule.some((i) => i.isFresh);
  }
  function renderCurrent() {
    if (currentTab === 0) renderHome();
    else if (currentTab === 1) renderSchedule();
    else if (currentTab === 2) renderStatistics();
    else renderMine();
  }

  /* ----------------------- 空状态插画 ----------------------- */
  function emptyArt(kind) {
    if (kind === "schedule")
      return `<svg class="art" viewBox="0 0 120 120" fill="none">
        <rect x="22" y="20" width="76" height="80" rx="10" stroke="currentColor" stroke-width="3" opacity=".5"/>
        <path d="M22 38h76" stroke="currentColor" stroke-width="3" opacity=".5"/>
        <rect x="36" y="50" width="48" height="7" rx="3.5" fill="currentColor" opacity=".3"/>
        <rect x="36" y="64" width="34" height="7" rx="3.5" fill="currentColor" opacity=".3"/>
        <circle cx="86" cy="84" r="20" fill="var(--primary-soft)"/>
        <path d="M86 76v8M86 92h.01" stroke="var(--primary)" stroke-width="3" stroke-linecap="round"/></svg>`;
    if (kind === "stats")
      return `<svg class="art" viewBox="0 0 120 120" fill="none">
        <path d="M30 80V52M52 80V36M74 80V46M96 80V60" stroke="currentColor" stroke-width="6" stroke-linecap="round" opacity=".35"/>
        <circle cx="60" cy="60" r="46" stroke="var(--primary)" stroke-width="3" opacity=".4" stroke-dasharray="6 8"/></svg>`;
    return `<svg class="art" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="40" stroke="currentColor" stroke-width="3" opacity=".4"/>
      <path d="M44 60h32M60 44v32" stroke="var(--primary)" stroke-width="4" stroke-linecap="round" opacity=".6"/></svg>`;
  }

  /* ============================================================
     首页
     ============================================================ */
  /* 范围切换条（日/周/月 + 左右翻页） */
  function scopeBar() {
    const seg = (m, l) =>
      `<button class="seg-btn ${scope.mode === m ? "on" : ""}" data-act="set-scope" data-mode="${m}">${l}</button>`;
    const unit = scope.mode === "month" ? "月" : scope.mode === "week" ? "周" : "天";
    return `<div class="scope-bar">
      <button class="nav-arrow" data-act="scope-prev" title="上一${unit}" aria-label="上一${unit}">${svg("chevron")}</button>
      <div class="seg">${seg("day", "日")}${seg("week", "周")}${seg("month", "月")}</div>
      <button class="nav-arrow" data-act="scope-next" title="下一${unit}" aria-label="下一${unit}"><span class="rot">${svg("chevron")}</span></button>
    </div>`;
  }
  function shiftMonth(s, n) {
    const d = parseDate(s);
    d.setMonth(d.getMonth() + n);
    return fmtDate(d);
  }
  function repeatBadge(it) {
    const l = it.repeat === "daily" ? "每天" : it.repeat === "weekly" ? "每周" : "";
    return l ? `<span class="repeat-badge" title="重复日程">${svg("repeat")}${l}</span>` : "";
  }
  function prioBadge(it) {
    if (it.priority === "高") return `<span class="prio-badge high" title="高优先级">高</span>`;
    if (it.priority === "低") return `<span class="prio-badge low" title="低优先级">低</span>`;
    return "";
  }
  function tlItemHTML(it) {
    const color = getColorForTag(it.tag);
    const ct = contrastText(color);
    return `<div class="tl-item" data-id="${it.id}" data-date="${it.date}">
      <div class="tl-left"><span class="tl-time">${it.startTime}</span>
        <div class="tl-rail"><span class="node" style="background:${color}"></span><span class="line"></span></div>
      </div>
      <div class="tl-body ${it.isFresh ? "fresh" : ""}" data-id="${it.id}" data-date="${it.date}">
        <div class="tl-row1">
          <span class="tl-title ${isDone(it) ? "done" : ""}">${esc(it.title)}</span>
          ${prioBadge(it)}
          <span class="tag" style="background:${color};color:${ct}">${esc(it.tag)}</span>
          ${repeatBadge(it)}
        </div>
        ${it.desc ? `<div class="tl-desc ${isDone(it) ? "done" : ""}">${esc(it.desc)}</div>` : ""}
        <div class="tl-actions">
          <button class="tl-mini ok ${isDone(it) ? "on" : ""}" data-act="toggle" data-id="${it.id}" data-date="${it.date}">${svg("check")} ${isDone(it) ? "已完成" : "完成"}</button>
          <button class="tl-mini" data-act="edit" data-id="${it.id}">${svg("edit")} 编辑</button>
          <button class="tl-mini" data-act="tag" data-id="${it.id}">${svg("tag")} 分类</button>
          <button class="tl-mini del" data-act="del" data-id="${it.id}">${svg("trash")} 删除</button>
        </div>
      </div>
    </div>`;
  }
  function groupByDate(list) {
    const m = {};
    list.forEach((it) => {
      const d = it.date || todayStr();
      (m[d] = m[d] || []).push(it);
    });
    return Object.keys(m)
      .sort()
      .map((d) => [d, m[d]]);
  }

  /* ---------- 首页「今日焦点」置顶条（P0）：下一项 / 正在进行 / 过期未打卡 ---------- */
  function toMin(t) {
    const p = t.split(":");
    return +p[0] * 60 + +p[1];
  }
  function fmtDurMin(m) {
    if (m < 60) return m + " 分钟";
    return m % 60 === 0 ? m / 60 + " 小时" : Math.floor(m / 60) + " 小时 " + (m % 60) + " 分";
  }
  function todayFocusHTML() {
    if (scope.mode !== "day" || scope.anchor !== todayStr()) return "";
    const list = Store.state.schedule.filter((i) => (i.date || todayStr()) === todayStr());
    if (!list.length) return "";
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    const sorted = list.slice().sort((a, b) => a.startTime.localeCompare(b.startTime));
    const missed = sorted.filter((i) => !isDone(i) && toMin(i.endTime) < nowMin);
    const ongoing = sorted.filter((i) => !isDone(i) && toMin(i.startTime) <= nowMin && toMin(i.endTime) >= nowMin);
    const upcoming = sorted.filter((i) => !isDone(i) && toMin(i.startTime) > nowMin);
    let icon = "clock",
      tone = "info",
      text = "";
    if (ongoing.length) {
      icon = "bolt";
      tone = "ok";
      text = `正在进行「${ongoing[0].title}」（${ongoing[0].startTime}~${ongoing[0].endTime}），专注完成它`;
    } else if (upcoming.length) {
      const n = upcoming[0];
      const diff = toMin(n.startTime) - nowMin;
      if (diff <= 30) {
        icon = "bolt";
        tone = "ok";
        text = `下一项「${n.title}」${diff} 分钟后开始（${n.startTime}）`;
      } else {
        icon = "clock";
        tone = "info";
        text = `距离「${n.title}」还有约 ${fmtDurMin(diff)}，当前空闲${missed.length ? `，另有 ${missed.length} 项过期未打卡可先处理` : "，可安排碎片任务或休息"}`;
      }
    } else if (missed.length) {
      // 已过未打卡：仅作信息展示，不作为 AI 排期入口（避免与对话舱重复）
      icon = "bolt";
      tone = "warn";
      text = `${missed.length} 项日程已过未打卡：${missed.slice(0, 2).map((i) => "「" + i.title + "」").join("、")}${missed.length > 2 ? " 等" : ""}`;
    } else {
      icon = "check";
      tone = "ok";
      text = "今日安排已全部结束，好好休息";
    }
    return `<div class="focus-bar ${tone} plain"><span class="fb-ico">${svg(icon)}</span><span class="fb-txt">${esc(text)}</span></div>`;
  }

  /* ---------- 首页冲突 / 过载检测（P1）：纯规则，不依赖 API ---------- */
  let lastIssues = [];
  function detectHomeIssues(scoped) {
    const issues = [];
    const byDate = {};
    scoped.forEach((i) => {
      const d = i.date || todayStr();
      (byDate[d] = byDate[d] || []).push(i);
    });
    Object.keys(byDate).forEach((d) => {
      const items = byDate[d].slice().sort((a, b) => a.startTime.localeCompare(b.startTime));
      // 时间重叠（相邻不视为冲突）
      for (let i = 0; i < items.length; i++) {
        let hit = false;
        for (let j = i + 1; j < items.length && !hit; j++) {
          if (items[j].startTime < items[i].endTime && items[j].endTime > items[i].startTime) {
            issues.push({ type: "conflict", date: d, a: items[i], b: items[j] });
            hit = true;
          }
        }
      }
      // 单日超 12 小时视为过载
      const totalMin = items.reduce((s, it) => s + (parseHM(it.endTime) - parseHM(it.startTime)) * 60, 0);
      if (totalMin > 720) issues.push({ type: "overload", date: d, hours: totalMin / 60, count: items.length });
    });
    return issues;
  }
  function issueBarHTML(scoped) {
    lastIssues = detectHomeIssues(scoped);
    if (!lastIssues.length) return "";
    const conflicts = lastIssues.filter((x) => x.type === "conflict").length;
    const overloads = lastIssues.filter((x) => x.type === "overload");
    const parts = [];
    if (conflicts) parts.push(`${conflicts} 处时间重叠`);
    overloads.forEach((o) => parts.push(`${humanDateLabel(o.date)}安排 ${o.hours.toFixed(0)}h 偏满`));
    return `<div class="issue-bar" role="button" tabindex="0" data-act="home-issues" title="查看详情与建议">
      <span class="ib-ico">${svg("bulb")}</span><span class="ib-txt">检测到：${esc(parts.join("；"))}，点此查看</span><span class="ib-go">${svg("chevron")}</span>
    </div>`;
  }
  function openIssuesSheet() {
    if (!lastIssues.length) return;
    const label = scope.mode === "week" ? "本周" : scope.mode === "month" ? "本月" : "今日";
    const rows = lastIssues
      .map((iss) => {
        if (iss.type === "conflict")
          return `<div class="d-row"><span class="ic warn">${svg("bolt")}</span>
            <span class="d-name">${humanDateLabel(iss.date)} ${iss.a.startTime}-${iss.b.startTime}</span>
            <span class="d-val">「${esc(iss.a.title)}」×「${esc(iss.b.title)}」重叠</span></div>`;
        return `<div class="d-row"><span class="ic warn">${svg("bolt")}</span>
          <span class="d-name">${humanDateLabel(iss.date)}</span>
          <span class="d-val">安排 ${iss.hours.toFixed(0)}h / ${iss.count} 项，偏满</span></div>`;
      })
      .join("");
    openSheet(
      `<div class="sheet-head"><div class="h">${label}日程预警</div><button class="x" data-close>${svg("close")}</button></div>
       <div class="detail-list">${rows}</div>
       <div class="card-sub mt2">提示：重叠日程可长按编辑调整时间；安排过满时建议拆分或删除低优先级事项。也可打开对话舱让 AI 帮忙重新安排。</div>`
    );
  }

  /* ============================================================
     首页 AI 行动卡（agent 主动观察引擎，纯本地规则零 token）
     - 持续检测数据模式：过载 / 深夜任务 / 连续未完成 / 完成率下滑 / 待办堆积 / 空闲时段
     - 发现问题 → 给一条可点击执行的动作（打开规划浮层预填 / 看冲突 / 生成日报）
     ============================================================ */
  function detectAgentActions(scoped, stats) {
    const t = todayStr();
    const actions = [];
    const isToday = scope.mode === "day" && scope.anchor === t;
    const nowH = new Date().getHours();
    // 1) 今日过载：已规划 > 10h（区别于预警条 >12h，行动卡更敏感）
    if (isToday && stats.totalHours > 10)
      actions.push({
        icon: "bolt",
        tone: "warn",
        title: "今天安排偏满",
        desc: `已规划 ${stats.totalHours.toFixed(1)} 小时，记得留出休息才能持续高效。`,
        act: "planner",
        prefill: "今晚安排 30 分钟休息",
        label: "安排休息",
      });
    // 2) 深夜任务：21 点后开始
    const night = scoped.filter((i) => !isDone(i) && parseHM(i.startTime) >= 21);
    if (night.length)
      actions.push({
        icon: "moon",
        tone: "warn",
        title: "有深夜任务",
        desc: `${night.slice(0, 2).map((i) => "「" + i.title + "」").join("、")}${night.length > 2 ? " 等" : ""} 在 21 点后开始，容易挤压休息。`,
        act: "planner",
        prefill: `把${night[0].title}改到 20 点前`,
        label: "调早一点",
      });
    // 3) 连续多日未完成：近 3 天同标题出现 ≥2 次且未打卡
    const miss = {};
    Store.state.schedule.forEach((i) => {
      const d = i.date || t;
      if (!isDone(i) && d >= addDays(t, -3) && d <= t) miss[i.title] = (miss[i.title] || 0) + 1;
    });
    const missTop = Object.entries(miss).sort((a, b) => b[1] - a[1])[0];
    if (missTop && missTop[1] >= 2)
      actions.push({
        icon: "repeat",
        tone: "warn",
        title: `「${missTop[0]}」连续 ${missTop[1]} 天没完成`,
        desc: "总是排在后面容易被挤掉，建议挪到精力最好的时段。",
        act: "planner",
        prefill: `把${missTop[0]}改到早上 8 点`,
        label: "调时间",
      });
    // 4) 完成率下滑：近 7 天 vs 前 7 天，降幅 ≥25%
    const rateIn = (from, to) => {
      const items = [];
      let d = from,
        g = 0;
      while (d <= to && g < 400) {
        scopeItems(Store.state.schedule, { mode: "day", anchor: d }).forEach((i) => items.push(i));
        d = addDays(d, 1);
        g++;
      }
      if (!items.length) return null;
      return items.filter((i) => isDone(i)).length / items.length;
    };
    const r1 = rateIn(addDays(t, -13), addDays(t, -7));
    const r2 = rateIn(addDays(t, -6), t);
    if (r1 !== null && r2 !== null && r1 - r2 >= 0.25 && r2 < 0.6)
      actions.push({
        icon: "chart",
        tone: "info",
        title: "近一周完成率下滑",
        desc: `从 ${Math.round(r1 * 100)}% 降到 ${Math.round(r2 * 100)}%，看看是不是安排太满或目标定高了。`,
        act: "planner",
        prefill: "重新安排今天的日程",
        label: "重新规划",
      });
    // 5) 午后仍有 ≥3 项待办
    if (isToday && nowH >= 12 && scoped.filter((i) => !isDone(i)).length >= 3)
      actions.push({
        icon: "clock",
        tone: "info",
        title: "今天还有不少待办",
        desc: "现在重新排一下剩余时间，能明显提高完成率。",
        act: "planner",
        prefill: "重新安排今天剩余日程",
        label: "重排剩余",
      });
    // 6) 有 ≥1h 整块空闲
    if (actions.length < 3) {
      const slots = isToday ? freeSlots() : [];
      const longSlot = slots.find((s) => {
        const [a, b] = s.split(" - ");
        return parseHM(b) - parseHM(a) >= 1;
      });
      if (longSlot)
        actions.push({
          icon: "headphones",
          tone: "ok",
          title: "有整块空闲时间",
          desc: `${longSlot} 空出来，适合学习充电或放松。`,
          act: "planner",
          prefill: `在${longSlot.split(" - ")[0]}安排 1 小时学习`,
          label: "安排它",
        });
    }
    return actions.slice(0, 3);
  }

  /* ============================================================
     一键"AI 优化今日"（本地规则重排，零 token）
     - 今天未完成事项按优先级(高→中→低)排序，从当前时间起放入空闲窗口（保留原时长）
     - 放不下的标记 drop（建议顺延）
     ============================================================ */
  const prioRank = (it) => (it.priority === "高" ? 3 : it.priority === "低" ? 1 : 2);
  const fmtHM = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
  function replanToday() {
    const t = todayStr();
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    const today = scopeItems(Store.state.schedule, { mode: "day", anchor: t });
    const undone = today.filter((i) => !isDone(i)).sort((a, b) => prioRank(b) - prioRank(a) || toMin(a.startTime) - toMin(b.startTime));
    if (!undone.length) return { plan: [], msg: "今天没有未完成的事项啦，都搞定了～" };
    const busy = today
      .filter((i) => isDone(i))
      .map((i) => [toMin(i.startTime), toMin(i.endTime)])
      .sort((a, b) => a[0] - b[0]);
    const plan = [];
    let cursor = nowMin;
    undone.forEach((it) => {
      const dur = Math.max(30, toMin(it.endTime) - toMin(it.startTime));
      let s = cursor;
      let guard = 0;
      while (guard++ < 200) {
        const e = s + dur;
        const clash = busy.some(([bs, be]) => s < be && e > bs);
        if (!clash && e <= 24 * 60) break;
        s += 15;
      }
      if (s + dur > 24 * 60) {
        plan.push({ id: it.id, title: it.title, start: "--:--", end: "--:--", drop: true });
        return;
      }
      busy.push([s, s + dur]);
      busy.sort((a, b) => a[0] - b[0]);
      plan.push({ id: it.id, title: it.title, start: fmtHM(s), end: fmtHM(s + dur), drop: false });
      cursor = s + dur;
    });
    return { plan, msg: "" };
  }
  function applyReplan(plan) {
    let applied = 0;
    plan.forEach((p) => {
      if (p.drop) return;
      const it = Store.state.schedule.find((x) => x.id === p.id);
      if (it) {
        Store.updateSchedule(p.id, { startTime: p.start, endTime: p.end });
        applied++;
      }
    });
    return applied;
  }

  /* ============================================================
     用户画像（长期记忆，本地规则零 token）
     - 从近 30 天日程提取：常安排时段 / 完成率基线 / 高频事项 / 深夜占比 / 高效时段
     - 注入洞察、日报、对话 prompt，让建议从"通用"变"懂你"
     ============================================================ */
  let profileCache = { at: 0, text: "" };
  function buildUserProfile() {
    const t = todayStr();
    const sched = Store.state.schedule;
    if (!sched.length) return "";
    if (profileCache.at && Date.now() - profileCache.at < 60 * 1000) return profileCache.text;
    const recent = sched.filter((i) => (i.date || t) >= addDays(t, -30) && (i.date || t) <= t);
    if (!recent.length) return "";
    const parts = [];
    const hourCnt = {};
    recent.forEach((i) => {
      const h = +i.startTime.split(":")[0];
      hourCnt[h] = (hourCnt[h] || 0) + 1;
    });
    const hours = Object.entries(hourCnt).sort((a, b) => b[1] - a[1]);
    if (hours.length) parts.push(`常安排时段 ${hours.slice(0, 3).map(([h]) => h + "点").join("、")}`);
    const twoWk = recent.filter((i) => (i.date || t) >= addDays(t, -14));
    if (twoWk.length) {
      const done = twoWk.filter((i) => isDone(i)).length;
      parts.push(`近两周完成率 ${Math.round((done / twoWk.length) * 100)}%`);
    }
    const freq = {};
    twoWk.forEach((i) => {
      freq[i.title] = (freq[i.title] || 0) + 1;
    });
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 3);
    if (top.length) parts.push(`高频事项 ${top.map(([k, v]) => k + "×" + v).join("、")}`);
    const night = recent.filter((i) => parseHM(i.startTime) >= 21).length;
    if (night) parts.push(`深夜任务占 ${Math.round((night / recent.length) * 100)}%`);
    const doneHours = recent.filter((i) => isDone(i)).map((i) => +i.startTime.split(":")[0]);
    if (doneHours.length) {
      const dh = {};
      doneHours.forEach((h) => {
        dh[h] = (dh[h] || 0) + 1;
      });
      const best = Object.entries(dh).sort((a, b) => b[1] - a[1])[0];
      if (best) parts.push(`高效时段 ${best[0]} 点`);
    }
    // 计划偏差：有 doneAt 时比较实际完成时间与计划结束时间
    const dev = [];
    recent.forEach((i) => {
      if (!isDone(i) || !i.doneAt) return;
      const d = new Date(i.doneAt);
      dev.push(d.getHours() * 60 + d.getMinutes() - parseHM(i.endTime));
    });
    if (dev.length >= 3) {
      const avg = dev.reduce((s, v) => s + v, 0) / dev.length;
      if (avg >= 15) parts.push(`平均比计划晚完成 ${Math.round(avg)} 分钟，排期建议留出缓冲`);
      else if (avg <= -15) parts.push(`平均比计划提前 ${Math.round(-avg)} 分钟完成，节奏很稳`);
    }
    profileCache = { at: Date.now(), text: parts.join("；") };
    return profileCache.text;
  }

  /* ============================================================
     Agent 人格（Persona）系统
     - 用户可在对话中实时调教语气/风格（"以后说话可爱一点"）
     - 支持恢复默认、命名备份、切换备份（备份持久化 prefs.persona.list）
     ============================================================ */
  function personaState() {
    const p = Store.state.prefs;
    if (!p.persona) p.persona = { current: "default", style: "", list: [] };
    return p.persona;
  }
  function personaStyle() {
    return personaState().style || "";
  }
  // 主动消息风格调味（轻量规则：含可爱/萌关键词时加颜文字，简洁风不加）
  function personaFlavor() {
    const s = personaStyle();
    if (/可爱|卖萌|萌|撒娇/.test(s)) return "～(｡･ω･｡)";
    if (/简洁|简短|干练/.test(s)) return "";
    return "～";
  }
  // 注入 prompt 的语气要求行
  function personaPromptLine() {
    const s = personaStyle();
    return s ? `\n语气风格（用户实时调教，务必严格遵守）：${s}` : "\n语气风格：自然友好，像朋友一样。";
  }

  /* ---------- 周/月环比趋势（P2）：较上一周期专注时长变化，纯离线 ---------- */
  function trendDelta() {    if (scope.mode === "day") return null;
    const cur = computeStatsFor(scopeItems(Store.state.schedule, scope));
    let prev = null;
    if (scope.mode === "week") {
      prev = computeStatsFor(scopeItems(Store.state.schedule, { mode: "week", anchor: addDays(scope.anchor, -7) }));
    } else {
      const d = parseDate(scope.anchor);
      const prevAnchor = fmtDate(new Date(d.getFullYear(), d.getMonth() - 1, 1));
      prev = computeStatsFor(scopeItems(Store.state.schedule, { mode: "month", anchor: prevAnchor }));
    }
    if (!prev || prev.totalHours <= 0 || cur.totalHours <= 0) return null;
    const unit = scope.mode === "week" ? "周" : "月";
    const diff = cur.totalHours - prev.totalHours;
    // 上一周期基数太小时百分比失真，改用绝对值差值
    if (prev.totalHours < 4) {
      const d = Math.round(diff * 10) / 10;
      return { label: `较上${unit}`, text: `${d > 0 ? "+" : ""}${d}h`, up: d >= 0 };
    }
    const pct = Math.round((diff / prev.totalHours) * 100);
    if (pct === 0) return { label: `较上${unit}`, text: "持平", up: true };
    return { label: `较上${unit}`, text: `${pct > 0 ? "↑" : "↓"} ${Math.abs(pct)}%`, up: pct > 0 };
  }

  function renderHome() {
    const scoped = scopeItems(Store.state.schedule, scope);
    const stats = computeStatsFor(scoped);
    const t = scopeTitle(scope);
    const advice = buildAdvice(stats, scope);
    const agentActions = detectAgentActions(scoped, stats);

    const ringLegend = stats.timeDist.length
      ? stats.timeDist
          .map(
            (d) =>
              `<div class="legend-row clickable" role="button" tabindex="0" data-act="tag-detail" data-tag="${esc(d.tag)}"><span class="dot" style="background:${d.color}"></span>
               <span class="name">${esc(d.tag)}</span>
               <span class="val">${d.hours.toFixed(1)}h</span>
               <span class="pct">${d.percent}%</span></div>`
          )
          .join("")
      : `<div class="muted" style="font-size:12.5px">暂无日程数据</div>`;

    let timeline;
    if (scope.mode === "day") {
      const list = [...scoped].sort((a, b) => a.startTime.localeCompare(b.startTime));
      timeline = list.length
        ? list.map(tlItemHTML).join("")
        : `<div class="empty">${emptyArt("schedule")}<div class="t">还没有${t.title === "今日概览" ? "今天的日程" : "这一天的日程"}</div><div class="s">点击下方 AI 按钮，用一句话就能智能排期 💡</div></div>`;
    } else {
      const groups = groupByDate(scoped);
      timeline = groups.length
        ? groups
            .map(([d, items]) => {
              const dayStats = computeStatsFor(items);
              const its = items.slice().sort((a, b) => a.startTime.localeCompare(b.startTime));
              return `<div class="day-group">
                <div class="day-head"><span class="dh-label">${humanDateLabel(d)}</span>
                  <span class="dh-sub">${weekLabel(parseDate(d))} · ${items.length} 项 · ${dayStats.totalHours.toFixed(1)}h</span></div>
                ${its.map(tlItemHTML).join("")}
              </div>`;
            })
            .join("")
        : `<div class="empty">${emptyArt("schedule")}<div class="t">这个${scope.mode === "week" ? "周" : "月"}还没有安排</div><div class="s">切换「日」或添加未来的计划试试</div></div>`;
    }

    const schedTitle = scope.mode === "day" ? "今日日程" : scope.mode === "week" ? "本周日程" : "本月日程";
    const trend = trendDelta();
    const focusBar = todayFocusHTML();
    const issueBar = issueBarHTML(scoped);

    view.innerHTML = `<div class="page">
      <div class="head">
        <div><div class="title">${esc(t.title)}</div><div class="sub">${esc(t.sub)}</div></div>
        <div class="spacer"></div>
        <button class="icon-btn" data-act="open-chat" title="AI 时间管家">${svg("sparkle")}</button>
      </div>

      ${scopeBar()}

      <div class="quick-actions mt1">
        <button class="chip-btn" data-act="copy-yesterday">${svg("repeat")} 和昨天一样</button>
        <button class="chip-btn" data-act="open-templates">${svg("folder")} 模板</button>
      </div>

      ${focusBar}
      ${issueBar}

      <div class="card">
        <div class="card-title">${svg("clock")} 时间分配
          ${trend ? `<span class="trend ${trend.up ? "up" : "down"}">${esc(trend.text)}<em>${esc(trend.label)}</em></span>` : ""}
        </div>
        <div class="ring-wrap mt2">
          <div class="ring" id="ring"></div>
          <div class="ring-legend">${ringLegend}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">${svg("list")} ${schedTitle}</div>
        <div class="timeline mt1">${timeline}</div>
      </div>

      <div class="card">
        <div class="card-title">${svg("brain")} AI 智能分析</div>
        <div class="stat-grid mt2">
          ${statCell("target", "专注时长", stats.totalHours.toFixed(1) + "h", "focus")}
          ${statCell("bolt", "效率评分", stats.efficiency + "分", "efficiency")}
          ${statCell("check", "已完成", stats.completedCount + "/" + stats.totalCount, "done")}
          ${statCell("bulb", "优化建议", "查看", "advice")}
        </div>
        <div class="advice">
          <span class="bulb">${svg("bulb")}</span>
          <div class="txt" id="homeAdviceTxt">${esc(advice)}</div>
          <span class="src-badge off" id="homeAdviceBadge" title="当前内容来源">本地规则</span>
        </div>
        <button class="btn block mt2" data-act="optimize-today" title="按优先级和空闲时间，一键重排今天未完成的事项">${svg("sparkle")} AI 优化今日</button>
        <div class="row2 mt2">
          <button class="btn soft" data-act="gen-report" title="按当前查看范围（日/周/月）生成 AI 日报">${svg("sparkle")} 生成完整日报</button>
          <button class="btn soft" data-act="weekly-review" title="回顾上周 AI 建议的执行情况，生成周复盘">${svg("chart")} 周复盘</button>
        </div>
        ${agentActions.length ? `<div class="agent-actions mt2">${agentActions
          .map(
            (a) => `
          <div class="agent-action ${a.tone}" role="button" tabindex="0" data-act="ai-act" data-kind="${a.act}" data-prefill="${esc(a.prefill || "")}" title="点击${a.label}">
            <span class="aa-ico">${svg(a.icon)}</span>
            <div class="aa-body"><div class="aa-t">${esc(a.title)}</div><div class="aa-d">${esc(a.desc)}</div></div>
            <span class="aa-btn">${esc(a.label)}</span>
          </div>`
          )
          .join("")}</div>` : ""}
      </div>
    </div>`;

    renderRing($("#ring"), stats.timeDist, stats.totalHours);
    wireHome();
    scheduleFreshClear();
    applyActHints(view);
    // AI 洞察异步升级：先展示离线建议，模型返回后无缝替换（带缓存），并同步徽标来源
    const aiTxt = $("#homeAdviceTxt");
    if (aiTxt)
      genInsight(stats).then((r) => {
        if (!aiTxt.isConnected) return;
        aiTxt.textContent = r.text;
        const badge = $("#homeAdviceBadge");
        if (badge) {
          const on = r.via === "ai";
          badge.textContent = on ? "AI 在线" : "本地规则";
          badge.classList.toggle("on", on);
          badge.classList.toggle("off", !on);
        }
      });
  }

  const STAT_TITLES = {
    focus: "专注时长：当前范围规划的日程总时长（点击看详情）",
    efficiency: "效率评分：已完成事项占全部事项的比例（点击看详情）",
    done: "已完成 / 全部事项数（点击看详情）",
    advice: "AI 对当前日程数据的优化建议（点击查看并生成日报）",
  };
  function statCell(icon, k, v, key) {
    return `<div class="stat-cell clickable" role="button" tabindex="0" data-act="stat-detail" data-key="${key}" title="${STAT_TITLES[key] || ""}"><span class="ico">${svg(icon)}</span><span class="v">${v}</span><span class="k">${k}</span><span class="go">${svg("chevron")}</span></div>`;
  }

  function wireHome() {
    // 长按展开操作 / 单击切换完成（避免长按松手误触完成）
    $$(".tl-item").forEach((item) => {
      const id = item.dataset.id;
      const date = item.dataset.date;
      const body = item.querySelector(".tl-body");
      let timer = null,
        suppressClick = false,
        sx = 0,
        sy = 0;
      const clearTimer = () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      };
      const onDown = (e) => {
        clearTimer();
        sx = e.clientX;
        sy = e.clientY;
        timer = setTimeout(() => {
          item.classList.toggle("expanded");
          suppressClick = true;
          setTimeout(() => (suppressClick = false), 360);
        }, 480);
      };
      // 仅在指针明显移动（拖动/滚动）时才取消长按，避免 pointerleave 误取消导致被当成单击"完成"
      const onMove = (e) => {
        if (timer && (Math.abs(e.clientX - sx) > 10 || Math.abs(e.clientY - sy) > 10)) clearTimer();
      };
      item.addEventListener("pointerdown", onDown);
      item.addEventListener("pointermove", onMove);
      item.addEventListener("pointerup", clearTimer);
      item.addEventListener("pointercancel", clearTimer);
      body.addEventListener("click", (e) => {
        if (e.target.closest("[data-act]")) return; // 交给委托处理（完成/删除/分类）
        if (suppressClick) return; // 长按刚触发，忽略本次点击（不误触完成）
        const before = JSON.parse(JSON.stringify(Store.state.schedule.find((x) => x.id === id) || {}));
        Store.toggleSchedule(id, date);
        haptic(30);
        renderCurrent();
        const now = Store.state.schedule.find((x) => x.id === id);
        const doneNow = now && (now.repeat && now.repeat !== "none" ? (now.doneDates || []).indexOf(date) >= 0 : !!now.isCompleted);
        undoableToast(doneNow ? `已完成「${item.title}」` : `已取消「${item.title}」的完成`, "ok", {
          kind: "patch",
          id,
          before: { isCompleted: before.isCompleted, doneAt: before.doneAt, doneAtMap: before.doneAtMap, doneDates: before.doneDates },
        });
      });
    });

    if (hasFresh()) {
      $$(".tab-item", $("#tabbar")).forEach((t, i) => t.classList.toggle("has-badge", i === 0));
    }
  }

  // 5 秒后清除"新鲜"高亮
  function scheduleFreshClear() {
    Store.state.schedule.forEach((it) => {
      if (it.isFresh && !freshTimers.has(it.id)) {
        freshTimers.add(it.id);
        setTimeout(() => {
          const cur = Store.state.schedule.find((x) => x.id === it.id);
          if (cur) {
            cur.isFresh = false;
            freshTimers.delete(it.id);
            Store.notify();
          }
        }, 5000);
      }
    });
  }

  /* ============================================================
     日程页
     ============================================================ */
  const schedUI = { open: false, sh: 9, sm: 0, dh: 1, dm: 0, tag: "其他", color: "#A1A1AA", custom: "", title: "", date: todayStr(), priority: "中", repeat: "none" };

  function renderSchedule() {
    const scoped = scopeItems(Store.state.schedule, scope);
    const list = [...scoped].sort(
      (a, b) =>
        (a.date || todayStr()).localeCompare(b.date || todayStr()) ||
        a.startTime.localeCompare(b.startTime)
    );
    const form = schedUI.open ? addFormHTML() : "";

    const schItemHTML = (it) => {
      const color = getColorForTag(it.tag);
      const ct = contrastText(color);
      return `<div class="sch-item" data-id="${it.id}" data-date="${it.date}">
        <span class="sch-time">${it.startTime}<br>~${it.endTime}</span>
        <div class="sch-main">
          <div class="sch-title ${isDone(it) ? "done" : ""}">${esc(it.title)}</div>
          <span class="tag mt1" style="background:${color};color:${ct}">${esc(it.tag)}</span>
          ${repeatBadge(it)}
        </div>
        <div class="sch-actions">
          <button class="sch-check ${isDone(it) ? "on" : ""}" data-act="toggle" data-id="${it.id}" data-date="${it.date}">${svg("check")}</button>
          <button class="sch-edit" data-act="edit" data-id="${it.id}" title="编辑">${svg("edit")}</button>
          <button class="sch-del" data-act="del" data-id="${it.id}" title="删除">${svg("trash")}</button>
        </div>
      </div>`;
    };

    const emptyHTML = `<div class="empty">${emptyArt("schedule")}<div class="t">${scope.mode === "day" ? "这一天还没有日程" : "这个" + (scope.mode === "week" ? "周" : "月") + "还没有日程"}</div><div class="s">点击右上角「添加日程」开始规划</div></div>`;

    let itemsHTML;
    if (scope.mode === "day") {
      itemsHTML = list.length ? list.map(schItemHTML).join("") : emptyHTML;
    } else {
      const groups = groupByDate(scoped);
      itemsHTML = groups.length
        ? groups
            .map(([d, items]) => {
              const its = items.slice().sort((a, b) => a.startTime.localeCompare(b.startTime));
              return `<div class="day-group">
                <div class="day-head"><span class="dh-label">${humanDateLabel(d)}</span>
                  <span class="dh-sub">${weekLabel(parseDate(d))} · ${items.length} 项</span></div>
                ${its.map(schItemHTML).join("")}
              </div>`;
            })
            .join("")
        : emptyHTML;
    }

    const titleMap = { day: scope.anchor === todayStr() ? "今日日程" : "日程", week: "本周日程", month: "本月日程" };
    view.innerHTML = `<div class="page">
      <div class="head">
        <div><div class="title">${titleMap[scope.mode]}</div><div class="sub">${esc(scopeTitle(scope).sub)} · 共 ${list.length} 项</div></div>
        <div class="spacer"></div>
        <button class="btn sm soft" data-act="toggle-form">${schedUI.open ? "收起" : "＋ 添加日程"}</button>
      </div>
      ${scopeBar()}
      <div id="formMount">${form}</div>
      <div id="listMount">${itemsHTML}</div>
    </div>`;
    if (schedUI.open) wireForm();
    applyActHints(view);
  }

  function addFormHTML() {
    const tagChips = allTags()
      .map(
        (t) =>
          `<span class="chip ${schedUI.tag === t.tag ? "active" : ""}" data-act="pick-tag" data-tag="${esc(t.tag)}" data-color="${t.color}" style="--tag-color:${t.color}">${tagIcon(t.tag, t.color)}${esc(t.tag)}</span>`
      )
      .join("");
    const colorDots = paletteDots(schedUI.color, true) + customColorInput(schedUI.color, "sched");
    return `<div class="card">
      <div class="card-title">${svg("plus")} 添加日程</div>
      <div class="form-row mt2">
        <span class="form-label">日期</span>
        <input type="date" class="date-input" id="dateInput" value="${esc(schedUI.date)}" />
        <div class="hint-chips sm mt1">
          <span class="hint-chip" data-sdate="${todayStr()}">今天</span>
          <span class="hint-chip" data-sdate="${addDays(todayStr(), 1)}">明天</span>
          <span class="hint-chip" data-sdate="${addDays(todayStr(), 2)}">后天</span>
        </div>
      </div>
      <div class="form-row mt2">
        <span class="form-label">开始时间</span>
        <div class="time-display" id="startDisp">${pad(schedUI.sh)}:${pad(schedUI.sm)}</div>
        <div class="stepper center" style="justify-content:center">
          <button class="step-btn" data-act="step" data-target="sh" data-dir="-1">−</button>
          <span class="step-val" id="shVal">${pad(schedUI.sh)}</span><span class="step-unit">时</span>
          <button class="step-btn" data-act="step" data-target="sh" data-dir="1">＋</button>
          <span style="width:14px"></span>
          <button class="step-btn" data-act="step" data-target="sm" data-dir="-1">−</button>
          <span class="step-val" id="smVal">${pad(schedUI.sm)}</span><span class="step-unit">分</span>
          <button class="step-btn" data-act="step" data-target="sm" data-dir="1">＋</button>
        </div>
      </div>
      <div class="form-row">
        <span class="form-label">时长</span>
        <div class="duration-pick">
          <div class="duration-col">
            <div class="stepper">
              <button class="step-btn" data-act="step" data-target="dh" data-dir="-1">−</button>
              <span class="step-val" id="dhVal">${schedUI.dh}</span><span class="step-unit">小时</span>
              <button class="step-btn" data-act="step" data-target="dh" data-dir="1">＋</button>
            </div>
          </div>
          <div class="duration-col">
            <div class="stepper">
              <button class="step-btn" data-act="step" data-target="dm" data-dir="-1">−</button>
              <span class="step-val" id="dmVal">${schedUI.dm}</span><span class="step-unit">分钟</span>
              <button class="step-btn" data-act="step" data-target="dm" data-dir="1">＋</button>
            </div>
          </div>
        </div>
      </div>
      <div class="form-row">
        <span class="form-label">事项</span>
        <input class="input" id="titleInput" placeholder="请输入事项内容" value="${esc(schedUI.title)}" />
      </div>
      <div class="form-row">
        <span class="form-label">类别标签</span>
        <div class="flex" style="flex-wrap:wrap;gap:8px">${tagChips}</div>
        ${
          !allTags().some((t) => t.tag === schedUI.tag)
            ? `<input class="input mt2" id="customTag" placeholder="自定义分类名称" value="${esc(schedUI.tag)}" />`
            : ""
        }
      </div>
      <div class="form-row">
        <span class="form-label">标签颜色</span>
        <div class="color-grid">${colorDots}</div>
      </div>
      <div class="form-row">
        <span class="form-label">优先级</span>
        <div class="seg-group" id="prioSeg">
          ${["高", "中", "低"].map((p) => `<span class="seg-btn ${schedUI.priority === p ? "on" : ""}" data-prio="${p}">${p}</span>`).join("")}
        </div>
      </div>
      <div class="form-row">
        <span class="form-label">重复</span>
        <div class="seg-group" id="repSeg">
          ${["none", "daily", "weekly"].map((v) => `<span class="seg-btn ${schedUI.repeat === v ? "on" : ""}" data-rep="${v}">${v === "none" ? "不重复" : v === "daily" ? "每天" : "每周"}</span>`).join("")}
        </div>
      </div>
      <div class="flex gap1 mt2">
        <button class="btn ghost flex" style="flex:1" data-act="toggle-form">取消</button>
        <button class="btn flex" style="flex:1" data-act="confirm-add">添加日程</button>
      </div>
    </div>`;
  }

  function wireForm() {
    const ti = $("#titleInput");
    if (ti) ti.addEventListener("input", (e) => (schedUI.title = e.target.value));
    const ct = $("#customTag");
    if (ct) ct.addEventListener("input", (e) => (schedUI.tag = e.target.value.trim() || "其他"));
    const pr = $("#prioSeg");
    if (pr)
      pr.querySelectorAll("[data-prio]").forEach((b) =>
        b.addEventListener("click", () => {
          schedUI.priority = b.dataset.prio;
          pr.querySelectorAll("[data-prio]").forEach((x) => x.classList.toggle("on", x === b));
        })
      );
    const rep = $("#repSeg");
    if (rep)
      rep.querySelectorAll("[data-rep]").forEach((b) =>
        b.addEventListener("click", () => {
          schedUI.repeat = b.dataset.rep;
          rep.querySelectorAll("[data-rep]").forEach((x) => x.classList.toggle("on", x === b));
        })
      );
    const di = $("#dateInput");
    if (di)
      di.addEventListener("input", (e) => {
        if (e.target.value) schedUI.date = e.target.value;
      });
    const sheet = di ? di.closest(".sheet") : null;
    if (sheet)
      sheet.querySelectorAll("[data-sdate]").forEach((c) =>
        c.addEventListener("click", () => {
          schedUI.date = c.dataset.sdate;
          if (di) di.value = c.dataset.sdate;
        })
      );
  }

  function confirmAdd() {
    let startTotal = schedUI.sh * 60 + schedUI.sm;
    let durTotal = schedUI.dh * 60 + schedUI.dm;
    if (durTotal <= 0) {
      toast("时长不能为 0，请设置合理的时长", "warn");
      return;
    }
    let endTotal = startTotal + durTotal;
    let eh = Math.floor(endTotal / 60),
      em = endTotal % 60;
    if (eh > 23) {
      eh = 23;
      em = 59;
      toast("结束时间超出当天，已自动收口至 23:59", "warn");
    }
    const startStr = `${pad(schedUI.sh)}:${pad(schedUI.sm)}`;
    const endStr = `${pad(eh)}:${pad(em)}`;
    let title = schedUI.title.trim();
    if (!title) title = "新建日程";
    let tag = schedUI.tag;
    // 自定义标签持久化
    if (tag && !allTags().some((t) => t.tag === tag)) {
      Store.state.customTags.push({ tag, color: schedUI.color });
    }
    const candidate = {
      title,
      startTime: startStr,
      endTime: endStr,
      desc: "",
      tag,
      tagColor: schedUI.color,
      date: schedUI.date || todayStr(),
      isCompleted: false,
      isFresh: true,
      priority: schedUI.priority || "中",
      repeat: schedUI.repeat || "none",
    };
    // 去重防护：同日同名 → 先询问再添加
    const dupes = findDupes(candidate);
    if (dupes.length) {
      const first = dupes[0];
      openSheet(
        `<div class="sheet-head"><div class="h">发现重复日程</div><button class="x" data-close>${svg("close")}</button></div>
         <div class="card-sub mt1" style="line-height:1.7">${esc(humanDateLabel(candidate.date))}已经有「${esc(first.title)}」（${esc(first.startTime)}~${esc(first.endTime)}）了。<br><br>是重复添加，还是想改个时间？</div>
         <div class="flex gap1 mt3">
           <button class="btn ghost flex" data-close style="flex:1">改时间</button>
           <button class="btn flex" id="dupForce" style="flex:1">仍要添加</button>
         </div>`,
        {
          onOpen: (el) => {
            el.querySelector("#dupForce").addEventListener("click", () => {
              closeSheet();
              doConfirmAdd(candidate);
            });
          },
        }
      );
      return;
    }
    doConfirmAdd(candidate);
  }

  function doConfirmAdd(candidate) {
    const it = Store.addSchedule(candidate);
    const addedLabel = humanDateLabel(candidate.date || todayStr());
    schedUI.title = "";
    schedUI.open = false;
    schedUI.dh = 1;
    schedUI.dm = 0;
    schedUI.date = todayStr();
    schedUI.repeat = "none";
    haptic(20);
    toast(`已添加 ${addedLabel} 的日程 ✨`, "ok", {
      label: "撤销",
      onClick: () => {
        Store.removeSchedule(it.id);
        renderCurrent();
        toast("已撤销添加", "ok");
      },
    });
    renderSchedule();
  }

  /* ============================================================
     统计页
     ============================================================ */
  function renderStatistics() {
    const scoped = scopeItems(Store.state.schedule, scope);
    const stats = computeStatsFor(scoped);
    const label = scope.mode === "week" ? "本周" : scope.mode === "month" ? "本月" : "今日";
    // AI 数据解读：离线先渲染规则解读，在线异步升级为模型洞察（与首页同源缓存），徽标标注真实来源
    const insightBlock = scoped.length
      ? `<div class="advice" style="margin-top:10px">
          <span class="bulb">${svg("bulb")}</span>
          <div class="txt" id="statInsightTxt">${esc(buildAdvice(stats, scope)).replace(/\n/g, "<br>")}</div>
          <span class="src-badge off" id="statInsightBadge" title="当前内容来源">本地规则</span>
        </div>`
      : "";
    const reportEntry = `<div class="card tight">
      <div class="report-card">
        <span class="ic">${svg("report")}</span>
        <div class="tx"><div class="t">${label} AI 日报</div><div class="s">基于你的执行情况，生成有温度的总结</div></div>
        <button class="btn sm" data-act="gen-report">${svg("sparkle")} 生成</button>
        <button class="btn sm ghost" data-act="weekly-review" title="回顾上周 AI 建议的执行情况，生成周复盘">${svg("chart")} 周复盘</button>
      </div>
      ${insightBlock}
    </div>`;

    const perTask = [...scoped]
      .sort(
        (a, b) =>
          (a.date || todayStr()).localeCompare(b.date || todayStr()) ||
          parseHM(a.startTime) - parseHM(b.startTime)
      )
      .map((it) => {
        const dur = parseHM(it.endTime) - parseHM(it.startTime);
        const pct = stats.totalHours ? (dur / stats.totalHours) * 100 : 0;
        const color = getColorForTag(it.tag);
        const pill = scope.mode !== "day" ? `<span class="date-pill">${humanDateLabel(it.date || todayStr())}</span>` : "";
        return `<div class="progress-row">
          <div class="progress-head"><span class="dot" style="background:${color}"></span>
            ${pill}
            <span class="name" style="${isDone(it) ? "text-decoration:line-through;color:var(--t3)" : ""}">${esc(it.title)}</span>
            <span class="val">${dur.toFixed(1)}h</span><span class="pct">${pct.toFixed(1)}%</span></div>
          <div class="bar"><i style="background:${color}" data-w="${pct.toFixed(1)}"></i></div>
        </div>`;
      })
      .join("");

    const perTag = stats.timeDist
      .map(
        (d) => `<div class="progress-row">
          <div class="progress-head"><span class="dot" style="background:${d.color}"></span>
            <span class="name">${esc(d.tag)}</span>
            <span class="val">${d.hours.toFixed(1)}h</span><span class="pct">${d.percent}%</span></div>
          <div class="bar"><i style="background:${d.color}" data-w="${d.percent}"></i></div>
        </div>`
      )
      .join("");

    const breakdown = stats.totalHours
      ? `<div class="card"><div class="card-title">${svg("chart")} 时段分布</div>
          <div class="flex between mt2" style="margin-bottom:8px"><span class="card-sub">${label}总耗时</span>
          <span class="big-num">${stats.totalHours.toFixed(1)}<small> h</small></span></div>
          <div class="divider"></div>${perTag}</div>`
      : `<div class="empty">${emptyArt("stats")}<div class="t">暂无统计数据</div><div class="s">先去首页规划时间，这里会自动汇总</div></div>`;

    // 大类汇总：自定义/趣味标签归入正经大类统计
    const catRows = catDistOf(stats)
      .map(
        (d) => `<div class="progress-row">
          <div class="progress-head"><span class="dot" style="background:${d.color}"></span>
            <span class="name">${esc(d.cat)}</span>
            <span class="val">${d.hours.toFixed(1)}h</span><span class="pct">${d.percent}%</span></div>
          <div class="bar"><i style="background:${d.color}" data-w="${d.percent}"></i></div>
        </div>`
      )
      .join("");
    const catCard =
      stats.totalHours && catRows
        ? `<div class="card"><div class="card-title">${svg("target")} 大类汇总</div>
            <div class="mt2">${catRows}</div>
            <div class="card-sub mt1">按正经大类（学习/工作/运动…）汇总，自定义标签自动归入所属大类</div></div>`
        : "";

    const taskList = scoped.length
      ? `<div class="card"><div class="card-title">${svg("list")} ${label}事项明细</div><div class="mt2">${perTask}</div></div>`
      : "";

    view.innerHTML = `<div class="page">
      <div class="head"><div><div class="title">时间统计</div><div class="sub">${esc(scopeTitle(scope).sub || label + "概览")}</div></div></div>
      ${scopeBar()}
      ${reportEntry}
      ${taskList}
      ${catCard}
      ${breakdown}
      ${stats.totalHours ? `<div class="card"><div class="card-title">${svg("chart")} 专注趋势</div><div class="mt2">${renderTrendChart(14)}</div></div>` : ""}
      ${stats.totalHours ? `<div class="card"><div class="card-title">${svg("target")} 分类占比</div><div class="mt2">${renderCatDonut(stats)}</div></div>` : ""}
      <div class="card"><div class="card-title">${svg("heart")} 习惯热力图</div>${renderHeatmapHTML()}<div class="card-sub mt1">颜色越深代表当天打卡越多；空格子是当天无安排。坚持看得见。</div></div>
    </div>`;

    requestAnimationFrame(() => {
      $$(".bar > i", view).forEach((b) => (b.style.width = b.dataset.w + "%"));
    });
    applyActHints(view);
    // AI 解读异步升级（有 Key 时替换为模型洞察并标注 AI 在线；无 Key/失败保持本地规则）
    if (scoped.length) {
      genInsight(stats).then((r) => {
        const el = view.querySelector("#statInsightTxt");
        if (el && el.isConnected && el.textContent !== r.text) el.textContent = r.text;
        const badge = view.querySelector("#statInsightBadge");
        if (badge) {
          const on = r.via === "ai";
          badge.textContent = on ? "AI 在线" : "本地规则";
          badge.classList.toggle("on", on);
          badge.classList.toggle("off", !on);
        }
      });
    }
  }

  /* ============================================================
     我的页
     ============================================================ */
  function renderMine() {
    const totalHours = Store.state.schedule.reduce((s, it) => {
      const d = parseHM(it.endTime) - parseHM(it.startTime);
      return s + (d > 0 ? d : 0);
    }, 0);
    const streak = new Set(Store.state.schedule.map((i) => i.date).filter(Boolean)).size;

    view.innerHTML = `<div class="page">
      <div class="head"><div class="title">个人中心</div>
        <div class="spacer"></div>
        <button class="icon-btn" data-act="toggle-theme" title="切换主题">${svg(document.documentElement.dataset.theme === "dark" ? "sun" : "moon")}</button>
      </div>

      <div class="card tight">
        <div class="profile">
          <div class="avatar">${svg("user")}</div>
          <div><div class="name">AI 时间助手</div>
            <span class="role">智能探索者</span>
            <div class="bio">用 AI 管理时间，专注成就更好的自己</div>
          </div>
        </div>
      </div>

      <div class="card tight">
        <div class="overview">
          <div class="ov-cell clickable" role="button" tabindex="0" data-act="overview-detail" data-key="records"><span class="ic">${svg("list")}</span><span class="v">${Store.state.schedule.length}</span><span class="k">累计记录</span></div>
          <div class="ov-sep"></div>
          <div class="ov-cell clickable" role="button" tabindex="0" data-act="overview-detail" data-key="hours"><span class="ic">${svg("clock")}</span><span class="v">${totalHours.toFixed(1)}</span><span class="k">专注时长(h)</span></div>
          <div class="ov-sep"></div>
          <div class="ov-cell clickable" role="button" tabindex="0" data-act="overview-detail" data-key="streak"><span class="ic">${svg("heart")}</span><span class="v">${streak}</span><span class="k">打卡天数</span></div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">${svg("settings")} AI 接入配置</div>
        <div class="card-sub mt1">填入 API Key 即启用在线 AI（规划 / 对话）；留空则使用本地离线解析</div>
        <div class="setting-row mt2"><span class="lbl">快捷预设</span><span class="card-sub">（点一下自动填好地址和模型）</span></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
          <button class="btn" style="flex:1;min-width:140px" data-preset="siliconflow">硅基流动 · 直连</button>
          <button class="btn" style="flex:1;min-width:140px" data-preset="deepseek">DeepSeek 官方 · 代理</button>
        </div>
        <div class="setting-row mt2"><span class="lbl">API Key</span></div>
        <input class="input" id="apiKeyInput" placeholder="填 Key 即启用在线 AI" value="${esc(Store.state.apiKey)}" />
        <div class="setting-row mt2"><span class="lbl">模型</span></div>
        <input class="input" id="apiModelInput" placeholder="如 deepseek-ai/DeepSeek-V3" value="${esc(Store.state.apiModel)}" />
        <div class="setting-row mt2"><span class="lbl">API 地址（高级）</span></div>
        <input class="input" id="apiBaseInput" placeholder="https://api.siliconflow.cn/v1" value="${esc(Store.state.apiBase)}" />
        <button class="btn block mt2" data-act="save-api">保存配置</button>
        <div class="card-sub mt1" style="line-height:1.6">两种接入方式（任选其一）：<br/>① <b>直连</b>：填支持浏览器直连的服务（推荐<b>硅基流动</b> api.siliconflow.cn/v1，含免费模型）；<br/>② <b>代理</b>：DeepSeek 官方 Key 需经代理转发，API 地址填 <code>/api/deepseek</code>（由站点托管的云函数转发）。<br/>失败时自动回退离线解析，不影响使用。</div>
      </div>

      <div class="card">
        <div class="menu">
          <div class="menu-item" data-act="open-catman">${svgWrap("tag")}<span>分类管理</span>${svgWrap("chevron")}</div>
          <div class="divider"></div>
          <div class="menu-item" data-act="open-persona">${svgWrap("heart")}<span>Agent 人格调教</span><span class="muted" style="font-size:11px">${personaStyle() ? "自定义" : "默认"}</span>${svgWrap("chevron")}</div>
          <div class="divider"></div>
          <div class="menu-item" data-act="open-goals">${svgWrap("target")}<span>目标管理</span><span class="muted" style="font-size:11px">${(Store.state.prefs.goals || []).length} 个</span>${svgWrap("chevron")}</div>
          <div class="divider"></div>
          <div class="menu-item" data-act="open-history">${svgWrap("folder")}<span>历史记录</span>${svgWrap("chevron")}</div>
          <div class="divider"></div>
          <div class="menu-item" data-act="open-prefs">${svgWrap("brain")}<span>AI 偏好设置</span>${svgWrap("chevron")}</div>
          <div class="divider"></div>
          <div class="menu-item" data-act="open-help">${svgWrap("headphones")}<span>帮助与反馈</span>${svgWrap("chevron")}</div>
          <div class="divider"></div>
          <div class="menu-item" data-act="open-onboarding">${svgWrap("bulb")}<span>新手引导</span>${svgWrap("chevron")}</div>
          <div class="divider"></div>
          <div class="menu-item" data-act="open-templates">${svgWrap("folder")}<span>日程模板</span>${svgWrap("chevron")}</div>
          <div class="divider"></div>
          <div class="menu-item" data-act="open-export">${svgWrap("doc")}<span>导出数据</span>${svgWrap("chevron")}</div>
          <div class="divider"></div>
          <div class="menu-item" data-act="open-backup">${svgWrap("save")}<span>数据备份</span>${svgWrap("chevron")}</div>
          <div class="divider"></div>
          <div class="menu-item" data-act="open-privacy">${svgWrap("shield")}<span>隐私政策</span>${svgWrap("chevron")}</div>
          <div class="divider"></div>
          <div class="menu-item" data-act="open-terms">${svgWrap("doc")}<span>用户协议</span>${svgWrap("chevron")}</div>
        </div>
      </div>
    </div>`;

    const ki = $("#apiKeyInput");
    if (ki) ki.addEventListener("input", (e) => (Store.state.apiKey = e.target.value.trim()));
    const km = $("#apiModelInput");
    if (km) km.addEventListener("input", (e) => (Store.state.apiModel = e.target.value.trim() || "deepseek-ai/DeepSeek-V3"));
    const kb = $("#apiBaseInput");
    if (kb) kb.addEventListener("input", (e) => (Store.state.apiBase = e.target.value.trim() || "https://api.siliconflow.cn/v1"));
    // 快捷预设：一键填充地址和模型，用户只需填 Key 后保存
    document.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const p = btn.getAttribute("data-preset");
        if (p === "siliconflow") {
          Store.state.apiBase = "https://api.siliconflow.cn/v1";
          Store.state.apiModel = "deepseek-ai/DeepSeek-V3";
        } else if (p === "deepseek") {
          Store.state.apiBase = "/api/deepseek";
          Store.state.apiModel = "deepseek-v4-flash";
        }
        const kb2 = $("#apiBaseInput"); if (kb2) kb2.value = Store.state.apiBase;
        const km2 = $("#apiModelInput"); if (km2) km2.value = Store.state.apiModel;
        const ki2 = $("#apiKeyInput"); if (ki2) ki2.focus();
      });
    });
    applyActHints(view);
  }
  function svgWrap(name) {
    return `<span class="ic">${svg(name)}</span>`;
  }

  /* ============================================================
     LLM API 调用层（OpenAI 兼容 / 支持浏览器直连的服务）
     推荐：硅基流动 SiliconFlow（api.siliconflow.cn/v1，支持 CORS）
     DeepSeek 官方接口不支持浏览器直连，请勿直填官方 Key。
     ============================================================ */
  function apiReady() {
    const k = (Store.state.apiKey || "").trim();
    return k.length >= 10;
  }
  async function callLLM(messages, opts = {}) {
    const key = (Store.state.apiKey || "").trim();
    if (key.length < 10) throw new Error("未配置有效的 API Key");
    const base = (Store.state.apiBase || "https://api.siliconflow.cn/v1").replace(/\/+$/, "");
    const model = Store.state.apiModel || "deepseek-ai/DeepSeek-V3";
    const isProxy = base.startsWith("/");
    const url = isProxy ? base : `${base}/chat/completions`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeoutMs || 60000);
    try {
      const headers = { "Content-Type": "application/json" };
      if (isProxy) {
        // 代理模式（如 Netlify 云函数 /api/deepseek）：Key 走请求头，由代理转发到官方接口
        headers["x-api-key"] = key;
        headers["x-model"] = model;
      } else {
        // 直连模式（支持 CORS 的服务，如硅基流动）
        headers["Authorization"] = `Bearer ${key}`;
      }
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages,
          temperature: opts.temperature ?? 0.6,
          max_tokens: opts.maxTokens || 2048,
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        let detail = res.statusText;
        try {
          const j = await res.json();
          detail = (j && j.error && j.error.message) || detail;
        } catch (_) {}
        throw new Error(`HTTP ${res.status}: ${detail}`);
      }
      const data = await res.json();
      const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (!content) throw new Error("模型返回内容为空");
      return content.trim();
    } finally {
      clearTimeout(timer);
    }
  }
  // 从模型输出中提取 JSON（容忍 ```json 代码块与前后杂讯）
  function extractJson(text) {
    if (!text) return null;
    let m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    let cand = m ? m[1] : text;
    m = cand.match(/\{[\s\S]*\}/);
    if (m) cand = m[0];
    try {
      return JSON.parse(cand);
    } catch (_) {
      return null;
    }
  }
  // 规整时间：接受 "15:00" / "3点" 等，统一成 HH:MM；非法返回空
  function normTime(v) {
    if (!v) return "";
    const s = String(v).trim();
    let m = s.match(/^(\d{1,2})[:：](\d{1,2})$/);
    if (m) {
      const h = +m[1], mi = +m[2];
      if (h >= 0 && h <= 23 && mi >= 0 && mi <= 59) return `${pad(h)}:${pad(mi)}`;
      return "";
    }
    m = s.match(/^(\d{1,2})\s*点(?:\s*(\d{1,2})\s*分)?$/);
    if (m) {
      const h = +m[1];
      if (h >= 0 && h <= 23) return `${pad(h)}:${pad(m[2] ? +m[2] : 0)}`;
    }
    return "";
  }
  // 判断某重复/普通日程在指定日期 date 是否「出现」（用于冲突检测，与 scopeItems 展开逻辑一致，便于回迁）
  function occursOn(ex, date) {
    if (!ex.repeat || ex.repeat === "none") return (ex.date || todayStr()) === date;
    const base = ex.date || todayStr();
    if (date < base) return false;
    if (ex.repeat === "daily") return true;
    if (ex.repeat === "weekly") return parseDate(date).getDay() === parseDate(base).getDay();
    return false;
  }
  function checkConflicts(tasks) {
    return tasks.some((t) => {
      const td = t.date || todayStr();
      return Store.state.schedule.some(
        (ex) => occursOn(ex, td) && t.startTime < ex.endTime && t.endTime > ex.startTime
      );
    });
  }

  // —— 冲突多方案（P2）：给任务生成 2~3 个可行调整方案，用户可自定义 ——
  function toMin(t) {
    const [h, m] = String(t).split(":").map(Number);
    return h * 60 + m;
  }
  function fmtMin(m) {
    return `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
  }
  // date 当天 startMin~endMin 是否空闲（可排除某日程）
  function rangeFree(date, startMin, endMin, excludeId) {
    const s = fmtMin(startMin);
    const e = fmtMin(endMin);
    return !Store.state.schedule.some((ex) => ex.id !== excludeId && occursOn(ex, date) && s < ex.endTime && e > ex.startTime);
  }
  // 返回每个新任务与其冲突的已有日程
  function conflictDetail(tasks) {
    const out = [];
    tasks.forEach((t) => {
      const td = t.date || todayStr();
      const cfl = Store.state.schedule.filter((ex) => occursOn(ex, td) && t.startTime < ex.endTime && t.endTime > ex.startTime);
      if (cfl.length) out.push({ task: t, conflicts: cfl });
    });
    return out;
  }
  // 为一个冲突任务生成 2~3 个方案：提前 / 推后(或顺延) / 挪走低优先级冲突项
  function buildConflictPlans(task, conflicts) {
    const plans = [];
    const date = task.date || todayStr();
    const dur = Math.max(15, toMin(task.endTime) - toMin(task.startTime));
    const main = conflicts[0];
    // A 提前：赶在最早冲突开始之前
    const aEnd = Math.min(...conflicts.map((c) => toMin(c.startTime)));
    const aStart = aEnd - dur;
    if (aStart >= 0 && rangeFree(date, aStart, aEnd, null)) {
      plans.push({ label: "提前", desc: `提前到 ${fmtMin(aStart)}~${fmtMin(aEnd)}，赶在「${main.title}」之前`, startTime: fmtMin(aStart), endTime: fmtMin(aEnd) });
    }
    // B 推后：等最晚冲突结束之后
    const bStart = Math.max(...conflicts.map((c) => toMin(c.endTime)));
    const bEnd = bStart + dur;
    if (bEnd <= 23 * 60 + 59 && rangeFree(date, bStart, bEnd, null)) {
      plans.push({ label: "推后", desc: `推后到 ${fmtMin(bStart)}~${fmtMin(bEnd)}，等「${main.title}」结束再开始`, startTime: fmtMin(bStart), endTime: fmtMin(bEnd) });
    } else {
      plans.push({ label: "顺延", desc: `今天放不下了，顺延到明天同一时段（${task.startTime}~${task.endTime}）`, startTime: task.startTime, endTime: task.endTime, nextDay: true });
    }
    // C 挪走冲突项：优先挪低优先级（高优先级不动）
    const movable = conflicts
      .filter((c) => c.priority !== "高")
      .sort((a, b) => ((a.priority === "中" ? 1 : 0) - (b.priority === "中" ? 1 : 0)))[0];
    if (movable) {
      const mStart = toMin(task.endTime);
      const mEnd = mStart + Math.max(15, toMin(movable.endTime) - toMin(movable.startTime));
      if (mEnd <= 23 * 60 + 59 && rangeFree(date, mStart, mEnd, movable.id)) {
        plans.push({ label: "挪走它", desc: `把「${movable.title}」（${movable.priority || "中"}优先级）挪到 ${fmtMin(mStart)}~${fmtMin(mEnd)}，两个都保住`, moveId: movable.id, startTime: fmtMin(mStart), endTime: fmtMin(mEnd) });
      }
    }
    return plans;
  }
  // 应用一个冲突方案（添加新任务 + 可选挪走冲突项）
  function applyConflictPlan(task, plan) {
    if (plan.nextDay) {
      const nd = addDays(task.date || todayStr(), 1);
      Store.addSchedule(Object.assign({}, task, { date: nd, isFresh: true }));
      toast(`「${task.title}」今天放不下，已顺延到明天（${nd}）`, "ok");
      return { applied: `顺延到明天` };
    }
    if (plan.moveId) {
      const mv = Store.state.schedule.find((x) => x.id === plan.moveId);
      if (mv) {
        Store.updateSchedule(mv.id, { startTime: plan.startTime, endTime: plan.endTime });
        toast(`已把「${mv.title}」挪到 ${plan.startTime}~${plan.endTime}`, "ok");
      }
    }
    Store.addSchedule(Object.assign({}, task, { startTime: plan.startTime, endTime: plan.endTime, isFresh: true }));
    return { applied: `${plan.startTime}~${plan.endTime}` };
  }

  /* ============================================================
     分类编辑浮层
     ============================================================ */
  function openTagMenu(id) {
    const item = Store.state.schedule.find((x) => x.id === id);
    const curTag = item ? item.tag : "";
    const chips = allTags()
      .map(
        (t) =>
          `<span class="chip ${curTag === t.tag ? "active" : ""}" data-act="change-tag" data-id="${id}" data-tag="${esc(t.tag)}" data-color="${t.color}" style="--tag-color:${t.color}">${tagIcon(t.tag, t.color)}${esc(t.tag)}</span>`
      )
      .join("");
    openSheet(
      `<div class="sheet-head"><div class="h">选择分类</div><button class="x" data-close>${svg("close")}</button></div>
       <div class="flex" style="flex-wrap:wrap;gap:8px">${chips}
         <span class="chip" id="newCat">＋ 新建分类</span></div>
       <div id="newCatBox" class="hide mt3">
         <input class="input" id="ncName" placeholder="分类名称" />
         <div class="form-label mt2">选择颜色</div>
         <div class="color-grid mt1" id="ncColors"></div>
         <button class="btn block mt3" id="ncConfirm">确认新建</button>
       </div>`,
      {
        onOpen: (el) => {
          let pick = TAG_PALETTE[0];
          const ncColors = el.querySelector("#ncColors");
          ncColors.innerHTML = paletteDots(pick) + customColorInput(pick, "newcat");
          const ncLabel = ncColors.querySelector(".color-custom");
          const ncInput = ncColors.querySelector(".color-custom-input");
          ncColors.querySelectorAll(".color-dot").forEach((d) =>
            d.addEventListener("click", () => {
              pick = d.dataset.c;
              ncColors.querySelectorAll(".color-dot").forEach((x) => x.classList.toggle("sel", x === d));
              if (ncLabel) {
                ncLabel.classList.remove("active");
                ncLabel.style.background = "";
              }
            })
          );
          if (ncInput)
            ncInput.addEventListener("input", () => {
              pick = ncInput.value;
              ncColors.querySelectorAll(".color-dot").forEach((x) => x.classList.remove("sel"));
              ncLabel.classList.add("active");
              ncLabel.style.background = ncInput.value;
            });
          el.querySelector("#newCat").addEventListener("click", () => {
            el.querySelector("#newCatBox").classList.remove("hide");
          });
          el.querySelector("#ncConfirm").addEventListener("click", () => {
            const name = el.querySelector("#ncName").value.trim();
            if (!name) {
              toast("分类名称不能为空", "warn");
              return;
            }
            if (!allTags().some((t) => t.tag === name)) Store.state.customTags.push({ tag: name, color: pick });
            Store.updateSchedule(id, { tag: name, tagColor: pick });
            closeSheet();
            toast("已更新分类", "ok");
            renderCurrent();
          });
        },
      }
    );
  }

  /* ============================================================
     分类管理页
     ============================================================ */
  function openCatMan() {
    const items = allTags()
      .map((t) => {
        const def = !!TAG_MAP[t.tag];
        return `<div class="sch-item" style="margin-bottom:8px">
          <span class="tag" style="background:${t.color};color:${contrastText(t.color)}">${esc(t.tag)}</span>
          <div class="sch-main"><div class="sch-title" style="font-size:13px">${t.color}</div>
            ${def ? "" : `<select class="cat-select" data-cat-set="${esc(t.tag)}" title="归类到正经大类（统计按此汇总）">
              ${CATS.map((c) => `<option value="${c}" ${tagCategory(t.tag) === c ? "selected" : ""}>归类 · ${c}</option>`).join("")}
            </select>`}
          </div>
          ${def ? '<span class="muted" style="font-size:11px">内置</span>' : `<button class="sch-del" data-act="del-cat" data-tag="${esc(t.tag)}">${svg("trash")}</button>`}
        </div>`;
      })
      .join("");
    openSheet(
      `<div class="sheet-head"><div class="h">分类管理</div><button class="x" data-close>${svg("close")}</button></div>
       <div class="card-sub">内置分类不可删除，自定义分类可移除（不会影响已有日程的显示颜色）。</div>
       <div class="mt3">${items}</div>
       <div class="divider mt2"></div>
       <div class="form-label mt2">新建自定义标签</div>
       <div class="flex gap1 mt1">
         <input class="input" id="catNewName" placeholder="自主命名，如「阅读」「冥想」" maxlength="8" />
         <button class="btn" id="catNewAdd" style="flex:0 0 auto">${svg("plus")} 添加</button>
       </div>
       <div class="card-sub mt1">Agent 在对话舱里也能帮你新建 / 删除自定义标签。</div>`,
      {
        onOpen: (el) => {
          el.querySelector("#catNewAdd").addEventListener("click", () => {
            const name = el.querySelector("#catNewName").value.trim();
            if (!name) {
              toast("标签名称不能为空", "warn");
              return;
            }
            if (allTags().some((t) => t.tag === name)) {
              toast(`「${name}」已存在`, "warn");
              return;
            }
            const color = TAG_PALETTE[(Object.keys(TAG_MAP).length + Store.state.customTags.length) % TAG_PALETTE.length];
            // 近色检测：新标签颜色与已有标签太接近时提醒（主动 agent 精神）
            const near = allTags().filter((t) => colorSimilarity(t.color, color) > 0.88);
            Store.state.customTags.push({ tag: name, color });
            Store.notify();
            closeSheet();
            openCatMan();
            if (near.length) {
              toast(`已创建「${name}」✨ 注意：「${near[0].tag}」的颜色很接近，建议改个更易区分的颜色`, "warn");
            } else {
              toast(`已创建标签「${name}」✨`, "ok");
            }
          });
          el.querySelector("#catNewName").addEventListener("keydown", (e) => {
            if (e.key === "Enter") el.querySelector("#catNewAdd").click();
          });
          el.querySelectorAll("[data-cat-set]").forEach((sel) =>
            sel.addEventListener("change", () => {
              const ct = Store.state.customTags.find((x) => x.tag === sel.dataset.catSet);
              if (ct) {
                ct.cat = sel.value;
                Store.notify();
                toast(`已将「${ct.tag}」归类到大类「${sel.value}」，统计按此汇总 ✅`, "ok");
              }
            })
          );
        },
      }
    );
  }

  /* ============================================================
     Agent 人格调教面板（我的页入口 + 对话舱命令共用同一数据）
     ============================================================ */
  function openPersona() {
    const ps = personaState();
    const listHtml = (ps.list || []).length
      ? ps.list
          .map(
            (b) =>
              `<div class="sch-item" style="margin-bottom:8px">
                <span class="sch-title" style="font-size:13px;flex:0 0 auto">${esc(b.name)}</span>
                <div class="sch-main"><div class="sch-title" style="font-size:11px;color:var(--t3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(b.style.slice(0, 28))}${b.style.length > 28 ? "…" : ""}</div></div>
                <button class="sch-del" data-persona-act="use" data-name="${esc(b.name)}">使用</button>
                <button class="sch-del" data-persona-act="del" data-name="${esc(b.name)}">${svg("trash")}</button>
              </div>`
          )
          .join("")
      : `<div class="card-sub">还没有备份。先在对话舱里调教语气（如「以后说话可爱一点」），再回来这里备份。</div>`;
    openSheet(
      `<div class="sheet-head"><div class="h">Agent 人格调教</div><button class="x" data-close>${svg("close")}</button></div>
       <div class="card-sub">在对话舱里直接说就能调教，例如「以后说话可爱一点」「叫我老板」「说话简洁些」。当前风格：</div>
       <div class="advice mt2" style="align-items:flex-start">
         <span class="bulb">${svg("bulb")}</span>
         <div class="txt" id="personaCur">${esc(ps.style || "默认 · 自然友好，像朋友一样")}</div>
       </div>
       <div class="flex gap1 mt2">
         <button class="btn ghost flex" id="personaReset" style="flex:1">恢复默认</button>
       </div>
       <div class="divider mt2"></div>
       <div class="form-label mt2">备份当前风格</div>
       <div class="flex gap1 mt1">
         <input class="input" id="personaBkName" placeholder="给风格起个名字，如「活泼版」" maxlength="12" />
         <button class="btn" id="personaBkBtn" style="flex:0 0 auto">${svg("save")} 备份</button>
       </div>
       <div class="form-label mt2">我的备份（点「使用」切换）</div>
       <div class="mt1">${listHtml}</div>`,
      {
        onOpen: (el) => {
          el.querySelector("#personaReset").addEventListener("click", () => {
            ps.style = "";
            ps.current = "default";
            Store.notify();
            el.querySelector("#personaCur").textContent = "默认 · 自然友好，像朋友一样";
            toast("已恢复默认语气", "ok");
          });
          el.querySelector("#personaBkBtn").addEventListener("click", () => {
            const name = el.querySelector("#personaBkName").value.trim();
            if (!name) {
              toast("请给风格起个名字", "warn");
              return;
            }
            if (!ps.style) {
              toast("当前是默认风格，先在对话里调教再备份", "warn");
              return;
            }
            if (!ps.list) ps.list = [];
            ps.list = ps.list.filter((x) => x.name !== name);
            ps.list.push({ id: uid(), name, style: ps.style });
            Store.notify();
            closeSheet();
            openPersona();
            toast(`已备份「${name}」📦`, "ok");
          });
          el.querySelectorAll("[data-persona-act]").forEach((b) =>
            b.addEventListener("click", () => {
              const name = b.dataset.name;
              if (b.dataset.personaAct === "use") {
                const hit = (ps.list || []).find((x) => x.name === name);
                if (hit) {
                  ps.style = hit.style;
                  ps.current = hit.id;
                  Store.notify();
                  closeSheet();
                  openPersona();
                  toast(`已切换到「${name}」🎭`, "ok");
                }
              } else {
                ps.list = (ps.list || []).filter((x) => x.name !== name);
                Store.notify();
                closeSheet();
                openPersona();
                toast(`已删除备份「${name}」`, "ok");
              }
            })
          );
        },
      }
    );
  }

  /* ============================================================
     周报改进闭环：按周落库 AI 洞察/日报 → 周复盘对比"上周建议执行情况"
     ============================================================ */
  function weekKeyOf(d) {
    return weekBounds(d)[0]; // 用周一日期作为周标识
  }
  function logWeeklyInsight(text) {
    if (!text) return;
    const prefs = Store.state.prefs;
    if (!prefs.weekLog) prefs.weekLog = {};
    const k = weekKeyOf(todayStr());
    if (!prefs.weekLog[k]) prefs.weekLog[k] = [];
    prefs.weekLog[k].push({ d: todayStr(), text: text.slice(0, 200) });
    if (prefs.weekLog[k].length > 20) prefs.weekLog[k] = prefs.weekLog[k].slice(-20);
    // 清理 6 周前的旧周
    Object.keys(prefs.weekLog).forEach((wk) => {
      if (wk < addDays(todayStr(), -42)) delete prefs.weekLog[wk];
    });
  }
  function openWeeklyReview() {
    const prefs = Store.state.prefs;
    const thisK = weekKeyOf(todayStr());
    const lastK = weekKeyOf(addDays(todayStr(), -7));
    const lastEntries = (prefs.weekLog && prefs.weekLog[lastK]) || [];
    const cur = computeStatsFor(scopeItems(Store.state.schedule, { mode: "week", anchor: todayStr() }));
    const prev = computeStatsFor(scopeItems(Store.state.schedule, { mode: "week", anchor: addDays(todayStr(), -7) }));
    const label = "周复盘";
    openSheet(
      `<div class="sheet-head"><div class="h">📊 周复盘</div><button class="x" data-close>${svg("close")}</button></div>
       <div class="report-src"><span class="src-badge ${apiReady() ? "on" : "off"}" id="wkSrcBadge">${apiReady() ? "AI 在线" : "本地规则"}</span><span>对比上周建议与执行情况</span></div>
       <div id="wkBody" class="report-body"><span class="typing"><i></i><i></i><i></i></span> AI 正在回顾上周…</div>
       <button class="btn block mt3 hide" id="wkClose" data-close>关闭</button>`,
      {
        onOpen: (el) => {
          const body = el.querySelector("#wkBody");
          const closeBtn = el.querySelector("#wkClose");
          const srcBadge = el.querySelector("#wkSrcBadge");
          const finish = (text, via) => {
            if (!el.isConnected) return;
            body.innerHTML = `<div>${esc(text).replace(/\n/g, "<br>")}</div>`;
            closeBtn.classList.remove("hide");
            if (srcBadge) {
              const on = via === "ai";
              srcBadge.textContent = on ? "AI 在线" : "本地规则";
              srcBadge.classList.toggle("on", on);
              srcBadge.classList.toggle("off", !on);
            }
          };
          const lastAdvice = lastEntries.map((e) => `${e.d}：${e.text}`).join("\n") || "（上周暂无 AI 记录）";
          const curRate = cur.totalCount ? Math.round((cur.completedCount / cur.totalCount) * 100) : 0;
          const prevRate = prev.totalCount ? Math.round((prev.completedCount / prev.totalCount) * 100) : 0;
          if (apiReady()) {
            const prompt =
              `请写一份「周复盘」。当前时间：${nowInfo()}。\n` +
              `上周 AI 给用户的建议/洞察记录（供回顾是否执行）：\n${lastAdvice}\n\n` +
              `数据对比：上周完成 ${prev.completedCount}/${prev.totalCount}（${prevRate}%）、规划 ${prev.totalHours.toFixed(1)}h；本周完成 ${cur.completedCount}/${cur.totalCount}（${curRate}%）、规划 ${cur.totalHours.toFixed(1)}h。\n` +
              `请输出：① 上周建议的执行情况判断（结合数据）；② 本周相比上周的进步或退步（2 条）；③ 下周 1-2 条具体建议。140 字内，短段落。严禁臆造未列出的数据。`;
            callLLM(
              [
                { role: "system", content: `你是严谨又温暖的私人时间管理复盘教练。${personaPromptLine()}` },
                { role: "user", content: prompt },
              ],
              { temperature: 0.6, maxTokens: 700, timeoutMs: 40000 }
            )
              .then((text) => finish(text, "ai"))
              .catch(() => finish(genOfflineWeekly(curRate, prevRate, lastEntries), "offline"));
          } else {
            setTimeout(() => finish(genOfflineWeekly(curRate, prevRate, lastEntries), "offline"), 600);
          }
        },
      }
    );
  }
  function genOfflineWeekly(curRate, prevRate, lastEntries) {
    const diff = curRate - prevRate;
    const trend = diff > 5 ? `完成率上升了 ${diff} 个百分点，执行力在变好 👍` : diff < -5 ? `完成率下降了 ${-diff} 个百分点，这周目标可能定高了或安排偏满` : "完成率基本持平，节奏稳定。";
    const advicePart = lastEntries.length
      ? `上周你收到了 ${lastEntries.length} 条 AI 建议，可对照看看哪些做到了：\n${lastEntries.slice(-3).map((e) => `• ${e.d}：${e.text.slice(0, 40)}…`).join("\n")}`
      : "上周还没有 AI 建议记录，从这周开始积累吧。";
    return `【周复盘 · 本地规则】\n\n本周完成 ${curRate}%，上周 ${prevRate}%。${trend}\n\n${advicePart}\n\n下周建议：给最重要的一件事先排进日程，再安排其它。`;
  }
  // 周报自动定时推送：进入新的一周（且已有数据）时，自动生成周复盘存入 weekLog 并轻量提醒一次；同周重复打开不重复打扰
  function autoWeeklyReview() {
    const prefs = Store.state.prefs;
    const cur = weekKeyOf(todayStr());
    if (prefs.lastAutoWeek === cur) return false; // 本周已自动生成
    if (!Store.state.schedule.length) return false; // 无数据不生成
    const curStats = computeStatsFor(scopeItems(Store.state.schedule, { mode: "week", anchor: todayStr() }));
    const prevStats = computeStatsFor(scopeItems(Store.state.schedule, { mode: "week", anchor: addDays(todayStr(), -7) }));
    const curRate = curStats.totalCount ? Math.round((curStats.completedCount / curStats.totalCount) * 100) : 0;
    const prevRate = prevStats.totalCount ? Math.round((prevStats.completedCount / prevStats.totalCount) * 100) : 0;
    const lastEntries = (prefs.weekLog && prefs.weekLog[weekKeyOf(addDays(todayStr(), -7))]) || [];
    const text = genOfflineWeekly(curRate, prevRate, lastEntries);
    logWeeklyInsight("【系统自动周报】" + text.replace(/^【周复盘 · 本地规则】\s*/, ""));
    prefs.lastAutoWeek = cur;
    Store.save();
    toast("📊 本周复盘已自动生成", "ok", { label: "查看", onClick: () => openWeeklyReview() });
    // 注：自动生成仅存离线版；若配置了 API，用户在「周复盘」里打开时会自动升级为 AI 版（避免启动即消耗 token）
    return true;
  }

  /* ============================================================
     目标管理（我的页入口）：列表进度 + 新增 + 删除
     ============================================================ */
  function openGoals() {
    const prefs = Store.state.prefs;
    const progress = goalProgress();
    const listHtml = progress.length
      ? progress
          .map(
            (g) => `<div class="sch-item" style="margin-bottom:8px;align-items:center">
            <div class="sch-main" style="flex:1">
              <div class="sch-title" style="font-size:13px">${esc(goalText(g))} <span class="${g.done ? "ok" : "warn"}">${g.done ? "✅ 已达标" : `还差 ${g.remain}h`}</span></div>
              <div class="bar mt1" style="height:6px"><i style="background:${g.done ? "var(--ok, #16A34A)" : "var(--primary)"}" data-w="${g.pct}"></i></div>
            </div>
            <button class="sch-del" data-gdel="${esc(g.title)}">${svg("trash")}</button>
          </div>`
          )
          .join("")
      : `<div class="card-sub">还没有目标。设一个，AI 就会帮你守护进度，比如「每天学习 1 小时」。</div>`;
    openSheet(
      `<div class="sheet-head"><div class="h">🎯 目标管理</div><button class="x" data-close>${svg("close")}</button></div>
       <div class="card-sub">设定"每天/每周在某个大类投入多少小时"，AI 会跟踪进度并主动提醒你。</div>
       <div class="mt2">${listHtml}</div>
       <div class="divider mt2"></div>
       <div class="form-label mt2">新增目标</div>
       <div class="form-section">
         <div class="form-label">名称（如：学习 / 健身）</div>
         <input class="input" id="gName" placeholder="目标名" maxlength="8" />
       </div>
       <div class="flex" style="gap:8px;margin-top:8px">
         <select class="cat-select" id="gCat" style="flex:1;max-width:none">
           ${CATS.map((c) => `<option value="${c}">大类 · ${c}</option>`).join("")}
         </select>
         <select class="cat-select" id="gPeriod" style="flex:1;max-width:none">
           <option value="day">每天</option><option value="week">每周</option>
         </select>
       </div>
       <div class="flex gap1 mt2" style="align-items:center">
         <input class="input" id="gHours" type="number" min="0.5" step="0.5" value="1" style="flex:1" />
         <span class="card-sub">小时</span>
         <button class="btn" id="gAdd" style="flex:0 0 auto">${svg("plus")} 添加</button>
       </div>`,
      {
        onOpen: (el) => {
          if (!prefs.goals) prefs.goals = [];
          el.querySelector("#gAdd").addEventListener("click", () => {
            const title = el.querySelector("#gName").value.trim();
            const cat = el.querySelector("#gCat").value;
            const period = el.querySelector("#gPeriod").value;
            const hours = parseFloat(el.querySelector("#gHours").value);
            if (!title || !hours || hours <= 0) {
              toast("请填写目标名和有效小时数", "warn");
              return;
            }
            if (prefs.goals.some((x) => x.title === title)) {
              toast("目标已存在", "warn");
              return;
            }
            prefs.goals.push({ id: uid(), title: title.slice(0, 8), cat, period, hours });
            Store.notify();
            closeSheet();
            openGoals();
            toast(`已设置目标「${title}」🎯`, "ok");
          });
          el.querySelectorAll("[data-gdel]").forEach((b) =>
            b.addEventListener("click", () => {
              prefs.goals = prefs.goals.filter((x) => x.title !== b.dataset.gdel);
              Store.notify();
              closeSheet();
              openGoals();
              toast(`已删除目标「${b.dataset.gdel}」`, "ok");
            })
          );
          requestAnimationFrame(() => {
            el.querySelectorAll(".bar > i").forEach((b) => (b.style.width = b.dataset.w + "%"));
          });
        },
      }
    );
  }

  /* ============================================================
     AI 日报浮层
     ============================================================ */
  function openReport() {
    // 与当前查看范围（日/周/月）保持一致，避免「今日日报」标题配本周/本月数据
    const scoped = scopeItems(Store.state.schedule, scope);
    const stats = computeStatsFor(scoped);
    const label = scope.mode === "week" ? "本周" : scope.mode === "month" ? "本月" : "今日";
    openSheet(
      `<div class="sheet-head"><div class="h">📅 ${label}日报</div><button class="x" data-close>${svg("close")}</button></div>
       <div class="report-src"><span class="src-badge ${apiReady() ? "on" : "off"}" id="reportSrcBadge">${apiReady() ? "AI 在线" : "本地规则"}</span><span>${apiReady() ? "调用模型生成中…" : "离线模板生成"}</span></div>
       <div id="reportBody" class="report-body"><span class="typing"><i></i><i></i><i></i></span> AI 正在生成你的${label}总结…</div>
       <button class="btn block mt3 hide" id="closeReport" data-close>关闭</button>`,
      {
        onOpen: (el) => {
          const body = el.querySelector("#reportBody");
          const closeBtn = el.querySelector("#closeReport");
          const srcBadge = el.querySelector("#reportSrcBadge");
          const srcHint = srcBadge ? srcBadge.nextElementSibling : null;
          const finish = (text, via) => {
            if (!el.isConnected) return; // 用户已关闭，避免写入已销毁节点
            body.innerHTML = `<div>${esc(text).replace(/\n/g, "<br>")}</div>`;
            closeBtn.classList.remove("hide");
            if (srcBadge) {
              const on = via === "ai";
              srcBadge.textContent = on ? "AI 在线" : "本地规则";
              srcBadge.classList.toggle("on", on);
              srcBadge.classList.toggle("off", !on);
            }
            if (srcHint) srcHint.textContent = via === "ai" ? "由大模型根据你的日程生成" : "基于本地规则模板生成";
          };
          // 在线优先：成功配置 API 就调模型生成真实日报；失败回退离线模板
          if (apiReady()) {
            const withDate = scope.mode !== "day";
            const rows = scoped
              .map(
                (it) =>
                  `${withDate ? (it.date || todayStr()) + " " : ""}${it.startTime}-${it.endTime} ${it.title}${isDone(it) ? "（已完成）" : ""}${it.tag ? " /" + it.tag : ""}`
              )
              .join("\n");
            const prompt =
              `请为「${label}」写一份简短温暖的时间日报。当前时间：${nowInfo()}。\n` +
              `关于用户的长期习惯观察（供参考，与下方日程矛盾时以下方日程为准）：${buildUserProfile() || "（历史数据不足）"}\n` +
              `以下是用户「${label}」严格全部 ${scoped.length} 个日程（${withDate ? "日期 " : ""}时间 事项 状态 /分类）：\n${rows || "（该时间段暂无日程）"}\n` +
              `【硬性要求】必须完全基于上述真实日程写作，严禁臆造任何未列出的日程、数字或完成情况；若只有 1 个日程，就围绕这一个事项本身展开，不要谈"多任务协调/分类失衡"。` +
              `注意当前时刻是 ${nowInfo()}，请据此判断哪些日程已完成/进行中/未开始，措辞贴合时间段（如傍晚别写"清晨好"），不要臆造未完成的日程为已完成。\n` +
              `用户的自定义标签可能是个性化/趣味命名，请依据日程标题理解其真实性质，并按标签所属的正经大类归类分析，不要被标签名字迷惑。\n` +
              `请输出：一句话总评；2-3 条亮点或发现；1 条具体的改进建议。全文 150 字以内，短段落，语气自然，不要用夸张赞美。`;
            callLLM(
              [
                { role: "system", content: `你是严谨又温暖的私人时间管理日报助手。${personaPromptLine()}` },
                { role: "user", content: prompt },
              ],
              { temperature: 0.7, maxTokens: 800, timeoutMs: 45000 }
            )
              .then((text) => finish(text, "ai"))
              .catch((err) => {
                toast("AI 生成失败，已切换离线总结", "warn");
                finish(genOfflineReport(stats), "offline");
              });
          } else {
            setTimeout(() => finish(genOfflineReport(stats), "offline"), 900);
          }
        },
      }
    );
  }

  function genOfflineReport(stats) {
    const sc_ = scope;
    const label = sc_.mode === "week" ? "本周" : sc_.mode === "month" ? "本月" : "今日";
    const scoped = scopeItems(Store.state.schedule, sc_);
    if (!scoped.length) {
      if (!Store.state.schedule.length)
        return "今天你还没有安排任何日程。\n\n不妨去首页和 AI 聊聊，先规划一件小事——比如「明早 8 点背单词 1 小时」。千里之行，始于足下，期待明天看到一个更有规划的你 🌱";
      return `${label}暂时还没有日程。\n\n不妨先规划一件小事，比如「明早 8 点背单词 1 小时」，让${label}有个清晰的起点 🌱`;
    }
    const done = stats.completedCount,
      total = stats.totalCount;
    const slots = freeSlots();
    const slotNote = slots.length ? `\n\n⏳ 顺带一提，今天还有空闲时段：${slots.join("、")}，可用来休息或碎片化学习。` : "";
    // 仅 1 项：聚焦该事项本身，不再谈"类别分布/多任务协调"
    if (total === 1) {
      const it = scoped[0];
      const itDone = isDone(it);
      const timeStr = it.startTime ? (it.endTime && it.endTime !== it.startTime ? `${it.startTime}-${it.endTime}` : it.startTime) : "";
      const praise = itDone
        ? "这一项已经完成，是个不错的开始。"
        : "这一项还没完成，别急，从最小的第一步开始就好。";
      const advice = itDone
        ? "\n\n💡 保持建议：可以再补充 1-2 件小事，或留一段空白休息，让节奏更从容。"
        : `\n\n💡 改进建议：把「${it.title}」拆成 25 分钟的小步骤，先做 5 分钟，行动就会顺畅起来。`;
      return `【${label}时间总结】\n\n你${label}规划了「${it.title}」一项${timeStr ? `（${timeStr}）` : ""}，共 ${stats.totalHours.toFixed(1)} 小时。\n\n${praise}${advice}${slotNote}\n\n明天也要元气满满，做时间的主人 💪`;
    }
    const ratio = total ? done / total : 0;
    let praise = "";
    if (ratio >= 0.9) praise = "今天你几乎完成了所有计划，执行力拉满，非常出色！";
    else if (ratio >= 0.6) praise = "大部分任务都顺利完成了，节奏稳扎稳打，值得肯定。";
    else if (ratio > 0) praise = "今天完成了一些任务，已经在行动的路上，继续加油。";
    else praise = "今天的任务还没开始打卡，没关系，从任意一项开始就好。";
    const advice =
      ratio < 1
        ? "\n\n💡 改进建议：未完成的事项可以拆解成更小的步骤，并为高优先级任务预留整块专注时间，减少切换损耗。"
        : "\n\n💡 保持建议：你已形成良好的时间节律，明天的计划可以适当加入一些放松与运动，让状态更可持续。";
    return `【${label}时间利用总结】\n\n你${label}共规划 ${stats.totalHours.toFixed(1)} 小时，分布在 ${stats.timeDist.length} 个类别中，完成 ${done}/${total} 项，效率评分 ${stats.efficiency} 分。\n\n${praise}${advice}${slotNote}\n\n明天也要元气满满，做时间的主人 💪`;
  }

  /* ============================================================
     指标卡 / 图例 点击详情（把"有信息但不响应"的入口补齐）
     ============================================================ */
  function openStatDetail(key) {
    const scoped = scopeItems(Store.state.schedule, scope);
    const stats = computeStatsFor(scoped);
    const label = scope.mode === "week" ? "本周" : scope.mode === "month" ? "本月" : "今日";
    if (!scoped.length) {
      openSheet(
        `<div class="sheet-head"><div class="h">${label}详情</div><button class="x" data-close>${svg("close")}</button></div>
         <div class="empty" style="padding:30px 0">${emptyArt("stats")}<div class="t">还没有数据</div><div class="s">先去首页规划时间，这里会自动汇总</div></div>`
      );
      return;
    }
    let title = "详情",
      body = "";
    if (key === "focus") {
      title = `${label}专注时长`;
      body = `<div class="detail-list">${stats.timeDist
        .map(
          (d) =>
            `<div class="d-row"><span class="dot" style="background:${d.color}"></span>
             <span class="d-name">${esc(d.tag)}</span>
             <span class="d-val">${d.hours.toFixed(1)}h</span>
             <span class="d-pct">${d.percent}%</span></div>`
        )
        .join("")}
        <div class="divider"></div>
        <div class="d-row sum"><span class="d-name">合计</span><span class="d-val">${stats.totalHours.toFixed(1)}h</span><span class="d-pct">100%</span></div>
      </div>`;
    } else if (key === "efficiency") {
      title = `${label}效率评分`;
      const done = stats.completedCount,
        total = stats.totalCount;
      body = `<div class="big-num center-num">${stats.efficiency}<small> 分</small></div>
        <div class="card-sub mt1" style="text-align:center">完成率 ${total ? Math.round((done / total) * 100) : 0}%（${done}/${total}），是评分的主要依据；专注总时长 ${stats.totalHours.toFixed(1)}h 也会正向影响。</div>
        <div class="divider"></div>
        <div class="detail-list">
          <div class="d-row"><span class="d-name">已规划事项</span><span class="d-val">${total} 项</span></div>
          <div class="d-row"><span class="d-name">已完成</span><span class="d-val">${done} 项</span></div>
          <div class="d-row"><span class="d-name">专注时长</span><span class="d-val">${stats.totalHours.toFixed(1)}h</span></div>
        </div>`;
    } else if (key === "done") {
      title = `${label}完成进度`;
      const doneList = scoped.filter((i) => isDone(i));
      const todoList = scoped.filter((i) => !isDone(i));
      const rowOf = (arr, done) =>
        arr.length
          ? arr
              .slice()
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map(
                (it) =>
                  `<div class="d-row"><span class="ic ${done ? "ok" : ""}">${svg(done ? "check" : "dot")}</span><span class="d-name ${done ? "done" : ""}">${esc(it.title)}</span><span class="d-val">${it.startTime}</span></div>`
              )
              .join("")
          : `<div class="muted" style="padding:6px 0;font-size:12.5px">无</div>`;
      body = `<div class="detail-list">
        <div class="d-title">已完成（${doneList.length}）</div>${rowOf(doneList, true)}
        <div class="divider"></div>
        <div class="d-title">待完成（${todoList.length}）</div>${rowOf(todoList, false)}
      </div>`;
    } else if (key === "advice") {
      title = `${label}AI 优化建议`;
      const advice = buildAdvice(stats, scope);
      body = `<div class="report-body">
        <div class="report-src"><span class="src-badge off" id="adviceDetailBadge">本地规则</span>基于你的日程数据</div>
        <div id="adviceDetailTxt">${esc(advice).replace(/\n/g, "<br>")}</div>
      </div>
        <button class="btn block mt3" data-act="gen-report">${svg("sparkle")} 生成完整日报</button>`;
    }
    const sheetEl = openSheet(
      `<div class="sheet-head"><div class="h">${title}</div><button class="x" data-close>${svg("close")}</button></div>
       <div class="mt1">${body}</div>`
    );
    // AI 优化建议详情：异步升级为模型生成的真实洞察（与首页同源缓存），并标注真实来源
    if (key === "advice") {
      genInsight(stats).then((r) => {
        const el = sheetEl && sheetEl.querySelector("#adviceDetailTxt");
        if (el && el.isConnected) el.textContent = r.text;
        const badge = sheetEl && sheetEl.querySelector("#adviceDetailBadge");
        if (badge) {
          const on = r.via === "ai";
          badge.textContent = on ? "AI 在线" : "本地规则";
          badge.classList.toggle("on", on);
          badge.classList.toggle("off", !on);
        }
      });
    }
  }

  function openTagDetail(tag) {
    const scoped = scopeItems(Store.state.schedule, scope);
    const items = scoped
      .filter((i) => i.tag === tag)
      .sort((a, b) => (a.date || todayStr()).localeCompare(b.date || todayStr()) || a.startTime.localeCompare(b.startTime));
    const total = items.reduce((s, it) => s + (parseHM(it.endTime) - parseHM(it.startTime)), 0);
    const label = scope.mode === "week" ? "本周" : scope.mode === "month" ? "本月" : "今日";
    const color = getColorForTag(tag);
    const body = items.length
      ? `<div class="detail-list">${items
          .map(
            (it) =>
              `<div class="d-row"><span class="dot" style="background:${color}"></span>
               <span class="d-name ${isDone(it) ? "done" : ""}">${esc(it.title)}</span>
               <span class="d-val">${humanDateLabel(it.date || todayStr())} ${it.startTime}</span></div>`
          )
          .join("")}
          <div class="divider"></div>
          <div class="d-row sum"><span class="d-name">共 ${items.length} 项</span><span class="d-val">${(total / 1).toFixed(1)}h</span></div>
        </div>`
      : `<div class="empty" style="padding:24px 0">${emptyArt("schedule")}<div class="t">${label}暂无「${esc(tag)}」</div></div>`;
    openSheet(
      `<div class="sheet-head"><div class="h">${esc(tag)} · ${label}</div><button class="x" data-close>${svg("close")}</button></div>
       <div class="mt1">${body}</div>`
    );
  }

  /* ============================================================
     编辑已有日程（字段前向兼容：repeat / remind）
     ============================================================ */
  function openEdit(id) {
    const it = Store.state.schedule.find((x) => x.id === id);
    if (!it) return;
    const tags = allTags();
    const draft = {
      title: it.title,
      date: it.date || todayStr(),
      startTime: it.startTime,
      endTime: it.endTime,
      tag: it.tag,
      tagColor: it.tagColor || getColorForTag(it.tag),
      repeat: it.repeat || "none",
      remind: !!it.remind,
      remindOffset: it.remindOffset || 10,
      priority: it.priority || "中",
    };
    const tagChips = tags
      .map(
        (t) =>
          `<span class="chip ${draft.tag === t.tag ? "active" : ""}" data-tag="${esc(t.tag)}" data-color="${t.color}" style="--tag-color:${t.color}">${tagIcon(t.tag, t.color)}${esc(t.tag)}</span>`
      )
      .join("");
    const colorDots = colorPickerHTML(draft.tagColor, "edit");
    const repSeg = (v, l) => `<span class="seg-btn ${draft.repeat === v ? "on" : ""}" data-r="${v}">${l}</span>`;
    const remindSub = draft.remind ? `开始前 ${draft.remindOffset} 分钟提醒` : "关闭";
    openSheet(
      `<div class="sheet-head"><div class="h">编辑日程</div><button class="x" data-close>${svg("close")}</button></div>
       <div class="mt1 edit-form">
         <div class="form-section">
           <div class="form-label">事项</div>
           <input class="input" id="eTitle" value="${esc(draft.title)}" placeholder="例如：上午 team meeting" />
         </div>
         <div class="form-section">
           <div class="form-label">分类</div>
           <div class="tag-chips">${tagChips}</div>
           ${colorDots}
         </div>
         <div class="form-section">
           <div class="form-label">时间</div>
           <input type="date" class="date-input" id="eDate" value="${esc(draft.date)}" />
           <div class="time-row">
             <div class="time-col"><span class="time-label">开始</span><input type="time" class="date-input" id="eStart" value="${esc(draft.startTime)}" /></div>
             <div class="time-arrow">→</div>
             <div class="time-col"><span class="time-label">结束</span><input type="time" class="date-input" id="eEnd" value="${esc(draft.endTime)}" /></div>
           </div>
         </div>
         <div class="form-section">
           <div class="form-label">重复</div>
           <div class="seg repeat-seg">${repSeg("none", "不重复")}${repSeg("daily", "每天")}${repSeg("weekly", "每周")}</div>
         </div>
         <div class="form-section">
           <div class="form-label">优先级</div>
           <div class="prio-seg" id="ePrioSeg">${["高", "中", "低"].map((p) => `<span class="seg-btn ${draft.priority === p ? "on" : ""}" data-prio="${p}">${p}</span>`).join("")}</div>
         </div>
         <div class="form-section reminder-section">
           <div class="pref-row"><div><div class="pr-t">提醒</div><div class="pr-d" id="ePrd">${remindSub}</div></div>
             <button class="switch ${draft.remind ? "on" : ""}" id="eRemind" role="switch" aria-checked="${draft.remind}"><i></i></button></div>
           <div class="offset-row" id="eOffsetRow" style="${draft.remind ? "" : "display:none"}">
             <span class="form-label">提前</span>
             <div class="offset-input-wrap"><input class="input" id="eOffset" type="number" min="0" max="120" value="${draft.remindOffset}" /><span class="card-sub">分钟</span></div>
           </div>
         </div>
         <div class="flex mt3" style="gap:12px">
           <button class="btn ghost flex" data-close style="flex:1;border-radius:var(--r-md)">取消</button>
           <button class="btn flex" id="eConfirm" style="flex:1;border-radius:var(--r-md)">保存</button>
         </div>
       </div>`,
      {
        onOpen: (el) => {
          const title = el.querySelector("#eTitle");
          const date = el.querySelector("#eDate");
          const start = el.querySelector("#eStart");
          const end = el.querySelector("#eEnd");
          const offset = el.querySelector("#eOffset");
          const remind = el.querySelector("#eRemind");
          const offsetRow = el.querySelector("#eOffsetRow");
          const prd = el.querySelector("#ePrd");
          offset.addEventListener("input", () => {
            draft.remindOffset = clamp(parseInt(offset.value, 10) || 0, 0, 120);
            if (draft.remind) prd.textContent = `开始前 ${draft.remindOffset} 分钟提醒`;
          });
          remind.addEventListener("click", () => {
            draft.remind = !draft.remind;
            remind.classList.toggle("on", draft.remind);
            remind.setAttribute("aria-checked", draft.remind ? "true" : "false");
            offsetRow.style.display = draft.remind ? "" : "none";
            prd.textContent = draft.remind ? `开始前 ${draft.remindOffset} 分钟提醒` : "关闭";
            if (draft.remind && "Notification" in window && Notification.permission === "default")
              Notification.requestPermission();
          });
          el.querySelectorAll(".tag-chips .chip").forEach((c) =>
            c.addEventListener("click", () => {
              draft.tag = c.dataset.tag;
              draft.tagColor = c.dataset.color;
              el.querySelectorAll(".chip").forEach((x) => x.classList.toggle("active", x === c));
              el.querySelectorAll(".color-dot").forEach((x) => x.classList.toggle("sel", x.dataset.color === draft.tagColor));
            })
          );
          const customLabel = el.querySelector(".color-custom");
          const customInput = el.querySelector(".color-custom-input");
          el.querySelectorAll(".color-dot").forEach((c) =>
            c.addEventListener("click", () => {
              draft.tagColor = c.dataset.color;
              el.querySelectorAll(".color-dot").forEach((x) => x.classList.toggle("sel", x === c));
              if (customLabel) {
                customLabel.classList.remove("active");
                customLabel.style.background = "";
              }
            })
          );
          if (customInput)
            customInput.addEventListener("input", () => {
              draft.tagColor = customInput.value;
              el.querySelectorAll(".color-dot").forEach((x) => x.classList.remove("sel"));
              customLabel.classList.add("active");
              customLabel.style.background = customInput.value;
            });
          el.querySelectorAll(".seg .seg-btn").forEach((b) =>
            b.addEventListener("click", () => {
              draft.repeat = b.dataset.r;
              el.querySelectorAll(".seg-btn").forEach((x) => x.classList.toggle("on", x === b));
            })
          );
          const ePrio = el.querySelector("#ePrioSeg");
          if (ePrio)
            ePrio.querySelectorAll(".seg-btn").forEach((b) =>
              b.addEventListener("click", () => {
                draft.priority = b.dataset.prio;
                ePrio.querySelectorAll(".seg-btn").forEach((x) => x.classList.toggle("on", x === b));
              })
            );
          el.querySelector("#eConfirm").addEventListener("click", () => {
            const t = title.value.trim();
            if (!t) {
              toast("请填写事项内容", "warn");
              title.focus();
              return;
            }
            if (!start.value || !end.value) {
              toast("请选择开始和结束时间", "warn");
              return;
            }
            if (end.value <= start.value) {
              toast("结束时间需晚于开始时间", "warn");
              return;
            }
            Store.updateSchedule(id, {
              title: t,
              date: date.value || todayStr(),
              startTime: start.value,
              endTime: end.value,
              tag: draft.tag,
              tagColor: draft.tagColor,
              repeat: draft.repeat,
              remind: draft.remind,
              remindOffset: draft.remindOffset,
              priority: draft.priority || "中",
            });
            closeSheet();
            renderCurrent();
            toast("已更新日程 ✨", "ok");
            scheduleReminder(Store.state.schedule.find((x) => x.id === id));
          });
        },
      }
    );
  }

  // Web 端轻量提醒（回迁鸿蒙时用 reminderAgent 替换）：当天临近开始触发
  // 系统通知开关：仅当用户选择「系统通知/两者」且已授权时才用 OS 通知；否则回退 App 内提醒
  function sysNotifyAllowed() {
    const mode = Store.state.prefs.notifyMode || "toast";
    if (mode !== "system" && mode !== "both") return false;
    return "Notification" in window && Notification.permission === "granted";
  }
  function testNotify() {
    const mode = Store.state.prefs.notifyMode || "toast";
    const body = "这是一条测试提醒 ✨ 若选择系统通知，请先在系统弹窗允许通知权限。";
    if ((mode === "system" || mode === "both") && "Notification" in window) {
      if (Notification.permission === "default") { try { Notification.requestPermission(); } catch (e) {} }
      if (Notification.permission === "granted") { try { new Notification("TimeAgent 测试通知", { body }); } catch (e) {} }
    }
    toast("已发送测试提醒（当前方式：" + (mode === "toast" ? "仅 App 内" : mode === "system" ? "系统通知" : "两者") + "）", "ok");
  }
  function scheduleReminder(it) {
    if (!it || !it.remind) return;
    if ((it.date || todayStr()) !== todayStr()) return;
    const [h, m] = it.startTime.split(":").map(Number);
    const target = new Date();
    target.setHours(h, m, 0, 0);
    // 动态提醒：你平均比计划晚完成 X 分钟 → 提醒自动提前 X 分钟
    const offset = (it.remindOffset || 10) + lateMinAvg();
    target.setMinutes(target.getMinutes() - offset);
    const diff = target.getTime() - Date.now();
    if (diff <= 0 || diff > 24 * 3600 * 1000) return;
    setTimeout(() => {
      const msg = `「${it.title}」将在 ${offset} 分钟后开始（${it.startTime}），记得准备一下～`;
      if (sysNotifyAllowed()) {
        try {
          new Notification("TimeAgent 日程提醒", { body: msg });
        } catch (e) {}
      }
      // 提醒统一进对话舱：无论是否打开都写入历史（toast 一闪而过也不丢）
      const chatMsg = msg + personaFlavor();
      proactiveChatPush(chatMsg);
      if (document.getElementById("chatLayer")) {
        // 已打开：proactiveChatPush 已渲染
      } else {
        toast(msg, "ok", {
          label: "查看",
          onClick: () => {
            openChat(); // 历史已落库，openChat 会渲染全部历史
          },
        });
      }
    }, diff);
  }

  function initReminders() {
    Store.state.schedule.forEach((it) => scheduleReminder(it));
  }

  /* ============================================================
     AI 主动聊天（proactive）：AI 自主找你说话
     - 触发（本地规则零 token）：距下一项 ≤20min / 过期未完成 / 连续未完成 / 全部完成鼓励
     - 展现：对话舱已打开→直接插入 AI 消息；未打开→toast 横幅（点击进对话舱）
     - 防打扰：每天最多 4 次（localStorage 按日期计数）
     ============================================================ */
  const PROACTIVE_KEY = "timeagent_proactive_v1";
  function proactiveTodayCount() {
    try {
      const raw = JSON.parse(localStorage.getItem(PROACTIVE_KEY) || "{}");
      return raw.d === todayStr() ? raw.n || 0 : 0;
    } catch (e) {
      return 0;
    }
  }
  function proactiveLogOnce(type) {
    try {
      const raw = JSON.parse(localStorage.getItem(PROACTIVE_KEY) || "{}");
      const n = raw.d === todayStr() ? raw.n || 0 : 0;
      const types = raw.d === todayStr() && Array.isArray(raw.types) ? raw.types : [];
      if (type) types.push(type); // 允许重复，用于按类型限次（含 boost 放宽）
      localStorage.setItem(PROACTIVE_KEY, JSON.stringify({ d: todayStr(), n: n + 1, types }));
    } catch (e) {}
  }
  function proactiveTypeCount(type) {
    try {
      const raw = JSON.parse(localStorage.getItem(PROACTIVE_KEY) || "{}");
      if (raw.d !== todayStr() || !Array.isArray(raw.types)) return 0;
      return raw.types.filter((x) => x === type).length;
    } catch (e) {
      return 0;
    }
  }
  // 按类型每日上限：默认 1 次，被👍≥3 后放宽到 2 次
  function proactiveTypeCap(type) {
    return fbBoosted(type) ? 2 : 1;
  }
  function proactiveTypeDone(type) {
    return proactiveTypeCount(type) >= proactiveTypeCap(type);
  }
  // —— 主动消息反馈（👍👎 自学习）：👎≥2 暂停该类，👍≥3 提高该类频次 ——
  const FB_KEY = "timeagent_feedback_v1";
  function fbGet() {
    try {
      return JSON.parse(localStorage.getItem(FB_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }
  function fbRecord(type, useful) {
    const s = fbGet();
    s[type] = s[type] || { l: 0, d: 0 };
    if (useful) s[type].l++;
    else s[type].d++;
    localStorage.setItem(FB_KEY, JSON.stringify(s));
    return s[type];
  }
  function fbMuted(type) {
    const s = fbGet()[type];
    return !!(s && s.d >= 2 && s.d > s.l);
  }
  function fbBoosted(type) {
    const s = fbGet()[type];
    return !!(s && s.l >= 3 && s.l > s.d);
  }
  function typeLabel(t) {
    return { nudge: "催办", comment: "点评", question: "提问", backup: "备份" }[t] || t;
  }
  function fbAfterText(type, s) {
    if (s.d >= 2 && s.d > s.l) return `记下了，以后这类（${typeLabel(type)}）提醒会少一些～`;
    if (s.l >= 3 && s.l > s.d) return `收到！之后「${typeLabel(type)}」这类提醒会多一些`;
    return "已记录，我会慢慢学着更懂你～";
  }
  // 备份提醒是否到期（独立判定，便于测试）：从未备份且有 ≥3 条数据，或超过 30 天未备份
  function backupRemindDue() {
    const lb = Store.state.prefs.lastBackupAt;
    if (!lb) return Store.state.schedule.length >= 3; // 从未备份：有 ≥3 条数据才提醒（空数据不扰）
    const days = Math.floor((Date.now() - lb) / 86400000);
    return days >= 30;
  }
  // 主动消息候选：nudge=催办 / comment=日程合理性点评 / question=小提问
  function proactivePick() {
    // 三类全被👎暂停 → 不再主动打扰
    if (fbMuted("nudge") && fbMuted("comment") && fbMuted("question")) return null;
    const t = todayStr();
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    const today = scopeItems(Store.state.schedule, { mode: "day", anchor: t });
    if (!today.length) return null;
    const sorted = today.slice().sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
    // ① 催办 nudge
    if (!fbMuted("nudge")) {
      const upcoming = sorted.filter((i) => !isDone(i) && toMin(i.startTime) > nowMin);
      const next = upcoming[0];
      if (next) {
        const diff = toMin(next.startTime) - nowMin;
        if (diff <= 20) return { type: "nudge", text: `还有 ${diff} 分钟就到「${next.title}」了，先准备一下？`, tone: "ok" };
      }
      const missed = sorted.filter((i) => !isDone(i) && toMin(i.endTime) < nowMin);
      if (missed.length && !upcoming.length)
        return { type: "nudge", text: `「${missed[0].title}」时间已经过了，是忘了打卡还是没来得及？`, tone: "warn" };
      const miss = {};
      Store.state.schedule.forEach((i) => {
        const d = i.date || t;
        if (!isDone(i) && d >= addDays(t, -3) && d <= t) miss[i.title] = (miss[i.title] || 0) + 1;
      });
      const missTop = Object.entries(miss).sort((a, b) => b[1] - a[1])[0];
      if (missTop && missTop[1] >= 2)
        return { type: "nudge", text: `「${missTop[0]}」连续 ${missTop[1]} 天没完成，要不要我帮你换个更合适的时间？`, tone: "warn" };
      if (nowMin > 6 * 60 && sorted.length && sorted.every((i) => isDone(i)))
        return { type: "nudge", text: `今天的安排全部完成啦，干得漂亮！要不要安排点放松时间？`, tone: "ok" };
    }
    // ② 合理性点评 comment（每天 ≤1 次，👍 后放宽到 2 次）
    if (!fbMuted("comment") && !proactiveTypeDone("comment")) {
      const tom = addDays(t, 1);
      const tomItems = scopeItems(Store.state.schedule, { mode: "day", anchor: tom });
      const tomHours = tomItems.reduce((s, i) => s + Math.max(0, parseHM(i.endTime) - parseHM(i.startTime)), 0);
      if (tomItems.length && tomHours > 10)
        return { type: "comment", text: `明天排了 ${tomHours.toFixed(1)} 小时，会不会太满了？要不要匀点到后天？`, tone: "warn" };
      const night = sorted.filter((i) => !isDone(i) && parseHM(i.startTime) >= 21);
      if (night.length >= 2)
        return { type: "comment", text: `今天有 ${night.length} 个任务排在 21 点后，长期这样容易影响休息。`, tone: "warn" };
      const wk = [];
      let dd = addDays(t, -6),
        g = 0;
      while (dd <= t && g < 400) {
        scopeItems(Store.state.schedule, { mode: "day", anchor: dd }).forEach((i) => wk.push(i));
        dd = addDays(dd, 1);
        g++;
      }
      if (wk.length >= 5) {
        const rate = wk.filter((i) => isDone(i)).length / wk.length;
        if (rate < 0.4) return { type: "comment", text: `最近一周完成率只有 ${Math.round(rate * 100)}%，目标是不是定太高了？可以从减量开始。`, tone: "info" };
      }
      // 目标守护：有未达标目标且今天有空闲 → 提醒补上
      const pg = goalProgress().filter((g) => !g.done);
      const hasFree = freeSlots().length > 0;
      if (pg.length && hasFree) {
        const g0 = pg[0];
        return { type: "comment", text: `目标「${g0.title}」${g0.period === "day" ? "今天" : "本周"}还差 ${g0.remain} 小时，今天有空闲时段，要不要安排上？`, tone: "info" };
      }
    }
    // ③ 小提问 question（每天 ≤1 次，👍 后放宽到 2 次）
    if (!fbMuted("question") && !proactiveTypeDone("question")) {
      const freq = {};
      Store.state.schedule.forEach((i) => {
        const d = i.date || t;
        if (d >= addDays(t, -14) && d <= addDays(t, 14)) freq[i.title] = (freq[i.title] || 0) + 1;
      });
      const topQ = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
      if (topQ && topQ[1] >= 3)
        return { type: "question", text: `我注意到「${topQ[0]}」最近出现得很频繁，是你最近的重点吗？要不要帮你固定成重复日程？`, tone: "info" };
      const nightCnt = Store.state.schedule.filter((i) => parseHM(i.startTime) >= 21).length;
      if (nightCnt >= 3)
        return { type: "question", text: `你好像经常把任务排在深夜，是习惯还是白天没空？可以聊聊怎么调整。`, tone: "info" };
    }
    // ④ 备份到期提醒（数据安全优先，独立于三类 mute；三类全 mute 时已在函数开头整体静默）
    if (!fbMuted("backup") && backupRemindDue()) {
      const lb = Store.state.prefs.lastBackupAt;
      const days = lb ? Math.floor((Date.now() - lb) / 86400000) : 9999;
      return {
        type: "backup",
        text: lb
          ? `距离上次备份已经 ${days} 天了，数据都存在手机本地，记得定期备份防丢失～`
          : `你已经积累了不少日程数据，建议先导出一份备份（微信 / 网盘），换手机也不怕丢～`,
        tone: "info",
      };
    }
    return null;
  }
  function proactiveChatPush(text, type) {
    // 无论对话舱是否打开都写入历史（持久化），避免 toast 一闪而过用户错过；
    // 打开时才渲染到当前列表（openChat 打开时会渲染全部历史）。
    const m = mkMsg("text", text, null, "offline");
    if (type) m.fb = type; // 带反馈按钮（nudge/comment/question）
    Store.state.chat.push(m);
    Store.save();
    const layer = document.getElementById("chatLayer");
    const list = layer && layer.querySelector("#chatList");
    if (!list) return false; // 未打开：仅落库，下次打开可见
    list.appendChild(chatBubble(m));
    list.scrollTop = list.scrollHeight;
    return true;
  }
  function proactiveFire() {
    if (proactiveTodayCount() >= 4) return;
    const hit = proactivePick();
    if (!hit) return;
    proactiveLogOnce(hit.type);
    // 无正式前缀，像人一样说话（默认文案已口语化；调教风格时追加轻量装饰）
    const text = hit.text + personaFlavor();
    const fbActions = [
      { label: "有用", onClick: () => toast(fbAfterText(hit.type, fbRecord(hit.type, true)), "ok") },
      { label: "没用", onClick: () => toast(fbAfterText(hit.type, fbRecord(hit.type, false)), "warn") },
    ];
    if (document.getElementById("chatLayer")) {
      proactiveChatPush(text, hit.type);
    } else {
      proactiveChatPush(text, hit.type); // 先落库（toast 一闪而过也不丢，打开对话舱可见）
      toast(`AI 主动提醒：${hit.text}`, hit.tone === "warn" ? "warn" : "ok", [
        ...fbActions,
        {
          label: "去看看",
          onClick: () => {
            openChat(); // 历史已落库，openChat 会渲染全部历史
          },
        },
      ]);
      // 系统通知：有权限时后台/锁屏也能看到（仅提醒一次，不重复）
      if (sysNotifyAllowed()) {
        try {
          new Notification("TimeAgent 主动提醒", { body: hit.text });
        } catch (e) {}
      }
    }
  }

  /* ============================================================
     我的页：历史记录 / 偏好设置 / 帮助与反馈
     ============================================================ */
  function openHistory() {
    const groups = groupByDate(Store.state.schedule).reverse(); // 最近的在前
    const body = groups.length
      ? `<div class="detail-list scroll">${groups
          .map(([d, items]) => {
            const ds = computeStatsFor(items);
            const its = items
              .slice()
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map(
                (it) =>
                  `<div class="d-row sub"><span class="d-name ${isDone(it) ? "done" : ""}">${esc(it.title)}</span><span class="d-val">${it.startTime}</span></div>`
              )
              .join("");
            return `<div class="d-group">
              <div class="d-row head"><span class="d-name">${humanDateLabel(d)}</span>
                <span class="d-val">${items.length} 项 · ${ds.totalHours.toFixed(1)}h</span></div>
              ${its}
            </div>`;
          })
          .join("")}</div>`
      : `<div class="empty" style="padding:24px 0">${emptyArt("schedule")}<div class="t">还没有任何历史记录</div><div class="s">添加日程后会按日期自动归档</div></div>`;
    openSheet(
      `<div class="sheet-head"><div class="h">历史记录</div><button class="x" data-close>${svg("close")}</button></div>
       <div class="mt1">${body}</div>`
    );
  }

  function openPrefs() {
    const p = Store.state.prefs;
    const nm = p.notifyMode || "toast";
    const segN = (val, label) => `<span class="seg-btn ${nm === val ? "on" : ""}" data-act="set-pref" data-key="notifyMode" data-val="${val}">${label}</span>`;
    const seg = (key, val, label) =>
      `<span class="seg-btn ${p[key] === val ? "on" : ""}" data-act="set-pref" data-key="${key}" data-val="${val}">${label}</span>`;
    const toggleRow = (key, label, desc) =>
      `<div class="pref-row"><div><div class="pr-t">${label}</div><div class="pr-d">${desc}</div></div>
        <button class="switch ${p[key] ? "on" : ""}" role="switch" aria-checked="${p[key] ? "true" : "false"}" data-act="toggle-pref" data-key="${key}"><i></i></button></div>`;
    openSheet(
      `<div class="sheet-head"><div class="h">AI 偏好设置</div><button class="x" data-close>${svg("close")}</button></div>
       <div class="mt1">
         <div class="card-sub">默认打开的视图</div>
         <div class="seg mt2" style="display:inline-flex">
           ${seg("defaultView", "day", "日")}${seg("defaultView", "week", "周")}${seg("defaultView", "month", "月")}
         </div>
         <div class="divider"></div>
         ${toggleRow("freshHighlight", "新日程高亮", "刚添加的日程带「新鲜」标记，便于快速定位")}
         <div class="divider"></div>
         <div class="card-sub">提醒方式</div>
         <div class="seg mt2" style="display:inline-flex">
           ${segN("toast", "仅 App 内")}${segN("system", "系统通知")}${segN("both", "两者")}
         </div>
         <div class="card-sub mt1" style="line-height:1.7">系统通知需浏览器/系统授权；安卓 WebView（TWA）内系统通知可能受限，会自动回退为 App 内提醒。推荐「两者」。</div>
         <button class="btn block soft mt2" data-act="test-notify">${svg("bell")} 发送测试通知</button>
       </div>`
    );
  }

  function openHelp() {
    openSheet(
      `<div class="sheet-head"><div class="h">帮助与反馈</div><button class="x" data-close>${svg("close")}</button></div>
       <div class="mt1">
         <div class="card-sub">快速上手</div>
         <div class="detail-list mt2">
           <div class="d-row"><span class="d-name">一句话排期</span><span class="d-val">首页输入框或右下角 +，如「明天下午3点开会2小时」</span></div>
           <div class="d-row"><span class="d-name">多日管理</span><span class="d-val">顶部切日/周/月，录入可指定日期</span></div>
           <div class="d-row"><span class="d-name">AI 对话</span><span class="d-val">右上角 ✨，可加/删/查日程</span></div>
         </div>
         <div class="divider"></div>
         <div class="card-sub">说明</div>
         <div class="card-sub mt1" style="line-height:1.7">默认使用本地离线解析（已覆盖排期、冲突检测、统计、多日视图等核心功能）；在「我的」页填入支持浏览器直连的 API Key（推荐硅基流动）后，AI 规划与对话将调用大模型，失败时自动回退离线解析。</div>
         <div class="card-sub mt1" style="line-height:1.7">提醒：Web 原型仅在当天临近开始时弹出（依赖浏览器通知权限），重复日程按每次分别提醒；迁移到鸿蒙后将由系统 reminderAgent 接管，支持跨天与更准时触发。</div>
         <div class="divider"></div>
         <div class="card-sub">反馈渠道</div>
         <div class="detail-list mt2">
           <div class="d-row"><span class="ic">${svg("headphones")}</span><span class="d-name">使用疑问 / 功能建议</span><span class="d-val">可在「我的」页继续留言</span></div>
         </div>
       </div>`
    );
  }

  /* ============================================================
     个人中心：三个数据概览点击详情
     ============================================================ */
  function openOverviewDetail(key) {
    const all = Store.state.schedule;
    const totalHours = all.reduce((s, it) => s + Math.max(0, parseHM(it.endTime) - parseHM(it.startTime)), 0);
    const totalCount = all.length;
    const groups = groupByDate(all);
    const uniqueDays = groups.length;
    let title = "详情",
      body = "";
    if (key === "records") {
      title = "累计记录";
      body = totalCount
        ? `<div class="big-num center-num">${totalCount}<small> 项</small></div>
           <div class="detail-list scroll mt2">${groups
             .map(
               ([d, items]) =>
                 `<div class="d-row"><span class="d-name">${humanDateLabel(d)}</span><span class="d-val">${items.length} 项</span></div>`
             )
             .join("")}</div>`
        : `<div class="empty" style="padding:24px 0">${emptyArt("schedule")}<div class="t">还没有任何记录</div><div class="s">添加日程后会自动统计</div></div>`;
    } else if (key === "hours") {
      title = "累计专注时长";
      const stats = computeStatsFor(all);
      body = totalHours
        ? `<div class="big-num center-num">${totalHours.toFixed(1)}<small> h</small></div>
           <div class="detail-list mt2">${stats.timeDist
             .map(
               (d) =>
                 `<div class="d-row"><span class="dot" style="background:${d.color}"></span><span class="d-name">${esc(d.tag)}</span><span class="d-val">${d.hours.toFixed(1)}h</span><span class="d-pct">${d.percent}%</span></div>`
             )
             .join("")}
             <div class="divider"></div>
             <div class="d-row sum"><span class="d-name">合计</span><span class="d-val">${totalHours.toFixed(1)}h</span></div>
           </div>`
        : `<div class="empty" style="padding:24px 0">${emptyArt("stats")}<div class="t">还没有专注数据</div><div class="s">安排并完成后会在这里汇总</div></div>`;
    } else if (key === "streak") {
      title = "打卡天数";
      body = uniqueDays
        ? `<div class="big-num center-num">${uniqueDays}<small> 天</small></div>
           <div class="card-sub mt1" style="text-align:center">你在这 ${uniqueDays} 天里至少安排了一项日程</div>
           <div class="detail-list scroll mt2">${groups
             .map(
               ([d, items]) =>
                 `<div class="d-row"><span class="d-name">${humanDateLabel(d)}</span><span class="d-val">${items.length} 项 · ${computeStatsFor(items).totalHours.toFixed(1)}h</span></div>`
             )
             .join("")}</div>`
        : `<div class="empty" style="padding:24px 0">${emptyArt("schedule")}<div class="t">还没有打卡</div><div class="s">添加第一条日程即可开始累积</div></div>`;
    }
    openSheet(
      `<div class="sheet-head"><div class="h">${title}</div><button class="x" data-close>${svg("close")}</button></div>
       <div class="mt1">${body}</div>`
    );
  }

  /* ============================================================
     数据备份（加密导出 / 导入恢复 / 清空）——大众友好向导式
     ============================================================ */
  function downloadJSON(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    downloadBlob(blob, filename);
  }
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // —— 备份编解码核心（Web Crypto 加密，无口令则 base64 明文）——
  function b64FromBytes(bytes) {
    let s = "";
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function bytesFromB64(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function backupCryptoOK() {
    return !!(window.crypto && window.crypto.subtle && window.TextEncoder && window.TextDecoder);
  }
  function backupPayload() {
    return {
      app: "timeagent",
      ver: 1,
      at: new Date().toISOString(),
      schedule: Store.state.schedule,
      customTags: Store.state.customTags,
      prefs: Store.state.prefs,
      chat: Store.state.chat || [],
    };
  }
  async function buildBackupFile(passphrase) {
    const json = JSON.stringify(backupPayload());
    const bytes = new TextEncoder().encode(json);
    let pkg;
    if (passphrase && backupCryptoOK()) {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
      const dk = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
      const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, dk, bytes));
      pkg = { app: "timeagent", ver: 1, enc: true, salt: b64FromBytes(salt), iv: b64FromBytes(iv), data: b64FromBytes(ct) };
    } else {
      pkg = { app: "timeagent", ver: 1, enc: false, data: b64FromBytes(bytes) };
    }
    return { blob: new Blob([JSON.stringify(pkg)], { type: "application/octet-stream" }), name: `timeagent-backup-${todayStr()}.timeagent` };
  }
  async function parseBackupText(text, passphrase) {
    const pkg = JSON.parse(text);
    if (!pkg || pkg.app !== "timeagent") throw new Error("不是 TimeAgent 备份文件（或文件已损坏）");
    let json;
    if (pkg.enc) {
      if (!passphrase) throw new Error("该备份已加密，请输入当时设置的口令");
      if (!backupCryptoOK()) throw new Error("当前环境不支持解密");
      const salt = bytesFromB64(pkg.salt);
      const iv = bytesFromB64(pkg.iv);
      const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
      const dk = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
      let pt;
      try {
        pt = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, dk, bytesFromB64(pkg.data)));
      } catch (e) {
        throw new Error("口令不正确，请重新输入");
      }
      json = new TextDecoder().decode(pt);
    } else {
      json = new TextDecoder().decode(bytesFromB64(pkg.data));
    }
    const data = JSON.parse(json);
    if (!data || !Array.isArray(data.schedule)) throw new Error("备份内容格式不正确");
    return data;
  }
  function shareOrDownload(blob, name) {
    try {
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], name, { type: "application/octet-stream" })] })) {
        navigator.share({ files: [new File([blob], name, { type: "application/octet-stream" })] }).catch(() => {});
        return "share";
      }
    } catch (e) {}
    downloadBlob(blob, name);
    return "download";
  }
  function applyBackupData(data) {
    Store.state.schedule = data.schedule
      .filter((i) => i && i.title != null)
      .map((i) => Object.assign({ date: todayStr(), isCompleted: false, isFresh: false, desc: "", repeat: "none", remind: false, remindOffset: 10, doneDates: [], priority: "中", doneAt: null, doneAtMap: null }, i));
    if (Array.isArray(data.customTags)) Store.state.customTags = data.customTags;
    if (data.prefs) Store.state.prefs = Object.assign({ defaultView: "day", freshHighlight: true }, data.prefs);
    if (Array.isArray(data.chat)) Store.state.chat = data.chat;
    Store.state.prefs.lastBackupAt = Date.now();
    Store.notify();
    initReminders();
    renderCurrent();
  }

  function openBackup() {
    openSheet(
      `<div class="sheet-head"><div class="h">数据备份</div><button class="x" data-close>${svg("close")}</button></div>
       <div id="bkBody" class="mt1"></div>`,
      { onOpen: (el) => bkRenderMain(el.querySelector("#bkBody")) }
    );
  }
  function bkRenderMain(body) {
    const n = Store.state.schedule.length;
    body.innerHTML = `
      <div class="bk-tip" style="line-height:1.7">📱 换手机 / 清缓存 / 卸载前，先「导出备份」存到微信或网盘；新手机装好 App 后「导入备份」一键恢复全部数据（含人格、目标、统计）。</div>
      <button class="btn block mt2" id="bkExportStart">${svg("save")} 导出备份</button>
      <button class="btn block soft mt2" id="bkImportStart">${svg("folder")} 导入备份</button>
      <div class="divider"></div>
      <div class="card-sub muted">当前 ${n} 条日程。旧版 .json 备份同样可以导入。</div>
      <button class="btn block ghost danger mt2" id="bkClear">${svg("trash")} 清空全部日程</button>`;
    body.querySelector("#bkExportStart").addEventListener("click", () => bkRenderExport(body));
    body.querySelector("#bkImportStart").addEventListener("click", () => bkRenderImport(body));
    body.querySelector("#bkClear").addEventListener("click", () => {
      openSheet(
        `<div class="sheet-head"><div class="h">确认清空</div><button class="x" data-close>${svg("close")}</button></div>
         <div class="mt1"><div class="card-sub">将删除全部 ${n} 条日程，此操作不可撤销。建议先导出一份备份。确定要继续吗？</div>
           <div class="flex mt3" style="gap:10px"><button class="btn ghost flex" data-close style="flex:1">取消</button><button class="btn flex danger" id="bkClearConfirm" style="flex:1">确认清空</button></div>
         </div>`,
        {
          onOpen: (el2) => {
            el2.querySelector("#bkClearConfirm").addEventListener("click", () => {
              Store.state.schedule = [];
              Store.notify();
              closeSheet();
              renderCurrent();
              toast("已清空全部日程", "warn");
            });
          },
        }
      );
    });
  }
  function bkRenderExport(body) {
    body.innerHTML = `
      <div class="bk-step-title">📤 导出备份 · 要不要加密？</div>
      <div class="card-sub mt1" style="line-height:1.7">口令可留空（不加密，更方便）；填了口令则文件加密，<b>换机导入时必须输入同一个口令</b>，忘了就解不开，请务必记住。</div>
      <input class="input mt2" id="bkPwd" type="password" placeholder="加密口令（可留空）" />
      <div class="flex gap1 mt3">
        <button class="btn ghost flex" id="bkBack">返回</button>
        <button class="btn flex" id="bkDoExport">生成备份文件</button>
      </div>
      <div id="bkResult" class="mt2"></div>`;
    body.querySelector("#bkBack").addEventListener("click", () => bkRenderMain(body));
    body.querySelector("#bkDoExport").addEventListener("click", async () => {
      const btn = body.querySelector("#bkDoExport");
      btn.disabled = true;
      btn.textContent = "正在生成…";
      try {
        const pwd = body.querySelector("#bkPwd").value;
        const { blob, name } = await buildBackupFile(pwd);
        try { Store.state.prefs.lastBackupAt = Date.now(); Store.notify(); } catch (e) {}
        const how = shareOrDownload(blob, name);
        body.querySelector("#bkResult").innerHTML = `<div class="bk-ok">✅ 备份已生成（${esc(name)}）</div>
          <div class="card-sub mt1" style="line-height:1.7">${pwd ? "已用口令加密。" : "未加密。"}${how === "share" ? "已弹出分享面板，选「微信文件传输助手」或网盘保存即可。" : "文件已保存到下载目录；想存到微信/网盘，点下面按钮分享。"}</div>
          <button class="btn block soft mt2" id="bkShareAgain">${svg("share")} 分享 / 保存到其它位置</button>`;
        body.querySelector("#bkShareAgain").addEventListener("click", () => {
          shareOrDownload(blob, name);
          toast("已重新调起分享", "ok");
        });
        toast("备份已生成", "ok");
      } catch (e) {
        body.querySelector("#bkResult").innerHTML = `<div class="bk-err">⚠️ 导出失败：${esc(e.message || "未知错误")}</div>`;
      } finally {
        btn.disabled = false;
        btn.textContent = "生成备份文件";
      }
    });
  }
  function bkRenderImport(body) {
    body.innerHTML = `
      <div class="bk-step-title">📥 导入备份</div>
      <div class="card-sub mt1" style="line-height:1.7">选择之前导出的 <b>.timeagent</b> 备份文件（旧 .json 也行）。若备份加密过，请输入当时的口令。</div>
      <label class="btn block soft mt2" style="display:block;text-align:center;cursor:pointer">${svg("folder")} 选择备份文件
        <input type="file" id="bkFile" accept=".timeagent,.json,application/json,application/octet-stream" style="display:none" />
      </label>
      <input class="input mt2" id="bkPwdIn" type="password" placeholder="备份口令（未加密可留空）" />
      <div id="bkPrev" class="mt2"></div>
      <div class="flex gap1 mt3">
        <button class="btn ghost flex" id="bkBack2">返回</button>
        <button class="btn flex" id="bkDoImport" disabled>恢复此备份</button>
      </div>`;
    body.querySelector("#bkBack2").addEventListener("click", () => bkRenderMain(body));
    let rawText = null;
    let pending = null;
    async function tryParse() {
      if (!rawText) return;
      const pwd = body.querySelector("#bkPwdIn").value;
      try {
        pending = await parseBackupText(rawText, pwd);
        const n = pending.schedule.length;
        const tags = (pending.customTags || []).length;
        const goals = ((pending.prefs || {}).goals || []).length;
        const at = pending.at ? new Date(pending.at).toLocaleString("zh-CN") : "未知";
        body.querySelector("#bkPrev").innerHTML = `<div class="bk-prev">📦 备份时间：${esc(at)}<br>日程 ${n} 条 · 标签 ${tags} 个 · 目标 ${goals} 个</div>`;
        body.querySelector("#bkDoImport").disabled = false;
      } catch (err) {
        pending = null;
        body.querySelector("#bkPrev").innerHTML = `<div class="bk-err">⚠️ ${esc(err.message || "解析失败")}</div>`;
        body.querySelector("#bkDoImport").disabled = true;
      }
    }
    body.querySelector("#bkFile").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        rawText = String(reader.result);
        tryParse();
      };
      reader.readAsText(file);
    });
    body.querySelector("#bkPwdIn").addEventListener("input", tryParse);
    body.querySelector("#bkDoImport").addEventListener("click", async () => {
      if (!pending) return;
      const btn = body.querySelector("#bkDoImport");
      btn.disabled = true;
      // 恢复前自动备份当前数据（防后悔）
      try {
        const cur = await buildBackupFile(null);
        downloadBlob(cur.blob, `restore-undo-${cur.name}`);
      } catch (e) {}
      applyBackupData(pending);
      closeSheet();
      toast(`已恢复 ${pending.schedule.length} 条日程（当前数据已自动备份为 restore-undo 文件）`, "ok");
    });
  }

  /* ============================================================
     AI 对话页（全屏浮层 + 离线助手）
     ============================================================ */
  let chatDraft = null;
  function openChat(prefill) {
    const layer = document.createElement("div");
    layer.id = "chatLayer";
    layer.style.cssText =
      "position:absolute;inset:0;z-index:40;background:var(--bg-1);display:flex;flex-direction:column;animation:pageIn .3s ease";
    // 记忆范围（默认本周）
    const memKey = Store.state.prefs.chatMemory || "week";
    const memFrom = Store.state.prefs.chatMemoryFrom || "";
    const memTo = Store.state.prefs.chatMemoryTo || "";
    const memBtnText = memKey === "custom" ? (memFrom && memTo ? `记忆:${memFrom.slice(5)}~${memTo.slice(5)}` : "记忆:自定义") : `记忆:${chatMemoryLabel(memKey)}`;
    // 智能对话提示：结合历史日程本地生成（零 token）；空对话时展示可点击引导
    const chatHints = smartChatHints();
    const ph = chatHints[0] ? chatHints[0].say : "试试「帮我加个明早背单词1小时」";
    layer.innerHTML = `<div class="head" style="padding:12px 16px;margin:0;background:var(--surface-solid);border-bottom:1px solid var(--line)">
        <button class="icon-btn" id="chatBack">${svg("back")}</button>
        <div class="title" style="font-size:17px">AI 时间管家</div>
        <div class="spacer"></div>
        <span class="tag" id="chatMemTag" role="button" tabindex="0" title="AI 记忆范围：能看到多久的日程" style="background:var(--primary-soft);color:var(--primary-strong);cursor:pointer">${memBtnText}</span>
        <span class="tag" id="chatModeTag" style="background:${apiReady() ? "var(--ok-soft, #E8F5E9)" : "var(--primary-soft)"};color:${apiReady() ? "var(--ok, #2E7D32)" : "var(--primary-strong)"}">${apiReady() ? "AI 在线" : "离线助手"}</span>
      </div>
      ${Store.state.chat.length === 0 ? `<div id="chatHints" style="padding:12px 16px 2px;display:flex;flex-wrap:wrap;gap:8px">${chatHints.map((h) => `<span class="hint-chip" data-chat-hint="${esc(h.say)}">${esc(h.txt)}</span>`).join("")}</div>` : ""}
      <div id="chatList" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px"></div>
      <div style="padding:12px 16px;background:var(--surface-solid);border-top:1px solid var(--line);display:flex;gap:8px">
        <input class="ai-input" id="chatInput" placeholder="试试「${esc(ph)}」" style="flex:1" />
        <button class="btn" id="chatSend" style="width:54px;height:46px;padding:0">${svg("send")}</button>
      </div>`;
    $("#phone").appendChild(layer);
    const list = layer.querySelector("#chatList");
    const input = layer.querySelector("#chatInput");
    const send = layer.querySelector("#chatSend");
    const memTag = layer.querySelector("#chatMemTag");
    // 外部入口（如首页行动卡）传入预填文案：填入输入框并聚焦
    if (prefill && input) {
      input.value = prefill;
      setTimeout(() => input.focus(), 60);
    }

    // 记忆范围选择：仅当日 / 本周 / 本月 / 全局 / 自定义（起止日期）
    function openMemPicker() {
      const cur = Store.state.prefs.chatMemory || "week";
      openSheet(
        `<div class="sheet-head"><div class="h">AI 记忆范围</div><button class="x" data-close>${svg("close")}</button></div>
         <div class="card-sub">AI 能看到多久的日程数据？切换后对话立即生效。</div>
         <div class="mem-opts mt2">
           ${CHAT_MEMORY_OPTS.map(
             (o) =>
               `<div class="mem-opt ${o.key === cur ? "sel" : ""}" data-mem="${o.key}" role="button" tabindex="0">${o.label}<span class="mo-desc">${
                 o.key === "day" ? "只看今天" : o.key === "week" ? "本周 7 天" : o.key === "month" ? "本月全部" : o.key === "all" ? "全局摘要+近期明细" : "指定起止日期"
               }</span></div>`
           ).join("")}
         </div>
         <div id="memCustom" class="mt2" ${cur === "custom" ? "" : "hidden"}>
           <div class="flex" style="gap:8px;align-items:center">
             <input type="date" class="date-input" id="memFrom" value="${Store.state.prefs.chatMemoryFrom || ""}" aria-label="开始日期" />
             <span class="muted">~</span>
             <input type="date" class="date-input" id="memTo" value="${Store.state.prefs.chatMemoryTo || ""}" aria-label="结束日期" />
           </div>
           <button class="btn block mt2" id="memCustomApply">应用自定义范围</button>
         </div>`,
        {
          onOpen: (el) => {
            const apply = (key) => {
              Store.state.prefs.chatMemory = key;
              if (key === "custom") {
                const f = el.querySelector("#memFrom").value;
                const t = el.querySelector("#memTo").value;
                if (!f || !t || f > t) {
                  toast("请选择有效的起止日期", "warn");
                  return;
                }
                Store.state.prefs.chatMemoryFrom = f;
                Store.state.prefs.chatMemoryTo = t;
              }
              Store.notify();
              const label =
                key === "custom"
                  ? `记忆:${(Store.state.prefs.chatMemoryFrom || "").slice(5)}~${(Store.state.prefs.chatMemoryTo || "").slice(5)}`
                  : `记忆:${chatMemoryLabel(key)}`;
              if (memTag) memTag.textContent = label;
              closeSheet();
              toast(`记忆范围已切换：${key === "custom" ? "自定义区间" : chatMemoryLabel(key)} ✅`, "ok");
            };
            el.querySelectorAll(".mem-opt").forEach((o) =>
              o.addEventListener("click", () => {
                el.querySelectorAll(".mem-opt").forEach((x) => x.classList.toggle("sel", x === o));
                const k = o.dataset.mem;
                if (k === "custom") el.querySelector("#memCustom").hidden = false;
                else apply(k);
              })
            );
            const cBtn = el.querySelector("#memCustomApply");
            if (cBtn) cBtn.addEventListener("click", () => apply("custom"));
          },
        }
      );
    }
    if (memTag) memTag.addEventListener("click", openMemPicker);
    // 智能引导 chips：点击填入输入框并聚焦（回车即发送，可先修改）
    layer.querySelectorAll("[data-chat-hint]").forEach((c) =>
      c.addEventListener("click", () => {
        input.value = c.dataset.chatHint;
        input.focus();
        layer.querySelector("#chatHints") && layer.querySelector("#chatHints").remove();
      })
    );

    // 恢复历史
    Store.state.chat.forEach((m) => list.appendChild(chatBubble(m)));
    scrollChat();

    function scrollChat() {
      list.scrollTop = list.scrollHeight;
    }
    function pushMsg(m) {
      Store.state.chat.push(m);
      Store.save();
      list.appendChild(chatBubble(m));
      scrollChat();
    }
    // 顶部模式标签：AI 在线 / 离线助手（调用失败回退时同步切换）
    function setMode(online) {
      const tag = layer.querySelector("#chatModeTag");
      if (!tag) return;
      tag.textContent = online ? "AI 在线" : "离线助手";
      tag.style.background = online ? "var(--ok-soft, #E8F5E9)" : "var(--primary-soft)";
      tag.style.color = online ? "var(--ok, #2E7D32)" : "var(--primary-strong)";
    }
    // Agent 人格调教：调教语气 / 恢复默认 / 命名备份 / 切换备份（本地处理，零 token）
    function handlePersonaCmd(text) {
      const ps = personaState();
      if (/恢复默认|重置(性格|风格|语气|人格)|变回原来|恢复原样/.test(text)) {
        ps.style = "";
        ps.current = "default";
        Store.notify();
        pushMsg(mkMsg("text", "好哒，已经恢复默认语气啦～", null, "offline"));
        return true;
      }
      const bk = text.match(/备份(?:当前)?(?:性格|风格|人格|语气)(?:为|叫|成)?\s*(.+)/);
      if (bk) {
        const name = bk[1].replace(/[。.，,！!？?\s]/g, "").trim();
        if (!name) {
          pushMsg(mkMsg("text", "想给这个风格起个名字，比如「备份性格为 活泼版」～", null, "offline"));
          return true;
        }
        if (!ps.style) {
          pushMsg(mkMsg("text", "当前还没有调教过语气呢，先说说你想要的效果，比如「以后说话可爱一点」～", null, "offline"));
          return true;
        }
        if (!ps.list) ps.list = [];
        ps.list = ps.list.filter((x) => x.name !== name);
        ps.list.push({ id: uid(), name, style: ps.style });
        Store.notify();
        pushMsg(mkMsg("text", `已备份当前风格为「${name}」📦 想换回时说「切换到${name}」。`, null, "offline"));
        return true;
      }
      let sw = text.match(/切换(?:到|成)?\s*「?(.+?)」?(?:的)?(?:性格|风格|人格)/);
      if (!sw) sw = text.match(/切换(?:到|成)?\s*「?(.+?)」?$/);
      if (sw) {
        const name = sw[1].replace(/[。.，,！!？?\s]/g, "").trim();
        const hit = (ps.list || []).find((x) => x.name === name);
        if (hit) {
          ps.style = hit.style;
          ps.current = hit.id;
          Store.notify();
          pushMsg(mkMsg("text", `已切换到「${name}」的风格 🎭`, null, "offline"));
          return true;
        }
        pushMsg(mkMsg("text", `没找到备份「${name}」，可用备份：${(ps.list || []).map((x) => x.name).join("、") || "（暂无，先调教后说「备份性格为 XX」）"}`, null, "offline"));
        return true;
      }
      // 调教指令：引导词 + 风格词
      const TUNE =
        /(?:以后|接下来|今后|从现在起|你要|你应该|请你|请|给我)[^。，,]{1,24}(?:说话|语气|风格|称呼|叫我|可爱|简洁|正式|口语|卖萌|温柔|幽默|活泼|高冷|亲切|像人)/;
      if (TUNE.test(text)) {
        const cmd = text
          .replace(/^(请|好的|行|ok|好哒)/i, "")
          .replace(/^(以后|接下来|今后|从现在起|你要|你应该|请你|请|给我)/, "")
          .replace(/[。.！!？?\s]+$/, "")
          .trim();
        if (cmd && cmd.length <= 40) {
          ps.style = ps.style ? ps.style + "；" + cmd : cmd;
          ps.current = "custom";
          Store.notify();
          pushMsg(mkMsg("text", `好，我记住了：${cmd}。之后我都会这样和你相处～说「恢复默认」随时重置。`, null, "offline"));
          return true;
        }
      }
      return false;
    }
    function sendMsg() {
      const text = input.value.trim();
      if (!text) return;
      pushMsg({ type: "text", content: text, isUser: true });
      input.value = "";
      // Agent 调教指令：本地实时处理（不消耗 token），优先级高于日程/闲聊
      if (handlePersonaCmd(text)) return;
      // 思考指示器
      const typing = document.createElement("div");
      typing.className = "typing";
      typing.innerHTML = "<i></i><i></i><i></i>";
      typing.style.cssText = "align-self:flex-start;color:var(--t3);padding:6px 4px";
      list.appendChild(typing);
      scrollChat();
      setTimeout(async () => {
        typing.remove();
        if (apiReady()) {
          try {
            const history = Store.state.chat.slice(-10).map((m) => ({
              role: m.isUser ? "user" : "assistant",
              content: typeof m.content === "string" ? m.content : (m.cardData ? `已安排日程：${m.cardData.title} ${m.cardData.time}` : ""),
            }));
            const replyText = await callLLM(
              [
                {
                  role: "system",
                  content: `你是 TimeAgent 智能时间管家，用简洁友好的中文回答。当前时间：${nowInfo()}。${personaPromptLine()}
你有权查看和操作 app 内全部日程数据（查询任意日期、添加、删除、打卡、改期）。
注意：用户的自定义标签可能是个性化/趣味命名（如中二风格），请依据日程标题理解其真实性质，并按标签所属的正经大类（学习/工作/运动/饮食/休息/社交/其他）归类分析，不要被标签名字迷惑。
关于用户的长期习惯观察（供参考，与下方日程矛盾时以下方日程为准）：${buildUserProfile() || "（历史数据不足）"}
当前记忆范围：${(Store.state.prefs.chatMemory === "custom" ? `自定义区间 ${Store.state.prefs.chatMemoryFrom}~${Store.state.prefs.chatMemoryTo}` : chatMemoryLabel(Store.state.prefs.chatMemory || "week"))}。范围内真实日程如下（范围外数据当前不可见，用户问到时如实说明，或建议切换记忆范围）：
${scheduleContext(Store.state.prefs.chatMemory === "custom" ? { from: Store.state.prefs.chatMemoryFrom, to: Store.state.prefs.chatMemoryTo } : Store.state.prefs.chatMemory || "week")}
你可以帮用户添加/删除/打卡日程、查询安排、查询空闲时间，也可以闲聊。若用户要求安排日程（含事项和时间），先给一句简短确认，然后在回复末尾输出一行排期数据：
【排期】{"tasks":[{"title":"日程名","startTime":"HH:MM","endTime":"HH:MM","tag":"学习","desc":"可选","date":"YYYY-MM-DD(可选,默认今天)"}]}【/排期】
规则：时间用 24 小时制；tag 只能从 [学习,工作,运动,饮食,休息,社交,其他] 中选一个；结束时间未说则按常见时长合理推断；日期默认今天，用户说"明天/后天"要换算成具体日期；若新任务与上面已有日程时间重叠，请自动微调 15-30 分钟避开冲突。没有排期需求时不要输出【排期】标记。
若用户要求删除/标记完成/改期已有日程，则在回复末尾单独输出一行：
【操作】{"type":"delete|done|move|rename|retag|prio|classify|tag-add|tag-del|tag-color","title":"日程名或标签名","newTitle":"新名称(仅rename)","tag":"新标签(仅retag)","priority":"高|中|低(仅prio)","cat":"学习|工作|运动|饮食|休息|社交|其他(仅classify)","color":"#RRGGBB(仅tag-add/tag-color)","date":"YYYY-MM-DD(可选,精确匹配某天)","startTime":"HH:MM(仅move需要)"}【/操作】
（delete=删除，done=打卡完成，move=改期需给新 startTime（可加 date 一起改日期），rename=改名称需给 newTitle，retag=改标签需给 tag，prio=改优先级需给 priority，classify=把自定义标签归类到正经大类需给 cat（内置大类无需归类）；tag-add=新建自定义标签（title 为标签名，可给 color），tag-del=删除自定义标签（内置分类不能删），tag-color=修改自定义标签颜色（title 为标签名，color 为 #RRGGBB；内置分类颜色不可改）；按上面日程中的标题匹配，同名日程可用 date 精确到某天；重复日程删除默认删整个系列并告知用户；【操作】与【排期】不要同时输出，没有匹配的日程时也要输出该行并在正文说明）。
【硬性要求】只要用户要求对已有日程做任何修改（改名/改标签/改优先级/删除/打卡/改期/归类），你就必须输出【操作】标记行，绝对不能只在正文里口头说"已改好/已删除/已完成"而不输出标记——没有标记前端就不会真正执行，等于没改。正文可以先说一句确认，但标记必须带。
【追问原则】当用户的指令信息不足、指代不明或可能产生误操作时，先追问澄清再执行，不要猜：①删除/改名/改标签等操作找不到明确对应的日程，列出相近选项让用户选；②用户没说清楚改到什么值（如只说"改一下"没说改成什么）；③多个同名日程需要确认具体哪一个（用日期区分）；④操作有风险（删除/整系列删除）时先确认。追问要具体、给示例，不要空泛地重复问题。只有完全明确时才直接执行。
【主动告知】你是主动的 agent，发现以下情况要主动提醒用户：①新建/重命名的标签与已有标签重名或名字相似，告知"已存在或很接近"；②标签颜色与已有标签过于接近（区分度低）时提醒换个颜色；③分类自动归类时若标签名很中二/怪异但明显属于某大类，主动说明你的归类理由。`,
                },
                ...history,
                { role: "user", content: text },
              ],
              { temperature: 0.5, maxTokens: 1200, timeoutMs: 60000 }
            );
            // 解析 AI 操作数据（删除/打卡/改期/改名/改标签等）：优先于【排期】处理，
            // 避免模型同时输出两者时操作被排期分支吞掉（改名失败却弹"添加成功"的根因）
            const ops = [];
            const am = replyText.match(/【操作】([\s\S]*?)【\/操作】/);
            if (am) {
              try {
                const j = JSON.parse(am[1].trim());
                if (Array.isArray(j)) ops.push(...j);
                else if (j && j.type) ops.push(j);
              } catch (e) {}
            }
            if (ops.length) {
              const results = [];
              const notFound = [];
              const allTitles = Store.state.schedule.map((i) => i.title).filter((v, k, a) => a.indexOf(v) === k);
              ops.forEach((op) => {
                const t = op && op.title ? String(op.title).trim() : "";
                if (!t) return;
                const date = op && op.date ? String(op.date).trim() : "";
                const matches = Store.state.schedule.filter((i) => i.title.includes(t) || t.includes(i.title));
                // 同名多实例：优先匹配指定日期，否则取第一个
                const item = (date ? matches.find((i) => (i.date || "") === date) : null) || matches[0];
                if (op.type === "delete") {
                  if (item) {
                    const isRepeat = item.repeat && item.repeat !== "none";
                    Store.removeSchedule(item.id);
                    results.push(isRepeat ? `已删除「${item.title}」（重复日程，整个系列一并移除）` : `已删除「${item.title}」`);
                    undoableToast(`已删除「${item.title}」${isRepeat ? "（重复系列）" : ""}`, "warn", { kind: "remove", item: JSON.parse(JSON.stringify(item)) });
                  } else {
                    results.push(`没找到「${t}」`);
                    notFound.push(t);
                  }
                } else if (op.type === "done") {
                  if (item) {
                    const before = JSON.parse(JSON.stringify(item));
                    Store.toggleSchedule(item.id, date || item.date);
                    results.push(`已把「${item.title}」标记为${isDone(item) ? "未完成" : "已完成"}${date ? `（${date}）` : ""}`);
                    undoableToast(`已把「${item.title}」标记为${isDone(item) ? "未完成" : "已完成"}`, "ok", {
                      kind: "patch",
                      id: item.id,
                      before: { isCompleted: before.isCompleted, doneAt: before.doneAt, doneAtMap: before.doneAtMap, doneDates: before.doneDates },
                    });
                  } else {
                    results.push(`没找到「${t}」`);
                    notFound.push(t);
                  }
                } else if (op.type === "move") {
                  const ns = normTime(op.startTime);
                  if (item && ns) {
                    const durMin = Math.max(0, Math.round((parseHM(item.endTime) - parseHM(item.startTime)) * 60));
                    const [h, m] = ns.split(":").map(Number);
                    const endMin = h * 60 + m + durMin;
                    const ne = `${pad(Math.floor(endMin / 60) % 24)}:${pad(endMin % 60)}`;
                    const patch = { startTime: ns, endTime: ne };
                    // 支持一并改日期（仅非重复日程）
                    if (date && (!item.repeat || item.repeat === "none")) patch.date = date;
                    const before = JSON.parse(JSON.stringify(item));
                    Store.updateSchedule(item.id, patch);
                    results.push(`已把「${item.title}」改到 ${ns}~${ne}（保持原时长）${date ? `，日期改为 ${date}` : ""}`);
                    undoableToast(`已把「${item.title}」改到 ${ns}~${ne}`, "ok", {
                      kind: "patch",
                      id: item.id,
                      before: { startTime: before.startTime, endTime: before.endTime, date: before.date },
                    });
                  } else {
                    results.push(`没找到「${t}」或新时间无效`);
                    notFound.push(t);
                  }
                } else if (op.type === "rename") {
                  const nt = op.newTitle ? String(op.newTitle).trim().slice(0, 30) : "";
                  if (item && nt) {
                    Store.updateSchedule(item.id, { title: nt });
                    results.push(`已把「${item.title}」改名为「${nt}」`);
                  } else {
                    results.push(nt ? `改名失败：没找到「${t}」` : "改名失败：缺少新名称 newTitle");
                    notFound.push(t);
                  }
                } else if (op.type === "retag") {
                  const nt = op.tag ? String(op.tag).trim().slice(0, 8) : "";
                  if (item && nt) {
                    Store.updateSchedule(item.id, { tag: nt, tagColor: getColorForTag(nt) });
                    results.push(`已把「${item.title}」的标签改为「${nt}」`);
                  } else {
                    results.push(nt ? `改标签失败：没找到「${t}」` : "改标签失败：缺少新标签 tag");
                    notFound.push(t);
                  }
                } else if (op.type === "prio") {
                  const np = ["高", "中", "低"].includes(op.priority) ? op.priority : "";
                  if (item && np) {
                    Store.updateSchedule(item.id, { priority: np });
                    results.push(`已把「${item.title}」的优先级设为「${np}」`);
                  } else {
                    results.push(`改优先级失败：没找到「${t}」或优先级无效`);
                    notFound.push(t);
                  }
                } else if (op.type === "tag-add") {
                  // Agent 新建自定义标签（自主命名）
                  const name = t;
                  const wantColor = /^#[0-9a-fA-F]{6}$/.test(op.color || "") ? op.color : "";
                  const color = wantColor || TAG_PALETTE[(Object.keys(TAG_MAP).length + Store.state.customTags.length) % TAG_PALETTE.length];
                  if (name && !allTags().some((x) => x.tag === name)) {
                    Store.state.customTags.push({ tag: name, color });
                    const warns = tagDupeWarnings(name, color, "create");
                    results.push(`已创建标签「${name}」${warns.length ? "\n" + warns.join("\n") : ""}`);
                  } else results.push(`标签「${name}」已存在或名称无效`);
                } else if (op.type === "tag-color") {
                  // Agent 修改自定义标签颜色
                  const name = t;
                  const nc = /^#[0-9a-fA-F]{6}$/.test(op.color || "") ? op.color : "";
                  const ct = Store.state.customTags.find((x) => x.tag === name);
                  if (ct && nc) {
                    const warns = tagDupeWarnings(name, nc, "recolor");
                    ct.color = nc;
                    Store.notify();
                    results.push(`已把标签「${name}」的颜色改为 ${nc}${warns.length ? "\n" + warns.join("\n") : ""}`);
                  } else if (TAG_MAP[name]) results.push(`「${name}」是内置分类，颜色不可改`);
                  else results.push(nc ? `没找到自定义标签「${name}」` : "改色失败：缺少颜色 color（#RRGGBB）");
                } else if (op.type === "tag-del") {
                  const name = t;
                  const def = !!TAG_MAP[name];
                  if (!def && allTags().some((x) => x.tag === name)) {
                    Store.state.customTags = Store.state.customTags.filter((x) => x.tag !== name);
                    results.push(`已删除标签「${name}」（已有日程颜色不受影响）`);
                  } else results.push(def ? `「${name}」是内置分类，不能删除` : `没找到分类「${name}」`);
                } else if (op.type === "classify") {
                  // Agent 归类：把自定义/趣味标签归到正经大类（统计按大类汇总）
                  const name = t;
                  const cat = CATS.includes(op.cat) ? op.cat : "";
                  if (TAG_MAP[name]) {
                    results.push(`「${name}」本身就是正经大类，无需归类。`);
                  } else {
                    const ct = Store.state.customTags.find((x) => x.tag === name);
                    if (ct && cat) {
                      ct.cat = cat;
                      results.push(`已把标签「${name}」归类到大类「${cat}」，相关日程将按${cat}统计`);
                    } else results.push(`没找到自定义标签「${name}」或大类无效（可选：${CATS.join("、")}）`);
                  }
                }
              });
              const cleanOps = replyText.replace(/【操作】[\s\S]*?【\/操作】/g, "").trim();
              if (cleanOps) pushMsg(mkMsg("text", cleanOps, null, "ai"));
              pushMsg(mkMsg("text", results.join("\n"), null, "ai"));
              // 有匹配失败的指令：列出相近日程候选，引导用户确认（避免"说没找到就完事"）
              if (notFound.length) {
                const cands = allTitles.filter((ti) => notFound.some((nf) => ti.includes(nf) || nf.includes(ti)));
                const pool = cands.length ? cands : allTitles;
                pushMsg(mkMsg("text", `没找到「${notFound.join("、")}」对应的日程，我这边有的是：${pool.slice(0, 8).map((x) => `「${x}」`).join("、")}${pool.length > 8 ? " 等" : ""}。告诉我具体哪一个？`, null, "offline"));
              }
              // 有失败项时不弹"成功"误导（如"改名失败：没找到"，仍显示成功会让人以为改了）
              const hasFail = results.some((r) => /失败|没找到|不能删除|无效/.test(r));
              toast(hasFail ? "部分指令未执行，详情见上方回复 ⚠️" : "已按你的指令更新日程 ✅", hasFail ? "warn" : "ok");
              renderCurrent();
              return;
            }
            // 无【操作】标记：尝试解析【排期】添加日程
            let tasks = null;
            const pm = replyText.match(/【排期】([\s\S]*?)【\/排期】/);
            if (pm) {
              try {
                const j = JSON.parse(pm[1].trim());
                if (Array.isArray(j.tasks) && j.tasks.length) {
                  tasks = j.tasks
                    .filter((t) => t && t.title)
                    .map((t) => {
                      const startTime = normTime(t.startTime);
                      const endTime = normTime(t.endTime);
                      const tag = ["学习", "工作", "运动", "饮食", "休息", "社交", "其他"].includes(t.tag) ? t.tag : "其他";
                      return {
                        title: String(t.title).trim().slice(0, 30),
                        startTime,
                        endTime,
                        tag,
                        tagColor: getColorForTag(tag),
                        desc: t.desc ? String(t.desc).trim() : "",
                        priority: ["高", "中", "低"].includes(t.priority) ? t.priority : "中",
                        date: t.date || todayStr(),
                      };
                    });
                }
              } catch (e) {
                tasks = null;
              }
            }
            const cleanText = pm ? replyText.replace(/【排期】[\s\S]*?【\/排期】/g, "").trim() : replyText;
            if (tasks && tasks.length) {
              if (cleanText) pushMsg(mkMsg("text", cleanText, null, "ai"));
              const conflict = checkConflicts(tasks);
              const ids = [];
              let skipped = 0;
              tasks.forEach((t) => {
                // 去重防护：同日同名同时间段跳过
                const date = t.date || todayStr();
                const dup = Store.state.schedule.some((ex) => (ex.date || todayStr()) === date && ex.title === t.title && ex.startTime === t.startTime && ex.endTime === t.endTime);
                if (dup) {
                  skipped++;
                  return;
                }
                const it = Store.addSchedule({
                  title: t.title,
                  startTime: t.startTime,
                  endTime: t.endTime,
                  desc: t.desc,
                  tag: t.tag,
                  tagColor: t.tagColor,
                  date,
                  isCompleted: false,
                  isFresh: true,
                  priority: t.priority || "中",
                });
                ids.push(it.id);
                pushMsg({
                  type: "card",
                  isUser: false,
                  content: `已为你安排「${t.title}」📌`,
                  cardData: { title: t.title, time: `${t.startTime} ~ ${t.endTime}`, tag: t.tag, color: t.tagColor, date },
                  via: "ai",
                });
              });
              const added = ids.length;
              if (added) {
                undoableToast(`已智能添加 ${added} 项日程 ✨${skipped ? `（跳过 ${skipped} 项重复）` : ""}${conflict ? "（部分与已有日程时间重叠）⚠️" : ""}`, conflict ? "warn" : "ok", { kind: "adds", ids });
              } else {
                toast(`这些日程之前已经添加过了，无需重复 ✌️${skipped ? `（跳过 ${skipped} 项）` : ""}`, "warn");
              }
              return;
            }
            // 无【操作】标记：检查正文是否声称已修改/已删除/已完成（模型幻觉时前端未执行，需明确告知用户）
            const claim = replyText.match(/(?:已(?:经|帮你|为您)?(?:把|给|将)?.*?(?:改|删|完成|打卡|设|移))/);
            if (claim) {
              pushMsg(mkMsg("text", replyText, null, "ai"));
              pushMsg(mkMsg("text", "⚠️ 我注意到你的日程似乎没有实际变化——刚才那条只是口头说法，修改并未真正执行。请直接说具体指令，例如：「把晨跑的标签改成中二の修炼」「把会议改到下午3点」「删除健身」", null, "offline"));
              return;
            }
            pushMsg(mkMsg("text", replyText, null, "ai"));
            return;
          } catch (err) {
            console.warn("在线对话失败，回退本地助手：", err);
            setMode(false); // 顶部状态同步为离线助手
            pushMsg(mkMsg("text", `（在线助手暂时不可用，已切换本地助手）`, null, "offline"));
          }
        }
        const reply = localChatReply(text);
        pushMsg(reply);
      }, 700);
    }
    send.addEventListener("click", sendMsg);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMsg();
    });
    layer.querySelector("#chatBack").addEventListener("click", () => {
      layer.remove();
    });
  }

  function chatBubble(m) {
    // AI 消息来源标签：AI 在线（大模型）/ 本地规则（离线助手）
    const srcTag = (via) =>
      `<div class="chat-src"><span class="dot" style="background:${via === "ai" ? "var(--ok, #2E7D32)" : "var(--t3)"}"></span>${via === "ai" ? "AI 在线" : "本地规则"}</div>`;
    const d = document.createElement("div");
    if (m.type === "card" && m.cardData) {
      d.style.cssText = "align-self:flex-start;max-width:80%;background:var(--surface-solid);border:1px solid var(--line);border-radius:14px;padding:12px;box-shadow:var(--shadow-sm)";
      const c = m.cardData;
      d.innerHTML = `${srcTag(m.via)}
        <div style="font-weight:700;margin-bottom:6px">${esc(c.title)}</div>
        <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--t2)">
          ${c.date ? `<span>📅 ${humanDateLabel(c.date)}</span>` : ""}
          <span>🕒 ${esc(c.time)}</span>
          <span class="tag" style="background:${c.color};color:${contrastText(c.color)}">${esc(c.tag)}</span></div>`;
    } else {
      const isU = m.isUser;
      d.style.cssText = `align-self:${isU ? "flex-end" : "flex-start"};max-width:78%;background:${isU ? "var(--primary)" : "var(--surface-solid)"};color:${isU ? "#fff" : "var(--t1)"};border:1px solid ${isU ? "transparent" : "var(--line)"};border-radius:14px;padding:11px 13px;font-size:14px;line-height:1.6;box-shadow:var(--shadow-sm);white-space:pre-wrap;word-break:break-word`;
      d.innerHTML = (isU ? "" : srcTag(m.via)) + esc(m.content) + (m.fb ? fbRow(m.fb) : "");
    }
    return d;
  }

  // 主动消息反馈按钮行：👍 有用 / 👎 没用（点击后替换为结果提示）
  function fbRow(type) {
    return `<div class="fb-row" data-fbtype="${esc(type)}">
      <button class="fb-btn" data-act="fb" data-type="${esc(type)}" data-v="1">有用</button>
      <button class="fb-btn" data-act="fb" data-type="${esc(type)}" data-v="0">没用</button>
    </div>`;
  }

  // 智能对话提示：结合用户历史日程本地规则生成（零 token，不调模型）
  // 优先级：今日过期未打卡 → 今日下一项待办 → 高频事项 → 空闲时段 → 通用兜底
  function smartChatHints() {
    const t = todayStr();
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    const today = scopeItems(Store.state.schedule, { mode: "day", anchor: t });
    const hints = [];
    const missed = today.filter((i) => !isDone(i) && toMin(i.endTime) < nowMin);
    if (missed.length) hints.push({ txt: `把「${missed[0].title}」补打卡`, say: `把${missed[0].title}打卡` });
    const undone = today.filter((i) => !isDone(i) && toMin(i.startTime) >= nowMin);
    if (undone.length) hints.push({ txt: `把「${undone[0].title}」改到晚上`, say: `把${undone[0].title}改到晚上8点` });
    const freq = {};
    Store.state.schedule.forEach((i) => {
      const d = i.date || t;
      if (d >= addDays(t, -14) && d <= addDays(t, 14)) freq[i.title] = (freq[i.title] || 0) + 1;
    });
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] >= 2) hints.push({ txt: `再安排一次「${top[0]}」`, say: `明天早上${top[0]}1小时` });
    const slots = freeSlots();
    if (slots.length) hints.push({ txt: "看看现在有什么空闲", say: "我现在有什么空闲" });
    if (!hints.length)
      hints.push(
        { txt: "帮我加个明早背单词 1 小时", say: "帮我加个明早背单词1小时" },
        { txt: "看看今天的安排", say: "今天有什么安排" },
        { txt: "现在该做什么", say: "现在该做什么" }
      );
    return hints.slice(0, 3);
  }

  // 离线对话助手：解析意图 → 增删改查 + 自然语言回复
  function localChatReply(text) {
    const lower = text;
    // 标签操作（优先于日程删除/添加，避免"删除标签X"被日程删除截胡）
    if (/新建(标签|分类)|创建(标签|分类)|加个(标签|分类)/.test(lower)) {
      const name = lower.replace(/^(请|帮|我)?(新建|创建|加个)(标签|分类)/, "").replace(/[。.，,吗？?\s]/g, "").trim();
      if (!name) return mkMsg("text", "告诉我标签名字，例如「新建标签 阅读」。");
      if (allTags().some((t) => t.tag === name)) return mkMsg("text", `「${name}」已经存在啦。`);
      const color = TAG_PALETTE[(Object.keys(TAG_MAP).length + Store.state.customTags.length) % TAG_PALETTE.length];
      Store.state.customTags.push({ tag: name, color });
      Store.notify();
      // 主动告知：近色提醒（主动 agent 精神）
      const near = allTags().filter((t) => t.tag !== name && colorSimilarity(t.color, color) > 0.88);
      return mkMsg("text", `已为你创建标签「${name}」✨ 之后添加日程时就能选它。${near.length ? `\n小提醒：「${near[0].tag}」的颜色和它很接近，区分度不高，建议换个颜色～` : ""}`);
    }
    if (/删除(标签|分类)|去掉(标签|分类)/.test(lower)) {
      const name = lower.replace(/^(请|帮|我)?(删除|去掉)(标签|分类)/, "").replace(/[。.，,吗？?\s]/g, "").trim();
      if (!name) return mkMsg("text", "告诉我标签名字，例如「删除标签 阅读」。");
      if (TAG_MAP[name]) return mkMsg("text", `「${name}」是内置分类，不能删除。`);
      if (allTags().some((t) => t.tag === name)) {
        Store.state.customTags = Store.state.customTags.filter((x) => x.tag !== name);
        Store.notify();
        return mkMsg("text", `已删除标签「${name}」（已有日程的颜色不受影响）。`);
      }
      return mkMsg("text", `没找到标签「${name}」。`);
    }
    // 归类到正经大类（自定义/趣味标签 → 学习/工作/运动…）
    const cl = lower.match(/把(.+?)(?:归类到|归到|划到|算到|算作|放进)(.+)/);
    if (cl) {
      const tagName = cl[1].replace(/[。.，,吗？?\s]/g, "").trim();
      const cat = CATS.find((c) => cl[2].includes(c)) || "";
      if (TAG_MAP[tagName]) return mkMsg("text", `「${tagName}」本身就是正经大类，不用再归类。`);
      const ct = Store.state.customTags.find((x) => x.tag === tagName);
      if (ct && cat) {
        ct.cat = cat;
        Store.notify();
        return mkMsg("text", `已把标签「${tagName}」归类到大类「${cat}」，相关日程统计会按${cat}汇总 ✅`);
      }
      return mkMsg("text", `没找到自定义标签「${tagName}」或归类无效。可用大类：${CATS.join("、")}。`);
    }
    // 总结归类：各大类时间占比
    if (/总结.*(归类|分类)|时间都花|时间(用|花)(在|到)|归类.*(情况|总结|看看)/.test(lower)) {
      const stats = computeStats();
      if (!stats.timeDist.length) return mkMsg("text", "还没有日程数据，先安排几件事，我就能帮你归类总结啦～");
      const cd = catDistOf(stats);
      const lines = cd.map((d) => `• ${d.cat} ${d.hours.toFixed(1)}h（${d.percent}%）`).join("\n");
      const top = cd[0];
      return mkMsg("text", `按正经大类看，你的时间主要花在：\n${lines}\n\n${top ? `「${top.cat}」占比最高，是你最近的重点。` : ""}`);
    }
    const gdel = lower.match(/删除目标\s*(.+)/);
    if (gdel) {
      const name = gdel[1].replace(/[。.，,！!？?\s]/g, "").trim();
      const prefs = Store.state.prefs;
      if (prefs.goals && prefs.goals.some((x) => x.title === name)) {
        prefs.goals = prefs.goals.filter((x) => x.title !== name);
        Store.notify();
        return mkMsg("text", `已删除目标「${name}」。`);
      }
      return mkMsg("text", `没找到目标「${name}」，可用：${(prefs.goals || []).map((x) => x.title).join("、") || "（暂无）"}`);
    }
    // 删除（支持日期限定 + 多候选确认）
    if (/删除|去掉|取消/.test(lower) && !/添加|新建|安排/.test(lower)) {
      let date = "";
      if (/后天/.test(lower)) date = addDays(todayStr(), 2);
      else if (/明天|明早|明晚/.test(lower)) date = addDays(todayStr(), 1);
      else if (/今天|今日/.test(lower)) date = todayStr();
      const name = lower.replace(/^(请|帮|我)?(删除|去掉|取消)/, "").replace(/[。.，,吗？?\s]/g, "").trim();
      const dateHint = date ? `（${date}）` : "";
      const matches = Store.state.schedule.filter((i) => i.title.includes(name) || name.includes(i.title));
      const item = (date ? matches.find((i) => (i.date || "") === date) : null) || (matches.length === 1 ? matches[0] : null);
      if (item) {
        const removed = Store.removeSchedule(item.id);
        undoableToast(`已删除「${removed.title}」`, "warn", { kind: "remove", item: JSON.parse(JSON.stringify(removed)) });
        return mkMsg("text", `已删除日程「${removed.title}」${dateHint}（${removed.startTime}~${removed.endTime}）。`);
      }
      if (matches.length > 1)
        return mkMsg(
          "text",
          `找到多个匹配的日程，请告诉我具体哪一天：${matches.slice(0, 5).map((i) => `「${i.title}」${i.date || ""} ${i.startTime}`).join("、")}`
        );
      return mkMsg("text", "没有找到匹配的日程，可以告诉我更具体的关键词，例如「删除明天跑步」或「删除跑步」。");
    }
    // 查询统计 / 效率（放在"完成/打卡"之前，避免"完成了多少"被打卡意图截胡）
    if (/效率|完成率|统计|进展|表现|总结|完成(了|的)?(多少|几个|几项|进度|情况)/.test(lower)) {
      const stats = computeStats();
      if (!Store.state.schedule.length) return mkMsg("text", "还没有日程数据呢。先安排几件事，我就能帮你分析执行情况啦～");
      const done = stats.completedCount,
        total = stats.totalCount;
      const ratio = total ? done / total : 0;
      const praise = ratio >= 0.9 ? "执行力很赞！" : ratio >= 0.6 ? "节奏不错，继续保持。" : ratio > 0 ? "已经在行动的路上了，加油！" : "还没开始打卡，从最小的一步开始吧。";
      return mkMsg("text", `你目前已规划 ${stats.totalHours.toFixed(1)} 小时，共 ${total} 项，完成 ${done} 项，效率评分 ${stats.efficiency} 分。${praise}`);
    }
    // 完成 / 打卡
    if (/完成|打卡|搞定|做完/.test(lower)) {
      const name = lower.replace(/^(把|让|请|帮)?(我)?(完成|打卡|搞定|做完)/, "").replace(/[。.，,吗？?\s]/g, "").trim();
      const item = Store.state.schedule.find((i) => i.title.includes(name) || name.includes(i.title));
      if (item) {
        const before = JSON.parse(JSON.stringify(item));
        Store.toggleSchedule(item.id, item.date);
        undoableToast(`已把「${item.title}」标记为${isDone(item) ? "未完成" : "已完成"}`, "ok", {
          kind: "patch",
          id: item.id,
          before: { isCompleted: before.isCompleted, doneAt: before.doneAt, doneAtMap: before.doneAtMap, doneDates: before.doneDates },
        });
        return mkMsg("text", `已为你把「${item.title}」标记为${isDone(item) ? "未完成" : "已完成"} ✅`);
      }
      return mkMsg("text", "没找到对应日程，告诉我是哪一项完成啦？");
    }
    // 查询安排（今天 / 明天 / 后天 / 本周）
    if (/查|看|什么|哪些|有没有|干嘛|做什么/.test(lower) && /安排|日程|今天|今日|明天|明早|明晚|后天|本周|这周/.test(lower)) {
      const sc = { mode: "day", anchor: todayStr() };
      let label = "今天";
      if (/后天/.test(lower)) {
        sc.anchor = addDays(todayStr(), 2);
        label = "后天";
      } else if (/明天|明早|明晚/.test(lower)) {
        sc.anchor = addDays(todayStr(), 1);
        label = "明天";
      } else if (/本周|这周/.test(lower)) {
        sc.mode = "week";
        label = "本周";
      }
      const items = scopeItems(Store.state.schedule, sc);
      if (!items.length) return mkMsg("text", `${label}还没有安排，想让我帮你规划点什么吗？`);
      const done = items.filter((i) => isDone(i)).length;
      const lines = items
        .slice()
        .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))
        .map((it) => `• ${it.startTime}-${it.endTime} ${it.title}${isDone(it) ? " ✅" : ""}${it.tag && it.tag !== "其他" ? ` [${it.tag}]` : ""}`)
        .join("\n");
      return mkMsg("text", `${label}共 ${items.length} 项，已完成 ${done} 项：\n${lines}`);
    }
    // 现在该做什么（实时建议）
    if (/现在|当前/.test(lower) && /做|该|干什么|干嘛/.test(lower)) {
      const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
      const list = scopeItems(Store.state.schedule, { mode: "day", anchor: todayStr() });
      const sorted = list.slice().sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
      const missed = sorted.filter((i) => !isDone(i) && toMin(i.endTime) < nowMin);
      const ongoing = sorted.filter((i) => !isDone(i) && toMin(i.startTime) <= nowMin && toMin(i.endTime) >= nowMin);
      const upcoming = sorted.filter((i) => !isDone(i) && toMin(i.startTime) > nowMin);
      if (ongoing.length) return mkMsg("text", `现在正在做「${ongoing[0].title}」（${ongoing[0].startTime}~${ongoing[0].endTime}），专注完成它 💪`);
      if (upcoming.length) {
        const n = upcoming[0];
        const diff = toMin(n.startTime) - nowMin;
        if (diff <= 30) return mkMsg("text", `下一项「${n.title}」${diff} 分钟后开始（${n.startTime}），先准备一下～`);
        return mkMsg("text", `距离「${n.title}」还有约 ${fmtDurMin(diff)}，当前空闲${missed.length ? `，可先补打卡 ${missed.length} 项过期日程` : "，适合安排碎片任务或休息"}。`);
      }
      if (missed.length) return mkMsg("text", `${missed.length} 项日程已过未打卡：${missed.slice(0, 2).map((i) => "「" + i.title + "」").join("、")}${missed.length > 2 ? " 等" : ""}，记得补一下～`);
      return mkMsg("text", list.length ? "今日安排已全部结束，好好休息，或者规划一下明天的日程～" : "今天还没有日程，要不要现在规划一件小事？");
    }
    // 优化今日：按优先级+空闲时间重排未完成事项（直接应用）
    if (/优化(今天|今日)|重排(今天|今日)|重新安排(今天|今日)/.test(lower)) {
      const res = replanToday();
      if (!res.plan.length) return mkMsg("text", res.msg || "今天没有需要重排的事项啦～");
      const applied = applyReplan(res.plan);
      const lines = res.plan.map((p) => (p.drop ? `• ${p.title}：放不下，建议顺延明天` : `• ${p.title}：${p.start}~${p.end}`)).join("\n");
      return mkMsg("text", `已按优先级+空闲时间优化今天（更新 ${applied} 项）：\n${lines}\n\n高优先级优先，帮你保住最重要的～`);
    }
    // 目标：设置 / 进度 / 删除
    const gset = lower.match(/设置(?:目标)?\s*(每天|每周)?\s*(.+?)\s*(\d+(?:\.\d+)?)\s*小时/);
    if (gset) {
      const prefs = Store.state.prefs;
      if (!prefs.goals) prefs.goals = [];
      const period = gset[1] === "每周" ? "week" : "day";
      const title = gset[2].replace(/[。.，,！!？?\s]/g, "").trim() || "目标";
      const hours = parseFloat(gset[3]);
      const cat = CATS.find((c) => gset[2].includes(c)) || "其他";
      if (prefs.goals.some((x) => x.title === title)) prefs.goals = prefs.goals.filter((x) => x.title !== title);
      prefs.goals.push({ id: uid(), title: title.slice(0, 8), cat, period, hours });
      Store.notify();
      return mkMsg("text", `已设置目标：${gset[1] || "每天"}「${title}」${hours} 小时（归入${cat}类）🎯 我会帮你盯着进度。`);
    }
    if (/目标(进度|情况)|目标.*(怎么样|如何|看看)|看看.*目标/.test(lower)) {
      const pg = goalProgress();
      if (!pg.length) return mkMsg("text", "还没有目标哦，试试「设置目标 每天学习1小时」～");
      const lines = pg.map((g) => `• ${g.title}：${g.hours.toFixed(1)}h/${g.hours}h（${g.pct}%）${g.done ? " ✅" : `，还差 ${g.remain}h`}`).join("\n");
      return mkMsg("text", `目标进度：\n${lines}`);
    }
    // 完成度预测
    if (/预测|大概能完成|能完成多少|今天能完成/.test(lower)) {
      const t = todayStr();
      const today = scopeItems(Store.state.schedule, { mode: "day", anchor: t });
      const undone = today.filter((i) => !isDone(i));
      if (!undone.length) return mkMsg("text", "今天的事项都完成啦，不需要预测～");
      const wk = [];
      let dd = addDays(t, -13),
        g = 0;
      while (dd <= t && g < 400) {
        scopeItems(Store.state.schedule, { mode: "day", anchor: dd }).forEach((i) => wk.push(i));
        dd = addDays(dd, 1);
        g++;
      }
      const rate = wk.length ? wk.filter((i) => isDone(i)).length / wk.length : 0.6;
      const predict = Math.max(0, Math.round(undone.length * rate));
      const late = lateMinAvg();
      return mkMsg("text", `按你近两周 ${Math.round(rate * 100)}% 的完成率，今天剩余 ${undone.length} 项，预计能完成 ${predict} 项${late ? `（你平均比计划晚 ${late} 分钟，建议留点缓冲）` : "。"}`);
    }
    // 重命名日程
    const rn = lower.match(/把(.+?)(?:改名为|改名成|重命名(?:成|为))(.+)/);
    if (rn) {
      const oldName = rn[1].replace(/[。.，,吗？?\s]/g, "").trim();
      const newName = rn[2].replace(/[。.，,！!？?\s]/g, "").trim();
      const item = Store.state.schedule.find((i) => i.title.includes(oldName) || oldName.includes(i.title));
      if (item && newName) {
        Store.updateSchedule(item.id, { title: newName.slice(0, 30) });
        return mkMsg("text", `已把「${item.title}」改名为「${newName}」✅`);
      }
      return mkMsg("text", `没找到「${oldName}」或新名称无效。`);
    }
    // 改标签 / 分类
    const rt = lower.match(/把(.+?)(?:的)?(?:标签|分类)(?:改成|换到|变成|改为|设成)\s*(.+)/);
    if (rt) {
      const oldName = rt[1].replace(/[。.，,吗？?\s]/g, "").trim();
      const newTag = rt[2].replace(/[。.，,！!？?\s]/g, "").trim();
      const item = Store.state.schedule.find((i) => i.title.includes(oldName) || oldName.includes(i.title));
      if (item && newTag) {
        Store.updateSchedule(item.id, { tag: newTag.slice(0, 8), tagColor: getColorForTag(newTag) });
        return mkMsg("text", `已把「${item.title}」的标签改为「${newTag}」🏷️`);
      }
      return mkMsg("text", `没找到「${oldName}」或标签名无效。`);
    }
    // 改期 / 挪时间
    if (/把/.test(lower) && /改|挪|移|调到|改到|移到|挪到|提前到|推后到|推迟到/.test(lower)) {
      const mv = lower.match(/把(.+?)(?:改|挪|移|调到|改到|移到|挪到|提前到|推后到|推迟到)(?:到|至)?\s*(.+)$/);
      if (mv) {
        const name = mv[1].replace(/[。.，,吗？?\s]/g, "").trim();
        const t = parseTime(mv[2], detectPeriod(mv[2]));
        const item = Store.state.schedule.find((i) => i.title.includes(name) || name.includes(i.title));
        if (!item) return mkMsg("text", `没有找到「${name}」，告诉我更准确的名字，例如「把跑步改到晚上8点」。`);
        if (!t.found || !t.valid) return mkMsg("text", `没太听懂新的时间，试试说「把跑步改到晚上8点」或「把跑步挪到 20:00」。`);
        const durMin = Math.max(0, Math.round((parseHM(item.endTime) - parseHM(item.startTime)) * 60));
        const ns = `${pad(t.hour)}:${pad(t.minute)}`;
        const endMin = t.hour * 60 + t.minute + durMin;
        const ne = `${pad(Math.floor(endMin / 60) % 24)}:${pad(endMin % 60)}`;
        const before = JSON.parse(JSON.stringify(item));
        Store.updateSchedule(item.id, { startTime: ns, endTime: ne });
        undoableToast(`已把「${item.title}」改到 ${ns}~${ne}`, "ok", {
          kind: "patch",
          id: item.id,
          before: { startTime: before.startTime, endTime: before.endTime, date: before.date },
        });
        return mkMsg("text", `已把「${item.title}」从 ${item.startTime}~${item.endTime} 改到 ${ns}~${ne}（保持原时长）。`);
      }
    }
    // 新建 / 删除自定义标签（已在上方优先处理，此处为旧兜底占位已移除）
    // 去重确认（上轮添加撞重复后的回复：仍要 → 添加；否则走解析）
    if (chatDraft && chatDraft.kind === "dup") {
      if (/仍要|是的|确认|重复添加|就按这个|就要/.test(lower)) {
        const t = chatDraft.item;
        chatDraft = null;
        const it = Store.addSchedule(Object.assign({}, t));
        return {
          type: "card",
          isUser: false,
          content: `好的，已为你再安排一次「${t.title}」📌`,
          cardData: { title: t.title, time: `${t.startTime} ~ ${t.endTime}`, tag: t.tag, color: t.tagColor, date: t.date || todayStr() },
        };
      }
      chatDraft = null; // 用户自己给时间：走下面的添加解析
    }
    // 冲突方案选择（上轮添加撞车后的回复：方案A/B/C 或 自己给新时间）
    if (chatDraft && chatDraft.kind === "conflict") {
      const { det, di } = chatDraft;
      const { task, conflicts } = det[di];
      const m = lower.match(/^(?:方案|选)?\s*([ABC])\b/);
      if (m) {
        const plans = buildConflictPlans(task, conflicts);
        const p = plans[{ A: 0, B: 1, C: 2 }[m[1]]];
        chatDraft = null;
        if (p) {
          const r = applyConflictPlan(task, p);
          return mkMsg("text", `已按方案${m[1]}处理「${task.title}」✅（${r.applied}）。还有其它要安排的吗？`);
        }
        return mkMsg("text", "这个方案暂时不可行，告诉我新的时间，如「改为 18 点一小时」或「顺延明天」。");
      }
      chatDraft = null; // 用户自己给时间：走下面的添加解析
    }
    // 添加
    if (/添加|安排|新建|加个|记一下|提醒/.test(lower) || /[点时]/.test(lower)) {
      const res = buildFreeDemoTasks(lower, undefined, chatDraft);
      if (res.question) {
        chatDraft = res.pending || null;
        return mkMsg("text", res.question);
      }
      chatDraft = null;
      const t = res.tasks[0];
      const det = conflictDetail([t]);
      if (det.length) {
        const plans = buildConflictPlans(t, det[0].conflicts);
        chatDraft = { kind: "conflict", det, di: 0 };
        const planLines = plans.map((p, i) => `方案${"ABC"[i]}：${p.desc}`).join("\n");
        return mkMsg("text", `「${t.title}」的 ${t.startTime}~${t.endTime} 和「${det[0].conflicts.map((c) => c.title).join("、")}」时间重叠了 ⚠️\n\n${planLines}\n\n回复「方案A / 方案B / 方案C」让我处理，或直接告诉我新的时间（如「改为 18 点一小时」）。`);
      }
      // 去重防护：同日同名 → 先询问
      const dupes = findDupes(t);
      if (dupes.length) {
        const d0 = dupes[0];
        chatDraft = { kind: "dup", item: t };
        return mkMsg("text", `今天已经有「${t.title}」（${d0.startTime}~${d0.endTime}）啦 ⚠️\n\n回复「仍要」确认再排一次，或告诉我新的时间。`);
      }
      const it = Store.addSchedule({
        title: t.title,
        startTime: t.startTime,
        endTime: t.endTime,
        desc: t.desc,
        tag: t.tag,
        tagColor: t.tagColor,
        date: t.date || todayStr(),
        isCompleted: false,
        isFresh: true,
      });
      return {
        type: "card",
        isUser: false,
        content: `好的，已为你安排「${t.title}」📌`,
        cardData: { title: t.title, time: `${t.startTime} ~ ${t.endTime}`, tag: t.tag, color: t.tagColor, date: t.date || todayStr() },
      };
    }
    // 查询 / 建议
    if (/空闲|空档|没安排|建议|怎么|如何/.test(lower)) {
      const slots = freeSlots();
      const msg = slots.length
        ? `当前空闲时段有：${slots.join("、")}。可以利用这些时间做点轻松的事，或提前完成待办 💡`
        : "今天的时间排得挺满的，注意劳逸结合，给自己留点喘息空间哦～";
      return mkMsg("text", msg);
    }
    // 兜底
    const stats = computeStats();
    if (!Store.state.schedule.length)
      return mkMsg("text", "我是你的 AI 时间管家～试着对我说「下午3点去健身2小时」，我就能帮你智能排期 💪");
    return mkMsg(
      "text",
      `你是想调整日程吗？我可以帮你：添加（如「加个明早背单词1小时」）、删除（如「删除跑步」）、完成打卡、改期（如「把跑步改到晚上8点」）、查询安排（如「今天有什么安排」）或查询空闲时段。\n\n目前你今天有 ${stats.totalCount} 项安排，已规划 ${stats.totalHours.toFixed(1)} 小时。`
    );
  }
  function mkMsg(type, content, cardData, via) {
    // via: "ai"=大模型生成 / "offline"=本地规则（缺省按本地，由调用方对 AI 结果显式传 "ai"）
    return { type, isUser: false, content, cardData, via: via || "offline" };
  }

  /* ============================================================
     全局事件委托
     ============================================================ */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    const act = t.dataset.act;
    const id = t.dataset.id;
    const date = t.dataset.date;
    switch (act) {
      case "tab":
        navigate(+t.dataset.tab);
        break;
      case "open-chat":
        openChat();
        break;
      case "fb": {
        const type = t.dataset.type;
        const useful = t.dataset.v === "1";
        const s = fbRecord(type, useful);
        const row = t.closest(".fb-row");
        if (row) row.innerHTML = `<span class="fb-done">已记录，之后${useful ? "会多提醒这类" : "会少提醒这类"}～</span>`;
        toast(fbAfterText(type, s), useful ? "ok" : "warn");
        break;
      }
      case "open-planner":
        openChat();
        break;
      case "optimize-today": {
        const res = replanToday();
        if (!res.plan.length) {
          toast(res.msg || "今天没有需要重排的事项", "ok");
          break;
        }
        const lines = res.plan
          .map((p) => (p.drop ? `• ${esc(p.title)}　放不下，建议顺延到明天` : `• ${esc(p.title)}　${p.start} ~ ${p.end}`))
          .join("<br>");
        openSheet(
          `<div class="sheet-head"><div class="h">🤖 AI 优化今日</div><button class="x" data-close>${svg("close")}</button></div>
           <div class="card-sub">按优先级（高→中→低）和空闲时间，把未完成的事项重新排进今天剩余时间：</div>
           <div class="mt2" style="line-height:1.9;font-size:13.5px">${lines}</div>
           <div class="flex gap1 mt3">
             <button class="btn ghost flex" data-close style="flex:1">取消</button>
             <button class="btn flex" id="replanApply" style="flex:1">应用新安排</button>
           </div>`,
          {
            onOpen: (el) => {
              el.querySelector("#replanApply").addEventListener("click", () => {
                const n = applyReplan(res.plan);
                closeSheet();
                renderCurrent();
                toast(`已按新安排更新 ${n} 项日程 ✨`, "ok");
              });
            },
          }
        );
        break;
      }
      case "ai-act": {
        // 首页 AI 行动卡：按 kind 执行（默认打开对话舱并预填，AI 排期统一走对话舱）
        const kind = t.dataset.kind;
        const prefill = t.dataset.prefill || "";
        if (kind === "issues") openIssuesSheet();
        else if (kind === "report") openReport();
        else openChat(prefill);
        break;
      }
      case "set-scope":
        scope.mode = t.dataset.mode || "day";
        renderCurrent();
        break;
      case "scope-prev":
      case "scope-next": {
        const dir = act === "scope-next" ? 1 : -1;
        if (scope.mode === "day") scope.anchor = addDays(scope.anchor, dir);
        else if (scope.mode === "week") scope.anchor = addDays(scope.anchor, dir * 7);
        else scope.anchor = shiftMonth(scope.anchor, dir);
        renderCurrent();
        break;
      }
      case "toggle-form":
        schedUI.open = !schedUI.open;
        renderSchedule();
        break;
      case "step": {
        const target = t.dataset.target;
        const dir = +t.dataset.dir;
        if (target === "sh") schedUI.sh = clamp(schedUI.sh + dir, 0, 23);
        if (target === "sm") schedUI.sm = clamp(schedUI.sm + dir, 0, 59);
        if (target === "dh") schedUI.dh = clamp(schedUI.dh + dir, 0, 12);
        if (target === "dm") schedUI.dm = clamp(schedUI.dm + dir, 0, 59);
        renderSchedule();
        break;
      }
      case "pick-tag":
        schedUI.tag = t.dataset.tag;
        schedUI.color = t.dataset.color;
        renderSchedule();
        break;
      case "pick-color":
        schedUI.color = t.dataset.color;
        renderSchedule();
        break;
      case "confirm-add":
        confirmAdd();
        break;
      case "toggle": {
        const bf = JSON.parse(JSON.stringify(Store.state.schedule.find((x) => x.id === id) || {}));
        Store.toggleSchedule(id, date);
        haptic(30);
        renderCurrent();
        const nx = Store.state.schedule.find((x) => x.id === id);
        const dNow = nx && (nx.repeat && nx.repeat !== "none" ? (nx.doneDates || []).indexOf(date) >= 0 : !!nx.isCompleted);
        undoableToast(dNow ? `已完成「${nx ? nx.title : ""}」` : `已取消「${nx ? nx.title : ""}」的完成`, "ok", {
          kind: "patch",
          id,
          before: { isCompleted: bf.isCompleted, doneAt: bf.doneAt, doneAtMap: bf.doneAtMap, doneDates: bf.doneDates },
        });
        break;
      }
      case "del": {
        const it = Store.state.schedule.find((x) => x.id === id);
        if (it && it.repeat && it.repeat !== "none") {
          const label = it.repeat === "daily" ? "每天" : "每周";
          openSheet(
            `<div class="sheet-head"><div class="h">删除重复日程</div><button class="x" data-close>${svg("close")}</button></div>
             <div class="card-sub" style="line-height:1.7">「${esc(it.title)}」是<strong>${label}</strong>重复日程。删除将移除整个重复系列（含未来所有日期），此操作不可针对单次。</div>
             <div class="flex gap1 mt3">
               <button class="btn ghost flex" style="flex:1" data-close>取消</button>
               <button class="btn danger flex" style="flex:1" id="delSeries">删除整个系列</button>
             </div>`,
            {
              onOpen: (el) =>
                el.querySelector("#delSeries").addEventListener("click", () => {
                  closeSheet();
                  deleteWithUndo(id);
                }),
            }
          );
        } else {
          deleteWithUndo(id);
        }
        break;
      }
      case "tag":
        openTagMenu(id);
        break;
      case "edit":
        openEdit(id);
        break;
      case "change-tag":
        Store.updateSchedule(id, { tag: t.dataset.tag, tagColor: t.dataset.color });
        closeSheet();
        toast("已更新分类", "ok");
        renderCurrent();
        break;
      case "gen-report":
        openReport();
        break;
      case "weekly-review":
        openWeeklyReview();
        break;
      case "home-issues":
        openIssuesSheet();
        break;
      case "save-api":
        Store.notify();
        toast(Store.state.apiKey.length >= 10 ? "API Key 已保存，AI 规划 / 对话将调用在线模型" : "已保存（未填写有效 Key，将使用离线解析）", "ok");
        break;
      case "open-catman":
        openCatMan();
        break;
      case "open-persona":
        openPersona();
        break;
      case "open-goals":
        openGoals();
        break;
      case "del-cat": {
        const tag = t.dataset.tag;
        Store.state.customTags = Store.state.customTags.filter((x) => x.tag !== tag);
        Store.notify();
        openCatMan();
        break;
      }
      case "toggle-theme":
        toggleTheme();
        break;
      case "stat-detail":
        openStatDetail(t.dataset.key);
        break;
      case "tag-detail":
        openTagDetail(t.dataset.tag);
        break;
      case "open-history":
        openHistory();
        break;
      case "open-prefs":
        openPrefs();
        break;
      case "test-notify":
        testNotify();
        break;
      case "open-help":
        openHelp();
        break;
      case "open-backup":
        openBackup();
        break;
      case "open-privacy":
        window.location.href = "privacy.html";
        break;
      case "open-terms":
        window.location.href = "terms.html";
        break;
      case "overview-detail":
        openOverviewDetail(t.dataset.key);
        break;
      case "set-pref": {
        Store.state.prefs[t.dataset.key] = t.dataset.val;
        Store.notify();
        openPrefs();
        break;
      }
      case "toggle-pref": {
        const k = t.dataset.key;
        Store.state.prefs[k] = !Store.state.prefs[k];
        Store.notify();
        openPrefs();
        break;
      }
      case "open-onboarding":
        openOnboarding();
        break;
      case "copy-yesterday": {
        const r = copyDayToDay(addDays(todayStr(), -1), todayStr());
        toast(r.added ? `已把昨天的 ${r.added} 项复制到今天${r.skipped ? `，跳过 ${r.skipped} 项重复` : ""}` : `昨天没有可复制的日程${r.skipped ? `（今天已有 ${r.skipped} 项重复）` : ""}`, r.added ? "ok" : "warn");
        renderCurrent();
        break;
      }
      case "open-templates":
        openTemplates();
        break;
      case "open-export":
        openExport();
        break;
      case "placeholder":
        toast(`「${t.dataset.label}」功能即将上线，敬请期待`, "ok");
        break;
    }
  });

  // 键盘可达：聚焦在可点元素上按 Enter / Space 触发（覆盖所有 data-act）
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const el = document.activeElement;
    if (el && el.dataset && el.dataset.act) {
      e.preventDefault();
      el.click();
    }
  });

  // 排程页「添加日程」的自定义取色器（data-ctx=sched）
  document.addEventListener("input", (e) => {
    const ci = e.target.closest('.color-custom-input[data-ctx="sched"]');
    if (!ci) return;
    schedUI.color = ci.value;
    const wrap = ci.closest(".color-grid");
    if (wrap) {
      wrap.querySelectorAll(".color-dot").forEach((x) => x.classList.remove("sel"));
      const label = wrap.querySelector(".color-custom");
      if (label) {
        label.classList.add("active");
        label.style.background = ci.value;
      }
    }
  });

  function deleteWithUndo(id) {
    const removed = Store.removeSchedule(id);
    if (!removed) return;
    haptic(20);
    renderCurrent();
    toast(`已删除「${removed.title}」`, "warn", {
      label: "撤销",
      onClick: () => {
        Store.addSchedule(removed); // 保留原 id，完整还原（含 doneAt/优先级等）
        renderCurrent();
        toast("已恢复", "ok");
      },
    });
  }

  function toggleTheme() {
    const cur = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = cur;
    try {
      localStorage.setItem("timeagent_theme", cur);
    } catch (e) {}
    renderCurrent();
    // 通知安卓壳同步原生顶部背景与状态栏颜色（深色模式下顶条不再留白）
    try {
      if (window.AndroidBridge && window.AndroidBridge.setTheme) window.AndroidBridge.setTheme(cur);
    } catch (e) {}
  }

  /* ============================================================
     新手引导（onboarding）
     - 全新用户（无 onboarded 标记 + 无数据）首次启动弹出
     - 展示三大核心区 + 可选放入示例数据；完播后不再打扰
     ============================================================ */
  const ONBOARD_KEY = "timeagent_onboarded";
  function hasOnboarded() {
    try { return localStorage.getItem(ONBOARD_KEY) === "1"; } catch (e) { return false; }
  }
  function markOnboarded() {
    try { localStorage.setItem(ONBOARD_KEY, "1"); } catch (e) {}
  }
  function seedDemoData() {
    const t = todayStr();
    const demo = [
      { title: "晨间阅读", date: t, startTime: "08:00", endTime: "08:45", tag: "学习", tagColor: "#2563EB", isCompleted: false, repeat: "none", priority: "中" },
      { title: "专注工作", date: t, startTime: "10:00", endTime: "12:00", tag: "工作", tagColor: "#0891B2", isCompleted: false, repeat: "none", priority: "高" },
      { title: "傍晚慢跑", date: t, startTime: "18:30", endTime: "19:15", tag: "运动", tagColor: "#EF4444", isCompleted: false, repeat: "none", priority: "中" },
    ];
    demo.forEach((d) => Store.addSchedule(d));
    const goals = Store.state.prefs.goals || [];
    if (!goals.length) Store.state.prefs.goals = [{ id: uid(), title: "每天阅读", cat: "学习", period: "day", hours: 1 }];
    Store.notify();
  }
  function openOnboarding() {
    openSheet(
      `<div class="sheet-head"><div class="h">👋 欢迎使用 TimeAgent</div></div>
       <div class="ob-body mt2">
         <div class="ob-feat"><span class="ob-ico">${svg("home")}</span><div><b>今天</b>：一眼看清今日安排、专注时长与 AI 建议</div></div>
         <div class="ob-feat"><span class="ob-ico">${svg("chat")}</span><div><b>对话舱</b>：用大白话和 AI 说话就能排期、调时间、查进度</div></div>
         <div class="ob-feat"><span class="ob-ico">${svg("target")}</span><div><b>目标</b>：设定每天/每周投入，AI 帮你盯着完成度</div></div>
       </div>
       <div class="card-sub mt2" style="line-height:1.7">数据全部存在你手机本地，不上传任何服务器。建议先放入一份示例数据感受一下～</div>
       <div class="flex gap1 mt3">
         <button class="btn ghost flex" id="obSkip" style="flex:1" data-close>直接开始</button>
         <button class="btn flex" id="obDemo" style="flex:1">放入示例数据</button>
       </div>
       <div class="card-sub mt2" style="text-align:center">随时可在「我的 → 新手引导」重新查看</div>`,
      {
        onOpen: (el) => {
          el.querySelector("#obSkip").addEventListener("click", () => { markOnboarded(); });
          el.querySelector("#obDemo").addEventListener("click", () => {
            seedDemoData();
            markOnboarded();
            closeSheet();
            renderCurrent();
            toast("已放入示例数据，试着和 AI 说句话吧～", "ok");
          });
        },
      }
    );
  }

  /* ============================================================
     日程模板（和昨天一样 + 命名模板套用）
     ============================================================ */
  function dayItemsOf(dateStr) {
    return Store.state.schedule
      .filter((i) => !i.repeat || i.repeat === "none")
      .filter((i) => (i.date || todayStr()) === dateStr);
  }
  function copyDayToDay(fromDate, toDate) {
    const items = dayItemsOf(fromDate);
    let added = 0, skipped = 0;
    items.forEach((it) => {
      const dup = Store.state.schedule.find((x) => (x.date || todayStr()) === toDate && x.title === it.title && x.startTime === it.startTime);
      if (dup) { skipped++; return; }
      const copy = Object.assign({}, it, { id: uid(), date: toDate, isCompleted: false, isFresh: false, doneDates: [], doneAt: null, doneAtMap: null });
      Store.addSchedule(copy);
      added++;
    });
    Store.notify();
    return { added, skipped };
  }
  function listTemplates() {
    return Store.state.prefs.templates || [];
  }
  function saveTemplate(name, dateStr) {
    const items = dayItemsOf(dateStr).map((i) => ({
      title: i.title, startTime: i.startTime, endTime: i.endTime, tag: i.tag, tagColor: i.tagColor, priority: i.priority || "中", desc: i.desc || "",
    }));
    if (!Store.state.prefs.templates) Store.state.prefs.templates = [];
    const tpl = { id: uid(), name, items };
    Store.state.prefs.templates.push(tpl);
    Store.notify();
    return tpl;
  }
  // 套用模板：生成目标日期的日程，自动避开已占用时段（冲突则向后顺延 30 分钟找空档）
  function applyTemplate(tplId, toDate) {
    const tpl = (Store.state.prefs.templates || []).find((x) => x.id === tplId);
    if (!tpl) return { added: 0, skipped: 0 };
    let added = 0, skipped = 0;
    tpl.items.forEach((it) => {
      const dur = parseHM(it.endTime) - parseHM(it.startTime);
      let start = it.startTime, end = it.endTime;
      let guard = 0;
      while (guard++ < 48) {
        const conflict = Store.state.schedule.some((x) => (x.date || todayStr()) === toDate && x.startTime < end && x.endTime > start);
        if (!conflict) break;
        const [h, m] = start.split(":").map(Number);
        let nm = m + 30, nh = h; if (nm >= 60) { nm -= 60; nh += 1; }
        start = pad(nh) + ":" + pad(nm);
        const [eh, em] = end.split(":").map(Number);
        let nem = em + 30, neh = eh; if (nem >= 60) { nem -= 60; neh += 1; }
        end = pad(neh) + ":" + pad(nem);
      }
      const dup = Store.state.schedule.find((x) => (x.date || todayStr()) === toDate && x.title === it.title && x.startTime === start);
      if (dup) { skipped++; return; }
      Store.addSchedule({ title: it.title, date: toDate, startTime: start, endTime: end, tag: it.tag, tagColor: it.tagColor, priority: it.priority || "中", desc: it.desc || "", isCompleted: false, repeat: "none" });
      added++;
    });
    Store.notify();
    return { added, skipped };
  }
  function openTemplates() {
    openSheet(
      `<div class="sheet-head"><div class="h">日程模板</div><button class="x" data-close>${svg("close")}</button></div>
       <div class="card-sub">把一组日程存成模板（如「工作日模板」「出差模板」），需要时一键套用，自动避开已占用时段。</div>
       <div id="tplList" class="mt2"></div>
       <div class="divider mt3"></div>
       <div class="card-sub mt2">保存当前「今日」日程为模板：</div>
       <div class="flex gap1 mt1">
         <input class="input flex" id="tplName" placeholder="模板名，如 工作日模板" style="flex:1" />
         <button class="btn" id="tplSave">保存模板</button>
       </div>`,
      {
        onOpen: (el) => {
          const list = el.querySelector("#tplList");
          const renderList = () => {
            const ts = listTemplates();
            list.innerHTML = ts.length
              ? ts.map((t) => `<div class="tpl-row"><span class="t-name">${esc(t.name)}</span><span class="t-meta">${t.items.length} 项</span>
                  <button class="btn sm ghost" data-tpl-apply="${t.id}">套用今日</button>
                  <button class="btn sm danger ghost" data-tpl-del="${t.id}">删</button></div>`).join("")
              : `<div class="muted" style="font-size:12.5px">还没有模板，先保存一个吧～</div>`;
            list.querySelectorAll("[data-tpl-apply]").forEach((b) => b.addEventListener("click", () => {
              const r = applyTemplate(b.dataset.tplApply, todayStr());
              const nm = (listTemplates().find((x) => x.id === b.dataset.tplApply) || {}).name || "";
              toast(`已套用「${nm}」：${r.added} 项，跳过 ${r.skipped} 项冲突`, "ok");
              closeSheet(); renderCurrent();
            }));
            list.querySelectorAll("[data-tpl-del]").forEach((b) => b.addEventListener("click", () => {
              Store.state.prefs.templates = (Store.state.prefs.templates || []).filter((x) => x.id !== b.dataset.tplDel);
              Store.notify(); renderList();
            }));
          };
          renderList();
          el.querySelector("#tplSave").addEventListener("click", () => {
            const name = el.querySelector("#tplName").value.trim();
            if (!name) { toast("先给模板起个名字", "warn"); return; }
            if (!dayItemsOf(todayStr()).length) { toast("今天还没有日程可保存", "warn"); return; }
            saveTemplate(name, todayStr());
            el.querySelector("#tplName").value = "";
            toast(`已保存模板「${name}」`, "ok");
            renderList();
          });
        },
      }
    );
  }

  /* ============================================================
     数据导出：CSV（Excel 友好）+ iCal(.ics)
     ============================================================ */
  function csvCell(v) {
    const s = String(v == null ? "" : v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function toCSV(list) {
    const head = ["日期", "标题", "开始", "结束", "标签", "优先级", "时长(h)", "已完成"];
    const rows = list.map((i) => {
      const dur = parseHM(i.endTime) - parseHM(i.startTime);
      return [i.date || todayStr(), i.title, i.startTime, i.endTime, i.tag || "", i.priority || "中", dur > 0 ? dur.toFixed(2) : 0, isDone(i) ? "是" : "否"].map(csvCell).join(",");
    });
    return "﻿" + head.join(",") + "\n" + rows.join("\n");
  }
  function toICS(list) {
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//TimeAgent//CN", "CALSCALE:GREGORIAN"];
    list.forEach((i) => {
      const d = i.date || todayStr();
      const sd = d.replace(/-/g, "") + "T" + i.startTime.replace(/:/g, "") + "00";
      const ed = d.replace(/-/g, "") + "T" + i.endTime.replace(/:/g, "") + "00";
      lines.push("BEGIN:VEVENT", "UID:" + (i.id || uid()) + "@timeagent", "DTSTART:" + sd, "DTEND:" + ed, "SUMMARY:" + (i.title || ""), "CATEGORIES:" + (i.tag || ""), "END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  }
  function downloadCSV() {
    downloadBlob(new Blob([toCSV(Store.state.schedule)], { type: "text/csv;charset=utf-8" }), `timeagent-${todayStr()}.csv`);
  }
  function downloadICS() {
    downloadBlob(new Blob([toICS(Store.state.schedule)], { type: "text/calendar;charset=utf-8" }), `timeagent-${todayStr()}.ics`);
  }
  function openExport() {
    openSheet(
      `<div class="sheet-head"><div class="h">导出 / 导入数据</div><button class="x" data-close>${svg("close")}</button></div>
       <div class="card-sub mt1" style="line-height:1.7">把全部日程导出，拿到 Excel 做周报分析，或导入系统日历（iOS 日历 / Google Calendar / Outlook）实现跨 App 提醒；也可导入别人分享的 .ics 文件。</div>
       <button class="btn block mt2" id="expCsv">${svg("doc")} 导出 CSV（Excel 友好）</button>
       <button class="btn block soft mt2" id="expIcs">${svg("calendar")} 导出 iCal(.ics)</button>
       <button class="btn block soft mt2" id="impIcs">${svg("download")} 导入 iCal(.ics)</button>
       <input type="file" id="impIcsFile" accept=".ics,text/calendar" hidden>
       <div class="bk-ok mt2" id="expDone" hidden></div>`,
      {
        onOpen: (el) => {
          el.querySelector("#expCsv").addEventListener("click", () => { downloadCSV(); const d = el.querySelector("#expDone"); d.hidden = false; d.textContent = "✅ CSV 已生成"; });
          el.querySelector("#expIcs").addEventListener("click", () => { downloadICS(); const d = el.querySelector("#expDone"); d.hidden = false; d.textContent = "✅ iCal 已生成（可导入系统日历）"; });
          el.querySelector("#impIcs").addEventListener("click", () => el.querySelector("#impIcsFile").click());
          el.querySelector("#impIcsFile").addEventListener("change", (e) => {
            const f = e.target.files && e.target.files[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = () => {
              const items = parseICS(r.result);
              const res = importICSItems(items);
              const d = el.querySelector("#expDone");
              d.hidden = false;
              d.textContent = res.added ? `✅ 已导入 ${res.added} 条${res.skipped ? "（跳过 " + res.skipped + " 条重复）" : ""}` : res.skipped ? "没有新日程，已跳过重复项" : "未识别到日程";
            };
            r.readAsText(f);
          });
        },
      }
    );
  }

  /* ============================================================
     iCal(.ics) 导入：解析 VCALENDAR/VEVENT，转成日程并去重批量添加
     ============================================================ */
  function parseICALDate(val) {
    const v = (val || "").trim();
    const m = v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
    if (m) return { date: `${m[1]}-${m[2]}-${m[3]}`, time: `${m[4]}:${m[5]}` };
    const d = v.match(/^(\d{4})(\d{2})(\d{2})/);
    if (d) return { date: `${d[1]}-${d[2]}-${d[3]}`, time: null };
    return null;
  }
  function parseICS(text) {
    if (!text) return [];
    const rawLines = text.split(/\r?\n/);
    const lines = [];
    rawLines.forEach((rl) => {
      if (/^[ \t]/.test(rl) && lines.length) lines[lines.length - 1] += rl.replace(/^[ \t]/, ""); // 折行续接
      else lines.push(rl);
    });
    const items = [];
    let cur = null;
    for (const line of lines) {
      const up = line.toUpperCase();
      if (up === "BEGIN:VEVENT") { cur = {}; continue; }
      if (up === "END:VEVENT") { if (cur) items.push(cur); cur = null; continue; }
      if (!cur) continue;
      const idx = line.indexOf(":");
      if (idx < 0) continue;
      const name = line.slice(0, idx).toUpperCase().split(";")[0];
      const val = line.slice(idx + 1);
      if (name === "SUMMARY") cur.title = val.trim();
      else if (name === "DTSTART") { const p = parseICALDate(val); if (p) { cur.date = p.date; cur.startTime = p.time; } }
      else if (name === "DTEND") { const p = parseICALDate(val); if (p) cur.endTime = p.time; }
      else if (name === "CATEGORIES") cur.tag = val.trim();
      else if (name === "UID") cur.uid = val.trim();
    }
    return items
      .filter((c) => c.title && c.date)
      .map((c) => {
        const start = c.startTime || "09:00";
        const [h, m] = start.split(":").map(Number);
        const t = h * 60 + m + 60;
        const end = c.endTime || `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
        return { title: c.title, date: c.date, startTime: start, endTime: end, tag: c.tag || "其他" };
      });
  }
  function importICSItems(items) {
    let added = 0, skipped = 0;
    const ids = [];
    (items || []).forEach((it) => {
      const cand = { id: uid(), title: it.title, date: it.date, startTime: it.startTime, endTime: it.endTime, tag: it.tag || "其他", priority: "中", remind: false, remindOffset: 10 };
      const dup = Store.state.schedule.some((s) => s.date === cand.date && s.title === cand.title && s.startTime === cand.startTime);
      if (dup) { skipped++; return; }
      Store.addSchedule(cand);
      ids.push(cand.id);
      added++;
    });
    if (added) { Store.save(); renderCurrent(); }
    return { added, skipped, ids };
  }

  /* ============================================================
     习惯热力图（类 GitHub 贡献图，按完成项数着色）
     ============================================================ */
  function heatmapData(days = 119) {
    const map = {};
    Store.state.schedule.forEach((i) => {
      const d = i.date || todayStr();
      if (!map[d]) map[d] = { total: 0, done: 0 };
      map[d].total++;
      if (isDone(i)) map[d].done++;
    });
    const arr = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = addDays(todayStr(), -i);
      const e = map[d] || { total: 0, done: 0 };
      let level = 0;
      if (e.total > 0) level = e.done === 0 ? 1 : e.done >= 3 ? 4 : e.done >= 2 ? 3 : 2;
      arr.push({ date: d, total: e.total, done: e.done, level });
    }
    return arr;
  }
  function renderHeatmapHTML(days = 119) {
    const data = heatmapData(days);
    const cells = data.map((c) => {
      const wkday = parseDate(c.date).getDay();
      const tip = `${c.date}：${c.done}/${c.total} 完成`;
      return `<span class="hm-cell lv${c.level}" data-wk="${wkday}" title="${tip}"></span>`;
    }).join("");
    const weeks = Math.ceil(data.length / 7);
    let streak = 0, maxStreak = 0;
    data.forEach((c) => { if (c.total > 0) { streak++; maxStreak = Math.max(maxStreak, streak); } else streak = 0; });
    return `<div class="heatmap">
        <div class="hm-grid" style="--weeks:${weeks}">${cells}</div>
        <div class="hm-legend"><span>少</span>${[0, 1, 2, 3, 4].map((l) => `<span class="hm-cell lv${l}"></span>`).join("")}<span>多</span></div>
        <div class="hm-stat">最长连续记录 <b>${maxStreak}</b> 天</div>
      </div>`;
  }

  /* ============================================================
     统计可视化：专注趋势折线图 + 分类占比环图（纯 SVG，无外部库）
     ============================================================ */
  function trendSeries(days = 14) {
    const map = {};
    Store.state.schedule.forEach((i) => {
      const d = i.date || todayStr();
      if (!map[d]) map[d] = 0;
      if (isDone(i)) map[d] += parseHM(i.endTime) - parseHM(i.startTime);
    });
    const arr = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = addDays(todayStr(), -i);
      arr.push({ date: d, hours: Math.max(0, map[d] || 0) });
    }
    return arr;
  }
  function renderTrendChart(days = 14) {
    const s = trendSeries(days);
    const max = Math.max(1, ...s.map((x) => x.hours));
    const W = 280, H = 90, pad = 10;
    const stepX = s.length > 1 ? (W - pad * 2) / (s.length - 1) : 0;
    const pts = s.map((x, i) => {
      const xv = pad + i * stepX;
      const yv = H - pad - (x.hours / max) * (H - pad * 2);
      return `${xv.toFixed(1)},${yv.toFixed(1)}`;
    }).join(" ");
    const area = `${pad},${H - pad} ${pts} ${W - pad},${H - pad}`;
    const bars = s.map((x, i) => {
      const xv = pad + i * stepX;
      const yv = H - pad - (x.hours / max) * (H - pad * 2);
      const bw = Math.min(6, stepX * 0.5 || 4);
      return `<rect x="${(xv - bw / 2).toFixed(1)}" y="${yv.toFixed(1)}" width="${bw.toFixed(1)}" height="${(H - pad - yv).toFixed(1)}" rx="1.5" fill="var(--primary)" opacity="0.22"/>`;
    }).join("");
    return `<div class="trend-chart"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" width="100%" height="90">
        <polygon points="${area}" fill="var(--primary-soft)" opacity="0.55"/>
        ${bars}
        <polyline points="${pts}" fill="none" stroke="var(--primary-strong)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      </svg><div class="tc-cap">近 ${days} 天每日专注时长（小时）</div></div>`;
  }
  function renderCatDonut(stats) {
    const dist = catDistOf(stats).filter((d) => d.hours > 0);
    if (!dist.length) return "";
    const total = dist.reduce((a, d) => a + d.hours, 0) || 1;
    const R = 42, C = 2 * Math.PI * R;
    let off = 0;
    const segs = dist.map((d) => {
      const frac = d.hours / total;
      const len = frac * C;
      const seg = `<circle cx="50" cy="50" r="${R}" fill="none" stroke="${d.color}" stroke-width="14" stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 50 50)"/>`;
      off += len;
      return seg;
    }).join("");
    const legend = dist.map((d) => `<span class="dn-leg"><i style="background:${d.color}"></i>${esc(d.cat)} ${d.percent}%</span>`).join("");
    return `<div class="cat-donut"><svg viewBox="0 0 100 100" width="120" height="120">${segs}<text x="50" y="47" text-anchor="middle" class="dn-total">${stats.totalHours.toFixed(1)}</text><text x="50" y="62" text-anchor="middle" class="dn-unit">小时</text></svg><div class="dn-legs">${legend}</div></div>`;
  }

  /* ============================================================
     底部标签栏 + 初始化
     ============================================================ */
  function buildTabbar() {
    const tabs = [
      { i: 0, icon: "home", label: "首页" },
      { i: 1, icon: "calendar", label: "日程" },
      { i: 2, icon: "chart", label: "统计" },
      { i: 3, icon: "user", label: "我的" },
    ];
    $("#tabbar").innerHTML = tabs
      .map(
        (t) =>
          `<div class="tab-item ${t.i === 0 ? "active" : ""}" data-act="tab" data-tab="${t.i}">
            ${svg(t.icon)}<span>${t.label}</span><span class="ind"></span></div>`
      )
      .join("");
  }

  function init() {
    // 主题
    try {
      const th = localStorage.getItem("timeagent_theme");
      if (th) document.documentElement.dataset.theme = th;
    } catch (e) {}
    Store.load();
    if (["day", "week", "month"].includes(Store.state.prefs.defaultView)) scope.mode = Store.state.prefs.defaultView;
    buildTabbar();
    navigate(0);
    // 全局返回键处理（供 Android WebView 壳调用）：有浮层则关闭它，返回 true；否则返回 false 让壳退出 App
    window.__taBack = function () {
      if (overlay.classList.contains("show")) {
        closeSheet();
        return true;
      }
      const cl = document.getElementById("chatLayer");
      if (cl) {
        cl.remove();
        return true;
      }
      return false;
    };
    initReminders();
    // 周报自动定时推送：进入新的一周（有数据）时自动生成周复盘并轻量提醒（同周不重复）
    autoWeeklyReview();
    // AI 主动聊天：启动 15s 后首次检查，之后每 20 分钟一次；回到前台时也检查（暴露给测试/调试）
    window.__taProactive = proactiveFire;
    // 主动消息反馈测试钩子
    window.__taFb = { fbMuted, fbBoosted, fbRecord, fbGet, proactivePick, proactiveTypeCap, proactiveTypeDone };
    // 备份编解码测试钩子
    window.__taBk = { buildBackupFile, parseBackupText, applyBackupData, backupPayload };
    setTimeout(proactiveFire, 15 * 1000);
    setInterval(proactiveFire, 20 * 60 * 1000);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") setTimeout(proactiveFire, 3000);
    });
    // 软键盘兼容（安卓 WebView edge-to-edge）：输入框聚焦时滚到可视区中央；
    // visualViewport 变化（键盘弹出/收起）时再校准一次，避免键盘遮挡已输入内容
    document.addEventListener("focusin", (e) => {
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) {
        setTimeout(() => {
          try {
            if (document.activeElement === t) t.scrollIntoView({ block: "center" });
          } catch (_) {}
        }, 80);
      }
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", () => {
        const t = document.activeElement;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) {
          setTimeout(() => {
            try {
              t.scrollIntoView({ block: "center" });
            } catch (_) {}
          }, 40);
        }
      });
    }
    // 跨页面刷新联动：store 变化且不在当前页时，回到首页刷新角标
    Store.subscribe(() => {
      $$(".tab-item", $("#tabbar")).forEach((t, i) => t.classList.toggle("has-badge", i === 0 && hasFresh()));
    });
    // 新功能测试钩子
    window.__taOnboard = { openOnboarding, hasOnboarded, seedDemoData };
    window.__taTpl = { copyDayToDay, saveTemplate, applyTemplate, listTemplates, openTemplates, dayItemsOf };
    window.__taExport = { toCSV, toICS, downloadCSV, downloadICS, openExport };
    window.__taImport = { parseICS, importICSItems };
    window.__taHeat = { heatmapData, renderHeatmapHTML };
    window.__taRemind = { backupRemindDue };
    window.__taWeekly = { autoWeeklyReview, clearAuto: () => { Store.state.prefs.lastAutoWeek = null; Store.save(); }, weekKey: () => weekKeyOf(todayStr()) };
    window.__taNotify = { sysNotifyAllowed, testNotify };
    // 新手引导：全新用户（无标记 + 无数据）首次启动弹出；已有数据的不打扰（不影响老用户与测试）
    if (!hasOnboarded() && Store.state.schedule.length === 0) setTimeout(openOnboarding, 350);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
