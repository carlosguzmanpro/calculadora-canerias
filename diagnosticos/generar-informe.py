from pathlib import Path
import json,html,re
info=json.loads(Path('diagnosticos/resultado-calefon-cocina.json').read_text())
escenarios=info['escenarios']
def n(x,dec=3):return f'{x:.{dec}f}'
def orient(e):return 'Entrada por ramal: ambos recorridos giran 90°' if e['principal']=='ambos-90' else 'Paso directo a '+e['principal']+'; giro de 90° a '+('Cocina' if e['principal']=='Calefón' else 'Calefón')
def ruta(e,nombre):return next(r for r in e['resultado']['recorridos'] if r['artefacto']==nombre)
principal=next(e for e in escenarios if e['principal']=='ambos-90' and e['valvula']=='valvula-macho')
s=['# Prueba integral educativa · calefón y cocina',
'Base: rama `prueba/auditoria-final-tablas`, commit `279dcdc`. Rama de trabajo: `prueba/diagnostico-calefon-cocina`.',
'**DIAGNÓSTICO CONDICIONAL. NO DIÁMETROS DEFINITIVOS NI APROBACIÓN DE UNA INSTALACIÓN.** Se ejecutó el motor existente, sin conectar servicios y sin alterar las tablas.',
'## Datos, faltantes e hipótesis',
'Los datos proporcionados son M–A: 19 m y 5 codos 90°; A–Calefón: 18 m, 7 codos 90° y una llave; A–Cocina: 12 m, 5 codos 90° y una llave; una tee en A. Placas: 21950 y 10250 kcal/h. Poder calorífico del ejercicio: 9300 kcal/m³.',
'No se especificaron orientación de la tee, tipo de cada llave ni posiciones de accesorios/criterio de cuplas. Se ejecutan nueve escenarios: tres tipos de válvula (ambas del mismo tipo en cada escenario) y tres disposiciones de tee. No se cubren combinaciones de llaves de distinto tipo; tampoco se da por confirmada ninguna de estas hipótesis.',
'Las cuplas NO se contaron: faltan posiciones para reconstruir segmentos de 6 m. Sus equivalentes no se evaluaron. Esto es una limitación del diagnóstico, no una afirmación de que no existan o tengan pérdida cero. Puede cambiar la fila tabular o los candidatos si se completa ese dato.',
'Se usan d tabulados, no interiores comerciales acreditados. Los equivalentes de este diagnóstico se derivan como cantidad × factor × d, sin reemplazar los valores impresos del complemento. No se aprueba el criterio general de redondeo ni la edición/aplicabilidad. La tee se modela como una pieza reductora integrada 1″/1″/¾″, con equivalentes por diámetro de salida; su compatibilidad y esta regla de cálculo necesitan verificación. No se añade una reducción independiente que duplique ese cambio.',
'Las referencias de 50 m, 41 m y los diámetros se usan SOLO para comparar después del cálculo, nunca para seleccionar candidatos. Se evaluaron las nueve columnas de Tabla 3 (½″ a 4″).',
'## Consumos y recorridos reales',
'|Tramo|Consumo transportado (kcal/h)|Caudal (m³/h)|Caudal (L/h)|Longitud real del tramo (m)|',
'|---|---:|---:|---:|---:|']
for id,t in principal['resultado']['porTramo'].items():s.append(f'|{id}|{t["consumoKcal"]}|{n(t["caudal"],6)}|{n(t["caudal"]*1000,6)}|{t["longitudReal"]}|')
s+=['El troncal transporta 32200 kcal/h = 3,462365591… m³/h = 3462,365591… L/h. No se duplica el consumo ni el tramo compartido.',
'Calefón: M–A + A–Calefón = 19 + 18 = 37 m reales; selección inicial 37 + 15 = 52 m → fila 55 m. Cocina: 19 + 12 = 31 m reales; selección inicial 31 + 15 = 46 m → fila 46 m. Se presenta primero el recorrido más alejado, calefón.',
'## Resumen de los nueve escenarios',
'|Llaves (ambas)|Tee|Recorrido calefón (m)|Recorrido cocina (m)|Fila troncal (m)|Fila calefón (m)|Fila cocina (m)|Candidatos M–A / calefón / cocina|',
'|---|---|---:|---:|---:|---:|---:|---|']
for e in escenarios:
 r=e['resultado'];ts=r['porTramo'];s.append('|{}|{}|{}|{}|{}|{}|{}|{}|'.format(e['valvula'],orient(e),n(ruta(e,'Calefón')['longitudDefinitiva']),n(ruta(e,'Cocina')['longitudDefinitiva']),ts['M-A']['longitudFila'],ts['A-Calefón']['longitudFila'],ts['A-Cocina']['longitudFila'],' / '.join(r['propuestas'].values())))
s+=['Todos los escenarios calculados conservan candidatos 1″, 1″ y ¾″. Esto no prueba que sigan siendo adecuados al incorporar pérdidas aún no evaluadas. Los nueve estabilizan en un recálculo, sin necesitar una segunda iteración de diámetros.',
'## Comparación detallada: macho y entrada por ramal (ambos giros de 90°)',
'Este escenario se destaca para comparar aritmética; NO se adopta como descripción confirmada del croquis.',
'|Parte del recorrido|Accesorio/vía|Cálculo derivado|Equivalente (m)|',
'|---|---|---|---:|',
'|M–A, común|5 codos 90° de 1″|5 × 30 × 0,025|3,750|',
'|A–Calefón|7 codos 90° de 1″|7 × 30 × 0,025|5,250|',
'|A–Calefón|1 válvula macho de 1″|1 × 100 × 0,025|2,500|',
'|Salida tee hacia calefón|Giro 90°, d = 0,025|1 × 60 × 0,025|1,500|',
'|A–Cocina|5 codos 90° de ¾″|5 × 30 × 0,019|2,850|',
'|A–Cocina|1 válvula macho de ¾″|1 × 100 × 0,019|1,900|',
'|Salida tee hacia cocina|Giro 90°, d = 0,019|1 × 60 × 0,019|1,140|',
'Calefón: 37 + 3,75 + 5,25 + 2,50 + 1,50 = **50,00 m**. Cocina: 31 + 3,75 + 2,85 + 1,90 + 1,14 = **40,64 m**. Los 15 m iniciales no se conservan en estas sumas.',
'La diferencia frente a las referencias es 0,00 m para calefón y −0,36 m para cocina. Si la clase elevó 40,64 al metro entero superior, se explicaría el 41 aproximado; es una posibilidad, no un paso confirmado sin la planilla resuelta. **Tabla 3 no contiene una fila de 41 m: 40,64 y 41 se consultan en 42 m**. No se interpola ni se cambian datos para obtener 41 exactos.',
'Para una tee con calefón directo y cocina con giro, el motor da 49,00 y 40,64 m. El metro menos del calefón se debe exactamente a cambiar 60d = 1,50 m por 20d = 0,50 m. Si la cocina es directa y el calefón gira, da 50,00 y 39,88 m: la cocina pierde 0,76 m de equivalentes al pasar de 60d = 1,14 a 20d = 0,38. No se puede escoger la vía de cada salida independientemente para forzar resultados: ambas a 90° requiere entrada por el ramal.',
'El motor previo exigía una salida recta y una con giro. Se agregó únicamente en el contexto diagnóstico la representación explícita de entrada por ramal con dos giros. La entrada de producción sigue bloqueada mientras falten sus verificaciones.',
'Las nueve diferencias de redondeo de codos 45° no intervienen (no hay codos 45°). La divergencia 7,67/7,65 corresponde a cinco codos de 2″; tampoco interviene, porque los codos seleccionados en estos escenarios son de 1″ y ¾″. Esto no resuelve ni elimina los pendientes de auditoría.',
'## Traza completa por escenario: fases, filas y capacidades']
for i,e in enumerate(escenarios,1):
 r=e['resultado'];s+=['### Escenario '+str(i)+': '+e['valvula']+' · '+orient(e)]
 for h in r['historia']:
  s+=['Fase: '+('estimación inicial, con +15 m' if h['fase']=='inicial' else 'recálculo '+str(h['iteracion'])+', con equivalentes derivados; sin +15 m'),
  '|Tramo|Demanda (L/h)|Longitud de consulta (m)|Fila Tabla 3 (m)|Capacidad (L/h)|Candidato|Comprobación|',
  '|---|---:|---:|---:|---:|---|---|']
  ds=h.get('diametrosSiguientes',h.get('diametros'))
  for id,c in h['comprobaciones'].items():s.append('|{}|{}|{}|{}|{}|{}|{}|'.format(id,n(c['caudal']*1000,6),n(c['longitudDeCalculo']),c['longitudFila'],n(c['capacidad']*1000),ds[id],'Capacidad suficiente en escenario' if c['cumple'] else 'No cubre'))
  if h['fase']!='inicial':
   s.append('Vector evaluado: '+str(h['diametrosEvaluados'])+'. Vector siguiente: '+str(h['diametrosSiguientes'])+'. No cambia: convergencia comprobada en esta iteración.')
 s+=['Desglose de equivalentes por tramo (la contribución de tee se asocia a cada salida; es una sola pieza física):',
 '|Tramo|Accesorio/vía|Cantidad física o referencia|Medidas|Equivalente aportado (m)|',
 '|---|---|---:|---|---:|']
 for id,t in r['porTramo'].items():
  agrupados={}
  for acc in t['accesorios']:
   k=(acc['tipo'],'/'.join(acc['medidas']),acc.get('via','local'),acc.get('referenciaPiezaCompartida',False));g=agrupados.setdefault(k,[0,0]);g[0]+=acc['cantidad'];g[1]+=acc.get('equivalente') or 0
  for (tipo,medidas,via,compartida),(cantidad,total) in agrupados.items():s.append(f'|{id}|{tipo} · {via}|{cantidad}'+(' (referencia a tee compartida)' if compartida else '')+f'|{medidas}|{n(total)}|')
 s+=['Recorridos recalculados:']
 for rr in r['recorridos']:s.append(rr['artefacto']+': real '+n(rr['longitudReal'])+' + equivalentes '+n(rr['longitudEquivalenteAccesorios'])+' = '+n(rr['longitudDefinitiva'])+' m; diferencia con referencia aproximada: '+n(rr['longitudDefinitiva']-(50 if rr['artefacto']=='Calefón' else 41))+' m.')
 s.append('Inventario único: 17 codos de 90°, 2 llaves y 1 tee reductora. Cuplas pendientes, sin cantidad asignada; no hay reducción independiente duplicada. Los tramos compartidos no se suman dos veces al inventario.')
s+=['## Alcance, cambios y pruebas',
'La prueba usa el mismo motor de index.html mediante un cargador DOM local, no un segundo motor de diámetros. Se agregó modo educativo explícito: acepta un paquete marcado NO VERIFICADO solamente con modoPrueba, admite cantidades sin inventar posiciones y genera propuestas con diametros = null, aptoInstalacion = false y estado diagnostico-educativo. El mismo paquete sin modoPrueba queda bloqueado. No se registró en CATALOGOS_GAS_VERIFICADOS. No se configuraron claves, red, Gemini ni servicios.',
'Archivos necesarios modificados: index.html (adaptación diagnóstica, doble giro de tee y traza), package.json (nueva suite). Nuevos: diagnosticos/cargar-motor.cjs, diagnosticos/ejercicio-calefon-cocina.cjs, resultado JSON, generador del informe, informe Markdown/HTML y tests/diagnostico-calefon-cocina.test.cjs; documentación actualizada. No se alteró ninguno de los dos archivos de tablas.',
'Pasan **183 pruebas: las 165 anteriores y 18 nuevas**. Se probaron consumos, recorridos, filas y capacidades, rechazo de candidatos menores, orientación de tee (incluidos dos giros), unicidad del inventario, trazas y estabilidad, valvulería, cuplas pendientes sin posiciones inventadas, bloqueo sin modo diagnóstico y conservación de datos/tablas. La salida del diagnóstico no es una certificación ni una aprobación del sistema.',
'Para un único resultado confirmado faltan orientación real de la tee, tipo de cada llave, posiciones y criterio de cuplas, confirmación del modelo de tee reductora y sus equivalentes. Siguen pendientes edición/aplicabilidad, interiores reales, criterios normativos y condiciones de suministro para una instalación real.',
'## Leer desde Android',
'Descomprimí TODO canerias-diagnostico-calefon-cocina.zip y abrí DIAGNOSTICO-CALEFON-COCINA.html. Es un informe generado, imprimible y separado: no reemplaza ni incorpora tramos al proyecto. La aplicación completa se sigue abriendo con index.html. No requiere conexión. No modifiques la versión publicada. La ejecución reproducible para desarrollo es node diagnosticos/ejercicio-calefon-cocina.cjs; después python diagnosticos/generar-informe.py. No hace falta ejecutar esos comandos desde el celular.']
md='\n\n'.join(s)+'\n';Path('DIAGNOSTICO-CALEFON-COCINA.md').write_text(md)
# Unir filas consecutivas para que la tabla Markdown también sea portable.
md=re.sub(r'\|\n\n\|','|\n|',md);Path('DIAGNOSTICO-CALEFON-COCINA.md').write_text(md)
def inline(txt):return re.sub(r'\*\*(.*?)\*\*',r'<strong>\1</strong>',html.escape(txt))
out=[];table=False;primera=False
for line in md.splitlines():
 if line.startswith('|'):
  if not table:out.append('<div class="tabla"><table>');table=True;primera=True
  if re.match(r'^\|[-:| ]+\|$',line):continue
  tag='th' if primera else 'td';out.append('<tr>'+''.join('<'+tag+'>'+inline(v.strip())+'</'+tag+'>' for v in line.strip('|').split('|'))+'</tr>');primera=False;continue
 if table:out.append('</table></div>');table=False
 if not line:continue
 if line.startswith('#'):
  level=min(len(line)-len(line.lstrip('#')),4);out.append('<h'+str(level)+'>'+inline(line.lstrip('# '))+'</h'+str(level)+'>')
 else:out.append('<p>'+inline(line)+'</p>')
if table:out.append('</table></div>')
Path('DIAGNOSTICO-CALEFON-COCINA.html').write_text('<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CAÑERÍAS · diagnóstico calefón y cocina</title><style>body{font-family:system-ui;max-width:1100px;margin:auto;padding:16px;line-height:1.5}h1,h2{color:#145560}.tabla{overflow-x:auto}table{border-collapse:collapse;min-width:600px;width:100%;font-size:14px}td,th{padding:8px;border:1px solid #ccc;text-align:left}th{background:#e9f4f4}button{padding:12px}p{overflow-wrap:anywhere}@media print{button,nav{display:none}.tabla{overflow:visible}table{font-size:10px;min-width:0}thead{display:table-header-group}}</style><nav><a href="index.html">Abrir aplicación existente</a> · <button onclick="window.print()">Imprimir informe</button></nav>'+''.join(out)+'</html>')
