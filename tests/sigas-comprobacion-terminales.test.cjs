const {test}=require('node:test'),assert=require('node:assert/strict'),app=require('../diagnosticos/cargar-motor.cjs');
function ejemplo(){const a=app();a.run("abrir('gas');abrirEjemploTeesRapidasGas();for(const [nodo,orden]of [['a','giro-directo'],['b','giro-giro']]){const e=entradaPreseleccionSigasGas(),p=e.inventario.fisicas.find(p=>p.nodo==='nombre:'+nodo);guardarOrientacionTeeVinculadaGas(contextoOrientacionTeeGas(p,e),orden)}");return a;}
const leer=(a,s)=>JSON.parse(a.run('JSON.stringify('+s+')'));
function roscas(a){a.run("for(const [n,r]of [['medidor','3/4'],['Cocina','1/2'],['Termotanque','1/2'],['Calefactor','1/2']])guardarDatoTerminalSigasGas('terminal-'+n,'rosca',r)");}
test('Con roscas declaradas para ensayo: escenario estable, capacidades y equivalencias trazables',()=>{
 const a=ejemplo(),antes=a.run('JSON.stringify({tramos,artefactos,conteos:proyectoGasActual().conteosRapidosGas,tees:proyectoGasActual().calculoSigas.tees})');roscas(a);
 const m=leer(a,'resultadoPreliminarSigasGas()');assert.equal(m.completo,true);assert.deepEqual(m.resultado.filas.map(f=>f.candidato.exteriorMm),[25,25,20,25,20]);
 assert.deepEqual(m.resultado.filas.map(f=>Number(f.longitudConsultaM.toFixed(3))),[23.925,23.925,21.377,22.749,23.925]);
 for(const f of m.resultado.filas){assert.equal(f.caudalM3h,f.consumoKcal/9300);assert.ok(f.candidato.capacidadM3h>=f.caudalM3h);assert.ok(f.candidato.longitudFilaM>=f.longitudConsultaM);assert.equal(m.comprobacionRealPorTramo[f.id],null);}
 for(const r of m.resultado.recorridos){assert.equal(new Set(r.aportes.map(p=>p.piezaId)).size,r.aportes.length);assert.ok(Math.abs(r.aportes.reduce((n,p)=>n+p.equivalenteTotalM,0)-r.equivalenteConocidoM)<1e-9);assert.equal(r.perdidasPendientes.length,0);}
 assert.deepEqual(m.cantidadesDeclaradas,{codo90:15,tee:2,llave:3});assert.ok(m.selecciones.every(s=>s.confirmada===false));assert.doesNotMatch(a.saved(),/terminal-preliminar|escenario-uniones/);
 assert.equal(a.run('JSON.stringify({tramos,artefactos,conteos:proyectoGasActual().conteosRapidosGas,tees:proyectoGasActual().calculoSigas.tees})'),antes);
 const html=a.run('InformeProyecto.ejercicioSigas(resultadoPreliminarSigasGas())');assert.match(html,/Preliminar · capacidad cubierta para el escenario propuesto/);assert.doesNotMatch(html,/Diámetro calculado y comprobado por tabla SIGAS/);
});
test('Una rosca ausente sigue pendiente; cambiar medida recalcula sin cambiar fusión ni cantidades',()=>{
 const a=ejemplo();roscas(a);a.run("guardarDatoTerminalSigasGas('terminal-Cocina','rosca','')");assert.equal(a.run('resultadoPreliminarSigasGas().completo'),false);assert.match(a.run('resultadoPreliminarSigasGas().bloqueos.join()'),/Cocina.*medida de rosca/);
 a.run("guardarDatoTerminalSigasGas('terminal-Cocina','rosca','1/2')");const antes=a.run('resultadoPreliminarSigasGas().resultado.recorridos.find(r=>r.artefacto===\"Cocina\").longitudConsultaM');
 a.run("guardarDatoTerminalSigasGas('terminal-Cocina','rosca','3/4')");assert.notEqual(a.run('resultadoPreliminarSigasGas().resultado.recorridos.find(r=>r.artefacto===\"Cocina\").longitudConsultaM'),antes);assert.equal(a.run('tramos[3].diametro'),null);assert.deepEqual(leer(a,'resultadoPreliminarSigasGas().cantidadesDeclaradas'),{codo90:15,tee:2,llave:3});
});
test('Productos reales declarados e inventario completo habilitan comprobación tabular sin presiones',()=>{
 const a=ejemplo();roscas(a);a.run("for(const n of ['medidor','Cocina','Termotanque','Calefactor']){guardarDatoTerminalSigasGas('terminal-'+n,'geometria','codo90');guardarDatoTerminalSigasGas('terminal-'+n,'variante','estandar')};for(const t of tramos){proyectoGasActual().conteosRapidosGas[t.id].reduccion=0;proyectoGasActual().conteosRapidosGas[t.id].cupla=0};for(const p of registroAccesoriosSigasGas().piezas.filter(p=>p.tipo==='llave')){const op=opcionesVariantesSigasGas(p.id)[0];if(op)confirmarVarianteSigasGas(p.id,op.fila.id)};for(let i=0;i<3;i++)for(const p of entradaPreseleccionSigasGas().inventario.fisicas.filter(p=>p.tipo==='tee')){const op=propuestasConjuntoTeeGas(p.id).find(o=>o.id==='normal-bujes');if(op)confirmarConjuntoTeeGas(p.id,op.id)};const e=entradaPreseleccionSigasGas();proyectoGasActual().calculoSigas.revisionInventario={firma:e.config.firmaInventarioActual,fuente:'Inventario sintético explícito para regresión de software; no instalación real'};guardarDatos();calcularMaterialesManualGas()");
 const r=leer(a,'calcularPreseleccionSigasGas()');assert.ok(r.filas.every(f=>f.comprobadoPorTabla));assert.equal(a.run('registroAccesoriosSigasGas().verificacion.suministro.estado'),'pendiente');assert.equal(r.definitivo,false);
 const b=app(a.saved());b.run("abrir('gas');calcularMaterialesManualGas()");assert.ok(b.run('calcularPreseleccionSigasGas().filas.every(f=>f.comprobadoPorTabla)'));
});
test('Diámetros cambiados actualizan agrupación de cortes sin perder separaciones guardadas',()=>{
 const a=ejemplo();a.run('proyectoGasActual().ensayoCortesIdealGas=datosEnsayoCortesIdealGas();guardarDatos()');const datos=a.run('JSON.stringify(datosEnsayoCortesIdealGas())');roscas(a);
 assert.equal(a.run('JSON.stringify(datosEnsayoCortesIdealGas())'),datos);assert.equal(a.run('calcularEnsayoCortesIdealGas().instalacion.tiras'),6);
 const m=leer(a,'resultadoPreliminarSigasGas()');m.resultado.filas[3].candidato.exteriorMm=32;a.ctx.modeloAlterado=m;
 assert.ok(leer(a,'calcularEnsayoCortesIdealGas(datosEnsayoCortesIdealGas(),modeloAlterado).instalacion.compra').some(g=>g.diametro==='32 mm'&&g.metros===2.15));assert.equal(a.run('JSON.stringify(datosEnsayoCortesIdealGas())'),datos);
});
