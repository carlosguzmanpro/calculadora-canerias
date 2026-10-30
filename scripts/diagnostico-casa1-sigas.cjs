// Reproduce Casa 1 mediante los campos y el manejador reales agregarTramo.
const fs=require('node:fs'),assert=require('node:assert/strict'),{vm}=require('../tests/helpers/casa1-manual.cjs');
function generar(){const a=vm(),sinPCS=a.run('resultadoPreliminarSigasGas()');a.run("guardarPCSPreliminarSigasGas('9300','Referencia del ensayo Casa 1')");const parcial=a.run('resultadoPreliminarSigasGas()');assert.equal(parcial.completo,false);assert.equal(parcial.bloqueos.length,3);assert.ok(parcial.bloqueos.every(s=>s.includes('falta la medida de rosca')));const guardado=a.saved();for(const [id,rosca]of [['terminal-medidor','3/4'],['terminal-Cocina','1/2'],['terminal-Calefón','1/2']])a.run(`guardarDatoTerminalSigasGas(${JSON.stringify(id)},'rosca',${JSON.stringify(rosca)})`);const adicional=a.run('resultadoPreliminarSigasGas()');assert.equal(adicional.completo,true);return {sinPCS,parcial,adicional,guardado};}
const n=x=>Number.isFinite(x)?Number(x.toFixed(6)).toLocaleString('es-AR',{maximumFractionDigits:6}):'Pendiente',tabla=(cab,filas)=>['| '+cab.join(' | ')+' |','| '+cab.map(()=> '---').join(' | ')+' |',...filas.map(f=>'| '+f.join(' | ')+' |')].join('\n');
function informe({parcial:p,adicional:e}){return `# Casa 1 · reproducción del flujo manual SIGAS GN

## Problemas corregidos

1. El formulario manual no cargaba el PCS del ensayo en el perfil técnico. El selector de combustible no equivale al poder calorífico documentado. El PCS y su fuente estaban escondidos en revisiones avanzadas; ahora son campos específicos del resultado, reutilizando el mismo perfil del proyecto y recalculando al completarlos. No se usa 9300 por defecto ni se exige completar presión para consultar capacidades.
2. Las reducciones independientes en blanco bloqueaban también el escenario preliminar de tee más bujes. En la copia de simulación se resuelven solamente los cambios documentados de sus tees; el inventario real mantiene sus campos pendientes, sin convertirlos en ceros o instalar reducciones por suposición.
3. El conjunto de tee quedaba ligado al diámetro de una iteración anterior. Un cambio 20/25 invalidaba sus pérdidas dentro de la siguiente ejecución. Ahora el escenario ensaya cada vector con sus propios productos, tee y equivalentes; aumenta solo los diámetros que no cubren su capacidad. No se reducen por la menor pérdida de otra variante. La semilla real y los ensayos se conservan en la memoria/proyección. El motor real y sus confirmaciones no aceptan automáticamente cambios de piezas.

## Datos exactos del usuario

SIGAS GN. M–A: 12 m, 3 codos de 90°, 1 tee. A–Cocina: 8 m, 2 codos, 1 llave y 10000 kcal/h. A–Calefón: 6 m, 2 codos, 1 llave y 20000 kcal/h. Reducciones independientes en blanco, no cero. PCS declarado exclusivamente para el ensayo: 9300 kcal/m³, fuente «Referencia del ensayo Casa 1». No hay fotografía, posiciones de codos, croquis ni medidas de rosca ingresadas.

## Resultado con esos datos exactos

${tabla(['Tramo','Consumo kcal/h','Caudal m³/h','DE candidato mm','Longitud parcial m','Fila SIGAS m','Capacidad parcial m³/h'],p.resultado.filas.map(f=>[f.tramo,n(f.consumoKcal),n(f.caudalM3h),f.candidato.exteriorMm,n(f.longitudConsultaM),f.candidato.longitudFilaM,n(f.candidato.capacidadM3h)]))}

Las capacidades son consultas parciales, no comprobaciones completas: faltan pérdidas de las conexiones roscadas no identificadas. Nunca se computan como cero. Las equivalencias que se usan en el escenario proceden de la Tabla 3 pp.24–25 del Manual SIGAS ed.15/2025; capacidades de Tabla 4 p.22, GN, densidad relativa 0,65 y caída de referencia 10 mmca. No se calculó una caída exacta en Pa.

${tabla(['Recorrido','Real m','Equivalente parcial del escenario m','Total parcial m'],p.resultado.recorridos.map(r=>[r.artefacto,n(r.longitudReal),n(r.equivalenteConocidoM),n(r.longitudConsultaM)]))}

Los codos comunes, llaves esféricas y tee de entrada por ramal con ambas salidas a 90° son referencias explícitas del escenario, no piezas reales confirmadas. La topología permite localizar la tee en A; no permite deducir su orientación real. Los bujes se proponen según medidas candidatas y no se añaden a las cantidades declaradas.

${tabla(['Caño por diámetro candidato','Metros','Tiras de 4 m','Cuplas presupuestadas','Sobrante m'],p.compra.canos.map(c=>[c.diametro,n(c.metros),c.tiras,p.compra.estimacionCuplas.porDiametro.find(x=>x.diametro===c.diametro).cantidad,n(c.sobrante)]))}

Se mantienen 26 m, 7 codos de 90°, 1 tee y 2 llaves. Compra por tramo sin reutilizar sobrantes: 7 tiras = 28 m comerciales, 4 cuplas presupuestadas y 2 m sobrantes. Se proponen dos bujes 32→25 para el conjunto de tee del escenario; no son reducciones independientes confirmadas. No se necesitan posiciones de codos o cuplas exactas para entregar este presupuesto. No hay precios declarados ni importe monetario inventado.

## Único bloqueo hidráulico pendiente con los datos exactos

${p.bloqueos.map(s=>'- '+s).join('\n')}

Hay un selector contextual por conexión, al lado del resultado, después de completar el PCS. La medida de rosca no se deduce del caudal ni del diámetro exterior del caño. No se asignan ¾″ o ½″ por defecto. Al completar un selector se guarda en el registro terminal existente y se recalcula sin volver a cargar tramos ni accesorios. Las revisiones de suministro y normativa siguen separadas del presupuesto y de la consulta tabular.

## Prueba adicional de regresión · NO son medidas aportadas para Casa 1

Solo para probar el cierre del algoritmo se ingresaron explícitamente en los controles de prueba: medidor ¾″, Cocina ½″ y Calefón ½″. No se atribuyen esas medidas al proyecto real del usuario. Se utiliza la variante terminal estándar documentada y el escenario de referencias anterior, sin confirmarlos como instalación real.

${tabla(['Tramo','DE ensayado mm','Longitud m','Fila m','Capacidad m³/h','Cubre'],e.ensayos.flatMap(i=>i.filas.map(f=>[f.tramo,f.diametroMm,n(f.longitudConsultaM),f.filaM,n(f.capacidadM3h),f.cubre?'Sí':'No'])))}

${tabla(['Recorrido adicional','Real m','Equivalente m','Total m'],e.resultado.recorridos.map(r=>[r.artefacto,n(r.longitudReal),n(r.equivalenteConocidoM),n(r.longitudConsultaM)]))}

20 mm en Cocina no cubre SU recorrido con SUS accesorios; 25 mm sí. El escenario adicional estabiliza todas sus capacidades sin alterar tablas, contar dos tees, añadir codos o guardar hipótesis como inventario confirmado. Los diámetros siguen sin constituir aprobación profesional. Ningún dato de esa prueba adicional se agrega automáticamente a proyectos nuevos.
`;} 
if(require.main===module){const texto=informe(generar()),ruta='informes/CASA1-CARGA-MANUAL-SIGAS.md';if(process.argv.includes('--write'))fs.writeFileSync(ruta,texto);else if(process.argv.includes('--check'))assert.equal(fs.readFileSync(ruta,'utf8'),texto);else process.stdout.write(texto);}
module.exports={generar,informe};
