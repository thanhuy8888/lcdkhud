# -*- coding: utf-8 -*-
"""Gộp index.html + assets/ thành một file duy nhất để publish lên link Artifact.

    python build-artifact.py        ->  dist/artifact.html

Bản web (Vercel) dùng index.html tách file; bản artifact cần một file duy nhất
và không có thẻ <!doctype>/<html>/<head>/<body> vì nền tảng tự bọc.
"""
import io, os, re

root = os.path.dirname(os.path.abspath(__file__))
FILES = ['config', 'data', 'kpi', 'ui', 'auth', 'pages', 'nhansu', 'excel', 'sinhhoat', 'boot']
VENDOR_FILES = ['xlsx.full.min.js', 'supabase.js']

html = io.open(os.path.join(root, 'index.html'), encoding='utf-8').read()
markup = re.search(r'<body>\r?\n([\s\S]*?)\r?\n<script src="assets/', html).group(1).strip()
css = io.open(os.path.join(root, 'assets', 'styles.css'), encoding='utf-8').read().replace('\r\n', '\n')
vendor_js = '\n'.join(io.open(os.path.join(root, 'assets', 'vendor', f), encoding='utf-8').read().replace('\r\n', '\n') for f in VENDOR_FILES)
js = '\n'.join(io.open(os.path.join(root, 'assets', f + '.js'), encoding='utf-8').read().replace('\r\n', '\n') for f in FILES)

out = f'''<meta charset="utf-8">
<title>Sổ tay Liên chi đoàn KHUD</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap">
<script>
{vendor_js}
</script>
<style>
{css}</style>

{markup}

<script>
{js}
</script>
'''

os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
path = os.path.join(root, 'dist', 'artifact.html')
io.open(path, 'w', encoding='utf-8', newline='\n').write(out)
print('da tao', path, '-', len(out), 'ky tu')
