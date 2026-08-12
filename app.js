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
    } else if (isNoon && hour < 12) hour += 12;
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

      const t = parseTime(text);
      if (!t.found)
        return {
          tasks: [],
          question: `好的，我已记下「${title}」（${tag}）。不过还缺少一个具体时间，请告诉我几点？\n例如：「下午3点」或「15:00」。`,
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
                  .map((i) => Object.assign({ date: todayStr(), isCompleted: false, isFresh: false, desc: "", repeat: "none", remind: false, remindOffset: 10, doneDates: [] }, i))
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
        { id: uid(), isCompleted: false, date: todayStr(), isFresh: false, desc: "", repeat: "none", remind: false, remindOffset: 10, doneDates: [] },
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
      if (it.repeat && it.repeat !== "none") {
        // 重复日程：按出现日期切换完成态，互不影响
        const arr = it.doneDates ? it.doneDates.slice() : [];
        const k = arr.indexOf(date);
        if (k >= 0) arr.splice(k, 1);
        else arr.push(date);
        it.doneDates = arr;
      } else {
        it.isCompleted = !it.isCompleted;
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
  function computeStats() {
    return computeStatsFor(Store.state.schedule);
  }

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

  // 生成近 N 天日程上下文（供 AI 感知用户真实日程，避免模型臆造/撞期）
  function scheduleContext(days = 3) {
    const t = todayStr();
    const lines = [];
    for (let i = 0; i < days; i++) {
      const d = addDays(t, i);
      const items = scopeItems(Store.state.schedule, { mode: "day", anchor: d });
      if (!items.length) continue;
      const label = d === t ? "今天" : d === addDays(t, 1) ? "明天" : humanDateLabel(d);
      const row = items
        .slice()
        .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))
        .map((it) => `${it.startTime}-${it.endTime} ${it.title}${isDone(it) ? "（已完成）" : ""}${it.tag ? " /" + it.tag : ""}`)
        .join("；");
      lines.push(`${label}：${row}`);
    }
    return lines.length ? lines.join("\n") : "（近三天暂无日程）";
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
    if (hit && Date.now() - hit.at < 90 * 1000) return hit.text;
    if (!apiReady()) return buildAdvice(stats, scope);
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
      `用户当前查看「${label}」概览，该周期严格只有下面列出的 ${scoped.length} 个日程（${withDate ? "日期 " : ""}时间 事项 状态 /分类）：\n${rows || "（该周期暂无日程）"}\n` +
      `【硬性要求】你的分析必须完全基于上述真实日程，严禁臆造任何未列出的日程、数字或完成情况；若只有 1 个日程，就不要谈"分类失衡/多任务协调"，请聚焦这一个事项本身给建议。\n` +
      `请输出最多 3 句：① 一句话贴合实际的总评；② 1 条针对现有日程的具体可执行改进建议（如把某事项提前、补全休息、降低密度）；③ 如需，1 句鼓励。` +
      `全文 90 字以内，自然中文，不用列表符号、不用加粗、不用 emoji、不夸张。`;
    try {
      const text = await callLLM(
        [
          { role: "system", content: "你是严谨又温暖的私人时间管理洞察助手。" },
          { role: "user", content: prompt },
        ],
        { temperature: 0.6, maxTokens: 500, timeoutMs: 30000 }
      );
      const clean = text.replace(/\s*\n+\s*/g, " ").trim().slice(0, 200);
      insightCache.set(key, { text: clean, at: Date.now() });
      if (insightCache.size > 12) insightCache.clear(); // 防止跨天累积无限增长
      return clean;
    } catch (e) {
      return buildAdvice(stats, scope);
    }
  }

  /* ============================================================
     Toast / 浮层工具
     ============================================================ */
  let toastSeq = 0;
  function toast(msg, type = "ok", action) {
    const wrap = $("#toastWrap");
    const id = "t" + toastSeq++;
    const node = document.createElement("div");
    node.className = "toast " + type;
    node.id = id;
    node.innerHTML =
      (type !== "ok" && type !== "warn" && type !== "err" ? "" : `<span>${svg(type === "ok" ? "check" : type === "warn" ? "bulb" : "close")}</span>`) +
      `<span>${esc(msg)}</span>` +
      (action ? `<button class="act">${esc(action.label)}</button>` : "");
    wrap.appendChild(node);
    const ttl = action ? 6000 : 2600;
    const timer = setTimeout(() => dismiss(), ttl);
    function dismiss() {
      clearTimeout(timer);
      node.classList.add("out");
      setTimeout(() => node.remove(), 300);
    }
    if (action) {
      node.querySelector(".act").addEventListener("click", () => {
        action.onClick && action.onClick();
        dismiss();
      });
    }
    // 超过 3 条自动清理最旧
    while (wrap.children.length > 3) wrap.firstChild.remove();
  }

  const overlay = $("#overlay");
  function openSheet(html, opts = {}) {
    overlay.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
    overlay.classList.add("show");
    overlay.setAttribute("aria-hidden", "false");
    overlay.querySelectorAll("[data-close]").forEach((btn) => btn.addEventListener("click", closeSheet));
    if (opts.onOpen) opts.onOpen(overlay.querySelector(".sheet"));
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
      icon = "bolt";
      tone = "warn";
      text = `${missed.length} 项日程已过未打卡：${missed.slice(0, 2).map((i) => "「" + i.title + "」").join("、")}${missed.length > 2 ? " 等" : ""}`;
    } else {
      icon = "check";
      tone = "ok";
      text = "今日安排已全部结束，好好休息";
    }
    return `<div class="focus-bar ${tone}" role="button" tabindex="0" data-act="open-planner" title="点击用一句话安排新日程">
      <span class="fb-ico">${svg(icon)}</span><span class="fb-txt">${esc(text)}</span><span class="fb-go">${svg("chevron")}</span>
    </div>`;
  }

  /* ---------- 首页「一句话排期」快捷输入条（P1） ---------- */
  function quickPlannerBar() {
    return `<div class="quick-input">
      <input id="homeQuickInput" class="ai-input" placeholder="一句话排期：明早 8 点背单词 1 小时" autocomplete="off" enterkeyhint="send" />
      <button class="btn quick-send" id="homeQuickSend" title="AI 排期" aria-label="AI 排期">${svg("sparkle")}</button>
    </div>`;
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
       <div class="card-sub mt2">提示：重叠日程可长按编辑调整时间；安排过满时建议拆分或删除低优先级事项。</div>
       <button class="btn block mt3" data-act="open-planner">${svg("sparkle")} 让 AI 帮我重新安排</button>`
    );
  }

  /* ---------- 周/月环比趋势（P2）：较上一周期专注时长变化，纯离线 ---------- */
  function trendDelta() {
    if (scope.mode === "day") return null;
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

      ${quickPlannerBar()}

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
          ${apiReady() ? '<span class="ai-badge" title="AI 实时生成">AI</span>' : ""}
        </div>
      </div>
    </div>`;

    renderRing($("#ring"), stats.timeDist, stats.totalHours);
    wireHome();
    scheduleFreshClear();
    // AI 洞察异步升级：先展示离线建议，模型返回后无缝替换（带缓存）
    if (apiReady()) {
      const txt = $("#homeAdviceTxt");
      if (txt)
        genInsight(stats).then((text) => {
          if (txt.isConnected) txt.textContent = text;
        });
    }
  }

  function statCell(icon, k, v, key) {
    return `<div class="stat-cell clickable" role="button" tabindex="0" data-act="stat-detail" data-key="${key}"><span class="ico">${svg(icon)}</span><span class="v">${v}</span><span class="k">${k}</span>${key === "advice" ? '<span class="go">' + svg("chevron") + "</span>" : ""}</div>`;
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
        Store.toggleSchedule(id, date);
        renderCurrent();
      });
    });

    if (hasFresh()) {
      $$(".tab-item", $("#tabbar")).forEach((t, i) => t.classList.toggle("has-badge", i === 0));
    }

    // 首页「一句话排期」快捷入口（P1）：回车 / 点 ✨ → 打开 AI 规划并自动发送
    const qi = $("#homeQuickInput");
    if (qi) {
      const sendQuick = () => {
        const v = qi.value.trim();
        if (!v) {
          qi.focus();
          return;
        }
        openPlanner(v, true);
      };
      qi.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          sendQuick();
        }
      });
      const qs = $("#homeQuickSend");
      if (qs) qs.addEventListener("click", sendQuick);
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
  const schedUI = { open: false, sh: 9, sm: 0, dh: 1, dm: 0, tag: "其他", color: "#A1A1AA", custom: "", title: "", date: todayStr() };

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
    Store.addSchedule({
      title,
      startTime: startStr,
      endTime: endStr,
      desc: "",
      tag,
      tagColor: schedUI.color,
      date: schedUI.date || todayStr(),
      isCompleted: false,
      isFresh: true,
    });
    const addedLabel = humanDateLabel(schedUI.date || todayStr());
    schedUI.title = "";
    schedUI.open = false;
    schedUI.dh = 1;
    schedUI.dm = 0;
    schedUI.date = todayStr();
    toast(`已添加 ${addedLabel} 的日程 ✨`, "ok");
    renderSchedule();
  }

  /* ============================================================
     统计页
     ============================================================ */
  function renderStatistics() {
    const scoped = scopeItems(Store.state.schedule, scope);
    const stats = computeStatsFor(scoped);
    const label = scope.mode === "week" ? "本周" : scope.mode === "month" ? "本月" : "今日";
    // AI 数据解读：离线先渲染规则解读，在线异步升级为模型洞察（与首页同源缓存）
    const insightBlock = scoped.length
      ? `<div class="advice" style="margin-top:10px">
          <span class="bulb">${svg("bulb")}</span>
          <div class="txt" id="statInsightTxt">${esc(buildAdvice(stats, scope)).replace(/\n/g, "<br>")}</div>
          <span class="ai-badge">${apiReady() ? "AI 解读" : "离线解读"}</span>
        </div>`
      : "";
    const reportEntry = `<div class="card tight">
      <div class="report-card">
        <span class="ic">${svg("report")}</span>
        <div class="tx"><div class="t">${label} AI 日报</div><div class="s">基于你的执行情况，生成有温度的总结</div></div>
        <button class="btn sm" data-act="gen-report">${svg("sparkle")} 生成</button>
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

    const taskList = scoped.length
      ? `<div class="card"><div class="card-title">${svg("list")} ${label}事项明细</div><div class="mt2">${perTask}</div></div>`
      : "";

    view.innerHTML = `<div class="page">
      <div class="head"><div><div class="title">时间统计</div><div class="sub">${esc(scopeTitle(scope).sub || label + "概览")}</div></div></div>
      ${scopeBar()}
      ${reportEntry}
      ${taskList}
      ${breakdown}
    </div>`;

    requestAnimationFrame(() => {
      $$(".bar > i", view).forEach((b) => (b.style.width = b.dataset.w + "%"));
    });
    // AI 解读异步升级（有 Key 时替换为模型洞察；无 Key 时 genInsight 返回同款离线文案，跳过避免闪烁）
    if (scoped.length) {
      genInsight(stats).then((txt) => {
        const el = view.querySelector("#statInsightTxt");
        if (el && el.isConnected && el.textContent !== txt) el.textContent = txt;
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
        <div class="card-sub mt1" style="line-height:1.6">两种接入方式（任选其一）：<br/>① <b>直连</b>：填支持浏览器直连的服务（推荐<b>硅基流动</b> api.siliconflow.cn/v1，含免费模型）；<br/>② <b>代理</b>：DeepSeek 官方 Key 需经代理转发，API 地址填 <code>/api/deepseek</code>（需部署 Netlify 云函数）。<br/>失败时自动回退离线解析，不影响使用。</div>
      </div>

      <div class="card">
        <div class="menu">
          <div class="menu-item" data-act="open-catman">${svgWrap("tag")}<span>分类管理</span>${svgWrap("chevron")}</div>
          <div class="divider"></div>
          <div class="menu-item" data-act="open-history">${svgWrap("folder")}<span>历史记录</span>${svgWrap("chevron")}</div>
          <div class="divider"></div>
          <div class="menu-item" data-act="open-prefs">${svgWrap("brain")}<span>AI 偏好设置</span>${svgWrap("chevron")}</div>
          <div class="divider"></div>
          <div class="menu-item" data-act="open-help">${svgWrap("headphones")}<span>帮助与反馈</span>${svgWrap("chevron")}</div>
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
  }
  function svgWrap(name) {
    return `<span class="ic">${svg(name)}</span>`;
  }

  /* ============================================================
     智能排期对话框（多轮 + 冲突检测）
     ============================================================ */
  let plannerDraft = null;
  let plannerLoading = false;

  function openPlanner(prefill, autoSend) {
    plannerDraft = null;
    plannerLoading = false;
    const prefillDate = relDateFromText(prefill) || todayStr();
    const sheet = openSheet(
      `<div class="sheet-head"><div class="h">AI 时间规划</div><button class="x" data-close>${svg("close")}</button></div>
       <div class="card-sub">用一句话描述安排，例如「明天下午3点去健身房运动2小时」</div>
       <div class="planner-date mt2">
         <input type="date" class="date-input" id="plannerDate" value="${prefillDate}" aria-label="日期" />
         <div class="hint-chips sm">
           <span class="hint-chip" data-pdate="${todayStr()}">今天</span>
           <span class="hint-chip" data-pdate="${addDays(todayStr(), 1)}">明天</span>
           <span class="hint-chip" data-pdate="${addDays(todayStr(), 2)}">后天</span>
         </div>
       </div>
       <div class="ai-input-wrap mt2">
         <input class="ai-input" id="plannerInput" placeholder="说说你想安排的事…" value="${esc(prefill || "")}" />
         <button class="btn" id="plannerSend" style="width:64px;height:46px;padding:0">${svg("send")}</button>
       </div>
       <div class="planner-ask" id="plannerAsk" hidden>
         <span class="pa-ico">${svg("bulb")}</span>
         <div class="pa-txt" id="plannerAskTxt"></div>
         <button class="pa-x" data-act="dismiss-ask" title="收起">${svg("close")}</button>
       </div>
       <div class="hint-chips">
         ${["明早8点背单词1小时", "下午2点开会到4点", "晚上7点跑步半小时", "中午12点吃饭"].map((t) => `<span class="hint-chip" data-hint="${esc(t)}">${esc(t)}</span>`).join("")}
       </div>`,
      {
        onOpen: (el) => {
          const input = el.querySelector("#plannerInput");
          const send = el.querySelector("#plannerSend");
          const pd = el.querySelector("#plannerDate");
          setTimeout(() => input.focus(), 50);
          // 首页快捷输入：打开即自动发送，无需二次回车
          if (prefill && autoSend) {
            setTimeout(() => {
              if (input.value.trim()) doPlannerSend();
            }, 180);
          }
          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") doPlannerSend();
          });
          send.addEventListener("click", doPlannerSend);
          el.querySelectorAll("[data-pdate]").forEach((c) =>
            c.addEventListener("click", () => {
              if (pd) pd.value = c.dataset.pdate;
            })
          );
          el.querySelectorAll(".hint-chip[data-hint]").forEach((c) =>
            c.addEventListener("click", () => {
              input.value = c.dataset.hint;
              doPlannerSend();
            })
          );
          const ask = el.querySelector("#plannerAsk");
          const askX = el.querySelector("[data-act='dismiss-ask']");
          if (askX)
            askX.addEventListener("click", () => ask && ask.setAttribute("hidden", ""));
        },
      }
    );
  }

  function setPlannerLoading(on) {
    plannerLoading = on;
    const send = overlay.querySelector("#plannerSend");
    if (send) {
      send.disabled = on;
      send.innerHTML = on ? '<span class="spinner"></span>' : svg("send");
    }
    const input = overlay.querySelector("#plannerInput");
    if (input) input.disabled = on;
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
  // AI 规划（在线）：调用模型解析用户输入 → 结构化任务
  async function plannerViaApi(text, planDate) {
    const pd = planDate || todayStr();
    // 注入规划日已有日程，让模型主动避开冲突时段（而非事后拦截）
    const dayItems = scopeItems(Store.state.schedule, { mode: "day", anchor: pd });
    const existing = dayItems.length
      ? dayItems
          .slice()
          .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))
          .map((i) => `${i.startTime}-${i.endTime} ${i.title}${isDone(i) ? "(已完成)" : ""}`)
          .join("、")
      : "（当天暂无已有日程）";
    const system = `你是严谨的中文时间管理助手。今天日期：${todayStr()}。用户选择的规划日期：${pd}。
用户该日期已有日程：${existing}
请把用户的自然语言描述解析为日程任务。规则：
1. 时间一律输出 24 小时制 HH:MM（如 15:30）；结束时间若用户未说，按常见时长合理推断。
2. 若用户要求的时段与已有日程重叠，请自动微调（前后移动 15-30 分钟）到不冲突的时段，并在 desc 注明调整原因；确实无法避开时保持原时段。
3. 分类(tag)只能从 [学习,工作,运动,饮食,休息,社交,其他] 中选一个最贴切的。
4. 只返回一个 JSON 对象，不要任何多余文字或解释。格式：
{"tasks":[{"title":"日程名","startTime":"HH:MM","endTime":"HH:MM","tag":"学习","desc":"可选说明"}],"question":""}
5. 若信息不足无法完整解析（如缺少时间或时长且无法合理推断），将 question 设为一句追问，tasks 为空数组。`;
    const userMsg = `我的安排：${text}`;
    const content = await callLLM(
      [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
      { temperature: 0.3, maxTokens: 1500, timeoutMs: 60000 }
    );
    const j = extractJson(content);
    if (!j || typeof j !== "object") throw new Error("模型输出无法解析为 JSON");
    if (j.question && (!Array.isArray(j.tasks) || j.tasks.length === 0)) {
      return { question: String(j.question) };
    }
    if (!Array.isArray(j.tasks) || j.tasks.length === 0) throw new Error("模型未返回任务");
    const tasks = j.tasks
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
          date: planDate || todayStr(),
        };
      });
    if (tasks.length === 0) throw new Error("模型未返回有效任务");
    return { tasks };
  }

  function doPlannerSend() {
    if (plannerLoading) return;
    const input = overlay.querySelector("#plannerInput");
    const pd = overlay.querySelector("#plannerDate");
    const ask = overlay.querySelector("#plannerAsk");
    const askTxt = overlay.querySelector("#plannerAskTxt");
    // 每轮发送先收起上一轮的追问气泡
    if (ask) ask.setAttribute("hidden", "");
    const planDate = pd && pd.value ? pd.value : todayStr();
    const text = input.value.trim();
    if (!text) return;
    setPlannerLoading(true);
    const finish = (res) => {
      setPlannerLoading(false);
      if (!res || typeof res !== "object") return;
      if (res.question) {
        plannerDraft = res.pending || null;
        input.value = "";
        // 追问内容常驻显示，不自动消失，用户看清后再补充
        if (ask && askTxt) {
          askTxt.textContent = res.question;
          ask.removeAttribute("hidden");
        }
        input.focus();
        return;
      }
      plannerDraft = null;
      res.tasks.forEach((t) => (t.date = planDate || t.date || todayStr()));
      if (checkConflicts(res.tasks)) {
        showConflict(res.tasks);
        return;
      }
      addTasksFromPlanner(res.tasks);
    };
    const offline = () => finish(buildFreeDemoTasks(text, undefined, plannerDraft));
    setTimeout(async () => {
      if (apiReady()) {
        try {
          const r = await plannerViaApi(text, planDate);
          finish(r);
          return;
        } catch (err) {
          console.warn("API 规划失败，回退离线解析：", err);
          toast(`在线规划失败（${err.message || "网络错误"}），已回退离线解析`, "warn");
          offline();
          return;
        }
      }
      offline();
    }, 650);
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

  function showConflict(tasks) {
    const plan = tasks.map((t) => `• ${t.startTime} ~ ${t.endTime}  ${t.title}`).join("\n");
    openSheet(
      `<div class="sheet-head"><div class="h">🕐 时间排期提醒</div></div>
       <div class="card-sub" style="line-height:1.7">我帮您制定了如下新计划：<br><br><b style="white-space:pre-line">${esc(plan)}</b><br><br>⚠️ 不过我注意到，这些时间段和您已有的日程存在冲突。<br><br>🌟 您看是直接按新方案添加，还是先取消再重新安排呢？</div>
       <div class="flex gap1 mt3">
         <button class="btn ghost flex" style="flex:1" data-close>我再改改</button>
         <button class="btn danger flex" style="flex:1" id="forceAdd">仍按此添加</button>
       </div>`,
      {
        onOpen: (el) => {
          el.querySelector("#forceAdd").addEventListener("click", () => {
            addTasksFromPlanner(tasks);
            closeSheet();
          });
        },
      }
    );
  }

  function addTasksFromPlanner(tasks) {
    tasks.forEach((t) =>
      Store.addSchedule({
        title: t.title,
        startTime: t.startTime,
        endTime: t.endTime,
        desc: t.desc || "",
        tag: t.tag,
        tagColor: t.tagColor,
        date: t.date || todayStr(),
        isCompleted: false,
        isFresh: true,
      })
    );
    closeSheet();
    if (tasks.length) {
      scope.mode = "day";
      scope.anchor = tasks[0].date || todayStr();
    }
    navigate(0);
    toast(`已智能添加 ${tasks.length} 项日程 ✨`, "ok");
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
          <div class="sch-main"><div class="sch-title" style="font-size:13px">${t.color}</div></div>
          ${def ? '<span class="muted" style="font-size:11px">内置</span>' : `<button class="sch-del" data-act="del-cat" data-tag="${esc(t.tag)}">${svg("trash")}</button>`}
        </div>`;
      })
      .join("");
    openSheet(
      `<div class="sheet-head"><div class="h">分类管理</div><button class="x" data-close>${svg("close")}</button></div>
       <div class="card-sub">内置分类不可删除，自定义分类可移除（不会影响已有日程的显示颜色）。</div>
       <div class="mt3">${items}</div>`
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
       <div id="reportBody" class="report-body"><span class="typing"><i></i><i></i><i></i></span> AI 正在生成你的${label}总结…</div>
       <button class="btn block mt3 hide" id="closeReport" data-close>关闭</button>`,
      {
        onOpen: (el) => {
          const body = el.querySelector("#reportBody");
          const closeBtn = el.querySelector("#closeReport");
          const finish = (text) => {
            if (!el.isConnected) return; // 用户已关闭，避免写入已销毁节点
            body.innerHTML = `<div>${esc(text).replace(/\n/g, "<br>")}</div>`;
            closeBtn.classList.remove("hide");
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
              `请为「${label}」写一份简短温暖的时间日报。今天日期：${todayStr()}。\n` +
              `以下是用户「${label}」严格全部 ${scoped.length} 个日程（${withDate ? "日期 " : ""}时间 事项 状态 /分类）：\n${rows || "（该时间段暂无日程）"}\n` +
              `【硬性要求】必须完全基于上述真实日程写作，严禁臆造任何未列出的日程、数字或完成情况；若只有 1 个日程，就围绕这一个事项本身展开，不要谈"多任务协调/分类失衡"。\n` +
              `请输出：一句话总评；2-3 条亮点或发现；1 条具体的改进建议。全文 150 字以内，短段落，语气自然，不要用夸张赞美。`;
            callLLM(
              [
                { role: "system", content: "你是严谨又温暖的私人时间管理日报助手。" },
                { role: "user", content: prompt },
              ],
              { temperature: 0.7, maxTokens: 800, timeoutMs: 45000 }
            )
              .then((text) => finish(text))
              .catch((err) => {
                toast("AI 生成失败，已切换离线总结", "warn");
                finish(genOfflineReport(stats));
              });
          } else {
            setTimeout(() => finish(genOfflineReport(stats)), 900);
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
      body = `<div class="report-body"><div id="adviceDetailTxt">${esc(advice).replace(/\n/g, "<br>")}</div></div>
        <button class="btn block mt3" data-act="gen-report">${svg("sparkle")} 生成完整日报</button>`;
    }
    const sheetEl = openSheet(
      `<div class="sheet-head"><div class="h">${title}</div><button class="x" data-close>${svg("close")}</button></div>
       <div class="mt1">${body}</div>`
    );
    // AI 优化建议详情：异步升级为模型生成的真实洞察（与首页同源缓存）
    if (key === "advice" && apiReady()) {
      genInsight(stats).then((text) => {
        const el = sheetEl && sheetEl.querySelector("#adviceDetailTxt");
        if (el && el.isConnected) el.textContent = text;
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
  function scheduleReminder(it) {
    if (!it || !it.remind) return;
    if ((it.date || todayStr()) !== todayStr()) return;
    const [h, m] = it.startTime.split(":").map(Number);
    const target = new Date();
    target.setHours(h, m, 0, 0);
    target.setMinutes(target.getMinutes() - (it.remindOffset || 10));
    const diff = target.getTime() - Date.now();
    if (diff <= 0 || diff > 24 * 3600 * 1000) return;
    setTimeout(() => {
      const msg = `「${it.title}」将在 ${it.remindOffset} 分钟后开始（${it.startTime}）`;
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification("TimeAgent 提醒", { body: msg });
        } catch (e) {}
      }
      toast(msg, "ok");
    }, diff);
  }

  function initReminders() {
    Store.state.schedule.forEach((it) => scheduleReminder(it));
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
     数据备份 / 导入 / 清空（逻辑与字段同 Store，便于回迁鸿蒙文件沙箱）
     ============================================================ */
  function downloadJSON(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function openBackup() {
    const itemCount = Store.state.schedule.length;
    openSheet(
      `<div class="sheet-head"><div class="h">数据备份</div><button class="x" data-close>${svg("close")}</button></div>
       <div class="mt1">
         <div class="card-sub">当前共 ${itemCount} 条日程。导出为 JSON 文件可保存到本地或换设备恢复；导入会覆盖当前日程数据。</div>
         <button class="btn block mt2" id="bkExport">${svg("save")} 导出备份（JSON）</button>
         <div class="mt2">
           <label class="btn block soft" style="display:block;text-align:center;cursor:pointer">${svg("folder")} 导入备份
             <input type="file" id="bkImport" accept="application/json,.json" style="display:none" />
           </label>
         </div>
         <div class="divider"></div>
         <button class="btn block ghost danger" id="bkClear">${svg("trash")} 清空全部日程</button>
       </div>`,
      {
        onOpen: (el) => {
          el.querySelector("#bkExport").addEventListener("click", () => {
            downloadJSON(`timeagent-backup-${todayStr()}.json`, { schedule: Store.state.schedule, customTags: Store.state.customTags, prefs: Store.state.prefs });
            toast("已导出备份文件", "ok");
          });
          el.querySelector("#bkImport").addEventListener("change", (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const data = JSON.parse(reader.result);
                if (!data || !Array.isArray(data.schedule)) throw new Error("格式不正确");
                Store.state.schedule = data.schedule
                  .filter((i) => i && i.title != null)
                  .map((i) => Object.assign({ date: todayStr(), isCompleted: false, isFresh: false, desc: "", repeat: "none", remind: false, remindOffset: 10, doneDates: [] }, i));
                if (Array.isArray(data.customTags)) Store.state.customTags = data.customTags;
                if (data.prefs) Store.state.prefs = Object.assign({ defaultView: "day", freshHighlight: true }, data.prefs);
                Store.notify();
                initReminders();
                closeSheet();
                renderCurrent();
                toast(`已导入 ${Store.state.schedule.length} 条日程`, "ok");
              } catch (err) {
                toast("导入失败：文件格式不正确", "err");
              }
            };
            reader.readAsText(file);
          });
          el.querySelector("#bkClear").addEventListener("click", () => {
            openSheet(
              `<div class="sheet-head"><div class="h">确认清空</div><button class="x" data-close>${svg("close")}</button></div>
               <div class="mt1"><div class="card-sub">将删除全部 ${itemCount} 条日程，此操作不可撤销。确定要继续吗？</div>
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
        },
      }
    );
  }

  /* ============================================================
     AI 对话页（全屏浮层 + 离线助手）
     ============================================================ */
  let chatDraft = null;
  function openChat() {
    const layer = document.createElement("div");
    layer.id = "chatLayer";
    layer.style.cssText =
      "position:absolute;inset:0;z-index:40;background:var(--bg-1);display:flex;flex-direction:column;animation:pageIn .3s ease";
    layer.innerHTML = `<div class="head" style="padding:12px 16px;margin:0;background:var(--surface-solid);border-bottom:1px solid var(--line)">
        <button class="icon-btn" id="chatBack">${svg("back")}</button>
        <div class="title" style="font-size:17px">AI 时间管家</div>
        <div class="spacer"></div>
        <span class="tag" id="chatModeTag" style="background:${apiReady() ? "var(--ok-soft, #E8F5E9)" : "var(--primary-soft)"};color:${apiReady() ? "var(--ok, #2E7D32)" : "var(--primary-strong)"}">${apiReady() ? "AI 在线" : "离线助手"}</span>
      </div>
      <div id="chatList" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px"></div>
      <div style="padding:12px 16px;background:var(--surface-solid);border-top:1px solid var(--line);display:flex;gap:8px">
        <input class="ai-input" id="chatInput" placeholder="试试「帮我加个明早背单词1小时」" style="flex:1" />
        <button class="btn" id="chatSend" style="width:54px;height:46px;padding:0">${svg("send")}</button>
      </div>`;
    $("#phone").appendChild(layer);
    const list = layer.querySelector("#chatList");
    const input = layer.querySelector("#chatInput");
    const send = layer.querySelector("#chatSend");

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
    function sendMsg() {
      const text = input.value.trim();
      if (!text) return;
      pushMsg({ type: "text", content: text, isUser: true });
      input.value = "";
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
                  content: `你是 TimeAgent 智能时间管家，用简洁友好的中文回答。今天日期：${todayStr()}。
用户近期真实日程如下，回答日程相关问题时必须基于它，严禁臆造未列出的日程或数字：
${scheduleContext(3)}
你可以帮用户添加/删除/打卡日程、查询安排、查询空闲时间，也可以闲聊。若用户要求安排日程（含事项和时间），先给一句简短确认，然后在回复末尾输出一行排期数据：
【排期】{"tasks":[{"title":"日程名","startTime":"HH:MM","endTime":"HH:MM","tag":"学习","desc":"可选"}]}【/排期】
规则：时间用 24 小时制；tag 只能从 [学习,工作,运动,饮食,休息,社交,其他] 中选一个；结束时间未说则按常见时长合理推断；日期默认今天，用户说"明天/后天"要换算成具体日期；若新任务与上面已有日程时间重叠，请自动微调 15-30 分钟避开冲突。没有排期需求时不要输出【排期】标记。
若用户要求删除/标记完成/改期已有日程，则在回复末尾单独输出一行：
【操作】{"type":"delete|done|move","title":"日程名","startTime":"HH:MM"}【/操作】
（delete=删除，done=打卡完成，move=改期需给新 startTime；按上面日程中的标题匹配，【操作】与【排期】不要同时输出，没有匹配的日程时也要输出该行）。`,
                },
                ...history,
                { role: "user", content: text },
              ],
              { temperature: 0.5, maxTokens: 1200, timeoutMs: 60000 }
            );
            // 解析 AI 排期数据：带【排期】标记则直接落库
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
              if (cleanText) pushMsg(mkMsg("text", cleanText));
              const conflict = checkConflicts(tasks);
              tasks.forEach((t) =>
                Store.addSchedule({
                  title: t.title,
                  startTime: t.startTime,
                  endTime: t.endTime,
                  desc: t.desc,
                  tag: t.tag,
                  tagColor: t.tagColor,
                  date: t.date,
                  isCompleted: false,
                  isFresh: true,
                })
              );
              tasks.forEach((t) =>
                pushMsg({
                  type: "card",
                  isUser: false,
                  content: `已为你安排「${t.title}」📌`,
                  cardData: { title: t.title, time: `${t.startTime} ~ ${t.endTime}`, tag: t.tag, color: t.tagColor, date: t.date },
                })
              );
              toast(conflict ? `已添加 ${tasks.length} 项日程（部分与已有日程时间重叠）⚠️` : `已智能添加 ${tasks.length} 项日程 ✨`, conflict ? "warn" : "ok");
              return;
            }
            // 解析 AI 操作数据：删除 / 打卡 / 改期（在线 agent 直接操作真实日程）
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
              ops.forEach((op) => {
                const t = op && op.title ? String(op.title).trim() : "";
                if (!t) return;
                const item = Store.state.schedule.find((i) => i.title.includes(t) || t.includes(i.title));
                if (op.type === "delete") {
                  if (item) {
                    Store.removeSchedule(item.id);
                    results.push(`已删除「${item.title}」`);
                  } else results.push(`没找到「${t}」`);
                } else if (op.type === "done") {
                  if (item) {
                    Store.toggleSchedule(item.id, item.date);
                    results.push(`已把「${item.title}」标记为${isDone(item) ? "未完成" : "已完成"}`);
                  } else results.push(`没找到「${t}」`);
                } else if (op.type === "move") {
                  const ns = normTime(op.startTime);
                  if (item && ns) {
                    const durMin = Math.max(0, Math.round((parseHM(item.endTime) - parseHM(item.startTime)) * 60));
                    const [h, m] = ns.split(":").map(Number);
                    const endMin = h * 60 + m + durMin;
                    const ne = `${pad(Math.floor(endMin / 60) % 24)}:${pad(endMin % 60)}`;
                    Store.updateSchedule(item.id, { startTime: ns, endTime: ne });
                    results.push(`已把「${item.title}」改到 ${ns}~${ne}（保持原时长）`);
                  } else results.push(`没找到「${t}」或新时间无效`);
                }
              });
              const cleanOps = replyText.replace(/【操作】[\s\S]*?【\/操作】/g, "").trim();
              if (cleanOps) pushMsg(mkMsg("text", cleanOps));
              pushMsg(mkMsg("text", results.join("\n")));
              toast("已按你的指令更新日程 ✅", "ok");
              renderCurrent();
              return;
            }
            pushMsg(mkMsg("text", replyText));
            return;
          } catch (err) {
            console.warn("在线对话失败，回退本地助手：", err);
            pushMsg(mkMsg("text", `（在线助手暂时不可用，已切换本地助手）`));
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
    const d = document.createElement("div");
    if (m.type === "card" && m.cardData) {
      d.style.cssText = "align-self:flex-start;max-width:80%;background:var(--surface-solid);border:1px solid var(--line);border-radius:14px;padding:12px;box-shadow:var(--shadow-sm)";
      const c = m.cardData;
      d.innerHTML = `<div style="font-size:11px;color:var(--t3);margin-bottom:6px">AI</div>
        <div style="font-weight:700;margin-bottom:6px">${esc(c.title)}</div>
        <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--t2)">
          ${c.date ? `<span>📅 ${humanDateLabel(c.date)}</span>` : ""}
          <span>🕒 ${esc(c.time)}</span>
          <span class="tag" style="background:${c.color};color:${contrastText(c.color)}">${esc(c.tag)}</span></div>`;
    } else {
      const isU = m.isUser;
      d.style.cssText = `align-self:${isU ? "flex-end" : "flex-start"};max-width:78%;background:${isU ? "var(--primary)" : "var(--surface-solid)"};color:${isU ? "#fff" : "var(--t1)"};border:1px solid ${isU ? "transparent" : "var(--line)"};border-radius:14px;padding:11px 13px;font-size:14px;line-height:1.6;box-shadow:var(--shadow-sm);white-space:pre-wrap;word-break:break-word`;
      d.innerHTML = (isU ? "" : '<div style="font-size:11px;color:var(--t3);margin-bottom:5px">AI</div>') + esc(m.content);
    }
    return d;
  }

  // 离线对话助手：解析意图 → 增删改查 + 自然语言回复
  function localChatReply(text) {
    const lower = text;
    // 删除
    if (/删除|去掉|取消/.test(lower) && !/添加|新建|安排/.test(lower)) {
      const name = lower.replace(/^(请|帮|我)?(删除|去掉|取消)/, "").replace(/[。.，,吗？?\s]/g, "").trim();
      const idx = Store.state.schedule.findIndex((i) => i.title.includes(name) || name.includes(i.title));
      if (idx >= 0) {
        const removed = Store.removeSchedule(Store.state.schedule[idx].id);
        return mkMsg("text", `已删除日程「${removed.title}」（${removed.startTime}~${removed.endTime}）。`);
      }
      return mkMsg("text", "没有找到匹配的日程，可以告诉我更具体的关键词，例如「删除跑步」。");
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
        Store.toggleSchedule(item.id, item.date);
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
        Store.updateSchedule(item.id, { startTime: ns, endTime: ne });
        return mkMsg("text", `已把「${item.title}」从 ${item.startTime}~${item.endTime} 改到 ${ns}~${ne}（保持原时长）。`);
      }
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
  function mkMsg(type, content, cardData) {
    return { type, isUser: false, content, cardData };
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
      case "open-planner":
        openPlanner("");
        break;
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
      case "toggle":
        Store.toggleSchedule(id, date);
        renderCurrent();
        break;
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
    renderCurrent();
    toast(`已删除「${removed.title}」`, "warn", {
      label: "撤销",
      onClick: () => {
        Store.addSchedule(Object.assign({}, removed, { id: uid(), isFresh: false }));
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
    // 跨页面刷新联动：store 变化且不在当前页时，回到首页刷新角标
    Store.subscribe(() => {
      $$(".tab-item", $("#tabbar")).forEach((t, i) => t.classList.toggle("has-badge", i === 0 && hasFresh()));
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
