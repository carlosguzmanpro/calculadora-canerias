// Diagnóstico educativo separado de datos del usuario y del catálogo de producción.
const fs=require('node:fs');
const cargarMotor=require('./cargar-motor.cjs');
const t3=require('../datos/tabla-3.js'),t18=require('../datos/tabla-18.js');
function construirCaso(principal){
 if(!['Calefón','Cocina','ambos-90'].includes(principal))throw Error('Elegir explícitamente salida de paso directo.');
 const nodos=[{id:'M',nombre:'Medidor',tipo:'medidor'},{id:'A',nombre:'A',tipo:'derivacion',unionDimensionamiento:'tee',...(principal==='ambos-90'?{configuracionTee:'entrada-por-ramal'}:{})},...['Calefón','Cocina'].map(n=>({id:n,nombre:n,tipo:'artefacto',artefactoId:n}))];
 const tramos=[['M','A',19,5,0],['A','Calefón',18,7,1],['A','Cocina',12,5,1]].map(([desde,hasta,metros,codos,llaves])=>({id:desde+'-'+hasta,desde,hasta,metros,diametro:null,consumo:null,red:{desde,hasta,...(desde==='A'?{via:principal!=='ambos-90'&&hasta===principal?'principal':'ramal'}:{})},detalleDiagnostico:{accesorios:[{tipo:'codo90',cantidad:codos},{tipo:'llave',cantidad:llaves}],...(hasta==='A'?{teeEnExtremo:'A'}:{})}}));
 return {tramos,artefactos:[{id:'Calefón',nombre:'Calefón',consumo:21950},{id:'Cocina',nombre:'Cocina',consumo:10250}],nodos};
}
function construirPaquete(valvula){
 const factorValvula=t18.accesorios.find(a=>a.tipo===valvula)?.factorD;
 if(!['valvula-macho','valvula-globo','valvula-esclusa'].includes(valvula)||!factorValvula)throw Error('Identificar tipo de válvula, no usar llave genérica.');
 const candidatos=t3.columnas.map((id,j)=>({id,interiorMm:t18.diametros[j].diametroTabuladoM*1000,esDiametroTabuladoNoInteriorReal:true,filas:t3.filas.map(f=>({longitud:f.longitud,caudal:f.capacidades[j]/1000}))}));
 const coeficiente=tipo=>t18.accesorios.find(a=>a.tipo===tipo).factorD;
 const piezas={},d=id=>t18.diametros.find(a=>a.nominal===id).diametroTabuladoM;
 for(const a of candidatos)for(const b of candidatos){
  for(const [tipo,factor]of [['codo90',coeficiente('codo90')],['codo45',coeficiente('codo45')],['llave',factorValvula]])piezas[[tipo,a.id,b.id].join('|')]={soloModelo:true,equivalentes:{principal:factor*d(a.id)}};
  piezas[['reduccion',a.id,b.id].join('|')]={soloModelo:true,disponibilidadComercialVerificada:false};
  for(const c of candidatos)piezas[['tee',a.id,b.id,c.id].join('|')]={soloModelo:true,disponibilidadComercialVerificada:false,equivalentes:{principal:coeficiente('tee-directo')*d(b.id),ramal:coeficiente('tee-giro90')*d(c.id),salida1:coeficiente('tee-giro90')*d(b.id),salida2:coeficiente('tee-giro90')*d(c.id)}};
 }
 const tabla=(numero,source)=>({numero,verificada:false,fuente:source,edicion:null,unidades:numero===3?'L/h originales; convertidos a m³/h al adaptar':'d en m; equivalentes derivados de factores',aplicabilidadAceroRoscadoEpoxi:false});
 return {soloPruebas:true,diagnosticoEducativo:true,verificado:false,fuente:'Fotografías del usuario; fórmula n × factor × d como hipótesis educativa',edicion:null,material:'Acero con revestimiento epoxi',sistema:'Roscado',gas:'GN',metodo:'longitud-maxima-tabular',reglaLongitud:'maxima-ruta-completa-que-contiene-tramo',redondeoSuperiorVerificado:false,condiciones:{densidadRelativa:.65},candidatos,piezas,
 tabla3:{...tabla(3,t3.procedencia.archivo),unidadCaudal:'m3/h',unidadLongitud:'m',referenciaH:{valor:10,unidad:'mmca',significadoVerificado:false}},tabla18:{...tabla(18,t18.procedencia.archivo),unidadEquivalentes:'m'},
 politicaCuplas:'pendientes-sin-posiciones',fuentePoliticaCuplas:'Omisión exclusiva del escenario educativo por falta de posiciones; NO pérdida nula ni criterio normativo aprobado',
 advertencias:['Escenario condicional, no se confirmó orientación de tee ni tipo de llave.','Cuplas pendientes: no se conocen segmentos entre accesorios; no se contaron ni se asignó equivalente cero.','Equivalentes derivados de factores y d tabulados; no sustituyen ni corrigen valores impresos.','Tee modelada como pieza reductora integrada; compatibilidad y método de equivalencias por salida NO verificados.','El campo legado interiorMm lleva d tabulado solo para ordenar candidatos; NO interiores reales certificados.','Edición, aplicabilidad, redondeo y condiciones de suministro pendientes.']};
}
function ejecutarEscenario({principal,valvula,modoPrueba=true}={}){
 const caso=construirCaso(principal),paquete=construirPaquete(valvula),app=cargarMotor();
 app.ctx.casoDiagnostico=caso;app.ctx.paqueteDiagnostico=paquete;app.ctx.modoDiagnostico=modoPrueba;
 const r=app.run('motorClaseAceroGas(casoDiagnostico.tramos,casoDiagnostico.artefactos,{version:1,perfil:{...PERFIL_CLASE_ACERO},nodos:casoDiagnostico.nodos},paqueteDiagnostico,{modoPrueba:modoDiagnostico})');
 if(app.run('CATALOGOS_GAS_VERIFICADOS.length')!==0)throw Error('No se debe habilitar el catálogo.');
 return JSON.parse(JSON.stringify({principal,valvula,caso,resultado:r}));
}
function ejecutarTodos(){return ['valvula-macho','valvula-esclusa','valvula-globo'].flatMap(valvula=>['Calefón','Cocina','ambos-90'].map(principal=>ejecutarEscenario({principal,valvula})));}
module.exports={construirCaso,construirPaquete,ejecutarEscenario,ejecutarTodos};
if(require.main===module){
 const escenarios=ejecutarTodos();
 fs.writeFileSync('diagnosticos/resultado-calefon-cocina.json',JSON.stringify({modo:'EDUCATIVO CONDICIONAL',habilitacionDefinitiva:false,escenarios},null,2)+'\n');
 for(const e of escenarios)console.log(e.valvula,'paso directo a',e.principal,e.resultado.estado,e.resultado.propuestas,e.resultado.recorridos.map(r=>[r.artefacto,r.longitudDefinitiva]),e.resultado.faltantes);
}
