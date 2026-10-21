function modeloInformeActual(){
 const gas=modulo==='gas',d={titulo:({gas:'GAS',agua:'AGUA',cloacas:'CLOACAS'})[modulo]||'Sin proyecto seleccionado',ambito:gas&&ambitoGas==='demostracion'?'DEMOSTRACIÓN · datos de práctica separados':'MI PROYECTO',tramos:gas?tramos:[],artefactos:gas?artefactos:[],filas:[],resumen:[],observaciones:$('duda').value.trim(),advertencia:gas?'Diámetros automáticos definitivos BLOQUEADOS. Cantidades estimadas y datos pendientes conservan su condición. Informe de revisión; no aprueba una instalación real.':''};
 if(gas&&tramos.length){
  const entrada=entradaMaterialesGas('proyecto'),opciones=opcionesMaterialesGas('proyecto');
  const firma=JSON.stringify({fuente:'proyecto',entrada,opciones});
  const plan=MaterialesGas.planificarMateriales(entrada,opciones),previa=datosPlanGas().revisiones.proyecto;
  const actuales=fuenteMaterialesGas==='proyecto'&&revisionMaterialesGas?.firma===firma?revisionMaterialesGas.plan.filas:previa?.firma===firma?previa.filas:[];
  for(const f of plan.filas){const r=actuales.find(r=>r.id===f.id);if(r){f.cantidad=r.cantidad;f.revisado=!!r.revisado;if(r.editado){f.editado=true;f.estado='estimado';}}}
  d.filas=plan.filas;d.resumen=[...plan.supuestos,...plan.avisos,...plan.planes.map(g=>g.diametro+' · '+g.metros+' m · mínimo teórico '+g.minimoTeorico+' caños · compra estimada '+(g.compraEstimada??'PENDIENTE')+' · cuplas propuestas '+(g.cuplasPropuestas??'PENDIENTES'))];
 }
 return d;
}
function prepararInformeActual(){
 try{$('informeImpresion').innerHTML=InformeProyecto.documento(modeloInformeActual());}
 catch(e){$('informeImpresion').textContent='Informe no disponible: '+e.message+'. No se imprimieron datos de otro proyecto.';}
}
function imprimirInformeActual(){prepararInformeActual();window.print();}
