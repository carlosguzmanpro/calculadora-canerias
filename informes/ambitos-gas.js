/* Proyectos GAS independientes; espacios legados preservados sin clasificar datos por su nombre. */
let ambitoGas='proyecto';
function espacioDemostracionGas(){
 const g=proyectos.gas;
 if(!g.demostracion||typeof g.demostracion!=='object'||Array.isArray(g.demostracion))g.demostracion={};
 const d=g.demostracion;if(!Array.isArray(d.tramos))d.tramos=[];if(!Array.isArray(d.artefactos))d.artefactos=[];
 if(!d.instalacion)d.instalacion={version:1,perfil:{pais:'AR',uso:'domiciliario',gas:'GN'},nodos:[]};return d;
}
function proyectoGasActual(){return ambitoGas==='demostracion'?espacioDemostracionGas():buscarProyectoGas(ambitoGas)||proyectos.gas;}
function datosEspecialidadActual(){return modulo==='gas'?proyectoGasActual():proyectos[modulo];}
function claveFotoActual(){return modulo==='gas'?(ambitoGas==='proyecto'?'gas':'gas-'+ambitoGas):modulo;}
function separarLegadoSimuladoGas(){
 const g=proyectos.gas,ts=Array.isArray(g.tramos)?g.tramos:[],as=Array.isArray(g.artefactos)?g.artefactos:[];
 const simulados=ts.filter(t=>esOrigenSimulado(t?.origen)),arts=as.filter(a=>esOrigenSimulado(a?.origen));
 if(!simulados.length&&!arts.length)return;
 // Copia anterior completa de las colecciones afectadas; las fotos/observaciones no se mueven.
 if(!g.copiaAntesSepararDemostraciones)g.copiaAntesSepararDemostraciones=JSON.parse(JSON.stringify({tramos:g.tramos||[],artefactos:g.artefactos||[],instalacion:g.instalacion||null,planCompra:g.planCompra||null,borradorCroquis:g.borradorCroquis||null}));
 const d=espacioDemostracionGas(),reales=ts.filter(t=>!esOrigenSimulado(t?.origen));
 const idsReales=new Set(reales.flatMap(t=>[t?.red?.desde,t?.red?.hasta]).filter(Boolean)),idsSim=new Set(simulados.flatMap(t=>[t?.red?.desde,t?.red?.hasta]).filter(Boolean)),artSim=new Set(arts.map(a=>a.id));
 const nodos=Array.isArray(g.instalacion?.nodos)?g.instalacion.nodos:[],mover=n=>n&&!idsReales.has(n.id)&&(idsSim.has(n.id)||artSim.has(n.artefactoId));
 d.tramos.push(...simulados);d.artefactos.push(...arts);d.instalacion.nodos.push(...nodos.filter(mover));
 if(g.instalacion)g.instalacion={...g.instalacion,nodos:nodos.filter(n=>!mover(n))};
 if(g.borradorCroquis?.aplicado&&esOrigenSimulado({tipo:g.borradorCroquis.origen})&&!d.borradorCroquis){d.borradorCroquis=g.borradorCroquis;g.borradorCroquis=null;}
 g.tramos=reales;g.artefactos=as.filter(a=>!esOrigenSimulado(a?.origen));
 g.separacionDemostraciones={tramosConservados:simulados.length,artefactosConservados:arts.length,copiaDisponible:true};
}
function renderAmbitoGas(){
 const select=$('ambitoGas');select.replaceChildren();
 for(const [id,nombre]of [['proyecto','Mi proyecto'],['demostracion','Demostración separada'],...registrosProyectosGas().map(p=>['proyecto:'+p.id,p.nombre])]){const option=document.createElement('option');option.value=id;const propio=id==='proyecto'?proyectos.gas.nombreProyecto:id==='demostracion'?proyectos.gas.demostracion?.nombreProyecto:null;option.textContent=nombre+(propio?' · '+propio:'');select.append(option);}select.value=ambitoGas;
 sincronizarSistemaPrincipalGas();actualizarVistaEntregaGas();renderSugerenciasGas();renderResumenPrincipalGas();
 $('estadoAmbitoGas').textContent=ambitoGas==='demostracion'?'DEMOSTRACIÓN: datos de práctica separados. No es tu proyecto real.':ambitoGas==='proyecto'?('MI PROYECTO: ejemplos separados de los datos reales.'+(proyectos.gas.separacionDemostraciones?' Se conservaron los simulados antiguos en Demostración y una copia anterior a la separación.':'')):'PROYECTO: '+nombreProyectoGas()+'. Datos independientes; fotografía opcional.';
}
function seleccionarAmbitoGas(destino){
 if(modulo!=='gas'||!ambitoDisponibleGas(destino)){if(modulo==='gas'){$('ambitoGas').value=ambitoGas;$('mensajeProyectosGas').textContent='Proyecto no disponible. No se cambiaron los datos.';}return;}
 capturarBorradorProyectoGas();guardarDatos();ambitoGas=destino;proyectos.gas.proyectoActivoGas=destino==='demostracion'?'proyecto':destino;cancelarEditorProyectoGas();const g=proyectoGasActual();
 tramos=Array.isArray(g.tramos)?g.tramos:[];artefactos=Array.isArray(g.artefactos)?g.artefactos:[];
 instalacionGas={version:1,perfil:{pais:'AR',uso:'domiciliario',gas:'GN'},nodos:[]};avisoRestauracionRedGas='';restaurarInstalacionGas(g);cancelarNodoGas();
 borradorCroquis=formatoBorradorValido(g.borradorCroquis)?g.borradorCroquis:null;
 revisionMaterialesGas=null;fuenteMaterialesGas='proyecto';$('matResultado').replaceChildren();$('informeImpresion').innerHTML='';ultimoDocumentoPreparado=null;
 $('planCompraGas').classList.add('oculto');$('estadoGemini').textContent='Gemini desactivado. No se envían fotografías.';
 $('matMensaje').textContent='';$('mensajeCargaManualGas').textContent='';$('estadoPlanoOpcionalGas').replaceChildren();
 $('duda').value=g.aclaracion||'';$('revision').textContent=g.revision||'Todavía no hay una revisión registrada.';
 $('gt').value=g.tipoGas||'9300';cancelarEdicionTramo();cerrarAccesorios();renderTramos();renderGas();renderRevisionCroquis();renderRedGas();mostrarFotoLocal();renderAmbitoGas();
 $('resultadoMateriales').replaceChildren();$('resultadoMateriales').textContent='Datos del proyecto seleccionado. Cargá tramos o calculá sus materiales.';
 actualizarDerivadosGas();if(tramos.length&&g.planCompra?.revisiones?.proyecto)generarPlanGas('proyecto');
 restaurarBorradorProyectoGas();mostrarVista('croquis');guardarDatos();
}

function registrosProyectosGas(raiz=proyectos){return Array.isArray(raiz?.gas?.proyectosGuardados)?raiz.gas.proyectosGuardados.filter(p=>p&&typeof p.id==='string'&&typeof p.nombre==='string'&&p.datos&&typeof p.datos==='object'&&!Array.isArray(p.datos)):[];}
function buscarProyectoGas(ambito,raiz=proyectos){if(ambito==='proyecto')return raiz?.gas;if(ambito==='demostracion')return raiz?.gas?.demostracion;if(typeof ambito!=='string'||!ambito.startsWith('proyecto:'))return null;const ps=registrosProyectosGas(raiz).filter(p=>p.id===ambito.slice(9));return ps.length===1?ps[0].datos:null;}
function ambitoDisponibleGas(id){return ['proyecto','demostracion'].includes(id)||!!buscarProyectoGas(id);}
function proyectoGuardadoGas(raiz=ultimoGuardadoValido){return buscarProyectoGas(ambitoGas,raiz);}
function datosFotoGuardadaGas(clave,raiz=ultimoGuardadoValido){return clave==='gas'?raiz?.gas:clave==='gas-demostracion'?raiz?.gas?.demostracion:clave.startsWith('gas-proyecto:')?buscarProyectoGas(clave.slice(4),raiz):raiz?.[clave];}
function nombreProyectoGas(){return ambitoGas==='proyecto'?proyectos.gas.nombreProyecto||'Mi proyecto':ambitoGas==='demostracion'?proyectos.gas.demostracion?.nombreProyecto||'Demostración separada':registrosProyectosGas().find(p=>'proyecto:'+p.id===ambitoGas)?.nombre||'Proyecto';}
function validarRegistroProyectosGas(g){
 if(g.proyectosGuardados===undefined)return;
 if(!Array.isArray(g.proyectosGuardados))throw Error('Colección de proyectos no reconocida; se conserva sin sobrescribir.');
 const ids=new Set();for(const p of g.proyectosGuardados){if(!p||typeof p.id!=='string'||!p.id||ids.has(p.id)||typeof p.nombre!=='string'||!p.nombre.trim()||!p.datos||typeof p.datos!=='object'||Array.isArray(p.datos))throw Error('Registro de proyecto inválido o identificador repetido.');ids.add(p.id);}
}
let accionEditorProyectoGas='crear';
function mostrarEditorProyectoGas(accion='crear'){
 if(modulo!=='gas')return;accionEditorProyectoGas=accion;$('editorProyectosGas').classList.remove('oculto');$('nombreProyectoGas').value=accion==='renombrar'?nombreProyectoGas():'';$('guardarNombreProyectoGas').textContent=accion==='renombrar'?'Guardar nombre':'Crear proyecto vacío';$('mensajeProyectosGas').textContent='';$('nombreProyectoGas').focus();
}
function cancelarEditorProyectoGas(){$('editorProyectosGas').classList.add('oculto');$('nombreProyectoGas').value='';}
function guardarNombreProyectoGas(){const ok=accionEditorProyectoGas==='renombrar'?renombrarProyectoGas($('nombreProyectoGas').value):crearProyectoGas($('nombreProyectoGas').value);if(ok)cancelarEditorProyectoGas();}
function nombreProyectoValidoGas(nombre,actual=null){const n=String(nombre??'').trim();if(!n||n.length>80)throw Error('Ingresá un nombre de 1 a 80 caracteres.');const normal=v=>String(v).trim().toLocaleLowerCase('es');const reservados=[['proyecto','Mi proyecto'],['demostracion','Demostración separada'],['proyecto',proyectos.gas.nombreProyecto||'Mi proyecto'],['demostracion',proyectos.gas.demostracion?.nombreProyecto||'Demostración separada'],...registrosProyectosGas().map(p=>['proyecto:'+p.id,p.nombre])];if(reservados.some(([id,x])=>id!==actual&&normal(x)===normal(n)))throw Error('Ese nombre ya existe. Elegí otro para distinguir los proyectos.');return n;}
function crearProyectoGas(nombre){
 if(modulo!=='gas')return null;
 try{validarRegistroProyectosGas(proyectos.gas);const n=nombreProyectoValidoGas(nombre);let id;do{id=idGas('proyecto');}while(registrosProyectosGas().some(p=>p.id===id));
 const nuevo={id,nombre:n,datos:{tramos:[],artefactos:[],instalacion:{version:1,perfil:{pais:'AR',uso:'domiciliario',gas:'GN'},nodos:[]},planCompra:{opciones:{cargaManualDirecta:true},extras:[],revisiones:{}}}};
 if(!proyectos.gas.proyectosGuardados)proyectos.gas.proyectosGuardados=[];proyectos.gas.proyectosGuardados.push(nuevo);seleccionarAmbitoGas('proyecto:'+id);
 $('mensajeProyectosGas').textContent='Proyecto vacío creado: '+n+'. '+(JSON.stringify(proyectoGuardadoGas())===JSON.stringify(proyectoGasActual())?'Guardado local confirmado.':'Guardado local no confirmado: conservá un respaldo antes de cerrar.');desplazarResultadoMaterialesGas('formularioGas');return id;
 }catch(e){$('mensajeProyectosGas').textContent=e.message;return null;}
}
function renombrarProyectoGas(nombre){
 if(modulo!=='gas')return false;
 try{validarRegistroProyectosGas(proyectos.gas);const n=nombreProyectoValidoGas(nombre,ambitoGas);if(ambitoGas.startsWith('proyecto:'))registrosProyectosGas().find(p=>'proyecto:'+p.id===ambitoGas).nombre=n;else proyectoGasActual().nombreProyecto=n;guardarDatos();renderAmbitoGas();ultimoDocumentoPreparado=null;const guardado=ambitoGas.startsWith('proyecto:')?registrosProyectosGas(ultimoGuardadoValido).find(p=>'proyecto:'+p.id===ambitoGas)?.nombre:proyectoGuardadoGas()?.nombreProyecto;$('mensajeProyectosGas').textContent='Nombre actualizado. Las fotos y datos conservan su proyecto.'+(guardado!==n?' Guardado local no confirmado: conservá un respaldo antes de cerrar.':'');return true;}catch(e){$('mensajeProyectosGas').textContent=e.message;return false;}
}
const camposBorradorProyectoGas=['desde','hasta','metros','consumoTramo','diametro','otroDiametro','destinoArtefacto','gp','ga','redNombreNodo','redTipoNodo','redArtefactoNodo'];
function capturarBorradorProyectoGas(){
 if(modulo!=='gas')return;const valores={};for(const id of [...camposBorradorProyectoGas,...tiposRapidosGas.map(([k])=>'manualGas_'+k)])if($(id))valores[id]=$(id).value;
 const d={valores,tramo:tramos[editandoTramo]?.id||null,nodo:editandoNodoGas||null};
 if(editandoAccesorios>=0&&tramos[editandoAccesorios]){d.accesorios={tramo:tramos[editandoAccesorios].id,datos:JSON.parse(JSON.stringify(borradorAccesorios)),estado:$('estadoAccesorios').value,final:$('metrosFinal').value,rapidos:{}};for(const [k]of tiposRapidosGas)if($('rapidoGas_'+k))d.accesorios.rapidos[k]=$('rapidoGas_'+k).value;}
 const utiles=Object.entries(valores).some(([id,v])=>!['ga','redTipoNodo','redArtefactoNodo'].includes(id)&&String(v??'').trim()!=='')||(valores.ga&&valores.ga!=='Cocina')||!!d.tramo||!!d.nodo||!!d.accesorios;
 if(utiles)proyectoGasActual().borradorFormularioGas=d;else delete proyectoGasActual().borradorFormularioGas;
}
function restaurarBorradorProyectoGas(){
 for(const id of camposBorradorProyectoGas)if($(id))$(id).value=id==='ga'?'Cocina':id==='redTipoNodo'?'derivacion':'';
 const d=proyectoGasActual().borradorFormularioGas;if(!d)return;try{validarBorradorProyectoGas(proyectoGasActual());}catch(e){$('mensajeProyectosGas').textContent=e.message;return;}
 const i=d.tramo?tramos.findIndex(t=>t.id===d.tramo):-1;if(i>=0)editarTramo(i);
 if(d.accesorios){const j=tramos.findIndex(t=>t.id===d.accesorios.tramo);if(j>=0){abrirAccesorios(j);borradorAccesorios=JSON.parse(JSON.stringify(d.accesorios.datos||[]));$('estadoAccesorios').value=d.accesorios.estado||'pendiente';$('metrosFinal').value=d.accesorios.final??'';cambiarEstadoAccesorios();for(const [k,v]of Object.entries(d.accesorios.rapidos||{}))if($('rapidoGas_'+k))$('rapidoGas_'+k).value=v;}}
 for(const [id,v]of Object.entries(d.valores||{}))if([...camposBorradorProyectoGas,...tiposRapidosGas.map(([k])=>'manualGas_'+k)].includes(id)&&$(id))$(id).value=v;
 editandoNodoGas=instalacionGas.nodos.some(n=>n.id===d.nodo)?d.nodo:null;if(editandoNodoGas)$('redGuardarNodo').textContent='Guardar cambios del punto';
 $('otroDiametro').classList.toggle('oculto',$('diametro').value!=='Otro (especificar)');
}

function validarBorradorProyectoGas(p){
 const d=p.borradorFormularioGas;if(d===undefined)return;
 const objeto=v=>v&&typeof v==='object'&&!Array.isArray(v);
 if(!objeto(d)||(d.valores!==undefined&&!objeto(d.valores))||(d.tramo!=null&&typeof d.tramo!=='string')||(d.nodo!=null&&typeof d.nodo!=='string'))throw Error('Borrador de proyecto no reconocido; se conserva sin aplicar.');
 if(d.accesorios&&(!objeto(d.accesorios)||typeof d.accesorios.tramo!=='string'||!Array.isArray(d.accesorios.datos)||d.accesorios.datos.some(a=>!objeto(a))||(d.accesorios.rapidos!==undefined&&!objeto(d.accesorios.rapidos))))throw Error('Borrador de accesorios no reconocido; se conserva sin aplicar.');
}
