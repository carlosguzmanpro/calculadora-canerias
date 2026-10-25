const {test}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs');
const api=require('../datos/catalogos-sistemas-gas.js'),t3=require('../datos/tabla-3.js'),t18=require('../datos/tabla-18.js');
const epoxi=()=>api.obtener(api.IDS.epoxi,t3,t18);
test('catálogos: epoxi contiene únicamente las dos fuentes identificadas, sin habilitación',()=>{
 const c=epoxi();assert.deepEqual(c.tablas,[t3,t18]);assert.equal(c.origenConfirmadoPorPropietario,true);assert.equal(c.habilitado,false);assert.equal(c.edicion,null);
});
test('catálogos: SIGAS queda vacío aunque se entreguen las tablas epoxi a la función',()=>{
 const c=api.obtener(api.IDS.sigas,t3,t18);assert.deepEqual(c.tablas,[]);assert.equal(c.habilitado,false);assert.match(c.pendientes.join(' '),/manual SIGAS/);
});
test('catálogos: fuente intercambiada, ausente o de otro origen nunca se asigna a epoxi',()=>{
 for(const [a,b]of [[t18,t3],[null,t18],[t3,null],[{...t3,procedencia:{sha256:'otra-foto'}},t18]]){const c=api.obtener(api.IDS.epoxi,a,b);assert.equal(c.tablas.length,0);assert.equal(c.habilitado,false);}
});
test('catálogos: las fichas separan origen declarado de aprobación normativa',()=>{
 const a=require('../datos/catalogos/acero-epoxi/procedencia.json'),b=require('../datos/catalogos/sigas/procedencia.json');assert.equal(a.origenConfirmadoPorPropietario,true);assert.equal(a.aplicabilidadNormativaVerificada,false);assert.equal(a.edicion,null);assert.equal(b.fotografiasLocalizadas,false);assert.equal(b.manualDisponible,true);assert.deepEqual(b.tablas.map(t=>t.numero),[6,4,5,3]);assert.equal(b.habilitado,false);for(const f of a.tablas){assert.ok(fs.existsSync(f.datos));assert.ok(fs.existsSync(f.fotografia));}
});
test('catálogos: elección explícita prevalece y no hay fallback ante ID desconocido',()=>{
 const perfil={material:'Acero con revestimiento epoxi',sistema:'Roscado'};assert.equal(api.identificar(perfil),api.IDS.epoxi);assert.equal(api.identificar({...perfil,catalogoTecnicoGas:'sigas'}),'sigas');assert.equal(api.identificar({...perfil,catalogoTecnicoGas:'inventado'}),null);assert.equal(api.identificar({...perfil,catalogoTecnicoGas:''}),null);assert.equal(api.identificar({material:'Otro acero',sistema:'Roscado'}),null);
});
test('catálogos: seleccionar SIGAS no legitima el material epoxi ni GLP',()=>{
 assert.ok(api.compatibilidad({gas:'GLP',material:'Acero con revestimiento epoxi',sistema:'Roscado'},api.obtener('sigas')).length>=2);assert.equal(api.obtener('otra-familia',t3,t18).tablas.length,0);
});
test('cotejo: CSV de 666 posiciones corresponde exactamente a las coordenadas de ambas tablas',()=>{
 const filas=fs.readFileSync('auditoria/cotejo-epoxi-2026-10-24.csv','utf8').trim().split('\n').slice(1),claves=new Set();assert.equal(filas.length,666);
 for(const f of filas){const [id,n,tipo,cant,l,d,i,j,q,cotejo,validacion]=f.split(';');assert.equal(id,api.IDS.epoxi);assert.equal(cotejo,'releido-foto-original');assert.equal(validacion,'pendiente');let original;
  if(n==='3'){assert.equal(t3.filas[+i-1].longitud,+l);assert.equal(t3.columnas[+j-1],d);original=t3.filas[+i-1].capacidades[+j-1];}
  else{assert.equal(t18.complemento[+i-1].tipo,tipo);assert.equal(t18.complemento[+i-1].cantidad,+cant);assert.equal(t18.diametros[+j-1].nominal,d);original=t18.complemento[+i-1].equivalentesM[+j-1];}
  assert.equal(+q,original);claves.add(n+'|'+i+'|'+j);
 }assert.equal(claves.size,666);
});
test('cotejo: corrección nueva conserva valor anterior, coordenada y fuente, sin cambiar 715',()=>{
 assert.equal(t3.filas.find(f=>f.longitud===34).capacidades[8],155735);const c=t3.auditoria.correcciones.find(c=>c.longitud===34&&c.diametro==='4"');assert.equal(c.anterior,155753);assert.equal(c.corregido,155735);assert.match(c.motivo,/fotografía/);assert.equal(t3.filas.find(f=>f.longitud===50).capacidades[0],715);
});
test('cotejo: impresos 7,67 y 7,60 se conservan, sin completar interiores ni redondeos',()=>{
 assert.equal(t18.complemento.find(f=>f.tipo==='codo90'&&f.cantidad===5).equivalentesM[5],7.67);assert.equal(t18.complemento.find(f=>f.tipo==='tee-directo'&&f.cantidad===5).equivalentesM[7],7.60);assert.equal(t18.redondeo.verificado,false);assert.ok(t18.diametros.every(d=>d.interiorM===null));
});
test('accesorios técnicos: identidad compartida única, tee nunca se transforma en codo',()=>{
 const ts=[{id:'a',desde:'M',hasta:'A',metros:15},{id:'b',desde:'A',hasta:'B',metros:5}];const tee={id:'tee-A',tipo:'tee',cantidad:1,nodoOriginal:'A',ubicaciones:['a','b'],confirmado:true};const r=api.prepararAccesorios([tee,tee],{porTramo:{a:10,b:5},orientacion:{}},ts);assert.equal(r.fisicas.length,1);assert.equal(r.fisicas[0].tipo,'tee');assert.ok(r.fisicas.every(p=>p.equivalenteM===null));assert.equal(r.porTramo[0].referencias[0],r.porTramo[1].referencias[0]);
});
test('accesorios técnicos: contradicción de identidad y cantidad inválida quedan pendientes',()=>{
 const p={id:'pieza',tipo:'llave',cantidad:1,ubicaciones:[]};const r=api.prepararAccesorios([p,{...p,cantidad:2},{...p,id:'otra',cantidad:null}],{porTramo:{},orientacion:{}},[]);assert.equal(r.fisicas.length,1);assert.match(r.pendientes.join(' '),/contradictoria/);assert.match(r.pendientes.join(' '),/no se convierte a cero/);assert.equal(r.habilitado,false);
});
test('resultados: flags de un respaldo no habilitan diámetros, y las firmas viejas se rechazan',()=>{
 const ts=[{id:'a',desde:'M',hasta:'A'}],r={estado:'calculado',prueba:false,verificacionTecnica:true,catalogoHabilitado:true,diametros:{a:'D-TEST'}};
 assert.equal(api.resultadoPorTramo(ts,r,'actual','actual')[0].diametro,'Pendiente');assert.equal(api.resultadoPorTramo(ts,r,'actual','vieja',{catalogoHabilitado:true,verificacionTecnica:true})[0].diametro,'Pendiente');assert.equal(api.resultadoPorTramo(ts,{...r,prueba:true},'actual','actual',{catalogoHabilitado:true,verificacionTecnica:true})[0].diametro,'Pendiente');
});
test('resultados: presentación preparada para resultado verificado sin rellenar tramos ausentes',()=>{
 const ts=[{id:'a',desde:'M',hasta:'A'},{id:'b',desde:'A',hasta:'B'}],r={estado:'calculado',prueba:false,verificacionTecnica:true,catalogoHabilitado:true,diametros:{a:'D-TEST'}};const filas=api.resultadoPorTramo(ts,r,'actual','actual',{catalogoHabilitado:true,verificacionTecnica:true});assert.equal(filas[0].diametro,'D-TEST');assert.equal(filas[0].tramo,'M–A');assert.equal(filas[1].diametro,'Pendiente');
});
test('accesorios técnicos: segmentos y largo comercial ya conocidos no se piden otra vez',()=>{
 const ts=[{id:'a',desde:'M',hasta:'A',metros:6,segmentos:[{metros:6}]}],r=api.prepararAccesorios([],{porTramo:{a:16000},orientacion:{a:{desde:'M',hasta:'A'}}},ts,[],[],{largoComercial:6});assert.equal(r.largoComercial,6);assert.doesNotMatch(r.pendientes.join(' '),/segmentos continuos pendientes/);assert.equal(r.porTramo[0].conexion.hasta,'A');assert.equal(r.habilitado,false);
});

function casoTerminal(){return {red:{errores:[],puntos:[{id:'m',nombre:'M',tipo:'medidor'},{id:'a',nombre:'A'},{id:'c',nombre:'Cocina',tipo:'artefacto'}],orientacion:{ma:{desde:'m',hasta:'a'},ac:{desde:'a',hasta:'c'}},porTramo:{ma:100,ac:100}},ts:[{id:'ma'},{id:'ac'}],inventario:{fisicas:[{id:'codo',tipo:'codo90',cantidad:1,confirmada:true,tramos:['ac']},{id:'tee',tipo:'tee',cantidad:1,confirmada:true,tramos:['ma'],nodo:'a'}]}};}
const sigasTerminal=require('../datos/catalogos/sigas/tablas-ed15-2025.js'),fusioTerminal=require('../datos/catalogos/fusiogas/tablas-v1-2026.js');
function revisarTerminal(c,sistema='sigas',reg={}){return api.conexiones(c.red,c.ts,c.inventario,sistema,reg,sigasTerminal,fusioTerminal);}
test('conexiones: medidor/artefacto son extremos y tee A es intermedia; ningún codo implícito',()=>{const c=casoTerminal(),antes=JSON.stringify(c),r=revisarTerminal(c);assert.deepEqual(r.extremos.map(e=>e.rol),['medidor','artefacto']);assert.equal(r.piezas.find(p=>p.piezaId==='tee').rol,'intermedia');assert.equal(r.agregadas,0);assert.ok(r.extremos.every(e=>e.equivalenteM===null));assert.equal(JSON.stringify(c),antes);});
test('conexiones: una transición recta del catálogo no se sustituye por codo',()=>{for(const sistema of ['sigas','fusiogas']){const c=casoTerminal();c.inventario.fisicas[0].tipo='otro';const producto=api.productosTerminales(sistema,sigasTerminal,fusioTerminal).find(f=>/^Transici[oó]n/i.test(f.nombreOriginal));const r=revisarTerminal(c,sistema,{c:{piezaId:'codo',productoId:producto.id,sistema}}),e=r.extremos.find(e=>e.id==='c');assert.equal(e.estado,'producto identificado');assert.equal(e.producto.id,producto.id);assert.equal(e.equivalenteM,producto.longitudEquivalenteM);assert.equal(c.inventario.fisicas[0].cantidad,1);}});
test('conexiones: familia normal intermedia no identifica una transición terminal',()=>{const c=casoTerminal(),r=revisarTerminal(c,'sigas',{c:{piezaId:'codo',productoId:'sigas-p24-izquierdo-19',sistema:'sigas'}});assert.equal(r.extremos.find(e=>e.id==='c').equivalenteM,null);assert.equal(r.extremos.find(e=>e.id==='c').estado,'pendiente');});
test('conexiones: codo no se convierte en transición recta para completar un extremo',()=>{const c=casoTerminal(),f=api.productosTerminales('sigas',sigasTerminal,fusioTerminal).find(f=>/^Transición Hembra/.test(f.nombreOriginal));assert.equal(revisarTerminal(c,'sigas',{c:{piezaId:'codo',productoId:f.id,sistema:'sigas'}}).extremos.find(e=>e.id==='c').estado,'pendiente');});
test('conexiones: tablas y productos SIGAS y FUSIOGAS nunca se mezclan',()=>{const c=casoTerminal(),reg={c:{piezaId:'codo',productoId:'sigas-p24-izquierdo-37',sistema:'sigas'}};assert.equal(revisarTerminal(c,'fusiogas',reg).extremos.find(e=>e.id==='c').equivalenteM,null);assert.deepEqual(api.productosTerminales('sigas',fusioTerminal,sigasTerminal),[]);});
test('conexiones: grupos, ubicaciones ajenas y cantidades sin confirmar permanecen pendientes',()=>{for(const cambio of [{cantidad:5},{confirmada:false},{tramos:['ma']},{conflicto:true}]){const c=casoTerminal();Object.assign(c.inventario.fisicas[0],cambio);const r=revisarTerminal(c,'sigas',{c:{piezaId:'codo',productoId:'sigas-p24-izquierdo-37',sistema:'sigas'}});assert.equal(r.extremos.find(e=>e.id==='c').equivalenteM,null);}});
test('conexiones: una pieza no puede resolver dos extremos ni duplicar equivalentes',()=>{const c=casoTerminal();c.red={errores:[],puntos:[{id:'m',nombre:'M',tipo:'medidor'},{id:'c',nombre:'Cocina',tipo:'artefacto'}],orientacion:{ac:{desde:'m',hasta:'c'}},porTramo:{ac:100}};const reg={piezaId:'codo',productoId:'sigas-p24-izquierdo-37',sistema:'sigas'},r=revisarTerminal(c,'sigas',{m:reg,c:reg});assert.equal(r.extremos.filter(e=>e.estado==='producto identificado').length,0);assert.match(r.extremos[1].motivo,/otro extremo/);});
test('conexiones: acero epoxi vincula pieza roscada sin tomar equivalentes de termofusión',()=>{const c=casoTerminal(),sistema=api.IDS.epoxi,r=revisarTerminal(c,sistema,{c:{piezaId:'codo',productoId:'sigas-p24-izquierdo-37',sistema}});assert.equal(r.productos.length,0);assert.equal(r.extremos.find(e=>e.id==='c').estado,'pieza vinculada');assert.equal(r.extremos.find(e=>e.id==='c').equivalenteM,null);});
test('conexiones: errores de topología no producen extremos confirmados',()=>{const c=casoTerminal();c.red.errores=['Circuito cerrado'];assert.ok(revisarTerminal(c).extremos.every(e=>e.estado==='pendiente'));});
test('conexiones: orden de puntos y extremos visuales invertidos no cambia las conexiones estructuradas',()=>{const c=casoTerminal(),a=revisarTerminal(c);c.red.puntos.reverse();c.ts=[{id:'ac',desde:'Cocina',hasta:'A'},{id:'ma',desde:'A',hasta:'M'}];const b=revisarTerminal(c);assert.deepEqual(a.extremos.map(e=>[e.id,e.rol,e.tramos]).sort(),b.extremos.map(e=>[e.id,e.rol,e.tramos]).sort());});
test('conexiones: MH termofusión sin rosca explícita no se ofrece como transición terminal',()=>{const productos=api.productosTerminales('sigas',sigasTerminal,fusioTerminal);assert.ok(productos.length>0);assert.ok(productos.every(p=>/rosca|transici[oó]n/i.test(p.nombreOriginal)));});
test('conexiones: conserva nombres manuales de transiciones y respeta macho/hembra',()=>{const productos=api.productosTerminales('sigas',sigasTerminal,fusioTerminal),hembra=productos.find(f=>/^Transición Hembra/.test(f.nombreOriginal)),macho=productos.find(f=>/^Transición Macho/.test(f.nombreOriginal));assert.equal(api.tipoProductoCompatible({tipo:'Transición hembra'},hembra),true);assert.equal(api.tipoProductoCompatible({tipo:'Transición hembra'},macho),false);assert.equal(api.tipoProductoCompatible({tipo:'Transición macho'},hembra),false);});
