const {test}=require('node:test');
const assert=require('node:assert/strict');
const {planificarCortes:cortes,planificarMateriales:plan}=require('../materiales/planificador-gas.js');
const seg=(...ms)=>ms.map((metros,i)=>({id:'s'+i,metros}));
const tramo=(id,metros,diametro='1"',segmentos=seg(metros))=>({id,metros,diametro,segmentos,accesorios:[]});
const entrada=tramos=>({material:'Acero epoxi',sistema:'Roscado',tramos,nodos:[]});
function teeCaso(){return {material:'Acero epoxi',sistema:'Roscado',nodos:[{id:'A'}],tramos:[{...tramo('M-A',19),red:{desde:'M',hasta:'A'},accesorios:[{tipo:'tee',nodo:'A',cantidad:1,medidas:['1"','1"','3/4"'],confirmado:true}]},{...tramo('A-H',18),red:{desde:'A',hasta:'H'}},{...tramo('A-C',12,'3/4"'),red:{desde:'A',hasta:'C'}}]};}
test('materiales: caños y cuplas en límites 6, 12 y 18, debajo y encima',()=>{
 for(const l of [6,12,18])for(const d of [-.001,0,.001]){const r=cortes(seg(l+d));assert.equal(r.compraEstimada,l/6+(d>0?1:0));assert.equal(r.cuplasPropuestas,r.compraEstimada-1);}
 assert.equal(cortes(seg(6.0000000001)).compraEstimada,2);
});
test('materiales: largo comercial configurable, sin imponer 6 m',()=>{const r=cortes(seg(10),{largoComercial:5});assert.equal(r.compraEstimada,2);assert.equal(r.cuplasPropuestas,1);assert.equal(r.minimoTeorico,2);});
test('materiales: reutilizar un sobrante entre segmentos evita comprar caño nuevo por tramo',()=>{
 const sin=cortes(seg(4,2),{reutilizar:false}),con=cortes(seg(4,2),{reutilizar:true});assert.equal(sin.compraEstimada,2);assert.equal(con.compraEstimada,1);assert.equal(con.cuplasPropuestas,0);assert.equal(con.barras[0].cortes.length,2);
});
test('materiales: mínimo teórico distinto de compra; no se unen dos sobrantes a escondidas',()=>{
 const r=cortes(seg(5,5,2),{reutilizar:true});assert.equal(r.minimoTeorico,2);assert.equal(r.compraEstimada,3);assert.equal(r.cuplasPropuestas,0);assert.equal(r.garantiaOptimo,false);
});
test('materiales: sobrante mínimo limita aprovechamiento y se muestra lo descartado',()=>{
 const r=cortes(seg(5.5,.5),{reutilizar:true,minimoSobrante:1});assert.equal(r.compraEstimada,2);assert.equal(r.sobrantes[0].metros,.5);assert.equal(r.sobrantes[0].reutilizable,false);
});
test('materiales: cuplas solo dentro de cada segmento continuo, no en codos',()=>{
 assert.equal(cortes(seg(6,6)).cuplasPropuestas,0);assert.equal(cortes(seg(12)).cuplasPropuestas,1);const r=cortes(seg(8,4),{reutilizar:true});assert.equal(r.compraEstimada,2);assert.equal(r.cuplasPropuestas,1);
});
test('materiales: inválidos y explosión de cortes se rechazan sin colgar la app',()=>{
 for(const largoComercial of [0,-1,NaN,Infinity])assert.throws(()=>cortes(seg(6),{largoComercial}));assert.throws(()=>cortes([{id:'s',metros:1},{id:'s',metros:2}]));assert.throws(()=>cortes(seg(100001),{largoComercial:1}),/demasiado grande/);
});
test('materiales: conserva longitud en cortes y sobrantes y no modifica la entrada',()=>{
 const s=seg(8,4,3.2),antes=JSON.stringify(s),r=cortes(s,{reutilizar:true});assert.equal(JSON.stringify(s),antes);
 for(const b of r.barras)assert.ok(Math.abs(b.cortes.reduce((n,c)=>n+c.metros,0)+b.sobrante-b.metros)<1e-9);
});
test('materiales: sobrantes nunca se mezclan entre diámetros ni sistemas',()=>{
 const a=tramo('a',4),b=tramo('b',2,'3/4"'),c={...tramo('c',2),sistema:'Otro sistema'};const r=plan(entrada([a,b,c]),{reutilizar:true});assert.equal(r.planes.length,3);assert.equal(r.planes.reduce((n,p)=>n+p.compraEstimada,0),3);
});
test('materiales: medidas desconocidas se separan, compra no confirmada',()=>{
 const e=entrada([tramo('a',4,null,null),tramo('b',2,null,null)]),r=plan(e,{reutilizar:true});assert.equal(r.planes.length,2);assert.ok(r.planes.every(g=>g.compraEstimada===null));assert.equal(r.dimensionamientoDefinitivo,false);
});
test('materiales: cambios internos de diámetro agrupan longitudes por medida correcta',()=>{
 const r=plan(entrada([{...tramo('t',10),segmentos:[{metros:4,diametro:'1"'},{metros:6,diametro:'3/4"'}]}]));assert.equal(r.planes.length,2);assert.deepEqual(r.planes.map(g=>g.metros),[4,6]);
});
test('materiales: duplicación de una tee compartida se evita por nodo físico',()=>{
 const e=teeCaso();e.tramos[1].accesorios.push({...e.tramos[0].accesorios[0]});const r=plan(e,{uniones:{A:'tee-reductora'}});assert.equal(r.filas.filter(f=>f.tipo==='tee').length,1);assert.equal(r.filas.filter(f=>f.tipo==='tee')[0].cantidad,1);assert.equal(r.filas.filter(f=>f.tipo==='reduccion').length,0);
});
test('materiales: accesorios compartidos con id físico se cuentan una vez; sin id son piezas distintas',()=>{
 const e=entrada([tramo('a',3),tramo('b',3)]);for(const t of e.tramos)t.accesorios=[{idFisico:'v',tipo:'llave',cantidad:1,medidas:['1"'],confirmado:true}];assert.equal(plan(e).filas.filter(f=>f.tipo==='llave').length,1);e.tramos[1].accesorios[0].idFisico='v2';assert.equal(plan(e).filas.filter(f=>f.tipo==='llave').length,2);
});
test('materiales: contradicción entre referencias a una pieza queda visible',()=>{
 const e=teeCaso();e.tramos[1].accesorios.push({...e.tramos[0].accesorios[0],cantidad:2});const r=plan(e);assert.match(r.avisos.join(' '),/contradictorios/);assert.equal(r.filas.find(f=>f.tipo==='tee').conflicto,true);
});
test('materiales: cambio en derivación no inventa reducción mientras falte tipo',()=>{
 const r=plan(teeCaso());assert.equal(r.filas.filter(f=>f.tipo==='reduccion').length,0);assert.equal(r.filas.find(f=>f.tipo==='reduccion-pendiente').cantidad,null);
});
test('materiales: tee igual con reducción cuenta ambas piezas una sola vez',()=>{
 const r=plan(teeCaso(),{uniones:{A:'tee-igual-reduccion'}});assert.equal(r.filas.filter(f=>f.tipo==='tee').length,1);assert.equal(r.filas.filter(f=>f.tipo==='reduccion').length,1);assert.equal(r.filas.find(f=>f.tipo==='reduccion').diametro,'1" / 3/4"');assert.match(r.filas.find(f=>f.tipo==='reduccion').equivalentes,/Excluida/);
});
test('materiales: reducción independiente en unión recta y pendiente en codo no identificado',()=>{
 const e=entrada([{...tramo('a',2),red:{desde:'M',hasta:'U'}},{...tramo('b',2,'3/4"'),red:{desde:'U',hasta:'B'}}]);e.nodos=[{id:'U',unionDimensionamiento:'union'}];assert.equal(plan(e).filas.find(f=>f.tipo==='reduccion').cantidad,1);e.nodos[0].unionDimensionamiento='codo90';assert.equal(plan(e).filas.find(f=>f.tipo==='reduccion-pendiente').cantidad,null);
});
test('materiales: reducción identificada no se duplica al comparar la red',()=>{
 const e=entrada([{...tramo('a',2),red:{desde:'M',hasta:'U'},accesorios:[{tipo:'reduccion',nodo:'U',cantidad:1,medidas:['1"','3/4"'],confirmado:true}]},{...tramo('b',2,'3/4"'),red:{desde:'U',hasta:'B'}}]);e.nodos=[{id:'U',unionDimensionamiento:'union'}];assert.equal(plan(e).filas.filter(f=>f.tipo==='reduccion').length,1);
});
test('materiales: cuplas manuales y propuesta de cortes quedan para cotejo sin suma automática',()=>{
 const e=entrada([tramo('a',12)]);e.extras=[{tipo:'cupla',cantidad:1,medidas:['1"'],confirmado:true,ubicacion:'a'}];const r=plan(e);assert.equal(r.filas.find(f=>f.tipo==='cupla').cantidad,1);assert.equal(r.filas.find(f=>f.tipo==='cupla-plan').cantidad,null);assert.match(r.avisos.join(' '),/no sumarlas automáticamente/);
 const conectada=entrada([{...tramo('a',3),red:{desde:'M',hasta:'U'}},{...tramo('b',3),red:{desde:'U',hasta:'B'}}]);conectada.nodos=[{id:'U',unionDimensionamiento:'union'}];const u=plan(conectada,{reutilizar:true});assert.equal(u.filas.find(f=>f.tipo==='cupla').cantidad,1);assert.equal(u.planes[0].cuplasPropuestas,0);
});
test('materiales: posiciones desconocidas producen mínimo, no cuplas cero ni compra definitiva',()=>{
 const e=entrada([tramo('a',19,'1"',null),tramo('b',18,'1"',null),tramo('c',12,'3/4"',null)]);const r=plan(e);assert.deepEqual(r.planes.map(g=>g.minimoTeorico),[7,2]);assert.ok(r.planes.every(g=>g.compraEstimada===null&&g.cuplasPropuestas===null));
 const h=plan(e,{hipotesisSinPosiciones:true});assert.deepEqual(h.planes.map(g=>g.plan.compraEstimada),[7,2]);assert.deepEqual(h.planes.map(g=>g.plan.cuplasPropuestas),[5,1]);assert.ok(h.planes.every(g=>g.hipotesis&&g.compraEstimada===null));
});
test('materiales: otros accesorios identificados conservan nombre y evidencia, sin inventar equivalentes',()=>{
 const e=entrada([tramo('a',3)]);e.extras=[{tipo:'Unión doble',cantidad:2,medidas:['1"'],confirmado:true,ubicacion:'A'}];const r=plan(e),f=r.filas.find(f=>f.tipo==='Unión doble');assert.equal(f.estado,'confirmado');assert.equal(f.cantidad,2);assert.match(f.equivalentes,/No se calculan/);
});
test('materiales: medida propuesta mantiene fila estimada aunque la cantidad esté identificada',()=>{
 const e=entrada([tramo('a',3)]);e.extras=[{tipo:'codo45',cantidad:2,medidas:['1"','1"'],confirmado:true,medidasEstimadas:true}];const f=plan(e).filas.find(f=>f.tipo==='codo45');assert.equal(f.cantidadConfirmada,true);assert.equal(f.estado,'estimado');
 const registro=require('../materiales/resultado-ejercicio.json');for(const caso of registro.casos)assert.deepEqual(plan(registro.entrada,caso.opciones),caso.resultado);
});
