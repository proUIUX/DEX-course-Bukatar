/* Прототип лендинга Петрович.BRO v2: поведение страницы */
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
const navMap = { who: 'who', features: 'features', client: 'client', app: 'app' };
const navIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) $$('.hdr nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
Object.keys(navMap).forEach(id => { const el = document.getElementById(id); if (el) navIO.observe(el); });

/* Появление блоков */
const rvIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rvIO.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -14% 0px' });
$$('.rv, .app .pop').forEach(el => rvIO.observe(el));
// Подстраховка при очень быстрой прокрутке: показываем всё, что уже выше нижнего края окна
let rvT; addEventListener('scroll', () => { clearTimeout(rvT); rvT = setTimeout(() => $$('.rv:not(.in), .app .pop:not(.in)').forEach(el => { if (el.getBoundingClientRect().top < innerHeight * .86) el.classList.add('in'); }), 120); }, { passive: true });

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

/* Боль → решение: карточки появляются по очереди, «было» зачёркивается, «стало» проявляется */
new IntersectionObserver((es, o) => es.forEach(async e => {
  if (!e.isIntersecting) return; o.disconnect();
  for (const c of $$('.bc', e.target)) { c.classList.add('in'); await sleep(reduce ? 0 : 220); }
}), { threshold: .2, rootMargin: '0px 0px -14% 0px' }).observe($('#pairs'));

/* Карточки возможностей: вкладки с автопереключением, под каждой своя сцена */
const W = 'white', Y = 'ylw';
const CARDS = {
  smeta: [
    { t: 'Шаблоны', h: 'Смета из шаблона', p: 'Выберите системный или свой шаблон: работы и материалы с ценами Петровича подставятся сами', scene: 'smeta', q: 'zoom=1.3', d: 21500, chips: [[20, 120, W, 'Шаблон выбран', 'системный, 20 позиций', 11500], [859, 330, Y, 'Цены Петровича', 'подтянулись сами', 13500]] },
    { t: 'Калькулятор', h: 'Объёмы по размерам', p: 'Введите размеры помещения. Площади посчитаются и встанут в позиции сметы', scene: 'extra', q: 'view=calc&zoom=1.35', d: 11500, chips: [[20, 400, W, 'Пол 6 м², стены 26 м²', 'посчитано по размерам', 7800]] },
    { t: 'Импорт из Excel', h: 'Смета из Excel', p: 'Загрузите готовую смету файлом. Разделы и позиции перенесутся, работу продолжите в сервисе', scene: 'extra', q: 'view=import&zoom=1.35', d: 10500, chips: [[859, 120, Y, '20 позиций', 'перенесены из Excel', 6800]] },
    { t: 'Наценка', h: 'Наценка в один шаг', p: 'Задайте процент на работы и материалы. Цены для заказчика пересчитаются, наценку видите только вы', scene: 'extra', q: 'view=markup&zoom=1.3', d: 10500, chips: [[20, 420, W, 'Работы 15%, материалы 10%', 'наценка по типам позиций', 4800]] },
  ],
  plan: [
    { t: 'План-график', h: 'График из сметы', p: 'Работы из сметы встают в график. Отмечайте выполненное, задержки и сдвиги видно сразу', scene: 'plan', q: 'zoom=1.2', d: 12500, chips: [[28, 452, W, 'Задержка +2 дня', 'Гидроизоляция пола', 8000], [798, 120, Y, 'Плитка сдвинулась', 'план пересчитан сам', 9200]] },
    { t: 'Финансы', h: 'Деньги по объекту', p: 'Отмечайте оплаты заказчика и расходы. Видно, сколько получено, сколько осталось и какая прибыль', scene: 'extra', q: 'view=finance&zoom=1.3', d: 9500, chips: [[798, 120, Y, 'Оплачено 57%', 'осталось получить 114 221 ₽', 5600]] },
    { t: 'Акты', h: 'Акты из сметы', p: 'Акт собирается из выполненных работ и уходит заказчику', scene: 'extra', q: 'view=acts&zoom=1.25', d: 7000, chips: [[28, 420, W, 'Акт 2 сформирован', 'из сметы на ремонт ванной', 3200]] },
    { t: 'Документы', h: 'Документы и фото', p: 'Договор, сметы и фото хранятся в карточке объекта, заказчик видит их у себя', scene: 'extra', q: 'view=docs&zoom=1.25', d: 7000, chips: [] },
  ],
  client: [
    { t: 'Приглашение', h: 'Приглашение в пару кликов', p: 'Отправьте заказчику приглашение. Себестоимость и наценка останутся скрыты', scene: 'client', q: 'zoom=1.25', d: 13500, chips: [[20, 120, W, 'Приглашение отправлено', 'Ирина Смирнова', 4200]] },
    { t: 'Смета', h: 'Понятная смета', p: 'Заказчик видит позиции и итог без наценки и может сразу купить материалы в Петровиче', scene: 'client', q: 'state=0', d: 7000, chips: [[20, 150, W, 'Статус сметы изменен', 'Новая → В работе', 500], [800, 400, Y, 'Наценку видите только вы', '', 1300]] },
    { t: 'Сроки', h: 'Сроки без звонков', p: 'Ход работ и задержки заказчик смотрит сам, в браузере или в приложении', phone: true, d: 7000, chips: [[140, 150, W, 'Задержка +2 дня', 'заказчик видит сразу', 500], [626, 360, Y, 'Ход работ онлайн', 'без звонков мастеру', 1300]] },
    { t: 'Документы', h: 'Всё в одном месте', p: 'Договор, акты и фото не потеряются в переписке', scene: 'extra', q: 'view=docs&zoom=1.25', d: 7000, chips: [] },
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
  // Описание активного экрана вместо отзыва: меняется вместе с вкладкой
  const tinfo = $('.tinfo', card);
  tinfo.innerHTML = `<div class="tbody"><span class="tn"></span><b class="th"></b><p class="tp"></p></div><div class="dots">${cfg.map((c, i) => `<button data-i="${i}" aria-label="${c.t}"></button>`).join('')}</div>`;
  const dots = $$('.dots button', tinfo);
  $('.dots', tinfo).addEventListener('click', e => { const b = e.target.closest('button'); if (b) activate(+b.dataset.i, true); });
  let infoT;
  function showInfo(i, instant) {
    const c = cfg[i], body = $('.tbody', tinfo);
    dots.forEach((d, j) => d.classList.toggle('on', j === i));
    const put = () => { $('.tn', tinfo).textContent = `${i + 1} из ${cfg.length}, ${c.t}`; $('.th', tinfo).textContent = c.h; $('.tp', tinfo).textContent = c.p; body.classList.remove('sw'); };
    clearTimeout(infoT);
    if (instant || reduce) return put();
    body.classList.add('sw'); infoT = setTimeout(put, 220);
  }
  showInfo(0, true);
  function activate(i, byUser) {
    if (byUser) manual = true;
    timers.forEach(clearTimeout); timers = [];
    if (frame) { frame.remove(); frame = null; }
    cur = i; elapsed = 0; t0 = performance.now();
    tabs.forEach((t, j) => { t.classList.toggle('on', j === i); t.style.setProperty('--p', '0%'); });
    views.forEach((v, j) => v.classList.toggle('on', j === i));
    showInfo(i);
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
  }), { threshold: .35, rootMargin: '200px 0px -15% 0px' }).observe(card);
  controllers[key] = { activate: i => activate(i, true), card };
});

/* «Для кого»: переход к нужной карточке и вкладке */
$$('[data-go]').forEach(b => b.addEventListener('click', ev => {
  ev.preventDefault();
  const [k, i] = b.dataset.go.split(':'), c = controllers[k];
  c.card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  setTimeout(() => c.activate(+i), reduce ? 0 : 500);
}));

/* Таблица Excel или BRO: строки отмечаются по очереди */
new IntersectionObserver((es, o) => es.forEach(async e => {
  if (!e.isIntersecting) return; o.disconnect();
  for (const r of $$('.tr:not(.th)', e.target)) { r.classList.add('in'); const s = $('.v span', r); s.classList.add('hl'); await sleep(reduce ? 0 : 220); setTimeout(() => s.classList.remove('hl'), 500); }
}), { threshold: .4, rootMargin: '0px 0px -12% 0px' }).observe($('#cmp'));

/* SEO-текст */
$('#seoBtn').addEventListener('click', () => { const s = $('#seo'); s.classList.toggle('open'); $('#seoBtn span').textContent = s.classList.contains('open') ? 'Свернуть' : 'Показать полностью'; });

/* Вход и регистрация (прототип): модальное окно по макету страниц bro.petrovich.ru, данные никуда не отправляются */
const mdl = $('#mdl');
const scr = n => { $$('.scr', mdl).forEach(s => s.classList.toggle('on', s.dataset.scr === n)); mdl.dataset.cur = n; };
const closeMdl = () => mdl.classList.remove('on');
function openReg(kind) {
  scr(kind === 'login' ? 'login' : 'reg'); mdl.classList.add('on');
  $$('.fld.bad', mdl).forEach(f => f.classList.remove('bad'));
  setTimeout(() => $('.scr.on form:not([hidden]) input', mdl).focus(), 300);
}
$$('[data-reg]').forEach(b => b.addEventListener('click', () => openReg(b.dataset.reg)));
mdl.addEventListener('click', e => { if (e.target === mdl) closeMdl(); });
addEventListener('keydown', e => { if (e.key === 'Escape') closeMdl(); });
$('[data-back]', mdl).addEventListener('click', () => { if (mdl.dataset.cur === 'reg') scr('login'); else closeMdl(); });
$$('[data-go-scr]', mdl).forEach(b => b.addEventListener('click', () => scr(b.dataset.goScr)));
$$('.atabs button', mdl).forEach(b => b.addEventListener('click', () => {
  $$('.atabs button', mdl).forEach(x => x.classList.toggle('on', x === b));
  $('[data-form="login-phone"]', mdl).hidden = b.dataset.tab !== 'phone';
  $('[data-form="login-email"]', mdl).hidden = b.dataset.tab !== 'email';
}));
$$('[data-mask="phone"]', mdl).forEach(inp => inp.addEventListener('input', () => {
  const d = inp.value.replace(/\D/g, '').replace(/^[78]/, '').slice(0, 10), p = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 8), d.slice(8, 10)];
  inp.value = d ? '+7 ' + p[0] + (p[1] ? ' ' + p[1] : '') + (p[2] ? '-' + p[2] : '') + (p[3] ? '-' + p[3] : '') : '';
}));
const RULES = {
  phone: [v => v.replace(/\D/g, '').length === 11, 'Введите номер телефона полностью'],
  email: [v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), 'Укажите почту, например name@mail.ru'],
  pass: [v => v.length > 0, 'Введите пароль'],
};
$$('.aform', mdl).forEach(form => {
  $$('.ainp', form).forEach(i => i.addEventListener('input', () => i.closest('.fld').classList.remove('bad')));
  form.addEventListener('submit', e => {
    e.preventDefault(); let ok = true;
    $$('.ainp', form).forEach(i => { const [test, msg] = RULES[i.dataset.mask], f = i.closest('.fld'); const good = test(i.value); f.classList.toggle('bad', !good); $('.err', f).textContent = good ? '' : msg; ok = ok && good; });
    if (ok) { closeMdl(); setTimeout(() => toast('Это прототип: в рабочей версии откроется следующий шаг'), 300); }
  });
});
})();
