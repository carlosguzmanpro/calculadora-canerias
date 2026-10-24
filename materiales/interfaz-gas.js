/* Interfaz de revisión de materiales; usa el estado existente, nunca activa diámetros. */
let revisionMaterialesGas=null,fuenteMaterialesGas='proyecto';
function datosPlanGas(){
 const p=proyectoGasActual();
 if(!p.planCompra||typeof p.planCompra!=='object'||Array.isArray(p.planCompra))p.planCompra={};
 const d=p.planCompra;if(!d.opciones||typeof d.opciones!=='object')d.opciones={};if(!Array.isArray(d.extras))d.extras=[];if(!d.revisiones||typeof d.revisiones!=='object')d.revisiones={};return d;
}
function entradaMaterialesGas(fuente='proyecto',sinSugerencias=false,sinConciliacion=false){
 if(fuente==='proyecto'&&!sinConciliacion&&modoManualGasActivo())return entradaManualMaterialesGas(sinSugerencias);
 if(fuente==='ejemplo')return {origen:'Ejemplo educativo calefón/cocina; no incorporado al proyecto',material:'Acero epoxi',sistema:'Roscado',nodos:[{id:'M'},{id:'A'},{id:'Calefón'},{id:'Cocina'}],tramos:[['M','A',19,5,0,'1"'],['A','Calefón',18,7,1,'1"'],['A','Cocina',12,5,1,'3/4"']].map(([desde,hasta,metros,codos,llaves,diametro])=>({id:desde+'-'+hasta,metros,diametro,medidasEstimadas:true,red:{desde,hasta},segmentos:null,accesorios:[{tipo:'codo90',cantidad:codos,medidas:[diametro,diametro],confirmado:true,medidasEstimadas:true,evidencia:'Cantidad aportada en el ejercicio; medidas del diagnóstico condicionado'},...(llaves?[{tipo:'llave',cantidad:llaves,medidas:[diametro],confirmado:true,medidasEstimadas:true}]:[]),...(hasta==='A'?[{tipo:'tee',cantidad:1,nodo:'A',medidas:['1"','1"','3/4"'],confirmado:true,medidasEstimadas:true}]:[])]}))};
 const nodos=instalacionGas.nodos||[];
 const entrada={casilleroMedidorGas:{...(proyectoGasActual().casilleroMedidorGas||{})},origen:'Proyecto manual actual',material:instalacionGas.perfil.material,sistema:instalacionGas.perfil.sistema,nodos,tramos:tramos.map((t,i)=>{
  const r=evaluarTramo(t,tramos),d=t.detalle,geometria=d&&['completo','ninguno'].includes(d.estado)&&(!r.pendiente||r.soloMedidasPendientes);
  let posicion=0,posicionConocida=true,entradaActual=t.diametro;
  const registrados=geometria?r.accesorios:Array.isArray(d?.accesorios)?d.accesorios.filter(a=>a&&typeof a.tipo==='string'):[];
  const acc=registrados.map((a,j)=>{
   if(Number.isFinite(a.metrosAntes)&&posicionConocida)posicion+=a.metrosAntes;else posicionConocida=false;
   const nodo=a.tipo==='tee'?nodos.find(n=>n.nombre.trim().toLowerCase()===(a.nodo||'').trim().toLowerCase())?.id||('nombre:'+String(a.nodo||'sin-identificar-'+j).trim().toLowerCase()):posicionConocida&&posicion===0?t.red?.desde:posicionConocida&&posicion===t.metros?t.red?.hasta:null;
   const entrada=a.entrada||entradaActual;entradaActual=a.salida||null;
   return {idFisico:a.idFisico||undefined,tipo:a.tipo,cantidad:1,nodo,medidas:[entrada,a.salida,...(a.tipo==='tee'?[a.ramal]:[])],confirmado:d?.estado==='completo',evidencia:'Registrado manualmente o incorporado después de revisión del croquis',ubicacion:(t.id||'tramo-'+i)+' · accesorio '+(j+1)};
  });
  if(t.llave&&!acc.some(a=>a.tipo==='llave'))acc.push({tipo:'llave',cantidad:1,medidas:[t.diametro],confirmado:true,evidencia:'Llave del tramo; no duplica la llave detallada'});
  return {id:t.id||'tramo-'+i,metros:t.metros,diametro:t.diametro,diametroFinal:r.segmentos?.at(-1)?.diametro==='Diámetro pendiente'?null:r.segmentos?.at(-1)?.diametro,red:t.red,segmentos:geometria&&!(t.llave&&!acc.some(a=>a.tipo==='llave'&&a.ubicacion))?r.segmentos.map(s=>({metros:s.metros,diametro:s.diametro==='Diámetro pendiente'?null:s.diametro})):null,accesorios:acc};
 }),extras:[...datosPlanGas().extras,...(sinSugerencias?[]:accesoriosDeteccionConfirmadosGas())]};
 if(!sinSugerencias&&!sinConciliacion){
  const adicionales=accesoriosRapidosConciliadosGas(entrada);entrada.extras.push(...adicionales);
  // Una cantidad no determina segmentos continuos ni cuplas: conservar la geometría original sin darla por completa para compra.
  for(const a of adicionales){const t=entrada.tramos.find(t=>t.id===a.tramo);if(t)t.segmentos=null;}
 }
 return entrada;
}
function opcionesMaterialesGas(fuente=fuenteMaterialesGas){const o=datosPlanGas().opciones;return {largoComercial:estadoLargoComercialGas(fuente).configurado,reutilizar:!!o.reutilizar,minimoSobrante:o.minimoSobrante??.5,hipotesisSinPosiciones:!!o.hipotesisSinPosiciones,uniones:{...(fuente==='proyecto'?unionesDeteccionConfirmadasGas():{}),...(o[fuente==='ejemplo'?'unionesEjemplo':'uniones']||{})}};}
function firmaMaterialesGas(){return JSON.stringify({fuente:fuenteMaterialesGas,entrada:entradaMaterialesGas(fuenteMaterialesGas),opciones:opcionesMaterialesGas()});}
function invalidarMaterialesGas(){if(modulo==='gas'&&revisionMaterialesGas)sincronizarMaterialesGas(fuenteMaterialesGas);}
function abrirPlanGas(){
 if(modulo!=='gas')return;
 $('planCompraGas').classList.remove('oculto');const o=opcionesMaterialesGas();
 $('matLargo').value=o.largoComercial??6;$('matReusar').checked=!!o.reutilizar;$('matSobrante').value=o.minimoSobrante??.5;$('matHipotesis').checked=!!o.hipotesisSinPosiciones;
 renderUnionesMaterialesGas();renderConciliacionRapidaGas();
}
function guardarOpcionesMaterialesGas(){
 Object.assign(datosPlanGas().opciones,{largoComercial:Number($('matLargo').value),reutilizar:$('matReusar').checked,minimoSobrante:Number($('matSobrante').value),hipotesisSinPosiciones:$('matHipotesis').checked});
 invalidarMaterialesGas();guardarDatos();
}
function renderUnionesMaterialesGas(){
 const out=$('matUniones');out.replaceChildren();const e=entradaMaterialesGas(fuenteMaterialesGas);
 const nodos=$('matExtraNodo');nodos.replaceChildren();const sin=document.createElement('option');sin.value='';sin.textContent='Sin nodo identificado';nodos.append(sin);for(const n of e.nodos){const o=document.createElement('option');o.value=n.id;o.textContent=n.nombre||n.id;nodos.append(o);}
 for(const n of e.nodos.filter(n=>e.tramos.filter(t=>t.red?.desde===n.id).length===2)){
  const label=document.createElement('label');label.textContent='Pieza real o hipótesis de revisión en '+(n.nombre||n.id);
  const select=document.createElement('select');for(const [v,texto]of [['','Pendiente: identificar pieza'],['tee-reductora','Una tee reductora integrada'],['tee-igual-reduccion','Tee igual y reducción independiente']]){const opt=document.createElement('option');opt.value=v;opt.textContent=texto;select.append(opt);}
  select.value=opcionesMaterialesGas().uniones?.[n.id]||'';
  select.onchange=()=>{const o=datosPlanGas().opciones;const k=fuenteMaterialesGas==='ejemplo'?'unionesEjemplo':'uniones';o[k]={...o[k],[n.id]:select.value};invalidarMaterialesGas();guardarDatos();};label.append(select);out.append(label);
 }
}
// Solo una acción explícita desplaza la pantalla; los recálculos conservan la posición.
function desplazarResultadoMaterialesGas(id='resumenPrincipalMaterialesGas'){
 const destino=$(id);if(!destino?.scrollIntoView)return;
 const reducido=typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 try{destino.scrollIntoView({behavior:reducido?'auto':'smooth',block:'start',inline:'nearest'});}
 catch(e){destino.scrollIntoView();}
}
function generarPlanGas(fuente='proyecto',desplazar=false){
 if(modulo!=='gas')return;
 fuenteMaterialesGas=fuente;abrirPlanGas();
 try{
  if(typeof MaterialesGas==='undefined')throw Error('Falta el archivo de materiales. Descomprimí el ZIP completo.');
  sincronizarMaterialesGas(fuente);const entrada=entradaMaterialesGas(fuente);if(!entrada.tramos.length&&!(entrada.manualDirecto&&tramos.length))throw Error('Agregá tramos para planificar.');
  const firma=firmaMaterialesGas(),previa=datosPlanGas().revisiones[fuente];
  revisionMaterialesGas={firma,fuente,plan:anotarFilasRevisionGas(planificarVistaMaterialesGas(entrada,opcionesMaterialesGas()),entrada)};
  if(previa?.firma===firma&&Array.isArray(previa.filas))for(const f of revisionMaterialesGas.plan.filas){const r=previa.filas.find(r=>r.id===f.id);if(r&&(r.cantidad===null||(Number.isInteger(r.cantidad)&&r.cantidad>=0))){if(r.editado)f.cantidadCalculada=f.cantidad;f.cantidad=r.cantidad;f.revisado=!!r.revisado;if(r.editado){f.estado='estimado';f.editado=true;f.cantidadConfirmada=false;}}}
  renderPlanGas();if(desplazar)desplazarResultadoMaterialesGas();
 }catch(e){revisionMaterialesGas=null;$('matResultado').replaceChildren();$('matResultado').textContent=e.message;if(desplazar)desplazarResultadoMaterialesGas('matResultado');}
}
function guardarRevisionMaterialesGas(){
 if(!revisionMaterialesGas)return;
 datosPlanGas().revisiones[fuenteMaterialesGas]={firma:revisionMaterialesGas.firma,filas:revisionMaterialesGas.plan.filas.map(f=>({...f,ubicacionNombre:ubicacionLegibleGas(f.ubicacion),editado:!!f.editado}))};guardarDatos();
}
// Etiquetas de pantalla: nunca se escriben sobre el proyecto ni las exportaciones.
function textoMaterialPantallaGas(valor){
 return ubicacionLegibleGas(String(valor??''))
  .replace(/\btramo-[a-z0-9]+-\d+\b/gi,'Tramo sin ubicación identificada');
}
function renderPlanGas(){
 const out=$('matResultado');out.replaceChildren();$('ajustesAvanzadosGas').open=!modoManualGasActivo();$('opcionesAvanzadasPlanGas').open=!modoManualGasActivo();$('resultadoMateriales').classList.toggle('oculto',modoManualGasActivo());renderResumenPrincipalGas();if(!revisionMaterialesGas)return;const r=revisionMaterialesGas.plan;
 const texto=(t,padre=out)=>{const p=document.createElement('p');p.textContent=textoMaterialPantallaGas(t);padre.append(p);};
 const detalles=document.createElement('details'),resumen=document.createElement('summary');detalles.className='gas-detalles';resumen.textContent='Ver detalles técnicos';detalles.append(resumen);
 texto((fuenteMaterialesGas==='ejemplo'?'EJEMPLO SEPARADO: no reemplaza tus datos. ':'PROYECTO ACTUAL. ')+'Lista para revisión, no cantidades definitivas. Diámetros automáticos definitivos bloqueados.');
 if(fuenteMaterialesGas==='proyecto'&&avisoDeteccionGas())texto(avisoDeteccionGas());
 if(fuenteMaterialesGas==='proyecto'&&!modoManualGasActivo()){texto(avisoConciliacionRapidaGas());renderConciliacionRapidaGas();}
 r.supuestos.forEach(t=>texto(t,detalles));if(!r.manualDirecto)r.avisos.forEach(t=>texto(t,detalles));
 for(const g of r.planes){
  texto(g.diametro+' · '+(g.material||'material pendiente')+' / '+(g.sistema||'sistema pendiente')+' · '+g.metros+' m · mínimo teórico '+g.minimoTeorico+' caños de '+r.config.largoComercial+' m · compra estimada '+(g.compraEstimada??'PENDIENTE')+' · cuplas propuestas '+(g.cuplasPropuestas??'PENDIENTES'),detalles);
  if(g.hipotesis)texto('HIPÓTESIS POR LONGITUD, NO COMPRA: '+g.plan.compraEstimada+' barras y '+g.plan.cuplasPropuestas+' uniones si cada tramo fuera continuo; NO representa los codos del croquis ni resuelve cuplas reales.',detalles);
  if(g.plan)for(const b of g.plan.barras)texto(b.id+' · cortes '+b.cortes.map(c=>c.metros+' m para '+c.segmento).join('; ')+' · sobrante '+fmt(b.sobrante)+' m',detalles);
 }
 out.append(detalles);
 const lista=document.createElement('div');lista.className='gas-materiales-tarjetas';
 for(const f of r.filas){
  const card=document.createElement('article');card.className='gas-material-card';
  const titulo=document.createElement('h3');titulo.textContent=textoMaterialPantallaGas(f.material);card.append(titulo);
  texto('Estado: '+(f.cantidad===null?'Pendiente':f.estado.toUpperCase())+(f.cantidadConfirmada?' · '+(f.origen==='identificado'?'Accesorio confirmado':'cantidad identificada'):''),card);
  if(!r.manualDirecto){const tecnica=document.createElement('p');tecnica.className='gas-tecnica-pendiente';tecnica.textContent='Revisión técnica pendiente · diámetros y conexiones';card.append(tecnica);}
  texto('Diámetro: '+(f.diametro||'Pendiente'),card);
  texto('Ubicación: '+ubicacionLegibleGas(f.ubicacion),card);
  const qty=document.createElement('label'),input=document.createElement('input');qty.textContent='Cantidad · '+f.unidad;input.type='number';input.min='0';input.step='1';input.inputMode='numeric';input.placeholder='Pendiente';input.ariaLabel='Cantidad de '+textoMaterialPantallaGas(f.material)+' en '+textoMaterialPantallaGas(f.ubicacion)+' ('+f.unidad+')';input.value=f.cantidad??'';
  input.onchange=()=>{const n=input.value===''?null:Number(input.value);if(n!==null&&(!Number.isInteger(n)||n<0)){$('matMensaje').textContent='Cantidad entera no negativa o pendiente.';input.value=f.cantidad??'';f.revisado=false;guardarRevisionMaterialesGas();return;}if(!f.editado)f.cantidadCalculada=f.cantidad;f.cantidad=n;f.revisado=false;f.editado=true;f.cantidadConfirmada=false;f.estado='estimado';guardarRevisionMaterialesGas();renderPlanGas();};qty.className='gas-cantidad';qty.append(input);if(f.cantidad===null){const pendiente=document.createElement('span');pendiente.className='gas-cantidad-pendiente';pendiente.textContent='Pendiente';qty.append(pendiente);}card.append(qty);
  const info=document.createElement('details'),summary=document.createElement('summary');info.className='gas-detalles';summary.textContent='Ver detalles técnicos';info.append(summary);
  texto(f.evidencia||f.equivalentes||'Sin evidencia adicional registrada.',info);
  if(f.editado)texto('Cantidad ajustada manualmente; calculada originalmente '+(f.cantidadCalculada??'PENDIENTE'),info);
  card.append(info);
  const label=document.createElement('label'),check=document.createElement('input');label.className='gas-revision-check';label.textContent='Revisado';label.title='Revisión de la lista de materiales; no valida diámetros ni conexiones';check.type='checkbox';check.checked=f.revisado;check.onchange=()=>{f.revisado=check.checked;guardarRevisionMaterialesGas();};label.append(check);card.append(label);lista.append(card);
 }
 out.append(lista);texto('Revisado se refiere a la lista, no a la validación técnica. Pendiente no significa cero.');
}
function agregarExtraMaterialGas(){
 if(fuenteMaterialesGas!=='proyecto'){$('matMensaje').textContent='Seleccioná Mi proyecto para agregar accesorios propios.';return;}
 const nombre=$('matExtraNombre').value.trim(),normal=nombre.toLowerCase(),tipo=({'cupla':'cupla','tee':'tee','reducción':'reduccion','reduccion':'reduccion','llave':'llave','llave de paso':'llave','codo 90°':'codo90','codo 45°':'codo45'}[normal]||nombre),nodo=$('matExtraNodo').value||null,cantidad=Number($('matExtraCantidad').value),ubicacion=$('matExtraUbicacion').value.trim(),diametro=$('matExtraDiametro').value.trim();
 if(!tipo||!Number.isInteger(cantidad)||cantidad<=0||!ubicacion){$('matMensaje').textContent='Indicá accesorio, cantidad entera positiva y ubicación.';return;}
 if(tipo==='tee'&&!nodo){$('matMensaje').textContent='Elegí el nodo físico de la tee para evitar duplicaciones.';return;}
 datosPlanGas().extras.push({nodo,idFisico:idGas('extra'),tipo,cantidad,ubicacion,medidas:diametro?diametro.split(/\s*(?:→|->)\s*/):[],confirmado:$('matExtraConfirmado').checked,evidencia:'Accesorio adicional identificado manualmente; sin equivalentes automáticos'});
 guardarDatos();generarPlanGas('proyecto');$('matMensaje').textContent='Accesorio añadido a la revisión.';
}
function prepararSalidaMaterialesGas(){
 invalidarMaterialesGas();if(!revisionMaterialesGas){$('matMensaje').textContent='Generá de nuevo la lista.';return null;}
 if(!(modoManualGasActivo()&&fuenteMaterialesGas==='proyecto')&&revisionMaterialesGas.plan.filas.some(f=>!f.revisado)){$('matMensaje').textContent='Revisá todas las filas antes de imprimir o descargar. Podés revisar y conservar un dato pendiente.';return null;}
 $('matMensaje').textContent=modoManualGasActivo()&&fuenteMaterialesGas==='proyecto'?'Lista manual: se conservan los estados estimados y pendientes; no implica revisión técnica.':'Lista revisada: se conservan los estados estimados y pendientes.';return revisionMaterialesGas;
}
function descargarMaterialesGas(){
 const r=prepararSalidaMaterialesGas();if(!r)return;
 const quote=x=>'"'+String(x??'PENDIENTE').replaceAll('"','""')+'"';
 const filas=[['LISTA PARA REVISIÓN; NO DEFINITIVA'],...(ambitoGas.startsWith('proyecto:')||proyectos.gas.nombreProyecto?[['PROYECTO',nombreProyectoGas()]]:[]),...r.plan.supuestos.map(t=>[t]),...r.plan.avisos.map(t=>[t]),...r.plan.planes.map(g=>['RESUMEN',g.diametro,'Mínimo teórico: '+g.minimoTeorico,'Compra estimada: '+(g.compraEstimada??'PENDIENTE'),'Cuplas propuestas: '+(g.cuplasPropuestas??'PENDIENTES'),g.hipotesis?'Hipótesis NO COMPRA: '+g.plan.compraEstimada+' barras / '+g.plan.cuplasPropuestas+' uniones':'']),['Material','Diámetro','Cantidad','Unidad','Ubicación','Estado','Revisado','Evidencia'],...r.plan.filas.map(f=>[f.material,f.diametro,f.cantidad,f.unidad,ubicacionLegibleGas(f.ubicacion),f.estado,f.revisado?'Sí':'No',f.evidencia||f.equivalentes||''])];
 const csv='\uFEFF'+filas.map(f=>f.map(quote).join(';')).join('\r\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='canerias-materiales-revision.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function imprimirMaterialesGas(){if(!prepararSalidaMaterialesGas())return;if(fuenteMaterialesGas==='ejemplo'){$('matMensaje').textContent='El ejemplo es una vista separada. Seleccioná Mi proyecto o Demostración para imprimir su informe.';return;}imprimirInformeActual();}
window.addEventListener('afterprint',()=>{$('resultadoMateriales').classList.remove('solo-pantalla');});

// Revisiones anteriores: nunca se aplican cantidades por el índice material-N.
function identidadFilaGas(f){return f.claveRevision||JSON.stringify([f.tipo,f.material,f.diametro,f.unidad,f.ubicacion]);}
function anotarFilasRevisionGas(plan,entrada){
 if(!entrada.manualDirecto&&entrada.origen==='Proyecto manual actual'&&(proyectoGasActual().conciliacionRapidaGas||tramos.some(t=>Object.keys(conteoRapidoDelTramoGas(t)).length)))plan.avisos.push(avisoConciliacionRapidaGas());
 for(const f of plan.filas){if(entrada.origen==='Proyecto manual actual')f.material=etiquetaAccesorioDetectadoGas(f);f.ubicacionNombre=ubicacionLegibleGas(f.ubicacion);const t=(entrada.tramos||[]).find(t=>String(f.ubicacion).startsWith(t.id+' · accesorio '));f.claveRevision=JSON.stringify([f.tipo,f.material,f.diametro,f.unidad,f.ubicacion,...(f.origen==='identificado'?[t?.accesorios||(entrada.extras||[]).filter(a=>!a.idFisico?.startsWith('conciliacion:'))]:[])]);}
 return plan;
}
function filasRevisionGas(revision){
 if(!revision)return [];
 if(revision.plan)return revision.plan.filas;
 try{const x=JSON.parse(revision.firma),plan=anotarFilasRevisionGas(planificarVistaMaterialesGas(x.entrada,x.opciones),x.entrada);return plan.filas.map(f=>({...f,...(revision.filas||[]).find(r=>r.id===f.id)}));}catch(e){return revision.filas||[];}
}
function sincronizarMaterialesGas(fuente='proyecto'){
 const d=datosPlanGas(),entrada=entradaMaterialesGas(fuente),opciones=opcionesMaterialesGas(fuente),firma=JSON.stringify({fuente,entrada,opciones});
 const vista=revisionMaterialesGas?.fuente===fuente?revisionMaterialesGas:null,previa=vista||d.revisiones[fuente];
 if(previa?.firma===firma)return;
 const filas=filasRevisionGas(previa);
 if(previa){
  if(!Array.isArray(d.respaldos))d.respaldos=[];
  let contexto=null;try{contexto=JSON.parse(previa.firma).entrada;}catch(e){}
  const guardadas=JSON.parse(JSON.stringify(filas.map(f=>({...f,ubicacionNombre:f.ubicacionNombre||ubicacionLegibleGas(f.ubicacion,contexto)}))));
  if(!d.respaldos.some(r=>r.firma===previa.firma&&JSON.stringify(r.filas)===JSON.stringify(guardadas)))d.respaldos.push({firma:previa.firma,fuente,estado:'DESACTUALIZADO · solo respaldo',filas:guardadas});
 }
 try{
  const plan=anotarFilasRevisionGas(planificarVistaMaterialesGas(entrada,opciones),entrada);delete d.errorActual;
  for(const f of plan.filas){const r=filas.find(r=>r.editado&&identidadFilaGas(r)===identidadFilaGas(f));if(r){f.cantidadCalculada=f.cantidad;f.cantidad=r.cantidad;f.editado=true;f.revisado=false;f.cantidadConfirmada=false;f.estado='estimado';f.evidencia=(f.evidencia||'')+' Ajuste manual conservado; revisar tras el cambio.';}}
  for(const f of plan.filas)f.ubicacionNombre=ubicacionLegibleGas(f.ubicacion);
  const actual={firma,fuente,plan};d.revisiones[fuente]={firma,filas:JSON.parse(JSON.stringify(plan.filas))};
  if(vista){revisionMaterialesGas=actual;renderPlanGas();$('matMensaje').textContent='Datos actualizados automáticamente. Revisá la lista; el resultado anterior se conserva como respaldo desactualizado.';}
 }catch(e){
  d.errorActual=e.message;
  if(vista){revisionMaterialesGas=null;$('matResultado').replaceChildren();$('matResultado').textContent='Datos actualizados: no se pudo recalcular. '+e.message+'. Respaldo anterior conservado, no vigente.';}
 }
 renderRespaldosGas();
}
function renderRespaldosGas(){
 const out=$('respaldosGas');if(!out)return;out.replaceChildren();
 const datos=proyectoGasActual(),d=datosPlanGas(),r=datos.derivadosGas;
 const texto=t=>{const p=document.createElement('p');p.textContent=t;out.append(p);};
 if(r?.anterior)texto('DESACTUALIZADO · respaldo de dimensionamiento anterior ('+(r.anterior.resultado?.estado||'estado pendiente de recuperar')+'). No usar como resultado vigente.');
 if(r?.ultimoValido&&r.ultimoValido.firma!==r.firma)texto('Último resultado calculado válido para los datos anteriores: DESACTUALIZADO. No implica aprobación técnica.');
 for(const b of Array.isArray(d.respaldos)?d.respaldos:[]){if(!b||!Array.isArray(b.filas))continue;texto((b.fuente==='ejemplo'?'EJEMPLO SEPARADO · ':'')+b.estado);for(const f of b.filas)texto((f.material||'Material')+' · '+(f.diametro||'Pendiente')+' · '+(f.cantidad??'PENDIENTE')+' · '+(f.ubicacionNombre||ubicacionLegibleGas(f.ubicacion||''))+(f.editado?' · ajuste manual conservado':''));}
}
function actualizarDerivadosGas(){
 if(modulo!=='gas')return;
 actualizarSugerenciasGas();
 const p=proyectoGasActual(),firma=JSON.stringify({tramos,artefactos,instalacion:instalacionGas,tipoGas:$('gt').value});
 const anterior=p.derivadosGas;
 if(!anterior&&!tramos.length&&!artefactos.length){$('informeClaseMiRed').replaceChildren();$('resultadoDimensionamiento').textContent='Pendiente: no hay datos de GAS en este espacio.';calcularConsumos();calcularMateriales();renderRespaldosGas();return;}
 if(anterior?.firma!==firma){
  try{
   const resultado=motorClaseAceroGas(tramos,artefactos,instalacionGas,catalogoParaGas(instalacionGas));
   p.derivadosGas={firma,resultado,dimensionamiento:motorDimensionarGas(tramos,artefactos,instalacionGas,catalogoParaGas(instalacionGas)),anterior:anterior?{firma:anterior.firma,resultado:anterior.resultado}:null,ultimoValido:resultado.estado==='calculado'?{firma,resultado}:anterior?.ultimoValido||null};

  }catch(e){p.derivadosGas={firma,resultado:{estado:'bloqueado',faltantes:[e.message]},anterior:anterior?{firma:anterior.firma,resultado:anterior.resultado}:null,ultimoValido:anterior?.ultimoValido||null};$('informeClaseMiRed').textContent='No se pudo recalcular: '+e.message+'. Respaldo anterior no vigente.';}
 }
 if(p.derivadosGas?.resultado?.recorridos)mostrarInformeClaseGas(p.derivadosGas.resultado,'informeClaseMiRed');
 else $('informeClaseMiRed').textContent='Pendiente: '+(p.derivadosGas?.resultado?.faltantes||[]).join(' ');
 if(p.derivadosGas?.dimensionamiento)imprimirResultadoMotor(p.derivadosGas.dimensionamiento,'resultadoDimensionamiento');
 else $('resultadoDimensionamiento').textContent='Pendiente: diagnóstico actual no disponible. El respaldo no está vigente.';
 calcularConsumos();calcularMateriales();
 sincronizarMaterialesGas('proyecto');renderRespaldosGas();
}
function descargarRespaldoCompleto(){
 if(modulo==='gas')capturarBorradorProyectoGas();
 if(Object.values(lecturasFoto).some(x=>x.pendiente)){$('estadoRespaldo').textContent='Esperá a que termine la lectura de la fotografía antes de descargar el respaldo.';return;}
 $('estadoRespaldo').textContent=Object.values(lecturasFoto).some(x=>x.error&&!x.datos)?'El respaldo conserva los datos y la foto anterior leída. La foto temporal actual no pudo incluirse; conservá su archivo original.':'Respaldo completo con las fotografías leídas; guardalo fuera del navegador.';
 const blob=new Blob([JSON.stringify({formato:'canerias-respaldo-v1',proyectos},null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='canerias-respaldo-completo.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

// Conciliación del inventario físico. Nunca alimenta equivalentes ni dimensionamiento.
function nodoConciliacionGas(valor){
 const ns=instalacionGas.nodos||[],original=String(valor||''),v=original.startsWith('id:')&&ns.some(n=>n.id===original.slice(3))?original.slice(3):original,normal=x=>String(x||'').trim().toLocaleLowerCase('es');
 const porId=ns.filter(n=>n.id===v);if(porId.length===1)return 'n:'+v;
 const nombre=v.startsWith('nombre:')?v.slice(7):v,porNombre=ns.filter(n=>normal(n.nombre)===normal(nombre));
 return porNombre.length===1?'n:'+porNombre[0].id:'nombre:'+normal(nombre);
}
function piezasConciliacionGas(entrada){
 const piezas=new Map(),normal=x=>String(x||'').trim().toLocaleLowerCase('es');
 function agregar(a,tramo,indice){
  const nodo=a.nodo?nodoConciliacionGas(a.nodo):null;
  const id=a.tipo==='tee'&&nodo?'tee:'+nodo:a.idFisico||JSON.stringify([tramo?'detalle':'manual',tramo?.id||'',indice]);
  const reductor=['tee','codo90','codo45'].includes(a.tipo)&&a.medidas?.filter(Boolean).length>1&&a.medidas.some(m=>m&&m!==a.medidas[0]);
  const ubicaciones=[tramo?.id,a.tramo,a.ubicacion].filter(Boolean);
  const pieza={id,nodoOriginal:a.nodo,tipo:a.tipo,cantidad:a.cantidad,nodo,medidas:a.medidas||[],ubicaciones,confirmado:!!a.confirmado,reductor,conflicto:false};
  if(piezas.has(id)){const p=piezas.get(id);p.conflicto||=p.nodoOriginal!==pieza.nodoOriginal||p.tipo!==pieza.tipo||p.cantidad!==pieza.cantidad||JSON.stringify(p.medidas)!==JSON.stringify(pieza.medidas);p.ubicaciones.push(...ubicaciones);return;}
  piezas.set(id,pieza);
 }
 for(const t of entrada.tramos)for(const [i,a]of (t.accesorios||[]).entries())agregar(a,t,i);
 for(const [i,a]of (entrada.extras||[]).entries())agregar(a,null,i);
 return [...piezas.values()].map(p=>({...p,etiqueta:(p.reductor?'Accesorio reductor integrado':({tee:'Tee',llave:'Llave de paso',codo90:'Codo 90°',codo45:'Codo 45°',reduccion:'Reducción'}[p.tipo]||p.tipo))+' · '+p.ubicaciones.map(x=>textoMaterialPantallaGas(x)).join(' / ')+(p.nodo?' · '+textoMaterialPantallaGas(p.nodo.replace(/^n:|^nombre:/,'')):'')+(p.confirmado?' · registrado confirmado':' · registrado por revisar')}));
}
function filasConciliacionGas(entrada=entradaMaterialesGas('proyecto',false,true)){
 const piezas=piezasConciliacionGas(entrada),filas=[];
 for(const t of tramos){
  const datos=conteoRapidoDelTramoGas(t),extremos=[t.desde,t.hasta].map(nodoConciliacionGas);
  for(const [tipo,nombre]of tiposRapidosGas){
   const valor=Object.hasOwn(datos,tipo)?datos[tipo]:null,cantidad=Number.isSafeInteger(valor)&&valor>=0?valor:null;
   const candidatos=piezas.filter(p=>p.tipo===tipo||(tipo==='reduccion'&&p.reductor)).map(p=>{
    const directa=p.ubicaciones.some(u=>u===t.id||u===t.desde+'–'+t.hasta||u.startsWith(t.id+' · accesorio '));
    const compartida=p.nodo&&extremos.includes(p.nodo);
    const ubicada=p.nodo||p.ubicaciones.some(u=>tramos.some(x=>u===x.id||u===x.desde+'–'+x.hasta||u.startsWith(x.id+' · accesorio ')));
    return {...p,directa,seleccionable:directa||compartida||!ubicada};
   }).filter(p=>p.seleccionable);
   const ajustes=(datosPlanGas().revisiones.proyecto?.filas||[]).filter(x=>x.editado&&x.tipo===tipo&&x.cantidad!==x.cantidadCalculada&&!String(x.ubicacion).includes('carga rápida conciliada')).map(x=>({tipo:x.tipo,cantidad:x.cantidad,calculada:x.cantidadCalculada,ubicacion:x.ubicacion}));
   const clave=JSON.stringify([t.id,tipo]),firma=JSON.stringify({tramo:t,datos:tipo==='reduccion'?datos:datos[tipo],entrada,ajustes});
   filas.push({clave,firma,tipo,nombre,tramo:t,cantidad,candidatos,ajustes});
  }
 }
 return filas;
}
function mismaSugerenciaConGeometriaGas(anterior,actual){
 try{
  const proyectar=firma=>{const x=JSON.parse(firma);if(!x.datos||!Array.isArray(x.afectados))throw Error('Firma desconocida');for(const t of x.afectados)if(t.detalle){delete t.detalle.metrosFinal;delete t.detalle.estado;for(const a of t.detalle.accesorios||[])delete a.metrosAntes;}return JSON.stringify(x);};
  return proyectar(anterior)===proyectar(actual);
 }catch(error){return false;}
}
// Mantener revisiones de cantidades si sólo cambian distancias/estado geométrico.
// Nodo, tipo, cantidad, medidas, orden, alcance y ajustes manuales siguen protegidos.
function mismaCantidadConGeometriaGas(anterior,actual){
 try{
  const proyectar=firma=>{
   const x=JSON.parse(firma);if(!x.tramo||!x.entrada||!Array.isArray(x.entrada.tramos))throw Error('Firma desconocida');
   if(x.tramo.detalle){delete x.tramo.detalle.metrosFinal;delete x.tramo.detalle.estado;for(const a of x.tramo.detalle.accesorios||[])delete a.metrosAntes;}
   for(const t of x.entrada.tramos){delete t.segmentos;for(const a of t.accesorios||[]){delete a.confirmado;if(a.medidas)a.medidas=a.medidas.map(d=>d===''||d==null?null:d);}}
   return JSON.stringify(x);
  };
  return proyectar(anterior)===proyectar(actual);
 }catch(error){return false;}
}
function validarConciliacionGas(f,r){
 if(!Number.isSafeInteger(f.cantidad)||f.cantidad<0)return 'Cantidad pendiente: completá la carga rápida; vacío no es cero.';
 if(!r||!r.confirmado)return 'Revisión pendiente.';
 if(r.firma!==f.firma&&!mismaCantidadConGeometriaGas(r.firma,f.firma))return 'Datos cambiados: revisar los vínculos antes de incorporar adicionales.';
 if(f.ajustes.length)return 'Hay cantidades de este tipo ajustadas manualmente en materiales. Revisalas antes de sumar piezas rápidas; los ajustes se conservan.';
 if(!r.alcance)return 'Confirmá que el conteo es el total del tramo y revisaste todas las coincidencias.';
 if(!Number.isSafeInteger(r.adicionales)||r.adicionales<0)return 'Confirmá cuántas piezas son adicionales, incluso si son cero.';
 let cubiertas=0;
 for(const p of f.candidatos){
  if(p.conflicto||!Number.isSafeInteger(p.cantidad)||p.cantidad<=0)return 'Hay datos contradictorios para una pieza registrada. Corregilos antes de conciliar.';
  const relacion=r.vinculos?.[p.id];
  if(!['incluido','fuera'].includes(relacion))return 'Coincidencia ambigua: indicá si cada pieza ya está incluida o queda fuera del conteo.';
  if(relacion==='fuera'&&p.directa)return 'No conciliado: '+p.etiqueta+' está registrado dentro de '+f.tramo.desde+'–'+f.tramo.hasta+'. «Fuera de este conteo» no elimina esa pieza. Abrí «Editar detalle '+f.tramo.desde+'–'+f.tramo.hasta+'»: si la pieza es una tee, corregí su tipo y punto real; si es otro codo, revisá el total rápido. No se modificó ninguna cantidad ni se agregó material.';
  if(relacion==='incluido')cubiertas+=p.cantidad;
 }
 if(cubiertas+r.adicionales!==f.cantidad)return 'El total rápido debe coincidir con las piezas ya representadas más las adicionales. No se sumó nada.';
 if(r.adicionales&&['tee','reduccion'].includes(f.tipo)){
  if(r.adicionales!==1)return 'Para varias tees o reducciones nuevas, identificá cada pieza en la carga detallada; esta conciliación permanece pendiente.';
  if(!r.nodo||instalacionGas.nodos.filter(n=>n.id===r.nodo).length!==1)return 'Identificá el punto real de la nueva tee o reducción. No se inventa su ubicación.';
  const nodo=nodoConciliacionGas(r.nodo);
  if(f.candidatos.some(p=>p.nodo===nodo))return 'Ya existe una pieza en ese punto: vinculala como incluida o aclarala en la carga detallada; no se agregó otra.';
  const extremos=[f.tramo.desde,f.tramo.hasta].map(nodoConciliacionGas);
  if(!extremos.includes(nodo))return 'El punto no coincide con los extremos conocidos del tramo. Registrá la posición en la carga detallada.';
 }
 return null;
}
function estadoConciliacionGas(entrada=entradaMaterialesGas('proyecto',false,true)){
 const registros=proyectoGasActual().conciliacionRapidaGas?.registros||{};
 const filas=filasConciliacionGas(entrada).map(f=>{const revision=registros[f.clave];return {...f,revision,error:validarConciliacionGas(f,revision)};});
 // Dos adicionales en el mismo punto no se resuelven eligiendo uno arbitrariamente.
 const porPunto=new Map();for(const f of filas)if(!f.error&&f.revision.adicionales&&f.revision.nodo){const k=f.tipo+':'+nodoConciliacionGas(f.revision.nodo);if(!porPunto.has(k))porPunto.set(k,[]);porPunto.get(k).push(f);}
 for(const grupo of porPunto.values())if(grupo.length>1)for(const f of grupo)f.error='Dos revisiones agregan la misma pieza en el mismo punto. Resolver antes de incorporar.';
 return filas;
}
function accesoriosRapidosConciliadosGas(entrada){
 return estadoConciliacionGas(entrada).filter(f=>!f.error&&f.revision.adicionales>0).map(f=>({
  idFisico:'conciliacion:'+f.clave,tipo:f.tipo,cantidad:f.revision.adicionales,medidas:[],confirmado:true,
  tramo:f.tramo.id,nodo:f.revision.nodo||null,
  ubicacion:f.tramo.desde+'–'+f.tramo.hasta+' · carga rápida conciliada'+(f.revision.nodo?' · '+instalacionGas.nodos.find(n=>n.id===f.revision.nodo).nombre:' · posición pendiente'),
  evidencia:'Cantidad conciliada por el usuario. Diámetros/conexiones pendientes. Sin equivalentes ni posiciones deducidas.'
 }));
}
function avisoConciliacionRapidaGas(){
 const filas=estadoConciliacionGas(),revisadas=filas.filter(f=>!f.error).length;
 const pendientes=filas.filter(f=>f.error&&f.cantidad!==null).length;
 return 'Carga rápida: '+revisadas+' conteos conciliados; '+pendientes+' conteos cargados pendientes de revisión. Sólo los adicionales conciliados participan en materiales; los campos vacíos siguen pendientes. Medidas y posiciones no se deducen.';
}
function guardarConciliacionGas(clave,edicion,confirmar){
 const f=filasConciliacionGas().find(f=>f.clave===clave);if(!f){mostrarRespuestaConciliacionGas(clave,'Tramo no disponible. Se conservó la revisión anterior.',true);return false;}
 const revision={...edicion,confirmado:!!confirmar,firma:f.firma};
 const error=confirmar?validarConciliacionGas(f,revision):null;
 if(error){mostrarRespuestaConciliacionGas(clave,error,true);return false;}
 const p=proyectoGasActual();if(p.conciliacionRapidaGas&&(p.conciliacionRapidaGas.version!==1||!p.conciliacionRapidaGas.registros||typeof p.conciliacionRapidaGas.registros!=='object'||Array.isArray(p.conciliacionRapidaGas.registros)||!Array.isArray(p.conciliacionRapidaGas.historial))){mostrarRespuestaConciliacionGas(clave,'Formato de revisión no reconocido: se conservó sin sobrescribir. Revisá el respaldo.',true);return false;}
 if(!p.conciliacionRapidaGas)p.conciliacionRapidaGas={version:1,registros:{},historial:[]};
 const d=p.conciliacionRapidaGas;if(d.registros[clave])d.historial.push({clave,revision:d.registros[clave]});d.registros[clave]=revision;
 guardarDatos();generarPlanGas('proyecto');renderConciliacionRapidaGas();
 const actual=estadoConciliacionGas().find(x=>x.clave===clave);
 const almacenado=proyectoGuardadoGas();
 const mensaje=JSON.stringify(almacenado?.conciliacionRapidaGas)!==JSON.stringify(d)?'Revisión sólo en sesión: descargá un respaldo antes de cerrar.':confirmar?(actual.error||'Revisión confirmada. Cantidades conciliadas; la revisión técnica sigue pendiente.'):'Vínculos guardados como pendientes; no se agregaron piezas.';
 mostrarRespuestaConciliacionGas(clave,mensaje,!!(confirmar&&actual.error));
 return true;
}
let vistaConciliacionGas=[];
function mostrarRespuestaConciliacionGas(clave,mensaje,error=false){
 $('conciliacionMensaje').textContent=mensaje;
 const vista=vistaConciliacionGas.find(v=>v.clave===clave&&v.proyecto===proyectoGasActual());
 if(!vista?.respuesta)return;
 const respuesta=vista.respuesta;respuesta.textContent=textoMaterialPantallaGas(mensaje);respuesta.hidden=false;
 respuesta.className=(error?'aviso':'nota')+' conciliacion-respuesta';respuesta.role=error?'alert':'status';respuesta.ariaLive=error?'assertive':'polite';
 vista.grupo.open=true;vista.card.open=true;
 if(error){if(respuesta.focus)respuesta.focus({preventScroll:true});if(respuesta.scrollIntoView)respuesta.scrollIntoView({block:'nearest'});}
}
function renderConciliacionRapidaGas(){
 const out=$('conciliacionFilas');if(!out||modulo!=='gas')return;
 const proyecto=proyectoGasActual(),previas=vistaConciliacionGas.filter(v=>v.proyecto===proyecto),anteriores=new Map(previas.map(v=>[v.clave,v]));
 out.replaceChildren();vistaConciliacionGas=[];
 const texto=(padre,t)=>{const p=document.createElement('p');p.textContent=textoMaterialPantallaGas(t);padre.append(p);};
 const estado=estadoConciliacionGas();renderPropuestasCoincidenciaGas(estado);
 const filas=estado.filter(f=>!$('conciliacionSoloCargados').checked||f.cantidad!==null||f.revision);
 if(!filas.length){texto(out,'No hay cantidades cargadas para revisar. Registralas en el detalle del tramo o desmarcá el filtro para ver los pendientes.');return;}
 let grupo=null,tramoAnterior=null;
 for(const f of filas){
  if(tramoAnterior!==f.tramo.id){grupo=document.createElement('details');grupo.className='gas-detalles';grupo.open=previas.find(v=>v.tramo===f.tramo.id)?.grupo.open||false;const resumen=document.createElement('summary');resumen.textContent=f.tramo.desde+'–'+f.tramo.hasta;grupo.append(resumen);const editar=document.createElement('button');editar.className='alt';editar.textContent='Editar detalle '+f.tramo.desde+'–'+f.tramo.hasta;editar.onclick=()=>editarDetalleDesdeConciliacionGas(f.tramo.id);grupo.append(editar);out.append(grupo);tramoAnterior=f.tramo.id;}
  const card=document.createElement('details');card.className='detalle';const titulo=document.createElement('summary');titulo.textContent=f.tramo.desde+'–'+f.tramo.hasta+' · '+f.nombre+' · '+(f.cantidad===null?'Pendiente':f.cantidad===0?'0 confirmado':f.cantidad+' confirmados')+' · '+(f.error?'Por revisar':'Conciliado');card.append(titulo);grupo.append(card);
  const anterior=anteriores.get(f.clave);card.open=anterior?.card.open||false;
  let r=f.revision||{};
  if(anterior?.firma===f.firma&&anterior.revision===f.revision&&anterior.cantidad)r={...r,vinculos:Object.fromEntries(anterior.controles.map(([id,c])=>[id,c.value])),adicionales:anterior.cantidad.value===''?null:Number(anterior.cantidad.value),nodo:anterior.punto.value||null,alcance:anterior.alcance.checked};
  const vista={clave:f.clave,firma:f.firma,revision:f.revision,proyecto,tramo:f.tramo.id,grupo,card};vistaConciliacionGas.push(vista);
  if(f.error)texto(card,f.error);
  if(f.cantidad===null){texto(card,'Completá este dato en Revisar accesorios → Carga rápida. No equivale a cero.');continue;}
  const registradas=f.candidatos.filter(p=>p.directa).reduce((s,p)=>s+p.cantidad,0);if(registradas>f.cantidad){texto(card,'El detalle tiene '+registradas+' piezas de este tipo y el conteo rápido '+f.cantidad+'. ¿Cuál refleja tu instalación? Revisá el detalle o corregí el conteo; no se cambió ninguno.');const editar=document.createElement('button');editar.className='alt';editar.textContent='Editar cantidades rápidas de este tramo';editar.onclick=()=>{const i=tramos.findIndex(t=>t.id===f.tramo.id);if(i<0)return;mostrarVista('croquis');abrirAccesorios(i);$('cargaRapidaGas').open=true;};card.append(editar);}
  const controles=[];
  for(const p of f.candidatos){const label=document.createElement('label');label.textContent=p.etiqueta+' · cantidad '+p.cantidad;const select=document.createElement('select');for(const [v,t]of [['','Pendiente: no sé si es la misma pieza'],['incluido','Ya está incluida en este total'],['fuera','Fuera de este conteo (requiere revisión)']]){const option=document.createElement('option');option.value=v;option.textContent=t;select.append(option);}select.value=r.vinculos?.[p.id]||'';label.append(select);if(p.directa){const ayuda=document.createElement('small');ayuda.textContent='Registrada dentro de este tramo: elegir Fuera bloqueará la confirmación. Corregí el detalle si el tipo es incorrecto.';label.append(ayuda);}select.onchange=()=>{if(select.value==='fuera'&&p.directa)mostrarRespuestaConciliacionGas(f.clave,'Esta pieza figura dentro de '+f.tramo.desde+'–'+f.tramo.hasta+'. «Fuera de este conteo» no la elimina: revisá «Editar detalle '+f.tramo.desde+'–'+f.tramo.hasta+'» antes de confirmar.',true);else mostrarRespuestaConciliacionGas(f.clave,'Coincidencia modificada. Revisá el total y confirmá; aún no se guardó este cambio.');};card.append(label);controles.push([p.id,select]);}
  if(!f.candidatos.length)texto(card,'No se encontraron piezas registradas del mismo tipo para este alcance. Revisá el croquis antes de confirmar adicionales.');
  const label=document.createElement('label'),cantidad=document.createElement('input');label.textContent='Piezas adicionales (0 si ya están todas representadas)';cantidad.type='number';cantidad.min='0';cantidad.step='1';cantidad.inputMode='numeric';cantidad.placeholder='Pendiente';cantidad.value=r.adicionales??'';label.append(cantidad);card.append(label);
  const cero=document.createElement('button');cero.className='alt';cero.textContent='Sin piezas adicionales (0)';cero.onclick=()=>{cantidad.value=0;mostrarRespuestaConciliacionGas(f.clave,'Cero adicionales seleccionado. Revisá las coincidencias antes de confirmar.');};card.append(cero);
  const punto=document.createElement('select');if(['tee','reduccion'].includes(f.tipo)){const l=document.createElement('label');l.textContent='Punto real de la pieza adicional (si hay una)';const vacio=document.createElement('option');vacio.value='';vacio.textContent='Pendiente: no inventar posición';punto.append(vacio);for(const n of instalacionGas.nodos||[]){const o=document.createElement('option');o.value=n.id;o.textContent=n.nombre;punto.append(o);}punto.value=r.nodo||'';l.append(punto);card.append(l);}
  const l=document.createElement('label'),alcance=document.createElement('input');l.className='gas-revision-check';l.textContent='Confirmo el total del tramo y revisé todas las coincidencias';alcance.type='checkbox';alcance.checked=!!r.alcance;l.append(alcance);card.append(l);
  const respuesta=document.createElement('p');respuesta.className='nota conciliacion-respuesta';respuesta.role='status';respuesta.ariaLive='polite';respuesta.tabIndex=-1;respuesta.hidden=true;
  if(anterior?.firma===f.firma&&anterior.revision===f.revision&&anterior.respuesta&&!anterior.respuesta.hidden){respuesta.textContent=anterior.respuesta.textContent;respuesta.className=anterior.respuesta.className;respuesta.role=anterior.respuesta.role;respuesta.ariaLive=anterior.respuesta.ariaLive;respuesta.hidden=false;}
  card.append(respuesta);Object.assign(vista,{controles,cantidad,punto,alcance,respuesta});
  if(f.candidatos.length){const editar=document.createElement('button');editar.className='alt';editar.textContent='Revisar detalle '+f.tramo.desde+'–'+f.tramo.hasta;editar.onclick=()=>editarDetalleDesdeConciliacionGas(f.tramo.id);card.append(editar);}
  const incluidas=()=>controles.filter(([,c])=>c.value==='incluido').reduce((s,[id])=>s+(f.candidatos.find(p=>p.id===id)?.cantidad||0),0);
  const sugerir=document.createElement('button');sugerir.className='alt';sugerir.textContent='Calcular adicionales según mis coincidencias';sugerir.onclick=()=>{if(controles.some(([,c])=>!['incluido','fuera'].includes(c.value))||incluidas()>f.cantidad){mostrarRespuestaConciliacionGas(f.clave,'Resolvé las coincidencias antes de calcular adicionales; no se cambió ningún dato.',true);return;}cantidad.value=f.cantidad-incluidas();mostrarRespuestaConciliacionGas(f.clave,'Adicionales propuestos según tus vínculos. Revisá y confirmá; aún no se incorporaron.');};card.append(sugerir);
  for(const [confirmar,titulo]of [[false,'Guardar revisión pendiente'],[true,'Confirmar para materiales']]){const b=document.createElement('button');b.className='alt';b.textContent=titulo;b.onclick=()=>guardarConciliacionGas(f.clave,{vinculos:Object.fromEntries(controles.map(([id,c])=>[id,c.value])),adicionales:cantidad.value===''?null:Number(cantidad.value),nodo:punto.value||null,alcance:alcance.checked},confirmar);card.append(b);}
 }
}

// Primera simplificación: proponer coincidencias exactas, nunca aceptar ambigüedades.
function propuestaCoincidenciaGas(f){
 if(!f.error||f.revision||f.cantidad===null||f.ajustes.length)return null;
 if(f.candidatos.some(p=>(!p.directa&&!p.nodo)||p.conflicto||p.reductor||!Number.isSafeInteger(p.cantidad)||p.cantidad<=0))return null;
 if(f.candidatos.reduce((s,p)=>s+p.cantidad,0)!==f.cantidad)return null;
 return {clave:f.clave,firma:f.firma,etiqueta:f.tramo.desde+'–'+f.tramo.hasta+' · '+f.nombre+': '+f.cantidad+' ya representados, 0 adicionales'+(f.candidatos.length?' · '+f.candidatos.map(p=>p.etiqueta).join('; '):' · ausencia confirmada en carga rápida'),edicion:{vinculos:Object.fromEntries(f.candidatos.map(p=>[p.id,'incluido'])),adicionales:0,nodo:null,alcance:true}};
}
function confirmarCoincidenciasClarasGas(propuestas){
 let confirmadas=0,pendientes=0;
 for(const item of propuestas){
  const f=estadoConciliacionGas().find(f=>f.clave===item.clave),propuesta=f&&propuestaCoincidenciaGas(f);
  if(!propuesta||propuesta.firma!==item.firma){pendientes++;continue;}
  if(guardarConciliacionGas(f.clave,propuesta.edicion,true))confirmadas++;else pendientes++;
 }
 const local=proyectoGuardadoGas();
 $('conciliacionMensaje').textContent=confirmadas+' coincidencias confirmadas, sin adicionales. '+pendientes+' casos omitidos o cambiados; revisalos por separado.'+(JSON.stringify(local?.conciliacionRapidaGas)!==JSON.stringify(proyectoGasActual().conciliacionRapidaGas)?' Guardado local no confirmado: conservá un respaldo.':'');
 return {confirmadas,pendientes};
}
function renderPropuestasCoincidenciaGas(filas){
 const out=$('propuestasCoincidenciaGas');if(!out)return;out.replaceChildren();const propuestas=filas.map(propuestaCoincidenciaGas).filter(Boolean);
 const p=document.createElement('p');p.textContent=propuestas.length?propuestas.length+' coincidencias exactas propuestas. Revisá la lista y confirmá una vez; no se agregan piezas.':'No hay coincidencias nuevas que se puedan proponer sin dudas. Las ya conciliadas se conservan.';out.append(p);
 if(!propuestas.length)return;
 const detalles=document.createElement('details'),titulo=document.createElement('summary');titulo.textContent='Ver coincidencias propuestas (incluye ceros confirmados)';detalles.append(titulo);for(const propuesta of propuestas){const p=document.createElement('p');p.textContent=propuesta.etiqueta;detalles.append(p);}out.append(detalles);
 const b=document.createElement('button');b.textContent='Confirmar estas '+propuestas.length+' coincidencias sin adicionales';b.onclick=()=>confirmarCoincidenciasClarasGas(propuestas);out.append(b);
}
function modeloResumenMaterialesGas(plan,ts=tramos){
 const filas=plan.filas.map(f=>({...f,ubicacion:ubicacionLegibleGas(f.ubicacion)}));
 const totales=InformeProyecto.agruparMateriales(filas).map(g=>({...g,cantidadVerificada:g.cantidad!==null&&filas.filter(f=>f.material===g.material&&f.diametro===g.diametro&&f.unidad===g.unidad).every(f=>f.cantidadConfirmada&&!f.editado)}));
 const normal=x=>String(x||'').trim().toLocaleLowerCase('es');
 const asignaciones=plan.filas.map((f,i)=>{
  const nombre=ubicacionLegibleGas(f.ubicacion),ids=ts.filter(t=>{
   if(f.nodo&&[t.desde,t.hasta].map(nodoConciliacionGas).includes(nodoConciliacionGas(f.nodo)))return true;
   const etiqueta=t.desde+'–'+t.hasta,escapar=x=>Array.from(x,c=>/[a-zA-Z0-9_-]/.test(c)?c:String.fromCharCode(92)+c).join('');
   return new RegExp('(^|[\\s,;])'+escapar(etiqueta)+'(?=$|[\\s,;·])').test(nombre)||normal(f.ubicacion)===normal(t.id);
  }).map(t=>t.id);
  return {fila:filas[i],ids,compartida:!!f.nodo&&ids.length>1,distribucionPendiente:!f.nodo&&ids.length>1};
 });
 return {totales,porTramo:ts.map(t=>({tramo:t.desde+'–'+t.hasta,filas:asignaciones.filter(a=>a.ids.includes(t.id))})),sinUbicacion:asignaciones.filter(a=>!a.ids.length)};
}
function renderResumenPrincipalGas(){
 const out=$('resumenPrincipalMaterialesGas');if(!out)return;out.replaceChildren();
 const texto=(padre,t)=>{const p=document.createElement('p');p.textContent=textoMaterialPantallaGas(t);padre.append(p);};
 if(!revisionMaterialesGas){texto(out,'Cargá los tramos y generá la lista. Los datos faltantes se mostrarán como pendientes.');return;}
 if(revisionMaterialesGas.firma!==firmaMaterialesGas()){texto(out,'Resumen desactualizado: generá la lista con los datos actuales. Se conserva el respaldo anterior.');return;}
 const plan=revisionMaterialesGas.plan,modelo=modeloResumenMaterialesGas(plan,fuenteMaterialesGas==='proyecto'?tramos:[]);
 if(plan.manualDirecto){renderListaManualSimpleGas(out,plan,modelo);return;}
 texto(out,fuenteMaterialesGas==='ejemplo'?'EJEMPLO SEPARADO · no es tu proyecto':ambitoGas==='demostracion'?'DEMOSTRACIÓN · no es tu proyecto real':'TOTAL DE MI PROYECTO · lista para revisión');
 if(plan.manualDirecto){texto(out,'Longitud total informada: '+fmt(plan.longitudInformada)+' m de cañería. Cantidades manuales incorporadas sin segunda carga; los datos técnicos pendientes no son cero.');const avisos=document.createElement('details'),sum=document.createElement('summary');sum.textContent='Datos pendientes y advertencias ('+plan.avisos.length+')';avisos.append(sum);for(const aviso of plan.avisos)texto(avisos,aviso);out.append(avisos);}
 texto(out,'Cantidades identificadas, estimaciones y pendientes conservan su estado. No es una lista definitiva de compra ni una validación de diámetros.');
 for(const g of modelo.totales){
  if(plan.manualDirecto)texto(out,g.material+' · '+(g.cantidad===null?'Cantidad pendiente':g.cantidad+' '+g.unidad+' · '+(g.cantidadVerificada?(g.cantidad===0?'ausencia declarada':'cantidad ingresada'):'estimación o ajuste'))+' · '+(!g.diametro||/pendiente/i.test(g.diametro)?'diámetro pendiente':g.diametro+' · medida por verificar'));
  else texto(out,g.material+' · '+(g.cantidad===null?'Cantidad pendiente':g.cantidad+' '+g.unidad)+' · '+(g.diametro||'Medida pendiente')+' · '+g.estado.toUpperCase()+(g.cantidad!==null?(g.cantidadVerificada?' · cantidad identificada; revisión técnica pendiente':' · cantidad estimada o ajustada'):''));
 }
 const detalles=document.createElement('details'),titulo=document.createElement('summary');titulo.textContent='Ver materiales por tramo y piezas compartidas';detalles.append(titulo);
 for(const tramo of modelo.porTramo){const h=document.createElement('h4');h.textContent=tramo.tramo;detalles.append(h);for(const a of tramo.filas)texto(detalles,a.fila.material+' · '+(a.distribucionPendiente?'Distribución por tramo pendiente; cantidad global '+(a.fila.cantidad??'Pendiente'):(a.fila.cantidad??'Pendiente')+' '+a.fila.unidad)+(a.compartida?' · referencia compartida, contada una sola vez en el total':'')+' · '+a.fila.diametro+' · '+a.fila.estado);}
 if(modelo.sinUbicacion.length){texto(detalles,'Materiales con ubicación pendiente de vincular:');for(const a of modelo.sinUbicacion)texto(detalles,a.fila.material+' · '+(a.fila.cantidad??'Pendiente')+' '+a.fila.unidad+' · '+a.fila.diametro);}
 out.append(detalles);texto(out,'Para cambiar cantidades o revisiones, usá las tarjetas editables de abajo. Foto y plano son opcionales.');
}
function mostrarMaterialesPrincipalGas(){
 if(modulo!=='gas')return;mostrarVista('croquis');
 if(!tramos.length){irSeccionGas('tramos');$('resultadoMateriales').textContent='Cargá primero los tramos. La fotografía y el plano son opcionales.';return;}
 generarPlanGas('proyecto',true);
}
function mostrarPlanoOpcionalGas(){
 if(modulo!=='gas')return;mostrarVista('croquis');const out=$('estadoPlanoOpcionalGas');out.replaceChildren();
 const texto=t=>{const p=document.createElement('p');p.textContent=t;out.append(p);};
 texto('Se reutiliza este mismo proyecto: '+tramos.length+' tramos, '+artefactos.length+' artefactos y '+fmt(tramos.reduce((s,t)=>s+t.metros,0))+' m registrados. No se creó otro proyecto.');
 texto('La fotografía es una referencia aportada por vos: no se interpreta automáticamente. El plano es opcional y no se agrega geometría supuesta.');
 for(const t of tramos){const r=evaluarTramo(t);texto(t.desde+'–'+t.hasta+': '+(r.pendiente&&!r.soloMedidasPendientes?'Posiciones/distancias del detalle pendientes. Reutilizá las cantidades conciliadas; no vuelvas a cargarlas.':'Las distancias del detalle ya están cargadas; no hace falta repetirlas.')+' Direcciones y posiciones de dibujo: verificar en el croquis antes de representarlas.');}
 texto('Las cantidades conciliadas no requieren repetirse por abrir esta sección. No se genera un plano 2D nuevo en esta etapa; se conserva el documento y la fotografía actuales.');
 $('planoOpcionalGas').open=true;if($('planoOpcionalGas').scrollIntoView)$('planoOpcionalGas').scrollIntoView({block:'start'});
}
function avisosDeteccionPresentacionGas(avisos){
 const filas=estadoConciliacionGas();return avisos.map(aviso=>{
  const t=tramos.find(t=>aviso===t.desde+'–'+t.hasta+': codos, curvas y posiciones pendientes; no se dedujeron del nombre.');if(!t)return aviso;
  const estados=['codo90','codo45'].map(tipo=>filas.find(f=>f.tramo.id===t.id&&f.tipo===tipo));
  if(!estados.some(f=>f&&!f.error))return aviso;
  return t.desde+'–'+t.hasta+': '+estados.map((f,i)=>(i?'Codos 45°':'Codos 90°')+': '+(f&&!f.error?'cantidad ya conciliada':f?.cantidad===null?'cantidad pendiente':'cantidad por revisar')).join('; ')+'. Curvas, posiciones y geometría siguen pendientes de verificar; no repitas las cantidades conciliadas para un plano opcional.';
 });
}

// Carga manual directa: inventario físico, nunca datos del motor normativo.
function modoManualGasActivo(){return modulo==='gas'&&proyectoGasActual().planCompra?.opciones?.cargaManualDirecta===true;}
function entradaManualMaterialesGas(sinSugerencias=false){
 const entrada=entradaMaterialesGas('proyecto',sinSugerencias,true),filas=filasConciliacionGas(entrada),avisos=[],ceros=[],pendientes=[];
 const clave=(a,t,i)=>a.tipo==='tee'&&a.nodo?'tee:'+nodoConciliacionGas(a.nodo):a.idFisico||JSON.stringify([t?'detalle':'manual',t?.id||'',i]);
 const registros=[];
 for(const pieza of piezasConciliacionGas(entrada).filter(p=>p.conflicto))avisos.push('Datos contradictorios en una pieza física: '+pieza.etiqueta+'. Identidad conservada sin sumar duplicados; medidas por revisar.');
 for(const t of entrada.tramos)for(const [i,a]of t.accesorios.entries())registros.push({a:{...a},tramo:t.id,id:clave(a,t,i)});
 for(const [i,a]of entrada.extras.entries())registros.push({a:{...a},tramo:a.tramo,id:clave(a,null,i)});
 const omitidos=new Set(),nuevos=[];
 for(const f of filas){
  if(f.cantidad===null){
   if(!f.candidatos.some(p=>p.tipo===f.tipo&&p.directa))pendientes.push(f.tramo.desde+'–'+f.tramo.hasta+': '+f.nombre);
   continue;
  }
  const directas=f.candidatos.filter(p=>p.tipo===f.tipo&&p.directa),compartidas=f.candidatos.filter(p=>p.tipo===f.tipo&&p.nodo&&!p.directa);
  let usadas=directas;
  // Reutilizar una identidad ya conocida; nunca deducir un punto a partir de una cantidad.
  if(!usadas.length&&f.cantidad===1&&compartidas.length===1&&compartidas[0].cantidad===1)usadas=compartidas;
  const total=usadas.reduce((n,p)=>n+p.cantidad,0);
  if(directas.length&&total!==f.cantidad)avisos.push(f.tramo.desde+'–'+f.tramo.hasta+': se usa el total manual '+f.cantidad+' de '+f.nombre+'; el detalle ('+total+') se conserva como referencia, sin sumarlo. Posiciones por revisar.');
  for(const p of directas)omitidos.add(p.id);
  if(f.tipo==='reduccion'&&f.cantidad>0&&f.candidatos.some(p=>p.reductor&&p.tipo!=='reduccion')){
   avisos.push(f.tramo.desde+'–'+f.tramo.hasta+': reducción pendiente de distinguir de un accesorio reductor integrado. No se sumó otra pieza por suposición.');pendientes.push(f.tramo.desde+'–'+f.tramo.hasta+': '+f.cantidad+' reducciones informadas; distinguir piezas independientes');continue;
  }
  if(f.tipo==='tee'&&f.cantidad>0&&!directas.length&&compartidas.length>1){
   avisos.push(f.tramo.desde+'–'+f.tramo.hasta+': '+f.cantidad+' tees informadas; hay varias piezas compartidas posibles. Se conservan las identificadas sin sumar otra ni inventar su punto.');pendientes.push(f.tramo.desde+'–'+f.tramo.hasta+': ubicar tee informada');continue;
  }
  if(total>f.cantidad)usadas=[];
  let cubiertas=0;
  for(const p of usadas){
   const original=registros.find(r=>r.id===p.id);if(!original)continue;
   nuevos.push({...original.a,idFisico:p.id,cantidad:p.cantidad,confirmado:true,tramo:f.tramo.id,nodo:original.a.nodo,ubicacion:f.tramo.id+' · cantidad manual (pieza compartida identificada)',evidencia:'Total manual; referencia física existente, sin segunda confirmación.'});cubiertas+=p.cantidad;omitidos.add(p.id);
  }
  const resto=f.cantidad-cubiertas;
  if(resto>0)nuevos.push({idFisico:'manual-total:'+f.clave,tipo:f.tipo,cantidad:resto,medidas:[],confirmado:true,tramo:f.tramo.id,ubicacion:f.tramo.id+' · cantidad manual; posición pendiente',evidencia:'Cantidad ingresada por el usuario como total del tramo. No se suma al detalle ni alimenta equivalentes.'});
  if(f.cantidad===0)ceros.push({tipo:f.tipo,material:({codo90:'Codo 90°',codo45:'Codo 45°',tee:'Tee',reduccion:'Reducción independiente',llave:'Llave de paso'}[f.tipo]||f.nombre),diametro:'Pendiente',cantidad:0,unidad:'unidad',ubicacion:f.tramo.id,estado:'estimado',cantidadConfirmada:true,origen:'manual-cero',evidencia:'Cero ingresado explícitamente; no es un campo vacío.'});
  const t=entrada.tramos.find(t=>t.id===f.tramo.id);
  if(t&&(resto>0||total!==f.cantidad))t.segmentos=null;
 }
 // Mantener detalle no sustituido y extras identificados. Los identificadores físicos deduplican tees compartidas.
 for(const t of entrada.tramos)t.accesorios=[];
 entrada.extras=[...registros.filter(r=>!omitidos.has(r.id)).map(r=>({...r.a,idFisico:r.id,confirmado:true})),...nuevos].map(a=>({...a,nodo:a.tipo==='tee'&&a.nodo?nodoConciliacionGas(a.nodo).replace(/^n:/,''):a.nodo}));
 entrada.manualDirecto={avisos,ceros,pendientes};return filtrarRedManualMaterialesGas(entrada);
}
// Regla de inventario autorizada: no alimenta geometría, equivalentes ni diámetros.
function estadoCodoCasilleroGas(entrada){
 const c=entrada.casilleroMedidorGas||{},orientacion=c.entrada,conteo=c.codo;
 if(orientacion==='superior')return {adicional:0,pendiente:false,mensaje:'Entrada superior: no se agrega un codo dentro del casillero. Los accesorios declarados se conservan.'};
 if(!['lateral','posterior'].includes(orientacion))return {adicional:0,pendiente:true,mensaje:'Casillero M: orientación de entrada pendiente. No se agregó ningún codo por suposición.'};
 if(conteo==='incluido')return {adicional:0,pendiente:false,mensaje:'Entrada '+orientacion+': codo del casillero ya incluido en los accesorios declarados; no se suma otra pieza.'};
 if(conteo!=='no-incluido')return {adicional:0,pendiente:true,mensaje:'Entrada '+orientacion+': indicá si el codo del casillero ya está incluido. No se agregó otra pieza mientras falta el cotejo.'};
 const existentes=[...(entrada.extras||[]),...(entrada.tramos||[]).flatMap(t=>t.accesorios||[])].filter(a=>a.tipo==='codo90'&&a.idFisico==='casillero-medidor:codo90');
 if(existentes.length)return {adicional:0,pendiente:true,mensaje:'El codo del casillero ya tiene una referencia física registrada. Revisá la declaración «no incluido»; no se duplicó la pieza.'};
 return {adicional:1,pendiente:false,mensaje:'Entrada '+orientacion+' confirmada: se agrega un codo de 90° dentro del casillero M, declarado fuera de las cantidades cargadas. Diámetro pendiente.'};
}
function renderCasilleroMedidorGas(){
 if(modulo!=='gas')return;const c=proyectoGasActual().casilleroMedidorGas||{};
 $('entradaCasilleroGas').value=['lateral','posterior','superior'].includes(c.entrada)?c.entrada:'desconocida';
 $('codoCasilleroGas').value=['incluido','no-incluido'].includes(c.codo)?c.codo:'pendiente';
 $('cotejoCodoCasilleroGas').classList.toggle('oculto',!['lateral','posterior'].includes(c.entrada));
 $('estadoCasilleroGas').textContent=estadoCodoCasilleroGas({casilleroMedidorGas:c,extras:proyectoGasActual().planCompra?.extras||[],tramos:tramos.map(t=>({accesorios:t.detalle?.accesorios||[]}))}).mensaje;
}
function guardarCasilleroMedidorGas(){
 if(modulo!=='gas')return false;
 const entrada=$('entradaCasilleroGas').value,codo=$('codoCasilleroGas').value;
 if(!['lateral','posterior','superior','desconocida'].includes(entrada)||!['incluido','no-incluido','pendiente'].includes(codo))return false;
 const anterior=proyectoGasActual().casilleroMedidorGas;
 // Una orientación nueva requiere un nuevo cotejo, no reutiliza una respuesta anterior.
 proyectoGasActual().casilleroMedidorGas={entrada,codo:anterior?.entrada===entrada?codo:'pendiente'};
 guardarDatos();renderCasilleroMedidorGas();renderResumenPrincipalGas();return true;
}
function agregarCodoCasilleroAlPlanGas(plan,entrada){
 if(entrada.origen!=='Proyecto manual actual')return;
 const e=estadoCodoCasilleroGas(entrada);plan.casilleroMedidorGas=e;
 if(entrada.casilleroMedidorGas?.entrada||e.pendiente)plan.avisos.push(e.mensaje);
 if(e.adicional===1)plan.filas.push({id:'casillero-medidor:codo90',tipo:'codo90',material:'Codo 90°',cantidad:1,unidad:'unidad',diametro:'Pendiente',ubicacion:'Interior del casillero M',estado:'estimado',cantidadConfirmada:true,revisado:false,origen:'regla-casillero-confirmada',evidencia:e.mensaje,equivalentes:'No incorporado al dimensionamiento; tipo, diámetro y pérdidas requieren verificación técnica.'});
}
function planificarVistaMaterialesGas(entrada,opciones){
 const manual=entrada.manualDirecto;
 if(manual?.red){const uniones={...opciones.uniones};for(const p of manual.red.puntos){const id=p.id.replace(/^id:/,'');if(Object.hasOwn(uniones,id))uniones[p.id]=uniones[id];}opciones={...opciones,uniones};}
 const plan=MaterialesGas.planificarMateriales(entrada,opciones);agregarCodoCasilleroAlPlanGas(plan,entrada);if(!manual)return plan;
 plan.manualDirecto=true;plan.redManual=manual.red;plan.longitudParcial=manual.red?.ambiguos.length>0;plan.longitudInformada=entrada.tramos.reduce((n,t)=>n+t.metros,0);
 plan.avisos.push(...manual.avisos,...manual.pendientes.map(p=>'Cantidad pendiente: '+p+'. Vacío no equivale a cero.'));
 plan.supuestos.unshift('Carga manual directa: las cantidades rápidas son totales por tramo; el detalle no vuelve a sumarse. No se interpretó la foto ni se agregaron conexiones por reglas de IA.');
 if(plan.longitudParcial)for(const [tipo,material]of [...tiposRapidosGas,['cupla','Cuplas']])plan.filas.push({id:'manual-ambiguo:'+tipo,tipo,material:({codo90:'Codo 90°',codo45:'Codo 45°',tee:'Tee',reduccion:'Reducción independiente',llave:'Llave de paso'}[tipo]||material),cantidad:null,unidad:'unidad',diametro:'Pendiente',ubicacion:'Tramo duplicado con datos contradictorios',estado:'pendiente',revisado:false,evidencia:'Cantidad sin resolver; se conserva el dato original.'});
 for(const f of manual.ceros)plan.filas.push({id:'manual-cero:'+f.ubicacion+':'+f.tipo,revisado:false,...f});
 return plan;
}
function calcularMaterialesManualGas(){
 if(modulo!=='gas')return;
 datosPlanGas().opciones.cargaManualDirecta=true;
 const borrador=()=>['desde','hasta','metros'].some(id=>String($(id).value).trim()!=='');
 if(borrador()){agregarTramo();if(borrador()){$('mensajeCargaManualGas').textContent=$('mensajeCargaManualGas').textContent||'Completá el tramo en edición antes de calcular. No se mostraron resultados anteriores como actuales.';$('resumenPrincipalMaterialesGas').replaceChildren();$('resumenPrincipalMaterialesGas').textContent='Borrador sin guardar: el resultado anterior se conserva como respaldo, no representa los cambios en edición.';if($('cantidadesManualesGas').scrollIntoView)$('cantidadesManualesGas').scrollIntoView({block:'center'});return;}}
 mostrarVista('croquis');$('resultadoMateriales').classList.add('oculto');
 generarPlanGas('proyecto',true);guardarDatos();
 if(!revisionMaterialesGas){$('matMensaje').textContent=$('matResultado').textContent||'No se pudo calcular; los datos se conservaron.';return;}
 $('matMensaje').textContent='Lista actualizada con las cantidades ingresadas. Sin segunda confirmación. Diámetros, posiciones y compra no verificados conservan sus advertencias.';
}
function cargarCantidadesFormularioGas(t){
 const datos=t?conteoRapidoDelTramoGas(t):{};
 for(const [tipo]of tiposRapidosGas){const heredada=tipo==='llave'&&t?cantidadLlavesHeredadasGas(t):null;$('manualGas_'+tipo).value=Number.isSafeInteger(datos[tipo])&&datos[tipo]>=0?datos[tipo]:heredada??'';}
}
function leerCantidadesFormularioGas(){
 const datos={};for(const [tipo]of tiposRapidosGas){const valor=String($('manualGas_'+tipo).value).trim();if(!valor)continue;const n=Number(valor);if(!Number.isSafeInteger(n)||n<0)throw Error('Las cantidades de accesorios deben ser enteros no negativos. Vacío significa pendiente.');datos[tipo]=n;}return datos;
}

// Contrato de la modalidad futura; no ejecuta inferencias ni modifica el proyecto.
function contratoInterpretacionFuturaGas(){return {version:1,modalidad:'ia-premium-futura',habilitada:false,proveedor:null,envioAutomatico:false,revisionObligatoria:true,reglas:[
 {id:'medidor-lateral',condicion:'Entrada lateral o posterior verificada',propuesta:{tipo:'codo90',cantidad:1},ubicacion:'Interior del casillero M',requiereCotejoPiezaExistente:true},
 {id:'medidor-superior',condicion:'Entrada superior verificada',propuesta:{tipo:'codo90',cantidad:0},requiereCotejoPiezaExistente:true},
 {id:'conexion-artefacto',condicion:'Conexion real del artefacto que requiere codo, verificada',propuesta:{tipo:'codo90',cantidad:1},requiereCotejoPiezaExistente:true}
 ],desconocidos:'Señalar la duda; no inventar medidas, posición ni cantidades',aplicarReglasAutomaticamente:false};}

// Vista física no dirigida: no altera tramos, conexiones ni el motor normativo.
function nombrePuntoManualGas(v){return String(v??'').trim().toLocaleLowerCase('es');}
function parFisicoManualGas(t){return JSON.stringify([nombrePuntoManualGas(t.desde),nombrePuntoManualGas(t.hasta)].sort());}
function redFisicaManualGas(ts=tramos,arts=artefactos,inst=instalacionGas){
 const errores=[],avisos=[],puntos=new Map(),porNombre=new Map(),porId=new Map(),pares=new Map(),excluidos=new Set(),ambiguos=new Set();
 const nodos=Array.isArray(inst.nodos)?inst.nodos.filter(n=>n&&typeof n.id==='string'&&typeof n.nombre==='string'):[];
 if(nodos.length!==(Array.isArray(inst.nodos)?inst.nodos.length:0))errores.push('Hay puntos incompletos: revisá sus nombres e identificadores.');
 for(const n of nodos){if(!porNombre.has(nombrePuntoManualGas(n.nombre)))porNombre.set(nombrePuntoManualGas(n.nombre),[]);porNombre.get(nombrePuntoManualGas(n.nombre)).push(n);if(porId.has(n.id))errores.push('Hay identificadores de puntos repetidos.');porId.set(n.id,n);}
 function punto(valor,referencia){
  const texto=nombrePuntoManualGas(valor),ns=porNombre.get(texto)||[];
  if(ns.length>1)errores.push('Punto ambiguo: '+valor+'. Hay nombres repetidos.');
  const n=referencia?porId.get(referencia):ns.length===1?ns[0]:null;
  if(referencia&&!n)errores.push('Conexión no disponible: '+valor+'. Revisá la referencia al punto.');
  const id=n?'id:'+n.id:referencia?'referencia:'+referencia:'nombre:'+texto;
  if(!texto&&!n)errores.push('Hay un extremo sin identificar.');
  if(!puntos.has(id))puntos.set(id,{id,nombre:n?.nombre||String(valor||'Sin punto'),tipo:n?.tipo||null,artefactoId:n?.artefactoId||null});
  return id;
 }
 const firma=t=>JSON.stringify([t.metros,t.diametro||null,t.consumo??null,nombrePuntoManualGas(t.artefacto),!!t.llave,tiposRapidosGas.map(([k])=>conteoRapidoDelTramoGas(t)[k]??null),t.detalle||null]);
 for(const t of [...ts].sort((a,b)=>String(a.id).localeCompare(String(b.id)))){
  let refs=t.red||{};const nd=porId.get(refs.desde),nh=porId.get(refs.hasta),desde=nombrePuntoManualGas(t.desde),hasta=nombrePuntoManualGas(t.hasta);
  if(nd&&nh){const reales=[nombrePuntoManualGas(nd.nombre),nombrePuntoManualGas(nh.nombre)];if(reales[0]===hasta&&reales[1]===desde)refs={...refs,desde:refs.hasta,hasta:refs.desde};else if(reales[0]!==desde||reales[1]!==hasta)errores.push('Conexiones y nombres no coinciden en '+t.desde+'–'+t.hasta+'. Revisalos sin volver a cargar el tramo.');}
  const a=punto(t.desde,refs.desde),b=punto(t.hasta,refs.hasta),clave=JSON.stringify([a,b].sort());
  if(a===b)errores.push('El tramo '+t.desde+'–'+t.hasta+' une el mismo punto consigo mismo.');
  if(pares.has(clave)){
   const previo=pares.get(clave);excluidos.add(t.id);avisos.push('Tramo duplicado '+t.desde+'–'+t.hasta+': se conserva el registro original y se cuenta una sola conexión física.');
   if(firma(previo.t)!==firma(t)){ambiguos.add(previo.t.id);avisos.push('Los registros de '+t.desde+'–'+t.hasta+' tienen datos distintos: cantidades y longitud de esa conexión pendientes, sin elegir uno por suposición.');errores.push('Resolver los datos distintos del tramo duplicado '+t.desde+'–'+t.hasta+'.');}
  }else pares.set(clave,{t,a,b});
 }
 const aristas=[...pares.values()],ady=new Map([...puntos.keys()].map(id=>[id,[]]));
 for(const e of aristas){ady.get(e.a).push(e);ady.get(e.b).push(e);}
 const formales=nodos.filter(n=>n.tipo==='medidor');if(formales.length>1)errores.push('Hay más de un medidor registrado.');if(formales.length===1&&!puntos.has('id:'+formales[0].id))errores.push('El medidor registrado no tiene tramos conectados.');
 const medidores=[...puntos.values()].filter(n=>n.tipo==='medidor'),ms=medidores.length?medidores:[...puntos.values()].filter(n=>nombrePuntoManualGas(n.nombre)==='m');
 if(ms.length!==1)errores.push('Identificá un único medidor M para calcular los consumos.');
 const raiz=ms.length===1?ms[0].id:null,visitados=new Set(),orden=[],orientacion=Object.create(null),padre=new Map();
 if(raiz){const cola=[raiz];visitados.add(raiz);for(let i=0;i<cola.length;i++){const id=cola[i];orden.push(id);for(const e of ady.get(id)||[]){const otro=e.a===id?e.b:e.a;if(padre.get(id)?.e===e)continue;if(visitados.has(otro)){errores.push('Hay un circuito cerrado o más de un recorrido entre puntos.');continue;}visitados.add(otro);padre.set(otro,{id,e});orientacion[e.t.id]={desde:id,hasta:otro,invertido:e.a!==id};cola.push(otro);}}}
 for(const n of puntos.values())if(raiz&&!visitados.has(n.id))errores.push('Red desconectada: '+n.nombre+' no llega al medidor.');
 // Un punto formal aislado tampoco se elimina silenciosamente del diagnóstico.
 for(const n of nodos)if(![...puntos.values()].some(p=>p.id==='id:'+n.id))avisos.push('Punto sin tramos: '+n.nombre+'.');
 const demanda=new Map(),usados=new Set(),faltantes=[],porTramo=Object.create(null),parciales=Object.create(null);
 for(let i=orden.length-1;i>=0;i--){
  const id=orden[i],n=puntos.get(id),hijos=(ady.get(id)||[]).filter(e=>orientacion[e.t.id]?.desde===id);
  if(hijos.length){if(n.tipo==='artefacto')errores.push('El artefacto '+n.nombre+' tiene otros tramos después de su conexión.');let total=0,conocido=0;for(const e of hijos){const d=demanda.get(orientacion[e.t.id].hasta);porTramo[e.t.id]=d?.total??null;parciales[e.t.id]=d?.conocido??0;if(d?.total===null||!d)total=null;else if(total!==null)total+=d.total;conocido+=d?.conocido??0;}demanda.set(id,{total,conocido});continue;}
  if(id===raiz){demanda.set(id,{total:0,conocido:0});continue;}
  const e=padre.get(id)?.e,t=e?.t,etiqueta=nombrePuntoManualGas(t?.artefacto)||nombrePuntoManualGas(n.nombre);
  let candidatos=n.artefactoId?arts.filter(a=>a.id===n.artefactoId):arts.filter(a=>nombrePuntoManualGas(a.nombre)===etiqueta);
  let consumo=null;
  if(candidatos.length===1){const a=candidatos[0],key=a.id||a;if(usados.has(key)){errores.push('El artefacto '+a.nombre+' está conectado más de una vez.');}else{usados.add(key);if(Number.isFinite(a.consumo)&&a.consumo>0)consumo=a.consumo;}}
  else if(candidatos.length>1)errores.push('Consumo ambiguo en '+n.nombre+': hay más de un artefacto con ese nombre.');
  else if(n.artefactoId)errores.push('El artefacto vinculado a '+n.nombre+' no está disponible.');
  else if(Number.isFinite(t?.consumo)&&t.consumo>0)consumo=t.consumo;
  if(consumo===null)faltantes.push('Consumo pendiente en '+n.nombre+': indicá su artefacto o consumo de placa.');
  demanda.set(id,{total:consumo,conocido:consumo??0});
 }
 for(const a of arts)if(!usados.has(a.id||a))faltantes.push('Artefacto sin conexión inequívoca: '+a.nombre+'.');
 if([...demanda.values()].some(d=>d.total!==null&&!Number.isFinite(d.total)))errores.push('La suma de consumos excede el rango permitido.');
 for(const t of ts)if(Number.isFinite(t.consumo)&&Number.isFinite(porTramo[t.id])&&Math.abs(t.consumo-porTramo[t.id])>1e-6)avisos.push('El consumo manual de '+t.desde+'–'+t.hasta+' difiere de los artefactos conectados. Se conserva sin cambiarlo; el acumulado usa los consumos de placa vinculados.');
 if(errores.length)for(const k of Object.keys(porTramo))porTramo[k]=null;
 const grupos=aristas.map(e=>({id:e.t.id,desde:e.a,hasta:e.b}));
 return {errores:[...new Set(errores)],avisos:[...new Set(avisos)],faltantes:[...new Set(faltantes)],porTramo,parciales,total:errores.length||faltantes.length?null:demanda.get(raiz)?.total??null,orientacion,puntos:[...puntos.values()],grupos,excluidos:[...excluidos],ambiguos:[...ambiguos],listoParaDimensionar:false};
}
function filtrarRedManualMaterialesGas(entrada){
 const red=redFisicaManualGas(),retirados=new Set([...red.excluidos,...red.ambiguos]);
 entrada.tramos=entrada.tramos.filter(t=>!retirados.has(t.id));
 entrada.extras=entrada.extras.filter(a=>!retirados.has(a.tramo)&&![...retirados].some(id=>a.ubicacion===id||String(a.ubicacion||'').startsWith(id+' · ')));
 entrada.manualDirecto.ceros=entrada.manualDirecto.ceros.filter(f=>!retirados.has(f.ubicacion));
 entrada.manualDirecto.red=red;
 entrada.manualDirecto.avisos.push(...red.avisos,...red.errores,...red.faltantes);
 entrada.nodos=red.puntos.map(n=>({id:n.id,nombre:n.nombre}));
 for(const a of entrada.extras)if(a.nodo){const punto=red.puntos.find(p=>p.id==='id:'+a.nodo||p.id===a.nodo||nombrePuntoManualGas(p.nombre)===nombrePuntoManualGas(String(a.nodo).replace(/^nombre:/,'')));if(punto)a.nodo=punto.id;}
 for(const t of entrada.tramos){const o=red.orientacion[t.id];if(o){t.red={desde:o.desde,hasta:o.hasta};if(o.invertido){const inicial=t.diametro;t.diametro=t.diametroFinal||t.diametro;t.diametroFinal=inicial;}}}
 return entrada;
}

function cantidadLlavesHeredadasGas(t){const detalle=(t.detalle?.accesorios||[]).filter(a=>a.tipo==='llave').length;return detalle||t.llave?Math.max(detalle,t.llave?1:0):null;}

function resumenListaManualGas(plan){
 const grupos=new Map(),diametro=d=>!d||/pendiente/i.test(d)?'':String(d).trim();
 const agregar=(tipo,material,medida,unidad,cantidad,pendiente=false,estimado=false)=>{
  const key=JSON.stringify([tipo,material,diametro(medida),unidad]);if(!grupos.has(key))grupos.set(key,{tipo,material,diametro:diametro(medida),unidad,cantidad:0,pendiente:false,estimado:false});
  const g=grupos.get(key);if(Number.isFinite(cantidad))g.cantidad+=cantidad;else g.pendiente=true;g.pendiente||=pendiente;g.estimado||=estimado;
 };
 for(const p of plan.planes)agregar('cano','Caño'+(p.material?' '+p.material:'')+(p.sistema?' / '+p.sistema:''),p.diametro,'m',p.metros,!!plan.longitudParcial);
 if(!plan.planes.length&&plan.longitudParcial)agregar('cano','Caño','','m',null);
 for(const f of plan.filas){
  if(f.tipo==='cano')continue;const tipo=f.tipo==='cupla-plan'?'cupla':f.tipo;
  const material=tipo==='cupla'?'Cuplas':tipo==='tee'&&!/reductora|igual/i.test(f.material)?'Tee':f.material;
  agregar(tipo,material,f.diametro,f.unidad||'unidad',f.cantidad,false,!f.cantidadConfirmada||!!f.editado);
 }
 return [...grupos.values()].sort((a,b)=>(a.tipo==='cano'&&b.tipo!=='cano'?-1:a.tipo!=='cano'&&b.tipo==='cano'?1:a.material.localeCompare(b.material,'es'))||a.diametro.localeCompare(b.diametro));
}
function avisosListaManualGas(plan){
 const avisos=new Set(['Los diámetros definitivos siguen bloqueados. Esta lista no acredita cumplimiento normativo.']);
 for(let aviso of plan.avisos){
  if(/^Diámetro pendiente en /.test(aviso))aviso='Diámetros pendientes: no se eligieron medidas de caños ni accesorios.';
  else if(/^Faltan segmentos entre accesorios en /.test(aviso))aviso='Faltan distancias entre accesorios: compra comercial y cuplas reales pendientes.';
  else if(/^Medida\/material\/sistema incompletos en /.test(aviso))aviso='Material, sistema o medidas incompletos: no se propone aprovechar sobrantes sin comprobar compatibilidad.';
  else if(/^Cantidad pendiente: /.test(aviso))aviso='Cantidad pendiente: hay campos sin informar. Consultá los datos por tramo; vacío no equivale a cero.';
  avisos.add(textoMaterialPantallaGas(aviso));
 }
 return [...avisos];
}
function renderListaManualSimpleGas(out,plan,modelo){
 const texto=(padre,s)=>{const p=document.createElement('p');p.textContent=textoMaterialPantallaGas(s);padre.append(p);};
 texto(out,ambitoGas==='demostracion'?'DEMOSTRACIÓN · lista de materiales':ambitoGas==='proyecto'&&!proyectos.gas.nombreProyecto?'MI PROYECTO · lista de materiales':nombreProyectoGas()+' · lista de materiales');
 const tabla=document.createElement('table');tabla.className='tabla gas-lista-simple';if(resumenListaManualGas(plan).some(f=>!f.diametro)){const caption=document.createElement('caption');caption.textContent='Diámetros: pendientes de verificación.';tabla.append(caption);}const head=document.createElement('thead'),hr=document.createElement('tr');for(const s of ['Material','Cantidad']){const th=document.createElement('th');th.textContent=s;hr.append(th);}head.append(hr);tabla.append(head);const body=document.createElement('tbody');
 for(const f of resumenListaManualGas(plan)){
  const tr=document.createElement('tr'),nombre=document.createElement('td'),cantidad=document.createElement('td');nombre.textContent=f.material+(f.diametro?' · '+f.diametro:'');
  cantidad.textContent=f.pendiente?(f.cantidad>0?fmt(f.cantidad)+' '+f.unidad+' conocidas · resto pendiente':'Pendiente'):fmt(f.cantidad)+' '+f.unidad+(f.estimado&&f.cantidad>0?' estimadas':'');tr.append(nombre,cantidad);body.append(tr);
 }
 tabla.append(body);out.append(tabla);
 const pendientes=document.createElement('details'),titulo=document.createElement('summary');pendientes.className='gas-detalles';titulo.textContent='Datos técnicos pendientes';pendientes.append(titulo);for(const s of avisosListaManualGas(plan))texto(pendientes,s);renderEstadoCierreGas(out,pendientes,plan);out.append(pendientes);
 const detalles=document.createElement('details'),sum=document.createElement('summary');sum.textContent='Ver detalle por tramo y consumos';detalles.append(sum);
 const red=plan.redManual;
 if(red)texto(detalles,red.total===null?'Consumo total conectado: Pendiente. Los consumos parciales conocidos se conservan.':'Consumo total conectado: '+fmt(red.total)+' kcal/h, sin aplicar reducción por simultaneidad. No dimensiona diámetros.');
 for(const tramo of modelo.porTramo){
  const h=document.createElement('h4');h.textContent=tramo.tramo;detalles.append(h);const t=tramos.find(t=>t.desde+'–'+t.hasta===tramo.tramo);
  if(t&&red){const consumo=red.porTramo[t.id];texto(detalles,'Consumo acumulado: '+(Number.isFinite(consumo)?fmt(consumo)+' kcal/h':'Pendiente'));}
  for(const a of tramo.filas)texto(detalles,a.fila.material+' · '+(a.fila.cantidad??'Pendiente')+' '+a.fila.unidad+(a.compartida?' · referencia compartida; una sola pieza en el total':'')+' · '+a.fila.diametro);
 }
 if(modelo.sinUbicacion.length)for(const a of modelo.sinUbicacion)texto(detalles,a.fila.material+' · '+(a.fila.cantidad??'Pendiente')+' '+a.fila.unidad+' · '+(a.fila.ubicacion?ubicacionLegibleGas(a.fila.ubicacion):'ubicación pendiente'));
 out.append(detalles);
}

function renderEstadoRedManualGas(out){
 const r=redFisicaManualGas();out.replaceChildren();const texto=s=>{const p=document.createElement('p');p.textContent=s;out.append(p);};
 texto('Red física manual: sentidos de cálculo derivados desde el medidor; tus extremos guardados no se modifican.');
 texto('Dimensionamiento definitivo BLOQUEADO: faltan verificaciones normativas y de suministro.');
 for(const s of [...r.errores,...r.avisos,...r.faltantes])texto(s);
 texto(r.total===null?'Consumo conectado total: Pendiente.':'Consumo conectado total: '+fmt(r.total)+' kcal/h.');
 for(const t of tramos)texto(t.desde+'–'+t.hasta+': '+(Number.isFinite(r.porTramo[t.id])?fmt(r.porTramo[t.id])+' kcal/h acumulados':'Consumo pendiente'));
}
