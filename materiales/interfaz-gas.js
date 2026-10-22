/* Interfaz de revisión de materiales; usa el estado existente, nunca activa diámetros. */
let revisionMaterialesGas=null,fuenteMaterialesGas='proyecto';
function datosPlanGas(){
 const p=proyectoGasActual();
 if(!p.planCompra||typeof p.planCompra!=='object'||Array.isArray(p.planCompra))p.planCompra={};
 const d=p.planCompra;if(!d.opciones||typeof d.opciones!=='object')d.opciones={};if(!Array.isArray(d.extras))d.extras=[];if(!d.revisiones||typeof d.revisiones!=='object')d.revisiones={};return d;
}
function entradaMaterialesGas(fuente='proyecto',sinSugerencias=false,sinConciliacion=false){
 if(fuente==='ejemplo')return {origen:'Ejemplo educativo calefón/cocina; no incorporado al proyecto',material:'Acero epoxi',sistema:'Roscado',nodos:[{id:'M'},{id:'A'},{id:'Calefón'},{id:'Cocina'}],tramos:[['M','A',19,5,0,'1"'],['A','Calefón',18,7,1,'1"'],['A','Cocina',12,5,1,'3/4"']].map(([desde,hasta,metros,codos,llaves,diametro])=>({id:desde+'-'+hasta,metros,diametro,medidasEstimadas:true,red:{desde,hasta},segmentos:null,accesorios:[{tipo:'codo90',cantidad:codos,medidas:[diametro,diametro],confirmado:true,medidasEstimadas:true,evidencia:'Cantidad aportada en el ejercicio; medidas del diagnóstico condicionado'},...(llaves?[{tipo:'llave',cantidad:llaves,medidas:[diametro],confirmado:true,medidasEstimadas:true}]:[]),...(hasta==='A'?[{tipo:'tee',cantidad:1,nodo:'A',medidas:['1"','1"','3/4"'],confirmado:true,medidasEstimadas:true}]:[])]}))};
 const nodos=instalacionGas.nodos||[];
 const entrada={origen:'Proyecto manual actual',material:instalacionGas.perfil.material,sistema:instalacionGas.perfil.sistema,nodos,tramos:tramos.map((t,i)=>{
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
function opcionesMaterialesGas(fuente=fuenteMaterialesGas){const o=datosPlanGas().opciones;return {largoComercial:o.largoComercial??6,reutilizar:!!o.reutilizar,minimoSobrante:o.minimoSobrante??.5,hipotesisSinPosiciones:!!o.hipotesisSinPosiciones,uniones:{...(fuente==='proyecto'?unionesDeteccionConfirmadasGas():{}),...(o[fuente==='ejemplo'?'unionesEjemplo':'uniones']||{})}};}
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
function generarPlanGas(fuente='proyecto'){
 if(modulo!=='gas')return;
 fuenteMaterialesGas=fuente;abrirPlanGas();
 try{
  if(typeof MaterialesGas==='undefined')throw Error('Falta el archivo de materiales. Descomprimí el ZIP completo.');
  sincronizarMaterialesGas(fuente);const entrada=entradaMaterialesGas(fuente);if(!entrada.tramos.length)throw Error('Agregá tramos para planificar.');
  const firma=firmaMaterialesGas(),previa=datosPlanGas().revisiones[fuente];
  revisionMaterialesGas={firma,fuente,plan:anotarFilasRevisionGas(MaterialesGas.planificarMateriales(entrada,opcionesMaterialesGas()),entrada)};
  if(previa?.firma===firma&&Array.isArray(previa.filas))for(const f of revisionMaterialesGas.plan.filas){const r=previa.filas.find(r=>r.id===f.id);if(r&&(r.cantidad===null||(Number.isInteger(r.cantidad)&&r.cantidad>=0))){if(r.editado)f.cantidadCalculada=f.cantidad;f.cantidad=r.cantidad;f.revisado=!!r.revisado;if(r.editado){f.estado='estimado';f.editado=true;f.cantidadConfirmada=false;}}}
  renderPlanGas();
 }catch(e){revisionMaterialesGas=null;$('matResultado').replaceChildren();$('matResultado').textContent=e.message;}
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
 const out=$('matResultado');out.replaceChildren();if(!revisionMaterialesGas)return;const r=revisionMaterialesGas.plan;
 const texto=(t,padre=out)=>{const p=document.createElement('p');p.textContent=textoMaterialPantallaGas(t);padre.append(p);};
 const detalles=document.createElement('details'),resumen=document.createElement('summary');detalles.className='gas-detalles';resumen.textContent='Ver detalles técnicos';detalles.append(resumen);
 texto((fuenteMaterialesGas==='ejemplo'?'EJEMPLO SEPARADO: no reemplaza tus datos. ':'PROYECTO ACTUAL. ')+'Lista para revisión, no cantidades definitivas. Diámetros automáticos definitivos bloqueados.');
 if(fuenteMaterialesGas==='proyecto'&&avisoDeteccionGas())texto(avisoDeteccionGas());
 if(fuenteMaterialesGas==='proyecto'){texto(avisoConciliacionRapidaGas());renderConciliacionRapidaGas();}
 r.supuestos.forEach(t=>texto(t,detalles));r.avisos.forEach(t=>texto(t,detalles));
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
  const tecnica=document.createElement('p');tecnica.className='gas-tecnica-pendiente';tecnica.textContent='Revisión técnica pendiente · diámetros y conexiones';card.append(tecnica);
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
 if(revisionMaterialesGas.plan.filas.some(f=>!f.revisado)){$('matMensaje').textContent='Revisá todas las filas antes de imprimir o descargar. Podés revisar y conservar un dato pendiente.';return null;}
 $('matMensaje').textContent='Lista revisada: se conservan los estados estimados y pendientes.';return revisionMaterialesGas;
}
function descargarMaterialesGas(){
 const r=prepararSalidaMaterialesGas();if(!r)return;
 const quote=x=>'"'+String(x??'PENDIENTE').replaceAll('"','""')+'"';
 const filas=[['LISTA PARA REVISIÓN; NO DEFINITIVA'],...r.plan.supuestos.map(t=>[t]),...r.plan.avisos.map(t=>[t]),...r.plan.planes.map(g=>['RESUMEN',g.diametro,'Mínimo teórico: '+g.minimoTeorico,'Compra estimada: '+(g.compraEstimada??'PENDIENTE'),'Cuplas propuestas: '+(g.cuplasPropuestas??'PENDIENTES'),g.hipotesis?'Hipótesis NO COMPRA: '+g.plan.compraEstimada+' barras / '+g.plan.cuplasPropuestas+' uniones':'']),['Material','Diámetro','Cantidad','Unidad','Ubicación','Estado','Revisado','Evidencia'],...r.plan.filas.map(f=>[f.material,f.diametro,f.cantidad,f.unidad,ubicacionLegibleGas(f.ubicacion),f.estado,f.revisado?'Sí':'No',f.evidencia||f.equivalentes||''])];
 const csv='\uFEFF'+filas.map(f=>f.map(quote).join(';')).join('\r\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='canerias-materiales-revision.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function imprimirMaterialesGas(){if(!prepararSalidaMaterialesGas())return;if(fuenteMaterialesGas==='ejemplo'){$('matMensaje').textContent='El ejemplo es una vista separada. Seleccioná Mi proyecto o Demostración para imprimir su informe.';return;}imprimirInformeActual();}
window.addEventListener('afterprint',()=>{$('resultadoMateriales').classList.remove('solo-pantalla');});

// Revisiones anteriores: nunca se aplican cantidades por el índice material-N.
function identidadFilaGas(f){return f.claveRevision||JSON.stringify([f.tipo,f.material,f.diametro,f.unidad,f.ubicacion]);}
function anotarFilasRevisionGas(plan,entrada){
 if(entrada.origen==='Proyecto manual actual'&&(proyectoGasActual().conciliacionRapidaGas||tramos.some(t=>Object.keys(conteoRapidoDelTramoGas(t)).length)))plan.avisos.push(avisoConciliacionRapidaGas());
 for(const f of plan.filas){if(entrada.origen==='Proyecto manual actual')f.material=etiquetaAccesorioDetectadoGas(f);f.ubicacionNombre=ubicacionLegibleGas(f.ubicacion);const t=(entrada.tramos||[]).find(t=>String(f.ubicacion).startsWith(t.id+' · accesorio '));f.claveRevision=JSON.stringify([f.tipo,f.material,f.diametro,f.unidad,f.ubicacion,...(f.origen==='identificado'?[t?.accesorios||(entrada.extras||[]).filter(a=>!a.idFisico?.startsWith('conciliacion:'))]:[])]);}
 return plan;
}
function filasRevisionGas(revision){
 if(!revision)return [];
 if(revision.plan)return revision.plan.filas;
 try{const x=JSON.parse(revision.firma),plan=anotarFilasRevisionGas(MaterialesGas.planificarMateriales(x.entrada,x.opciones),x.entrada);return plan.filas.map(f=>({...f,...(revision.filas||[]).find(r=>r.id===f.id)}));}catch(e){return revision.filas||[];}
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
  const plan=anotarFilasRevisionGas(MaterialesGas.planificarMateriales(entrada,opciones),entrada);delete d.errorActual;
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
 if(r?.anterior)texto('DESACTUALIZADO · respaldo de dimensionamiento anterior ('+r.anterior.resultado.estado+'). No usar como resultado vigente.');
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
 if(Object.values(lecturasFoto).some(x=>x.pendiente)){$('estadoRespaldo').textContent='Esperá a que termine la lectura de la fotografía antes de descargar el respaldo.';return;}
 $('estadoRespaldo').textContent=Object.values(lecturasFoto).some(x=>x.error&&!x.datos)?'El respaldo conserva los datos y la foto anterior leída. La foto temporal actual no pudo incluirse; conservá su archivo original.':'Respaldo completo con las fotografías leídas; guardalo fuera del navegador.';
 const blob=new Blob([JSON.stringify({formato:'canerias-respaldo-v1',proyectos},null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='canerias-respaldo-completo.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

// Conciliación del inventario físico. Nunca alimenta equivalentes ni dimensionamiento.
function nodoConciliacionGas(valor){
 const ns=instalacionGas.nodos||[],v=String(valor||''),normal=x=>String(x||'').trim().toLocaleLowerCase('es');
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
function validarConciliacionGas(f,r){
 if(!Number.isSafeInteger(f.cantidad)||f.cantidad<0)return 'Cantidad pendiente: completá la carga rápida; vacío no es cero.';
 if(!r||!r.confirmado)return 'Revisión pendiente.';
 if(r.firma!==f.firma)return 'Datos cambiados: revisar los vínculos antes de incorporar adicionales.';
 if(f.ajustes.length)return 'Hay cantidades de este tipo ajustadas manualmente en materiales. Revisalas antes de sumar piezas rápidas; los ajustes se conservan.';
 if(!r.alcance)return 'Confirmá que el conteo es el total del tramo y revisaste todas las coincidencias.';
 if(!Number.isSafeInteger(r.adicionales)||r.adicionales<0)return 'Confirmá cuántas piezas son adicionales, incluso si son cero.';
 let cubiertas=0;
 for(const p of f.candidatos){
  if(p.conflicto||!Number.isSafeInteger(p.cantidad)||p.cantidad<=0)return 'Hay datos contradictorios para una pieza registrada. Corregilos antes de conciliar.';
  const relacion=r.vinculos?.[p.id];
  if(!['incluido','fuera'].includes(relacion))return 'Coincidencia ambigua: indicá si cada pieza ya está incluida o queda fuera del conteo.';
  if(relacion==='fuera'&&p.directa)return 'La pieza está registrada dentro del tramo: revisá el conteo o su registro original.';
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
 const f=filasConciliacionGas().find(f=>f.clave===clave);if(!f){$('conciliacionMensaje').textContent='Tramo no disponible. Se conservó la revisión anterior.';return false;}
 const revision={...edicion,confirmado:!!confirmar,firma:f.firma};
 const error=confirmar?validarConciliacionGas(f,revision):null;
 if(error){$('conciliacionMensaje').textContent=error;return false;}
 const p=proyectoGasActual();if(p.conciliacionRapidaGas&&(p.conciliacionRapidaGas.version!==1||!p.conciliacionRapidaGas.registros||typeof p.conciliacionRapidaGas.registros!=='object'||Array.isArray(p.conciliacionRapidaGas.registros)||!Array.isArray(p.conciliacionRapidaGas.historial))){$('conciliacionMensaje').textContent='Formato de revisión no reconocido: se conservó sin sobrescribir. Revisá el respaldo.';return false;}
 if(!p.conciliacionRapidaGas)p.conciliacionRapidaGas={version:1,registros:{},historial:[]};
 const d=p.conciliacionRapidaGas;if(d.registros[clave])d.historial.push({clave,revision:d.registros[clave]});d.registros[clave]=revision;
 guardarDatos();generarPlanGas('proyecto');renderConciliacionRapidaGas();
 const actual=estadoConciliacionGas().find(x=>x.clave===clave);
 const almacenado=ambitoGas==='demostracion'?ultimoGuardadoValido?.gas?.demostracion:ultimoGuardadoValido?.gas;
 $('conciliacionMensaje').textContent=JSON.stringify(almacenado?.conciliacionRapidaGas)!==JSON.stringify(d)?'Revisión sólo en sesión: descargá un respaldo antes de cerrar.':confirmar?(actual.error||'Revisión confirmada. Cantidades conciliadas; la revisión técnica sigue pendiente.'):'Vínculos guardados como pendientes; no se agregaron piezas.';
 return true;
}
function renderConciliacionRapidaGas(){
 const out=$('conciliacionFilas');if(!out||modulo!=='gas')return;out.replaceChildren();
 const texto=(padre,t)=>{const p=document.createElement('p');p.textContent=textoMaterialPantallaGas(t);padre.append(p);};
 const filas=estadoConciliacionGas();
 if(!filas.length){texto(out,'Registrá primero los tramos y sus cantidades rápidas.');return;}
 let grupo=null,tramoAnterior=null;
 for(const f of filas){
  if(tramoAnterior!==f.tramo.id){grupo=document.createElement('details');grupo.className='gas-detalles';const resumen=document.createElement('summary');resumen.textContent=f.tramo.desde+'–'+f.tramo.hasta;grupo.append(resumen);out.append(grupo);tramoAnterior=f.tramo.id;}
  const card=document.createElement('details');card.className='detalle';const titulo=document.createElement('summary');titulo.textContent=f.tramo.desde+'–'+f.tramo.hasta+' · '+f.nombre+' · '+(f.cantidad===null?'Pendiente':f.cantidad===0?'0 confirmado':f.cantidad+' confirmados')+' · '+(f.error?'Por revisar':'Conciliado');card.append(titulo);grupo.append(card);
  const r=f.revision||{};if(f.error)texto(card,f.error);
  if(f.cantidad===null){texto(card,'Completá este dato en Revisar accesorios → Carga rápida. No equivale a cero.');continue;}
  const controles=[];
  for(const p of f.candidatos){const label=document.createElement('label');label.textContent=p.etiqueta+' · cantidad '+p.cantidad;const select=document.createElement('select');for(const [v,t]of [['','Pendiente: no sé si es la misma pieza'],['incluido','Ya está incluida en este total'],['fuera','Fuera de este conteo (requiere revisión)']]){const option=document.createElement('option');option.value=v;option.textContent=t;select.append(option);}select.value=r.vinculos?.[p.id]||'';label.append(select);card.append(label);controles.push([p.id,select]);}
  if(!f.candidatos.length)texto(card,'No se encontraron piezas registradas del mismo tipo para este alcance. Revisá el croquis antes de confirmar adicionales.');
  const label=document.createElement('label'),cantidad=document.createElement('input');label.textContent='Piezas adicionales (0 si ya están todas representadas)';cantidad.type='number';cantidad.min='0';cantidad.step='1';cantidad.inputMode='numeric';cantidad.placeholder='Pendiente';cantidad.value=r.adicionales??'';label.append(cantidad);card.append(label);
  const punto=document.createElement('select');if(['tee','reduccion'].includes(f.tipo)){const l=document.createElement('label');l.textContent='Punto real de la pieza adicional (si hay una)';const vacio=document.createElement('option');vacio.value='';vacio.textContent='Pendiente: no inventar posición';punto.append(vacio);for(const n of instalacionGas.nodos||[]){const o=document.createElement('option');o.value=n.id;o.textContent=n.nombre;punto.append(o);}punto.value=r.nodo||'';l.append(punto);card.append(l);}
  const l=document.createElement('label'),alcance=document.createElement('input');l.className='gas-revision-check';l.textContent='Confirmo el total del tramo y revisé todas las coincidencias';alcance.type='checkbox';alcance.checked=!!r.alcance;l.append(alcance);card.append(l);
  for(const [confirmar,titulo]of [[false,'Guardar revisión pendiente'],[true,'Confirmar para materiales']]){const b=document.createElement('button');b.className='alt';b.textContent=titulo;b.onclick=()=>guardarConciliacionGas(f.clave,{vinculos:Object.fromEntries(controles.map(([id,c])=>[id,c.value])),adicionales:cantidad.value===''?null:Number(cantidad.value),nodo:punto.value||null,alcance:alcance.checked},confirmar);card.append(b);}
 }
}
