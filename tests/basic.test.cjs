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
