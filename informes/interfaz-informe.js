let ultimoDocumentoPreparado=null;
function modeloInformeActual(){
 const gas=modulo==='gas',d={titulo:({gas:'GAS',agua:'AGUA',cloacas:'CLOACAS'})[modulo]||'Sin proyecto seleccionado',ambito:gas&&ambitoGas==='demostracion'?'DEMOSTRACIÓN · datos de práctica separados':'MI PROYECTO',tramos:gas?tramos:[],artefactos:gas?artefactos:[],filas:[],resumen:[],observaciones:$('duda').value.trim(),advertencia:gas?'Diámetros automáticos definitivos BLOQUEADOS. Cantidades estimadas y datos pendientes conservan su condición. Informe de revisión; no aprueba una instalación real.':''};
 if(gas){
  d.resumen.push(modoManualGasActivo()?'Cálculo manual: cantidades ingresadas una sola vez, sin segunda confirmación; revisión técnica pendiente.':avisoConciliacionRapidaGas());
  const avisoDeteccion=avisoDeteccionGas();if(avisoDeteccion)d.resumen.push(avisoDeteccion);
  const resultado=motorClaseAceroGas(tramos,artefactos,instalacionGas,catalogoParaGas(instalacionGas));
  const red=analizarRedGas();
  d.planilla=InformeProyecto.planilla(tramos,resultado,{caudalAplicable:instalacionGas.perfil.gas==='GN'&&Number(instalacionGas.perfil.poderCalorifico)===9300&&red.errores.length===0});
  if(fotoURL&&/^(data:image\/(?:png|jpeg|webp);base64,|blob:)/.test(fotoURL))d.croquis={url:fotoURL,confirmado:croquisEntregaDisponible()&&!proyectoGasActual().entregaGas?.requiereConfirmacion&&proyectoGasActual().entregaGas?.firmaCroquis===firmaCroquisEntrega()};
  else d.resumen.push('Fotografía original: Pendiente.');
 }
 if(gas&&tramos.length){
  try{
  const entrada=entradaMaterialesGas('proyecto'),opciones=opcionesMaterialesGas('proyecto');
  const firma=JSON.stringify({fuente:'proyecto',entrada,opciones});
  const plan=anotarFilasRevisionGas(planificarVistaMaterialesGas(entrada,opciones),entrada),previa=datosPlanGas().revisiones.proyecto;
  const base=fuenteMaterialesGas==='proyecto'&&revisionMaterialesGas?revisionMaterialesGas:previa;
  const mismos=base?.firma===firma,actuales=filasRevisionGas(base);
  for(const f of plan.filas){const r=actuales.find(r=>mismos?r.id===f.id:r.editado&&identidadFilaGas(r)===identidadFilaGas(f));if(r){f.cantidad=r.cantidad;f.revisado=mismos&&!!r.revisado;if(r.editado){f.editado=true;f.estado='estimado';}}}
  if(plan.manualDirecto)d.resumen.push('Longitud total informada: '+plan.longitudInformada+' m.',...plan.avisos.map(t=>ubicacionLegibleGas(t)));
  d.filas=plan.filas.map(f=>({...f,ubicacion:ubicacionLegibleGas(f.ubicacion)}));d.materialesAgrupados=InformeProyecto.agruparMateriales(d.filas);
  d.resumen.push('Materiales: largo comercial '+plan.config.largoComercial+' m; reutilización de sobrantes '+(plan.config.reutilizar?'selectiva estimada':'no prevista')+'. Cantidades sujetas a revisión; pendiente no significa cero.');
  d.resumen.push('Método de clase: reducciones en materiales, excluidas de equivalentes. Una instalación real puede requerir pérdidas adicionales.');
  }catch(e){d.resumen.push('Materiales: Pendiente de corregir los datos actuales. '+e.message+'. El respaldo anterior no es una lista de compra vigente.');}
 }
 return d;
}
function prepararInformeActual(){
 try{const documento=InformeProyecto.documento(modeloInformeActual());if(documento!==ultimoDocumentoPreparado){$('informeImpresion').innerHTML=documento;ultimoDocumentoPreparado=documento;}}
 catch(e){ultimoDocumentoPreparado=null;$('informeImpresion').textContent='Informe no disponible: '+e.message+'. No se imprimieron datos de otro proyecto.';}
}
function imprimirInformeActual(){
 prepararInformeActual();
 const cont=$('informeImpresion'),imagen=cont.querySelector?cont.querySelector('img'):null;
 if(!imagen){window.print();return;}
 const fallo=()=>{$('entregaEstado').textContent='No se pudo preparar la imagen para impresión. Revisá la foto antes de guardar el PDF.';};
 if(typeof imagen.decode==='function')return imagen.decode().then(()=>window.print(),fallo);
 if(imagen.complete){if(imagen.naturalWidth)window.print();else fallo();return;}
 imagen.onload=()=>window.print();imagen.onerror=fallo;
}

function firmaCroquisEntrega(){return JSON.stringify({foto:proyectoGasActual().foto||fotoURL,tramos,artefactos,instalacion:instalacionGas});}
function croquisEntregaDisponible(){
 // Confirmación visual voluntaria: no depende de completar ni dimensionar la red.
 return modulo==='gas'&&typeof fotoURL==='string'&&/^(data:image\/(?:png|jpeg|webp);base64,|blob:)/.test(fotoURL);
}
function actualizarVistaEntregaGas(){
 const disponible=croquisEntregaDisponible(),casilla=$('entregaCroquisConfirmado');
 const firma=proyectoGasActual().entregaGas?.firmaCroquis;
 casilla.disabled=!disponible;
 casilla.checked=disponible&&!proyectoGasActual().entregaGas?.requiereConfirmacion&&firma===firmaCroquisEntrega();
 $('entregaEstado').textContent=!disponible?'SIN FOTO: cargá una fotografía para poder confirmar su revisión.':casilla.checked?
  'CONFIRMADO: revisaste visualmente este croquis para los datos actuales. Podés desmarcar la casilla. Esto no valida cálculos ni habilita diámetros.':
  firma?'NUEVA CONFIRMACIÓN NECESARIA: cambió la fotografía o algún dato de la instalación. La foto se conserva como referencia.':
  'SIN CONFIRMAR: tocá la casilla después de revisar la foto. No hace falta completar la red para registrar esta confirmación visual.';
}
function confirmarCroquisEntrega(){
 if(modulo!=='gas')return;
 const marcado=$('entregaCroquisConfirmado').checked;
 // Estabilizar IDs antes de capturar la firma evita que el guardado la invalide.
 asegurarIdsGas();
 const p=proyectoGasActual();if(!p.entregaGas||typeof p.entregaGas!=='object')p.entregaGas={};
 p.entregaGas.requiereConfirmacion=false;
 p.entregaGas.firmaCroquis=marcado&&croquisEntregaDisponible()?firmaCroquisEntrega():null;
 guardarDatos();actualizarVistaEntregaGas();
}
function revisarCroquisParaEntrega(){
 if(modulo!=='gas')return;
 mostrarVista('croquis');actualizarVistaEntregaGas();
 if(!croquisEntregaDisponible()){
  $('entregaAccion').textContent='No hay foto disponible. Usá Sacar foto o Galería en la carga de croquis.';
  const carga=$('cargaFotoEntrega');if(carga.scrollIntoView)carga.scrollIntoView({block:'start'});if(carga.focus)carga.focus({preventScroll:true});return;
 }
 const visor=$('visor');$('imagenGrande').src=fotoURL;
 $('visorEntregaAyuda').textContent='Revisá la foto. Al cerrar la ampliación podés marcar o desmarcar la confirmación visual; no valida cálculos.';
 const casilla=$('entregaCroquisConfirmado');if(casilla.scrollIntoView)casilla.scrollIntoView({block:'center'});
 if(typeof visor.showModal==='function'){
  if(!visor.open)visor.showModal();
  $('entregaAccion').textContent='Foto abierta para revisión. Cerrá la ampliación y marcá o desmarcá la confirmación debajo.';
 }else{
  $('entregaAccion').textContent='Fotografía localizada. Revisala y volvé a la casilla de confirmación debajo.';
  const imagen=$('imagen');if(imagen.scrollIntoView)imagen.scrollIntoView({block:'center'});
 }
}

function ubicacionLegibleGas(texto,contexto=null){
 const ns=contexto?.nodos||instalacionGas.nodos||[],ts=contexto?.tramos||tramos,mapa=new Map();
 for(const n of ns)if(n.id&&n.nombre)mapa.set(n.id,n.nombre);
 ts.forEach((t,i)=>{const desde=t.desde||ns.find(n=>n.id===t.red?.desde)?.nombre,hasta=t.hasta||ns.find(n=>n.id===t.red?.hasta)?.nombre;if(desde&&hasta){mapa.set(t.id||'tramo-'+i,desde+'–'+hasta);mapa.set('tramo-'+i,desde+'–'+hasta);}});
 const escapar=x=>Array.from(x,c=>/[a-zA-Z0-9_-]/.test(c)?c:String.fromCharCode(92)+c).join('');
 if(!mapa.size)return String(texto||'Ubicación pendiente');
 const rx=new RegExp('(^|[^A-Za-z0-9_-])('+[...mapa.keys()].sort((a,b)=>b.length-a.length).map(escapar).join('|')+')(?=$|[^A-Za-z0-9_-])','g');
 return String(texto||'Ubicación pendiente').replace(rx,(_,sep,id)=>sep+mapa.get(id));
}
