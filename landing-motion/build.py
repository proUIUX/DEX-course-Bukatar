#!/usr/bin/env python3
"""Собирает *-standalone.html: стили и скрипты встраиваются, файл открывается без соседних файлов.

    python3 build.py                     # standalone рядом со сценами, системный шрифт
    python3 build.py --fonts DIR --out OUT
        # плюс SF Pro Display из DIR (*.woff: Regular, Medium, Semibold, Bold) в base64.
        # Шрифты лицензионные: такие сборки не коммитим, держим локально.
"""
import argparse, base64, pathlib, re

HERE = pathlib.Path(__file__).resolve().parent
SCENES = ['smeta-demo.html', 'plan-demo.html', 'client-demo.html']
WEIGHTS = {'Regular': 400, 'Medium': 500, 'Semibold': 600, 'Bold': 700}


def font_css(d):
    css = []
    for f in sorted(pathlib.Path(d).glob('*.woff')):
        w = next((v for k, v in WEIGHTS.items() if k in f.name), None)
        if w:
            b64 = base64.b64encode(f.read_bytes()).decode()
            css.append(f'@font-face{{font-family:"SF Pro Display";font-weight:{w};src:url(data:font/woff;base64,{b64}) format("woff")}}')
    return '\n'.join(css)


def build(name, fonts=''):
    html = (HERE / name).read_text(encoding='utf-8')
    html = re.sub(r'<link rel="stylesheet" href="([^"]+)">',
                  lambda m: f'<style>\n{fonts}\n{(HERE / m.group(1)).read_text(encoding="utf-8")}</style>', html)
    html = re.sub(r'<script src="([^"]+)"></script>',
                  lambda m: f'<script>\n{(HERE / m.group(1)).read_text(encoding="utf-8")}</script>', html)
    return html


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--fonts')
    ap.add_argument('--out', default=str(HERE))
    a = ap.parse_args()
    fonts = font_css(a.fonts) if a.fonts else ''
    out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
    for s in SCENES:
        p = out / s.replace('.html', '-standalone.html')
        p.write_text(build(s, fonts), encoding='utf-8')
        print(p, p.stat().st_size // 1024, 'KB')
