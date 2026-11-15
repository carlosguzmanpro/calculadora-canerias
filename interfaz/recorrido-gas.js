/* Navegación GAS. Reutiliza nodos, validadores, guardado y motores existentes. */
let recorridoGasUI=null;
const pasosRecorridoGas=[
 ['Proyecto y sistema','Dale un nombre y elegí el sistema de cañería.'],
 ['Combustible y datos de cálculo','Ingresá solamente datos documentados. Los que falten quedarán pendientes en el resultado.'],
 ['Croquis opcional','Cámara, galería o Continuar sin imagen. No se interpreta la fotografía.'],
 ['Tramos y destinos','Guardá cada tramo. Después vincularemos los consumos a sus destinos, sin duplicar artefactos.'],
 ['Artefactos y consumos','Completá el consumo de cada destino terminal. No ingreses consumos acumulados: los calcula el motor.'],
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
 if(['rapido','completo'].includes(e.modo))presentacionGas=e.modo;if(['rapida','profesional'].includes(e.modoCarga))modoCargaGas=e.modoCarga;actualizarPresentacionGas();
 document.body.classList.add('gas-guiado');$('recorridoGuiadoGas').classList.remove('oculto');$('trabajo').classList.remove('oculto');ocultarEntradasGuiadoGas();
 moverCampoGuiadoGas('presentacionGas',$('guiadoModo'));
 moverControlGuiadoGas('editorProyectosGas',$('guiadoPaso1'));$('editorProyectosGas').classList.remove('oculto');$('nombreProyectoGas').value=e.nombrePendiente||e.nombreSinConfirmar?(e.nombreBorrador||''):nombreProyectoGas();
 moverCampoGuiadoGas('catalogoSistemaGas',$('guiadoPaso1'));moverCampoGuiadoGas('combustibleSistemaGas',$('guiadoPaso2'));
 for(const id of ['dimPCS','dimDensidad','dimFuenteGas']){moverCampoGuiadoGas(id,$('guiadoPaso2'));$(id).value=perfilTecnicoActualGas()[({dimPCS:'poderCalorifico',dimDensidad:'densidadRelativa',dimFuenteGas:'fuenteGas'})[id]]??'';}
 moverCampoGuiadoGas('modoCargaGas',$('guiadoPaso6'));moverControlGuiadoGas('referenciaOpcionalGas',$('guiadoPaso3'));$('referenciaOpcionalGas').open=true;
 for(const id of ['herramientasGasOpcionales','ejerciciosGasSeparados','respaldosConfiguracionGas','dimensionGas','redGas','revisionCroquis','consumos'])moverControlGuiadoGas(id,$('guiadoControlesAvanzados'));
 moverControlGuiadoGas('cargarEjemploTeesGas',$('ejerciciosGasSeparados'));
 for(const id of ['consumoTramo']){const l=document.querySelector('label[for="'+id+'"]');l?.classList.add('guiado-consumo-tramo');$(id).classList.add('guiado-consumo-tramo');}
 const sel=$('guiadoEditarPaso');sel.replaceChildren();pasosRecorridoGas.forEach(([nombre],i)=>{const o=document.createElement('option');o.value=String(i+1);o.textContent=(i+1)+' · '+nombre;sel.append(o);});
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
 if(paso===4){if(!guardarTramoAntesDeSeguirGuiadoGas())return;if(!tramos.length)return errorGuiadoGas('Cargá al menos un tramo con sus extremos y longitud.',$('desde'));}
 if(paso===5){if(!guardarTodosConsumosGuiadoGas())return;}
 if(paso===6){if(editandoAccesorios>=0){if(!guardarAccesorios())return errorGuiadoGas('Guardá o revisá el detalle profesional antes de continuar.');}else if(!guardarTramoAntesDeSeguirGuiadoGas())return;}
 if(paso===7&&!guardarTramoAntesDeSeguirGuiadoGas())return;
 if(paso===8){proyectoGasActual().recorridoGuiadoGas.completado=true;guardarEstadoGuiadoGas();$('guiadoError').textContent='Proyecto guardado. Podés generar el PDF o editar una sección.';return;}
 recorridoGasUI.paso++;if(recorridoGasUI.paso===8)proyectoGasActual().recorridoGuiadoGas.completado=true;guardarEstadoGuiadoGas();aplicarPasoGuiadoGas(true);
}
function retrocederGuiadoGas(){if(!recorridoGasUI)return;if(recorridoGasUI.paso>1){guardarEstadoGuiadoGas();recorridoGasUI.paso--;guardarEstadoGuiadoGas();aplicarPasoGuiadoGas(true);}else volverInicioGuiadoGas();}
function editarPasoGuiadoGas(paso){if(!recorridoGasUI||!Number.isInteger(paso)||paso<1||paso>8)return;const actual=recorridoGasUI.paso;let valido=true;if(paso>actual){if(actual===1)valido=validarProyectoGuiadoGas();if(actual===5)valido=guardarTodosConsumosGuiadoGas();if([4,6,7].includes(actual))valido=guardarTramoAntesDeSeguirGuiadoGas();}if(!valido){$('guiadoEditarPaso').value=String(actual);return;}guardarEstadoGuiadoGas();recorridoGasUI.paso=paso;guardarEstadoGuiadoGas();aplicarPasoGuiadoGas(true);}
function aplicarPasoGuiadoGas(desplazar=false){
 const ui=recorridoGasUI;if(!ui)return;const p=ui.paso;document.body.dataset.pasoGuiado=String(p);$('modoCargaGas').disabled=presentacionGas==='rapido';if(presentacionGas==='rapido')$('modoCargaGas').value='rapida';
 for(let i=1;i<=8;i++)$('guiadoPaso'+i).classList.toggle('oculto',i!==p);
 $('guiadoTitulo').textContent=pasosRecorridoGas[p-1][0];$('guiadoAyuda').textContent=pasosRecorridoGas[p-1][1];$('guiadoProgresoTexto').textContent='Paso '+p+' de 8';$('guiadoProgreso').value=p;$('guiadoProyectoActual').textContent=nombreProyectoGas();$('guiadoEditarPaso').value=String(p);$('guiadoEditarLabel').classList.toggle('oculto',!(ui.esEdicion||estadoRecorridoProyectoGas().completado));$('guiadoContinuar').textContent=p===8?'Guardar proyecto':'Continuar';$('guiadoError').textContent='';
 const destino=$('guiadoPaso'+(p===6?6:4));for(const id of ['editarTramosGas','tramosRegistradosGas','editorAccesorios'])moverControlGuiadoGas(id,destino);
 $('editarTramosGas').open=true;$('tramosRegistradosGas').open=p!==6;$('guardarTramo').textContent=p===6?'Guardar accesorios':'Guardar tramo';
 for(const b of $('listaTramos').querySelectorAll('button'))if(b.textContent==='Revisar accesorios')b.dataset.guiadoAccion='accesorios';
 if(p===1)$('editorProyectosGas').classList.remove('oculto');
 if(p===5)renderConsumosGuiadoGas();
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
 if(!recorridoGasUI||recorridoGasUI.conexiones||recorridoGasUI.paso!==6)return;recorridoGasUI.conexiones=true;
 try{const out=$('guiadoConexiones'),abiertos=Array.from(out.querySelectorAll('details[open]')).map(d=>d.querySelector('summary')?.textContent),y=window.scrollY,enConexion=out.contains(document.activeElement);out.replaceChildren();const reg=registroAccesoriosSigasGas(),modelo=resultadoPreliminarSigasGas();if(!reg)return;const titulo=document.createElement('h3');titulo.textContent='Conexiones SIGAS · decisiones pendientes';out.append(titulo);for(const n of reg.entradaTecnica.inventario.necesidadesTerminales){if(!reg.entradaTecnica.config.terminales?.[n.id]?.rosca){const l=document.createElement('label'),sel=document.createElement('select');l.textContent=n.nombre+' · rosca';sel.ariaLabel=l.textContent;const valores=['',...new Set(SIGAS_ED15_2025.tablas[3].filas.map(f=>DimensionamientoSigas.atributosTerminal(f)?.rosca).filter(Boolean))];for(const v of valores){const o=document.createElement('option');o.value=v;o.textContent=v?v+'″':'Pendiente';sel.append(o);}sel.onchange=()=>guardarDatoTerminalSigasGas(n.id,'rosca',sel.value);l.append(sel);out.append(l);}else renderConfirmacionConexionTerminalSigasGas(out,n.id,modelo);}for(const d of out.querySelectorAll('details'))if(abiertos.includes(d.querySelector('summary')?.textContent))d.open=true;if(enConexion)window.scrollTo({top:y,behavior:'instant'});}
 finally{recorridoGasUI.conexiones=false;}
}
function instalarRecorridoGuiadoGas(){
 if(!document.querySelector)return;
 const abrirOriginal=window.abrir;window.abrir=function(m){const activo=!!recorridoGasUI;if(activo){if(modulo==='gas')guardarEstadoGuiadoGas();desmontarRecorridoGuiadoGas();}const r=abrirOriginal.call(this,m);if(activo&&m==='gas')activarRecorridoGuiadoGas();return r;};
 const envolver=(nombre,despues)=>{const original=window[nombre];if(typeof original!=='function')return;window[nombre]=function(...args){const r=original.apply(this,args);if(recorridoGasUI)despues?.(args,r);return r;};};
 envolver('elegirPresentacionGas',()=>{guardarEstadoGuiadoGas();aplicarPasoGuiadoGas();});
 envolver('editarTramo',()=>{if(!recorridoGasUI.operacion&&![4,6].includes(recorridoGasUI.paso))editarPasoGuiadoGas(4);});
 const calcularOriginal=window.calcularMaterialesManualGas;window.calcularMaterialesManualGas=function(...args){const anterior=conservandoVistaOrientacionTeeGas;if(recorridoGasUI?.paso===6)conservandoVistaOrientacionTeeGas=true;try{return calcularOriginal.apply(this,args);}finally{conservandoVistaOrientacionTeeGas=anterior;if(recorridoGasUI?.paso===6&&!recorridoGasUI.operacion)renderConexionesGuiadoGas();}};
 envolver('renderTramos',()=>{for(const b of $('listaTramos').querySelectorAll('button'))if(b.textContent==='Revisar accesorios')b.dataset.guiadoAccion='accesorios';});
 envolver('agregarTramo',()=>{if(recorridoGasUI.paso===4&&/cantidades|enteros/i.test($('mensajeCargaManualGas').textContent)){$('agregarAccesoriosGas').dataset.correccionGuiada='true';$('agregarAccesoriosGas').open=true;}if(!$('desde').value){$('guiadoError').textContent='';delete $('agregarAccesoriosGas').dataset.correccionGuiada;if(recorridoGasUI.paso===6&&!recorridoGasUI.operacion&&!recorridoGasUI.guardandoNavegacion){const i=tramos.findIndex(t=>t.id===$('guiadoTramoAccesorios').value);if(i>=0){recorridoGasUI.operacion=true;try{editarTramo(i);$('agregarAccesoriosGas').open=true;}finally{recorridoGasUI.operacion=false;}}}}$('guardarTramo').textContent=recorridoGasUI.paso===6?'Guardar accesorios':'Guardar tramo';guardarEstadoGuiadoGas();});
 envolver('mostrarVista',([v])=>{if(v==='dimensionGas'&&(!(Number(perfilTecnicoActualGas().poderCalorifico)>0)||!String(perfilTecnicoActualGas().fuenteGas||'').trim())){editarPasoGuiadoGas(2);$('dimensionGas').classList.add('oculto');$('guiadoAvanzadas').open=false;return;}if(['dimensionGas','redGas','revisionCroquis','consumos'].includes(v))$('guiadoAvanzadas').open=true;});
 const abrirSeccion=destino=>{const paso=({foto:3,tramos:4,cargar:4,revisar:4,conciliacion:6,materiales:7,pdf:8})[destino];if(!paso)return;if(paso<=recorridoGasUI.paso||recorridoGasUI.esEdicion||estadoRecorridoProyectoGas().completado)editarPasoGuiadoGas(paso);else errorGuiadoGas('Usá Continuar para llegar a '+pasosRecorridoGas[paso-1][0]+'.');};
 envolver('irSeccionGas',([destino])=>abrirSeccion(destino));envolver('irPasoProyectoGas',([destino])=>abrirSeccion(destino));envolver('mostrarEditorProyectoGas',([accion])=>{if(accion==='renombrar')editarPasoGuiadoGas(1);});
 envolver('seleccionarAmbitoGas',()=>{$('nombreProyectoGas').value=nombreProyectoGas();guardarEstadoGuiadoGas();});
 document.addEventListener('input',e=>{if(!recorridoGasUI||!$('recorridoGuiadoGas').contains(e.target))return;if(e.target.id==='nombreProyectoGas'){proyectoGasActual().recorridoGuiadoGas.nombreBorrador=e.target.value;proyectoGasActual().recorridoGuiadoGas.nombreSinConfirmar=true;}guardarEstadoGuiadoGas();});
 window.addEventListener('pagehide',()=>guardarEstadoGuiadoGas());
}
if(typeof window!=='undefined'&&document.addEventListener)window.addEventListener('load',instalarRecorridoGuiadoGas);
