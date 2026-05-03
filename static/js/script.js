/* ============================================
   script.js - 时间看板 JavaScript
   ============================================ */

/* ===== 工具函数 ===== */
const pad = n => String(n).padStart(2, '0');
const WKS = ['日','一','二','三','四','五','六'];

function weekOfYear(d) {
  const j = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - j) / 864e5 + j.getDay() + 1) / 7);
}

function fmtTime(ts) {
  const d = new Date(ts);
  return pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function fmtCD(ms) {
  if (ms <= 0) return '00:00:00';
  const s = Math.floor(ms / 1000);
  return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor((s % 3600) / 60)) + ':' + pad(s % 60);
}

/* ===== 域名检测 ===== */
const host = location.hostname.toLowerCase();
let domainType = 'top';
let domainDisplay = 'time.chenyue.top';
let authorURL = 'https://chenyue.top';
let authorLabel = '访问主页';

if (host.includes('chenyue.art')) {
  domainType = 'art'; domainDisplay = 'time.chenyue.art';
} else if (host.includes('github')) {
  domainType = 'github'; domainDisplay = 'time.chenyue.top';
}

document.getElementById('site-domain').textContent = domainDisplay;
document.getElementById('author-link').href = authorURL;
document.getElementById('author-link').textContent = authorLabel;

const nodeMap = { top: 'node-top', art: 'node-art', github: 'node-gh' };
const currentNodeEl = document.getElementById(nodeMap[domainType]);
if (currentNodeEl) currentNodeEl.classList.add('current');

const PANEL_STORAGE_KEY = 'cy_time_panel';
function activatePanel(panelId) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const tab = document.querySelector(`.nav-tab[data-tab="${panelId}"]`);
  if (tab) tab.classList.add('active');
  else document.getElementById('nav-author').classList.add('active');
  const panel = document.getElementById('p-' + panelId);
  if (panel) panel.classList.add('active');
  localStorage.setItem(PANEL_STORAGE_KEY, panelId);
}

document.getElementById('nav-author').addEventListener('click', () => activatePanel('author'));

document.querySelectorAll('.nav-tab[data-tab]').forEach(tab => {
  tab.addEventListener('click', () => activatePanel(tab.dataset.tab));
});

const savedPanel = localStorage.getItem(PANEL_STORAGE_KEY);
if (savedPanel && ['time', 'diff', 'exam', 'author'].includes(savedPanel)) {
  activatePanel(savedPanel);
}

/* ===== 节点弹窗 ===== */
function toggleNodePopup() {
  document.getElementById('node-popup').classList.toggle('show');
}
document.addEventListener('click', e => {
  if (!document.getElementById('header-left').contains(e.target))
    document.getElementById('node-popup').classList.remove('show');
});

/* ===== 时间面板 ===== */
let selectedTZ = null;

/* ===== 农历转换 ===== */
const lunarInfo = [
  0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
  0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
  0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
  0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
  0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
  0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
  0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
  0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
  0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
  0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
  0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
  0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
  0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
  0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
  0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
  0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
  0x092e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
  0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
  0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
  0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a4d0,0x0d150,0x0f252,
  0x0d520
];
const Gan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const Zhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const Animals = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
const lunarMonName = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
const lunarDayName = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];

function lYearDays(y) {
  let sum = 348;
  for (let i = 0x8000; i > 0x8; i >>= 1) sum += (lunarInfo[y - 1900] & i) ? 1 : 0;
  return sum + leapDays(y);
}
function leapMonth(y) { return lunarInfo[y - 1900] & 0xf; }
function leapDays(y) {
  if (leapMonth(y)) return (lunarInfo[y - 1900] & 0x10000) ? 30 : 29;
  return 0;
}
function monthDays(y, m) {
  return (lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29;
}

function solar2lunar(y, m, d) {
  if (y < 1900 || y > 2100) return '';
  let offset = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 31)) / 86400000);
  let leap = leapMonth(y), isLeap = false;
  for (let i = 1900; i < 2101 && offset > 0; i++) {
    let daysInYear = lYearDays(i);
    if (offset < daysInYear) { leap = leapMonth(y = i); break; }
    offset -= daysInYear;
  }
  if (offset < 0) { offset += lYearDays(y); y--; }
  let daysInMonth;
  for (let m = 1; m < 13 && offset > 0; m++) {
    if (leap > 0 && m === (leap + 1) && !isLeap) { --m; isLeap = true; daysInMonth = leapDays(y); }
    else { daysInMonth = monthDays(y, m); }
    if (isLeap && m === (leap + 1)) isLeap = false;
    offset -= daysInMonth;
  }
  if (offset < 0) { offset += daysInMonth; m--; }
  const day = offset + 1;
  const ganIdx = (y - 4) % 10, zhiIdx = (y - 4) % 12;
  return Gan[ganIdx] + Zhi[zhiIdx] + '年' +
    (isLeap ? '闰' : '') + lunarMonName[m - 1] + '月' +
    lunarDayName[day - 1];
}

function tick() {
  const now = new Date();
  const tz = selectedTZ || Intl.DateTimeFormat().resolvedOptions().timeZone;
  let h, m, s, y, mo, da, wd;
  try {
    const parts = now.toLocaleString('en-US', { timeZone: tz, hour12: false,
      year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit' });
    const p = parts.match(/(\d+)\/(\d+)\/(\d+),?\s*(\d+):(\d+):(\d+)/);
    if (p) { mo=+p[1]; da=+p[2]; y=+p[3]; h=+p[4]; m=+p[5]; s=+p[6]; }
    else { h=now.getHours(); m=now.getMinutes(); s=now.getSeconds(); y=now.getFullYear(); mo=now.getMonth()+1; da=now.getDate(); }
  } catch { h=now.getHours(); m=now.getMinutes(); s=now.getSeconds(); y=now.getFullYear(); mo=now.getMonth()+1; da=now.getDate(); }
  const ms = now.getMilliseconds();
  try {
    const wkStr = now.toLocaleDateString('zh-CN', { timeZone: tz, weekday: 'long' });
    wd = wkStr.replace('星期', '');
  } catch { wd = WKS[now.getDay()]; }

  const wkNum = weekOfYear(new Date(y, mo - 1, da));

  document.getElementById('clock').innerHTML =
    pad(h) + ':' + pad(m) +
    '<span class="sec">:' + pad(s) + '</span>' +
    '<span class="ms">.' + pad(Math.floor(ms / 10)) + '</span>';
  document.getElementById('date').textContent =
    y + '年' + pad(mo) + '月' + pad(da) + '日';
  document.getElementById('tz').textContent = selectedTZ ? (WORLDTZ.find(z=>z.tz===selectedTZ)?.city || selectedTZ) : Intl.DateTimeFormat().resolvedOptions().timeZone;
  document.getElementById('wd').textContent = `第${wkNum}周 星期${wd}`;
  document.getElementById('lunar').textContent = solar2lunar(y, mo, da);
}
setInterval(tick, 50); tick();

/* ===== 世界时钟 ===== */
const WORLDTZ = [
  { tz: 'Asia/Shanghai',    city: '北京',  flag: '🇨🇳' },
  { tz: 'Australia/Sydney', city: '悉尼',  flag: '🇦🇺' },
  { tz: 'Asia/Tokyo',       city: '东京',  flag: '🇯🇵' },
  { tz: 'Asia/Singapore',   city: '新加坡', flag: '🇸🇬' },
  { tz: 'Asia/Dubai',       city: '迪拜',  flag: '🇦🇪' },
  { tz: 'Europe/Paris',     city: '巴黎',  flag: '🇫🇷' },
  { tz: 'Europe/London',    city: '伦敦',  flag: '🇬🇧' },
  { tz: 'America/New_York', city: '纽约',  flag: '🇺🇸' },
];

let topTZ = null;

function buildWorldClocks() {
  const localTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const container = document.getElementById('world-clocks');
  let html = '';
  for (const z of WORLDTZ) {
    const isLocal = z.tz === localTZ && !selectedTZ;
    const isSelected = z.tz === selectedTZ;
    const cls = isSelected ? 'top-tz' : (isLocal ? 'local-tz' : '');
    html += `<div class="wc-item ${cls}" data-tz="${z.tz}" onclick="pinTZ('${z.tz}')">
      <div class="wc-city">${z.flag} ${z.city}</div>
      <div class="wc-time" data-tz="${z.tz}">--:--:--</div>
      <div class="wc-date" data-tz="${z.tz}">--</div>
    </div>`;
  }
  container.innerHTML = html;
}

function pinTZ(tz) {
  selectedTZ = (selectedTZ === tz) ? null : tz;
  topTZ = selectedTZ;
  buildWorldClocks();
  tickWorldClocks();
}

function tickWorldClocks() {
  document.querySelectorAll('.wc-time[data-tz]').forEach(el => {
    try {
      el.textContent = new Date().toLocaleTimeString('zh-CN', { timeZone: el.dataset.tz, hour12: false });
    } catch { el.textContent = '--:--:--'; }
  });
  document.querySelectorAll('.wc-date[data-tz]').forEach(el => {
    try {
      el.textContent = new Date().toLocaleDateString('zh-CN', { timeZone: el.dataset.tz, month:'numeric', day:'numeric', weekday:'short' });
    } catch { el.textContent = '--'; }
  });
}

buildWorldClocks();
setInterval(tickWorldClocks, 1000);
tickWorldClocks();

/* ===== 校时面板 ===== */
let offset = null;

async function fetchOffset() {
  // Primary: timeapi.io (supports CORS)
  try {
    const t0 = performance.now();
    const r = await fetch('https://timeapi.io/api/time/current/zone?timeZone=Asia/Shanghai');
    const t1 = performance.now();
    if (r.ok) {
      const j = await r.json();
      const serverMs = new Date(j.dateTime).getTime();
      if (!isNaN(serverMs)) return serverMs - Date.now() + (t1 - t0) / 2;
    }
  } catch {}
  // Fallback: Alibaba Cloud mtop
  try {
    const t0 = performance.now();
    const r = await fetch('https://acs.m.taobao.com/gw/mtop.common.getTimestamp/');
    const t1 = performance.now();
    if (r.ok) {
      const j = await r.json();
      const serverMs = parseInt(j.data.t);
      if (!isNaN(serverMs)) return serverMs - Date.now() + (t1 - t0) / 2;
    }
  } catch {}
  // Fallback: calculate Beijing time from device
  const now = new Date();
  return (now.getTime() + now.getTimezoneOffset() * 6e4 + 8 * 36e5) - now.getTime();
}

async function sync() {
  const badge = document.getElementById('cal-badge');
  badge.textContent = '⏳ 正在同步…';
  badge.style.background = 'var(--accent-dim)';
  badge.style.color = 'var(--accent)';
  badge.style.border = '1px solid rgba(108,140,255,0.3)';
  document.getElementById('cal-note').textContent = '';
  const r1 = await fetchOffset();
  if (r1 !== null) {
    offset = r1;
    badge.textContent = '✓ 已校准';
    badge.style.background = 'var(--green-dim)';
    badge.style.color = 'var(--green)';
    badge.style.border = '1px solid rgba(74,222,128,0.3)';
  } else {
    offset = 0;
    badge.textContent = '⚠ 同步失败';
    badge.style.background = 'rgba(251,191,36,0.1)';
    badge.style.color = 'var(--orange)';
    badge.style.border = '1px solid rgba(251,191,36,0.3)';
  }
  setTimeout(sync, 6e4);
}

function tickDiff() {
  if (offset === null) return;
  const now = new Date();
  const std = new Date(Date.now() + offset);
  const ms = Math.round(offset);
  // 北京时间大字显示
  document.getElementById('cal-clock').textContent =
    pad(std.getHours()) + ':' + pad(std.getMinutes()) + ':' + pad(std.getSeconds());
  // 三列：设备 / 服务器 / 偏移
  document.getElementById('cal-d').textContent =
    pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
  document.getElementById('cal-n').textContent =
    pad(std.getHours()) + ':' + pad(std.getMinutes()) + ':' + pad(std.getSeconds());
  // 偏移显示为秒
  const sec = (ms / 1000);
  const secStr = (sec >= 0 ? '+' : '') + sec.toFixed(3) + ' 秒';
  document.getElementById('cal-o').textContent = secStr;
  // 状态颜色
  const abs = Math.abs(ms);
  const clockEl = document.getElementById('cal-clock');
  if (abs < 100) { clockEl.className = 'diff-big ok'; }
  else if (abs < 1000) { clockEl.className = 'diff-big warn'; }
  else { clockEl.className = 'diff-big bad'; }
}
setInterval(tickDiff, 100); sync();

/* ===== 考试面板 ===== */
const ICONS = {语文:'📖',数学:'🔢',英语:'🔤',物理:'⚛️',化学:'🧪',生物:'🧬',政治:'📜',历史:'🏛️',地理:'🌍'};
const DURS = {语文:150,数学:120,英语:120,物理:75,化学:75,生物:75,政治:75,历史:75,地理:75};
const DUR_OPTS = [
  { v:45, label:'45 分钟' }, { v:60, label:'60 分钟' }, { v:75, label:'75 分钟' },
  { v:90, label:'90 分钟' }, { v:100, label:'100 分钟' }, { v:120, label:'2 小时' },
  { v:150, label:'2.5 小时' }, { v:180, label:'3 小时' }, { v:'custom', label:'自定义…' },
];

let exams = JSON.parse(localStorage.getItem('cy_exams')||'[]');
let selSub = '';
let selDur = 75;
let fsId = null, fsIv = null;
let editMode = false;

function save() { localStorage.setItem('cy_exams', JSON.stringify(exams)); }

/* ===== 时长下拉 ===== */
function buildDurList() {
  document.getElementById('dur-list').innerHTML = DUR_OPTS.map(o =>
    `<div class="dur-opt${o.v===selDur?' sel':''}" data-v="${o.v}" onclick="selectDur(${o.v==='custom'?'"custom"':o.v})">${o.label}</div>`
  ).join('');
}
function updateDurLabel() {
  const opt = DUR_OPTS.find(o => o.v === selDur);
  document.getElementById('dur-label').textContent = opt ? opt.label : selDur + ' 分钟';
  document.querySelectorAll('.dur-opt').forEach(el => el.classList.toggle('sel', el.dataset.v === String(selDur)));
}
function toggleDur() {
  const list = document.getElementById('dur-list');
  const trigger = document.getElementById('dur-trigger');
  if (list.classList.contains('open')) { closeDur(); }
  else { list.classList.add('open'); trigger.classList.add('open'); }
}
function closeDur() {
  document.getElementById('dur-list').classList.remove('open');
  document.getElementById('dur-trigger').classList.remove('open');
}
function selectDur(v) {
  if (v === 'custom') {
    document.getElementById('fg-custom-dur').style.display = 'block';
    document.getElementById('inp-custom-dur').focus();
    selDur = parseInt(document.getElementById('inp-custom-dur').value) || 75;
  } else {
    document.getElementById('fg-custom-dur').style.display = 'none';
    selDur = v;
  }
  updateDurLabel();
  const h = selDur / 60;
  document.getElementById('dur-hint').textContent = h>=1?(h%1===0?h+' 小时':h.toFixed(1)+' 小时'):selDur+' 分钟';
  closeDur();
}
function setDurVal(v) {
  const known = DUR_OPTS.find(o => o.v === v);
  if (known) { selDur = v; document.getElementById('fg-custom-dur').style.display = 'none'; }
  else { selDur = v; document.getElementById('fg-custom-dur').style.display = 'block'; document.getElementById('inp-custom-dur').value = v; }
  updateDurLabel();
  const h = selDur / 60;
  document.getElementById('dur-hint').textContent = '时长 ' + (h>=1?(h%1===0?h+' 小时':h.toFixed(1)+' 小时'):selDur+' 分钟');
}
document.getElementById('inp-custom-dur').addEventListener('input', function() { selDur = parseInt(this.value) || 75; updateDurLabel(); });
document.addEventListener('click', e => { if (!document.getElementById('dur-dropdown').contains(e.target)) closeDur(); });

/* Modal - unified for add & edit */
function openModal(editId) {
  editMode = !!editId;
  document.getElementById('modal').classList.add('open');
  document.getElementById('modal-title').textContent = editMode ? '编辑考试' : '添加考试';
  document.getElementById('edit-id').value = editId || '';
  selSub = '';
  document.querySelectorAll('.subj-btn').forEach(b => b.classList.remove('sel'));
  document.getElementById('inp-custom').value = '';
  document.getElementById('fg-custom-dur').style.display = 'none';
  closeDur();

  if (editMode) {
    const ex = exams.find(e => e.id === editId);
    if (!ex) { closeModal(); return; }
    selSub = ex.sub;
    const preset = document.querySelector(`.subj-btn[data-s="${ex.sub}"]`);
    if (preset) preset.classList.add('sel');
    else document.getElementById('inp-custom').value = ex.sub;
    const d = new Date(ex.start);
    document.getElementById('inp-start').value = d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes());
    setDurVal(ex.dur);
  } else {
    const n = new Date(); n.setMinutes(Math.ceil(n.getMinutes()/5)*5,0,0);
    document.getElementById('inp-start').value = n.getFullYear()+'-'+pad(n.getMonth()+1)+'-'+pad(n.getDate())+'T'+pad(n.getHours())+':'+pad(n.getMinutes());
    selDur = 75; updateDurLabel();
    document.getElementById('dur-hint').textContent = '默认 75 分钟';
  }
  buildDurList();
}

function closeModal() { document.getElementById('modal').classList.remove('open'); editMode = false; closeDur(); }

document.querySelectorAll('.subj-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.subj-btn').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
    selSub = btn.dataset.s;
    document.getElementById('inp-custom').value = '';
    selDur = DURS[selSub] || 75;
    updateDurLabel();
    const h = selDur / 60;
    document.getElementById('dur-hint').textContent = '默认 ' + (h>=1?(h%1===0?h+' 小时':h.toFixed(1)+' 小时'):selDur+' 分钟');
  });
});

document.getElementById('inp-custom').addEventListener('focus', function() {
  this.value = '';
  document.querySelectorAll('.subj-btn').forEach(b => b.classList.remove('sel'));
  selSub = ''; selDur = 75; updateDurLabel();
  document.getElementById('dur-hint').textContent = '默认 75 分钟';
});

function getDuration() {
  if (document.getElementById('fg-custom-dur').style.display !== 'none') {
    const v = parseInt(document.getElementById('inp-custom-dur').value);
    return (v > 0) ? v : 75;
  }
  return selDur || 75;
}

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
    const idx = exams.findIndex(e => e.id === editId);
    if (idx !== -1) {
      exams[idx] = { ...exams[idx], sub, start, end, dur };
    }
  } else {
    exams.push({ id: Date.now(), sub, start, end, dur });
  }
  exams.sort((a,b) => a.start - b.start);
  save(); closeModal(); render();
}

function removeExam(id) { exams = exams.filter(e => e.id !== id); save(); render(); }

function clearAll() {
  if (!exams.length) return;
  if (!confirm('确定清空所有考试？')) return;
  exams = []; save(); render();
}

function render() {
  const el = document.getElementById('exam-list');
  const now = Date.now();
  exams = exams.filter(e => e.end > now - 36e5); save();

  const hasActive = exams.some(e => (now >= e.start && now <= e.end) || e.start > now);
  document.getElementById('btn-fs').style.display = hasActive ? '' : 'none';

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
      cls = 'live'; cd = fmtCD(ex.end - now); tag = '考试中'; hint = '<div class="er-fs-hint">点击全屏</div>';
      foundLive = true;
    } else if (now < ex.start) {
      if (!foundLive && !foundNext) {
        cls = 'upcoming'; tag = '即将开始'; hint = '<div class="er-fs-hint">点击全屏</div>';
        foundNext = true;
      } else { cls = ''; tag = '等待'; }
      cd = fmtCD(ex.start - now);
    } else {
      cls = 'ended'; cd = '已结束'; tag = '';
    }

    const hrs = ex.dur / 60;
    const durTxt = hrs >= 1 ? (hrs % 1 === 0 ? hrs + 'h' : hrs.toFixed(1) + 'h') : ex.dur + 'min';
    const click = (cls==='live'||cls==='upcoming') ? `onclick="openFS(${ex.id})"` : '';

    html += `<div class="exam-row ${cls}" ${click}>
      <div class="er-left">
        <div class="er-ico">${ico}</div>
        <div>
          <div class="er-name">${ex.sub}</div>
          <div class="er-time">${fmtTime(ex.start)}-${fmtTime(ex.end)} · ${durTxt}</div>
        </div>
      </div>
      <div class="er-right">
        <div>
          <div class="er-cd">${cd}</div>
          <div class="er-tag">${tag}</div>
          ${hint}
        </div>
        <button class="btn-icon" onclick="event.stopPropagation();openModal(${ex.id})" title="编辑">✏️</button>
        <button class="btn-icon" onclick="event.stopPropagation();removeExam(${ex.id})" title="删除">✕</button>
      </div>
    </div>`;
  }
  html += '</div>';
  el.innerHTML = html;
}
setInterval(render, 1e3); render();

/* ===== 考试全屏 ===== */
let fsRunning = false;

function openFS(id) {
  fsId = id;
  fsRunning = true;
  const fsEl = document.getElementById('fs');
  fsEl.classList.add('show');
  document.body.style.overflow = 'hidden';
  // Update bar subtitle with first exam name
  const firstEx = exams.find(e => e.id === id);
  if (firstEx) document.getElementById('fs-bar-sub').textContent = firstEx.sub;
  tickFS();
  if (fsIv) clearInterval(fsIv);
  fsIv = setInterval(tickFS, 200);
}

function openNearestFS() {
  const now = Date.now();
  let target = exams.find(e => now >= e.start && now <= e.end);
  if (!target) target = exams.find(e => e.start > now);
  if (target) openFS(target.id);
}

function closeFS() {
  fsId = null;
  fsRunning = false;
  document.getElementById('fs').classList.remove('show');
  document.body.style.overflow = '';
  if (fsIv) { clearInterval(fsIv); fsIv = null; }
}

function tickFS() {
  if (!fsRunning || fsId === null) return;

  let ex = exams.find(e => e.id == fsId);
  if (ex && Date.now() > ex.end) {
    const next = exams.find(e => e.start > ex.end);
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
    const nowStr = pad(nd.getHours())+':'+pad(nd.getMinutes())+':'+pad(nd.getSeconds());
    document.getElementById('fs-now').textContent = nowStr;
    document.getElementById('fs-chip-t1').textContent = fmtTime(ex.start);
    document.getElementById('fs-chip-t2').textContent = fmtTime(ex.end);
    document.getElementById('fs-chip-now').textContent = nowStr;

    const dot = document.getElementById('fs-dot');
    const stxt = document.getElementById('fs-stxt');
    const cdEl = document.getElementById('fs-cd');
    const cdLabel = document.getElementById('fs-cd-label');

    if (now >= ex.start && now <= ex.end) {
      stxt.textContent = '考试进行中';
      dot.style.background = 'var(--accent)';
      document.querySelector('.fs-left-head .fs-state').style.color = 'var(--accent)';
      cdLabel.textContent = '剩余时间';
      cdEl.textContent = fmtCD(ex.end - now);
      cdEl.style.color = 'var(--accent)';
    } else if (now < ex.start) {
      stxt.textContent = '距开考';
      dot.style.background = 'var(--green)';
      document.querySelector('.fs-left-head .fs-state').style.color = 'var(--green)';
      cdLabel.textContent = '距开考';
      cdEl.textContent = fmtCD(ex.start - now);
      cdEl.style.color = 'var(--green)';
    } else {
      stxt.textContent = '已结束';
      dot.style.background = 'var(--text3)';
      document.querySelector('.fs-left-head .fs-state').style.color = 'var(--text3)';
      cdLabel.textContent = '已结束';
      cdEl.textContent = '00:00:00';
      cdEl.style.color = 'var(--text3)';
    }

    document.getElementById('fs-bar-sub').textContent = ex.sub;
  } catch (e) { /* skip */ }

  try {
    let shtml = '';
    for (const item of exams) {
      const ico = ICONS[item.sub] || '📄';
      let cls = '', status = '';
      if (now >= item.start && now <= item.end) {
        cls = 'active'; status = '剩余 ' + fmtCD(item.end - now);
      } else if (now < item.start) {
        cls = ''; status = '倒计时 ' + fmtCD(item.start - now);
      } else {
        cls = 'done'; status = '已结束';
      }
      const isActive = item.id == fsId;
      shtml += `<div class="fs-left-item ${isActive ? 'active' : ''} ${cls}" onclick="fsSwitch(${item.id})">
        <span class="fs-li-ico">${ico}</span>
        <span class="fs-li-name">${item.sub}</span>
        <span class="fs-li-status">${status}</span>
      </div>`;
    }
    document.getElementById('fs-sched-list').innerHTML = shtml;
  } catch (e) { /* skip */ }
}

function fsSwitch(id) { fsId = id; tickFS(); }

document.getElementById('fs-body').addEventListener('click', e => {
  if (e.target === document.getElementById('fs-body')) closeFS();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (fsId !== null) closeFS();
    else if (document.getElementById('modal').classList.contains('open')) closeModal();
  }
});

document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
/* ===== 时间全屏 ===== */
const timeFSEl = document.getElementById('time-fs');
let timeFSIv = null;

function openTimeFS() {
  timeFSEl.classList.add('show');
  document.body.style.overflow = 'hidden';
  tickTimeFS();
  if (timeFSIv) clearInterval(timeFSIv);
  timeFSIv = setInterval(tickTimeFS, 100);
}

function closeTimeFS() {
  timeFSEl.classList.remove('show');
  document.body.style.overflow = '';
  if (timeFSIv) { clearInterval(timeFSIv); timeFSIv = null; }
}

function tickTimeFS() {
  const now = new Date();
  const tz = selectedTZ || Intl.DateTimeFormat().resolvedOptions().timeZone;
  let h, m, s, y, mo, da, wd;
  try {
    const parts = now.toLocaleString('en-US', { timeZone: tz, hour12: false,
      year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit' });
    const p = parts.match(/(\d+)\/(\d+)\/(\d+),?\s*(\d+):(\d+):(\d+)/);
    if (p) { mo=+p[1]; da=+p[2]; y=+p[3]; h=+p[4]; m=+p[5]; s=+p[6]; }
    else { h=now.getHours(); m=now.getMinutes(); s=now.getSeconds(); y=now.getFullYear(); mo=now.getMonth()+1; da=now.getDate(); }
  } catch { h=now.getHours(); m=now.getMinutes(); s=now.getSeconds(); y=now.getFullYear(); mo=now.getMonth()+1; da=now.getDate(); }
  const ms = now.getMilliseconds();
  try {
    const wkStr = now.toLocaleDateString('zh-CN', { timeZone: tz, weekday: 'long' });
    wd = wkStr.replace('星期', '');
  } catch { wd = WKS[now.getDay()]; }

  const wkNum = weekOfYear(new Date(y, mo - 1, da));

  document.getElementById('tfs-clock').innerHTML =
    pad(h) + ':' + pad(m) +
    '<span class="sec">:' + pad(s) + '</span>' +
    '<span class="ms">.' + pad(Math.floor(ms / 10)) + '</span>';
  document.getElementById('tfs-date').textContent =
    y + '年' + pad(mo) + '月' + pad(da) + '日 第' + wkNum + '周 星期' + wd + ' ' + solar2lunar(y, mo, da);
  document.getElementById('tfs-tz').textContent = selectedTZ ? (WORLDTZ.find(z=>z.tz===selectedTZ)?.city || selectedTZ) : Intl.DateTimeFormat().resolvedOptions().timeZone;
}

timeFSEl.addEventListener('click', closeTimeFS);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && timeFSEl.classList.contains('show')) closeTimeFS(); });