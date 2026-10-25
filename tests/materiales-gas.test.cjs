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

const compra=(e,o={},tecnico={})=>require('../materiales/planificador-gas.js').prepararCompra(e,plan(e,o),o,tecnico);
test('compra: límites de tiras de 6 m y sobrantes conservan longitud',()=>{
 for(const [m,t]of [[.5,1],[5,1],[6,1],[6.01,2],[9,2],[12,2],[15,3],[18,3],[18.01,4]]){const r=compra(entrada([tramo('a',m)])),f=r.tramos[0];assert.equal(f.tiras,t);assert.equal(f.metrosComerciales,t*6);assert.ok(Math.abs(f.sobrante-(t*6-m))<1e-9);assert.equal(f.cuplas,t-1);assert.equal(r.definitiva,false);}
});
test('compra: 4 m documentados y valores anteriores de 6 m permanecen independientes',()=>{const e=entrada([tramo('a',9)]);assert.equal(compra(e,{largoComercial:4}).tramos[0].tiras,3);assert.equal(compra(e,{largoComercial:6}).tramos[0].tiras,2);});
test('compra: segmentos interrumpidos por accesorios no suman cuplas entre sí',()=>{
 const continuo=compra(entrada([tramo('a',10)])),interrumpido=compra(entrada([{...tramo('a',10),segmentos:seg(6,4),accesorios:[{tipo:'codo90',cantidad:1,confirmado:true}]}]));assert.equal(continuo.tramos[0].cuplas,1);assert.equal(interrumpido.tramos[0].cuplas,0);assert.equal(compra(entrada([tramo('a',10,'1"',null)])).tramos[0].cuplas,null);
});
test('compra: no intercambia sobrantes entre diámetros, ni supone reutilización entre tramos',()=>{
 const e=entrada([tramo('a',4),tramo('b',2,'3/4"')]),r=compra(e,{reutilizar:true});assert.equal(r.canos.length,2);assert.equal(r.canos.reduce((n,g)=>n+g.tiras,0),2);
 const distinto=entrada([{...tramo('a',6),segmentos:[{metros:4,diametro:'1"'},{metros:2,diametro:'3/4"'}]}]);assert.equal(compra(distinto,{reutilizar:true}).canos.length,2);assert.equal(compra(distinto,{reutilizar:true}).tramos[0].tiras,2);
 const mismo=entrada([{...tramo('a',6),segmentos:seg(4,2)}]);assert.equal(compra(mismo).tramos[0].tiras,2);assert.equal(compra(mismo,{reutilizar:true}).tramos[0].tiras,1);
});
test('compra: distribución explícita respeta total e interrupciones y conserva una cupla por unión',()=>{
 const api=require('../materiales/planificador-gas.js'),e=entrada([tramo('a',10)]),t=e.tramos[0],grupos=[[5,5]],op={largoComercial:6};op.cortesCompra={a:{grupos,confirmado:true,firma:api.firmaCortesCompra(t,e,op)}};
 const r=compra(e,op);assert.deepEqual(r.tramos[0].segmentos[0].cortes,[5,5]);assert.equal(r.tramos[0].cuplas,1);assert.equal(r.tramos[0].distribucionVigente,true);
 assert.throws(()=>api.validarDistribucionCompra(t,[[7,3]],6));assert.throws(()=>api.validarDistribucionCompra(t,[[6,3]],6));assert.throws(()=>api.validarDistribucionCompra(t,[[6],[4]],6),/interrupciones/);
 t.metros=12;t.segmentos=seg(12);const cambiado=compra(e,op);assert.equal(cambiado.tramos[0].distribucionVigente,false);assert.ok(cambiado.pendientes.some(s=>s.includes('Distribución conservada')));
});
test('compra: candidatos no pasan a verificados ni cambian inventario',()=>{
 const e=entrada([tramo('a',9,null,null)]),antes=JSON.stringify(e),r=compra(e,{}, {definitivo:false,filas:[{id:'a',candidato:{exteriorMm:25}}]});assert.equal(r.canos[0].diametro,'25 mm');assert.equal(r.canos[0].estadoDiametro,'candidato');assert.equal(r.tramos[0].cuplas,null);assert.equal(JSON.stringify(e),antes);
});
test('compra: tee reductora no agrega reducción y cambios ambiguos quedan como propuestas únicas',()=>{
 const e=teeCaso(),r=compra(e,{uniones:{A:'tee-reductora'}});assert.equal(r.registrados.filter(f=>f.tipo==='tee').length,1);assert.equal(r.registrados.filter(f=>f.tipo==='reduccion').length,0);
 const pendiente=compra(e);assert.equal(pendiente.propuestas.length,1);assert.equal(pendiente.propuestas[0].confirmada,false);assert.equal(pendiente.propuestas[0].cantidad,null);assert.equal(pendiente.registrados.filter(f=>f.tipo==='reduccion').length,0);
});
test('compra: cuplas declaradas se conservan sin sumarse a las calculadas',()=>{
 const e=entrada([tramo('a',10)]);e.extras=[{tipo:'cupla',cantidad:1,medidas:['1"'],confirmado:true,ubicacion:'a'}];const r=compra(e);assert.equal(r.registrados.find(f=>f.tipo==='cupla').cantidad,1);assert.equal(r.tramos[0].cuplas,null);assert.equal(r.tramos[0].cuplasCalculadas,1);
});
test('compra: agrupar advertencias conserva cada comprobación sin inventar ni perder textos',()=>{
 const api=require('../materiales/planificador-gas.js'),textos=['Presión pendiente','Diámetro pendiente','Tee: vía pendiente','Cuplas y cortes pendientes','NAG: verificación normativa pendiente','Edición sin verificar'];const r=api.agruparPendientesCompra(textos);assert.equal(r.length,5);assert.deepEqual(r.flatMap(g=>g.detalles).sort(),textos.sort());
});
test('compra: una cupla registrada en un tramo no bloquea las uniones conocidas de otro',()=>{
 const e=entrada([tramo('a',10),tramo('b',10,'3/4"')]);e.extras=[{tipo:'cupla',cantidad:1,medidas:['1"'],confirmado:true,ubicacion:'a'}];const r=compra(e);assert.equal(r.tramos.find(t=>t.id==='a').cuplas,null);assert.equal(r.tramos.find(t=>t.id==='b').cuplas,1);assert.equal(r.registrados.filter(f=>f.tipo==='cupla').reduce((n,f)=>n+f.cantidad,0),1);
});
