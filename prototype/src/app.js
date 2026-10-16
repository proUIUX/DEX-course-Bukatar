/* Прототип лендинга Петрович.BRO v4: поведение страницы */
(() => {
const $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* Масштаб макета 1920 под ширину окна */
const fitZoom = () => document.documentElement.style.setProperty('--z', Math.min(1, document.documentElement.clientWidth / 1920));
addEventListener('resize', fitZoom); fitZoom();

/* Тосты для ссылок, которые ведут за пределы прототипа */
const toastEl = $('#toast'); let toastT;
const toast = t => { toastEl.textContent = t; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 2600); };
document.addEventListener('click', e => { const a = e.target.closest('[data-toast]'); if (a && !a.hasAttribute('data-close')) { e.preventDefault(); toast(a.dataset.toast); } });

/* Шапка: тень при прокрутке, активный пункт меню */
const hdr = $('#hdr');
addEventListener('scroll', () => hdr.classList.toggle('sc', scrollY > 10), { passive: true });
const navMap = { who: 'who', features: 'features', client: 'client', app: 'app' };
const navIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) $$('.hdr nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
Object.keys(navMap).forEach(id => { const el = document.getElementById(id); if (el) navIO.observe(el); });

/* Появление блоков */
const rvIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rvIO.unobserve(e.target); } }), { threshold: .12 });
$$('.rv, .app .pop').forEach(el => rvIO.observe(el));
// Подстраховка при очень быстрой прокрутке: показываем всё, что уже выше нижнего края окна
let rvT; addEventListener('scroll', () => { clearTimeout(rvT); rvT = setTimeout(() => $$('.rv:not(.in), .app .pop:not(.in)').forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in'); }), 120); }, { passive: true });

/* Сцены интерфейса: каждая живёт в iframe (srcdoc), параметры передаются через window.__Q */
let frameSeq = 0;
function sceneFrame(name, q) {
  const f = document.createElement('iframe');
  f.className = 'frame'; f.setAttribute('tabindex', '-1'); f.setAttribute('aria-hidden', 'true');
  const id = 'f' + (++frameSeq);
  const head = `<head><script>window.__Q=${JSON.stringify(q + '&embed&id=' + id)}<\/script>` + (window.FONT_CSS ? `<style>${window.FONT_CSS}</style>` : '') + '<style>html,body{background:transparent!important}</style>';
  f.srcdoc = window.SCENES[name].replace('<head>', head);
  f.dataset.id = id;
  return f;
}

/* Hero: плашки и телефон появляются по очереди */
(async () => {
  await sleep(reduce ? 0 : 700); $('#heroPhone').classList.add('in');
  for (const n of [1, 2, 3]) { await sleep(reduce ? 0 : 750); const c = $(`[data-hero="${n}"]`); c.classList.add('in'); setTimeout(() => c.classList.add('float'), 700); c.style.animationDelay = n * -1.7 + 's'; }
})();
const ICONS = window.PROTO_ICONS;

/* Заказчикам: «Предложить BRO бригаде» копирует готовое сообщение со ссылкой */
const INVITE = 'Давайте вести мой ремонт в Петрович.BRO: там смета, план-график и расходы по объекту, а я смогу следить за ходом работ онлайн. Это бесплатно: https://bro.petrovich.ru';
$('#invite').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(INVITE); } catch (e) { const ta = document.createElement('textarea'); ta.value = INVITE; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (_) {} ta.remove(); }
  toast('Сообщение для бригады скопировано, отправьте его мастеру');
});

/* Боль → решение: пузыри, стрелка и решение появляются по очереди */
new IntersectionObserver((es, o) => es.forEach(async e => {
  if (!e.isIntersecting) return; o.disconnect();
  for (const p of $$('.pair', e.target)) { p.classList.add('in'); await sleep(reduce ? 0 : 260); }
}), { threshold: .35 }).observe($('#pairs'));

/* Карточки возможностей: вкладки с автопереключением, под каждой своя сцена */
const W = 'white', Y = 'ylw';
const CARDS = {
  smeta: [
    { t: 'Шаблоны', scene: 'smeta', q: 'zoom=1.3', d: 21500, chips: [[20, 120, W, 'Шаблон выбран', 'системный, 20 позиций', 11500], [859, 330, Y, 'Цены Петровича', 'подтянулись сами', 13500]] },
    { t: 'Калькулятор', scene: 'extra', q: 'view=calc&zoom=1.35', d: 11500, chips: [[20, 400, W, 'Пол 6 м², стены 26 м²', 'посчитано по размерам', 7800]] },
    { t: 'Импорт из Excel', scene: 'extra', q: 'view=import&zoom=1.35', d: 10500, chips: [[859, 120, Y, '20 позиций', 'перенесены из Excel', 6800]] },
    { t: 'Наценка', scene: 'extra', q: 'view=markup&zoom=1.3', d: 10500, chips: [[20, 420, W, 'Работы 15%, материалы 10%', 'наценка по типам позиций', 4800]] },
  ],
  plan: [
    { t: 'План-график', scene: 'plan', q: 'zoom=1.2', d: 12500, chips: [[28, 452, W, 'Задержка +2 дня', 'Гидроизоляция пола', 8000], [798, 120, Y, 'Плитка сдвинулась', 'план пересчитан сам', 9200]] },
    { t: 'Финансы', scene: 'extra', q: 'view=finance&zoom=1.3', d: 9500, chips: [[798, 120, Y, 'Оплачено 57%', 'осталось получить 114 221 ₽', 5600]] },
    { t: 'Акты', scene: 'extra', q: 'view=acts&zoom=1.25', d: 7000, chips: [[28, 420, W, 'Акт 2 сформирован', 'из сметы на ремонт ванной', 3200]] },
    { t: 'Документы', scene: 'extra', q: 'view=docs&zoom=1.25', d: 7000, chips: [] },
  ],
  client: [
    { t: 'Приглашение', scene: 'client', q: 'zoom=1.25', d: 13500, chips: [[20, 120, W, 'Приглашение отправлено', 'Ирина Смирнова', 4200]] },
    { t: 'Смета', scene: 'client', q: 'state=0', d: 7000, chips: [[20, 150, W, 'Заказчик открыл смету', 'Ремонт ванной, только что', 500], [800, 400, Y, 'Наценку видите только вы', '', 1300]] },
    { t: 'Сроки', phone: true, d: 7000, chips: [[140, 150, W, 'Задержка +2 дня', 'заказчик видит сразу', 500], [626, 360, Y, 'Ход работ онлайн', 'без звонков мастеру', 1300]] },
    { t: 'Документы', scene: 'extra', q: 'view=docs&zoom=1.25', d: 7000, chips: [] },
  ],
};
const chipHTML = ([x, y, kind, b, s]) => `<div class="chip sm ${kind === Y ? 'ylw' : ''}" style="left:${x}px;top:${y}px"><span class="ic">${ICONS.check}</span><div><b>${b}</b>${s ? `<small>${s}</small>` : ''}</div></div>`;
const controllers = {};

$$('.prod').forEach(card => {
  const key = card.dataset.card, cfg = CARDS[key], pnl = $('.pnl', card), tabsEl = $('.tabs', card);
  tabsEl.innerHTML = cfg.map((c, i) => `<button class="tab" data-i="${i}">${c.t}<span class="u"><i></i></span></button>`).join('');
  const views = cfg.map(c => { const v = document.createElement('div'); v.className = 'view'; v.innerHTML = (c.phone ? `<img class="phonebox" src="${window.PHONE_IMG}" alt="Ход работ в приложении заказчика">` : '<div class="screen"></div>') + c.chips.map(chipHTML).join(''); pnl.appendChild(v); return v; });
  let cur = -1, t0 = 0, elapsed = 0, visible = false, frame = null, timers = [], manual = false;
  const tabs = $$('.tab', tabsEl);
  function activate(i, byUser) {
    if (byUser) manual = true;
    timers.forEach(clearTimeout); timers = [];
    if (frame) { frame.remove(); frame = null; }
    cur = i; elapsed = 0; t0 = performance.now();
    tabs.forEach((t, j) => { t.classList.toggle('on', j === i); t.style.setProperty('--p', '0%'); });
    views.forEach((v, j) => v.classList.toggle('on', j === i));
    const c = cfg[i], v = views[i];
    $$('.chip', v).forEach(ch => ch.classList.remove('in'));
    if (c.scene) { frame = sceneFrame(c.scene, c.q + (reduce ? '&state=0' : '')); $('.screen', v).appendChild(frame); }
    $$('.chip', v).forEach((ch, j) => timers.push(setTimeout(() => ch.classList.add('in'), reduce ? 0 : c.chips[j][5])));
  }
  const next = () => activate((cur + 1) % cfg.length);
  tabsEl.addEventListener('click', e => { const b = e.target.closest('.tab'); if (b) activate(+b.dataset.i, true); });
  // Сцена сообщает о конце прохода: переходим к следующей вкладке
  addEventListener('message', e => { if (e.data && e.data.type === 'bro-scene-loop' && frame && e.data.id === frame.dataset.id && visible && !reduce) next(); });
  // Прогресс под активной вкладкой; статичные вкладки переключаются по таймеру
  (function tick(now) {
    if (cur >= 0 && visible && !reduce) {
      elapsed += now - t0; const c = cfg[cur];
      const p = Math.min(c.scene && !c.q.includes('state') ? 97 : 100, elapsed / c.d * 100);
      tabs[cur].style.setProperty('--p', p + '%');
      if ((!c.scene || c.q.includes('state')) && elapsed >= c.d) next();
    }
    t0 = now; requestAnimationFrame(tick);
  })(performance.now());
  new IntersectionObserver(es => es.forEach(e => {
    visible = e.isIntersecting;
    if (visible && cur < 0) activate(0);
  }), { threshold: .35, rootMargin: '200px 0px 0px 0px' }).observe(card);
  controllers[key] = { activate: i => activate(i, true), card };
});

/* «Для кого»: переход к нужной карточке и вкладке */
$$('[data-go]').forEach(b => b.addEventListener('click', () => {
  const [k, i] = b.dataset.go.split(':'), c = controllers[k];
  c.card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  setTimeout(() => c.activate(+i), reduce ? 0 : 500);
}));

/* Таблица Excel или BRO: строки отмечаются по очереди */
new IntersectionObserver((es, o) => es.forEach(async e => {
  if (!e.isIntersecting) return; o.disconnect();
  for (const r of $$('.tr:not(.th)', e.target)) { r.classList.add('in'); const s = $('.v span', r); s.classList.add('hl'); await sleep(reduce ? 0 : 220); setTimeout(() => s.classList.remove('hl'), 500); }
}), { threshold: .4 }).observe($('#cmp'));

/* SEO-текст */
$('#seoBtn').addEventListener('click', () => { const s = $('#seo'); s.classList.toggle('open'); $('#seoBtn span').textContent = s.classList.contains('open') ? 'Свернуть' : 'Показать полностью'; });

/* Регистрация (прототип, без отправки данных) */
const mdl = $('#mdl');
const step = n => $$('.step', mdl).forEach(s => s.classList.toggle('on', s.dataset.s == n));
function openReg(kind) { $('#mTitle').textContent = kind === 'login' ? 'Вход в Петрович.BRO' : 'Регистрация'; step(1); mdl.classList.add('on'); setTimeout(() => $('#mPhone').focus(), 300); }
$$('[data-reg]').forEach(b => b.addEventListener('click', () => openReg(b.dataset.reg)));
mdl.addEventListener('click', e => { if (e.target === mdl || e.target.closest('[data-close]')) { const t = e.target.closest('[data-toast-after]'); mdl.classList.remove('on'); if (t) setTimeout(() => toast(t.dataset.toastAfter), 300); } });
addEventListener('keydown', e => { if (e.key === 'Escape') mdl.classList.remove('on'); });
const phone = $('#mPhone');
phone.addEventListener('input', () => { let d = phone.value.replace(/\D/g, '').replace(/^[78]/, '').slice(0, 10); const p = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 8), d.slice(8, 10)]; phone.value = '+7 ' + p[0] + (p[1] ? ' ' + p[1] : '') + (p[2] ? '-' + p[2] : '') + (p[3] ? '-' + p[3] : ''); });
$('#mNext').addEventListener('click', () => { if (phone.value.replace(/\D/g, '').length < 11) { phone.value = '+7 921 456-12-08'; } $('#mSent').textContent = 'Отправили код на номер ' + phone.value; step(2); setTimeout(() => $('.code input', mdl).focus(), 50); });
$$('.code input', mdl).forEach((inp, i, all) => inp.addEventListener('input', () => { if (inp.value && all[i + 1]) all[i + 1].focus(); }));
$('#mCode').addEventListener('click', () => step(3));
})();
