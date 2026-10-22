const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
// DOM mínimo: estas pruebas ejercitan el estado y los cálculos reales del script.
// La maquetación, cámara e impresión visual requieren la prueba de navegador.
function app(saved=null,{blocked=false,quota=Infinity,tablasLegadas=false,tablasFotoBase=false,embebido=false,storageGetter=false,soloLectura=false}={}){
 const elements=new Map();const store=new Map(saved?[['canerias-proyectos-v1',saved]]:[]);
 function element(tag='div'){return {tagName:String(tag).toUpperCase(),value:'',textContent:'',checked:false,style:{},children:[],className:'',classList:{hidden:false,add(c){if(c==='oculto')this.hidden=true;},remove(c){if(c==='oculto')this.hidden=false;},toggle(c,b){if(c==='oculto')this.hidden=b;}},focus(){},append(...x){this.children.push(...x)},replaceChildren(){this.children=[];this.textContent=''},removeAttribute(k){delete this[k]},addEventListener(k,fn){this[k]=fn}};}
 for(const m of html.matchAll(/id="([^"]+)"/g))elements.set(m[1],element());
 elements.get('gt').value='9300';elements.get('ga').value='Cocina';
 const ctx=vm.createContext({document:{getElementById:id=>elements.get(id),createElement:element,createTextNode:text=>({textContent:text})},window:{confirm(){return true},scrollTo(){},addEventListener(k,fn){this[k]=fn}},localStorage:{getItem:k=>{if(blocked)throw Error('blocked');return store.get(k)||null},setItem(k,v){if(blocked||soloLectura||v.length>quota)throw Error('quota');store.set(k,v)}},URL:{revokeObjectURL(){}},alert(){}});
 if(storageGetter)vm.runInContext("Object.defineProperty(globalThis,'localStorage',{get(){const e=new Error('Acceso restringido');e.name='SecurityError';throw e;}})",ctx);
 for(const m of html.matchAll(/<script (?:src|data-local)="([^"]+)">([\s\S]*?)<\/script>/g)){const ruta=tablasFotoBase&&/^datos\/tabla-(3|18)\.js$/.test(m[1])?m[1].replace('datos/tabla-','tests/fixtures/tabla-').replace('.js','-1e99313.cjs'):tablasLegadas&&/^datos\/tabla-(3|18)\.js$/.test(m[1])?m[1].replace('datos/tabla-','tests/fixtures/tabla-').replace('.js','-22028c8.cjs'):m[1];vm.runInContext(embebido?m[2]:fs.readFileSync(ruta,'utf8'),ctx);}
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
 a.elements.get('gp').value='1000';a.run('agregarArtefacto()');assert.doesNotMatch(a.text('resultadoGas'),/Tocá CALCULAR/);
 a.run('calcularConsumos()');a.elements.get('listaGas').children[0].children[1].onclick();assert.doesNotMatch(a.text('resultadoGas'),/Tocá CALCULAR/);
 a.elements.get('gt').change();assert.doesNotMatch(a.text('resultadoGas'),/Tocá CALCULAR/);
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
 assert.equal(a.run('tramos.length'),1);assert.equal(a.run('artefactos.length'),1);assert.equal(a.run('proyectos.gas.tramos[0].desde'),'Real-M');assert.equal(a.run('proyectos.gas.artefactos[0].nombre'),'Real');
 assert.equal(a.run('evaluarTramo(tramos[0]).pendiente'),false);assert.equal(a.run('evaluarTramo(tramos[0]).tiras'),3);assert.equal(a.run('evaluarTramo(tramos[0]).cuplas'),0);
 a.run('calcularMateriales();calcularConsumos()');assert.match(a.elements.get('resultadoMateriales').children[0].textContent,/SIMULADOS/);assert.match(a.text('resultadoGas'),/SIMULADOS/);
 assert.equal(a.run('borradorCroquis.aplicado'),true);a.run('incorporarCroquis()');assert.equal(a.run('tramos.length'),1);
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
 b.run("abrir('gas');incorporarCroquis()");const c=app(b.saved());c.run("abrir('gas')");assert.equal(c.run('tramos.length'),0);c.run("seleccionarAmbitoGas('demostracion');incorporarCroquis()");assert.equal(c.run('tramos.length'),1);
});
test('puede descartar un tramo o accesorio y corregir el resto antes de incorporar',()=>{
 const a=app();ejemploRevisado(a);a.run('borradorCroquis.tramos[0].incluir=false;incorporarCroquis()');assert.equal(a.run('tramos.length'),0);assert.match(a.text('mensajeCroquis'),/Seleccioná/);
 a.run("borradorCroquis.tramos[0].incluir=true;borradorCroquis.tramos[0].accesorios[0].incluir=false;borradorCroquis.tramos[0].campos.metrosFinal.valor=12;incorporarCroquis()");
 assert.equal(a.run('tramos.length'),1);assert.equal(a.run('tramos[0].detalle.accesorios.length'),3);
});
test('rechaza tees duplicadas sin modificar datos reales ni importar parcialmente',()=>{
 const a=app();ejemploRevisado(a);
 a.run("espacioDemostracionGas().tramos.push({desde:'X',hasta:'Y',metros:6,diametro:'3/4\"',consumo:1,detalle:{estado:'completo',metrosFinal:0,accesorios:[{tipo:'tee',metrosAntes:6,salida:'3/4\"',ramal:'1/2\"',nodo:'DEMO-T1'}]}});incorporarCroquis()");
 assert.equal(a.run('tramos.length'),0);assert.equal(a.run('espacioDemostracionGas().tramos.length'),1);assert.equal(a.run('artefactos.length'),0);assert.match(a.text('mensajeCroquis'),/repetida/);
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
 const b=app(a.saved());b.run("abrir('gas');seleccionarAmbitoGas('demostracion')");assert.equal(b.run('borradorCroquis.origen'),'prueba-gemini');assert.equal(b.run('borradorCroquis.aplicado'),true);
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
 a.run("ejecutarClaseMiRedGas();guardarDatos()");assert.ok(a.elements.get('informeClaseMiRed').children.length>0);assert.equal(a.run('proyectos.gas.derivadosGas.resultado.estado'),'bloqueado');
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

test('plan materiales: ejercicio conserva cantidades físicas 17 codos, una tee y dos llaves',()=>{
 const a=app();a.run("abrir('gas');generarPlanGas('ejemplo')");const r=a.run('revisionMaterialesGas.plan');const q=tipo=>r.filas.filter(f=>f.tipo===tipo).reduce((n,f)=>n+(f.cantidad||0),0);
 assert.equal(q('codo90'),17);assert.equal(q('tee'),1);assert.equal(q('llave'),2);assert.deepEqual(Array.from(r.planes,g=>g.minimoTeorico),[7,2]);assert.ok(r.planes.every(g=>g.compraEstimada===null&&g.cuplasPropuestas===null));assert.equal(a.run('tramos.length'),0);assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
});
test('plan materiales: opciones por tee evitan reducciones duplicadas y dejan el cambio pendiente por defecto',()=>{
 const a=app();a.run("abrir('gas');generarPlanGas('ejemplo')");assert.equal(a.run("revisionMaterialesGas.plan.filas.filter(f=>f.tipo==='reduccion-pendiente').length"),1);
 a.run("datosPlanGas().opciones.uniones={A:'tee-igual-reduccion'};datosPlanGas().opciones.unionesEjemplo={A:'tee-reductora'};generarPlanGas('ejemplo')");assert.equal(a.run("revisionMaterialesGas.plan.filas.filter(f=>f.tipo==='reduccion').length"),0);assert.equal(a.run('datosPlanGas().opciones.uniones.A'),'tee-igual-reduccion');
 a.run("datosPlanGas().opciones.unionesEjemplo={A:'tee-igual-reduccion'};generarPlanGas('ejemplo')");assert.equal(a.run("revisionMaterialesGas.plan.filas.filter(f=>f.tipo==='reduccion').length"),1);assert.equal(a.run("revisionMaterialesGas.plan.filas.filter(f=>f.tipo==='tee').length"),1);
});
function proyectoPlan(a){a.run("abrir('gas');instalacionGas.perfil.material='Acero epoxi';instalacionGas.perfil.sistema='Roscado';tramos=[{id:'t',desde:'M',hasta:'A',metros:12,diametro:'1\"',consumo:null,detalle:{estado:'ninguno'}}];generarPlanGas('proyecto')");}
test('plan materiales: largo comercial persiste sin cambiar el cálculo anterior de 6 m',()=>{
 const a=app();proyectoPlan(a);a.elements.get('matLargo').value='5';a.run('guardarOpcionesMaterialesGas();generarPlanGas()');assert.equal(a.run('revisionMaterialesGas.plan.planes[0].compraEstimada'),3);assert.equal(a.run('evaluarTramo(tramos[0]).tiras'),2);
 const b=app(a.saved());b.run("abrir('gas');abrirPlanGas();generarPlanGas()");assert.equal(b.elements.get('matLargo').value,5);assert.equal(b.run('revisionMaterialesGas.plan.planes[0].cuplasPropuestas'),2);
});
test('plan materiales: revisar, ajustar cantidad y recargar conserva revisión sin alterar tramos',()=>{
 const a=app();proyectoPlan(a);const card=a.elements.get('matResultado').children.find(n=>n.className==='gas-materiales-tarjetas').children[0];const qty=descendientesPresentacion(card).find(n=>n.type==='number');qty.value='4';qty.onchange();
 assert.equal(a.run('revisionMaterialesGas.plan.filas[0].cantidad'),4);assert.equal(a.run('revisionMaterialesGas.plan.filas[0].estado'),'estimado');assert.equal(a.run('tramos[0].metros'),12);
 a.run('revisionMaterialesGas.plan.filas.forEach(f=>f.revisado=true);guardarRevisionMaterialesGas()');const b=app(a.saved());b.run("abrir('gas');generarPlanGas()");assert.equal(b.run('revisionMaterialesGas.plan.filas[0].cantidad'),4);assert.equal(b.run('revisionMaterialesGas.plan.filas[0].cantidadCalculada'),2);assert.ok(b.run('revisionMaterialesGas.plan.filas.every(f=>f.revisado)'));
});
test('plan materiales: cambio de datos invalida revisión y evita salida desactualizada',()=>{
 const a=app();proyectoPlan(a);a.run('revisionMaterialesGas.plan.filas.forEach(f=>f.revisado=true);guardarRevisionMaterialesGas();tramos[0].metros=13;guardarDatos()');assert.equal(a.run('revisionMaterialesGas.plan.filas[0].cantidad'),3);assert.equal(a.run('prepararSalidaMaterialesGas()'),null);assert.ok(a.run('datosPlanGas().respaldos.length')>0);assert.match(a.text('matMensaje'),/Revisá/);
});
test('plan materiales: impresión y exportación exigen revisión explícita',()=>{
 const a=app();proyectoPlan(a);let prints=0;a.ctx.window.print=()=>prints++;assert.equal(a.run('prepararSalidaMaterialesGas()'),null);a.run('imprimirMaterialesGas()');assert.equal(prints,0);
 a.run('revisionMaterialesGas.plan.filas.forEach(f=>f.revisado=true);imprimirMaterialesGas()');assert.equal(prints,1);assert.ok(a.run('prepararSalidaMaterialesGas()'));a.ctx.window.afterprint();
});
test('plan materiales: desconocidos permanecen pendientes aunque la fila se haya revisado',()=>{
 const a=app();a.run("abrir('gas');generarPlanGas('ejemplo');revisionMaterialesGas.plan.filas.forEach(f=>f.revisado=true)");const r=a.run('prepararSalidaMaterialesGas()');assert.ok(r);assert.ok(r.plan.filas.some(f=>f.cantidad===null));assert.equal(r.plan.dimensionamientoDefinitivo,false);
});
test('plan materiales: reconoce otro accesorio manual y evita añadirlo al ejemplo ajeno',()=>{
 const a=app();proyectoPlan(a);for(const [k,v]of Object.entries({matExtraNombre:'Unión doble',matExtraCantidad:'2',matExtraDiametro:'1"',matExtraUbicacion:'A'}))a.elements.get(k).value=v;a.elements.get('matExtraConfirmado').checked=true;a.run('agregarExtraMaterialGas()');assert.equal(a.run("revisionMaterialesGas.plan.filas.find(f=>f.tipo==='Unión doble').cantidad"),2);
 a.run("generarPlanGas('ejemplo');agregarExtraMaterialGas()");assert.match(a.text('matMensaje'),/Mi proyecto/);assert.equal(a.run('datosPlanGas().extras.length'),1);
});
test('plan materiales: llave genérica y detallada se cuentan una sola vez, y ubicación desconocida bloquea cuplas',()=>{
 const a=app();proyectoPlan(a);a.run("tramos[0].llave=true;tramos[0].detalle={estado:'completo',metrosFinal:6,accesorios:[{tipo:'llave',metrosAntes:6,salida:'1\"'}]};generarPlanGas()");assert.equal(a.run("revisionMaterialesGas.plan.filas.filter(f=>f.tipo==='llave').reduce((n,f)=>n+f.cantidad,0)"),1);
 a.run("tramos[0].detalle={estado:'ninguno'};generarPlanGas()");assert.equal(a.run('revisionMaterialesGas.plan.planes[0].cuplasPropuestas'),null);
 a.run("tramos[0].llave=false;tramos[0].detalle={estado:'pendiente',accesorios:[{tipo:'codo90'}]};generarPlanGas()");assert.equal(a.run("revisionMaterialesGas.plan.filas.find(f=>f.tipo==='codo90').cantidad"),1);assert.equal(a.run("revisionMaterialesGas.plan.filas.find(f=>f.tipo==='codo90').estado"),'estimado');
});
test('plan materiales: otros módulos, fotografías y motor siguen separados del nuevo plan',()=>{
 const a=app();proyectoPlan(a);a.run("proyectos.gas.foto='data:image/png;base64,x';guardarDatos();generarPlanGas('ejemplo')");assert.equal(a.run('proyectos.gas.foto'),'data:image/png;base64,x');for(const m of ['agua','cloacas']){a.run(`abrir('${m}')`);assert.equal(a.elements.get('formularioGas').classList.hidden,true);}assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
});
test('plan materiales: CSV descargado conserva estados, pendientes y advertencias después de revisión',()=>{
 const a=app();a.run("abrir('gas');generarPlanGas('ejemplo');revisionMaterialesGas.plan.filas.forEach(f=>f.revisado=true)");let texto='',clicks=0;const crear=a.ctx.document.createElement;
 a.ctx.Blob=class{constructor(partes){texto=partes.join('');}};a.ctx.URL.createObjectURL=()=> 'blob:prueba';a.ctx.setTimeout=fn=>fn();a.ctx.document.createElement=()=>{const e=crear();e.click=()=>clicks++;return e;};
 a.run('descargarMaterialesGas()');assert.equal(clicks,1);assert.match(texto,/NO DEFINITIVA/);assert.match(texto,/PENDIENTE/);assert.match(texto,/estimado/);assert.match(texto,/cantidad|Cantidad/);assert.match(texto,/M-A/);assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
});

test('aislamiento: migra simulados antiguos conservando originales, nodos y copia recuperable',()=>{
 const a=app();a.run("abrir('gas');tramos=[{desde:'10',hasta:'5',metros:6,diametro:null,consumo:null,red:{desde:'m',hasta:'a'}},{desde:'DEMO-M',hasta:'DEMO-A',metros:12,diametro:null,consumo:null,origen:{tipo:'simulado'},red:{desde:'dm',hasta:'da'}}];artefactos=[{id:'real',nombre:'Cocina',consumo:1000},{id:'sim',nombre:'Demo',consumo:2000,origen:{tipo:'simulado'}}];instalacionGas.nodos=[{id:'m',nombre:'M',tipo:'medidor'},{id:'a',nombre:'A',tipo:'derivacion'},{id:'dm',nombre:'DM',tipo:'medidor'},{id:'da',nombre:'DA',tipo:'artefacto',artefactoId:'sim'}];guardarDatos()");
 const b=app(a.saved());b.run("abrir('gas');guardarDatos()");const g=JSON.parse(b.saved()).gas;
 assert.equal(g.tramos.length,1);assert.equal(g.tramos[0].desde,'10');assert.equal(g.demostracion.tramos.length,1);assert.equal(g.demostracion.artefactos.length,1);assert.equal(g.copiaAntesSepararDemostraciones.tramos.length,2);assert.equal(g.copiaAntesSepararDemostraciones.instalacion.nodos.length,4);assert.equal(g.instalacion.nodos.length,2);
 const c=app(b.saved());c.run("abrir('gas');guardarDatos()");assert.equal(JSON.parse(c.saved()).gas.demostracion.tramos.length,1);
});
test('aislamiento: un nombre DEMO manual no basta para mover datos',()=>{
 const a=app();a.run("abrir('gas');tramos=[{desde:'DEMO-M',hasta:'A',metros:6,diametro:null,consumo:null}];guardarDatos()");const b=app(a.saved());assert.equal(b.run('tramos.length'),1);assert.equal(b.run('proyectos.gas.copiaAntesSepararDemostraciones'),undefined);
});
test('aislamiento: notas y fotos de proyecto, demostración, AGUA y CLOACAS sobreviven separados',()=>{
 const a=app();a.run("abrir('gas');proyectoGasActual().foto='data:image/png;base64,REAL'");a.elements.get('duda').value='Nota real';a.run("seleccionarAmbitoGas('demostracion');proyectoGasActual().foto='data:image/png;base64,DEMO'");a.elements.get('duda').value='Nota práctica';a.run("seleccionarAmbitoGas('proyecto');mostrarFotoLocal()");assert.equal(a.run('fotoURL'),'data:image/png;base64,REAL');assert.equal(a.elements.get('duda').value,'Nota real');
 for(const m of ['agua','cloacas']){a.run(`abrir('${m}')`);a.elements.get('duda').value=m;a.run('guardarDatos()');assert.equal(a.run('fotoURL'),null);}
 const b=app(a.saved());b.run("abrir('gas');seleccionarAmbitoGas('demostracion')");assert.equal(b.elements.get('duda').value,'Nota práctica');assert.equal(b.run('fotoURL'),'data:image/png;base64,DEMO');
});
test('aislamiento: carga y confirmación de ejemplo conservan el proyecto sin agregarle práctica',()=>{
 const a=app();ejemploRevisado(a);assert.equal(a.run('tramos.length'),0);a.run('incorporarCroquis()');assert.equal(a.run('ambitoGas'),'demostracion');assert.equal(a.run('proyectos.gas.tramos.length'),0);a.run("seleccionarAmbitoGas('proyecto');guardarDatos()");assert.equal(a.run('tramos.length'),0);const b=app(a.saved());assert.equal(b.run('tramos.length'),0);assert.equal(b.run('proyectos.gas.demostracion.tramos.length'),1);
});
test('informe: imprime datos de GAS sin copiar formularios, botones, Gemini ni plano vacío',()=>{
 const a=app();proyectoPlan(a);a.elements.get('duda').value='Observación <script>alert(1)</script>';a.ctx.window.beforeprint();const doc=a.elements.get('informeImpresion').innerHTML;
 assert.match(doc,/Materiales para revisión/);assert.match(doc,/Observación &lt;script&gt;/);assert.match(doc,/BLOQUEADOS/);assert.doesNotMatch(doc,/<(?:input|button|select|textarea|script)\b|Gemini|<h2>Plano/);assert.match(html,/@page\{size:A4;margin:12mm\}/);assert.match(html,/body > :not\(#informeImpresion\)/);assert.match(html,/thead\{display:table-header-group\}/);
});
test('informe: AGUA y CLOACAS no contienen tramos o materiales de GAS ni notas de otra especialidad',()=>{
 const a=app();proyectoPlan(a);a.elements.get('duda').value='NOTA-GAS-PRIVADA';
 for(const m of ['agua','cloacas']){a.run(`abrir('${m}')`);a.elements.get('duda').value='NOTA-'+m;a.run('prepararInformeActual()');const doc=a.elements.get('informeImpresion').innerHTML;assert.match(doc,new RegExp('NOTA-'+m));assert.doesNotMatch(doc,/NOTA-GAS-PRIVADA|Materiales para revisión|<h2>Tramos/);}
});
test('informe: vista del ejemplo calefón no contamina la impresión del proyecto activo',()=>{
 const a=app();proyectoPlan(a);a.run("generarPlanGas('ejemplo');prepararInformeActual()");const doc=a.elements.get('informeImpresion').innerHTML;assert.doesNotMatch(doc,/Calefón|Cocina|calefón/);assert.match(doc,/MI PROYECTO/);assert.equal(a.run('fuenteMaterialesGas'),'ejemplo');
});
test('informe: demostración tiene título propio y no imprime los datos reales',()=>{
 const a=app();a.run("abrir('gas');tramos=[{desde:'REAL-10',hasta:'5',metros:6,diametro:null,consumo:null}];guardarDatos()");ejemploRevisado(a);a.run('incorporarCroquis();prepararInformeActual()');const doc=a.elements.get('informeImpresion').innerHTML;assert.match(doc,/DEMOSTRACIÓN/);assert.match(doc,/DEMO-M/);assert.doesNotMatch(doc,/REAL-10/);
});
test('informe: conserva cantidad manual revisada al recargar y no modifica su guardado',()=>{
 const a=app();proyectoPlan(a);a.run('revisionMaterialesGas.plan.filas[0].cantidad=0;revisionMaterialesGas.plan.filas[0].editado=true;revisionMaterialesGas.plan.filas[0].revisado=true;guardarRevisionMaterialesGas()');const b=app(a.saved());b.run("abrir('gas')");const antes=b.saved();const d=b.run('modeloInformeActual()');assert.equal(d.filas[0].cantidad,0);assert.equal(d.filas[0].revisado,true);assert.equal(d.filas[0].estado,'estimado');assert.equal(b.saved(),antes);
});
test('informe: un pendiente revisado permanece distinto de cero y confirmado',()=>{
 const {documento}=require('../informes/documento-proyecto.js');const doc=documento({titulo:'GAS',ambito:'MI PROYECTO',tramos:[],artefactos:[],filas:[{material:'Cupla',diametro:'1"',cantidad:null,unidad:'u',estado:'estimado',revisado:true},{material:'Codo',diametro:'1"',cantidad:0,unidad:'u',estado:'confirmado',revisado:true}],observaciones:'',advertencia:'Bloqueado'});assert.match(doc,/PENDIENTE · Revisado/);assert.match(doc,/>0<\/td>/);assert.match(doc,/CONFIRMADO · Revisado/);
});
test('informe: impide imprimir el ejemplo separado como si fuera el proyecto',()=>{
 const a=app();a.run("abrir('gas');generarPlanGas('ejemplo');revisionMaterialesGas.plan.filas.forEach(f=>f.revisado=true)");let n=0;a.ctx.window.print=()=>n++;a.run('imprimirMaterialesGas()');assert.equal(n,0);assert.match(a.text('matMensaje'),/ejemplo es una vista separada/);
});
test('aislamiento: perfiles y editor de nodos cambian junto con el espacio activo',()=>{
 const a=app();a.run("abrir('gas');instalacionGas.perfil.localidad='REAL';guardarDatos();editandoNodoGas='anterior';seleccionarAmbitoGas('demostracion')");assert.equal(a.elements.get('redLocalidad').value,'');assert.equal(a.run('editandoNodoGas'),null);a.elements.get('redLocalidad').value='PRÁCTICA';a.run("guardarPerfilGas();seleccionarAmbitoGas('proyecto')");assert.equal(a.elements.get('redLocalidad').value,'REAL');assert.equal(a.run('instalacionGas.perfil.localidad'),'REAL');
});
test('aislamiento: una lectura de foto demorada no escribe en el espacio recién seleccionado',()=>{
 const a=app();a.run("abrir('gas')");let lector;a.ctx.URL.createObjectURL=()=> 'blob:foto';a.ctx.FileReader=class{constructor(){lector=this;}readAsDataURL(){}};
 a.ctx.evento={target:{files:[{type:'image/png',size:10}]}};a.run("cargarFoto(evento);seleccionarAmbitoGas('demostracion')");lector.result='data:image/png;base64,TARDÍA';lector.onload();assert.equal(a.run('proyectos.gas.demostracion.foto'),undefined);assert.equal(a.run('proyectos.gas.foto'),'data:image/png;base64,TARDÍA');
});

test('Android: index autónomo contiene exactamente las once fuentes locales, sin solicitudes de scripts',()=>{
 const bloques=[...html.matchAll(/<script data-local="([^"]+)">\n([\s\S]*?)\n<\/script>/g)];assert.equal(bloques.length,11);assert.doesNotMatch(html,/<script\s+src=/i);
 for(const [,ruta,codigo]of bloques)assert.equal(codigo,fs.readFileSync(ruta,'utf8'),ruta);
});
test('Android: ejecuta los scripts incorporados y navega todas las especialidades sin archivos vecinos',()=>{
 const a=app(null,{embebido:true});for(const m of ['gas','agua','cloacas','gas']){a.run(`abrir('${m}')`);assert.equal(a.run('modulo'),m);assert.equal(a.elements.get('inicio').classList.hidden,true);assert.equal(a.elements.get('trabajo').classList.hidden,false);assert.equal(a.elements.get('formularioGas').classList.hidden,m!=='gas');a.run('volver()');assert.equal(a.elements.get('inicio').classList.hidden,false);}
});
test('Android: SecurityError al acceder a localStorage no impide navegar ni imprimir',()=>{
 const a=app(null,{embebido:true,storageGetter:true});assert.match(a.text('estadoGuardado'),/SecurityError/);
 for(const m of ['gas','agua','cloacas']){a.run(`abrir('${m}');guardarDatos();prepararInformeActual()`);assert.equal(a.run('modulo'),m);assert.equal(a.elements.get('trabajo').classList.hidden,false);assert.match(a.elements.get('informeImpresion').innerHTML,new RegExp(m.toUpperCase()));}assert.equal(a.saved(),undefined);
});
test('Android: lectura bloqueada no impide la carga manual ni aislamiento de ejemplos en memoria',()=>{
 const a=app(null,{embebido:true,blocked:true});ejemploRevisado(a);a.run('incorporarCroquis()');assert.equal(a.run('ambitoGas'),'demostracion');assert.equal(a.run('tramos.length'),1);a.run("seleccionarAmbitoGas('proyecto')");assert.equal(a.run('tramos.length'),0);assert.equal(a.saved(),undefined);assert.match(a.text('estadoGuardado'),/No se pudo guardar/);
});
test('Android: JSON dañado queda intacto aunque el almacenamiento permita escribir',()=>{
 const original='{JSON anterior ilegible';const a=app(original,{embebido:true});for(const m of ['gas','agua','cloacas'])a.run(`abrir('${m}');guardarDatos()`);assert.equal(a.saved(),original);assert.equal(a.run('persistenciaHabilitada'),false);
});
test('Android: estructura desconocida queda intacta y permite volver a GAS',()=>{
 const original=JSON.stringify({gas:17,agua:{},cloacas:{},extra:'conservar'});const a=app(original,{embebido:true});a.run("abrir('gas');abrir('agua');abrir('gas');guardarDatos()");assert.equal(a.saved(),original);assert.equal(a.run('modulo'),'gas');
});
test('Android: fallo solo de escritura conserva proyectos y cambios nuevos en memoria',()=>{
 const a=app();proyectoPlan(a);a.run('guardarDatos()');const original=a.saved();const b=app(original,{embebido:true,soloLectura:true});b.run("abrir('gas');tramos[0].metros=15;guardarDatos();abrir('agua');abrir('gas');prepararInformeActual()");assert.equal(b.saved(),original);assert.equal(b.run('tramos[0].metros'),15);assert.match(b.elements.get('informeImpresion').innerHTML,/>15<\/td>/);assert.match(b.text('estadoGuardado'),/No se pudo guardar/);
});
test('Android: cargar una versión válida no escribe ni migra el disco al iniciar o abrir GAS',()=>{
 const a=app();proyectoPlan(a);a.run('guardarDatos()');const original=a.saved();const b=app(original,{embebido:true});b.run("abrir('gas')");assert.equal(b.saved(),original);assert.equal(b.run('tramos.length'),1);
});
test('Android: fallo de inicialización se distingue del almacenamiento y conserva el original',()=>{
 const original=JSON.stringify({gas:{tramos:[{desde:'D',hasta:'E',metros:6,diametro:null,consumo:null,origen:{tipo:'simulado'}}],demostracion:{instalacion:{nodos:null}}},agua:{},cloacas:{}});
 const a=app(original,{embebido:true});assert.match(a.text('estadoGuardado'),/Error al inicializar el proyecto/);a.run("abrir('gas');abrir('agua');guardarDatos()");assert.equal(a.saved(),original);assert.equal(a.run('modulo'),'agua');
});
test('Android: falta de cuota no elimina la fotografía previamente guardada',()=>{
 const a=app();a.run("abrir('gas');proyectos.gas.foto='data:image/png;base64,ANTERIOR';guardarDatos()");const b=app(a.saved(),{embebido:true,quota:1500});b.run("abrir('gas');proyectos.gas.foto='data:image/png;base64,'+'x'.repeat(5000)");b.elements.get('duda').value='Nueva aclaración';b.run('guardarDatos()');const g=JSON.parse(b.saved()).gas;assert.equal(g.foto,'data:image/png;base64,ANTERIOR');assert.equal(g.aclaracion,'Nueva aclaración');assert.match(b.text('estadoGuardado'),/fotos solo quedan en esta sesión/);
});

test('entrega: seis encabezados exactos y ordenados, sin operaciones ni controles',()=>{
 const a=app(null,{embebido:true});proyectoPlan(a);a.run('prepararInformeActual()');const doc=a.elements.get('informeImpresion').innerHTML;
 const cab=['TRAMO','REAL (m)','EQUIVALENTE (m)','DEFINITIVO (m)','CONSUMO (m³/h)','DIÁMETRO'];assert.ok(doc.includes('<tr>'+cab.map(x=>'<th>'+x+'</th>').join('')+'</tr>'));
 assert.doesNotMatch(doc,/<(?:button|input|textarea|select)\b|Iteración|semilla|fase inicial|<h2>Plano/);assert.match(doc,/Pendiente/);assert.match(doc,/BLOQUEADOS/);
});
test('entrega: definitivo toma longitudDeCalculo del motor, nunca la longitud equivalente local',()=>{
 const {planilla}=require('../informes/documento-proyecto.js');
 const ts=[{id:'t',desde:'M',hasta:'A',metros:19,diametro:null}];
 // Datos sintéticos exclusivos para verificar el mapeo de campos; no son validación técnica.
 const r={estado:'calculado',convergencia:true,prueba:false,porTramo:{t:{longitudEquivalenteAccesorios:4,longitudDefinitiva:23,longitudDeCalculo:51.25,caudal:2}}};
 const p=planilla(ts,r,{caudalAplicable:true})[0];assert.equal(p.real,19);assert.equal(p.equivalente,4);assert.equal(p.definitivo,51.25);assert.notEqual(p.definitivo,p.real+p.equivalente);assert.equal(p.consumo,2);assert.equal(p.diametro,'Pendiente');
});
test('entrega: motor real bloqueado entrega consumo acumulado sin copiar el consumo manual ni ejercicio',()=>{
 const a=app();redEjemplo(a);a.run("instalacionGas.perfil.poderCalorifico='9300';tramos.forEach(t=>t.diametro=null)");const d=a.run('modeloInformeActual()');
 assert.equal(d.planilla[0].consumo,13000/9300);assert.equal(d.planilla[1].consumo,9000/9300);assert.equal(d.planilla[2].consumo,4000/9300);
 for(const t of d.planilla){assert.equal(t.equivalente,null);assert.equal(t.definitivo,null);assert.equal(t.diametro,'Pendiente');}assert.equal(d.planilla[0].real,6);assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
});
test('entrega: caudal sin poder calorífico aplicable o con conexiones incorrectas queda pendiente',()=>{
 const a=app();redEjemplo(a);assert.ok(a.run('modeloInformeActual().planilla.every(t=>t.consumo===null)'));
 a.run("instalacionGas.perfil.poderCalorifico='9300';tramos[0].red.hasta='inexistente'");assert.ok(a.run('modeloInformeActual().planilla.every(t=>t.consumo===null)'));
});
test('entrega: resultados de ensayo o diagnóstico y semillas parciales no se presentan como definitivos',()=>{
 const {planilla}=require('../informes/documento-proyecto.js');const t=[{id:'t',desde:'M',hasta:'A',metros:2}];
 for(const [estado,prueba,convergencia]of [['diagnostico-educativo',true,true],['bloqueado',false,false],['calculado',true,true],['calculado',false,false]]){
  const p=planilla(t,{estado,prueba,convergencia,porTramo:{t:{longitudEquivalenteAccesorios:7,longitudDeCalculo:99,diametroCalculado:'1"'}}})[0];assert.equal(p.equivalente,null);assert.equal(p.definitivo,null);assert.equal(p.diametro,'Pendiente');
 }
});
test('entrega: diámetros manuales se conservan identificados sin habilitar medidas automáticas',()=>{
 const a=app();proyectoPlan(a);const p=a.run('modeloInformeActual().planilla[0]');assert.equal(p.diametro,'1" (manual; no validado)');assert.equal(a.run('tramos[0].diametro'),'1"');
});
test('entrega: agrupa por material, tipo, diámetro y estado, sin mezclar pendientes ni medidas',()=>{
 const {agruparMateriales}=require('../informes/documento-proyecto.js');
 const f=(cantidad,diametro,estado,ubicacion)=>({tipo:'codo90',material:'Codo 90°',unidad:'u',cantidad,diametro,estado,ubicacion,revisado:true});
 const r=agruparMateriales([f(5,'1"','confirmado','M-A'),f(7,'1"','confirmado','A-C'),f(2,'1"','estimado','B'),f(null,'1"','estimado','C'),f(0,'3/4"','confirmado','D'),f(3,'Pendiente','confirmado','E')]);
 assert.equal(r.find(g=>g.estado==='confirmado'&&g.diametro==='1"').cantidad,12);assert.equal(r.find(g=>g.estado==='estimado').cantidad,2);assert.equal(r.find(g=>g.estado==='pendiente'&&g.diametro==='1"').cantidad,null);assert.equal(r.find(g=>g.diametro==='3/4"').cantidad,0);assert.equal(r.find(g=>g.diametro==='Pendiente').estado,'pendiente');
});
test('entrega: dos pendientes agrupados no se suman a una cantidad de compra ficticia',()=>{
 const {agruparMateriales}=require('../informes/documento-proyecto.js');const f={tipo:'cupla-plan',material:'Cuplas',diametro:'1"',cantidad:null,unidad:'u',estado:'estimado'};const r=agruparMateriales([{...f,ubicacion:'A'},{...f,ubicacion:'B'}]);assert.equal(r.length,1);assert.equal(r[0].cantidad,null);assert.deepEqual(r[0].ubicaciones,['A','B']);
});
test('entrega: ajustes manuales agrupados no mutan la revisión, el CSV o el proyecto',()=>{
 const a=app();proyectoPlan(a);a.run('revisionMaterialesGas.plan.filas[0].cantidad=4;revisionMaterialesGas.plan.filas[0].editado=true;revisionMaterialesGas.plan.filas[0].revisado=true;guardarRevisionMaterialesGas()');const antes=a.saved();const d=a.run('modeloInformeActual()');assert.equal(d.materialesAgrupados.find(f=>f.material.startsWith('Caño')).cantidad,4);assert.equal(d.materialesAgrupados.find(f=>f.material.startsWith('Caño')).estado,'estimado');assert.equal(a.saved(),antes);assert.equal(a.run('revisionMaterialesGas.plan.filas[0].cantidad'),4);
});
test('entrega: sin foto, red válida o confirmación explícita no incluye un croquis supuesto',()=>{
 const a=app();redEjemplo(a);assert.equal(a.run('modeloInformeActual().croquis'),undefined);a.run("proyectos.gas.foto='data:image/png;base64,CROQUIS';mostrarFotoLocal();actualizarVistaEntregaGas()");assert.equal(a.run('croquisEntregaDisponible()'),true);assert.equal(a.run('modeloInformeActual().croquis.confirmado'),false);assert.equal(a.elements.get('entregaCroquisConfirmado').checked,false);
 a.run("tramos[0].red.hasta='desconectado';actualizarVistaEntregaGas()");assert.equal(a.elements.get('entregaCroquisConfirmado').disabled,false);
});
test('entrega: croquis confirmado se imprime sin inventar geometría y se conserva al recargar',()=>{
 const a=app();redEjemplo(a);a.run("proyectos.gas.foto='data:image/png;base64,CROQUIS';mostrarFotoLocal()");a.elements.get('entregaCroquisConfirmado').checked=true;a.run('confirmarCroquisEntrega();prepararInformeActual()');const doc=a.elements.get('informeImpresion').innerHTML;assert.match(doc,/<img src="data:image\/png;base64,CROQUIS"/);assert.match(doc,/Sin escala verificada/);assert.doesNotMatch(doc,/<svg|<canvas/);
 const b=app(a.saved());b.run("abrir('gas')");assert.equal(b.run('modeloInformeActual().croquis.url'),'data:image/png;base64,CROQUIS');assert.equal(b.elements.get('entregaCroquisConfirmado').checked,true);
});
test('entrega: cambio de foto, tramo o artefacto invalida la confirmación gráfica',()=>{
 for(const cambio of ["tramos[0].metros=7","artefactos[0].consumo=10000","proyectos.gas.foto='data:image/png;base64,OTRA';mostrarFotoLocal()"]){
  const a=app();redEjemplo(a);a.run("proyectos.gas.foto='data:image/png;base64,CROQUIS';mostrarFotoLocal()");a.elements.get('entregaCroquisConfirmado').checked=true;a.run('confirmarCroquisEntrega();'+cambio);assert.equal(a.run('modeloInformeActual().croquis.confirmado'),false);
 }
});
test('entrega: imagen confirmada del proyecto no pasa a demostración, AGUA ni CLOACAS',()=>{
 const a=app();redEjemplo(a);a.run("proyectos.gas.foto='data:image/png;base64,REAL';mostrarFotoLocal()");a.elements.get('entregaCroquisConfirmado').checked=true;a.run("confirmarCroquisEntrega();seleccionarAmbitoGas('demostracion')");assert.equal(a.run('modeloInformeActual().croquis'),undefined);assert.equal(a.run('modeloInformeActual().planilla.length'),0);
 for(const m of ['agua','cloacas']){a.run(`abrir('${m}')`);const d=a.run('modeloInformeActual()');assert.equal(d.planilla,undefined);assert.equal(d.croquis,undefined);assert.equal(d.filas.length,0);}
});
test('entrega: preparar el documento no escribe el disco ni muestra resultados de ejemplos abiertos',()=>{
 const a=app();proyectoPlan(a);a.run('guardarDatos()');const antes=a.saved();a.run("probarMetodoClaseGas();generarPlanGas('ejemplo');prepararInformeActual()");assert.equal(a.saved(),antes);const doc=a.elements.get('informeImpresion').innerHTML;assert.doesNotMatch(doc,/DEMO|Termotanque|Calefón|Iteración/);
});
test('entrega: confirmación usa la foto persistida y sobrevive al reemplazo del blob de sesión',()=>{
 const a=app();redEjemplo(a);a.run("proyectos.gas.foto='data:image/png;base64,PERSISTIDA';fotoURL='blob:foto-sesion'");a.elements.get('entregaCroquisConfirmado').checked=true;a.run('confirmarCroquisEntrega()');assert.equal(a.run('modeloInformeActual().croquis.url'),'blob:foto-sesion');const b=app(a.saved());b.run("abrir('gas')");assert.equal(b.run('modeloInformeActual().croquis.url'),'data:image/png;base64,PERSISTIDA');
});
test('entrega: guardar cambios quita la confirmación visual sin borrar la foto ni la firma anterior',()=>{
 const a=app();redEjemplo(a);a.run("proyectos.gas.foto='data:image/png;base64,CROQUIS';mostrarFotoLocal()");a.elements.get('entregaCroquisConfirmado').checked=true;a.run('confirmarCroquisEntrega();tramos[0].metros=7;guardarDatos()');assert.equal(a.elements.get('entregaCroquisConfirmado').checked,false);assert.equal(a.run('proyectos.gas.foto'),'data:image/png;base64,CROQUIS');assert.ok(a.run('proyectos.gas.entregaGas.firmaCroquis'));assert.equal(a.run('modeloInformeActual().croquis.confirmado'),false);
});
test('entrega: espera a decodificar el croquis antes de abrir la impresión',async()=>{
 const a=app();redEjemplo(a);a.run("proyectos.gas.foto='data:image/png;base64,CROQUIS';mostrarFotoLocal()");a.elements.get('entregaCroquisConfirmado').checked=true;a.run('confirmarCroquisEntrega()');let resolver,n=0;
 a.elements.get('informeImpresion').querySelector=()=>({decode:()=>new Promise(r=>resolver=r)});a.ctx.window.print=()=>{a.ctx.window.beforeprint();n++;};const listo=a.run('imprimirInformeActual()');assert.equal(n,0);resolver();await listo;assert.equal(n,1);
});
test('entrega: una imagen que no puede prepararse no genera silenciosamente un PDF incompleto',async()=>{
 const a=app();proyectoPlan(a);let n=0;a.elements.get('informeImpresion').querySelector=()=>({decode:()=>Promise.reject(Error('Imagen inválida'))});a.ctx.window.print=()=>n++;await a.run('imprimirInformeActual()');assert.equal(n,0);assert.match(a.text('entregaEstado'),/No se pudo preparar la imagen/);
});

test('actualización: agregar, modificar y quitar artefactos recalcula consumos sin otro botón',()=>{
 const a=app();a.run("abrir('gas')");a.elements.get('gp').value='9300';a.run('agregarArtefacto()');assert.match(a.text('resultadoGas'),/1 m³\/h/);a.elements.get('gp').value='18600';a.run('agregarArtefacto()');assert.match(a.text('resultadoGas'),/3 m³\/h/);a.elements.get('listaGas').children[0].children[1].onclick();assert.match(a.text('resultadoGas'),/2 m³\/h/);
});
test('actualización: cambio de longitud recalcula lista y conserva la anterior marcada como respaldo',()=>{
 const a=app();proyectoPlan(a);a.run('guardarDatos();tramos[0].metros=13;guardarDatos()');assert.equal(a.run('revisionMaterialesGas.plan.filas[0].cantidad'),3);const b=a.run('datosPlanGas().respaldos');assert.ok(b.some(r=>r.filas.some(f=>f.tipo==='cano'&&f.cantidad===2)));assert.match(a.elements.get('respaldosGas').children.map(p=>p.textContent).join(' '),/DESACTUALIZADO/);
});
test('actualización: cantidad manual se mantiene, se desconfirma y se persiste con su respaldo',()=>{
 const a=app();proyectoPlan(a);a.run('revisionMaterialesGas.plan.filas[0].cantidad=4;revisionMaterialesGas.plan.filas[0].editado=true;revisionMaterialesGas.plan.filas[0].revisado=true;guardarRevisionMaterialesGas();tramos[0].metros=13;guardarDatos()');assert.equal(a.run('revisionMaterialesGas.plan.filas[0].cantidad'),4);assert.equal(a.run('revisionMaterialesGas.plan.filas[0].cantidadCalculada'),3);assert.equal(a.run('revisionMaterialesGas.plan.filas[0].revisado'),false);assert.equal(a.run('modeloInformeActual().materialesAgrupados.find(f=>f.material.startsWith("Caño")).cantidad'),4);
 const b=app(a.saved());b.run("abrir('gas');generarPlanGas()");assert.equal(b.run('revisionMaterialesGas.plan.filas[0].cantidad'),4);assert.ok(b.run('datosPlanGas().respaldos.some(r=>r.filas.some(f=>f.editado&&f.cantidad===4))'));
});
test('actualización: eliminar un tramo conserva ajustes huérfanos en el respaldo, sin mezclarlos en compra',()=>{
 const a=app();proyectoPlan(a);a.run('revisionMaterialesGas.plan.filas[0].cantidad=8;revisionMaterialesGas.plan.filas[0].editado=true;guardarRevisionMaterialesGas();tramos=[];actualizarTramos()');assert.equal(a.run('modeloInformeActual().filas.length'),0);assert.ok(a.run('datosPlanGas().respaldos.some(r=>r.filas.some(f=>f.editado&&f.cantidad===8))'));assert.match(a.elements.get('respaldosGas').children.map(p=>p.textContent).join(' '),/M–A.*ajuste manual/);
});
test('actualización: un accesorio nuevo no hereda ajustes de otro por reutilizar material-N',()=>{
 const a=app();proyectoPlan(a);a.run("tramos[0].detalle={estado:'completo',metrosFinal:6,accesorios:[{tipo:'codo90',metrosAntes:6,salida:'1\"'}]};guardarDatos();generarPlanGas()");a.run("revisionMaterialesGas.plan.filas.find(f=>f.tipo==='codo90').cantidad=9;revisionMaterialesGas.plan.filas.find(f=>f.tipo==='codo90').editado=true;guardarRevisionMaterialesGas();tramos[0].detalle.accesorios=[{tipo:'codo45',metrosAntes:6,salida:'1\"'}];guardarDatos()");assert.equal(a.run("revisionMaterialesGas.plan.filas.find(f=>f.tipo==='codo45').cantidad"),1);assert.ok(a.run("datosPlanGas().respaldos.some(r=>r.filas.some(f=>f.tipo==='codo90'&&f.cantidad===9))"));
});
test('actualización: cambios de accesorios invalidan la asociación manual aunque coincida índice y tipo',()=>{
 const a=app();proyectoPlan(a);a.run("tramos[0].detalle={estado:'completo',metrosFinal:6,accesorios:[{tipo:'codo90',metrosAntes:6,salida:'1\"'}]};guardarDatos();generarPlanGas();revisionMaterialesGas.plan.filas.find(f=>f.tipo==='codo90').cantidad=9;revisionMaterialesGas.plan.filas.find(f=>f.tipo==='codo90').editado=true;guardarRevisionMaterialesGas();tramos[0].detalle.accesorios[0].metrosAntes=3;tramos[0].detalle.metrosFinal=9;guardarDatos()");
 // Cambio geométrico conservador: la revisión actual exige revisar; originales siguen respaldados.
 assert.ok(a.run('datosPlanGas().respaldos.length')>0);assert.equal(a.run("revisionMaterialesGas.plan.filas.find(f=>f.tipo==='codo90').revisado"),false);
});
test('actualización: entradas inválidas no muestran el último resultado como vigente',()=>{
 const a=app();proyectoPlan(a);a.run('guardarDatos();datosPlanGas().opciones.largoComercial=0;guardarDatos()');assert.equal(a.run('revisionMaterialesGas'),null);assert.match(a.text('matResultado'),/no vigente/);assert.ok(a.run('datosPlanGas().respaldos.length')>0);assert.equal(a.run('prepararSalidaMaterialesGas()'),null);a.run('prepararInformeActual()');assert.match(a.elements.get('informeImpresion').innerHTML,/Materiales: Pendiente/);
});
test('actualización: conserva último resultado válido del motor si la nueva red queda bloqueada',()=>{
 const a=app();redEjemplo(a);a.run("guardarDatos();proyectos.gas.derivadosGas.ultimoValido={firma:'ANTERIOR',resultado:{estado:'calculado',nota:'Respaldo de prueba; no resultado técnico'}};tramos[0].red.hasta='falta';guardarDatos()");assert.equal(a.run('proyectos.gas.derivadosGas.resultado.estado'),'bloqueado');assert.equal(a.run('proyectos.gas.derivadosGas.ultimoValido.firma'),'ANTERIOR');assert.match(a.elements.get('respaldosGas').children.map(x=>x.textContent).join(' '),/DESACTUALIZADO/);
});
test('actualización: respaldos y ajustes están aislados entre proyecto, demostración y otras especialidades',()=>{
 const a=app();proyectoPlan(a);a.run("guardarDatos();tramos[0].metros=13;guardarDatos();seleccionarAmbitoGas('demostracion')");assert.equal(a.run('(datosPlanGas().respaldos||[]).length'),0);assert.doesNotMatch(a.elements.get('respaldosGas').children.map(x=>x.textContent).join(' '),/M–A/);a.run("abrir('agua')");assert.equal(a.run('modeloInformeActual().filas.length'),0);a.run("abrir('gas');seleccionarAmbitoGas('proyecto')");assert.ok(a.run('datosPlanGas().respaldos.length')>0);
});
test('PDF: foto original se incluye sin afirmar que la red fue confirmada',()=>{
 const a=app();a.run("abrir('gas');proyectos.gas.foto='data:image/png;base64,ORIGINAL';mostrarFotoLocal();prepararInformeActual()");const doc=a.elements.get('informeImpresion').innerHTML;assert.match(doc,/Fotografía original del croquis/);assert.match(doc,/data:image\/png;base64,ORIGINAL/);assert.match(doc,/pendiente de confirmar/);assert.doesNotMatch(doc,/Legibilidad y correspondencia confirmadas/);
});
test('PDF: ubicaciones legibles sustituyen IDs sin modificar los identificadores almacenados',()=>{
 const a=app();proyectoPlan(a);a.run('guardarDatos();prepararInformeActual()');const doc=a.elements.get('informeImpresion').innerHTML;assert.match(doc,/M–A/);assert.doesNotMatch(doc,/<td>t<\/td>/);assert.equal(a.run('tramos[0].id'),'t');assert.equal(a.run('datosPlanGas().revisiones.proyecto.filas[0].ubicacion'),'t');assert.equal(a.run("ubicacionLegibleGas('t · accesorio 1, t:0')"),'M–A · accesorio 1, M–A:0');
});
test('PDF: nombres con caracteres especiales e IDs similares no sustituyen fragmentos ajenos',()=>{
 const a=app();proyectoPlan(a);a.run("tramos[0].id='t.1';tramos[0].desde='M<&';tramos[0].hasta='A'");assert.equal(a.run("ubicacionLegibleGas('t.1 · accesorio 1; xt.1; t.10')"),'M<&–A · accesorio 1; xt.1; t.10');a.run('prepararInformeActual()');assert.match(a.elements.get('informeImpresion').innerHTML,/M&lt;&amp;–A/);
});
test('PDF: estados provisionales, confirmados y pendientes siguen separados y sin controles',()=>{
 const a=app();proyectoPlan(a);a.run('guardarDatos();prepararInformeActual()');const doc=a.elements.get('informeImpresion').innerHTML;assert.match(doc,/PROVISIONAL \(ESTIMADO\)/);assert.match(doc,/BLOQUEADOS/);assert.doesNotMatch(doc,/<(?:button|input|select|textarea|details)\b|RESPALDO.*ANTERIOR/);assert.match(doc,/<th>DEFINITIVO \(m\)<\/th>/);
});
test('actualización: HTML autónomo conserva cálculo local con almacenamiento restringido',()=>{
 const a=app(null,{embebido:true,blocked:true});proyectoPlan(a);a.run('guardarDatos();tramos[0].metros=13;guardarDatos()');assert.equal(a.run('revisionMaterialesGas.plan.filas[0].cantidad'),3);assert.ok(a.run('datosPlanGas().respaldos.length')>0);assert.equal(a.saved(),undefined);a.run('prepararInformeActual()');assert.match(a.elements.get('informeImpresion').innerHTML,/>13<\/td>/);
});
test('datos manuales: cancelar el borrado conserva tramo, artefacto y fotografía',()=>{
 const a=app();proyectoPlan(a);a.run("artefactos=[{nombre:'Cocina',consumo:9300}];proyectos.gas.foto='data:image/png;base64,FOTO';renderGas();renderTramos()");a.ctx.window.confirm=()=>false;
 a.elements.get('listaTramos').children[0].children.at(-1).onclick();a.elements.get('listaGas').children[0].children[1].onclick();a.run('quitarFoto()');assert.equal(a.run('tramos.length'),1);assert.equal(a.run('artefactos.length'),1);assert.equal(a.run('proyectos.gas.foto'),'data:image/png;base64,FOTO');
});
test('datos manuales: declarar sin accesorios requiere confirmar la eliminación de los anteriores',()=>{
 const a=app();proyectoPlan(a);a.run("tramos[0].detalle={estado:'completo',metrosFinal:6,accesorios:[{tipo:'codo90',metrosAntes:6,salida:'1\"'}]};abrirAccesorios(0)");a.elements.get('estadoAccesorios').value='ninguno';a.ctx.window.confirm=()=>false;a.run('guardarAccesorios()');assert.equal(a.run('tramos[0].detalle.accesorios.length'),1);
});
test('respaldo: descarga JSON conserva originales, ajustes y demostraciones sin escribir ni enviar datos',()=>{
 const a=app();proyectoPlan(a);a.run('guardarDatos();tramos[0].metros=13;guardarDatos()');const antes=a.saved();let json='',clicks=0;const crear=a.ctx.document.createElement;
 a.ctx.Blob=class{constructor(p){json=p.join('')}};a.ctx.URL.createObjectURL=()=> 'blob:backup';a.ctx.setTimeout=fn=>fn();a.ctx.document.createElement=()=>{const e=crear();e.click=()=>clicks++;return e;};a.run('descargarRespaldoCompleto()');const d=JSON.parse(json);assert.equal(clicks,1);assert.equal(d.formato,'canerias-respaldo-v1');assert.equal(d.proyectos.gas.tramos[0].metros,13);assert.ok(d.proyectos.gas.planCompra.respaldos.length>0);assert.equal(a.saved(),antes);
});

test('casilla Android: con foto y red incompleta permite marcar, desmarcar y ver el estado',()=>{
 const a=app(null,{embebido:true});a.run("abrir('gas');proyectos.gas.foto='data:image/png;base64,FOTO';mostrarFotoLocal()");assert.equal(a.elements.get('entregaCroquisConfirmado').disabled,false);
 a.elements.get('entregaCroquisConfirmado').checked=true;a.run('confirmarCroquisEntrega()');assert.equal(a.elements.get('entregaCroquisConfirmado').checked,true);assert.match(a.text('entregaEstado'),/^CONFIRMADO:/);assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
 a.elements.get('entregaCroquisConfirmado').checked=false;a.run('confirmarCroquisEntrega()');assert.equal(a.elements.get('entregaCroquisConfirmado').checked,false);assert.match(a.text('entregaEstado'),/^SIN CONFIRMAR:/);const b=app(a.saved());b.run("abrir('gas')");assert.equal(b.elements.get('entregaCroquisConfirmado').checked,false);
});
test('casilla Android: confirmación se guarda y se restaura sin exigir red técnica completa',()=>{
 const a=app();a.run("abrir('gas');proyectos.gas.foto='data:image/png;base64,FOTO';mostrarFotoLocal()");a.elements.get('entregaCroquisConfirmado').checked=true;a.run('confirmarCroquisEntrega()');const b=app(a.saved());b.run("abrir('gas');guardarDatos();actualizarVistaEntregaGas()");assert.equal(b.elements.get('entregaCroquisConfirmado').checked,true);assert.match(b.text('entregaEstado'),/^CONFIRMADO:/);
});
test('casilla Android: asignar IDs al guardar no revoca la confirmación recién dada',()=>{
 const a=app();a.run("abrir('gas');tramos=[{desde:'M',hasta:'A',metros:6,diametro:null,consumo:null,detalle:{estado:'ninguno'}}];proyectos.gas.foto='data:image/png;base64,FOTO';mostrarFotoLocal()");a.elements.get('entregaCroquisConfirmado').checked=true;a.run('confirmarCroquisEntrega()');assert.equal(a.elements.get('entregaCroquisConfirmado').checked,true);assert.ok(a.run('tramos[0].id'));const b=app(a.saved());b.run("abrir('gas')");assert.equal(b.elements.get('entregaCroquisConfirmado').checked,true);
});
test('casilla Android: nuevos datos solicitan reconfirmar sin borrar foto ni la firma anterior',()=>{
 const a=app();proyectoPlan(a);a.run("proyectos.gas.foto='data:image/png;base64,FOTO';mostrarFotoLocal()");a.elements.get('entregaCroquisConfirmado').checked=true;a.run('confirmarCroquisEntrega()');const firma=a.run('proyectos.gas.entregaGas.firmaCroquis');a.run('tramos[0].metros=13;guardarDatos()');assert.equal(a.elements.get('entregaCroquisConfirmado').checked,false);assert.equal(a.elements.get('entregaCroquisConfirmado').disabled,false);assert.match(a.text('entregaEstado'),/^NUEVA CONFIRMACIÓN NECESARIA:/);assert.equal(a.run('proyectos.gas.entregaGas.firmaCroquis'),firma);assert.equal(a.run('modeloInformeActual().croquis.confirmado'),false);
});
test('casilla Android: lectura diferida de la misma foto conserva la confirmación al guardar sus bytes',()=>{
 const a=app();a.run("abrir('gas')");let lector;a.ctx.URL.createObjectURL=()=> 'blob:misma-foto';a.ctx.FileReader=class{constructor(){lector=this}readAsDataURL(){}};a.ctx.evento={target:{files:[{type:'image/png',size:10}]}};
 a.run('cargarFoto(evento)');a.elements.get('entregaCroquisConfirmado').checked=true;a.run('confirmarCroquisEntrega()');lector.result='data:image/png;base64,FOTO';lector.onload();assert.equal(a.elements.get('entregaCroquisConfirmado').checked,true);const b=app(a.saved());b.run("abrir('gas')");assert.equal(b.elements.get('entregaCroquisConfirmado').checked,true);
});
test('casilla Android: desmarcar durante la lectura de foto no se revierte al terminar FileReader',()=>{
 const a=app();a.run("abrir('gas')");let lector;a.ctx.URL.createObjectURL=()=> 'blob:foto';a.ctx.FileReader=class{constructor(){lector=this}readAsDataURL(){}};a.ctx.evento={target:{files:[{type:'image/png',size:10}]}};a.run('cargarFoto(evento)');a.elements.get('entregaCroquisConfirmado').checked=true;a.run('confirmarCroquisEntrega()');a.elements.get('entregaCroquisConfirmado').checked=false;a.run('confirmarCroquisEntrega()');lector.result='data:image/png;base64,FOTO';lector.onload();assert.equal(a.elements.get('entregaCroquisConfirmado').checked,false);
});
test('casilla Android: reemplazar foto requiere confirmación nueva aunque la red no cambie',()=>{
 const a=app();a.run("abrir('gas');proyectos.gas.foto='data:image/png;base64,ANTERIOR';mostrarFotoLocal()");a.elements.get('entregaCroquisConfirmado').checked=true;a.run('confirmarCroquisEntrega()');let lector;a.ctx.URL.createObjectURL=()=> 'blob:nueva';a.ctx.FileReader=class{constructor(){lector=this}readAsDataURL(){}};a.ctx.evento={target:{files:[{type:'image/png',size:10}]}};a.run('cargarFoto(evento)');assert.equal(a.elements.get('entregaCroquisConfirmado').checked,false);lector.result='data:image/png;base64,NUEVA';lector.onload();assert.equal(a.elements.get('entregaCroquisConfirmado').checked,false);assert.match(a.text('entregaEstado'),/NUEVA CONFIRMACIÓN/);
});
test('casilla Android: revisar abre foto ampliada y responde visiblemente sin confirmar automáticamente',()=>{
 const a=app();a.run("abrir('gas');proyectos.gas.foto='data:image/png;base64,FOTO';mostrarFotoLocal()");let abierto=0,scroll=0;a.elements.get('visor').showModal=()=>abierto++;a.elements.get('entregaCroquisConfirmado').scrollIntoView=()=>scroll++;a.run("mostrarVista('consumos');revisarCroquisParaEntrega()");assert.equal(abierto,1);assert.equal(scroll,1);assert.equal(a.elements.get('croquis').classList.hidden,false);assert.equal(a.elements.get('imagenGrande').src,'data:image/png;base64,FOTO');assert.match(a.text('entregaAccion'),/Foto abierta/);assert.match(a.text('visorEntregaAyuda'),/Revisá la foto/);assert.equal(a.elements.get('entregaCroquisConfirmado').checked,false);
});
test('casilla Android: sin foto explica bloqueo y dirige al área de carga, sin lanzar error',()=>{
 const a=app();a.run("abrir('gas')");let scroll=0,focus=0;a.elements.get('cargaFotoEntrega').scrollIntoView=()=>scroll++;a.elements.get('cargaFotoEntrega').focus=()=>focus++;a.run('revisarCroquisParaEntrega()');assert.equal(scroll,1);assert.equal(focus,1);assert.equal(a.elements.get('entregaCroquisConfirmado').disabled,true);assert.match(a.text('entregaEstado'),/^SIN FOTO:/);assert.match(a.text('entregaAccion'),/Sacar foto o Galería/);
});
test('casilla Android: sin diálogo disponible ofrece revisión en la imagen existente',()=>{
 const a=app();a.run("abrir('gas');proyectos.gas.foto='data:image/png;base64,FOTO';mostrarFotoLocal()");let scroll=0;a.elements.get('imagen').scrollIntoView=()=>scroll++;a.run('revisarCroquisParaEntrega()');assert.equal(scroll,1);assert.match(a.text('entregaAccion'),/Fotografía localizada/);
});
test('casilla Android: objetivo táctil nativo, etiqueta asociada y avisos accesibles',()=>{
 assert.match(html,/label class="confirmacion-entrega" for="entregaCroquisConfirmado"/);assert.match(html,/id="entregaCroquisConfirmado" type="checkbox" aria-describedby="entregaEstado" onchange="confirmarCroquisEntrega\(\)"/);assert.match(html,/min-height:48px/);assert.match(html,/appearance:auto;width:28px;height:28px/);assert.match(html,/id="entregaEstado" role="status" aria-live="polite"/);
});
test('casilla Android: volver a elegir los mismos bytes como reemplazo exige confirmar de nuevo',()=>{
 const a=app();a.run("abrir('gas');proyectos.gas.foto='data:image/png;base64,MISMA';mostrarFotoLocal()");a.elements.get('entregaCroquisConfirmado').checked=true;a.run('confirmarCroquisEntrega()');let lector;a.ctx.URL.createObjectURL=()=> 'blob:reemplazo';a.ctx.FileReader=class{constructor(){lector=this}readAsDataURL(){}};a.ctx.evento={target:{files:[{type:'image/png',size:10}]}};a.run('cargarFoto(evento)');lector.result='data:image/png;base64,MISMA';lector.onload();assert.equal(a.elements.get('entregaCroquisConfirmado').checked,false);assert.equal(a.run('modeloInformeActual().croquis.confirmado'),false);const b=app(a.saved());b.run("abrir('gas')");assert.equal(b.elements.get('entregaCroquisConfirmado').checked,false);b.elements.get('entregaCroquisConfirmado').checked=true;b.run('confirmarCroquisEntrega()');assert.equal(b.elements.get('entregaCroquisConfirmado').checked,true);
});
test('casilla Android: cancelar reemplazo de foto conserva la confirmación existente',()=>{
 const a=app();a.run("abrir('gas');proyectos.gas.foto='data:image/png;base64,FOTO';mostrarFotoLocal()");a.elements.get('entregaCroquisConfirmado').checked=true;a.run('confirmarCroquisEntrega()');a.ctx.window.confirm=()=>false;a.ctx.evento={target:{files:[{type:'image/png',size:10}]}};a.run('cargarFoto(evento);actualizarVistaEntregaGas()');assert.equal(a.elements.get('entregaCroquisConfirmado').checked,true);assert.equal(a.run('fotoURL'),'data:image/png;base64,FOTO');
});

function redDeteccion(a,{diametro='1"',pendiente=false}={}){
 a.run("abrir('gas')");a.ctx.rawDeteccion=[['M','A',19],['A','B',12],['A','Termo',18],['B','Calefactor',6],['B','Cocina',13]];
 a.ctx.diametroDeteccion=diametro;a.ctx.pendienteDeteccion=pendiente;
 a.run("artefactos=[{id:'art-t',nombre:'Termo',consumo:21950},{id:'art-c',nombre:'Calefactor',consumo:3000},{id:'art-k',nombre:'Cocina',consumo:10250}];tramos=rawDeteccion.map(([desde,hasta,metros],i)=>({id:'d'+i,desde,hasta,metros,diametro:diametroDeteccion,consumo:null,detalle:{estado:pendienteDeteccion?'pendiente':'ninguno',accesorios:[]}}));instalacionGas.perfil.material='Acero epoxi';instalacionGas.perfil.sistema='Roscado'");
}
function registrosDeteccion(a,tipo){return a.run('Object.values(datosDeteccionGas().registros).filter(a=>a.vigente'+(tipo?'&&a.propuesta.tipo==='+JSON.stringify(tipo):'')+')');}
function confirmarDeteccion(a,id,edicion={}){a.ctx.idDetectado=id;a.ctx.edicionDetectada=edicion;a.run("resolverSugerenciaGas(idDetectado,'confirmado',edicionDetectada)");}
test('detección: croquis M-A/B sugiere exactamente tees A y B y llaves de tres artefactos',()=>{
 const a=app(null,{embebido:true});redDeteccion(a);a.run('detectarAccesoriosGas()');assert.deepEqual(Array.from(registrosDeteccion(a,'tee'),r=>r.propuesta.ubicacion).sort(),['A','B']);assert.equal(registrosDeteccion(a,'llave').length,3);assert.equal(a.run('accesoriosDeteccionConfirmadosGas().length'),0);assert.equal(a.run('entradaMaterialesGas().extras.length'),0);assert.match(a.run('modeloInformeActual().resumen.join(" ")'),/sugerencias sin confirmar/);assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
});
test('detección: nombres, fotos o cambios de dirección no inventan codos ni curvas',()=>{
 const a=app();redDeteccion(a,{pendiente:true});a.run('detectarAccesoriosGas()');assert.ok(registrosDeteccion(a).every(r=>!['codo45','codo90','curva'].includes(r.propuesta.tipo)));assert.match(a.run('datosDeteccionGas().avisos.join(" ")'),/codos, curvas y posiciones pendientes/);assert.ok(registrosDeteccion(a,'cupla').every(r=>r.propuesta.cantidad===null));
});
test('detección: pendientes se pueden rechazar sin convertirse en cero ni perder decisión',()=>{
 const a=app();redDeteccion(a,{pendiente:true});a.run('detectarAccesoriosGas()');const r=registrosDeteccion(a,'cupla')[0];a.ctx.idDetectado=r.propuesta.id;a.run("resolverSugerenciaGas(idDetectado,'rechazado',{});guardarDatos()");assert.equal(a.run('datosDeteccionGas().registros[idDetectado].estado'),'rechazado');assert.equal(a.run('datosDeteccionGas().registros[idDetectado].propuesta.cantidad'),null);assert.equal(a.run('accesoriosDeteccionConfirmadosGas().length'),0);
});
test('detección: no incorpora nada hasta confirmar y cada tee física se agrega una sola vez',()=>{
 const a=app();redDeteccion(a);a.run('detectarAccesoriosGas()');const r=registrosDeteccion(a,'tee')[0];confirmarDeteccion(a,r.propuesta.id);assert.equal(a.run('accesoriosDeteccionConfirmadosGas().length'),1);a.run('detectarAccesoriosGas();detectarAccesoriosGas();generarPlanGas()');assert.equal(a.run('revisionMaterialesGas.plan.filas.filter(f=>f.tipo==="tee").reduce((n,f)=>n+f.cantidad,0)'),1);
});
test('detección: tee y llave manuales ya identificadas no se duplican',()=>{
 const a=app();redDeteccion(a);a.run("tramos[0].detalle={estado:'completo',metrosFinal:0,accesorios:[{tipo:'tee',nodo:'A',metrosAntes:19,salida:'1\"',ramal:'1\"'}]};tramos[2].llave=true;detectarAccesoriosGas()");assert.deepEqual(Array.from(registrosDeteccion(a,'tee'),r=>r.propuesta.ubicacion),['B']);assert.equal(registrosDeteccion(a,'llave').length,2);
});
test('detección: una pieza manual nueva sustituye la sugerencia sin borrar su historial',()=>{
 const a=app();redDeteccion(a);a.run('detectarAccesoriosGas()');const r=registrosDeteccion(a,'llave')[0];confirmarDeteccion(a,r.propuesta.id);a.ctx.tLlave=r.propuesta.tramo;a.run("tramos.find(t=>t.id===tLlave).llave=true;guardarDatos()");assert.equal(a.run('datosDeteccionGas().registros[idDetectado].vigente'),false);assert.equal(a.run('accesoriosDeteccionConfirmadosGas().filter(p=>p.tipo==="llave").length'),0);a.run('generarPlanGas()');assert.equal(a.run('revisionMaterialesGas.plan.filas.filter(f=>f.tipo==="llave").reduce((n,f)=>n+f.cantidad,0)'),1);
});
test('detección: llaves sin ubicación no habilitan otras llaves potencialmente duplicadas',()=>{
 const a=app();redDeteccion(a);a.run("datosPlanGas().extras.push({tipo:'llave',cantidad:1,medidas:['1\"'],ubicacion:'Ubicación sin identificar',confirmado:true});detectarAccesoriosGas()");const r=registrosDeteccion(a,'llave')[0];assert.match(r.propuesta.bloqueo,/sin ubicación/);confirmarDeteccion(a,r.propuesta.id);assert.equal(a.run('accesoriosDeteccionConfirmadosGas().length'),0);
});
test('detección: límites de 6/12/18 m y largo comercial configurable calculan cuplas por segmento',()=>{
 const a=app();redDeteccion(a);for(const [m,q]of [[6,0],[12,1],[18,2],[18.001,3]]){a.ctx.largoPrueba=m;a.run('tramos[0].metros=largoPrueba;detectarAccesoriosGas()');const r=registrosDeteccion(a,'cupla').find(r=>r.propuesta.tramo==='d0');assert.equal(r.propuesta.cantidad,q);}
 a.run('datosPlanGas().opciones.largoComercial=3;tramos[0].metros=12;guardarDatos()');assert.equal(registrosDeteccion(a,'cupla').find(r=>r.propuesta.tramo==='d0').propuesta.cantidad,3);
});
test('detección: codo separa segmentos de 6 m, no se crea cupla en su conexión',()=>{
 const a=app();redDeteccion(a);a.run("tramos[0].metros=12;tramos[0].detalle={estado:'completo',metrosFinal:6,accesorios:[{tipo:'codo90',metrosAntes:6,salida:'1\"'}]};detectarAccesoriosGas()");assert.equal(registrosDeteccion(a,'cupla').find(r=>r.propuesta.tramo==='d0').propuesta.cantidad,0);
});
test('detección: cuplas de segmentos con distinto diámetro se calculan por medida, sin mezclar',()=>{
 const a=app();redDeteccion(a);a.run("tramos[0].metros=26;tramos[0].detalle={estado:'completo',metrosFinal:13,accesorios:[{tipo:'reduccion',metrosAntes:13,salida:'3/4\"'}]};detectarAccesoriosGas()");const r=registrosDeteccion(a,'cupla').filter(r=>r.propuesta.tramo==='d0');assert.equal(r.length,2);assert.deepEqual(Array.from(r,x=>x.propuesta.cantidad),[2,2]);assert.deepEqual(Array.from(r,x=>x.propuesta.medidas[0]),['1"','3/4"']);
});
test('detección: confirmar cero cuplas es distinto de pendiente y no añade piezas',()=>{
 const a=app();redDeteccion(a);a.run('tramos[0].metros=6;detectarAccesoriosGas()');const r=registrosDeteccion(a,'cupla').find(r=>r.propuesta.tramo==='d0');confirmarDeteccion(a,r.propuesta.id);assert.equal(a.run('datosDeteccionGas().registros[idDetectado].estado'),'confirmado');assert.equal(a.run('accesoriosDeteccionConfirmadosGas().length'),0);
});
test('detección: confirmar cuplas no duplica la cantidad del plan de cortes',()=>{
 const a=app();redDeteccion(a);a.run('detectarAccesoriosGas()');const r=registrosDeteccion(a,'cupla').find(r=>r.propuesta.tramo==='d0');assert.equal(r.propuesta.cantidad,3);confirmarDeteccion(a,r.propuesta.id);a.run('generarPlanGas()');assert.equal(a.run('revisionMaterialesGas.plan.filas.filter(f=>f.tipo==="cupla").reduce((n,f)=>n+f.cantidad,0)'),3);assert.ok(a.run('revisionMaterialesGas.plan.filas.filter(f=>f.tipo==="cupla-plan").every(f=>f.cantidad===null)'));
});
test('detección: uniones rectas con medidas conocidas sugieren reducción y las desconocidas no',()=>{
 const a=app();a.run("abrir('gas');tramos=[{id:'r0',desde:'M',hasta:'A',metros:6,diametro:'1\"',detalle:{estado:'ninguno'}},{id:'r1',desde:'A',hasta:'Termo',metros:6,diametro:'3/4\"',detalle:{estado:'ninguno'}}];detectarAccesoriosGas()");let r=registrosDeteccion(a,'reduccion');assert.equal(r.length,1);assert.deepEqual(Array.from(r[0].propuesta.medidas),['1"','3/4"']);confirmarDeteccion(a,r[0].propuesta.id);assert.equal(a.run('accesoriosDeteccionConfirmadosGas().length'),0);confirmarDeteccion(a,r[0].propuesta.id,{configuracion:'reduccion'});assert.equal(a.run('accesoriosDeteccionConfirmadosGas().filter(x=>x.tipo==="reduccion").length'),1);a.run('tramos[1].diametro=null;guardarDatos()');assert.equal(registrosDeteccion(a,'reduccion').length,0);
});
test('detección: accesorio reductor existente cubre cambio de diámetro y no añade reducción',()=>{
 const a=app();a.run("abrir('gas');tramos=[{id:'r0',desde:'M',hasta:'A',metros:6,diametro:'1\"',detalle:{estado:'completo',metrosFinal:0,accesorios:[{tipo:'codo90',metrosAntes:6,salida:'3/4\"'}]}},{id:'r1',desde:'A',hasta:'Termo',metros:6,diametro:'3/4\"',detalle:{estado:'ninguno'}}];detectarAccesoriosGas()");assert.equal(registrosDeteccion(a,'reduccion').length,0);
});
test('detección: tee reductora requiere elección explícita y no crea reducciones independientes',()=>{
 const a=app();redDeteccion(a);a.run("tramos[2].diametro='3/4\"';detectarAccesoriosGas()");const r=registrosDeteccion(a,'tee').find(r=>r.propuesta.ubicacion==='A');confirmarDeteccion(a,r.propuesta.id);assert.equal(a.run('accesoriosDeteccionConfirmadosGas().length'),0);confirmarDeteccion(a,r.propuesta.id,{configuracion:'tee-reductora'});assert.equal(a.run('accesoriosDeteccionConfirmadosGas().filter(x=>x.tipo==="tee").length'),1);assert.equal(a.run('accesoriosDeteccionConfirmadosGas().filter(x=>x.tipo==="reduccion").length'),0);a.run('guardarDatos()');assert.equal(a.run('datosDeteccionGas().registros[idDetectado].estado'),'confirmado');
});
test('detección: tee igual y reducción elegidas generan una pieza por función física',()=>{
 const a=app();redDeteccion(a);a.run("tramos[2].diametro='3/4\"';detectarAccesoriosGas()");const r=registrosDeteccion(a,'tee').find(r=>r.propuesta.ubicacion==='A');confirmarDeteccion(a,r.propuesta.id,{configuracion:'tee-igual-reduccion'});assert.equal(a.run('accesoriosDeteccionConfirmadosGas().filter(x=>x.tipo==="tee").length'),1);assert.equal(a.run('accesoriosDeteccionConfirmadosGas().filter(x=>x.tipo==="reduccion").length'),1);a.run('generarPlanGas()');assert.equal(a.run('revisionMaterialesGas.plan.filas.filter(x=>x.tipo==="reduccion").reduce((n,x)=>n+x.cantidad,0)'),1);
});
test('detección: cambios conservan correcciones manuales pero exigen revisar la sugerencia',()=>{
 const a=app();redDeteccion(a);a.run('detectarAccesoriosGas()');const r=registrosDeteccion(a,'llave')[0];confirmarDeteccion(a,r.propuesta.id,{cantidad:2});a.ctx.tramoCorregido=r.propuesta.tramo;a.run('tramos.find(t=>t.id===tramoCorregido).metros+=1;guardarDatos()');assert.equal(a.run('datosDeteccionGas().registros[idDetectado].edicion.cantidad'),2);assert.equal(a.run('datosDeteccionGas().registros[idDetectado].estado'),'revisar');assert.equal(a.run('accesoriosDeteccionConfirmadosGas().length'),0);confirmarDeteccion(a,r.propuesta.id);assert.equal(a.run('accesoriosDeteccionConfirmadosGas()[0].cantidad'),2);
});
test('detección: rechazos y correcciones sobreviven a recarga sin aplicar sugerencias sin confirmar',()=>{
 const a=app();redDeteccion(a);a.run('detectarAccesoriosGas()');const r=registrosDeteccion(a,'llave')[0];a.ctx.idDetectado=r.propuesta.id;a.run("resolverSugerenciaGas(idDetectado,'rechazado',{cantidad:2});guardarDatos()");const b=app(a.saved());b.run("abrir('gas')");b.ctx.idDetectado=r.propuesta.id;assert.equal(b.run('datosDeteccionGas().registros[idDetectado].estado'),'rechazado');assert.equal(b.run('datosDeteccionGas().registros[idDetectado].edicion.cantidad'),2);assert.equal(b.run('accesoriosDeteccionConfirmadosGas().length'),0);
});
test('detección: filas retiradas se conservan como respaldo y dejan de incorporarse',()=>{
 const a=app();redDeteccion(a);a.run('detectarAccesoriosGas()');const r=registrosDeteccion(a,'llave')[0];confirmarDeteccion(a,r.propuesta.id);a.ctx.tramoRetirado=r.propuesta.tramo;a.run('tramos=tramos.filter(t=>t.id!==tramoRetirado);guardarDatos()');assert.equal(a.run('datosDeteccionGas().registros[idDetectado].vigente'),false);assert.equal(a.run('datosDeteccionGas().registros[idDetectado].estado'),'confirmado');assert.equal(a.run('accesoriosDeteccionConfirmadosGas().length'),0);
});
test('detección: no reconstruye conexiones inválidas, circuitos ni combinaciones de más de tres bocas',()=>{
 const a=app();redDeteccion(a);a.run('tramos[0].red={desde:"inexistente",hasta:"otro"};detectarAccesoriosGas()');assert.match(a.run('datosDeteccionGas().avisos.join(" ")'),/referencia interna no disponible/);assert.equal(registrosDeteccion(a,'tee').length,2);
 const b=app();b.run("abrir('gas');tramos=[{id:'a',desde:'A',hasta:'B',metros:1},{id:'b',desde:'B',hasta:'C',metros:1},{id:'c',desde:'C',hasta:'A',metros:1}];detectarAccesoriosGas()");assert.equal(registrosDeteccion(b).length,0);assert.match(b.run('datosDeteccionGas().avisos.join(" ")'),/Circuito cerrado/);
});
test('detección: nodos explícitos con el mismo nombre no se fusionan por su texto',()=>{
 const a=app();redDeteccion(a);a.run("instalacionGas.nodos=[{id:'m',nombre:'M',tipo:'medidor'},{id:'a',nombre:'X',tipo:'derivacion'},{id:'b',nombre:'X',tipo:'derivacion'},...artefactos.map((x,i)=>({id:'art'+i,nombre:x.nombre,tipo:'artefacto',artefactoId:x.id}))];tramos.forEach(t=>{if(['A','B'].includes(t.desde))t.desde='X';if(['A','B'].includes(t.hasta))t.hasta='X'});tramos.forEach((t,i)=>t.red=[{desde:'m',hasta:'a'},{desde:'a',hasta:'b'},{desde:'a',hasta:'art0'},{desde:'b',hasta:'art1'},{desde:'b',hasta:'art2'}][i]);detectarAccesoriosGas()");const r=registrosDeteccion(a,'tee');assert.equal(r.length,2);assert.notEqual(r[0].propuesta.nodo,r[1].propuesta.nodo);
});
test('detección: proyecto, demostración, foto, PDF y HTML autónomo permanecen aislados',()=>{
 const a=app(null,{embebido:true});redDeteccion(a);a.run("proyectos.gas.foto='data:image/png;base64,REAL';mostrarFotoLocal();detectarAccesoriosGas()");const r=registrosDeteccion(a,'tee')[0];confirmarDeteccion(a,r.propuesta.id);a.run('prepararInformeActual()');const doc=a.elements.get('informeImpresion').innerHTML;assert.match(doc,/REAL/);assert.doesNotMatch(doc,/<(?:input|button|select)\b/);a.run("seleccionarAmbitoGas('demostracion')");assert.equal(a.run('accesoriosDeteccionConfirmadosGas().length'),0);assert.equal(a.elements.get('panelDeteccionGas').classList.hidden,true);a.run("abrir('agua')");assert.equal(a.run('modeloInformeActual().filas.length'),0);
});
test('detección: medidas sin informar permiten confirmar cantidad sin inventar diámetros',()=>{
 const a=app();redDeteccion(a,{diametro:null});a.run('detectarAccesoriosGas()');const r=registrosDeteccion(a,'tee')[0];confirmarDeteccion(a,r.propuesta.id);a.run('generarPlanGas()');assert.equal(a.run('revisionMaterialesGas.plan.filas.find(f=>f.tipo==="tee").cantidad'),1);assert.match(a.run('revisionMaterialesGas.plan.filas.find(f=>f.tipo==="tee").diametro'),/Pendiente/);assert.ok(a.run('tramos.every(t=>t.diametro===null)'));
});
test('detección: reducción manual de posición incierta bloquea una nueva pieza potencialmente duplicada',()=>{
 const a=app();a.run("abrir('gas');tramos=[{id:'r0',desde:'M',hasta:'A',metros:6,diametro:'1\"',detalle:{estado:'pendiente',accesorios:[{tipo:'reduccion',salida:'3/4\"'}]}},{id:'r1',desde:'A',hasta:'Termo',metros:6,diametro:'3/4\"',detalle:{estado:'ninguno'}}];detectarAccesoriosGas()");const r=registrosDeteccion(a,'reduccion')[0];assert.match(r.propuesta.bloqueo,/sin posición/);confirmarDeteccion(a,r.propuesta.id,{configuracion:'reduccion'});assert.equal(a.run('accesoriosDeteccionConfirmadosGas().length'),0);
});
test('detección: un nodo con cuatro conexiones queda pendiente sin inventar combinación de tees',()=>{
 const a=app();redDeteccion(a);a.run("tramos.push({id:'extra',desde:'A',hasta:'Otro',metros:1,diametro:null,detalle:{estado:'pendiente'}});detectarAccesoriosGas()");assert.ok(registrosDeteccion(a,'tee').every(r=>r.propuesta.ubicacion!=='A'));assert.match(a.run('datosDeteccionGas().avisos.join(" ")'),/más de tres conexiones/);
});
test('detección: reordenar tramos no duplica tees ni descarta confirmaciones sin cambios físicos',()=>{
 const a=app();redDeteccion(a);a.run('detectarAccesoriosGas()');const r=registrosDeteccion(a,'tee')[0];confirmarDeteccion(a,r.propuesta.id);a.run('tramos.reverse();guardarDatos()');assert.equal(a.run('datosDeteccionGas().registros[idDetectado].estado'),'confirmado');assert.equal(a.run('accesoriosDeteccionConfirmadosGas().length'),1);
});
test('detección: continúa localmente con guardado bloqueado, sin borrar entradas ni enviar fotos',()=>{
 const a=app(null,{embebido:true,blocked:true});redDeteccion(a);a.run("proyectos.gas.foto='data:image/png;base64,LOCAL';mostrarFotoLocal();detectarAccesoriosGas()");const r=registrosDeteccion(a,'tee')[0];confirmarDeteccion(a,r.propuesta.id);assert.equal(a.saved(),undefined);assert.equal(a.run('fotoURL'),'data:image/png;base64,LOCAL');assert.equal(a.run('tramos.length'),5);assert.equal(a.run('accesoriosDeteccionConfirmadosGas().length'),1);
});
test('detección: controles de la tarjeta guardan una corrección y confirman en una sola acción',()=>{
 const a=app();redDeteccion(a);a.run('detectarAccesoriosGas()');const card=a.elements.get('deteccionFilas').children.find(n=>n.className==='detalle gas-sugerencia'&&n.children[0].textContent.startsWith('Llave de paso'));const campos=card.children.filter(n=>n.children?.some(x=>x.type==='number'));campos[0].children[0].value='2';descendientesPresentacion(card).find(n=>n.textContent==='Confirmar sugerencia').onclick();assert.equal(a.run('accesoriosDeteccionConfirmadosGas().find(x=>x.tipo==="llave").cantidad'),2);
});
test('detección: conexiones de tee aportadas en revisión no se convierten en diámetros automáticos',()=>{
 const a=app();redDeteccion(a,{diametro:null});a.run('detectarAccesoriosGas()');const r=registrosDeteccion(a,'tee').find(r=>r.propuesta.ubicacion==='A');confirmarDeteccion(a,r.propuesta.id,{medidas:['1"','1"','3/4"'],configuracion:'tee-igual-reduccion'});assert.equal(a.run('accesoriosDeteccionConfirmadosGas().filter(x=>x.tipo==="reduccion").length'),1);assert.ok(a.run('tramos.every(t=>t.diametro===null)'));assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
});
test('detección: tee reductora confirmada se identifica por nombre en la lista de materiales',()=>{
 const a=app();redDeteccion(a);a.run("tramos[2].diametro='3/4\"';detectarAccesoriosGas()");const r=registrosDeteccion(a,'tee').find(r=>r.propuesta.ubicacion==='A');confirmarDeteccion(a,r.propuesta.id,{configuracion:'tee-reductora'});a.run('generarPlanGas()');assert.equal(a.run('revisionMaterialesGas.plan.filas.find(x=>x.tipo==="tee").material'),'Tee reductora');
});
test('detección: tres bocas sin entrada definida no autorizan una tee reductora por suposiciones',()=>{
 const a=app();redDeteccion(a,{diametro:null});a.run("tramos[1].desde='B';tramos[1].hasta='A';detectarAccesoriosGas()");const r=registrosDeteccion(a,'tee').find(r=>r.propuesta.ubicacion==='A');assert.equal(r.propuesta.flujoDefinido,false);confirmarDeteccion(a,r.propuesta.id,{medidas:['1"','3/4"','1"'],configuracion:'tee-reductora'});assert.equal(a.run('accesoriosDeteccionConfirmadosGas().length'),0);assert.match(a.text('deteccionMensaje'),/entrada y las dos salidas/);
});
test('detección: aprovecha el artefacto de destino ya elegido en el formulario del tramo',()=>{
 const a=app();a.run("abrir('gas');tramos=[{id:'destino',desde:'M',hasta:'A',metros:6,diametro:null,artefacto:'Cocina',detalle:{estado:'ninguno'}}];detectarAccesoriosGas()");const r=registrosDeteccion(a,'llave');assert.equal(r.length,1);assert.match(r[0].propuesta.ubicacion,/Cocina/);assert.equal(a.run('artefactos.length'),0);
});

function redAndroidEstructurada(a){
 redDeteccion(a,{diametro:null,pendiente:true});
 a.run("tramos.forEach((t,i)=>t.metros=[15,5,9,16,13][i]);instalacionGas.nodos=[{id:'n-m',nombre:'M',tipo:'medidor'},{id:'n-a',nombre:'A',tipo:'derivacion'}];tramos[0].red={desde:'n-m',hasta:'n-a'}");
}
test('Android: cinco tramos Desde/Hasta y referencias parciales comparten A y B sin recargar',()=>{
 const a=app(null,{embebido:true});redAndroidEstructurada(a);
 const antes=a.run('JSON.stringify({tramos,artefactos,instalacionGas})');
 a.run('detectarAccesoriosGas()');
 const resultado=a.run('DetectorGas.detectar({tramos,artefactos,nodos:instalacionGas.nodos})');
 assert.equal(resultado.conexiones.length,5);
 assert.equal(resultado.conexiones[0].hasta,resultado.conexiones[1].desde);
 assert.equal(resultado.conexiones[1].desde,resultado.conexiones[2].desde);
 assert.equal(resultado.conexiones[1].hasta,resultado.conexiones[3].desde);
 assert.equal(resultado.conexiones[3].desde,resultado.conexiones[4].desde);
 assert.deepEqual(Array.from(registrosDeteccion(a,'tee'),r=>r.propuesta.ubicacion).sort(),['A','B']);
 assert.equal(a.run('accesoriosDeteccionConfirmadosGas().length'),0);
 assert.ok(registrosDeteccion(a,'cupla').every(r=>r.propuesta.cantidad===null));
 assert.ok(registrosDeteccion(a).every(r=>!['codo45','codo90','curva','reduccion'].includes(r.propuesta.tipo)));
 assert.doesNotMatch(resultado.avisos.join(' '),/Conectá explícitamente|no se mezclaron/);
 assert.equal(a.run('JSON.stringify({tramos,artefactos,instalacionGas})'),antes);
});
test('Android: referencias incompletas o inexistentes aprovechan Desde/Hasta guardados',()=>{
 for(const red of [{},{desde:'n-m'},{desde:'viejo',hasta:'borrado'}]){
  const a=app();redAndroidEstructurada(a);a.ctx.refAndroid=red;a.run('tramos[0].red=refAndroid;detectarAccesoriosGas()');
  assert.equal(registrosDeteccion(a,'tee').length,2);
 }
});
test('Android: un nombre visual no reemplaza Desde/Hasta y los espacios no separan nodos',()=>{
 const a=app();redAndroidEstructurada(a);a.run("tramos[1].desde=' a ';tramos[1].nombre='OTRO–DESTINO';tramos[4].desde=' b ';detectarAccesoriosGas()");
 assert.equal(registrosDeteccion(a,'tee').length,2);
 a.run("tramos[1].desde='';detectarAccesoriosGas()");
 assert.match(a.run('datosDeteccionGas().avisos.join(" ")'),/falta Desde/);
 assert.equal(registrosDeteccion(a,'tee').length,0);
});
test('Android: referencias contradictorias y nombres ambiguos quedan pendientes',()=>{
 const a=app();redAndroidEstructurada(a);a.run("tramos[1].red={desde:'n-m'};detectarAccesoriosGas()");
 assert.match(a.run('datosDeteccionGas().avisos.join(" ")'),/contradice/);
 assert.ok(registrosDeteccion(a,'tee').every(r=>r.propuesta.ubicacion!=='B'));
 const b=app();redAndroidEstructurada(b);b.run("instalacionGas.nodos.push({id:'otro-a',nombre:'A',tipo:'derivacion'});detectarAccesoriosGas()");
 assert.match(b.run('datosDeteccionGas().avisos.join(" ")'),/varios nodos/);
 assert.ok(registrosDeteccion(b,'tee').every(r=>r.propuesta.ubicacion!=='A'));
});
test('Android: confirmar, corregir y rechazar con conexiones mixtas persiste sin duplicación',()=>{
 const a=app();redAndroidEstructurada(a);a.run('detectarAccesoriosGas()');
 const tees=registrosDeteccion(a,'tee');confirmarDeteccion(a,tees[0].propuesta.id);
 a.ctx.idRechazo=tees[1].propuesta.id;a.run("resolverSugerenciaGas(idRechazo,'rechazado',{cantidad:2});detectarAccesoriosGas();detectarAccesoriosGas();guardarDatos()");
 assert.equal(registrosDeteccion(a,'tee').length,2);
 assert.equal(a.run('accesoriosDeteccionConfirmadosGas().filter(p=>p.tipo==="tee").length'),1);
 const b=app(a.saved());b.run("abrir('gas');detectarAccesoriosGas()");b.ctx.idRechazo=tees[1].propuesta.id;
 assert.equal(b.run('datosDeteccionGas().registros[idRechazo].estado'),'rechazado');
 assert.equal(b.run('datosDeteccionGas().registros[idRechazo].edicion.cantidad'),2);
 assert.equal(b.run('accesoriosDeteccionConfirmadosGas().filter(p=>p.tipo==="tee").length'),1);
});
test('Android: tee manual ubicada en A no se duplica al conciliar conexiones mixtas',()=>{
 const a=app();redAndroidEstructurada(a);
 a.run("tramos[0].detalle={estado:'pendiente',accesorios:[{tipo:'tee',nodo:'A',medidas:[null,null,null]}]};detectarAccesoriosGas()");
 assert.deepEqual(Array.from(registrosDeteccion(a,'tee'),r=>r.propuesta.ubicacion),['B']);
});
test('Android: decisiones previas por nombres se conservan al resolver IDs únicos de la misma pieza',()=>{
 const a=app();redDeteccion(a,{diametro:null});a.run('detectarAccesoriosGas()');const t=registrosDeteccion(a,'tee').find(r=>r.propuesta.ubicacion==='A');a.ctx.idAnterior=t.propuesta.id;
 a.run("resolverSugerenciaGas(idAnterior,'rechazado',{cantidad:2});instalacionGas.nodos=[{id:'nuevo-a',nombre:'A',tipo:'derivacion'}];detectarAccesoriosGas()");
 const actual=registrosDeteccion(a,'tee').find(r=>r.propuesta.ubicacion==='A');assert.equal(actual.estado,'rechazado');assert.equal(actual.edicion.cantidad,2);assert.equal(a.run('datosDeteccionGas().registros[idAnterior].vigente'),false);
 assert.equal(registrosDeteccion(a,'tee').length,2);assert.equal(a.run('accesoriosDeteccionConfirmadosGas().length'),0);
});


function descendientesPresentacion(n){return [n,...(n.children||[]).flatMap(descendientesPresentacion)];}
function tarjetasMateriales(a){return a.elements.get('matResultado').children.find(n=>n.className==='gas-materiales-tarjetas').children;}
test('presentación: una tarjeta por material con seis datos y detalles técnicos cerrados',()=>{
 const a=app(null,{embebido:true});proyectoPlan(a);const tarjetas=tarjetasMateriales(a),filas=a.run('revisionMaterialesGas.plan.filas');assert.equal(tarjetas.length,filas.length);
 tarjetas.forEach((card,i)=>{const ns=descendientesPresentacion(card);assert.equal(card.tagName,'ARTICLE');assert.ok(ns.some(n=>n.textContent===filas[i].material));assert.ok(ns.some(n=>n.textContent==='Diámetro: '+filas[i].diametro));assert.ok(ns.some(n=>n.textContent.startsWith('Ubicación: ')));assert.ok(ns.some(n=>n.textContent.startsWith('Estado: ')));assert.ok(ns.some(n=>n.textContent==='Cantidad · '+filas[i].unidad));assert.equal(ns.find(n=>n.type==='number').value,filas[i].cantidad??'');assert.ok(ns.some(n=>n.tagName==='SUMMARY'&&n.textContent==='Ver detalles técnicos'));assert.ok(ns.filter(n=>n.tagName==='DETAILS').every(n=>!n.open));});
 assert.ok(!descendientesPresentacion(a.elements.get('matResultado')).some(n=>n.tagName==='TABLE'));
});
test('presentación: renderizar tarjetas y sugerencias no cambia datos, cálculos ni decisiones',()=>{
 const a=app();redAndroidEstructurada(a);a.run('detectarAccesoriosGas();generarPlanGas()');const antes=a.run('JSON.stringify({tramos,artefactos,instalacionGas,revisionMaterialesGas,d:datosDeteccionGas()})');a.run('renderPlanGas();renderSugerenciasGas();renderPlanGas()');assert.equal(a.run('JSON.stringify({tramos,artefactos,instalacionGas,revisionMaterialesGas,d:datosDeteccionGas()})'),antes);
});
test('presentación: cantidad cero y pendiente son distintas y el control rechaza negativos',()=>{
 const a=app();proyectoPlan(a);const qty=()=>descendientesPresentacion(tarjetasMateriales(a)[0]).find(n=>n.type==='number');let q=qty();q.value='0';q.onchange();assert.equal(a.run('revisionMaterialesGas.plan.filas[0].cantidad'),0);q=qty();q.value='';q.onchange();assert.equal(a.run('revisionMaterialesGas.plan.filas[0].cantidad'),null);q=qty();q.value='-1';q.onchange();assert.equal(a.run('revisionMaterialesGas.plan.filas[0].cantidad'),null);assert.match(a.text('matMensaje'),/no negativa/);
});
test('presentación: casilla de tarjeta guarda revisión y modificación vuelve a requerir revisión',()=>{
 const a=app();proyectoPlan(a);let ns=descendientesPresentacion(tarjetasMateriales(a)[0]);const check=ns.find(n=>n.type==='checkbox');check.checked=true;check.onchange();assert.equal(a.run('revisionMaterialesGas.plan.filas[0].revisado'),true);const qty=ns.find(n=>n.type==='number');qty.value='8';qty.onchange();assert.equal(a.run('revisionMaterialesGas.plan.filas[0].revisado'),false);assert.equal(a.run('revisionMaterialesGas.plan.filas[0].cantidad'),8);assert.ok(descendientesPresentacion(tarjetasMateriales(a)[0]).some(n=>String(n.textContent).includes('calculada originalmente')));
});
test('presentación: sugerencias conservan tres acciones y explicación técnica sin estado repetido',()=>{
 const a=app();redAndroidEstructurada(a);a.run('detectarAccesoriosGas()');const card=a.elements.get('deteccionFilas').children.find(n=>n.className==='detalle gas-sugerencia');const ns=descendientesPresentacion(card);assert.deepEqual(ns.filter(n=>n.tagName==='BUTTON').map(n=>n.textContent),['Guardar correcciones','Confirmar sugerencia','Rechazar']);assert.ok(ns.some(n=>n.tagName==='SUMMARY'&&n.textContent==='Ver detalles técnicos'));assert.ok(!ns.some(n=>n.textContent.startsWith('Estado de revisión:')));
});
test('presentación: tees A y B confirmadas persisten sin duplicación y PDF mantiene tablas limpias',()=>{
 const a=app();redAndroidEstructurada(a);a.run('detectarAccesoriosGas()');for(const t of registrosDeteccion(a,'tee'))confirmarDeteccion(a,t.propuesta.id);a.run('generarPlanGas();renderPlanGas();renderSugerenciasGas();guardarDatos()');const b=app(a.saved());b.run("abrir('gas');generarPlanGas();renderPlanGas();prepararInformeActual()");assert.equal(b.run('accesoriosDeteccionConfirmadosGas().filter(p=>p.tipo==="tee").length'),2);const doc=b.elements.get('informeImpresion').innerHTML;assert.match(doc,/<table/);assert.match(doc,/DEFINITIVO/);assert.doesNotMatch(doc,/<(?:input|button|details|summary)\b/);assert.equal(b.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
});

test('tarjetas compactas: IDs internos se traducen también en diámetro, evidencias y cortes',()=>{
 const a=app(null,{embebido:true});redAndroidEstructurada(a);a.run("tramos.forEach((t,i)=>t.id='tramo-mvgzumer-'+(i+1));detectarAccesoriosGas();generarPlanGas()");
 const antes=a.run('JSON.stringify({tramos,revisionMaterialesGas})');
 a.run('renderPlanGas();renderSugerenciasGas()');
 const pantalla=descendientesPresentacion(a.elements.get('matResultado')).concat(descendientesPresentacion(a.elements.get('deteccionFilas'))).map(n=>n.textContent).join(' ');
 assert.doesNotMatch(pantalla,/tramo-mvgzumer-\d/);assert.match(pantalla,/M–A/);assert.match(pantalla,/A–B/);
 assert.match(a.run('JSON.stringify(tramos)'),/tramo-mvgzumer-1/);assert.equal(a.run('JSON.stringify({tramos,revisionMaterialesGas})'),antes);
 assert.equal(a.run("textoMaterialPantallaGas('tramo-olvidado-99')"),'Tramo sin ubicación identificada');
});
test('tarjetas compactas: cantidad desconocida se muestra Pendiente y cero sigue siendo cero',()=>{
 const a=app();proyectoPlan(a);a.run('revisionMaterialesGas.plan.filas[0].cantidad=null;renderPlanGas()');let ns=descendientesPresentacion(tarjetasMateriales(a)[0]);assert.ok(ns.some(n=>n.textContent==='Pendiente'));assert.equal(ns.find(n=>n.type==='number').value,'');assert.equal(ns.find(n=>n.type==='number').placeholder,'Pendiente');
 a.run('revisionMaterialesGas.plan.filas[0].cantidad=0;renderPlanGas()');ns=descendientesPresentacion(tarjetasMateriales(a)[0]);assert.equal(ns.find(n=>n.type==='number').value,0);assert.ok(!ns.some(n=>n.className==='gas-cantidad-pendiente'));
});
test('tarjetas compactas: confirmar tees no confirma revisión de diámetros ni conexiones',()=>{
 const a=app();redAndroidEstructurada(a);a.run('detectarAccesoriosGas()');for(const t of registrosDeteccion(a,'tee'))confirmarDeteccion(a,t.propuesta.id);a.run('generarPlanGas()');
 const filas=a.run('revisionMaterialesGas.plan.filas');const i=filas.findIndex(f=>f.tipo==='tee');assert.ok(i>=0);assert.equal(filas[i].revisado,false);
 let ns=descendientesPresentacion(tarjetasMateriales(a)[i]);assert.ok(ns.some(n=>n.textContent.includes('Accesorio confirmado')));assert.ok(ns.some(n=>n.textContent==='Revisión técnica pendiente · diámetros y conexiones'));assert.equal(ns.find(n=>n.type==='checkbox').checked,false);
 const check=ns.find(n=>n.type==='checkbox');check.checked=true;check.onchange();a.run('renderPlanGas()');ns=descendientesPresentacion(tarjetasMateriales(a)[i]);assert.ok(ns.some(n=>n.textContent.includes('Revisión técnica pendiente')));assert.equal(a.run('accesoriosDeteccionConfirmadosGas().filter(x=>x.tipo==="tee").length'),2);
});
test('tarjetas compactas: revisión táctil conserva su control asociado y aclaración',()=>{
 const a=app();proyectoPlan(a);const label=descendientesPresentacion(tarjetasMateriales(a)[0]).find(n=>n.className==='gas-revision-check');assert.equal(label.tagName,'LABEL');assert.equal(label.textContent,'Revisado');assert.match(label.title,/no valida diámetros ni conexiones/);assert.equal(label.children[0].type,'checkbox');
 const qty=descendientesPresentacion(tarjetasMateriales(a)[0]).find(n=>n.type==='number');assert.match(qty.ariaLabel,/Cantidad de/);assert.equal(typeof qty.onchange,'function');
});
test('tarjetas compactas: recargar datos previos y abrir detalles no cambia respaldo ni decisiones',()=>{
 const a=app();redAndroidEstructurada(a);a.run('detectarAccesoriosGas()');for(const t of registrosDeteccion(a,'tee'))confirmarDeteccion(a,t.propuesta.id);a.run('generarPlanGas();guardarDatos()');const b=app(a.saved());b.run("abrir('gas');generarPlanGas();guardarDatos()");const datos=b.saved();const antes=b.run('JSON.stringify({tramos,artefactos,instalacionGas,revisionMaterialesGas,d:datosDeteccionGas()})');
 const detalle=descendientesPresentacion(tarjetasMateriales(b)[0]).find(n=>n.tagName==='DETAILS');detalle.open=true;assert.equal(detalle.open,true);detalle.open=false;b.run('renderPlanGas();renderSugerenciasGas()');assert.equal(b.saved(),datos);assert.equal(b.run('JSON.stringify({tramos,artefactos,instalacionGas,revisionMaterialesGas,d:datosDeteccionGas()})'),antes);assert.equal(registrosDeteccion(b,'tee').filter(t=>t.estado==='confirmado').length,2);
});

test('PDF GAS: traduce los cinco IDs en diámetros, materiales y notas sin alterar el proyecto',()=>{
 const a=app(null,{embebido:true});redAndroidEstructurada(a);a.run("tramos.forEach((t,i)=>t.id='tramo-pdfprueba-'+(i+1));detectarAccesoriosGas();generarPlanGas();guardarDatos()");const guardado=a.saved();const antes=a.run('JSON.stringify({tramos,artefactos,revisionMaterialesGas,d:datosDeteccionGas()})');a.run('prepararInformeActual()');const doc=a.elements.get('informeImpresion').innerHTML;
 assert.doesNotMatch(doc,/tramo-pdfprueba-\d/);for(const nombre of ['M–A','A–B','A–Termo','B–Calefactor','B–Cocina'])assert.ok(doc.includes(nombre),nombre);assert.match(doc,/Pendiente/);assert.match(doc,/class="materiales-entrega"/);assert.equal(a.saved(),guardado);assert.equal(a.run('JSON.stringify({tramos,artefactos,revisionMaterialesGas,d:datosDeteccionGas()})'),antes);
});
test('PDF GAS: foto original, seis columnas, consumos y cantidades desconocidas se conservan',()=>{
 const a=app();redAndroidEstructurada(a);a.run("proyectos.gas.foto='data:image/png;base64,ORIGINAL';mostrarFotoLocal();generarPlanGas();prepararInformeActual()");const doc=a.elements.get('informeImpresion').innerHTML;assert.match(doc,/src="data:image\/png;base64,ORIGINAL"/);assert.deepEqual([...doc.matchAll(/<th>(.*?)<\/th>/g)].slice(0,6).map(x=>x[1]),['TRAMO','REAL (m)','EQUIVALENTE (m)','DEFINITIVO (m)','CONSUMO (m³/h)','DIÁMETRO']);assert.match(doc,/>21950</);assert.match(doc,/>3000</);assert.match(doc,/>10250</);assert.match(doc,/PENDIENTE/);assert.doesNotMatch(doc,/<(?:input|button|select|details)\b/);
});
test('PDF GAS: traducción segura de IDs con signos, sin inventar ubicación ni modificar números',()=>{
 const {documento}=require('../informes/documento-proyecto.js');const d={titulo:'GAS',ambito:'MI PROYECTO',tramos:[{id:'tramo.a+1',desde:'M',hasta:'A',metros:1,diametro:'1"'}],artefactos:[{nombre:'Cocina',consumo:1}],filas:[{material:'Tee',diametro:'Pendiente (tramo.a+1)',cantidad:0,unidad:'u',ubicacion:'tramo.a+1',estado:'estimado',revisado:false,evidencia:'tramo.a+1'}],resumen:['Revisar tramo.a+1 y tramo-desconocido-99'],advertencia:'Bloqueado'};const antes=JSON.stringify(d);const doc=documento(d);assert.doesNotMatch(doc,/tramo\.a\+1|tramo-desconocido-99/);assert.match(doc,/Pendiente \(M–A\)/);assert.match(doc,/Tramo \(ubicación pendiente\)/);assert.match(doc,/>0<\/td>/);assert.equal(JSON.stringify(d),antes);
 d.tramos[0].id='1';d.filas[0].cantidad=1;const num=documento(d);assert.match(num,/>1<\/td>/);assert.match(num,/1&quot;/);
});
test('PDF GAS: ubicaciones agrupadas se distribuyen por líneas conservando cantidades y estados',()=>{
 const {documento}=require('../informes/documento-proyecto.js');const d={titulo:'GAS',ambito:'MI PROYECTO',tramos:[],artefactos:[],filas:[],materialesAgrupados:[{material:'Codo 90°',diametro:'3/4"',cantidad:17,unidad:'u',estado:'estimado',revisado:true,ubicaciones:['M–A','A–Termo','B–Cocina']}],advertencia:'Bloqueado'};const antes=JSON.stringify(d);const doc=documento(d);assert.match(doc,/M–A;\nA–Termo;\nB–Cocina/);assert.match(doc,/>17<\/td>/);assert.match(doc,/PROVISIONAL \(ESTIMADO\) · Revisado/);assert.equal(JSON.stringify(d),antes);
});
test('PDF: la presentación de AGUA y CLOACAS se conserva sin clases ni traducciones de GAS',()=>{
 const {documento}=require('../informes/documento-proyecto.js');for(const titulo of ['AGUA','CLOACAS']){const d={titulo,ambito:'MI PROYECTO',tramos:[],artefactos:[],filas:[],resumen:['Referencia tramo-externo-1'],advertencia:''};const doc=documento(d);assert.match(doc,/Referencia tramo-externo-1/);assert.doesNotMatch(doc,/materiales-entrega/);}
});

function lectorFotosPrueba(a){
 const lectores=[];let url=0;a.ctx.URL.createObjectURL=()=> 'blob:foto-'+(++url);a.ctx.FileReader=class{constructor(){lectores.push(this)}readAsDataURL(){}readAsText(){}};
 return {lectores,cargar({type='image/jpeg',size=2*1024*1024}={}){a.ctx.archivoFoto={target:{files:[{type,size}]}};a.run('cargarFoto(archivoFoto)');return lectores[lectores.length-1];},terminar(lector,datos){lector.result=datos;lector.onload();}};
}
test('foto persistente: galería de más de 1 MB sobrevive cierre simulado con cinco tramos y PDF',()=>{
 const a=app(null,{embebido:true});redAndroidEstructurada(a);const antes=a.run('JSON.stringify(tramos)');const io=lectorFotosPrueba(a),r=io.cargar();assert.match(a.text('estadoFoto'),/Leyendo/);io.terminar(r,'data:image/jpeg;base64,ORIGINAL_ANDROID');assert.match(a.text('estadoFoto'),/Foto guardada/);assert.equal(JSON.parse(a.saved()).gas.foto,'data:image/jpeg;base64,ORIGINAL_ANDROID');
 const b=app(a.saved(),{embebido:true});b.run("abrir('gas');prepararInformeActual()");assert.equal(b.run('fotoURL'),'data:image/jpeg;base64,ORIGINAL_ANDROID');assert.equal(b.run('JSON.stringify(tramos)'),antes);assert.match(b.elements.get('informeImpresion').innerHTML,/src="data:image\/jpeg;base64,ORIGINAL_ANDROID"/);assert.match(b.text('estadoFoto'),/Foto guardada/);
});
test('foto persistente: cuota insuficiente no aparenta guardado y conserva foto anterior y tramos',()=>{
 const a=app();redAndroidEstructurada(a);a.run("proyectos.gas.foto='data:image/jpeg;base64,ANTERIOR';guardarDatos()");const b=app(a.saved(),{quota:a.saved().length+2000});b.run("abrir('gas')");const io=lectorFotosPrueba(b),r=io.cargar();io.terminar(r,'data:image/jpeg;base64,'+'x'.repeat(15000));assert.match(b.text('estadoFoto'),/NO guardada/);assert.doesNotMatch(b.text('estadoFoto'),/^Foto guardada/);assert.equal(JSON.parse(b.saved()).gas.foto,'data:image/jpeg;base64,ANTERIOR');assert.equal(JSON.parse(b.saved()).gas.tramos.length,5);b.run('guardarDatos();mostrarFotoLocal()');assert.match(b.text('estadoFoto'),/NO guardada/);assert.equal(b.run('fotoURL'),'data:image/jpeg;base64,'+'x'.repeat(15000));
 const c=app(b.saved());c.run("abrir('gas')");assert.equal(c.run('fotoURL'),'data:image/jpeg;base64,ANTERIOR');
});
test('foto persistente: error de lectura conserva la foto guardada sin reemplazarla por blob',()=>{
 const a=app();a.run("abrir('gas');proyectos.gas.foto='data:image/png;base64,ANTERIOR';guardarDatos();mostrarFotoLocal()");const io=lectorFotosPrueba(a),r=io.cargar();r.onerror();assert.match(a.text('estadoFoto'),/NO guardada.*No se pudo leer/);assert.equal(JSON.parse(a.saved()).gas.foto,'data:image/png;base64,ANTERIOR');a.run('guardarDatos()');assert.equal(JSON.parse(a.saved()).gas.foto,'data:image/png;base64,ANTERIOR');
});
test('foto persistente: tamaño o formato no persistible deja aviso estable sin perder foto previa',()=>{
 for(const opciones of [{size:13*1024*1024},{type:'image/heic'}]){const a=app();a.run("abrir('gas');proyectos.gas.foto='data:image/png;base64,ANTERIOR';guardarDatos()");const io=lectorFotosPrueba(a);io.cargar(opciones);assert.equal(io.lectores.length,0);assert.match(a.text('estadoFoto'),/NO guardada.*12 MB/);a.run('guardarDatos()');assert.match(a.text('estadoFoto'),/NO guardada/);assert.equal(JSON.parse(a.saved()).gas.foto,'data:image/png;base64,ANTERIOR');}
});
test('foto persistente: lecturas fuera de orden o quitadas no restauran imágenes descartadas',()=>{
 const a=app();a.run("abrir('gas')");const io=lectorFotosPrueba(a),primera=io.cargar(),segunda=io.cargar();io.terminar(primera,'data:image/jpeg;base64,VIEJA');assert.equal(a.run('proyectos.gas.foto'),undefined);io.terminar(segunda,'data:image/jpeg;base64,NUEVA');assert.equal(JSON.parse(a.saved()).gas.foto,'data:image/jpeg;base64,NUEVA');const tercera=io.cargar();a.run('quitarFoto()');io.terminar(tercera,'data:image/jpeg;base64,QUITADA');assert.equal(JSON.parse(a.saved()).gas.foto,undefined);assert.equal(a.run('fotoURL'),null);
});
test('foto persistente: lecturas al cambiar especialidad y demostración guardan en su destino original',()=>{
 const a=app();a.run("abrir('gas')");const io=lectorFotosPrueba(a),r=io.cargar();a.run("seleccionarAmbitoGas('demostracion')");const demo=io.cargar();a.run("abrir('agua')");io.terminar(r,'data:image/jpeg;base64,REAL');io.terminar(demo,'data:image/jpeg;base64,DEMO');assert.equal(JSON.parse(a.saved()).gas.foto,'data:image/jpeg;base64,REAL');assert.equal(JSON.parse(a.saved()).gas.demostracion.foto,'data:image/jpeg;base64,DEMO');assert.equal(JSON.parse(a.saved()).agua.foto,undefined);a.run("abrir('gas');seleccionarAmbitoGas('proyecto')");assert.equal(a.run('fotoURL'),'data:image/jpeg;base64,REAL');a.run("seleccionarAmbitoGas('demostracion')");assert.equal(a.run('fotoURL'),'data:image/jpeg;base64,DEMO');assert.match(a.text('estadoFoto'),/Foto guardada/);
});
test('foto persistente: almacenamiento bloqueado mantiene navegación y aviso sin afirmar guardado',()=>{
 const a=app(null,{blocked:true});a.run("abrir('gas')");const io=lectorFotosPrueba(a),r=io.cargar();io.terminar(r,'data:image/jpeg;base64,SESION');assert.match(a.text('estadoFoto'),/NO guardada/);assert.equal(a.saved(),undefined);a.run("abrir('agua');abrir('gas')");assert.equal(a.run('fotoURL'),'data:image/jpeg;base64,SESION');assert.match(a.text('estadoFoto'),/NO guardada/);
});
function respaldoPrueba(a,datos){
 const io=lectorFotosPrueba(a);a.ctx.eventoRespaldo={target:{files:[{size:JSON.stringify(datos).length}],value:'respaldo.json'}};a.run('importarRespaldoCompleto(eventoRespaldo)');io.terminar(io.lectores[0],JSON.stringify(datos));
}
test('respaldo v1: exporta fotografía y recupera cinco tramos, materiales y foto para PDF',()=>{
 const a=app();redAndroidEstructurada(a);const io=lectorFotosPrueba(a),r=io.cargar();io.terminar(r,'data:image/jpeg;base64,RESPALDADA');a.run('generarPlanGas()');let contenido;a.ctx.Blob=class{constructor(partes){contenido=partes.join('')}};a.ctx.setTimeout=()=>{};a.ctx.document.createElement=()=>({click(){}});a.run('descargarRespaldoCompleto()');const x=JSON.parse(contenido);assert.equal(x.formato,'canerias-respaldo-v1');assert.equal(x.proyectos.gas.foto,'data:image/jpeg;base64,RESPALDADA');
 const b=app();b.run("abrir('gas')");respaldoPrueba(b,x);assert.match(b.text('estadoRespaldo'),/recuperado/);assert.equal(b.run('tramos.length'),5);assert.equal(b.run('fotoURL'),'data:image/jpeg;base64,RESPALDADA');assert.ok(b.run('!!proyectos.gas.planCompra'));b.run('prepararInformeActual()');assert.match(b.elements.get('informeImpresion').innerHTML,/RESPALDADA/);const c=app(b.saved());c.run("abrir('gas')");assert.equal(c.run('fotoURL'),'data:image/jpeg;base64,RESPALDADA');
});
test('respaldo v1: cancelar o rechazar formato inválido conserva los proyectos anteriores',()=>{
 for(const caso of ['cancelar','formato','blob']){const a=app();redAndroidEstructurada(a);a.run('guardarDatos()');const antes=a.saved();const d={formato:'canerias-respaldo-v1',proyectos:{gas:{foto:'data:image/png;base64,FOTO'},agua:{},cloacas:{}}};if(caso==='cancelar')a.ctx.window.confirm=()=>false;if(caso==='formato')d.formato='otro';if(caso==='blob')d.proyectos.gas.foto='blob:temporal';respaldoPrueba(a,d);assert.equal(a.saved(),antes);assert.equal(a.run('tramos.length'),5);assert.match(a.text('estadoRespaldo'),/cancelada|No se importó/);}
});
test('respaldo v1: importación que supera cuota no reemplaza datos ni fotos existentes',()=>{
 const a=app();redAndroidEstructurada(a);a.run('guardarDatos()');const b=app(a.saved(),{quota:a.saved().length+100});b.run("abrir('gas')");const antes=b.saved();respaldoPrueba(b,{formato:'canerias-respaldo-v1',proyectos:{gas:{foto:'data:image/png;base64,'+'x'.repeat(15000)},agua:{},cloacas:{}}});assert.equal(b.saved(),antes);assert.equal(b.run('tramos.length'),5);assert.match(b.text('estadoRespaldo'),/No se importó/);
});
test('respaldo v1: no exporta mientras la fotografía sigue leyéndose',()=>{
 const a=app();a.run("abrir('gas')");const io=lectorFotosPrueba(a);io.cargar();a.run('descargarRespaldoCompleto()');assert.match(a.text('estadoRespaldo'),/Esperá/);
});
test('foto persistente: aviso de cuota se elimina si luego se logra guardar la misma imagen',()=>{
 const a=app(null,{quota:4000});a.run("abrir('gas')");const io=lectorFotosPrueba(a),r=io.cargar();io.terminar(r,'data:image/jpeg;base64,'+'x'.repeat(6000));assert.match(a.text('estadoFoto'),/NO guardada/);let guardado;a.ctx.localStorage.setItem=(clave,valor)=>{guardado=valor};a.run('guardarDatos()');assert.ok(guardado.includes('data:image/jpeg'));assert.match(a.text('estadoFoto'),/^Foto guardada/);
});
test('respaldo v1: conserva confirmación de fotografía y medidas manuales tras importar y reabrir',()=>{
 const a=app();redAndroidEstructurada(a);const io=lectorFotosPrueba(a),r=io.cargar();io.terminar(r,'data:image/jpeg;base64,CONFIRMADA');a.elements.get('entregaCroquisConfirmado').checked=true;a.run('confirmarCroquisEntrega();guardarDatos()');const respaldo={formato:'canerias-respaldo-v1',proyectos:JSON.parse(a.saved())};const b=app();b.run("abrir('gas')");respaldoPrueba(b,respaldo);assert.equal(b.elements.get('entregaCroquisConfirmado').checked,true);assert.equal(b.run('tramos.length'),5);const c=app(b.saved());c.run("abrir('gas');prepararInformeActual()");assert.equal(c.elements.get('entregaCroquisConfirmado').checked,true);assert.match(c.elements.get('informeImpresion').innerHTML,/CONFIRMADA/);
});
test('respaldo v1: importar no sobrescribe aclaraciones recuperadas con el formulario anterior',()=>{
 const a=app();a.run("abrir('gas')");a.elements.get('duda').value='Texto de la sesión anterior';a.run('guardarDatos()');const proyectos={gas:{aclaracion:'Aclaración recuperada',tramos:[],artefactos:[],foto:'data:image/png;base64,FOTO'},agua:{aclaracion:'AGUA recuperada'},cloacas:{aclaracion:'CLOACAS recuperada'}};respaldoPrueba(a,{formato:'canerias-respaldo-v1',proyectos});assert.equal(a.elements.get('duda').value,'Aclaración recuperada');assert.equal(JSON.parse(a.saved()).gas.aclaracion,'Aclaración recuperada');a.run("abrir('agua')");assert.equal(a.elements.get('duda').value,'AGUA recuperada');
});

function abrirRapidoPrueba(a,i=0){a.run('abrirAccesorios('+i+')');for(const campo of descendientesPresentacion(a.elements.get('camposRapidosGas')))if(campo.id)a.elements.set(campo.id,campo);}
function guardarRapidoPrueba(a,valores={}){for(const k of ['codo90','codo45','tee','reduccion','llave'])a.elements.get('rapidoGas_'+k).value=Object.hasOwn(valores,k)?String(valores[k]):'';a.run('guardarConteoRapidoGas()');}
test('carga rápida: cinco campos editables, pendientes vacíos y cero confirmado',()=>{
 const a=app(null,{embebido:true});proyectoPlan(a);abrirRapidoPrueba(a);const campos=descendientesPresentacion(a.elements.get('camposRapidosGas')).filter(n=>n.type==='number');assert.equal(campos.length,5);assert.ok(campos.every(n=>n.value===''&&n.placeholder==='Pendiente'));guardarRapidoPrueba(a,{codo90:5,codo45:0,tee:1});assert.deepEqual(JSON.parse(a.run('JSON.stringify(conteoRapidoDelTramoGas(tramos[0]))')),{codo90:5,codo45:0,tee:1});assert.match(a.run('resumenConteoRapidoGas(tramos[0])'),/0 \(ausencia confirmada\)/);assert.match(a.run('resumenConteoRapidoGas(tramos[0])'),/Reducciones: Pendiente/);assert.match(a.text('mensajeRapidoGas'),/guardadas/);
});
test('carga rápida: guardado, recarga y edición recuperan cantidades por ID de tramo',()=>{
 const a=app();proyectoPlan(a);abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:5,codo45:2,tee:1,reduccion:0,llave:1});const b=app(a.saved());b.run("abrir('gas')");abrirRapidoPrueba(b);assert.equal(b.elements.get('rapidoGas_codo90').value,5);assert.equal(b.elements.get('rapidoGas_reduccion').value,0);guardarRapidoPrueba(b,{codo90:7,llave:0});const c=app(b.saved());c.run("abrir('gas');editarTramo(0)");c.elements.get('hasta').value='B';c.run('agregarTramo()');abrirRapidoPrueba(c);assert.equal(c.elements.get('rapidoGas_codo90').value,7);assert.equal(c.elements.get('rapidoGas_tee').value,'');assert.equal(c.run('tramos[0].hasta'),'B');assert.equal(c.run('tramos[0].id'),'t');
});
test('carga rápida: cantidades inválidas no guardan cambios parciales',()=>{
 const a=app();proyectoPlan(a);abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:5});const antes=a.saved();for(const n of ['-1','1.5','Infinity','9007199254740992']){guardarRapidoPrueba(a,{codo90:7,llave:n});assert.equal(a.saved(),antes);assert.equal(a.run('conteoRapidoDelTramoGas(tramos[0]).codo90'),5);assert.match(a.text('mensajeRapidoGas'),/enteras/);}
});
test('carga rápida: metadatos nuevos no alteran tramos, resultados técnicos ni lista de compra',()=>{
 const a=app();proyectoPlan(a);const antes=a.run('JSON.stringify({tramos,artefactos,instalacionGas,entrada:entradaMaterialesGas(),plan:revisionMaterialesGas.plan,motor:motorClaseAceroGas(tramos,artefactos,instalacionGas,catalogoParaGas(instalacionGas))})');abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:50,codo45:45,tee:20,reduccion:30,llave:40});a.run('generarPlanGas()');assert.equal(a.run('JSON.stringify({tramos,artefactos,instalacionGas,entrada:entradaMaterialesGas(),plan:revisionMaterialesGas.plan,motor:motorClaseAceroGas(tramos,artefactos,instalacionGas,catalogoParaGas(instalacionGas))})'),antes);
});
test('carga rápida: editor detallado agrega y quita accesorios sin perder cantidades rápidas',()=>{
 const a=app();proyectoPlan(a);abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:5});a.run("nuevoAccesorio();borradorAccesorios[0].metrosAntes=6;borradorAccesorios[0].salida='1\"'");a.elements.get('estadoAccesorios').value='completo';a.elements.get('metrosFinal').value='6';a.run('guardarAccesorios()');assert.equal(a.run('tramos[0].detalle.accesorios.length'),1);assert.equal(a.run('conteoRapidoDelTramoGas(tramos[0]).codo90'),5);abrirRapidoPrueba(a);const quitar=descendientesPresentacion(a.elements.get('filasAccesorios')).find(n=>n.textContent==='Quitar accesorio 1');quitar.onclick();assert.equal(a.run('borradorAccesorios.length'),0);a.elements.get('estadoAccesorios').value='ninguno';a.run('guardarAccesorios()');assert.equal(a.run('tramos[0].detalle.accesorios.length'),0);assert.equal(a.run('conteoRapidoDelTramoGas(tramos[0]).codo90'),5);
});
test('carga rápida: recupera formato del ZIP y lo conserva al editar detalles o corregir cantidades',()=>{
 const a=app();proyectoPlan(a);a.run('tramos[0].detalle.conteoRapido={codo90:4,codo45:0,tee:2};guardarDatos()');const b=app(a.saved());b.run("abrir('gas')");abrirRapidoPrueba(b);assert.equal(b.elements.get('rapidoGas_codo90').value,4);assert.equal(b.elements.get('rapidoGas_codo45').value,0);b.elements.get('estadoAccesorios').value='ninguno';b.run('guardarAccesorios()');assert.equal(b.run('tramos[0].detalle.conteoRapido.tee'),2);abrirRapidoPrueba(b);guardarRapidoPrueba(b,{codo90:6});assert.equal(b.run('conteoRapidoDelTramoGas(tramos[0]).codo90'),6);assert.equal(b.run('tramos[0].detalle.conteoRapido.codo90'),4);assert.equal(b.run('conteoRapidoDelTramoGas(tramos[0]).tee'),undefined);
});
test('carga rápida: tees A y B confirmadas no se duplican ni pierden su confirmación',()=>{
 const a=app();redAndroidEstructurada(a);a.run('detectarAccesoriosGas()');for(const r of registrosDeteccion(a,'tee'))confirmarDeteccion(a,r.propuesta.id);const antes=a.run('JSON.stringify(accesoriosDeteccionConfirmadosGas())');abrirRapidoPrueba(a);guardarRapidoPrueba(a,{tee:8,codo90:17});a.run('detectarAccesoriosGas()');assert.equal(a.run('JSON.stringify(accesoriosDeteccionConfirmadosGas())'),antes);assert.equal(registrosDeteccion(a,'tee').filter(r=>r.estado==='confirmado').length,2);assert.equal(a.run('accesoriosDeteccionConfirmadosGas().filter(p=>p.tipo==="tee").length'),2);
});
test('carga rápida: foto persistente, confirmación y PDF permanecen al guardar y reabrir',()=>{
 const a=app();redAndroidEstructurada(a);const io=lectorFotosPrueba(a),r=io.cargar();io.terminar(r,'data:image/jpeg;base64,INTEGRACION');a.elements.get('entregaCroquisConfirmado').checked=true;a.run('confirmarCroquisEntrega();prepararInformeActual()');const pdf=a.elements.get('informeImpresion').innerHTML;abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:99,tee:22});a.run('prepararInformeActual()');assert.equal(a.elements.get('informeImpresion').innerHTML,pdf);assert.equal(a.elements.get('entregaCroquisConfirmado').checked,true);const b=app(a.saved());b.run("abrir('gas');prepararInformeActual()");assert.equal(b.elements.get('informeImpresion').innerHTML,pdf);assert.equal(b.run('tramos.length'),5);assert.equal(b.elements.get('entregaCroquisConfirmado').checked,true);abrirRapidoPrueba(b);assert.equal(b.elements.get('rapidoGas_codo90').value,99);
});
test('carga rápida: respaldo v1 conserva cantidades nuevas y anteriores, foto y cinco tramos',()=>{
 const a=app();redAndroidEstructurada(a);a.run("tramos[0].detalle.conteoRapido={tee:1};proyectos.gas.foto='data:image/png;base64,BACKUP';mostrarFotoLocal();guardarDatos()");abrirRapidoPrueba(a);guardarRapidoPrueba(a,{tee:2,codo90:5});let contenido;a.ctx.Blob=class{constructor(partes){contenido=partes.join('')}};a.ctx.setTimeout=()=>{};a.ctx.URL.createObjectURL=()=> 'blob:respaldo';a.ctx.document.createElement=()=>({click(){}});a.run('descargarRespaldoCompleto()');const d=JSON.parse(contenido);assert.equal(d.formato,'canerias-respaldo-v1');const b=app();b.run("abrir('gas')");respaldoPrueba(b,d);abrirRapidoPrueba(b);assert.equal(b.elements.get('rapidoGas_tee').value,2);assert.equal(b.run('tramos[0].detalle.conteoRapido.tee'),1);assert.equal(b.run('tramos.length'),5);assert.equal(b.run('fotoURL'),'data:image/png;base64,BACKUP');
});
test('carga rápida: aislamiento entre proyecto, demostración y especialidades',()=>{
 const a=app();proyectoPlan(a);abrirRapidoPrueba(a);guardarRapidoPrueba(a,{tee:2});a.run("seleccionarAmbitoGas('demostracion');tramos=[{id:'t',desde:'X',hasta:'Y',metros:1,diametro:null,consumo:null}];guardarDatos()");abrirRapidoPrueba(a);assert.equal(a.elements.get('rapidoGas_tee').value,'');guardarRapidoPrueba(a,{tee:7});a.run("abrir('agua')");assert.equal(a.run('proyectos.agua.conteosRapidosGas'),undefined);a.run("abrir('gas');seleccionarAmbitoGas('proyecto')");abrirRapidoPrueba(a);assert.equal(a.elements.get('rapidoGas_tee').value,2);a.run("seleccionarAmbitoGas('demostracion')");abrirRapidoPrueba(a);assert.equal(a.elements.get('rapidoGas_tee').value,7);
});
test('carga rápida: renderRedGas con nodos definidos no usa las variables fuera de alcance del ZIP',()=>{
 const a=app();redAndroidEstructurada(a);a.run('renderRedGas()');abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:5});a.run('renderRedGas();guardarDatos()');assert.equal(a.run('instalacionGas.nodos.length'),2);assert.equal(a.run('tramos.length'),5);assert.match(a.text('mensajeRapidoGas'),/guardadas/);
});
test('carga rápida: guardado bloqueado informa sesión sin afirmar persistencia',()=>{
 const a=app(null,{blocked:true});proyectoPlan(a);abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:5});assert.equal(a.saved(),undefined);assert.equal(a.run('conteoRapidoDelTramoGas(tramos[0]).codo90'),5);assert.match(a.text('mensajeRapidoGas'),/sólo en esta sesión/);
});
