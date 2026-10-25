/* Fuentes independientes, preparación de accesorios y resultados. Ninguna habilitación. */
(function(root){
 const IDS={epoxi:'acero-epoxi-roscado-gn',sigas:'sigas',fusiogas:'fusiogas'};
 function identificar(perfil={}){
  if(perfil.catalogoTecnicoGas!==undefined)return Object.values(IDS).includes(perfil.catalogoTecnicoGas)?perfil.catalogoTecnicoGas:null;
  if(perfil.material==='Acero con revestimiento epoxi'&&perfil.sistema==='Roscado')return IDS.epoxi;
  if(String(perfil.material||'').trim().toLowerCase()==='sigas'||String(perfil.sistema||'').trim().toLowerCase()==='sigas')return IDS.sigas;
  return null;
 }
 function obtener(id,t3,t18,sigas=null,fusiogas=null){
  if(id===IDS.epoxi){
   const fuentesCorrectas=t3?.tabla===3&&t18?.tabla===18&&t3.procedencia?.sha256==='ce11e42467d7a4f4aa31b96c0ca83a3c97b5e6ae0cea0cf62cdb5db9f6e6d4f5'&&t18.procedencia?.sha256==='d9f541eb091f705c0dead916066da755f9cf2cb9a5f449be025f7dae2bad41a0';
   return {id,nombre:'Acero epoxi · roscado · GN',habilitado:false,origenConfirmadoPorPropietario:true,edicion:null,tablas:fuentesCorrectas?[t3,t18]:[],documentacion:'datos/catalogos/acero-epoxi/procedencia.json',pendientes:[...(fuentesCorrectas?[]:['Faltan las fuentes originales identificadas de acero epoxi o sus metadatos no coinciden.']),'Confirmar edición, aplicabilidad normativa, condiciones de suministro e interiores reales.','Resolver 7,67/7,65, redondeos y criterio de cuplas con documentación.']};}
  if(id===IDS.sigas&&sigas?.id==='sigas'&&sigas.fuente?.sha256==='a7dc5dd90adec7d9db335100407d4748f306281b3917e2e52a8f2b707d35e2b1')return {id,nombre:'SIGAS Thermofusión · ed.15 / 2025',habilitado:false,origenConfirmadoPorPropietario:true,edicion:sigas.fuente.edicion,tablas:[6,4,5,3].map(n=>sigas.tablas[n]),documentacion:'datos/catalogos/sigas/procedencia.json',fuente:sigas.fuente,pendientes:['Manual identificado: verificar criterios de cálculo, discrepancias del original, accesorios exactos y condiciones de suministro.','Las tablas SIGAS no habilitan ni utilizan equivalencias de acero epoxi.']};
  if(id===IDS.fusiogas)return {id,nombre:'FUSIOGAS Thermofusión · V.1.2026',habilitado:false,origenConfirmadoPorPropietario:true,edicion:fusiogas?.fuente?.edicion||null,tablas:fusiogas?.id==='fusiogas'&&fusiogas.fuente?.sha256==='727650ead31bf85522c8bd475bd759fdf6319c2f1a8e6bf1735124f0a93f57ed'?[fusiogas.tablas.GN,fusiogas.tablas.GLP]:[],fuente:fusiogas?.fuente,documentacion:'datos/catalogos/fusiogas/procedencia.json',pendientes:['FUSIOGAS: verificar método, discrepancias de equivalencias, variantes de productos, suministro y validación técnica independiente.','No se heredan tablas, interiores, accesorios ni exclusiones de otros sistemas.']};
  if(id===IDS.sigas)return {id,nombre:'SIGAS',habilitado:false,origenConfirmadoPorPropietario:false,edicion:null,tablas:[],documentacion:'datos/catalogos/sigas/procedencia.json',pendientes:['No se cargó un manual SIGAS identificado; no se usarán tablas de acero epoxi.','Faltan capacidades y equivalencias completas, familia exacta, edición, manual y condiciones del fabricante. No se utilizarán tablas de acero epoxi.']};
  return {id:null,nombre:'Sistema pendiente de seleccionar',habilitado:false,tablas:[],pendientes:['Elegí el catálogo del proyecto. No se asignan tablas por defecto.']};
 }
 function compatibilidad(perfil={},catalogo){
  const ps=[];
  if(catalogo.id===IDS.epoxi&&(perfil.material!=='Acero con revestimiento epoxi'||perfil.sistema!=='Roscado'))ps.push('El material y la unión guardados no coinciden exactamente con acero epoxi roscado. Se conservaron: revisalos en Datos de instalación.');
  if(catalogo.id===IDS.sigas&&((perfil.material==='Acero con revestimiento epoxi')||perfil.sistema==='Roscado'))ps.push('SIGAS está seleccionado, pero hay datos de acero epoxi/roscado guardados. Se conservaron sin trasladar sus tablas a SIGAS.');
  const admitido=catalogo.id===IDS.epoxi?['GN']:catalogo.id===IDS.sigas?['GN','propano-gaseoso']:catalogo.id===IDS.fusiogas?['GN','GLP']:[];
  if(!admitido.includes(perfil.gas))ps.push('Combustible sin tabla aplicable a este sistema: '+(perfil.gas||'Pendiente')+'. SIGAS Tabla 5 requiere propano gaseoso identificado; EPOXI no tiene tabla GLP incorporada.');
  if(catalogo.id===IDS.fusiogas&&((perfil.material&&perfil.material!=='Acero-polietileno FUSIOGAS Thermofusión')||(perfil.sistema&&perfil.sistema!=='Thermofusión')))ps.push('FUSIOGAS seleccionado con material/unión anteriores: se conservaron, revisalos sin trasladar tablas.');
  if(catalogo.id===IDS.sigas&&/FUSIOGAS/i.test(perfil.material||''))ps.push('Material FUSIOGAS guardado: no coincide con SIGAS.');
  return ps;
 }
 function prepararAccesorios(piezas,red,ts,ceros=[],pendientesCarga=[],opciones={}){
  const fisicas=new Map(),pendientes=[...pendientesCarga],ids=new Set(ts.map(t=>t.id));
  const ubicar=p=>[...new Set((p.ubicaciones||[]).flatMap(u=>ts.filter(t=>u===t.id||String(u).startsWith(t.id+' · accesorio ')||String(u).startsWith(t.id+' · cantidad manual')||u===t.desde+'–'+t.hasta||u===t.hasta+'–'+t.desde).map(t=>t.id)))];
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
 function largoDocumentado(id){return id===IDS.sigas?{metros:4,pagina:40,fuente:'fuentes/sigas-ed15-2025/manual-tecnico.pdf'}:id===IDS.fusiogas?{metros:4,pagina:28,fuente:'fuentes/fusiogas-v1-2026/manual-tecnico.pdf'}:null;}
 function resultadoPorTramo(ts,resultado,firmaActual,firmaResultado,{catalogoHabilitado=false,verificacionTecnica=false}={}){
  const valido=catalogoHabilitado===true&&verificacionTecnica===true&&resultado?.estado==='calculado'&&resultado.prueba===false&&resultado.verificacionTecnica===true&&resultado.catalogoHabilitado===true&&typeof firmaActual==='string'&&firmaActual===firmaResultado;
  return ts.map(t=>({tramo:t.desde+'–'+t.hasta,diametro:valido&&typeof resultado.diametros?.[t.id]==='string'?resultado.diametros[t.id]:'Pendiente',estado:valido&&resultado.diametros?.[t.id]?'Verificado':'Pendiente de verificación técnica'}));
 }
 // Conexiones son referencias a piezas existentes: nunca generan cantidades nuevas.
 function productosTerminales(sistema,sigas,fusiogas){
  const filas=sistema===IDS.sigas&&sigas?.id==='sigas'?sigas?.tablas?.[3]?.filas:sistema===IDS.fusiogas&&fusiogas?.id==='fusiogas'?fusiogas?.accesorios:[];
  return (filas||[]).filter(f=>/transici[oó]n|rosca/i.test(f.nombreOriginal)).map(f=>({...f,sistema}));
 }
 function tipoProductoCompatible(p,f){
  if(!p||!f)return false;
  if(p.tipo==='codo90')return /^Codo.*90/.test(f.nombreOriginal);
  if(p.tipo==='codo45')return /^Codo.*45/.test(f.nombreOriginal);
  const tipo=String(p.tipo).trim();
  if(!(['otro','transicion'].includes(tipo)||/^Transici[oó]n(?: |$)/i.test(tipo))||!/^Transici[oó]n/i.test(f.nombreOriginal))return false;
  if(/hembra/i.test(tipo)&&!/hembra/i.test(f.nombreOriginal)||/macho/i.test(tipo)&&!/macho/i.test(f.nombreOriginal))return false;
  return true;
 }
 function conexiones(red,ts,inventario,sistema,registros={},sigas=null,fusiogas=null){
  const extremos=[],intermedias=[],pendientes=[],productos=productosTerminales(sistema,sigas,fusiogas),usadas=new Set();
  const puntos=red.puntos||[],os=Object.entries(red.orientacion||{}),entradas=new Set(os.map(([,o])=>o.hasta));
  const grados=new Map(puntos.map(p=>[p.id,os.filter(([,o])=>o.desde===p.id||o.hasta===p.id).length]));
  for(const punto of puntos){
   const enlaces=os.filter(([,o])=>o.desde===punto.id||o.hasta===punto.id);
   const raiz=!entradas.has(punto.id)&&(punto.tipo==='medidor'||String(punto.nombre).trim().toLowerCase()==='m');
   const final=entradas.has(punto.id)&&!os.some(([,o])=>o.desde===punto.id);
   if(!raiz&&!final)continue;
   const id=punto.id,registro=registros?.[id],pieza=registro?(inventario.fisicas||[]).find(p=>p.id===registro.piezaId):null;
   const e={id,nombre:punto.nombre,rol:raiz?'medidor':punto.tipo==='artefacto'||punto.artefactoId||Number(red.porTramo?.[enlaces[0]?.[0]])>0?'artefacto':'extremo sin artefacto confirmado',tramos:enlaces.map(([id])=>id),piezaId:pieza?.id||null,producto:null,equivalenteM:null,estado:'pendiente',motivo:''};
   if(red.errores?.length||enlaces.length!==1)e.motivo='Red ambigua o extremo con varias conexiones: revisar antes de identificar la pieza.';
   else if(!registro)e.motivo=sistema===IDS.epoxi?'Identificar la conexión roscada real, sus medidas y la pieza ya registrada.':'Identificar la transición termofusión–rosca real: recta, codo u otra variante, medidas y pieza ya registrada.';
   else if(registro.sistema!==sistema)e.motivo='La identificación pertenece a otro sistema; se conserva sin reutilizar su equivalente.';
   else if(!pieza||pieza.cantidad!==1||pieza.confirmada!==true||pieza.conflicto)e.motivo='Seleccionar una pieza individual confirmada. Un grupo de varias piezas no identifica cuál está en el extremo.';
   else if(usadas.has(pieza.id)||Object.values(registros||{}).filter(r=>r?.piezaId===pieza.id).length>1)e.motivo='Esa pieza ya está vinculada a otro extremo; no se cuenta dos veces.';
   else if(!pieza.tramos?.some(id=>e.tramos.includes(id)))e.motivo='La pieza no pertenece al tramo del extremo; revisar ubicación.';
   else if(sistema===IDS.epoxi){e.motivo='Pieza roscada vinculada. Faltan producto, medidas y equivalencia aplicable verificados para acero epoxi.';e.estado='pieza vinculada';usadas.add(pieza.id);}
   else{const f=productos.find(f=>f.id===registro.productoId);
    if(!f||!tipoProductoCompatible(pieza,f))e.motivo='Elegir un producto terminal del mismo sistema compatible con el tipo declarado; no cambiar la cantidad ni convertir un codo en transición recta.';
    else{e.producto=f;e.equivalenteM=f.longitudEquivalenteM;e.estado='producto identificado';e.motivo='Equivalente documental; verificar medidas, diámetro candidato y condiciones de aplicación.';usadas.add(pieza.id);}
   }
   extremos.push(e);if(e.estado!=='producto identificado')pendientes.push(e.nombre+': '+e.motivo);
  }
  for(const pieza of inventario.fisicas||[]){const terminal=extremos.find(e=>e.piezaId===pieza.id&&['producto identificado','pieza vinculada'].includes(e.estado));
   const nodo=puntos.find(n=>n.id===pieza.nodo||String(n.nombre).trim().toLowerCase()===String(pieza.nodo||'').trim().toLowerCase());
   intermedias.push({piezaId:pieza.id,rol:terminal?'terminal':nodo&&grados.get(nodo.id)>1?'intermedia':'ubicación en el tramo pendiente',extremo:terminal?.id||null});
  }
  return {extremos,piezas:intermedias,productos,pendientes,agregadas:0};
 }
 const api={conexiones,productosTerminales,tipoProductoCompatible,IDS,identificar,obtener,compatibilidad,prepararAccesorios,largoDocumentado,resultadoPorTramo};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.CatalogosSistemasGas=api;
})(globalThis);
