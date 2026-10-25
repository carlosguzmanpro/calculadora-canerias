/* Planificación física, sin dimensionamiento ni equivalentes normativos. */
(function(root){
 const valido=n=>Number.isFinite(n)&&n>0;
 const nombre=t=>({codo90:'Codo 90°',codo45:'Codo 45°',tee:'Tee',reduccion:'Reducción independiente',llave:'Llave de paso',cupla:'Cupla'}[t]||t);
 function planificarCortes(segmentos,{largoComercial=6,reutilizar=false,minimoSobrante=.5}={}){
  if(!valido(largoComercial)||!Number.isFinite(minimoSobrante)||minimoSobrante<0)throw Error('Largo comercial positivo y sobrante mínimo no negativo.');
  const barras=[],piezas=[],porSegmento={};let total=0;
  for(const s of segmentos){
   if(!s||!s.id||Object.hasOwn(porSegmento,s.id)||!valido(s.metros))throw Error('Segmentos con identificadores únicos y longitudes positivas.');
   total+=s.metros;const enteras=Math.floor(s.metros/largoComercial),resto=s.metros-enteras*largoComercial;
   if(piezas.length+enteras+(resto>0?1:0)>10000)throw Error('Plan demasiado grande; revisá unidades y largo comercial.');
   porSegmento[s.id]={metros:s.metros,piezas:[],cuplas:0,ubicacion:s.ubicacion||s.id};
   for(let i=0;i<enteras;i++)piezas.push({segmento:s.id,metros:largoComercial});
   if(resto>0)piezas.push({segmento:s.id,metros:resto});
  }
  // Propuesta FFD: cortes ordenados por longitud; nunca unir sobrantes para fabricar una pieza.
  piezas.sort((a,b)=>b.metros-a.metros||a.segmento.localeCompare(b.segmento));
  for(const pieza of piezas){
   let b=reutilizar?barras.find(b=>b.sobrante>=minimoSobrante&&b.sobrante>=pieza.metros):null;
   if(!b){b={id:'barra-'+(barras.length+1),metros:largoComercial,cortes:[],sobrante:largoComercial};barras.push(b);}
   b.cortes.push({...pieza});b.sobrante-=pieza.metros;
   porSegmento[pieza.segmento].piezas.push({barra:b.id,metros:pieza.metros});
  }
  for(const s of Object.values(porSegmento))s.cuplas=Math.max(0,s.piezas.length-1);
  return {metros:total,minimoTeorico:Math.ceil(total/largoComercial),compraEstimada:barras.length,cuplasPropuestas:Object.values(porSegmento).reduce((n,s)=>n+s.cuplas,0),barras,porSegmento,sobrantes:barras.filter(b=>b.sobrante>0).map(b=>({barra:b.id,metros:b.sobrante,reutilizable:reutilizar&&b.sobrante>=minimoSobrante})),garantiaOptimo:false};
 }
 function planificarMateriales(entrada,opciones={}){
  const config={largoComercial:6,reutilizar:false,minimoSobrante:.5,hipotesisSinPosiciones:false,...opciones};
  const reglaReducciones=/epoxi/i.test(entrada.material||'')&&entrada.sistema==='Roscado'?'Excluida del método de clase; no significa pérdida nula':'Equivalente pendiente según producto y sistema; no se aplica la exclusión de acero epoxi';
  if(!valido(config.largoComercial)||!Number.isFinite(config.minimoSobrante)||config.minimoSobrante<0)throw Error('Configuración de caños inválida.');
  const ts=entrada.tramos||[],nodos=entrada.nodos||[],filas=[],avisos=[],grupos=new Map(),fisicos=new Map(),ubicaciones=new Map();
  const fila=(f)=>{const r={id:'material-'+filas.length,unidad:'unidad',estado:'estimado',revisado:false,...f};filas.push(r);return r;};
  const medidas=a=>{const ds=a.medidas?.filter(Boolean)||[];return ds.length?(a.tipo!=='tee'&&a.tipo!=='reduccion'&&ds.every(d=>d===ds[0])?ds[0]:ds.join(' / ')):'Pendiente';};
  function agregarAccesorio(a,t){
   if(!a||typeof a.tipo!=='string'||!a.tipo.trim()||!Number.isInteger(a.cantidad)||a.cantidad<=0)throw Error('Accesorio identificado necesita nombre y cantidad entera positiva.');
   const id=a.tipo==='tee'&&a.nodo?'tee:'+a.nodo:a.idFisico||null;
   const requiere=a.tipo==='tee'?3:a.tipo==='reduccion'?2:1,tieneMedidas=Array.isArray(a.medidas)&&a.medidas.length>=requiere&&a.medidas.every(m=>typeof m==='string'&&m.trim());
   const f={material:a.nombreMaterialSigas||nombre(a.tipo),...(a.registroSigas?{registroSigas:a.registroSigas}:{}),tipo:a.tipo,medidas:a.medidas||[],diametro:medidas(a),cantidad:a.cantidad,ubicacion:a.ubicacion||t?.id||'Manual',estado:a.confirmado&&!a.medidasEstimadas&&tieneMedidas?'confirmado':'estimado',cantidadConfirmada:!!a.confirmado,evidencia:(a.evidencia||'')+(!tieneMedidas?' Medidas/conexiones pendientes.':''),nodo:a.nodo||null,origen:'identificado',equivalentes:'No se calculan en este plan físico'};
   if(id&&fisicos.has(id)){
    const previo=fisicos.get(id);if(previo.diametro!==f.diametro||previo.cantidad!==f.cantidad){previo.estado='estimado';previo.conflicto=true;avisos.push('Datos contradictorios para accesorio físico '+id+'. Resolver antes de comprar.');}
    previo.ubicacion+='; referencia '+f.ubicacion;return previo;
   }
   const r=fila(f);if(id)fisicos.set(id,r);if(a.nodo){if(!ubicaciones.has(a.nodo))ubicaciones.set(a.nodo,[]);ubicaciones.get(a.nodo).push(r);}return r;
  }
  const idsTramos=new Set();
  for(const t of ts){
   if(idsTramos.has(t.id))throw Error('Identificador de tramo duplicado.');idsTramos.add(t.id);
   if(!t.id||!valido(t.metros))throw Error('Tramo inválido.');
   for(const a of t.accesorios||[])agregarAccesorio(a,t);
   const ss=t.segmentos;
   if(Array.isArray(ss)&&ss.length&&(ss.some(s=>!Number.isFinite(s.metros)||s.metros<0)||Math.abs(ss.reduce((n,s)=>n+s.metros,0)-t.metros)>1e-8))throw Error('Segmentos incompatibles con '+t.id+'.');
   const conocidos=Array.isArray(ss)&&ss.length;
   const partes=conocidos?ss.map((s,i)=>({...s,id:t.id+':'+i})).filter(s=>s.metros>0):[{metros:t.metros,id:t.id+':SIN-POSICIONES'}];
   for(const parte of partes){
    const diametro=parte.diametro||t.diametro||'Pendiente ('+t.id+')',material=t.material||entrada.material||'',sistema=t.sistema||entrada.sistema||'';
    const key=JSON.stringify([diametro,material||t.id,sistema||t.id]);
    if(!grupos.has(key))grupos.set(key,{diametro,material,sistema,metros:0,segmentos:[],faltantes:[],ubicaciones:[],medidasEstimadas:false});
    const g=grupos.get(key);g.metros+=parte.metros;if(!g.ubicaciones.includes(t.id))g.ubicaciones.push(t.id);g.medidasEstimadas||=!!t.medidasEstimadas||diametro.startsWith('Pendiente');
    if(diametro.startsWith('Pendiente'))avisos.push('Diámetro pendiente en '+t.id+': no combinar medidas desconocidas para compra.');
    if(conocidos)g.segmentos.push({id:parte.id,metros:parte.metros,ubicacion:t.id});else g.faltantes.push(t.id);
   }
  }
  for(const a of entrada.extras||[])agregarAccesorio(a);
  for(const n of nodos){
   const ent=ts.filter(t=>t.red?.hasta===n.id),sal=ts.filter(t=>t.red?.desde===n.id);
   if(ent.length!==1||!sal.length)continue;
   const origen=ent[0],ds=[origen.diametroFinal||origen.diametro,...sal.map(t=>t.diametro)],piezas=ubicaciones.get(n.id)||[],tee=piezas.find(p=>p.tipo==='tee');
   if(sal.length===2){
    if(!tee){avisos.push('Falta identificar la pieza física de la derivación '+n.id+'; no se inventó una tee.');continue;}
    if(ds.some(d=>!d)){avisos.push('Medidas de tee pendientes en '+n.id);continue;}
    const diferentes=ds.some(d=>d!==ds[0]),eleccion=opciones.uniones?.[n.id]||n.unionMateriales;
    if(!diferentes){tee.diametro=ds.join(' / ');continue;}
    tee.estado='estimado';
    if(eleccion==='tee-reductora'){
     tee.material='Tee reductora';tee.diametro=ds.join(' / ');tee.evidencia+=' Pieza integrada elegida para revisión; no se duplica reducción.';
    }else if(eleccion==='tee-igual-reduccion'){
     tee.material='Tee igual';tee.diametro=[ds[0],ds[0],ds[0]].join(' / ');
     for(const t of sal.filter(t=>t.diametro!==ds[0])){
      if(!piezas.some(p=>p.tipo==='reduccion'&&p.diametro===[ds[0],t.diametro].join(' / ')))fila({tipo:'reduccion',material:'Reducción independiente',diametro:[ds[0],t.diametro].join(' / '),cantidad:1,ubicacion:n.id+' · salida a '+t.id,origen:'union-propuesta',equivalentes:reglaReducciones});
     }
    }else{
     tee.diametro=ds.join(' / ');tee.evidencia+=' Confirmar tee reductora o tee igual con reducción.';
     fila({tipo:'reduccion-pendiente',material:'Cambio de diámetro: pieza por confirmar',diametro:ds.join(' / '),cantidad:null,ubicacion:n.id,origen:'union-pendiente',equivalentes:'No incorporado a equivalentes ni cantidad de compra'});
    }
   }else if(sal.length===1&&ds.every(Boolean)&&ds[0]!==ds[1]){
    if(piezas.some(p=>p.tipo==='reduccion'))continue;
    const tipo=opciones.uniones?.[n.id]||n.unionMateriales||n.unionDimensionamiento;
    if(tipo==='union'||tipo==='reduccion')fila({tipo:'reduccion',material:'Reducción independiente',diametro:ds.join(' / '),cantidad:1,ubicacion:n.id,origen:'union-propuesta',equivalentes:reglaReducciones});
    else fila({tipo:'reduccion-pendiente',material:'Cambio de diámetro: confirmar pieza y posición',diametro:ds.join(' / '),cantidad:null,ubicacion:n.id,origen:'union-pendiente',equivalentes:'No incorporado a equivalentes ni cantidad de compra'});
   }else if(sal.length===1&&ds.every(Boolean)&&ds[0]===ds[1]&&(n.unionMateriales==='cupla'||n.unionDimensionamiento==='union')&&!piezas.some(p=>p.tipo==='cupla'))fila({tipo:'cupla',material:'Cupla en unión identificada',diametro:ds[0],cantidad:1,ubicacion:n.id,origen:'union-propuesta'});
  }
  const planes=[];
  for(const g of grupos.values()){
   const incompleto=!!g.faltantes.length,desconocido=!g.material||!g.sistema||g.diametro.startsWith('Pendiente');
   const teorico=Math.ceil(g.metros/config.largoComercial);let plan=null;
   if(!incompleto||config.hipotesisSinPosiciones){
    const ss=[...g.segmentos,...(config.hipotesisSinPosiciones?g.faltantes.map(id=>({id:id+':HIPOTESIS',metros:ts.find(t=>t.id===id).metros,ubicacion:id})):[])];
    plan=planificarCortes(ss,{...config,reutilizar:config.reutilizar&&!desconocido});
   }
   if(incompleto)avisos.push('Faltan segmentos entre accesorios en '+g.faltantes.join(', ')+': compra y cuplas reales pendientes.');
   if(desconocido)avisos.push('Medida/material/sistema incompletos en '+g.ubicaciones.join(', ')+': sin propuesta de reutilización entre tramos.');
   const cuplasRegistradas=filas.some(f=>f.tipo==='cupla'&&f.origen==='identificado'&&(!f.medidas.length||f.medidas.includes(g.diametro)));
   if(cuplasRegistradas)avisos.push('Hay cuplas identificadas para '+g.diametro+': cotejar con las uniones propuestas; no sumarlas automáticamente.');
   const resumen={...g,minimoTeorico:teorico,compraEstimada:incompleto?null:plan.compraEstimada,cuplasPropuestas:incompleto?null:plan.cuplasPropuestas,plan,hipotesis:incompleto&&!!plan};planes.push(resumen);
   fila({tipo:'cano',material:'Caño '+(g.material||'material pendiente')+' / '+(g.sistema||'sistema pendiente')+' · comercial de '+config.largoComercial+' m',diametro:g.diametro,cantidad:incompleto?null:plan.compraEstimada,ubicacion:g.ubicaciones.join(', '),origen:'plan-cortes',minimoTeorico:teorico,evidencia:incompleto?'Compra pendiente: faltan posiciones. Mínimo por longitud, no lista definitiva.':'Estimación por plan de cortes; no se garantiza óptimo ni cortes ejecutables sin revisar.'});
   fila({tipo:'cupla-plan',material:'Cuplas dentro de segmentos continuos',diametro:g.diametro,cantidad:incompleto||cuplasRegistradas?null:plan.cuplasPropuestas,ubicacion:g.ubicaciones.join(', '),origen:'plan-cortes',evidencia:incompleto?'Cuplas pendientes, no cero.':cuplasRegistradas?'Cotejar cuplas identificadas con las uniones propuestas; sin suma automática.':'Uniones propuestas entre piezas del mismo segmento; no cuenta conexiones de codos/tees como cuplas.'});
  }
  return {filas,planes,avisos:[...new Set(avisos)],config,dimensionamientoDefinitivo:false,supuestos:['Configuración usada: largo comercial '+config.largoComercial+' m; reutilización '+(config.reutilizar?'selectiva propuesta':'no propuesta (escenario conservador)')+'; sobrante mínimo '+config.minimoSobrante+' m.','Plan físico independiente del dimensionamiento. Los diámetros propuestos no se convierten en definitivos.','Mínimo teórico = techo de longitud total por medida/material/sistema dividido por largo comercial: solo cota inferior, sin geometría ni desperdicio.','Compra estimada por cortes FFD, no optimización garantizada. Solo se proponen sobrantes del mismo grupo y que cumplan longitud mínima, si se habilita reutilizar.','No se suman sobrantes para fabricar una pieza; esa alternativa requeriría otras cuplas y revisión. No se incluyeron roscas, pérdidas de corte, reserva ni sobrantes preexistentes.','Una cupla por unión propuesta dentro de cada segmento. Posiciones desconocidas producen pendientes. Los accesorios compartidos se cuentan una sola vez por identificación física.',(/epoxi/i.test(entrada.material||'')&&entrada.sistema==='Roscado'?'Las reducciones se listan en materiales y no se agregan a equivalentes del método de clase.':'Las reducciones se listan en materiales. '+reglaReducciones+'.')]};
 }
 // Preparación de compra: lectura del inventario, nunca cambia pérdidas ni medidas guardadas.
 // Distancias relativas declaradas: no interpreta fotografías ni completa posiciones faltantes.
 function continuidadCuplas(t,{conteos={},adicionales=[]}={}){
  const r={segmentos:[],completa:false,metrosPendientes:t.metros,pendientes:[]},d=t.detalle,as=d?.accesorios||[],tipos=new Set(['codo90','codo45','tee','reduccion','llave','cupla']);
  const pendiente=s=>{r.bloqueada=true;r.pendientes.push(s);return r;};
  if(!valido(t.metros)||!Array.isArray(as))return pendiente('Longitud o detalle de accesorios inválido.');
  if(adicionales.some(a=>a.tipo!=='cupla'&&a.cantidad>0))return pendiente('Hay accesorios adicionales sin posiciones: no se supone que estén fuera de los segmentos conocidos.');
  const ids=new Set();for(const a of as){if(!a||!tipos.has(a.tipo))return pendiente('Falta determinar cómo interrumpe la continuidad un accesorio registrado.');if(typeof a.metrosAntes==='number'&&(!Number.isFinite(a.metrosAntes)||a.metrosAntes<0))return pendiente('Distancia inválida antes de un accesorio.');if(a.idFisico&&ids.has(a.idFisico))return pendiente('Accesorio físico repetido en las posiciones: revisar sin duplicar uniones.');if(a.idFisico)ids.add(a.idFisico);}
  for(const [tipo,cantidad]of Object.entries(conteos))if(Number.isSafeInteger(cantidad)&&cantidad>=0&&cantidad!==as.filter(a=>a.tipo===tipo).length)return pendiente('El total de '+tipo+' no coincide con los accesorios posicionados.');
  if(typeof d?.metrosFinal==='number'&&(!Number.isFinite(d.metrosFinal)||d.metrosFinal<0))return pendiente('Distancia final inválida.');
  if(t.llave&&!as.some(a=>a.tipo==='llave'))return pendiente('Llave registrada sin posición: confirmar su interrupción de continuidad.');
  r.diametroVariable=as.some(a=>a.tipo==='reduccion'||a.entrada&&a.salida&&a.entrada!==a.salida);
  if(!as.length){
   const ceroExplicito=['codo90','codo45','tee','reduccion','llave'].every(tipo=>conteos[tipo]===0);
   if(d?.estado!=='ninguno'&&!ceroExplicito)return pendiente('Falta declarar la continuidad o posiciones de accesorios.');
   r.segmentos=[{metros:t.metros,diametro:t.diametro||null,origen:'recta declarada sin accesorios'}];r.completa=true;r.metrosPendientes=0;return r;
  }
  let diametro=t.diametro||null,diametroPendiente=false,anterioresCompletos=true,suma=0;
  const agregar=(metros,origen)=>{if(metros>0)r.segmentos.push({metros,diametro,diametroPendiente,origen});suma+=metros;};
  for(const [i,a]of as.entries()){
   if(typeof a.metrosAntes==='number'&&Number.isFinite(a.metrosAntes)&&a.metrosAntes>=0)agregar(a.metrosAntes,'antes del accesorio '+(i+1));else{anterioresCompletos=false;r.pendientes.push('Distancia anterior al accesorio '+(i+1)+' pendiente.');}
   if(typeof a.salida==='string'&&a.salida.trim()&&!/pendiente/i.test(a.salida)){diametro=a.salida.trim();diametroPendiente=false;}else if(a.tipo==='reduccion'){diametro=null;diametroPendiente=true;}
  }
  let finalConocido=typeof d.metrosFinal==='number'&&Number.isFinite(d.metrosFinal)&&d.metrosFinal>=0;
  if(finalConocido)agregar(d.metrosFinal,'después del último accesorio');
  else if(anterioresCompletos&&suma<=t.metros){agregar(t.metros-suma,'resto exacto de la longitud registrada');finalConocido=true;}
  else r.pendientes.push('Distancia posterior al último accesorio pendiente.');
  if(suma>t.metros+1e-8||anterioresCompletos&&finalConocido&&Math.abs(suma-t.metros)>1e-8)return {...r,bloqueada:true,segmentos:[],completa:false,metrosPendientes:t.metros,pendientes:['Las posiciones no coinciden con la longitud del tramo: revisar antes de calcular cuplas.']};
  r.completa=anterioresCompletos&&finalConocido;r.cuplasUbicadas=r.completa?as.filter(a=>a.tipo==='cupla').length:0;r.metrosPendientes=Math.max(0,t.metros-suma);return r;
 }
 function firmaCortesCompra(t,entrada,opciones={}){
  return JSON.stringify({metros:t.metros,segmentos:t.segmentos||null,...(!t.segmentos&&t.continuidadCuplas?.segmentos.length?{continuidadCuplas:t.continuidadCuplas}:{}),material:t.material||entrada.material,sistema:t.sistema||entrada.sistema,largo:opciones.largoComercial??6,accesorios:[...(t.accesorios||[]),...(entrada.extras||[]).filter(a=>a.tramo===t.id||a.ubicacion===t.id||String(a.ubicacion||'').startsWith(t.id+' · '))].map(a=>[a.idFisico||null,a.tipo,a.cantidad,a.nodo||null])});
 }
 function validarDistribucionCompra(t,grupos,largo){
  if(!Array.isArray(grupos)||!grupos.length||grupos.length>1000||grupos.some(g=>!Array.isArray(g)||!g.length||g.length>1000||g.some(m=>!valido(m)||m>largo)))throw Error('Indicá cortes positivos que no superen el largo comercial.');
  if(Math.abs(grupos.flat().reduce((n,m)=>n+m,0)-t.metros)>1e-8)throw Error('La suma de los cortes debe coincidir con los metros del tramo.');
  const ss=(t.segmentos||(t.continuidadCuplas?.completa?t.continuidadCuplas.segmentos:null))?.filter(s=>s.metros>0);
  if(!ss?.length&&t.continuidadCuplas?.segmentos.length){let desde=0;for(const s of t.continuidadCuplas.segmentos){const indice=grupos.findIndex((g,i)=>i>=desde&&Math.abs(g.reduce((n,m)=>n+m,0)-s.metros)<1e-8);if(indice<0)throw Error('Conservá las distancias conocidas entre accesorios al corregir los cortes.');desde=indice+1;}}
  if(ss?.length&&(ss.length!==grupos.length||ss.some((s,i)=>Math.abs(s.metros-grupos[i].reduce((n,m)=>n+m,0))>1e-8)))throw Error('Los segmentos continuos deben respetar las interrupciones ya registradas; corregí el detalle del tramo si cambió el recorrido.');
  return grupos;
 }
 function prepararCompra(entrada,plan,opciones={},tecnico={}){
  const largo=opciones.largoComercial??6;if(!valido(largo))throw Error('Largo comercial pendiente o inválido.');
  const r={version:1,definitiva:false,largoComercial:largo,tramos:[],canos:[],confirmados:[],registrados:[],estimados:[],propuestas:[],pendientes:[],supuestos:['Sin reutilización entre tramos; dentro de cada tramo solo si fue habilitada y existen cortes y medidas compatibles. No incluye pérdidas de corte, roscado ni reserva.','Las tiras por longitud no prueban que los cortes puedan ejecutarse. Las cuplas requieren segmentos continuos definidos.','Diámetros candidatos y medidas manuales sin validación producen cantidades comerciales provisionales.']},bolsas=new Map(),vistas=new Set();
  const conocido=d=>typeof d==='string'&&d.trim()&&!/pendiente/i.test(d),diametro=(t,s)=>{
   if(s?.diametroPendiente)return {valor:'Pendiente',estado:'pendiente'};
   const f=tecnico.filas?.find(f=>f.id===t.id),d=s?.diametro||t.diametro;
   return conocido(d)?{valor:d,estado:t.diametroVerificado===true&&tecnico.definitivo===true?'verificado':'manual-sin-verificar'}:f?.candidato?.exteriorMm?{valor:f.candidato.exteriorMm+' mm',estado:'candidato'}:{valor:'Pendiente',estado:'pendiente'};
  };
  for(const t of entrada.tramos||[]){
   const firma=firmaCortesCompra(t,entrada,opciones),guardado=opciones.cortesCompra?.[t.id],vigente=guardado?.firma===firma&&guardado.confirmado===true;
   let grupos=null,error=null;try{if(vigente)grupos=validarDistribucionCompra(t,guardado.grupos,largo);}catch(e){error=e.message;}
   if(guardado&&(!vigente||error))r.pendientes.push('Distribución conservada de '+t.id+': revisar cambios de tramo, accesorios o largo comercial'+(error?': '+error:'.'));
   const auto=t.continuidadCuplas,ss=(t.segmentos|| (auto?.completa?auto.segmentos:null))?.filter(s=>s.metros>0),continuidad=!!grupos||!!ss?.length;
   const parciales=!continuidad?auto?.segmentos||[]:[];
   if(ss?.length&&(ss.some(s=>!valido(s.metros))||Math.abs(ss.reduce((n,s)=>n+s.metros,0)-t.metros)>1e-8))throw Error('Segmentos incompatibles con '+t.id);
   const partes=grupos?grupos.map((g,i)=>({metros:g.reduce((n,m)=>n+m,0),diametro:ss?.[i]?.diametro,cortes:g})):ss?.length?ss:parciales.length?[...parciales,...(auto.metrosPendientes>0?[{metros:auto.metrosPendientes,continuidadPendiente:true,diametroPendiente:!!auto.diametroVariable}]:[])]:[{metros:t.metros,continuidadPendiente:true}];
   const aportaciones=new Map();
   const fila={id:t.id,metros:t.metros,diametros:[],tiras:0,metrosComerciales:0,sobrante:0,cuplas:continuidad?0:null,cuplasConocidas:0,cuplasRegistradasContadas:0,cuplasRegistradasUbicadas:auto?.completa?auto.cuplasUbicadas||0:0,cuplasPendientes:!continuidad,cuplasMinimas:continuidad?0:null,continuidad,distribucionVigente:!!grupos,distribucionGuardada:guardado||null,segmentos:[],provisional:true,estado:'estimado'};
   for(const [i,p]of partes.entries()){
    const d=diametro(t,p);if(!fila.diametros.some(x=>x.valor===d.valor&&x.estado===d.estado))fila.diametros.push(d);
    let cortes=(continuidad||parciales.length&&!p.continuidadPendiente)?planificarCortes([{id:t.id+':'+i,metros:p.metros}],{largoComercial:largo}).porSegmento[t.id+':'+i].piezas.map(p=>p.metros):null;
    if(p.cortes)cortes=p.cortes;
    const tiras=cortes?.length??Math.ceil(p.metros/largo),cuplas=cortes?cortes.length-1:null;
    fila.tiras+=tiras;if(cuplas!==null){fila.cuplasConocidas+=cuplas;if(continuidad){fila.cuplas+=cuplas;fila.cuplasMinimas+=Math.max(0,Math.ceil(p.metros/largo)-1);}}
    fila.segmentos.push({metros:p.metros,diametro:d.valor,cortes,cuplas,origen:p.origen||null,continuidadConocida:cuplas!==null});
    const key=JSON.stringify([d.valor,d.estado,t.material||entrada.material,t.sistema||entrada.sistema,d.estado==='pendiente'?t.id:null]);
    if(!bolsas.has(key))bolsas.set(key,{diametro:d.valor,estadoDiametro:d.estado,material:t.material||entrada.material,sistema:t.sistema||entrada.sistema,metros:0,tiras:0,tramos:[],cuplas:0,cuplasPendientes:false,cuplasPorTramo:{}});
    const g=bolsas.get(key);g.metros+=p.metros;g.tiras+=tiras;
    if(!aportaciones.has(key))aportaciones.set(key,{tiras:0,cortes:[]});const aporte=aportaciones.get(key);aporte.tiras+=tiras;if(cortes)aporte.cortes.push(...cortes);if(!g.tramos.includes(t.id))g.tramos.push(t.id);if(cuplas===null)g.cuplasPendientes=true;else{g.cuplas+=cuplas;g.cuplasPorTramo[t.id]=(g.cuplasPorTramo[t.id]||0)+cuplas;}
   }
   if(opciones.reutilizar&&continuidad)for(const [key,aporte]of aportaciones){const g=bolsas.get(key);if(g.estadoDiametro==='pendiente'||!g.material||!g.sistema)continue;const calculado=planificarCortes(aporte.cortes.map((metros,i)=>({id:'corte-'+i,metros})),{largoComercial:largo,reutilizar:true,minimoSobrante:opciones.minimoSobrante??.5});const ahorro=aporte.tiras-calculado.compraEstimada;g.tiras-=ahorro;fila.tiras-=ahorro;}
   fila.estadoCuplas=continuidad?'calculadas-segun-distribucion':fila.cuplasConocidas?'parcial':'pendiente';
   fila.metrosComerciales=fila.tiras*largo;fila.sobrante=fila.metrosComerciales-t.metros;r.tramos.push(fila);
   if(!continuidad){for(const g of bolsas.values())if(g.tramos.includes(t.id))g.cuplasPendientes=true;r.pendientes.push('Cuplas en '+t.id+': faltan segmentos continuos y posiciones de accesorios.');for(const s of auto?.pendientes||[])r.pendientes.push(t.id+': '+s);}
  }
  r.canos=[...bolsas.values()].map(g=>({...g,minimoTeorico:Math.ceil(g.metros/largo),metrosComerciales:g.tiras*largo,sobrante:g.tiras*largo-g.metros,provisional:true}));
  for(const f of plan.filas||[]){
   if(['cano','cupla-plan'].includes(f.tipo)||f.origen==='manual-cero')continue;
   const key=f.id;if(key&&vistas.has(key))continue;if(key)vistas.add(key);
   if(f.origen==='union-propuesta'||f.origen==='union-pendiente'||f.tipo==='reduccion-pendiente'){r.propuestas.push({...f,confirmada:false,afectaCalculo:false});continue;}
   if(f.cantidad===null||f.conflicto){r.pendientes.push(f.material+' en '+f.ubicacion+': cantidad o coincidencias pendientes.');continue;}
   const copia={...f};r.registrados.push(copia);(f.estado==='confirmado'&&!f.editado?r.confirmados:r.estimados).push(copia);
  }
  // Una cupla ya declarada no se suma otra vez a una unión propuesta por cortes.
  if(r.registrados.some(f=>f.tipo==='cupla'&&f.cantidad>0)){
   const declaradas=r.registrados.filter(f=>f.tipo==='cupla'&&f.cantidad>0),asociadas=new Map();
   for(const f of declaradas){const ubicadas=r.tramos.filter(t=>f.ubicacion===t.id||String(f.ubicacion||'').startsWith(t.id+' · '));asociadas.set(f,ubicadas);}
   const verificadas=new Set();for(const t of r.tramos){
    const propias=declaradas.filter(f=>asociadas.get(f).length===1&&asociadas.get(f)[0]===t),cantidad=propias.reduce((n,f)=>n+f.cantidad,0);
    if(!cantidad||t.cuplas===null||t.diametros.length!==1||t.cuplasRegistradasUbicadas!==cantidad||propias.some(f=>f.conflicto))continue;
    t.cuplasAdicionalesCalculadas=t.cuplas;t.cuplas+=cantidad;t.cuplasConocidas+=cantidad;t.cuplasRegistradasContadas=cantidad;t.estadoCuplas='calculadas-con-registradas';
    for(const g of r.canos)if(g.tramos.includes(t.id)){g.cuplas+=cantidad;g.cuplasPorTramo[t.id]=(g.cuplasPorTramo[t.id]||0)+cantidad;}
    propias.forEach(f=>verificadas.add(f));
   }
   const afectadas=new Set();for(const f of declaradas.filter(f=>!verificadas.has(f))){const ubicadas=asociadas.get(f);for(const t of r.tramos){if(ubicadas.length&&!ubicadas.includes(t))continue;afectadas.add(t.id);}}
   if(afectadas.size)r.pendientes.push('Cuplas registradas: cotejar su ubicación con las uniones del plan de cortes; no se suman automáticamente.');
   for(const f of r.tramos)if(afectadas.has(f.id)){f.cuplasCalculadas=f.cuplas;f.cuplasConocidasCalculadas=f.cuplasConocidas;f.cuplas=null;f.cuplasConocidas=0;f.cuplasPendientes=true;f.estadoCuplas='pendiente-cotejo';f.cuplasRegistradasContadas=0;}
   for(const g of r.canos)if(g.tramos.some(id=>afectadas.has(id))){g.cuplasCalculadas=g.cuplas;g.cuplasPendientes=true;g.cuplas=Object.entries(g.cuplasPorTramo).filter(([id])=>!afectadas.has(id)).reduce((n,[,cantidad])=>n+cantidad,0);}
  }
  // Comparar nodos físicos una sola vez; nunca fabricar una reducción por cada recorrido.
  const nodos=new Map((entrada.nodos||[]).map(n=>[n.id,n]));for(const t of entrada.tramos||[])for(const id of [t.red?.desde,t.red?.hasta])if(id&&!nodos.has(id))nodos.set(id,{id});
  for(const [id]of nodos){
   const ent=entrada.tramos.filter(t=>t.red?.hasta===id),sal=entrada.tramos.filter(t=>t.red?.desde===id);if(ent.length!==1||!sal.length)continue;
   const ds=[diametro(ent[0],ent[0].segmentos?.at(-1)),...sal.map(t=>diametro(t,t.segmentos?.[0]))];if(ds.some(d=>d.estado==='pendiente')||ds.every(d=>d.valor===ds[0].valor))continue;
   const piezas=(plan.filas||[]).filter(f=>f.nodo===id),tee=piezas.find(f=>f.tipo==='tee'),reduccion=piezas.find(f=>f.tipo==='reduccion'&&f.origen==='identificado');
   if(reduccion&&!reduccion.conflicto)continue;
   if(tee&&/reductora/i.test(tee.material)&&tee.estado==='confirmado'&&!tee.conflicto)continue;
   if(!r.propuestas.some(p=>p.nodo===id||p.ubicacion===id))r.propuestas.push({id:'cambio:'+id,tipo:'transicion-pendiente',material:'Cambio de diámetro detectado: verificar conexión'+(tee?' (puede resolverlo una tee reductora)':''),nodo:id,ubicacion:id,diametro:ds.map(d=>d.valor+(d.estado==='verificado'?'':' provisional')).join(' / '),cantidad:null,confirmada:false,afectaCalculo:false});
  }
  r.pendientes=[...new Set(r.pendientes)];return r;
 }
 function agruparPendientesCompra(mensajes){
  const grupos=new Map(['Datos del suministro','Diámetros y pérdidas','Conexiones y accesorios','Cortes, cuplas y compra','Verificación normativa'].map(n=>[n,[]]));
  for(const texto of new Set(mensajes.filter(s=>typeof s==='string'&&s.trim()))){
   const tema=/normativ|NAG|certific|edición|fabricante|aplicabilidad/i.test(texto)?'Verificación normativa':/cupla|corte|sobrante|comercial|compra|segmentos|tiras/i.test(texto)?'Cortes, cuplas y compra':/suministro|presi[oó]n|densidad|calor[ií]fic|simultaneidad|combustible/i.test(texto)?'Datos del suministro':/tee|codo|llave|rosca|conexi[oó]n|transici[oó]n|accesorio|pieza/i.test(texto)?'Conexiones y accesorios':'Diámetros y pérdidas';
   grupos.get(tema).push(texto);
  }return [...grupos].map(([tema,detalles])=>({tema,detalles}));
 }

 const api={planificarCortes,planificarMateriales,prepararCompra,continuidadCuplas,firmaCortesCompra,validarDistribucionCompra,agruparPendientesCompra};if(typeof module==='object'&&module.exports)module.exports=api;else root.MaterialesGas=api;
})(globalThis);
