# -*- coding: utf-8 -*-
"""Gộp index.html + assets/ thành một file duy nhất để publish lên link Artifact.

    python build-artifact.py        ->  dist/artifact.html

Bản web (Vercel) dùng index.html tách file; bản artifact cần một file duy nhất
và không có thẻ <!doctype>/<html>/<head>/<body> vì nền tảng tự bọc.
"""
import io, os, re

root = os.path.dirname(os.path.abspath(__file__))
FILES = ['data', 'kpi', 'ui', 'pages', 'nhansu', 'excel', 'sinhhoat', 'boot']

html = io.open(os.path.join(root, 'index.html'), encoding='utf-8').read()
markup = re.search(r'<body>\n(.*?)\n<script src="assets/', html, re.S).group(1).strip()
css = io.open(os.path.join(root, 'assets', 'styles.css'), encoding='utf-8').read()
js = '\n'.join(io.open(os.path.join(root, 'assets', f + '.js'), encoding='utf-8').read() for f in FILES)

out = '''<meta charset="utf-8">
<title>Sổ tay Liên chi đoàn KHUD</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap">
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
<style>
%s</style>

%s

<script>
%s
</script>
''' % (css, markup, js)

os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
path = os.path.join(root, 'dist', 'artifact.html')
io.open(path, 'w', encoding='utf-8', newline='\n').write(out)
print('da tao', path, '-', len(out), 'ky tu')
