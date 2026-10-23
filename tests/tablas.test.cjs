const {test}=require('node:test');
const assert=require('node:assert/strict');
const t3=require('./fixtures/tabla-3-22028c8.cjs');
const t18=require('./fixtures/tabla-18-22028c8.cjs');
const {validarTablas,consultarCapacidadDeclarada,caudalClaseDesdeKcal}=require('../datos/validacion-tablas.js');
const copia=x=>structuredClone(x);
test('tabla3: los doce controles del mensaje coinciden exactamente en L/h',()=>{
 const controles=[[40,800,2210,4525],[50,715,1975,4035],[65,630,1730,3550],[100,505,1400,2865]];
 assert.deepEqual(t3.columnas,['1/2"','3/4"','1"']);assert.equal(t3.unidadCapacidad,'L/h');
 assert.deepEqual(t3.filas.map(f=>[f.longitud,...f.capacidades]),controles);
});
test('tabla18: los nueve coeficientes declarados coinciden exactamente',()=>{
 assert.deepEqual(Object.fromEntries(t18.accesorios.map(a=>[a.tipo,a.factorD])),{'codo45':14,'codo90':30,curva:20,'tee-directo':20,'tee-giro90':60,reduccion:10,'valvula-globo':333,'valvula-esclusa':7,'valvula-macho':100});
 assert.equal(t18.accesorios.find(a=>a.tipo==='reduccion').base,'diametro-menor');
});
test('tablas: 21 números declarados, ninguna habilitación ni edición inventada',()=>{
 const r=validarTablas(t3,t18);assert.equal(r.capacidades,12);assert.equal(r.coeficientes,9);assert.deepEqual(r.errores,[]);assert.equal(r.habilitado,false);
 for(const t of [t3,t18]){assert.equal(t.procedencia.edicion,null);assert.equal(t.procedencia.cotejoFotografico,false);assert.equal(t.procedencia.vigenciaVerificada,false);}
 assert.ok(t18.diametros.every(d=>d.interiorM===null));assert.equal(t18.redondeo.verificado,false);
});
test('tabla3: conversión exacta litros/h a m³/h y límites sin extrapolación',()=>{
 for(const kcal of [29200,16000,13200,3000,10200]){const q=caudalClaseDesdeKcal(kcal);assert.equal(q.metrosCubicosHora,kcal/9300);assert.equal(q.litrosHora,kcal/9300*1000);}
 for(const invalido of [null,0,-1,'29200',NaN])assert.throws(()=>caudalClaseDesdeKcal(invalido),/pendiente o inválido/);
 for(const f of t3.filas)for(let j=0;j<3;j++){
  const r=consultarCapacidadDeclarada(t3,f.longitud,t3.columnas[j]);assert.equal(r.litrosHora,f.capacidades[j]);assert.equal(r.metrosCubicosHora,f.capacidades[j]/1000);
 }
 assert.throws(()=>consultarCapacidadDeclarada(t3,101,'1"'),/no se extrapola/);
 assert.throws(()=>consultarCapacidadDeclarada(t3,0,'1"'),/inválidas/);
 assert.throws(()=>consultarCapacidadDeclarada(t3,40,'2"'),/no transcrito/);
});
test('tabla3: consulta provisional elige fila superior entre las declaradas, nunca interpola',()=>{
 // No valida que estas filas parciales sean la tabla completa ni habilita el motor.
 const r=consultarCapacidadDeclarada(t3,45,'3/4"');assert.equal(r.longitudFila,50);assert.equal(r.litrosHora,1975);assert.match(r.estado,/NO DIÁMETRO DEFINITIVO/);
 assert.equal(validarTablas(t3,t18).habilitado,false);
});
test('tabla3: filas incompletas bloquean revisión y consulta',()=>{
 const t=copia(t3);t.filas[1].capacidades.pop();assert.match(validarTablas(t,t18).errores.join(' '),/incompleta/);assert.throws(()=>consultarCapacidadDeclarada(t,45,'1"'),/ausente o dudosa/);
});
test('tabla3: una celda dudosa queda nula y no se salta a otra fila',()=>{
 const t=copia(t3);t.filas[1].capacidades[1]=null;const r=validarTablas(t,t18);assert.equal(r.habilitado,false);assert.equal(r.capacidades,11);assert.match(r.pendientes.join(' '),/dudosa/);assert.throws(()=>consultarCapacidadDeclarada(t,45,'3/4"'),/no se interpola ni salta/);
});
test('tablas: errores de unidades se detectan, sin conversión implícita',()=>{
 for(const [grupo,key,value]of [[3,'unidadCapacidad','m3/h'],[3,'unidadLongitud','cm'],[18,'unidadDiametro','mm'],[18,'unidadEquivalente','cm']]){
  const a=copia(t3),b=copia(t18);(grupo===3?a:b)[key]=value;assert.match(validarTablas(a,b).errores.join(' '),/Unidades/);
 }
 const a=copia(t3);a.unidadCapacidad='m3/h';assert.throws(()=>consultarCapacidadDeclarada(a,40,'1"'),/Unidades/);
});
test('tabla3: capacidades negativas, nulas, no finitas e inconsistentes no pasan',()=>{
 for(const valor of [0,-1,NaN,Infinity,'800']){const t=copia(t3);t.filas[0].capacidades[0]=valor;assert.match(validarTablas(t,t18).errores.join(' '),/inválida/);}
 let t=copia(t3);t.filas[1].capacidades[0]=900;assert.match(validarTablas(t,t18).errores.join(' '),/crece al aumentar longitud/);
 t=copia(t3);t.filas[0].capacidades[1]=700;assert.match(validarTablas(t,t18).errores.join(' '),/decrece al aumentar diámetro/);
});
test('tabla3: longitudes duplicadas o fuera de orden no se buscan como filas válidas',()=>{
 for(const longitud of [40,30]){const t=copia(t3);t.filas[1].longitud=longitud;assert.match(validarTablas(t,t18).errores.join(' '),/desordenada/);assert.throws(()=>consultarCapacidadDeclarada(t,40,'1"'),/desordenadas/);}
});
test('tabla18: interiores pendientes, incompatibles y coeficientes inválidos bloquean',()=>{
 const t=copia(t18);t.diametros[0].interiorM=-1;assert.match(validarTablas(t3,t).errores.join(' '),/interior inválido/);
 t.accesorios[0].factorD=0;assert.match(validarTablas(t3,t).errores.join(' '),/Coeficiente inválido/);
 t.accesorios.push({...t.accesorios[1]});assert.match(validarTablas(t3,t).errores.join(' '),/duplicados/);
});
test('tabla18: reglas de clase no permiten incluir reducción en equivalentes ni ocultarla de materiales',()=>{
 for(const cambio of [{reduccionesEnEquivalentes:true},{reduccionesEnMateriales:false}]){const t=copia(t18);Object.assign(t.metodoClase,cambio);assert.match(validarTablas(t3,t).errores.join(' '),/reducciones/);}
});
test('tablas: no se habilitan por cambiar solo los indicadores generales de revisión',()=>{
 const a=copia(t3),b=copia(t18);for(const t of [a,b]){t.transcripcionCompleta=true;t.procedencia.edicion='EDICIÓN FICTICIA TEST';t.procedencia.fotografiaDisponible=true;t.procedencia.cotejoFotografico=true;t.procedencia.aplicabilidadVerificada=true;}
 assert.equal(validarTablas(a,b).habilitado,false);assert.match(validarTablas(a,b).pendientes.join(' '),/interior|redondeo|ejercicios/);
});
test('tablas: archivos ausentes mantienen bloqueo explícito',()=>{assert.equal(validarTablas(null,t18).habilitado,false);assert.equal(validarTablas(t3,null).habilitado,false);});
