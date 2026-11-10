const {test}=require('node:test'),assert=require('node:assert/strict');
const {planificarEnsayoIdeal:calcular}=require('../materiales/planificador-gas.js'),app=require('../diagnosticos/cargar-motor.cjs');
const tramo=(id,segmentos,diametro='25 mm',sistema='Thermofusión')=>({id,nombre:id,segmentos,diametro,sistema,material:'SIGAS'});
const datos=[tramo('MA',[1.2,1.5,.9,1.8,1.1,1.4]),tramo('AB',[1.3,1.1,1.5]),tramo('ACal',[.8,1.2,.9,.7,.9],'20 mm'),tramo('BCoc',[.65,.8,.7]),tramo('BTerm',[.75,.6,.8],'20 mm')];
test('20,60 m: 20 cortes, 6 tiras por grupos compatibles y cero cuplas adicionales',()=>{
 const r=calcular(datos);assert.equal(r.metros,20.6);assert.equal(r.tiras,6);assert.equal(r.cuplasNecesarias,0);assert.equal(r.reservaCuplas,0);
 assert.deepEqual(r.compra.map(g=>[g.diametro,g.metros,g.tiras,g.metrosComerciales,g.sobrante,g.cuplas,g.garantiaOptimo]),[['25 mm',13.95,4,16,2.05,0,true],['20 mm',6.65,2,8,1.35,0,true]]);
 const cortes=r.compra.flatMap(g=>g.barras.flatMap(b=>b.cortes));assert.equal(cortes.length,20);assert.equal(new Set(cortes.map(c=>c.segmento)).size,20);assert.ok(cortes.every(c=>datos.some(t=>t.id===c.tramo)));
 assert.ok(r.compra.some(g=>g.barras.some(b=>new Set(b.cortes.map(c=>c.tramo)).size>1)),'Reutilizar realmente entre tramos');
 for(const g of r.compra)for(const b of g.barras){assert.ok(Math.abs(b.cortes.reduce((n,c)=>n+c.metros,0)+b.sobrante-4)<1e-9);assert.ok(b.sobrante>=0);assert.ok(b.cortes.every(c=>datos.find(t=>t.id===c.tramo).diametro===g.diametro));}
});
for(const [metros,tiras,cuplas]of [[3,1,0],[4,1,0],[5,2,1],[8,2,1],[10,3,2]])test('Recta independiente '+metros+' m: empalmes solo dentro del segmento',()=>{
 const r=calcular([tramo('recta',[metros])]);assert.equal(r.tiras,tiras);assert.equal(r.cuplasNecesarias,cuplas);assert.equal(r.compra[0].sobrante,tiras*4-metros);
});
test('Codos separan segmentos: dos rectas de 4 m no llevan cupla; dos de 5 m requieren dos',()=>{
 assert.equal(calcular([tramo('codo',[4,4])]).cuplasNecesarias,0);assert.equal(calcular([tramo('codo',[5,5])]).cuplasNecesarias,2);
});
test('Recalcular longitudes y largo comercial; reserva nunca aumenta empalmes necesarios',()=>{
 assert.equal(calcular([tramo('t',[5])],{largoComercial:6}).cuplasNecesarias,0);
 const seis=calcular(datos,{largoComercial:6});assert.equal(seis.tiras,5);assert.equal(seis.cuplasNecesarias,0);assert.deepEqual(seis.compra.map(g=>g.tiras),[3,2]);
 assert.equal(calcular([tramo('t',[5])],{largoComercial:2}).cuplasNecesarias,2);
 const r=calcular(datos,{largoComercial:4,reservaCuplas:3});assert.equal(r.cuplasNecesarias,0);assert.equal(r.reservaCuplas,3);assert.equal(r.tiras,6);
 assert.equal(calcular([tramo('t',[4.1])]).cuplasNecesarias,1);
});
test('No mezclar diámetros, fabricantes ni sistemas al aprovechar sobrantes',()=>{
 const a=tramo('a',[2]),b=tramo('b',[2],'20 mm'),c=tramo('c',[2],'25 mm','Roscado'),d={...tramo('d',[2]),material:'OTRO'};
 const r=calcular([a,b,c,d]);assert.equal(r.compra.length,4);assert.equal(r.tiras,4);
});
test('Ajustes exactos decimales y rechazo de entradas inválidas sin fabricar números',()=>{
 const r=calcular([tramo('a',[1.8,1.5,.7])]);assert.equal(r.tiras,1);assert.equal(r.compra[0].sobrante,0);
 for(const x of [0,-1,NaN,Infinity,'1,2'])assert.throws(()=>calcular([tramo('a',[x])]));
 assert.throws(()=>calcular(datos,{largoComercial:0}));assert.throws(()=>calcular(datos,{reservaCuplas:1.5}));assert.throws(()=>calcular([tramo('a',[1]),tramo('a',[1])]));
});
function ejemplo(){const a=app();a.run("abrir('gas');abrirEjemploTeesRapidasGas();for(const [nodo,orden]of [['a','giro-directo'],['b','giro-giro']]){const e=entradaPreseleccionSigasGas(),p=e.inventario.fisicas.find(p=>p.nodo==='nombre:'+nodo);guardarOrientacionTeeVinculadaGas(contextoOrientacionTeeGas(p,e),orden)}");return a;}
test('Mismo proyecto: ensayo y control no alteran SIGAS, inventario, vías ni PDF',()=>{
 const a=ejemplo(),antes=a.run('JSON.stringify({tramos,artefactos,instalacionGas,conteos:proyectoGasActual().conteosRapidosGas,config:proyectoGasActual().calculoSigas,r:resultadoPreliminarSigasGas()})');
 const r=JSON.parse(a.run('JSON.stringify(calcularEnsayoCortesIdealGas())'));assert.equal(r.instalacion.tiras,6);assert.equal(r.control.tiras,2);assert.equal(r.control.cuplasNecesarias,1);assert.equal(r.difiereMetrajeProyecto,false);
 a.run("proyectoGasActual().ensayoCortesIdealGas=datosEnsayoCortesIdealGas();guardarDatos();prepararInformeActual()");
 assert.equal(a.run('JSON.stringify({tramos,artefactos,instalacionGas,conteos:proyectoGasActual().conteosRapidosGas,config:proyectoGasActual().calculoSigas,r:resultadoPreliminarSigasGas()})'),antes);
 const b=app(a.saved());b.run("abrir('gas');calcularMaterialesManualGas()");assert.deepEqual(JSON.parse(b.run('JSON.stringify(datosEnsayoCortesIdealGas())')),JSON.parse(a.run('JSON.stringify(datosEnsayoCortesIdealGas())')));
 assert.equal(b.run('calcularEnsayoCortesIdealGas().instalacion.tiras'),6);
 a.run('proyectoGasActual().ensayoCortesIdealGas.segmentosPorTramo[tramos[0].id][0]=4.2');assert.equal(a.run('calcularEnsayoCortesIdealGas().instalacion.cuplasNecesarias'),1);assert.equal(a.run('calcularEnsayoCortesIdealGas().difiereMetrajeProyecto'),true);assert.equal(a.run('tramos[0].metros'),7.9);
});
test('No inventar segmentos cuando cambia cantidad de codos ni diámetros cuando falta PCS',()=>{
 const a=ejemplo();a.run('proyectoGasActual().conteosRapidosGas[tramos[0].id].codo90=6');assert.throws(()=>a.run('calcularEnsayoCortesIdealGas()'),/separación/);
 const b=ejemplo();b.run('delete instalacionGas.perfil.poderCalorifico;delete instalacionGas.perfil.fuenteGas');assert.throws(()=>b.run('calcularEnsayoCortesIdealGas()'),/diámetro/);
});
