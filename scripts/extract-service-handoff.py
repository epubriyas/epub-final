import json,zipfile,xml.etree.ElementTree as E,pathlib,argparse,re
specs={
 'voiceover':('Voiceover.docx',196,510,142,145),
 'cover-page-design':('CoverPage.docx',173,435,162,165),
 'copyediting':('EPUBTRANS_Copyedit_Proofread.docx',142,311,130,131),
 'proofreading':('EPUBTRANS_Copyedit_Proofread.docx',313,491,135,136),
 'elearning-localization':('EPUBTRAN_Elearning_Localization.docx',149,419,105,108),
 'accessibility':('EPUBTRAN_Accessibility.docx',117,393,79,82),
 'data-conversion':('EPUBTRAN_Data_Conversion.docx',116,340,104,107),
 'desktop-publishing':('EPUBTRAN_DTP.docx',100,334,89,92),
 'ebook-creation':('EPUBTRAN_Ebook_Creation.docx',105,303,92,95),
 'typesetting':('EPUBTRANS Typesetting services.docx',67,216,56,59),
}
links={'Subtitling Services':'/subtitling-services','Transcription Services':'/transcription-services','eLearning Localization Services':'/elearning-localization-services','Desktop Publishing Services':'/desktop-publishing-services','Multilingual Desktop Publishing':'/desktop-publishing-services','Accessibility Services':'/accessibility-services','Digital Accessibility Services':'/accessibility-services','Typesetting Services':'/typesetting-services','Copyediting Services':'/copyediting-services','Proofreading Services':'/proofreading-services','eBook Creation Services':'/ebook-creation-services','Graphic Design & Image Services':'/graphic-design-image-services','Data Conversion Services':'/data-conversion-services','Document & Data Conversion Services':'/data-conversion-services','SciELO XML Markup Services':'/scielo-xml-markup-services','Voiceover Services':'/voiceover-services','Translation Services':'/translation-services'}
secondary={'voiceover':'/contact-us','cover-page-design':'/contact-us','copyediting':'/proofreading-services','proofreading':'/copyediting-services','elearning-localization':'/services#elearning-multimedia','accessibility':'/services#digital-accessibility','data-conversion':'/services#document-conversion','desktop-publishing':'/services#localization-dtp','ebook-creation':'/services#ebook-xml','typesetting':'/services#publishing-editorial'}
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
parser=argparse.ArgumentParser();parser.add_argument('slug',choices=specs);parser.add_argument('--register',action='store_true');parser.add_argument('--documents',default='C:/Users/riyas/Downloads');args=parser.parse_args()
f,a,b,ti,di=specs[args.slug]
with zipfile.ZipFile(pathlib.Path(args.documents)/f) as z:root=E.fromstring(z.read('word/document.xml'))
p=[]
for el in root.findall('.//w:body//w:p',ns):
 text=''.join(t.text or '' for t in el.findall('.//w:t',ns)).strip()
 if not text:continue
 sizes=[int(s.get('{'+ns['w']+'}val')) for s in el.findall('.//w:sz',ns)]
 sty=el.find('w:pPr/w:pStyle',ns);sty=sty.get('{'+ns['w']+'}val') if sty is not None else ''
 level=1 if sty=='Heading1' or (sizes and max(sizes)>=40) else 2 if sty=='Heading2' or 36 in sizes else 3 if sty=='Heading3' or 27 in sizes else 0
 p.append({'text':text,'level':level,'list':el.find('w:pPr/w:numPr',ns) is not None})
assert p[a]['level']==1,(args.slug,p[a])
def meta(i):return p[i]['text'].split(': ',1)[1] if ': ' in p[i]['text'] else p[i+1]['text']
hero={'title':p[a]['text'],'lead':p[a+1]['text'],'paragraphs':[]};sections=[];section=None;group=None;target=hero['paragraphs'];ctas=[]
for r in p[a+2:b]:
 t=r['text']
 if re.match(r'^(Primary |Secondary )?CTA:',t):
  label=t.split(':',1)[1].strip()
  if t.startswith('Primary'):kind='primary';href='/get-a-quote'
  elif t.startswith('Secondary'):kind='secondary';href=secondary[args.slug] if section is None else '/contact-us'
  else:kind='contextual';href='/accessibility-services' if 'Accessibility' in label else '/services'
  link={'kind':'link','text':label,'href':href,'primary':kind=='primary'}
  if section is None:ctas.append(link)
  else:target.append(link)
  continue
 if r['level']==2:
  section={'title':t,'lead':[],'groups':[]};sections.append(section);target=section['lead'];group=None;continue
 if r['level']==3:
  group={'title':t,'blocks':[]};section['groups'].append(group);target=group['blocks'];continue
 if section is None:target.append(t);continue
 if t in ['Explore Copyediting Services','Explore Proofreading Services']:
  target.append({'kind':'link','text':t,'href':'/copyediting-services' if 'Copyediting' in t else '/proofreading-services','primary':False});continue
 if r['list']:
  if target and isinstance(target[-1],dict) and target[-1].get('kind')=='list':target[-1]['items'].append(t)
  else:target.append({'kind':'list','items':[t]})
 else:target.append({'kind':'paragraph','text':t})
for s in sections:
 t=s['title'].lower()
 s['kind']='faq' if 'frequently asked' in t else 'workflow' if 'our ' in t and 'workflow' in t else 'related' if t.startswith('related') else 'scope' if t.startswith('what affects') else 'quality' if t.startswith(('quality','dtp quality','epub validation','accessibility quality','elearning quality')) else 'capabilities' if (t.startswith('our ') and ('capabilit' in t or 'services' in t)) or t.startswith(('what our proofreading','what does copyediting')) else 'narrative'
 for g in s['groups']:
  if s['kind']=='related':g['href']=links.get(g['title'])
 if s['kind']=='related' and not s['groups']:
  remaining=[]
  for block in s['lead']:
   if block['kind']=='paragraph' and ': ' in block['text']:
    title,desc=block['text'].split(': ',1)
    s['groups'].append({'title':title,'blocks':[{'kind':'paragraph','text':desc}],'href':links.get(title)})
   else:remaining.append(block)
  s['lead']=remaining
sections[-1]['kind']='cta'
hero['actions']=ctas
out={'sourceDocument':f,'slug':args.slug,'seo':{'title':meta(ti),'description':meta(di)},'hero':hero,'sections':sections,'sourceCopyBlockCount':b-a}
path=pathlib.Path('src/config/service-handoffs')/(args.slug+'.json');path.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'slug':args.slug,'h1':hero['title'],'sections':len(sections),'sourceBlocks':b-a,'output':str(path)}))

if args.register:
 registry=pathlib.Path('src/lib/service-handoff.ts')
 code=registry.read_text(encoding='utf-8')
 variable='handoff'+''.join(part.title() for part in args.slug.split('-'))
 import_line=f"import {variable} from '@/config/service-handoffs/{args.slug}.json'"
 if f"@/config/service-handoffs/{args.slug}.json" not in code:
  code=import_line+'\n'+code
  code=code.replace('const handoffs: Record<string, ServiceHandoff> = {',f"const handoffs: Record<string, ServiceHandoff> = {{\n  '{args.slug}': {variable} as ServiceHandoff,")
  registry.write_text(code,encoding='utf-8')
