const $ = (s) => document.querySelector(s);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const rnd = (a, b) => a + Math.random() * (b - a);
const scenes = { lock: $("#lock"), env: $("#envelope"), letter: $("#letter"), bouquet: $("#bouquet") };
let current = "lock";
function show(name) {
  for (const k in scenes) scenes[k].classList.toggle("on", k === name);
  current = name;
}

/* ---------- Ảnh mẫu (vẽ bằng canvas) ---------- */
const PALETTES = [["#ffd3e0", "#f49fc0"], ["#ffe4c8", "#f6ad97"], ["#dde6ff", "#c1b3f0"], ["#d9f2e4", "#98d4bd"], ["#fff0bd", "#f6c08f"], ["#f4d6ff", "#e09fd3"]];
function heartPath(g, x, y, s) {
  g.beginPath(); g.moveTo(x, y + s);
  g.bezierCurveTo(x - s * 1.25, y + s * 0.1, x - s * 0.9, y - s * 1.05, x, y - s * 0.35);
  g.bezierCurveTo(x + s * 0.9, y - s * 1.05, x + s * 1.25, y + s * 0.1, x, y + s);
  g.fill();
}
function starPath(g, x, y, r) {
  g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  g.closePath(); g.fill();
}
function makePlaceholder(i, w, h, label) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d");
  const [a, b] = PALETTES[i % PALETTES.length];
  const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, a); gr.addColorStop(1, b);
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = "rgba(255,255,255,.35)";
  g.beginPath(); g.ellipse(w * 0.2, h * 1.02, w * 0.5, h * 0.2, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(w * 0.85, h * 1.05, w * 0.45, h * 0.18, 0, 0, Math.PI * 2); g.fill();
  const cx = w / 2, cy = label ? h * 0.42 : h * 0.47, r = Math.min(w, h) * 0.17;
  g.fillStyle = "rgba(255,255,255,.9)"; g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = r * 0.16; g.lineCap = "round";
  switch (i % 6) {
    case 0: heartPath(g, cx, cy, r * 1.2); break;
    case 1:
      g.beginPath(); g.arc(cx, cy, r * 0.75, 0, Math.PI * 2); g.fill();
      for (let k = 0; k < 8; k++) { const t = k * Math.PI / 4; g.beginPath(); g.moveTo(cx + Math.cos(t) * r * 1.05, cy + Math.sin(t) * r * 1.05); g.lineTo(cx + Math.cos(t) * r * 1.45, cy + Math.sin(t) * r * 1.45); g.stroke(); }
      break;
    case 2: starPath(g, cx, cy, r * 1.2); starPath(g, cx - r * 1.6, cy - r * 0.9, r * 0.4); starPath(g, cx + r * 1.5, cy + r * 0.8, r * 0.35); break;
    case 3:
      for (let k = 0; k < 5; k++) { const t = k * Math.PI * 2 / 5 - Math.PI / 2; g.beginPath(); g.arc(cx + Math.cos(t) * r * 0.75, cy + Math.sin(t) * r * 0.75, r * 0.55, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = b; g.beginPath(); g.arc(cx, cy, r * 0.45, 0, Math.PI * 2); g.fill();
      break;
    case 4:
      g.beginPath(); g.arc(cx - r * 0.7, cy + r * 0.2, r * 0.65, 0, Math.PI * 2); g.arc(cx, cy - r * 0.2, r * 0.85, 0, Math.PI * 2); g.arc(cx + r * 0.8, cy + r * 0.2, r * 0.6, 0, Math.PI * 2); g.fill();
      g.fillStyle = b; heartPath(g, cx, cy + r * 0.05, r * 0.35);
      break;
    default: heartPath(g, cx - r * 0.55, cy, r * 0.75); heartPath(g, cx + r * 0.6, cy + r * 0.3, r * 0.6);
  }
  if (label) {
    g.fillStyle = "rgba(255,255,255,.95)"; g.textAlign = "center";
    g.font = `700 ${Math.round(w * 0.12)}px "Dancing Script", cursive`;
    g.fillText(label, cx, h * 0.8);
  }
  return c.toDataURL("image/jpeg", 0.86);
}
/* ---------- Nạp ảnh: có file thì dùng, thiếu file thì dùng ảnh mẫu ---------- */
let FLOWER_PHOTOS = [];
let coverIsPlaceholder = false;
function loadOr(src, fallback) {
  return new Promise((resolve) => {
    if (!src) return resolve(fallback());
    const im = new Image();
    im.onload = () => resolve(src);
    im.onerror = () => resolve(fallback());
    im.src = src;
  });
}
const coverFallback = () => { coverIsPlaceholder = true; return makePlaceholder(0, 480, 640, "Ảnh của em"); };
const photosReady = Promise.all([
  loadOr(CONFIG.coverPhoto, coverFallback).then((s) => { $("#coverImg").src = s; }),
  ...(CONFIG.bouquet.photos || []).slice(0, 9).map((src, i) => loadOr(src, () => makeBokeh(i, 320)))
]).then(([, ...flowers]) => { FLOWER_PHOTOS = flowers; });
if (document.fonts && document.fonts.ready) {
  Promise.all([document.fonts.ready, photosReady]).then(() => { if (coverIsPlaceholder) $("#coverImg").src = coverFallback(); });
}

/* ---------- Tim, hoa, sao rơi nền ---------- */
const FALL_SHAPES = {
  heart: '<path d="M12 21C5 15.6 2 12.3 2 8.5 2 5.4 4.4 3 7.4 3c1.9 0 3.6 1 4.6 2.5C13 4 14.7 3 16.6 3 19.6 3 22 5.4 22 8.5c0 3.8-3 7.1-10 12.5z"/>',
  petal: '<path d="M12 4.5C11 3 9.8 2.2 8.6 2.4 5 3.5 3.5 9 5.2 14.2 6.6 18.6 9.6 21.4 12 22c2.4-.6 5.4-3.4 6.8-7.8C20.5 9 19 3.5 15.4 2.4 14.2 2.2 13 3 12 4.5z"/>',
  flower: [0, 72, 144, 216, 288].map(a => `<ellipse cx="12" cy="6.6" rx="4.1" ry="5.4" transform="rotate(${a} 12 12)"/>`).join("") + '<circle cx="12" cy="12" r="2.8" fill="#ff8fab"/>',
  star: '<path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3l-6.2 3.6 1.6-7L2 9.2l7.1-.6z"/>',
  sparkle: '<path d="M12 1c.6 5.5 2.5 9.4 11 11-8.5 1.6-10.4 5.5-11 11-.6-5.5-2.5-9.4-11-11 8.5-1.6 10.4-5.5 11-11z"/>'
};
// w = tỉ lệ xuất hiện, size = cỡ nhỏ nhất/lớn nhất (px), fx = kiểu chuyển động thêm
const FALL_TYPES = [
  { shape: "heart",   w: 4, size: [12, 26], colors: ["#fb6f92", "#ff8fab", "#ffb3c6"] },
  { shape: "petal",   w: 4, size: [12, 22], colors: ["#ff8fab", "#ffa3bb", "#ffb3c6"], fx: "flutter" },
  { shape: "flower",  w: 2, size: [14, 26], colors: ["#ffffff", "#ffd6e0"], fx: "flutter" },
  { shape: "star",    w: 2, size: [10, 18], colors: ["#ffffff", "#fff0f4"], fx: "twinkle" },
  { shape: "sparkle", w: 2, size: [10, 17], colors: ["#ffffff"], fx: "twinkle" }
];
const FALL_W = FALL_TYPES.reduce((s, t) => s + t.w, 0);
const fallLayer = $("#fall");
function pickFallType() {
  let r = Math.random() * FALL_W;
  for (const t of FALL_TYPES) if ((r -= t.w) < 0) return t;
  return FALL_TYPES[0];
}
// progress: 0 = bắt đầu từ mép trên, 0..1 = hiện sẵn giữa chừng (dùng lúc mới mở trang)
function spawnFall(progress = 0) {
  if (current === "letter" || document.hidden || fallLayer.childElementCount > 50) return;
  const t = pickFallType();
  const size = rnd(t.size[0], t.size[1]);
  const depth = (size - t.size[0]) / (t.size[1] - t.size[0]); // 0 = xa (nhỏ, mờ, chậm), 1 = gần
  const el = document.createElement("span");
  el.className = "fall" + (t.fx ? " " + t.fx : "");
  el.style.cssText = `left:${rnd(-2, 98).toFixed(1)}vw;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;color:${t.colors[Math.random() * t.colors.length | 0]};opacity:${(.65 + depth * .3).toFixed(2)}`;
  el.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" style="animation-duration:${rnd(1.6, 3).toFixed(2)}s;animation-delay:-${rnd(0, 3).toFixed(2)}s">${FALL_SHAPES[t.shape]}</svg>`;
  fallLayer.append(el);
  // rơi xuống, lắc qua lắc lại theo hình sin, vừa rơi vừa xoay
  const H = innerHeight + 60, amp = rnd(14, 42), drift = rnd(-50, 50), ph = rnd(0, Math.PI * 2);
  const spin = rnd(-1, 1) * (t.fx === "flutter" ? 420 : 160);
  const frames = [];
  for (let k = 0; k <= 10; k++) {
    const p = k / 10, x = drift * p + Math.sin(ph + p * 6) * amp;
    frames.push({ transform: `translate(${x.toFixed(1)}px,${(p * H).toFixed(1)}px) rotate(${(spin * p).toFixed(1)}deg)` });
  }
  const dur = rnd(10000, 15000) * (1.3 - depth * .5);
  const a = el.animate(frames, { duration: dur, easing: "linear" });
  if (progress) a.currentTime = dur * progress;
  a.onfinish = () => el.remove();
}
if (!reduceMotion) {
  for (let i = 0; i < 22; i++) spawnFall(Math.random());
  setInterval(spawnFall, 380);
}

/* ---------- Nhạc nền ---------- */
// Trình duyệt chỉ cho phát nhạc sau khi người xem chạm/bấm, nên nhạc bắt đầu lúc nhập đúng mật khẩu.
// (Trên iPhone không chỉnh được âm lượng bằng code, nhạc sẽ theo nút âm lượng của máy.)
const MUSIC = CONFIG.music || {};
const music = MUSIC.src ? new Audio(MUSIC.src) : null;
const musicBtn = $("#musicBtn");
const MUSIC_VOL = Math.min(1, Math.max(0, MUSIC.volume ?? 0.6));
let musicOn = false, musicStarted = false, fadeTimer = null;
if (music) { music.loop = true; music.preload = "auto"; }
function renderMusicBtn() {
  musicBtn.classList.toggle("off", !musicOn);
  musicBtn.setAttribute("aria-pressed", String(musicOn));
}
function fadeTo(v, ms, done) {
  clearInterval(fadeTimer);
  const from = music.volume, t0 = performance.now();
  fadeTimer = setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    music.volume = from + (v - from) * k;
    if (k === 1) { clearInterval(fadeTimer); if (done) done(); }
  }, 40);
}
function seekToStart() {
  if (!MUSIC.start) return;
  // Nhạc chưa tải xong thông tin thì đợi rồi mới tua
  if (music.readyState >= 1) music.currentTime = MUSIC.start;
  else music.addEventListener("loadedmetadata", () => { music.currentTime = MUSIC.start; }, { once: true });
}
function playMusic() {
  if (!music) return;
  clearInterval(fadeTimer);
  if (!musicStarted) seekToStart();
  music.volume = 0;
  music.play().then(() => {
    musicStarted = musicOn = true;
    musicBtn.hidden = false; renderMusicBtn();
    fadeTo(MUSIC_VOL, 2500);
  }).catch((e) => {
    // Bị chặn tự phát: hiện nút ở trạng thái tắt để người xem tự bấm. Thiếu file nhạc: không hiện gì.
    musicOn = false;
    if (e.name === "NotAllowedError") { musicBtn.hidden = false; renderMusicBtn(); }
  });
}
function pauseMusic() {
  musicOn = false; renderMusicBtn();
  fadeTo(0, 400, () => music.pause());
}
musicBtn.addEventListener("click", () => { musicOn ? pauseMusic() : playMusic(); });
// Chuyển tab / tắt màn hình thì tạm dừng, quay lại thì phát tiếp
document.addEventListener("visibilitychange", () => {
  if (!music || !musicOn) return;
  if (document.hidden) music.pause();
  else music.play().catch(() => { musicOn = false; renderMusicBtn(); });
});

/* ---------- 1. Màn khóa ---------- */
const PASS = String(CONFIG.password);
let entered = "";
const dotsEl = $("#dots"), keysEl = $("#keys"), hintEl = $("#lockHint");
dotsEl.innerHTML = Array.from(PASS, () => '<span class="dot"></span>').join("");
keysEl.innerHTML = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "hint", "0", "del"].map(k => {
  if (k === "hint") return '<button class="key ghost" data-k="hint" aria-label="Xem gợi ý">?</button>';
  if (k === "del") return '<button class="key ghost" data-k="del" aria-label="Xóa"><svg width="22" height="16" viewBox="0 0 22 16" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M7 1h13v14H7L1 8z"/><path d="M11 5l6 6M17 5l-6 6"/></svg></button>';
  return `<button class="key" data-k="${k}" aria-label="Số ${k}">${k}</button>`;
}).join("");
function renderDots() { [...dotsEl.children].forEach((d, i) => d.classList.toggle("filled", i < entered.length)); }
function press(k) {
  if (current !== "lock") return;
  if (k === "hint") { hintEl.textContent = CONFIG.hint; return; }
  if (k === "del") { entered = entered.slice(0, -1); renderDots(); return; }
  if (entered.length >= PASS.length) return;
  entered += k; renderDots();
  if (entered.length === PASS.length) {
    if (entered === PASS) playMusic(); // gọi ngay lúc bấm phím để trình duyệt cho phát
    setTimeout(check, 180);
  }
}
function check() {
  if (entered === PASS) {
    $("#lockCard").classList.add("leaving");
    setTimeout(() => show("env"), 450);
  } else {
    dotsEl.classList.add("wrong");
    hintEl.textContent = CONFIG.hint;
    setTimeout(() => { dotsEl.classList.remove("wrong"); entered = ""; renderDots(); }, 500);
  }
}
keysEl.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (b) press(b.dataset.k); });
addEventListener("keydown", (e) => {
  if (current === "lock") {
    if (/^\d$/.test(e.key)) press(e.key);
    else if (e.key === "Backspace") press("del");
  }
  if (e.key === "Escape" && !lb.hidden) closeLightbox();
});

/* ---------- 2. Phong bì ---------- */
const envWrap = $("#envWrap");
$("#envLetter").textContent = CONFIG.envelopeText;
let opening = false;
envWrap.addEventListener("click", () => {
  if (opening) return;
  opening = true;
  envWrap.classList.add("open");
  setTimeout(openLetter, reduceMotion ? 900 : 2200);
});
envWrap.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); envWrap.click(); }
});

/* ---------- 3. Lá thư ---------- */
const BEAR = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="13" cy="14" r="6" fill="#fff" stroke="#7a5446" stroke-width="1.6"/><circle cx="13" cy="14" r="2.6" fill="#f7b6cd"/><circle cx="35" cy="14" r="6" fill="#fff" stroke="#7a5446" stroke-width="1.6"/><circle cx="35" cy="14" r="2.6" fill="#f7b6cd"/><ellipse cx="24" cy="27" rx="15" ry="13" fill="#fff" stroke="#7a5446" stroke-width="1.6"/><circle cx="18.5" cy="25.5" r="1.7" fill="#4a2a3b"/><circle cx="29.5" cy="25.5" r="1.7" fill="#4a2a3b"/><ellipse cx="24" cy="30" rx="2.1" ry="1.5" fill="#4a2a3b"/><ellipse cx="14.5" cy="30.5" rx="2.6" ry="1.5" fill="#f7a1c0" opacity=".85"/><ellipse cx="33.5" cy="30.5" rx="2.6" ry="1.5" fill="#f7a1c0" opacity=".85"/><path d="M37 46c-5.6-3.6-7.6-6.6-5.7-9 1.5-1.9 4-1.2 5.7.9 1.7-2.1 4.2-2.8 5.7-.9 1.9 2.4-.1 5.4-5.7 9z" fill="#ee6a9d" stroke="#fff" stroke-width="1.2"/></svg>';
$("#sticker").innerHTML = BEAR;
$("#letterDate").textContent = CONFIG.letter.date || "";
const scroller = $("#letterScroll"), cta = $("#letterCta");
const L = CONFIG.letter;
const PARTS = [
  { cls: "greet", text: L.greeting },
  ...L.body.map(t => ({ cls: "", text: t })),
  { cls: "close", text: L.closing },
  { cls: "sign", text: L.signature }
].filter(p => p.text);
let typing = false, typeTimer = null, letterDone = false;

function openLetter() {
  scroller.innerHTML = "";
  scroller.scrollTop = 0;
  letterDone = false;
  setCta("wait");
  show("letter");
  setTimeout(typeLetter, 900);
}
function setCta(mode) {
  if (mode === "wait") { cta.disabled = true; cta.textContent = "Chạm vào thư để hiện hết nhé"; }
  else { cta.disabled = false; cta.textContent = L.button || "Có quà nữa nè →"; }
}
function typeLetter() {
  typing = true;
  const els = PARTS.map(p => { const el = document.createElement("p"); if (p.cls) el.className = p.cls; scroller.append(el); return el; });
  const caret = document.createElement("span"); caret.className = "caret";
  let pi = 0, ci = 0, chars = Array.from(PARTS[0].text), textNode = null;
  const startPart = () => { textNode = document.createTextNode(""); els[pi].append(textNode, caret); };
  startPart();
  const step = () => {
    if (ci >= chars.length) {
      pi++; ci = 0;
      if (pi >= PARTS.length) { finishLetter(); return; }
      chars = Array.from(PARTS[pi].text); startPart();
      typeTimer = setTimeout(step, reduceMotion ? 10 : 450); return;
    }
    const ch = chars[ci++];
    textNode.data += ch;
    if (scroller.scrollHeight > scroller.clientHeight) scroller.scrollTop = scroller.scrollHeight;
    let d = reduceMotion ? 5 : rnd(30, 55);
    if (ch === ",") d = 220;
    if (/[.!?…]/.test(ch)) d = 340;
    typeTimer = setTimeout(step, d);
  };
  step();
}
function finishLetter() {
  clearTimeout(typeTimer);
  typing = false; letterDone = true;
  scroller.innerHTML = PARTS.map(p => `<p${p.cls ? ` class="${p.cls}"` : ""}></p>`).join("");
  [...scroller.children].forEach((el, i) => { el.textContent = PARTS[i].text; });
  setCta("done");
}
scroller.addEventListener("click", () => { if (typing) finishLetter(); });
scroller.addEventListener("keydown", (e) => { if (typing && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); finishLetter(); } });
cta.addEventListener("click", () => { if (letterDone) openBouquet(); });

/* ---------- 4. Bó hoa ---------- */
$("#bqTitle").textContent = CONFIG.bouquet.title;
$("#bqNote").textContent = CONFIG.bouquet.note;
$("#rereadBtn").addEventListener("click", () => { show("letter"); });

function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let R = mulberry32(1);
const J = (a, b) => a + R() * (b - a);
const f = (n) => (+n).toFixed(2);

// Bảng màu cánh hoa: gốc cánh đậm, mép cánh nhạt
const PAL = {
  rose:    { base: "#c46a83", tip: "#f6d3db", edge: "#9e4f67" },
  blush:   { base: "#e0a0b1", tip: "#fdf0f2", edge: "#c4879a" },
  cream:   { base: "#e2cba9", tip: "#fffbf4", edge: "#bfa47c" },
  apricot: { base: "#df9479", tip: "#fde6d8", edge: "#bd785e" },
  mauve:   { base: "#a9849f", tip: "#f1e3ec", edge: "#896783" },
  wine:    { base: "#7f2f4a", tip: "#c56a85", edge: "#62233a" }
};

// Hoa có ảnh, trong khung 200 x 250. p = số thứ tự ảnh trong CONFIG (0 = ảnh đầu tiên, ở bông giữa to nhất).
// Không đủ ảnh cho bông nào thì bông đó vẽ thành hoa thường. Thứ tự trong mảng = thứ tự vẽ (bông sau đè bông trước).
const SLOTS = [
  { p: 3, x: 72,  y: 50,  r: 13, type: "cosmos", pal: "cream",   rot: -8 },
  { p: 4, x: 126, y: 48,  r: 14, type: "peony",  pal: "mauve",   rot: 6 },
  { p: 5, x: 38,  y: 67,  r: 11, type: "rose",   pal: "blush",   rot: -12 },
  { p: 6, x: 164, y: 63,  r: 12, type: "cosmos", pal: "blush",   rot: 10 },
  { p: 1, x: 57,  y: 97,  r: 15, type: "peony",  pal: "blush",   rot: -6 },
  { p: 2, x: 139, y: 92,  r: 16, type: "rose",   pal: "apricot", rot: 7 },
  { p: 0, x: 96,  y: 80,  r: 20, type: "rose",   pal: "rose",    rot: -3 },
  { p: 7, x: 84,  y: 122, r: 12, type: "rose",   pal: "cream",   rot: 4 },
  { p: 8, x: 122, y: 124, r: 12, type: "peony",  pal: "apricot", rot: -5 }
];

function petalD(l, w, kind) {
  const h = w / 2;
  if (kind === "notch") return `M0 0 C${f(-h * .5)} ${f(-l * .2)} ${f(-h * 1.05)} ${f(-l * .6)} ${f(-h * .8)} ${f(-l * .9)} Q${f(-h * .45)} ${f(-l * 1.02)} ${f(-h * .15)} ${f(-l)} L0 ${f(-l * .93)} L${f(h * .15)} ${f(-l)} Q${f(h * .45)} ${f(-l * 1.02)} ${f(h * .8)} ${f(-l * .9)} C${f(h * 1.05)} ${f(-l * .6)} ${f(h * .5)} ${f(-l * .2)} 0 0Z`;
  if (kind === "ruffle") return `M0 0 C${f(-h * .7)} ${f(-l * .15)} ${f(-h * 1.15)} ${f(-l * .55)} ${f(-h * .85)} ${f(-l * .86)} Q${f(-h * .6)} ${f(-l * 1.03)} ${f(-h * .28)} ${f(-l * .95)} Q${f(-h * .05)} ${f(-l * 1.06)} ${f(h * .2)} ${f(-l * .96)} Q${f(h * .55)} ${f(-l * 1.04)} ${f(h * .85)} ${f(-l * .86)} C${f(h * 1.15)} ${f(-l * .55)} ${f(h * .7)} ${f(-l * .15)} 0 0Z`;
  return `M0 0 C${f(-h * .7)} ${f(-l * .15)} ${f(-h * 1.15)} ${f(-l * .6)} ${f(-h * .75)} ${f(-l * .9)} C${f(-h * .4)} ${f(-l * 1.06)} ${f(h * .4)} ${f(-l * 1.06)} ${f(h * .75)} ${f(-l * .9)} C${f(h * 1.15)} ${f(-l * .6)} ${f(h * .7)} ${f(-l * .15)} 0 0Z`;
}
function ring(n, l, w, kind, pal, rot0, jit = 1) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = rot0 + (360 / n) * i + J(-9, 9) * jit;
    const ll = l * J(.9, 1.08), ww = w * J(.85, 1.12);
    s += `<path d="${petalD(ll, ww, kind)}" fill="url(#pg-${pal})" stroke="${PAL[pal].edge}" stroke-opacity=".35" stroke-width=".35" transform="rotate(${f(a)})"/>`;
    if (kind === "notch") s += `<path d="M0 ${f(-ll * .2)} L0 ${f(-ll * .85)}" stroke="${PAL[pal].edge}" stroke-opacity=".22" stroke-width=".3" transform="rotate(${f(a)})"/>`;
  }
  return s;
}
function head(type, r, pal) {
  if (type === "rose") return ring(6, r * 1.68, r * 1.4, "round", pal, J(0, 60)) + ring(6, r * 1.45, r * 1.2, "round", pal, J(0, 60)) + ring(7, r * 1.22, r * .9, "round", pal, J(0, 50));
  if (type === "peony") return ring(9, r * 1.85, r * 1.2, "ruffle", pal, J(0, 40)) + ring(8, r * 1.6, r * 1.05, "ruffle", pal, J(0, 45)) + ring(8, r * 1.32, r * .85, "ruffle", pal, J(0, 45));
  return ring(8, r * 2, r * .8, "notch", pal, J(0, 45), .5);
}
// Hai cánh cong úp lên mép dưới của ảnh cho có chiều sâu
function cup(r, pal) {
  const d = `M${f(-r * .82)} ${f(r * .5)} Q0 ${f(r * 1.2)} ${f(r * .82)} ${f(r * .5)} Q0 ${f(r * .86)} ${f(-r * .82)} ${f(r * .5)}Z`;
  return `<path d="${d}" fill="url(#pg-${pal})" stroke="${PAL[pal].edge}" stroke-opacity=".4" stroke-width=".35" transform="rotate(${f(J(-30, -16))})"/>` +
         `<path d="${d}" fill="url(#pg-${pal})" stroke="${PAL[pal].edge}" stroke-opacity=".4" stroke-width=".35" transform="rotate(${f(J(12, 26))})"/>`;
}
// Nhụy cho bông không có ảnh: thêm lớp cánh nhỏ cuộn vào giữa
function flowerCenter(type, r, pal) {
  if (type === "cosmos") return `<circle r="${f(r * .42)}" fill="#d9a441"/>` + stamens(r * .42);
  const kind = type === "peony" ? "ruffle" : "round";
  return ring(5, r * 1.02, r * .95, kind, pal, J(0, 72)) + ring(4, r * .7, r * .72, kind, pal, J(0, 90)) +
    `<path d="M${f(-r * .22)} 0 a${f(r * .22)} ${f(r * .22)} 0 1 1 ${f(r * .34)} ${f(r * .14)}" stroke="${PAL[pal].edge}" stroke-opacity=".55" stroke-width=".45" fill="none"/>`;
}
function stamens(r) {
  let s = "";
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + J(-.08, .08), rr = r + J(.6, 1.6);
    s += `<circle cx="${f(Math.cos(a) * rr)}" cy="${f(Math.sin(a) * rr)}" r="${f(J(.55, .9))}" fill="${i % 3 ? "#d9a441" : "#efc767"}"/>`;
  }
  return s;
}
function photoPart(r, i, src) {
  return `<clipPath id="ph${i}"><circle r="${r}"/></clipPath>` +
    `<image href="${src}" x="${-r}" y="${-r}" width="${2 * r}" height="${2 * r}" preserveAspectRatio="xMidYMid slice" clip-path="url(#ph${i})"/>` +
    `<circle r="${f(r - .7)}" fill="none" stroke="#3a1a2a" stroke-opacity=".2" stroke-width="1.3"/>` +
    `<circle class="ring" r="${r}" fill="none" stroke="#fffaf3" stroke-width="1.1"/>`;
}
function eucalyptus(x, y, ang, len) {
  const a = ang * Math.PI / 180, bend = J(-12, 12);
  const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
  const mx = (x + ex) / 2 + Math.cos(a + Math.PI / 2) * bend, my = (y + ey) / 2 + Math.sin(a + Math.PI / 2) * bend;
  let s = `<path d="M${f(x)} ${f(y)} Q${f(mx)} ${f(my)} ${f(ex)} ${f(ey)}" stroke="#7b9586" stroke-width=".8" fill="none"/>`;
  const n = 8;
  for (let k = 3; k <= n; k++) {
    const t = k / n;
    const px = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * mx + t * t * ex;
    const py = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * my + t * t * ey;
    const side = k % 2 ? 1 : -1, sz = J(3.4, 4.8) * (1.2 - t * .55);
    const nx = px + Math.cos(a + side * Math.PI / 2) * sz * .85, ny = py + Math.sin(a + side * Math.PI / 2) * sz * .85;
    s += `<ellipse cx="${f(nx)}" cy="${f(ny)}" rx="${f(sz)}" ry="${f(sz * .82)}" fill="url(#euc)" stroke="#6f887b" stroke-opacity=".5" stroke-width=".3" transform="rotate(${f(J(0, 180))} ${f(nx)} ${f(ny)})"/>`;
  }
  return s;
}
function longLeaf(x, y, ang, len, w) {
  return `<g transform="translate(${x} ${y}) rotate(${ang + 90})"><path d="${petalD(len, w, "round")}" fill="url(#leafG)"/><path d="M0 ${f(-len * .08)} Q${f(J(-1, 1))} ${f(-len * .5)} 0 ${f(-len * .9)}" stroke="#4f7556" stroke-opacity=".5" stroke-width=".35" fill="none"/></g>`;
}
function babyBreath(x, y, n = 12) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const dx = J(-9, 9), dy = J(-9, 3);
    s += `<path d="M${f(x + dx * .2)} ${f(y + 7)} Q${f(x + dx * .6)} ${f(y + dy * .3 + 3)} ${f(x + dx)} ${f(y + dy)}" stroke="#8aa38f" stroke-width=".25" fill="none"/>`;
    s += `<circle cx="${f(x + dx)}" cy="${f(y + dy)}" r="${f(J(.9, 1.5))}" fill="#fffdf8" stroke="#e3d9cf" stroke-width=".25"/>`;
    if (R() > .5) s += `<circle cx="${f(x + dx + J(-1.6, 1.6))}" cy="${f(y + dy + J(-1.6, 1))}" r="${f(J(.5, .8))}" fill="#fffdf8"/>`;
  }
  return s;
}
function bud(x, y, ang, pal) {
  return `<g transform="translate(${x} ${y}) rotate(${ang})">` +
    `<path d="M0 1 Q1.2 9 0 17" stroke="#6f8f72" stroke-width="1" fill="none"/>` +
    `<path d="${petalD(11, 9, "round")}" fill="url(#pg-${pal})" stroke="${PAL[pal].edge}" stroke-opacity=".4" stroke-width=".3" transform="rotate(-14)"/>` +
    `<path d="${petalD(12, 9, "round")}" fill="url(#pg-${pal})" stroke="${PAL[pal].edge}" stroke-opacity=".4" stroke-width=".3" transform="rotate(11)"/>` +
    `<path d="${petalD(10, 7.5, "round")}" fill="url(#pg-${pal})" stroke="${PAL[pal].edge}" stroke-opacity=".4" stroke-width=".3" transform="rotate(-2)"/>` +
    `<path d="${petalD(6.5, 2.8, "round")}" fill="#7da283" transform="translate(0 1) rotate(205)"/>` +
    `<path d="${petalD(6.5, 2.8, "round")}" fill="#7da283" transform="translate(0 1) rotate(155)"/>` +
    `</g>`;
}
function sprayRose(x, y, s, pal) {
  return `<g transform="translate(${x} ${y})">` + ring(5, s * 1.15, s * 1.25, "round", pal, J(0, 72)) + ring(5, s * .85, s, "round", pal, J(0, 72)) +
    `<path d="M${f(-s * .25)} 0 a${f(s * .25)} ${f(s * .25)} 0 1 1 ${f(s * .4)} ${f(s * .15)}" stroke="${PAL[pal].edge}" stroke-opacity=".6" stroke-width=".4" fill="none"/></g>`;
}
function bouquetDefs() {
  let s = "<defs>";
  for (const k in PAL) s += `<linearGradient id="pg-${k}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${PAL[k].base}"/><stop offset=".8" stop-color="${PAL[k].tip}"/></linearGradient>`;
  s += `
  <linearGradient id="wrapL" x1="0" y1="0" x2="1" y2=".25"><stop offset="0" stop-color="#f4d6dc"/><stop offset=".65" stop-color="#e8b6c2"/><stop offset="1" stop-color="#cf90a3"/></linearGradient>
  <linearGradient id="wrapR" x1="0" y1=".2" x2="1" y2="0"><stop offset="0" stop-color="#d897a9"/><stop offset=".3" stop-color="#ecc2cc"/><stop offset="1" stop-color="#f7dee4"/></linearGradient>
  <linearGradient id="backA" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e3aebb"/><stop offset="1" stop-color="#f3d2d9"/></linearGradient>
  <linearGradient id="backB" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#dba2b1"/><stop offset="1" stop-color="#efc8d1"/></linearGradient>
  <linearGradient id="tissue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf6"/><stop offset="1" stop-color="#f1e2dc"/></linearGradient>
  <linearGradient id="satin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9a3a5c"/><stop offset=".45" stop-color="#cf6c8c"/><stop offset=".58" stop-color="#e79ab1"/><stop offset="1" stop-color="#a3436a"/></linearGradient>
  <linearGradient id="euc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bccdc0"/><stop offset="1" stop-color="#85a090"/></linearGradient>
  <linearGradient id="leafG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#5f8a66"/><stop offset="1" stop-color="#9cbf9e"/></linearGradient>
  <filter id="soft" x="-25%" y="-25%" width="150%" height="150%"><feDropShadow dx="0" dy=".8" stdDeviation=".9" flood-color="#5a2a40" flood-opacity=".22"/></filter>
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 .35  0 0 0 0 .18  0 0 0 0 .25  .38 0 0 0 -.14" result="g"/>
    <feComposite in="g" in2="SourceGraphic" operator="in" result="gi"/>
    <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="gi"/></feMerge>
  </filter>`;
  return s + "</defs>";
}
function makeBokeh(i, w) {
  const c = document.createElement("canvas"); c.width = c.height = w;
  const g = c.getContext("2d");
  const pals = [["#f3c6cf", "#c9798f"], ["#f7dcc4", "#d6957a"], ["#e6d6ea", "#a585a6"], ["#f5e6d3", "#c8a98a"], ["#f9d5dc", "#d48aa0"], ["#dfe6d8", "#94a891"]];
  const [a, b] = pals[i % pals.length];
  const gr = g.createLinearGradient(0, 0, w, w); gr.addColorStop(0, a); gr.addColorStop(1, b);
  g.fillStyle = gr; g.fillRect(0, 0, w, w);
  const rr = mulberry32(i * 97 + 13);
  for (let k = 0; k < 14; k++) {
    const x = rr() * w, y = rr() * w, r = w * (.06 + rr() * .16);
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, `rgba(255,255,255,${(.25 + rr() * .35).toFixed(2)})`);
    rg.addColorStop(.7, `rgba(255,255,255,${(.08 + rr() * .1).toFixed(2)})`);
    rg.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  const vg = g.createRadialGradient(w / 2, w / 2, w * .2, w / 2, w / 2, w * .75);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(60,20,40,.25)");
  g.fillStyle = vg; g.fillRect(0, 0, w, w);
  return c.toDataURL("image/jpeg", .85);
}

function buildBouquet() {
  R = mulberry32(20261019);
  const tag = CONFIG.bouquet.tag || "";

  // giấy gói phía sau
  const back = `<g class="fade" filter="url(#grain)">
    <path d="M96 176 L8 80 C20 52 46 30 80 20 L106 172Z" fill="url(#backA)"/>
    <path d="M104 176 L192 82 C182 54 156 30 120 18 L94 172Z" fill="url(#backB)"/>
    <path d="M100 180 L30 56 C52 38 78 40 100 28 C122 40 148 36 170 56Z" fill="url(#tissue)" opacity=".94"/>
    <path d="M100 176 L52 46 M100 176 L148 44" stroke="#d9b8bf" stroke-opacity=".5" stroke-width=".5" fill="none"/>
  </g>`;

  // lá, hoa baby
  let green = '<g class="fade" style="animation-delay:.15s">';
  for (const [ang, len] of [[-168, 62], [-150, 74], [-128, 78], [-102, 68], [-78, 74], [-52, 76], [-30, 72], [-12, 60]]) green += eucalyptus(100, 96, ang + J(-5, 5), len + J(-6, 6));
  green += longLeaf(58, 118, 165, 36, 9) + longLeaf(142, 116, 15, 36, 9) + longLeaf(98, 58, -96, 42, 8) + longLeaf(30, 88, 200, 28, 7) + longLeaf(172, 86, -20, 28, 7);
  for (const [x, y, n] of [[50, 28, 12], [152, 24, 12], [100, 22, 10], [18, 84, 11], [184, 86, 11], [26, 116, 8], [176, 114, 8], [110, 104, 6], [74, 74, 5], [118, 66, 5]]) green += babyBreath(x, y, n);
  green += "</g>";

  // nụ + hồng chùm nhỏ (không có ảnh)
  let fill = '<g filter="url(#soft)">';
  const smalls = [
    () => bud(100, 22, -4, "wine"), () => bud(42, 40, -34, "rose"), () => bud(160, 36, 30, "blush"),
    () => bud(16, 100, -72, "cream"), () => bud(186, 98, 72, "apricot"),
    () => sprayRose(108, 104, 5, "cream"), () => sprayRose(152, 112, 5, "mauve"), () => sprayRose(30, 82, 5, "apricot"), () => sprayRose(104, 46, 4.5, "blush")
  ];
  smalls.forEach((fn, i) => { fill += `<g class="bloom" style="animation-delay:${(.2 + i * .07).toFixed(2)}s">${fn()}</g>`; });
  fill += "</g>";

  // hoa có ảnh: vẽ hết cánh trước, rồi mới đặt ảnh lên trên để không cánh nào che ảnh
  let heads = "", photos = "";
  SLOTS.forEach((s, i) => {
    const d = .35 + i * .12, hasPhoto = s.p < FLOWER_PHOTOS.length;
    heads += `<g transform="translate(${s.x} ${s.y}) rotate(${s.rot})"><g class="bloom" style="animation-delay:${d.toFixed(2)}s" filter="url(#soft)">${head(s.type, s.r, s.pal)}${hasPhoto ? "" : flowerCenter(s.type, s.r, s.pal)}</g></g>`;
    if (!hasPhoto) return;
    photos += `<g class="flower" data-p="${s.p}" role="button" tabindex="0" aria-label="Xem ảnh ${s.p + 1}" transform="translate(${s.x} ${s.y}) rotate(${s.rot})"><g class="hov"><g class="bloom" style="animation-delay:${(d + .15).toFixed(2)}s">${photoPart(s.r, i, FLOWER_PHOTOS[s.p])}${s.type === "cosmos" ? stamens(s.r) : cup(s.r, s.pal)}</g></g></g>`;
  });

  // giấy gói phía trước
  const front = `<g class="fade" filter="url(#grain)">
    <path d="M24 127 C40 133 58 124 76 132 C88 137 94 128 104 136 C118 128 132 136 148 128 C160 124 170 130 178 123 L124 176 L76 176Z" fill="url(#tissue)" stroke="#e6d3cb" stroke-width=".4"/>
    <path d="M182 128 C160 145 128 152 94 148 L97 180 L96 238 Q110 241 124 236 C121 216 119 198 117 182 C140 168 166 148 182 128Z" fill="url(#wrapR)"/>
    <path d="M155 146 Q134 166 116 182" stroke="#c98a9b" stroke-opacity=".35" stroke-width=".5" fill="none"/>
    <path d="M108.6 146 L105.6 180 L106.6 238" stroke="#9c5d71" stroke-opacity=".22" stroke-width="2.2" fill="none"/>
    <path d="M18 131 C42 146 76 152 107 146 L104 180 L105 238 Q90 241 77 236 C80 216 82 198 84 182 C62 170 36 150 18 131Z" fill="url(#wrapL)"/>
    <path d="M44 147 Q68 166 86 182" stroke="#c98a9b" stroke-opacity=".35" stroke-width=".5" fill="none"/>
    <path d="M18 131 C42 146 76 152 107 146" stroke="#fff" stroke-opacity=".55" stroke-width=".6" fill="none"/>
    <path d="M182 128 C160 145 128 152 94 148" stroke="#fff" stroke-opacity=".45" stroke-width=".6" fill="none"/>
  </g>`;

  // nơ lụa + thiệp
  const ribbon = `<g class="fade" style="animation-delay:.25s">
    <path d="M97 184 C92 196 96 208 86 226 L90 224.5 L91.5 229.5 C100 212 98 198 101.5 185Z" fill="url(#satin)"/>
    <path d="M103 184 C110 198 104 212 114 230 L110 228 L108.5 232.5 C100 214 104 198 99 185Z" fill="url(#satin)"/>
    <path d="M82 175 Q100 180 118 175 L118.5 185 Q100 190 81.5 185Z" fill="url(#satin)"/>
    <path d="M100 181 C90 166 70 164 72 176 C73 186 90 188 100 181Z" fill="url(#satin)"/>
    <path d="M100 181 C92 172 80 171 79 177 C84 179 92 181 100 181Z" fill="#7f2e4b" opacity=".35"/>
    <path d="M100 181 C110 165 131 165 128 177 C127 187 110 188 100 181Z" fill="url(#satin)"/>
    <path d="M100 181 C108 172 120 171 121 177 C116 179 108 181 100 181Z" fill="#7f2e4b" opacity=".35"/>
    <rect x="95.5" y="176.5" width="9" height="9" rx="3" fill="url(#satin)" stroke="#7f2e4b" stroke-opacity=".3" stroke-width=".4"/>
    ${tag ? `<path d="M104 184 C112 191 117 194 123 196.5" stroke="#b08a6a" stroke-width=".4" fill="none"/>
    <g transform="translate(122 194) rotate(14)">
      <path d="M0 3 L4 0 L44 0 Q46 0 46 2 L46 16 Q46 18 44 18 L4 18 L0 15Z" fill="#ecd9bd" stroke="#c9ad88" stroke-width=".4"/>
      <circle cx="4.6" cy="9" r="1.2" fill="#f7ece0" stroke="#c9ad88" stroke-width=".3"/>
      <text x="25.5" y="12" text-anchor="middle" font-family="Dancing Script, cursive" font-weight="700" font-size="6.8" fill="#6b3554"></text>
    </g>` : ""}
  </g>`;

  $("#bq").innerHTML = `<div class="bq-sway"><svg viewBox="0 0 200 250" aria-hidden="false">${bouquetDefs()}${back}${green}${fill}${heads}${photos}${front}${ribbon}</svg></div>`;
  const t = $("#bq text"); if (t) t.textContent = tag;
}
$("#bq").addEventListener("keydown", (e) => {
  const fl = e.target.closest && e.target.closest(".flower");
  if (fl && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); fl.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
});

function openBouquet() {
  photosReady.then(() => {
    buildBouquet();
    show("bouquet");
  });
}
$("#bq").addEventListener("click", (e) => {
  const f = e.target.closest(".flower"); if (!f) return;
  const i = +f.dataset.p;
  $("#lbImg").src = FLOWER_PHOTOS[i];
  lb.hidden = false;
});
const lb = $("#lb");
function closeLightbox() { lb.hidden = true; }
lb.addEventListener("click", closeLightbox);
