"""Extracción reproducible, sin OCR ni completar celdas. Requiere pdftotext y PyMuPDF.
--check coteja archivos ya incorporados; extracción y prueba no certifican aplicabilidad.
"""
import fitz, subprocess, re, hashlib, json, sys
from collections import Counter
from pathlib import Path
BASE=Path(__file__).resolve().parent.parent
pdf=BASE/'fuentes/sigas-ed15-2025/manual-tecnico.pdf'
D=fitz.open(pdf)
assert len(D)==48
text=subprocess.check_output(['pdftotext','-layout',str(pdf),'-'],text=True)
pages=text.split('\f')
def n(x):return float(x.replace(',','.'))
raw={'id':'sigas','nombre':'SIGAS Thermofusión','habilitado':False,'fuente':{'archivo':'fuentes/sigas-ed15-2025/manual-tecnico.pdf','sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'paginas':48,'edicion':'15 - 2025','fechaEditorial':'Julio 2025','paginaEdicion':46,'portadaEdicion':1,'metadatosPDFCreacion':'2025-06-27','origen':'PDF original adjuntado por el usuario','validacionNormativa':False},'tablas':{}}
for pagina,numero,gas,rho in [(22,4,'GN',.65),(23,5,'propano-gaseoso',1.52)]:
 filas=[]
 for line in pages[pagina-1].splitlines():
  tokens=line.split()
  if len(tokens)!=20 or not re.fullmatch(r'\d+',tokens[0]) or not re.fullmatch(r'\d+',tokens[10]):continue
  assert all(re.fullmatch(r'\d+,\d+',s) for s in tokens[1:10]+tokens[11:20])
  for k,bloque in [(0,'izquierdo'),(10,'derecho')]:
   longitud=int(tokens[k]);qs=tokens[k+1:k+10]
   # Segundo extractor por coordenadas: comparar los 10 campos de cada fila.
   ws=D[pagina-1].get_text('words'); anchors=[w for w in ws if w[4]==str(longitud) and (w[0]<60 if k==0 else 280<w[0]<340) and w[1]>290]
   assert len(anchors)==1,(pagina,longitud,anchors)
   corte=min(w[0] for w in ws if re.fullmatch(r'\d+',w[4]) and 280<w[0]<340 and w[1]>290)-1
   y=anchors[0][1]; row=sorted([w for w in ws if abs(w[1]-y)<1.5 and (w[0]<corte if k==0 else w[0]>corte)],key=lambda w:w[0])
   assert [w[4] for w in row]==tokens[k:k+10],(pagina,longitud,[w[4] for w in row],tokens[k:k+10])
   filas.append({'longitudM':longitud,'capacidadesM3h':list(map(n,qs)),'originales':qs,'pagina':pagina,'bloque':bloque})
 assert len(filas)==60
 raw['tablas'][str(numero)]={'numero':numero,'pagina':pagina,'gas':gas,'unidadCapacidad':'m3/h','unidadLongitud':'m','unidadDiametros':'mm','densidadRelativa':rho,'caidaPresionImpresa':{'valor':10,'unidad':'mm','presionSuministro':None},'exterioresMm':[20,25,32,40,50,63,75,90,110],'interioresTabuladosMm':[13.24,18.19,24.94,33,42.80,54.84,63,74,94],'filas':sorted(filas,key=lambda f:f['longitudM'])}
longs=[2,4,6,8,10,15,20,25,30,35,40,45,50,60,70,80,90,100];filas=[]
for line in pages[20].splitlines():
 m=re.match(r'^\s*(\d+\s*a\s*\d+|\d+)\s+((?:\d+\s+){9,}\d+)\s*$',line)
 if not m:continue
 label,vals=m.groups();nums=[int(v) for v in vals.split()]
 if any(v not in [25,32,40,50,63,75,90,110] for v in nums):continue
 limits=[int(v) for v in re.findall(r'\d+',label)];assert len(nums)<=18
 filas.append({'medidoresMin':limits[0],'medidoresMax':limits[-1],'etiquetaOriginal':label,'diametrosMm':nums+[None]*(18-len(nums)),'pagina':21})
assert len(filas)==21
raw['tablas']['6']={'numero':6,'pagina':21,'gas':'GN','uso':'prolongaciones de baja presión para instalación de medidores','unidadDiametro':'mm','unidadLongitud':'m','longitudesM':longs,'filas':filas}
accesorios=[]
for pagina in [24,25]:
 ws=D[pagina-1].get_text('words');configs=[('izquierdo',212,240,250,278,280,311,40,211),('derecho',478,505,515,544,550,580,315,477)] if pagina==24 else [('izquierdo',184,212,221,250,260,282,20,183),('derecho',450,478,487,516,524,548,290,449)]
 for bloque,lo,hi,dlo,dhi,nlo,nhi,deslo,deshi in configs:
  anchors=sorted([w for w in ws if lo<=w[0]<hi and 130<w[1]<810 and re.fullmatch(r'\d+,\d+',w[4])],key=lambda w:w[1])
  for i,w in enumerate(anchors):
   y=w[1];desc=sorted([a for a in ws if deslo<=a[0]<deshi and abs(a[1]-y)<2],key=lambda a:a[0])
   def cell(a,b):
    vals=[q[4] for q in ws if a<=q[0]<b and abs(q[1]-y)<1];assert len(vals)==1,(pagina,bloque,i,a,vals);return vals[0]
   de,no=cell(dlo,dhi),cell(nlo,nhi);nombre=' '.join(a[4] for a in desc)
   assert nombre,(pagina,bloque,i)
   accesorios.append({'id':f'sigas-p{pagina}-{bloque}-{i+1:02d}','nombreOriginal':nombre,'longitudEquivalenteM':n(w[4]),'diametroExteriorM':n(de),'numeroDiametros':int(no),'originales':{'longitudEquivalente':w[4],'diametroExterior':de,'numeroDiametros':no},'pagina':pagina,'bloque':bloque,'fila':i+1})
# Segundo extractor para todos los números de accesorios (sin completar por fórmulas).
rawacc=subprocess.check_output(['pdftotext','-raw','-f','24','-l','25',str(pdf),'-'],text=True)
lineas=[l.strip() for l in rawacc.splitlines()]
decimales=Counter(l for l in lineas if re.fullmatch(r'\d+,\d+',l))
assert decimales==Counter(f['originales'][k] for f in accesorios for k in ['longitudEquivalente','diametroExterior'])
enteros=Counter(l for l in lineas if re.fullmatch(r'\d+',l));enteros.subtract(['24','25'])
assert +enteros==Counter(f['originales']['numeroDiametros'] for f in accesorios)
raw['tablas']['3']={'numero':3,'paginas':[24,25],'titulo':'Pérdida de carga en accesorios','unidadEquivalente':'m','unidadDiametro':'m','tipoDiametro':'exterior (no interior)','filas':accesorios}
out='/* Transcripción del PDF SIGAS ed.15: originales y coordenadas conservados. Sin habilitación. */\n(function(root){const datos='+json.dumps(raw,ensure_ascii=False,indent=2)+";if(typeof module==='object'&&module.exports)module.exports=datos;else root.SIGAS_ED15_2025=datos;})(globalThis);\n"
path=BASE/'datos/catalogos/sigas/tablas-ed15-2025.js'
if '--check' in sys.argv:
 assert path.read_text()==out,'Transcripción distinta del original extraído; revisar sin sobrescribir.'
else:path.write_text(out)
print('SIGAS: 2 × 540 capacidades,',len(accesorios),'accesorios,',sum(x is not None for f in filas for x in f['diametrosMm']),'celdas de prolongaciones; sin habilitación técnica.')
