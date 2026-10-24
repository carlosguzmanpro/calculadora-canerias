"""Extracción documental FUSIOGAS V.1.2026; no habilita aplicación técnica.
Requiere pdftotext y PyMuPDF. --check no escribe. No interpola ni completa.
"""
import fitz, re, json, hashlib, subprocess, sys
from pathlib import Path
B=Path(__file__).resolve().parent.parent
pdf=B/'fuentes/fusiogas-v1-2026/manual-tecnico.pdf'
doc=fitz.open(pdf)
assert len(doc)==40
pages=subprocess.check_output(['pdftotext','-layout',str(pdf),'-'],text=True).split('\f')
assert re.search(r'de\s+4\s+metros',pages[27],re.I), 'Largo comercial no localizado en p.28'
assert 'V.1.2026' in pages[0], 'Edición no localizada en portada'
num=lambda x:float(x.replace(',','.'))
d={'id':'fusiogas','nombre':'FUSIOGAS Thermofusión','habilitado':False,'fuente':{'archivo':str(pdf.relative_to(B)),'sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'edicion':'V.1.2026','paginas':40,'paginaEdicion':1,'origen':'Manual original adjuntado por el usuario','validacionNormativa':False},'tablas':{},'accesorios':[],'productos':[],'largoComercial':{'metros':4,'pagina':28,'alcance':'Tubos exteriores 20, 25, 32, 40, 50 y 63 mm'}}
for pagina,gas,rho in [(19,'GN',.65),(20,'GLP',1.52)]:
 filas=[];ws=doc[pagina-1].get_text('words')
 for di in ['13,24','18,19','24,94','33,00','42,80','54,84']:assert re.search(r'di\s*'+di,pages[pagina-1]),(pagina,di)
 assert '10 mm' in pages[pagina-1] and ('0.65' if gas=='GN' else '1.52') in pages[pagina-1], 'Condiciones impresas ausentes'
 for line in pages[pagina-1].splitlines():
  tok=line.split()
  if len(tok)!=14 or not tok[0].isdigit() or not tok[7].isdigit():continue
  assert all(re.fullmatch(r'\d+,\d+',s) for s in tok[1:7]+tok[8:])
  for k,block in [(0,'izquierdo'),(7,'derecho')]:
   # Cotejar una segunda extracción, por coordenadas de la línea y bloque.
   anchors=[w for w in ws if w[4]==tok[k] and w[1]>280 and (60<w[0]<85 if k==0 else 290<w[0]<330)]
   assert len(anchors)==1,(pagina,tok[k],anchors)
   y=anchors[0][1]
   row=sorted([w for w in ws if abs(w[1]-y)<1.5 and (w[0]<300 if k==0 else w[0]>=300)],key=lambda w:w[0])
   assert [w[4] for w in row]==tok[k:k+7],(pagina,tok[k],[w[4] for w in row])
   filas.append({'longitudM':int(tok[k]),'capacidadesM3h':list(map(num,tok[k+1:k+7])),'originales':tok[k+1:k+7],'pagina':pagina,'bloque':block})
 assert len(filas)==60
 d['tablas'][gas]={'pagina':pagina,'gas':gas,'unidadCapacidad':'m3/h','unidadLongitud':'m','unidadDiametros':'mm','densidadRelativa':rho,'caidaPresionImpresa':{'valor':10,'unidad':'mm','presionSuministro':None},'exterioresMm':[20,25,32,40,50,63],'interioresTabuladosMm':[13.24,18.19,24.94,33,42.8,54.84],'filas':sorted(filas,key=lambda f:f['longitudM'])}
ws=doc[17].get_text('words')
for bloque,lx,dx,nx,desc in [('izquierdo',186.4,224.9,269.2,50),('derecho',433,471.5,515.8,300)]:
 anchors=sorted([w for w in ws if abs(w[0]-lx)<1 and w[1]>230 and re.fullmatch(r'\d+,\d+',w[4])],key=lambda w:w[1])
 assert len(anchors)==(43 if bloque=='izquierdo' else 45)
 for i,w in enumerate(anchors):
  y=w[1]
  at=lambda x:[v[4] for v in ws if abs(v[0]-x)<1 and abs(v[1]-y)<1]
  de=at(dx);no=[v[4] for v in ws if nx-10<v[0]<nx+10 and abs(v[1]-y)<1];assert len(de)==len(no)==1,(bloque,i+1,w,de,no)
  name=' '.join(v[4] for v in sorted(ws,key=lambda v:v[0]) if desc<=v[0]<lx-2 and abs(v[1]-y)<1)
  assert name
  d['accesorios'].append({'id':f'fusiogas-p18-{bloque}-{i+1}','nombreOriginal':name,'longitudEquivalenteM':num(w[4]),'diametroExteriorM':num(de[0]),'numeroDiametros':int(no[0]),'originales':[w[4],de[0],no[0]],'pagina':18,'bloque':bloque,'fila':i+1})
# Regiones de catálogo: se transcriben texto de medida y código, no se infieren por patrón.
regions={28:[('Tubo',1,230,320),('Sobrepaso',0,440,480),('Transición hembra',1,440,530),('Transición macho',0,640,730),('Codo 90° rosca hembra',1,640,770)],29:[('Codo 90° fusión',0,240,310),('Codo 45° fusión',1,240,310),('Te fusión',0,440,550),('Te reducción fusión',1,440,550),('Cupla fusión',0,645,750),('Cupla reducción fusión',1,645,750)],30:[('Buje reducción con aro tope removible',0,240,345),('Niple entrefusión con aro tope removible',1,240,315),('Llave esférica fusión',0,420,460),('Llave esférica roscada',1,420,450),('Tapa fusión',0,600,680),('Montura reparación',1,600,680)]}
for page,regs in regions.items():
 ws=doc[page-1].get_text('words')
 for family,side,y0,y1 in regs:
  codes=sorted([w for w in ws if re.fullmatch(r'020\d{4}',w[4]) and y0<w[1]<y1 and (w[0]<300 if side==0 else w[0]>300)],key=lambda w:w[1])
  assert codes,(page,family)
  for w in codes:
   measure=' '.join(v[4] for v in sorted(ws,key=lambda v:v[0]) if (185 if side==0 else 425)<v[0]<w[0]-2 and abs(v[1]-w[1])<1)
   assert measure,(page,family,w)
   d['productos'].append({'codigo':w[4],'familia':family,'medidaOriginal':measure,'pagina':page,**({'largoComercialM':4} if family=='Tubo' else {})})
assert len(d['productos'])==108,len(d['productos'])
assert len(set(p['codigo'] for p in d['productos']))==len(d['productos'])
out=B/'datos/catalogos/fusiogas/tablas-v1-2026.js'
s='/* Datos originales FUSIOGAS; regenerar con scripts/extraer-fusiogas-v1.py. */\n(function(root){const datos='+json.dumps(d,ensure_ascii=False,indent=2)+';\nif(typeof module===\'object\'&&module.exports)module.exports=datos;else root.FUSIOGAS_V1_2026=datos;\n})(globalThis);\n'
if '--check' in sys.argv:assert out.read_text()==s,'Transcripción difiere de extracción original'
else:out.write_text(s)
print('FUSIOGAS: 720 capacidades, 88 equivalencias y',len(d['productos']),'productos cotejados con el PDF; aplicabilidad pendiente.')
