const {test}=require('node:test'),assert=require('node:assert/strict'),app=require('../diagnosticos/cargar-motor.cjs');
function ejemplo(){const a=app();a.run("abrir('gas');abrirEjemploTeesRapidasGas();for(const [n,o]of [['a','giro-directo'],['b','giro-giro']]){const e=entradaPreseleccionSigasGas(),p=e.inventario.fisicas.find(p=>p.nodo==='nombre:'+n);guardarOrientacionTeeVinculadaGas(contextoOrientacionTeeGas(p,e),o)};for(const [n,r]of [['medidor','3/4'],['Cocina','1/2'],['Termotanque','1/2'],['Calefactor','1/2']])guardarDatoTerminalSigasGas('terminal-'+n,'rosca',r)");return a;}
const leer=(a,s)=>JSON.parse(a.run('JSON.stringify('+s+')'));
test('Cortes y escenario usan cero adicionales: nuevas rutas, mismas cantidades y diámetros',()=>{
 const a=ejemplo(),m=leer(a,'resultadoPreliminarSigasGas()');assert.equal(m.completo,true);assert.equal(m.uniones.base,'ensayo-cortes');assert.equal(m.uniones.registradas,0);assert.equal(m.uniones.adicionales,0);assert.equal(m.uniones.estimadas,0);
 assert.deepEqual(m.resultado.filas.map(f=>f.candidato.exteriorMm),[25,25,20,25,20]);assert.deepEqual(m.resultado.filas.map(f=>+f.longitudConsultaM.toFixed(3)),[23.925,23.925,21.377,22.749,23.925]);assert.deepEqual(m.resultado.filas.map(f=>f.candidato.longitudFilaM),[24,24,22,24,24]);assert.deepEqual(m.resultado.filas.map(f=>f.candidato.capacidadM3h),[2.526,2.526,1.193,2.526,1.142]);
 for(const f of m.resultado.filas){assert.ok(f.candidato.capacidadM3h>=f.caudalM3h);assert.ok(f.candidato.longitudFilaM>=f.longitudConsultaM);}
 assert.deepEqual(m.cantidadesDeclaradas,{codo90:15,tee:2,llave:3});assert.deepEqual(m.compra.canos.map(g=>[g.diametro,g.tiras,g.sobrante]),[['25 mm',4,2.05],['20 mm',2,1.35]]);assert.equal(m.compra.estimacionCuplas.total,0);
 assert.ok(m.resultado.recorridos.every(r=>r.aportes.every(p=>p.tipo!=='cupla')));assert.deepEqual(m.clasificacionCodos.map(c=>[c.comunes,c.terminales]),[[4,1],[2,0],[3,1],[1,1],[1,1]]);
 const tees=m.materiales.filter(x=>x.tipo==='tee');assert.equal(tees.length,1);assert.equal(tees[0].cantidad,2);assert.doesNotMatch(tees[0].material,/flujo/);assert.equal(m.materiales.filter(x=>x.tipo==='codo90').reduce((n,x)=>n+x.cantidad,0),15);
 for(const r of m.resultado.recorridos){assert.equal(new Set(r.aportes.map(p=>p.piezaId)).size,r.aportes.length);const A=r.aportes.find(p=>p.piezaId==='tee:nombre:a');assert.equal(A.equivalenteUnitarioM,r.artefacto==='Calefactor'?.222:.707);}
 assert.equal(m.margenes.length,1);assert.equal(m.margenes[0].tramo,'M–A');assert.ok(Math.abs(m.margenes[0].margenM3h-(2.526-21800/9300))<1e-12);
});
test('Modificar largo comercial recalcula uniones, recorridos y compra; reserva no altera pérdidas',()=>{
 const a=ejemplo(),base=leer(a,'resultadoPreliminarSigasGas()');a.run('proyectoGasActual().ensayoCortesIdealGas=datosEnsayoCortesIdealGas();proyectoGasActual().ensayoCortesIdealGas.reservaCuplas=3;guardarDatos()');
 assert.deepEqual(leer(a,'resultadoPreliminarSigasGas().resultado.filas'),base.resultado.filas);assert.equal(a.run('resultadoPreliminarSigasGas().uniones.reserva'),3);
 a.run('proyectoGasActual().ensayoCortesIdealGas.largoComercial=1;guardarDatos()');const m=leer(a,'resultadoPreliminarSigasGas()');assert.equal(m.uniones.adicionales,9);assert.equal(m.uniones.reserva,3);assert.ok(m.resultado.filas[0].longitudConsultaM>base.resultado.filas[0].longitudConsultaM);assert.ok(m.resultado.recorridos.some(r=>r.aportes.some(p=>p.tipo==='cupla')));assert.equal(m.compra.largoComercial,1);
 a.run('proyectoGasActual().ensayoCortesIdealGas.largoComercial=6;guardarDatos()');assert.equal(a.run('resultadoPreliminarSigasGas().compra.largoComercial'),6);assert.equal(a.run('resultadoPreliminarSigasGas().compra.canos.reduce((n,g)=>n+g.tiras,0)'),5);
});
test('Cupla registrada se conserva una sola vez aunque el ensayo requiera cero adicionales',()=>{
 const a=ejemplo();a.run("tramos[0].detalle.accesorios.push({tipo:'cupla'});guardarDatos();calcularMaterialesManualGas()");const m=leer(a,'resultadoPreliminarSigasGas()');assert.equal(m.uniones.registradas,1);assert.equal(m.uniones.adicionales,0);assert.equal(m.materiales.filter(x=>x.tipo==='cupla').reduce((n,x)=>n+x.cantidad,0),1);for(const r of m.resultado.recorridos)assert.equal(r.aportes.filter(x=>x.tipo==='cupla').reduce((n,x)=>n+x.cantidad,0),1);
});
test('Datos de cortes incompatibles no cierran el cálculo ni se asignan al proyecto real',()=>{
 const a=ejemplo();a.run('proyectoGasActual().ensayoCortesIdealGas=datosEnsayoCortesIdealGas();proyectoGasActual().ensayoCortesIdealGas.segmentosPorTramo[tramos[0].id][0]=4.2;guardarDatos()');const m=leer(a,'resultadoPreliminarSigasGas()');assert.equal(m.completo,false);assert.match(m.bloqueos.join(),/cortes ficticios no coinciden/);assert.equal(a.run('tramos[0].metros'),7.9);assert.equal(m.uniones.base,'pendiente');assert.equal(m.uniones.adicionales,null);assert.ok(m.resultado.recorridos.every(r=>!r.equivalenteCompleto));
});
test('Cuplas registradas y empalmes calculados sin correspondencia no se suman por suposición',()=>{
 const a=ejemplo();a.run("tramos[0].detalle.accesorios.push({tipo:'cupla'});proyectoGasActual().ensayoCortesIdealGas=datosEnsayoCortesIdealGas();proyectoGasActual().ensayoCortesIdealGas.largoComercial=1;guardarDatos();calcularMaterialesManualGas()");const m=leer(a,'resultadoPreliminarSigasGas()');assert.equal(m.completo,false);assert.equal(m.uniones.registradas,1);assert.equal(m.uniones.adicionales,null);assert.match(m.bloqueos.join(),/vincular las cuplas registradas/);for(const r of m.resultado.recorridos)assert.equal(r.aportes.filter(p=>p.tipo==='cupla'&&p.tramoId===m.resultado.filas[0].id).reduce((n,p)=>n+p.cantidad,0),1);
});
test('Conexión recta explícita no consume ni agrega un codo terminal',()=>{
 const a=ejemplo();a.run("guardarDatoTerminalSigasGas('terminal-medidor','geometria','recta')");const m=leer(a,'resultadoPreliminarSigasGas()');assert.equal(m.clasificacionCodos.reduce((n,c)=>n+c.comunes,0),12);assert.equal(m.clasificacionCodos.reduce((n,c)=>n+c.terminales,0),3);assert.equal(m.cantidadesDeclaradas.codo90,15);
});
test('Margen informativo: criterio 10%, bordes, sin diámetros ni factores de seguridad',()=>{
 const a=ejemplo();for(const [q,c,esperado]of [[1,1.1,true],[1,1.100001,false],[1,1,true],[1,.9,false],[0,1,false],[NaN,1,false]]){a.ctx.q=q;a.ctx.c=c;assert.equal(!!a.run('margenInformativoSigasGas(q,c)'),esperado);}
 const antes=a.run('JSON.stringify(resultadoPreliminarSigasGas().resultado)');assert.ok(a.run('margenInformativoSigasGas(21800/9300,2.427)'));assert.equal(a.run('JSON.stringify(resultadoPreliminarSigasGas().resultado)'),antes);
});
test('Persistencia conserva roscas, vías, cortes e inventario; PDF separa fuentes y margen',()=>{
 const a=ejemplo();a.run('proyectoGasActual().ensayoCortesIdealGas=datosEnsayoCortesIdealGas();guardarDatos()');const b=app(a.saved());b.run("abrir('gas');calcularMaterialesManualGas()");assert.deepEqual(leer(a,'proyectoGasActual().calculoSigas'),leer(b,'proyectoGasActual().calculoSigas'));assert.deepEqual(leer(a,'datosEnsayoCortesIdealGas()'),leer(b,'datosEnsayoCortesIdealGas()'));assert.equal(b.run('resultadoPreliminarSigasGas().uniones.adicionales'),0);
 const html=b.run('InformeProyecto.ejercicioSigas(resultadoPreliminarSigasGas(),true)');assert.match(html,/0 registradas; 0 adicionales/);assert.match(html,/11|Comunes/);assert.match(html,/margen reducido/);assert.match(html,/10%/);assert.match(html,/Cortes por barra del ensayo/);assert.doesNotMatch(b.saved(),/escenario-uniones|terminal-preliminar/);
});
