/* Espacio de práctica separado. Nunca se clasifican registros solo por su nombre. */
let ambitoGas='proyecto';
function espacioDemostracionGas(){
 const g=proyectos.gas;
 if(!g.demostracion||typeof g.demostracion!=='object'||Array.isArray(g.demostracion))g.demostracion={};
 const d=g.demostracion;if(!Array.isArray(d.tramos))d.tramos=[];if(!Array.isArray(d.artefactos))d.artefactos=[];
 if(!d.instalacion)d.instalacion={version:1,perfil:{pais:'AR',uso:'domiciliario',gas:'GN'},nodos:[]};return d;
}
function proyectoGasActual(){return ambitoGas==='demostracion'?espacioDemostracionGas():proyectos.gas;}
function datosEspecialidadActual(){return modulo==='gas'?proyectoGasActual():proyectos[modulo];}
function claveFotoActual(){return modulo==='gas'&&ambitoGas==='demostracion'?'gas-demostracion':modulo;}
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
 $('ambitoGas').value=ambitoGas;
 actualizarVistaEntregaGas();renderSugerenciasGas();
 $('estadoAmbitoGas').textContent=ambitoGas==='demostracion'?'DEMOSTRACIÓN: datos de práctica separados. No es tu proyecto real.':('MI PROYECTO: ejemplos separados de los datos reales.'+(proyectos.gas.separacionDemostraciones?' Se conservaron los simulados antiguos en Demostración y una copia anterior a la separación.':''));
}
function seleccionarAmbitoGas(destino){
 if(modulo!=='gas'||!['proyecto','demostracion'].includes(destino))return;
 guardarDatos();ambitoGas=destino;const g=proyectoGasActual();
 tramos=Array.isArray(g.tramos)?g.tramos:[];artefactos=Array.isArray(g.artefactos)?g.artefactos:[];
 instalacionGas={version:1,perfil:{pais:'AR',uso:'domiciliario',gas:'GN'},nodos:[]};avisoRestauracionRedGas='';restaurarInstalacionGas(g);cancelarNodoGas();
 borradorCroquis=formatoBorradorValido(g.borradorCroquis)?g.borradorCroquis:null;
 revisionMaterialesGas=null;fuenteMaterialesGas='proyecto';$('matResultado').replaceChildren();
 $('duda').value=g.aclaracion||'';$('revision').textContent=g.revision||'Todavía no hay una revisión registrada.';
 $('gt').value=g.tipoGas||'9300';cancelarEdicionTramo();cerrarAccesorios();renderTramos();renderGas();renderRevisionCroquis();renderRedGas();mostrarFotoLocal();renderAmbitoGas();
 $('resultadoMateriales').replaceChildren();$('resultadoMateriales').textContent='Datos del espacio seleccionado. Recalculá materiales para revisar.';
 actualizarDerivadosGas();mostrarVista('croquis');
}
