let ultimoDocumentoPreparado=null;
function modeloInformeActual(){
 const gas=modulo==='gas',d={titulo:({gas:'GAS',agua:'AGUA',cloacas:'CLOACAS'})[modulo]||'Sin proyecto seleccionado',ambito:gas?(ambitoGas==='demostracion'?'DEMOSTRACIÓN · datos de práctica separados':ambitoGas==='proyecto'&&!proyectos.gas.nombreProyecto?'MI PROYECTO':'PROYECTO · '+nombreProyectoGas()):'MI PROYECTO',tramos:gas?tramos:[],artefactos:gas?artefactos:[],filas:[],resumen:[],observaciones:$('duda').value.trim(),advertencia:gas?'Diámetros automáticos definitivos BLOQUEADOS. Cantidades estimadas y datos pendientes conservan su condición. Informe de revisión; no aprueba una instalación real.':''};
 if(gas){
  d.resumen.push(modoManualGasActivo()?'Cálculo manual: cantidades ingresadas una sola vez, sin segunda confirmación; revisión técnica pendiente.':avisoConciliacionRapidaGas());
  const avisoDeteccion=avisoDeteccionGas();if(avisoDeteccion)d.resumen.push(avisoDeteccion);
  const perfilInforme=perfilTecnicoActualGas(),instInforme={...instalacionGas,perfil:perfilInforme};
  if(CatalogosSistemasGas.identificar(instalacionGas.perfil)==='sigas'&&perfilInforme.gas==='GN'){
   const v=registroAccesoriosSigasGas()?.verificacion;if(v){
    d.resumen.push('SIGAS GN · capacidad tabular a 10 mmca, densidad de referencia 0,65: '+(v.estado==='comprobacion-tabular-satisfecha'?'comprobada.':'pendiente. '+v.pendientes.join(' ')));
    d.resumen.push('Compatibilidad del suministro: '+(v.suministro.estado==='compatible-con-referencia-tabular'?'comprobada según datos documentados declarados; presión final conservadora al menos '+fmt(v.suministro.presionFinalMinimaPa)+' Pa.':v.suministro.pendientes.join(' ')));
    d.resumen.push('Aprobación normativa final: pendiente de revisión profesional. No se calculó una pérdida exacta.');
   }
  }
  d.resumen.push('Sistema: '+(CatalogosSistemasGas.identificar(instalacionGas.perfil)||'Pendiente')+' · combustible: '+(perfilInforme.gas||'Pendiente')+'.',...combustibleTecnicoGas().pendientes);
  const resultado=motorClaseAceroGas(tramos,artefactos,instInforme,catalogoParaGas(instInforme));
  const red=analizarRedGas();
  d.planilla=InformeProyecto.planilla(tramos,resultado,{caudalAplicable:perfilInforme.gas==='GN'&&Number(perfilInforme.poderCalorifico)===9300&&red.errores.length===0});
  if(CatalogosSistemasGas.identificar(instalacionGas.perfil)==='sigas'&&perfilInforme.gas==='GN'){
   const r=registroAccesoriosSigasGas()?.calculo;
   for(const [i,t]of tramos.entries()){
    const f=r?.filas.find(f=>f.id===t.id);if(!f?.comprobadoPorTabla)continue;
    Object.assign(d.planilla[i],{equivalente:f.equivalenteConocidoTramoM,definitivo:f.longitudDefinitivaM,consumo:f.caudalM3h,diametro:(t.diametro?d.planilla[i].diametro+'; cálculo SIGAS: ':'')+f.diametroCalculadoMm+' mm · calculado y comprobado por tabla SIGAS; sin aprobación normativa'});
    d.resumen.push(f.tramo+': longitud '+metrosResultadoSigasGas(f.longitudConsultaM)+' m; Tabla '+f.candidato.tabla+' p.'+f.candidato.pagina+', fila '+metrosResultadoSigasGas(f.candidato.longitudFilaM)+' m; capacidad '+f.candidato.capacidadM3h+' m³/h ≥ requerido '+f.caudalM3h.toLocaleString('es-AR',{maximumFractionDigits:6})+' m³/h.');
   }
  }

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
  if(plan.manualDirecto){
   d.resumen.push('Longitud '+(plan.longitudParcial?'parcial conocida':'total informada')+': '+plan.longitudInformada+' m.',...avisosListaManualGas(plan));
   const redManual=plan.redManual,calor=Number(perfilTecnicoActualGas().poderCalorifico);
   if(redManual){d.resumen.push(redManual.total===null?'Consumo conectado total: Pendiente.':'Consumo conectado total: '+redManual.total+' kcal/h.');for(const [i,t]of tramos.entries())if(['GN','GLP','propano-gaseoso'].includes(perfilTecnicoActualGas().gas)&&Number.isFinite(calor)&&calor>0)d.planilla[i].consumo=Number.isFinite(redManual.porTramo[t.id])?redManual.porTramo[t.id]/calor:null;}
  }
  d.filas=plan.filas.map(f=>({...f,ubicacion:ubicacionLegibleGas(f.ubicacion)}));d.materialesAgrupados=plan.manualDirecto?resumenListaManualGas(plan).map(f=>({...f,material:f.material+(f.pendiente&&f.cantidad>0?' · '+f.cantidad+' '+f.unidad+' conocidas; resto pendiente':''),diametro:f.diametro||'Pendiente',cantidad:f.pendiente?null:f.cantidad,estado:f.pendiente||!f.diametro?'pendiente':f.estimado?'estimado':'confirmado',revisado:false,ubicaciones:['Ver detalle por tramo']})):InformeProyecto.agruparMateriales(d.filas);
  if(plan.manualDirecto)d.preparacionCompra=prepararCompraActualGas(plan);
  d.resumen.push('Materiales: largo comercial '+plan.config.largoComercial+' m; reutilización de sobrantes '+(plan.config.reutilizar?'selectiva estimada':'no prevista')+'. Cantidades sujetas a revisión; pendiente no significa cero.');
  d.resumen.push(CatalogosSistemasGas.identificar(instalacionGas.perfil)===CatalogosSistemasGas.IDS.epoxi?'Método de clase: reducciones en materiales, excluidas de equivalentes. Una instalación real puede requerir pérdidas adicionales.':'Reducciones y cuplas: equivalentes pendientes del producto y sistema seleccionados; no se aplica la exclusión del método de clase epoxi.');
  const largo=estadoLargoComercialGas();if(largo.pendiente)d.resumen.push('Largo comercial conservado '+largo.configurado+' m; manual del sistema '+largo.documentado+' m. Revisar antes de compra.');
  }catch(e){d.resumen.push('Materiales: Pendiente de corregir los datos actuales. '+e.message+'. El respaldo anterior no es una lista de compra vigente.');}
 }
 if(gas){
  d.dimensionamientoFusiogas=dimensionamientoFusiogasActualGas();
  d.ejercicioSigas=resultadoPreliminarSigasGas();
  const reg=registroAccesoriosSigasGas();
  if(d.ejercicioSigas&&reg){
   d.conexionesRosca=(reg.entradaTecnica.inventario.necesidadesTerminales||[]).map(n=>({nombre:n.nombre,rosca:proyectoGasActual().calculoSigas?.terminales?.[n.id]?.rosca||null}));
   d.comparacionIdentificadaParcial=reg.calculo.filas.some(f=>f.verificacionConsulta?.parcial!==false);
   d.comparacionIdentificada=reg.calculo.filas.map(f=>({tramo:f.tramo,diametro:f.candidato?.exteriorMm??null,longitud:f.longitudConsultaM,capacidad:f.candidato?.capacidadM3h??null,pendientes:f.perdidasPendientesTramo.length}));
  }
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
 mostrarVista('croquis');$('referenciaOpcionalGas').open=true;actualizarVistaEntregaGas();
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

// Organización del modo completo exclusivamente: conserva los controles y registros originales.
function organizarResultadoCompletoGas(out){
 if(modulo!=='gas'||presentacionGas!=='completo'||!revisionMaterialesGas||!out?.querySelector)return;
 const root=out.querySelector('.sigas-vista-sencilla');
 if(root&&!root.dataset.resultadoCompleto){
  root.dataset.resultadoCompleto='1';
  const titulo=root.querySelector('h2');if(titulo)titulo.textContent='1 · Resultados y diámetros';
  const materiales=root.querySelector('.sigas-piezas-detalle'),tecnicos=root.querySelector('.sigas-tecnicos-detalle');
  if(materiales){materiales.querySelector('summary').textContent='2 · Materiales y presupuesto';const compra=root.querySelector('.compra-estimada');if(compra)materiales.append(compra);}
  if(tecnicos){
   tecnicos.querySelector('summary').textContent='3 · Memoria de cálculo y verificaciones';
   const refs=tecnicos.querySelector('.sigas-referencias-tabulares'),tabla=root.querySelector('.resultados-tramos table');
   // La fila, capacidad y estado completos se muestran una sola vez, en la tabla principal.
   if(refs&&tabla){
    const filas=refs.querySelectorAll('tbody tr'),modelo=resultadoPreliminarSigasGas();
    for(const [i,tr]of [...tabla.querySelectorAll('tbody tr')].entries()){
     const c=filas[i]?.lastElementChild,f=modelo?.resultado.filas[i];if(!c||!f)continue;
     const estado=c.textContent.startsWith('Diámetro calculado y comprobado')||c.textContent.startsWith('Comprobada')?'Comprobado por tabla':c.textContent.startsWith('Preliminar')?'Preliminar':'Parcial';
     tr.lastElementChild.textContent=estado+' · fila '+metrosResultadoSigasGas(f.candidato?.longitudFilaM)+' m · capacidad '+(f.candidato?f.candidato.capacidadM3h.toLocaleString('es-AR',{maximumFractionDigits:6}):'Pendiente')+' m³/h';
    }
    const realesComprobadas=modelo?.resultado.filas.length>0&&modelo.resultado.filas.every(f=>f.candidato&&modelo.comprobacionRealPorTramo?.[f.id]===f.candidato.exteriorMm);
    const nota=document.createElement('p');nota.className='nota-contexto-escenario';nota.textContent=realesComprobadas?'Capacidad comprobada por tabla con piezas identificadas. El suministro y la aprobación normativa se verifican por separado.':modelo?.completo?'Preliminar · capacidad cubierta para el escenario propuesto. Las piezas reales, el suministro y la aprobación normativa se verifican por separado.':'Preliminar · consulta parcial. Las pérdidas desconocidas no se consideran cero.';tabla.before(nota);refs.remove();
   }
   for(const d of tecnicos.querySelectorAll(':scope > details'))if(/^Recorridos y memoria/.test(d.querySelector('summary')?.textContent||''))d.open=true;
   const avisos=root.querySelector('.verificaciones-finales');if(avisos)tecnicos.append(avisos);
   const confirmados=out.querySelector('.gas-calculo-preliminar');
   if(confirmados){
    const parcial=registroAccesoriosSigasGas()?.calculo.filas.some(f=>f.verificacionConsulta?.parcial!==false);
    confirmados.querySelector('summary').textContent='Comparar con piezas identificadas · '+(parcial?'cálculo parcial':'cálculo independiente');
    const nota=confirmados.querySelector('p');if(nota)nota.textContent='Esta consulta utiliza solo las piezas identificadas; cuando hay pérdidas pendientes, sus resultados son parciales. No es el escenario principal: este también utiliza propuestas documentadas, sin confirmar piezas reales. Un diámetro menor aquí no sustituye al resultado principal.';
    const tablaParcial=confirmados.querySelector('.sigas-diametros');if(tablaParcial){const caption=document.createElement('caption');caption.textContent='Datos identificados · comparación independiente, no resultado del escenario principal';tablaParcial.prepend(caption);}
    tecnicos.append(confirmados);
   }
  }
 }
 if(!root&&!out.querySelector('.ejercicio-sigas')&&!out.querySelector('.resultado-completo-generico')){
  const resultado=document.createElement('section');resultado.className='resultado-completo-generico';const h=document.createElement('h3');h.textContent='1 · Resultados y diámetros';resultado.append(h);
  const fusio=out.querySelector('.resultado-fusiogas'),sencillo=out.querySelector('.gas-calculo-sencillo');if(fusio){resultado.append(fusio);const tecnicos=out.querySelector('#detallesTecnicosResultadoGas');if(sencillo&&tecnicos)tecnicos.append(sencillo);}else if(sencillo)resultado.append(sencillo);out.prepend(resultado);
  const materiales=out.querySelector('.gas-solo-completo');if(materiales){const d=document.createElement('details'),s=document.createElement('summary');s.textContent='2 · Materiales y presupuesto';materiales.before(d);d.append(s,materiales);}
  const tecnicos=out.querySelector('#detallesTecnicosResultadoGas');if(tecnicos)tecnicos.querySelector('summary').textContent='3 · Memoria de cálculo y verificaciones';
 }
 if(!out.querySelector('.pdf-completo-gas')){
  const bloque=document.createElement('section');bloque.className='pdf-completo-gas';const h=document.createElement('h3');h.textContent='4 · Generar PDF completo';
  const b=document.createElement('button');b.type='button';b.textContent='Generar PDF completo';b.onclick=imprimirInformeActual;
  const nota=document.createElement('p');nota.className='nota';nota.textContent='Abre la impresión de Chrome: elegí Guardar como PDF. Incluye el escenario y distingue los datos reales pendientes de verificar.';bloque.append(h,b,nota);(root||out).append(bloque);
  const ensayo=out.querySelector('.ensayo-cortes-ideal-gas');if(ensayo){const d=document.createElement('details'),s=document.createElement('summary');d.className='avanzadas-resultado-completo';d.open=out.vistaSigasGas?.ambito===ambitoGas&&out.vistaSigasGas.avanzadas===true;s.textContent='Herramientas avanzadas · ensayo de cortes';d.append(s,ensayo);(root||out).append(d);}
 }
}
