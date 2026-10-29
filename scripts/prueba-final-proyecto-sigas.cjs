// Informe reproducible: ejecuta las funciones de la aplicación con entradas nuevas.
// No inserta un ejemplo en proyectos de usuarios ni fija resultados de diámetro.
const fs=require('node:fs'),assert=require('node:assert/strict'),nuevo=require('../tests/fixtures/proyecto-sigas-final-nuevo.cjs');
const a=nuevo(),e=a.run('resultadoPreliminarSigasGas()');assert.equal(e.completo,true);assert.equal(e.esEjercicio,false);
for(const f of e.resultado.filas){assert.ok(f.comprobadoPorTabla);assert.ok(f.candidato.longitudFilaM>=f.longitudConsultaM);assert.ok(f.candidato.capacidadM3h>=f.caudalM3h);}
const n=x=>Number(x.toFixed(6)).toLocaleString('es-AR',{maximumFractionDigits:6}),tabla=(c,filas)=>['| '+c.join(' | ')+' |','| '+c.map(()=> '---').join(' | ')+' |',...filas.map(f=>'| '+f.join(' | ')+' |')].join('\n');
const nombres=new Map(e.resultado.filas.map(f=>[f.id,f.tramo]));
const md=`# Prueba final SIGAS · Taller y vivienda

Proyecto nuevo de tres tramos, distinto al de 58 m. Creado con crearProyectoGas y calculado con calcularMaterialesManualGas/resultadoPreliminarSigasGas. Sin foto, croquis, posiciones o distancias entre accesorios. Entradas en tests/fixtures/proyecto-sigas-final-nuevo.cjs. No hay resultados guardados como entradas.

## CALCULADO

Gas natural; PCS 9300 kcal/m³ declarado exclusivamente para este ensayo. Consumos de placa sumados sin reducción de simultaneidad. SIGAS ed.15/2025: Tabla 4 p.22, densidad relativa 0,65, caída de referencia 10 mmca; Tabla 3 pp.24–25 para equivalencias. No se calculó una pérdida exacta de presión en Pa.

${tabla(['Tramo','Real m','kcal/h','m³/h','DE mm','Longitud consulta m','Fila m','Capacidad m³/h'],e.resultado.filas.map(f=>[f.tramo,n(f.longitudRealM),n(f.consumoKcal),n(f.caudalM3h),f.candidato.exteriorMm,n(f.longitudConsultaM),f.candidato.longitudFilaM,n(f.candidato.capacidadM3h)]))}

La fila es igual o superior a la longitud calculada, sin interpolación. El menor diámetro suficiente se consulta nuevamente en cada iteración. El troncal gobierna por el recorrido completo a Caldera, no por sus 14 m físicos.

${tabla(['Recorrido completo','Real m','Equivalente m','Total m'],e.resultado.recorridos.map(r=>[r.tramos.map(id=>nombres.get(id)).join(' → '),n(r.longitudReal),n(r.equivalenteConocidoM),n(r.longitudConsultaM)]))}

${e.resultado.recorridos.map(r=>`### ${r.artefacto}\n\n`+tabla(['Accesorio','Cantidad','DE mm','LE unitaria m','LE total m','Tabla 3 página'],r.aportes.map(p=>[p.nombre,p.cantidad,p.diametroExteriorMm,n(p.equivalenteUnitarioM),n(p.equivalenteTotalM),p.pagina]))).join('\n\n')}

La tee física se cuenta una vez en materiales; interviene en cada recorrido con su vía y únicamente el buje de esa salida. Los codos terminales reutilizan unidades ya declaradas. Las cantidades registradas son 28 m, 7 codos de 90°, 0 de 45°, 1 tee y 2 llaves.

## PRESUPUESTADO

${tabla(['Caño DE','Metros físicos','Tiras de 4 m','Metros comerciales','Sobrante m','Cuplas presupuestadas'],e.compra.canos.map(c=>[c.diametro,n(c.metros),c.tiras,n(c.metrosComerciales),n(c.sobrante),e.compra.estimacionCuplas.porDiametro.find(x=>x.diametro===c.diametro).cantidad]))}

Criterio sin reaprovechamiento de sobrantes: techo(longitud/4) tiras por tramo; techo(longitud/4)−1 cuplas orientativas. M–J: 14 m = 4+4+4+2 m, 4 tiras y 3 cuplas presupuestadas. Cantidad ajustable según cortes y accesorios. No se bloquea por falta de posiciones.

${tabla(['Pieza del escenario','Cantidad','Estado'],e.materiales.map(m=>[m.material,m.cantidad,m.tipo==='cupla'?'PRESUPUESTADO: ajustable':'Cantidad calculada; variante de referencia POR VERIFICAR']))}

Referencias explícitas, no piezas confirmadas: codos terminales estándar con rosca hembra; llaves esféricas; tee normal 32 mm con dos salidas a 90° y bujes 32→25 y 32→20. Se incluyen en las pérdidas del escenario 5 uniones normales presupuestadas, nunca como cuplas reales confirmadas. Si cambian la solución o cantidades reales, deben recalcularse sus pérdidas. Total: 8 tiras, 32 m comerciales, 4 m sobrantes, 5 cuplas presupuestadas y 2 bujes propuestos. Sin precios no se inventa un importe monetario.

## Verificaciones realizadas

Ambos recorridos completos; caudales acumulados; consulta a fila superior; capacidad suficiente; menor diámetro tabulado; equivalencias de cada producto a su propio diámetro; suma de aportes; tee compartida sin duplicación; cantidades y compra por diámetro; inversión de extremos y orden de carga; persistencia y recuperación; cambios de longitud y recálculo; presupuesto disponible cuando falta un dato hidráulico. Los resultados no certifican una instalación real.

## POR VERIFICAR · únicos datos externos

- Confirmar que las piezas reales corresponden a las referencias utilizadas: geometría/sexo y variante de los tres terminales; llave esférica; entrada lateral y dos giros en la tee. Las roscas ¾″ del medidor y ½″ de los artefactos ya fueron declaradas: no hay que ingresarlas nuevamente.
- Confirmar las uniones reales solo para cerrar las pérdidas de la instalación. Las 5 cuplas presupuestadas no son inventario confirmado; sus posiciones no son requisito del cálculo por cantidades en tramos uniformes.
- Para compatibilidad de suministro: presiones documentadas a la entrada y requeridas por los artefactos, caída disponible, características del gas/PCS real y fuente. No son bloqueos de la comparación tabular de referencia.
- Para presupuesto monetario: precios unitarios y moneda; no necesarios para este presupuesto de cantidades.
- Solo si se solicita plano a escala: geometría y medidas de cada dirección. No afectan este cálculo hidráulico ni el informe.

La revisión profesional/normativa permanece independiente. No hay datos faltantes que impidan completar este escenario numérico.
`;
const cuerpo=a.run('InformeProyecto.ejercicioSigas(resultadoPreliminarSigasGas())');
const html='<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Prueba final SIGAS · Taller y vivienda</title><style>body{font:16px system-ui,sans-serif;line-height:1.45;max-width:1100px;margin:20px auto;padding:0 14px;color:#172b37}table{border-collapse:collapse;width:100%;font-size:.88rem;margin:12px 0 20px}td,th{border:1px solid #b9c7d1;padding:7px;text-align:left;overflow-wrap:anywhere}details{margin:14px 0}summary{font-weight:700;cursor:pointer}.ejercicio-estimado{background:#fff4cf;padding:10px}.ejercicio-estado{background:#dceef8;padding:10px}a{display:inline-block;margin-right:16px}@media(max-width:650px){table,tbody,tr,td{display:block}thead{display:none}tr{border:1px solid #b9c7d1;margin-bottom:10px}td{display:flex;justify-content:space-between;gap:10px;border:none;border-bottom:1px solid #eee}td:before{content:attr(data-label);font-weight:600;min-width:42%}}@media print{@page{size:A4;margin:12mm}body{font-size:10pt;margin:0;padding:0}a{display:none}tr,td{break-inside:avoid}thead{display:table-header-group}}</style><body><h1>Informe de prueba · Taller y vivienda</h1><p>Generado ejecutando el motor real con un proyecto nuevo de 28 m. No modifica ni carga automáticamente datos en la aplicación.</p><p><a href="../index.html">Abrir calculadora de prueba</a><a href="prueba-final-sigas-entradas.json" download>Descargar entradas del ensayo (JSON)</a></p><p>El JSON es opcional para reproducir la prueba. La importación de respaldo completo reemplaza los datos del navegador: utilizala solo en esta Preview nueva y exportá antes cualquier proyecto que quieras conservar.</p>'+cuerpo+'</body></html>\n';
const archivos={'informes/PRUEBA-FINAL-PROYECTO-SIGAS.md':md,'informes/prueba-final-sigas.html':html,'informes/prueba-final-sigas-entradas.json':a.run("JSON.stringify({formato:'canerias-respaldo-v1',proyectos},null,2)")+'\n'};
if(process.argv.includes('--write'))for(const [p,c]of Object.entries(archivos))fs.writeFileSync(p,c);else if(process.argv.includes('--check'))for(const [p,c]of Object.entries(archivos)){if(p.endsWith('.json')){const respaldo=JSON.parse(fs.readFileSync(p,'utf8'));assert.equal(respaldo.formato,'canerias-respaldo-v1');const b=require('../diagnosticos/cargar-motor.cjs')(JSON.stringify(respaldo.proyectos));b.run("abrir('gas');calcularMaterialesManualGas()");const recuperado=b.run('resultadoPreliminarSigasGas()');assert.equal(recuperado.completo,true);assert.deepEqual(JSON.parse(JSON.stringify(recuperado.resultado.filas)),JSON.parse(JSON.stringify(e.resultado.filas)));}else assert.equal(fs.readFileSync(p,'utf8'),c,p);}else process.stdout.write(md);
