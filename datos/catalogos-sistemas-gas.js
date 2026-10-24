/* Fuentes independientes, preparación de accesorios y resultados. Ninguna habilitación. */
(function(root){
 const IDS={epoxi:'acero-epoxi-roscado-gn',sigas:'sigas'};
 function identificar(perfil={}){
  if(perfil.catalogoTecnicoGas!==undefined)return Object.values(IDS).includes(perfil.catalogoTecnicoGas)?perfil.catalogoTecnicoGas:null;
  if(perfil.material==='Acero con revestimiento epoxi'&&perfil.sistema==='Roscado')return IDS.epoxi;
  if(String(perfil.material||'').trim().toLowerCase()==='sigas'||String(perfil.sistema||'').trim().toLowerCase()==='sigas')return IDS.sigas;
  return null;
 }
 function obtener(id,t3,t18,sigas=null){
  if(id===IDS.epoxi){
   const fuentesCorrectas=t3?.tabla===3&&t18?.tabla===18&&t3.procedencia?.sha256==='ce11e42467d7a4f4aa31b96c0ca83a3c97b5e6ae0cea0cf62cdb5db9f6e6d4f5'&&t18.procedencia?.sha256==='d9f541eb091f705c0dead916066da755f9cf2cb9a5f449be025f7dae2bad41a0';
   return {id,nombre:'Acero epoxi · roscado · GN',habilitado:false,origenConfirmadoPorPropietario:true,edicion:null,tablas:fuentesCorrectas?[t3,t18]:[],documentacion:'datos/catalogos/acero-epoxi/procedencia.json',pendientes:[...(fuentesCorrectas?[]:['Faltan las fuentes originales identificadas de acero epoxi o sus metadatos no coinciden.']),'Confirmar edición, aplicabilidad normativa, condiciones de suministro e interiores reales.','Resolver 7,67/7,65, redondeos y criterio de cuplas con documentación.']};}
  if(id===IDS.sigas&&sigas?.id==='sigas'&&sigas.fuente?.sha256==='a7dc5dd90adec7d9db335100407d4748f306281b3917e2e52a8f2b707d35e2b1')return {id,nombre:'SIGAS Thermofusión · ed.15 / 2025',habilitado:false,origenConfirmadoPorPropietario:true,edicion:sigas.fuente.edicion,tablas:[6,4,5,3].map(n=>sigas.tablas[n]),documentacion:'datos/catalogos/sigas/procedencia.json',fuente:sigas.fuente,pendientes:['Manual identificado: verificar criterios de cálculo, discrepancias del original, accesorios exactos y condiciones de suministro.','Las tablas SIGAS no habilitan ni utilizan equivalencias de acero epoxi.']};
  if(id===IDS.sigas)return {id,nombre:'SIGAS',habilitado:false,origenConfirmadoPorPropietario:false,edicion:null,tablas:[],documentacion:'datos/catalogos/sigas/procedencia.json',pendientes:['No se cargó un manual SIGAS identificado; no se usarán tablas de acero epoxi.','Faltan capacidades y equivalencias completas, familia exacta, edición, manual y condiciones del fabricante. No se utilizarán tablas de acero epoxi.']};
  return {id:null,nombre:'Sistema pendiente de seleccionar',habilitado:false,tablas:[],pendientes:['Elegí el catálogo del proyecto. No se asignan tablas por defecto.']};
 }
 function compatibilidad(perfil={},catalogo){
  const ps=[];
  if(catalogo.id===IDS.epoxi&&(perfil.material!=='Acero con revestimiento epoxi'||perfil.sistema!=='Roscado'))ps.push('El material y la unión guardados no coinciden exactamente con acero epoxi roscado. Se conservaron: revisalos en Datos de instalación.');
  if(catalogo.id===IDS.sigas&&((perfil.material==='Acero con revestimiento epoxi')||perfil.sistema==='Roscado'))ps.push('SIGAS está seleccionado, pero hay datos de acero epoxi/roscado guardados. Se conservaron sin trasladar sus tablas a SIGAS.');
  if(perfil.gas!=='GN')ps.push('Gas fuera del alcance GN estudiado; faltan tablas propias para ese gas.');
  return ps;
 }
 function prepararAccesorios(piezas,red,ts,ceros=[],pendientesCarga=[],opciones={}){
  const fisicas=new Map(),pendientes=[...pendientesCarga],ids=new Set(ts.map(t=>t.id));
  const ubicar=p=>[...new Set((p.ubicaciones||[]).flatMap(u=>ts.filter(t=>u===t.id||String(u).startsWith(t.id+' · accesorio ')||String(u).startsWith(t.id+' · cantidad manual')).map(t=>t.id)))];
  for(const p of piezas){
   if(!p.id||!Number.isSafeInteger(p.cantidad)||p.cantidad<=0){pendientes.push('Cantidad o identidad pendiente de una pieza; no se convierte a cero.');continue;}
   if(fisicas.has(p.id)){const anterior=fisicas.get(p.id);anterior.tramos=[...new Set([...anterior.tramos,...ubicar(p)])];if(anterior.tipo!==p.tipo||anterior.cantidad!==p.cantidad){anterior.conflicto=true;pendientes.push('Identidad física contradictoria: '+p.id+'.');}continue;}
   const tramos=ubicar(p);
   const pieza={id:p.id,tipo:p.tipo,cantidad:p.cantidad,nodo:p.nodoOriginal||null,tramos,confirmada:p.confirmado===true,conflicto:!!p.conflicto,reductor:!!p.reductor,equivalenteM:null};
   fisicas.set(p.id,pieza);
   if(p.conflicto)pendientes.push('Datos contradictorios de una pieza física: '+p.id+'.');
   if(p.tipo==='tee')pendientes.push(p.nodoOriginal?'Tee en '+p.nodoOriginal+': identificar vía directa/giro y configuración reductora.':'Tee informada sin punto confirmado; no se la ubica por suposición.');
   if(p.tipo==='llave')pendientes.push('Tipo real de llave pendiente; no se supone válvula macho, globo o esclusa.');
   if(p.tipo==='reduccion'||p.reductor)pendientes.push('Reducción: distinguir pieza independiente de accesorio reductor; materiales sí, equivalentes excluidos solo por método de clase.');
   if(!tramos.length&&!p.nodoOriginal)pendientes.push('Ubicación técnica pendiente de '+p.tipo+'; se conserva la cantidad conocida.');
  }
  const largo=Number.isFinite(opciones.largoComercial)&&opciones.largoComercial>0?opciones.largoComercial:null;
  for(const t of ts)if(!Array.isArray(t.segmentos)||!t.segmentos.length)pendientes.push('Cuplas de '+t.desde+'–'+t.hasta+': segmentos continuos pendientes; '+(largo?'largo comercial ya configurado '+largo+' m':'largo comercial pendiente')+'. No se suponen cero uniones.');
  return {estado:'preparado-sin-equivalentes',fisicas:[...fisicas.values()],ceros:ceros.filter(c=>c.cantidad===0&&ids.has(c.ubicacion)).map(c=>({tramo:c.ubicacion,tipo:c.tipo,cantidad:0})),pendientes:[...new Set(pendientes)],porTramo:ts.map(t=>({id:t.id,nombre:t.desde+'–'+t.hasta,metros:t.metros,conexion:red.orientacion[t.id]||null,consumoKcal:red.porTramo[t.id]??null,referencias:[...fisicas.values()].filter(p=>p.tramos.includes(t.id)).map(p=>p.id)})),largoComercial:largo,habilitado:false};
 }
 function resultadoPorTramo(ts,resultado,firmaActual,firmaResultado,{catalogoHabilitado=false,verificacionTecnica=false}={}){
  const valido=catalogoHabilitado===true&&verificacionTecnica===true&&resultado?.estado==='calculado'&&resultado.prueba===false&&resultado.verificacionTecnica===true&&resultado.catalogoHabilitado===true&&typeof firmaActual==='string'&&firmaActual===firmaResultado;
  return ts.map(t=>({tramo:t.desde+'–'+t.hasta,diametro:valido&&typeof resultado.diametros?.[t.id]==='string'?resultado.diametros[t.id]:'Pendiente',estado:valido&&resultado.diametros?.[t.id]?'Verificado':'Pendiente de verificación técnica'}));
 }
 const api={IDS,identificar,obtener,compatibilidad,prepararAccesorios,resultadoPorTramo};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.CatalogosSistemasGas=api;
})(globalThis);
