const {test}=require('node:test'),assert=require('node:assert/strict'),app=require('../diagnosticos/cargar-motor.cjs');
function ejemplo(){const a=app();a.run("abrir('gas');abrirEjemploTeesRapidasGas();for(const [n,o]of [['a','giro-directo'],['b','giro-giro']]){const e=entradaPreseleccionSigasGas(),p=e.inventario.fisicas.find(p=>p.nodo==='nombre:'+n);guardarOrientacionTeeVinculadaGas(contextoOrientacionTeeGas(p,e),o)};for(const [n,r]of [['medidor','3/4'],['Cocina','1/2'],['Termotanque','1/2'],['Calefactor','1/2']])guardarDatoTerminalSigasGas('terminal-'+n,'rosca',r)");return a;}
const leer=(a,s)=>JSON.parse(a.run('JSON.stringify('+s+')'));
test('Lista: acumulados y candidatos se presentan sin escribirlos en campos manuales',()=>{
 const a=ejemplo(),antes=a.run('JSON.stringify({tramos,artefactos,instalacionGas,c:proyectoGasActual().conteosRapidosGas,config:proyectoGasActual().calculoSigas})');
 const estados=leer(a,'tramos.map(t=>estadoVisibleTramoGas(t,redFisicaManualGas(),resultadoPreliminarSigasGas()))');assert.match(estados[0].consumo,/Sin artefacto propio.*21.800/);assert.match(estados[1].consumo,/Sin artefacto propio.*15.800/);assert.match(estados[2].consumo,/Consumo propio: 6.000.*acumulado: 6.000/);assert.match(estados[0].diametro,/25 mm.*preliminar SIGAS/);
 a.run('renderTramos()');assert.equal(a.run('JSON.stringify({tramos,artefactos,instalacionGas,c:proyectoGasActual().conteosRapidosGas,config:proyectoGasActual().calculoSigas})'),antes);assert.equal(a.run('tramos[0].consumo'),null);assert.equal(a.run('tramos[0].diametro'),null);
});
test('Pendiente, cero y diámetro manual siguen siendo estados diferentes',()=>{
 const a=ejemplo();a.run("tramos[2].consumo=0;tramos[2].diametro='3/4';");const v=leer(a,'estadoVisibleTramoGas(tramos[2],null,null)');assert.match(v.consumo,/propio: 0 kcal\/h.*acumulado: pendiente/);assert.match(v.diametro,/manual: 3\/4.*sin validación/);
 a.run('tramos[2].consumo=null;tramos[2].diametro=null');const p=leer(a,'estadoVisibleTramoGas(tramos[2],null,null)');assert.match(p.consumo,/artefacto pendiente/);assert.match(p.diametro,/por calcular/);
});
test('Cambio de sistema conserva datos, vías y cortes; SIGAS queda inactivo en otras marcas',()=>{
 const a=ejemplo();a.run("proyectoGasActual().ensayoCortesIdealGas=datosEnsayoCortesIdealGas();proyectoGasActual().foto='data:image/png;base64,FOTO';guardarDatos()");
 const estado="JSON.stringify({tramos,artefactos,c:proyectoGasActual().conteosRapidosGas,config:proyectoGasActual().calculoSigas,cortes:proyectoGasActual().ensayoCortesIdealGas,foto:proyectoGasActual().foto,borradorCroquis})",antes=a.run(estado);
 for(const sistema of ['fusiogas','acero-epoxi-roscado-gn']){a.ctx.sistema=sistema;a.run('seleccionarCatalogoSistemaGas(sistema)');assert.equal(a.run(estado),antes);assert.equal(a.run('entradaPreseleccionSigasGas()'),null);assert.equal(a.run('resultadoPreliminarSigasGas()'),null);assert.equal(a.run('tramos.some(t=>t.diametro!==null)'),false);}
 a.run("seleccionarCatalogoSistemaGas('sigas');calcularMaterialesManualGas({desplazar:true})");assert.equal(a.run(estado),antes);assert.deepEqual(leer(a,'resultadoPreliminarSigasGas().resultado.filas.map(f=>f.candidato.exteriorMm)'),[25,25,20,25,20]);assert.equal(a.run('resultadoPreliminarSigasGas().compra.canos.reduce((n,g)=>n+g.tiras,0)'),6);
 const b=app(a.saved());b.run("abrir('gas')");assert.equal(b.run(estado),antes);
});
test('Renderizar lista y resumen no modifica resultado, memoria ni PDF',()=>{
 const a=ejemplo(),r=a.run('JSON.stringify(resultadoPreliminarSigasGas())');a.run('prepararInformeActual()');const pdf=a.elements.get('informeImpresion').innerHTML,guardado=a.saved();a.run('renderTramos();renderResumenPrincipalGas();prepararInformeActual()');assert.equal(a.run('JSON.stringify(resultadoPreliminarSigasGas())'),r);assert.equal(a.elements.get('informeImpresion').innerHTML,pdf);assert.equal(a.saved(),guardado);
});
