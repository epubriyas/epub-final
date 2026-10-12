"""Create real, bounded viewing excerpts; keep original files outside public storage."""
import json, re, subprocess, zipfile, hashlib
from pathlib import Path
from xml.etree import ElementTree as ET
from html.parser import HTMLParser
from PIL import Image
from pypdf import PdfReader

root = Path('private-uploads/portfolio-source')
output = Path('private-uploads/portfolio-prepared')
output.mkdir(parents=True, exist_ok=True)
inventory = json.loads((root / 'inventory.json').read_text(encoding='utf-8'))
samples = []
audit = []

class Text(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts = []; self.skip = 0
    def handle_starttag(self, tag, attrs):
        if tag in ('script','style'): self.skip += 1
        if tag in ('p','div','h1','h2','h3','li','br'): self.parts.append('\n\n')
    def handle_endtag(self, tag):
        if tag in ('script','style'): self.skip = max(0,self.skip-1)
    def handle_data(self, data):
        if not self.skip: self.parts.append(data)
    def text(self): return re.sub(r'\n\s*\n+', '\n\n', ''.join(self.parts)).strip()

def prepare_pdf(source, title, category, service, identifier):
    reader = PdfReader(source)
    if reader.is_encrypted and not reader.decrypt(''): return
    count = len(reader.pages)
    # Bounded excerpt: full source files are never part of the browser payload.
    texts = [(reader.pages[i].extract_text() or '').replace('\x00','') for i in range(min(count,6))]
    contact = sorted(set(re.findall(r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}', '\n'.join(texts))))
    slug = identifier
    folder = output / slug; folder.mkdir(exist_ok=True)
    subprocess.run(['pdftoppm','-f','1','-l',str(min(count,6)),'-scale-to','1700','-png',str(source),str(folder/'page')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    pages = []
    for index, image in enumerate(sorted(folder.glob('page-*.png'))):
        target = image.with_suffix('.webp')
        with Image.open(image) as img: img.convert('RGB').save(target,'WEBP',quality=86)
        image.unlink()
        pages.append({'path':str(target.resolve()),'sourcePage':index+1,'text':texts[index]})
    samples.append({'title':title,'slug':slug,'sampleCategory':category,'serviceSlug':service,'fileType':'pdf','sourcePageCount':count,'previewNote':f'Viewing excerpt: {len(pages)} of {count} source pages. Original files are not offered for download.','pages':pages,'thumbnail':pages[0]['path'],'sourceName':source.name})
    audit.append({'title':title,'sourcePages':count,'previewPages':len(pages),'contactDetailsForReview':contact})

for entry in inventory:
    ext = Path(entry['name']).suffix.lower()
    source = root / (entry['id']+ext)
    if not source.exists(): continue
    if ext == '.pdf':
        if not source.read_bytes()[:8].startswith(b'%PDF-'): raise ValueError(f'Invalid PDF response: {entry["name"]}')
        service = 'desktop-publishing' if 'DTP_Sample' in entry['folder'] else 'typesetting'
        category = 'Multilingual DTP' if service == 'desktop-publishing' else 'Publishing & Typesetting'
        title = {'Arabic_2.pdf':'Arabic document layout','BENGALI-BD.pdf':'Bengali document layout','French_Sample_1.pdf':'French document layout','Plataforma Brasil.pdf':'Portuguese document layout'}.get(entry['name'],entry['name'].removesuffix('.pdf')+' typesetting sample')
        slug = re.sub(r'[^a-z0-9]+','-',title.lower()).strip('-')
        prepare_pdf(source,title,category,service,slug)
    elif ext == '.zip' and 'PDF_to_INDD' in entry['folder']:
        with zipfile.ZipFile(source) as archive:
            names = archive.namelist()
            audit.append({'archive':entry['name'],'contents':names})
            pdfs = [name for name in names if name.lower().endswith('.pdf') and not name.startswith('__MACOSX') and '/Links/' not in name]
            for i,name in enumerate(pdfs[:2]):
                if archive.getinfo(name).file_size > 50*1024*1024: continue
                target = root / (entry['id']+f'-{i}.pdf')
                target.write_bytes(archive.read(name))
                variant = 'output' if '/Output/' in name else 'source'
                prepare_pdf(target,f'PDF-to-layout {entry["name"].removesuffix(".zip").lower()} - {variant}','Document Conversion','data-conversion',f'pdf-to-layout-{entry["name"].split()[1].split(".")[0]}-{i+1}')
    elif ext == '.epub':
        with zipfile.ZipFile(source) as archive:
            if archive.read('mimetype').strip() != b'application/epub+zip': raise ValueError('Invalid EPUB')
            container = ET.fromstring(archive.read('META-INF/container.xml'))
            package_path = next(e.attrib['full-path'] for e in container.iter() if e.tag.endswith('rootfile'))
            package = ET.fromstring(archive.read(package_path))
            base = Path(package_path).parent
            items = {e.attrib['id']: e.attrib for e in package.iter() if e.tag.endswith('}item')}
            refs = [e.attrib['idref'] for e in package.iter() if e.tag.endswith('itemref') and e.attrib.get('linear','yes') != 'no']
            title = next((e.text for e in package.iter() if e.tag.endswith('}title') and e.text),'EPUB sample')
            sections = []
            for ref in refs:
                item = items.get(ref)
                if not item or 'html' not in item.get('media-type',''): continue
                text = Text(); text.feed(archive.read(str(base/item['href']).replace('\\','/')).decode('utf-8',errors='replace'))
                body = text.text()
                if len(body) < 250: continue
                heading = body.split('\n')[0][:110]
                sections.append({'title':heading or f'Section {len(sections)+1}','text':body[:18000]})
                if len(sections) == 4: break
            covers = [item for item in items.values() if 'image' in item.get('media-type','') and ('cover' in item.get('properties','') or 'cover' in item.get('href','').lower())]
            if not covers: covers = [item for item in items.values() if 'image' in item.get('media-type','')]
            if not sections or not covers: audit.append({'epub':entry['name'],'issue':'No readable section or cover available'}); continue
            slug = 'epub-'+hashlib.sha256(entry['id'].encode()).hexdigest()[:10]
            folder = output/slug; folder.mkdir(exist_ok=True)
            import io
            try:
                with Image.open(io.BytesIO(archive.read(str(base/covers[0]['href']).replace('\\','/')))) as cover:
                    cover.thumbnail((1100,1400)); cover.convert('RGB').save(folder/'cover.webp','WEBP',quality=86)
            except Exception as error: audit.append({'epub':entry['name'],'issue':str(error)}); continue
            samples.append({'title':title+' · EPUB sample','slug':slug,'sampleCategory':'eBook & EPUB','serviceSlug':'ebook-creation','fileType':'epub','previewNote':'Reading excerpt from the source EPUB. Original typography, embedded audio/video and interactive features are not reproduced. Original files are not offered for download.','sections':sections,'pages':[],'thumbnail':str((folder/'cover.webp').resolve()),'sourceName':entry['name']})
            audit.append({'epub':entry['name'],'packageVersion':package.attrib.get('version'),'title':title,'sections':len(sections)})
(output/'manifest.json').write_text(json.dumps(samples,ensure_ascii=False,indent=2),encoding='utf-8')
(output/'audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'preparedSamples':len(samples),'audit':audit},ensure_ascii=False))
