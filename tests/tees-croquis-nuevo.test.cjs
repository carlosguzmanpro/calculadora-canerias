// Croquis nuevo: solo topología y accesorios expresamente descritos.
// Sin metros, consumos ni diámetros asignados. Los diámetros de los ensayos
// parametrizados proceden del catálogo y NO se trasladan a ningún proyecto.
const {test}=require('node:test'),assert=require('node:assert/strict');
const motor=require('../datos/catalogos/sigas/dimensionamiento.js'),tecnico=require('../datos/catalogos/sigas/diagnostico-ed15.js'),catalogos=require('../datos/catalogos-sistemas-gas.js'),datos=require('../datos/catalogos/sigas/tablas-ed15-2025.js');
function croquis(){
 const tramos=[{id:'MA',desde:'M',hasta:'A'},{id:'AB',desde:'A',hasta:'B'},{id:'ACal',desde:'A',hasta:'Calefactor'},{id:'BCoc',desde:'B',hasta:'Cocina'},{id:'BTerm',desde:'B',hasta:'Termotanque'}];
 const red={orientacion:Object.fromEntries(tramos.map(t=>[t.id,{desde:t.desde,hasta:t.hasta}])),porTramo:{}};
 const A={id:'tee-A',tipo:'tee',cantidad:1,nodo:'A',conexionesDiametro:['MA','AB','ACal']},B={id:'tee-B',tipo:'tee',cantidad:1,nodo:'B',conexionesDiametro:['AB','BCoc','BTerm']};
 const seleccionA={viasPorTramo:{AB:'giro',ACal:'directo'}},seleccionB={viasPorTramo:{BCoc:'giro',BTerm:'giro'}};
 const recorridos=[{artefacto:'Calefactor',tramos:['MA','ACal']},{artefacto:'Cocina',tramos:['MA','AB','BCoc']},{artefacto:'Termotanque',tramos:['MA','AB','BTerm']}];
 return {tramos,red,A,B,seleccionA,seleccionB,recorridos};
}
const diametros=()=>datos.tablas[4].exterioresMm;
const vectorIgual=(c,de)=>Object.fromEntries(c.tramos.map(t=>[t.id,de]));
test('tees croquis nuevo: dos identidades físicas y codo independiente sin inventar datos ni duplicar referencias',()=>{
 const c=croquis(),antes=JSON.stringify(c),pieza=(id,tipo,nodo,ubicaciones)=>({id,tipo,nodoOriginal:nodo,cantidad:1,confirmado:true,ubicaciones});
 const inventario=catalogos.prepararAccesorios([pieza('tee-A','tee','A',['MA']),pieza('tee-A','tee','A',['AB']),pieza('tee-A','tee','A',['ACal']),pieza('tee-B','tee','B',['AB']),pieza('tee-B','tee','B',['BCoc']),pieza('tee-B','tee','B',['BTerm']),pieza('codo-calefactor','codo90',null,['ACal'])],c.red,c.tramos);
 assert.equal(inventario.fisicas.filter(p=>p.tipo==='tee').length,2);assert.equal(inventario.fisicas.filter(p=>p.tipo==='tee').reduce((n,p)=>n+p.cantidad,0),2);assert.equal(inventario.fisicas.filter(p=>p.tipo==='codo90').length,1);assert.equal(inventario.fisicas.find(p=>p.id==='codo-calefactor').cantidad,1);assert.equal(JSON.stringify(c),antes);assert.ok(c.tramos.every(t=>!Object.hasOwn(t,'metros')&&!Object.hasOwn(t,'consumo')&&!Object.hasOwn(t,'diametro')));assert.ok(inventario.fisicas.every(p=>p.equivalenteM===null));
});
test('tees croquis nuevo: las cuatro vías usan su fila SIGAS para cada diámetro documentado, no una clasificación global',()=>{
 const c=croquis(),antes=JSON.stringify(c);
 for(const de of diametros())for(const [pieza,ruta,seleccion,via]of [[c.A,c.recorridos[1],c.seleccionA,'giro'],[c.A,c.recorridos[0],c.seleccionA,'directo'],[c.B,c.recorridos[1],c.seleccionB,'giro'],[c.B,c.recorridos[2],c.seleccionB,'giro']]){const r=motor.resolverTee(datos,pieza,ruta,vectorIgual(c,de),seleccion);assert.equal(r.estado,'resuelta');assert.equal(r.via,via);assert.equal(motor.viaTee(r.fila),via);assert.equal(r.fila.diametroExteriorM*1000,de);assert.equal(r.fila.pagina,25);assert.ok(datos.tablas[3].filas.some(f=>f.id===r.fila.id));}
 assert.equal(JSON.stringify(c),antes);
});
test('tees croquis nuevo: la salida directa de A y el codo posterior son aportes distintos; cocina/termo no heredan ese codo',()=>{
 const c=croquis();for(const de of diametros()){
  const r=motor.resolverTee(datos,c.A,c.recorridos[0],vectorIgual(c,de),c.seleccionA),f=datos.tablas[3].filas.find(f=>f.nombreOriginal==='Codo Normal a 90º '+de+' mm');assert.ok(f);
  const aportes=[{piezaId:c.A.id,...tecnico.accesorio(datos,r.fila.id,1)},{piezaId:'codo-calefactor',...tecnico.accesorio(datos,f.id,1)}];assert.equal(new Set(aportes.map(p=>p.piezaId)).size,2);assert.equal(aportes[0].cantidad,1);assert.equal(aportes[1].cantidad,1);assert.equal(aportes[0].pagina,25);assert.equal(aportes[1].pagina,24);
  for(const ruta of c.recorridos.slice(1)){const tees=[motor.resolverTee(datos,c.A,ruta,vectorIgual(c,de),c.seleccionA),motor.resolverTee(datos,c.B,ruta,vectorIgual(c,de),c.seleccionB)];assert.ok(tees.every(t=>t.estado==='resuelta'&&t.via==='giro'));assert.equal(ruta.tramos.includes('ACal'),false);}
 }
 // La descripción de aproximadamente 40 cm no se convierte en metros nuevos.
 assert.ok(c.tramos.every(t=>!Object.hasOwn(t,'metros')));
});
test('tees croquis nuevo: las dos salidas de B giran desde A; no se consulta un recorrido cocina–termo',()=>{
 const c=croquis();assert.ok(c.recorridos.every(r=>r.tramos[0]==='MA'));assert.ok(c.recorridos.every(r=>!(r.tramos.includes('BCoc')&&r.tramos.includes('BTerm'))));
 for(const ruta of c.recorridos.slice(1)){const r=motor.resolverTee(datos,c.B,ruta,vectorIgual(c,diametros()[0]),c.seleccionB);assert.equal(r.entrada,'AB');assert.equal(r.via,'giro');}
});
test('tees croquis nuevo: sin diámetros o sin vía real no se obtiene una equivalencia; otro proyecto no hereda las selecciones',()=>{
 const c=croquis();const incompleto=motor.resolverTee(datos,c.A,c.recorridos[0],{},c.seleccionA);assert.equal(incompleto.estado,'pendiente');assert.equal(incompleto.fila,undefined);
 const otro={viasPorTramo:{}},antes=JSON.stringify(otro);assert.equal(motor.resolverTee(datos,c.B,c.recorridos[1],vectorIgual(c,diametros()[0]),otro).estado,'pendiente');assert.equal(JSON.stringify(otro),antes);assert.deepEqual(c.seleccionB.viasPorTramo,{BCoc:'giro',BTerm:'giro'});
 const restaurada=JSON.parse(JSON.stringify({A:c.seleccionA,B:c.seleccionB}));assert.deepEqual(restaurada.A,c.seleccionA);assert.deepEqual(restaurada.B,c.seleccionB);
});
test('tees croquis nuevo: conjuntos multidiámetro documentados proponen bujes por salida, sin confirmar ni cambiar inventario',()=>{
 const c=croquis(),antes=JSON.stringify(c);let comprobados=0;
 for(const de of diametros())for(const menor of diametros().filter(x=>x<de)){
  const v={...vectorIgual(c,menor),MA:de},op=motor.proponerConjuntosTee(datos,c.A,c.recorridos,v,c.seleccionA).find(o=>o.id==='normal-bujes');if(!op)continue;comprobados++;assert.equal(op.reducciones.length,2);assert.deepEqual(new Set(op.reducciones.map(r=>r.tramoId)),new Set(['AB','ACal']));assert.ok(op.reducciones.every(r=>datos.tablas[3].filas.some(f=>f.id===r.productoId&&f.longitudEquivalenteM===r.equivalenteM)));assert.equal(motor.viaTee(datos.tablas[3].filas.find(f=>f.id===op.filasPorSalida.AB)),'giro');assert.equal(motor.viaTee(datos.tablas[3].filas.find(f=>f.id===op.filasPorSalida.ACal)),'directo');assert.equal(c.seleccionA.conjunto,undefined);
 }
 assert.ok(comprobados>0);assert.equal(JSON.stringify(c),antes);
});
test('tees croquis nuevo: los conjuntos SIGAS no se proponen para otras marcas',()=>{
 const c=croquis(),v=vectorIgual(c,diametros()[0]);for(const id of ['fusiogas','acero-epoxi-roscado-gn'])assert.deepEqual(motor.proponerConjuntosTee({...datos,id},c.A,c.recorridos,v,c.seleccionA),[]);
});
