const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const t3=require('../datos/tabla-3.js'),t18=require('../datos/tabla-18.js');
const referencia=require('../datos/referencia-auditoria-tabla3.js');
const base=require('./fixtures/tabla-3-1e99313.cjs');
const {auditarTabla3,auditarRedondeos,auditarDudas}=require('../datos/auditoria-tablas.js');
const {validarTablas}=require('../datos/validacion-tablas.js');
const copia=x=>structuredClone(x);
const auditar=t=>auditarTabla3(t,referencia);
test('auditoría3: 441 posiciones, 436 sin cambios y cinco correcciones explícitas',()=>{
 const r=auditar(t3);assert.equal(r.integra,true);assert.equal(r.posiciones,441);assert.equal(r.coincidencias,441);assert.equal(r.coincidenciasBase,436);assert.equal(r.correccionesDocumentadas.length,5);assert.deepEqual(r.errores,[]);
 assert.match(r.alertas.join(' '),/no prueba exactitud normativa/);
});
test('auditoría3: controles pedidos continúan asociados exactamente a sus coordenadas',()=>{
 for(const [l,d,q]of [[50,'1/2"',715],[50,'3/4"',1975],[50,'1"',4035],[65,'1/2"',630]])assert.equal(t3.filas.find(f=>f.longitud===l).capacidades[t3.columnas.indexOf(d)],q);
});
test('auditoría3: correcciones coinciden con original registrado y lectura revisada, sin borrar historia',()=>{
 const esperado=[[10,'4"',287190,287189],[12,'4"',262151,282151],[16,'4"',227244,227024],[55,'3"',59612,59650],[85,'2"',17655,17565]];
 assert.deepEqual(t3.auditoria.correcciones.map(c=>[c.longitud,c.diametro,c.anterior,c.corregido]),esperado);
 for(const [l,d,antes,ahora]of esperado){const j=t3.columnas.indexOf(d);assert.equal(base.filas.find(f=>f.longitud===l).capacidades[j],antes);assert.equal(t3.filas.find(f=>f.longitud===l).capacidades[j],ahora);}
 assert.deepEqual(t3.auditoria.correcciones,referencia.correccionesAuditadas);
});
test('auditoría3: reintroducir cualquiera de los cinco errores se detecta',()=>{
 for(const c of t3.auditoria.correcciones){const t=copia(t3);t.filas.find(f=>f.longitud===c.longitud).capacidades[t.columnas.indexOf(c.diametro)]=c.anterior;const r=auditar(t);assert.equal(r.integra,false);assert.equal(r.diferencias.length,1);}
});
test('auditoría3: se detecta fila ausente aunque las restantes sigan ordenadas',()=>{
 const t=copia(t3);t.filas=t.filas.filter(f=>f.longitud!==55);const r=auditar(t);assert.equal(r.integra,false);assert.match(r.errores.join(' '),/Falta fila fotografiada de 55/);
});
test('auditoría3: longitud duplicada o no fotografiada no se acepta',()=>{
 let t=copia(t3);t.filas.push(copia(t.filas[0]));assert.match(auditar(t).errores.join(' '),/duplicada/);
 t=copia(t3);t.filas[1].longitud=2.5;assert.match(auditar(t).errores.join(' '),/no presente/);
});
test('auditoría3: encabezados duplicados, incompletos o intercambiados se detectan',()=>{
 for(const mutar of [t=>t.columnas.reverse(),t=>t.columnas.pop(),t=>t.columnas[1]=t.columnas[0]]){const t=copia(t3);mutar(t);assert.equal(auditar(t).integra,false);assert.match(auditar(t).errores.join(' '),/Encabezados/);}
});
test('auditoría3: capacidades desplazadas entre columnas quedan ubicadas como diferencias',()=>{
 const t=copia(t3);[t.filas[0].capacidades[1],t.filas[0].capacidades[2]]=[t.filas[0].capacidades[2],t.filas[0].capacidades[1]];const r=auditar(t);assert.equal(r.diferencias.length,2);assert.equal(r.diferencias[0].longitud,2);assert.equal(r.diferencias[0].diametro,'3/4"');
});
test('auditoría3: un error que conserva monotonicidad también se detecta',()=>{
 const t=copia(t3);t.filas.find(f=>f.longitud===50).capacidades[0]=716;const r=auditar(t);assert.equal(r.integra,false);assert.equal(r.diferencias[0].referencia,715);
});
test('auditoría3: unidades incorrectas bloquean aunque los 441 números coincidan',()=>{
 for(const [k,v]of [['unidadLongitud','cm'],['unidadCapacidad','m3/h']]){const t=copia(t3);t[k]=v;assert.equal(auditar(t).integra,false);assert.match(auditar(t).errores.join(' '),/Unidades/);}
});
test('auditoría3: filas malformadas y celdas nulas se informan sin completar datos',()=>{
 for(const mutar of [t=>t.filas[0]=null,t=>t.filas[0].capacidades.pop(),t=>t.filas[0].capacidades[0]=null,t=>t.filas=null]){const t=copia(t3);mutar(t);assert.equal(auditar(t).integra,false);}
});
test('auditoría3: falta de referencia o cambio de foto mantiene revisión bloqueada',()=>{
 assert.equal(auditarTabla3(t3,null).integra,false);assert.equal(auditarTabla3(null,referencia).integra,false);const t=copia(t3);t.procedencia.sha256='otro';assert.equal(auditar(t).integra,false);
});
test('auditoría: funciones no alteran originales, referencia ni equivalentes',()=>{
 const originales=JSON.stringify([t3,t18,referencia]);auditar(t3);auditarRedondeos(t18);auditarDudas(t18);assert.equal(JSON.stringify([t3,t18,referencia]),originales);
});
test('auditoría18: nueve diferencias originales incluyen producto exacto y diferencia firmada',()=>{
 const r=auditarRedondeos(t18).filas.filter(f=>f.accesorio==='codo45');assert.equal(r.length,9);
 assert.deepEqual(r.map(f=>[f.cantidad,f.diametro,f.impreso,f.calculado,f.diferencia]),[
 [1,'3/4"',.26,.266,-.006],[2,'2"',1.42,1.428,-.008],[2,'2 1/2"',1.77,1.764,.006],[3,'1/2"',.54,.546,-.006],[3,'3/4"',.79,.798,-.008],[3,'1 1/2"',1.59,1.596,-.006],[4,'1/2"',.72,.728,-.008],[4,'1 1/2"',2.12,2.128,-.008],[4,'2"',2.85,2.856,-.006]]);
 assert.ok(r.every(f=>f.estado.includes('pendiente')&&f.origenCalculado.includes('derivado')));
});
test('auditoría18: truncamiento solo es hipótesis en ocho celdas, no regla general',()=>{
 const r=auditarRedondeos(t18).filas.filter(f=>f.accesorio==='codo45');assert.equal(r.filter(f=>f.posibleExplicacion.startsWith('Compatible')).length,8);assert.match(r.find(f=>f.diferencia>0).posibleExplicacion,/No coincide/);assert.equal(t18.redondeo.verificado,false);
});
test('auditoría18: 7,67 impreso y 7,65 derivado se conservan separados',()=>{
 const c=auditarDudas(t18)[0];assert.equal(c.valorOriginal,7.67);assert.equal(c.calculado,7.65);assert.equal(c.diferencia,.02);assert.equal(c.lecturaConfirmada,true);assert.match(c.estado,/NO resuelta/);assert.match(c.explicacion,/no es redondeo/);
 assert.equal(auditarRedondeos(t18).filas.filter(f=>f.accesorio==='codo90').length,1);
});
test('auditoría18: lectura de tee es 7,60 y nunca se infiere solo por producto',()=>{
 const c=auditarDudas(t18)[1];assert.equal(c.valorOriginal,7.60);assert.equal(c.calculado,7.60);assert.equal(c.diferencia,0);assert.equal(c.lecturaConfirmada,true);
 const t=copia(t18);t.celdasReexaminadas=[];assert.equal(auditarDudas(t)[1].lecturaConfirmada,false);
 const previa=require('./fixtures/tabla-18-1e99313.cjs');assert.equal(auditarDudas(previa)[1].valorOriginal,null);assert.equal(auditarDudas(previa)[1].lecturaConfirmada,false);
});
test('auditoría: 225 impresos completos no habilitan catálogo ni prueban aplicabilidad',()=>{
 assert.ok(t18.complemento.every(f=>f.equivalentesM.every(Number.isFinite)));const r=validarTablas(t3,t18);assert.equal(r.habilitado,false);assert.deepEqual(r.errores,[]);
 for(const t of [t3,t18]){assert.equal(t.procedencia.edicion,null);assert.equal(t.procedencia.aplicabilidadVerificada,false);assert.equal(t.procedencia.vigenciaVerificada,false);}
 assert.ok(t18.diametros.every(d=>d.interiorM===null));assert.equal(t18.metodoClase.reduccionesEnMateriales,true);assert.equal(t18.metodoClase.reduccionesEnEquivalentes,false);
});
test('auditoría3: exportación CSV enumera 441 coordenadas únicas y coincide con los datos auditados',()=>{
 const lineas=fs.readFileSync('auditoria/tabla-3-coordenadas.csv','utf8').trim().split('\n').slice(1);assert.equal(lineas.length,441);const vistas=new Set();
 for(const linea of lineas){const [l,d,q,fi,co]=linea.split(';');assert.equal(t3.columnas[Number(co)-1],d);assert.equal(t3.filas[Number(fi)-1].longitud,Number(l));assert.equal(t3.filas[Number(fi)-1].capacidades[Number(co)-1],Number(q));vistas.add(l+'|'+d);}assert.equal(vistas.size,441);
 const exportado=JSON.parse(fs.readFileSync('auditoria/resultado.json','utf8'));
 assert.deepEqual(exportado.tabla3,auditar(t3));assert.deepEqual(exportado.redondeos,auditarRedondeos(t18));assert.deepEqual(exportado.celdasReexaminadas,auditarDudas(t18));assert.equal(exportado.habilitado,false);
 const redondeos=fs.readFileSync('auditoria/redondeos.csv','utf8').trim().split('\n');assert.equal(redondeos.length,10);assert.ok(redondeos.every(f=>f.split(';').length===8));
});
