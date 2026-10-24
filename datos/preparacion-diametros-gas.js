/* Preparación de datos, sin tablas nuevas, sin habilitación técnica ni escrituras. */
(function(root){
 const positivo=x=>typeof x==='number'&&Number.isFinite(x)&&x>0;
 const unicos=xs=>[...new Set(xs)];
 function inventario(t3,t18,validar){
  const revision=validar(t3,t18);
  return {estado:'pendiente',habilitado:false,tablas:[t3,t18].filter(Boolean).map(t=>({numero:t.tabla,titulo:t.titulo,archivo:t.procedencia?.archivo||null,sha256:t.procedencia?.sha256||null,edicion:t.procedencia?.edicion||null,fotografiaDisponible:t.procedencia?.fotografiaDisponible===true,aplicabilidadVerificada:t.procedencia?.aplicabilidadVerificada===true,unidades:t.tabla===3?{longitud:t.unidadLongitud,capacidad:t.unidadCapacidad}:{diametro:t.unidadDiametro,equivalente:t.unidadEquivalente},valores:t.tabla===3?revision.capacidades:(t.complemento||[]).reduce((s,f)=>s+(f.equivalentesM||[]).filter(positivo).length,0)})),errores:revision.errores,pendientes:revision.pendientes,alcanceEstudiado:{pais:'AR',uso:'domiciliario',gas:'GN',material:'Acero con revestimiento epoxi',sistema:'Roscado',aplicabilidadVerificada:false},otrosSistemas:'Sin tablas incorporadas para otros materiales, sistemas o GLP.'};
 }
 // Contrato futuro: la evidencia de alcance es independiente de las filas numéricas.
 // No se acepta este contrato desde respaldos ni se activa ningún paquete aquí.
 function revisarPaquete(p,perfil,validarMotor){
  const faltantes=[],a=p?.alcance||{},c=p?.condiciones||{},v=p?.verificacion||{};
  for(const k of ['pais','uso','gas','material','sistema','provincia','localidad','distribuidora'])if(typeof a[k]!=='string'||!a[k].trim()||a[k]!==perfil?.[k])faltantes.push('Alcance no verificado o diferente: '+k+'.');
  for(const k of ['fuente','edicion','fabricante','documentacionInteriores','metodo','fuenteRedondeo','fuenteCuplas','fuentePiezas'])if(typeof p?.[k]!=='string'||!p[k].trim())faltantes.push('Documentación pendiente: '+k+'.');
  for(const k of ['aplicabilidad','vigencia','interiores','unidades','redondeo','piezas','cuplas','ejercicios'])if(v[k]!==true)faltantes.push('Verificación pendiente: '+k+'.');
  if(!p?.id||p.soloPruebas||p.datos?.soloPruebas||p.datos?.diagnosticoEducativo)faltantes.push('Paquete sin identidad técnica o reservado para ensayo.');
  if(p?.unidades?.capacidad!=='m3/h'||p?.unidades?.longitud!=='m'||p?.unidades?.presion!=='Pa'||p?.unidades?.diametroInterior!=='mm')faltantes.push('Unidades del adaptador pendientes: m3/h, m, Pa y mm interiores.');
  if(perfil?.unidadPresion!=='Pa')faltantes.push('Presiones del proyecto en Pa pendientes.');
  for(const k of ['presionDisponible','presionMinima','perdidaMaxima','poderCalorifico','densidadRelativa'])if(!(typeof perfil?.[k]==='string'&&perfil[k].trim()&&positivo(Number(perfil[k]))))faltantes.push('Condición del proyecto pendiente: '+k+'.');
  for(const k of ['fuenteGas','fuentePresiones','referenciaNormativa'])if(typeof perfil?.[k]!=='string'||!perfil[k].trim())faltantes.push('Fuente del proyecto pendiente: '+k+'.');
  if(!positivo(c.presionMinPa)||!positivo(c.presionMaxPa)||c.presionMaxPa<c.presionMinPa||Number(perfil?.presionDisponible)<c.presionMinPa||Number(perfil?.presionDisponible)>c.presionMaxPa)faltantes.push('Presión fuera de alcance o rango no documentado.');
  if(!positivo(c.densidadRelativa)||Number(perfil?.densidadRelativa)!==c.densidadRelativa)faltantes.push('Densidad relativa fuera de alcance.');
  if(Number(perfil?.presionDisponible)<=Number(perfil?.presionMinima)||Number(perfil?.perdidaMaxima)>Number(perfil?.presionDisponible)-Number(perfil?.presionMinima))faltantes.push('Presupuesto de presión incompatible.');
  if(p?.metodo!==p?.datos?.metodo||p?.datos?.material!==a.material||p?.datos?.sistema!==a.sistema||p?.datos?.gas!==a.gas||p?.datos?.condiciones?.densidadRelativa!==c.densidadRelativa||p?.datos?.condiciones?.presionMinPa!==c.presionMinPa||p?.datos?.condiciones?.presionMaxPa!==c.presionMaxPa)faltantes.push('El adaptador numérico no coincide con el alcance declarado.');
  if(typeof validarMotor!=='function')faltantes.push('Falta validar el adaptador del motor.');
  else faltantes.push(...validarMotor(p?.datos,false));
  return unicos(faltantes);
 }
 function seleccionar(paquetes,perfil,validarMotor){
  const revisiones=(paquetes||[]).map(p=>({id:p?.id||null,faltantes:revisarPaquete(p,perfil,validarMotor),paquete:p}));
  const compatibles=revisiones.filter(r=>!r.faltantes.length);
  return {catalogo:compatibles.length===1?compatibles[0].paquete.datos:null,estado:compatibles.length===1?'compatible':compatibles.length>1?'ambiguo':'pendiente',revisiones:revisiones.map(({id,faltantes})=>({id,faltantes}))};
 }
 function prepararRed(red,ts,perfil={}){
  const errores=[...red.errores],pendientes=[...red.faltantes],ids=new Set(),mapa=new Map();
  for(const t of ts){if(!t.id||ids.has(t.id))errores.push('Identificador de tramo faltante o duplicado.');ids.add(t.id);mapa.set(t.id,t);if(!positivo(t.metros))errores.push('Longitud positiva pendiente en '+t.desde+'–'+t.hasta+'.');}
  const pcs=typeof perfil.poderCalorifico==='string'&&perfil.poderCalorifico.trim()&&positivo(Number(perfil.poderCalorifico))&&typeof perfil.fuenteGas==='string'&&perfil.fuenteGas.trim()?Number(perfil.poderCalorifico):null;
  for(const [k,nombre]of Object.entries({material:'material de la cañería',sistema:'sistema de unión',provincia:'provincia',localidad:'localidad',distribuidora:'distribuidora',densidadRelativa:'densidad relativa',unidadPresion:'unidad de presión',presionDisponible:'presión disponible',presionMinima:'presión mínima de los artefactos',perdidaMaxima:'pérdida admisible',fuentePresiones:'fuente de presiones',referenciaNormativa:'método y referencia normativa'}))if(typeof perfil[k]!=='string'||!perfil[k].trim())pendientes.push('Dato técnico del proyecto pendiente: '+nombre+'.');
  if(perfil.pais!=='AR'||perfil.uso!=='domiciliario'||perfil.gas!=='GN')pendientes.push('El motor actual estudia solamente Argentina / domiciliario / GN; otros perfiles necesitan método y tablas propios.');
  if(!pcs)pendientes.push('Poder calorífico y fuente del proyecto pendientes; no se aplica 9300 automáticamente.');
  const caudal=q=>pcs&&positivo(q)?q/pcs:null;
  const puntos=new Map(red.puntos.map(p=>[p.id,p])),salidas=new Map(),entradas=new Map();
  for(const [id,o]of Object.entries(red.orientacion)){if(!mapa.has(id))continue;if(!salidas.has(o.desde))salidas.set(o.desde,[]);salidas.get(o.desde).push({id,...o});entradas.set(o.hasta,o);}
  const raices=[...salidas.keys()].filter(id=>!entradas.has(id));if(raices.length!==1||!ts.length)errores.push('Recorrido único desde el medidor pendiente.');
  const recorridos=[];
  if(!errores.length){
   const pila=[{id:raices[0],tramos:[],longitudReal:0}];
   while(pila.length){const r=pila.pop();if(r.tramos.length>ts.length){errores.push('Circuito cerrado; recorridos pendientes.');break;}
    const hijos=salidas.get(r.id)||[];
    if(!hijos.length){const ultimo=r.tramos[r.tramos.length-1],q=red.porTramo[ultimo]??null;recorridos.push({artefacto:puntos.get(r.id)?.nombre||'Pendiente',tramos:r.tramos,longitudReal:r.longitudReal,consumoKcal:q,caudal:caudal(q),longitudEquivalente:null,longitudDefinitiva:null,diametro:null});}
    else for(const e of hijos)pila.push({id:e.hasta,tramos:[...r.tramos,e.id],longitudReal:r.longitudReal+mapa.get(e.id).metros});
   }
  }
  for(const [id,hijos]of salidas)if(hijos.length>1)pendientes.push('Derivación '+(puntos.get(id)?.nombre||'Pendiente')+': verificar pieza física y vía de paso/giro; no se infieren del nombre.');
  pendientes.push('Equivalentes pendientes: reutilizar cantidades conocidas; verificar tipos de válvulas y vías de tees. Para cuplas hacen falta segmentos continuos y largo comercial, sin repetir la carga de cantidades.');
  if(recorridos.some(r=>!positivo(r.longitudReal)))errores.push('Longitud total de recorrido fuera de rango.');
  return {estado:'preparacion',listoParaDimensionar:false,diametros:null,errores:unicos(errores),pendientes:unicos(pendientes),avisos:red.avisos,recorridos:errores.length?[]:recorridos.sort((a,b)=>b.longitudReal-a.longitudReal||a.artefacto.localeCompare(b.artefacto)),porTramo:ts.filter(t=>!red.excluidos.includes(t.id)).map(t=>({id:t.id,nombre:t.desde+'–'+t.hasta,longitudReal:t.metros,consumoKcal:errores.length?null:red.porTramo[t.id]??null,caudal:errores.length?null:caudal(red.porTramo[t.id]),diametro:null})),poderCalorifico:pcs};
 }
 function prepararEntradaMotor(red,ts,arts,inst){
  const faltantes=[...red.errores,...red.faltantes];
  if(faltantes.length)return {entrada:null,faltantes};
  const orientacion=red.orientacion,usados=ts.filter(t=>orientacion[t.id]&&!red.excluidos.includes(t.id)),entradas=new Set(Object.values(orientacion).map(o=>o.hasta)),salidas=new Set(Object.values(orientacion).map(o=>o.desde));
  const raices=[...salidas].filter(id=>!entradas.has(id));if(raices.length!==1)return {entrada:null,faltantes:['Medidor único pendiente.']};
  const formales=new Map(inst.nodos.map(n=>['id:'+n.id,n])),artefactos=[];
  const nodos=red.puntos.map(p=>{
   const original=formales.get(p.id)||{},n={...original,id:p.id,nombre:p.nombre};
   if(p.id===raices[0])n.tipo='medidor';
   else if(salidas.has(p.id))n.tipo='derivacion'; // Tipo de punto, nunca tipo de pieza/tee.
   else{
    n.tipo='artefacto';const t=usados.find(t=>orientacion[t.id].hasta===p.id),q=t?red.porTramo[t.id]:null;
    const id='GAS-artefacto:'+p.id;n.artefactoId=id;
    if(positivo(q))artefactos.push({id,nombre:p.nombre,consumo:q});else faltantes.push('Consumo conocido pendiente en '+p.nombre+'.');
   }
   return n;
  });
  const lista=usados.map(t=>{
   const o=orientacion[t.id],a=red.puntos.find(p=>p.id===o.desde),b=red.puntos.find(p=>p.id===o.hasta),redNueva={desde:o.desde,hasta:o.hasta};
   if(t.red&&('id:'+t.red.desde===o.desde||t.red.desde===o.desde)&&t.red.via)redNueva.via=t.red.via;
   else if(t.red?.via)faltantes.push(t.desde+'–'+t.hasta+': vía de tee no trasladada sin confirmar su extremo de origen.');
   const copia=JSON.parse(JSON.stringify(t));
   if(o.invertido&&copia.detalle?.estado==='completo'){
    // No invertir medidas/posiciones técnicas por suposición. La geometría original queda en el proyecto.
    copia.detalle={estado:'pendiente',accesorios:[]};faltantes.push(t.desde+'–'+t.hasta+': revisar adaptación del detalle al sentido desde el medidor; cantidades conservadas por separado.');
   }
   return {...copia,desde:a.nombre,hasta:b.nombre,red:redNueva};
  });
  return {entrada:{tramos:lista,artefactos,instalacion:{version:1,perfil:{...inst.perfil},nodos}},faltantes};
 }
 const api={inventario,revisarPaquete,seleccionar,prepararRed,prepararEntradaMotor};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.PreparacionDiametrosGas=api;
})(globalThis);
