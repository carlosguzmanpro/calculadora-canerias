const {test}=require('node:test'),assert=require('node:assert/strict');
const app=require('../diagnosticos/cargar-motor.cjs');
function ejemplo(){const a=app();a.run("abrir('gas');abrirEjemploTeesRapidasGas()");return a;}
function orientar(a){a.run("for(const [nodo,orden]of [['a','giro-directo'],['b','giro-giro']]){const e=entradaPreseleccionSigasGas(),p=e.inventario.fisicas.find(p=>p.nodo==='nombre:'+nodo);guardarOrientacionTeeVinculadaGas(contextoOrientacionTeeGas(p,e),orden)}");}
const leer=(a,s)=>JSON.parse(a.run('JSON.stringify('+s+')'));
test('PCS 9300 exclusivo del ejemplo: persiste como ensayo y no alcanza proyectos reales',()=>{
 const a=ejemplo();assert.equal(a.run('instalacionGas.perfil.poderCalorifico'),9300);assert.equal(a.run('resultadoPreliminarSigasGas().pcs.ensayo'),true);
 const b=app(a.saved());b.run("abrir('gas');calcularMaterialesManualGas()");assert.equal(b.run('resultadoPreliminarSigasGas().pcs.ensayo'),true);
 a.run("crearProyectoGas('Proyecto real SIGAS');seleccionarCatalogoSistemaGas('sigas')");assert.equal(a.run('prepararPCSEnsayoInstalacionGas()'),false);assert.equal(a.run('instalacionGas.perfil.poderCalorifico'),undefined);
});
test('Reabrir ejemplo previo habilita ensayo sin alterar vías, tramos ni conteos',()=>{
 const a=ejemplo();orientar(a);a.run('delete instalacionGas.perfil.poderCalorifico;delete instalacionGas.perfil.fuenteGas;guardarDatos()');
 const antes=a.run('JSON.stringify({tramos,c:proyectoGasActual().conteosRapidosGas,tees:proyectoGasActual().calculoSigas.tees})');
 a.run('abrirEjemploTeesRapidasGas()');assert.equal(a.run('instalacionGas.perfil.poderCalorifico'),9300);assert.equal(a.run('JSON.stringify({tramos,c:proyectoGasActual().conteosRapidosGas,tees:proyectoGasActual().calculoSigas.tees})'),antes);
});
for(const [valor,fuente]of [[9600,'Dato existente'],['9400','Fuente guardada'],[9500,''],['','Fuente sin valor'],['inválido','Fuente'],[0,'']])test('No sobrescribir PCS existente o parcial '+JSON.stringify([valor,fuente]),()=>{
 const a=ejemplo();a.ctx.valor=valor;a.ctx.fuente=fuente;a.run('instalacionGas.perfil.poderCalorifico=valor;instalacionGas.perfil.fuenteGas=fuente;guardarDatos();abrirEjemploTeesRapidasGas()');
 assert.equal(a.run('instalacionGas.perfil.poderCalorifico'),valor);assert.equal(a.run('instalacionGas.perfil.fuenteGas'),fuente);assert.equal(a.run('resultadoPreliminarSigasGas().pcs.ensayo'),false);
});
test('Sin PCS las tees esperan diámetros, no se informa falsamente catálogo inexistente',()=>{
 const a=ejemplo();orientar(a);a.run('delete instalacionGas.perfil.poderCalorifico;delete instalacionGas.perfil.fuenteGas;calcularMaterialesManualGas()');
 const filas=leer(a,'calcularPreseleccionSigasGas().filas');assert.ok(filas.every(f=>f.caudalM3h===null));
 const tees=filas.flatMap(f=>f.perdidasPendientesTramo).filter(p=>p.tipo==='tee');assert.ok(tees.length);assert.ok(tees.every(p=>/Diámetros.*pendientes/.test(p.motivo)));assert.doesNotMatch(JSON.stringify(tees),/No hay tee documentada|\/\/ mm/);
});
test('Cinco tramos: caudales, equivalencias y filas suficientes, con terminales desconocidos pendientes',()=>{
 const a=ejemplo();orientar(a);const m=leer(a,'resultadoPreliminarSigasGas()'),r=m.resultado;
 assert.deepEqual(r.filas.map(f=>f.consumoKcal),[21800,15800,6000,11000,4800]);
 assert.deepEqual(r.filas.map(f=>f.candidato.exteriorMm),[25,25,20,25,20]);
 for(const f of r.filas){assert.equal(f.caudalM3h,f.consumoKcal/9300);assert.ok(f.candidato.longitudFilaM>=f.longitudConsultaM);assert.ok(f.candidato.capacidadM3h>=f.caudalM3h);assert.equal(f.comprobadoPorTabla,false);}
 const e=leer(a,'entradaPreseleccionSigasGas()'),tablas=a.run('SIGAS_ED15_2025.tablas[3].filas');
 assert.equal(m.completo,false);assert.equal(m.bloqueos.length,4);assert.ok(m.bloqueos.every(s=>/medida de rosca/.test(s)));
 for(const ruta of r.recorridos){assert.equal(new Set(ruta.aportes.map(p=>p.piezaId)).size,ruta.aportes.length);let suma=0;for(const p of ruta.aportes){assert.ok(tablas.some(f=>f.nombreOriginal===p.nombre&&f.longitudEquivalenteM===p.equivalenteUnitarioM));assert.ok(Math.abs(p.equivalenteTotalM-p.cantidad*p.equivalenteUnitarioM)<1e-9);suma+=p.equivalenteTotalM;}assert.ok(Math.abs(suma-ruta.equivalenteConocidoM)<1e-9);assert.equal(ruta.equivalenteCompleto,false);}
 for(const p of e.inventario.fisicas.filter(p=>p.tipo==='tee')){const conf=e.config.tees[p.id];assert.equal(conf.conjunto,undefined);for(const ruta of r.recorridos.filter(r=>r.tramos.some(id=>Object.hasOwn(conf.viasPorTramo,id)))){const salida=ruta.tramos.find(id=>Object.hasOwn(conf.viasPorTramo,id)),aporte=ruta.aportes.find(a=>a.piezaId===p.id);assert.ok(aporte);assert.match(aporte.nombre,conf.viasPorTramo[salida]==='directo'?/a través/:/90º/);}}
 assert.deepEqual(m.cantidadesDeclaradas,{codo90:15,tee:2,llave:3});assert.ok(Math.abs(r.filas.reduce((n,f)=>n+f.longitudRealM,0)-20.6)<1e-9);
 assert.equal(m.propuestasAccesorios.filter(p=>p.componentes).length,2);assert.equal(m.propuestasAccesorios.filter(p=>/Llave/.test(p.material)).length,3);assert.ok(m.propuestasAccesorios.every(p=>p.confirmada===false));
 assert.doesNotMatch(a.saved(),/escenario-uniones|terminal-preliminar|normal-bujes/);
 const antes=a.saved();a.run('resultadoPreliminarSigasGas();prepararInformeActual()');assert.equal(a.saved(),antes);
 const b=app(a.saved());b.run("abrir('gas');calcularMaterialesManualGas()");assert.deepEqual(leer(b,'proyectoGasActual().calculoSigas.tees'),e.config.tees);
});
