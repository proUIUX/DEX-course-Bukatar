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
    'tag': svg('<path d="M3 12V4h8l9.5 9.5-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>', 22, 1.6),
    'upload': svg('<path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15M12 15V4M7.5 8.5L12 4l4.5 4.5"/>', 22, 1.6),
    'calc': svg('<rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M8.5 6.5h7v3h-7zM8.5 13h.01M12 13h.01M15.5 13h.01M8.5 16.5h.01M12 16.5h.01M15.5 16.5h.01"/>', 22, 1.6),
    'user': svg('<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>', 22, 1.6),
    'sparkles': svg('<path d="M9.5 4l1.6 4.4L15.5 10l-4.4 1.6L9.5 16l-1.6-4.4L3.5 10l4.4-1.6zM17.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8zM17 3l.6 1.4L19 5l-1.4.6L17 7l-.6-1.4L15 5l1.4-.6z"/>', 22, 1.5),
    'building': svg('<path d="M4 21V5.5L13 3v18M13 8.5l7 2V21M2.5 21h19M7 8h3M7 11.5h3M7 15h3M16 13.5h1.5M16 17h1.5"/>', 22, 1.6),
}
CURSOR = '<svg width="14" height="15" viewBox="0 0 14 15"><path d="M1 1l11.5 6.3-5.3 1.4L4.4 14z" fill="#262A3B" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>'
CMP = ['Смета из шаблона за пару кликов', 'Цены из каталога Петровича', 'Заказчик видит итог без наценки',
       'План-график и задержки', 'Финансы по каждому объекту', 'Работа с телефона']

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
        '{{logo}}': logo(), '{{logo_white}}': logo(True), '{{cursor}}': CURSOR, '{{cmp_rows}}': rows,
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
