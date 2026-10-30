// Genera la entrega ejecutando el motor existente con los datos definidos del ejercicio.
const fs=require('node:fs'),assert=require('node:assert/strict'),cerrar=require('../tests/helpers/casa1-cierre.cjs');
const a=cerrar(),e=a.run('resultadoPreliminarSigasGas()');assert.equal(e.completo,true);assert.equal(e.bloqueos.length,0);for(const f of e.resultado.filas)assert.ok(f.comprobadoPorTabla&&f.candidato.capacidadM3h>=f.caudalM3h&&f.candidato.longitudFilaM>=f.longitudConsultaM);
const n=x=>Number.isFinite(x)?Number(x.toFixed(6)).toLocaleString('es-AR',{maximumFractionDigits:6}):'Pendiente',tabla=(cab,filas)=>['| '+cab.join(' | ')+' |','| '+cab.map(()=> '---').join(' | ')+' |',...filas.map(f=>'| '+f.join(' | ')+' |')].join('\n'),nombres=new Map(e.resultado.filas.map(f=>[f.id,f.tramo]));
const md=`# Casa 1 · cierre del ejercicio SIGAS GN

Datos definidos por el propietario para el ejercicio: medidor ¾″; Cocina y Calefón ½″; tee A con paso directo hacia Cocina y giro de 90° hacia Calefón; PCS 9300 kcal/m³ exclusivo del ensayo. Se conservan 26 m, 7 codos de 90°, 1 tee, 2 llaves y 30000 kcal/h. Las reducciones independientes siguen sin declarar, no se transformaron en cero. Estos datos no confirman una instalación real.

## CALCULADO · capacidad tabular del escenario

${tabla(['Tramo','Real m','Consumo acumulado kcal/h','Caudal m³/h','DE mm','Longitud de consulta m','Fila SIGAS m','Capacidad m³/h'],e.resultado.filas.map(f=>[f.tramo,n(f.longitudRealM),n(f.consumoKcal),n(f.caudalM3h),f.candidato.exteriorMm,n(f.longitudConsultaM),f.candidato.longitudFilaM,n(f.candidato.capacidadM3h)]))}

Tabla 4, p.22, Manual SIGAS Thermofusión ed.15/2025: GN, densidad relativa 0,65 y caída de referencia 10 mmca. Todas las capacidades cubren el caudal y se consultó una fila igual o superior, sin interpolación ni extrapolación. El troncal gobierna por el recorrido a Cocina, no por su longitud parcial ni por el mayor consumo del artefacto.

${tabla(['Recorrido completo','Longitud real m','Equivalente m','Total m'],e.resultado.recorridos.map(r=>[r.tramos.map(id=>nombres.get(id)).join(' → '),n(r.longitudReal),n(r.equivalenteConocidoM),n(r.longitudConsultaM)]))}

Las longitudes de consulta de las filas compartidas no deben sumarse entre sí: ya contienen el recorrido completo. Cada accesorio aporta una sola vez a cada recorrido.

${e.resultado.recorridos.map(r=>'### '+r.artefacto+'\n\n'+tabla(['Accesorio del escenario','Cantidad','DE mm','LE unitaria m','LE total m','Tabla 3 página'],r.aportes.map(p=>[p.nombre,p.cantidad,p.diametroExteriorMm,n(p.equivalenteUnitarioM),n(p.equivalenteTotalM),p.pagina]))).join('\n\n')}

La tee normal de 32 mm es una sola pieza física: 0,235 m para su vía directa y 0,928 m para su giro. Cada recorrido incorpora solo su propio buje 32→25, de 0,576 m. No se suman los dos bujes a un mismo recorrido. Los tres terminales reutilizan codos ya registrados, sin aumentar los siete codos.

### Iteraciones reales

${tabla(['Ensayo','Tramo','DE mm','Longitud m','Fila m','Capacidad m³/h','Cubre'],e.ensayos.flatMap((i,k)=>i.filas.map(f=>[k+1,f.tramo,f.diametroMm,n(f.longitudConsultaM),f.filaM,n(f.capacidadM3h),f.cubre?'Sí':'No'])))}

20 mm en Cocina no alcanza para su propia longitud con sus accesorios. El motor sube a 25 mm, recalcula la tee, el buje y las equivalencias de ese diámetro y vuelve a verificar. No fija los valores de salida ni modifica las tablas.

## PRESUPUESTADO · compra por diámetro

${tabla(['Caño DE','Metros físicos','Tiras de 4 m','Metros comerciales','Sobrante m','Cuplas'],e.compra.canos.map(c=>[c.diametro,n(c.metros),c.tiras,n(c.metrosComerciales),n(c.sobrante),e.compra.estimacionCuplas.porDiametro.find(x=>x.diametro===c.diametro).cantidad]))}

${tabla(['Material del escenario','Cantidad','Estado'],e.materiales.map(m=>[m.tipo==='tee'?'Tee normal SIGAS 32 mm (una pieza, dos vías)':m.material,m.cantidad,m.tipo==='cupla'?'Presupuestado; ajustable':m.tipo==='reduccion'?'Buje propuesto del conjunto del ejercicio':'Cantidad conservada; producto de referencia']))}

Total: 7 tiras de 4 m = 28 m comerciales, 2 m de sobrante y 4 cuplas presupuestadas (2 en M–A, 1 hacia Cocina y 1 hacia Calefón). No se reaprovechan sobrantes por suposición ni se exige ubicar codos. Las cuplas orientativas se modelan como uniones normales en este escenario, sin declararlas instaladas. Los dos bujes propuestos no se duplican con reducciones independientes desconocidas. Sin precios no se inventa un importe monetario.

## Alcance y pendientes reales

No falta ningún dato imprescindible para completar el escenario numérico del ejercicio con las referencias documentadas utilizadas. No hay pérdidas desconocidas sustituidas por cero.

Referencias automáticas explícitas, no piezas reales confirmadas: terminales estándar con rosca hembra; codos comunes HH; llaves esféricas; tee normal 32 mm con dos bujes MH 32→25; cuatro uniones normales presupuestadas. Las roscas y vías definidas por el propietario se guardan en sus registros existentes; no se confirma el conjunto como instalado ni se aumenta el inventario.

Para verificar una instalación real: comprobar esas variantes y sus cantidades reales (incluidas uniones y posibles reducciones adicionales), documentar suministro y propiedades del gas y realizar la revisión profesional/normativa. La compatibilidad de suministro y la aprobación normativa permanecen separadas. No se calculó una caída exacta en Pa ni se presenta una instalación aprobada.

## Reproducción

node scripts/informe-casa1-cierre.cjs --check verifica este informe volviendo a ejecutar el motor. La prueba móvil carga los mismos datos mediante formularios y selectores existentes, sin asignar resultados. El JSON adjunto contiene entradas y referencias del ejercicio para la importación existente; no carga automáticamente ejemplos en proyectos de usuarios.
`;
const cuerpo=a.run('InformeProyecto.ejercicioSigas(resultadoPreliminarSigasGas())');
const estilo='<style>body{font:16px system-ui,sans-serif;line-height:1.45;max-width:1100px;margin:20px auto;padding:0 14px;color:#172b37}table{border-collapse:collapse;width:100%;font-size:.88rem;margin:12px 0 20px}td,th{border:1px solid #b9c7d1;padding:7px;text-align:left;overflow-wrap:anywhere}details{margin:14px 0}summary{font-weight:700;cursor:pointer}.ejercicio-estimado{background:#fff4cf;padding:10px}.ejercicio-estado{background:#dceef8;padding:10px}a{display:inline-block;margin-right:16px}@media(max-width:650px){table,tbody,tr,td{display:block}thead{display:none}tr{border:1px solid #b9c7d1;margin-bottom:10px}td{display:flex;justify-content:space-between;gap:10px;border:none;border-bottom:1px solid #eee}td:before{content:attr(data-label);font-weight:600;min-width:42%}}@media print{@page{size:A4;margin:12mm}body{font-size:10pt;margin:0;padding:0}a{display:none}tr,td{break-inside:avoid}thead{display:table-header-group}}</style>';
const html='<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Casa 1 · cierre del ejercicio SIGAS</title>'+estilo+'<body><h1>Casa 1 · ejercicio SIGAS GN</h1><p>Calculado por el motor con los datos definidos del ejercicio. No confirma piezas instaladas. Tee A: paso directo hacia Cocina y giro de 90° hacia Calefón; medidor ¾″, artefactos ½″ y PCS del ensayo 9.300 kcal/m³.</p><p><a href="../index.html">Abrir calculadora de prueba</a><a href="casa1-cierre-entradas.json" download>Descargar entradas del ejercicio (JSON)</a><a href="CASA1-CIERRE-SIGAS.md">Desglose completo e iteraciones</a></p><p>El informe se generó ejecutando la aplicación. No carga ni sobrescribe proyectos. El respaldo JSON es opcional: su importación completa reemplaza datos del navegador; exportá primero cualquier proyecto que quieras conservar.</p>'+cuerpo+'</body></html>\n';
const archivos={'informes/CASA1-CIERRE-SIGAS.md':md,'informes/casa1-cierre.html':html,'informes/casa1-cierre-entradas.json':a.run("JSON.stringify({formato:'canerias-respaldo-v1',proyectos},null,2)")+'\n'};
if(process.argv.includes('--write'))for(const [ruta,texto]of Object.entries(archivos))fs.writeFileSync(ruta,texto);else if(process.argv.includes('--check'))for(const [ruta,texto]of Object.entries(archivos)){if(ruta.endsWith('.json')){const x=JSON.parse(fs.readFileSync(ruta,'utf8'));assert.equal(x.formato,'canerias-respaldo-v1');const b=require('../diagnosticos/cargar-motor.cjs')(JSON.stringify(x.proyectos));b.run("abrir('gas');calcularMaterialesManualGas()");const otro=b.run('resultadoPreliminarSigasGas()');assert.equal(otro.completo,true);const proyeccion=r=>({filas:r.filas.map(f=>[f.tramo,f.longitudRealM,f.consumoKcal,f.caudalM3h,f.candidato.exteriorMm,f.longitudConsultaM,f.candidato.longitudFilaM,f.candidato.capacidadM3h]),recorridos:r.recorridos.map(t=>[t.artefacto,t.longitudReal,t.equivalenteConocidoM,t.longitudConsultaM,t.aportes.map(p=>[p.nombre,p.tipo,p.cantidad,p.diametroExteriorMm,p.equivalenteUnitarioM,p.equivalenteTotalM,p.pagina])])});assert.deepEqual(JSON.parse(JSON.stringify(proyeccion(otro.resultado))),JSON.parse(JSON.stringify(proyeccion(e.resultado))));}else assert.equal(fs.readFileSync(ruta,'utf8'),texto);}else process.stdout.write(md);
