// Sebastian home page: the live phone, the scroll-driven teach screen,
// the sliding track of tiles, and reveal-on-scroll.

// Paste the app's App Store link here once it's live, e.g.
// 'https://apps.apple.com/app/id0000000000'. While it's empty the button
// reads "Coming soon to the App Store".
const APP_STORE_URL = '';

const $ = (id) => document.getElementById(id);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const tone = (name) => `var(--${name})`;

/* ---------- download button ---------- */
if (APP_STORE_URL) {
  const b = $('storeButton');
  b.href = APP_STORE_URL;
  b.removeAttribute('aria-disabled');
  $('storeSmall').textContent = 'Download on the';
}

/* ---------- header ---------- */
const header = $('top');
const onTop = () => header.classList.toggle('scrolled', scrollY > 24);

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

/* ---------- springs ---------- */
function springs(el, red, yellow) {
  const parts = [];
  if (red) parts.push(`${red} red`);
  if (yellow) parts.push(`${yellow} yellow`);
  el.innerHTML = '<i class="tok"></i>'.repeat(red) + '<i class="tok y"></i>'.repeat(yellow) + `<span>${parts.join(' · ')}</span>`;
}

function strip(el, segs) {
  el.querySelectorAll('b').forEach((b) => b.remove());
  const total = segs.reduce((n, s) => n + s.dur, 0);
  return segs.map((s) => {
    const b = document.createElement('b');
    b.style.width = `${(s.dur / total) * 100}%`;
    b.style.background = tone(s.tone);
    el.appendChild(b);
    return b;
  });
}

/* ---------- hero phone: a class that really runs ---------- */
const CLASS = [
  { cat: 'Legs', n: 18, name: 'Elevator lunge', note: 'Knee stacked over ankle. Press through the heel, not the toes.', red: 2, yellow: 1, dot: 'clay',
    segs: [{ name: 'Full range', dur: 9, tone: 'stone' }, { name: 'Hold', dur: 7, tone: 'clay' }, { name: 'Pulse', dur: 5, tone: 'rose' }] },
  { cat: 'Arms', n: 19, name: 'Wheelbarrow', note: 'Shoulders over wrists. Slow on the way out.', red: 1, yellow: 0, dot: 'denim',
    segs: [{ name: 'Tempo', dur: 8, tone: 'denim' }, { name: 'Burnout', dur: 6, tone: 'ochre' }] },
  { cat: 'Core', n: 20, name: 'Plank reach', note: 'Hips level. Reach long, don\'t rush the return.', red: 0, yellow: 1, dot: 'sage',
    segs: [{ name: 'Slow 3–1', dur: 8, tone: 'sage' }, { name: 'Hold', dur: 6, tone: 'clay' }] },
];
const hero = { move: 0, seg: 0, left: CLASS[0].segs[0].dur, bars: [], classLeft: 28 * 60 + 10 };

function heroDraw(moveChanged) {
  const m = CLASS[hero.move], s = m.segs[hero.seg], next = CLASS[(hero.move + 1) % CLASS.length];
  if (moveChanged) {
    hero.bars = strip($('hpStrip'), m.segs);
    $('hpCat').textContent = `${m.cat} · ${m.n} of 32`;
    $('hpMove').textContent = m.name;
    $('hpNote').textContent = m.note;
    $('hpNext').textContent = next.name;
    $('hpNextDot').style.background = tone(next.dot);
    springs($('hpSprings'), m.red, m.yellow);
    $('hpProgress').style.width = `${(m.n / 32) * 100}%`;
  }
  $('heroPhone').dataset.tone = s.tone;
  $('hpSeg').textContent = s.name;
  $('hpCount').textContent = clock(hero.left);
  $('hpLeft').textContent = clock(hero.classLeft);
  hero.bars.forEach((b, i) => b.classList.toggle('on', i === hero.seg));
  const total = m.segs.reduce((n, x) => n + x.dur, 0);
  const done = m.segs.slice(0, hero.seg).reduce((n, x) => n + x.dur, 0) + (s.dur - hero.left);
  const head = $('hpPlayhead');
  if (moveChanged) { head.style.transition = 'none'; head.style.left = '0%'; void head.offsetWidth; head.style.transition = ''; }
  head.style.left = `${((done + 1) / total) * 100}%`;
}

function heroTick() {
  hero.left -= 1;
  hero.classLeft = hero.classLeft > 1 ? hero.classLeft - 1 : 28 * 60 + 10;
  let moveChanged = false;
  if (hero.left <= 0) {
    hero.seg += 1;
    if (hero.seg >= CLASS[hero.move].segs.length) { hero.seg = 0; hero.move = (hero.move + 1) % CLASS.length; moveChanged = true; }
    hero.left = CLASS[hero.move].segs[hero.seg].dur;
  }
  heroDraw(moveChanged);
}
heroDraw(true);
let heroTimer = null;
new IntersectionObserver(([e]) => {      // only tick while the phone is on screen
  clearInterval(heroTimer);
  if (e.isIntersecting) heroTimer = setInterval(heroTick, 1000);
}).observe($('heroPhone'));

/* ---------- the track of tiles ---------- */
const TILES = [
  ['Plank reach', '1:30', 'sage', 0, 1, ['sage', 'clay']],
  ['Bear crawl', '1:40', 'sage', 1, 0, ['stone', 'rose']],
  ['change', '0:10'],
  ['Elevator lunge', '1:00', 'clay', 2, 1, ['stone', 'clay', 'rose']],
  ['Wheelbarrow', '1:00', 'denim', 2, 1, ['denim', 'ochre']],
  ['Mega plank', '0:45', 'sage', 2, 1, ['stone']],
  ['change', '0:10'],
  ['Side lunge', '1:15', 'rose', 1, 1, ['stone', 'mauve']],
  ['Twisted saw', '1:00', 'ochre', 1, 1, ['ochre', 'clay']],
  ['Row', '1:30', 'olive', 1, 1, ['olive', 'stone', 'rose']],
  ['change', '0:10'],
  ['Catfish', '1:00', 'mauve', 0, 2, ['mauve', 'clay']],
  ['Hamstring stretch', '0:45', 'stone', 0, 1, ['stone']],
];
$('track').innerHTML = TILES.map((t) => {
  if (t[0] === 'change') return `<div class="tile change"><div class="t-top">Spring change</div><div class="t-top"><time style="margin:0">${t[1]}</time></div></div>`;
  const [name, time, cat, red, yellow, segs] = t;
  const label = [red && `${red} red`, yellow && `${yellow} yellow`].filter(Boolean).join(' · ');
  return `<div class="tile"><div class="t-top"><i class="t-dot" style="background:${tone(cat)}"></i>${name}<time>${time}</time></div>`
    + `<div class="t-spr">${'<i class="tok"></i>'.repeat(red)}${'<i class="tok y"></i>'.repeat(yellow)}<span>${label}</span></div>`
    + `<div class="t-strip">${segs.map((s) => `<i style="flex:1;background:${tone(s)}"></i>`).join('')}</div></div>`;
}).join('');

/* ---------- recap bars ---------- */
const BAR = ['sage', 'sage', 'clay', 'denim', 'sage', 'rose', 'ochre', 'olive', 'mauve', 'clay', 'rose', 'denim', 'sage', 'ochre', 'stone'];
const PLAN = [6, 7, 5, 5, 4, 6, 5, 7, 5, 6, 5, 5, 6, 5, 4];
const RAN = [6, 7, 7, 8, 9, 6, 5, 7, 5, 6, 5, 5, 6, 5, 4];
const sum = RAN.reduce((a, b) => a + b, 0);
const bar = (vals) => vals.map((v, i) => `<i style="--i:${i};--w:${(v / sum) * 100}%;background:${tone(BAR[i])}"></i>`).join('');
$('barPlan').innerHTML = bar(PLAN);
$('barClass').innerHTML = bar(RAN);

/* ---------- teach: scroll scrubs through a move ---------- */
const MOVE = [{ name: 'Full range', dur: 30, tone: 'stone' }, { name: 'Hold', dur: 20, tone: 'clay' }, { name: 'Pulse', dur: 10, tone: 'rose' }];
const MOVE_TOTAL = 60, CHANGE = 10, MOVE_SHARE = 0.78;   // the last 22% of the scroll is the spring change
const teach = $('teach'), stage = $('teachStage');
const tsBars = strip($('tsStrip'), MOVE);
const caps = [...$('tsCaptions').children], dots = [...$('tsDots').children];
let lastState = '';

function teachDraw() {
  const r = teach.getBoundingClientRect();
  const p = clamp(-r.top / (r.height - innerHeight));
  let state, count, capIndex;
  if (p < MOVE_SHARE) {
    const t = (p / MOVE_SHARE) * MOVE_TOTAL;
    let acc = 0, i = 0;
    while (i < MOVE.length - 1 && t >= acc + MOVE[i].dur) { acc += MOVE[i].dur; i += 1; }
    count = Math.max(1, Math.ceil(MOVE[i].dur - (t - acc)));
    state = String(i); capIndex = i;
    $('tsPlayhead').style.left = `${(t / MOVE_TOTAL) * 100}%`;
    if (state !== lastState) {
      stage.dataset.tone = MOVE[i].tone;
      $('tsMove').textContent = 'Elevator lunge';
      $('tsSeg').textContent = MOVE[i].name;
      $('tsMeta').textContent = 'Teach mode · Legs · 18 of 32';
      springs($('tsSprings'), 2, 1);
      tsBars.forEach((b, n) => b.classList.toggle('on', n === i));
    }
  } else {
    const q = (p - MOVE_SHARE) / (1 - MOVE_SHARE);
    count = Math.max(1, Math.ceil(CHANGE * (1 - q)));
    state = 'change'; capIndex = 3;
    $('tsPlayhead').style.left = '100%';
    if (state !== lastState) {
      stage.dataset.tone = 'navy';
      $('tsMove').textContent = 'Spring change · drop to';
      $('tsSeg').innerHTML = '<i class="tok"></i>1 red';
      $('tsMeta').textContent = 'Next · Wheelbarrow';
      $('tsSprings').innerHTML = '<span style="margin:0">from 2 red · 1 yellow</span>';
      tsBars.forEach((b) => b.classList.remove('on'));
    }
  }
  $('tsCount').textContent = clock(count);
  if (state !== lastState) {
    caps.forEach((c, n) => c.classList.toggle('on', n === capIndex));
    dots.forEach((d, n) => d.classList.toggle('on', n === capIndex));
    $('tsHint').textContent = capIndex === 3 ? '' : 'Keep scrolling';
    lastState = state;
  }
}

/* ---------- scroll loop: parallax, track, teach ---------- */
const track = $('track'), trackWindow = track.parentElement;
const heroPhoto = document.querySelector('.hero-photo'), dlPhoto = document.querySelector('.dl-photo'), dl = $('download');
const phone = $('heroPhone');
const floaters = [...document.querySelectorAll('[data-parallax]')];

function frame() {
  ticking = false;
  onTop();
  teachDraw();
  if (reduceMotion) return;
  const vh = innerHeight;

  // hero: the photo drifts, the phone straightens as it leaves
  if (scrollY < vh * 1.2) {
    const h = clamp(scrollY / vh);
    heroPhoto.style.transform = `translate3d(0, ${scrollY * 0.22}px, 0) scale(${1 + h * 0.06})`;
    if (innerWidth > 900) phone.style.transform = `rotate(${4 - h * 4}deg) rotateY(${-10 + h * 10}deg) translateY(${-h * 30}px)`;
  }

  // track: slides left as its window crosses the screen
  const tw = trackWindow.getBoundingClientRect();
  if (tw.top < vh && tw.bottom > 0) {
    const p = clamp((vh - tw.top) / (vh + tw.height));
    const travel = Math.max(0, track.scrollWidth - innerWidth + 40);
    track.style.transform = `translate3d(${-p * travel}px, 0, 0)`;
  }

  // screenshots float at slightly different speeds
  for (const el of floaters) {
    const r = el.getBoundingClientRect();
    if (r.top > vh || r.bottom < 0) continue;
    const off = (r.top + r.height / 2 - vh / 2) * Number(el.dataset.parallax);
    el.firstElementChild.style.transform = `translate3d(0, ${off}px, 0) scale(1.06)`;
  }

  // download photo
  const dr = dl.getBoundingClientRect();
  if (dr.top < vh) dlPhoto.style.transform = `translate3d(0, ${(dr.top - vh) * -0.12 - 40}px, 0)`;
}
let ticking = false;
const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
addEventListener('scroll', request, { passive: true });
addEventListener('resize', request);
frame();
