// Adaptador de DOM local para ejecutar el motor existente sin navegador ni red.
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
 for(const m of html.matchAll(/<script (?:src|data-local)="([^"]+)">[\s\S]*?<\/script>/g)){const ruta=tablasFotoBase&&/^datos\/tabla-(3|18)\.js$/.test(m[1])?m[1].replace('datos/tabla-','tests/fixtures/tabla-').replace('.js','-1e99313.cjs'):tablasLegadas&&/^datos\/tabla-(3|18)\.js$/.test(m[1])?m[1].replace('datos/tabla-','tests/fixtures/tabla-').replace('.js','-22028c8.cjs'):m[1];vm.runInContext(fs.readFileSync(ruta,'utf8'),ctx);}
 vm.runInContext(script,ctx);
 return {ctx,elements,run:code=>vm.runInContext(code,ctx),saved:()=>store.get('canerias-proyectos-v1'),text:id=>elements.get(id).textContent};
}

module.exports=app;
