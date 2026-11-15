/* Navegación GAS. Reutiliza nodos, validadores, guardado y motores existentes. */
let recorridoGasUI=null;
const secuenciaRecorridoGas=[1,2,4,5,7,8];
const pasosRecorridoGas=[
 ['Proyecto y sistema','Dale un nombre y elegí el sistema de cañería.'],
 ['Combustible y datos de cálculo','Ingresá solamente datos documentados. Los que falten quedarán pendientes en el resultado.'],
 ['Croquis opcional','Cámara, galería o Continuar sin imagen. No se interpreta la fotografía.'],
 ['Tramos completos','Ingresá origen, destino, metros, consumo y accesorios. Vacío es pendiente; cero confirma que no hay. En modo completo podés detallar sus distancias.'],
 ['Revisar instalación y conexiones','Revisá los consumos y las conexiones pendientes. Podés conservar el proyecto como borrador; no implica una instalación verificada.'],
 ['Accesorios y conexiones','Revisá cantidades y vías de tees. Vacío significa pendiente; cero significa que no hay. No se exigen distancias.'],
 ['Resultados','Mismo motor y datos del proyecto. Los resultados pendientes conservan su condición.'],
 ['Resumen y PDF','Revisá el proyecto. Podés editar una sección sin repetir todo el recorrido.']
];
function ocultarEntradasGuiadoGas(){for(const id of ['inicio','entradaGas','especialidadProyectoGuiado','proyectosInicioGuiado'])$(id).classList.add('oculto');}
function mostrarNuevaEspecialidadGas(){if(recorridoGasUI)desmontarRecorridoGuiadoGas();if(modulo)guardarDatos();ocultarEntradasGuiadoGas();$('trabajo').classList.add('oculto');$('especialidadProyectoGuiado').classList.remove('oculto');window.scrollTo(0,0);}
function volverInicioGuiadoGas(){if(recorridoGasUI){guardarEstadoGuiadoGas();desmontarRecorridoGuiadoGas();}else if(modulo)guardarDatos();ocultarEntradasGuiadoGas();$('trabajo').classList.add('oculto');$('inicio').classList.remove('oculto');window.scrollTo(0,0);}
function elegirEspecialidadGuiadaGas(m){
 ocultarEntradasGuiadoGas();if(m!=='gas'){abrir(m);return;}
 abrir('gas');let nombre='Borrador GAS',n=1;while(true){try{nombreProyectoValidoGas(nombre);break;}catch(e){nombre='Borrador GAS '+(++n);}}
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
function abrirProyectoGuiadoGas(id){ocultarEntradasGuiadoGas();abrir('gas');seleccionarAmbitoGas(id);activarRecorridoGuiadoGas();}
function abrirRespaldoDesdeInicioGuiadoGas(){ocultarEntradasGuiadoGas();abrir('gas');$('respaldosConfiguracionGas').open=true;}
function moverControlGuiadoGas(n,destino){
 if(typeof n==='string')n=$(n);if(!n||!destino||n.parentNode===destino)return;
 if(!recorridoGasUI.nodos.some(x=>x.n===n)){const marca=document.createComment('posición original '+(n.id||n.tagName));n.before(marca);recorridoGasUI.nodos.push({n,marca,abierto:n.open});}
 destino.append(n);
}
function moverCampoGuiadoGas(id,destino){const n=$(id);if(!n)return;const l=document.querySelector('label[for="'+id+'"]');if(l)moverControlGuiadoGas(l,destino);moverControlGuiadoGas(n,destino);}
function estadoRecorridoProyectoGas(){return proyectoGasActual().recorridoGuiadoGas||{};}
function activarRecorridoGuiadoGas(){
 if(modulo!=='gas'||!document.querySelector)return;
 const e=proyectoGasActual().recorridoGuiadoGas||={version:1};recorridoGasUI={paso:Number.isInteger(e.paso)&&e.paso>=1&&e.paso<=8?e.paso:tramos.length?7:1,nodos:[],operacion:false,conexiones:false,esEdicion:!e.nombrePendiente&&tramos.length>0};
 recorridoGasUI.paso=({3:1,6:4})[recorridoGasUI.paso]||recorridoGasUI.paso;
 if(['rapido','completo'].includes(e.modo))presentacionGas=e.modo;if(['rapida','profesional'].includes(e.modoCarga))modoCargaGas=e.modoCarga;actualizarPresentacionGas();
 document.body.classList.add('gas-guiado');$('recorridoGuiadoGas').classList.remove('oculto');$('trabajo').classList.remove('oculto');ocultarEntradasGuiadoGas();
 moverCampoGuiadoGas('presentacionGas',$('guiadoModo'));
 moverControlGuiadoGas('editorProyectosGas',$('guiadoPaso1'));$('editorProyectosGas').classList.remove('oculto');$('nombreProyectoGas').value=e.nombrePendiente||e.nombreSinConfirmar?(e.nombreBorrador||''):nombreProyectoGas();
 moverCampoGuiadoGas('catalogoSistemaGas',$('guiadoPaso1'));moverCampoGuiadoGas('combustibleSistemaGas',$('guiadoPaso2'));
 for(const id of ['dimPCS','dimDensidad','dimFuenteGas']){moverCampoGuiadoGas(id,$('guiadoPropiedades'));$(id).value=perfilTecnicoActualGas()[({dimPCS:'poderCalorifico',dimDensidad:'densidadRelativa',dimFuenteGas:'fuenteGas'})[id]]??'';}
 moverCampoGuiadoGas('modoCargaGas',$('guiadoControlesAvanzados'));moverControlGuiadoGas('referenciaOpcionalGas',$('guiadoPaso1'));$('referenciaOpcionalGas').open=false;
 for(const id of ['herramientasGasOpcionales','ejerciciosGasSeparados','respaldosConfiguracionGas','dimensionGas','redGas','revisionCroquis','consumos'])moverControlGuiadoGas(id,$('guiadoControlesAvanzados'));
 moverControlGuiadoGas('cargarEjemploTeesGas',$('ejerciciosGasSeparados'));
 for(const id of ['consumoTramo']){const l=document.querySelector('label[for="'+id+'"]');l?.classList.add('guiado-consumo-tramo');$(id).classList.add('guiado-consumo-tramo');}
 const sel=$('guiadoEditarPaso');sel.replaceChildren();secuenciaRecorridoGas.forEach((paso,i)=>{const o=document.createElement('option');o.value=String(paso);o.textContent=(i+1)+' · '+pasosRecorridoGas[paso-1][0];sel.append(o);});
 aplicarPasoGuiadoGas();
}
function desmontarRecorridoGuiadoGas(){
 if(!recorridoGasUI)return;
 for(const {n,marca,abierto}of recorridoGasUI.nodos.slice().reverse()){if(marca.parentNode){marca.before(n);marca.remove();}if(typeof abierto==='boolean')n.open=abierto;}
 recorridoGasUI=null;$('modoCargaGas').disabled=false;document.body.classList.remove('gas-guiado');delete document.body.dataset.pasoGuiado;$('recorridoGuiadoGas').classList.add('oculto');$('editorProyectosGas').classList.add('oculto');
}
function salirRecorridoGuiadoGas(){guardarEstadoGuiadoGas();desmontarRecorridoGuiadoGas();mostrarVista('croquis');renderResumenPrincipalGas();}
function guardarEstadoGuiadoGas(){
 if(!recorridoGasUI||modulo!=='gas')return;
 const e=proyectoGasActual().recorridoGuiadoGas||={version:1};e.paso=recorridoGasUI.paso;e.modo=presentacionGas;e.modoCarga=modoCargaGas;
 if(recorridoGasUI.paso===5&&!$('guiadoPaso5').classList.contains('oculto')){e.consumosBorrador||={};for(const div of $('guiadoConsumos').querySelectorAll('[data-tramo]')){const i=div.querySelector('input'),sel=div.querySelector('select'),t=tramos.find(t=>t.id===div.dataset.tramo),registrado=t&&(t.consumo??redFisicaManualGas().porTramo[t.id]);if(!t)continue;if(t&&String(i.value).trim()!==''&&numeroDecimalGas(i.value)===registrado&&sel.value===tipoArtefactoGuiadoGas(t))delete e.consumosBorrador[t.id];else e.consumosBorrador[div.dataset.tramo]={consumo:i.value,artefacto:sel.value};}}
 if(e.nombrePendiente)e.nombreBorrador=$('nombreProyectoGas').value;guardarDatos();
}
function errorGuiadoGas(texto,campo){$('guiadoError').textContent=texto;campo?.focus();return false;}
function guardarTramoAntesDeSeguirGuiadoGas(){
 if(![$('desde').value,$('hasta').value,$('metros').value].some(v=>String(v).trim()))return true;
 if(!$('desde').value.trim()||!$('hasta').value.trim()||!(numeroDecimalGas($('metros').value)>0))return errorGuiadoGas('Completá Desde, Hasta y metros mayores a cero para guardar el tramo.',$('desde'));
 recorridoGasUI.guardandoNavegacion=true;try{agregarTramo();}finally{recorridoGasUI.guardandoNavegacion=false;}if($('desde').value||$('hasta').value||$('metros').value)return errorGuiadoGas($('mensajeCargaManualGas').textContent||'Revisá los datos del tramo antes de continuar.');return true;
}
function validarProyectoGuiadoGas(){const nombre=$('nombreProyectoGas').value.trim();if(!nombre)return errorGuiadoGas('Ingresá el nombre del proyecto.',$('nombreProyectoGas'));if(!CatalogosSistemasGas.identificar(instalacionGas.perfil))return errorGuiadoGas('Elegí el sistema de cañería.',$('catalogoSistemaGas'));if(nombre!==nombreProyectoGas()&&!renombrarProyectoGas(nombre))return errorGuiadoGas($('mensajeProyectosGas').textContent,$('nombreProyectoGas'));proyectoGasActual().recorridoGuiadoGas.nombrePendiente=false;proyectoGasActual().recorridoGuiadoGas.nombreSinConfirmar=false;return true;}
function continuarGuiadoGas(){
 if(!recorridoGasUI)return;const paso=recorridoGasUI.paso;$('guiadoError').textContent='';
 if(paso===1&&!validarProyectoGuiadoGas())return;
 if(paso===2&&!perfilTecnicoActualGas().gas)return errorGuiadoGas('Elegí el combustible.',$('combustibleSistemaGas'));
 if(paso===4){if(editandoAccesorios>=0&&!guardarAccesorios())return errorGuiadoGas('Revisá el detalle avanzado del tramo antes de continuar.');if(!guardarTramoAntesDeSeguirGuiadoGas())return;if(!tramos.length)return errorGuiadoGas('Cargá al menos un tramo con sus extremos y longitud.',$('desde'));}

 if(paso===6){if(editandoAccesorios>=0){if(!guardarAccesorios())return errorGuiadoGas('Guardá o revisá el detalle profesional antes de continuar.');}else if(!guardarTramoAntesDeSeguirGuiadoGas())return;}
 if(paso===7&&!guardarTramoAntesDeSeguirGuiadoGas())return;
 if(paso===8){proyectoGasActual().recorridoGuiadoGas.completado=true;guardarEstadoGuiadoGas();$('guiadoEstado').textContent='Proyecto guardado. Podés generar el PDF o editar una sección.';return;}
 recorridoGasUI.paso=secuenciaRecorridoGas[secuenciaRecorridoGas.indexOf(paso)+1];if(recorridoGasUI.paso===8)proyectoGasActual().recorridoGuiadoGas.completado=true;guardarEstadoGuiadoGas();aplicarPasoGuiadoGas(true);
}
function retrocederGuiadoGas(){if(!recorridoGasUI)return;if(recorridoGasUI.paso>1){guardarEstadoGuiadoGas();recorridoGasUI.paso=secuenciaRecorridoGas[secuenciaRecorridoGas.indexOf(recorridoGasUI.paso)-1];guardarEstadoGuiadoGas();aplicarPasoGuiadoGas(true);}else volverInicioGuiadoGas();}
function editarPasoGuiadoGas(paso){paso=({3:1,6:4})[paso]||paso;if(!recorridoGasUI||!Number.isInteger(paso)||paso<1||paso>8)return;const actual=recorridoGasUI.paso;let valido=true;if(paso>actual){if(actual===1)valido=validarProyectoGuiadoGas();if([4,6,7].includes(actual))valido=guardarTramoAntesDeSeguirGuiadoGas();}if(!valido){$('guiadoEditarPaso').value=String(actual);return;}guardarEstadoGuiadoGas();recorridoGasUI.paso=paso;guardarEstadoGuiadoGas();aplicarPasoGuiadoGas(true);}
function aplicarPasoGuiadoGas(desplazar=false){
 const ui=recorridoGasUI;if(!ui)return;const p=ui.paso;document.body.dataset.pasoGuiado=String(p);$('modoCargaGas').disabled=presentacionGas==='rapido';if(presentacionGas==='rapido')$('modoCargaGas').value='rapida';
 for(let i=1;i<=8;i++)$('guiadoPaso'+i).classList.toggle('oculto',i!==p);
 $('guiadoTitulo').textContent=pasosRecorridoGas[p-1][0];$('guiadoAyuda').textContent=pasosRecorridoGas[p-1][1];$('guiadoProgresoTexto').textContent='Paso '+(secuenciaRecorridoGas.indexOf(p)+1)+' de 6';$('guiadoProgreso').max=6;$('guiadoProgreso').value=secuenciaRecorridoGas.indexOf(p)+1;$('guiadoProyectoActual').textContent=nombreProyectoGas();$('guiadoEditarPaso').value=String(p);$('guiadoEditarLabel').classList.toggle('oculto',!(ui.esEdicion||estadoRecorridoProyectoGas().completado));$('guiadoContinuar').textContent=p===8?'Guardar proyecto':p===4?'Terminé de cargar los tramos':'Continuar';$('guiadoError').textContent='';$('guiadoEstado').textContent='';
 moverControlGuiadoGas('referenciaOpcionalGas',$('guiadoPaso'+(p===4?4:1)));
 $('guiadoReferenciaEnsayo').classList.toggle('oculto',perfilTecnicoActualGas().gas!=='GN');
 const destino=$('guiadoPaso'+(p===6?6:4));for(const id of ['editarTramosGas','tramosRegistradosGas','editorAccesorios'])moverControlGuiadoGas(id,destino);
 $('editarTramosGas').open=true;if(p===4){$('agregarAccesoriosGas').open=true;renderDistanciasIntegralGas();}$('tramosRegistradosGas').open=p!==6;$('guardarTramo').textContent=p===6?'Guardar accesorios':'Guardar tramo';
 for(const b of $('listaTramos').querySelectorAll('button'))if(b.textContent==='Revisar accesorios')b.dataset.guiadoAccion='accesorios';
 if(p===1)$('editorProyectosGas').classList.remove('oculto');
 if(p===4&&presentacionGas==='completo'){$('guiadoPaso4').append($('guiadoConexiones'));renderConexionesGuiadoGas();}
 if(p===5){renderRevisionIntegralGas();$('guiadoPaso5').append($('guiadoConexiones'));calcularMaterialesManualGas();renderConexionesGuiadoGas();}
 if(p===6){$('guiadoPaso6').append($('guiadoConexiones'));const sel=$('guiadoTramoAccesorios'),anterior=sel.value;sel.replaceChildren();for(const t of tramos){const o=document.createElement('option');o.value=t.id;o.textContent=t.desde+'–'+t.hasta;sel.append(o);}const elegido=tramos[editandoAccesorios>=0?editandoAccesorios:editandoTramo]?.id||anterior;sel.value=tramos.some(t=>t.id===elegido)?elegido:tramos[0]?.id||'';if(editandoTramo<0&&editandoAccesorios<0&&sel.value)seleccionarAccesoriosGuiadoGas(sel.value);calcularMaterialesManualGas();renderConexionesGuiadoGas();}
 if(p===7||p===8){calcularMaterialesManualGas();moverControlGuiadoGas('resumenPrincipalMaterialesGas',$('guiadoPaso'+p));}
 if(p===8){const r=redFisicaManualGas();$('guiadoResumenFinal').textContent=nombreProyectoGas()+' · '+tramos.length+' tramos · '+tramos.reduce((s,t)=>s+t.metros,0).toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2})+' m · '+(Number.isFinite(r.total)?fmt(r.total)+' kcal/h':'consumo pendiente')+'. Los estados técnicos y las estimaciones conservan su alcance en el PDF.';}
 if(desplazar){window.scrollTo({top:0,behavior:'instant'});$('guiadoTitulo').focus({preventScroll:true});}
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
 if(!recorridoGasUI||recorridoGasUI.conexiones||![4,5].includes(recorridoGasUI.paso))return;recorridoGasUI.conexiones=true;
 try{const out=$('guiadoConexiones'),abiertos=Array.from(out.querySelectorAll('details[open]')).map(d=>d.querySelector('summary')?.textContent),y=window.scrollY,enConexion=out.contains(document.activeElement);out.replaceChildren();const reg=registroAccesoriosSigasGas(),modelo=resultadoPreliminarSigasGas();if(!reg)return;const titulo=document.createElement('h3');titulo.textContent='Conexiones SIGAS · decisiones pendientes';out.append(titulo);for(const n of reg.entradaTecnica.inventario.necesidadesTerminales){if(n.id!=='terminal-medidor'&&!n.tramos.some(id=>{const t=tramos.find(t=>t.id===id);return t&&(t.artefacto||tipoArtefactoGuiadoGas(t));}))continue;if(recorridoGasUI.paso===4&&!n.tramos.includes(recorridoGasUI.tramoConexiones))continue;if(!reg.entradaTecnica.config.terminales?.[n.id]?.rosca){const l=document.createElement('label'),sel=document.createElement('select');l.textContent=n.nombre+' · rosca';sel.ariaLabel=l.textContent;const valores=['',...new Set(SIGAS_ED15_2025.tablas[3].filas.map(f=>DimensionamientoSigas.atributosTerminal(f)?.rosca).filter(Boolean))];for(const v of valores){const o=document.createElement('option');o.value=v;o.textContent=v?v+'″':'Pendiente';sel.append(o);}sel.onchange=()=>guardarDatoTerminalSigasGas(n.id,'rosca',sel.value);l.append(sel);out.append(l);}else renderConfirmacionConexionTerminalSigasGas(out,n.id,modelo);}if(!out.querySelector('label,details'))out.replaceChildren();for(const d of out.querySelectorAll('details'))if(abiertos.includes(d.querySelector('summary')?.textContent))d.open=true;if(enConexion)window.scrollTo({top:y,behavior:'instant'});}
 finally{recorridoGasUI.conexiones=false;}
}
function instalarRecorridoGuiadoGas(){
 if(!document.querySelector)return;
 const abrirOriginal=window.abrir;window.abrir=function(m){const activo=!!recorridoGasUI;if(activo){if(modulo==='gas')guardarEstadoGuiadoGas();desmontarRecorridoGuiadoGas();}const r=abrirOriginal.call(this,m);if(activo&&m==='gas')activarRecorridoGuiadoGas();return r;};
 const envolver=(nombre,despues)=>{const original=window[nombre];if(typeof original!=='function')return;window[nombre]=function(...args){const r=original.apply(this,args);if(recorridoGasUI)despues?.(args,r);return r;};};
 envolver('seleccionarCombustibleGas',()=>{$('guiadoReferenciaEnsayo').classList.toggle('oculto',perfilTecnicoActualGas().gas!=='GN');});
 envolver('elegirPresentacionGas',()=>{guardarEstadoGuiadoGas();aplicarPasoGuiadoGas();});
 envolver('editarTramo',()=>{if(!recorridoGasUI.operacion&&![4,6].includes(recorridoGasUI.paso))editarPasoGuiadoGas(4);});
 const calcularOriginal=window.calcularMaterialesManualGas;window.calcularMaterialesManualGas=function(...args){const anterior=conservandoVistaOrientacionTeeGas;if([4,5,6].includes(recorridoGasUI?.paso))conservandoVistaOrientacionTeeGas=true;try{return calcularOriginal.apply(this,args);}finally{conservandoVistaOrientacionTeeGas=anterior;if([4,5,6].includes(recorridoGasUI?.paso)&&!recorridoGasUI.operacion)renderConexionesGuiadoGas();}};
 envolver('renderTramos',()=>{for(const b of $('listaTramos').querySelectorAll('button'))if(b.textContent==='Revisar accesorios')b.dataset.guiadoAccion='accesorios';});
 envolver('agregarTramo',()=>{if(recorridoGasUI.paso===4&&/cantidades|enteros/i.test($('mensajeCargaManualGas').textContent)){$('agregarAccesoriosGas').dataset.correccionGuiada='true';$('agregarAccesoriosGas').open=true;}if(!$('desde').value){$('guiadoError').textContent='';if(recorridoGasUI.paso===4&&!recorridoGasUI.operacion){$('guiadoEstado').textContent='Tramo guardado. Podés cargar otro o terminar la carga.';$('guiadoOtroTramo').classList.remove('oculto');$('agregarAccesoriosGas').open=true;}delete $('agregarAccesoriosGas').dataset.correccionGuiada;if(recorridoGasUI.paso===6&&!recorridoGasUI.operacion&&!recorridoGasUI.guardandoNavegacion){const i=tramos.findIndex(t=>t.id===$('guiadoTramoAccesorios').value);if(i>=0){recorridoGasUI.operacion=true;try{editarTramo(i);$('agregarAccesoriosGas').open=true;}finally{recorridoGasUI.operacion=false;}}}}$('guardarTramo').textContent=recorridoGasUI.paso===6?'Guardar accesorios':'Guardar tramo';guardarEstadoGuiadoGas();});
 envolver('mostrarVista',([v])=>{if(v==='dimensionGas'&&(!(Number(perfilTecnicoActualGas().poderCalorifico)>0)||!String(perfilTecnicoActualGas().fuenteGas||'').trim())){editarPasoGuiadoGas(2);$('guiadoPropiedades').open=true;$('dimensionGas').classList.add('oculto');$('guiadoAvanzadas').open=false;return;}if(['dimensionGas','redGas','revisionCroquis','consumos'].includes(v))$('guiadoAvanzadas').open=true;});
 const abrirSeccion=destino=>{const paso=({foto:1,tramos:4,cargar:4,revisar:4,conciliacion:5,materiales:7,pdf:8})[destino];if(!paso)return;if(paso<=recorridoGasUI.paso||recorridoGasUI.esEdicion||estadoRecorridoProyectoGas().completado)editarPasoGuiadoGas(paso);else errorGuiadoGas('Usá Continuar para llegar a '+pasosRecorridoGas[paso-1][0]+'.');};
 envolver('irSeccionGas',([destino])=>abrirSeccion(destino));envolver('irPasoProyectoGas',([destino])=>abrirSeccion(destino));envolver('mostrarEditorProyectoGas',([accion])=>{if(accion==='renombrar')editarPasoGuiadoGas(1);});
 envolver('seleccionarAmbitoGas',()=>{$('nombreProyectoGas').value=nombreProyectoGas();guardarEstadoGuiadoGas();});
 document.addEventListener('input',e=>{if(!recorridoGasUI||!$('recorridoGuiadoGas').contains(e.target))return;if(e.target.id==='nombreProyectoGas'){proyectoGasActual().recorridoGuiadoGas.nombreBorrador=e.target.value;proyectoGasActual().recorridoGuiadoGas.nombreSinConfirmar=true;}guardarEstadoGuiadoGas();});
 window.addEventListener('pagehide',()=>guardarEstadoGuiadoGas());
}
if(typeof window!=='undefined'&&document.addEventListener)window.addEventListener('load',()=>{instalarRecorridoGuiadoGas();instalarCargaIntegralGas();});

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
 if(!recorridoGasUI)return;let out=$('guiadoDistancias');if(!out){out=document.createElement('details');out.id='guiadoDistancias';const s=document.createElement('summary');s.textContent='Distancias y orden de accesorios (opcional)';s.onclick=e=>e.preventDefault();out.append(s,document.createElement('div'));$('agregarAccesoriosGas').after(out);}
 out.open=true;out.classList.toggle('oculto',presentacionGas!=='completo');if(presentacionGas!=='completo')return;
 const d=borradorDistribucionIntegralGas(),nombres={codo90:'Codo de 90°',codo45:'Codo de 45°',tee:'Tee',reduccion:'Reducción',llave:'Llave de paso',cupla:'Cupla'},conteos=tiposRapidosGas.map(([tipo])=>[tipo,$('manualGas_'+tipo)?.value]);
 const actual=tramos[editandoTramo];if(actual&&String($('manualGas_tee').value).trim()===''&&!d.filas.some(a=>a.tipo==='tee')){try{const a=entradaManualMaterialesGas(false,true).extras.find(a=>a.tipo==='tee'&&a.deducido&&a.tramo===actual.id&&!a.conflicto);if(a&&nombrePuntoManualGas(actual.hasta)===nombrePuntoManualGas(redFisicaManualGas().puntos.find(n=>n.id===a.nodo)?.nombre||String(a.nodo).replace(/^nombre:/,'')))d.filas.push({tipo:'tee',deducido:true,nodo:actual.hasta,nodoOrigen:'deducido',posicionDeducida:'final',metrosAntes:'',salida:''});}catch(e){/* No se deduce una pieza si no se puede resolver la red. */}}
 // Conservar orden y medidas de piezas existentes; nuevas piezas siguen pendientes.
 for(const[tipo,valor]of conteos){if(!/^\d+$/.test(String(valor)))continue;const n=Number(valor);if(n>200)continue;let existentes=d.filas.filter(a=>a.tipo===tipo).length;while(existentes<n){d.filas.push({tipo,metrosAntes:'',salida:''});existentes++;}while(existentes>n){d.filas.splice(d.filas.findLastIndex(a=>a.tipo===tipo),1);existentes--;}}
 d.cantidadesPendientes=conteos.some(([tipo,v])=>String(v??'').trim()===''&&!(tipo==='tee'&&d.filas.some(a=>a.tipo==='tee'&&a.deducido)));
 const cuerpo=out.lastElementChild;cuerpo.replaceChildren();const nota=document.createElement('p');nota.textContent='Metros sucesivos desde el inicio hasta cada accesorio y desde el último hasta el final. Vacío: pendiente. No se deducen medidas de una fotografía.';cuerpo.append(nota);const labelBase=document.createElement('label'),base=document.createElement('select');labelBase.textContent='Qué representan las medidas';base.ariaLabel=labelBase.textContent;for(const[v,t]of [['geometrica','Distancias de referencia; ajustes de inserción pendientes'],['neta','Longitudes netas de caño ya determinadas para cortar']]){const o=document.createElement('option');o.value=v;o.textContent=t;base.append(o);}base.value=d.base||'geometrica';base.onchange=()=>{d.base=base.value;guardarEstadoGuiadoGas();};labelBase.append(base);cuerpo.append(labelBase);
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
function estadoDistanciasIntegralGas(){const el=$('guiadoEstadoDistancias');if(!el)return;const r=evaluarDistribucionIntegralGas(borradorDistribucionIntegralGas(),numeroDecimalGas($('metros').value));el.textContent=r.error||r.mensaje;el.style.color=r.error?'#9b281f':'';const d=borradorDistribucionIntegralGas();$('guiadoDistanciaFinal').parentNode.firstChild.textContent=d.finalOrigen==='deducido'?'Distancia restante hasta el destino (calculada, m)':'Distancia final registrada; restante aún pendiente (m)';$('guiadoDistanciaFinal').value=Number.isFinite(d.final)?String(Number(d.final.toFixed(8))):d.final??'';for(const i of $('guiadoDistancias').querySelectorAll('[data-nodo-tee-indice]')){const a=d.filas[Number(i.dataset.nodoTeeIndice)],deducida=a.nodoOrigen==='deducido';const posiciones=d.filas.slice(0,Number(i.dataset.nodoTeeIndice)+1).map(a=>String(a.metrosAntes??'').trim()===''?NaN:numeroDecimalGas(a.metrosAntes)),conocida=posiciones.every(Number.isFinite)&&Math.abs(posiciones.reduce((s,n)=>s+n,0)-numeroDecimalGas($('metros').value))<1e-8&&nombrePuntoManualGas(a.nodo)===nombrePuntoManualGas($('hasta').value);i.value=a.nodo||'';i.readOnly=deducida||conocida;i.hidden=deducida||conocida;i.parentNode.firstChild.textContent=deducida||conocida?'Tee en '+a.nodo+(deducida?' · nodo deducido al final del tramo':' · nodo registrado'):'Ubicación de la tee (solo si no se puede deducir)';}for(const i of $('guiadoDistancias').querySelectorAll('[data-distancia-indice]')){const a=d.filas[Number(i.dataset.distanciaIndice)];if(a.posicionDeducida==='final'){i.value=Number.isFinite(a.metrosAntes)?String(Number(a.metrosAntes.toFixed(8))):a.metrosAntes??'';i.readOnly=true;}}}
function renderRevisionIntegralGas(){
 const out=$('guiadoConsumos');out.replaceChildren();const red=redFisicaManualGas();
 tramos.forEach((t,i)=>{const div=document.createElement('div');div.className='detalle';const p=document.createElement('p');p.textContent=t.desde+'–'+t.hasta+' · '+fmt(t.metros)+' m · '+(Number.isFinite(red.porTramo[t.id])?fmt(red.porTramo[t.id])+' kcal/h acumulados':'consumo pendiente')+' · '+resumenConteoRapidoGas(t);try{const deducidas=entradaManualMaterialesGas(false,true).extras.filter(a=>a.tipo==='tee'&&a.deducido&&a.tramo===t.id);if(deducidas.length)p.textContent=p.textContent.replace('Tees: Pendiente','Tees: '+deducidas.length+' deducida(s) por conexiones');}catch(e){}div.append(p);
 if(presentacionGas==='completo'){const d=t.detalle,nota=document.createElement('p');nota.textContent=d?.accesorios?.length?'Distancias: '+d.accesorios.map(a=>(Number.isFinite(a.metrosAntes)?fmt(a.metrosAntes):'pendiente')+' m → '+(Object.fromEntries(tiposRapidosGas)[a.tipo]||a.tipo)).join(' / ')+' / final '+(Number.isFinite(d.metrosFinal)?fmt(d.metrosFinal):'pendiente')+' m.':'Distancias sin detallar; compra estimada.';div.append(nota);}
 const b=document.createElement('button');b.className='alt';b.textContent='Editar '+t.desde+'–'+t.hasta;b.onclick=()=>editarTramo(i);div.append(b);out.append(div);});
 const tees=document.createElement('div');tees.id='guiadoTeesRevision';out.append(tees);
 let e;try{e=entradaPreseleccionSigasGas();}catch(error){return;}if(CatalogosSistemasGas.identificar(instalacionGas.perfil)!=='sigas')return;
 for(const aviso of [...new Set(e?.inventario.pendientes||[])].filter(s=>/cero confirmado|cambiaron sus conexiones|tee manual sin ubicación|más de tres conexiones|tee registrada no está vinculada/.test(s))){const p=document.createElement('p');p.className='aviso';p.textContent=aviso;tees.append(p);}
 for(const pieza of e?.inventario.fisicas.filter(p=>p.tipo==='tee')||[]){const titulo=document.createElement('h3');titulo.textContent='Tee '+String(pieza.nodo||'ubicación pendiente').replace(/^nombre:/,'').toUpperCase();tees.append(titulo);const contexto=contextoOrientacionTeeGas(pieza,e);if(!contexto){const aviso=document.createElement('p');aviso.textContent='Pendiente: identificar una entrada y dos salidas reales. Revisá los extremos de los tramos y el nodo de la tee.';tees.append(aviso);continue;}const box=document.createElement('div');contexto.nombres=contexto.salidas.map(id=>'Hacia '+(red.puntos.find(n=>n.id===red.orientacion[id]?.hasta)?.nombre||tramos.find(t=>t.id===id)?.hasta));renderOrientacionTeeProvisionalGas(box,contexto);for(const radio of box.querySelectorAll('input[type=radio]'))radio.name+='-'+pieza.id;tees.append(box);}
}
function instalarCargaIntegralGas(){
 const editar=window.editarTramo;window.editarTramo=function(...args){const r=editar.apply(this,args);if(recorridoGasUI){recorridoGasUI.tramoConexiones=tramos[args[0]]?.id;const previo=estadoRecorridoProyectoGas().consumosBorrador?.[recorridoGasUI.tramoConexiones];if(previo){$('consumoTramo').value=previo.consumo??'';if(previo.artefacto)$('destinoArtefacto').value=previo.artefacto;}renderDistanciasIntegralGas();renderConexionesGuiadoGas();}return r;};
 const guardar=window.agregarTramo;window.agregarTramo=function(...args){
  if(!recorridoGasUI||recorridoGasUI.operacion||presentacionGas!=='completo')return guardar.apply(this,args);
  renderDistanciasIntegralGas();const clave=claveDistribucionIntegralGas(),d=JSON.parse(JSON.stringify(borradorDistribucionIntegralGas())),r=evaluarDistribucionIntegralGas(d,numeroDecimalGas($('metros').value));
  if(r.error){$('guiadoDistancias').open=true;return errorGuiadoGas(r.error);}
  const id=tramos[editandoTramo]?.id,cantidad=tramos.length;const result=guardar.apply(this,args);if($('desde').value||(!id&&tramos.length===cantidad))return result;
  const t=id?tramos.find(t=>t.id===id):tramos.at(-1);if(!t)return result;
  const leer=v=>String(v??'').trim()===''?'':numeroDecimalGas(v);
  t.detalle={...t.detalle,baseDistancias:d.base||'geometrica',finalOrigen:d.finalOrigen,finalAnterior:d.finalAnterior,estado:r.completa?(d.filas.length?'completo':'ninguno'):'pendiente',accesorios:d.filas.filter(a=>a.tipo!=='tee'||String(a.nodo||'').trim()).map(a=>({...a,metrosAntes:leer(a.metrosAntes)})),distribucionPendiente:d.filas.some(a=>a.tipo==='tee'&&!String(a.nodo||'').trim())?d.filas:undefined,metrosFinal:leer(d.final)};
  delete estadoRecorridoProyectoGas().distanciasBorrador[clave];if(estadoRecorridoProyectoGas().consumosBorrador)delete estadoRecorridoProyectoGas().consumosBorrador[t.id];recorridoGasUI.tramoConexiones=t.id;if(r.completa&&datosPlanGas().opciones.reutilizar==null){datosPlanGas().opciones.reutilizar=true;$('matReusar').checked=true;}guardarDatos();renderTramos();renderDistanciasIntegralGas();$('guiadoPaso4').append($('guiadoConexiones'));renderConexionesGuiadoGas();if(!r.completa)$('guiadoEstado').textContent+=' Distancias pendientes; proyecto conservado como borrador.';return result;
 };
 const render=window.renderConfiguracionTeeRapidaGas;window.renderConfiguracionTeeRapidaGas=function(...args){const r=render.apply(this,args);if(!recorridoGasUI)return r;const box=$('viasTeeRapidaGas');if(!box)return r;const etiquetas=[...box.querySelectorAll('label')];if(etiquetas.some(l=>/Salida [12]/.test(l.textContent))){box.replaceChildren();$('estadoTeeRapidaGas').textContent='Tee registrada. Al terminar los tramos se mostrarán sus salidas reales para indicar la circulación.';}return r;};
 const vias=window.guardarConfiguracionTeeSigasGas;window.guardarConfiguracionTeeSigasGas=function(id,c){if(recorridoGasUI&&Object.values(c.viasPorTramo||{}).filter(v=>v==='directo').length>1)return errorGuiadoGas('Una tee no puede tener dos salidas a través desde una misma entrada.');const r=vias.apply(this,arguments);if(recorridoGasUI?.paso===5)renderRevisionIntegralGas();return r;};
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
