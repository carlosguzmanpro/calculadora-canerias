let ultimoDocumentoPreparado=null;
function modeloInformeActual(){
 const gas=modulo==='gas',d={titulo:({gas:'GAS',agua:'AGUA',cloacas:'CLOACAS'})[modulo]||'Sin proyecto seleccionado',ambito:gas&&ambitoGas==='demostracion'?'DEMOSTRACIÓN · datos de práctica separados':'MI PROYECTO',tramos:gas?tramos:[],artefactos:gas?artefactos:[],filas:[],resumen:[],observaciones:$('duda').value.trim(),advertencia:gas?'Diámetros automáticos definitivos BLOQUEADOS. Cantidades estimadas y datos pendientes conservan su condición. Informe de revisión; no aprueba una instalación real.':''};
 if(gas){
  const resultado=motorClaseAceroGas(tramos,artefactos,instalacionGas,catalogoParaGas(instalacionGas));
  const red=analizarRedGas();
  d.planilla=InformeProyecto.planilla(tramos,resultado,{caudalAplicable:instalacionGas.perfil.gas==='GN'&&Number(instalacionGas.perfil.poderCalorifico)===9300&&red.errores.length===0});
  if(croquisEntregaDisponible()&&proyectoGasActual().entregaGas?.firmaCroquis===firmaCroquisEntrega())d.croquis={url:fotoURL};
  else d.resumen.push('Croquis: Pendiente de información gráfica suficiente y confirmación.');
 }
 if(gas&&tramos.length){
  const entrada=entradaMaterialesGas('proyecto'),opciones=opcionesMaterialesGas('proyecto');
  const firma=JSON.stringify({fuente:'proyecto',entrada,opciones});
  const plan=MaterialesGas.planificarMateriales(entrada,opciones),previa=datosPlanGas().revisiones.proyecto;
  const actuales=fuenteMaterialesGas==='proyecto'&&revisionMaterialesGas?.firma===firma?revisionMaterialesGas.plan.filas:previa?.firma===firma?previa.filas:[];
  for(const f of plan.filas){const r=actuales.find(r=>r.id===f.id);if(r){f.cantidad=r.cantidad;f.revisado=!!r.revisado;if(r.editado){f.editado=true;f.estado='estimado';}}}
  d.filas=plan.filas;d.materialesAgrupados=InformeProyecto.agruparMateriales(plan.filas);
  d.resumen.push('Materiales: largo comercial '+plan.config.largoComercial+' m; reutilización de sobrantes '+(plan.config.reutilizar?'selectiva estimada':'no prevista')+'. Cantidades sujetas a revisión; pendiente no significa cero.');
  d.resumen.push('Método de clase: reducciones en materiales, excluidas de equivalentes. Una instalación real puede requerir pérdidas adicionales.');
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
 if(modulo!=='gas'||!fotoURL||!/^(data:image\/(?:png|jpeg|webp);base64,|blob:)/.test(fotoURL)||!tramos.length||!artefactos.length)return false;
 const r=analizarRedGas();return r.errores.length===0&&r.total!==null;
}
function actualizarVistaEntregaGas(){
 const valido=croquisEntregaDisponible();
 $('entregaCroquisConfirmado').disabled=!valido;
 $('entregaCroquisConfirmado').checked=valido&&proyectoGasActual().entregaGas?.firmaCroquis===firmaCroquisEntrega();
 $('entregaEstado').textContent=valido?'Revisá la imagen ampliada antes de confirmar su legibilidad y correspondencia. No se dibujarán posiciones automáticas.':'Croquis pendiente: se necesita una foto legible y una red conectada con artefactos, consumos y accesorios revisados. El informe puede imprimirse con los demás datos.';
}
function confirmarCroquisEntrega(){
 const p=proyectoGasActual();if(!p.entregaGas||typeof p.entregaGas!=='object')p.entregaGas={};
 p.entregaGas.firmaCroquis=$('entregaCroquisConfirmado').checked&&croquisEntregaDisponible()?firmaCroquisEntrega():null;
 guardarDatos();actualizarVistaEntregaGas();
}
