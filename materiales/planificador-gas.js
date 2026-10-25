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
 const api={planificarCortes,planificarMateriales};if(typeof module==='object'&&module.exports)module.exports=api;else root.MaterialesGas=api;
})(globalThis);
