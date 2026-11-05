const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),crypto=require('node:crypto');
const api=require('../datos/preparacion-diametros-gas.js');
const t3=require('../datos/tabla-3.js'),t18=require('../datos/tabla-18.js');
const {validarTablas}=require('../datos/validacion-tablas.js');
// Paquete sin filas, EXCLUSIVAMENTE para probar la selección de metadatos.
// validarMotor simulado no prueba capacidades ni permite usarlo en la aplicación.
function caso(){
 const alcance={pais:'TEST',uso:'TEST',gas:'TEST',material:'TEST',sistema:'TEST',provincia:'TEST',localidad:'TEST',distribuidora:'TEST'};
 const condiciones={presionMinPa:1,presionMaxPa:100,densidadRelativa:1};
 const perfil={...alcance,unidadPresion:'Pa',presionDisponible:'50',presionMinima:'10',perdidaMaxima:'5',poderCalorifico:'1000',densidadRelativa:'1',fuenteGas:'TEST',fuentePresiones:'TEST',referenciaNormativa:'TEST'};
 const p={id:'solo-metadatos-test',alcance,condiciones,unidades:{capacidad:'m3/h',longitud:'m',presion:'Pa',diametroInterior:'mm'},verificacion:Object.fromEntries(['aplicabilidad','vigencia','interiores','unidades','redondeo','piezas','cuplas','ejercicios'].map(k=>[k,true])),datos:{...alcance,condiciones:{...condiciones},metodo:'TEST'}};
 for(const k of ['fuente','edicion','fabricante','documentacionInteriores','metodo','fuenteRedondeo','fuenteCuplas','fuentePiezas'])p[k]='TEST';
 return {p,perfil};
}
test('preparación: originales disponibles con SHA coincidente y 441 / 225 valores, sin habilitar',()=>{
 const r=api.inventario(t3,t18,validarTablas);assert.equal(r.habilitado,false);assert.deepEqual(r.tablas.map(t=>t.valores),[441,225]);
 for(const t of r.tablas){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(t.archivo)).digest('hex'),t.sha256);assert.equal(t.edicion,null);assert.equal(t.aplicabilidadVerificada,false);}
 assert.match(r.otrosSistemas,/GLP/);assert.ok(r.pendientes.length);assert.equal(r.alcanceEstudiado.aplicabilidadVerificada,false);
});
test('preparación: controles reales de Tabla3 conservan sus coordenadas y L/h',()=>{
 for(const [l,qs]of [[50,[715,1975,4035]],[65,[630,1730,3550]]])assert.deepEqual(t3.filas.find(f=>f.longitud===l).capacidades.slice(0,3),qs);
 assert.equal(t3.unidadCapacidad,'L/h');assert.equal(t18.complemento.find(f=>f.tipo==='codo90'&&f.cantidad===5).equivalentesM[5],7.67);
});
test('catálogos: ningún paquete habilitado por defecto',()=>assert.equal(api.seleccionar([],{}).catalogo,null));
test('catálogos: selección de metadatos usa todas las dimensiones de alcance',()=>{
 const {p,perfil}=caso();assert.equal(api.seleccionar([p],perfil,()=>[]).catalogo,p.datos);
 for(const k of Object.keys(p.alcance)){const f={...perfil,[k]:'OTRO TEST'};assert.equal(api.seleccionar([p],f,()=>[]).catalogo,null,k);}
});
test('catálogos: localidades sin especificar no son comodines',()=>{
 const {p,perfil}=caso();for(const k of ['localidad','distribuidora','provincia']){const q=structuredClone(p);delete q.alcance[k];assert.equal(api.seleccionar([q],perfil,()=>[]).catalogo,null);}
});
test('catálogos: fuente y evidencia pendientes impiden seleccionar aunque las filas existan',()=>{
 const {p,perfil}=caso();for(const k of Object.keys(p.verificacion)){const q=structuredClone(p);q.verificacion[k]=false;assert.equal(api.seleccionar([q],perfil,()=>[]).catalogo,null);}
 for(const k of ['fuente','edicion','documentacionInteriores','fuenteCuplas']){const q=structuredClone(p);q[k]='';assert.equal(api.seleccionar([q],perfil,()=>[]).catalogo,null);}
});
test('catálogos: no mezcla L/h con m3/h ni presión o diámetro en otras unidades',()=>{
 const {p,perfil}=caso();for(const [k,v]of [['capacidad','L/h'],['presion','mmca'],['diametroInterior','m'],['longitud','cm']]){const q=structuredClone(p);q.unidades[k]=v;assert.equal(api.seleccionar([q],perfil,()=>[]).catalogo,null);}
});
test('catálogos: descarta presión, densidad y presupuesto fuera de alcance',()=>{
 const {p,perfil}=caso();for(const cambios of [{presionDisponible:'101'},{densidadRelativa:'0.65'},{presionMinima:'51'},{perdidaMaxima:'41'},{unidadPresion:'mmca'},{poderCalorifico:''},{fuenteGas:3}])assert.equal(api.seleccionar([p],{...perfil,...cambios},()=>[]).catalogo,null);
});
test('catálogos: metadatos no bastan sin validar el adaptador numérico',()=>{
 const {p,perfil}=caso();assert.equal(api.seleccionar([p],perfil).catalogo,null);assert.equal(api.seleccionar([p],perfil,()=>['Filas incompletas']).catalogo,null);
});
test('catálogos: rangos o material del adaptador no se heredan de otro sistema',()=>{
 const {p,perfil}=caso();for(const cambio of [{material:'OTRO'},{sistema:'OTRO'},{metodo:'OTRO'},{condiciones:{...p.condiciones,presionMaxPa:200}}])assert.equal(api.seleccionar([{...p,datos:{...p.datos,...cambio}}],perfil,()=>[]).catalogo,null);
});
test('catálogos: ambigüedad entre dos paquetes se bloquea, nunca elige el primero',()=>{
 const {p,perfil}=caso(),r=api.seleccionar([p,{...p,id:'otro-test'}],perfil,()=>[]);assert.equal(r.estado,'ambiguo');assert.equal(r.catalogo,null);
});
test('catálogos: ensayos y diagnóstico educativo nunca se seleccionan',()=>{
 const {p,perfil}=caso();for(const q of [{...p,soloPruebas:true},{...p,datos:{...p.datos,soloPruebas:true}},{...p,datos:{...p.datos,diagnosticoEducativo:true}}])assert.equal(api.seleccionar([q],perfil,()=>[]).catalogo,null);
});

function preparacionPCS(poderCalorifico,fuenteGas){
 if(arguments.length<2)fuenteGas='Referencia explícita del ensayo';
 const ts=[{id:'ensayo-pcs',desde:'M',hasta:'Cocina',metros:7}],red={errores:[],faltantes:[],avisos:[],excluidos:[],orientacion:{'ensayo-pcs':{desde:'m',hasta:'c'}},porTramo:{'ensayo-pcs':9300},puntos:[{id:'m',nombre:'M'},{id:'c',nombre:'Cocina'}]};
 const perfil={pais:'AR',uso:'domiciliario',gas:'GN',poderCalorifico,fuenteGas};
 return {perfil,resultado:api.prepararRed(red,ts,perfil)};
}
test('PCS: número y texto documentados producen iguales caudales sin mutar el perfil ni habilitar diámetros',()=>{
 const n=preparacionPCS(9300),s=preparacionPCS('9300');assert.deepEqual(n.resultado,s.resultado);assert.equal(n.resultado.poderCalorifico,9300);assert.equal(n.resultado.porTramo[0].caudal,1);assert.equal(n.resultado.recorridos[0].caudal,1);assert.equal(n.perfil.poderCalorifico,9300);assert.equal(s.perfil.poderCalorifico,'9300');assert.equal(n.resultado.listoParaDimensionar,false);assert.equal(n.resultado.diametros,null);assert.deepEqual(preparacionPCS(' 9300 ').resultado,n.resultado);
});
test('PCS: vacío, inválido, no positivo y tipos no numéricos permanecen pendientes, sin valores por defecto',()=>{
 for(const v of [undefined,null,'','   ',0,'0',-9300,'-9300',NaN,Infinity,-Infinity,'Infinity','NaN','9300 kcal/m³','abc',true,false,[],[9300],{valueOf:()=>9300}]){const r=preparacionPCS(v).resultado;assert.equal(r.poderCalorifico,null,String(v));assert.equal(r.porTramo[0].caudal,null);assert.equal(r.recorridos[0].caudal,null);assert.ok(r.pendientes.some(p=>p.startsWith('Poder calorífico y fuente')));assert.equal(r.diametros,null);}
});
test('PCS: número o texto sin fuente válida no permiten calcular caudales',()=>{
 for(const pcs of [9300,'9300'])for(const fuente of [undefined,null,'','   ',123,false,{}]){const r=preparacionPCS(pcs,fuente).resultado;assert.equal(r.poderCalorifico,null);assert.equal(r.porTramo[0].caudal,null);assert.equal(r.recorridos[0].caudal,null);}
 const r=preparacionPCS(9300).resultado;assert.ok(r.pendientes.length>0);assert.equal(r.listoParaDimensionar,false);
});
test('PCS: selección de metadatos acepta número y texto sin omitir el resto de verificaciones',()=>{
 const {p,perfil}=caso(),n={...perfil,poderCalorifico:Number(perfil.poderCalorifico)};assert.deepEqual(api.revisarPaquete(p,n,()=>[]),api.revisarPaquete(p,perfil,()=>[]));assert.equal(api.seleccionar([p],{...n,fuenteGas:''},()=>[]).catalogo,null);assert.equal(api.seleccionar([p],n).catalogo,null);assert.equal(api.seleccionar([],n).catalogo,null);
});
test('PCS: formulario real Casa 1, preparador y motor SIGAS GN entregan los mismos caudales y conservan resultados',()=>{
 const a=require('./helpers/casa1-cierre.cjs')();assert.equal(a.run('typeof instalacionGas.perfil.poderCalorifico'),'number');
 const r=JSON.parse(a.run(`JSON.stringify((()=>{const perfil=perfilTecnicoActualGas(),red=redFisicaManualGas(),n=PreparacionDiametrosGas.prepararRed(red,tramos,perfil),s=PreparacionDiametrosGas.prepararRed(red,tramos,{...perfil,poderCalorifico:String(perfil.poderCalorifico)}),motor=resultadoPreliminarSigasGas();return {n,s,motor: motor.resultado.filas.map(f=>({id:f.id,caudal:f.caudalM3h,diametro:f.candidato?.exteriorMm})),definitivo:motor.resultado.definitivo,cantidades:motor.cantidadesDeclaradas,guardado:typeof proyectoGasActual().instalacion.perfil.poderCalorifico};})())`));
 assert.deepEqual(r.n,r.s);assert.deepEqual(r.n.porTramo.map(t=>t.caudal),r.motor.map(t=>t.caudal));assert.deepEqual(r.motor.map(t=>t.diametro),[32,25,25]);assert.deepEqual(r.cantidades,{codo90:7,tee:1,llave:2});assert.equal(r.definitivo,false);assert.equal(r.n.diametros,null);assert.equal(r.guardado,'number');
});
