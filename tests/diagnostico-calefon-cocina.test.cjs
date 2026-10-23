const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const {construirCaso,construirPaquete,ejecutarEscenario,ejecutarTodos}=require('../diagnosticos/ejercicio-calefon-cocina.cjs');
const cargar=require('../diagnosticos/cargar-motor.cjs');
const tabla3=require('../datos/tabla-3.js');
const todos=ejecutarTodos();
const caso=(principal='ambos-90',valvula='valvula-macho')=>todos.find(e=>e.principal===principal&&e.valvula===valvula).resultado;
const cerca=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} vs ${b}`);
test('diagnóstico: nueve escenarios explícitos nunca producen diámetros definitivos',()=>{
 assert.equal(todos.length,9);for(const e of todos){assert.equal(e.resultado.estado,'diagnostico-educativo');assert.equal(e.resultado.diametros,null);assert.equal(e.resultado.aptoInstalacion,false);assert.ok(e.resultado.convergencia);assert.ok(Object.values(e.resultado.porTramo).every(t=>t.diametroCalculado===null));}
});
test('diagnóstico: consumos individuales y total 32200 sin simultaneidad ni duplicación',()=>{
 const r=caso();assert.equal(r.porTramo['M-A'].consumoKcal,32200);assert.equal(r.porTramo['A-Calefón'].consumoKcal,21950);assert.equal(r.porTramo['A-Cocina'].consumoKcal,10250);
 for(const t of Object.values(r.porTramo))cerca(t.caudal,t.consumoKcal/9300);
});
test('diagnóstico: recorridos completos 37 y 31, semillas 52 y 46',()=>{
 const r=caso();assert.deepEqual(r.recorridos.map(r=>r.longitudReal),[37,31]);assert.deepEqual(r.recorridos.map(r=>r.longitudInicial),[52,46]);assert.equal(r.semillaAdicionalMetros,15);
});
test('diagnóstico: primera selección usa filas 55 y 46 y no diámetros de referencia como datos',()=>{
 const c=construirCaso('ambos-90');assert.ok(c.tramos.every(t=>t.diametro===null));
 const h=caso().historia[0];assert.deepEqual(h.diametros,{'M-A':'1"','A-Calefón':'1"','A-Cocina':'3/4"'});assert.equal(h.comprobaciones['M-A'].longitudFila,55);assert.equal(h.comprobaciones['A-Calefón'].longitudFila,55);assert.equal(h.comprobaciones['A-Cocina'].longitudFila,46);
});
test('diagnóstico: todos los escenarios verifican un recálculo estable, sin conservar +15',()=>{
 for(const e of todos){const r=e.resultado;assert.equal(r.historia.length,2);assert.equal(r.historia[1].iteracion,1);assert.deepEqual(r.historia[1].diametrosEvaluados,r.historia[1].diametrosSiguientes);assert.deepEqual(r.propuestas,{'M-A':'1"','A-Calefón':'1"','A-Cocina':'3/4"'});}
});
test('diagnóstico: ambos giros y macho dan 50 y 40,64 sin forzar 41',()=>{
 const r=caso();cerca(r.recorridos[0].longitudDefinitiva,50);cerca(r.recorridos[1].longitudDefinitiva,40.64);
 cerca(r.porTramo['M-A'].longitudEquivalenteAccesorios,3.75);cerca(r.porTramo['A-Calefón'].longitudEquivalenteAccesorios,9.25);cerca(r.porTramo['A-Cocina'].longitudEquivalenteAccesorios,5.89);
});
test('diagnóstico: la orientación modifica cada ruta por la vía que corresponde',()=>{
 cerca(caso('Calefón').recorridos.find(r=>r.artefacto==='Calefón').longitudDefinitiva,49);cerca(caso('Cocina').recorridos.find(r=>r.artefacto==='Cocina').longitudDefinitiva,39.88);cerca(caso().recorridos[0].longitudDefinitiva-caso('Calefón').recorridos[0].longitudDefinitiva,1);
});
test('diagnóstico: largo compartido usa la peor ruta definitiva y no suma ambas',()=>{
 for(const e of todos){const r=e.resultado;assert.equal(r.porTramo['M-A'].longitudDeCalculo,Math.max(...r.recorridos.map(r=>r.longitudDefinitiva)));assert.equal(r.porTramo['M-A'].longitudReal,19);}
});
test('diagnóstico: filas, capacidades y unidades coinciden con la Tabla 3 intacta',()=>{
 for(const e of todos)for(const [id,t]of Object.entries(e.resultado.porTramo)){
  const fila=tabla3.filas.find(f=>f.longitud>=t.longitudDeCalculo);assert.equal(t.longitudFila,fila.longitud);assert.equal(t.capacidad,fila.capacidades[tabla3.columnas.indexOf(e.resultado.propuestas[id])]/1000);assert.ok(t.capacidad>=t.caudal);
 }
 assert.equal(caso().porTramo['M-A'].capacidad,4.035);assert.equal(caso().porTramo['A-Cocina'].longitudFila,42);assert.equal(caso().porTramo['A-Cocina'].capacidad,2.155);
});
test('diagnóstico: candidatos inferiores realmente se descartan por capacidad',()=>{
 const h=caso().historia[0],p=construirPaquete('valvula-macho');
 for(const [id,c]of Object.entries(h.comprobaciones)){const elegido=h.diametros[id],j=p.candidatos.findIndex(c=>c.id===elegido);for(const menor of p.candidatos.slice(0,j))assert.ok(menor.filas.find(f=>f.longitud>=c.longitudDeCalculo).caudal<c.caudal);}
});
test('diagnóstico: inventario único contiene 17 codos, dos llaves y una tee reductora',()=>{
 const r=caso();const qty=tipo=>r.accesorios.filter(a=>a.tipo===tipo).reduce((n,a)=>n+a.cantidad,0);assert.equal(qty('codo90'),17);assert.equal(qty('llave'),2);assert.equal(qty('tee-reductora'),1);assert.equal(qty('reduccion'),0);assert.equal(qty('cupla'),0);assert.match(r.cuplas,/PENDIENTES/);
});
test('diagnóstico: tee de entrada por ramal da dos giros y conserva tres medidas sin duplicar pieza',()=>{
 const r=caso(),t=r.accesorios.find(a=>a.tipo==='tee-reductora');assert.equal(t.configuracion,'entrada-por-ramal');assert.deepEqual(t.medidas,['1"','1"','3/4"']);cerca(t.equivalentesPorTramo['A-Calefón'],1.5);cerca(t.equivalentesPorTramo['A-Cocina'],1.14);
});
test('diagnóstico: factores de válvula cambian longitudes, no se adivina tipo de llave',()=>{
 cerca(caso('ambos-90','valvula-esclusa').recorridos[0].longitudDefinitiva,47.675);cerca(caso('ambos-90','valvula-globo').recorridos[0].longitudDefinitiva,55.825);assert.throws(()=>construirPaquete('llave-generica'),/Identificar/);assert.throws(()=>construirCaso('desconocido'),/explícitamente/);
});
test('diagnóstico: paquete no atribuye verificación, edición ni interiores reales inexistentes',()=>{
 const p=construirPaquete('valvula-macho');assert.equal(p.verificado,false);assert.equal(p.edicion,null);assert.equal(p.tabla3.verificada,false);assert.equal(p.tabla18.aplicabilidadAceroRoscadoEpoxi,false);assert.equal(p.redondeoSuperiorVerificado,false);assert.ok(p.candidatos.every(c=>c.esDiametroTabuladoNoInteriorReal));
});
test('diagnóstico: sin modoPrueba el mismo caso y paquete quedan bloqueados',()=>{
 const r=ejecutarEscenario({principal:'ambos-90',valvula:'valvula-macho',modoPrueba:false}).resultado;assert.equal(r.estado,'bloqueado');assert.equal(r.diametros,null);assert.equal(r.propuestas,undefined);
});
test('diagnóstico: no se fabrican posiciones ni cuplas y no se permite ocultar su pendiente',()=>{
 const c=construirCaso('ambos-90');assert.ok(c.tramos.every(t=>!t.detalle&&t.detalleDiagnostico.accesorios.every(a=>!('metrosAntes'in a))));
 const app=cargar();app.ctx.c=c;app.ctx.p=construirPaquete('valvula-macho');app.run("p.politicaCuplas='incluir'");const r=app.run('motorClaseAceroGas(c.tramos,c.artefactos,{perfil:{...PERFIL_CLASE_ACERO},nodos:c.nodos},p,{modoPrueba:true})');assert.equal(r.estado,'bloqueado');
});
test('diagnóstico: cantidad inválida o vía contradictoria bloquean en lugar de dar resultado parcial',()=>{
 for(const cambio of ["c.tramos[0].detalleDiagnostico.accesorios[0].cantidad=-1","c.tramos[0].detalleDiagnostico.accesorios[0]=null","c.tramos[1].red.via='principal'"]){const app=cargar();app.ctx.c=construirCaso('ambos-90');app.ctx.p=construirPaquete('valvula-macho');app.run(cambio);assert.equal(app.run('motorClaseAceroGas(c.tramos,c.artefactos,{perfil:{...PERFIL_CLASE_ACERO},nodos:c.nodos},p,{modoPrueba:true}).estado'),'bloqueado');}
});
test('diagnóstico: ejecución no modifica tablas, catálogo ni dispara servicios externos',()=>{
 const rutas=['datos/tabla-3.js','datos/tabla-18.js'];const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');const antes=rutas.map(hash);ejecutarTodos();assert.deepEqual(rutas.map(hash),antes);
 const exportado=JSON.parse(fs.readFileSync('diagnosticos/resultado-calefon-cocina.json','utf8'));assert.deepEqual(exportado.escenarios,todos);assert.equal(exportado.habilitacionDefinitiva,false);assert.match(fs.readFileSync('DIAGNOSTICO-CALEFON-COCINA.html','utf8'),/NO DIÁMETROS DEFINITIVOS/);
 const app=cargar();app.ctx.fetch=()=>assert.fail('No se debe llamar a APIs');app.run("abrir('gas');guardarDatos()");const guardado=app.saved();app.ctx.c=construirCaso('ambos-90');app.ctx.p=construirPaquete('valvula-macho');app.run('motorClaseAceroGas(c.tramos,c.artefactos,{perfil:{...PERFIL_CLASE_ACERO},nodos:c.nodos},p,{modoPrueba:true})');assert.equal(app.saved(),guardado);assert.equal(app.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
});
