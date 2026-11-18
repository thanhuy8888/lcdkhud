const fs = require('fs');
const path = require('path');

const root = __dirname;
const FILES = ['config', 'data', 'kpi', 'ui', 'auth', 'pages', 'nhansu', 'excel', 'sinhhoat', 'boot'];
const VENDOR_FILES = ['xlsx.full.min.js', 'supabase.js'];

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const markupMatch = html.match(/<body>\r?\n([\s\S]*?)\r?\n<script src="assets\//);
const markup = markupMatch ? markupMatch[1].trim() : '';
const css = fs.readFileSync(path.join(root, 'assets', 'styles.css'), 'utf8').replace(/\r\n/g, '\n');
const vendorJs = VENDOR_FILES.map(f => fs.readFileSync(path.join(root, 'assets', 'vendor', f), 'utf8').replace(/\r\n/g, '\n')).join('\n');
const js = FILES.map(f => fs.readFileSync(path.join(root, 'assets', f + '.js'), 'utf8').replace(/\r\n/g, '\n')).join('\n');

const out = `<meta charset="utf-8">
<title>Sổ tay Liên chi đoàn KHUD</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap">
<script>
${vendorJs}
</script>
<style>
${css}</style>

${markup}

<script>
${js}
</script>
`;

const distDir = path.join(root, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}
const outPath = path.join(distDir, 'artifact.html');
fs.writeFileSync(outPath, out.replace(/\r\n/g, '\n'), 'utf8');
console.log('Successfully built artifact to', outPath, '—', out.length, 'bytes');
