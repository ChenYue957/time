/* ============================================================
   script.js — 时间板 | ChenYue 脚本
   重构自 index(3).html，对齐 chenyue.art 主站风格
   ============================================================ */


/* ===== 控制台彩蛋 ===== */

console.log('%c2026 chenyue.top  chenyue.art — 时间板', 'background-color: #6c8cff; color: white; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%c   ⏰ TimeBoard', 'color: #6c8cff; font-size: 16px;');


/* ===== 通用工具函数 ===== */

/**
 * 补零
 * @param {number} n - 数字
 * @returns {string} 两位字符串
 */
const pad = (n) => String(n).padStart(2, '0');

/** 星期映射 */
const WKS = ['日', '一', '二', '三', '四', '五', '六'];

/**
 * 计算一年中的第几周
 * @param {Date} d - 日期对象
 * @returns {number} 周数
 */
function weekOfYear(d) {
    const j = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - j) / 864e5 + j.getDay() + 1) / 7);
}

/**
 * 格式化时间戳为 HH:MM
 * @param {number} ts - 时间戳
 * @returns {string} 格式化后的时间
 */
function fmtTime(ts) {
    const d = new Date(ts);
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
}

/**
 * 格式化毫秒为倒计时 HH:MM:SS
 * @param {number} ms - 毫秒数
 * @returns {string} 格式化后的倒计时
 */
function fmtCD(ms) {
    if (ms <= 0) return '00:00:00';
    const s = Math.floor(ms / 1000);
    return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor((s % 3600) / 60)) + ':' + pad(s % 60);
}

/**
 * 设置 Cookie
 * @param {string} name - Cookie 名称
 * @param {string} value - Cookie 值
 * @param {number} days - 过期天数
 */
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

/**
 * 获取 Cookie
 * @param {string} name - Cookie 名称
 * @returns {string|null} Cookie 值
 */
function getCookie(name) {
    var nameEQ = name + "=";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) == 0) {
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    return null;
}

/**
 * 切换指定元素的 class
 * @param {string} selector - CSS 选择器
 * @param {string} className - 要切换的类名
 */
function toggleClass(selector, className) {
    var elements = document.querySelectorAll(selector);
    elements.forEach(function (element) {
        element.classList.toggle(className);
    });
}


/* ===== 域名检测 ===== */

const host = location.hostname.toLowerCase();
let domainType = 'top';
let domainDisplay = 'time.chenyue.top';
let authorURL = 'https://chenyue.top';
let authorLabel = '🌐 访问 chenyue.top';

if (host.includes('chenyue.art')) {
    domainType = 'art';
    domainDisplay = 'time.chenyue.art';
    authorURL = 'https://chenyue.art:957/';
    authorLabel = '🌐 访问 chenyue.art';
} else if (host.includes('github')) {
    domainType = 'github';
    domainDisplay = 'time.chenyue.top';
    authorURL = 'https://chenyue957.github.io/home/';
    authorLabel = '🌐 访问 GitHub 主页';
}


/* ===== 主题切换（复用主站逻辑） ===== */

/**
 * 获取系统配色偏好
 * @returns {string} "Dark" 或 "Blue"
 */
function getSystemTheme() {
    try {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return "Dark";
        }
    } catch (e) { /* 静默忽略 */ }
    return "Blue";
}

/**
 * 切换主题
 * @param {string} theme - "Dark" 或 "Blue"
 */
function changeTheme(theme) {
    const htmlTag = document.querySelector('html');
    if (theme == "Dark") {
        htmlTag.dataset.theme = 'dack';
    } else {
        htmlTag.dataset.theme = '';
    }
    setCookie("themeState", theme, 365);
}

/**
 * 切换主题（toggle）
 */
function toggleTheme() {
    const current = getCookie("themeState") || getSystemTheme();
    changeTheme(current === "Dark" ? "Blue" : "Dark");
    // 刷新主题按钮图标
    updateThemeIcon();
}

/**
 * 更新主题切换按钮图标
 */
function updateThemeIcon() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const current = getCookie("themeState") || getSystemTheme();
    btn.textContent = current === "Dark" ? '☀️' : '🌙';
}


/* ===== DOMContentLoaded 主初始化 ===== */

document.addEventListener('DOMContentLoaded', function () {

    /* ----- 初始化主题 ----- */
    var savedTheme = getCookie("themeState");
    var themeState;
    if (savedTheme === "Dark" || savedTheme === "Blue") {
        themeState = savedTheme;
    } else {
        themeState = getSystemTheme();
    }
    changeTheme(themeState);
    updateThemeIcon();


    /* ----- 域名显示 ----- */
    var siteDomainEl = document.getElementById('site-domain');
    if (siteDomainEl) siteDomainEl.textContent = domainDisplay;

    var authorLinkEl = document.getElementById('author-link');
    if (authorLinkEl) {
        authorLinkEl.href = authorURL;
        authorLinkEl.textContent = authorLabel;
    }

    // 节点高亮
    var nodeMap = { top: 'node-top', art: 'node-art', github: 'node-gh' };
    var currentNodeEl = document.getElementById(nodeMap[domainType]);
    if (currentNodeEl) currentNodeEl.classList.add('current');


    /* ----- 侧边栏导航切换 ----- */
    document.querySelectorAll('.side-nav-item[data-tab]').forEach(function (item) {
        item.addEventListener('click', function () {
            // 切换 active
            document.querySelectorAll('.side-nav-item').forEach(function (t) {
                t.classList.remove('active');
            });
            item.classList.add('active');
            // 切换面板
            document.querySelectorAll('.panel').forEach(function (p) {
                p.classList.remove('active');
            });
            var target = document.getElementById('p-' + item.dataset.tab);
            if (target) target.classList.add('active');
        });
    });

    // 作者按钮
    var navAuthor = document.getElementById('nav-author');
    if (navAuthor) {
        navAuthor.addEventListener('click', function () {
            document.querySelectorAll('.side-nav-item').forEach(function (t) {
                t.classList.remove('active');
            });
            navAuthor.classList.add('active');
            document.querySelectorAll('.panel').forEach(function (p) {
                p.classList.remove('active');
            });
            document.getElementById('p-author').classList.add('active');
        });
    }


    /* ----- 节点选择弹窗 ----- */
    var headerLeft = document.getElementById('header-left');
    if (headerLeft) {
        headerLeft.addEventListener('click', function (e) {
            e.stopPropagation();
            var popup = document.getElementById('node-popup');
            if (popup) popup.classList.toggle('show');
        });
    }

    document.addEventListener('click', function (e) {
        var headerLeft = document.getElementById('header-left');
        var popup = document.getElementById('node-popup');
        if (headerLeft && popup && !headerLeft.contains(e.target)) {
            popup.classList.remove('show');
        }
    });


    /* ----- 页面加载动画 ----- */
    var pageLoading = document.querySelector("#PageLoading");
    if (pageLoading) {
        requestAnimationFrame(function () {
            pageLoading.style.opacity = '0';
            setTimeout(function () {
                pageLoading.style.display = 'none';
            }, 500);
        });
    }


    /* ----- 侧边栏遮罩点击关闭（移动端） ----- */
    var leftPanel = document.querySelector('.left');
    if (leftPanel) {
        leftPanel.addEventListener('click', function (e) {
            if (leftPanel.classList.contains('left-open') && !e.target.closest('.left-main')) {
                left();
            });
        });
    }

}); // DOMContentLoaded 结束


/* ===== 侧边栏开关 ===== */

/**
 * 切换侧边栏显示/隐藏（移动端）
 */
function left() {
    toggleClass(".left-main", "left-main-open");
    toggleClass(".left", "left-open");
}


/* ===== 世界时钟 ===== */

const WORLDTZ = [
    { tz: 'Asia/Shanghai',    city: '北京',  flag: '🇨🇳' },
    { tz: 'Asia/Tokyo',       city: '东京',  flag: '🇯🇵' },
    { tz: 'Europe/London',    city: '伦敦',  flag: '🇬🇧' },
    { tz: 'America/New_York', city: '纽约',  flag: '🇺🇸' },
    { tz: 'Europe/Paris',     city: '巴黎',  flag: '🇫🇷' },
    { tz: 'Australia/Sydney', city: '悉尼',  flag: '🇦🇺' },
];

let topTZ = null;

/**
 * 构建世界时钟网格
 */
function buildWorldClocks() {
    const localTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const container = document.getElementById('world-clocks');
    if (!container) return;

    let html = '';
    for (const z of WORLDTZ) {
        const isLocal = z.tz === localTZ;
        const isTop = z.tz === topTZ;
        const cls = isTop ? 'top-tz' : (isLocal ? 'local-tz' : '');
        html += '<div class="wc-grid-item ' + cls + '" data-tz="' + z.tz + '" onclick="pinTZ(\'' + z.tz + '\')">' +
            '<div class="wc-grid-city">' + z.flag + ' ' + z.city + '</div>' +
            '<div class="wc-grid-time" data-tz="' + z.tz + '">--:--:--</div>' +
            '<div class="wc-grid-date" data-tz="' + z.tz + '">--</div>' +
            '</div>';
    }
    container.innerHTML = html;

    // 同步侧边栏世界时钟
    buildSideWorldClocks();
}

/**
 * 构建侧边栏世界时钟列表
 */
function buildSideWorldClocks() {
    const localTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const container = document.getElementById('side-world-clocks');
    if (!container) return;

    let html = '';
    for (const z of WORLDTZ) {
        const isLocal = z.tz === localTZ;
        const isTop = z.tz === topTZ;
        const cls = isTop ? 'top-tz' : (isLocal ? 'local-tz' : '');
        html += '<div class="wc-item ' + cls + '" data-tz="' + z.tz + '" onclick="pinTZ(\'' + z.tz + '\')">' +
            '<div class="wc-item-left"><span class="wc-flag">' + z.flag + '</span><span class="wc-city">' + z.city + '</span></div>' +
            '<span class="wc-time" data-tz="' + z.tz + '">--:--:--</span>' +
            '</div>';
    }
    container.innerHTML = html;
}

/**
 * 置顶/取消置顶时区
 * @param {string} tz - 时区标识
 */
function pinTZ(tz) {
    topTZ = (topTZ === tz) ? null : tz;
    buildWorldClocks();
    tickWorldClocks();
}

/**
 * 更新世界时钟显示
 */
function tickWorldClocks() {
    document.querySelectorAll('.wc-grid-time[data-tz]').forEach(function (el) {
        try {
            el.textContent = new Date().toLocaleTimeString('zh-CN', { timeZone: el.dataset.tz, hour12: false });
        } catch (e) { el.textContent = '--:--:--'; }
    });
    document.querySelectorAll('.wc-grid-date[data-tz]').forEach(function (el) {
        try {
            el.textContent = new Date().toLocaleDateString('zh-CN', { timeZone: el.dataset.tz, month: 'numeric', day: 'numeric', weekday: 'short' });
        } catch (e) { el.textContent = '--'; }
    });
    // 侧边栏
    document.querySelectorAll('.wc-time[data-tz]').forEach(function (el) {
        try {
            el.textContent = new Date().toLocaleTimeString('zh-CN', { timeZone: el.dataset.tz, hour12: false });
        } catch (e) { el.textContent = '--:--:--'; }
    });
}

buildWorldClocks();
setInterval(tickWorldClocks, 1000);
tickWorldClocks();


/* ===== 时间面板 ===== */

/**
 * 更新主时钟
 */
function tick() {
    const d = new Date();
    var clockEl = document.getElementById('clock');
    if (clockEl) {
        clockEl.innerHTML =
            pad(d.getHours()) + ':' + pad(d.getMinutes()) +
            '<span class="sec">:' + pad(d.getSeconds()) + '</span>' +
            '<span class="ms">.' + pad(Math.floor(d.getMilliseconds() / 10)) + '</span>';
    }

    var dateEl = document.getElementById('date');
    if (dateEl) {
        dateEl.textContent =
            d.getFullYear() + '年' + pad(d.getMonth() + 1) + '月' + pad(d.getDate()) + '日 星期' + WKS[d.getDay()];
    }

    var tzEl = document.getElementById('tz');
    if (tzEl) tzEl.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;

    var wkEl = document.getElementById('wk');
    if (wkEl) wkEl.textContent = weekOfYear(d);

    var wdEl = document.getElementById('wd');
    if (wdEl) wdEl.textContent = '星期' + WKS[d.getDay()];

    // 侧边栏时钟预览
    var sideClock = document.getElementById('side-clock');
    if (sideClock) {
        sideClock.innerHTML = pad(d.getHours()) + ':' + pad(d.getMinutes()) +
            '<span class="sec">:' + pad(d.getSeconds()) + '</span>';
    }
    var sideDate = document.getElementById('side-date');
    if (sideDate) {
        sideDate.textContent = pad(d.getMonth() + 1) + '月' + pad(d.getDate()) + '日 星期' + WKS[d.getDay()];
    }
}
setInterval(tick, 50);
tick();


/* ===== 时差同步（阿里云 NTP） ===== */

let offset = null;

/**
 * 从服务器获取时间偏移量
 * @returns {Promise<number|null>} 偏移毫秒数
 */
async function fetchOffset() {
    try {
        const t0 = performance.now();
        const r = await fetch('https://acs.m.taobao.com/gw/mtop.common.getTimestamp/');
        const t1 = performance.now();
        if (r.ok) {
            const j = await r.json();
            const serverMs = parseInt(j.data.t);
            if (!isNaN(serverMs)) return serverMs - Date.now() + (t1 - t0) / 2;
        }
    } catch (e) { /* 静默忽略 */ }

    try {
        const t0 = performance.now();
        const r = await fetch('https://worldtimeapi.org/api/timezone/Asia/Shanghai');
        const t1 = performance.now();
        if (r.ok) {
            const j = await r.json();
            return new Date(j.datetime).getTime() - Date.now() + (t1 - t0) / 2;
        }
    } catch (e) { /* 静默忽略 */ }

    return null;
}

/**
 * 同步时间偏移
 */
async function sync() {
    var dsEl = document.getElementById('ds');
    var dnEl = document.getElementById('dn');
    if (dsEl) dsEl.textContent = '正在同步…';
    if (dnEl) dnEl.textContent = '';

    const r1 = await fetchOffset();
    if (r1 !== null) {
        offset = r1;
        if (dsEl) dsEl.textContent = '已同步（阿里云）';
    } else {
        const now = new Date();
        offset = (now.getTime() + now.getTimezoneOffset() * 6e4 + 8 * 36e5) - now.getTime();
        if (dsEl) dsEl.textContent = '无法连接服务器，使用北京时间参考';
        if (dnEl) dnEl.textContent = '偏移量包含时区差异，仅供参考';
    }
    setTimeout(sync, 6e4);
}

/**
 * 更新时差面板
 */
function tickDiff() {
    if (offset === null) return;
    const now = new Date();
    const std = new Date(Date.now() + offset);
    const ms = Math.round(offset);

    var dtD = document.getElementById('dt-d');
    var dtN = document.getElementById('dt-n');
    var dtO = document.getElementById('dt-o');
    var dvEl = document.getElementById('dv');

    if (dtD) dtD.textContent = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
    if (dtN) dtN.textContent = pad(std.getHours()) + ':' + pad(std.getMinutes()) + ':' + pad(std.getSeconds());
    if (dtO) dtO.textContent = (ms >= 0 ? '+' : '') + ms + ' ms';

    if (dvEl && !dvEl.dataset.fallback) {
        const abs = Math.abs(ms);
        if (abs < 100) {
            dvEl.textContent = '✓ 已同步';
            dvEl.className = 'diff-big ok';
        } else if (abs < 1e3) {
            dvEl.textContent = (ms > 0 ? '+' : '') + abs + ' ms';
            dvEl.className = 'diff-big warn';
        } else {
            dvEl.textContent = (ms > 0 ? '+' : '') + (ms / 1e3).toFixed(1) + ' s';
            dvEl.className = 'diff-big bad';
        }
    }
}
setInterval(tickDiff, 100);
sync();


/* ===== 考试看板 ===== */

const ICONS = { 语文: '📖', 数学: '🔢', 英语: '🔤', 物理: '⚛️', 化学: '🧪', 生物: '🧬', 政治: '📜', 历史: '🏛️', 地理: '🌍' };
const DURS = { 语文: 150, 数学: 120, 英语: 120, 物理: 75, 化学: 75, 生物: 75, 政治: 75, 历史: 75, 地理: 75 };

let exams = JSON.parse(localStorage.getItem('cy_exams') || '[]');
let selSub = '';
let fsId = null, fsIv = null;
let editMode = false;

/**
 * 保存考试数据到 localStorage
 */
function save() {
    localStorage.setItem('cy_exams', JSON.stringify(exams));
}

/**
 * 打开添加/编辑弹窗
 * @param {number|string} [editId] - 编辑模式下的考试 ID
 */
function openModal(editId) {
    editMode = !!editId;
    document.getElementById('modal').classList.add('open');
    document.getElementById('modal-title').textContent = editMode ? '编辑考试' : '添加考试';
    document.getElementById('edit-id').value = editId || '';

    selSub = '';
    document.querySelectorAll('.subj-btn').forEach(function (b) { b.classList.remove('sel'); });
    document.getElementById('inp-custom').value = '';
    document.getElementById('fg-custom-dur').style.display = 'none';

    if (editMode) {
        const ex = exams.find(function (e) { return e.id === editId; });
        if (!ex) { closeModal(); return; }
        selSub = ex.sub;
        const preset = document.querySelector('.subj-btn[data-s="' + ex.sub + '"]');
        if (preset) preset.classList.add('sel');
        else document.getElementById('inp-custom').value = ex.sub;

        const d = new Date(ex.start);
        document.getElementById('inp-start').value =
            d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());

        const durSel = document.getElementById('inp-dur');
        const opt = [...durSel.options].find(function (o) { return o.value === String(ex.dur); });
        if (opt) { durSel.value = String(ex.dur); }
        else {
            durSel.value = 'custom';
            document.getElementById('fg-custom-dur').style.display = 'block';
            document.getElementById('inp-custom-dur').value = ex.dur;
        }

        const h = ex.dur / 60;
        document.getElementById('dur-hint').textContent = '时长 ' + (h >= 1 ? (h % 1 === 0 ? h + ' 小时' : h.toFixed(1) + ' 小时') : ex.dur + ' 分钟');
    } else {
        const n = new Date();
        n.setMinutes(Math.ceil(n.getMinutes() / 5) * 5, 0, 0);
        document.getElementById('inp-start').value =
            n.getFullYear() + '-' + pad(n.getMonth() + 1) + '-' + pad(n.getDate()) + 'T' + pad(n.getHours()) + ':' + pad(n.getMinutes());
        document.getElementById('inp-dur').value = '75';
        document.getElementById('dur-hint').textContent = '默认 75 分钟';
    }
}

/**
 * 关闭弹窗
 */
function closeModal() {
    document.getElementById('modal').classList.remove('open');
    editMode = false;
}

// 科目按钮点击
document.querySelectorAll('.subj-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.subj-btn').forEach(function (b) { b.classList.remove('sel'); });
        btn.classList.add('sel');
        selSub = btn.dataset.s;
        document.getElementById('inp-custom').value = '';
        const dur = DURS[selSub] || 75;
        document.getElementById('inp-dur').value = String(dur);
        const h = dur / 60;
        document.getElementById('dur-hint').textContent = '默认 ' + (h >= 1 ? (h % 1 === 0 ? h + ' 小时' : h.toFixed(1) + ' 小时') : dur + ' 分钟');
    });
});

// 自定义科目输入
document.getElementById('inp-custom').addEventListener('focus', function () {
    this.value = '';
    document.querySelectorAll('.subj-btn').forEach(function (b) { b.classList.remove('sel'); });
    selSub = '';
    document.getElementById('inp-dur').value = '75';
    document.getElementById('dur-hint').textContent = '默认 75 分钟';
});

// 时长选择
document.getElementById('inp-dur').addEventListener('change', function () {
    if (this.value === 'custom') {
        document.getElementById('fg-custom-dur').style.display = 'block';
        document.getElementById('inp-custom-dur').focus();
    } else {
        document.getElementById('fg-custom-dur').style.display = 'none';
        const m = parseInt(this.value);
        const h = m / 60;
        document.getElementById('dur-hint').textContent = h >= 1 ? (h % 1 === 0 ? h + ' 小时' : h.toFixed(1) + ' 小时') : m + ' 分钟';
    }
});

/**
 * 获取考试时长
 * @returns {number} 分钟数
 */
function getDuration() {
    const sel = document.getElementById('inp-dur').value;
    if (sel === 'custom') {
        const v = parseInt(document.getElementById('inp-custom-dur').value);
        return (v > 0) ? v : 75;
    }
    return parseInt(sel) || 75;
}

/**
 * 确认添加/编辑考试
 */
function confirmModal() {
    const custom = document.getElementById('inp-custom').value.trim();
    const sub = custom || selSub;
    if (!sub) { alert('请选择或输入科目'); return; }
    const sv = document.getElementById('inp-start').value;
    if (!sv) { alert('请设置开始时间'); return; }
    const start = new Date(sv).getTime();
    if (isNaN(start)) { alert('时间格式无效'); return; }
    const dur = getDuration();
    const end = start + dur * 6e4;

    if (editMode) {
        const editId = parseInt(document.getElementById('edit-id').value);
        const idx = exams.findIndex(function (e) { return e.id === editId; });
        if (idx !== -1) {
            exams[idx] = Object.assign({}, exams[idx], { sub: sub, start: start, end: end, dur: dur });
        }
    } else {
        exams.push({ id: Date.now(), sub: sub, start: start, end: end, dur: dur });
    }
    exams.sort(function (a, b) { return a.start - b.start; });
    save();
    closeModal();
    render();
}

/**
 * 删除考试
 * @param {number} id - 考试 ID
 */
function removeExam(id) {
    exams = exams.filter(function (e) { return e.id !== id; });
    save();
    render();
}

/**
 * 清空所有考试
 */
function clearAll() {
    if (!exams.length) return;
    if (!confirm('确定清空所有考试？')) return;
    exams = [];
    save();
    render();
}

/**
 * 渲染考试列表
 */
function render() {
    const el = document.getElementById('exam-list');
    if (!el) return;
    const now = Date.now();
    exams = exams.filter(function (e) { return e.end > now - 36e5; });
    save();

    const hasActive = exams.some(function (e) { return (now >= e.start && now <= e.end) || e.start > now; });
    var btnFs = document.getElementById('btn-fs');
    if (btnFs) btnFs.style.display = hasActive ? '' : 'none';

    if (!exams.length) {
        el.innerHTML = '<div class="exam-empty"><div class="ico">📝</div><p>暂无考试安排，点击「添加」开始</p></div>';
        return;
    }

    let foundLive = false, foundNext = false;
    let html = '<div class="exam-list">';
    for (const ex of exams) {
        const ico = ICONS[ex.sub] || '📄';
        let cls = '', cd = '', tag = '', hint = '';

        if (now >= ex.start && now <= ex.end) {
            cls = 'live'; cd = fmtCD(ex.end - now); tag = '考试中';
            hint = '<div class="er-fs-hint">点击全屏</div>';
            foundLive = true;
        } else if (now < ex.start) {
            if (!foundLive && !foundNext) {
                cls = 'upcoming'; tag = '即将开始';
                hint = '<div class="er-fs-hint">点击全屏</div>';
                foundNext = true;
            } else { cls = ''; tag = '等待'; }
            cd = fmtCD(ex.start - now);
        } else {
            cls = 'ended'; cd = '已结束'; tag = '';
        }

        const hrs = ex.dur / 60;
        const durTxt = hrs >= 1 ? (hrs % 1 === 0 ? hrs + 'h' : hrs.toFixed(1) + 'h') : ex.dur + 'min';
        const click = (cls === 'live' || cls === 'upcoming') ? 'onclick="openFS(' + ex.id + ')"' : '';

        html += '<div class="exam-row ' + cls + '" ' + click + '>' +
            '<div class="er-left">' +
            '<div class="er-ico">' + ico + '</div>' +
            '<div>' +
            '<div class="er-name">' + ex.sub + '</div>' +
            '<div class="er-time">' + fmtTime(ex.start) + '-' + fmtTime(ex.end) + ' · ' + durTxt + '</div>' +
            '</div></div>' +
            '<div class="er-right"><div>' +
            '<div class="er-cd">' + cd + '</div>' +
            '<div class="er-tag">' + tag + '</div>' +
            hint +
            '</div>' +
            '<button class="btn-icon" onclick="event.stopPropagation();openModal(' + ex.id + ')" title="编辑">✏️</button>' +
            '<button class="btn-icon" onclick="event.stopPropagation();removeExam(' + ex.id + ')" title="删除">✕</button>' +
            '</div></div>';
    }
    html += '</div>';
    el.innerHTML = html;
}
setInterval(render, 1e3);
render();


/* ===== 全屏模式 ===== */

let fsRunning = false;

/**
 * 打开全屏考试模式
 * @param {number} id - 考试 ID
 */
function openFS(id) {
    fsId = id;
    fsRunning = true;
    document.getElementById('fs').classList.add('show');
    document.body.style.overflow = 'hidden';
    const firstEx = exams.find(function (e) { return e.id === id; });
    if (firstEx) document.getElementById('fs-bar-sub').textContent = firstEx.sub;
    tickFS();
    if (fsIv) clearInterval(fsIv);
    fsIv = setInterval(tickFS, 200);
}

/**
 * 打开最近的考试全屏
 */
function openNearestFS() {
    const now = Date.now();
    let target = exams.find(function (e) { return now >= e.start && now <= e.end; });
    if (!target) target = exams.find(function (e) { return e.start > now; });
    if (target) openFS(target.id);
}

/**
 * 关闭全屏模式
 */
function closeFS() {
    fsId = null;
    fsRunning = false;
    document.getElementById('fs').classList.remove('show');
    document.body.style.overflow = '';
    if (fsIv) { clearInterval(fsIv); fsIv = null; }
}

/**
 * 全屏模式 tick
 */
function tickFS() {
    if (!fsRunning || fsId === null) return;

    let ex = exams.find(function (e) { return e.id == fsId; });

    // 自动切换到下一场
    if (ex && Date.now() > ex.end) {
        const next = exams.find(function (e) { return e.start > ex.end; });
        if (next) { fsId = next.id; ex = next; }
    }
    if (!ex) { closeFS(); return; }

    const now = Date.now();

    try {
        document.getElementById('fs-ico').textContent = ICONS[ex.sub] || '📄';
        document.getElementById('fs-name').textContent = ex.sub;
        document.getElementById('fs-t1').textContent = fmtTime(ex.start);
        document.getElementById('fs-t2').textContent = fmtTime(ex.end);

        const nd = new Date();
        document.getElementById('fs-now').textContent = pad(nd.getHours()) + ':' + pad(nd.getMinutes()) + ':' + pad(nd.getSeconds());

        const dot = document.getElementById('fs-dot');
        const stxt = document.getElementById('fs-stxt');
        const cdEl = document.getElementById('fs-cd');
        const cdLabel = document.getElementById('fs-cd-label');

        if (now >= ex.start && now <= ex.end) {
            stxt.textContent = '考试进行中';
            dot.style.background = 'var(--accent)';
            document.querySelector('.fs-state').style.color = 'var(--accent)';
            cdLabel.textContent = '剩余时间';
            cdEl.textContent = fmtCD(ex.end - now);
            cdEl.style.color = 'var(--accent)';
        } else if (now < ex.start) {
            stxt.textContent = '距开考';
            dot.style.background = 'var(--green)';
            document.querySelector('.fs-state').style.color = 'var(--green)';
            cdLabel.textContent = '距开考';
            cdEl.textContent = fmtCD(ex.start - now);
            cdEl.style.color = 'var(--green)';
        } else {
            stxt.textContent = '已结束';
            dot.style.background = 'var(--text3)';
            document.querySelector('.fs-state').style.color = 'var(--text3)';
            cdLabel.textContent = '已结束';
            cdEl.textContent = '00:00:00';
            cdEl.style.color = 'var(--text3)';
        }

        document.getElementById('fs-bar-sub').textContent = ex.sub;
    } catch (e) { /* 元素未找到，跳过 */ }

    // 渲染考试安排列表
    try {
        let shtml = '';
        for (const item of exams) {
            const ico = ICONS[item.sub] || '📄';
            let cls = '', cd = '';
            if (now >= item.start && now <= item.end) {
                cls = 'active'; cd = '剩余 ' + fmtCD(item.end - now);
            } else if (now < item.start) {
                cls = ''; cd = '倒计时 ' + fmtCD(item.start - now);
            } else {
                cls = 'done'; cd = '已结束';
            }
            const isActive = item.id == fsId;
            shtml += '<div class="fs-sched-item ' + (isActive ? 'active' : '') + ' ' + cls + '">' +
                '<div class="fs-sl"><span>' + ico + '</span><span class="sn">' + item.sub + '</span></div>' +
                '<div class="fs-sr">' + fmtTime(item.start) + ' - ' + fmtTime(item.end) + '　' + cd + '</div>' +
                '</div>';
        }
        document.getElementById('fs-sched-list').innerHTML = shtml;
    } catch (e) { /* 跳过 */ }
}

// 全屏点击空白关闭
document.getElementById('fs-body').addEventListener('click', function (e) {
    if (e.target === document.getElementById('fs-body')) closeFS();
});

// ESC 键关闭
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        if (fsId !== null) closeFS();
        else if (document.getElementById('modal').classList.contains('open')) closeModal();
    }
});

// 弹窗点击外部关闭
document.getElementById('modal').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
});
