/* Navegación GAS. Reutiliza nodos, validadores, guardado y motores existentes. */
let recorridoGasUI=null;
let herramientasAnterioresGas=false,preparandoEntradaGuiadaGas=false;
const secuenciaRecorridoGas=[1,3,5,4,7,8];
const pasosRecorridoGas=[
 ['Proyecto y sistema','Dale un nombre y elegí el sistema de cañería.'],
 ['Combustible y datos de cálculo','Ingresá solamente datos documentados. Los que falten quedarán pendientes en el resultado.'],
 ['Croquis de referencia','Cámara, galería o Continuar sin imagen. No se interpreta la fotografía.'],
 ['Tramos y accesorios','Ingresá origen, destino, metros, consumo y accesorios. Vacío es pendiente; cero confirma que no hay. En modo completo podés detallar sus distancias.'],
 ['Artefactos y consumos','Registrá los consumos de placa. Los datos ya cargados se conservan y se reutilizan en los tramos.'],
 ['Accesorios y conexiones','Revisá cantidades y vías de tees. Vacío significa pendiente; cero significa que no hay. No se exigen distancias.'],
 ['Cálculo y verificación','Mismo motor y datos del proyecto. Revisá conexiones y verificaciones; los resultados pendientes conservan su condición.'],
 ['Materiales e informe','Revisá el proyecto. Podés editar una sección sin repetir todo el recorrido.']
];
function ocultarEntradasGuiadoGas(){for(const id of ['inicio','entradaGas','especialidadProyectoGuiado','proyectosInicioGuiado'])$(id).classList.add('oculto');}
function mostrarNuevaEspecialidadGas(){herramientasAnterioresGas=false;if(recorridoGasUI)desmontarRecorridoGuiadoGas();if(modulo)guardarDatos();ocultarEntradasGuiadoGas();$('trabajo').classList.add('oculto');$('especialidadProyectoGuiado').classList.remove('oculto');window.scrollTo(0,0);}
function volverInicioGuiadoGas(){herramientasAnterioresGas=false;if(recorridoGasUI){guardarEstadoGuiadoGas();desmontarRecorridoGuiadoGas();}else if(modulo)guardarDatos();ocultarEntradasGuiadoGas();$('trabajo').classList.add('oculto');$('inicio').classList.remove('oculto');window.scrollTo(0,0);}
function elegirEspecialidadGuiadaGas(m){
 ocultarEntradasGuiadoGas();if(m!=='gas'){abrir(m);return;}
 herramientasAnterioresGas=false;preparandoEntradaGuiadaGas=true;try{abrir('gas');}finally{preparandoEntradaGuiadaGas=false;}let nombre='Borrador GAS',n=1;while(true){try{nombreProyectoValidoGas(nombre);break;}catch(e){nombre='Borrador GAS '+(++n);}}
 if(!crearProyectoGas(nombre))return;modoCargaGas='rapida';actualizarModoCargaGas();
 proyectoGasActual().recorridoGuiadoGas={version:1,paso:1,nombrePendiente:true,nombreBorrador:'',modo:presentacionGas};guardarDatos();activarRecorridoGuiadoGas();
}
function mostrarMisProyectosGuiadoGas(){
 if(recorridoGasUI){guardarEstadoGuiadoGas();desmontarRecorridoGuiadoGas();}else if(modulo)guardarDatos();
 ocultarEntradasGuiadoGas();$('trabajo').classList.add('oculto');$('proyectosInicioGuiado').classList.remove('oculto');const out=$('listaProyectosGuiado');out.replaceChildren();
 const agregar=(nombre,fn)=>{const b=document.createElement('button');b.className='alt';b.textContent=nombre;b.onclick=fn;out.append(b);};
 const raiz=proyectos.gas;if(raiz.nombreProyecto||raiz.tramos?.length||raiz.artefactos?.length||raiz.foto||raiz.borradorFormularioGas||raiz.borradorCroquis||raiz.aclaracion||raiz.revision||raiz.instalacion?.nodos?.length||raiz.instalacion?.perfil?.fuenteGas||raiz.planCompra?.extras?.length)agregar(raiz.nombreProyecto||'Mi proyecto de GAS',()=>abrirProyectoGuiadoGas('proyecto'));
 for(const p of registrosProyectosGas())agregar(p.nombre,()=>abrirProyectoGuiadoGas('proyecto:'+p.id));
 if(!out.children.length){const p=document.createElement('p');p.textContent='Todavía no hay proyectos GAS guardados. Elegí Nuevo proyecto para comenzar.';out.append(p);}for(const [id,nombre]of [['agua','AGUA'],['cloacas','CLOACAS']])if(proyectos[id]?.tramos?.length||proyectos[id]?.foto)agregar(nombre+' · datos actuales',()=>{ocultarEntradasGuiadoGas();abrir(id);});
}
function abrirProyectoGuiadoGas(id){if(recorridoGasUI){guardarEstadoGuiadoGas();desmontarRecorridoGuiadoGas();}herramientasAnterioresGas=false;ocultarEntradasGuiadoGas();preparandoEntradaGuiadaGas=true;try{abrir('gas');seleccionarAmbitoGas(id);}finally{preparandoEntradaGuiadaGas=false;}activarRecorridoGuiadoGas();}
function abrirRespaldoDesdeInicioGuiadoGas(){herramientasAnterioresGas=false;ocultarEntradasGuiadoGas();abrir('gas');$('guiadoAvanzadas').open=true;$('respaldosConfiguracionGas').open=true;}
function moverControlGuiadoGas(n,destino){
 if(typeof n==='string')n=$(n);if(!n||!destino||n.parentNode===destino)return;
 if(!recorridoGasUI.nodos.some(x=>x.n===n)){const marca=document.createComment('posición original '+(n.id||n.tagName));n.before(marca);recorridoGasUI.nodos.push({n,marca,abierto:n.open});}
 destino.append(n);
}
function moverCampoGuiadoGas(id,destino){const n=$(id);if(!n)return;const l=document.querySelector('label[for="'+id+'"]');if(l)moverControlGuiadoGas(l,destino);moverControlGuiadoGas(n,destino);}
function estadoRecorridoProyectoGas(){return proyectoGasActual().recorridoGuiadoGas||{};}
// Estados de interfaz: nunca sustituyen el dictamen del motor ni la aprobación normativa.
function firmaEstadoProyectoGuiadoGas(){
 const {recorridoGuiadoGas,borradorFormularioGas,...datos}=proyectoGasActual();
 return JSON.stringify({tramos,artefactos,instalacionGas,datos});
}
function firmaFormularioTramoGuiadoGas(){return JSON.stringify({valores:['desde','hasta','metros','consumoTramo','diametro','otroDiametro','destinoArtefacto',...tiposRapidosGas.map(([tipo])=>'manualGas_'+tipo)].map(id=>$(id)?.value??''),distancias:estadoRecorridoProyectoGas().distanciasBorrador?.[tramos[editandoTramo]?.id]||null});}
function formularioTramoSinCambiosGuiadoGas(){const inicial=recorridoGasUI?.formularioInicial;return !!(inicial&&tramos[editandoTramo]?.id===inicial.id&&firmaFormularioTramoGuiadoGas()===inicial.firma);}
function hayCambiosSinGuardarGuiadoGas(){return (formularioTramoSinCambiosGuiadoGas()?!!String($('gp')?.value||'').trim():['desde','hasta','metros','consumoTramo','gp',...tiposRapidosGas.map(([tipo])=>'manualGas_'+tipo)].some(id=>String($(id)?.value||'').trim()))||editandoAccesorios>=0||!!estadoRecorridoProyectoGas().edicionArtefacto;}
function estadoProyectoGuiadoGas(verificar=false){
 const ui=recorridoGasUI;if(!ui)return null;
 const e=estadoRecorridoProyectoGas(),red=redFisicaManualGas(),perfil=perfilTecnicoActualGas(),firma=firmaEstadoProyectoGuiadoGas(),borrador=hayCambiosSinGuardarGuiadoGas();
 if(verificar){
  ui.comprobacionTecnica=null;
  if(!borrador&&tramos.length&&CatalogosSistemasGas.identificar(instalacionGas.perfil)==='sigas'){
   const reg=registroAccesoriosSigasGas();
   if(reg?.verificacion.estado==='comprobacion-tabular-satisfecha'&&reg.calculo.filas.length===tramos.length&&reg.calculo.filas.every(f=>f.comprobadoPorTabla))ui.comprobacionTecnica={firma,alcance:'Capacidad comprobada por tabla SIGAS. Suministro y aprobación normativa se verifican por separado.'};
  }
 }
 const comprobado=!borrador&&ui.comprobacionTecnica?.firma===firma;
 const basicos=!!(!e.nombrePendiente&&!e.nombreSinConfirmar&&CatalogosSistemasGas.identificar(instalacionGas.perfil)&&perfil.gas&&tramos.length&&Number.isFinite(red.total)&&red.total>0&&!red.errores.length&&Number(perfil.poderCalorifico)>0&&String(perfil.fuenteGas||'').trim()&&!borrador);
 const estado=comprobado?'calculo-comprobado':e.completado&&basicos?'recorrido-finalizado':'borrador-incompleto';
 return {estado,recorridoFinalizado:e.completado===true,calculoComprobado:!!comprobado,mensaje:comprobado?'Cálculo técnicamente comprobado. '+ui.comprobacionTecnica.alcance:(estado==='recorrido-finalizado'?'Recorrido finalizado. Cálculo técnico pendiente de comprobación.':'Borrador incompleto. '+(e.completado?'Recorrido finalizado; ':'')+'Los resultados pendientes no son definitivos.')+(borrador?' Hay datos del formulario sin registrar; los resultados utilizan únicamente los datos ya registrados.':'')};
}
function actualizarEstadosGuiadoGas(verificar=false){
 if(!recorridoGasUI||modulo!=='gas')return;
 const e=estadoProyectoGuiadoGas(verificar);$('guiadoEstadoProyecto').textContent=e.mensaje;$('guiadoEstadoProyecto').dataset.estado=e.estado;
 const r=resultadoUltimoGuardadoGas;const estados={'borrador-incompleto':'Borrador incompleto','recorrido-finalizado':'Recorrido finalizado','calculo-comprobado':'Cálculo técnicamente comprobado'},guardados={guardado:'Guardado',parcial:'Foto solo en esta sesión',fallo:'No pudo guardarse'};$('guiadoEstadoResumen').textContent=estados[e.estado]+' · '+(guardados[r?.estado]||'Guardado pendiente');if(r&&r.estado!=='guardado')$('guiadoIndicadorEstado').open=true;$('guiadoGuardado').textContent=!r?'Guardado local pendiente.':r.estado==='guardado'?'Cambios guardados en este navegador.':r.estado==='parcial'?'Datos guardados; las fotos actuales solo están en esta sesión. Conservá un respaldo.':'Solo en esta sesión. '+$('estadoGuardado').textContent;
 $('guiadoGuardado').dataset.estado=r?.estado||'pendiente';$('guiadoEstado').dataset.guardado=r?.estado||'pendiente';
}
function mensajeGuardadoGuiadoGas(resultado){return resultado?.estado==='guardado'?'Proyecto guardado en este navegador. Podés generar el PDF o editar una sección.':resultado?.estado==='parcial'?'Datos guardados; las fotos actuales solo están en esta sesión. Conservá un respaldo.':'El proyecto queda solo en esta sesión; no pudo guardarse. Conservá un respaldo antes de cerrar.';}
function prepararSalidaGuiadoGas(){
 if(recorridoGasUI.paso===1&&$('nombreProyectoGas').value.trim()&&CatalogosSistemasGas.identificar(instalacionGas.perfil))validarProyectoGuiadoGas();
 if([4,7,8].includes(recorridoGasUI.paso)&&[$('desde').value,$('hasta').value,$('metros').value].some(v=>String(v).trim())){
  // Un formulario incompleto permanece como borrador; no se crea un tramo inválido.
  if($('desde').value.trim()&&$('hasta').value.trim()&&numeroDecimalGas($('metros').value)>0)guardarTramoAntesDeSeguirGuiadoGas();
 }
 guardarEstadoGuiadoGas();
}
function activarRecorridoGuiadoGas(){
 if(modulo!=='gas'||!document.querySelector)return;
 const e=proyectoGasActual().recorridoGuiadoGas||={version:1};recorridoGasUI={paso:Number.isInteger(e.paso)&&e.paso>=1&&e.paso<=8?e.paso:tramos.length?7:1,nodos:[],operacion:false,conexiones:false,esEdicion:!e.nombrePendiente&&tramos.length>0};
 if(e.rutaVersion!==2)recorridoGasUI.paso=({2:1,5:7,6:4})[recorridoGasUI.paso]||recorridoGasUI.paso;
 if(!secuenciaRecorridoGas.includes(recorridoGasUI.paso))recorridoGasUI.paso=1;
 if(['rapido','completo'].includes(e.modo))presentacionGas=e.modo;if(['rapida','profesional'].includes(e.modoCarga))modoCargaGas=e.modoCarga;actualizarPresentacionGas();actualizarModoCargaGas();
 document.body.classList.add('gas-guiado');$('recorridoGuiadoGas').classList.remove('oculto');$('trabajo').classList.remove('oculto');ocultarEntradasGuiadoGas();
 moverControlGuiadoGas('editorProyectosGas',$('guiadoPaso1'));$('editorProyectosGas').classList.remove('oculto');$('nombreProyectoGas').value=e.nombrePendiente||e.nombreSinConfirmar?(e.nombreBorrador||''):nombreProyectoGas();
 moverCampoGuiadoGas('catalogoSistemaGas',$('guiadoPaso1'));moverCampoGuiadoGas('combustibleSistemaGas',$('guiadoPaso1'));moverControlGuiadoGas('guiadoDatosCalculo',$('guiadoPaso1'));moverControlGuiadoGas('guiadoReferenciaEnsayo',$('guiadoDatosCalculo'));moverControlGuiadoGas('guiadoPropiedades',$('guiadoDatosCalculo'));
 for(const id of ['dimPCS','dimDensidad','dimFuenteGas']){moverCampoGuiadoGas(id,$('guiadoPropiedades'));$(id).value=perfilTecnicoActualGas()[({dimPCS:'poderCalorifico',dimDensidad:'densidadRelativa',dimFuenteGas:'fuenteGas'})[id]]??'';}
 moverControlGuiadoGas('guiadoModo',$('guiadoPaso1'));moverCampoGuiadoGas('presentacionGas',$('guiadoModo'));
 $('guiadoPaso1').append($('guiadoDatosCalculo'));
 moverControlGuiadoGas('referenciaOpcionalGas',$('guiadoPaso1'));$('referenciaOpcionalGas').open=false;
 for(const id of ['herramientasGasOpcionales','ejerciciosGasSeparados','respaldosConfiguracionGas','dimensionGas','redGas','revisionCroquis','consumos'])moverControlGuiadoGas(id,$('guiadoControlesAvanzados'));
 moverControlGuiadoGas('cargarEjemploTeesGas',$('ejerciciosGasSeparados'));
 organizarHerramientasPasoGuiadoGas();
 for(const id of ['consumoTramo']){const l=document.querySelector('label[for="'+id+'"]');l?.classList.add('guiado-consumo-tramo');$(id).classList.add('guiado-consumo-tramo');}
 const sel=$('guiadoEditarPaso');sel.replaceChildren();secuenciaRecorridoGas.forEach((paso,i)=>{const o=document.createElement('option');o.value=String(paso);o.textContent=(i+1)+' · '+pasosRecorridoGas[paso-1][0];sel.append(o);});
 aplicarPasoGuiadoGas();
}
// Reubica los controles originales: un solo registro y restauración al salir del asistente.
function grupoOrganizacionGuiadoGas(id,titulo,padre){let d=$(id);if(!d){d=document.createElement('details');d.id=id;const sum=document.createElement('summary');sum.textContent=titulo;d.append(sum);padre.append(d);}return d;}
function organizarHerramientasPasoGuiadoGas(){
 const grupo=grupoOrganizacionGuiadoGas;
 const carga=grupo('guiadoConsultaConsumos','Artefactos y consumos',$('guiadoPaso5'));carga.open=true;
 const revision=grupo('guiadoRevisionHerramientas','Detección y sugerencias de accesorios · opcional',$('guiadoPaso4'));
 const revisar=grupo('guiadoRevisionInstalacion','Revisar tramos y vías de tees',$('guiadoPaso4'));moverControlGuiadoGas('guiadoConsumos',revisar);
 grupo('guiadoDecisionesAccesorios','Productos y conexiones · completar solo lo pendiente',$('guiadoPaso4'));
 grupo('guiadoSuministro','Condiciones documentadas e inventario real · opcional',$('guiadoDatosCalculo'));
 const ayuda=grupo('guiadoAyudaHerramientas','Ayuda y demostraciones',$('guiadoControlesAvanzados'));
 if(!ayuda.querySelector('.guiado-guia')){const p=document.createElement('p');p.className='guiado-guia';p.textContent='Seguí los seis pasos. Podés guardar borradores, volver y editar una sección. Fotos y distancias son opcionales. Las propuestas no confirman piezas reales.';ayuda.append(p);}
 const tecnicas=grupo('guiadoHerramientasTecnicas','Herramientas técnicas anteriores · diagnóstico genérico',$('guiadoControlesAvanzados'));
 if(!tecnicas.querySelector('.guiado-alcance')){const p=document.createElement('p');p.className='guiado-alcance';p.textContent='Herramientas independientes de preparación, edición de la red y ejercicios. Sus bloqueos no sustituyen la verificación específica del sistema que se muestra en Cálculo y verificación.';tecnicas.append(p);}
 moverControlGuiadoGas('consumos',carga);
 moverControlGuiadoGas('deteccionOpcionalGas',revision);
 moverControlGuiadoGas('conciliacionRapidaGas',revision);moverControlGuiadoGas('matUniones',grupo('guiadoUnionesRevision','Uniones y cambios de diámetro · revisión anterior',$('guiadoPaso4')));
 moverControlGuiadoGas($('matExtraNombre').closest('details'),$('guiadoPaso4'));
 for(const id of ['planoOpcionalGas','respaldosConfiguracionGas'])moverControlGuiadoGas(id,$('guiadoControlesAvanzados'));
 for(const id of ['ejerciciosGasSeparados','modalidadIaFuturaGas'])moverControlGuiadoGas(id,ayuda);
 for(const id of ['dimensionGas','redGas','revisionCroquis','herramientasGasOpcionales'])moverControlGuiadoGas(id,tecnicas);
 for(const n of $('herramientasGasOpcionales').querySelectorAll('nav.opciones,button[onclick="mostrarVista(\'consumos\')"]'))n.classList.add('guiado-acceso-redundante');
 for(const id of ['opcionesAvanzadasPlanGas','ajustesAvanzadosGas','entregaGasOpcional','exportarListaGas'])moverControlGuiadoGas(id,$('guiadoPaso8'));
 moverControlGuiadoGas($('estadoLargoComercialGas').closest('details'),$('opcionesAvanzadasPlanGas'));
 $('opcionesAvanzadasPlanGas').querySelector('summary').textContent='Tiras, reutilización y opciones de compra';
 const largo=$('matLargo');if(!$('guiadoLargosComerciales')){const lista=document.createElement('datalist');lista.id='guiadoLargosComerciales';for(const v of [4,6]){const o=document.createElement('option');o.value=String(v);lista.append(o);}document.body.append(lista);}largo.setAttribute('list','guiadoLargosComerciales');
 const titulo=$('ajustesAvanzadosGas').querySelector('summary');titulo.textContent='Revisión avanzada de materiales · registro independiente';
 if(!$('guiadoMaterialesInforme')){const n=document.createElement('div');n.id='guiadoMaterialesInforme';$('guiadoPDF').before(n);}
 if(!$('guiadoResumenDiametros')){const n=document.createElement('div');n.id='guiadoResumenDiametros';$('guiadoResumenFinal').after(n);}
 moverControlGuiadoGas('calcularCaneriaGas',$('guiadoPaso7'));$('guiadoPaso7').prepend($('calcularCaneriaGas'));
 moverControlGuiadoGas('guiadoAvanzadas',document.querySelector('.guiado-cabecera'));
 organizarFormularioPrincipalGuiadoGas();
}
function desmontarRecorridoGuiadoGas(){
 if(!recorridoGasUI)return;
 restaurarPanelesResultadoGuiadoGas();$('consumoTramo').readOnly=false;$('consumoTramo').hidden=false;document.querySelector('label[for="consumoTramo"]').hidden=false;$('consumos').querySelector('button[onclick="agregarArtefacto()"]').textContent='Agregar artefacto';document.querySelectorAll('.guiado-acceso-redundante').forEach(n=>n.classList.remove('guiado-acceso-redundante'));$('matLargo').removeAttribute('list');
 for(const {n,marca,abierto}of recorridoGasUI.nodos.slice().reverse()){if(marca.parentNode){marca.before(n);marca.remove();}if(typeof abierto==='boolean')n.open=abierto;}
 for(const n of document.querySelectorAll('.guiado-editar-artefacto,#guiadoArtefactosEnTramos,#guiadoCancelarArtefacto,#guiadoNotaConsumoTramo,#guiadoTotalConsumo'))n.remove();
 if($('guiadoConversionConsumos')&&!$('guiadoConversionConsumos').querySelector('input,select,button'))$('guiadoConversionConsumos').remove();
 $('herramientasGasOpcionales').classList.remove('oculto');recorridoGasUI=null;$('modoCargaGas').disabled=false;document.body.classList.remove('gas-guiado');delete document.body.dataset.pasoGuiado;$('recorridoGuiadoGas').classList.add('oculto');$('editorProyectosGas').classList.add('oculto');
}
function salirRecorridoGuiadoGas(){if(recorridoGasUI){guardarEstadoGuiadoGas();desmontarRecorridoGuiadoGas();}herramientasAnterioresGas=true;ocultarEntradasGuiadoGas();abrir('gas');}
function abrirHerramientasAnterioresGas(){salirRecorridoGuiadoGas();}
function guardarEstadoGuiadoGas(){
 if(!recorridoGasUI||modulo!=='gas')return;
 const e=proyectoGasActual().recorridoGuiadoGas||={version:1};e.rutaVersion=2;e.paso=recorridoGasUI.paso;e.modo=presentacionGas;e.modoCarga=modoCargaGas;
 if(recorridoGasUI.paso===5&&!$('guiadoPaso5').classList.contains('oculto')){e.consumosBorrador||={};for(const div of $('guiadoConsumos').querySelectorAll('[data-tramo]')){const i=div.querySelector('input'),sel=div.querySelector('select'),t=tramos.find(t=>t.id===div.dataset.tramo),registrado=t&&(t.consumo??redFisicaManualGas().porTramo[t.id]);if(!t)continue;if(t&&String(i.value).trim()!==''&&numeroDecimalGas(i.value)===registrado&&sel.value===tipoArtefactoGuiadoGas(t))delete e.consumosBorrador[t.id];else e.consumosBorrador[div.dataset.tramo]={consumo:i.value,artefacto:sel.value};}}
 if(e.nombrePendiente||e.nombreSinConfirmar)e.nombreBorrador=$('nombreProyectoGas').value;guardarDatos();actualizarEstadosGuiadoGas();return resultadoUltimoGuardadoGas;
}
function errorGuiadoGas(texto,campo){$('guiadoError').textContent=texto;campo?.focus();return false;}
function guardarTramoAntesDeSeguirGuiadoGas(){
 if(formularioTramoSinCambiosGuiadoGas())return true;
 if(![$('desde').value,$('hasta').value,$('metros').value].some(v=>String(v).trim()))return true;
 if(!$('desde').value.trim()||!$('hasta').value.trim()||!(numeroDecimalGas($('metros').value)>0))return errorGuiadoGas('Completá Desde, Hasta y metros mayores a cero para guardar el tramo.',$('desde'));
 recorridoGasUI.guardandoNavegacion=true;try{agregarTramo();}finally{recorridoGasUI.guardandoNavegacion=false;}if($('desde').value||$('hasta').value||$('metros').value)return errorGuiadoGas($('mensajeCargaManualGas').textContent||'Revisá los datos del tramo antes de continuar.');return true;
}
function validarProyectoGuiadoGas(){const nombre=$('nombreProyectoGas').value.trim();if(!nombre)return errorGuiadoGas('Ingresá el nombre del proyecto.',$('nombreProyectoGas'));if(!CatalogosSistemasGas.identificar(instalacionGas.perfil))return errorGuiadoGas('Elegí el sistema de cañería.',$('catalogoSistemaGas'));if(nombre!==nombreProyectoGas()&&!renombrarProyectoGas(nombre))return errorGuiadoGas($('mensajeProyectosGas').textContent,$('nombreProyectoGas'));proyectoGasActual().recorridoGuiadoGas.nombrePendiente=false;proyectoGasActual().recorridoGuiadoGas.nombreSinConfirmar=false;return true;}
function continuarGuiadoGas(){
 if(!recorridoGasUI)return;const paso=recorridoGasUI.paso;prepararSalidaGuiadoGas();
 if(paso===8){const e=estadoRecorridoProyectoGas();e.completado=true;const resultado=guardarEstadoGuiadoGas();$('guiadoEstado').textContent=mensajeGuardadoGuiadoGas(resultado);return;}
 recorridoGasUI.paso=secuenciaRecorridoGas[secuenciaRecorridoGas.indexOf(paso)+1];if(recorridoGasUI.paso===8)estadoRecorridoProyectoGas().completado=true;guardarEstadoGuiadoGas();aplicarPasoGuiadoGas(true);
}
function retrocederGuiadoGas(){if(!recorridoGasUI)return;prepararSalidaGuiadoGas();if(recorridoGasUI.paso!==1){recorridoGasUI.paso=secuenciaRecorridoGas[secuenciaRecorridoGas.indexOf(recorridoGasUI.paso)-1];guardarEstadoGuiadoGas();aplicarPasoGuiadoGas(true);}else volverInicioGuiadoGas();}
function editarPasoGuiadoGas(paso){paso=({2:1,6:4})[paso]||paso;if(!recorridoGasUI||!secuenciaRecorridoGas.includes(paso))return;prepararSalidaGuiadoGas();recorridoGasUI.paso=paso;guardarEstadoGuiadoGas();aplicarPasoGuiadoGas(true);}
function aplicarPasoGuiadoGas(desplazar=false){
 const ui=recorridoGasUI;if(!ui)return;const p=ui.paso;document.body.dataset.pasoGuiado=String(p);$('modoCargaGas').disabled=presentacionGas==='rapido';if(presentacionGas==='rapido')$('modoCargaGas').value='rapida';
 for(let i=1;i<=8;i++)$('guiadoPaso'+i).classList.toggle('oculto',i!==p);
 $('guiadoTitulo').textContent=pasosRecorridoGas[p-1][0];$('guiadoAyuda').textContent=pasosRecorridoGas[p-1][1];$('guiadoProgresoTexto').textContent='Paso '+(secuenciaRecorridoGas.indexOf(p)+1)+' de 6';$('guiadoProgreso').max=6;$('guiadoProgreso').value=secuenciaRecorridoGas.indexOf(p)+1;$('guiadoProyectoActual').textContent=nombreProyectoGas();$('guiadoEditarPaso').value=String(p);$('guiadoEditarLabel').classList.remove('oculto');$('guiadoContinuar').textContent=p===8?'Guardar proyecto':p===4?'Terminé de cargar los tramos':'Continuar';$('guiadoError').textContent='';$('guiadoEstado').textContent='';
 moverControlGuiadoGas('referenciaOpcionalGas',$('guiadoPaso3'));$('referenciaOpcionalGas').open=p===3;
 $('guiadoReferenciaEnsayo').classList.toggle('oculto',perfilTecnicoActualGas().gas!=='GN');
 const destino=$('guiadoPaso'+(p===6?6:4));for(const id of ['editarTramosGas','tramosRegistradosGas'])moverControlGuiadoGas(id,destino);
 $('editarTramosGas').open=true;if(p===4){$('agregarAccesoriosGas').open=true;renderDistanciasIntegralGas();}$('tramosRegistradosGas').open=p!==6;$('guardarTramo').textContent=p===6?'Guardar accesorios':'Guardar tramo';
 for(const b of $('listaTramos').querySelectorAll('button'))if(b.textContent==='Revisar accesorios')b.dataset.guiadoAccion='accesorios';
 if(p===1)$('editorProyectosGas').classList.remove('oculto');
 if(p===4){$('guiadoPaso4').append($('guiadoConexiones'));renderConexionesGuiadoGas();}
 if(p===4){renderRevisionIntegralGas();renderEdicionAccesoriosGuiadoGas();sincronizarConsumoTramoGuiadoGas();organizarFormularioPrincipalGuiadoGas();}
 if(p===5)renderArtefactosGuiadoGas();
 if(p===6){$('guiadoPaso6').append($('guiadoConexiones'));const sel=$('guiadoTramoAccesorios'),anterior=sel.value;sel.replaceChildren();for(const t of tramos){const o=document.createElement('option');o.value=t.id;o.textContent=t.desde+'–'+t.hasta;sel.append(o);}const elegido=tramos[editandoAccesorios>=0?editandoAccesorios:editandoTramo]?.id||anterior;sel.value=tramos.some(t=>t.id===elegido)?elegido:tramos[0]?.id||'';if(editandoTramo<0&&editandoAccesorios<0&&sel.value)seleccionarAccesoriosGuiadoGas(sel.value);calcularMaterialesManualGas();renderConexionesGuiadoGas();}
 if(p===7||p===8){calcularMaterialesManualGas();moverControlGuiadoGas('resumenPrincipalMaterialesGas',$('guiadoPaso7'));organizarPanelesResultadoGuiadoGas();}
 if(p===8){const r=redFisicaManualGas();$('guiadoResumenFinal').textContent=nombreProyectoGas()+' · '+tramos.length+' tramos · '+tramos.reduce((s,t)=>s+t.metros,0).toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2})+' m · '+(Number.isFinite(r.total)?fmt(r.total)+' kcal/h':'consumo pendiente')+'. Los estados técnicos y las estimaciones conservan su alcance en el PDF.';}
 actualizarEstadosGuiadoGas(p===7||p===8);
 if(desplazar){$('guiadoAvanzadas').open=false;window.scrollTo({top:0,behavior:'instant'});$('guiadoTitulo').focus({preventScroll:true});}
}
function seleccionarAccesoriosGuiadoGas(id){
 if(!recorridoGasUI)return;const i=tramos.findIndex(t=>t.id===id);if(i<0)return;
 if(editandoTramo>=0&&tramos[editandoTramo]?.id!==id&&!guardarTramoAntesDeSeguirGuiadoGas()){$('guiadoTramoAccesorios').value=tramos[editandoTramo]?.id||'';return;}
 recorridoGasUI.operacion=true;try{editarTramo(i);}finally{recorridoGasUI.operacion=false;}$('agregarAccesoriosGas').open=true;$('guardarTramo').textContent='Guardar accesorios';
}
function destinosConsumosGuiadoGas(){
 const r=redFisicaManualGas(),desde=new Set(Object.values(r.orientacion).map(o=>o.desde));return tramos.filter(t=>t.artefacto||r.orientacion[t.id]&&!desde.has(r.orientacion[t.id].hasta));
}
function tipoArtefactoGuiadoGas(t){
 if(t.artefacto)return t.artefacto;const r=redFisicaManualGas(),n=r.puntos.find(n=>n.id===r.orientacion[t.id]?.hasta),asociados=artefactos.filter(a=>a.id&&a.id===n?.artefactoId);
 if(asociados.length===1)return reconocerDestinoArtefactoGas(asociados[0].nombre).tipo||asociados[0].nombre;return reconocerDestinoArtefactoGas(n?.nombre||t.hasta).tipo||'';
}
function renderConsumosGuiadoGas(){
 const out=$('guiadoConsumos');out.replaceChildren();const lista=destinosConsumosGuiadoGas();if(!lista.length){out.textContent='Completá los tramos y sus destinos para vincular los consumos.';return;}
 for(const t of lista){const div=document.createElement('div');div.className='guiado-consumo-fila';div.dataset.tramo=t.id;const titulo=document.createElement('h3');titulo.textContent=t.desde+'–'+t.hasta;div.append(titulo);
 const sel=$('destinoArtefacto').cloneNode(true);sel.removeAttribute('id');sel.removeAttribute('onchange');sel.ariaLabel='Artefacto en '+t.desde+'–'+t.hasta;const tipo=tipoArtefactoGuiadoGas(t);if(tipo&&!Array.from(sel.options).some(o=>o.value===tipo)){const o=document.createElement('option');o.value=tipo;o.textContent=tipo;sel.append(o);}sel.value=tipo;
 const input=document.createElement('input');input.type='text';input.inputMode='decimal';input.ariaLabel='Consumo en '+t.desde+'–'+t.hasta+' (kcal/h)';const registrado=redFisicaManualGas().porTramo[t.id];input.value=estadoRecorridoProyectoGas().consumosBorrador?.[t.id]?.consumo??t.consumo??(Number.isFinite(registrado)?registrado:'');
 const l=document.createElement('label');l.textContent='Artefacto de destino';l.append(sel);const m=document.createElement('label');m.textContent='Consumo de placa (kcal/h)';m.append(input);div.append(l,m);out.append(div);
 const registrar=()=>{const e=proyectoGasActual().recorridoGuiadoGas||={version:1};e.consumosBorrador||={};e.consumosBorrador[t.id]={consumo:input.value,artefacto:sel.value};guardarEstadoGuiadoGas();};const guardar=()=>{registrar();if(sel.value&&(String(input.value).trim()===''||numeroDecimalGas(input.value)>=0))guardarConsumoFilaGuiadoGas(t.id,input.value,sel.value,true);};input.oninput=registrar;sel.onchange=input.onchange=guardar;
 if(Object.hasOwn(estadoRecorridoProyectoGas().consumosBorrador?.[t.id]||{},'artefacto'))sel.value=estadoRecorridoProyectoGas().consumosBorrador[t.id].artefacto;
 }
}
function guardarConsumoFilaGuiadoGas(id,valor,artefacto,permitirVacio=false){
 const i=tramos.findIndex(t=>t.id===id);if(i<0||!artefacto||(!permitirVacio&&String(valor).trim()==='')||(String(valor).trim()!==''&&!(numeroDecimalGas(valor)>=0)))return false;
 const limpiar=()=>{const e=proyectoGasActual().recorridoGuiadoGas;if(e?.consumosBorrador)delete e.consumosBorrador[id];};
 if(tramos[i].consumo===numeroDecimalGas(valor)&&tramos[i].artefacto===artefacto){limpiar();guardarDatos();return true;}
 if(tramos[i].consumo==null&&String(valor).trim()!==''&&redFisicaManualGas().porTramo[id]===numeroDecimalGas(valor)&&tipoArtefactoGuiadoGas(tramos[i])===artefacto){limpiar();guardarDatos();return true;}
 const previo=proyectoGasActual().borradorFormularioGas?JSON.parse(JSON.stringify(proyectoGasActual().borradorFormularioGas)):null;recorridoGasUI.operacion=true;try{editarTramo(i);$('consumoTramo').value=valor;if(!Array.from($('destinoArtefacto').options).some(o=>o.value===artefacto)){const o=document.createElement('option');o.value=artefacto;o.textContent=artefacto;$('destinoArtefacto').append(o);}$('destinoArtefacto').value=artefacto;agregarTramo();const ok=!$('desde').value;if(ok)limpiar();if(previo?.tramo){if(previo.tramo===id){previo.valores.consumoTramo=valor;previo.valores.destinoArtefacto=artefacto;}proyectoGasActual().borradorFormularioGas=previo;restaurarBorradorProyectoGas();guardarDatos();}else guardarDatos();return ok;}finally{recorridoGasUI.operacion=false;}
}
function guardarTodosConsumosGuiadoGas(){
 for(const div of $('guiadoConsumos').querySelectorAll('[data-tramo]')){const input=div.querySelector('input'),sel=div.querySelector('select');if(!guardarConsumoFilaGuiadoGas(div.dataset.tramo,input.value,sel.value))return errorGuiadoGas('Indicá artefacto y consumo válido para '+div.querySelector('h3').textContent+'.',input);}return true;
}
function renderConexionesGuiadoGas(){
 if(!recorridoGasUI||recorridoGasUI.conexiones||recorridoGasUI.paso!==4)return;recorridoGasUI.conexiones=true;
 try{const out=$('guiadoConexiones'),abiertos=Array.from(out.querySelectorAll('details[open]')).map(d=>d.querySelector('summary')?.textContent),y=window.scrollY,enConexion=out.contains(document.activeElement);out.replaceChildren();const reg=registroAccesoriosSigasGas(),modelo=resultadoPreliminarSigasGas();if(!reg)return;const titulo=document.createElement('h3');titulo.textContent='Conexiones SIGAS · decisiones pendientes';out.append(titulo);for(const n of reg.entradaTecnica.inventario.necesidadesTerminales){if(n.id!=='terminal-medidor'&&!n.tramos.some(id=>{const t=tramos.find(t=>t.id===id);return t&&(t.artefacto||tipoArtefactoGuiadoGas(t));}))continue;if(recorridoGasUI.paso===4&&recorridoGasUI.tramoConexiones&&!n.tramos.includes(recorridoGasUI.tramoConexiones))continue;if(!reg.entradaTecnica.config.terminales?.[n.id]?.rosca){const l=document.createElement('label'),sel=document.createElement('select');l.textContent=n.nombre+' · rosca';sel.ariaLabel=l.textContent;const valores=['',...new Set(SIGAS_ED15_2025.tablas[3].filas.map(f=>DimensionamientoSigas.atributosTerminal(f)?.rosca).filter(Boolean))];for(const v of valores){const o=document.createElement('option');o.value=v;o.textContent=v?v+'″':'Pendiente';sel.append(o);}sel.onchange=()=>guardarDatoTerminalSigasGas(n.id,'rosca',sel.value);l.append(sel);out.append(l);}else renderConfirmacionConexionTerminalSigasGas(out,n.id,modelo);}if(!out.querySelector('label,details'))out.replaceChildren();for(const d of out.querySelectorAll('details'))if(abiertos.includes(d.querySelector('summary')?.textContent))d.open=true;if(enConexion)window.scrollTo({top:y,behavior:'instant'});}
 finally{recorridoGasUI.conexiones=false;}
}
function instalarRecorridoGuiadoGas(){
 if(!document.querySelector)return;
 const abrirOriginal=window.abrir;window.abrir=function(m){const activo=!!recorridoGasUI;if(activo){if(modulo==='gas')guardarEstadoGuiadoGas();desmontarRecorridoGuiadoGas();}const r=abrirOriginal.call(this,m);if(m==='gas'&&!herramientasAnterioresGas&&!preparandoEntradaGuiadaGas)activarRecorridoGuiadoGas();return r;};
 const entradaAnterior=window.mostrarEntradaGas;window.mostrarEntradaGas=function(){if(herramientasAnterioresGas)return entradaAnterior.apply(this,arguments);if(recorridoGasUI)return editarPasoGuiadoGas(1);abrir('gas');editarPasoGuiadoGas(1);};
 const volverAnterior=window.volver;window.volver=function(){if(recorridoGasUI)return volverInicioGuiadoGas();herramientasAnterioresGas=false;return volverAnterior.apply(this,arguments);};
 const envolver=(nombre,despues)=>{const original=window[nombre];if(typeof original!=='function')return;window[nombre]=function(...args){const r=original.apply(this,args);if(recorridoGasUI)despues?.(args,r);return r;};};
 envolver('seleccionarCombustibleGas',()=>{$('guiadoReferenciaEnsayo').classList.toggle('oculto',perfilTecnicoActualGas().gas!=='GN');});
 envolver('cambiarModoCargaGas',()=>guardarEstadoGuiadoGas());
 envolver('elegirPresentacionGas',()=>{guardarEstadoGuiadoGas();aplicarPasoGuiadoGas();});
 envolver('editarTramo',()=>{if(!recorridoGasUI.operacion&&![4,6].includes(recorridoGasUI.paso))editarPasoGuiadoGas(4);});
 const calcularOriginal=window.calcularMaterialesManualGas;window.calcularMaterialesManualGas=function(...args){if(recorridoGasUI)restaurarPanelesResultadoGuiadoGas();const anterior=conservandoVistaOrientacionTeeGas;if([4,5,6,7,8].includes(recorridoGasUI?.paso))conservandoVistaOrientacionTeeGas=true;try{return calcularOriginal.apply(this,args);}finally{conservandoVistaOrientacionTeeGas=anterior;if([4,5,6,7,8].includes(recorridoGasUI?.paso)&&!recorridoGasUI.operacion)renderConexionesGuiadoGas();if([7,8].includes(recorridoGasUI?.paso)&&!recorridoGasUI.conexiones)actualizarEstadosGuiadoGas(true);if(recorridoGasUI)organizarPanelesResultadoGuiadoGas();}};
 envolver('renderTramos',()=>{for(const b of $('listaTramos').querySelectorAll('button'))if(b.textContent==='Revisar accesorios')b.dataset.guiadoAccion='accesorios';});
 envolver('agregarTramo',()=>{if(recorridoGasUI.paso===4&&/cantidades|enteros/i.test($('mensajeCargaManualGas').textContent)){$('agregarAccesoriosGas').dataset.correccionGuiada='true';$('agregarAccesoriosGas').open=true;}if(!$('desde').value){$('guiadoError').textContent='';if(recorridoGasUI.paso===4&&!recorridoGasUI.operacion){$('guiadoEstado').textContent='Tramo guardado. Podés cargar otro o terminar la carga.';$('guiadoOtroTramo').classList.remove('oculto');$('agregarAccesoriosGas').open=true;}delete $('agregarAccesoriosGas').dataset.correccionGuiada;if(recorridoGasUI.paso===6&&!recorridoGasUI.operacion&&!recorridoGasUI.guardandoNavegacion){const i=tramos.findIndex(t=>t.id===$('guiadoTramoAccesorios').value);if(i>=0){recorridoGasUI.operacion=true;try{editarTramo(i);$('agregarAccesoriosGas').open=true;}finally{recorridoGasUI.operacion=false;}}}}$('guardarTramo').textContent=recorridoGasUI.paso===6?'Guardar accesorios':'Guardar tramo';guardarEstadoGuiadoGas();});
 envolver('mostrarVista',([v])=>{if(v==='dimensionGas'&&(!(Number(perfilTecnicoActualGas().poderCalorifico)>0)||!String(perfilTecnicoActualGas().fuenteGas||'').trim())){editarPasoGuiadoGas(1);$('guiadoDatosCalculo').open=true;$('guiadoPropiedades').open=true;$('dimensionGas').classList.add('oculto');$('guiadoAvanzadas').open=false;return;}if(['dimensionGas','redGas','revisionCroquis','consumos'].includes(v)){if(v==='consumos')editarPasoGuiadoGas(5);else $('guiadoAvanzadas').open=true;$(v).classList.remove('oculto');let n=$(v).parentElement;while(n&&n!==$('recorridoGuiadoGas')){if(n.tagName==='DETAILS')n.open=true;n=n.parentElement;}}});
 envolver('guardarDatos',()=>{actualizarEstadosGuiadoGas();if(resultadoUltimoGuardadoGas?.estado!=='guardado')$('guiadoEstado').textContent=mensajeGuardadoGuiadoGas(resultadoUltimoGuardadoGas);});
 const abrirSeccion=destino=>{const paso=({foto:3,tramos:4,cargar:4,revisar:4,conciliacion:7,materiales:8,pdf:8})[destino];if(!paso)return;editarPasoGuiadoGas(paso);};
 envolver('irSeccionGas',([destino])=>abrirSeccion(destino));envolver('irPasoProyectoGas',([destino])=>abrirSeccion(destino));envolver('mostrarEditorProyectoGas',([accion])=>{if(accion==='renombrar')editarPasoGuiadoGas(1);});
 envolver('seleccionarAmbitoGas',()=>{$('nombreProyectoGas').value=nombreProyectoGas();guardarEstadoGuiadoGas();});
 document.addEventListener('input',e=>{if(!recorridoGasUI||!$('recorridoGuiadoGas').contains(e.target))return;if(e.target.id==='nombreProyectoGas'){proyectoGasActual().recorridoGuiadoGas.nombreBorrador=e.target.value;proyectoGasActual().recorridoGuiadoGas.nombreSinConfirmar=true;}guardarEstadoGuiadoGas();});
 window.addEventListener('pagehide',()=>guardarEstadoGuiadoGas());
}
if(typeof window!=='undefined'&&document.addEventListener)window.addEventListener('load',()=>{instalarRecorridoGuiadoGas();instalarCargaIntegralGas();instalarOrganizacionEtapa2Gas();});

function cargarOtroTramoGuiadoGas(){
 if(!guardarTramoAntesDeSeguirGuiadoGas())return;
 cancelarEdicionTramo();$('agregarAccesoriosGas').open=true;$('desde').focus();$('guiadoEstado').textContent='Nuevo tramo. Completá sus datos y accesorios antes de guardarlo.';
}
function usarReferenciaEnsayoGuiadoGas(){
 const p=perfilTecnicoActualGas();if(p.gas!=='GN')return;
 if(String(p.poderCalorifico||'').trim()||String(p.fuenteGas||'').trim()){$('guiadoEstado').textContent='Se conservan las propiedades ya registradas. Podés revisarlas en Datos documentados del suministro.';return;}
 $('dimPCS').value='9300';$('dimFuenteGas').value='Referencia de ensayo GN: 9.300 kcal/m³. No verifica el suministro real.';guardarCondicionesDimensionamiento();guardarEstadoGuiadoGas();$('guiadoEstado').textContent='PCS de ensayo: 9.300 kcal/m³. No es una propiedad verificada del suministro real.';
}

// Adaptador de carga: el detalle guardado es el que ya utilizan cortes y materiales.
function claveDistribucionIntegralGas(){return editandoTramo>=0?tramos[editandoTramo].id:'nuevo';}
function borradorDistribucionIntegralGas(){
 const e=estadoRecorridoProyectoGas();e.distanciasBorrador||={};const k=claveDistribucionIntegralGas();
 if(!e.distanciasBorrador[k]){const d=tramos[editandoTramo]?.detalle;e.distanciasBorrador[k]={filas:JSON.parse(JSON.stringify(d?.distribucionPendiente||d?.accesorios||[])),final:d?.metrosFinal??'',finalOrigen:d?.finalOrigen,finalAnterior:d?.finalAnterior,base:d?.baseDistancias||'geometrica'};}
 return e.distanciasBorrador[k];
}
function renderDistanciasIntegralGas(){
 if(!recorridoGasUI)return;let out=$('guiadoDistancias');if(!out){out=document.createElement('details');out.id='guiadoDistancias';const s=document.createElement('summary');s.textContent='Distancias y orden de accesorios (opcional)';out.append(s,document.createElement('div'));$('agregarAccesoriosGas').after(out);}
 out.classList.toggle('oculto',presentacionGas!=='completo');if(presentacionGas!=='completo')return;
 const d=borradorDistribucionIntegralGas(),nombres={codo90:'Codo de 90°',codo45:'Codo de 45°',tee:'Tee',reduccion:'Reducción',llave:'Llave de paso',cupla:'Cupla'},conteos=tiposRapidosGas.map(([tipo])=>[tipo,$('manualGas_'+tipo)?.value]);
 const actual=tramos[editandoTramo];if(actual&&String($('manualGas_tee').value).trim()===''&&!d.filas.some(a=>a.tipo==='tee')){try{const a=entradaManualMaterialesGas(false,true).extras.find(a=>a.tipo==='tee'&&a.deducido&&a.tramo===actual.id&&!a.conflicto);if(a&&nombrePuntoManualGas(actual.hasta)===nombrePuntoManualGas(redFisicaManualGas().puntos.find(n=>n.id===a.nodo)?.nombre||String(a.nodo).replace(/^nombre:/,'')))d.filas.push({tipo:'tee',deducido:true,nodo:actual.hasta,nodoOrigen:'deducido',posicionDeducida:'final',metrosAntes:'',salida:''});}catch(e){/* No se deduce una pieza si no se puede resolver la red. */}}
 // Conservar orden y medidas de piezas existentes; nuevas piezas siguen pendientes.
 for(const[tipo,valor]of conteos){if(!/^\d+$/.test(String(valor)))continue;const n=Number(valor);if(n>200)continue;let existentes=d.filas.filter(a=>a.tipo===tipo).length;while(existentes<n){d.filas.push({tipo,metrosAntes:'',salida:''});existentes++;}while(existentes>n){d.filas.splice(d.filas.findLastIndex(a=>a.tipo===tipo),1);existentes--;}}
 d.cantidadesPendientes=conteos.some(([tipo,v])=>String(v??'').trim()===''&&!(tipo==='tee'&&d.filas.some(a=>a.tipo==='tee'&&a.deducido)));
 const cuerpo=out.lastElementChild;cuerpo.replaceChildren();const nota=document.createElement('p');nota.textContent='Opcional para precisar cortes. Registrá las distancias sucesivas; el restante se calcula. Sin medidas, la compra sigue estimada.';cuerpo.append(nota);const labelBase=document.createElement('label'),base=document.createElement('select');labelBase.textContent='Qué representan las medidas';base.ariaLabel=labelBase.textContent;for(const[v,t]of [['geometrica','Distancias de referencia; ajustes de inserción pendientes'],['neta','Longitudes netas de caño ya determinadas para cortar']]){const o=document.createElement('option');o.value=v;o.textContent=t;base.append(o);}base.value=d.base||'geometrica';base.onchange=()=>{d.base=base.value;guardarEstadoGuiadoGas();};labelBase.append(base);cuerpo.append(labelBase);
 const campo=(texto,valor,fn)=>{const l=document.createElement('label'),i=document.createElement('input');l.textContent=texto;i.type='text';i.inputMode='decimal';i.value=valor??'';i.oninput=()=>{fn(i.value);guardarEstadoGuiadoGas();estadoDistanciasIntegralGas();};l.append(i);cuerpo.append(l);return i;};
 d.filas.forEach((a,i)=>{campo('Distancia hasta '+(nombres[a.tipo]||a.tipo)+' '+(i+1)+' (m)',a.metrosAntes,v=>a.metrosAntes=v).dataset.distanciaIndice=String(i);if(a.tipo==='tee'){const input=campo('Ubicación de la tee (solo si no se puede deducir)',a.nodo||'',v=>{a.nodo=v;a.nodoOrigen='manual';});input.dataset.nodoTeeIndice=String(i);input.inputMode='text';}const row=document.createElement('div');for(const[delta,texto]of [[-1,'Subir'],[1,'Bajar']]){const b=document.createElement('button');b.type='button';b.className='peq alt';b.textContent=texto+' accesorio '+(i+1);b.disabled=i+delta<0||i+delta>=d.filas.length;b.onclick=()=>{[d.filas[i],d.filas[i+delta]]=[d.filas[i+delta],d.filas[i]];guardarEstadoGuiadoGas();renderDistanciasIntegralGas();};row.append(b);}cuerpo.append(row);});
 const final=campo('Distancia restante hasta el destino (calculada, m)',d.final,()=>{});final.id='guiadoDistanciaFinal';final.readOnly=true;const estado=document.createElement('p');estado.id='guiadoEstadoDistancias';estado.role='status';cuerpo.append(estado);estadoDistanciasIntegralGas();
}
function evaluarDistribucionIntegralGas(d,metros){
 actualizarDistanciasDeducidasGas(d,metros,$('hasta').value);
 const leer=v=>String(v??'').trim()===''?null:numeroDecimalGas(v);const valores=[...d.filas.map(a=>leer(a.metrosAntes)),leer(d.final)];
 if(valores.some(v=>v!==null&&(!Number.isFinite(v)||v<0)))return {error:'Usá distancias numéricas no negativas, con coma o punto decimal.'};
 if(valores.some(v=>v===null))return {pendiente:true,mensaje:'Distancias pendientes: se conserva un borrador y la compra sigue estimada.'};
 const suma=valores.reduce((a,b)=>a+b,0);if(!Number.isFinite(metros)||Math.abs(suma-metros)>1e-8)return {error:'Las distancias suman '+fmt(suma)+' m; deben coincidir con '+fmt(metros)+' m del tramo.'};
 if(d.filas.some(a=>a.tipo==='tee'&&!String(a.nodo||'').trim()))return {pendiente:true,mensaje:'Falta indicar el nodo de la tee; no se inventó su ubicación.'};
 if(d.cantidadesPendientes)return {pendiente:true,mensaje:'Cantidades de accesorios sin declarar: se conservan pendientes, no como cero.'};
 const nodos=d.filas.filter(a=>a.tipo==='tee').map(a=>String(a.nodo).trim().toLowerCase());if(new Set(nodos).size!==nodos.length)return {error:'Dos posiciones nombran la misma tee física. Revisá la cantidad o su nodo sin duplicarla.'};
 return {completa:true,valores,mensaje:'Distancias completas: '+fmt(suma)+' m. Los productos y diámetros mantienen su estado técnico.'};
}
function estadoDistanciasIntegralGas(){const el=$('guiadoEstadoDistancias');if(!el)return;const r=evaluarDistribucionIntegralGas(borradorDistribucionIntegralGas(),numeroDecimalGas($('metros').value));el.textContent=r.error||r.mensaje;el.style.color=r.error?'#9b281f':'';const d=borradorDistribucionIntegralGas();$('guiadoDistanciaFinal').parentNode.firstChild.textContent=d.finalOrigen==='deducido'?'Distancia restante hasta el destino (calculada, m)':'Distancia final registrada; restante aún pendiente (m)';$('guiadoDistanciaFinal').value=Number.isFinite(d.final)?String(Number(d.final.toFixed(8))):d.final??'';for(const i of $('guiadoDistancias').querySelectorAll('[data-nodo-tee-indice]')){const a=d.filas[Number(i.dataset.nodoTeeIndice)],deducida=a.nodoOrigen==='deducido';const posiciones=d.filas.slice(0,Number(i.dataset.nodoTeeIndice)+1).map(a=>String(a.metrosAntes??'').trim()===''?NaN:numeroDecimalGas(a.metrosAntes)),conocida=posiciones.every(Number.isFinite)&&Math.abs(posiciones.reduce((s,n)=>s+n,0)-numeroDecimalGas($('metros').value))<1e-8&&nombrePuntoManualGas(a.nodo)===nombrePuntoManualGas($('hasta').value);i.value=a.nodo||'';i.readOnly=deducida||conocida;i.hidden=deducida||conocida;i.parentNode.firstChild.textContent=deducida||conocida?'Tee en '+a.nodo+(deducida?' · nodo deducido al final del tramo':' · nodo registrado'):'Ubicación de la tee (solo si no se puede deducir)';}for(const i of $('guiadoDistancias').querySelectorAll('[data-distancia-indice]')){const a=d.filas[Number(i.dataset.distanciaIndice)];if(a.posicionDeducida==='final'){i.value=Number.isFinite(a.metrosAntes)?String(Number(a.metrosAntes.toFixed(8))):a.metrosAntes??'';i.readOnly=true;}}presentarRestanteEnDestinoGas(d,numeroDecimalGas($('metros').value),$('hasta').value);}
function renderRevisionIntegralGas(){
 const out=$('guiadoConsumos');out.replaceChildren();const red=redFisicaManualGas();
 tramos.forEach((t,i)=>{const div=document.createElement('div');div.className='detalle';const p=document.createElement('p');p.textContent=t.desde+'–'+t.hasta+' · '+fmt(t.metros)+' m · '+(Number.isFinite(red.porTramo[t.id])?fmt(red.porTramo[t.id])+' kcal/h acumulados':'consumo pendiente');div.append(p);
 if(presentacionGas==='completo'){const d=t.detalle,nota=document.createElement('p');nota.textContent=d?.accesorios?.some(a=>Number.isFinite(a.metrosAntes))?'Distancias: '+d.accesorios.map(a=>(Number.isFinite(a.metrosAntes)?fmt(a.metrosAntes):'pendiente')+' m → '+(Object.fromEntries(tiposRapidosGas)[a.tipo]||a.tipo)).join(' / ')+' / final '+(Number.isFinite(d.metrosFinal)?fmt(d.metrosFinal):'pendiente')+' m.':'Distancias sin detallar; compra estimada.';div.append(nota);}
 const b=document.createElement('button');b.className='alt';b.textContent='Editar '+t.desde+'–'+t.hasta;b.onclick=()=>editarTramo(i);div.append(b);out.append(div);});
 const tees=document.createElement('div');tees.id='guiadoTeesRevision';out.append(tees);
 let e;try{e=entradaPreseleccionSigasGas();}catch(error){return;}if(CatalogosSistemasGas.identificar(instalacionGas.perfil)!=='sigas')return;
 for(const aviso of [...new Set(e?.inventario.pendientes||[])].filter(s=>/cero confirmado|cambiaron sus conexiones|tee manual sin ubicación|más de tres conexiones|tee registrada no está vinculada/.test(s))){const p=document.createElement('p');p.className='aviso';p.textContent=aviso;tees.append(p);}
 for(const pieza of e?.inventario.fisicas.filter(p=>p.tipo==='tee')||[]){const titulo=document.createElement('h3');titulo.textContent='Tee '+String(pieza.nodo||'ubicación pendiente').replace(/^nombre:/,'').toUpperCase();tees.append(titulo);const contexto=contextoOrientacionTeeGas(pieza,e);if(!contexto){const aviso=document.createElement('p');aviso.textContent='Pendiente: identificar una entrada y dos salidas reales. Revisá los extremos de los tramos y el nodo de la tee.';tees.append(aviso);continue;}const vias=proyectoGasActual().calculoSigas?.tees?.[pieza.id]?.viasPorTramo||{};
 for(const id of contexto.salidas){const p=document.createElement('p'),nombre=red.puntos.find(n=>n.id===red.orientacion[id]?.hasta)?.nombre||tramos.find(t=>t.id===id)?.hasta;p.textContent='Hacia '+nombre+': '+({directo:'A través',giro:'Giro 90°'}[vias[id]]||'Orientación pendiente');tees.append(p);}
 const editar=document.createElement('button');editar.className='alt';editar.textContent='Configurar '+titulo.textContent;editar.onclick=()=>{const i=tramos.findIndex(t=>t.id===contexto.entrada);if(i>=0)editarTramo(i);$('agregarAccesoriosGas').open=true;$('nodoTeeRapidaGas').value=pieza.id;renderConfiguracionTeeRapidaGas();$('panelTeeRapidaGas').scrollIntoView({block:'center'});};tees.append(editar);}
}
function instalarCargaIntegralGas(){
 const editar=window.editarTramo;window.editarTramo=function(...args){const r=editar.apply(this,args);if(recorridoGasUI){recorridoGasUI.tramoConexiones=tramos[args[0]]?.id;const previo=estadoRecorridoProyectoGas().consumosBorrador?.[recorridoGasUI.tramoConexiones];if(previo){$('consumoTramo').value=previo.consumo??'';if(previo.artefacto)$('destinoArtefacto').value=previo.artefacto;}renderDistanciasIntegralGas();renderConexionesGuiadoGas();}return r;};
 const guardar=window.agregarTramo;window.agregarTramo=function(...args){
  if(!recorridoGasUI||recorridoGasUI.operacion||presentacionGas!=='completo')return guardar.apply(this,args);
  renderDistanciasIntegralGas();const clave=claveDistribucionIntegralGas(),d=JSON.parse(JSON.stringify(borradorDistribucionIntegralGas())),r=evaluarDistribucionIntegralGas(d,numeroDecimalGas($('metros').value));
  if(r.error){$('guiadoDistancias').open=true;return errorGuiadoGas(r.error);}
  const id=tramos[editandoTramo]?.id,cantidad=tramos.length,detallePrevio=tramos[editandoTramo]?.detalle;
 const detalleIngresado=r.completa||!!detallePrevio||d.base==='neta'||d.filas.some(a=>(!a.posicionDeducida&&String(a.metrosAntes??'').trim()!=='')||a.nodoOrigen==='manual'||String(a.salida||'').trim());
 const result=guardar.apply(this,args);if($('desde').value||(!id&&tramos.length===cantidad))return result;
  const t=id?tramos.find(t=>t.id===id):tramos.at(-1);if(!t)return result;
  const leer=v=>String(v??'').trim()===''?'':numeroDecimalGas(v);
  if(detalleIngresado)t.detalle={...t.detalle,baseDistancias:d.base||'geometrica',finalOrigen:d.finalOrigen,finalAnterior:d.finalAnterior,estado:r.completa?(d.filas.length?'completo':'ninguno'):'pendiente',accesorios:d.filas.filter(a=>a.tipo!=='tee'||String(a.nodo||'').trim()).map(a=>({...a,metrosAntes:leer(a.metrosAntes)})),distribucionPendiente:d.filas.some(a=>a.tipo==='tee'&&!String(a.nodo||'').trim())?d.filas:undefined,metrosFinal:leer(d.final)};
  delete estadoRecorridoProyectoGas().distanciasBorrador[clave];if(!detalleIngresado)estadoRecorridoProyectoGas().distanciasBorrador[t.id]=d;if(estadoRecorridoProyectoGas().consumosBorrador)delete estadoRecorridoProyectoGas().consumosBorrador[t.id];recorridoGasUI.tramoConexiones=t.id;if(r.completa&&datosPlanGas().opciones.reutilizar==null){datosPlanGas().opciones.reutilizar=true;$('matReusar').checked=true;}guardarDatos();renderTramos();renderDistanciasIntegralGas();$('guiadoPaso4').append($('guiadoConexiones'));renderConexionesGuiadoGas();if(!r.completa)$('guiadoEstado').textContent+=' Compra estimada: distancias opcionales sin completar.';return result;
 };
 const render=window.renderConfiguracionTeeRapidaGas;window.renderConfiguracionTeeRapidaGas=function(...args){const r=render.apply(this,args);if(!recorridoGasUI)return r;const box=$('viasTeeRapidaGas');if(!box)return r;const etiquetas=[...box.querySelectorAll('label')];if(etiquetas.some(l=>/Salida [12]/.test(l.textContent))){box.replaceChildren();$('estadoTeeRapidaGas').textContent='Tee registrada. Al terminar los tramos se mostrarán sus salidas reales para indicar la circulación.';}return r;};
 const vias=window.guardarConfiguracionTeeSigasGas;window.guardarConfiguracionTeeSigasGas=function(id,c){if(recorridoGasUI&&Object.values(c.viasPorTramo||{}).filter(v=>v==='directo').length>1)return errorGuiadoGas('Una tee no puede tener dos salidas a través desde una misma entrada.');const r=vias.apply(this,arguments);if(recorridoGasUI?.paso===4)renderRevisionIntegralGas();return r;};
 document.addEventListener('input',e=>{if(!recorridoGasUI)return;if(e.target.id?.startsWith('manualGas_'))renderDistanciasIntegralGas();else if(['metros','hasta'].includes(e.target.id))estadoDistanciasIntegralGas();});
}

function actualizarDistanciasDeducidasGas(d,metros,destino){
 let suma=0,conocida=Number.isFinite(metros)&&metros>0;
 for(const [indice,a]of d.filas.entries()){if(a.posicionDeducida==='final'){if(indice===d.filas.length-1){a.metrosAntes=conocida?metros-suma:'';if(!a.nodo||a.nodoOrigen==='deducido'){a.nodo=String(destino||'').trim();a.nodoOrigen='deducido';}}else delete a.posicionDeducida;}const v=String(a.metrosAntes??'').trim()===''?NaN:numeroDecimalGas(a.metrosAntes);if(!Number.isFinite(v)||v<0)conocida=false;else suma+=v;
  if(a.tipo==='tee'){
   if(conocida&&Math.abs(suma-metros)<1e-8&&String(destino||'').trim()&&(!a.nodo||a.nodoOrigen==='deducido')){a.nodo=destino.trim();a.nodoOrigen='deducido';}
   else if(a.nodoOrigen==='deducido'&&a.posicionDeducida!=='final'){a.nodoAnteriorDeducido=a.nodo;a.nodo='';delete a.nodoOrigen;}
  }
 }
 if(conocida){const restante=Math.abs(metros-suma)<1e-8?0:metros-suma;if(d.finalOrigen!=='deducido'&&String(d.final??'').trim()!==''&&numeroDecimalGas(d.final)!==restante)d.finalAnterior=d.final;d.final=restante;d.finalOrigen='deducido';}else if(d.finalOrigen==='deducido')d.final='';
 return d;
}

// Solo presentación: no cambia distancias, conexiones ni datos de cálculo.
function presentarRestanteEnDestinoGas(d,metros,destino){
 const campo=$('guiadoDistanciaFinal'),ultimo=d.filas.at(-1);
 const valores=d.filas.map(a=>String(a.metrosAntes??'').trim()===''?NaN:numeroDecimalGas(a.metrosAntes));
 const posicionesCompletas=Number.isFinite(metros)&&valores.every(v=>Number.isFinite(v)&&v>=0);
 const enDestino=!!ultimo&&((!!String(destino||'').trim()&&nombrePuntoManualGas(ultimo.nodo)===nombrePuntoManualGas(destino))||(posicionesCompletas&&Math.abs(valores.reduce((s,v)=>s+v,0)-metros)<1e-8));
 campo.parentNode.hidden=enDestino;campo.parentNode.classList.toggle('oculto',enDestino);
 if(!enDestino)return;
 if(Number.isFinite(metros)&&valores.every(v=>Number.isFinite(v)&&v>=0)&&Math.abs(valores.reduce((s,v)=>s+v,0)-metros)>1e-8){
  $('guiadoEstadoDistancias').textContent='El último accesorio está en '+destino+', pero las distancias hasta él suman '+fmt(valores.reduce((s,v)=>s+v,0))+' m y el tramo declara '+fmt(metros)+' m. Revisá las distancias; no corresponde agregar otro segmento después del destino.';
  $('guiadoEstadoDistancias').style.color='#9b281f';
 }
}

// Etapa 2: organización de controles compartidos. Ningún modelo técnico se copia ni se recalcula aquí.
let renderizadoresOrganizacionGas=null,edicionArtefactoGuiadoGas=null;
function enlaceCorreccionGuiadoGas(padre,texto,paso){const b=document.createElement('button');b.type='button';b.className='alt';b.textContent=texto;b.onclick=()=>{editarPasoGuiadoGas(paso);if(paso===1)$('guiadoDatosCalculo').open=true;if(paso===4)$('guiadoDecisionesAccesorios').open=true;};padre.append(b);return b;}
function restaurarPanelesResultadoGuiadoGas(){
 if(!recorridoGasUI)return;for(const {n,marca,abierto,internos}of (recorridoGasUI.panelesResultado||[]).slice().reverse()){if(marca.parentNode){marca.before(n);marca.remove();}if(typeof abierto==='boolean')n.open=abierto;for(const [d,v]of internos||[])d.open=v;}recorridoGasUI.panelesResultado=[];
}
function moverPanelResultadoGuiadoGas(n,destino){
 if(!n||!destino||n.parentNode===destino)return;const marca=document.createComment('panel compartido');n.before(marca);(recorridoGasUI.panelesResultado||=[]).push({n,marca,abierto:n.open,internos:[...n.querySelectorAll(':scope > details')].map(d=>[d,d.open])});destino.append(n);
}
function organizarPanelesResultadoGuiadoGas(){
 if(!recorridoGasUI||recorridoGasUI.organizandoPaneles)return;recorridoGasUI.organizandoPaneles=true;
 try{
  restaurarPanelesResultadoGuiadoGas();const out=$('resumenPrincipalMaterialesGas'),destino=$('guiadoMaterialesInforme');if(!destino)return;
  const historicos=grupoOrganizacionGuiadoGas('guiadoHistoricosMateriales','Registros y revisiones anteriores · no sumar al vigente',destino);
  const root=out.querySelector('.sigas-vista-sencilla');
  const estadoSistema=out.querySelector('.estado-sistema-resultados');if(estadoSistema)estadoSistema.textContent=estadoSistema.textContent.replace('Diámetros pendientes de verificación.','Consultá el estado específico de cada tramo.');
  if(root){const materiales=root.querySelector('.sigas-piezas-detalle');moverPanelResultadoGuiadoGas(materiales,destino);if(materiales)materiales.open=true;for(const n of out.querySelectorAll('.gas-calculo-preliminar .gas-calculo-sencillo'))moverPanelResultadoGuiadoGas(n,out.querySelector('.gas-calculo-preliminar'));}
  for(const n of [...out.querySelectorAll('.fusiogas-materiales,.ejercicio-materiales,.ejercicio-compra-resumen')]){moverPanelResultadoGuiadoGas(n,destino);if(n.classList.contains('ejercicio-materiales'))for(const d of n.querySelectorAll(':scope > details'))d.open=true;}
  for(const n of [...out.querySelectorAll('.gas-solo-completo')]){if(n.closest('.sigas-piezas-detalle'))continue;const historial=!!n.closest('.gas-calculo-preliminar');const contenedor=n.parentElement.tagName==='DETAILS'&&n.parentElement!==out.querySelector('.gas-calculo-preliminar')?n.parentElement:n;moverPanelResultadoGuiadoGas(contenedor,historial?historicos:destino);}
  for(const n of [...out.querySelectorAll('.avanzadas-resultado-completo,.ensayo-cortes-ideal-gas,.guiado-edicion-cortes')])if(out.contains(n))moverPanelResultadoGuiadoGas(n,destino);
  historicos.hidden=!historicos.querySelector('.gas-solo-completo');
  for(const n of out.querySelectorAll('.pdf-completo-gas'))n.classList.add('guiado-acceso-redundante');
  const resumen=$('guiadoResumenDiametros');resumen.replaceChildren();const h=document.createElement('h3');h.textContent='Diámetros del proyecto · resumen';resumen.append(h);
  const tabla=out.querySelector('.resultados-tramos table,.ejercicio-sigas>table,.resultado-fusiogas table,.gas-calculo-sencillo');
  if(tabla?.tagName==='TABLE'){const t=document.createElement('table');t.className='tabla';for(const fila of tabla.rows){const tr=document.createElement('tr'),indices=tabla.closest('.resultado-fusiogas')?[0,3]:tabla.closest('.ejercicio-sigas')?[0,2]:[0,4];for(const i of indices){const celda=fila.cells[i];if(celda){const td=document.createElement(fila.parentNode.tagName==='THEAD'?'th':'td');td.textContent=tabla.closest('.ejercicio-sigas')&&i===2?celda.textContent.split('·')[0].trim():celda.textContent;tr.append(td);}}const estado=document.createElement(fila.parentNode.tagName==='THEAD'?'th':'td');estado.textContent=fila.parentNode.tagName==='THEAD'?'Estado':(tabla.closest('.ejercicio-sigas')?(fila.cells[2]?.textContent.split('·')[1]?.trim()||'Pendiente'):(fila.cells[fila.cells.length-1]?.textContent||'Pendiente').split('·')[0].trim());tr.append(estado);t.append(tr);}resumen.append(t);}else{const p=document.createElement('p');p.textContent='Diámetros y estados: consultá Cálculo y verificación. Los pendientes no son definitivos.';resumen.append(p);}
  enlaceCorreccionGuiadoGas(resumen,'Consultar memoria y verificación técnica',7);
  destino.classList.toggle('oculto',presentacionGas==='rapido');for(const id of ['opcionesAvanzadasPlanGas','ajustesAvanzadosGas','exportarListaGas','entregaGasOpcional'])$(id).classList.toggle('guiado-acceso-redundante',presentacionGas==='rapido');
 }finally{recorridoGasUI.organizandoPaneles=false;}
}
function renderEdicionAccesoriosGuiadoGas(){
 if(!recorridoGasUI||!renderizadoresOrganizacionGas)return;const out=$('guiadoDecisionesAccesorios'),abierto=out.open;out.querySelectorAll(':scope > :not(summary)').forEach(n=>n.remove());
 const sistema=CatalogosSistemasGas.identificar(instalacionGas.perfil);
 if(sistema==='sigas'){
  renderizadoresOrganizacionGas.pendientes(out);
  const reg=registroAccesoriosSigasGas(),terminales=new Set(reg?.piezas.filter(p=>p.necesidadTerminal).map(p=>'pendiente:'+p.id));for(const n of out.querySelectorAll('.sigas-decision-pendiente'))if(terminales.has(n.claveTerminalSigas))n.remove();
  const pendiente=out.querySelector('.sigas-pendientes-compactos');if(pendiente)pendiente.querySelector('summary').textContent='Otras piezas pendientes · '+pendiente.querySelectorAll('.sigas-decision-pendiente').length+' decisiones';
  const avanzadas=grupoOrganizacionGuiadoGas('guiadoOtrasPiezasSigas','Corregir otras piezas registradas · avanzado',out);avanzadas.querySelectorAll(':scope > :not(summary)').forEach(n=>n.remove());if(reg)renderizadoresOrganizacionGas.vinculos(avanzadas,reg.calculo);
 }else if(sistema==='fusiogas')renderizadoresOrganizacionGas.fusiogas(out);
 else{const p=document.createElement('p');p.textContent='Conexiones y accesorios del sistema seleccionado: conservá los datos físicos. Las variantes y equivalencias no documentadas permanecen pendientes.';out.append(p);}
 out.open=abierto;
}
function refrescarEdicionAccesoriosGuiadoGas(){
 if(recorridoGasUI?.paso!==4||recorridoGasUI.refrescandoAccesorios)return;recorridoGasUI.refrescandoAccesorios=true;
 try{const out=$('guiadoDecisionesAccesorios'),y=window.scrollY,activo=out.contains(document.activeElement)?document.activeElement:null,clave=n=>n.claveTerminalSigas||n.claveTeeSigas||n.querySelector('summary')?.textContent,abiertos=[...out.querySelectorAll('details[open]')].map(clave),etiqueta=activo?.getAttribute('aria-label');renderEdicionAccesoriosGuiadoGas();for(const n of out.querySelectorAll('details'))if(abiertos.includes(clave(n)))n.open=true;if(etiqueta)[...out.querySelectorAll('[aria-label]')].find(n=>n.getAttribute('aria-label')===etiqueta)?.focus({preventScroll:true});window.scrollTo({top:y,behavior:'instant'});}finally{recorridoGasUI.refrescandoAccesorios=false;}
}
function renderSuministroGuiadoGas(){
 if(!recorridoGasUI||!renderizadoresOrganizacionGas)return;const out=$('guiadoSuministro');out.querySelectorAll(':scope > :not(summary)').forEach(n=>n.remove());
 if(CatalogosSistemasGas.identificar(instalacionGas.perfil)!=='sigas')return;const temporal=document.createElement('div');renderizadoresOrganizacionGas.verificacion(temporal);const form=temporal.querySelector('[name="sigasPCS"]')?.closest('details');if(!form)return;
 for(const nombre of ['sigasPCS','sigasDensidad','sigasFuenteGas']){const i=form.querySelector('[name="'+nombre+'"]');if(i)i.closest('label').hidden=true;}
 out.append(form);const nota=document.createElement('p');nota.textContent='PCS, densidad y fuente se toman de los campos anteriores. Estas condiciones no bloquean la consulta tabular cuando corresponden a verificaciones posteriores.';out.prepend(nota);
}
function sincronizarConsumoTramoGuiadoGas(){
 if(!recorridoGasUI)return;const destino=reconocerDestinoArtefactoGas($('hasta').value),tipo=$('destinoArtefacto').value||destino.tipo;
 const coincidencias=artefactos.filter(a=>nombrePuntoManualGas(a.nombre)===nombrePuntoManualGas($('hasta').value)||nombrePuntoManualGas(a.nombre)===nombrePuntoManualGas(tipo));
 let nota=$('guiadoNotaConsumoTramo');if(!nota){nota=document.createElement('p');nota.id='guiadoNotaConsumoTramo';$('consumoTramo').after(nota);}const ligado=coincidencias.length===1;
 $('consumoTramo').hidden=ligado;document.querySelector('label[for="consumoTramo"]').hidden=ligado;$('consumoTramo').readOnly=ligado;$('consumoTramo').placeholder=ligado?'Se reutiliza el consumo del artefacto':'Pendiente si corresponde a un artefacto';
 nota.textContent=ligado?'Consumo individual de '+coincidencias[0].nombre+': '+fmt(coincidencias[0].consumo)+' kcal/h, ya registrado. El consumo acumulado del tramo se calcula por sus recorridos.':coincidencias.length>1?'Hay artefactos con el mismo nombre: falta vincular inequívocamente el destino. No se duplicaron consumos.':'Consumo propio: solo para artefactos. El consumo acumulado se calcula por los recorridos.';
 const anterior=tramos[editandoTramo];if(ligado&&Number.isFinite(anterior?.consumo)&&anterior.consumo!==coincidencias[0].consumo)nota.textContent='Consumos distintos: este tramo registra '+fmt(anterior.consumo)+' kcal/h y '+coincidencias[0].nombre+' registra '+fmt(coincidencias[0].consumo)+' kcal/h. Se conservaron ambos datos. Editá el artefacto para unificar el consumo de sus tramos vinculados.';
 if(ligado)enlaceCorreccionGuiadoGas(nota,'Editar artefacto y consumo',5);
}
function buscarArtefactoGuiadoGas(ref){return ref.id!=null?artefactos.find(a=>a.id===ref.id):artefactos[ref.indice];}
function actualizarResumenArtefactosGuiadoGas(){
 let total=$('guiadoTotalConsumo');if(!total){total=document.createElement('p');total.id='guiadoTotalConsumo';total.role='status';$('listaGas').before(total);}
 const registrados=destinosConsumosGuiadoGas().filter(t=>!artefactos.some(a=>[tipoArtefactoGuiadoGas(t),t.hasta].some(v=>nombrePuntoManualGas(a.nombre)===nombrePuntoManualGas(v))));
 const valores=[...artefactos.map(a=>a.consumo),...registrados.map(t=>t.consumo)];const conocidos=valores.filter(Number.isFinite);total.textContent='Consumo registrado: '+(conocidos.length?fmt(conocidos.reduce((s,v)=>s+v,0))+' kcal/h':valores.length?'Pendiente':'Sin artefactos')+(conocidos.length<valores.length?' · Hay consumos pendientes':'');
 calcularConsumos();
}
// Ordenar solo si cambió la estructura; no reinsertar controles que ya están en su lugar.
function ordenarControlesGuiadoGas(padre,nodos){
 const lista=nodos.filter(Boolean),hijos=[...padre.children];let anterior=-1;
 const ordenados=lista.every(n=>{const i=hijos.indexOf(n),ok=n.parentNode===padre&&i>anterior;anterior=i;return ok;});if(ordenados)return;
 for(const n of lista){if(!recorridoGasUI.nodos.some(x=>x.n===n)){const marca=document.createComment('posición original '+(n.id||n.tagName));n.before(marca);recorridoGasUI.nodos.push({n,marca,abierto:n.open});}padre.append(n);}
}
function actualizarVisibilidadCasilleroGuiadoGas(){
 if(!recorridoGasUI)return;const extremos=[$('desde').value,$('hasta').value].map(nombrePuntoManualGas);$('entradaCasilleroGas').closest('details').classList.toggle('guiado-acceso-redundante',!extremos.some(n=>['m','medidor'].includes(n)));
}
function organizarFormularioPrincipalGuiadoGas(){
 if(!recorridoGasUI)return;const f=$('formularioGas');
 // Mover los controles originales conserva sus manejadores y permite restaurar la vista anterior.
 const avanzado=$('diametro').closest('details');moverCampoGuiadoGas('destinoArtefacto',f);moverCampoGuiadoGas('consumoTramo',f);
 const nota=$('guiadoNotaConsumoTramo');if(nota)moverControlGuiadoGas(nota,f);
 for(const id of ['agregarAccesoriosGas'])moverControlGuiadoGas(id,f);
 const casillero=$('entradaCasilleroGas').closest('details');moverControlGuiadoGas(casillero,f);
 actualizarVisibilidadCasilleroGuiadoGas();
 if($('guiadoDistancias'))moverControlGuiadoGas('guiadoDistancias',f);
 moverControlGuiadoGas(avanzado,f);moverControlGuiadoGas('guardarTramo',f);moverControlGuiadoGas('cancelarTramo',f);moverControlGuiadoGas('guiadoOtroTramo',f);
 // Orden explícito también cuando los controles ya pertenecen al mismo formulario.
 ordenarControlesGuiadoGas(f,[document.querySelector('label[for="destinoArtefacto"]'),$('destinoArtefacto'),document.querySelector('label[for="consumoTramo"]'),$('consumoTramo'),nota,$('agregarAccesoriosGas'),casillero,$('guiadoDistancias'),avanzado,$('guardarTramo'),$('cancelarTramo'),$('guiadoOtroTramo')]);
 const paso=$('guiadoPaso4');
 const profesional=grupoOrganizacionGuiadoGas('guiadoEditorAnterior','Editor detallado anterior · opcional',paso);moverControlGuiadoGas($('guiadoTramoAccesorios').closest('label'),profesional);
 const selector=$('guiadoTramoAccesorios'),ids=tramos.map(t=>t.id);if(JSON.stringify([...selector.options].map(o=>o.value))!==JSON.stringify(ids)){const previo=selector.value;selector.replaceChildren();for(const t of tramos){const o=document.createElement('option');o.value=t.id;o.textContent=t.desde+'–'+t.hasta;selector.append(o);}if(ids.includes(previo))selector.value=previo;}
 if(!$('guiadoAbrirDetalle')){const b=document.createElement('button');b.id='guiadoAbrirDetalle';b.className='alt';b.textContent='Abrir editor detallado anterior';b.onclick=()=>{const i=tramos.findIndex(t=>t.id===selector.value);if(i>=0)abrirAccesorios(i);else errorGuiadoGas('Primero guardá un tramo.');};profesional.append(b);}moverControlGuiadoGas('editorAccesorios',profesional);const extra=$('matExtraNombre').closest('details');moverControlGuiadoGas(extra,paso);ordenarControlesGuiadoGas(paso,['editarTramosGas','tramosRegistradosGas','guiadoRevisionInstalacion','guiadoConexiones','guiadoDecisionesAccesorios','guiadoRevisionHerramientas','guiadoUnionesRevision'].map($).concat(profesional,extra));
 const conversion=grupoOrganizacionGuiadoGas('guiadoConversionConsumos','Conversión orientativa · no cambia el suministro',$('consumos'));
 for(const id of ['gt','resultadoGas']){if(id==='gt')moverCampoGuiadoGas(id,conversion);else moverControlGuiadoGas(id,conversion);}
 $('consumos').querySelector('button[onclick="calcularConsumos()"]').classList.add('guiado-acceso-redundante');
}
function renderArtefactosGuiadoGas(){
 if(!recorridoGasUI)return;edicionArtefactoGuiadoGas=estadoRecorridoProyectoGas().edicionArtefacto||null;if(edicionArtefactoGuiadoGas){const r=edicionArtefactoGuiadoGas,existe=(r.tipo==='artefacto'?artefactos:tramos).some((a,i)=>r.id!=null?a.id===r.id:i===r.indice);if(!existe){edicionArtefactoGuiadoGas=null;delete estadoRecorridoProyectoGas().edicionArtefacto;}}for(const [i,fila]of [...$('listaGas').children].entries())if(artefactos[i]&&!fila.querySelector('.guiado-editar-artefacto')){const b=document.createElement('button');b.className='peq alt guiado-editar-artefacto';b.textContent='Editar';b.onclick=()=>editarArtefactoGuiadoGas({tipo:'artefacto',id:artefactos[i].id,indice:i});fila.append(b);}
 let lista=$('guiadoArtefactosEnTramos');if(!lista){lista=document.createElement('div');lista.id='guiadoArtefactosEnTramos';$('listaGas').after(lista);}lista.replaceChildren();
 for(const t of destinosConsumosGuiadoGas()){
  const tipo=tipoArtefactoGuiadoGas(t);if(artefactos.some(a=>nombrePuntoManualGas(a.nombre)===nombrePuntoManualGas(tipo)||nombrePuntoManualGas(a.nombre)===nombrePuntoManualGas(t.hasta)))continue;
  const d=document.createElement('div');d.className='detalle';const p=document.createElement('p');p.textContent=(tipo||t.hasta)+' · '+(Number.isFinite(t.consumo)?fmt(t.consumo)+' kcal/h individuales':'Consumo individual pendiente')+' · registrado en '+t.desde+'–'+t.hasta;d.append(p);const b=document.createElement('button');b.className='alt';b.textContent='Editar consumo de '+t.hasta;b.onclick=()=>editarArtefactoGuiadoGas({tipo:'tramo',id:t.id});d.append(b);lista.append(d);
 }
 actualizarResumenArtefactosGuiadoGas();
 const boton=$('consumos').querySelector('button[onclick="agregarArtefacto()"]');boton.textContent=edicionArtefactoGuiadoGas?'Guardar cambios del artefacto':'Agregar artefacto';
 let cancelar=$('guiadoCancelarArtefacto');if(!cancelar){cancelar=document.createElement('button');cancelar.id='guiadoCancelarArtefacto';cancelar.className='alt';cancelar.textContent='Cancelar edición';cancelar.onclick=()=>{edicionArtefactoGuiadoGas=null;delete estadoRecorridoProyectoGas().edicionArtefacto;$('gp').value='';renderArtefactosGuiadoGas();guardarEstadoGuiadoGas();};boton.after(cancelar);}cancelar.hidden=!edicionArtefactoGuiadoGas;
}
function editarArtefactoGuiadoGas(ref){
 const a=ref.tipo==='artefacto'?buscarArtefactoGuiadoGas(ref):tramos.find(t=>t.id===ref.id);if(!a)return;edicionArtefactoGuiadoGas=ref;estadoRecorridoProyectoGas().edicionArtefacto=ref;
 const nombre=ref.tipo==='artefacto'?a.nombre:tipoArtefactoGuiadoGas(a);if(![...$('ga').options].some(o=>o.value===nombre)){const o=document.createElement('option');o.value=nombre;o.textContent=nombre;$('ga').append(o);}$('ga').value=nombre;$('gp').value=a.consumo??'';renderArtefactosGuiadoGas();guardarEstadoGuiadoGas();$('gp').focus();
}
function renderOrientacionesOtrosSistemasGuiadoGas(){
 const selector=$('nodoTeeRapidaGas'),out=$('viasTeeRapidaGas'),red=redFisicaManualGas(),inventario=inventarioAccesoriosParaMotorGas(red),piezas=inventario.fisicas.filter(p=>p.tipo==='tee'),previo=selector.value;selector.replaceChildren();out.replaceChildren();
 $('panelTeeRapidaGas').classList.toggle('oculto',!piezas.length&&!(Number($('manualGas_tee').value)>0));
 for(const p of piezas){const o=document.createElement('option');o.value=p.id;o.textContent='Tee '+String(p.nodo||'pendiente').replace(/^nombre:/,'');selector.append(o);}selector.value=piezas.some(p=>p.id===previo)?previo:piezas.find(p=>p.tramos.includes(tramos[editandoTramo]?.id))?.id||piezas[0]?.id||'';
 const pieza=piezas.find(p=>p.id===selector.value),entradas=pieza&&Object.entries(red.orientacion).filter(([,o])=>o.hasta===pieza.nodo),salidas=pieza&&Object.entries(red.orientacion).filter(([,o])=>o.desde===pieza.nodo);$('conexionTeeRapidaGas').classList.toggle('oculto',!piezas.length);
 if(!pieza||entradas.length!==1||salidas.length!==2){$('estadoTeeRapidaGas').textContent='Tee registrada. Pendiente de una entrada y dos salidas inequívocas; no se inventaron orientaciones.';return;}
 $('estadoTeeRapidaGas').textContent='Orientación física por recorrido. Productos y equivalencias se verifican exclusivamente con las tablas del sistema seleccionado.';
 for(const [id,o]of salidas){const l=document.createElement('label'),sel=document.createElement('select'),nombre=red.puntos.find(n=>n.id===o.hasta)?.nombre||tramos.find(t=>t.id===id)?.hasta;l.textContent='Hacia '+nombre;sel.ariaLabel=l.textContent;for(const [v,t]of [['','Pendiente'],['directo','A través'],['giro','Giro 90°']]){const op=document.createElement('option');op.value=v;op.textContent=t;sel.append(op);}sel.value=proyectoGasActual().calculoSigas?.tees?.[pieza.id]?.viasPorTramo?.[id]||'';sel.onchange=()=>{const c=proyectoGasActual().calculoSigas||={version:1,vinculos:{}};c.tees||={};const anterior=c.tees[pieza.id]||{},vias={...anterior.viasPorTramo,[id]:sel.value};if(Object.values(vias).filter(v=>v==='directo').length>1){sel.value=anterior.viasPorTramo?.[id]||'';$('estadoTeeRapidaGas').textContent='Solo una salida puede pasar a través desde una misma entrada.';return;}c.tees[pieza.id]={...anterior,viasPorTramo:vias};guardarDatos();calcularMaterialesManualGas();};l.append(sel);out.append(l);}
}
function instalarOrganizacionEtapa2Gas(){
 renderizadoresOrganizacionGas={pendientes:window.renderAccesoriosPendientesCompactosSigasGas,vinculos:window.renderVinculosSigasGas,verificacion:window.renderVerificacionTabularSigasGas,fusiogas:window.renderConexionesFusiogasGas};
 const envolver=(nombre,fn)=>{const original=window[nombre];window[nombre]=function(...args){return fn.call(this,original,args)};};
 envolver('renderResumenPrincipalGas',function(original,args){if(recorridoGasUI)restaurarPanelesResultadoGuiadoGas();const r=original.apply(this,args);if(recorridoGasUI)organizarPanelesResultadoGuiadoGas();return r;});
 envolver('renderDatosMinimosPreliminarSigasGas',function(original,args){if(!recorridoGasUI)return original.apply(this,args);const d=document.createElement('div');enlaceCorreccionGuiadoGas(d,'Corregir PCS y condiciones del proyecto',1);enlaceCorreccionGuiadoGas(d,'Completar accesorios y conexiones',4);return d;});
 for(const [nombre,texto,paso]of [['renderAccesoriosPendientesCompactosSigasGas','Completar accesorios pendientes',4],['renderVinculosSigasGas','Corregir productos y variantes',4],['renderConexionesFusiogasGas','Corregir conexiones FUSIOGAS',4]])envolver(nombre,function(original,args){if(!recorridoGasUI)return original.apply(this,args);enlaceCorreccionGuiadoGas(args[0],texto,paso);});
 envolver('renderVerificacionTabularSigasGas',function(original,args){const r=original.apply(this,args);if(recorridoGasUI){const form=args[0].querySelector('[name="sigasPCS"]')?.closest('details');if(form){for(const nombre of ['sigasPCS','sigasDensidad','sigasFuenteGas'])form.querySelector('[name="'+nombre+'"]').closest('label').hidden=true;$('guiadoSuministro').querySelectorAll(':scope > :not(summary)').forEach(n=>n.remove());$('guiadoSuministro').append(form);enlaceCorreccionGuiadoGas(args[0],'Completar condiciones documentadas del suministro',1);}}return r;});
 envolver('guardarVerificacionSigasGas',function(original,args){if(recorridoGasUI){const perfil=perfilTecnicoActualGas();for(const [n,k]of [['sigasPCS','poderCalorifico'],['sigasDensidad','densidadRelativa'],['sigasFuenteGas','fuenteGas']])args[0].querySelector('[name="'+n+'"]').value=perfil[k]??'';}return original.apply(this,args);});
 envolver('renderPosicionesPendientesCuplasGas',function(original,args){if(!recorridoGasUI)return original.apply(this,args);const d=document.createElement('div');d.className='guiado-edicion-cortes';args[0].append(d);const r=original.call(this,d,args[1]);const resumen=d.querySelector(':scope > details > summary');if(resumen)resumen.textContent='Precisar cuplas y continuidad reales · opcional';return r;});
 envolver('desplazarResultadoMaterialesGas',function(original,args){if(recorridoGasUI?.paso===8&&(!args[0]||args[0]==='resumenPrincipalMaterialesGas'))args[0]='guiadoMaterialesInforme';return original.apply(this,args);});
 envolver('renderTramos',function(original,args){const r=original.apply(this,args);if(recorridoGasUI){for(const n of $('listaTramos').querySelectorAll('.tee-manual-salidas'))n.classList.add('guiado-acceso-redundante');for(const b of $('listaTramos').querySelectorAll('button'))if(b.textContent==='Revisar accesorios')b.classList.add('guiado-acceso-redundante');}if(recorridoGasUI?.paso===4&&!recorridoGasUI.revisandoRed){recorridoGasUI.revisandoRed=true;try{renderRevisionIntegralGas();}finally{recorridoGasUI.revisandoRed=false;}}return r;});
 envolver('abrirAccesorios',function(original,args){if(recorridoGasUI&&recorridoGasUI.paso!==4)editarPasoGuiadoGas(4);const r=original.apply(this,args);if(recorridoGasUI)$('guiadoEditorAnterior').open=true;return r;});
 envolver('renderGas',function(original,args){const r=original.apply(this,args);if(recorridoGasUI)renderArtefactosGuiadoGas();return r;});
 envolver('agregarArtefacto',function(original,args){if(!recorridoGasUI||!edicionArtefactoGuiadoGas)return original.apply(this,args);const valor=numeroDecimalGas($('gp').value);if(!(valor>0)){alert('Ingresá un consumo mayor a cero. Vacío sigue pendiente.');return;}const ref=edicionArtefactoGuiadoGas;
  if(ref.tipo==='artefacto'){const a=buscarArtefactoGuiadoGas(ref);if(!a)return;const anterior=a.nombre,red=redFisicaManualGas(),unico=artefactos.filter(x=>nombrePuntoManualGas(x.nombre)===nombrePuntoManualGas(anterior)).length===1,relacionados=destinosConsumosGuiadoGas().filter(t=>{const n=red.puntos.find(n=>n.id===red.orientacion[t.id]?.hasta);return (a.id!=null&&n?.artefactoId===a.id)||unico&&[t.artefacto,t.hasta].some(v=>nombrePuntoManualGas(v)===nombrePuntoManualGas(anterior));});a.nombre=$('ga').value;a.consumo=valor;for(const t of relacionados){t.artefacto=a.nombre;if(t.consumo!=null)t.consumo=valor;}}else if(!guardarConsumoFilaGuiadoGas(ref.id,String(valor),$('ga').value))return;
  edicionArtefactoGuiadoGas=null;delete estadoRecorridoProyectoGas().edicionArtefacto;$('gp').value='';renderGas();guardarDatos();
 });
 envolver('activarRecorridoGuiadoGas',function(original,args){const r=original.apply(this,args);edicionArtefactoGuiadoGas=estadoRecorridoProyectoGas().edicionArtefacto||null;renderArtefactosGuiadoGas();renderSuministroGuiadoGas();return r;});
 envolver('editarTramo',function(original,args){const r=original.apply(this,args);if(recorridoGasUI){sincronizarConsumoTramoGuiadoGas();organizarFormularioPrincipalGuiadoGas();recorridoGasUI.formularioInicial={id:tramos[editandoTramo]?.id,firma:firmaFormularioTramoGuiadoGas()};}return r;});
 envolver('cancelarEdicionTramo',function(original,args){const r=original.apply(this,args);if(recorridoGasUI)recorridoGasUI.formularioInicial=null;$('consumoTramo').readOnly=false;if($('guiadoNotaConsumoTramo'))$('guiadoNotaConsumoTramo').textContent='';if(recorridoGasUI)organizarFormularioPrincipalGuiadoGas();return r;});
 envolver('renderConfiguracionTeeRapidaGas',function(original,args){if(recorridoGasUI&&CatalogosSistemasGas.identificar(instalacionGas.perfil)!=='sigas')return renderOrientacionesOtrosSistemasGuiadoGas();return original.apply(this,args);});
 for(const nombre of ['confirmarVarianteSigasGas','confirmarConjuntoTeeGas','confirmarConexionTerminalSigasGas','guardarDatoTerminalSigasGas','guardarConfiguracionTeeSigasGas','guardarConexionFisicaFusiogasGas'])envolver(nombre,function(original,args){const r=original.apply(this,args);refrescarEdicionAccesoriosGuiadoGas();return r;});
 document.addEventListener('input',e=>{if(recorridoGasUI&&['desde','hasta','destinoArtefacto'].includes(e.target.id)){sincronizarConsumoTramoGuiadoGas();actualizarVisibilidadCasilleroGuiadoGas();}});
 document.addEventListener('change',e=>{if(recorridoGasUI&&['desde','hasta','destinoArtefacto'].includes(e.target.id)){sincronizarConsumoTramoGuiadoGas();actualizarVisibilidadCasilleroGuiadoGas();}});
}
