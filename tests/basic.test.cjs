const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
// DOM mínimo: estas pruebas ejercitan el estado y los cálculos reales del script.
// La maquetación, cámara e impresión visual requieren la prueba de navegador.
function app(saved=null,{blocked=false,quota=Infinity,tablasLegadas=false,tablasFotoBase=false}={}){
 const elements=new Map();const store=new Map(saved?[['canerias-proyectos-v1',saved]]:[]);
 function element(){return {value:'',textContent:'',checked:false,style:{},children:[],className:'',classList:{hidden:false,add(c){if(c==='oculto')this.hidden=true;},remove(c){if(c==='oculto')this.hidden=false;},toggle(c,b){if(c==='oculto')this.hidden=b;}},append(...x){this.children.push(...x)},replaceChildren(){this.children=[];this.textContent=''},removeAttribute(k){delete this[k]},addEventListener(k,fn){this[k]=fn}};}
 for(const m of html.matchAll(/id="([^"]+)"/g))elements.set(m[1],element());
 elements.get('gt').value='9300';elements.get('ga').value='Cocina';
 const ctx=vm.createContext({document:{getElementById:id=>elements.get(id),createElement:element,createTextNode:text=>({textContent:text})},window:{scrollTo(){},addEventListener(k,fn){this[k]=fn}},localStorage:{getItem:k=>{if(blocked)throw Error('blocked');return store.get(k)||null},setItem(k,v){if(blocked||v.length>quota)throw Error('quota');store.set(k,v)}},URL:{revokeObjectURL(){}},alert(){}});
 for(const m of html.matchAll(/<script src="([^"]+)"><\/script>/g)){const ruta=tablasFotoBase&&/^datos\/tabla-(3|18)\.js$/.test(m[1])?m[1].replace('datos/tabla-','tests/fixtures/tabla-').replace('.js','-1e99313.cjs'):tablasLegadas&&/^datos\/tabla-(3|18)\.js$/.test(m[1])?m[1].replace('datos/tabla-','tests/fixtures/tabla-').replace('.js','-22028c8.cjs'):m[1];vm.runInContext(fs.readFileSync(ruta,'utf8'),ctx);}
 vm.runInContext(script,ctx);
 return {ctx,elements,run:code=>vm.runInContext(code,ctx),saved:()=>store.get('canerias-proyectos-v1'),text:id=>elements.get(id).textContent};
}
test('tramos, artefactos y aclaraciones sobreviven a una recarga',()=>{
 const a=app();a.run("abrir('gas')");
 for(const [id,v] of Object.entries({desde:'M',hasta:'A',metros:'15',consumoTramo:'9300',diametro:'1/2"',gp:'9300',duda:'Revisar A'}))a.elements.get(id).value=v;
 a.run('agregarTramo();agregarArtefacto();guardarRevision()');
 const b=app(a.saved());b.run("abrir('gas')");assert.equal(b.run('tramos.length'),1);assert.equal(b.run('artefactos.length'),1);assert.equal(b.elements.get('duda').value,'Revisar A');assert.match(b.text('revision'),/Revisar A/);
 b.run('calcularMateriales()');assert.match(b.elements.get('resultadoMateriales').children[1].textContent,/3 tiras.*18 m a comprar.*2 cuplas/);
});
test('cambios y eliminación invalidan el resultado de consumo',()=>{
 const a=app();a.run("abrir('gas')");a.elements.get('gp').value='9300';a.run('agregarArtefacto();calcularConsumos()');assert.match(a.text('resultadoGas'),/1 m³\/h/);
 a.elements.get('gp').value='1000';a.run('agregarArtefacto()');assert.match(a.text('resultadoGas'),/Datos actualizados/);
 a.run('calcularConsumos()');a.elements.get('listaGas').children[0].children[1].onclick();assert.match(a.text('resultadoGas'),/Datos actualizados/);
 a.elements.get('gt').change();assert.match(a.text('resultadoGas'),/Datos actualizados/);
});
test('agua y cloacas no muestran GAS y conservan aclaraciones separadas',()=>{
 const a=app();for(const m of ['gas','agua','cloacas']){a.run(`abrir('${m}')`);a.elements.get('duda').value=m;a.run('guardarRevision()');a.run("mostrarVista('croquis')");assert.equal(a.elements.get('formularioGas').classList.hidden,m!=='gas');}
 for(const m of ['gas','agua','cloacas']){a.run(`abrir('${m}')`);assert.equal(a.elements.get('duda').value,m);}
});
test('datos dañados y almacenamiento bloqueado no impiden trabajar',()=>{
 const a=app('{invalid');assert.match(a.text('estadoGuardado'),/No se pudieron recuperar/);
 const b=app(null,{blocked:true});b.run("abrir('gas');guardarDatos()");assert.match(b.text('estadoGuardado'),/No se pudo guardar/);
});
test('una foto que supera la cuota no bloquea guardar la aclaración',()=>{
 const a=app(null,{quota:600});a.run("abrir('gas');proyectos.gas.foto='data:image/png;base64,'+'x'.repeat(1000)");a.elements.get('duda').value='Guardar sin foto';a.run('guardarDatos()');assert.equal(JSON.parse(a.saved()).gas.aclaracion,'Guardar sin foto');assert.equal(JSON.parse(a.saved()).gas.foto,undefined);
});
test('impresión copia la aclaración actual y mantiene advertencias visibles',()=>{
 const a=app();a.run("abrir('gas')");a.elements.get('duda').value='Última aclaración';a.ctx.window.beforeprint();assert.match(a.text('aclaracionImpresion'),/Última aclaración/);assert.match(html,/\.aviso\{display:block;break-inside:avoid\}/);
});

test('límites comerciales: debajo, exactamente y encima de 6, 12 y 18 m',()=>{
 const a=app();
 for(const limite of [6,12,18])for(const delta of [-0.001,0,0.001]){
  const m=limite+delta;
  a.ctx.tramo={metros:m,diametro:'3/4"',detalle:{estado:'ninguno'}};
  const r=a.run('evaluarTramo(tramo)');
  const n=limite/6+(delta>0?1:0);
  assert.equal(r.tiras,n,`${m} m`);assert.equal(r.cuplas,n-1,`${m} m`);assert.equal(r.pendiente,false);
 }
 // No ocultar un exceso real con una tolerancia aplicada a ceil.
 assert.equal(a.run('tirasPara(6.0000000001)'),2);
});
function evaluar(a,metros,accesorios,metrosFinal,diametro='3/4"'){
 a.ctx.tramo={desde:'M',hasta:'A',metros,diametro,consumo:9300,
  detalle:{estado:'completo',accesorios,metrosFinal}};
 return a.run('evaluarTramo(tramo)');
}
test('codo a los 6 m de un tramo de 12 m: dos tiras y cero cuplas',()=>{
 const a=app();const r=evaluar(a,12,[{tipo:'codo90',metrosAntes:6,salida:'3/4"'}],6);
 assert.equal(r.pendiente,false);assert.equal(r.tiras,2);assert.equal(r.cuplas,0);assert.equal(r.accesorios.length,1);
});
test('cuplas solo dentro de segmentos: 12 m + codo 45° + 6 m',()=>{
 const a=app();const r=evaluar(a,18,[{tipo:'codo45',metrosAntes:12,salida:'3/4"'}],6);
 assert.equal(r.tiras,3);assert.equal(r.cuplas,1);assert.match(a.run('nombreAccesorio(evaluarTramo(tramo).accesorios[0])'),/45°/);
});
test('tee conserva los tres diámetros y no agrega una reducción independiente',()=>{
 const a=app();const r=evaluar(a,12,[{tipo:'tee',metrosAntes:6,salida:'3/4"',ramal:'1/2"',nodo:'T1'}],6);
 assert.equal(r.pendiente,false);assert.equal(r.accesorios.length,1);assert.equal(r.accesorios[0].entrada,'3/4"');assert.equal(r.accesorios[0].ramal,'1/2"');
 assert.match(a.run('nombreAccesorio(evaluarTramo(tramo).accesorios[0])'),/Tee reductora/);
});
test('codo reductor y reducción independiente se cuentan como piezas diferentes',()=>{
 const a=app();const r=evaluar(a,18,[{tipo:'codo90',metrosAntes:6,salida:'1/2"'},
  {tipo:'reduccion',metrosAntes:6,salida:'3/8"'}],6);
 assert.equal(r.pendiente,false);assert.equal(r.tiras,3);assert.equal(r.cuplas,0);
 assert.equal(r.accesorios.length,2);assert.deepEqual(Array.from(r.segmentos,s=>s.diametro),['3/4"','1/2"','3/8"']);
 assert.match(a.run('nombreAccesorio(evaluarTramo(tramo).accesorios[0])'),/Codo 90° reductor/);
 assert.match(a.run('nombreAccesorio(evaluarTramo(tramo).accesorios[1])'),/Reducción independiente/);
});
test('no inventa accesorios si faltan longitudes, ramal o nombre de tee',()=>{
 const a=app();
 for(const acc of [
  {tipo:'tee',metrosAntes:6,salida:'3/4"',ramal:'',nodo:'T1'},
  {tipo:'tee',metrosAntes:6,salida:'3/4"',ramal:'1/2"',nodo:''},
  {tipo:'codo90',metrosAntes:'',salida:'3/4"'},
  {tipo:'codo90',metrosAntes:-1,salida:'3/4"'},
  {tipo:'reduccion',metrosAntes:6,salida:'3/4"'}]){
  const r=evaluar(a,12,[acc],6);assert.equal(r.pendiente,true);assert.equal(r.accesorios.length,0);assert.ok(r.motivo);
 }
 assert.equal(evaluar(a,12,[{tipo:'codo90',metrosAntes:4,salida:'3/4"'}],4).pendiente,true);
});
test('pendiente, cero confirmado y tramo antiguo son estados distintos',()=>{
 const a=app();a.ctx.tramo={metros:12,diametro:'3/4"'};
 assert.equal(a.run('evaluarTramo(tramo).pendiente'),true);
 a.run("tramo.detalle={estado:'pendiente',accesorios:[]}");assert.equal(a.run('evaluarTramo(tramo).pendiente'),true);
 a.run("tramo.detalle={estado:'ninguno',accesorios:[]}");assert.equal(a.run('evaluarTramo(tramo).pendiente'),false);
 a.run("tramo.detalle={estado:'completo',accesorios:[]}");assert.equal(a.run('evaluarTramo(tramo).pendiente'),true);
});
test('dos accesorios contiguos y accesorios de extremo no inventan cuplas',()=>{
 const a=app();const r=evaluar(a,6,[{tipo:'codo90',metrosAntes:0,salida:'3/4"'},
  {tipo:'reduccion',metrosAntes:0,salida:'1/2"'}],6);
 assert.equal(r.pendiente,false);assert.equal(r.tiras,1);assert.equal(r.cuplas,0);
});
test('tee compartida no se cuenta dos veces con el mismo nombre',()=>{
 const a=app();evaluar(a,12,[{tipo:'tee',metrosAntes:6,salida:'3/4"',ramal:'1/2"',nodo:'T1'}],6);
 a.run('tramos=[tramo]');
 const r=evaluar(a,12,[{tipo:'tee',metrosAntes:6,salida:'3/4"',ramal:'1/2"',nodo:' t1 '}],6);
 assert.equal(r.pendiente,true);assert.match(r.motivo,/repetida/);
 assert.equal(a.run('evaluarTramo(tramos[0]).pendiente'),false);
 // Si se importan duplicados ya guardados, ambos quedan pendientes.
 a.run('tramos.push(tramo)');assert.equal(a.run('evaluarTramo(tramos[0]).pendiente'),true);
});
test('accesorios sobreviven a recarga y materiales se agrupan por diámetro de segmento',()=>{
 const a=app();a.run("abrir('gas')");evaluar(a,18,[{tipo:'reduccion',metrosAntes:12,salida:'1/2"'}],6);
 a.run('tramos=[tramo];guardarDatos()');const b=app(a.saved());b.run("abrir('gas')");
 assert.equal(b.run('evaluarTramo(tramos[0]).cuplas'),1);b.run('calcularMateriales()');
 const textos=b.elements.get('resultadoMateriales').children.map(x=>x.textContent).join(' ');
 assert.match(textos,/Reducción independiente/);assert.match(textos,/3\/4".*12 m de recorrido, 2 tiras/);assert.match(textos,/1\/2".*6 m de recorrido, 1 tiras/);
});
test('editar longitud o diámetro requiere volver a revisar accesorios',()=>{
 const a=app();a.run("abrir('gas')");evaluar(a,12,[{tipo:'codo90',metrosAntes:6,salida:'3/4"'}],6);
 a.run('tramos=[tramo];editandoTramo=0');
 for(const [id,v] of Object.entries({desde:'M',hasta:'A',metros:'18',consumoTramo:'9300',diametro:'3/4"'}))a.elements.get(id).value=v;
 a.run('agregarTramo()');assert.equal(a.run('tramos.length'),1);assert.equal(a.run('tramos[0].detalle.estado'),'pendiente');assert.equal(a.run('tramos[0].detalle.accesorios.length'),1);
});
test('editor permite corregir un detalle incompleto sin perder el tramo original',()=>{
 const a=app();a.run("abrir('gas')");evaluar(a,12,[{tipo:'codo90',metrosAntes:6,salida:'3/4"'}],6);a.run('tramos=[tramo];abrirAccesorios(0)');
 a.elements.get('estadoAccesorios').value='completo';a.elements.get('metrosFinal').value='3';a.run('guardarAccesorios()');assert.equal(a.run('editandoAccesorios'),0);assert.match(a.text('errorAccesorios'),/deben sumar/);
 a.elements.get('metrosFinal').value='6';a.run('guardarAccesorios()');assert.equal(a.run('editandoAccesorios'),-1);assert.equal(a.run('evaluarTramo(tramos[0]).pendiente'),false);
});

function ejemploRevisado(a){
 a.run("abrir('gas');cargarEjemploCroquis();borradorCroquis.tramos[0].campos.metrosFinal.valor=6");
 a.run('borradorCroquis.tramos.forEach(t=>{Object.values(t.campos).forEach(d=>d.confirmado=true);t.accesorios.forEach(a=>Object.values(a).forEach(d=>{if(d && typeof d===\'object\')d.confirmado=true;}));})');
}
test('ejemplo simulado no analiza fotos ni incorpora datos sin confirmación',()=>{
 const a=app();a.run("abrir('gas');fotoURL='blob:foto-personal';cargarEjemploCroquis()");
 assert.equal(a.run('borradorCroquis.origen'),'simulado');assert.equal(a.run('fotoURL'),'blob:foto-personal');
 assert.equal(a.run('tramos.length'),0);a.run('incorporarCroquis()');assert.equal(a.run('tramos.length'),0);assert.match(a.text('mensajeCroquis'),/Falta confirmar/);
 assert.equal(a.run('borradorCroquis.tramos[0].campos.metrosFinal.valor'),null);
});
test('incorporación confirmada conserva datos previos, calcula materiales y marca simulación',()=>{
 const a=app();ejemploRevisado(a);
 a.run("tramos.push({desde:'Real-M',hasta:'Real-A',metros:6,diametro:'1/2\"',consumo:1,detalle:{estado:'ninguno'}});artefactos.push({nombre:'Real',consumo:1000});incorporarCroquis()");
 assert.equal(a.run('tramos.length'),2);assert.equal(a.run('artefactos.length'),2);assert.equal(a.run('tramos[0].desde'),'Real-M');
 assert.equal(a.run('evaluarTramo(tramos[1]).pendiente'),false);assert.equal(a.run('evaluarTramo(tramos[1]).tiras'),3);assert.equal(a.run('evaluarTramo(tramos[1]).cuplas'),0);
 a.run('calcularMateriales();calcularConsumos()');assert.match(a.elements.get('resultadoMateriales').children[0].textContent,/SIMULADOS/);assert.match(a.text('resultadoGas'),/SIMULADOS/);
 assert.equal(a.run('borradorCroquis.aplicado'),true);a.run('incorporarCroquis()');assert.equal(a.run('tramos.length'),2);
});
test('modificar un dato elimina su confirmación y evita la incorporación',()=>{
 const a=app();ejemploRevisado(a);a.run('cambiarDatoCroquis(borradorCroquis.tramos[0].campos.metros,20);incorporarCroquis()');
 assert.equal(a.run('tramos.length'),0);assert.equal(a.run('borradorCroquis.tramos[0].campos.metros.confirmado'),false);assert.match(a.text('mensajeCroquis'),/Falta confirmar/);
});
test('no acepta campos vacíos, longitudes incompatibles ni entrada de accesorio incorrecta',()=>{
 for(const cambio of [
  'borradorCroquis.tramos[0].campos.metrosFinal.valor=null',
  'borradorCroquis.tramos[0].campos.metrosFinal.valor=2',
  "borradorCroquis.tramos[0].accesorios[0].entrada.valor='2\"'",
  "borradorCroquis.tramos[0].accesorios[0].ramal.valor=''",
  "borradorCroquis.tramos[0].campos.artefacto.valor='Ninguno'"
 ]){
  const a=app();ejemploRevisado(a);a.run(cambio+';incorporarCroquis()');assert.equal(a.run('tramos.length'),0);assert.equal(a.run('artefactos.length'),0);assert.equal(a.run('borradorCroquis.aplicado'),false);
 }
});
test('confirmaciones y correcciones sobreviven a recarga sin incorporar automáticamente',()=>{
 const a=app();ejemploRevisado(a);a.run('guardarDatos()');const b=app(a.saved());
 assert.equal(b.run('borradorCroquis.tramos[0].campos.metrosFinal.valor'),6);assert.equal(b.run('borradorCroquis.tramos[0].campos.metros.confirmado'),true);assert.equal(b.run('tramos.length'),0);
 b.run("abrir('gas');incorporarCroquis()");const c=app(b.saved());c.run("abrir('gas');incorporarCroquis()");assert.equal(c.run('tramos.length'),1);
});
test('puede descartar un tramo o accesorio y corregir el resto antes de incorporar',()=>{
 const a=app();ejemploRevisado(a);a.run('borradorCroquis.tramos[0].incluir=false;incorporarCroquis()');assert.equal(a.run('tramos.length'),0);assert.match(a.text('mensajeCroquis'),/Seleccioná/);
 a.run("borradorCroquis.tramos[0].incluir=true;borradorCroquis.tramos[0].accesorios[0].incluir=false;borradorCroquis.tramos[0].campos.metrosFinal.valor=12;incorporarCroquis()");
 assert.equal(a.run('tramos.length'),1);assert.equal(a.run('tramos[0].detalle.accesorios.length'),3);
});
test('rechaza tees duplicadas sin modificar datos reales ni importar parcialmente',()=>{
 const a=app();ejemploRevisado(a);
 a.run("tramos.push({desde:'X',hasta:'Y',metros:6,diametro:'3/4\"',consumo:1,detalle:{estado:'completo',metrosFinal:0,accesorios:[{tipo:'tee',metrosAntes:6,salida:'3/4\"',ramal:'1/2\"',nodo:'DEMO-T1'}]}});incorporarCroquis()");
 assert.equal(a.run('tramos.length'),1);assert.equal(a.run('artefactos.length'),0);assert.match(a.text('mensajeCroquis'),/repetida/);
});
test('rechaza orígenes desconocidos y no expone la revisión en agua o cloacas',()=>{
 const a=app();ejemploRevisado(a);a.run("borradorCroquis.origen='origen-desconocido';incorporarCroquis()");assert.equal(a.run('tramos.length'),0);assert.match(a.text('mensajeCroquis'),/formato/);
 for(const m of ['agua','cloacas']){a.run(`abrir('${m}');mostrarVista('revisionCroquis')`);assert.equal(a.elements.get('revisionCroquis').classList.hidden,true);}
});
test('descartar un borrador no elimina datos incorporados y permite cargar otro',()=>{
 const a=app();ejemploRevisado(a);a.run('incorporarCroquis();descartarBorradorCroquis()');assert.equal(a.run('tramos.length'),1);assert.equal(a.run('borradorCroquis'),null);
 a.run('cargarEjemploCroquis()');assert.equal(a.run('borradorCroquis.aplicado'),false);
});
test('sin accesorios exige revisar la longitud continua completa',()=>{
 const a=app();ejemploRevisado(a);a.run('borradorCroquis.tramos[0].accesorios.forEach(a=>a.incluir=false);incorporarCroquis()');assert.equal(a.run('tramos.length'),0);
 a.run('borradorCroquis.tramos[0].campos.metrosFinal.valor=18;incorporarCroquis()');assert.equal(a.run('tramos.length'),1);assert.equal(a.run('evaluarTramo(tramos[0]).cuplas'),2);
});
test('un formato guardado corrupto no rompe los proyectos manuales',()=>{
 const a=app();a.run("abrir('gas');proyectos.gas.borradorCroquis={version:1,origen:'simulado',id:'x',aplicado:false,tramos:[{}]}");
 // Escribir la corrupción directamente: guardarDatos sustituye este campo por el borrador validado.
 const datos=JSON.parse(a.saved()||'{"gas":{},"agua":{},"cloacas":{}}');datos.gas.borradorCroquis={version:1,origen:'simulado',id:'x',aplicado:false,tramos:[{}]};
 const b=app(JSON.stringify(datos));assert.equal(b.run('borradorCroquis'),null);
});
test('los controles de revisión corrigen y desconfirman el dato editado',()=>{
 const a=app();ejemploRevisado(a);a.run('renderRevisionCroquis()');
 function buscar(n,p){if(p(n))return n;for(const c of n.children||[]){const r=buscar(c,p);if(r)return r;}}
 const label=buscar(a.elements.get('datosCroquis'),n=>n.textContent==='Metros totales');
 const input=label.children[0];input.value='24';input.oninput();
 assert.equal(a.run('borradorCroquis.tramos[0].campos.metros.valor'),24);assert.equal(a.run('borradorCroquis.tramos[0].campos.metros.confirmado'),false);
});
test('varios tramos se validan antes de agregar cualquiera de ellos',()=>{
 const a=app();ejemploRevisado(a);a.run("const otro=JSON.parse(JSON.stringify(borradorCroquis.tramos[0]));otro.campos.metros.confirmado=false;borradorCroquis.tramos.push(otro);incorporarCroquis()");
 assert.equal(a.run('tramos.length'),0);assert.equal(a.run('artefactos.length'),0);
});

test('botón Gemini desactivado no envía ni lee la foto y conserva todo el proyecto',()=>{
 const a=app();a.ctx.fetch=()=>assert.fail('No debe existir tráfico de red');
 a.run("abrir('gas');fotoURL='blob:personal';analizarFotoGemini()");assert.match(a.text('estadoGemini'),/desactivado/);assert.equal(a.run('fotoURL'),'blob:personal');assert.equal(a.run('borradorCroquis'),null);
});
test('respuesta incompleta local conserva null, booleano desconocido y accesorios pendientes',()=>{
 const a=app();a.run("abrir('gas');cargarPruebaGemini()");
 assert.equal(a.run('borradorCroquis.origen'),'prueba-gemini');assert.equal(a.run('borradorCroquis.version'),2);
 assert.equal(a.run('borradorCroquis.tramos[0].campos.metros.valor'),null);assert.equal(a.run('borradorCroquis.tramos[0].campos.llave.valor'),null);
 assert.equal(a.run('borradorCroquis.tramos[0].revisionAccesorios.valor'),'pendiente');a.run('incorporarCroquis()');assert.equal(a.run('tramos.length'),0);
});
function geminiRevisado(a){
 ejemploRevisado(a);
 a.run("var anterior=borradorCroquis.tramos[0];var bruto={version:1,tramos:[{campos:Object.fromEntries(Object.entries(anterior.campos).map(([k,d])=>[k,d.valor])),estadoAccesorios:'identificados',accesorios:anterior.accesorios.map(a=>Object.fromEntries(Object.entries(a).filter(([k])=>k!=='incluir').map(([k,d])=>[k,d.valor])))}]};borradorCroquis=adaptarRespuestaGemini(bruto,{origen:'prueba-gemini'});");
 a.run("borradorCroquis.tramos.forEach(t=>{Object.values(t.campos).forEach(d=>d.confirmado=true);t.revisionAccesorios.confirmado=true;t.accesorios.forEach(a=>Object.values(a).forEach(d=>{if(d&&typeof d==='object')d.confirmado=true;}));})");
}
test('adaptador ignora confirmaciones del proveedor y no convierte cadenas a números',()=>{
 const a=app();a.ctx.raw={version:1,confirmado:true,tramos:[{campos:{metros:'6',llave:'false'},accesorios:[],estadoAccesorios:null}]};
 a.run('borradorCroquis=adaptarRespuestaGemini(raw)');assert.equal(a.run('borradorCroquis.tramos[0].campos.metros.valor'),null);
 assert.equal(a.run('borradorCroquis.tramos[0].campos.llave.valor'),null);assert.equal(a.run('borradorCroquis.tramos[0].campos.metros.confirmado'),false);assert.equal(a.run('borradorCroquis.tramos[0].revisionAccesorios.valor'),'pendiente');
});
test('tipo de accesorio desconocido no se convierte en un codo por defecto',()=>{
 const a=app();a.run("borradorCroquis=adaptarRespuestaGemini({version:1,tramos:[{campos:{},accesorios:[{tipo:'giro-posible',metrosAntes:3}]}]});renderRevisionCroquis()");
 assert.equal(a.run('borradorCroquis.tramos[0].accesorios[0].tipo.valor'),null);assert.equal(a.run('borradorCroquis.tramos[0].accesorios[0].salida.valor'),null);
});
test('estado de accesorios pendiente o contradictorio impide incorporar',()=>{
 for(const estado of ['pendiente','ninguno']){const a=app();geminiRevisado(a);a.run(`borradorCroquis.tramos[0].revisionAccesorios.valor='${estado}';incorporarCroquis()`);assert.equal(a.run('tramos.length'),0);assert.match(a.text('mensajeCroquis'),/pendientes|seleccionados/);}
});
test('prueba local revisada usa cálculos existentes y mantiene marca SIMULADO al imprimir',()=>{
 const a=app();geminiRevisado(a);a.run('incorporarCroquis();calcularMateriales();calcularConsumos()');
 assert.equal(a.run('tramos.length'),1);assert.equal(a.run('tramos[0].origen.tipo'),'prueba-gemini');assert.equal(a.run('evaluarTramo(tramos[0]).tiras'),3);
 assert.match(a.elements.get('resultadoMateriales').children[0].textContent,/SIMULADOS/);assert.match(a.text('resultadoGas'),/SIMULADOS/);
 const b=app(a.saved());assert.equal(b.run('borradorCroquis.origen'),'prueba-gemini');assert.equal(b.run('borradorCroquis.aplicado'),true);
});
test('prepara origen Gemini sin confundirlo con datos simulados; exige todas las confirmaciones',()=>{
 const a=app();geminiRevisado(a);a.run("borradorCroquis.origen='gemini';borradorCroquis.tramos[0].campos.llave.valor=null;incorporarCroquis()");assert.equal(a.run('tramos.length'),0);
 a.run("borradorCroquis.tramos[0].campos.llave.valor=false;incorporarCroquis();calcularMateriales()");assert.equal(a.run('tramos[0].origen.tipo'),'gemini');assert.match(a.elements.get('listaTramos').children[0].children[0].textContent,/IA revisada/);
});
test('cuotas y errores locales no borran fotos, borradores ni tramos',()=>{
 const a=app();ejemploRevisado(a);const antes=a.run('JSON.stringify(borradorCroquis)');a.run("fotoURL='blob:personal';probarErrorGemini('CUOTA_AGOTADA')");assert.match(a.text('estadoGemini'),/PRUEBA LOCAL SIN IA/);assert.match(a.text('estadoGemini'),/no se activan pagos/);
 a.run("probarErrorGemini('SIN_CONEXION')");assert.equal(a.run('JSON.stringify(borradorCroquis)'),antes);assert.equal(a.run('fotoURL'),'blob:personal');
});
test('puede agregar manualmente un accesorio a una revisión incompleta',()=>{
 const a=app();a.run("abrir('gas');cargarPruebaGemini();agregarAccesorioRevision(borradorCroquis.tramos[0])");
 assert.equal(a.run('borradorCroquis.tramos[0].accesorios.length'),1);assert.equal(a.run('borradorCroquis.tramos[0].accesorios[0].entrada.valor'),null);assert.equal(a.run('borradorCroquis.tramos[0].revisionAccesorios.confirmado'),false);
});
test('No es una respuesta explícita, no un booleano ausente',()=>{
 const a=app();a.run("abrir('gas');cargarPruebaGemini()");
 function buscar(n,p){if(p(n))return n;for(const c of n.children||[]){const r=buscar(c,p);if(r)return r;}}
 const label=buscar(a.elements.get('datosCroquis'),n=>n.textContent==='¿Hay una llave de paso?');const input=label.children[0];
 assert.equal(input.value,'');input.value='false';input.onchange();assert.equal(a.run('borradorCroquis.tramos[0].campos.llave.valor'),false);assert.equal(a.run('borradorCroquis.tramos[0].campos.llave.confirmado'),false);
});
test('contrato del intermediario y adaptador del navegador conservan los mismos desconocidos',async()=>{
 const {validateModelResult}=await import('../server/gemini-proxy.mjs');const a=app();
 a.ctx.normalizado=validateModelResult({version:1,tramos:[{campos:{metros:'inventado',llave:null},accesorios:[]}]});
 a.run("borradorCroquis=adaptarRespuestaGemini(normalizado,{origen:'prueba-gemini'})");
 assert.equal(a.run('formatoBorradorValido(borradorCroquis)'),true);assert.equal(a.run('borradorCroquis.tramos[0].campos.metros.valor'),null);
 assert.equal(a.run('borradorCroquis.tramos[0].revisionAccesorios.valor'),'pendiente');
});
test('probar otra respuesta no reemplaza un borrador ni oculta el aviso',()=>{
 const a=app();ejemploRevisado(a);const antes=a.run('JSON.stringify(borradorCroquis)');a.run("mostrarVista('croquis');cargarPruebaGemini()");
 assert.equal(a.run('JSON.stringify(borradorCroquis)'),antes);assert.equal(a.elements.get('revisionCroquis').classList.hidden,false);assert.match(a.text('mensajeCroquis'),/Conservamos/);
});
test('la preparación de Gemini aparece solo en GAS y deja las fotos de las otras especialidades',()=>{
 const a=app();for(const m of ['gas','agua','cloacas']){a.run(`abrir('${m}');mostrarVista('croquis')`);assert.equal(a.elements.get('panelGemini').classList.hidden,m!=='gas');assert.equal(a.elements.get('croquis').classList.hidden,false);}
});

function redEjemplo(a){
 a.run("abrir('gas')");
 a.ctx.datosRed={version:1,perfil:{pais:'AR',uso:'domiciliario',gas:'GN',provincia:'Provincia de prueba',localidad:'Localidad de prueba',distribuidora:'Distribuidora de prueba',material:'Material declarado',sistema:'Sistema declarado',unidadPresion:'Pa',presionDisponible:'100',presionMinima:'60',perdidaMaxima:'20',fuentePresiones:'Solo datos de prueba, no valores de diseño',referenciaNormativa:'Referencia de prueba no verificada',criterioDemanda:'placa-total'},
  nodos:[{id:'m',nombre:'M',tipo:'medidor'},{id:'t1',nombre:'T1',tipo:'derivacion'},
   {id:'a',nombre:'Cocina',tipo:'artefacto',artefactoId:'a1'},{id:'b',nombre:'Calefactor',tipo:'artefacto',artefactoId:'a2'}]};
 a.run("instalacionGas=datosRed;artefactos=[{id:'a1',nombre:'Cocina',consumo:9000},{id:'a2',nombre:'Calefactor',consumo:4000}];tramos=[{id:'t0',desde:'M',hasta:'T1',metros:6,diametro:'3/4\"',consumo:999,red:{desde:'m',hasta:'t1'},detalle:{estado:'completo',metrosFinal:0,accesorios:[{tipo:'tee',nodo:'T1',metrosAntes:6,salida:'3/4\"',ramal:'1/2\"'}]}},{id:'t1',desde:'T1',hasta:'Cocina',metros:3,diametro:'3/4\"',consumo:null,red:{desde:'t1',hasta:'a'},detalle:{estado:'ninguno'}},{id:'t2',desde:'T1',hasta:'Calefactor',metros:4,diametro:'1/2\"',consumo:null,red:{desde:'t1',hasta:'b'},detalle:{estado:'ninguno'}}]");
}
test('red ramificada suma aguas abajo sin reemplazar el consumo manual ni recomendar diámetros',()=>{
 const a=app();redEjemplo(a);const r=a.run('analizarRedGas()');
 assert.deepEqual(Array.from(r.errores),[]);assert.equal(r.porTramo.t0,13000);assert.equal(r.porTramo.t1,9000);assert.equal(r.porTramo.t2,4000);assert.equal(r.total,13000);
 assert.equal(a.run('tramos[0].consumo'),999);assert.equal(a.run('tramos[0].diametro'),'3/4"');assert.equal(r.datosCompletos,true);assert.equal(r.listoParaDimensionar,false);assert.match(r.bloqueoNormativo,/método normativo/);
});
test('red no depende del orden de carga de los tramos',()=>{
 const a=app();redEjemplo(a);a.run('tramos.reverse()');assert.equal(a.run('analizarRedGas().porTramo.t0'),13000);
});
test('detecta tramos sin conexión, destino eliminado y autorreferencia sin publicar totales parciales',()=>{
 for(const cambio of ["delete tramos[0].red","tramos[0].red.hasta='eliminado'","tramos[0].red.hasta='m'"]){
  const a=app();redEjemplo(a);a.run(cambio);const r=a.run('analizarRedGas()');assert.ok(r.errores.length);assert.equal(r.total,null);assert.equal(Object.keys(r.porTramo).length,0);
 }
});
test('detecta circuitos cerrados, alimentación invertida y dos entradas en una unión',()=>{
 const a=app();redEjemplo(a);a.run("tramos.push({id:'ciclo',desde:'A',hasta:'T1',metros:1,diametro:'1/2\"',consumo:0,red:{desde:'a',hasta:'t1'}})");
 const r=a.run('analizarRedGas()');assert.match(r.errores.join(' '),/circuito cerrado/);assert.match(r.errores.join(' '),/no puede alimentar/);assert.equal(r.total,null);
});
test('detecta componentes desconectados del medidor',()=>{
 const a=app();redEjemplo(a);a.run("instalacionGas.nodos.push({id:'sin',nombre:'Sin conexión',tipo:'derivacion'})");assert.match(a.run('analizarRedGas().errores.join(" ")'),/no está conectado al medidor/);
});
test('un artefacto no puede contarse dos veces o quedar fuera de la red',()=>{
 const a=app();redEjemplo(a);a.run("instalacionGas.nodos[3].artefactoId='a1'");const r=a.run('analizarRedGas()');assert.match(r.errores.join(' '),/más de una vez/);assert.match(r.errores.join(' '),/todavía no está conectado/);assert.equal(r.total,null);
});
test('agregar, quitar o cambiar un artefacto invalida o recalcula la demanda',()=>{
 const a=app();redEjemplo(a);a.run('artefactos[1].consumo=6000');assert.equal(a.run('analizarRedGas().porTramo.t0'),15000);
 a.run("artefactos.push({id:'nuevo',nombre:'Sin conectar',consumo:2000})");assert.equal(a.run('analizarRedGas().total'),null);
 a.run("artefactos=artefactos.filter(a=>a.id!=='nuevo'&&a.id!=='a2')");assert.match(a.run('analizarRedGas().errores.join(" ")'),/artefacto existente/);
});
test('no permite demandas nulas, negativas, no finitas o vacías',()=>{
 const a=app();redEjemplo(a);for(const valor of [null,-1,0,NaN,Infinity]){a.ctx.mal=valor;a.run('artefactos[0].consumo=mal');assert.equal(a.run('analizarRedGas().total'),null);}
});
test('faltantes generales no impiden sumar la red pero impiden declarar datos completos',()=>{
 const a=app();redEjemplo(a);a.run("delete instalacionGas.perfil.material;instalacionGas.perfil.presionDisponible='';instalacionGas.perfil.referenciaNormativa=''");
 const r=a.run('analizarRedGas()');assert.equal(r.total,13000);assert.equal(r.datosCompletos,false);assert.ok(r.faltantes.length>=3);assert.equal(r.listoParaDimensionar,false);
});
test('valida coherencia de presiones sin calcular pérdida ni diámetro',()=>{
 const a=app();redEjemplo(a);a.run("instalacionGas.perfil.presionDisponible='50';instalacionGas.perfil.perdidaMaxima='100'");assert.match(a.run('analizarRedGas().faltantes.join(" ")'),/debe superar|supera la diferencia/);
});
test('otros perfiles quedan guardables pero no habilitados para dimensionamiento',()=>{
 const a=app();redEjemplo(a);a.run("instalacionGas.perfil.gas='GLP';instalacionGas.perfil.pais='OTRO'");assert.match(a.run('analizarRedGas().faltantes.join(" ")'),/no soportado/);assert.equal(a.run('analizarRedGas().listoParaDimensionar'),false);
});
test('tee interior exige dividir el tramo y tee con ramal sin conectar bloquea la suma',()=>{
 const a=app();redEjemplo(a);a.run('tramos[0].metros=12;tramos[0].detalle.metrosFinal=6');assert.match(a.run('analizarRedGas().errores.join(" ")'),/Dividí/);assert.equal(a.run('analizarRedGas().total'),null);
});
test('sin tee registrada una bifurcación permanece pendiente y no se inventan accesorios',()=>{
 const a=app();redEjemplo(a);a.run("tramos[0].detalle={estado:'ninguno'}");const r=a.run('analizarRedGas()');assert.equal(r.total,13000);assert.equal(r.datosCompletos,false);assert.match(r.pendientes.join(' '),/registrar una sola tee/);assert.equal(a.run('tramos[0].detalle.accesorios'),undefined);
});
test('perfil, conexiones e identificadores sobreviven a recarga',()=>{
 const a=app();redEjemplo(a);a.run('guardarDatos()');const b=app(a.saved());assert.equal(b.run('analizarRedGas().total'),13000);assert.equal(b.run('instalacionGas.perfil.localidad'),'Localidad de prueba');assert.equal(b.run('tramos[0].id'),'t0');assert.equal(b.run('tramos[1].consumo'),null);
});
test('editar un tramo conserva su asociación de red y su identificador',()=>{
 const a=app();redEjemplo(a);a.run('editandoTramo=0');for(const [id,v]of Object.entries({desde:'M-corregido',hasta:'T1',metros:'6',consumoTramo:'',diametro:'3/4"'}))a.elements.get(id).value=v;
 a.run('agregarTramo()');assert.equal(a.run('tramos[0].id'),'t0');assert.equal(a.run('tramos[0].red.desde'),'m');assert.equal(a.run('analizarRedGas().porTramo.t0'),13000);assert.equal(a.run('tramos[0].consumo'),null);
});
test('crear, editar y quitar puntos conserva los tramos y detecta referencias pendientes',()=>{
 const a=app();a.run("abrir('gas')");a.elements.get('redNombreNodo').value='M';a.elements.get('redTipoNodo').value='medidor';a.run('guardarNodoGas()');assert.equal(a.run('instalacionGas.nodos.length'),1);
 a.elements.get('redNombreNodo').value='Otro medidor';a.run('guardarNodoGas()');assert.equal(a.run('instalacionGas.nodos.length'),1);assert.match(a.text('redMensaje'),/Ya existe/);
 redEjemplo(a);a.run('renderRedGas()');a.elements.get('redNodos').children[1].children.find(n=>n.textContent==='Quitar punto').onclick();assert.equal(a.run('tramos.length'),3);assert.equal(a.run('analizarRedGas().total'),null);
});
test('la vista de red está separada de agua y cloacas y produce resumen imprimible',()=>{
 const a=app();redEjemplo(a);a.run("mostrarVista('redGas');renderRedGas()");assert.equal(a.elements.get('redGas').classList.hidden,false);
 assert.match(a.elements.get('redResultado').children.map(n=>n.textContent).join(' '),/13.000 kcal\/h/);
 assert.ok(a.elements.get('redResultado').children.some(n=>n.className==='solo-impresion'));
 for(const m of ['agua','cloacas']){a.run(`abrir('${m}');mostrarVista('redGas')`);assert.equal(a.elements.get('redGas').classList.hidden,true);}
});
test('datos anteriores se conservan sin asignar conexiones por semejanza de nombres',()=>{
 const a=app();a.run("abrir('gas');tramos=[{desde:'M',hasta:'Cocina',metros:6,diametro:'1/2\"',consumo:9000}];artefactos=[{nombre:'Cocina',consumo:9000}];guardarDatos()");
 const b=app(a.saved());assert.equal(b.run('tramos.length'),1);assert.equal(b.run('tramos[0].red'),undefined);assert.equal(b.run('analizarRedGas().total'),null);assert.ok(b.run('tramos[0].id'));
});
test('medidores múltiples, nombres duplicados y tramos paralelos bloquean la red',()=>{
 for(const cambio of ["instalacionGas.nodos.push({id:'m2',nombre:'M2',tipo:'medidor'})","instalacionGas.nodos[3].nombre='Cocina'","tramos.push({...tramos[1],id:'duplicado'})"]){const a=app();redEjemplo(a);a.run(cambio);assert.equal(a.run('analizarRedGas().total'),null);}
});
test('una tee declarada sin segundo ramal no permite sumar una demanda incompleta',()=>{
 const a=app();redEjemplo(a);a.run("tramos=tramos.filter(t=>t.id!=='t2');artefactos=artefactos.filter(a=>a.id!=='a2');instalacionGas.nodos=instalacionGas.nodos.filter(n=>n.id!=='b')");assert.match(a.run('analizarRedGas().errores.join(" ")'),/Falta registrar un ramal/);assert.equal(a.run('analizarRedGas().total'),null);
});
test('el perfil incompleto no se rellena con presiones o normas supuestas',()=>{
 const a=app();a.run("abrir('gas')");assert.equal(a.run('instalacionGas.perfil.gas'),'GN');assert.equal(a.elements.get('redPresion').value,'');assert.equal(a.run('instalacionGas.perfil.referenciaNormativa'),undefined);
 a.elements.get('redLocalidad').value='Mi localidad';a.run('guardarPerfilGas()');assert.equal(a.run('instalacionGas.perfil.localidad'),'Mi localidad');assert.equal(a.run('instalacionGas.perfil.presionDisponible'),'');
});
test('red corrupta guardada avisa y conserva tramos y artefactos',()=>{
 const a=app();redEjemplo(a);a.run('guardarDatos()');const datos=JSON.parse(a.saved());datos.gas.instalacion.nodos=[null];const b=app(JSON.stringify(datos));assert.equal(b.run('tramos.length'),3);assert.equal(b.run('artefactos.length'),2);assert.match(b.run('avisoRestauracionRedGas'),/No se pudo recuperar/);
});

function fixtureMotor(a){
 redEjemplo(a);
 a.run("instalacionGas.perfil.poderCalorifico='1000';instalacionGas.perfil.densidadRelativa='1';instalacionGas.perfil.fuenteGas='FICTICIO SOLO TEST';instalacionGas.nodos[1].unionDimensionamiento='tee';tramos[1].red.via='principal';tramos[2].red.via='ramal';tramos.forEach(t=>t.diametro=null)");
 const candidatos=[{id:'D-test-pequeno',interiorMm:1,filas:[{caudal:10,perdidaPaM:1},{caudal:20,perdidaPaM:3}]},
  {id:'D-test-grande',interiorMm:2,filas:[{caudal:10,perdidaPaM:0.1},{caudal:20,perdidaPaM:0.3}]}];
 const piezas={};const ids=candidatos.map(c=>c.id);
 for(const x of ids)for(const y of ids){for(const tipo of ['codo45','codo90','llave','cupla','reduccion'])piezas[[tipo,x,y].join('|')]={equivalentes:{principal:0.5}};
  for(const z of ids)piezas[['tee',x,y,z].join('|')]={equivalentes:{principal:1,ramal:2}};
 }
 a.ctx.packMotor={soloPruebas:true,verificado:true,fuente:'DATOS FICTICIOS DEL ALGORITMO, NO USAR EN GAS',edicion:'test',material:'Material declarado',sistema:'Sistema declarado',gas:'GN',metodo:'perdida-lineal-tabular',redondeoSuperiorVerificado:true,
  condiciones:{presionMinPa:1,presionMaxPa:200,densidadRelativa:1},candidatos,piezas};
}
test('tramo se agrega y recupera sin diámetro ni consumo manual',()=>{
 const a=app();a.run("abrir('gas')");for(const [id,v]of Object.entries({desde:'M',hasta:'A',metros:'15',consumoTramo:'',diametro:''}))a.elements.get(id).value=v;
 a.run('agregarTramo()');assert.equal(a.run('tramos.length'),1);assert.equal(a.run('tramos[0].diametro'),null);
 const b=app(a.saved());assert.equal(b.run('tramos[0].diametro'),null);b.run('calcularMateriales()');assert.match(b.elements.get('resultadoMateriales').children.map(x=>x.textContent).join(' '),/Diámetro pendiente|provisorio/);
});
test('accesorios se registran por tipo y posición sin medidas',()=>{
 const a=app();a.run("abrir('gas');tramos=[{desde:'M',hasta:'A',metros:12,consumo:null,diametro:null}];abrirAccesorios(0)");
 a.elements.get('estadoAccesorios').value='completo';a.elements.get('metrosFinal').value='6';a.run("borradorAccesorios=[{tipo:'codo90',metrosAntes:6,salida:'',ramal:'',nodo:''}];guardarAccesorios()");
 assert.equal(a.run('tramos[0].detalle.estado'),'completo');assert.equal(a.run('tramos[0].diametro'),null);
});
test('motor sin tablas no inventa medidas ni usa el valor manual como resultado',()=>{
 const a=app();fixtureMotor(a);const r=a.run('motorDimensionarGas(tramos,artefactos,instalacionGas)');assert.equal(r.estado,'bloqueado');assert.equal(r.diametros,null);assert.match(r.faltantes.join(' '),/Tabla de capacidad/);assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
});
test('tablas ficticias se bloquean en modo de producción',()=>{
 const a=app();fixtureMotor(a);const r=a.run('motorDimensionarGas(tramos,artefactos,instalacionGas,packMotor)');assert.equal(r.diametros,null);assert.match(r.faltantes.join(' '),/ficticio/);
});
test('motor evalúa candidatos y cumple presión en recorridos completos sin duplicar tee',()=>{
 const a=app();fixtureMotor(a);const r=a.run('motorDimensionarGas(tramos,artefactos,instalacionGas,packMotor,{modoPrueba:true})');
 assert.equal(r.estado,'calculado');assert.equal(r.prueba,true);assert.equal(r.diametros.t0,'D-test-grande');assert.equal(r.diametros.t1,'D-test-pequeno');assert.equal(r.diametros.t2,'D-test-pequeno');
 assert.equal(r.accesorios.filter(x=>x.tipo==='tee-reductora').length,1);assert.equal(r.accesorios.filter(x=>x.tipo==='reduccion').length,0);
 assert.equal(r.recorridos.length,2);assert.equal(r.recorridos.find(x=>x.artefacto==='Calefactor').longitudReal,10);
 assert.ok(r.recorridos.every(x=>x.perdidaPa<=20));assert.equal(a.run('tramos[0].diametro'),null);
});
test('longitudes equivalentes de tee dependen de principal y ramal',()=>{
 const a=app();fixtureMotor(a);const r=a.run('motorDimensionarGas(tramos,artefactos,instalacionGas,packMotor,{modoPrueba:true})');
 assert.equal(r.porTramo.t1.longitudEquivalente,4);assert.equal(r.porTramo.t2.longitudEquivalente,6);
});
test('falta de catálogo de accesorios o material incompatible bloquea en vez de extrapolar',()=>{
 const a=app();fixtureMotor(a);a.run("packMotor.material='Otro material'");assert.match(a.run('motorDimensionarGas(tramos,artefactos,instalacionGas,packMotor,{modoPrueba:true}).faltantes.join(" ")'),/exactamente/);
 a.run("packMotor.material='Material declarado';packMotor.piezas={}");const r=a.run('motorDimensionarGas(tramos,artefactos,instalacionGas,packMotor,{modoPrueba:true})');assert.equal(r.diametros,null);assert.match(r.faltantes.join(' '),/Falta pieza/);
});
test('límite de búsqueda no se presenta como solución final',()=>{
 const a=app();fixtureMotor(a);const r=a.run('motorDimensionarGas(tramos,artefactos,instalacionGas,packMotor,{modoPrueba:true,maxCombinaciones:1})');assert.equal(r.diametros,null);assert.match(r.faltantes.join(' '),/límite de combinaciones/);
});
test('capacidad tabulada usa longitud completa del recorrido y caudal acumulado',()=>{
 const a=app();fixtureMotor(a);a.run("packMotor.metodo='longitud-maxima-tabular';packMotor.reglaLongitud='maxima-ruta-completa-que-contiene-tramo';packMotor.condiciones.caidaPa=10;packMotor.candidatos[0].filas=[{longitud:10,caudal:10},{longitud:20,caudal:5}];packMotor.candidatos[1].filas=[{longitud:10,caudal:30},{longitud:20,caudal:20}]");
 const r=a.run('motorDimensionarGas(tramos,artefactos,instalacionGas,packMotor,{modoPrueba:true})');assert.equal(r.estado,'calculado');assert.equal(r.diametros.t0,'D-test-grande');assert.equal(r.recorridos[0].perdidaPa,null);
});
test('ejercicio aportado acumula 29200 y reconstruye 24, 29 y 36 m sin ingresar diámetros',()=>{
 const a=app();a.run("abrir('gas')");const r=a.run('probarEjercicioGas()');assert.equal(r.red.total,29200);
 assert.equal(r.red.porTramo['A-B'],13200);assert.equal(r.red.porTramo['A-Termotanque'],16000);
 assert.deepEqual(Array.from(r.rutas.map(x=>x.tramos.reduce((n,id)=>n+r.caso.tramos.find(t=>t.id===id).metros,0))).sort((x,y)=>x-y),[24,29,36]);
 assert.ok(r.caso.tramos.every(t=>t.diametro===null));assert.equal(r.resultado.diametros,null);assert.match(r.resultado.faltantes.join(' '),/Confirmar/);
 assert.equal(a.run('tramos.length'),0);assert.equal(a.run('artefactos.length'),0);
});
test('resultados anotados del ejercicio no alimentan la selección de candidatos',()=>{
 const a=app();a.run("abrir('gas')");a.elements.get('dimConfirmarLongitudes').checked=true;const r=a.run('probarEjercicioGas()');assert.equal(r.caso.referencias['M-A'],'1"');assert.equal(r.resultado.diametros,null);assert.match(a.elements.get('resultadoEjercicioGas').children.map(x=>x.textContent).join(' '),/resultado del motor PENDIENTE/);
});
test('revisión de croquis admite diámetros ausentes sin inventarlos',()=>{
 const a=app();ejemploRevisado(a);a.run("borradorCroquis.tramos[0].campos.diametro.valor=null;borradorCroquis.tramos[0].campos.diametro.confirmado=false;borradorCroquis.tramos[0].accesorios.forEach(a=>{for(const k of ['entrada','salida','ramal']){a[k].valor=null;a[k].confirmado=false;}});incorporarCroquis()");
 assert.equal(a.run('tramos.length'),1);assert.equal(a.run('tramos[0].diametro'),null);assert.equal(a.run('tramos[0].detalle.accesorios[0].ramal'),null);
});
test('una unión recta de distinto diámetro agrega una sola reducción independiente',()=>{
 const a=app();fixtureMotor(a);a.run("instalacionGas.nodos=instalacionGas.nodos.filter(n=>n.id!=='b');instalacionGas.nodos[1].unionDimensionamiento='union';artefactos=artefactos.filter(a=>a.id==='a1');tramos=tramos.filter(t=>t.id!=='t2');tramos[0].detalle={estado:'ninguno'}");
 const r=a.run('motorDimensionarGas(tramos,artefactos,instalacionGas,packMotor,{modoPrueba:true})');assert.equal(r.estado,'calculado');
 // A smaller budget forces the shared/main run to grow while the final run stays small.
 a.run("instalacionGas.perfil.perdidaMaxima='8'");const ajustado=a.run('motorDimensionarGas(tramos,artefactos,instalacionGas,packMotor,{modoPrueba:true})');assert.equal(ajustado.estado,'calculado');assert.equal(ajustado.accesorios.filter(x=>x.tipo==='reduccion').length,1);
});
test('codos y llaves reciben las medidas del candidato seleccionado y suman equivalentes',()=>{
 const a=app();fixtureMotor(a);a.run("tramos[1].llave=true;tramos[1].detalle={estado:'completo',metrosFinal:2,accesorios:[{tipo:'codo45',metrosAntes:1,salida:null}]}");const r=a.run('motorDimensionarGas(tramos,artefactos,instalacionGas,packMotor,{modoPrueba:true})');
 assert.equal(r.estado,'calculado');const llave=r.accesorios.find(x=>x.tipo==='llave');assert.equal(llave.medidas[0],r.diametros.t1);assert.equal(r.porTramo.t1.longitudEquivalente,5);
});
test('la falta de fila para un candidato bloquea aun si otro candidato tiene una solución',()=>{
 const a=app();fixtureMotor(a);a.run('packMotor.candidatos[0].filas=[{caudal:1,perdidaPaM:1}]');const r=a.run('motorDimensionarGas(tramos,artefactos,instalacionGas,packMotor,{modoPrueba:true})');assert.equal(r.diametros,null);assert.match(r.faltantes.join(' '),/extrapolar/);
});
test('varias llaves registradas por posición se cuentan por cantidad y no por diámetro ingresado',()=>{
 const a=app();fixtureMotor(a);a.run("tramos[1].detalle={estado:'completo',metrosFinal:1,accesorios:[{tipo:'llave',metrosAntes:1,salida:null},{tipo:'llave',metrosAntes:1,salida:null}]}" );
 const r=a.run('motorDimensionarGas(tramos,artefactos,instalacionGas,packMotor,{modoPrueba:true})');assert.equal(r.estado,'calculado');assert.equal(r.accesorios.filter(x=>x.tipo==='llave').reduce((n,a)=>n+a.cantidad,0),2);
});
test('cuplas y codos se cuantifican por segmentos aun sin diámetros',()=>{
 const a=app();a.ctx.tramo={metros:12,diametro:null,detalle:{estado:'completo',metrosFinal:6,accesorios:[{tipo:'codo90',metrosAntes:6,salida:null}]}};
 const r=a.run('evaluarTramo(tramo)');assert.equal(r.cuplas,0);assert.equal(r.tiras,2);assert.equal(r.accesorios.length,1);assert.equal(r.soloMedidasPendientes,true);
 assert.match(a.run('nombreAccesorio(evaluarTramo(tramo).accesorios[0])'),/medidas pendientes/);
});

// Catálogo FICTICIO aislado: comprueba aritmética/control, jamás valores técnicos.
function fixtureClase(a){
 fixtureMotor(a);
 a.run("instalacionGas.perfil={...PERFIL_CLASE_ACERO};packMotor.material=PERFIL_CLASE_ACERO.material;packMotor.sistema=PERFIL_CLASE_ACERO.sistema;packMotor.metodo='longitud-maxima-tabular';packMotor.reglaLongitud='maxima-ruta-completa-que-contiene-tramo';packMotor.condiciones={densidadRelativa:0.65};packMotor.politicaCuplas='incluir';packMotor.fuentePoliticaCuplas='FICTICIO SOLO TEST';packMotor.tabla3={numero:3,verificada:true,fuente:'FICTICIO',edicion:'TEST',unidades:'TEST',aplicabilidadAceroRoscadoEpoxi:true,unidadCaudal:'m3/h',unidadLongitud:'m',referenciaH:{valor:10,unidad:'mmca',significadoVerificado:'SOLO TEST'}};packMotor.tabla18={numero:18,verificada:true,fuente:'FICTICIO',edicion:'TEST',unidades:'TEST',aplicabilidadAceroRoscadoEpoxi:true,unidadEquivalentes:'m'};packMotor.candidatos[0].filas=[{longitud:15,caudal:2},{longitud:100,caudal:0.5}];packMotor.candidatos[1].filas=[{longitud:15,caudal:5},{longitud:100,caudal:4}]");
}
function clase(a,opts='{}'){return a.run(`motorClaseAceroGas(tramos,artefactos,instalacionGas,packMotor,{modoPrueba:true,...${opts}})`);}
test('clase: ejercicio real verifica recorridos y consumos, deja tamaños de referencia pendientes',()=>{
 const a=app();a.run("abrir('gas');var casoClase=casoEjercicioGas();casoClase.instalacion.perfil={...PERFIL_CLASE_ACERO}");
 const r=a.run('motorClaseAceroGas(casoClase.tramos,casoClase.artefactos,casoClase.instalacion)');
 assert.equal(r.diametros,null);assert.equal(r.aptoInstalacion,false);
 assert.deepEqual(Array.from(r.recorridos,x=>x.longitudReal),[36,29,24]);
 assert.deepEqual(Array.from(r.recorridos,x=>x.longitudInicial),[51,44,39]);
 assert.deepEqual(Object.values(r.porTramo).map(x=>x.consumoKcal),[29200,16000,13200,3000,10200]);
 for(const t of Object.values(r.porTramo)){assert.equal(t.caudal,t.consumoKcal/9300);assert.equal(t.diametroCalculado,null);assert.equal(t.longitudDefinitiva,null);}
 assert.match(r.faltantes.join(' '),/fotografías|Tabla/);
});
test('clase: +15 solo inicial; recalcula candidatos y converge con equivalentes reales',()=>{
 const a=app();fixtureClase(a);const r=clase(a);assert.equal(r.estado,'calculado',r.faltantes.join(' '));
 assert.equal(r.historia[0].diametros.t0,'D-test-grande');assert.equal(r.diametros.t0,'D-test-pequeno');assert.equal(r.historia.length,3);
 assert.deepEqual(Array.from(r.recorridos,x=>x.longitudDefinitiva),[12,10]);
 assert.equal(r.porTramo.t0.longitudDeCalculo,12);assert.equal(r.porTramo.t1.longitudDeCalculo,10);assert.equal(r.porTramo.t2.longitudDeCalculo,12);
 assert.equal(r.porTramo.t0.caudal,13000/9300);assert.equal(r.porTramo.t0.capacidad,2);assert.equal(r.aptoInstalacion,false);
 a.ctx.informePrueba=r;a.run("mostrarInformeClaseGas(informePrueba,'informeClaseMiRed')");assert.match(a.elements.get('informeClaseMiRed').children.map(p=>p.textContent).join(' '),/Capacidad comprobada por tramo/);
});
test('clase: tee única, paso directo y giro tienen equivalentes distintos',()=>{
 const a=app();fixtureClase(a);const r=clase(a);
 assert.equal(r.accesorios.filter(x=>x.tipo.startsWith('tee')).length,1);
 assert.equal(r.porTramo.t1.longitudEquivalenteAccesorios,1);assert.equal(r.porTramo.t2.longitudEquivalenteAccesorios,2);
 assert.equal(r.porTramo.t1.accesorios[0].referenciaPiezaCompartida,true);
});
test('clase: codo45, codo90 y llave usan su diámetro calculado y equivalentes',()=>{
 const a=app();fixtureClase(a);a.run("tramos[1].detalle={estado:'completo',metrosFinal:1,accesorios:[{tipo:'codo45',metrosAntes:1},{tipo:'codo90',metrosAntes:1}]};tramos[1].llave=true");
 const r=clase(a);assert.equal(r.estado,'calculado',r.faltantes.join(' '));assert.equal(r.porTramo.t1.longitudEquivalenteAccesorios,2.5);
 for(const tipo of ['codo45','codo90','llave'])assert.equal(r.accesorios.find(x=>x.tipo===tipo).medidas[0],r.diametros.t1);
});
test('clase: reducción independiente se cuenta una vez sin sumar equivalentes',()=>{
 const a=app();fixtureClase(a);a.run("tramos=tramos.filter(t=>t.id!=='t2');artefactos=artefactos.filter(a=>a.id==='a1');instalacionGas.nodos=instalacionGas.nodos.filter(n=>n.id!=='b');instalacionGas.nodos[1].unionDimensionamiento='union';tramos[0].detalle={estado:'ninguno'};packMotor.candidatos[0].filas=[{longitud:100,caudal:0.5}];artefactos[0].consumo=9000;tramos[1].metros=7;tramos[1].detalle={estado:'ninguno'};packMotor.candidatos[0].filas=[{longitud:10,caudal:2},{longitud:100,caudal:0.5}]");
 // Una rama única transporta el mismo caudal: forzamos solo geometría para contrastar medidas distintas.
 const r=a.run("motorDimensionarGas(tramos,artefactos,instalacionGas,packMotor,{modoPrueba:true,contextoClase:true,soloGeometria:true,asignacionFija:{t0:'D-test-grande',t1:'D-test-pequeno'}})");
 assert.equal(r.estado,'calculado');const p=r.accesorios.filter(x=>x.tipo==='reduccion');assert.equal(p.length,1);assert.equal(p[0].equivalente,null);assert.equal(p[0].excluidoDeEquivalentes,true);
 assert.equal(r.porTramo.t1.longitudEquivalente,7.5); // solo cupla de 7 m, no reducción
});
test('clase: no habilita catálogo sintético en la aplicación',()=>{
 const a=app();fixtureClase(a);const r=a.run('motorClaseAceroGas(tramos,artefactos,instalacionGas,packMotor)');assert.equal(r.diametros,null);assert.match(r.faltantes.join(' '),/ficticio|ensayo/);assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
});
test('clase: bloquea material, unidades, tabla incompleta y política de cuplas sin fuente',()=>{
 for(const cambio of ["packMotor.material='Cobre'","delete packMotor.tabla18","packMotor.tabla3.unidadCaudal='kcal/h'","packMotor.tabla3.referenciaH.significadoVerificado=''","delete packMotor.fuentePoliticaCuplas","packMotor.condiciones.densidadRelativa=1"]){const a=app();fixtureClase(a);a.run(cambio);assert.equal(clase(a).diametros,null,cambio);}
});
test('clase: accesorios pendientes y vías de tee desconocidas bloquean resultados',()=>{
 for(const cambio of ["tramos[1].detalle={estado:'pendiente'}","delete tramos[1].red.via","delete instalacionGas.nodos[1].unionDimensionamiento"]){const a=app();fixtureClase(a);a.run(cambio);assert.equal(clase(a).diametros,null,cambio);}
});
test('clase: falta de fila superior o equivalente no se sustituye por estimación',()=>{
 for(const cambio of ["packMotor.candidatos[0].filas=[{longitud:10,caudal:2}]","packMotor.piezas={}"]){const a=app();fixtureClase(a);a.run(cambio);assert.equal(clase(a).diametros,null);}
});
test('clase: límite de iteración y oscilación no dan solución parcial',()=>{
 const a=app();fixtureClase(a);assert.equal(clase(a,'{maxIteraciones:1}').diametros,null);
 a.run("for(const [k,p]of Object.entries(packMotor.piezas))if(k.startsWith('tee|D-test-pequeno|'))p.equivalentes={principal:30,ramal:30}");
 const r=clase(a);assert.equal(r.diametros,null);assert.match(r.faltantes.join(' '),/oscila/);
});
test('clase: cambiar datos invalida informe de mi red, ejemplo no modifica proyecto',()=>{
 const a=app();fixtureClase(a);a.run("guardarDatos()");const anterior=a.saved();a.run('probarMetodoClaseGas()');assert.equal(a.saved(),anterior);
 a.run("ejecutarClaseMiRedGas();guardarDatos()");assert.equal(a.elements.get('informeClaseMiRed').children.length,0);assert.match(a.text('informeClaseMiRed'),/actualizados/);
});
test('clase: tee reductora absorbe el cambio sin duplicar reducciones',()=>{
 const a=app();fixtureClase(a);a.run("packMotor.candidatos[0].filas=[{longitud:100,caudal:1}]");
 const r=clase(a);assert.equal(r.estado,'calculado',r.faltantes.join(' '));assert.equal(r.diametros.t0,'D-test-grande');assert.equal(r.diametros.t1,'D-test-pequeno');assert.equal(r.accesorios.filter(p=>p.tipo==='tee-reductora').length,1);assert.equal(r.accesorios.filter(p=>p.tipo==='reduccion').length,0);
});
test('clase: cuplas de segmentos comerciales se suman o excluyen solo con fuente',()=>{
 const a=app();fixtureClase(a);a.run("tramos[1].metros=7");let r=clase(a);assert.equal(r.estado,'calculado',r.faltantes.join(' '));assert.equal(r.porTramo.t1.longitudEquivalenteAccesorios,1.5);
 a.run("packMotor.politicaCuplas='excluir-con-fuente'");r=clase(a);assert.equal(r.porTramo.t1.longitudEquivalenteAccesorios,1);assert.equal(r.accesorios.find(p=>p.tipo==='cupla').equivalente,null);
});
test('clase: conexiones incorrectas no producen caudales ni tamaños parciales',()=>{
 const a=app();fixtureClase(a);a.run("tramos[2].red.hasta='inexistente'");const r=clase(a);assert.equal(r.diametros,null);assert.equal(r.recorridos.length,0);assert.equal(r.porTramo.t0.caudal,null);
});

test('tablas: pantalla local muestra 12 capacidades, 9 factores y origen sin cotejo',()=>{
 const a=app(null,{tablasLegadas:true});a.run("abrir('gas');mostrarVista('dimensionGas')");const r=a.run('mostrarRevisionTablasGas()');assert.equal(r.habilitado,false);assert.equal(r.capacidades,12);assert.equal(r.coeficientes,9);
 const texto=a.elements.get('revisionTablasGas').children.map(p=>p.textContent).join(' ');assert.match(texto,/800 \| 2210 \| 4525/);assert.match(texto,/ningún valor cotejado/);assert.match(texto,/Edición y vigencia no verificadas/);assert.match(texto,/NO se suma/);
});
test('tablas: datos declarados no registran catálogo ni habilitan los diámetros del ejercicio',()=>{
 const a=app(null,{tablasLegadas:true});a.run("abrir('gas');mostrarRevisionTablasGas()");a.elements.get('claseLongitudesConfirmadas').checked=true;
 const r=a.run('probarMetodoClaseGas()');assert.equal(r.diametros,null);assert.equal(r.estado,'bloqueado');assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
 assert.match(r.faltantes.join(' '),/sin cotejo fotográfico/);assert.ok(Object.values(r.porTramo).every(t=>t.diametroCalculado===null));
});
test('tablas: falta de un archivo se informa sin perder la carga manual',()=>{
 const a=app(null,{tablasLegadas:true});a.run("abrir('gas');delete globalThis.TABLA_NAG200_18");assert.equal(a.run('mostrarRevisionTablasGas()'),null);assert.match(a.elements.get('revisionTablasGas').children[0].textContent,/ZIP completo/);
 for(const [id,v]of Object.entries({desde:'M',hasta:'A',metros:'6',consumoTramo:'',diametro:''}))a.elements.get(id).value=v;
 a.run('agregarTramo()');assert.equal(a.run('tramos.length'),1);assert.equal(a.run('tramos[0].diametro'),null);
});

test('fotos: pantalla muestra transcripción actual y coordenadas exactas de dudas',()=>{
 const a=app(null,{tablasFotoBase:true});a.run("abrir('gas')");const r=a.run('mostrarRevisionTablasGas()');assert.equal(r.capacidades,441);assert.equal(r.coeficientes,9);assert.equal(r.habilitado,false);
 const texto=a.elements.get('revisionTablasGas').children.map(p=>p.textContent).join(' ');assert.match(texto,/223 equivalencias numéricas, 2 celdas dudosas y 9 diferencias/);assert.match(texto,/codo90 · cantidad 5 · columna 2"/);assert.match(texto,/tee-directo · cantidad 5 · columna 3"/);assert.match(texto,/50 m \| 715 \| 1975 \| 4035/);assert.doesNotMatch(texto,/ningún valor cotejado/);
 assert.equal(a.elements.get('revisionTablasGas').children.filter(p=>p.href?.startsWith('fuentes/')).length,2);
});
test('fotos: reconocer la transcripción no habilita catálogo ni las pulgadas del ejercicio',()=>{
 const a=app(null,{tablasFotoBase:true});a.run("abrir('gas');mostrarRevisionTablasGas()");a.elements.get('claseLongitudesConfirmadas').checked=true;
 const r=a.run('probarMetodoClaseGas()');assert.equal(r.diametros,null);assert.equal(r.estado,'bloqueado');assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);assert.match(r.faltantes.join(' '),/ya están transcritas/);
 assert.ok(Object.values(r.porTramo).every(t=>t.diametroCalculado===null));
});
test('fotos: revisión de tablas no cambia el proyecto guardado ni llama a una API',()=>{
 const a=app(null,{tablasFotoBase:true});a.run("abrir('gas');guardarDatos()");const anterior=a.saved();a.ctx.fetch=()=>assert.fail('No se debe llamar a servicios');a.run('mostrarRevisionTablasGas();probarMetodoClaseGas()');assert.equal(a.saved(),anterior);
 for(const m of ['agua','cloacas']){a.run(`abrir('${m}')`);assert.equal(a.elements.get('formularioGas').classList.hidden,true);}
});

test('auditoría final: pantalla incluye las cinco correcciones y tabla de nueve filas con ocho columnas',()=>{
 const a=app();a.run("abrir('gas')");const r=a.run('mostrarAuditoriaFinalGas()');assert.equal(r.habilitado,false);assert.equal(r.tabla3.integra,true);assert.equal(r.tabla3.correccionesDocumentadas.length,5);
 const texto=a.elements.get('auditoriaFinalGas').children.map(p=>p.textContent).join(' ');assert.match(texto,/287190 → 287189/);assert.match(texto,/262151 → 282151/);assert.match(texto,/7.67 m/);assert.match(texto,/7.65 m/);assert.match(texto,/NO resuelta/);
 const tabla=a.elements.get('auditoriaFinalGas').children.find(p=>p.className==='tabla-wrap').children[0];assert.equal(tabla.children.length,10);assert.ok(tabla.children.every(f=>f.children.length===8));
});
test('auditoría final: no reemplaza el proyecto ni habilita resultado de diámetros',()=>{
 const a=app();a.run("abrir('gas');guardarDatos()");const anterior=a.saved();a.ctx.fetch=()=>assert.fail('No se llama a servicios');a.run('mostrarAuditoriaFinalGas()');a.elements.get('claseLongitudesConfirmadas').checked=true;const r=a.run('probarMetodoClaseGas()');assert.equal(r.diametros,null);assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);assert.equal(a.saved(),anterior);
});
test('auditoría final: archivo de referencia ausente se informa sin inventar verificaciones',()=>{
 const a=app();a.run("abrir('gas');delete globalThis.REFERENCIA_AUDITORIA_TABLA3");assert.equal(a.run('mostrarAuditoriaFinalGas()'),null);assert.match(a.elements.get('auditoriaFinalGas').children.map(p=>p.textContent).join(' '),/Faltan archivos/);
});
