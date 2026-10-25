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

test('auditoría final: pantalla incluye las seis correcciones y tabla de nueve filas con ocho columnas',()=>{
 const a=app();a.run("abrir('gas')");const r=a.run('mostrarAuditoriaFinalGas()');assert.equal(r.habilitado,false);assert.equal(r.tabla3.integra,true);assert.equal(r.tabla3.correccionesDocumentadas.length,6);
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
 const a=app();proyectoPlan(a);const card=tarjetasMateriales(a)[0];const qty=descendientesPresentacion(card).find(n=>n.type==='number');qty.value='4';qty.onchange();
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

test('Android: index autónomo contiene exactamente las diecisiete fuentes locales, sin solicitudes de scripts',()=>{
 const bloques=[...html.matchAll(/<script data-local="([^"]+)">\n([\s\S]*?)\n<\/script>/g)];assert.equal(bloques.length,22);assert.doesNotMatch(html,/<script\s+src=/i);
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
function tarjetasMateriales(a){const cards=descendientesPresentacion(a.elements.get('matResultado')).filter(n=>n.className==='gas-material-card');return Array.from(a.run('revisionMaterialesGas.plan.filas'),f=>cards.find(c=>c.claveFilaGas===f.id));}
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
 const a=app();proyectoPlan(a);const sinAviso=s=>{const x=JSON.parse(s);x.plan.avisos=x.plan.avisos.filter(t=>!t.startsWith('Carga rápida:'));return JSON.stringify(x)};const antes=sinAviso(a.run('JSON.stringify({tramos,artefactos,instalacionGas,entrada:entradaMaterialesGas(),plan:revisionMaterialesGas.plan,motor:motorClaseAceroGas(tramos,artefactos,instalacionGas,catalogoParaGas(instalacionGas))})'));abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:50,codo45:45,tee:20,reduccion:30,llave:40});a.run('generarPlanGas()');assert.equal(sinAviso(a.run('JSON.stringify({tramos,artefactos,instalacionGas,entrada:entradaMaterialesGas(),plan:revisionMaterialesGas.plan,motor:motorClaseAceroGas(tramos,artefactos,instalacionGas,catalogoParaGas(instalacionGas))})')),antes);
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
 const a=app();redAndroidEstructurada(a);const io=lectorFotosPrueba(a),r=io.cargar();io.terminar(r,'data:image/jpeg;base64,INTEGRACION');a.elements.get('entregaCroquisConfirmado').checked=true;a.run('confirmarCroquisEntrega();prepararInformeActual()');const sinAviso=d=>d.replace(/<p>Carga rápida:[\s\S]*?<\/p>/g,'');const pdf=sinAviso(a.elements.get('informeImpresion').innerHTML);abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:99,tee:22});a.run('prepararInformeActual()');assert.equal(sinAviso(a.elements.get('informeImpresion').innerHTML),pdf);assert.equal(a.elements.get('entregaCroquisConfirmado').checked,true);const b=app(a.saved());b.run("abrir('gas');prepararInformeActual()");assert.equal(sinAviso(b.elements.get('informeImpresion').innerHTML),pdf);assert.equal(b.run('tramos.length'),5);assert.equal(b.elements.get('entregaCroquisConfirmado').checked,true);abrirRapidoPrueba(b);assert.equal(b.elements.get('rapidoGas_codo90').value,99);
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

function filaConcPrueba(a,tipo='codo90',id=null){a.ctx.concTipo=tipo;a.ctx.concTramo=id;return a.run('filasConciliacionGas().find(f=>f.tipo===concTipo&&(!concTramo||f.tramo.id===concTramo))');}
function conciliarPrueba(a,f,{incluidos=[],fuera=[],adicionales=0,nodo=null,alcance=true,confirmar=true}={}){a.ctx.concClave=f.clave;a.ctx.concEdicion={vinculos:Object.fromEntries([...incluidos.map(x=>[x,'incluido']),...fuera.map(x=>[x,'fuera'])]),adicionales,nodo,alcance};return a.run('guardarConciliacionGas(concClave,concEdicion,'+confirmar+')');}
test('conciliación: vacío, cero confirmado y cantidad confirmada conservan su diferencia',()=>{
 const a=app();proyectoPlan(a);abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo45:0,codo90:5});assert.equal(filaConcPrueba(a,'tee').cantidad,null);assert.equal(filaConcPrueba(a,'codo45').cantidad,0);assert.equal(filaConcPrueba(a).cantidad,5);assert.equal(conciliarPrueba(a,filaConcPrueba(a,'tee')),false);assert.equal(conciliarPrueba(a,filaConcPrueba(a,'codo45')),true);assert.equal(a.run('accesoriosRapidosConciliadosGas(entradaMaterialesGas("proyecto",false,true)).length'),0);
});
test('conciliación: total de cinco codos con dos registrados incorpora sólo tres adicionales',()=>{
 const a=app();proyectoPlan(a);a.run("tramos[0].detalle={estado:'pendiente',accesorios:[{tipo:'codo90',metrosAntes:2},{tipo:'codo90',metrosAntes:3}]}");abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:5});let f=filaConcPrueba(a);assert.equal(f.candidatos.length,2);assert.equal(conciliarPrueba(a,f,{incluidos:f.candidatos.map(p=>p.id),adicionales:3}),true);a.run('generarPlanGas()');assert.equal(a.run('revisionMaterialesGas.plan.filas.filter(x=>x.tipo==="codo90").reduce((s,x)=>s+x.cantidad,0)'),5);assert.equal(a.run('entradaMaterialesGas().extras.find(x=>x.idFisico.startsWith("conciliacion:")).medidas.length'),0);
});
test('conciliación: ambigüedad, alcance sin confirmar y suma incorrecta bloquean adicionales',()=>{
 const a=app();proyectoPlan(a);a.run("datosPlanGas().extras.push({idFisico:'incierta',tipo:'codo90',cantidad:1,medidas:[],ubicacion:'Sin ubicación',confirmado:true})");abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:2});const f=filaConcPrueba(a);assert.equal(conciliarPrueba(a,f,{adicionales:2}),false);assert.match(a.text('conciliacionMensaje'),/ambigua/);assert.equal(conciliarPrueba(a,f,{fuera:f.candidatos.map(p=>p.id),adicionales:2,alcance:false}),false);assert.equal(conciliarPrueba(a,f,{incluidos:f.candidatos.map(p=>p.id),adicionales:2}),false);assert.equal(a.run('accesoriosRapidosConciliadosGas(entradaMaterialesGas("proyecto",false,true)).length'),0);
});
test('conciliación: cero no borra accesorios registrados ni permite excluir una pieza del mismo tramo',()=>{
 const a=app();proyectoPlan(a);a.run("tramos[0].llave=true");abrirRapidoPrueba(a);guardarRapidoPrueba(a,{llave:0});const f=filaConcPrueba(a,'llave');assert.equal(f.candidatos.length,1);assert.equal(conciliarPrueba(a,f,{incluidos:f.candidatos.map(p=>p.id)}),false);assert.equal(conciliarPrueba(a,f,{fuera:f.candidatos.map(p=>p.id)}),false);assert.equal(a.run('entradaMaterialesGas().tramos[0].accesorios.filter(x=>x.tipo==="llave").length'),1);
});
test('conciliación: tees A/B y tres llaves confirmadas no se duplican al vincular conteos rápidos',()=>{
 const a=app();redAndroidEstructurada(a);a.run('detectarAccesoriosGas()');for(const r of registrosDeteccion(a).filter(r=>['tee','llave'].includes(r.propuesta.tipo)))confirmarDeteccion(a,r.propuesta.id);
 abrirRapidoPrueba(a,0);guardarRapidoPrueba(a,{tee:1});let f=filaConcPrueba(a,'tee','d0');assert.equal(f.candidatos.length,1);assert.equal(conciliarPrueba(a,f,{incluidos:f.candidatos.map(p=>p.id)}),true);
 abrirRapidoPrueba(a,1);guardarRapidoPrueba(a,{tee:1});f=filaConcPrueba(a,'tee','d1');const enB=f.candidatos.filter(p=>p.etiqueta.includes('B'));const enA=f.candidatos.filter(p=>!enB.includes(p));assert.equal(conciliarPrueba(a,f,{incluidos:enB.map(p=>p.id),fuera:enA.map(p=>p.id)}),true);
 for(const i of [2,3,4]){abrirRapidoPrueba(a,i);guardarRapidoPrueba(a,{llave:1});f=filaConcPrueba(a,'llave','d'+i);assert.equal(conciliarPrueba(a,f,{incluidos:f.candidatos.map(p=>p.id)}),true);}
 a.run('generarPlanGas()');assert.equal(a.run('revisionMaterialesGas.plan.filas.filter(x=>x.tipo==="tee").reduce((s,x)=>s+x.cantidad,0)'),2);assert.equal(a.run('revisionMaterialesGas.plan.filas.filter(x=>x.tipo==="llave").reduce((s,x)=>s+x.cantidad,0)'),3);
});
test('conciliación: tee adicional en un punto ocupado o sin posición queda pendiente',()=>{
 const a=app();redAndroidEstructurada(a);a.run('detectarAccesoriosGas()');for(const r of registrosDeteccion(a,'tee'))confirmarDeteccion(a,r.propuesta.id);abrirRapidoPrueba(a,0);guardarRapidoPrueba(a,{tee:1});const f=filaConcPrueba(a,'tee','d0');assert.equal(conciliarPrueba(a,f,{fuera:f.candidatos.map(p=>p.id),adicionales:1,nodo:'n-a'}),false);assert.match(a.text('conciliacionMensaje'),/existe una pieza/);assert.equal(conciliarPrueba(a,f,{fuera:f.candidatos.map(p=>p.id),adicionales:1}),false);assert.match(a.text('conciliacionMensaje'),/punto real/);
});
test('conciliación: borradores ambiguos, cambios de cantidad y de piezas conservan vínculos e invalidan la suma',()=>{
 const a=app();proyectoPlan(a);abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:2});let f=filaConcPrueba(a);assert.equal(conciliarPrueba(a,f,{adicionales:2,confirmar:false}),true);assert.equal(a.run('entradaMaterialesGas().extras.length'),0);assert.equal(conciliarPrueba(a,f,{adicionales:2}),true);assert.equal(a.run('entradaMaterialesGas().extras.length'),1);abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:3});assert.equal(a.run('entradaMaterialesGas().extras.length'),0);assert.ok(a.run('!!proyectos.gas.conciliacionRapidaGas.registros[concClave]'));f=filaConcPrueba(a);conciliarPrueba(a,f,{adicionales:3});assert.equal(a.run('proyectos.gas.conciliacionRapidaGas.historial.length'),2);a.run("tramos[0].detalle={estado:'pendiente',accesorios:[{tipo:'codo90',metrosAntes:1}]};guardarDatos()");assert.equal(a.run('entradaMaterialesGas().extras.length'),0);
});
test('conciliación: foto, firma visual, motor no cambian; compra y cuplas sin posiciones quedan pendientes al confirmar cantidades',()=>{
 const a=app();proyectoPlan(a);a.run("proyectos.gas.foto='data:image/png;base64,CONCILIACION';mostrarFotoLocal()");a.elements.get('entregaCroquisConfirmado').checked=true;a.run('confirmarCroquisEntrega()');const antes=a.run('JSON.stringify({tramos,motor:motorClaseAceroGas(tramos,artefactos,instalacionGas,catalogoParaGas(instalacionGas))})');abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:5});conciliarPrueba(a,filaConcPrueba(a),{adicionales:5});assert.equal(a.run('JSON.stringify({tramos,motor:motorClaseAceroGas(tramos,artefactos,instalacionGas,catalogoParaGas(instalacionGas))})'),antes);assert.equal(a.run('revisionMaterialesGas.plan.planes[0].compraEstimada'),null);assert.equal(a.run('revisionMaterialesGas.plan.planes[0].cuplasPropuestas'),null);assert.equal(a.elements.get('entregaCroquisConfirmado').checked,true);a.run('prepararInformeActual()');assert.match(a.elements.get('informeImpresion').innerHTML,/CONCILIACION/);assert.match(a.elements.get('informeImpresion').innerHTML,/conciliados/);assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
});
test('conciliación: respaldo v1 y recarga conservan revisión, vínculos e historial y no duplican adicionales',()=>{
 const a=app();proyectoPlan(a);abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:2});let f=filaConcPrueba(a);conciliarPrueba(a,f,{adicionales:2,confirmar:false});conciliarPrueba(a,f,{adicionales:2});a.run('guardarDatos()');const d={formato:'canerias-respaldo-v1',proyectos:JSON.parse(a.saved())};const b=app();b.run("abrir('gas')");respaldoPrueba(b,d);b.run('generarPlanGas()');assert.equal(b.run('proyectos.gas.conciliacionRapidaGas.historial.length'),1);assert.equal(b.run('entradaMaterialesGas().extras.filter(x=>x.idFisico.startsWith("conciliacion:")).length'),1);const c=app(b.saved());c.run("abrir('gas');generarPlanGas();generarPlanGas()");assert.equal(c.run('revisionMaterialesGas.plan.filas.filter(x=>x.tipo==="codo90").reduce((s,x)=>s+x.cantidad,0)'),2);
});
test('conciliación: sugerencia no confirmada no se cuenta y confirmar luego obliga a revisar coincidencias',()=>{
 const a=app();redAndroidEstructurada(a);a.run('detectarAccesoriosGas()');abrirRapidoPrueba(a,2);guardarRapidoPrueba(a,{llave:1});const f=filaConcPrueba(a,'llave','d2');assert.equal(f.candidatos.length,0);assert.equal(conciliarPrueba(a,f,{adicionales:1}),true);const sugerencia=registrosDeteccion(a,'llave').find(r=>r.propuesta.tramo==='d2');confirmarDeteccion(a,sugerencia.propuesta.id);assert.equal(a.run('entradaMaterialesGas().extras.filter(x=>x.idFisico.startsWith("conciliacion:")).length'),0);assert.equal(a.run('entradaMaterialesGas().extras.filter(x=>x.tipo==="llave").length'),1);
});
test('conciliación: piezas físicas con alias de nodo se reconocen como conflicto previo para no sumar duplicados',()=>{
 const a=app();redAndroidEstructurada(a);a.run("datosPlanGas().extras=[{tipo:'tee',nodo:'n-a',cantidad:1,medidas:[],confirmado:true},{tipo:'tee',nodo:'nombre:a',cantidad:1,medidas:[],confirmado:true}]");abrirRapidoPrueba(a,0);guardarRapidoPrueba(a,{tee:1});const f=filaConcPrueba(a,'tee','d0');assert.equal(f.candidatos.length,1);assert.equal(conciliarPrueba(a,f,{incluidos:f.candidatos.map(p=>p.id)}),false);assert.equal(a.run('entradaMaterialesGas().extras.filter(x=>x.idFisico?.startsWith("conciliacion:")).length'),0);
});
test('conciliación: una cantidad manualmente ajustada impide sumar piezas hasta revisar el ajuste',()=>{
 const a=app();proyectoPlan(a);a.run("tramos[0].llave=true;generarPlanGas();revisionMaterialesGas.plan.filas.find(f=>f.tipo==='llave').cantidad=3;revisionMaterialesGas.plan.filas.find(f=>f.tipo==='llave').editado=true;revisionMaterialesGas.plan.filas.find(f=>f.tipo==='llave').cantidadCalculada=1;guardarRevisionMaterialesGas()");abrirRapidoPrueba(a);guardarRapidoPrueba(a,{llave:3});const f=filaConcPrueba(a,'llave');assert.equal(conciliarPrueba(a,f,{incluidos:f.candidatos.map(p=>p.id),adicionales:2}),false);assert.match(a.text('conciliacionMensaje'),/ajustadas manualmente/);assert.equal(a.run('revisionMaterialesGas.plan.filas.find(f=>f.tipo==="llave").cantidad'),3);
});
test('conciliación: cambios reductores integrados no producen otra reducción independiente',()=>{
 const a=app();proyectoPlan(a);a.run("tramos[0].detalle={estado:'pendiente',accesorios:[{tipo:'codo90',metrosAntes:1,salida:'3/4\"'}]}");abrirRapidoPrueba(a);guardarRapidoPrueba(a,{reduccion:1});const f=filaConcPrueba(a,'reduccion');assert.equal(f.candidatos.length,1);assert.equal(f.candidatos[0].reductor,true);assert.equal(conciliarPrueba(a,f,{incluidos:f.candidatos.map(p=>p.id)}),true);assert.equal(a.run('entradaMaterialesGas().extras.filter(x=>x.tipo==="reduccion").length'),0);
});
test('conciliación: dos adicionales de tee en el mismo punto quedan pendientes en ambos tramos',()=>{
 const a=app();redAndroidEstructurada(a);abrirRapidoPrueba(a,0);guardarRapidoPrueba(a,{tee:1});conciliarPrueba(a,filaConcPrueba(a,'tee','d0'),{adicionales:1,nodo:'n-a'});assert.equal(a.run('entradaMaterialesGas().extras.filter(x=>x.tipo==="tee").length'),1);abrirRapidoPrueba(a,1);guardarRapidoPrueba(a,{tee:1});conciliarPrueba(a,filaConcPrueba(a,'tee','d1'),{adicionales:1,nodo:'n-a'});assert.equal(a.run('entradaMaterialesGas().extras.filter(x=>x.tipo==="tee").length'),0);assert.match(a.text('conciliacionMensaje'),/misma pieza/);
});
test('conciliación: agregar codos conserva un ajuste manual de llaves sin reutilizar índices',()=>{
 const a=app();proyectoPlan(a);a.run("datosPlanGas().extras.push({idFisico:'llave-manual',tipo:'llave',cantidad:1,medidas:['1\"'],ubicacion:'M–A',confirmado:true});generarPlanGas();const filaLlave=revisionMaterialesGas.plan.filas.find(x=>x.tipo==='llave');filaLlave.cantidadCalculada=1;filaLlave.cantidad=3;filaLlave.editado=true;guardarRevisionMaterialesGas()");abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:2});assert.equal(conciliarPrueba(a,filaConcPrueba(a),{adicionales:2}),true);assert.equal(a.run('revisionMaterialesGas.plan.filas.find(x=>x.tipo==="llave").cantidad'),3);assert.equal(a.run('revisionMaterialesGas.plan.filas.find(x=>x.tipo==="llave").editado'),true);
});
test('conciliación: proyecto y demostración con ID idéntico no comparten revisiones',()=>{
 const a=app();proyectoPlan(a);abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:2});conciliarPrueba(a,filaConcPrueba(a),{adicionales:2});a.run("seleccionarAmbitoGas('demostracion');tramos=[{id:'t',desde:'M',hasta:'A',metros:12,diametro:null,consumo:null,detalle:{estado:'pendiente'}}];guardarDatos()");abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:7});assert.equal(a.run('entradaMaterialesGas().extras.filter(x=>x.idFisico?.startsWith("conciliacion:")).length'),0);a.run("seleccionarAmbitoGas('proyecto')");assert.equal(a.run('entradaMaterialesGas().extras.find(x=>x.idFisico?.startsWith("conciliacion:")).cantidad'),2);
});
test('conciliación: controles de revisión guardan borrador y confirman sin perder valores',()=>{
 const a=app();proyectoPlan(a);abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:2});a.run('renderConciliacionRapidaGas()');let card=descendientesPresentacion(a.elements.get('conciliacionFilas')).find(x=>x.className==='detalle');let ns=descendientesPresentacion(card);ns.find(x=>x.type==='number').value='2';ns.find(x=>x.type==='checkbox').checked=true;ns.find(x=>x.textContent==='Guardar revisión pendiente').onclick();assert.equal(a.run('entradaMaterialesGas().extras.filter(x=>x.idFisico?.startsWith("conciliacion:")).length'),0);card=descendientesPresentacion(a.elements.get('conciliacionFilas')).find(x=>x.className==='detalle');ns=descendientesPresentacion(card);assert.equal(ns.find(x=>x.type==='number').value,2);ns.find(x=>x.textContent==='Confirmar para materiales').onclick();assert.equal(a.run('entradaMaterialesGas().extras.find(x=>x.idFisico?.startsWith("conciliacion:")).cantidad'),2);
});
test('conciliación: almacenamiento bloqueado conserva revisión en sesión con aviso y sin falsa confirmación de guardado',()=>{
 const a=app(null,{blocked:true});proyectoPlan(a);abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:2});assert.equal(conciliarPrueba(a,filaConcPrueba(a),{adicionales:2}),true);assert.match(a.text('conciliacionMensaje'),/sólo en sesión/);assert.equal(a.saved(),undefined);assert.equal(a.run('entradaMaterialesGas().extras.find(x=>x.idFisico?.startsWith("conciliacion:")).cantidad'),2);
});
test('conciliación: revisión importada con formato desconocido no se sobrescribe',()=>{
 const a=app();proyectoPlan(a);abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:2});a.run('proyectos.gas.conciliacionRapidaGas={version:99,registros:{dato:"conservar"}}');const antes=a.run('JSON.stringify(proyectos.gas.conciliacionRapidaGas)');assert.equal(conciliarPrueba(a,filaConcPrueba(a),{adicionales:2}),false);assert.equal(a.run('JSON.stringify(proyectos.gas.conciliacionRapidaGas)'),antes);assert.match(a.text('conciliacionMensaje'),/sin sobrescribir/);
});

function prepararABSincronizacion(a){
 redAndroidEstructurada(a);a.run("instalacionGas.nodos.push({id:'n-b',nombre:'B',tipo:'derivacion'});tramos[1].red={desde:'n-a',hasta:'n-b',via:'ramal'};tramos[1].detalle={estado:'pendiente',accesorios:[{tipo:'codo90',metrosAntes:2},{tipo:'codo90',metrosAntes:3}]};guardarDatos()");abrirRapidoPrueba(a,1);guardarRapidoPrueba(a,{codo90:1,tee:1});
}
function corregirTeeABPorControles(a){
 a.run('abrirAccesorios(1)');let fila=a.elements.get('filasAccesorios').children[1];const select=descendientesPresentacion(fila).find(n=>n.tagName==='SELECT');select.value='tee';select.onchange();fila=a.elements.get('filasAccesorios').children[1];const label=descendientesPresentacion(fila).find(n=>n.tagName==='LABEL'&&n.textContent.startsWith('Nombre único'));label.children[0].value='B';label.children[0].oninput();a.run('guardarAccesorios()');
}
test('sincronización: guardar codo a tee actualiza la pantalla aunque no haya plan de materiales activo',()=>{
 const a=app(null,{embebido:true});prepararABSincronizacion(a);a.run('revisionMaterialesGas=null;renderConciliacionRapidaGas()');const anteriores=descendientesPresentacion(a.elements.get('conciliacionFilas')).filter(n=>n.textContent?.startsWith('Codo 90° ·')).length;assert.equal(anteriores,2);corregirTeeABPorControles(a);assert.equal(filaConcPrueba(a,'codo90','d1').candidatos.length,1);assert.equal(filaConcPrueba(a,'tee','d1').candidatos.length,1);assert.equal(descendientesPresentacion(a.elements.get('conciliacionFilas')).filter(n=>n.textContent?.startsWith('Codo 90° ·')).length,1);assert.deepEqual(Array.from(a.run('tramos[1].detalle.accesorios'),p=>p.tipo),['codo90','tee']);assert.deepEqual(JSON.parse(a.saved()).gas.tramos[1].detalle.accesorios.map(p=>p.tipo),['codo90','tee']);const b=app(a.saved());b.run("abrir('gas')");assert.equal(filaConcPrueba(b,'codo90','d1').candidatos.length,1);assert.equal(filaConcPrueba(b,'tee','d1').candidatos.length,1);
});
test('sincronización: una tee de ramal con giro 90 no se convierte también en codo',()=>{
 const a=app();prepararABSincronizacion(a);corregirTeeABPorControles(a);a.run("datosPlanGas().extras.push({idFisico:'tee-b-manual',tipo:'tee',nodo:'n-b',cantidad:1,medidas:[],confirmado:true});generarPlanGas()");assert.equal(a.run('revisionMaterialesGas.plan.filas.filter(p=>p.tipo==="codo90").reduce((s,p)=>s+p.cantidad,0)'),1);assert.equal(a.run('revisionMaterialesGas.plan.filas.filter(p=>p.tipo==="tee").reduce((s,p)=>s+p.cantidad,0)'),1);assert.equal(a.run('tramos[1].red.via'),'ramal');
});
test('sincronización: corregir sólo carga rápida no altera en silencio el detalle anterior',()=>{
 const a=app();prepararABSincronizacion(a);assert.deepEqual(Array.from(a.run('tramos[1].detalle.accesorios'),p=>p.tipo),['codo90','codo90']);assert.match(a.text('mensajeRapidoGas'),/detalle no cambió/);assert.equal(a.run('conteoRapidoDelTramoGas(tramos[1]).tee'),1);
});
test('sincronización: un borrador de conciliación y sus desplegables se conservan en actualizaciones sin cambios de origen',()=>{
 const a=app();proyectoPlan(a);abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:2});let grupo=a.elements.get('conciliacionFilas').children[0];grupo.open=true;let card=descendientesPresentacion(grupo).find(n=>n.className==='detalle');card.open=true;let ns=descendientesPresentacion(card);ns.find(n=>n.type==='number').value='2';ns.find(n=>n.type==='checkbox').checked=true;a.run('guardarDatos();renderConciliacionRapidaGas()');grupo=a.elements.get('conciliacionFilas').children[0];card=descendientesPresentacion(grupo).find(n=>n.className==='detalle');ns=descendientesPresentacion(card);assert.equal(grupo.open,true);assert.equal(card.open,true);assert.equal(ns.find(n=>n.type==='number').value,2);assert.equal(ns.find(n=>n.type==='checkbox').checked,true);assert.equal(a.run('proyectos.gas.conciliacionRapidaGas'),undefined);
});
test('sincronización: calcular adicionales exige coincidencias resueltas y no confirma ni guarda por sí mismo',()=>{
 const a=app();proyectoPlan(a);a.run("tramos[0].detalle={estado:'pendiente',accesorios:[{tipo:'codo90',metrosAntes:2}]};guardarDatos()");abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:2});let card=descendientesPresentacion(a.elements.get('conciliacionFilas')).find(n=>n.className==='detalle'),ns=descendientesPresentacion(card);const proponer=ns.find(n=>n.textContent==='Calcular adicionales según mis coincidencias');proponer.onclick();assert.match(a.text('conciliacionMensaje'),/Resolvé/);ns.find(n=>n.tagName==='SELECT').value='incluido';proponer.onclick();assert.equal(ns.find(n=>n.type==='number').value,1);assert.equal(a.run('proyectos.gas.conciliacionRapidaGas'),undefined);assert.equal(a.run('entradaMaterialesGas().extras.length'),0);
});
test('navegación: accesos directos y edición desde conciliación abren las secciones correctas',()=>{
 const a=app();prepararABSincronizacion(a);a.run("irSeccionGas('conciliacion')");assert.equal(a.elements.get('conciliacionRapidaGas').open,true);assert.equal(a.elements.get('planCompraGas').classList.hidden,false);a.run("editarDetalleDesdeConciliacionGas('d1')");assert.equal(a.run('editandoAccesorios'),1);assert.equal(a.elements.get('detalleAccesorios').open,true);assert.match(a.text('errorAccesorios'),/Una tee con giro/);a.run('guardarDetalleYConciliarGas()');assert.equal(a.elements.get('conciliacionRapidaGas').open,true);assert.equal(a.run('editandoAccesorios'),-1);
});
test('sincronización: tipos vacíos se pueden plegar sin convertir pendientes en cero',()=>{
 const a=app();proyectoPlan(a);abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:2});a.elements.get('conciliacionSoloCargados').checked=true;a.run('renderConciliacionRapidaGas()');assert.equal(descendientesPresentacion(a.elements.get('conciliacionFilas')).filter(n=>n.className==='detalle').length,1);a.elements.get('conciliacionSoloCargados').checked=false;a.run('renderConciliacionRapidaGas()');assert.equal(descendientesPresentacion(a.elements.get('conciliacionFilas')).filter(n=>n.className==='detalle').length,5);assert.equal(a.run('conteoRapidoDelTramoGas(tramos[0]).tee'),undefined);
});
test('sincronización: fotografía, cinco tramos, respaldos y motor se conservan tras corregir A-B',()=>{
 const a=app();prepararABSincronizacion(a);a.run("proyectos.gas.foto='data:image/png;base64,AB';mostrarFotoLocal();guardarDatos()");corregirTeeABPorControles(a);abrirRapidoPrueba(a,1);guardarRapidoPrueba(a,{codo90:1,tee:1});for(const tipo of ['codo90','tee']){const f=filaConcPrueba(a,tipo,'d1');assert.equal(conciliarPrueba(a,f,{incluidos:f.candidatos.map(p=>p.id)}),true);}const b=app();b.run("abrir('gas')");respaldoPrueba(b,{formato:'canerias-respaldo-v1',proyectos:JSON.parse(a.saved())});b.run('prepararInformeActual()');assert.equal(b.run('tramos.length'),5);assert.equal(b.run('fotoURL'),'data:image/png;base64,AB');assert.match(b.elements.get('informeImpresion').innerHTML,/src="data:image\/png;base64,AB"/);assert.equal(filaConcPrueba(b,'tee','d1').candidatos.length,1);assert.equal(b.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
});
test('sincronización: detalle inválido muestra el error y no vuelve a conciliación como si se hubiese guardado',()=>{
 const a=app();prepararABSincronizacion(a);a.run("abrirAccesorios(1);borradorAccesorios[1].tipo='tee';borradorAccesorios[1].nodo=''");a.elements.get('estadoAccesorios').value='completo';a.elements.get('metrosFinal').value='0';a.run('guardarDetalleYConciliarGas()');assert.equal(a.run('editandoAccesorios'),1);assert.deepEqual(Array.from(a.run('tramos[1].detalle.accesorios'),p=>p.tipo),['codo90','codo90']);assert.match(a.text('errorAccesorios'),/Completá|tee/);
});

function casoFueraAB(a){prepararABSincronizacion(a);a.run("tramos[1].detalle={estado:'pendiente',accesorios:[{tipo:'codo90',metrosAntes:1},{tipo:'tee',nodo:'B',metrosAntes:2},{tipo:'codo90',metrosAntes:2}]};guardarDatos()");abrirRapidoPrueba(a,1);guardarRapidoPrueba(a,{codo90:1,codo45:0,tee:1,llave:0});const f=filaConcPrueba(a,'codo90','d1');a.ctx.claveFueraAB=f.clave;return a.run('vistaConciliacionGas.find(v=>v.clave===claveFueraAB)');}
test('rechazo visible: caso A-B 1 incluido, 3 fuera, total 1 y adicionales 0 explica el bloqueo en la misma tarjeta',()=>{
 const a=app(null,{embebido:true});const v=casoFueraAB(a);assert.equal(v.controles.length,2);v.controles[0][1].value='incluido';v.controles[1][1].value='fuera';v.cantidad.value='0';v.alcance.checked=true;const antes=a.saved();descendientesPresentacion(v.card).find(n=>n.textContent==='Confirmar para materiales').onclick();assert.equal(a.saved(),antes);const respuesta=descendientesPresentacion(v.card).find(n=>n.className?.includes('conciliacion-respuesta'));assert.ok(respuesta,'El rechazo debe verse junto al botón, no sólo arriba de la página');assert.equal(respuesta.hidden,false);assert.match(respuesta.textContent,/No conciliado/);assert.match(respuesta.textContent,/Editar detalle A–B/);assert.match(respuesta.textContent,/Fuera de este conteo/);assert.equal(a.run('estadoConciliacionGas().find(f=>f.clave===claveFueraAB).error!==null'),true);assert.equal(a.run('entradaMaterialesGas().extras.filter(x=>x.idFisico?.startsWith("conciliacion:")).length'),0);
});
test('rechazo visible: ceros de codos45 y llaves siguen conciliando con respuesta local positiva',()=>{
 const a=app();casoFueraAB(a);for(const tipo of ['codo45','llave']){const f=filaConcPrueba(a,tipo,'d1');assert.equal(conciliarPrueba(a,f),true);a.ctx.claveCero=f.clave;const v=a.run('vistaConciliacionGas.find(v=>v.clave===claveCero)');assert.match(v.respuesta.textContent,/Revisión confirmada/);assert.equal(v.respuesta.hidden,false);assert.equal(v.respuesta.role,'status');assert.equal(a.run('estadoConciliacionGas().find(f=>f.clave===claveCero).error'),null);}
});
test('rechazo visible: enfoca el aviso junto al botón y conserva selecciones después de actualizar',()=>{
 const a=app();let v=casoFueraAB(a);v.controles[0][1].value='incluido';v.controles[1][1].value='fuera';v.cantidad.value='0';v.alcance.checked=true;let foco=0,scroll=0;v.respuesta.focus=()=>foco++;v.respuesta.scrollIntoView=()=>scroll++;descendientesPresentacion(v.card).find(n=>n.textContent==='Confirmar para materiales').onclick();assert.equal(foco,1);assert.equal(scroll,1);assert.equal(v.card.open,true);assert.equal(v.grupo.open,true);assert.equal(v.respuesta.role,'alert');a.run('guardarDatos();renderConciliacionRapidaGas()');v=a.run('vistaConciliacionGas.find(v=>v.clave===claveFueraAB)');assert.equal(v.controles[0][1].value,'incluido');assert.equal(v.controles[1][1].value,'fuera');assert.equal(v.cantidad.value,0);assert.equal(v.alcance.checked,true);assert.match(v.respuesta.textContent,/No conciliado/);assert.equal(v.respuesta.hidden,false);
});
test('rechazo visible: revisar explícitamente el detalle hasta un codo y una tee B permite conciliar sin duplicar',()=>{
 const a=app();const v=casoFueraAB(a);const originales=a.run('JSON.stringify(tramos[1].detalle)');v.controles[0][1].value='incluido';v.controles[1][1].value='fuera';v.cantidad.value='0';v.alcance.checked=true;descendientesPresentacion(v.card).find(n=>n.textContent==='Confirmar para materiales').onclick();assert.equal(a.run('JSON.stringify(tramos[1].detalle)'),originales);a.run('editarDetalleDesdeConciliacionGas("d1")');descendientesPresentacion(a.elements.get('filasAccesorios')).find(n=>n.textContent==='Quitar accesorio 3').onclick();a.run('guardarDetalleYConciliarGas()');assert.deepEqual(Array.from(a.run('tramos[1].detalle.accesorios'),p=>p.tipo),['codo90','tee']);assert.equal(a.run('tramos[1].detalle.accesorios[1].nodo'),'B');for(const tipo of ['codo90','tee']){const f=filaConcPrueba(a,tipo,'d1');assert.equal(f.candidatos.length,1);assert.equal(conciliarPrueba(a,f,{incluidos:f.candidatos.map(p=>p.id)}),true);}a.run('generarPlanGas()');for(const tipo of ['codo90','tee']){a.ctx.tipoVerificado=tipo;assert.equal(a.run('revisionMaterialesGas.plan.filas.filter(p=>p.tipo===tipoVerificado).reduce((s,p)=>s+p.cantidad,0)'),1);}assert.equal(a.run('entradaMaterialesGas().extras.filter(x=>x.idFisico?.startsWith("conciliacion:")).length'),0);
});
test('rechazo visible: Fuera sigue permitido para una pieza que el usuario ubica fuera del alcance',()=>{
 const a=app();proyectoPlan(a);a.run("datosPlanGas().extras.push({idFisico:'ubicacion-pendiente',tipo:'codo90',cantidad:1,medidas:[],ubicacion:'Ubicación sin identificar',confirmado:true});guardarDatos()");abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:1});const f=filaConcPrueba(a);assert.equal(f.candidatos[0].directa,false);assert.equal(conciliarPrueba(a,f,{fuera:f.candidatos.map(p=>p.id),adicionales:1}),true);assert.match(a.text('conciliacionMensaje'),/Revisión confirmada/);
});
test('rechazo visible: borrador guardado con el conflicto viaja en respaldo sin aparentar conciliación',()=>{
 const a=app();const v=casoFueraAB(a);v.controles[0][1].value='incluido';v.controles[1][1].value='fuera';v.cantidad.value='0';v.alcance.checked=true;descendientesPresentacion(v.card).find(n=>n.textContent==='Guardar revisión pendiente').onclick();const b=app();b.run("abrir('gas')");respaldoPrueba(b,{formato:'canerias-respaldo-v1',proyectos:JSON.parse(a.saved())});const f=filaConcPrueba(b,'codo90','d1');b.ctx.claveBorrador=f.clave;assert.equal(b.run('proyectos.gas.conciliacionRapidaGas.registros[claveBorrador].confirmado'),false);assert.equal(b.run('entradaMaterialesGas().extras.filter(x=>x.idFisico?.startsWith("conciliacion:")).length'),0);assert.equal(b.run('tramos[1].detalle.accesorios.length'),3);
});

function propuestasFlujo(a){return a.run('estadoConciliacionGas().map(propuestaCoincidenciaGas).filter(Boolean)');}
function confirmarFlujo(a,items=propuestasFlujo(a)){a.ctx.propuestasFlujo=items;return a.run('confirmarCoincidenciasClarasGas(propuestasFlujo)');}
test('flujo simple: propone total exacto y ceros en un lote explícito sin crear accesorios',()=>{
 const a=app(null,{embebido:true});proyectoPlan(a);a.run("tramos[0].detalle={estado:'pendiente',accesorios:[{tipo:'codo90',metrosAntes:2},{tipo:'codo90',metrosAntes:3}]};guardarDatos()");abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:2,codo45:0,tee:0,llave:0});const p=propuestasFlujo(a);assert.equal(p.length,4);assert.equal(a.run('proyectos.gas.conciliacionRapidaGas'),undefined);const r=confirmarFlujo(a,p);assert.equal(r.confirmadas,4);assert.equal(a.run('entradaMaterialesGas().extras.filter(p=>p.idFisico?.startsWith("conciliacion:")).length'),0);assert.equal(a.run('revisionMaterialesGas.plan.filas.filter(p=>p.tipo==="codo90").reduce((s,p)=>s+p.cantidad,0)'),2);
});
test('flujo simple: no propone contradicciones, piezas sin ubicación ni revisiones manuales guardadas',()=>{
 const a=app();prepararABSincronizacion(a);assert.ok(!propuestasFlujo(a).some(p=>p.clave===JSON.stringify(['d1','codo90'])));const b=app();proyectoPlan(b);b.run("datosPlanGas().extras.push({tipo:'codo90',cantidad:1,ubicacion:'Sin ubicar',medidas:[],confirmado:true});guardarDatos()");abrirRapidoPrueba(b);guardarRapidoPrueba(b,{codo90:1});assert.equal(propuestasFlujo(b).length,0);const c=app();proyectoPlan(c);abrirRapidoPrueba(c);guardarRapidoPrueba(c,{codo45:0});conciliarPrueba(c,filaConcPrueba(c,'codo45'),{confirmar:false});assert.equal(propuestasFlujo(c).length,0);
});
test('flujo simple: la propuesta se invalida si el origen cambia antes de confirmar',()=>{
 const a=app();proyectoPlan(a);abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo45:0});const p=propuestasFlujo(a);a.run("tramos[0].detalle={estado:'pendiente',accesorios:[{tipo:'codo45',metrosAntes:1}]};guardarDatos()");const antes=a.saved();assert.equal(confirmarFlujo(a,p).confirmadas,0);assert.equal(a.saved(),antes);assert.equal(a.run('proyectos.gas.conciliacionRapidaGas'),undefined);
});
test('flujo simple: repetir un lote no duplica confirmaciones ni historial',()=>{
 const a=app();proyectoPlan(a);abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:0,codo45:0});const p=propuestasFlujo(a);assert.equal(confirmarFlujo(a,p).confirmadas,2);const antes=a.run('JSON.stringify(proyectos.gas.conciliacionRapidaGas)');assert.equal(confirmarFlujo(a,p).confirmadas,0);assert.equal(a.run('JSON.stringify(proyectos.gas.conciliacionRapidaGas)'),antes);
});
test('flujo simple: tee conocida compartida puede vincularse en varios tramos sin sumar piezas',()=>{
 const a=app();redAndroidEstructurada(a);a.run('detectarAccesoriosGas()');const tee=registrosDeteccion(a,'tee').find(r=>r.propuesta.ubicacion==='A');confirmarDeteccion(a,tee.propuesta.id);for(const i of [0,2]){abrirRapidoPrueba(a,i);guardarRapidoPrueba(a,{tee:1});}const p=propuestasFlujo(a);assert.equal(p.length,2);assert.equal(confirmarFlujo(a,p).confirmadas,2);a.run('generarPlanGas()');assert.equal(a.run('revisionMaterialesGas.plan.filas.filter(f=>f.tipo==="tee").reduce((s,f)=>s+f.cantidad,0)'),1);const resumen=a.run('modeloResumenMaterialesGas(revisionMaterialesGas.plan)');assert.equal(resumen.totales.find(g=>g.material.startsWith('Tee')).cantidad,1);assert.ok(resumen.porTramo.filter(t=>t.filas.some(f=>f.compartida&&f.fila.tipo==='tee')).length>=2);
});
test('flujo simple: resumen conserva cero, pendiente, estimaciones y cantidades editadas',()=>{
 const a=app();proyectoPlan(a);a.run("revisionMaterialesGas.plan.filas.push({material:'Codo 90°',tipo:'codo90',diametro:'Pendiente',cantidad:0,unidad:'unidad',estado:'estimado',cantidadConfirmada:true,ubicacion:'t'});revisionMaterialesGas.plan.filas.push({material:'Llave',tipo:'llave',diametro:'Pendiente',cantidad:null,unidad:'unidad',estado:'estimado',ubicacion:'t'})");const m=a.run('modeloResumenMaterialesGas(revisionMaterialesGas.plan)');assert.equal(m.totales.find(g=>g.material==='Codo 90°').cantidad,0);assert.equal(m.totales.find(g=>g.material==='Codo 90°').cantidadVerificada,true);assert.equal(m.totales.find(g=>g.material==='Llave').cantidad,null);assert.equal(m.totales.find(g=>g.material==='Llave').cantidadVerificada,false);
});
test('flujo simple: no reparte barras entre tramos ni confunde nombres parecidos',()=>{
 const a=app();a.run("abrir('gas');tramos=[{id:'aa',desde:'AA',hasta:'B',metros:6,diametro:null,consumo:null},{id:'a',desde:'A',hasta:'B',metros:6,diametro:null,consumo:null}]");a.ctx.planResumen={filas:[{tipo:'cano',material:'Caño',diametro:'1"',cantidad:2,unidad:'unidad',estado:'estimado',ubicacion:'aa, a'},{tipo:'codo90',material:'Codo',diametro:'1"',cantidad:1,unidad:'unidad',estado:'confirmado',ubicacion:'aa'}]};const m=a.run('modeloResumenMaterialesGas(planResumen)');assert.equal(m.porTramo[0].filas.length,2);assert.equal(m.porTramo[1].filas.length,1);assert.equal(m.porTramo[1].filas[0].distribucionPendiente,true);
});
function veinteConteosFlujo(a){
 redAndroidEstructurada(a);a.run('detectarAccesoriosGas()');for(const r of registrosDeteccion(a).filter(r=>['tee','llave'].includes(r.propuesta.tipo)))confirmarDeteccion(a,r.propuesta.id);for(let i=0;i<5;i++){abrirRapidoPrueba(a,i);guardarRapidoPrueba(a,{codo90:0,codo45:0,tee:i<2?1:0,llave:i>=2?1:0});for(const tipo of ['codo90','codo45','tee','llave']){const f=filaConcPrueba(a,tipo,'d'+i);const incluidos=f.candidatos.filter(p=>tipo==='tee'?(i===0?p.nodo==='n:n-a':i===1?p.nodo==='nombre:b':false):tipo==='llave');const fuera=f.candidatos.filter(p=>!incluidos.includes(p));assert.equal(conciliarPrueba(a,f,{incluidos:incluidos.map(p=>p.id),fuera:fuera.map(p=>p.id)}),true);}}
}
test('flujo simple: veinte conciliaciones previas, foto y PDF se conservan al abrir materiales y plano opcional',()=>{
 const a=app();veinteConteosFlujo(a);a.run("proyectos.gas.foto='data:image/png;base64,VEINTE';mostrarFotoLocal();guardarDatos();generarPlanGas();prepararInformeActual()");assert.equal(a.run('estadoConciliacionGas().filter(f=>!f.error).length'),20);const b=app(a.saved());b.run("abrir('gas');mostrarMaterialesPrincipalGas();prepararInformeActual()");const antes=b.run('JSON.stringify({tramos,artefactos,instalacionGas,proyectos})');const doc=b.elements.get('informeImpresion').innerHTML;b.run('mostrarPlanoOpcionalGas();mostrarPlanoOpcionalGas()');assert.equal(b.run('JSON.stringify({tramos,artefactos,instalacionGas,proyectos})'),antes);assert.equal(b.run('estadoConciliacionGas().filter(f=>!f.error).length'),20);assert.equal(propuestasFlujo(b).length,0);assert.match(doc,/VEINTE/);assert.match(doc,/DEFINITIVO/);assert.doesNotMatch(doc,/<(?:button|input|details)\b/);assert.equal(b.run('revisionMaterialesGas.plan.filas.filter(f=>f.tipo==="tee").reduce((s,f)=>s+f.cantidad,0)'),2);assert.equal(b.run('revisionMaterialesGas.plan.filas.filter(f=>f.tipo==="llave").reduce((s,f)=>s+f.cantidad,0)'),3);
});
test('flujo simple: abrir plano reutiliza geometría sin reclamar nuevas cantidades ni modificar el proyecto',()=>{
 const a=app();proyectoPlan(a);const antes=a.run('JSON.stringify({proyectos,tramos,artefactos,instalacionGas})');a.run('mostrarPlanoOpcionalGas()');assert.equal(a.run('JSON.stringify({proyectos,tramos,artefactos,instalacionGas})'),antes);assert.equal(a.elements.get('planoOpcionalGas').open,true);assert.match(descendientesPresentacion(a.elements.get('estadoPlanoOpcionalGas')).map(n=>n.textContent).join(' '),/distancias del detalle ya están cargadas/);assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
});
test('flujo simple: respaldos conservan coincidencias confirmadas con el formato previo',()=>{
 const a=app();proyectoPlan(a);abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:0,codo45:0});confirmarFlujo(a);const b=app();b.run("abrir('gas')");respaldoPrueba(b,{formato:'canerias-respaldo-v1',proyectos:JSON.parse(a.saved())});assert.equal(b.run('estadoConciliacionGas().filter(f=>!f.error).length'),2);assert.equal(propuestasFlujo(b).length,0);assert.equal(b.run('proyectos.gas.conciliacionRapidaGas.historial.length'),0);
});
test('flujo simple: avisos de detección diferencian cantidades conciliadas y posiciones sin alterar el detector',()=>{
 const a=app();redAndroidEstructurada(a);a.run('detectarAccesoriosGas()');abrirRapidoPrueba(a,0);guardarRapidoPrueba(a,{codo90:0,codo45:0});confirmarFlujo(a);const antes=a.run('JSON.stringify(datosDeteccionGas())');const mensajes=a.run('avisosDeteccionPresentacionGas(datosDeteccionGas().avisos)');assert.ok(mensajes.some(t=>t.includes('cantidad ya conciliada')&&t.includes('posiciones')));a.run('renderSugerenciasGas()');assert.equal(a.run('JSON.stringify(datosDeteccionGas())'),antes);
});
test('flujo simple: resumen no mezcla ejemplo, demostración ni materiales del proyecto real',()=>{
 const a=app();proyectoPlan(a);a.run('renderResumenPrincipalGas()');assert.match(descendientesPresentacion(a.elements.get('resumenPrincipalMaterialesGas')).map(n=>n.textContent).join(' '),/TOTAL DE MI PROYECTO/);a.run("seleccionarAmbitoGas('demostracion')");assert.doesNotMatch(descendientesPresentacion(a.elements.get('resumenPrincipalMaterialesGas')).map(n=>n.textContent).join(' '),/TOTAL DE MI PROYECTO/);assert.equal(a.run('tramos.length'),0);a.run("abrir('agua')");assert.equal(a.run('proyectos.agua.conteosRapidosGas'),undefined);
});
test('flujo simple: completar sólo distancias no obliga a repetir una cantidad conciliada',()=>{
 const a=app();proyectoPlan(a);a.run("tramos[0].detalle={estado:'pendiente',accesorios:[{tipo:'codo90',metrosAntes:2},{tipo:'codo90',metrosAntes:3}],metrosFinal:7};guardarDatos()");abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:2});const f=filaConcPrueba(a);conciliarPrueba(a,f,{incluidos:f.candidatos.map(p=>p.id)});const revision=a.run('JSON.stringify(proyectos.gas.conciliacionRapidaGas)');a.run('tramos[0].detalle.accesorios[0].metrosAntes=4;tramos[0].detalle.accesorios[1].metrosAntes=2;tramos[0].detalle.metrosFinal=6;guardarDatos()');assert.equal(a.run('estadoConciliacionGas().find(f=>f.tipo==="codo90").error'),null);assert.equal(a.run('JSON.stringify(proyectos.gas.conciliacionRapidaGas)'),revision);a.run("tramos[0].detalle.accesorios[1].tipo='tee';tramos[0].detalle.accesorios[1].nodo='A';guardarDatos()");assert.match(a.run('estadoConciliacionGas().find(f=>f.tipo==="codo90").error'),/Datos cambiados/);
});
test('flujo simple: veinte revisiones se conservan al completar geometría, pero no al cambiar diámetros',()=>{
 const a=app();veinteConteosFlujo(a);const antes=a.run('JSON.stringify(proyectos.gas.conciliacionRapidaGas)');a.run("tramos.forEach(t=>t.detalle={...t.detalle,estado:'ninguno',metrosFinal:t.metros});guardarDatos()");assert.equal(a.run('estadoConciliacionGas().filter(f=>!f.error).length'),20);assert.equal(a.run('JSON.stringify(proyectos.gas.conciliacionRapidaGas)'),antes);a.run("tramos[0].diametro='1\"';guardarDatos()");assert.ok(a.run('estadoConciliacionGas().some(f=>f.revision?.confirmado&&!!f.error)'));
});
test('flujo simple: contradicción real se pregunta sin corregir datos y ofrece edición rápida',()=>{
 const a=app();prepararABSincronizacion(a);const antes=a.run('JSON.stringify({tramos,rapidos:proyectos.gas.conteosRapidosGas})');a.run('renderConciliacionRapidaGas()');const texto=descendientesPresentacion(a.elements.get('conciliacionFilas')).map(n=>n.textContent).join(' ');assert.match(texto,/detalle tiene 2 piezas.*conteo rápido 1/);assert.match(texto,/Cuál refleja tu instalación/);assert.equal(a.run('JSON.stringify({tramos,rapidos:proyectos.gas.conteosRapidosGas})'),antes);const boton=descendientesPresentacion(a.elements.get('conciliacionFilas')).find(n=>n.textContent==='Editar cantidades rápidas de este tramo');boton.onclick();assert.equal(a.run('editandoAccesorios'),1);assert.equal(a.elements.get('cargaRapidaGas').open,true);
});
test('flujo simple: materiales se obtienen sin foto ni plano y los formularios anteriores se conservan',()=>{
 const a=app();proyectoPlan(a);a.run('mostrarMaterialesPrincipalGas()');assert.equal(a.run('fotoURL'),null);assert.ok(a.run('revisionMaterialesGas.plan.filas.length')>0);assert.equal(a.elements.get('planCompraGas').classList.hidden,false);assert.match(descendientesPresentacion(a.elements.get('resumenPrincipalMaterialesGas')).map(n=>n.textContent).join(' '),/TOTAL DE MI PROYECTO/);assert.ok(a.elements.get('editorAccesorios'));assert.ok(a.elements.get('imagen'));assert.ok(a.elements.get('informeImpresion'));assert.equal(a.run('proyectos.gas.plano'),undefined);
});
test('flujo simple: completar una posición que cambia el nodo físico sigue requiriendo revisión',()=>{
 const a=app();proyectoPlan(a);a.run("instalacionGas.nodos=[{id:'m',nombre:'M',tipo:'medidor'},{id:'a',nombre:'A',tipo:'derivacion'}];tramos[0].red={desde:'m',hasta:'a'};tramos[0].detalle={estado:'pendiente',accesorios:[{tipo:'codo90',metrosAntes:3}],metrosFinal:9};guardarDatos()");abrirRapidoPrueba(a);guardarRapidoPrueba(a,{codo90:1});const f=filaConcPrueba(a);conciliarPrueba(a,f,{incluidos:f.candidatos.map(p=>p.id)});a.run('tramos[0].detalle.accesorios[0].metrosAntes=0;tramos[0].detalle.metrosFinal=12;guardarDatos()');assert.match(a.run('estadoConciliacionGas().find(f=>f.tipo==="codo90").error'),/Datos cambiados/);assert.equal(a.run('entradaMaterialesGas("proyecto",false,true).tramos[0].accesorios[0].nodo'),'m');
});

test('materiales móvil: tabla GAS conserva valores y muestra estado pendiente sin imponer diámetro',()=>{
 const a=app();proyectoPlan(a);const antes=a.run('JSON.stringify({tramos,proyectos,artefactos})');a.run('calcularMateriales()');const tabla=a.elements.get('resultadoMateriales').children[0].children[0];assert.equal(tabla.className,'tabla gas-calculo-tramos');const celdas=tabla.children[1].children[0].children.map(c=>c.textContent);assert.equal(celdas.length,7);assert.equal(celdas[0],'M–A');assert.equal(celdas[1],'12');assert.equal(celdas[3],'2');assert.equal(celdas[4],'12 m');assert.equal(a.run('JSON.stringify({tramos,proyectos,artefactos})'),antes);
 a.run("tramos[0].diametro=null;tramos[0].detalle={estado:'pendiente',accesorios:[]};calcularMateriales()");const fila=a.elements.get('resultadoMateriales').children[0].children[0].children[1].children[0];assert.equal(fila.className,'gas-calculo-pendiente');assert.match(fila.children[0].textContent,/provisorio/);assert.ok(fila.children[2].textContent);assert.equal(a.run('tramos[0].diametro'),null);
});
test('materiales móvil: CSS de tarjetas está limitado a pantalla pequeña GAS, no PDF ni AGUA',()=>{
 assert.match(html,/@media screen and \(max-width:640px\)/);for(const label of ['Tramo','Metros reales','Diámetro registrado','Tiras estimadas','Compra estimada','Cuplas estimadas','Llaves registradas'])assert.ok(html.includes("content:'"+label+"'"));const a=app();a.run("abrir('agua');tramos=[{desde:'M',hasta:'A',metros:6,diametro:'1\"'}];calcularMateriales()");assert.equal(a.elements.get('resultadoMateriales').children[0].children[0].className,'tabla');
});
test('materiales móvil: desplazamiento explícito suave sin saltos durante recálculos',()=>{
 const a=app();proyectoPlan(a);const llamadas=[];a.elements.get('resumenPrincipalMaterialesGas').scrollIntoView=o=>llamadas.push(o);a.run('generarPlanGas()');assert.equal(llamadas.length,0);a.run("generarPlanGas('proyecto',true)");assert.equal(llamadas.length,1);assert.equal(llamadas[0].behavior,'smooth');assert.equal(llamadas[0].block,'start');a.run('generarPlanGas()');assert.equal(llamadas.length,1);a.ctx.window.matchMedia=()=>({matches:true});a.run("generarPlanGas('proyecto',true)");assert.equal(llamadas[1].behavior,'auto');assert.match(html,/onclick="desplazarResultadoMaterialesGas\(\)">Volver al resultado/);
});
test('materiales móvil: navegador sin opciones de scroll y error visible al generar sin tramos',()=>{
 const a=app();proyectoPlan(a);let intentos=0;a.elements.get('resumenPrincipalMaterialesGas').scrollIntoView=o=>{intentos++;if(o)throw Error('Opciones no admitidas');};a.run("generarPlanGas('proyecto',true)");assert.equal(intentos,2);let errorVisible=0;a.elements.get('matResultado').scrollIntoView=()=>errorVisible++;a.run("tramos=[];generarPlanGas('proyecto',true)");assert.match(a.text('matResultado'),/Agregá tramos/);assert.equal(errorVisible,1);
});
test('materiales móvil: cinco tramos, veinte conciliaciones, foto y PDF sobreviven al cambio de presentación',()=>{
 const a=app();veinteConteosFlujo(a);a.run("proyectos.gas.foto='data:image/png;base64,MOVIL';guardarDatos();generarPlanGas();prepararInformeActual()");const antes=a.run('JSON.stringify({tramos,proyectos,artefactos})'),pdf=a.elements.get('informeImpresion').innerHTML;a.run("calcularMateriales();generarPlanGas('proyecto',true);prepararInformeActual()");assert.equal(a.run('JSON.stringify({tramos,proyectos,artefactos})'),antes);assert.equal(a.elements.get('informeImpresion').innerHTML,pdf);assert.equal(a.run('estadoConciliacionGas().filter(f=>!f.error).length'),20);assert.equal(a.run('tramos.length'),5);assert.equal(a.run('revisionMaterialesGas.plan.filas.filter(f=>f.tipo==="tee").reduce((s,f)=>s+f.cantidad,0)'),2);
});

function ejemploManualDirecto(a){
 a.run(`abrir('gas');tramos=[['M','A',15,7,1,0],['A','B',5,1,1,0],['A','Termo',9,1,0,1],['B','Calefactor',16,4,0,1],['B','Cocina',13,5,0,1]].map(([desde,hasta,metros])=>({id:'manual-'+hasta,desde,hasta,metros,diametro:null,consumo:null,detalle:{estado:'pendiente',accesorios:[]}}));proyectos.gas.conteosRapidosGas=Object.fromEntries(tramos.map((t,i)=>[t.id,{codo90:[7,1,1,4,5][i],tee:i<2?1:0,llave:i>1?1:0}]));artefactos=[{nombre:'Termo',consumo:16000},{nombre:'Calefactor',consumo:3000},{nombre:'Cocina',consumo:10200}];`);
}
function cantidadManual(a,tipo){return a.run(`revisionMaterialesGas.plan.filas.filter(f=>f.tipo==='${tipo}').reduce((n,f)=>n+(f.cantidad||0),0)`);}
test('manual directo: ejemplo de cinco tramos calcula 58 m, 18 codos, dos tees y tres llaves sin conciliar',()=>{
 const a=app();ejemploManualDirecto(a);a.run('calcularMaterialesManualGas()');assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);assert.equal(cantidadManual(a,'codo90'),18);assert.equal(cantidadManual(a,'tee'),2);assert.equal(cantidadManual(a,'llave'),3);assert.equal(a.run('proyectos.gas.conciliacionRapidaGas'),undefined);assert.equal(a.run('revisionMaterialesGas.plan.dimensionamientoDefinitivo'),false);assert.equal(a.run('tramos.every(t=>t.diametro===null)'),true);assert.equal(a.elements.get('ajustesAvanzadosGas').open,false);assert.equal(a.run('fotoURL'),null);
});
test('manual directo: siete codos sustituyen el detalle de cantidades sin duplicarlo ni alterarlo',()=>{
 const a=app();ejemploManualDirecto(a);a.run("tramos[0].detalle.accesorios=Array.from({length:7},()=>({tipo:'codo90',metrosAntes:''}))");const detalle=a.run('JSON.stringify(tramos[0].detalle)');a.run('calcularMaterialesManualGas();calcularMaterialesManualGas()');assert.equal(cantidadManual(a,'codo90'),18);assert.equal(a.run('JSON.stringify(tramos[0].detalle)'),detalle);assert.equal(a.run('estadoConciliacionGas().filter(f=>f.revision?.confirmado).length'),0);
});
test('manual directo: cantidades discordantes conservan el original y muestran advertencia, no suman ambos',()=>{
 const a=app();ejemploManualDirecto(a);a.run("tramos[0].detalle.accesorios=[{tipo:'codo90'},{tipo:'codo90'}];calcularMaterialesManualGas()");assert.equal(cantidadManual(a,'codo90'),18);assert.equal(a.run('tramos[0].detalle.accesorios.length'),2);assert.match(a.run('revisionMaterialesGas.plan.avisos.join(" ")'),/total manual 7.*detalle \(2\)/);
});
test('manual directo: vacío permanece pendiente y cero explícito no agrega piezas',()=>{
 const a=app();ejemploManualDirecto(a);a.run('proyectos.gas.conteosRapidosGas[tramos[0].id].codo45=0;calcularMaterialesManualGas()');assert.equal(a.run('revisionMaterialesGas.plan.filas.find(f=>f.tipo==="codo45").cantidad'),0);assert.match(a.run('revisionMaterialesGas.plan.avisos.join(" ")'),/Cantidad pendiente: A–B: Codos de 45/);assert.equal(a.run('proyectos.gas.conteosRapidosGas[tramos[1].id].codo45'),undefined);assert.equal(a.run('revisionMaterialesGas.plan.planes.every(p=>p.compraEstimada===null&&p.cuplasPropuestas===null)'),true);
});
test('manual directo: modificar una cantidad recalcula y conserva respaldo sin segunda carga',()=>{
 const a=app();ejemploManualDirecto(a);a.run('calcularMaterialesManualGas();proyectos.gas.conteosRapidosGas[tramos[0].id].codo90=6;guardarDatos()');assert.equal(cantidadManual(a,'codo90'),17);assert.ok(a.run('datosPlanGas().respaldos.length')>0);assert.equal(a.run('proyectos.gas.conciliacionRapidaGas'),undefined);
});
test('manual directo: guardado y respaldo importado mantienen cantidades, fotografía y revisión anterior',()=>{
 const a=app();veinteConteosFlujo(a);a.run("proyectos.gas.foto='data:image/png;base64,MANUAL';guardarDatos()");const revisiones=a.run('JSON.stringify(proyectos.gas.conciliacionRapidaGas)');a.run('calcularMaterialesManualGas()');assert.equal(a.run('JSON.stringify(proyectos.gas.conciliacionRapidaGas)'),revisiones);const b=app(a.saved());b.run("abrir('gas');calcularMaterialesManualGas();prepararInformeActual()");assert.equal(cantidadManual(b,'tee'),2);assert.equal(cantidadManual(b,'llave'),3);assert.match(b.elements.get('informeImpresion').innerHTML,/MANUAL/);assert.equal(b.run('modoManualGasActivo()'),true);const c=app();c.run("abrir('gas')");respaldoPrueba(c,{formato:'canerias-respaldo-v1',proyectos:JSON.parse(a.saved())});c.run('calcularMaterialesManualGas()');assert.equal(cantidadManual(c,'tee'),2);assert.equal(c.run('JSON.stringify(proyectos.gas.conciliacionRapidaGas)'),revisiones);
});
test('manual directo: tee compartida identificada sigue siendo una sola pieza en varios tramos',()=>{
 const a=app();redAndroidEstructurada(a);a.run('detectarAccesoriosGas()');const tee=registrosDeteccion(a,'tee').find(r=>r.propuesta.ubicacion==='A');confirmarDeteccion(a,tee.propuesta.id);for(const i of [0,2]){abrirRapidoPrueba(a,i);guardarRapidoPrueba(a,{tee:1});}a.run('calcularMaterialesManualGas()');assert.equal(cantidadManual(a,'tee'),1);assert.equal(a.run('revisionMaterialesGas.plan.filas.filter(f=>f.tipo==="codo90"&&f.cantidad>0).length'),0);
});
test('manual directo: una tee que gira no produce un codo adicional',()=>{
 const a=app();proyectoPlan(a);a.run("tramos[0].detalle={estado:'pendiente',accesorios:[{tipo:'tee',nodo:'A',via:'giro90'}]};proyectos.gas.conteosRapidosGas={t:{tee:1,codo90:0}};calcularMaterialesManualGas()");assert.equal(cantidadManual(a,'tee'),1);assert.equal(cantidadManual(a,'codo90'),0);
});
test('manual directo: materiales, PDF y CSV quedan disponibles sin marcar revisión técnica',()=>{
 const a=app();ejemploManualDirecto(a);a.run('calcularMaterialesManualGas()');assert.equal(a.run('!!prepararSalidaMaterialesGas()'),true);assert.equal(a.run('revisionMaterialesGas.plan.filas.every(f=>!f.revisado)'),true);a.run('prepararInformeActual()');const pdf=a.elements.get('informeImpresion').innerHTML;assert.match(pdf,/DEFINITIVO/);assert.doesNotMatch(pdf,/<(?:button|input)\b/);assert.match(a.text('matMensaje'),/estimados|pendientes/);
});
test('manual directo: formulario único guarda, edita y permite volver a pendiente',()=>{
 const a=app();a.run("abrir('gas')");for(const [id,valor]of Object.entries({desde:'M',hasta:'A',metros:'15',manualGas_codo90:'7',manualGas_tee:'1',manualGas_llave:'0'}))a.elements.get(id).value=valor;a.run('agregarTramo()');assert.equal(a.run('conteoRapidoDelTramoGas(tramos[0]).codo90'),7);a.run('editarTramo(0)');assert.equal(a.elements.get('manualGas_codo90').value,7);a.elements.get('manualGas_codo90').value='6';a.elements.get('manualGas_tee').value='';a.run('agregarTramo();calcularMaterialesManualGas()');assert.equal(cantidadManual(a,'codo90'),6);assert.equal(a.run('conteoRapidoDelTramoGas(tramos[0]).tee'),undefined);assert.equal(a.run('tramos.length'),1);
});
test('manual directo: cantidades inválidas no alteran el proyecto',()=>{
 const a=app();a.run("abrir('gas')");for(const [id,v]of Object.entries({desde:'M',hasta:'A',metros:'15',manualGas_codo90:'-1'}))a.elements.get(id).value=v;a.run('agregarTramo()');assert.equal(a.run('tramos.length'),0);assert.match(a.text('resultadoMateriales'),/enteros no negativos/);
});
test('manual directo: modos y cantidades no se mezclan entre proyecto, demostración, AGUA y CLOACAS',()=>{
 const a=app();ejemploManualDirecto(a);a.run('calcularMaterialesManualGas()');const gas=a.run('JSON.stringify(proyectos.gas)');a.run("seleccionarAmbitoGas('demostracion')");assert.equal(a.run('modoManualGasActivo()'),false);assert.equal(a.run('tramos.length'),0);a.run("abrir('agua');calcularMaterialesManualGas();abrir('cloacas');calcularMaterialesManualGas()");assert.equal(a.run('proyectos.agua.planCompra?.opciones?.cargaManualDirecta'),undefined);a.run("abrir('gas');seleccionarAmbitoGas('proyecto');calcularMaterialesManualGas()");assert.equal(cantidadManual(a,'tee'),2);assert.ok(gas.includes('cargaManualDirecta'));
});
test('manual directo: CSV real conserva las cantidades y no pide otra confirmación',()=>{
 const a=app();ejemploManualDirecto(a);a.run('calcularMaterialesManualGas()');let texto='',clicks=0;const crear=a.ctx.document.createElement;a.ctx.Blob=class{constructor(partes){texto=partes.join('');}};a.ctx.URL.createObjectURL=()=> 'blob:manual';a.ctx.setTimeout=fn=>fn();a.ctx.document.createElement=()=>{const e=crear();e.click=()=>clicks++;return e;};a.run('descargarMaterialesGas()');assert.equal(clicks,1);assert.match(texto,/cantidad manual/);assert.match(texto,/NO DEFINITIVA/);assert.match(texto,/"7"/);assert.match(texto,/M–A/);assert.equal(a.run('revisionMaterialesGas.plan.filas.some(f=>f.revisado)'),false);
});
test('manual directo: sin tramos no anuncia éxito y mantiene el proyecto',()=>{
 const a=app();a.run("abrir('gas');calcularMaterialesManualGas()");assert.match(a.text('matMensaje'),/Agregá tramos/);assert.equal(a.run('tramos.length'),0);assert.equal(a.run('revisionMaterialesGas'),null);
});
test('manual directo: accesorios reductores integrados no se cuentan como otra reducción',()=>{
 const a=app();proyectoPlan(a);a.run(`tramos[0].detalle={estado:'pendiente',accesorios:[{tipo:'codo90',entrada:'1"',salida:'3/4"'}]};proyectos.gas.conteosRapidosGas={t:{codo90:1,reduccion:1}};calcularMaterialesManualGas()`);assert.equal(cantidadManual(a,'codo90'),1);assert.equal(cantidadManual(a,'reduccion'),0);assert.match(a.run('revisionMaterialesGas.plan.avisos.join(" ")'),/reductor integrado/);
});
test('manual directo: IA futura no aplica reglas de medidor o artefactos ni altera cantidades',()=>{
 const a=app();ejemploManualDirecto(a);a.run('calcularMaterialesManualGas()');const antes=a.run('JSON.stringify({proyectos,tramos,artefactos})');const contrato=a.run('contratoInterpretacionFuturaGas()');assert.equal(contrato.habilitada,false);assert.equal(contrato.aplicarReglasAutomaticamente,false);assert.equal(contrato.envioAutomatico,false);assert.equal(contrato.reglas.find(r=>r.id==='medidor-lateral').propuesta.cantidad,1);assert.equal(contrato.reglas.find(r=>r.id==='medidor-superior').propuesta.cantidad,0);assert.equal(a.run('JSON.stringify({proyectos,tramos,artefactos})'),antes);assert.equal(cantidadManual(a,'codo90'),18);
});
test('manual directo: varias tees compartidas posibles quedan advertidas sin inventar otro punto',()=>{
 const a=app();a.run(`abrir('gas');tramos=[{id:'ab',desde:'A',hasta:'B',metros:5,diametro:null,detalle:{estado:'pendiente',accesorios:[]}}];proyectos.gas.conteosRapidosGas={ab:{tee:1}};datosPlanGas().extras=[{tipo:'tee',nodo:'A',cantidad:1,medidas:[],confirmado:true,ubicacion:'A'},{tipo:'tee',nodo:'B',cantidad:1,medidas:[],confirmado:true,ubicacion:'B'}];calcularMaterialesManualGas()`);assert.equal(cantidadManual(a,'tee'),2);assert.match(a.run('revisionMaterialesGas.plan.avisos.join(" ")'),/varias piezas compartidas posibles/);assert.equal(a.run("revisionMaterialesGas.plan.filas.some(f=>f.nodo&&!['nombre:a','nombre:b'].includes(f.nodo))"),false);
});
test('manual directo: cuplas y otros accesorios detallados se conservan sin crear conexiones no informadas',()=>{
 const a=app();proyectoPlan(a);a.run("tramos[0].detalle={estado:'pendiente',accesorios:[{tipo:'cupla'},{tipo:'soporte'}]};calcularMaterialesManualGas()");assert.equal(cantidadManual(a,'cupla'),1);assert.equal(cantidadManual(a,'soporte'),1);assert.equal(cantidadManual(a,'llave'),0);assert.equal(a.run('revisionMaterialesGas.plan.dimensionamientoDefinitivo'),false);
});
test('manual directo: Calcular guarda el tramo válido en edición sin otro paso',()=>{
 assert.match(html,/desplazarResultadoMaterialesGas\('formularioGas'\)">Cargar o editar/);
 const a=app();a.run("abrir('gas')");for(const [id,v]of Object.entries({desde:'M',hasta:'A',metros:'15',manualGas_codo90:'7',manualGas_tee:'1'}))a.elements.get(id).value=v;a.run('calcularMaterialesManualGas()');assert.equal(a.run('tramos.length'),1);assert.equal(cantidadManual(a,'codo90'),7);assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),15);
});
test('manual directo: un borrador inválido conserva campos y muestra error visible sin usar el resultado anterior',()=>{
 const a=app();ejemploManualDirecto(a);a.run('calcularMaterialesManualGas();editarTramo(0)');a.elements.get('manualGas_codo90').value='-1';a.run('calcularMaterialesManualGas()');assert.match(a.text('mensajeCargaManualGas'),/enteros no negativos/);assert.equal(a.run('conteoRapidoDelTramoGas(tramos[0]).codo90'),7);assert.equal(a.elements.get('manualGas_codo90').value,'-1');assert.match(a.text('resumenPrincipalMaterialesGas'),/Borrador sin guardar/);
});
test('manual directo: el PDF usa la misma lista que pantalla, con ceros, avisos y consumos existentes',()=>{
 const a=app();ejemploManualDirecto(a);a.run('proyectos.gas.conteosRapidosGas[tramos[0].id].codo45=0;calcularMaterialesManualGas()');const modelo=a.run('modeloInformeActual()');for(const [tipo,total]of [['codo90',18],['tee',2],['llave',3],['codo45',0]])assert.equal(modelo.filas.filter(f=>f.tipo===tipo).reduce((s,f)=>s+(f.cantidad||0),0),total);assert.equal(modelo.artefactos.reduce((s,a)=>s+a.consumo,0),29200);assert.ok(modelo.resumen.some(t=>/58 m/.test(t)));assert.ok(modelo.resumen.some(t=>/Cantidad pendiente/.test(t)));assert.ok(!modelo.resumen.some(t=>/Sólo los adicionales conciliados/.test(t)));assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
});

function iniciarRedFlexible(a,invertir=false,orden=[0,1,2,3,4]){
 ejemploManualDirecto(a);a.run("instalacionGas.perfil.poderCalorifico='9300';asegurarIdsGas()");a.ctx.ordenFlexible=orden;a.ctx.invertirFlexible=invertir;a.run('tramos=ordenFlexible.map(i=>tramos[i]);if(invertirFlexible)tramos=tramos.map(t=>({...t,desde:t.hasta,hasta:t.desde}))');
}
function consumosPorConexion(a){const r=a.run('redFisicaManualGas()');const resultado={};for(const t of a.run('tramos'))resultado[[t.desde.toLowerCase(),t.hasta.toLowerCase()].sort().join('-')]=r.porTramo[t.id];return resultado;}
test('red flexible: orden arbitrario acumula 29200, 13200, 16000, 3000 y 10200 kcal/h',()=>{
 const a=app();iniciarRedFlexible(a,false,[4,2,1,3,0]);a.run('calcularMaterialesManualGas()');const r=a.run('redFisicaManualGas()');assert.deepEqual(Array.from(r.errores),[]);assert.equal(r.total,29200);assert.equal(r.porTramo['manual-A'],29200);assert.equal(r.porTramo['manual-B'],13200);assert.equal(r.porTramo['manual-Termo'],16000);assert.equal(r.porTramo['manual-Calefactor'],3000);assert.equal(r.porTramo['manual-Cocina'],10200);assert.equal(cantidadManual(a,'codo90'),18);assert.equal(cantidadManual(a,'tee'),2);assert.equal(cantidadManual(a,'llave'),3);assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);
});
test('red flexible: invertir todos los extremos y cambiar el orden conserva cantidades y consumos',()=>{
 const a=app(),b=app();iniciarRedFlexible(a);iniciarRedFlexible(b,true,[3,1,4,0,2]);a.run('calcularMaterialesManualGas()');b.run('calcularMaterialesManualGas()');assert.deepEqual(consumosPorConexion(a),consumosPorConexion(b));assert.equal(b.run('redFisicaManualGas().total'),29200);for(const t of ['codo90','tee','llave'])assert.equal(cantidadManual(a,t),cantidadManual(b,t));assert.equal(b.run('revisionMaterialesGas.plan.longitudInformada'),58);
});
test('red flexible: cálculo derivado no cambia los extremos, detalles, consumos ni conexiones guardadas',()=>{
 const a=app();iniciarRedFlexible(a,true,[4,0,3,2,1]);const antes=a.run('JSON.stringify({tramos,artefactos,instalacionGas})');a.run('redFisicaManualGas();calcularMaterialesManualGas();entradaMaterialesGas();modeloInformeActual()');assert.equal(a.run('JSON.stringify({tramos,artefactos,instalacionGas})'),antes);assert.equal(a.run('revisionMaterialesGas.plan.dimensionamientoDefinitivo'),false);
});
test('red flexible: conexiones formales y nombres invertidos representan la misma unión',()=>{
 const a=app();iniciarRedFlexible(a);a.run("instalacionGas.nodos=[{id:'m',nombre:'M',tipo:'medidor'},{id:'a',nombre:'A',tipo:'derivacion'},{id:'b',nombre:'B',tipo:'derivacion'}];tramos[0].red={desde:'m',hasta:'a'};tramos[1].red={desde:'a',hasta:'b'};tramos[1].desde='B';tramos[1].hasta='A'");const r=a.run('redFisicaManualGas()');assert.equal(r.errores.length,0);assert.equal(r.total,29200);assert.equal(r.porTramo['manual-B'],13200);assert.equal(a.run('tramos[1].red.desde'),'a');
});
test('red flexible: nombres con espacios y mayúsculas conservan la identidad de los puntos',()=>{
 const a=app();iniciarRedFlexible(a);a.run("tramos[1].desde=' a ';tramos[2].desde='A ';tramos[3].desde=' b '");const r=a.run('redFisicaManualGas()');assert.equal(r.errores.length,0);assert.equal(r.total,29200);
});
test('red flexible: formulario rechaza B-A cuando A-B existe sin cambiar datos',()=>{
 const a=app();iniciarRedFlexible(a);const antes=a.run('JSON.stringify(tramos)');for(const [id,v]of Object.entries({desde:'B',hasta:'A',metros:'5',manualGas_codo90:'1'}))a.elements.get(id).value=v;a.run('agregarTramo()');assert.equal(a.run('JSON.stringify(tramos)'),antes);assert.match(a.text('mensajeCargaManualGas'),/ya está registrado/);assert.equal(a.elements.get('desde').value,'B');
});
test('red flexible: duplicado importado idéntico se advierte y no duplica metros ni accesorios',()=>{
 const a=app();iniciarRedFlexible(a);a.run("tramos.push({...tramos[1],id:'duplicado',desde:'B',hasta:'A'});proyectos.gas.conteosRapidosGas.duplicado={...proyectos.gas.conteosRapidosGas['manual-B']};calcularMaterialesManualGas()");assert.equal(a.run('tramos.length'),6);assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);assert.equal(cantidadManual(a,'codo90'),18);assert.equal(cantidadManual(a,'tee'),2);assert.match(a.run('revisionMaterialesGas.plan.avisos.join(" ")'),/Tramo duplicado/);assert.equal(a.run('redFisicaManualGas().total'),29200);
});
test('red flexible: duplicados con valores distintos quedan pendientes y conservan ambos registros',()=>{
 const a=app();iniciarRedFlexible(a);a.run("tramos.push({...tramos[1],id:'duplicado',desde:'B',hasta:'A',metros:8});proyectos.gas.conteosRapidosGas.duplicado={codo90:5,tee:1};calcularMaterialesManualGas()");assert.equal(a.run('tramos.length'),6);assert.equal(a.run('revisionMaterialesGas.plan.longitudParcial'),true);assert.equal(a.run('redFisicaManualGas().total'),null);const filas=a.run('resumenListaManualGas(revisionMaterialesGas.plan)');assert.equal(filas.find(f=>f.tipo==='cano').pendiente,true);assert.equal(filas.find(f=>f.tipo==='codo90').pendiente,true);assert.match(a.run('revisionMaterialesGas.plan.avisos.join(" ")'),/datos distintos/);
});
test('red flexible: red desconectada no muestra consumo total como válido y permite materiales conocidos',()=>{
 const a=app();iniciarRedFlexible(a);a.run("tramos[4].desde='X';calcularMaterialesManualGas()");assert.equal(a.run('redFisicaManualGas().total'),null);assert.match(a.run('redFisicaManualGas().errores.join(" ")'),/Red desconectada/);assert.equal(cantidadManual(a,'codo90'),18);assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);
});
test('red flexible: un circuito cerrado advierte y conserva cantidades físicas sin dimensionar',()=>{
 const a=app();iniciarRedFlexible(a);a.run("tramos.push({id:'ciclo',desde:'B',hasta:'M',metros:2,diametro:null});calcularMaterialesManualGas()");assert.match(a.run('redFisicaManualGas().errores.join(" ")'),/circuito cerrado/);assert.equal(a.run('redFisicaManualGas().total'),null);assert.equal(a.run('revisionMaterialesGas.plan.dimensionamientoDefinitivo'),false);
});
test('red flexible: consumos ambiguos y artefactos reutilizados no se adivinan',()=>{
 const a=app();iniciarRedFlexible(a);a.run("artefactos.push({nombre:'Termo',consumo:5000})");assert.match(a.run('redFisicaManualGas().errores.join(" ")'),/Consumo ambiguo/);assert.equal(a.run('redFisicaManualGas().total'),null);
});
test('red flexible: datos de artefacto incompletos mantienen consumos parciales válidos',()=>{
 const a=app();iniciarRedFlexible(a);a.run("artefactos=artefactos.filter(a=>a.nombre!=='Termo')");const r=a.run('redFisicaManualGas()');assert.equal(r.total,null);assert.equal(r.porTramo['manual-A'],null);assert.equal(r.porTramo['manual-B'],13200);assert.equal(r.parciales['manual-A'],13200);assert.match(r.faltantes.join(' '),/Consumo pendiente en Termo/);
});
test('lista simple: única tabla Material-Cantidad, metraje agrupado y cuplas pendientes',()=>{
 const a=app();iniciarRedFlexible(a);a.run('calcularMaterialesManualGas()');const nodos=descendientesPresentacion(a.elements.get('resumenPrincipalMaterialesGas')),tablas=nodos.filter(n=>n.tagName==='TABLE');assert.equal(tablas.length,1);assert.deepEqual(tablas[0].children.find(n=>n.tagName==='THEAD').children[0].children.map(c=>c.textContent),['Material','Cantidad']);const filas=a.run('resumenListaManualGas(revisionMaterialesGas.plan)');assert.equal(filas.filter(f=>f.tipo==='cano').length,1);assert.equal(filas.find(f=>f.tipo==='cano').cantidad,58);assert.equal(filas.find(f=>f.tipo==='codo90').cantidad,18);assert.equal(filas.filter(f=>f.tipo==='cupla').length,1);assert.equal(filas.find(f=>f.tipo==='cupla').pendiente,true);assert.equal(nodos.filter(n=>n.textContent==='Datos técnicos pendientes').length,1);
});
test('lista simple: medidas distintas conocidas no se mezclan y estados no duplican renglones iguales',()=>{
 const a=app();iniciarRedFlexible(a);a.run('calcularMaterialesManualGas()');a.ctx.planSimple={planes:[],filas:[{tipo:'codo90',material:'Codo 90°',cantidad:2,unidad:'unidad',diametro:'1"',cantidadConfirmada:true},{tipo:'codo90',material:'Codo 90°',cantidad:3,unidad:'unidad',diametro:'1"',estado:'estimado',cantidadConfirmada:false},{tipo:'codo90',material:'Codo 90°',cantidad:1,unidad:'unidad',diametro:'3/4"',cantidadConfirmada:true}]};const rs=a.run('resumenListaManualGas(planSimple)');assert.equal(rs.length,2);assert.equal(rs.find(r=>r.diametro==='1"').cantidad,5);assert.equal(rs.find(r=>r.diametro==='1"').estimado,true);
});
test('lista simple: avisos genéricos repetidos se reúnen sin ocultar contradicciones',()=>{
 const a=app();iniciarRedFlexible(a);a.run('calcularMaterialesManualGas()');const avisos=a.run('avisosListaManualGas(revisionMaterialesGas.plan)');assert.equal(avisos.filter(x=>x.startsWith('Diámetros pendientes:')).length,1);assert.equal(avisos.filter(x=>x.startsWith('Faltan distancias')).length,1);assert.ok(avisos.some(x=>/normativo/.test(x)));
});
test('llave única: la antigua casilla no es visible y los proyectos heredados recuperan su cantidad',()=>{
 const a=app();iniciarRedFlexible(a);a.run("delete proyectos.gas.conteosRapidosGas['manual-Termo'].llave;tramos[2].llave=true;editarTramo(2)");assert.equal(a.elements.get('manualGas_llave').value,1);assert.match(html,/<input id="llave" type="hidden"/);assert.doesNotMatch(html,/Contar una llave adicional a las registradas/);a.run('agregarTramo();calcularMaterialesManualGas()');assert.equal(cantidadManual(a,'llave'),3);assert.equal(a.run('tramos[2].llave'),true);
});
test('llave única: total manual más casilla y llave detallada representan una pieza, no tres',()=>{
 const a=app();iniciarRedFlexible(a);a.run("tramos[2].llave=true;tramos[2].detalle.accesorios=[{tipo:'llave'}];calcularMaterialesManualGas()");assert.equal(cantidadManual(a,'llave'),3);a.run('editarTramo(2)');a.elements.get('manualGas_llave').value='0';a.run('agregarTramo();calcularMaterialesManualGas()');assert.equal(cantidadManual(a,'llave'),2);assert.equal(a.run('tramos[2].llave'),true);assert.equal(a.run('tramos[2].detalle.accesorios.length'),1);
});
test('llave única: respaldo sin conteos rápidos conserva una llave heredada sin crear otra detallada',()=>{
 const a=app();a.run("abrir('gas');tramos=[{id:'heredado',desde:'M',hasta:'Cocina',metros:5,consumo:null,diametro:null,llave:true,detalle:{estado:'pendiente',accesorios:[{tipo:'llave'}]}}];guardarDatos()");const b=app(a.saved());b.run("abrir('gas');calcularMaterialesManualGas()");assert.equal(cantidadManual(b,'llave'),1);assert.equal(b.run('tramos[0].detalle.accesorios.length'),1);
});
test('red flexible: PDF mantiene las seis columnas y usa consumos acumulados sin diámetros inventados',()=>{
 const a=app();iniciarRedFlexible(a,true,[4,1,3,0,2]);a.run('calcularMaterialesManualGas()');const modelo=a.run('modeloInformeActual()');for(const t of a.run('tramos')){const f=modelo.planilla.find(r=>r.tramo===t.desde+'–'+t.hasta);assert.ok(Math.abs(f.consumo-a.run('redFisicaManualGas()').porTramo[t.id]/9300)<1e-10);assert.equal(f.diametro,'Pendiente');}assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
});
test('red flexible: una misma placa vinculada a dos puntos no duplica el consumo',()=>{
 const a=app();a.run("abrir('gas');artefactos=[{id:'art',nombre:'Termo',consumo:16000}];instalacionGas.nodos=[{id:'m',nombre:'M',tipo:'medidor'},{id:'a',nombre:'A',tipo:'derivacion'},{id:'t1',nombre:'T1',tipo:'artefacto',artefactoId:'art'},{id:'t2',nombre:'T2',tipo:'artefacto',artefactoId:'art'}];tramos=[{id:'ma',desde:'M',hasta:'A',metros:2},{id:'at1',desde:'A',hasta:'T1',metros:2},{id:'at2',desde:'A',hasta:'T2',metros:3}]");const r=a.run('redFisicaManualGas()');assert.equal(r.total,null);assert.match(r.errores.join(' '),/más de una vez/);
});
test('red flexible: discrepancia entre nombres y conexiones explícitas se advierte sin reescribirlas',()=>{
 const a=app();iniciarRedFlexible(a);a.run("instalacionGas.nodos=[{id:'m',nombre:'M',tipo:'medidor'},{id:'a',nombre:'A',tipo:'derivacion'}];tramos[0].red={desde:'a',hasta:'a'}");const antes=a.run('JSON.stringify(tramos)');const r=a.run('redFisicaManualGas()');assert.equal(r.total,null);assert.match(r.errores.join(' '),/no coinciden|mismo punto/);assert.equal(a.run('JSON.stringify(tramos)'),antes);
});
test('red flexible: recarga e importación preservan llaves heredadas, cantidades y extremos invertidos',()=>{
 const a=app();iniciarRedFlexible(a,true,[4,1,0,3,2]);a.run('tramos[4].llave=true;calcularMaterialesManualGas()');const guardado=JSON.parse(a.saved());const b=app(a.saved());b.run("abrir('gas');calcularMaterialesManualGas()");assert.equal(cantidadManual(b,'llave'),3);assert.equal(b.run('redFisicaManualGas().total'),29200);assert.deepEqual(JSON.parse(b.run('JSON.stringify(tramos)')),guardado.gas.tramos);const c=app();c.run("abrir('gas')");respaldoPrueba(c,{formato:'canerias-respaldo-v1',proyectos:guardado});c.run('calcularMaterialesManualGas()');assert.equal(c.run('redFisicaManualGas().total'),29200);assert.equal(cantidadManual(c,'codo90'),18);
});
test('lista simple: PDF agrupa el mismo metraje y accesorios sin filas de diámetro pendiente por tramo',()=>{
 const a=app();iniciarRedFlexible(a);a.run('calcularMaterialesManualGas()');const m=a.run('modeloInformeActual()');assert.equal(m.materialesAgrupados.filter(f=>f.tipo==='cano').length,1);assert.equal(m.materialesAgrupados.find(f=>f.tipo==='cano').cantidad,58);assert.equal(m.materialesAgrupados.find(f=>f.tipo==='codo90').cantidad,18);assert.equal(m.materialesAgrupados.filter(f=>f.tipo==='cupla').length,1);assert.equal(m.materialesAgrupados.find(f=>f.tipo==='cupla').cantidad,null);assert.equal(m.materialesAgrupados.find(f=>f.tipo==='cano').diametro,'Pendiente');
});
test('lista simple: el orden de los grupos de caño de medidas distintas no cambia el resumen',()=>{
 const a=app();a.ctx.planesOrden=[{diametro:'1"',material:'Acero epoxi',sistema:'Roscado',metros:9},{diametro:'3/4"',material:'Acero epoxi',sistema:'Roscado',metros:5}];const primero=a.run('JSON.stringify(resumenListaManualGas({planes:planesOrden,filas:[]}))');const segundo=a.run('JSON.stringify(resumenListaManualGas({planes:[...planesOrden].reverse(),filas:[]}))');assert.equal(primero,segundo);
});

function nuevoProyectoPrueba(a,nombre='Casa nueva'){a.ctx.nombreNuevo=nombre;const id=a.run('crearProyectoGas(nombreNuevo)');assert.ok(id,a.text('mensajeProyectosGas'));return 'proyecto:'+id;}
function irProyectoPrueba(a,id){a.ctx.destinoProyecto=id;a.run('seleccionarAmbitoGas(destinoProyecto)');}
test('proyectos GAS: crear uno vacío no copia tramos, artefactos, fotografías ni resultados anteriores',()=>{
 const a=app();iniciarRedFlexible(a);a.run("proyectos.gas.foto='data:image/png;base64,BASE';calcularMaterialesManualGas()");const base=a.run('JSON.stringify({tramos:proyectos.gas.tramos,artefactos:proyectos.gas.artefactos,foto:proyectos.gas.foto})');const id=nuevoProyectoPrueba(a);assert.equal(a.run('ambitoGas'),id);assert.equal(a.run('tramos.length'),0);assert.equal(a.run('artefactos.length'),0);assert.equal(a.run('fotoURL'),null);assert.equal(a.run('borradorCroquis'),null);assert.equal(a.run('revisionMaterialesGas'),null);assert.equal(a.run('modoManualGasActivo()'),true);assert.equal(a.elements.get('desde').value,'');assert.equal(a.elements.get('manualGas_codo90').value,'');assert.equal(a.run('JSON.stringify({tramos:proyectos.gas.tramos,artefactos:proyectos.gas.artefactos,foto:proyectos.gas.foto})'),base);
});
test('proyectos GAS: cambiar entre proyectos recupera sus cantidades y resultados sin duplicarlos',()=>{
 const a=app();iniciarRedFlexible(a);a.run('calcularMaterialesManualGas()');const primero=nuevoProyectoPrueba(a,'Obra uno');a.run("tramos=[{id:'otro',desde:'M',hasta:'Horno',metros:6,diametro:null,consumo:5000}];artefactos=[{id:'horno',nombre:'Horno',consumo:5000}];proyectoGasActual().conteosRapidosGas={otro:{codo90:2,tee:0,llave:1}};calcularMaterialesManualGas()");const segundo=nuevoProyectoPrueba(a,'Obra dos');assert.equal(a.run('tramos.length'),0);irProyectoPrueba(a,primero);assert.equal(cantidadManual(a,'codo90'),2);assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),6);irProyectoPrueba(a,'proyecto');assert.equal(cantidadManual(a,'codo90'),18);assert.equal(cantidadManual(a,'tee'),2);assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);irProyectoPrueba(a,segundo);assert.equal(a.run('tramos.length'),0);
});
test('proyectos GAS: nombres propios persisten tras recargar con el proyecto nuevo seleccionado',()=>{
 const a=app();a.run("abrir('gas')");const id=nuevoProyectoPrueba(a,'Casa Salta');a.run("tramos=[{id:'a',desde:'M',hasta:'A',metros:9,consumo:null,diametro:null}];guardarDatos()");const b=app(a.saved());b.run("abrir('gas')");assert.equal(b.run('ambitoGas'),id);assert.equal(b.run('nombreProyectoGas()'),'Casa Salta');assert.equal(b.run('tramos[0].metros'),9);assert.equal(b.elements.get('ambitoGas').value,id);
});
test('proyectos GAS: renombrar conserva identificador, fotografía y revisión',()=>{
 const a=app();a.run("abrir('gas')");const id=nuevoProyectoPrueba(a,'Antes');a.run("proyectoGasActual().foto='data:image/png;base64,PROPIA';tramos=[{id:'a',desde:'M',hasta:'A',metros:6,consumo:null,diametro:null}];proyectoGasActual().conteosRapidosGas={a:{codo90:1}};calcularMaterialesManualGas()");const clave=a.run('claveFotoActual()');assert.equal(a.run("renombrarProyectoGas('Después')"),true);assert.equal(a.run('ambitoGas'),id);assert.equal(a.run('claveFotoActual()'),clave);assert.equal(cantidadManual(a,'codo90'),1);assert.equal(a.run('proyectoGasActual().foto'),'data:image/png;base64,PROPIA');assert.equal(a.run('modeloInformeActual().ambito'),'PROYECTO · Después');const b=app(a.saved());b.run("abrir('gas')");assert.equal(b.run('nombreProyectoGas()'),'Después');
});
test('proyectos GAS: nombres vacíos o repetidos no agregan ni sustituyen proyectos',()=>{
 const a=app();a.run("abrir('gas')");nuevoProyectoPrueba(a,'Única');const antes=a.run('JSON.stringify(proyectos)');for(const nombre of ['', '   ','Única','Mi proyecto','Demostración separada']){a.ctx.n=nombre;assert.equal(a.run('crearProyectoGas(n)'),null);}assert.equal(a.run('JSON.stringify(proyectos)'),antes);assert.equal(a.run("renombrarProyectoGas('Mi proyecto')"),false);
});
test('proyectos GAS: Mi proyecto y Demostración conservan identidades y datos aunque se renombren',()=>{
 const a=app();iniciarRedFlexible(a);a.run("guardarDatos();renombrarProyectoGas('Base propia')");const id=nuevoProyectoPrueba(a,'Otra');irProyectoPrueba(a,'demostracion');a.run("tramos=[{id:'d',desde:'DEMO',hasta:'X',metros:2,diametro:null,consumo:null,origen:{tipo:'simulado'}}];renombrarProyectoGas('Práctica')");irProyectoPrueba(a,'proyecto');assert.equal(a.run('tramos.length'),5);assert.equal(a.run('nombreProyectoGas()'),'Base propia');irProyectoPrueba(a,'demostracion');assert.equal(a.run('tramos.length'),1);irProyectoPrueba(a,id);assert.equal(a.run('tramos.length'),0);assert.ok(descendientesPresentacion(a.elements.get('ambitoGas')).some(n=>n.value==='proyecto'));assert.ok(descendientesPresentacion(a.elements.get('ambitoGas')).some(n=>n.value==='demostracion'));
});
test('proyectos GAS: una foto terminada después de cambiar proyecto se guarda en su destino original',()=>{
 const a=app();a.run("abrir('gas')");const primero=nuevoProyectoPrueba(a,'Foto A');const io=lectorFotosPrueba(a),lecturaA=io.cargar();const segundo=nuevoProyectoPrueba(a,'Foto B'),lecturaB=io.cargar();io.terminar(lecturaA,'data:image/jpeg;base64,FOTO_A');assert.notEqual(a.run('fotoURL'),'data:image/jpeg;base64,FOTO_A');io.terminar(lecturaB,'data:image/jpeg;base64,FOTO_B');assert.equal(a.run('fotoURL'),'data:image/jpeg;base64,FOTO_B');irProyectoPrueba(a,primero);assert.equal(a.run('fotoURL'),'data:image/jpeg;base64,FOTO_A');assert.match(a.text('estadoFoto'),/Foto guardada/);irProyectoPrueba(a,segundo);assert.equal(a.run('fotoURL'),'data:image/jpeg;base64,FOTO_B');
});
test('proyectos GAS: renombrar durante la lectura de una foto no cambia su destino',()=>{
 const a=app();a.run("abrir('gas')");nuevoProyectoPrueba(a,'Original');const io=lectorFotosPrueba(a),lector=io.cargar();const clave=a.run('claveFotoActual()');a.run("renombrarProyectoGas('Renombrada')");io.terminar(lector,'data:image/jpeg;base64,RENOMBRADA');assert.equal(a.run('claveFotoActual()'),clave);assert.equal(a.run('proyectoGasActual().foto'),'data:image/jpeg;base64,RENOMBRADA');assert.match(a.text('estadoFoto'),/Foto guardada/);
});
test('proyectos GAS: respaldo v1 recupera toda la colección, fotos y cantidades',()=>{
 const a=app();iniciarRedFlexible(a);a.run('calcularMaterialesManualGas()');const id=nuevoProyectoPrueba(a,'Desde respaldo');a.run("proyectoGasActual().foto='data:image/png;base64,RESPALDO_PROPIO';tramos=[{id:'u',desde:'M',hasta:'U',metros:7,consumo:null,diametro:null}];proyectoGasActual().conteosRapidosGas={u:{llave:2}};calcularMaterialesManualGas()");const respaldo={formato:'canerias-respaldo-v1',proyectos:JSON.parse(a.saved())};const b=app();b.run("abrir('gas')");respaldoPrueba(b,respaldo);assert.equal(b.run('ambitoGas'),id);assert.equal(b.run('fotoURL'),'data:image/png;base64,RESPALDO_PROPIO');b.run('calcularMaterialesManualGas()');assert.equal(cantidadManual(b,'llave'),2);irProyectoPrueba(b,'proyecto');assert.equal(cantidadManual(b,'codo90'),18);assert.equal(b.run('proyectos.gas.proyectosGuardados.length'),1);
});
test('proyectos GAS: crear después de importar no sobrescribe la base ni los proyectos importados',()=>{
 const a=app();a.run("abrir('gas')");const id=nuevoProyectoPrueba(a,'Importada');a.run("tramos=[{id:'x',desde:'M',hasta:'X',metros:4,diametro:null,consumo:null}];guardarDatos()");const b=app();b.run("abrir('gas')");respaldoPrueba(b,{formato:'canerias-respaldo-v1',proyectos:JSON.parse(a.saved())});const previo=b.run('JSON.stringify(proyectoGasActual().tramos)');nuevoProyectoPrueba(b,'Nueva posterior');irProyectoPrueba(b,id);assert.equal(b.run('JSON.stringify(tramos)'),previo);assert.equal(b.run('proyectos.gas.proyectosGuardados.length'),2);
});
test('proyectos GAS: borrador de tramo sin guardar queda separado y reaparece al volver',()=>{
 const a=app();a.run("abrir('gas')");const id=nuevoProyectoPrueba(a,'Borrador A');a.elements.get('desde').value='M';a.elements.get('hasta').value='Pendiente A';a.elements.get('metros').value='12';a.elements.get('manualGas_codo90').value='7';nuevoProyectoPrueba(a,'Borrador B');assert.equal(a.elements.get('desde').value,'');assert.equal(a.elements.get('manualGas_codo90').value,'');irProyectoPrueba(a,id);assert.equal(a.elements.get('hasta').value,'Pendiente A');assert.equal(a.elements.get('manualGas_codo90').value,'7');assert.equal(a.run('tramos.length'),0);a.run('calcularMaterialesManualGas()');assert.equal(cantidadManual(a,'codo90'),7);
});
test('proyectos GAS: edición del detalle no guardada se conserva al cambiar de proyecto',()=>{
 const a=app();a.run("abrir('gas')");const id=nuevoProyectoPrueba(a,'Detalle');a.run("tramos=[{id:'a',desde:'M',hasta:'A',metros:6,diametro:null,consumo:null}];guardarDatos();abrirAccesorios(0);nuevoAccesorio();borradorAccesorios[0].tipo='codo45';borradorAccesorios[0].metrosAntes=2");a.elements.get('metrosFinal').value='4';nuevoProyectoPrueba(a,'Vacía');assert.equal(a.run('editandoAccesorios'),-1);irProyectoPrueba(a,id);assert.equal(a.run('editandoAccesorios'),0);assert.equal(a.run('borradorAccesorios[0].tipo'),'codo45');assert.equal(a.elements.get('metrosFinal').value,'4');assert.equal(a.run('tramos[0].detalle?.accesorios?.length'),undefined);
});
test('proyectos GAS: al cambiar el informe muestra sólo el nombre y datos del proyecto activo',()=>{
 const a=app();iniciarRedFlexible(a);a.run("proyectos.gas.foto='data:image/png;base64,REAL';calcularMaterialesManualGas();prepararInformeActual()");const id=nuevoProyectoPrueba(a,'Informe separado');a.run('prepararInformeActual()');const informe=a.elements.get('informeImpresion').innerHTML;assert.match(informe,/Informe separado/);assert.doesNotMatch(informe,/base64,REAL/);assert.equal(a.run('modeloInformeActual().tramos.length'),0);irProyectoPrueba(a,'proyecto');a.run('prepararInformeActual()');assert.match(a.elements.get('informeImpresion').innerHTML,/base64,REAL/);assert.equal(a.run('modeloInformeActual().tramos.length'),5);
});
test('proyectos GAS: foto y borradores de AGUA y CLOACAS quedan intactos',()=>{
 const a=app();a.run("abrir('agua');proyectos.agua.foto='data:image/png;base64,AGUA';guardarDatos();abrir('cloacas');proyectos.cloacas.foto='data:image/png;base64,CLOACA';guardarDatos();abrir('gas')");const agua=a.run('JSON.stringify(proyectos.agua)'),cloaca=a.run('JSON.stringify(proyectos.cloacas)');nuevoProyectoPrueba(a,'Sólo GAS');a.run("renombrarProyectoGas('Sólo GAS renombrado')");irProyectoPrueba(a,'proyecto');assert.equal(a.run('JSON.stringify(proyectos.agua)'),agua);assert.equal(a.run('JSON.stringify(proyectos.cloacas)'),cloaca);
});
test('proyectos GAS: almacenamiento bloqueado conserva la nueva sesión y avisa sin aparentar guardado',()=>{
 const a=app(null,{blocked:true});a.run("abrir('gas')");nuevoProyectoPrueba(a,'Temporal');assert.match(a.text('mensajeProyectosGas'),/no confirmado/);assert.equal(a.saved(),undefined);irProyectoPrueba(a,'proyecto');assert.equal(a.run('proyectos.gas.proyectosGuardados.length'),1);
});
test('proyectos GAS: colección importada inválida no reemplaza los datos actuales',()=>{
 const a=app();iniciarRedFlexible(a);a.run('guardarDatos()');const antes=a.saved();respaldoPrueba(a,{formato:'canerias-respaldo-v1',proyectos:{gas:{proyectosGuardados:[{id:'x',nombre:'Mal',datos:{foto:'blob:temporal'}}]},agua:{},cloacas:{}}});assert.equal(a.saved(),antes);assert.match(a.text('estadoRespaldo'),/No se importó/);assert.equal(a.run('tramos.length'),5);
});
test('proyectos GAS: identificador inválido no cambia la selección ni guarda sobre otro proyecto',()=>{
 const a=app();iniciarRedFlexible(a);a.run('guardarDatos()');const antes=a.run('JSON.stringify(proyectos)');irProyectoPrueba(a,'proyecto:inexistente');assert.equal(a.run('ambitoGas'),'proyecto');assert.equal(a.run('JSON.stringify(proyectos)'),antes);assert.match(a.text('mensajeProyectosGas'),/no disponible/);
});
test('proyectos GAS: ejemplos simulados revisados van sólo a Demostración, nunca al nuevo proyecto',()=>{
 const a=app();a.run("abrir('gas')");const id=nuevoProyectoPrueba(a,'Real sin ejemplos');ejemploRevisado(a);a.run('incorporarCroquis()');assert.equal(a.run('ambitoGas'),'demostracion');irProyectoPrueba(a,id);assert.equal(a.run('tramos.length'),0);assert.equal(a.run('artefactos.length'),0);assert.equal(a.run('borradorCroquis'),null);
});
test('proyectos GAS: cuota de imágenes conserva las fotos anteriores de todos los proyectos y guarda los otros cambios',()=>{
 const a=app();a.run("abrir('gas')");const uno=nuevoProyectoPrueba(a,'Cuota A');a.run("proyectoGasActual().foto='data:image/jpeg;base64,ANTERIOR_A';guardarDatos()");const dos=nuevoProyectoPrueba(a,'Cuota B');a.run("proyectoGasActual().foto='data:image/jpeg;base64,ANTERIOR_B';tramos=[{id:'b',desde:'M',hasta:'B',metros:5,diametro:null,consumo:null}];guardarDatos()");const serializado=a.saved();const b=app(serializado,{quota:serializado.length+6000});b.run("abrir('gas')");const io=lectorFotosPrueba(b),r=io.cargar();io.terminar(r,'data:image/jpeg;base64,'+'A'.repeat(14000));b.run('tramos[0].metros=9;guardarDatos()');const guardado=JSON.parse(b.saved());assert.equal(guardado.gas.proyectosGuardados.find(p=>'proyecto:'+p.id===uno).datos.foto,'data:image/jpeg;base64,ANTERIOR_A');assert.equal(guardado.gas.proyectosGuardados.find(p=>'proyecto:'+p.id===dos).datos.foto,'data:image/jpeg;base64,ANTERIOR_B');assert.equal(guardado.gas.proyectosGuardados.find(p=>'proyecto:'+p.id===dos).datos.tramos[0].metros,9);assert.match(b.text('estadoFoto'),/NO guardada/);
});
test('proyectos GAS: identificadores de tramo iguales no comparten accesorios, croquis ni aclaraciones',()=>{
 const a=app();a.run("abrir('gas')");const uno=nuevoProyectoPrueba(a,'Ids A');a.run("tramos=[{id:'igual',desde:'M',hasta:'A',metros:5,diametro:null,consumo:null}];proyectoGasActual().conteosRapidosGas={igual:{codo90:1}};calcularMaterialesManualGas()");a.elements.get('duda').value='Nota A';a.run('guardarDatos()');const dos=nuevoProyectoPrueba(a,'Ids B');a.run("tramos=[{id:'igual',desde:'M',hasta:'A',metros:7,diametro:null,consumo:null}];proyectoGasActual().conteosRapidosGas={igual:{codo90:4}};calcularMaterialesManualGas()");a.elements.get('duda').value='Nota B';a.run('guardarDatos()');irProyectoPrueba(a,uno);assert.equal(cantidadManual(a,'codo90'),1);assert.equal(a.elements.get('duda').value,'Nota A');assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),5);irProyectoPrueba(a,dos);assert.equal(cantidadManual(a,'codo90'),4);assert.equal(a.elements.get('duda').value,'Nota B');assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),7);
});
test('proyectos GAS: formulario de creación y renombre funciona sin cuadro de diálogo del navegador',()=>{
 const a=app();a.run("abrir('gas');mostrarEditorProyectoGas('crear')");assert.equal(a.elements.get('editorProyectosGas').classList.hidden,false);a.elements.get('nombreProyectoGas').value='Formulario';a.run('guardarNombreProyectoGas()');assert.equal(a.run('nombreProyectoGas()'),'Formulario');assert.equal(a.elements.get('editorProyectosGas').classList.hidden,true);a.run("mostrarEditorProyectoGas('renombrar')");assert.equal(a.elements.get('nombreProyectoGas').value,'Formulario');a.elements.get('nombreProyectoGas').value='Formulario nuevo';a.run('guardarNombreProyectoGas()');assert.equal(a.run('nombreProyectoGas()'),'Formulario nuevo');assert.match(html,/>Nuevo proyecto<\/button>/);
});
test('proyectos GAS: exportación JSON real incluye todos los proyectos y el borrador actual',()=>{
 const a=app();a.run("abrir('gas')");nuevoProyectoPrueba(a,'Exportable');a.elements.get('desde').value='M';a.elements.get('hasta').value='Sin guardar';let texto='',clicks=0;const crear=a.ctx.document.createElement;a.ctx.Blob=class{constructor(p){texto=p.join('');}};a.ctx.URL.createObjectURL=()=> 'blob:respaldo';a.ctx.setTimeout=fn=>fn();a.ctx.document.createElement=()=>{const e=crear();e.click=()=>clicks++;return e;};a.run('descargarRespaldoCompleto()');const x=JSON.parse(texto);assert.equal(x.formato,'canerias-respaldo-v1');assert.equal(x.proyectos.gas.proyectosGuardados.length,1);assert.equal(x.proyectos.gas.proyectosGuardados[0].nombre,'Exportable');assert.equal(x.proyectos.gas.proyectosGuardados[0].datos.borradorFormularioGas.valores.hasta,'Sin guardar');assert.equal(clicks,1);
});
test('proyectos GAS: borrador inválido de un respaldo no provoca una importación parcial',()=>{
 const a=app();iniciarRedFlexible(a);a.run('guardarDatos()');const antes=a.saved();respaldoPrueba(a,{formato:'canerias-respaldo-v1',proyectos:{gas:{proyectosGuardados:[{id:'x',nombre:'Mal borrador',datos:{borradorFormularioGas:{accesorios:{tramo:'a',datos:'incorrecto'}}}}]},agua:{},cloacas:{}}});assert.equal(a.saved(),antes);assert.equal(a.run('tramos.length'),5);assert.match(a.text('estadoRespaldo'),/Borrador de accesorios no reconocido/);
});
test('proyectos GAS: un borrador ya incorporado no reaparece como tramo duplicado al reabrir',()=>{
 const a=app();a.run("abrir('gas')");const id=nuevoProyectoPrueba(a,'Sin duplicar borrador');for(const [campo,v]of Object.entries({desde:'M',hasta:'A',metros:'6',manualGas_codo90:'2'}))a.elements.get(campo).value=v;nuevoProyectoPrueba(a,'Pausa');irProyectoPrueba(a,id);a.run('calcularMaterialesManualGas()');assert.equal(a.run('tramos.length'),1);const b=app(a.saved());b.run("abrir('gas')");assert.equal(b.elements.get('desde').value,'');assert.equal(b.run('revisionMaterialesGas.plan.longitudInformada'),6);b.run('calcularMaterialesManualGas()');assert.equal(b.run('tramos.length'),1);assert.equal(cantidadManual(b,'codo90'),2);
});
test('proyectos GAS: borrador de revisión de croquis se recupera sólo en su proyecto, sin aplicarlo',()=>{
 const a=app();a.run("abrir('gas')");const uno=nuevoProyectoPrueba(a,'Croquis A');ejemploRevisado(a);const antes=a.run('JSON.stringify(borradorCroquis)');nuevoProyectoPrueba(a,'Croquis B');assert.equal(a.run('borradorCroquis'),null);assert.equal(a.run('tramos.length'),0);irProyectoPrueba(a,uno);assert.equal(a.run('JSON.stringify(borradorCroquis)'),antes);assert.equal(a.run('tramos.length'),0);assert.equal(a.run('proyectos.gas.demostracion?.tramos?.length||0'),0);
});
test('proyectos GAS: CSV identifica el proyecto activo y no exporta cantidades de otro',()=>{
 const a=app();a.run("abrir('gas')");const uno=nuevoProyectoPrueba(a,'CSV A');a.run("tramos=[{id:'a',desde:'M',hasta:'A',metros:6,diametro:null,consumo:null}];proyectoGasActual().conteosRapidosGas={a:{codo90:2}};calcularMaterialesManualGas()");nuevoProyectoPrueba(a,'CSV B');irProyectoPrueba(a,uno);let texto='',clicks=0;const crear=a.ctx.document.createElement;a.ctx.Blob=class{constructor(p){texto=p.join('');}};a.ctx.URL.createObjectURL=()=> 'blob:csv';a.ctx.setTimeout=fn=>fn();a.ctx.document.createElement=()=>{const e=crear();e.click=()=>clicks++;return e;};a.run('descargarMaterialesGas()');assert.equal(clicks,1);assert.match(texto,/"PROYECTO";"CSV A"/);assert.doesNotMatch(texto,/CSV B/);assert.equal(cantidadManual(a,'codo90'),2);
});

test('preparación de diámetros: red manual de cinco tramos reutiliza acumulados y rutas completas',()=>{
 const a=app();iniciarRedFlexible(a);a.run("instalacionGas.perfil.fuenteGas='Dato declarado del ejercicio'");const r=a.run('mostrarPreparacionDiametrosGas()').red;
 assert.deepEqual(Array.from(r.porTramo,t=>t.consumoKcal),[29200,13200,16000,3000,10200]);assert.deepEqual(Array.from(r.recorridos,x=>[x.artefacto,x.longitudReal]),[['Calefactor',36],['Cocina',33],['Termo',24]]);assert.equal(r.diametros,null);assert.equal(r.listoParaDimensionar,false);for(const t of r.porTramo)assert.equal(t.caudal,t.consumoKcal/9300);
});
test('preparación de diámetros: orden e inversión de extremos conservan los recorridos y consumos',()=>{
 const a=app(),b=app();iniciarRedFlexible(a);iniciarRedFlexible(b,true,[4,1,3,0,2]);const x=a.run('mostrarPreparacionDiametrosGas()').red,y=b.run('mostrarPreparacionDiametrosGas()').red;
 assert.equal(JSON.stringify(x.recorridos),JSON.stringify(y.recorridos));assert.deepEqual(Object.fromEntries(x.porTramo.map(t=>[t.id,t.consumoKcal])),Object.fromEntries(y.porTramo.map(t=>[t.id,t.consumoKcal])));
});
test('preparación de diámetros: no aplica un poder calorífico por defecto o sin fuente',()=>{
 const a=app();iniciarRedFlexible(a);for(const cambiar of ["delete instalacionGas.perfil.poderCalorifico;instalacionGas.perfil.fuenteGas='Dato declarado'","instalacionGas.perfil.poderCalorifico='9300';delete instalacionGas.perfil.fuenteGas"]){a.run(cambiar);const r=a.run('mostrarPreparacionDiametrosGas()').red;assert.ok(r.porTramo.every(t=>t.caudal===null));assert.match(r.pendientes.join(' '),/Poder calorífico y fuente/);assert.equal(r.porTramo[0].consumoKcal,29200);}
});
test('preparación de diámetros: tee sin vía queda pendiente y no se inventa accesorio o equivalente',()=>{
 const a=app();iniciarRedFlexible(a);const r=a.run('mostrarPreparacionDiametrosGas()').red;assert.match(r.pendientes.join(' '),/Derivación A.*Derivación B/);assert.ok(r.recorridos.every(x=>x.longitudEquivalente===null&&x.longitudDefinitiva===null));assert.equal(a.run('instalacionGas.nodos.length'),0);
});
test('preparación de diámetros: duplicados contradictorios, desconexiones y ciclos no generan rutas válidas',()=>{
 for(const cambio of ["tramos.push({...tramos[1],id:'otro',metros:99})","tramos[3].desde='Z'","tramos.push({id:'ciclo',desde:'M',hasta:'B',metros:1})"]){const a=app();iniciarRedFlexible(a);a.run(cambio);const r=a.run('mostrarPreparacionDiametrosGas()').red;assert.ok(r.errores.length);assert.equal(r.recorridos.length,0);assert.ok(r.porTramo.every(t=>t.consumoKcal===null));assert.equal(r.diametros,null);}
});
test('preparación de diámetros: longitud inválida y IDs duplicados bloquean el diagnóstico',()=>{
 for(const cambio of ["tramos[1].metros=0","tramos[1].metros=Infinity","tramos[1].id=tramos[0].id"]){const a=app();iniciarRedFlexible(a);a.run(cambio);const r=a.run('mostrarPreparacionDiametrosGas()').red;assert.ok(r.errores.length);assert.equal(r.recorridos.length,0);}
});
test('preparación de diámetros: lectura no cambia datos, cantidades, respaldos, PDF o CSV',()=>{
 const a=app();iniciarRedFlexible(a);a.run('calcularMaterialesManualGas();guardarDatos()');const antes=a.saved(),plan=a.run('JSON.stringify(revisionMaterialesGas.plan)'),pdf=a.run('JSON.stringify(modeloInformeActual())');a.run('mostrarPreparacionDiametrosGas()');assert.equal(a.saved(),antes);assert.equal(a.run('JSON.stringify(revisionMaterialesGas.plan)'),plan);assert.equal(a.run('JSON.stringify(modeloInformeActual())'),pdf);assert.equal(cantidadManual(a,'codo90'),18);assert.equal(cantidadManual(a,'tee'),2);assert.equal(cantidadManual(a,'llave'),3);assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
});
test('preparación de diámetros: proyectos independientes y demostración no comparten diagnóstico',()=>{
 const a=app();iniciarRedFlexible(a);a.run('guardarDatos()');const id=nuevoProyectoPrueba(a,'Red vacía');assert.equal(a.run('mostrarPreparacionDiametrosGas()').red.porTramo.length,0);irProyectoPrueba(a,'proyecto');assert.equal(a.run('mostrarPreparacionDiametrosGas()').red.porTramo.length,5);irProyectoPrueba(a,id);assert.equal(a.run('mostrarPreparacionDiametrosGas()').red.porTramo.length,0);irProyectoPrueba(a,'demostracion');assert.equal(a.run('mostrarPreparacionDiametrosGas()').red.porTramo.length,0);
});
test('preparación de diámetros: se actualiza al abrir diagnóstico y no requiere nueva conciliación',()=>{
 const a=app();iniciarRedFlexible(a);a.run("mostrarVista('dimensionGas')");const texto=()=>JSON.stringify(a.elements.get('preparacionDiametrosGas').children);assert.match(texto(),/29200/);a.run("artefactos[0].consumo=17000;mostrarVista('dimensionGas')");assert.match(texto(),/30200/);assert.equal(a.run('proyectos.gas.conciliacionRapidaGas'),undefined);assert.match(html,/<details class="gas-detalles"><summary>Revisión avanzada y ejercicios separados \(opcional\)/);
});
test('preparación de diámetros: sin escritura disponible ni módulos vecinos sigue funcionando',()=>{
 const a=app(null,{blocked:true,embebido:true});iniciarRedFlexible(a);assert.equal(a.run('mostrarPreparacionDiametrosGas()').red.porTramo.length,5);for(const m of ['agua','cloacas']){a.run(`abrir('${m}')`);assert.equal(a.run('mostrarPreparacionDiametrosGas()'),null);}
});
test('preparación de diámetros: enumera datos técnicos faltantes sin borrar los conocidos',()=>{
 const a=app();iniciarRedFlexible(a);a.run("instalacionGas.perfil.material='Acero con revestimiento epoxi';instalacionGas.perfil.sistema='Roscado'");const r=a.run('mostrarPreparacionDiametrosGas()').red;assert.match(r.pendientes.join(' '),/presión disponible.*presión mínima.*pérdida admisible/);assert.match(r.pendientes.join(' '),/localidad.*distribuidora/);assert.doesNotMatch(r.pendientes.join(' '),/pendiente: material de la cañería|pendiente: sistema de unión/);assert.equal(a.run('instalacionGas.perfil.material'),'Acero con revestimiento epoxi');
});
test('preparación de diámetros: diagnósticos no habilitan el motor ni transfieren tablas a otros sistemas',()=>{
 const a=app();iniciarRedFlexible(a);a.run("instalacionGas.perfil.material='Otro material';instalacionGas.perfil.sistema='Otro sistema';mostrarPreparacionDiametrosGas()");const r=a.run('motorDimensionarGas(tramos,artefactos,instalacionGas,catalogoParaGas(instalacionGas))');assert.equal(r.estado,'bloqueado');assert.equal(r.diametros,null);assert.equal(a.run('catalogoParaGas(instalacionGas)'),null);assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
});

test('epoxi/SIGAS: selección queda separada por proyecto y sobrevive a recarga JSON',()=>{
 const a=app();a.run("abrir('gas');seleccionarCatalogoSistemaGas('acero-epoxi-roscado-gn')");const id=nuevoProyectoPrueba(a,'SIGAS propio');a.run("seleccionarCatalogoSistemaGas('sigas')");const b=app(a.saved());b.run("abrir('gas')");assert.equal(b.run('mostrarPreparacionDiametrosGas().catalogo.id'),'sigas');assert.equal(b.run('mostrarPreparacionDiametrosGas().inventario.tablas.length'),4);irProyectoPrueba(b,'proyecto');assert.equal(b.run('mostrarPreparacionDiametrosGas().catalogo.id'),'acero-epoxi-roscado-gn');assert.equal(b.run('mostrarPreparacionDiametrosGas().inventario.tablas.length'),2);irProyectoPrueba(b,id);assert.equal(b.run('instalacionGas.perfil.catalogoTecnicoGas'),'sigas');
});
test('epoxi/SIGAS: selección no sobrescribe datos existentes y advierte discrepancias',()=>{
 const a=app();iniciarRedFlexible(a);a.run("instalacionGas.perfil.material='Acero con revestimiento epoxi';instalacionGas.perfil.sistema='Roscado';calcularMaterialesManualGas()");const antes=a.run('JSON.stringify(tramos)');a.run("seleccionarCatalogoSistemaGas('sigas')");const r=a.run('mostrarPreparacionDiametrosGas()');assert.equal(a.run('JSON.stringify(tramos)'),antes);assert.equal(a.run('instalacionGas.perfil.material'),'Acero con revestimiento epoxi');assert.equal(r.catalogo.tablas.length,4);assert.match(JSON.stringify(a.elements.get('preparacionDiametrosGas').children),/datos de acero epoxi\/roscado/);assert.equal(cantidadManual(a,'tee'),2);
});
test('epoxi/SIGAS: abrir diagnóstico no crea selección ni modifica datos anteriores',()=>{
 const a=app();iniciarRedFlexible(a);a.run('guardarDatos()');const antes=a.saved(),obj=a.run('JSON.stringify(proyectoGasActual())');a.run('mostrarPreparacionDiametrosGas()');assert.equal(a.saved(),antes);assert.equal(a.run('JSON.stringify(proyectoGasActual())'),obj);assert.equal(a.run('instalacionGas.perfil.catalogoTecnicoGas'),undefined);
});
test('epoxi/SIGAS: el puente reutiliza los 18 codos, 2 tees y 3 llaves sin activar diámetros',()=>{
 const a=app();iniciarRedFlexible(a);const r=a.run('mostrarPreparacionDiametrosGas()');for(const [tipo,q]of [['codo90',18],['tee',2],['llave',3]])assert.equal(r.accesorios.fisicas.filter(p=>p.tipo===tipo).reduce((s,p)=>s+p.cantidad,0),q);assert.equal(r.accesorios.porTramo.length,5);assert.ok(r.accesorios.porTramo.every(t=>!t.nombre.includes('undefined')));assert.equal(r.accesorios.largoComercial,6);assert.ok(r.medidas.every(m=>m.diametro==='Pendiente'));assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
});
test('epoxi/SIGAS: puente técnico no suma detalle y cantidad rápida coincidentes',()=>{
 const a=app();iniciarRedFlexible(a);a.run("tramos[1].detalle={estado:'completo',accesorios:[{tipo:'codo90',metrosAntes:2,salida:null}],metrosFinal:3}");const r=a.run('mostrarPreparacionDiametrosGas().accesorios');assert.equal(r.fisicas.filter(p=>p.tipo==='codo90').reduce((s,p)=>s+p.cantidad,0),18);assert.match(r.pendientes.join(' '),/Tipo real de llave/);assert.ok(r.fisicas.every(p=>p.equivalenteM===null));
});
test('epoxi/SIGAS: puente conserva ceros explícitos y campos pendientes distintos',()=>{
 const a=app();iniciarRedFlexible(a);a.run("proyectoGasActual().conteosRapidosGas['manual-A'].codo45=0");const r=a.run('mostrarPreparacionDiametrosGas().accesorios');assert.ok(r.ceros.some(p=>p.tramo==='manual-A'&&p.tipo==='codo45'&&p.cantidad===0));assert.match(r.pendientes.join(' '),/Codos de 45/);assert.ok(r.fisicas.every(p=>p.cantidad>0));
});
test('epoxi/SIGAS: seleccionar o borrar catálogo no habilita resultados ni acepta IDs inexistentes',()=>{
 const a=app();iniciarRedFlexible(a);a.run("seleccionarCatalogoSistemaGas('acero-epoxi-roscado-gn')");assert.equal(a.run("seleccionarCatalogoSistemaGas('inexistente')"),false);assert.equal(a.run('instalacionGas.perfil.catalogoTecnicoGas'),'acero-epoxi-roscado-gn');a.run("seleccionarCatalogoSistemaGas('')");assert.equal(a.run('mostrarPreparacionDiametrosGas().catalogo.id'),null);assert.ok(a.run('mostrarPreparacionDiametrosGas().medidas').every(m=>m.diametro==='Pendiente'));
});
test('epoxi/SIGAS: nombres legibles y cantidades conservadas al invertir extremos y orden',()=>{
 const a=app(),b=app();iniciarRedFlexible(a);iniciarRedFlexible(b,true,[4,2,1,0,3]);const x=a.run('mostrarPreparacionDiametrosGas().accesorios'),y=b.run('mostrarPreparacionDiametrosGas().accesorios');for(const tipo of ['codo90','tee','llave'])assert.equal(x.fisicas.filter(p=>p.tipo===tipo).reduce((s,p)=>s+p.cantidad,0),y.fisicas.filter(p=>p.tipo===tipo).reduce((s,p)=>s+p.cantidad,0));assert.equal(y.porTramo.find(t=>t.id==='manual-B').consumoKcal,13200);assert.equal(y.porTramo.find(t=>t.id==='manual-B').nombre,'B–A');
});
test('epoxi/SIGAS: fotografías, PDF, CSV y cantidades no se alteran al preparar el puente',()=>{
 const a=app();iniciarRedFlexible(a);a.run("proyectos.gas.foto='data:image/jpeg;base64,FOTO';calcularMaterialesManualGas();guardarDatos()");const datos=a.saved(),pdf=a.run('JSON.stringify(modeloInformeActual())'),plan=a.run('JSON.stringify(revisionMaterialesGas.plan)');a.run('mostrarPreparacionDiametrosGas()');assert.equal(a.saved(),datos);assert.equal(a.run('JSON.stringify(modeloInformeActual())'),pdf);assert.equal(a.run('JSON.stringify(revisionMaterialesGas.plan)'),plan);assert.equal(a.run('proyectos.gas.foto'),'data:image/jpeg;base64,FOTO');
});
test('epoxi/SIGAS: un resultado importado con flags inventados no aparece como diámetro verificado',()=>{
 const a=app();iniciarRedFlexible(a);a.run("seleccionarCatalogoSistemaGas('acero-epoxi-roscado-gn');proyectoGasActual().derivadosGas={firma:JSON.stringify({tramos,artefactos,instalacion:instalacionGas,tipoGas:$('gt').value}),dimensionamiento:{estado:'calculado',prueba:false,verificacionTecnica:true,catalogoHabilitado:true,diametros:{'manual-A':'1 pulgada falsa'}}}");const r=a.run('mostrarPreparacionDiametrosGas()');assert.ok(r.medidas.every(m=>m.diametro==='Pendiente'));
});
test('epoxi/SIGAS: módulos AGUA y CLOACAS no guardan selección de catálogo GAS',()=>{
 const a=app();for(const m of ['agua','cloacas']){a.run(`abrir('${m}')`);const antes=a.run('JSON.stringify(proyectos)');assert.equal(a.run("seleccionarCatalogoSistemaGas('sigas')"),false);assert.equal(a.run('JSON.stringify(proyectos)'),antes);assert.equal(a.run('mostrarPreparacionDiametrosGas()'),null);}
});
test('epoxi/SIGAS: importación de respaldo mantiene selección, fotografías y cantidades de ambos proyectos',()=>{
 const a=app();iniciarRedFlexible(a);a.run("proyectos.gas.foto='data:image/jpeg;base64,FOTO';seleccionarCatalogoSistemaGas('acero-epoxi-roscado-gn')");const id=nuevoProyectoPrueba(a,'Importar SIGAS');a.run("seleccionarCatalogoSistemaGas('sigas')");const b=app();respaldoPrueba(b,{formato:'canerias-respaldo-v1',proyectos:JSON.parse(a.saved())});b.run("abrir('gas')");irProyectoPrueba(b,id);assert.equal(b.run('instalacionGas.perfil.catalogoTecnicoGas'),'sigas');assert.equal(b.run('tramos.length'),0);irProyectoPrueba(b,'proyecto');assert.equal(b.run('instalacionGas.perfil.catalogoTecnicoGas'),'acero-epoxi-roscado-gn');assert.equal(b.run('tramos.length'),5);assert.equal(b.run('fotoURL'),'data:image/jpeg;base64,FOTO');b.run('calcularMaterialesManualGas()');assert.equal(cantidadManual(b,'codo90'),18);assert.equal(cantidadManual(b,'tee'),2);assert.equal(cantidadManual(b,'llave'),3);
});

test('SIGAS ed15: catálogo real muestra cuatro tablas y mantiene bloqueado el motor',()=>{
 const a=app();iniciarRedFlexible(a);a.run("seleccionarCatalogoSistemaGas('sigas')");const r=a.run('mostrarPreparacionDiametrosGas()');assert.equal(r.catalogo.edicion,'15 - 2025');assert.deepEqual(Array.from(r.inventario.tablas,t=>[t.numero,t.valores]),[[6,360],[4,540],[5,540],[3,202]]);assert.equal(r.diagnosticoSigas.motor.estado,'bloqueado');assert.equal(r.diagnosticoSigas.motor.diametros,null);assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
});
test('SIGAS ed15: reutiliza cinco tramos, consumos y cantidades sin sumar accesorios ni 15m',()=>{
 const a=app();iniciarRedFlexible(a);a.run("instalacionGas.perfil.fuenteGas='Dato del ejercicio';seleccionarCatalogoSistemaGas('sigas')");const r=a.run('mostrarPreparacionDiametrosGas()').diagnosticoSigas;
 assert.deepEqual(Array.from(r.filas,f=>f.consumoKcal),[29200,13200,16000,3000,10200]);assert.deepEqual(Array.from(r.filas,f=>f.longitudRealRutaMaxM),[36,36,24,36,33]);assert.ok(r.filas.every(f=>f.tabla===4&&f.pagina===22&&f.longitudEquivalenteM===null&&f.longitudDefinitivaM===null&&f.diametroDefinitivo===null));assert.equal(r.filas[0].consultas[0].longitudFilaM,36);for(const [tipo,q]of [['codo90',18],['tee',2],['llave',3]])assert.equal(r.accesoriosConocidos.filter(p=>p.tipo===tipo).reduce((s,p)=>s+p.cantidad,0),q);assert.equal(r.diametros,null);
});
test('SIGAS ed15: caudal sin poder calorífico o fuente conserva consultas pendientes',()=>{
 const a=app();iniciarRedFlexible(a);a.run("seleccionarCatalogoSistemaGas('sigas');delete instalacionGas.perfil.fuenteGas");const r=a.run('mostrarPreparacionDiametrosGas()').diagnosticoSigas;assert.ok(r.filas.every(f=>f.caudalM3h===null&&f.consultas.length===0));
});
test('SIGAS ed15: red invertida y desordenada consulta las mismas capacidades',()=>{
 const a=app(),b=app();for(const x of [a,b]){iniciarRedFlexible(x);x.run("instalacionGas.perfil.fuenteGas='Ejercicio';seleccionarCatalogoSistemaGas('sigas')");}b.run('tramos=tramos.reverse().map(t=>({...t,desde:t.hasta,hasta:t.desde}))');const x=a.run('mostrarPreparacionDiametrosGas().diagnosticoSigas'),y=b.run('mostrarPreparacionDiametrosGas().diagnosticoSigas');for(const f of x.filas)assert.equal(JSON.stringify(f.consultas),JSON.stringify(y.filas.find(t=>t.id===f.id).consultas));
});
test('SIGAS ed15: proyectos epoxi/SIGAS no comparten tablas ni consultas, incluso al recargar',()=>{
 const a=app();iniciarRedFlexible(a);a.run("seleccionarCatalogoSistemaGas('acero-epoxi-roscado-gn')");const id=nuevoProyectoPrueba(a,'SIGAS manual');a.run("seleccionarCatalogoSistemaGas('sigas')");const b=app(a.saved());b.run("abrir('gas')");assert.equal(b.run('mostrarPreparacionDiametrosGas().catalogo.tablas.length'),4);irProyectoPrueba(b,'proyecto');assert.equal(b.run('mostrarPreparacionDiametrosGas().diagnosticoSigas'),null);assert.equal(b.run('mostrarPreparacionDiametrosGas().catalogo.tablas.length'),2);irProyectoPrueba(b,id);assert.equal(b.run('mostrarPreparacionDiametrosGas().red.porTramo.length'),0);
});
test('SIGAS ed15: diagnóstico y adaptador no alteran fotos, materiales, PDF, CSV ni respaldo',()=>{
 const a=app();iniciarRedFlexible(a);a.run("proyectos.gas.foto='data:image/jpeg;base64,FOTO';seleccionarCatalogoSistemaGas('sigas');calcularMaterialesManualGas();guardarDatos()");const antes=a.saved(),plan=a.run('JSON.stringify(revisionMaterialesGas.plan)'),pdf=a.run('JSON.stringify(modeloInformeActual())');a.run('mostrarPreparacionDiametrosGas()');assert.equal(a.saved(),antes);assert.equal(a.run('JSON.stringify(revisionMaterialesGas.plan)'),plan);assert.equal(a.run('JSON.stringify(modeloInformeActual())'),pdf);assert.equal(cantidadManual(a,'codo90'),18);assert.equal(cantidadManual(a,'tee'),2);assert.equal(cantidadManual(a,'llave'),3);assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);
});
test('SIGAS ed15: selección no asigna válvulas ni reutiliza equivalentes de epoxi',()=>{
 const a=app();iniciarRedFlexible(a);a.run("seleccionarCatalogoSistemaGas('sigas')");const r=a.run('mostrarPreparacionDiametrosGas()');assert.ok(r.accesorios.fisicas.every(p=>p.equivalenteM===null));assert.match(r.diagnosticoSigas.pendientes.join(' '),/no se heredan exclusiones/);assert.match(r.accesorios.pendientes.join(' '),/Tipo real de llave/);assert.equal(r.catalogo.tablas.some(t=>t.numero===18),false);
});
test('SIGAS ed15: red desconectada no genera consultas de capacidad',()=>{
 const a=app();iniciarRedFlexible(a);a.run("instalacionGas.perfil.fuenteGas='Ejercicio';seleccionarCatalogoSistemaGas('sigas');tramos[1].desde='Z'");const r=a.run('mostrarPreparacionDiametrosGas()');assert.ok(r.red.errores.length);assert.ok(r.diagnosticoSigas.filas.every(f=>f.consultas.length===0));
});
test('SIGAS ed15: entrada técnica orienta red manual sin inventar tees ni cambiar el proyecto',()=>{
 const a=app();iniciarRedFlexible(a,true,[4,1,2,0,3]);a.run("seleccionarCatalogoSistemaGas('sigas')");const antes=a.run('JSON.stringify({tramos,artefactos,instalacionGas})'),r=a.run('mostrarPreparacionDiametrosGas()').diagnosticoSigas.entradaMotor;assert.ok(r.entrada);a.ctx.preparadaSigas=r.entrada;const red=a.run('analizarRedGas(preparadaSigas.tramos,preparadaSigas.artefactos,preparadaSigas.instalacion)');assert.deepEqual(Array.from(red.errores),[]);assert.equal(red.porTramo['manual-A'],29200);assert.equal(red.porTramo['manual-B'],13200);assert.ok(r.entrada.instalacion.nodos.every(n=>!n.unionDimensionamiento));assert.equal(a.run('JSON.stringify({tramos,artefactos,instalacionGas})'),antes);
});
test('SIGAS ed15: no traslada vías o geometría invertida como si estuvieran verificadas',()=>{
 const a=app();iniciarRedFlexible(a,true);a.run("tramos[1].detalle={estado:'completo',accesorios:[{tipo:'codo90',metrosAntes:2}],metrosFinal:3};instalacionGas.nodos=[{id:'m',nombre:'M',tipo:'medidor'},{id:'a',nombre:'A',tipo:'derivacion'},{id:'b',nombre:'B',tipo:'derivacion'}];tramos[1].red={desde:'b',hasta:'a',via:'principal'}");const r=a.run('SigasTecnico.prepararEntradaMotor(redFisicaManualGas(),tramos,artefactos,instalacionGas)');assert.ok(r.entrada);assert.match(r.faltantes.join(' '),/vía de tee no trasladada/);assert.match(r.faltantes.join(' '),/adaptación del detalle/);assert.equal(r.entrada.tramos.find(t=>t.id==='manual-B').red.via,undefined);assert.equal(a.run('tramos[1].detalle.estado'),'completo');
});

test('cierre GAS: ejemplo completo de usuario verifica materiales, rutas y consumos en ambos sistemas',()=>{
 const caso=require('./fixtures/cierre-gas-cinco-tramos.cjs');
 for(const sistema of ['acero-epoxi-roscado-gn','sigas','fusiogas']){const a=app();a.ctx.cierre=caso(sistema);a.run("abrir('gas');tramos=cierre.tramos;artefactos=cierre.artefactos;instalacionGas=cierre.instalacion;proyectos.gas.conteosRapidosGas=cierre.conteos;calcularMaterialesManualGas()");const r=a.run('estadoCierreGas()');assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);assert.equal(cantidadManual(a,'codo90'),18);assert.equal(cantidadManual(a,'tee'),2);assert.equal(cantidadManual(a,'llave'),3);assert.equal(r.consumoTotalKcal,29200);assert.deepEqual({...r.consumos},{'M-A':29200,'A-B':13200,'A-TERMO':16000,'B-CALEFACTOR':3000,'B-COCINA':10200});assert.deepEqual(Array.from(r.recorridos,x=>x.longitudReal),[36,33,24]);assert.equal(r.motor.estado,'bloqueado');assert.equal(r.diametros,null);assert.equal(cantidadManual(a,'codo45'),0);assert.equal(cantidadManual(a,'reduccion'),0);assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);}
});
test('cierre GAS: una tabla, un estado actualizado y un desplegable técnico junto al resultado',()=>{
 const a=app();iniciarRedFlexible(a);a.run('calcularMaterialesManualGas()');const nodos=descendientesPresentacion(a.elements.get('resumenPrincipalMaterialesGas'));assert.equal(nodos.filter(n=>n.tagName==='TABLE').length,1);assert.equal(nodos.filter(n=>n.textContent.startsWith('Estado: materiales manuales calculados')).length,1);assert.ok(nodos.some(n=>n.textContent.includes('29.200 kcal/h')));assert.equal(nodos.filter(n=>n.textContent==='Datos técnicos pendientes').length,1);assert.equal(nodos.filter(n=>n.textContent==='Ver tablas y diagnóstico avanzado').length,1);assert.match(html,/id="herramientasGasOpcionales"[^>]*><summary>Revisiones y opciones avanzadas/);assert.doesNotMatch(html,/id="herramientasGasOpcionales"[^>]*\bopen\b/);
});
test('cierre GAS: formulario principal tiene un solo botón de cálculo y un selector de sistema',()=>{
 assert.equal([...html.matchAll(/onclick="calcularMaterialesManualGas\(\)">CALCULAR CAÑERÍA<\/button>/g)].length,1);assert.equal([...html.matchAll(/id="catalogoSistemaGas"/g)].length,1);assert.ok(html.indexOf('id="catalogoSistemaGas"')<html.indexOf('<section id="dimensionGas"'));const a=app();a.run("abrir('gas');seleccionarCatalogoSistemaGas('sigas')");assert.equal(a.run('instalacionGas.perfil.material'),'Acero-polietileno SIGAS Thermofusión');assert.equal(a.run('instalacionGas.perfil.sistema'),'Thermofusión');assert.equal(a.run('instalacionGas.perfil.presionDisponible'),undefined);
});
test('cierre GAS: sistema visible se recupera al alternar proyectos sin sobrescribir los anteriores',()=>{
 const a=app();a.run("abrir('gas');seleccionarCatalogoSistemaGas('acero-epoxi-roscado-gn')");const id=nuevoProyectoPrueba(a,'Nueva SIGAS');a.run("seleccionarCatalogoSistemaGas('sigas')");irProyectoPrueba(a,'proyecto');assert.equal(a.elements.get('catalogoSistemaGas').value,'acero-epoxi-roscado-gn');irProyectoPrueba(a,id);assert.equal(a.elements.get('catalogoSistemaGas').value,'sigas');a.run("instalacionGas.perfil.material='Material heredado';seleccionarCatalogoSistemaGas('acero-epoxi-roscado-gn')");assert.equal(a.run('instalacionGas.perfil.material'),'Material heredado');
});
test('cierre GAS: bloqueo o fallo técnico no bloquea los materiales y no inventa diámetros',()=>{
 const a=app();iniciarRedFlexible(a);a.run("seleccionarCatalogoSistemaGas('sigas');SigasTecnico.adaptador=()=>{throw Error('Fallo técnico simulado')};calcularMaterialesManualGas()");assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);assert.equal(cantidadManual(a,'codo90'),18);assert.equal(a.run('estadoCierreGas().consumoTotalKcal'),29200);assert.equal(a.run('estadoCierreGas().estadoDiametros'),'diagnostico-no-disponible');assert.equal(a.run('estadoCierreGas().diametros'),null);assert.match(JSON.stringify(a.elements.get('resumenPrincipalMaterialesGas').children),/Los materiales manuales siguen disponibles/);
});
test('cierre GAS: estado técnico se actualiza tras editar consumo y no modifica respaldo, fotos o informes',()=>{
 const a=app();iniciarRedFlexible(a);a.run("proyectos.gas.foto='data:image/jpeg;base64,FOTO';calcularMaterialesManualGas();guardarDatos()");const antes=a.saved(),pdf=a.run('JSON.stringify(modeloInformeActual())');a.run('estadoCierreGas();renderResumenPrincipalGas()');assert.equal(a.saved(),antes);assert.equal(a.run('JSON.stringify(modeloInformeActual())'),pdf);a.run('artefactos[0].consumo=17000;calcularMaterialesManualGas()');assert.equal(a.run('estadoCierreGas().consumoTotalKcal'),30200);const texto=JSON.stringify(a.elements.get('resumenPrincipalMaterialesGas').children);assert.match(texto,/30.200 kcal\/h/);assert.doesNotMatch(texto,/29.200 kcal\/h/);assert.equal(a.run('proyectos.gas.foto'),'data:image/jpeg;base64,FOTO');
});
test('cierre GAS: red común orienta también epoxi y mantiene pendientes las vías no confirmadas',()=>{
 const a=app();iniciarRedFlexible(a,true,[3,1,4,0,2]);a.run("seleccionarCatalogoSistemaGas('acero-epoxi-roscado-gn')");const r=a.run('estadoCierreGas()');a.ctx.entradaCierre=r.entradaMotor;assert.deepEqual(Array.from(a.run('analizarRedGas(entradaCierre.tramos,entradaCierre.artefactos,entradaCierre.instalacion).errores')),[]);assert.equal(r.consumos['manual-A'],29200);assert.equal(r.consumos['manual-B'],13200);assert.ok(r.entradaMotor.instalacion.nodos.every(n=>!n.unionDimensionamiento));assert.equal(r.diametros,null);
});
test('cierre GAS: fuente técnica desactualizada no se promociona como resultado vigente',()=>{
 const a=app();iniciarRedFlexible(a);a.run("proyectoGasActual().derivadosGas={firma:'vieja',dimensionamiento:{estado:'calculado',diametros:{'manual-A':'1 pulgada'},verificacionTecnica:true,catalogoHabilitado:true}};calcularMaterialesManualGas()");const r=a.run('estadoCierreGas()');assert.equal(r.diametros,null);assert.equal(r.estadoDiametros,'pendiente-validacion-tecnica');assert.ok(a.run('tramos.every(t=>t.diametro===null)'));
});
test('cierre GAS: consumo puede cargarse una sola vez en el tramo terminal sin repetir artefactos',()=>{
 const a=app();iniciarRedFlexible(a);a.run("artefactos=[];tramos[2].consumo=16000;tramos[3].consumo=3000;tramos[4].consumo=10200;calcularMaterialesManualGas()");assert.equal(a.run('estadoCierreGas().consumoTotalKcal'),29200);assert.equal(cantidadManual(a,'codo90'),18);assert.equal(cantidadManual(a,'tee'),2);assert.equal(cantidadManual(a,'llave'),3);
});
test('cierre GAS: AGUA/CLOACAS conservan sus datos y no reciben selector ni estado GAS',()=>{
 const a=app();for(const m of ['agua','cloacas']){a.run(`abrir('${m}')`);a.elements.get('duda').value=m;a.run('guardarRevision()');const antes=a.saved();assert.equal(a.run('estadoCierreGas()'),null);a.run('sincronizarSistemaPrincipalGas()');assert.equal(a.saved(),antes);assert.equal(a.elements.get('menuGas').classList.hidden,true);}
});
test('cierre GAS: fotografía y tramos quedan opcionales pero los accesos directos los abren',()=>{
 const a=app();a.run("abrir('gas')");assert.equal(a.elements.get('referenciaOpcionalGas').open,false);a.run("irSeccionGas('foto')");assert.equal(a.elements.get('referenciaOpcionalGas').open,true);a.run("irSeccionGas('tramos')");assert.equal(a.elements.get('tramosRegistradosGas').open,true);a.elements.get('referenciaOpcionalGas').open=false;a.run('revisarCroquisParaEntrega()');assert.equal(a.elements.get('referenciaOpcionalGas').open,true);assert.match(a.text('entregaAccion'),/No hay foto/);
});
test('cierre GAS: cantidades completas no vuelven a pedir confirmación en tarjetas de tramos',()=>{
 const a=app();const caso=require('./fixtures/cierre-gas-cinco-tramos.cjs');a.ctx.cierre=caso();a.run("abrir('gas');tramos=cierre.tramos;artefactos=cierre.artefactos;instalacionGas=cierre.instalacion;proyectos.gas.conteosRapidosGas=cierre.conteos;calcularMaterialesManualGas();renderTramos()");assert.match(a.text('resumenTramosRegistradosGas'),/5 tramos/);assert.equal(a.run('tramos[0].detalle.estado'),'pendiente');assert.ok(a.elements.get('listaTramos').children.every(t=>t.children[1].textContent.startsWith('Cantidades manuales guardadas')));assert.doesNotMatch(JSON.stringify(a.elements.get('listaTramos').children),/Indicá si no hay accesorios/);
});
test('cierre GAS: fotografías y aclaraciones de AGUA/CLOACAS siguen accesibles sin desplegables nuevos',()=>{
 const a=app();for(const m of ['agua','cloacas']){a.run(`abrir('${m}')`);assert.equal(a.elements.get('referenciaOpcionalGas').open,true);assert.equal(a.elements.get('resumenReferenciaGas').classList.hidden,true);a.elements.get('duda').value=m;a.run('guardarRevision()');assert.match(a.text('revision'),new RegExp(m));}
});
test('cierre GAS: ejemplo exacto desordenado y con extremos invertidos conserva los dos sistemas',()=>{
 const caso=require('./fixtures/cierre-gas-cinco-tramos.cjs');for(const sistema of ['sigas','acero-epoxi-roscado-gn']){const a=app();a.ctx.cierre=caso(sistema);a.run("abrir('gas');tramos=[4,2,0,3,1].map(i=>({...cierre.tramos[i],desde:cierre.tramos[i].hasta,hasta:cierre.tramos[i].desde}));artefactos=cierre.artefactos;instalacionGas=cierre.instalacion;proyectos.gas.conteosRapidosGas=cierre.conteos;calcularMaterialesManualGas()");const e=a.run('estadoCierreGas()');assert.equal(e.consumoTotalKcal,29200);assert.deepEqual(Array.from(e.recorridos,r=>r.longitudReal),[36,33,24]);assert.equal(e.consumos['A-B'],13200);assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);assert.equal(cantidadManual(a,'codo90'),18);assert.equal(cantidadManual(a,'tee'),2);assert.equal(cantidadManual(a,'llave'),3);assert.equal(e.diametros,null);}
});
test('cierre GAS: respaldo técnico parcial no impide cargar, recalcular ni imprimir materiales',()=>{
 const a=app();iniciarRedFlexible(a);a.run("proyectoGasActual().derivadosGas={firma:'incompleta',anterior:{firma:'previa'}};calcularMaterialesManualGas();prepararInformeActual()");assert.equal(cantidadManual(a,'codo90'),18);assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);assert.match(JSON.stringify(a.elements.get('respaldosGas').children),/pendiente de recuperar/);assert.match(a.elements.get('informeImpresion').innerHTML,/TRAMO/);assert.doesNotMatch(a.elements.get('informeImpresion').innerHTML,/<button/);
});
test('cierre GAS: cantidad inválida heredada no se presenta como confirmada ni se corrige por suposición',()=>{
 const a=app();const caso=require('./fixtures/cierre-gas-cinco-tramos.cjs');a.ctx.cierre=caso();a.run("abrir('gas');tramos=cierre.tramos;artefactos=cierre.artefactos;instalacionGas=cierre.instalacion;proyectos.gas.conteosRapidosGas=cierre.conteos;datosPlanGas().opciones.cargaManualDirecta=true;proyectos.gas.conteosRapidosGas['M-A'].codo45=-1;renderTramos()");assert.equal(a.run("proyectos.gas.conteosRapidosGas['M-A'].codo45"),-1);assert.ok(!a.elements.get('listaTramos').children[0].children[1].textContent.startsWith('Cantidades manuales guardadas'));
});

for(const sistema of ['acero-epoxi-roscado-gn','sigas','fusiogas'])for(const gas of ['GN','GLP'])test('etapa 1: '+sistema+' / '+gas+' conserva cinco tramos, materiales, consumos y bloqueos',()=>{
 const a=app();a.ctx.caso=require('./fixtures/cierre-gas-cinco-tramos.cjs')();a.ctx.sistema=sistema;a.ctx.gas=gas;
 a.run("abrir('gas');seleccionarCatalogoSistemaGas(sistema);tramos=caso.tramos;artefactos=caso.artefactos;proyectos.gas.conteosRapidosGas=caso.conteos;seleccionarCombustibleGas(gas);calcularMaterialesManualGas()");
 assert.equal(a.run('tramos.length'),5);assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);for(const [tipo,q]of [['codo90',18],['tee',2],['llave',3]])assert.equal(cantidadManual(a,tipo),q);
 assert.equal(a.run('instalacionGas.perfil.gas'),gas);assert.equal(a.elements.get('gt').value,gas==='GN'?'9300':'22300');
 const estado=a.run('estadoCierreGas()');assert.equal(estado.sistema,sistema);assert.equal(estado.consumoTotalKcal,29200);assert.deepEqual(JSON.parse(JSON.stringify(estado.consumos)),{'M-A':29200,'A-B':13200,'A-TERMO':16000,'B-CALEFACTOR':3000,'B-COCINA':10200});assert.equal(estado.diametros,null);assert.equal(estado.motor.estado,'bloqueado');
 a.run("proyectoGasActual().foto='data:image/jpeg;base64,FOTO';guardarDatos();prepararInformeActual()");assert.match(a.elements.get('informeImpresion').innerHTML,/TRAMO/);assert.doesNotMatch(a.elements.get('informeImpresion').innerHTML,/<button/);
 const b=app(a.saved());b.run("abrir('gas')");assert.equal(b.run('instalacionGas.perfil.gas'),gas);assert.equal(b.run('CatalogosSistemasGas.identificar(instalacionGas.perfil)'),sistema);assert.equal(b.run('proyectoGasActual().foto'),'data:image/jpeg;base64,FOTO');assert.equal(b.run('tramos.length'),5);
});
test('etapa 1: cambiar referencia antigua a envasado modifica perfil y suspende condiciones GN conservadas',()=>{
 const a=app();iniciarRedFlexible(a);a.run("instalacionGas.perfil.poderCalorifico='9300';instalacionGas.perfil.densidadRelativa='.65';instalacionGas.perfil.fuenteGas='Ejercicio GN';guardarDatos()");a.elements.get('gt').value='22300';a.elements.get('gt').change();
 assert.equal(a.run('instalacionGas.perfil.gas'),'GLP');assert.equal(a.run('perfilTecnicoActualGas().poderCalorifico'),'');assert.equal(a.run('instalacionGas.perfil.poderCalorifico'),'9300');assert.equal(a.run('instalacionGas.perfil.condicionesAnterioresCombustible[0].gas'),'GN');assert.equal(a.run('estadoCierreGas().motor.diametros'),null);assert.equal(a.run('estadoCierreGas().recorridos.every(r=>r.caudal===null)'),true);assert.match(a.text('estadoCombustibleGas'),/revisar poder calorífico/);
 a.run("seleccionarCombustibleGas('GN')");assert.equal(a.run('perfilTecnicoActualGas().poderCalorifico'),''); // volver no valida automáticamente
 for(const [id,v]of Object.entries({dimPCS:'9300',dimDensidad:'.65',dimFuenteGas:'Referencia GN revisada'}))a.elements.get(id).value=v;
 a.run('guardarCondicionesDimensionamiento()');assert.equal(a.run('perfilTecnicoActualGas().poderCalorifico'),'9300');assert.equal(a.run('estadoCierreGas().diametros'),null);
});
test('etapa 1: respaldo legado contradictorio no se convierte en GN ni se reescribe al restaurar',()=>{
 const a=app();iniciarRedFlexible(a);a.run("guardarDatos()");const datos=JSON.parse(a.saved());datos.gas.tipoGas='22300';datos.gas.instalacion.perfil.gas='GN';const guardado=JSON.stringify(datos),b=app(guardado);assert.equal(b.saved(),guardado);b.run("abrir('gas')");assert.equal(b.run('perfilTecnicoActualGas().gas'),null);assert.equal(b.run('instalacionGas.perfil.gas'),'GN');assert.equal(b.run('proyectoGasActual().tipoGas'),'22300');assert.equal(b.run('estadoCierreGas().diametros'),null);assert.match(b.text('estadoCombustibleGas'),/no coinciden/);
 b.run("seleccionarCombustibleGas('GLP')");assert.equal(b.run('perfilTecnicoActualGas().gas'),'GLP');assert.equal(b.run('combustibleTecnicoGas().conflicto'),false);
});
test('etapa 1: nuevos proyectos SIGAS y FUSIOGAS usan 4 m; epoxi mantiene 6 m como opción',()=>{
 const a=app();a.run("abrir('gas')");for(const id of ['sigas','fusiogas','acero-epoxi-roscado-gn']){a.ctx.id=id;a.run("crearProyectoGas('Nuevo '+id);seleccionarCatalogoSistemaGas(id)");assert.equal(a.run('opcionesMaterialesGas().largoComercial'),id==='acero-epoxi-roscado-gn'?6:4);assert.equal(a.run('tramos.length'),0);}
});
test('etapa 1: largo explícito anterior y 6 m implícitos se conservan hasta acción consciente',()=>{
 const a=app();iniciarRedFlexible(a);a.run("instalacionGas.perfil.material='Acero con revestimiento epoxi';instalacionGas.perfil.sistema='Roscado';seleccionarCatalogoSistemaGas('sigas')");assert.equal(a.run('opcionesMaterialesGas().largoComercial'),6);assert.equal(a.run('estadoLargoComercialGas().pendiente'),true);assert.match(a.text('estadoLargoComercialGas'),/no se cambió/);
 a.run('datosPlanGas().opciones.largoComercial=8;guardarDatos()');const b=app(a.saved());b.run("abrir('gas')");assert.equal(b.run('opcionesMaterialesGas().largoComercial'),8);assert.equal(b.run('tramos.length'),5);b.run('usarLargoDocumentadoGas()');assert.equal(b.run('opcionesMaterialesGas().largoComercial'),4);assert.equal(b.run('datosPlanGas().opciones.largoComercialAnterior'),8);assert.equal(b.run('tramos.length'),5);assert.equal(b.run('instalacionGas.perfil.material'),'Acero con revestimiento epoxi'); // material legado no se sobrescribe
});
test('etapa 1: catálogos y combustibles independientes por proyecto; respaldos conservan metadatos',()=>{
 const a=app();a.run("abrir('gas');crearProyectoGas('FUSIO GLP');seleccionarCatalogoSistemaGas('fusiogas');seleccionarCombustibleGas('GLP');proyectoGasActual().foto='data:image/jpeg;base64,F';guardarDatos()");const id=a.run('ambitoGas');a.run("crearProyectoGas('SIGAS GN');seleccionarCatalogoSistemaGas('sigas');seleccionarCombustibleGas('GN')");a.ctx.id=id;a.run('seleccionarAmbitoGas(id)');assert.equal(a.run('instalacionGas.perfil.gas'),'GLP');assert.equal(a.run('CatalogosSistemasGas.identificar(instalacionGas.perfil)'),'fusiogas');assert.equal(a.run('opcionesMaterialesGas().largoComercial'),4);assert.equal(a.run('proyectoGasActual().foto'),'data:image/jpeg;base64,F');
 const respaldo=JSON.stringify(a.run('JSON.parse(JSON.stringify(proyectos))'));assert.match(respaldo,/condicionesAnterioresCombustible/);const b=app(respaldo);b.run("abrir('gas')");assert.equal(b.run('instalacionGas.perfil.gas'),'GLP');assert.equal(b.run('CatalogosSistemasGas.identificar(instalacionGas.perfil)'),'fusiogas');assert.equal(b.run('opcionesMaterialesGas().largoComercial'),4);
});
test('etapa 1: SIGAS propano y FUSIO GLP consultan sus tablas; GLP genérico SIGAS queda pendiente',()=>{
 const a=app();iniciarRedFlexible(a);a.run("seleccionarCatalogoSistemaGas('sigas');seleccionarCombustibleGas('GLP')");assert.equal(a.run('mostrarPreparacionDiametrosGas().diagnosticoSigas.filas.every(f=>f.tabla===null)'),true);
 a.run("seleccionarCombustibleGas('propano-gaseoso')");assert.equal(a.run('mostrarPreparacionDiametrosGas().diagnosticoSigas.filas.every(f=>f.tabla===5&&f.pagina===23)'),true);
 a.run("seleccionarCatalogoSistemaGas('fusiogas');seleccionarCombustibleGas('GLP')");assert.equal(a.run('mostrarPreparacionDiametrosGas().diagnosticoFusiogas.filas.every(f=>f.pagina===20)'),true);assert.equal(a.run('estadoCierreGas().diametros'),null);
});
test('etapa 1: PDF no traslada exclusiones epoxi a SIGAS o FUSIOGAS',()=>{
 const a=app();iniciarRedFlexible(a);for(const id of ['sigas','fusiogas']){a.ctx.id=id;a.run('seleccionarCatalogoSistemaGas(id)');const pdf=a.run('modeloInformeActual().resumen.join(" ")');assert.match(pdf,/no se aplica la exclusión del método de clase epoxi/);assert.doesNotMatch(pdf,/Método de clase: reducciones en materiales, excluidas/);}
});
test('etapa 1: respaldo JSON v1 real recupera FUSIOGAS, GLP, largo anterior y fotografía para PDF',()=>{
 const a=app();iniciarRedFlexible(a);a.run("seleccionarCatalogoSistemaGas('fusiogas');seleccionarCombustibleGas('GLP');datosPlanGas().opciones.largoComercial=6;usarLargoDocumentadoGas()");const io=lectorFotosPrueba(a),r=io.cargar();io.terminar(r,'data:image/jpeg;base64,RESPALDOFUSIO');
 let contenido;a.ctx.Blob=class{constructor(partes){contenido=partes.join('')}};a.ctx.setTimeout=()=>{};a.ctx.document.createElement=()=>({click(){}});a.run('descargarRespaldoCompleto()');const x=JSON.parse(contenido);assert.equal(x.formato,'canerias-respaldo-v1');
 const b=app();b.run("abrir('gas')");respaldoPrueba(b,x);assert.match(b.text('estadoRespaldo'),/recuperado/);assert.equal(b.run('tramos.length'),5);assert.equal(b.run('instalacionGas.perfil.gas'),'GLP');assert.equal(b.run('CatalogosSistemasGas.identificar(instalacionGas.perfil)'),'fusiogas');assert.equal(b.run('datosPlanGas().opciones.largoComercial'),4);assert.equal(b.run('datosPlanGas().opciones.largoComercialAnterior'),6);assert.ok(b.run('instalacionGas.perfil.condicionesAnterioresCombustible.length')>0);b.run('prepararInformeActual()');assert.match(b.elements.get('informeImpresion').innerHTML,/RESPALDOFUSIO/);
});
test('etapa 1: FUSIOGAS desordenado y con extremos invertidos conserva recorridos y consumos',()=>{
 const a=app();iniciarRedFlexible(a,true,[4,2,0,3,1]);a.run("seleccionarCatalogoSistemaGas('fusiogas');seleccionarCombustibleGas('GLP');calcularMaterialesManualGas()");const e=a.run('estadoCierreGas()');assert.equal(e.consumoTotalKcal,29200);assert.deepEqual(Object.values(e.consumos).sort((a,b)=>a-b),[3000,10200,13200,16000,29200]);assert.deepEqual(Array.from(e.recorridos,r=>r.longitudReal),[36,33,24]);assert.equal(e.diametros,null);assert.equal(cantidadManual(a,'tee'),2);
});

function configurarCasilleroPrueba(a,entrada,codo='pendiente'){
 a.elements.get('entradaCasilleroGas').value=entrada;a.run('guardarCasilleroMedidorGas()');
 a.elements.get('codoCasilleroGas').value=codo;a.run('guardarCasilleroMedidorGas()');
}
for(const orientacion of ['lateral','posterior','superior','desconocida'])test('casillero M: entrada '+orientacion+' solo suma la pieza justificada',()=>{
 const a=app();iniciarRedFlexible(a);a.run('calcularMaterialesManualGas()');const datos=a.run('JSON.stringify({tramos,artefactos,instalacionGas,conteos:proyectoGasActual().conteosRapidosGas})'),otras=a.run("JSON.stringify(revisionMaterialesGas.plan.filas.filter(f=>f.tipo!=='codo90'))"),tecnico=a.run('JSON.stringify(estadoCierreGas())');
 configurarCasilleroPrueba(a,orientacion,'no-incluido');a.run('calcularMaterialesManualGas()');const esperado=['lateral','posterior'].includes(orientacion)?19:18;assert.equal(cantidadManual(a,'codo90'),esperado);assert.equal(a.run('revisionMaterialesGas.plan.filas.filter(f=>f.id==="casillero-medidor:codo90").length'),esperado===19?1:0);
 assert.equal(a.run('JSON.stringify({tramos,artefactos,instalacionGas,conteos:proyectoGasActual().conteosRapidosGas})'),datos);assert.equal(a.run("JSON.stringify(revisionMaterialesGas.plan.filas.filter(f=>f.tipo!=='codo90'))"),otras);assert.equal(a.run('JSON.stringify(estadoCierreGas())'),tecnico);assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);
 if(esperado===19){const f=a.run('revisionMaterialesGas.plan.filas.find(f=>f.id==="casillero-medidor:codo90")');assert.equal(f.ubicacion,'Interior del casillero M');assert.equal(f.diametro,'Pendiente');assert.equal(f.cantidadConfirmada,true);}
 a.run('calcularMaterialesManualGas();calcularMaterialesManualGas()');assert.equal(cantidadManual(a,'codo90'),esperado);
});
for(const orientacion of ['lateral','posterior'])test('casillero M: '+orientacion+' ya incluido o sin cotejo nunca duplica',()=>{
 const a=app();iniciarRedFlexible(a);configurarCasilleroPrueba(a,orientacion);a.run('calcularMaterialesManualGas()');assert.equal(cantidadManual(a,'codo90'),18);assert.match(a.text('estadoCasilleroGas'),/indicá si el codo/);
 configurarCasilleroPrueba(a,orientacion,'incluido');a.run('calcularMaterialesManualGas()');assert.equal(cantidadManual(a,'codo90'),18);assert.match(a.text('estadoCasilleroGas'),/ya incluido/);
});
test('casillero M: cambiar orientación exige nuevo cotejo y conserva respaldo desactualizado',()=>{
 const a=app();iniciarRedFlexible(a);configurarCasilleroPrueba(a,'lateral','no-incluido');a.run('calcularMaterialesManualGas()');assert.equal(cantidadManual(a,'codo90'),19);a.elements.get('entradaCasilleroGas').value='posterior';a.run('guardarCasilleroMedidorGas();calcularMaterialesManualGas()');assert.equal(a.run('proyectoGasActual().casilleroMedidorGas.codo'),'pendiente');assert.equal(cantidadManual(a,'codo90'),18);assert.ok(a.run('datosPlanGas().respaldos.length')>0);
});
test('casillero M: referencia física detallada existente no se agrega dos veces aunque se declare no incluida',()=>{
 const a=app();iniciarRedFlexible(a);a.run("tramos[0].detalle={estado:'pendiente',accesorios:[{idFisico:'casillero-medidor:codo90',tipo:'codo90',entrada:null,salida:null}]}");configurarCasilleroPrueba(a,'lateral','no-incluido');a.run('calcularMaterialesManualGas()');assert.equal(cantidadManual(a,'codo90'),18);assert.ok(a.run('revisionMaterialesGas.plan.avisos.some(s=>s.includes("referencia física registrada"))'));assert.equal(a.run('revisionMaterialesGas.plan.filas.some(f=>f.origen==="regla-casillero-confirmada")'),false);
});
test('casillero M: PDF, JSON y proyectos conservan regla y conteo; ejemplo anterior no se reescribe',()=>{
 const a=app();iniciarRedFlexible(a);configurarCasilleroPrueba(a,'posterior','no-incluido');a.run('calcularMaterialesManualGas();prepararInformeActual()');assert.match(a.elements.get('informeImpresion').innerHTML,/codo de 90° dentro del casillero M/);assert.equal(a.run('modeloInformeActual().filas.filter(f=>f.tipo==="codo90").reduce((s,f)=>s+f.cantidad,0)'),19);
 const b=app(a.saved());b.run("abrir('gas');calcularMaterialesManualGas()");assert.equal(cantidadManual(b,'codo90'),19);assert.equal(b.run('proyectoGasActual().casilleroMedidorGas.entrada'),'posterior');b.run("crearProyectoGas('Otro proyecto vacío')");assert.equal(b.run('proyectoGasActual().casilleroMedidorGas'),undefined);b.run("seleccionarAmbitoGas('proyecto');calcularMaterialesManualGas()");assert.equal(cantidadManual(b,'codo90'),19);
 const c=app();c.run("abrir('gas')");respaldoPrueba(c,{formato:'canerias-respaldo-v1',proyectos:JSON.parse(a.saved())});c.run('calcularMaterialesManualGas()');assert.equal(cantidadManual(c,'codo90'),19);assert.equal(require('./fixtures/cierre-gas-cinco-tramos.cjs')().conteos['M-A'].codo90,7);
});

test('revisión final GAS: perfil del ejemplo corresponde a cada sistema y no hereda acero epoxi en FUSIOGAS',()=>{
 const caso=require('./fixtures/cierre-gas-cinco-tramos.cjs');for(const [id,material,union]of [['acero-epoxi-roscado-gn','Acero con revestimiento epoxi','Roscado'],['sigas','Acero-polietileno SIGAS Thermofusión','Thermofusión'],['fusiogas','Acero-polietileno FUSIOGAS Thermofusión','Thermofusión']]){const c=caso(id);assert.equal(c.instalacion.perfil.material,material);assert.equal(c.instalacion.perfil.sistema,union);assert.equal(c.instalacion.perfil.catalogoTecnicoGas,id);}
});
test('revisión final GAS: aviso del resultado reconoce el codo condicional sin negar que se incorporó',()=>{
 const a=app();iniciarRedFlexible(a);configurarCasilleroPrueba(a,'posterior','no-incluido');a.run('calcularMaterialesManualGas()');const texto=descendientesPresentacion(a.elements.get('resumenPrincipalMaterialesGas')).map(n=>n.textContent).join(' ');assert.match(texto,/Incluye un codo de 90° dentro del casillero M/);assert.doesNotMatch(texto,/No se agregaron accesorios/);assert.equal(cantidadManual(a,'codo90'),19);assert.equal(a.run('estadoCierreGas().diametros'),null);
});
test('revisión final GAS: comprobaciones largas permanecen plegadas y detalle conserva ubicación conocida del casillero',()=>{
 const a=app();iniciarRedFlexible(a);configurarCasilleroPrueba(a,'lateral','no-incluido');a.run('calcularMaterialesManualGas()');const nodos=descendientesPresentacion(a.elements.get('resumenPrincipalMaterialesGas'));assert.equal(nodos.filter(n=>n.tagName==='TABLE').length,1);const resumen=nodos.find(n=>n.textContent.startsWith('Ver comprobaciones técnicas pendientes ('));assert.ok(resumen);assert.ok(nodos.some(n=>n.textContent==='Codo 90° · 1 unidad · Interior del casillero M'));assert.ok(nodos.some(n=>n.textContent.startsWith('Ver detalle por tramo')));assert.ok(nodos.some(n=>n.textContent==='Datos técnicos pendientes'));
});

test('motor SIGAS: ejercicio listo conserva 58m, 19 codos, 2 tees, 3 llaves y demandas sin otra carga',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");assert.equal(a.run('tramos.length'),5);assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);assert.equal(cantidadManual(a,'codo90'),19);assert.equal(cantidadManual(a,'tee'),2);assert.equal(cantidadManual(a,'llave'),3);assert.equal(a.run('estadoCierreGas().consumoTotalKcal'),29200);
 const r=a.run('calcularPreseleccionSigasGas()');assert.deepEqual(Array.from(r.filas,f=>f.candidato?.exteriorMm),[32,25,25,20,25]);assert.deepEqual(Array.from(r.filas,f=>f.candidato?.longitudFilaM),[48,48,32,48,46]);assert.deepEqual(Array.from(r.filas,f=>f.candidato?.capacidadM3h),[3.932,1.786,2.188,.807,1.825]);assert.equal(r.definitivo,false);assert.equal(r.diametrosDefinitivos,null);assert.ok(r.filas.every(f=>f.longitudDefinitivaM===null));assert.ok(a.run('tramos.every(t=>t.diametro===null)'));
});
test('motor SIGAS: proyecto de referencia no pisa datos, fotografía ni proyecto y no se duplica al abrirlo otra vez',()=>{
 const a=app();iniciarRedFlexible(a);a.run("proyectoGasActual().foto='data:image/jpeg;base64,ORIGINAL';guardarDatos()");const antes=a.run('JSON.stringify({tramos:proyectos.gas.tramos,foto:proyectos.gas.foto,conteos:proyectos.gas.conteosRapidosGas})');a.run('abrirEjercicioSigas19Gas()');const id=a.run('ambitoGas');a.run('abrirEjercicioSigas19Gas()');assert.equal(a.run('ambitoGas'),id);assert.equal(a.run('registrosProyectosGas().filter(p=>p.datos.referenciaSigas19).length'),1);a.run("seleccionarAmbitoGas('proyecto')");assert.equal(a.run('JSON.stringify({tramos:proyectos.gas.tramos,foto:proyectos.gas.foto,conteos:proyectos.gas.conteosRapidosGas})'),antes);
});
test('motor SIGAS: 19 piezas de codo siguen registradas con técnicos desconocidos, sin inventar orientación del casillero',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");assert.equal(a.run('proyectoGasActual().casilleroMedidorGas'),undefined);assert.equal(a.run("entradaPreseleccionSigasGas().inventario.fisicas.filter(p=>p.tipo==='codo90').reduce((n,p)=>n+p.cantidad,0)"),19);assert.deepEqual(Array.from(a.run("entradaPreseleccionSigasGas().inventario.fisicas.find(p=>p.id==='referencia-codo19').tramos")),['ref-B-Cocina']);assert.match(a.run('calcularPreseleccionSigasGas().pendientes.join(" ")'),/producto SIGAS exacto/);assert.equal(cantidadManual(a,'codo90'),19);
});
test('motor SIGAS: guardar producto recalcula equivalentes sin volver a confirmar cantidades ni cambiar tramos',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();proyectoGasActual().reglaMedidorReferenciaGas=false");const antes=a.run('JSON.stringify(tramos)'),pieza=a.run("entradaPreseleccionSigasGas().inventario.fisicas.find(p=>p.tipo==='codo90'&&p.tramos.includes('ref-M-A')).id");a.ctx.pieza=pieza;a.run("guardarVinculoSigasGas(pieza,'Calefactor','sigas-p24-izquierdo-21')");const r=a.run('calcularPreseleccionSigasGas()');assert.ok(r.recorridos.every(r=>r.aportes.some(a=>a.piezaId===pieza&&Math.abs(a.equivalenteTotalM-8.337)<1e-10)));assert.equal(a.run('JSON.stringify(tramos)'),antes);assert.equal(cantidadManual(a,'codo90'),19);assert.equal(r.definitivo,false);const b=app(a.saved());b.run("abrir('gas');calcularMaterialesManualGas()");assert.equal(b.run('JSON.stringify(proyectoGasActual().calculoSigas)'),a.run('JSON.stringify(proyectoGasActual().calculoSigas)'));assert.equal(cantidadManual(b,'codo90'),19);
});
test('motor SIGAS: resultados numéricos prioritarios, una tabla de materiales y copia de seguridad sin diámetros inventados',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();prepararInformeActual()");const ns=descendientesPresentacion(a.elements.get('resumenPrincipalMaterialesGas'));assert.equal(ns.filter(n=>n.tagName==='TABLE').length,2);assert.ok(ns.some(n=>n.textContent==='Diámetros por tramo · SIGAS GN'));assert.ok(ns.some(n=>/exterior 32 mm/.test(n.textContent)));assert.match(a.elements.get('informeImpresion').innerHTML,/19/);assert.equal(a.run('estadoCierreGas().diametros'),null);assert.equal(a.run('CATALOGOS_GAS_VERIFICADOS.length'),0);
});
test('motor SIGAS: edición de consumos invalida la preselección anterior y no altera AGUA/CLOACAS',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();proyectos.agua={aclaracion:'Agua conservada'};proyectos.cloacas={aclaracion:'Cloacas conservadas'}");const q=a.run('calcularPreseleccionSigasGas().filas[0].caudalM3h');a.run('artefactos[0].consumo=17000;guardarDatos();calcularMaterialesManualGas()');assert.notEqual(a.run('calcularPreseleccionSigasGas().filas[0].caudalM3h'),q);assert.equal(a.run('estadoCierreGas().consumoTotalKcal'),30200);assert.equal(a.run('proyectos.agua.aclaracion'),'Agua conservada');assert.equal(a.run('proyectos.cloacas.aclaracion'),'Cloacas conservadas');
});
test('motor SIGAS: nombre de referencia ocupado no sobrescribe un proyecto del usuario',()=>{
 const a=app();iniciarRedFlexible(a);a.run("crearProyectoGas('Referencia SIGAS · 58 m · 19 codos');proyectoGasActual().foto='data:image/jpeg;base64,PROPIA';guardarDatos()");const antes=a.saved(),ambito=a.run('ambitoGas');assert.equal(a.run('abrirEjercicioSigas19Gas()'),false);assert.equal(a.saved(),antes);assert.equal(a.run('ambitoGas'),ambito);assert.equal(a.run('proyectoGasActual().foto'),'data:image/jpeg;base64,PROPIA');
});
test('pantalla móvil SIGAS: materiales primero y diámetros dentro del detalle técnico, sin acciones duplicadas',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const ns=descendientesPresentacion(a.elements.get('resumenPrincipalMaterialesGas')),tablas=ns.filter(n=>n.tagName==='TABLE');assert.equal(tablas.length,2);assert.equal(tablas[0].className,'tabla gas-lista-simple');assert.equal(tablas[1].className,'tabla sigas-diametros');assert.equal(tablas[1].children[1].children.length,5);assert.doesNotMatch(html,/>Generar lista de mi proyecto</);assert.doesNotMatch(html,/>Obtener materiales de mi proyecto</);assert.match(html,/id="ejerciciosGasSeparados"/);assert.match(a.text('estadoAmbitoGas'),/^EJERCICIO SIGAS/);assert.equal(cantidadManual(a,'codo90'),19);
});
test('pantalla SIGAS: posibles cuplas conserva pendientes y muestra estimaciones y ceros reales',()=>{
 const a=app();assert.match(a.run('textoCuplasSigasGas({filas:[{tipo:"cupla-plan",cantidad:null}]})'),/^Posibles cuplas: pendiente de confirmar/);assert.match(a.run('textoCuplasSigasGas({filas:[{tipo:"cupla-plan",cantidad:3}],planes:[]})'),/Cuplas estimadas: 3/);assert.match(a.run('textoCuplasSigasGas({filas:[{tipo:"cupla-plan",cantidad:0}],planes:[]})'),/Cuplas estimadas: 0/);assert.match(a.run('textoCuplasSigasGas({filas:[{tipo:"cupla-plan",cantidad:3}],planes:[{hipotesis:true}]})'),/^Posibles cuplas: pendiente de confirmar/);
});
test('pantalla SIGAS: selector separa referencias sin reclasificar proyectos por sus nombres ni cambiar datos',()=>{
 const a=app();iniciarRedFlexible(a);a.run("guardarDatos();abrirEjercicioSigas19Gas()");const datos=a.saved();a.run('renderAmbitoGas()');assert.equal(a.saved(),datos);const grupos=a.elements.get('ambitoGas').children;assert.equal(grupos[0].label,'Mis proyectos');assert.equal(grupos[1].label,'Ejercicios y demostraciones');assert.ok(grupos[0].children.some(n=>n.value==='proyecto'));assert.ok(grupos[1].children.some(n=>n.value===a.run('ambitoGas')));assert.equal(a.run('registrosProyectosGas().length'),1);
});
test('SIGAS pérdidas: familia confirmada persiste y recalcula sin repetir carga ni perder respaldo',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();proyectoGasActual().reglaMedidorReferenciaGas=false");const antes=a.run('JSON.stringify(tramos)');a.run("const piezaFamilia=entradaPreseleccionSigasGas().inventario.fisicas.find(p=>p.tipo==='codo90'&&p.tramos.includes('ref-M-A')).id;guardarVinculoSigasGas(piezaFamilia,'Calefactor','familia:Codo Normal a 90º')");const r=a.run('calcularPreseleccionSigasGas()');assert.ok(r.recorridos.every(r=>r.aportes.some(p=>Math.abs(p.equivalenteTotalM-8.337)<1e-10)));assert.equal(a.run('JSON.stringify(tramos)'),antes);const b=app(a.saved());b.run("abrir('gas');calcularMaterialesManualGas()");assert.equal(b.run('JSON.stringify(proyectoGasActual().calculoSigas)'),a.run('JSON.stringify(proyectoGasActual().calculoSigas)'));assert.equal(cantidadManual(b,'codo90'),19);assert.equal(cantidadManual(b,'tee'),2);assert.equal(cantidadManual(b,'llave'),3);assert.equal(b.run('revisionMaterialesGas.plan.longitudInformada'),58);assert.equal(b.run('calcularPreseleccionSigasGas().definitivo'),false);assert.ok(b.run('calcularPreseleccionSigasGas().recorridos.some(r=>r.faltantes.length>0)'));
});
test('GAS pantalla compacta: formulario cerrado al ingresar y separado de AGUA y CLOACAS',()=>{
 const a=app();a.run("abrir('gas')");assert.equal(a.elements.get('editarTramosGas').open,false);a.run("abrir('agua')");assert.equal(a.elements.get('editarTramosGas').classList.hidden,true);a.run("abrir('cloacas')");assert.equal(a.elements.get('editarTramosGas').classList.hidden,true);a.run("abrir('gas')");assert.equal(a.elements.get('editarTramosGas').classList.hidden,false);
});
test('GAS principal compacta: controles únicos y secundarios conservados sin tocar el motor',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");assert.equal([...html.matchAll(/onclick="calcularMaterialesManualGas\(\)">CALCULAR CAÑERÍA<\/button>/g)].length,1);assert.ok(html.indexOf('id="ambitoGas"')<html.indexOf('id="catalogoSistemaGas"'));assert.ok(html.indexOf('id="catalogoSistemaGas"')<html.indexOf('id="combustibleSistemaGas"'));assert.ok(html.indexOf('id="editarDatosGas"')<html.indexOf('id="calcularCaneriaGas"'));assert.equal(a.elements.get('imprimirGeneral').classList.hidden,true);assert.equal(cantidadManual(a,'codo90'),19);assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);assert.deepEqual(Array.from(a.run('calcularPreseleccionSigasGas().filas'),f=>f.candidato.exteriorMm),[32,25,25,20,25]);a.run("abrir('agua')");assert.equal(a.elements.get('imprimirGeneral').classList.hidden,false);
});
test('edición agrupada: cinco tramos, filas únicas y codo adicional de Cocina sin mutar el plan',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const antes=a.run('JSON.stringify(revisionMaterialesGas.plan)'),g=a.run('organizarEdicionMaterialesGas(revisionMaterialesGas.plan)');assert.deepEqual(Array.from(g,x=>x.nombre),['M–A','A–B','A–Termo','B–Calefactor','B–Cocina']);const filas=Array.from(g).flatMap(x=>Array.from(x.filas));assert.equal(filas.length,a.run('revisionMaterialesGas.plan.filas.length'));assert.equal(new Set(filas.map(a=>a.fila.id)).size,filas.length);assert.equal(g.find(x=>x.nombre==='B–Cocina').filas.filter(a=>a.fila.tipo==='codo90').reduce((n,a)=>n+a.fila.cantidad,0),6);assert.equal(filas.filter(a=>a.adicionalReferencia).length,1);assert.equal(a.run('JSON.stringify(revisionMaterialesGas.plan)'),antes);assert.equal(cantidadManual(a,'codo90'),19);assert.equal(cantidadManual(a,'tee'),2);assert.equal(cantidadManual(a,'llave'),3);});
test('edición agrupada: resumen y render no cambian PDF, cálculos, guardado ni cantidades',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();prepararInformeActual()");const pdf=a.elements.get('informeImpresion').innerHTML,datos=a.saved(),plan=a.run('JSON.stringify(revisionMaterialesGas.plan)'),motor=a.run('JSON.stringify(calcularPreseleccionSigasGas())');a.run('renderPlanGas();renderPlanGas();prepararInformeActual()');assert.equal(a.elements.get('informeImpresion').innerHTML,pdf);assert.equal(a.saved(),datos);assert.equal(a.run('JSON.stringify(revisionMaterialesGas.plan)'),plan);assert.equal(a.run('JSON.stringify(calcularPreseleccionSigasGas())'),motor);assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);});
test('edición agrupada: ceros plegados, pendientes fuera de ceros y todos los editores disponibles',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const ns=descendientesPresentacion(a.elements.get('matResultado')),cards=tarjetasMateriales(a);assert.equal(cards.length,a.run('revisionMaterialesGas.plan.filas.length'));assert.ok(ns.filter(n=>n.className==='gas-materiales-grupo').every(n=>!n.open));assert.ok(ns.filter(n=>n.className==='gas-materiales-ceros').every(n=>!n.open));const ceros=ns.filter(n=>n.className==='gas-materiales-ceros').flatMap(n=>descendientesPresentacion(n).filter(c=>c.className==='gas-material-card'));const ids=new Set(ceros.map(c=>c.claveFilaGas));for(const f of a.run('revisionMaterialesGas.plan.filas'))assert.equal(ids.has(f.id),f.cantidad===0);assert.ok(cards.every(c=>descendientesPresentacion(c).some(n=>n.type==='number')));assert.ok(cards.every(c=>descendientesPresentacion(c).some(n=>n.type==='checkbox')));assert.ok(ns.some(n=>n.textContent==='Pendiente'));});
test('edición agrupada: una pieza compartida entre dos tramos se edita en un solo lugar',()=>{const a=app();a.run("abrir('gas')");a.ctx.edicionCompartida={filas:[{id:'t',tipo:'tee',material:'Tee',cantidad:1,ubicacion:'id1, id2',nodo:'nombre:a'}]};const g=a.run("organizarEdicionMaterialesGas(edicionCompartida,[{id:'id1',desde:'M',hasta:'A'},{id:'id2',desde:'A',hasta:'B'}],{})");assert.equal(g.length,1);assert.equal(g[0].clave,'compartidos');assert.equal(g[0].filas.length,1);assert.equal(g[0].filas[0].compartida,true);});
test('edición agrupada: cambiar cero y pendiente conserva la sección abierta y la revisión manual',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");a.elements.get('ajustesAvanzadosGas').open=true;let ns=descendientesPresentacion(a.elements.get('matResultado')),grupo=ns.find(n=>n.className==='gas-materiales-grupo');grupo.open=true;const idsCeros=a.run("revisionMaterialesGas.plan.filas.find(f=>f.cantidad===0&&f.ubicacion==='ref-M-A').id");let card=tarjetasMateriales(a).find(c=>c.claveFilaGas===idsCeros),qty=descendientesPresentacion(card).find(n=>n.type==='number');qty.value='2';qty.onchange();assert.equal(a.elements.get('ajustesAvanzadosGas').open,true);assert.equal(a.run('revisionMaterialesGas.plan.filas.find(f=>f.id==='+JSON.stringify(idsCeros)+').cantidad'),2);card=tarjetasMateriales(a).find(c=>c.claveFilaGas===idsCeros);qty=descendientesPresentacion(card).find(n=>n.type==='number');qty.value='';qty.onchange();assert.equal(a.run('revisionMaterialesGas.plan.filas.find(f=>f.id==='+JSON.stringify(idsCeros)+').cantidad'),null);assert.ok(descendientesPresentacion(tarjetasMateriales(a).find(c=>c.claveFilaGas===idsCeros)).some(n=>n.textContent==='Pendiente'));});
test('edición agrupada: no atribuye un codo real sin ubicación al ejemplo ni altera correcciones propias',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const fila=a.run("revisionMaterialesGas.plan.filas.find(f=>f.ubicacion==='Codo 19 del ejercicio · ubicación técnica por verificar')");a.ctx.filaExtra={...fila,ubicacion:'A–B'};const g=a.run('organizarEdicionMaterialesGas({filas:[filaExtra]},tramos,proyectoGasActual())');assert.equal(g[0].nombre,'A–B');assert.equal(g[0].filas[0].adicionalReferencia,false);const real=a.run('organizarEdicionMaterialesGas({filas:[{...filaExtra,ubicacion:"Codo 19 del ejercicio · ubicación técnica por verificar"}]},tramos,{})');assert.equal(real[0].clave,'sin-ubicacion');});
test('SIGAS ejercicio: codo adicional pertenece técnicamente a B–Cocina sin asumir normal/MH ni cambiar materiales',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const antes=a.run('JSON.stringify({tramos,artefactos,p:proyectoGasActual()})'),r=a.run('calcularPreseleccionSigasGas()');assert.deepEqual(Array.from(r.filas,f=>f.cantidadesRegistradas.codo90),[7,1,1,4,6]);assert.deepEqual(Array.from(r.filas,f=>f.consumoKcal),[29200,13200,16000,3000,10200]);const cocina=r.filas.find(f=>f.id==='ref-B-Cocina');assert.ok(cocina.perdidasPendientesTramo.some(p=>p.piezaId==='referencia-codo19'));assert.ok(r.filas.filter(f=>f.id!=='ref-B-Cocina').every(f=>!f.perdidasPendientesTramo.some(p=>p.piezaId==='referencia-codo19')));assert.equal(a.run("proyectoGasActual().calculoSigas?.vinculos?.['referencia-codo19']"),undefined);assert.equal(a.run('JSON.stringify({tramos,artefactos,p:proyectoGasActual()})'),antes);assert.equal(cantidadManual(a,'codo90'),19);assert.equal(cantidadManual(a,'tee'),2);assert.equal(cantidadManual(a,'llave'),3);assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);assert.equal(r.definitivo,false);});
test('SIGAS control: siete codos normales explícitos aportan 8,337m solo a M–A y verifican la fila46',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();proyectoGasActual().reglaMedidorReferenciaGas=false;const idCodosM=entradaPreseleccionSigasGas().inventario.fisicas.find(p=>p.tipo==='codo90'&&p.tramos.includes('ref-M-A')).id;guardarVinculoSigasGas(idCodosM,'Calefactor','familia:Codo Normal a 90º')");const r=a.run('calcularPreseleccionSigasGas()'),m=r.filas[0];assert.equal(m.equivalenteConocidoTramoM,8.337);assert.equal(m.longitudConsultaM,44.337);assert.equal(m.verificacionConsulta.filaM,46);assert.equal(m.verificacionConsulta.capacidadM3h,4.017);assert.ok(r.filas.slice(1).every(f=>f.equivalenteConocidoTramoM===null));assert.equal(m.verificacionConsulta.parcial,true);assert.ok(r.filas.find(f=>f.id==='ref-B-Cocina').perdidasPendientesTramo.some(p=>p.piezaId==='referencia-codo19'));assert.equal(r.definitivo,false);assert.equal(cantidadManual(a,'codo90'),19);});
test('SIGAS producto fijo: dependencias locales se guardan y recuperan sin depender de diámetros ajenos',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();const idCocina=entradaPreseleccionSigasGas().inventario.fisicas.find(p=>p.id==='referencia-codo19').id;guardarVinculoSigasGas(idCocina,'Cocina','sigas-p24-izquierdo-20')");const dep=a.run("proyectoGasActual().calculoSigas.vinculos['referencia-codo19'].producto.tramosDiametro");assert.deepEqual(Array.from(dep),['ref-B-Cocina']);assert.ok(a.run('calcularPreseleccionSigasGas().recorridos.find(r=>r.artefacto==="Cocina").aportes.some(p=>p.piezaId==="referencia-codo19")'));const b=app(a.saved());b.run("abrir('gas');calcularMaterialesManualGas()");assert.deepEqual(Array.from(b.run("proyectoGasActual().calculoSigas.vinculos['referencia-codo19'].producto.tramosDiametro")),['ref-B-Cocina']);assert.equal(cantidadManual(b,'codo90'),19);});
test('SIGAS trazabilidad técnica no cambia la vista compacta de materiales ni el PDF',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();prepararInformeActual()");const pdf=a.elements.get('informeImpresion').innerHTML,plan=a.run('JSON.stringify(revisionMaterialesGas.plan)'),datos=a.saved();a.run('calcularPreseleccionSigasGas();renderResumenPrincipalGas();renderPlanGas();prepararInformeActual()');assert.equal(a.elements.get('informeImpresion').innerHTML,pdf);assert.equal(a.run('JSON.stringify(revisionMaterialesGas.plan)'),plan);assert.equal(a.saved(),datos);assert.equal(tarjetasMateriales(a).length,a.run('revisionMaterialesGas.plan.filas.length'));});
test('SIGAS necesidades terminales automáticas separadas de los 19 codos declarados',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const e=a.run('entradaPreseleccionSigasGas()');assert.equal(e.inventario.necesidadesTerminales.length,4);assert.equal(e.inventario.fisicas.filter(p=>p.tipo==='codo90').reduce((n,p)=>n+p.cantidad,0),19);const r=a.run('calcularPreseleccionSigasGas()');assert.ok(r.recorridos.every(r=>r.perdidasPendientes.some(p=>p.piezaId==='terminal-medidor')));assert.ok(r.recorridos.every(r=>r.perdidasPendientes.filter(p=>p.tipo==='conexion-terminal').length===2));assert.equal(cantidadManual(a,'tee'),2);assert.equal(cantidadManual(a,'llave'),3);assert.equal(r.definitivo,false);});
test('SIGAS desglose individual conserva siete piezas y permite seis comunes más una terminal',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();proyectoGasActual().reglaMedidorReferenciaGas=false;const grupo=entradaPreseleccionSigasGas().inventario.fisicas.find(p=>p.tipo==='codo90'&&p.tramos.includes('ref-M-A')).id;separarProductosSigasGas(grupo)");const ps=a.run("entradaPreseleccionSigasGas().inventario.fisicas.filter(p=>p.grupoOriginal)");assert.equal(ps.length,7);assert.ok(ps.every(p=>p.cantidad===1));a.ctx.ids=Array.from(ps,p=>p.id);a.run("identificarConexionSigasGas(ids[0],'terminal-medidor');guardarVinculoSigasGas(ids[0],'Calefactor','sigas-p24-izquierdo-39');for(const id of ids.slice(1))guardarVinculoSigasGas(id,'Calefactor','familia:Codo Normal a 90º')");const r=a.run('calcularPreseleccionSigasGas()');assert.ok(Math.abs(r.filas[0].equivalenteConocidoTramoM-(.543+6*1.191))<1e-9);assert.ok(r.recorridos.every(r=>!r.perdidasPendientes.some(p=>p.piezaId==='terminal-medidor')));assert.equal(cantidadManual(a,'codo90'),19);assert.equal(cantidadManual(a,'tee'),2);assert.equal(cantidadManual(a,'llave'),3);assert.equal(r.definitivo,false);const b=app(a.saved());b.run("abrir('gas');calcularMaterialesManualGas()");assert.equal(b.run('entradaPreseleccionSigasGas().inventario.fisicas.filter(p=>p.grupoOriginal).length'),7);assert.equal(b.run('JSON.stringify(proyectoGasActual().calculoSigas)'),a.run('JSON.stringify(proyectoGasActual().calculoSigas)'));const c=app();c.run("abrir('gas')");respaldoPrueba(c,{formato:'canerias-respaldo-v1',proyectos:JSON.parse(a.saved())});assert.equal(c.run('entradaPreseleccionSigasGas().inventario.fisicas.filter(p=>p.grupoOriginal).length'),7);});
test('SIGAS separar no copia familia del grupo ni pierde sus vínculos previos',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();proyectoGasActual().reglaMedidorReferenciaGas=false;const grupo=entradaPreseleccionSigasGas().inventario.fisicas.find(p=>p.tipo==='codo90'&&p.tramos.includes('ref-M-A')).id;guardarVinculoSigasGas(grupo,'Calefactor','familia:Codo Normal a 90º');separarProductosSigasGas(grupo)");assert.equal(a.run('calcularPreseleccionSigasGas().filas[0].equivalenteConocidoTramoM'),null);assert.ok(a.run("proyectoGasActual().calculoSigas.vinculos[grupo].producto.familia"));assert.equal(cantidadManual(a,'codo90'),19);});
test('SIGAS cambio de cantidad conserva identificaciones y exige revisar el desglose antiguo',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();proyectoGasActual().reglaMedidorReferenciaGas=false;const grupo=entradaPreseleccionSigasGas().inventario.fisicas.find(p=>p.tipo==='codo90'&&p.tramos.includes('ref-M-A')).id;separarProductosSigasGas(grupo);proyectoGasActual().conteosRapidosGas['ref-M-A'].codo90=8");assert.match(a.run('entradaPreseleccionSigasGas().inventario.pendientes.join(" ")'),/Cambió la cantidad/);assert.equal(a.run('entradaPreseleccionSigasGas().inventario.fisicas.filter(p=>p.grupoOriginal).length'),0);assert.equal(a.run('proyectoGasActual().calculoSigas.desgloses[grupo].cantidad'),7);});
test('SIGAS productos individuales no ofrecen sus equivalencias para otro sistema',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");for(const id of ['epoxi','fusiogas']){a.ctx.sistema=id;a.run('instalacionGas.perfil.catalogoTecnicoGas=sistema');assert.equal(a.run('entradaPreseleccionSigasGas()'),null);assert.equal(a.run('separarProductosSigasGas("inexistente")'),false);}});
test('SIGAS automático M–A: una transición pendiente y seis comunes sin siete identificaciones',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const original=a.run('JSON.stringify({tramos,plan:proyectoGasActual().planCompra,conteos:proyectoGasActual().conteosRapidosGas})'),e=a.run('entradaPreseleccionSigasGas()'),ma=e.inventario.fisicas.filter(p=>p.tramos.includes('ref-M-A')&&p.tipo==='codo90');assert.equal(ma.length,2);assert.deepEqual(Array.from(ma,p=>p.cantidad),[1,6]);assert.equal(ma[0].necesidadTerminal,'terminal-medidor');assert.equal(ma[1].necesidadTerminal,undefined);const r=a.run('calcularPreseleccionSigasGas()');assert.ok(Math.abs(r.filas[0].equivalenteConocidoTramoM-6*1.191)<1e-9);assert.ok(r.recorridos.every(r=>r.perdidasPendientes.some(p=>p.piezaId===ma[0].id)));assert.ok(r.recorridos.every(r=>r.aportes.filter(p=>p.piezaId===ma[1].id).length===1));assert.equal(a.run('JSON.stringify({tramos,plan:proyectoGasActual().planCompra,conteos:proyectoGasActual().conteosRapidosGas})'),original);assert.equal(cantidadManual(a,'codo90'),19);assert.equal(cantidadManual(a,'tee'),2);assert.equal(cantidadManual(a,'llave'),3);assert.equal(r.definitivo,false);assert.ok(r.filas.every(f=>f.longitudDefinitivaM===null));});
test('SIGAS automática: solo confirmar rosca suma transición una vez y conserva seis comunes',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();const especial=entradaPreseleccionSigasGas().inventario.fisicas.find(p=>p.automatico&&p.necesidadTerminal).id;guardarVinculoSigasGas(especial,'Calefactor','sigas-p24-izquierdo-39')");const r=a.run('calcularPreseleccionSigasGas()');assert.ok(Math.abs(r.filas[0].equivalenteConocidoTramoM-(.543+6*1.191))<1e-9);assert.ok(r.recorridos.every(r=>!r.perdidasPendientes.some(p=>p.piezaId==='terminal-medidor')));assert.equal(cantidadManual(a,'codo90'),19);const b=app(a.saved());b.run("abrir('gas')");assert.ok(Math.abs(b.run('calcularPreseleccionSigasGas().filas[0].equivalenteConocidoTramoM')-(.543+6*1.191))<1e-9);});
test('SIGAS automática: corrección de comunes a pendiente o MH prevalece sin recargar cantidades',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();const comunes=entradaPreseleccionSigasGas().inventario.fisicas.find(p=>p.cantidad===6&&p.automatico).id;guardarVinculoSigasGas(comunes,'Calefactor','')");assert.equal(a.run('calcularPreseleccionSigasGas().filas[0].equivalenteConocidoTramoM'),null);a.run("guardarVinculoSigasGas(comunes,'Calefactor','familia:Codo MH a 90° de')");assert.ok(a.run('calcularPreseleccionSigasGas().filas[0].equivalenteConocidoTramoM')>0);assert.equal(cantidadManual(a,'codo90'),19);});
test('SIGAS automática: no adivina salida del medidor en un proyecto ajeno al ejercicio confirmado',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();delete proyectoGasActual().referenciaSigas19");assert.equal(a.run('entradaPreseleccionSigasGas().inventario.fisicas.filter(p=>p.automatico).length'),0);assert.equal(a.run('entradaPreseleccionSigasGas().inventario.fisicas.filter(p=>p.necesidadTerminal).length'),0);assert.ok(a.run('calcularPreseleccionSigasGas().recorridos.every(r=>r.perdidasPendientes.some(p=>p.piezaId==="terminal-medidor"))'));});
test('SIGAS todos los tramos: identifica comunes, tees y llaves sin añadir terminales ni piezas',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();proyectoGasActual().reglaTerminalesArtefactosGas=false");const antes=a.run('JSON.stringify({tramos,artefactos,p:proyectoGasActual()})'),e=a.run('entradaPreseleccionSigasGas()'),r=a.run('calcularPreseleccionSigasGas()');assert.deepEqual(Array.from(r.filas,f=>f.cantidadesRegistradas.codo90),[7,1,1,4,6]);const especiales=e.inventario.fisicas.filter(p=>p.necesidadTerminal);assert.equal(especiales.length,1);assert.deepEqual(Array.from(especiales[0].tramos),['ref-M-A']);assert.equal(e.inventario.fisicas.filter(p=>p.tipo==='tee'&&p.clasificacionAutomatica).length,2);assert.equal(e.inventario.fisicas.filter(p=>p.tipo==='llave'&&p.clasificacionAutomatica).length,3);const esperados=[6*1.191,.856,.856,4*.953,5*.856];r.filas.forEach((f,i)=>assert.ok(Math.abs(f.equivalenteConocidoTramoM-esperados[i])<1e-9));assert.equal(e.inventario.fisicas.filter(p=>p.tipo==='codo90').reduce((n,p)=>n+p.cantidad,0),19);assert.equal(r.definitivo,false);assert.equal(a.run('JSON.stringify({tramos,artefactos,p:proyectoGasActual()})'),antes);});
test('SIGAS todos los tramos: tees, tipo de llave y adicional cocina quedan pendientes sin pérdidas cero',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const r=a.run('calcularPreseleccionSigasGas()');assert.ok(r.recorridos.every(r=>r.perdidasPendientes.some(p=>p.tipo==='tee')));assert.ok(r.recorridos.every(r=>r.perdidasPendientes.some(p=>p.tipo==='llave')));const cocina=r.filas.find(f=>f.id==='ref-B-Cocina');assert.ok(cocina.perdidasPendientesTramo.some(p=>p.piezaId==='referencia-codo19'));assert.ok(r.filas.every(f=>f.longitudDefinitivaM===null));assert.equal(cantidadManual(a,'tee'),2);assert.equal(cantidadManual(a,'llave'),3);assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);});
test('SIGAS todos los tramos: correcciones individuales prevalecen y persisten',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();proyectoGasActual().reglaTerminalesArtefactosGas=false;const idCalefactor=entradaPreseleccionSigasGas().inventario.fisicas.find(p=>p.tipo==='codo90'&&p.tramos.includes('ref-B-Calefactor')).id;guardarVinculoSigasGas(idCalefactor,'Calefactor','')");assert.equal(a.run("calcularPreseleccionSigasGas().filas.find(f=>f.id==='ref-B-Calefactor').equivalenteConocidoTramoM"),null);assert.ok(a.run("calcularPreseleccionSigasGas().filas.find(f=>f.id==='ref-B-Calefactor').candidato.exteriorMm")>0);const b=app(a.saved());b.run("abrir('gas')");assert.equal(b.run("calcularPreseleccionSigasGas().filas.find(f=>f.id==='ref-B-Calefactor').equivalenteConocidoTramoM"),null);assert.equal(cantidadManual(b,'codo90'),19);});
test('SIGAS todos los tramos: ordenar e invertir extremos no cambia equivalentes ni consumos',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();proyectoGasActual().reglaTerminalesArtefactosGas=false");const antes=a.run('calcularPreseleccionSigasGas()');a.run('tramos.reverse();for(const t of tramos){const x=t.desde;t.desde=t.hasta;t.hasta=x;}');const despues=a.run('calcularPreseleccionSigasGas()');for(const f of antes.filas){const g=despues.filas.find(g=>g.id===f.id);assert.equal(g.consumoKcal,f.consumoKcal);assert.equal(g.equivalenteConocidoTramoM,f.equivalenteConocidoTramoM);assert.equal(g.candidato.exteriorMm,f.candidato.exteriorMm);}assert.equal(a.run('entradaPreseleccionSigasGas().inventario.fisicas.filter(p=>p.necesidadTerminal).length'),1);});
test('SIGAS asociaciones: tres llaves existentes se relacionan con sus artefactos sin duplicación',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const antes=a.run('JSON.stringify({tramos,artefactos,p:proyectoGasActual()})'),e=a.run('entradaPreseleccionSigasGas()');assert.equal(e.inventario.asociacionesArtefactos.length,3);assert.deepEqual(Array.from(e.inventario.asociacionesArtefactos,x=>x.artefacto).sort(),['Calefactor','Cocina','Termo']);assert.equal(new Set(e.inventario.asociacionesArtefactos.map(x=>x.llaveId)).size,3);assert.ok(e.inventario.asociacionesArtefactos.every(x=>x.llaveId&&x.geometria==='codo90'&&x.medidaRosca==='1/2'));assert.equal(cantidadManual(a,'llave'),3);assert.equal(cantidadManual(a,'codo90'),19);assert.equal(a.run('JSON.stringify({tramos,artefactos,p:proyectoGasActual()})'),antes);});
test('SIGAS asociaciones: dos llaves en un artefacto conservan cantidad y mantienen ambigüedad',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();proyectoGasActual().conteosRapidosGas['ref-A-Termo'].llave=2");const x=a.run("entradaPreseleccionSigasGas().inventario.asociacionesArtefactos.find(x=>x.tramo==='ref-A-Termo')");assert.equal(x.llaveId,null);assert.match(x.estado,/ambigua/);assert.equal(a.run("entradaPreseleccionSigasGas().inventario.fisicas.filter(p=>p.tipo==='llave').reduce((n,p)=>n+p.cantidad,0)"),4);});
test('SIGAS conexión terminal: excepción de pieza original unitaria se aplica y recupera',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();const piezaTermo=entradaPreseleccionSigasGas().inventario.fisicas.find(p=>p.tipo==='codo90'&&p.tramos.includes('ref-A-Termo')).id;identificarConexionSigasGas(piezaTermo,'terminal-Termo');guardarVinculoSigasGas(piezaTermo,'Termo','sigas-p24-izquierdo-37')");const r=a.run('calcularPreseleccionSigasGas()');assert.equal(r.filas.find(f=>f.id==='ref-A-Termo').equivalenteConocidoTramoM,.398);assert.ok(!r.recorridos.find(r=>r.artefacto==='Termo').perdidasPendientes.some(p=>p.piezaId==='terminal-Termo'));assert.ok(r.recorridos.find(r=>r.artefacto==='Calefactor').perdidasPendientes.some(p=>p.piezaId==='terminal-Calefactor'));const b=app(a.saved());b.run("abrir('gas')");assert.equal(b.run("calcularPreseleccionSigasGas().filas.find(f=>f.id==='ref-A-Termo').equivalenteConocidoTramoM"),.398);assert.equal(cantidadManual(b,'codo90'),19);assert.equal(cantidadManual(b,'llave'),3);});
test('SIGAS conexiones: una llave no puede sustituir una transición ni una tee',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();const llaveTermo=entradaPreseleccionSigasGas().inventario.fisicas.find(p=>p.tipo==='llave'&&p.tramos.includes('ref-A-Termo')).id");assert.equal(a.run("identificarConexionSigasGas(llaveTermo,'terminal-Termo')"),false);assert.ok(a.run("calcularPreseleccionSigasGas().recorridos.find(r=>r.artefacto==='Termo').perdidasPendientes.some(p=>p.piezaId==='terminal-Termo')"));});
test('SIGAS presentación: equivalencias conocidas quedan en excepciones opcionales, no en preguntas pendientes',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();proyectoGasActual().reglaTerminalesArtefactosGas=false;calcularMaterialesManualGas()");const ns=descendientesPresentacion(a.elements.get('resumenPrincipalMaterialesGas')),reconocidos=ns.find(n=>n.tagName==='DETAILS'&&n.children?.some(c=>c.tagName==='SUMMARY'&&c.textContent.startsWith('Accesorios reconocidos · 17 piezas')));assert.ok(reconocidos);assert.notEqual(reconocidos.open,true);assert.ok(ns.some(n=>n.tagName==='SUMMARY'&&n.textContent==='Conexiones y llaves de los artefactos'));assert.ok(ns.some(n=>n.textContent.includes('Llave registrada asociada; tipo exacto pendiente')));assert.equal(a.run('calcularPreseleccionSigasGas().definitivo'),false);});
test('SIGAS identidad única: cuatro terminales reservan codos existentes y conservan 19/2/3',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const antes=a.run('JSON.stringify({tramos,p:proyectoGasActual(),artefactos})'),e=a.run('entradaPreseleccionSigasGas()'),ps=e.inventario.fisicas;assert.equal(new Set(ps.map(p=>p.id)).size,ps.length);assert.equal(ps.filter(p=>p.necesidadTerminal).length,4);assert.deepEqual(Array.from(ps.filter(p=>p.necesidadTerminal),p=>p.cantidad),[1,1,1,1]);assert.equal(ps.filter(p=>p.tipo==='codo90').reduce((n,p)=>n+p.cantidad,0),19);assert.equal(ps.filter(p=>p.funcion==='recorrido'&&p.id!=='referencia-codo19').reduce((n,p)=>n+p.cantidad,0),14);assert.equal(ps.filter(p=>p.tipo==='llave').reduce((n,p)=>n+p.cantidad,0),3);assert.ok(ps.every(p=>p.origenId&&p.funcion&&Object.hasOwn(p,'geometria')&&Object.hasOwn(p,'producto')));assert.equal(a.run('JSON.stringify({tramos,p:proyectoGasActual(),artefactos})'),antes);});
test('SIGAS atributos: rosca sexo y variante seleccionan fila sin repetir producto ni cantidad',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();guardarDatoTerminalSigasGas('terminal-Termo','sexo','hembra');guardarDatoTerminalSigasGas('terminal-Termo','variante','estandar')");const r=a.run('calcularPreseleccionSigasGas()');assert.equal(r.filas.find(f=>f.id==='ref-A-Termo').equivalenteConocidoTramoM,.398);assert.ok(!r.recorridos.find(r=>r.artefacto==='Termo').perdidasPendientes.some(p=>p.piezaId==='terminal-Termo'));assert.equal(cantidadManual(a,'codo90'),19);const b=app(a.saved());b.run("abrir('gas')");assert.equal(b.run("calcularPreseleccionSigasGas().filas.find(f=>f.id==='ref-A-Termo').equivalenteConocidoTramoM"),.398);});
test('SIGAS atributos: varias variantes reales mantienen pérdida pendiente hasta aclararla',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();guardarDatoTerminalSigasGas('terminal-Termo','sexo','hembra');guardarDatoTerminalSigasGas('terminal-Termo','rosca','1/2')");assert.equal(a.run("calcularPreseleccionSigasGas().filas.find(f=>f.id==='ref-A-Termo').equivalenteConocidoTramoM"),null);a.run("guardarDatoTerminalSigasGas('terminal-Termo','variante','estandar')");assert.equal(a.run("calcularPreseleccionSigasGas().filas.find(f=>f.id==='ref-A-Termo').equivalenteConocidoTramoM"),.398);});
test('SIGAS transición recta: identidad propia y codos conservados sin duplicar necesidad terminal',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();guardarDatoTerminalSigasGas('terminal-Termo','geometria','recta');guardarDatoTerminalSigasGas('terminal-Termo','sexo','macho');guardarDatoTerminalSigasGas('terminal-Termo','rosca','1/2')");const e=a.run('entradaPreseleccionSigasGas()');assert.equal(e.inventario.fisicas.filter(p=>p.necesidadTerminal==='terminal-Termo').length,1);assert.equal(e.inventario.fisicas.filter(p=>p.tipo==='codo90').reduce((n,p)=>n+p.cantidad,0),19);const r=a.run('calcularPreseleccionSigasGas()'),ruta=r.recorridos.find(r=>r.artefacto==='Termo');assert.equal(ruta.aportes.filter(p=>p.nombre==='Transición Macho 25 x 1/2').length,1);assert.ok(!ruta.perdidasPendientes.some(p=>p.piezaId==='terminal-Termo'));assert.match(r.pendientes.join(' '),/lista física/);assert.equal(r.definitivo,false);assert.equal(cantidadManual(a,'codo90'),19);});
test('SIGAS identidad: borrar geometría no inventa pieza ni impide volver a definir conexión',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();guardarDatoTerminalSigasGas('terminal-Termo','geometria','')");assert.equal(a.run("entradaPreseleccionSigasGas().inventario.fisicas.filter(p=>p.necesidadTerminal==='terminal-Termo').length"),0);a.run("guardarDatoTerminalSigasGas('terminal-Termo','geometria','codo90')");assert.equal(a.run("entradaPreseleccionSigasGas().inventario.fisicas.filter(p=>p.necesidadTerminal==='terminal-Termo').length"),1);assert.equal(cantidadManual(a,'codo90'),19);});
test('SIGAS identidad: cada pieza física tiene identidad individual única aunque se muestre agrupada',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const ps=a.run('entradaPreseleccionSigasGas().inventario.fisicas'),ids=ps.flatMap(p=>Array.from(p.identidadesFisicas));assert.equal(ids.length,24);assert.equal(new Set(ids).size,24);assert.equal(ps.filter(p=>p.tipo==='codo90').flatMap(p=>Array.from(p.identidadesFisicas)).length,19);});
test('SIGAS recta declarada: aparece una sola vez en materiales sin segunda carga ni descuento de codos',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();guardarDatoTerminalSigasGas('terminal-Termo','geometria','recta');guardarDatoTerminalSigasGas('terminal-Termo','sexo','hembra');guardarDatoTerminalSigasGas('terminal-Termo','rosca','3/4')");assert.equal(a.run("revisionMaterialesGas.plan.filas.filter(f=>f.tipo==='Transición recta fusión–rosca').length"),1);assert.equal(a.run("revisionMaterialesGas.plan.filas.filter(f=>f.tipo==='Transición recta fusión–rosca').reduce((n,p)=>n+p.cantidad,0)"),1);assert.equal(cantidadManual(a,'codo90'),19);assert.equal(cantidadManual(a,'tee'),2);assert.equal(cantidadManual(a,'llave'),3);a.run("guardarDatoTerminalSigasGas('terminal-Termo','geometria','codo90')");assert.equal(a.run("revisionMaterialesGas.plan.filas.filter(f=>f.tipo==='Transición recta fusión–rosca').length"),0);assert.equal(cantidadManual(a,'codo90'),19);assert.ok(a.run('proyectoGasActual().calculoSigas.historialTerminales.length')>0);});
test('SIGAS atributos: geometría terminal explícitamente pendiente no se completa por suposición',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();guardarDatoTerminalSigasGas('terminal-medidor','sexo','hembra');guardarDatoTerminalSigasGas('terminal-medidor','rosca','1');guardarDatoTerminalSigasGas('terminal-medidor','geometria','')");assert.ok(a.run("calcularPreseleccionSigasGas().recorridos.every(r=>r.perdidasPendientes.some(p=>p.piezaId==='terminal-medidor'))"));assert.equal(cantidadManual(a,'codo90'),19);});
test('SIGAS registro compartido: cuatro roscas confirmadas sin convertirlas en diámetro del tramo',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const r=a.run('registroAccesoriosSigasGas()');assert.equal(r.roscasConfirmadas['terminal-medidor'],'3/4');for(const id of ['Termo','Calefactor','Cocina'])assert.equal(r.roscasConfirmadas['terminal-'+id],'1/2');assert.deepEqual(Array.from(r.calculo.filas,f=>f.candidato.exteriorMm),[32,25,25,20,25]);assert.equal(r.piezas.filter(p=>p.tipo==='codo90').reduce((n,p)=>n+p.cantidad,0),19);assert.equal(a.run("guardarDatoTerminalSigasGas('terminal-Termo','rosca','3/4')"),false);assert.equal(a.run("entradaPreseleccionSigasGas().config.terminales['terminal-Termo'].rosca"),'1/2');});
test('SIGAS registro compartido: productos de compra y pérdidas conservan la misma identidad física',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();guardarDatoTerminalSigasGas('terminal-medidor','sexo','hembra');guardarDatoTerminalSigasGas('terminal-Termo','sexo','hembra');guardarDatoTerminalSigasGas('terminal-Termo','variante','estandar');guardarDatoTerminalSigasGas('terminal-Calefactor','sexo','hembra');guardarDatoTerminalSigasGas('terminal-Calefactor','variante','estandar');guardarDatoTerminalSigasGas('terminal-Cocina','sexo','hembra');guardarDatoTerminalSigasGas('terminal-Cocina','variante','estandar')");const r=a.run('registroAccesoriosSigasGas()'),filas=a.run('revisionMaterialesGas.plan.filas.filter(f=>f.registroSigas)');const ids=filas.flatMap(f=>Array.from(f.registroSigas.identidadesFisicas));assert.equal(ids.length,24);assert.equal(new Set(ids).size,24);const t=r.piezas.filter(p=>p.necesidadTerminal);assert.equal(t.length,4);assert.ok(t.every(p=>p.productoIdentificado));for(const p of t){const f=filas.find(f=>f.registroSigas.id===p.id);assert.ok(f);assert.equal(f.cantidad,p.cantidad);assert.ok(f.registroSigas.productos.includes(p.usos[0].id));assert.equal(f.material,p.nombreCompra);}assert.equal(cantidadManual(a,'codo90'),19);assert.equal(cantidadManual(a,'tee'),2);assert.equal(cantidadManual(a,'llave'),3);assert.equal(r.calculo.definitivo,false);assert.deepEqual(Array.from(r.calculo.filas,f=>f.candidato.exteriorMm),[32,25,25,20,25]);});
test('SIGAS registro compartido: cambiar solución recta conserva codos, proyecta una pieza y recalcula pérdidas',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();guardarDatoTerminalSigasGas('terminal-Termo','sexo','hembra');guardarDatoTerminalSigasGas('terminal-Termo','variante','estandar')");const antes=a.run("calcularPreseleccionSigasGas().filas.find(f=>f.id==='ref-A-Termo').equivalenteConocidoTramoM");assert.equal(antes,.398);a.run("guardarDatoTerminalSigasGas('terminal-Termo','geometria','recta')");const r=a.run('registroAccesoriosSigasGas()'),p=r.piezas.find(p=>p.necesidadTerminal==='terminal-Termo');assert.equal(p.usos[0].nombre,'Transición Hembra 25 x 1/2');assert.equal(p.usos[0].equivalenteUnitarioM,.159);assert.ok(Math.abs(r.calculo.filas.find(f=>f.id==='ref-A-Termo').equivalenteConocidoTramoM-(.856+.159))<1e-9);assert.equal(a.run("revisionMaterialesGas.plan.filas.filter(f=>f.tipo==='Transición recta fusión–rosca').length"),1);assert.equal(cantidadManual(a,'codo90'),19);assert.equal(a.run('tramos.find(t=>t.id===\"ref-A-Termo\").diametro'),null);});
test('SIGAS registro compartido: dato indispensable faltante no produce compra ni pérdida definitivas',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();guardarDatoTerminalSigasGas('terminal-Termo','sexo','hembra')");const r=a.run('registroAccesoriosSigasGas()'),t=r.piezas.find(p=>p.necesidadTerminal==='terminal-Termo');assert.equal(t.productoIdentificado,false);assert.equal(r.calculo.filas.find(f=>f.id==='ref-A-Termo').equivalenteConocidoTramoM,null);assert.ok(a.run("revisionMaterialesGas.plan.filas.filter(f=>f.registroSigas?.funcion==='terminal-Termo').every(f=>f.estado!=='confirmado')"));assert.equal(a.run("proyectoGasActual().calculoSigas.terminales['terminal-Termo'].rosca"),'1/2');});
test('SIGAS roscas confirmadas: antecedente distinto se conserva y no modifica el diámetro del tramo',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();proyectoGasActual().calculoSigas.terminales['terminal-Termo']={rosca:'3/4'}");assert.equal(a.run("entradaPreseleccionSigasGas().config.terminales['terminal-Termo'].rosca"),'1/2');assert.equal(a.run("proyectoGasActual().calculoSigas.terminales['terminal-Termo'].rosca"),'3/4');a.run("guardarDatoTerminalSigasGas('terminal-Termo','sexo','hembra')");assert.ok(a.run("proyectoGasActual().calculoSigas.historialTerminales.some(x=>x.atributos.rosca==='3/4')"));assert.equal(a.run("proyectoGasActual().calculoSigas.terminales['terminal-Termo'].rosca"),'1/2');assert.equal(a.run("tramos.find(t=>t.id==='ref-A-Termo').diametro"),null);});
test('SIGAS registro compartido: respaldo JSON reconstruye identidades y productos sin filas duplicadas',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();guardarDatoTerminalSigasGas('terminal-medidor','sexo','hembra');guardarDatoTerminalSigasGas('terminal-Termo','sexo','hembra');guardarDatoTerminalSigasGas('terminal-Termo','variante','estandar')");const b=app();b.run("abrir('gas')");respaldoPrueba(b,{formato:'canerias-respaldo-v1',proyectos:JSON.parse(a.saved())});b.run('calcularMaterialesManualGas()');const ma=a.run('registroAccesoriosSigasGas().piezas.map(p=>({id:p.id,ids:p.identidadesFisicas,n:p.nombreCompra}))'),mb=b.run('registroAccesoriosSigasGas().piezas.map(p=>({id:p.id,ids:p.identidadesFisicas,n:p.nombreCompra}))');assert.equal(JSON.stringify(ma),JSON.stringify(mb));assert.equal(cantidadManual(b,'codo90'),19);assert.equal(cantidadManual(b,'tee'),2);assert.equal(cantidadManual(b,'llave'),3);});
test('SIGAS conjuntos compartidos: conserva cuatro conexiones, 58/19/2/3 y compra/perdidas de cada componente',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();guardarDatoTerminalSigasGas('terminal-medidor','sexo','hembra');for(const id of ['terminal-Termo','terminal-Calefactor','terminal-Cocina']){guardarDatoTerminalSigasGas(id,'sexo','macho');guardarDatoTerminalSigasGas(id,'codoBase','HH')}");const r=a.run('registroAccesoriosSigasGas()'),ps=r.piezas.filter(p=>p.generadaPorConjunto);assert.equal(ps.length,0);assert.equal(r.propuestasCompra.length,3);assert.ok(r.propuestasCompra.every(p=>p.confirmada===false&&p.afectaCalculo===false));assert.equal(cantidadManual(a,'codo90'),19);assert.equal(cantidadManual(a,'tee'),2);assert.equal(cantidadManual(a,'llave'),3);assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);for(const p of ps){const filas=a.run('revisionMaterialesGas.plan.filas').filter(f=>f.registroSigas?.id===p.id);assert.equal(filas.length,1);assert.equal(filas[0].cantidad,1);assert.equal(filas[0].material,p.nombreCompra);}const t=r.calculo.filas.find(f=>f.id==='ref-A-Termo');assert.ok(Math.abs(t.equivalenteConocidoTramoM-.856)<1e-9);assert.equal(r.calculo.definitivo,false);});
test('SIGAS conjunto: cambio HH a MH retira el niple de la propuesta y recalcula sin duplicar codo',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();guardarDatoTerminalSigasGas('terminal-Termo','sexo','macho');guardarDatoTerminalSigasGas('terminal-Termo','codoBase','HH')");assert.equal(a.run('registroAccesoriosSigasGas().propuestasCompra[0].componentes.length'),3);a.run("guardarDatoTerminalSigasGas('terminal-Termo','codoBase','MH')");assert.equal(a.run('registroAccesoriosSigasGas().propuestasCompra[0].componentes.length'),2);assert.ok(Math.abs(a.run("calcularPreseleccionSigasGas().filas.find(f=>f.id==='ref-A-Termo').equivalenteConocidoTramoM")-.95016)<1e-9);assert.equal(cantidadManual(a,'codo90'),19);const b=app(a.saved());b.run("abrir('gas')");assert.equal(b.run('registroAccesoriosSigasGas().propuestasCompra[0].componentes.length'),2);});
test('SIGAS reducción: al crecer el diámetro se busca el conjunto sin agregar una reducción de ubicación desconocida',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();artefactos.find(a=>a.id==='ref-termo').consumo=26000;guardarDatoTerminalSigasGas('terminal-Termo','sexo','hembra');guardarDatoTerminalSigasGas('terminal-Termo','codoBase','HH')");const r=a.run('registroAccesoriosSigasGas()');assert.equal(r.calculo.filas.find(f=>f.id==='ref-A-Termo').candidato.exteriorMm,32);assert.ok(r.calculo.recorridos.flatMap(r=>r.solucionesTerminales).some(s=>s.necesidad==='terminal-Termo'&&s.estado==='reduccion-pendiente-ubicacion'));assert.equal(r.piezas.filter(p=>p.generadaPorConjunto).length,0);assert.equal(cantidadManual(a,'codo90'),19);assert.ok(r.calculo.recorridos.some(r=>r.perdidasPendientes.some(p=>p.motivo.includes('Manual SIGAS p.28'))));});
test('SIGAS conjunto: una pieza registrada potencialmente coincidente no se duplica por suposición',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();datosPlanGas().extras.push({idFisico:'niple-existente',tipo:'niple',cantidad:1,ubicacion:'ref-A-Termo',medidas:[],confirmado:true});guardarDatoTerminalSigasGas('terminal-Termo','sexo','macho');guardarDatoTerminalSigasGas('terminal-Termo','codoBase','HH')");const r=a.run('registroAccesoriosSigasGas()');assert.equal(r.piezas.filter(p=>p.generadaPorConjunto).length,0);assert.ok(r.propuestasCompra.some(p=>p.componentes.some(c=>c.coincidencias.includes('niple-existente'))));assert.equal(cantidadManual(a,'codo90'),19);});
test('SIGAS conjunto: un cambio de diámetro elimina piezas propuestas para la medida anterior y recalcula al volver',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();guardarDatoTerminalSigasGas('terminal-Termo','sexo','macho');guardarDatoTerminalSigasGas('terminal-Termo','codoBase','HH')");assert.equal(a.run('registroAccesoriosSigasGas().propuestasCompra[0].componentes.length'),3);a.run("artefactos.find(a=>a.id==='ref-termo').consumo=26000;calcularMaterialesManualGas()");assert.equal(a.run("calcularPreseleccionSigasGas().filas.find(f=>f.id==='ref-A-Termo').candidato.exteriorMm"),32);assert.equal(a.run('registroAccesoriosSigasGas().piezas.filter(p=>p.generadaPorConjunto).length'),0);assert.equal(a.run("revisionMaterialesGas.plan.filas.filter(f=>f.tipo==='niple'||f.tipo==='transicion').length"),0);a.run("artefactos.find(a=>a.id==='ref-termo').consumo=16000;calcularMaterialesManualGas()");assert.equal(a.run('registroAccesoriosSigasGas().propuestasCompra[0].componentes.length'),3);assert.equal(cantidadManual(a,'codo90'),19);});
test('SIGAS compra propuesta: reducciones visibles sin ser piezas reales ni alterar pérdidas conocidas',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();artefactos.find(a=>a.id==='ref-termo').consumo=26000;guardarDatoTerminalSigasGas('terminal-Termo','sexo','hembra');guardarDatoTerminalSigasGas('terminal-Termo','codoBase','HH')");let r=a.run('registroAccesoriosSigasGas()');assert.ok(r.propuestasCompra.some(p=>p.componentes.some(c=>c.tipo==='reduccion')));assert.ok(r.propuestasCompra.every(p=>!p.confirmada&&!p.afectaCalculo));assert.equal(r.piezas.filter(p=>p.tipo==='reduccion').length,0);assert.ok(!r.calculo.recorridos.some(r=>r.aportes.some(p=>p.tipo==='reduccion')));const le=r.calculo.filas.find(f=>f.id==='ref-A-Termo').equivalenteConocidoTramoM;a.run("proyectoGasActual().calculoSigas.terminales['terminal-Termo'].tipoReduccion='cupla';calcularMaterialesManualGas()");r=a.run('registroAccesoriosSigasGas()');assert.equal(r.calculo.filas.find(f=>f.id==='ref-A-Termo').equivalenteConocidoTramoM,le);assert.ok(r.propuestasCompra.every(p=>p.componentes.filter(c=>c.tipo==='reduccion').every(c=>c.nombre.startsWith('Cupla'))));assert.equal(cantidadManual(a,'codo90'),19);assert.equal(cantidadManual(a,'tee'),2);assert.equal(cantidadManual(a,'llave'),3);assert.ok(a.run('revisionMaterialesGas.plan.propuestasCompraSigas.length')>0);assert.equal(r.calculo.definitivo,false);});
test('SIGAS pérdidas reales: accesorios declarados se calculan una vez y no se suman sus propuestas',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();datosPlanGas().extras.push({idFisico:'niple-real',tipo:'niple',cantidad:1,ubicacion:'ref-A-Termo',medidas:[],confirmado:true},{idFisico:'transicion-real',tipo:'transicion',cantidad:1,ubicacion:'ref-A-Termo',medidas:[],confirmado:true});guardarDatoTerminalSigasGas('terminal-Termo','sexo','macho');guardarDatoTerminalSigasGas('terminal-Termo','codoBase','HH');guardarVinculoSigasGas('niple-real','Termo','sigas-p25-derecho-22');guardarVinculoSigasGas('transicion-real','Termo','sigas-p24-derecho-44');calcularMaterialesManualGas()");const r=a.run('registroAccesoriosSigasGas()'),ruta=r.calculo.recorridos.find(r=>r.artefacto==='Termo');assert.equal(ruta.aportes.filter(p=>p.piezaId==='niple-real').length,1);assert.equal(ruta.aportes.filter(p=>p.piezaId==='transicion-real').length,1);assert.ok(Math.abs(r.calculo.filas.find(f=>f.id==='ref-A-Termo').equivalenteConocidoTramoM-1.26452)<1e-9);assert.ok(!ruta.aportes.some(p=>p.generadaPorConjunto));assert.equal(a.run("revisionMaterialesGas.plan.filas.filter(f=>f.tipo==='niple').reduce((n,f)=>n+f.cantidad,0)"),1);assert.equal(a.run("revisionMaterialesGas.plan.filas.filter(f=>f.tipo==='transicion').reduce((n,f)=>n+f.cantidad,0)"),1);assert.equal(cantidadManual(a,'codo90'),19);});
test('SIGAS propuestas: respaldo conserva decisiones sin transformarlas en accesorios confirmados',()=>{const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();guardarDatoTerminalSigasGas('terminal-Termo','sexo','macho');guardarDatoTerminalSigasGas('terminal-Termo','codoBase','HH')");const b=app(a.saved());b.run("abrir('gas');calcularMaterialesManualGas()");assert.equal(JSON.stringify(b.run('registroAccesoriosSigasGas().propuestasCompra')),JSON.stringify(a.run('registroAccesoriosSigasGas().propuestasCompra')));assert.equal(b.run('registroAccesoriosSigasGas().piezas.filter(p=>p.generadaPorConjunto).length'),0);assert.equal(b.run("revisionMaterialesGas.plan.filas.filter(f=>f.tipo==='niple'||f.tipo==='transicion').length"),0);assert.equal(cantidadManual(b,'codo90'),19);});

test('Inventario manual: una falla técnica SIGAS no bloquea 58 m, 19 codos, dos tees ni tres llaves',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();DimensionamientoSigas.resolver=()=>{throw Error('Tabla de capacidades no disponible')};cacheRegistroAccesoriosSigasGas=null;calcularMaterialesManualGas()");
 assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);
 for(const [tipo,n]of [['codo90',19],['tee',2],['llave',3]])assert.equal(cantidadManual(a,tipo),n);
 assert.ok(a.run("revisionMaterialesGas.plan.avisos.some(s=>s.includes('Cantidades registradas conservadas'))"));
 assert.equal(a.run('redFisicaManualGas().total'),29200);
 const b=app(a.saved());b.run("abrir('gas');calcularMaterialesManualGas()");assert.equal(cantidadManual(b,'codo90'),19);
});
test('Inventario manual: proyección técnica fallida es transaccional y no altera cantidades ni vínculos',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const antes=a.run('JSON.stringify(tramos)');
 a.run("proyectarRegistroSigasEnMaterialesGas=e=>{e.extras.length=0;e.tramos.length=0;throw Error('equivalencia pendiente')};calcularMaterialesManualGas()");
 assert.equal(a.run('JSON.stringify(tramos)'),antes);assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);assert.equal(cantidadManual(a,'codo90'),19);
});
test('SIGAS: codos comunes reutilizan familia y medida del tramo sin confirmaciones individuales',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const r=a.run('registroAccesoriosSigasGas()');
 const comunes=r.piezas.filter(p=>p.clasificacionAutomatica?.startsWith('Codo común')||p.familiaAutomatica);assert.ok(comunes.length>=3);
 for(const p of comunes){assert.ok(p.cantidad>0);assert.equal(p.producto.familia,'Codo Normal a 90º');assert.ok(p.candidatoMm>0);assert.ok(p.usos.length>0);}
 assert.equal(r.calculo.definitivo,false);assert.ok(r.calculo.recorridos.some(r=>r.perdidasPendientes.length));assert.equal(cantidadManual(a,'codo90'),19);
});


test('Resultados GAS: un único detalle cerrado contiene todos los selectores técnicos',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const raiz=a.elements.get('resumenPrincipalMaterialesGas'),ns=descendientesPresentacion(raiz),tecnico=ns.find(n=>n.id==='detallesTecnicosResultadoGas');
 assert.ok(tecnico);assert.notEqual(tecnico.open,true);assert.equal(tecnico.children[0].textContent,'VER DETALLES TÉCNICOS');assert.equal(raiz.children[0].textContent,'MATERIALES DE LA INSTALACIÓN');
 const dentro=new Set(descendientesPresentacion(tecnico));assert.ok(ns.some(n=>n.tagName==='SELECT'));assert.ok(ns.filter(n=>n.tagName==='SELECT').every(n=>dentro.has(n)));
 for(const nombre of ['Datos técnicos pendientes','Diámetros por tramo · SIGAS GN','Ver detalle por tramo y consumos','Identificar productos SIGAS para las pérdidas (sin repetir cantidades)'])assert.ok([...dentro].some(n=>n.textContent===nombre));
 assert.equal(cantidadManual(a,'codo90'),19);assert.equal(cantidadManual(a,'tee'),2);assert.equal(cantidadManual(a,'llave'),3);assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);
});
test('Resultados GAS: reordenar la presentación conserva el modelo PDF, datos y candidatos',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();guardarDatos()");const antes=a.saved(),pdf=a.run('JSON.stringify(modeloInformeActual())'),motor=a.run('JSON.stringify(calcularPreseleccionSigasGas())');
 a.run('renderResumenPrincipalGas()');assert.equal(a.saved(),antes);assert.equal(a.run('JSON.stringify(modeloInformeActual())'),pdf);assert.equal(a.run('JSON.stringify(calcularPreseleccionSigasGas())'),motor);assert.equal(a.run('calcularPreseleccionSigasGas().definitivo'),false);
});

test('Resumen principal GAS: agrupa 19 codos, dos tees y tres llaves sin mezclar propuestas ni modificar el detalle',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const antes=a.run('JSON.stringify(revisionMaterialesGas.plan)'),filas=a.run('resumenMaterialesInstalacionGas(revisionMaterialesGas.plan)');
 for(const [tipo,n]of [['codo90',19],['tee',2],['llave',3]]){const fs=filas.filter(f=>f.tipo===tipo);assert.equal(fs.length,1);assert.equal(fs[0].cantidad,n);}
 assert.equal(filas.find(f=>f.tipo==='cano').cantidad,58);assert.equal(filas.find(f=>f.tipo==='cupla').pendiente,true);assert.equal(a.run('JSON.stringify(revisionMaterialesGas.plan)'),antes);
 a.run("guardarDatoTerminalSigasGas('terminal-Termo','sexo','macho');guardarDatoTerminalSigasGas('terminal-Termo','codoBase','HH')");assert.ok(a.run('revisionMaterialesGas.plan.propuestasCompraSigas.length')>0);assert.equal(a.run('resumenMaterialesInstalacionGas(revisionMaterialesGas.plan).find(f=>f.tipo==="codo90").cantidad'),19);assert.ok(!a.run('resumenMaterialesInstalacionGas(revisionMaterialesGas.plan).some(f=>f.tipo==="niple")'));
});

test('Compra GAS: ejemplo 58/19/2/3 conserva motor y agrupa caños candidatos sin mezclarlos',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const antes=a.run('JSON.stringify(calcularPreseleccionSigasGas())'),r=a.run('prepararCompraActualGas(revisionMaterialesGas.plan)');
 assert.equal(r.tramos.reduce((n,t)=>n+t.metros,0),58);assert.equal(r.canos.reduce((n,g)=>n+g.metros,0),58);assert.deepEqual(Array.from(r.canos,g=>g.diametro).sort(),['20 mm','25 mm','32 mm']);assert.ok(r.canos.every(g=>g.provisional&&g.estadoDiametro==='candidato'));assert.ok(r.tramos.every(t=>t.cuplas===null));
 assert.ok(r.propuestas.length>0);assert.ok(r.propuestas.every(p=>p.confirmada===false));assert.equal(a.run('JSON.stringify(calcularPreseleccionSigasGas())'),antes);
 for(const [tipo,n]of [['codo90',19],['tee',2],['llave',3]])assert.equal(cantidadManual(a,tipo),n);
});
test('Compra GAS: corregir cortes se guarda por proyecto y no altera longitudes, accesorios ni pérdidas',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const motor=a.run('JSON.stringify(calcularPreseleccionSigasGas())');
 assert.equal(a.run("guardarDistribucionCompraGas('ref-M-A','4+4+4+3',false).ok"),false);
 assert.equal(a.run("guardarDistribucionCompraGas('ref-M-A','4+4+4+2',true).ok"),false);
 assert.equal(a.run("guardarDistribucionCompraGas('ref-M-A','4+4+4+3',true).ok"),true);
 assert.equal(a.run("prepararCompraActualGas(revisionMaterialesGas.plan).tramos.find(t=>t.id==='ref-M-A').cuplas"),3);assert.equal(a.run('JSON.stringify(calcularPreseleccionSigasGas())'),motor);assert.equal(cantidadManual(a,'codo90'),19);
 const b=app(a.saved());b.run("abrir('gas');calcularMaterialesManualGas()");assert.equal(b.run("prepararCompraActualGas(revisionMaterialesGas.plan).tramos.find(t=>t.id==='ref-M-A').cuplas"),3);
 b.run("tramos.find(t=>t.id==='ref-M-A').metros=16;calcularMaterialesManualGas()");assert.equal(b.run("prepararCompraActualGas(revisionMaterialesGas.plan).tramos.find(t=>t.id==='ref-M-A').distribucionVigente"),false);assert.ok(b.run("datosPlanGas().cortesCompra['ref-M-A']"));
 b.run("crearProyectoGas('Otro proyecto sin cortes')");assert.equal(b.run('JSON.stringify(datosPlanGas().cortesCompra||{})'),'{}');
});
test('Compra GAS: PDF incorpora estimaciones separadas, sin controles ni cambios en la planilla',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();prepararInformeActual()");const d=a.run('modeloInformeActual()');assert.equal(d.preparacionCompra.tramos.length,5);const pdf=a.elements.get('informeImpresion').innerHTML;
 assert.match(pdf,/Preparación de compra · ESTIMACIÓN PROVISIONAL/);assert.match(pdf,/Cuplas estimadas/);assert.match(pdf,/CONSUMO \(m³\/h\)/);assert.doesNotMatch(pdf,/<(?:button|select|input)\b/);assert.equal(d.preparacionCompra.definitiva,false);assert.equal(a.run('calcularPreseleccionSigasGas().definitivo'),false);
});
test('Compra GAS: respaldo JSON completo conserva cortes, proyecto y cantidades sin cambiar el formato',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();guardarDistribucionCompraGas('ref-M-A','4+4+4+3',true)");let json='';const crear=a.ctx.document.createElement;
 a.ctx.Blob=class{constructor(p){json=p.join('')}};a.ctx.URL.createObjectURL=()=> 'blob:backup';a.ctx.setTimeout=()=>{};a.ctx.document.createElement=()=>{const e=crear();e.click=()=>{};return e;};a.run('descargarRespaldoCompleto()');const respaldo=JSON.parse(json);assert.equal(respaldo.formato,'canerias-respaldo-v1');
 const b=app();b.run("abrir('gas')");respaldoPrueba(b,respaldo);const id=b.run("registrosProyectosGas().find(p=>p.datos.referenciaSigas19===true).id");b.run('seleccionarAmbitoGas('+JSON.stringify('proyecto:'+id)+');calcularMaterialesManualGas()');assert.equal(b.run("prepararCompraActualGas(revisionMaterialesGas.plan).tramos.find(t=>t.id==='ref-M-A').cuplas"),3);assert.equal(cantidadManual(b,'codo90'),19);assert.equal(b.run('revisionMaterialesGas.plan.longitudInformada'),58);
});
test('Compra GAS: distribución importada incompleta queda pendiente sin impedir consultar materiales',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas();datosPlanGas().cortesCompra={'ref-M-A':{grupos:{dato:'incompleto'},confirmado:true,firma:'anterior'}};calcularMaterialesManualGas()");assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);assert.equal(cantidadManual(a,'codo90'),19);assert.ok(a.run("prepararCompraActualGas(revisionMaterialesGas.plan).pendientes.some(s=>s.includes('Distribución conservada'))"));assert.ok(descendientesPresentacion(a.elements.get('resumenPrincipalMaterialesGas')).some(n=>n.textContent==='PREPARACIÓN DE COMPRA'));
});

function proyectoCuplasAutomaticas(a,metros,acc,final){
 a.run("abrir('gas');crearProyectoGas('Cuplas automáticas');seleccionarCatalogoSistemaGas('sigas')");
 a.ctx.casoCuplas={id:'cuplas-t',desde:'M',hasta:'Calefactor',metros,diametro:null,consumo:null,detalle:{estado:acc.length?'pendiente':'ninguno',accesorios:acc,metrosFinal:final}};
 a.run("tramos=[casoCuplas];artefactos=[{id:'cal',nombre:'Calefactor',consumo:3000}];proyectoGasActual().conteosRapidosGas={'cuplas-t':{codo90:casoCuplas.detalle.accesorios.filter(a=>a.tipo==='codo90').length,codo45:casoCuplas.detalle.accesorios.filter(a=>a.tipo==='codo45').length,tee:0,reduccion:0,llave:0}};guardarDatos();calcularMaterialesManualGas()");
}
test('Cuplas: resultados principales, tramo y diámetro reutilizan las posiciones ya cargadas',()=>{
 const a=app();proyectoCuplasAutomaticas(a,10,[{tipo:'codo90',metrosAntes:5,salida:''}],5);const c=a.run('prepararCompraActualGas(revisionMaterialesGas.plan)');assert.equal(c.largoComercial,4);assert.equal(c.tramos[0].cuplas,2);assert.equal(c.canos[0].cuplas,2);
 const ns=descendientesPresentacion(a.elements.get('resumenPrincipalMaterialesGas'));assert.ok(ns.some(n=>n.textContent==='2 unidad estimadas'));assert.ok(ns.some(n=>/^Cuplas: 2 calculadas por segmentos/.test(n.textContent)));assert.equal(cantidadManual(a,'codo90'),1);
});
test('Cuplas: posiciones parciales muestran solo las calculadas y mantienen el resto pendiente',()=>{
 const a=app();proyectoCuplasAutomaticas(a,17,[{tipo:'codo90',metrosAntes:10,salida:''},{tipo:'codo45',metrosAntes:null,salida:''}],5);const c=a.run('prepararCompraActualGas(revisionMaterialesGas.plan)');assert.equal(c.tramos[0].cuplasConocidas,3);assert.equal(c.tramos[0].cuplas,null);const ns=descendientesPresentacion(a.elements.get('resumenPrincipalMaterialesGas'));assert.ok(ns.some(n=>n.textContent==='3 unidad estimadas · orientativas'));
});
test('Cuplas: guardar una modificación de posiciones recalcula sin pulsar calcular otra vez',()=>{
 const a=app();proyectoCuplasAutomaticas(a,10,[{tipo:'codo90',metrosAntes:5,salida:''}],5);a.run("tramos[0].detalle.accesorios[0].metrosAntes=4;tramos[0].detalle.metrosFinal=6;guardarDatos()");assert.equal(a.run('prepararCompraActualGas(revisionMaterialesGas.plan).tramos[0].cuplas'),1);assert.ok(descendientesPresentacion(a.elements.get('resumenPrincipalMaterialesGas')).some(n=>n.textContent==='1 unidad estimadas'));
 const b=app(a.saved());b.run("abrir('gas');calcularMaterialesManualGas()");assert.equal(b.run('prepararCompraActualGas(revisionMaterialesGas.plan).tramos[0].cuplas'),1);
 a.run("proyectoGasActual().conteosRapidosGas['cuplas-t'].codo90=2;guardarDatos()");assert.equal(a.run('prepararCompraActualGas(revisionMaterialesGas.plan).tramos[0].cuplas'),null);
});
test('Cuplas: cálculo parcial se incluye en PDF como parcial y mantiene intacto el ejemplo SIGAS',()=>{
 const a=app();proyectoCuplasAutomaticas(a,17,[{tipo:'codo90',metrosAntes:10,salida:''},{tipo:'codo45',metrosAntes:null,salida:''}],5);a.run('prepararInformeActual()');assert.match(a.elements.get('informeImpresion').innerHTML,/3 calculadas; resto pendiente/);
 a.run('abrirEjercicioSigas19Gas()');assert.equal(a.run('revisionMaterialesGas.plan.longitudInformada'),58);for(const [tipo,n]of [['codo90',19],['tee',2],['llave',3]])assert.equal(cantidadManual(a,tipo),n);assert.deepEqual(Array.from(a.run('calcularPreseleccionSigasGas().filas'),f=>f.candidato.exteriorMm),[32,25,25,20,25]);assert.equal(a.run('calcularPreseleccionSigasGas().definitivo'),false);
});

test('Cuplas concretas: el ejemplo informa las posiciones ausentes sin suponerlas',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const ma=a.run("datosPosicionesCuplasGas(tramos.find(t=>t.id==='ref-M-A'))");assert.equal(ma.totales.codo90,7);assert.equal(ma.filas.find(f=>f.tipo==='codo90').conocidas.length,0);assert.equal(ma.filas.find(f=>f.tipo==='tee').conocidas[0].posicion,15);
 assert.equal(a.run("datosPosicionesCuplasGas(tramos.find(t=>t.id==='ref-B-Cocina')).totales.codo90"),6);assert.ok(descendientesPresentacion(a.elements.get('resumenPrincipalMaterialesGas')).some(n=>n.textContent==='Codos de 90°: 7 registradas; faltan 7 posiciones.'));assert.ok(a.run('prepararCompraActualGas(revisionMaterialesGas.plan).tramos.every(t=>t.cuplas===null)'));
});
test('Cuplas concretas: completar solo medidas calcula automáticamente sin cambiar cantidades ni SIGAS',()=>{
 const a=app();proyectoCuplasAutomaticas(a,10,[{tipo:'codo90',metrosAntes:null,salida:''}],null);const antes=a.run('JSON.stringify(tramos)'),motor=a.run('JSON.stringify({...calcularPreseleccionSigasGas(),pendientes:undefined})');assert.equal(a.run("guardarPosicionesCuplasGas('cuplas-t',{codo90:'5'}).ok"),true);assert.equal(a.run('prepararCompraActualGas(revisionMaterialesGas.plan).tramos[0].cuplas'),2);assert.equal(cantidadManual(a,'codo90'),1);assert.equal(a.run('JSON.stringify(tramos)'),antes);assert.equal(a.run('JSON.stringify({...calcularPreseleccionSigasGas(),pendientes:undefined})'),motor);
 const b=app(a.saved());b.run("abrir('gas');calcularMaterialesManualGas()");assert.equal(b.run('prepararCompraActualGas(revisionMaterialesGas.plan).tramos[0].cuplas'),2);
 b.run("tramos[0].metros=12;guardarDatos()");assert.equal(b.run('prepararCompraActualGas(revisionMaterialesGas.plan).tramos[0].cuplas'),null);assert.ok(b.run("datosPlanGas().posicionesCuplas['cuplas-t']"));
});
test('Cuplas concretas: posiciones fuera del tramo, vacías o que cambian datos conocidos se rechazan',()=>{
 const a=app();proyectoCuplasAutomaticas(a,10,[{tipo:'codo90',metrosAntes:5,salida:''}],5);for(const valor of ['','-1','11','0;5','4'])assert.equal(a.run('guardarPosicionesCuplasGas(\'cuplas-t\',{codo90:'+JSON.stringify(valor)+'}).ok'),false);assert.equal(a.run('prepararCompraActualGas(revisionMaterialesGas.plan).tramos[0].cuplas'),2);
});
test('Cuplas concretas: cero adicional en accesorio y dos segmentos 5 m calculan sin duplicar',()=>{
 const a=app();proyectoCuplasAutomaticas(a,8,[{tipo:'codo90',metrosAntes:null,salida:''}],null);assert.equal(a.run("guardarPosicionesCuplasGas('cuplas-t',{codo90:'4'}).ok"),true);assert.equal(a.run('prepararCompraActualGas(revisionMaterialesGas.plan).tramos[0].cuplas'),0);assert.equal(cantidadManual(a,'codo90'),1);a.run("tramos[0].metros=10;guardarDatos()");assert.equal(a.run("guardarPosicionesCuplasGas('cuplas-t',{codo90:'5'}).ok"),true);assert.equal(a.run('prepararCompraActualGas(revisionMaterialesGas.plan).tramos[0].cuplas'),2);
});
test('Cuplas concretas: conexiones coincidentes con reducción no inventan el orden ni el diámetro de salida',()=>{
 const a=app();proyectoCuplasAutomaticas(a,10,[{tipo:'codo90',metrosAntes:null,salida:''},{tipo:'reduccion',metrosAntes:null,salida:''}],null);a.run("proyectoGasActual().conteosRapidosGas['cuplas-t'].reduccion=1;guardarDatos()");assert.equal(a.run("guardarPosicionesCuplasGas('cuplas-t',{codo90:'5',reduccion:'5'}).ok"),true);const c=a.run('prepararCompraActualGas(revisionMaterialesGas.plan)');assert.equal(c.tramos[0].cuplas,2);assert.ok(c.canos.some(g=>g.estadoDiametro==='pendiente'));assert.equal(cantidadManual(a,'codo90'),1);assert.equal(cantidadManual(a,'reduccion'),1);
});
test('Cuplas concretas: una cupla con posición conocida se reutiliza sin sumarla dos veces',()=>{
 const a=app();proyectoCuplasAutomaticas(a,10,[],null);a.run("datosPlanGas().extras.push({idFisico:'cupla-existente',tipo:'cupla',cantidad:1,tramo:'cuplas-t',ubicacion:'cuplas-t',medidas:[],confirmado:true});guardarDatos()");assert.equal(a.run("guardarPosicionesCuplasGas('cuplas-t',{cupla:'4'}).ok"),true);const c=a.run('prepararCompraActualGas(revisionMaterialesGas.plan)');assert.equal(c.tramos[0].cuplas,2);assert.equal(c.tramos[0].cuplasRegistradasContadas,1);assert.equal(a.run('resumenMaterialesInstalacionGas(revisionMaterialesGas.plan,prepararCompraActualGas(revisionMaterialesGas.plan)).find(f=>f.tipo===\"cupla\").cantidad'),2);
});
test('GAS sencillo: obtiene 17 tiras y 12 cuplas orientativas del ejemplo sin cargar posiciones',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const motor=a.run('JSON.stringify(calcularPreseleccionSigasGas())'),c=a.run('prepararCompraActualGas(revisionMaterialesGas.plan)');assert.equal(c.canos.reduce((n,g)=>n+g.tiras,0),17);assert.equal(c.estimacionCuplas.total,12);assert.equal(c.estimacionCuplas.orientativo,true);assert.ok(c.tramos.every(t=>t.cuplas===null));assert.ok(descendientesPresentacion(a.elements.get('resumenPrincipalMaterialesGas')).some(n=>n.textContent==='12 unidad estimadas · orientativas'));assert.equal(a.run('JSON.stringify(calcularPreseleccionSigasGas())'),motor);for(const [tipo,n]of [['codo90',19],['tee',2],['llave',3]])assert.equal(cantidadManual(a,tipo),n);
});
test('GAS sencillo: cambiar largo comercial recalcula estimaciones y no modifica los datos originales',()=>{
 const a=app();a.run("abrir('gas');abrirEjercicioSigas19Gas()");const antes=a.run('JSON.stringify(tramos)');a.run('datosPlanGas().opciones.largoComercial=6;guardarDatos()');const c=a.run('prepararCompraActualGas(revisionMaterialesGas.plan)');assert.equal(c.estimacionCuplas.total,7);assert.equal(c.canos.reduce((n,g)=>n+g.tiras,0),12);assert.equal(a.run('JSON.stringify(tramos)'),antes);const b=app(a.saved());b.run("abrir('gas');calcularMaterialesManualGas()");assert.equal(b.run('prepararCompraActualGas(revisionMaterialesGas.plan).estimacionCuplas.total'),7);
});
