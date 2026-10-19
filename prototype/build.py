#!/usr/bin/env python3
"""Собирает прототип лендинга в один HTML-файл: стили, скрипты, картинки и сцены интерфейса внутри.

    python3 build.py                          # prototype/bro-landing-prototype.html, системный шрифт
    python3 build.py --fonts DIR --out FILE   # плюс SF Pro Display из DIR (*.woff) в base64.
        # Шрифты лицензионные: такую сборку не коммитим.
"""
import argparse, base64, json, pathlib, re, sys

HERE = pathlib.Path(__file__).resolve().parent
SRC, ASSETS = HERE / 'src', HERE / 'assets'
sys.path.insert(0, str(HERE.parent / 'landing-motion'))
import build as scenes  # noqa: E402  (landing-motion/build.py)

SCENES = {'smeta': 'smeta-demo.html', 'plan': 'plan-demo.html', 'client': 'client-demo.html', 'extra': 'extra-demo.html'}

def svg(d, w=18, sw=1.8):
    return (f'<svg width="{w}" height="{w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round">{d}</svg>')

ICONS = {
    'check': svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 18, 2.2),
    'clock': svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', 20, 1.9),
    'eye': svg('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', 20, 1.9),
    'arrow': svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 18, 1.8),
    'chev': svg('<path d="M6 9l6 6 6-6"/>', 18, 1.8),
    'x': svg('<path d="M6 6l12 12M18 6L6 18"/>', 18, 2),
    'calc': svg('<rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M8.5 6.5h7v3h-7zM8.5 13h.01M12 13h.01M15.5 13h.01M8.5 16.5h.01M12 16.5h.01M15.5 16.5h.01"/>', 22, 1.6),
    'user': svg('<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>', 22, 1.6),
    'wrench': svg('<path d="M14.5 6.5a4 4 0 0 0 5 5L11 20a2.1 2.1 0 0 1-3-3zM4 4l4 4M3 7l3-3"/>', 22, 1.6),
    'users': svg('<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5a6 6 0 0 1 12 0M16 4.8a3.2 3.2 0 0 1 0 6.4M17.5 13.6A6 6 0 0 1 21 19.5"/>', 22, 1.6),
    'pencil': svg('<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-4-4L4 16zM13.5 6.5l4 4"/>', 22, 1.6),
    'chat': svg('<path d="M4 5h11v8H8l-4 3zM15 9h5v8l-3-2.5h-6.5"/>', 22, 1.6),
    'calendar': svg('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M12 14h2M16 14h.5M8 17h2"/>', 22, 1.6),
    'cash': svg('<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/><path d="M6 9.5v5M18 9.5v5"/>', 22, 1.6),
    'down': svg('<path d="M12 5v14M6 13l6 6 6-6"/>', 20, 2),
    # иконки Heroicons со страниц входа и регистрации bro.petrovich.ru
    'arrowleft': '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"></path></svg>',
    'phone': '<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"></path></svg>',
    'mail': '<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"></path></svg>',
    'usercircle': '<svg width="28" height="28" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path></svg>',
    'building': svg('<path d="M4 21V5.5L13 3v18M13 8.5l7 2V21M2.5 21h19M7 8h3M7 11.5h3M7 15h3M16 13.5h1.5M16 17h1.5"/>', 22, 1.6),
}
# иконки кита «UI-kit BRO App» (h-icon/outline/*), выгружены из макета: prototype/assets/icons/<имя>.svg, в разметке {{i:ic_<имя с подчёркиваниями>}}
for _f in sorted((ASSETS / 'icons').glob('*.svg')):
    ICONS['ic_' + _f.stem.replace('-', '_')] = _f.read_text(encoding='utf-8').strip()
CURSOR = '<svg width="14" height="15" viewBox="0 0 14 15"><path d="M1 1l11.5 6.3-5.3 1.4L4.4 14z" fill="#262A3B" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>'
CMP = ['Смета из шаблона за пару кликов', 'Цены из каталога Петровича', 'План-график и задержки', 'Финансы по каждому объекту', 'Работа с телефона']

def data_uri(name):
    f = next(ASSETS.glob(name + '.*'))
    mime = {'.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml'}[f.suffix]
    return f'data:{mime};base64,' + base64.b64encode(f.read_bytes()).decode()

def logo(white=False):
    s = (ASSETS / 'logo.svg').read_text(encoding='utf-8')
    s = re.sub(r'\swidth="\d+"', ' width="100%" style="display:block"', s, count=1)
    return s.replace('#262A3A', '#fff') if white else s

def js_str(s):  # строка для вставки в <script>: экранируем закрывающие теги
    return json.dumps(s, ensure_ascii=False).replace('</', '<\\/')

def build(fonts_dir=None):
    page = (SRC / 'page.html').read_text(encoding='utf-8')
    font_css = scenes.font_css(fonts_dir) if fonts_dir else ''
    rows = ''.join(f'<div class="tr"><span class="body">{r}</span><span class="x">✕</span><span class="v"><span>{ICONS["check"]}</span></span></div>' for r in CMP)
    rep = {
        '{{css}}': (SRC / 'style.css').read_text(encoding='utf-8'),
        '{{js}}': (SRC / 'app.js').read_text(encoding='utf-8'),
        '{{logo}}': logo(), '{{petr_word}}': (ASSETS / 'petrovich_word.svg').read_text(encoding='utf-8'), '{{logo_white}}': logo(True), '{{cursor}}': CURSOR, '{{cmp_rows}}': rows,
        '{{font_css}}': js_str(font_css),
        '{{scenes}}': '{' + ','.join(f'{json.dumps(k)}:{js_str(scenes.build(v))}' for k, v in SCENES.items()) + '}',
        '{{icons}}': json.dumps(ICONS, ensure_ascii=False),
    }
    for k, v in rep.items():
        page = page.replace(k, v)
    page = re.sub(r'\{\{i:(\w+)\}\}', lambda m: ICONS[m.group(1)], page)
    page = re.sub(r'\{\{img:(\w+)\}\}', lambda m: data_uri(m.group(1)), page)
    left = re.findall(r'\{\{[^}]+\}\}', page)
    assert not left, left
    return page

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--fonts')
    ap.add_argument('--out', default=str(HERE / 'bro-landing-prototype.html'))
    a = ap.parse_args()
    out = pathlib.Path(a.out)
    out.write_text(build(a.fonts), encoding='utf-8')
    print(out, out.stat().st_size // 1024, 'KB')
