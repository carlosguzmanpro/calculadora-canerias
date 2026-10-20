const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
// DOM mínimo: estas pruebas ejercitan el estado y los cálculos reales del script.
// La maquetación, cámara e impresión visual requieren la prueba de navegador.
function app(saved=null,{blocked=false,quota=Infinity}={}){
 const elements=new Map();const store=new Map(saved?[['canerias-proyectos-v1',saved]]:[]);
 function element(){return {value:'',textContent:'',checked:false,style:{},children:[],className:'',classList:{hidden:false,add(c){if(c==='oculto')this.hidden=true;},remove(c){if(c==='oculto')this.hidden=false;},toggle(c,b){if(c==='oculto')this.hidden=b;}},append(...x){this.children.push(...x)},replaceChildren(){this.children=[];this.textContent=''},removeAttribute(k){delete this[k]},addEventListener(k,fn){this[k]=fn}};}
 for(const m of html.matchAll(/id="([^"]+)"/g))elements.set(m[1],element());
 elements.get('gt').value='9300';elements.get('ga').value='Cocina';
 const ctx=vm.createContext({document:{getElementById:id=>elements.get(id),createElement:element,createTextNode:text=>({textContent:text})},window:{scrollTo(){},addEventListener(k,fn){this[k]=fn}},localStorage:{getItem:k=>{if(blocked)throw Error('blocked');return store.get(k)||null},setItem(k,v){if(blocked||v.length>quota)throw Error('quota');store.set(k,v)}},URL:{revokeObjectURL(){}},alert(){}});
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
test('no admite origen de IA y no expone la revisión en agua o cloacas',()=>{
 const a=app();ejemploRevisado(a);a.run("borradorCroquis.origen='gemini';incorporarCroquis()");assert.equal(a.run('tramos.length'),0);assert.match(a.text('mensajeCroquis'),/formato/);
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
