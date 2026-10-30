// Segunda prueba integral: ejecución real, comparación y entradas reproducibles.
const fs=require('node:fs'),assert=require('node:assert/strict'),crear=require('../tests/helpers/segunda-prueba-sigas.cjs'),cerrarCasa=require('../tests/helpers/casa1-cierre.cjs');
const a=cerrarCasa();a.run("abrirEjercicioSigas19Gas()");const referencia=a.run('resultadoPreliminarSigasGas()');crear({a});const sinUbicacion=a.run('resultadoPreliminarSigasGas()');assert.equal(sinUbicacion.completo,false);crear({a,aguasAbajo:true});const e=a.run('resultadoPreliminarSigasGas()');assert.equal(e.completo,true);assert.equal(e.cantidadesDeclaradas.codo90,19);for(const f of e.resultado.filas)assert.ok(f.comprobadoPorTabla&&f.candidato.longitudFilaM>=f.longitudConsultaM&&f.candidato.capacidadM3h>=f.caudalM3h);
const n=x=>Number.isFinite(x)?Number(x.toFixed(6)).toLocaleString('es-AR',{maximumFractionDigits:6}):'Pendiente',tabla=(cab,filas)=>['| '+cab.join(' | ')+' |','| '+cab.map(()=> '---').join(' | ')+' |',...filas.map(f=>'| '+f.join(' | ')+' |')].join('\n');
const comparacion=e.resultado.recorridos.map(r=>{const b=referencia.resultado.recorridos.find(x=>x.artefacto===r.artefacto);return [r.artefacto,n(b.longitudConsultaM),n(r.longitudConsultaM),n(r.longitudConsultaM-b.longitudConsultaM)];});
const md=`# Segunda prueba integral SIGAS · 58 metros

## Resultado de la prueba

Prueba funcional superada bajo la HIPÓTESIS A explícita: el codo adicional del casillero está aguas abajo del medidor, afecta M–A y se modela como codo normal HH SIGAS al diámetro candidato de ese tramo. No se confirma que esa sea su ubicación o variante real. Con el lado hidráulico sin identificar, se mantienen candidatos y materiales, pero la comprobación completa queda condicionada. No se aprueba ninguna instalación real.

## Datos y discrepancia con la referencia anterior

58 m; 18 codos en los tramos (7/1/1/4/5) más uno independiente en el casillero M; dos tees; tres llaves; 29200 kcal/h; SIGAS GN ed.15/2025; PCS 9300 kcal/m³ definido para el ensayo, no universal. Se cargaron tramos y consumos mediante los campos y el manejador manual de la aplicación.

La referencia anterior ponía el codo 19 en B–Cocina. La consigna actual lo ubica en el casillero M. Se conservan ambos proyectos, además de Casa 1. No se movió una pieza silenciosamente en el ejercicio anterior ni se sumó una unidad 20.

Se reutilizan las cuatro vías a 90° del ejercicio de 58 m, NO el paso directo de Casa 1. Terminales de referencia: medidor 32×¾″, Termo y Cocina 25×½″, Calefactor 20×½″, variante estándar con rosca hembra. Llaves esféricas; codos comunes HH; tee A normal 32 mm con dos bujes 32→25; tee B normal 25 mm con un buje 25→20. Estas variantes y conjuntos son hipótesis documentadas de cálculo, no confirmaciones de piezas instaladas.

## Resultados de la hipótesis A

${tabla(['Tramo','Real m','Consumo kcal/h','Caudal m³/h','DE mm','Longitud de consulta m','Fila SIGAS m','Capacidad m³/h'],e.resultado.filas.map(f=>[f.tramo,n(f.longitudRealM),n(f.consumoKcal),n(f.caudalM3h),f.candidato.exteriorMm,n(f.longitudConsultaM),f.candidato.longitudFilaM,n(f.candidato.capacidadM3h)]))}

Fuente: Tabla 4, p.22 del Manual SIGAS ed.15/2025, GN, densidad relativa 0,65 y caída de referencia 10 mmca. Se utiliza la fila igual o inmediatamente superior. Todas las capacidades cubren los caudales. No se aplica una fórmula inventada de caída exacta en Pa ni un coeficiente de simultaneidad que reduzca consumos.

${tabla(['Recorrido','Real m','Equivalentes m','Total m'],e.resultado.recorridos.map(r=>[r.artefacto,n(r.longitudReal),n(r.equivalenteConocidoM),n(r.longitudConsultaM)]))}

${e.resultado.recorridos.map(r=>'### '+r.artefacto+'\n\n'+tabla(['Accesorio','Cantidad','DE mm','LE unitaria m','LE total m','Tabla 3 página'],r.aportes.map(p=>[p.nombre,p.cantidad,p.diametroExteriorMm,n(p.equivalenteUnitarioM),n(p.equivalenteTotalM),p.pagina]))).join('\n\n')}

Cada tee física se cuenta una vez en materiales; cada recorrido aplica su vía y solo sus bujes. El codo del casillero aporta 1,191 m una vez a cada recorrido bajo la hipótesis A; no se duplica como pieza física. Las 12 cuplas presupuestadas se modelan como uniones normales en este escenario, no como uniones instaladas confirmadas.

## Comparación numérica

${tabla(['Recorrido','Referencia anterior m','Hipótesis A m','Diferencia m'],comparacion)}

La diferencia es exactamente +1,191 m en Termo y Calefactor. En Cocina se quitan 0,856 m del codo normal 25 mm anteriormente ubicado allí y se agregan 1,191 m del codo normal 32 mm modelado en el casillero: diferencia +0,335 m. Cambian las filas de Termo (36→38 m) y del recorrido de Calefactor (55→60 m), sin cambiar los cinco diámetros. No se retocaron resultados para hacerlos coincidir.

## Materiales y compra orientativa

${tabla(['Caño DE','Metros','Tiras de 4 m','Metros comerciales','Sobrante m','Cuplas presupuestadas'],e.compra.canos.map(c=>[c.diametro,n(c.metros),c.tiras,n(c.metrosComerciales),n(c.sobrante),e.compra.estimacionCuplas.porDiametro.find(x=>x.diametro===c.diametro).cantidad]))}

${tabla(['Material del escenario','Cantidad','Unidad'],e.materiales.map(m=>[m.tipo==='tee'?m.material.replace(/, flujo.*$/,''):m.material,m.cantidad,m.unidad]))}

Totales: 58 m físicos, 19 codos, dos tees, tres llaves, tres bujes propuestos y 12 cuplas presupuestadas. Compra orientativa: 17 tiras de 4 m = 68 m comerciales, 10 m sobrantes, sin asumir aprovechamiento total de sobrantes entre tramos. No se exigen posiciones de codos ni cuplas exactas. No hay precios unitarios y no se inventa un importe monetario.

## Errores encontrados y corrección limitada

Se encontró un aviso de ubicación que persistía incluso después de registrar un vínculo hidráulico válido con un tramo existente. El motor ya aplicaba las pérdidas correctas, pero el aviso genérico impedía cerrar el escenario. Se corrigió únicamente esa sincronización. Un vínculo inexistente, borrado o ambiguo no elimina el pendiente. No se cambiaron fórmulas, tablas, presiones ni equivalencias.

## Qué queda por verificar

- Para reproducir exactamente la disposición real: confirmar de qué lado del medidor está el codo adicional y su producto. Si está antes del medidor, no se traslada automáticamente a los recorridos aguas abajo; requiere su análisis correspondiente.
- Para instalación real: variantes de terminales, llaves y conjuntos, uniones efectivas, condiciones documentadas del suministro y revisión profesional/normativa. Las hipótesis del ensayo no se guardan como declaración de inventario completo ni aprobación normativa.

Con la hipótesis A explícita no faltan datos matemáticos para completar la prueba tabular. Sin esa hipótesis el proyecto alternativo muestra pendientes reales y conserva el presupuesto. Casa 1 y la referencia anterior siguen disponibles e intactas.
`;
const css=fs.readFileSync('informes/casa1-cierre.html','utf8').match(/<style>[\s\S]*?<\/style>/)[0];
const filasComparacion='<table class="ejercicio-tabla"><thead><tr><th>Recorrido</th><th>Anterior (m)</th><th>Hipótesis A (m)</th><th>Diferencia (m)</th></tr></thead><tbody>'+comparacion.map(xs=>'<tr>'+xs.map((x,i)=>'<td data-label="'+['Recorrido','Anterior (m)','Hipótesis A (m)','Diferencia (m)'][i]+'">'+x+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
const cuerpo=a.run('InformeProyecto.ejercicioSigas(resultadoPreliminarSigasGas())');
const html='<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Segunda prueba SIGAS · 58 m</title>'+css+'<body><h1>Segunda prueba SIGAS · 58 metros</h1><p><strong>Hipótesis A — no confirmada:</strong> codo adicional del casillero aguas abajo del medidor, normal HH al diámetro de M–A. No es la ubicación de la referencia anterior, donde estaba en B–Cocina. No se aprueba una instalación real.</p><p><a href="../index.html">Abrir calculadora de prueba</a><a href="segunda-prueba-sigas-entradas.json" download>Descargar entradas de los escenarios (JSON)</a><a href="SEGUNDA-PRUEBA-SIGAS.md">Informe completo y desglose matemático</a></p><p>Prueba funcional superada bajo la hipótesis indicada. El JSON conserva Casa 1, la referencia anterior y ambos escenarios nuevos. Su importación completa reemplaza proyectos del navegador: exportá antes tus datos si necesitás conservarlos.</p>'+cuerpo+'<details><summary>Comparar con la referencia anterior</summary>'+filasComparacion+'<p>+1,191 m en Termo y Calefactor; +0,335 m en Cocina, al sustituir su antiguo codo de 0,856 m por el codo de 1,191 m del casillero. Los diámetros permanecen 32/25/25/20/25 mm.</p></details><details><summary>Caso sin definir el lado hidráulico del casillero</summary><p>Conserva 58 m, 19 codos, dos tees y tres llaves. El cálculo queda parcial porque ese accesorio no está ubicado respecto del medidor; no se supone pérdida cero. Los materiales y las estimaciones de compra siguen disponibles. El escenario está separado en el selector de proyectos.</p></details></body></html>\n';
const archivos={'informes/SEGUNDA-PRUEBA-SIGAS.md':md,'informes/segunda-prueba-sigas.html':html,'informes/segunda-prueba-sigas-entradas.json':a.run("JSON.stringify({formato:'canerias-respaldo-v1',proyectos},null,2)")+'\n'};
if(process.argv.includes('--write'))for(const [ruta,texto]of Object.entries(archivos))fs.writeFileSync(ruta,texto);else if(process.argv.includes('--check'))for(const [ruta,texto]of Object.entries(archivos)){if(!ruta.endsWith('.json'))assert.equal(fs.readFileSync(ruta,'utf8'),texto);else{const x=JSON.parse(fs.readFileSync(ruta,'utf8'));assert.equal(x.formato,'canerias-respaldo-v1');const b=require('../diagnosticos/cargar-motor.cjs')(JSON.stringify(x.proyectos));b.run("abrir('gas');calcularMaterialesManualGas()");assert.equal(b.run('resultadoPreliminarSigasGas().completo'),true);const proy=r=>r.filas.map(f=>[f.tramo,f.caudalM3h,f.longitudConsultaM,f.candidato.exteriorMm,f.candidato.longitudFilaM,f.candidato.capacidadM3h]);assert.deepEqual(JSON.parse(JSON.stringify(proy(b.run('resultadoPreliminarSigasGas().resultado')))),JSON.parse(JSON.stringify(proy(e.resultado))));}}else process.stdout.write(md);
