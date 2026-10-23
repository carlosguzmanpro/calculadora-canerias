/* Sugerencias por conectividad. No interpreta imágenes ni dimensiona cañerías. */
(function(root){
 const normal=s=>String(s||'').trim().toLocaleLowerCase('es');
 function detectar({tramos=[],artefactos=[],nodos=[],inventario={},opciones={}}){
  const propuestas=[],avisos=[],mapa=new Map(),edges=[];
  if(tramos.some(t=>!t.id||!Number.isFinite(t.metros)||t.metros<=0)||new Set(tramos.map(t=>t.id)).size!==tramos.length)return {propuestas:[],avisos:['Revisá identificadores y longitudes positivas de los tramos.']};
  const extras=inventario.extras||[],porId=new Map((inventario.tramos||[]).map(t=>[t.id,t]));
  const get=(id,nombre,nodo=null)=>{if(!mapa.has(id))mapa.set(id,{id,nombre,nodo,entradas:[],salidas:[]});return mapa.get(id);};
  // Desde/Hasta son campos estructurados; nunca se separa el nombre visual.
  // Los IDs opcionales sólo desambiguan puntos compatibles con esos campos.
  function extremo(t,campo){
   const nombre=String(t[campo]||'').trim(),clave=normal(nombre);
   if(!clave){avisos.push('Tramo '+t.id+': falta '+(campo==='desde'?'Desde':'Hasta')+'.');return null;}
   const candidatos=nodos.filter(n=>normal(n.nombre)===clave);
   const ref=t.red?.[campo],referidos=ref?nodos.filter(n=>n.id===ref):[];
   if(referidos.length>1){avisos.push(nombre+': identificador de nodo duplicado; conexión pendiente.');return null;}
   const explicito=referidos[0];
   if(explicito&&normal(explicito.nombre)!==clave){avisos.push('Tramo '+t.id+': '+campo+' «'+nombre+'» contradice el nodo «'+explicito.nombre+'»; revisar esta conexión.');return null;}
   if(!explicito&&candidatos.length>1){avisos.push(nombre+': varios nodos tienen ese nombre; conexión pendiente de identificar.');return null;}
   if(ref&&!explicito)avisos.push('Tramo '+t.id+': referencia interna no disponible; se utilizó '+campo+' «'+nombre+'» guardado.');
   const nodo=explicito||candidatos[0]||null;
   return get(nodo?'n:'+nodo.id:'e:'+clave,nombre,nodo);
  }
  const pendientes=new Set(),nombresPendientes=new Set();
  for(const t of tramos){
   const a=extremo(t,'desde'),b=extremo(t,'hasta');
   if(!a||!b){for(const nombre of [t.desde,t.hasta])if(normal(nombre))nombresPendientes.add(normal(nombre));if(a)pendientes.add(a.id);if(b)pendientes.add(b.id);continue;}
   if(a===b||edges.some(e=>[e.a.id,e.b.id].includes(a.id)&&[e.a.id,e.b.id].includes(b.id))){avisos.push('Conexión circular o duplicada en '+t.desde+'–'+t.hasta+'. Revisá la red antes de detectar.');return {propuestas:[],avisos};}
   const e={t,a,b,datos:porId.get(t.id)||{}};edges.push(e);a.salidas.push(e);b.entradas.push(e);
  }
  for(const n of mapa.values())if(nombresPendientes.has(normal(n.nombre)))pendientes.add(n.id);
  const padre=new Map([...mapa.keys()].map(k=>[k,k]));const raiz=k=>{while(padre.get(k)!==k)k=padre.get(k);return k;};for(const e of edges){const a=raiz(e.a.id),b=raiz(e.b.id);if(a===b)return {propuestas:[],avisos:[...avisos,'Circuito cerrado: revisar conexiones antes de sugerir accesorios.']};padre.set(a,b);}
  const incidencias=n=>[...n.entradas,...n.salidas].sort((a,b)=>(a.b===n?0:1)-(b.b===n?0:1)||String(a.t.id).localeCompare(String(b.t.id)));
  const medidasNodo=n=>incidencias(n).map(e=>e.b===n?(e.datos.diametroFinal||e.t.diametro||null):(e.t.diametro||null));
  const piezasNodo=n=>[...edges.flatMap(e=>(e.datos.accesorios||[]).filter(a=>a.nodo&&(a.nodo===n.nodo?.id||a.nodo==='nombre:'+normal(n.nombre)))),...extras.filter(a=>a.nodo&&(a.nodo===n.nodo?.id||a.nodo==='nombre:'+normal(n.nombre)))];
  function agregar(id,tipo,ubicacion,datos,afectados){propuestas.push({id,tipo,ubicacion,...datos,firma:JSON.stringify({datos,afectados:afectados.map(e=>e.t).sort((a,b)=>String(a.id).localeCompare(String(b.id))),largo:tipo==='cupla'?opciones.largoComercial:null})});}
  for(const n of mapa.values()){
   const ies=incidencias(n),piezas=piezasNodo(n),nodo=n.nodo?.id||'nombre:'+normal(n.nombre),ds=medidasNodo(n);
   if(pendientes.has(n.id)){avisos.push(n.nombre+': accesorios pendientes por una conexión sin resolver.');continue;}
   if(n.nodo&&['medidor','artefacto'].includes(n.nodo.tipo)&&ies.length>1){avisos.push(n.nombre+': conexiones incompatibles con su tipo de punto; revisar manualmente.');continue;}
   if(ies.length>3){avisos.push(n.nombre+': más de tres conexiones; identificar manualmente la combinación de accesorios.');continue;}
   if(ies.length===3){
    if(!piezas.some(p=>p.tipo==='tee')){
     const conocidas=ds.every(Boolean),distintas=conocidas&&ds.some(d=>d!==ds[0]),inciertas=ies.some(e=>(e.datos.accesorios||[]).some(a=>a.tipo==='tee'&&(!a.nodo||String(a.nodo).startsWith('nombre:sin-identificar')))),ambiguas=nodos.filter(x=>normal(x.nombre)===normal(n.nombre)).length>1&&tramos.some(t=>(t.detalle?.accesorios||[]).some(a=>a.tipo==='tee'&&normal(a.nodo)===normal(n.nombre)));
     agregar('tee:'+n.id,'tee',n.nombre,{nodo,cantidad:1,medidas:ds,conexiones:ies.map(e=>e.t.desde+'–'+e.t.hasta),flujoDefinido:n.entradas.length===1&&n.salidas.length===2,requiereConfiguracion:distintas,reduccionesExistentes:piezas.some(p=>p.tipo==='reduccion'),salidas:ies.filter(e=>e.a===n).map(e=>({tramo:e.t.id,diametro:e.t.diametro,ubicacion:e.t.desde+'–'+e.t.hasta})),bloqueo:inciertas||ambiguas?'Hay una tee manual sin ubicación inequívoca; identificala para evitar duplicaciones.':distintas&&(n.entradas.length!==1||n.salidas.length!==2)?'Identificá entrada y salidas de la tee para asignar medidas.':null,configuracion:opciones.uniones?.[nodo]||'',motivo:'Tres conexiones: posible tee física. Vía de paso/giro y posición exacta requieren revisión; no se suman equivalentes.'},ies);
    }
   }else if(ies.length===2&&n.entradas.length===1&&n.salidas.length===1){
    if(ds.every(Boolean)&&ds[0]!==ds[1]){
     const cubierta=piezas.some(p=>p.tipo==='reduccion'||(p.medidas?.length>=2&&p.medidas[0]&&p.medidas[1]&&p.medidas[0]!==p.medidas[1]));
     if(!cubierta)agregar('reduccion:'+n.id,'reduccion',n.nombre,{nodo,cantidad:1,medidas:ds,configuracion:'',requiereConfiguracion:true,bloqueo:ies.some(e=>(e.datos.accesorios||[]).some(a=>!a.nodo&&(a.tipo==='reduccion'||(a.medidas?.[0]&&a.medidas?.[1]&&a.medidas[0]!==a.medidas[1]))))?'Hay un accesorio reductor sin posición confirmada; revisalo antes de añadir otro.':null,motivo:'Cambio de diámetro conocido. Confirmá reducción independiente o rechazá si un accesorio reductor ya lo resuelve.'},ies);
    }else if(ds.some(d=>!d))avisos.push(n.nombre+': diámetros pendientes; no se inventó una reducción.');
   }
  }
  for(const e of edges){
   const t=e.t,label=t.desde+'–'+t.hasta,acc=e.datos.accesorios||[],enExtremo=piezasNodo(e.b);
   const coincide=artefactos.filter(a=>normal(a.nombre)===normal(e.b.nombre));
   const esArtefacto=e.b.nodo?e.b.nodo.tipo==='artefacto'&&artefactos.some(a=>a.id===e.b.nodo.artefactoId):coincide.length===1||!!t.artefacto;
   if(e.b.salidas.length===0&&!esArtefacto)avisos.push(e.b.nombre+': artefacto no identificado inequívocamente; no se dedujo una llave.');
   const manualesTramo=extras.filter(a=>a.ubicacion===t.id||normal(a.ubicacion)===normal(label)||a.tramo===t.id);
   if(!pendientes.has(e.b.id)&&esArtefacto&&e.b.salidas.length===0&&e.b.entradas.length===1&&!t.llave&&!acc.some(a=>a.tipo==='llave')&&!enExtremo.some(a=>a.tipo==='llave')&&!manualesTramo.some(a=>a.tipo==='llave')){
    const dudosa=extras.some(a=>a.tipo==='llave'&&!a.nodo&&!a.tramo&&!edges.some(x=>a.ubicacion===x.t.id||normal(a.ubicacion)===normal(x.t.desde+'–'+x.t.hasta)));
    agregar('llave:'+t.id,'llave',label+' · '+(e.b.nodo?e.b.nombre:t.artefacto||e.b.nombre),{tramo:t.id,nodo:e.b.nodo?.id||'nombre:'+normal(e.b.nombre),cantidad:1,medidas:[t.diametro||null],bloqueo:e.b.nodo&&nodos.filter(n=>n.tipo==='artefacto'&&n.artefactoId===e.b.nodo.artefactoId).length>1?'Un artefacto está conectado en varios puntos; revisá la conexión antes de añadir llaves.':dudosa?'Hay una llave manual sin ubicación inequívoca; ubicala o rechazá esta sugerencia para evitar duplicarla.':null,motivo:'Posible llave de paso del artefacto. Confirmar existencia, tipo y ubicación; no es una exigencia normativa verificada.'},[e]);
   }
   if(!t.detalle||!['ninguno','completo'].includes(t.detalle.estado))avisos.push(label+': codos, curvas y posiciones pendientes; no se dedujeron del nombre.');
   const ss=e.datos.segmentos,L=opciones.largoComercial??6,grupos=new Map();
   let bloqueo=null;
   if(!Array.isArray(ss)||!ss.length)bloqueo='Faltan segmentos continuos entre accesorios. Completalos en la carga manual; pendiente no significa cero.';
   else if(!(Number.isFinite(L)&&L>0)||ss.some(s=>!Number.isFinite(s.metros)||s.metros<0)||Math.abs(ss.reduce((a,s)=>a+s.metros,0)-t.metros)>1e-8)bloqueo='Revisá largo comercial y suma de segmentos.';
   if(bloqueo)grupos.set(t.diametro||'',null);
   else for(const s of ss){const diam=s.diametro||t.diametro||'';grupos.set(diam,(grupos.get(diam)||0)+Math.max(0,Math.ceil(s.metros/L)-1));}
   for(const [diam,cantidad]of grupos){
    const existentes=[...acc,...manualesTramo].filter(a=>a.tipo==='cupla');
    if(existentes.some(a=>a.medidas?.includes(diam)&&diam))continue;
    const sinUbicar=extras.some(a=>a.tipo==='cupla'&&!a.nodo&&!a.tramo&&!edges.some(x=>a.ubicacion===x.t.id||normal(a.ubicacion)===normal(x.t.desde+'–'+x.t.hasta)));
    agregar('cupla:'+JSON.stringify([t.id,diam]),'cupla',label,{tramo:t.id,cantidad,medidas:[diam||null],bloqueo:bloqueo||(existentes.length||sinUbicar?'Hay cuplas manuales cuya correspondencia debe revisarse antes de agregar otras.':null),motivo:'Uniones de cada segmento continuo a largo comercial '+L+' m. No cuenta conexiones de codos/tees como cuplas ni supone reutilizar todos los sobrantes.'},[e]);
   }

  }
  return {propuestas,avisos:[...new Set(avisos)],conexiones:edges.map(e=>({tramo:e.t.id,desde:e.a.id,hasta:e.b.id}))};
 }
 const api={detectar};root.DetectorGas=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

function datosDeteccionGas(){const p=proyectoGasActual();if(!p.deteccionGas||typeof p.deteccionGas!=='object')p.deteccionGas={activa:false,registros:{}};if(!p.deteccionGas.registros)p.deteccionGas.registros={};return p.deteccionGas;}
function actualizarSugerenciasGas(){
 if(modulo!=='gas'||!proyectoGasActual().deteccionGas?.activa)return;
 const d=datosDeteccionGas(),base=entradaMaterialesGas('proyecto',true),opciones={...opcionesMaterialesGas('proyecto'),uniones:{...datosPlanGas().opciones.uniones}},r=DetectorGas.detectar({tramos,artefactos,nodos:instalacionGas.nodos,inventario:base,opciones});
 for(const a of Object.values(d.registros))a.vigente=false;
 for(const p of r.propuestas){
  // Conservar decisiones del detector anterior por nombres, sólo si las mismas
  // conexiones identifican inequívocamente la misma pieza. El registro viejo
  // queda de respaldo; una confirmación afectada debe revisarse nuevamente.
  if(!d.registros[p.id]&&p.conexiones){
   const iguales=Object.values(d.registros).filter(a=>a.propuesta.tipo===p.tipo&&a.propuesta.nodo==='nombre:'+String(p.ubicacion).trim().toLocaleLowerCase('es')&&JSON.stringify([...(a.propuesta.conexiones||[])].sort())===JSON.stringify([...p.conexiones].sort()));
   if(iguales.length===1)d.registros[p.id]={...iguales[0],edicion:{...iguales[0].edicion}};
  }
  const a=d.registros[p.id];if(!a)d.registros[p.id]={propuesta:p,edicion:{},estado:'sugerido',vigente:true};else{if(a.propuesta.firma!==p.firma&&a.estado==='confirmado'&&(p.tipo==='cupla'||!mismaSugerenciaConGeometriaGas(a.propuesta.firma,p.firma)))a.estado='revisar';a.propuesta=p;a.vigente=true;}}
 d.avisos=r.avisos;renderSugerenciasGas();
}
function detectarAccesoriosGas(){if(modulo!=='gas')return;asegurarIdsGas();datosDeteccionGas().activa=true;actualizarSugerenciasGas();guardarDatos();$('panelDeteccionGas').classList.remove('oculto');if($('panelDeteccionGas').scrollIntoView)$('panelDeteccionGas').scrollIntoView({block:'start'});}
function accesorioSugeridoGas(a){return {...a.propuesta,...a.edicion};}
function accesoriosDeteccionConfirmadosGas(){
 const d=proyectoGasActual().deteccionGas;if(!d?.activa)return [];
 const out=[];
 for(const a of Object.values(d.registros||{})){
  if(!a.vigente||a.estado!=='confirmado')continue;const p=accesorioSugeridoGas(a);
  const extra={idFisico:'deteccion:'+p.id,tipo:p.tipo,cantidad:p.cantidad,nodo:p.nodo,tramo:p.tramo,medidas:p.medidas.every(Boolean)?p.medidas:[],ubicacion:p.ubicacion,confirmado:true,evidencia:'Sugerencia SIN IA confirmada por el usuario. '+p.motivo};
  if(p.tipo==='tee'&&p.configuracion==='tee-igual-reduccion'){
   extra.medidas=[p.medidas[0],p.medidas[0],p.medidas[0]];
   for(const [i,s]of (p.salidas||[]).entries())if(p.medidas[i+1]&&p.medidas[i+1]!==p.medidas[0])out.push({idFisico:extra.idFisico+':reduccion:'+s.tramo,tipo:'reduccion',cantidad:1,nodo:p.nodo,tramo:s.tramo,medidas:[p.medidas[0],p.medidas[i+1]],ubicacion:p.ubicacion+' · salida a '+s.ubicacion,confirmado:true,evidencia:'Reducción de salida confirmada junto a tee igual; no se suma a equivalentes.'});
  }
  if(Number.isInteger(extra.cantidad)&&extra.cantidad>0)out.push(extra);
 }
 return out;
}
function unionesDeteccionConfirmadasGas(){
 const out={},d=proyectoGasActual().deteccionGas;if(!d?.activa)return out;for(const a of Object.values(d?.registros||{})){if(!a.vigente||a.estado!=='confirmado')continue;const p=accesorioSugeridoGas(a);if(p.tipo==='tee'&&p.configuracion)out[p.nodo]=p.configuracion;if(p.tipo==='reduccion')out[p.nodo]='reduccion';}return out;
}
function resolverSugerenciaGas(id,accion,edicion){
 const d=datosDeteccionGas(),a=d.registros[id];if(!a?.vigente)return;
 const p={...accesorioSugeridoGas(a),...edicion};
 const cantidadMedidas={tee:3,reduccion:2,llave:1,cupla:1}[p.tipo];p.medidas=Array.from({length:cantidadMedidas},(_,i)=>p.medidas?.[i]||null);edicion={...edicion,medidas:p.medidas};
 const requiereUnion=p.tipo==='reduccion'||(p.tipo==='tee'&&p.medidas.every(Boolean)&&p.medidas.some(m=>m!==p.medidas[0]));
 if(accion==='confirmado'&&p.medidas.some((m,i)=>m&&a.propuesta.medidas[i]&&m!==a.propuesta.medidas[i])){$('deteccionMensaje').textContent='La medida corregida no coincide con el diámetro conocido del tramo. Corregí el dato de origen antes de confirmar.';return;}
 if(accion==='confirmado'&&p.tipo==='tee'&&p.configuracion&&!p.flujoDefinido){$('deteccionMensaje').textContent='Identificá la entrada y las dos salidas de la tee antes de asignar una configuración reductora.';return;}
 const opcionPrevia=datosPlanGas().opciones.uniones?.[p.nodo];
 if(accion==='confirmado'&&p.configuracion&&opcionPrevia&&opcionPrevia!==p.configuracion){$('deteccionMensaje').textContent='Ya hay otra solución manual en esta unión. Revisala en el plan de compra antes de confirmar.';return;}
 if((p.cantidad!==null&&(!Number.isInteger(p.cantidad)||p.cantidad<0))||(accion==='confirmado'&&p.cantidad===null)){$('deteccionMensaje').textContent='Ingresá una cantidad entera; pendiente no es cero.';return;}
 if(accion==='confirmado'&&(p.bloqueo||(p.tipo==='tee'&&p.configuracion==='tee-igual-reduccion'&&p.reduccionesExistentes)||(['tee','reduccion'].includes(p.tipo)&&p.cantidad!==1)||requiereUnion&&!(p.tipo==='tee'?['tee-reductora','tee-igual-reduccion']:['reduccion']).includes(p.configuracion)||(p.tipo==='tee'&&p.configuracion&&!p.medidas.every(Boolean)))){$('deteccionMensaje').textContent=p.bloqueo||(p.reduccionesExistentes?'Hay reducciones manuales en esta unión. Revisá su asociación antes de sumar otras piezas.':null)||'Confirmá la solución de la unión; una sugerencia de tee/reducción representa una pieza física.';return;}
 a.edicion={...a.edicion,...edicion};a.estado=accion;guardarDatos();generarPlanGas('proyecto');renderSugerenciasGas();$('deteccionMensaje').textContent=accion==='confirmado'?'Confirmado para materiales. Las medidas desconocidas siguen pendientes.':accion==='rechazado'?'Rechazado; se conserva tu decisión.':'Correcciones conservadas. Falta confirmar para incorporar.';
}
function renderSugerenciasGas(){
 const panel=$('panelDeteccionGas'),out=$('deteccionFilas');if(!panel||!out)return;out.replaceChildren();const d=proyectoGasActual().deteccionGas;
 panel.classList.toggle('oculto',!d?.activa);if(!d?.activa)return;
 const texto=(t,padre=out)=>{const p=document.createElement('p');p.textContent=textoMaterialPantallaGas(t);padre.append(p);};
 if(d.avisos?.length){const avisos=document.createElement('details'),sum=document.createElement('summary');avisos.className='gas-detalles';sum.textContent='Ver observaciones pendientes ('+d.avisos.length+')';avisos.append(sum);for(const aviso of avisosDeteccionPresentacionGas(d.avisos))texto(aviso,avisos);out.append(avisos);}
 for(const [id,a]of Object.entries(d.registros||{})){
  const p=accesorioSugeridoGas(a),card=document.createElement('div');card.className='detalle gas-sugerencia';out.append(card);
  const detalles=document.createElement('details'),sum=document.createElement('summary');detalles.className='gas-detalles';sum.textContent='Ver detalles técnicos';detalles.append(sum);
  texto(({'tee':'Tee','llave':'Llave de paso','cupla':'Cuplas','reduccion':'Reducción'}[p.tipo]||p.tipo)+' · '+p.ubicacion+' · '+(!a.vigente?'RESPALDO: YA NO PROCEDE':a.estado==='rechazado'?'RECHAZADO':p.bloqueo||p.cantidad===null?'PENDIENTE':a.estado.toUpperCase()+(a.estado==='confirmado'&&p.medidas.some(m=>!m)?' · MEDIDAS PENDIENTES':'')),card);if(a.vigente&&a.estado==='confirmado')texto('Accesorio confirmado · Revisión técnica pendiente (diámetros y conexiones).',card);texto(p.motivo,detalles);if(p.bloqueo)texto(p.bloqueo,card);
  if(Object.hasOwn(a.edicion,'cantidad')&&a.edicion.cantidad!==a.propuesta.cantidad)texto('Cantidad calculada actual: '+(a.propuesta.cantidad??'PENDIENTE')+'. Corrección manual conservada: '+(a.edicion.cantidad??'PENDIENTE')+'. Revisar antes de confirmar.',card);
  if(a.edicion.medidas&&JSON.stringify(a.edicion.medidas)!==JSON.stringify(a.propuesta.medidas))texto('Medidas actuales de los tramos: '+a.propuesta.medidas.map(m=>m||'Pendiente').join(' / ')+'. Las correcciones ingresadas se conservan abajo.',card);
  const label=document.createElement('label'),qty=document.createElement('input');label.textContent='Cantidad · vacío = pendiente';qty.type='number';qty.min='0';qty.step='1';qty.disabled=!a.vigente;qty.value=p.cantidad??'';label.append(qty);card.append(label);
  const lm=document.createElement('label'),med=document.createElement('input');lm.textContent='Diámetros · separar con →';texto((p.conexiones?'Orden: '+p.conexiones.join(' | ')+'. ':'')+'Vacío = pendiente. No se deduce paso ni giro.',detalles);med.value=(p.medidas||[]).map(x=>x||'').join(' → ');med.disabled=!a.vigente;lm.append(med);card.append(lm);
  const cfg=document.createElement('select');cfg.disabled=!a.vigente;if(p.tipo==='tee'||p.requiereConfiguracion){const lc=document.createElement('label');lc.textContent='Solución física de la unión';for(const [v,t]of [['','Pendiente: revisar'],...(p.tipo==='tee'?[['tee-reductora','Una tee reductora integrada'],['tee-igual-reduccion','Tee igual y reducciones independientes']]:[['reduccion','Una reducción independiente']])]){const o=document.createElement('option');o.value=v;o.textContent=t;cfg.append(o);}cfg.value=p.configuracion||'';lc.append(cfg);card.append(lc);}
  card.append(detalles);
  const acciones=document.createElement('div');acciones.className='gas-acciones';card.append(acciones);
  const respuesta=document.createElement('p');respuesta.role='status';respuesta.ariaLive='polite';respuesta.textContent='';card.append(respuesta);
  for(const [accion,titulo]of [['sugerido','Guardar correcciones'],['confirmado','Confirmar sugerencia'],['rechazado','Rechazar']]){const b=document.createElement('button');b.className='alt';b.textContent=titulo;b.disabled=!a.vigente;b.onclick=()=>{resolverSugerenciaGas(id,accion,{cantidad:qty.value===''?null:Number(qty.value),medidas:med.value.split(/\s*(?:→|->)\s*/).map(x=>x.trim()||null),configuracion:cfg.value||p.configuracion||''});respuesta.textContent=$('deteccionMensaje').textContent;};acciones.append(b);}
 }
}

function etiquetaAccesorioDetectadoGas(f){
 const d=proyectoGasActual().deteccionGas;if(f.tipo!=='tee'||!d?.activa)return f.material;
 return Object.values(d.registros||{}).some(a=>a.vigente&&a.estado==='confirmado'&&a.propuesta.nodo===f.nodo&&JSON.stringify(accesorioSugeridoGas(a).medidas)===JSON.stringify(f.medidas)&&accesorioSugeridoGas(a).configuracion==='tee-reductora')?'Tee reductora':f.material;
}

function calcularMaterialesConSugerenciasGas(){calcularMateriales();if(modulo==='gas'&&proyectoGasActual().deteccionGas?.activa)generarPlanGas('proyecto');}
function avisoDeteccionGas(){
 const d=proyectoGasActual().deteccionGas;if(!d?.activa)return '';
 const pendientes=Object.values(d.registros||{}).filter(a=>a.vigente&&['sugerido','revisar'].includes(a.estado)).length;
 return pendientes?'Detección SIN IA: '+pendientes+' sugerencias sin confirmar o por revisar. No están incorporadas como piezas confirmadas; la lista requiere revisión.':'';
}
