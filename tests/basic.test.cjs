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
 function element(){return {value:'',textContent:'',checked:false,children:[],className:'',classList:{hidden:false,add(c){if(c==='oculto')this.hidden=true;},remove(c){if(c==='oculto')this.hidden=false;},toggle(c,b){if(c==='oculto')this.hidden=b;}},append(...x){this.children.push(...x)},replaceChildren(){this.children=[];this.textContent=''},removeAttribute(k){delete this[k]},addEventListener(k,fn){this[k]=fn}};}
 for(const m of html.matchAll(/id="([^"]+)"/g))elements.set(m[1],element());
 elements.get('gt').value='9300';elements.get('ga').value='Cocina';
 const ctx=vm.createContext({document:{getElementById:id=>elements.get(id),createElement:element},window:{scrollTo(){},addEventListener(k,fn){this[k]=fn}},localStorage:{getItem:k=>{if(blocked)throw Error('blocked');return store.get(k)||null},setItem(k,v){if(blocked||v.length>quota)throw Error('quota');store.set(k,v)}},URL:{revokeObjectURL(){}},alert(){}});
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
