/* Interfaz de revisión de materiales; usa el estado existente, nunca activa diámetros. */
let revisionMaterialesGas=null,fuenteMaterialesGas='proyecto';
function datosPlanGas(){
 const p=proyectoGasActual();
 if(!p.planCompra||typeof p.planCompra!=='object'||Array.isArray(p.planCompra))p.planCompra={};
 const d=p.planCompra;if(!d.opciones||typeof d.opciones!=='object')d.opciones={};if(!Array.isArray(d.extras))d.extras=[];if(!d.revisiones||typeof d.revisiones!=='object')d.revisiones={};return d;
}
function entradaMaterialesGas(fuente='proyecto'){
 if(fuente==='ejemplo')return {origen:'Ejemplo educativo calefón/cocina; no incorporado al proyecto',material:'Acero epoxi',sistema:'Roscado',nodos:[{id:'M'},{id:'A'},{id:'Calefón'},{id:'Cocina'}],tramos:[['M','A',19,5,0,'1"'],['A','Calefón',18,7,1,'1"'],['A','Cocina',12,5,1,'3/4"']].map(([desde,hasta,metros,codos,llaves,diametro])=>({id:desde+'-'+hasta,metros,diametro,medidasEstimadas:true,red:{desde,hasta},segmentos:null,accesorios:[{tipo:'codo90',cantidad:codos,medidas:[diametro,diametro],confirmado:true,medidasEstimadas:true,evidencia:'Cantidad aportada en el ejercicio; medidas del diagnóstico condicionado'},...(llaves?[{tipo:'llave',cantidad:llaves,medidas:[diametro],confirmado:true,medidasEstimadas:true}]:[]),...(hasta==='A'?[{tipo:'tee',cantidad:1,nodo:'A',medidas:['1"','1"','3/4"'],confirmado:true,medidasEstimadas:true}]:[])]}))};
 const nodos=instalacionGas.nodos||[];
 return {origen:'Proyecto manual actual',material:instalacionGas.perfil.material,sistema:instalacionGas.perfil.sistema,nodos,tramos:tramos.map((t,i)=>{
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
 }),extras:datosPlanGas().extras};
}
function opcionesMaterialesGas(fuente=fuenteMaterialesGas){const o=datosPlanGas().opciones;return {largoComercial:o.largoComercial??6,reutilizar:!!o.reutilizar,minimoSobrante:o.minimoSobrante??.5,hipotesisSinPosiciones:!!o.hipotesisSinPosiciones,uniones:o[fuente==='ejemplo'?'unionesEjemplo':'uniones']||{}};}
function firmaMaterialesGas(){return JSON.stringify({fuente:fuenteMaterialesGas,entrada:entradaMaterialesGas(fuenteMaterialesGas),opciones:opcionesMaterialesGas()});}
function invalidarMaterialesGas(){if(modulo==='gas'&&revisionMaterialesGas)sincronizarMaterialesGas(fuenteMaterialesGas);}
function abrirPlanGas(){
 if(modulo!=='gas')return;
 $('planCompraGas').classList.remove('oculto');const o=opcionesMaterialesGas();
 $('matLargo').value=o.largoComercial??6;$('matReusar').checked=!!o.reutilizar;$('matSobrante').value=o.minimoSobrante??.5;$('matHipotesis').checked=!!o.hipotesisSinPosiciones;
 renderUnionesMaterialesGas();
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
function renderPlanGas(){
 const out=$('matResultado');out.replaceChildren();if(!revisionMaterialesGas)return;const r=revisionMaterialesGas.plan;
 const texto=t=>{const p=document.createElement('p');p.textContent=t;out.append(p);};
 texto((fuenteMaterialesGas==='ejemplo'?'EJEMPLO SEPARADO: no reemplaza tus datos. ':'PROYECTO ACTUAL. ')+'Lista para revisión, no cantidades definitivas. Diámetros automáticos definitivos bloqueados.');
 r.supuestos.forEach(texto);r.avisos.forEach(texto);
 for(const g of r.planes){
  texto(g.diametro+' · '+(g.material||'material pendiente')+' / '+(g.sistema||'sistema pendiente')+' · '+g.metros+' m · mínimo teórico '+g.minimoTeorico+' caños de '+r.config.largoComercial+' m · compra estimada '+(g.compraEstimada??'PENDIENTE')+' · cuplas propuestas '+(g.cuplasPropuestas??'PENDIENTES'));
  if(g.hipotesis)texto('HIPÓTESIS POR LONGITUD, NO COMPRA: '+g.plan.compraEstimada+' barras y '+g.plan.cuplasPropuestas+' uniones si cada tramo fuera continuo; NO representa los codos del croquis ni resuelve cuplas reales.');
  if(g.plan)for(const b of g.plan.barras)texto(b.id+' · cortes '+b.cortes.map(c=>c.metros+' m para '+c.segmento).join('; ')+' · sobrante '+fmt(b.sobrante)+' m');
 }
 const wrap=document.createElement('div');wrap.className='tabla-wrap';const tabla=document.createElement('table');tabla.className='tabla';const head=document.createElement('tr');
 for(const t of ['Material / accesorio','Diámetro','Cantidad','Unidad','Tramo / ubicación','Estado y evidencia','Revisado']){const th=document.createElement('th');th.textContent=t;head.append(th);}tabla.append(head);
 for(const f of r.filas){
  const tr=document.createElement('tr');
  for(const v of [f.material,f.diametro]){const td=document.createElement('td');td.textContent=v;tr.append(td);}
  const qty=document.createElement('td'),input=document.createElement('input');input.type='number';input.min='0';input.step='1';input.placeholder='PENDIENTE';input.value=f.cantidad??'';
  input.onchange=()=>{const n=input.value===''?null:Number(input.value);if(n!==null&&(!Number.isInteger(n)||n<0)){$('matMensaje').textContent='Cantidad entera no negativa o pendiente.';input.value=f.cantidad??'';f.revisado=false;guardarRevisionMaterialesGas();return;}if(!f.editado)f.cantidadCalculada=f.cantidad;f.cantidad=n;f.revisado=false;f.editado=true;f.cantidadConfirmada=false;f.estado='estimado';guardarRevisionMaterialesGas();renderPlanGas();};qty.append(input);const imp=document.createElement('span');imp.className='solo-impresion';imp.textContent=f.cantidad??'PENDIENTE';qty.append(imp);tr.append(qty);
  for(const v of [f.unidad,ubicacionLegibleGas(f.ubicacion),f.estado.toUpperCase()+(f.cantidadConfirmada?' · cantidad identificada':'')+' · '+(f.evidencia||f.equivalentes||'')+(f.editado?' · cantidad ajustada manualmente; calculada originalmente '+(f.cantidadCalculada??'PENDIENTE'):'' )]){const td=document.createElement('td');td.textContent=v;tr.append(td);}
  const td=document.createElement('td'),check=document.createElement('input');check.type='checkbox';check.checked=f.revisado;check.onchange=()=>{f.revisado=check.checked;guardarRevisionMaterialesGas();};td.append(check);tr.append(td);tabla.append(tr);
 }
 wrap.append(tabla);out.append(wrap);texto('Revisar una fila no transforma una estimación en cantidad definitiva. Pendiente no significa cero. Los ajustes manuales no cambian el croquis ni el motor.');
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
 for(const f of plan.filas){f.ubicacionNombre=ubicacionLegibleGas(f.ubicacion);const t=(entrada.tramos||[]).find(t=>String(f.ubicacion).startsWith(t.id+' · accesorio '));f.claveRevision=JSON.stringify([f.tipo,f.material,f.diametro,f.unidad,f.ubicacion,...(f.origen==='identificado'?[t?.accesorios||entrada.extras||[]]:[])]);}
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
 const blob=new Blob([JSON.stringify({formato:'canerias-respaldo-v1',proyectos},null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='canerias-respaldo-completo.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
