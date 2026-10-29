/* Puente de solo lectura: las cantidades se reutilizan; el resultado técnico no cambia materiales. */
function roscasConfirmadasEjercicioSigasGas(){return proyectoGasActual().referenciaSigas19===true?{'terminal-medidor':'3/4','terminal-Termo':'1/2','terminal-Calefactor':'1/2','terminal-Cocina':'1/2'}:{};}
function transicionesRectasDeclaradasSigasGas(){
 if(modulo!=='gas'||CatalogosSistemasGas.identificar(instalacionGas.perfil)!=='sigas')return [];
 const red=redFisicaManualGas(),preparacion=PreparacionDiametrosGas.prepararRed(red,tramos,perfilTecnicoActualGas()),entradas=new Set(Object.values(red.orientacion).map(o=>o.hasta)),raices=[...new Set(Object.values(red.orientacion).map(o=>o.desde))].filter(id=>!entradas.has(id)),mapa=new Map(preparacion.recorridos.map(r=>['terminal-'+r.artefacto,[r.tramos.at(-1)]]));
 if(raices.length===1)mapa.set('terminal-medidor',Object.entries(red.orientacion).filter(([,o])=>o.desde===raices[0]).map(([id])=>id));
 return Object.entries(proyectoGasActual().calculoSigas?.terminales||{}).filter(([id,a])=>a.geometria==='recta'&&mapa.get(id)?.length===1).map(([id,a])=>({idFisico:id+'::recta',tipo:'Transición recta fusión–rosca',cantidad:1,tramo:mapa.get(id)[0],ubicacion:mapa.get(id)[0],medidas:(roscasConfirmadasEjercicioSigasGas()[id]||a.rosca)?[(roscasConfirmadasEjercicioSigasGas()[id]||a.rosca)+'″; extremo de cañería pendiente']:[],medidasEstimadas:true,confirmado:true,evidencia:'Forma recta declarada en conexión terminal; no sustituye ni duplica codos. Diámetro de cañería y validación técnica pendientes.'}));
}
function entradaPreseleccionSigasGas(){
 if(modulo!=='gas'||CatalogosSistemasGas.identificar(instalacionGas.perfil)!=='sigas')return null;
 const perfil=perfilTecnicoActualGas(),red=redFisicaManualGas(),preparacion=PreparacionDiametrosGas.prepararRed(red,tramos,perfil);
 const inventario=inventarioAccesoriosParaMotorGas(red);
 // Necesidad terminal independiente: no se transforma en un codo ni se suma a materiales.
 const entradas=new Set(Object.values(red.orientacion).map(o=>o.hasta));
 const raices=[...new Set(Object.values(red.orientacion).map(o=>o.desde))].filter(id=>!entradas.has(id));
 inventario.necesidadesTerminales=[];
 if(raices.length===1){const ids=Object.entries(red.orientacion).filter(([,o])=>o.desde===raices[0]).map(([id])=>id);inventario.necesidadesTerminales.push({id:'terminal-medidor',nombre:'Salida roscada del medidor',tramos:ids,recorridos:preparacion.recorridos.map(r=>r.artefacto)});}
 for(const ruta of preparacion.recorridos)inventario.necesidadesTerminales.push({id:'terminal-'+ruta.artefacto,nombre:'Conexión fusión–rosca de '+ruta.artefacto,tramos:ruta.tramos.slice(-1),recorridos:[ruta.artefacto]});
 // El codo autorizado del casillero se mantiene en inventario; no se supone de qué lado del medidor está.
 const entrada=entradaManualMaterialesGas(false,true),casillero=estadoCodoCasilleroGas(entrada);
 if(casillero.adicional===1&&!inventario.fisicas.some(p=>p.id==='casillero-medidor:codo90'))inventario.fisicas.push({id:'casillero-medidor:codo90',tipo:'codo90',cantidad:1,confirmada:true,tramos:[],equivalenteM:null});
 const config=JSON.parse(JSON.stringify(proyectoGasActual().calculoSigas||{}));
 const roscasConfirmadas=roscasConfirmadasEjercicioSigasGas();config.terminales||={};
 for(const [id,rosca]of Object.entries(roscasConfirmadas))config.terminales[id]={...config.terminales[id],rosca};

 // Aclaración específica del propietario sobre el ejercicio, no una regla universal para cualquier medidor.
 const proyecto=proyectoGasActual(),terminal=inventario.necesidadesTerminales.find(n=>n.id==='terminal-medidor');
 const grupoMedidor=inventario.fisicas.filter(p=>p.tipo==='codo90'&&p.cantidad===7&&p.tramos.length===1&&terminal?.tramos.includes(p.tramos[0]));
 if(proyecto.referenciaSigas19===true&&proyecto.reglaMedidorReferenciaGas!==false&&grupoMedidor.length===1){
  const grupo=grupoMedidor[0];
  if(!config.desgloses?.[grupo.id]){
   inventario.fisicas=inventario.fisicas.flatMap(p=>p.id!==grupo.id?[p]:[
    {...p,id:p.id+'::medidor',cantidad:1,origenId:p.id,cantidadOriginal:p.cantidad,indiceOrigen:0,necesidadTerminal:config.vinculos?.[p.id+'::medidor']?.necesidadTerminal??'terminal-medidor',automatico:'Conexión roscada del medidor'},
    {...p,id:p.id+'::recorrido',cantidad:6,origenId:p.id,cantidadOriginal:p.cantidad,indiceOrigen:1,automatico:'Recorrido de termofusión · 6 codos comunes',familiaAutomatica:'Codo Normal a 90º'}
   ]);
   config.vinculos||={};
   const id=grupo.id+'::recorrido';
   // La variante común del ejercicio sigue el diámetro; una corrección explícita prevalece, incluso «Pendiente».
   if(!Object.hasOwn(config.vinculos,id))config.vinculos[id]={producto:{confirmado:true,familia:'Codo Normal a 90º',origen:'Regla del ejercicio confirmada por el propietario'}};
  }
 }
 // Reservar una pieza terminal existente por artefacto: regla confirmada del ejercicio, no una regla universal.
 if(proyecto.reglaTerminalesArtefactosGas!==false){
  for(const n of inventario.necesidadesTerminales){
   const atributos=config.terminales?.[n.id],geometria=atributos&&Object.hasOwn(atributos,'geometria')?atributos.geometria:(n.id!=='terminal-medidor'&&proyecto.referenciaSigas19===true?'codo90':null);
   if(!geometria||geometria==='recta')continue;
   const vinculadas=inventario.fisicas.filter(p=>p.necesidadTerminal===n.id||config.vinculos?.[p.id]?.necesidadTerminal===n.id);
   if(vinculadas.length)continue;
   const grupos=inventario.fisicas.filter(p=>p.tipo===geometria&&p.confirmada===true&&!p.conflicto&&p.tramos.length===1&&n.tramos.includes(p.tramos[0])&&p.id!=='referencia-codo19'&&!p.necesidadTerminal&&!config.vinculos?.[p.id]?.necesidadTerminal&&!config.desgloses?.[p.id]);
   if(grupos.length!==1)continue;
   const grupo=grupos[0];inventario.fisicas=inventario.fisicas.flatMap(p=>p.id!==grupo.id?[p]:[
    {...p,id:p.cantidad===1?p.id:p.id+'::terminal',cantidad:1,necesidadTerminal:n.id,geometria,automatico:'Conexión terminal de '+n.nombre.replace('Conexión fusión–rosca de ',''),origenId:p.id,cantidadOriginal:p.cantidad,indiceOrigen:0},
    ...(p.cantidad>1?[{...p,cantidad:p.cantidad-1,origenId:p.id,cantidadOriginal:p.cantidad,indiceOrigen:1}]:[])
   ]);
  }
 }
 // Una excepción recta explícita no convierte ni descuenta un codo declarado.
 for(const n of inventario.necesidadesTerminales)if(config.terminales?.[n.id]?.geometria==='recta'){
  for(const p of inventario.fisicas.filter(p=>p.necesidadTerminal===n.id)){delete p.necesidadTerminal;p.automatico=null;}
  const recta={id:n.id+'::recta',tipo:'conexion-terminal',geometria:'recta',cantidad:1,confirmada:true,tramos:n.tramos.slice(),necesidadTerminal:n.id,automatico:'Transición recta declarada en '+n.nombre};
  const indice=inventario.fisicas.findIndex(p=>p.id===recta.id);if(indice<0)inventario.fisicas.push(recta);else inventario.fisicas[indice]=recta;
  inventario.pendientes.push('Transición recta en '+n.nombre+': medidas de compra pendientes de diámetro definitivo; cantidad presente una vez en la lista física.');
 }
 // Clasificación reutilizable en todos los tramos SIGAS; nunca crea piezas ni vías de tees.
 if(proyecto.reglaMedidorReferenciaGas!==false&&proyecto.automatizacionRecorridosGas!==false){
  config.vinculos||={};
  for(const p of inventario.fisicas){
   if(p.tipo==='tee'){p.clasificacionAutomatica='Tee de derivación · medidas y vía pendientes';continue;}
   if(p.tipo==='llave'){p.clasificacionAutomatica='Llave de paso registrada · tipo exacto pendiente';continue;}
   const vinculo=config.vinculos[p.id];
   const esComun=['codo90','codo45'].includes(p.tipo)&&p.confirmada===true&&!p.conflicto&&p.tramos.length===1&&!p.necesidadTerminal&&!vinculo?.necesidadTerminal&&!config.desgloses?.[p.id]&&p.id!=='referencia-codo19'&&p.id!=='casillero-medidor:codo90';
   if(!esComun)continue;
   const familia=p.tipo==='codo90'?'Codo Normal a 90º':'Codo Normal a 45º';
   p.clasificacionAutomatica='Codo común de termofusión · variante corregible';
   // Un vínculo explícito vacío también es una corrección: se conserva como Pendiente.
   if(!Object.hasOwn(config.vinculos,p.id))config.vinculos[p.id]={producto:{confirmado:true,familia,origen:'Tipo común registrado en tramo SIGAS'}};
  }
 }
 inventario.fisicas=inventario.fisicas.flatMap(p=>{
  const separacion=config.desgloses?.[p.id];if(!separacion)return [p];
  if(separacion.cantidad!==p.cantidad){inventario.pendientes.push('Cambió la cantidad de '+p.tipo+': revisar identificaciones individuales conservadas.');return [{...p,conflicto:true}];}
  return Array.from({length:p.cantidad},(_,i)=>{const id=p.id+'::unidad:'+i;return {...p,id,cantidad:1,origenId:p.origenId||p.id,cantidadOriginal:p.cantidadOriginal||p.cantidad,indiceOrigen:(p.indiceOrigen||0)+i,grupoOriginal:p.id,numeroUnidad:i+1,necesidadTerminal:config.vinculos?.[id]?.necesidadTerminal||null};});
 });
 // Recuperar también las excepciones de piezas originales de una sola unidad (no solo desgloses).
 for(const p of inventario.fisicas){const v=config.vinculos?.[p.id];if(!['llave','tee'].includes(p.tipo)&&v&&Object.hasOwn(v,'necesidadTerminal')&&config.terminales?.[v.necesidadTerminal]?.geometria!=='recta')p.necesidadTerminal=v.necesidadTerminal;}
 // Cantidad, función y geometría no se confunden con el producto tabulado.
 for(const p of inventario.fisicas){
  p.origenId||=p.id;p.cantidadOriginal??=p.cantidad;p.identidadesFisicas=Array.from({length:p.cantidad},(_,i)=>p.origenId+'::pieza:'+((p.indiceOrigen||0)+i));p.funcion=p.necesidadTerminal||({tee:'derivacion',llave:'corte'}[p.tipo]||'recorrido');p.geometria||=['codo90','codo45'].includes(p.tipo)?p.tipo:null;
  p.producto=config.vinculos?.[p.id]?.producto||null;
  const a=p.necesidadTerminal&&config.terminales?.[p.necesidadTerminal];
  if(a){
   const anterior=config.vinculos?.[p.id]?.producto,filas=Object.values(anterior?.productos||{}).map(id=>SIGAS_ED15_2025.tablas[3].filas.find(f=>f.id===id)).filter(Boolean),atributos=filas.map(f=>DimensionamientoSigas.atributosTerminal(f)).filter(Boolean),deducidos={...anterior?.atributos};
   if(anterior?.familia==='Codo Normal a 90º')deducidos.codoBase='HH';if(anterior?.familia==='Codo MH a 90° de')deducidos.codoBase='MH';
   for(const k of ['geometria','sexo','rosca','variante'])if(atributos.length&&atributos.every(x=>x[k]===atributos[0][k]))deducidos[k]=atributos[0][k];
   if(!p.geometria&&deducidos.geometria)p.geometria=deducidos.geometria;config.vinculos||={};config.vinculos[p.id]={...config.vinculos[p.id],producto:{confirmado:true,atributos:{...deducidos,...a,geometria:Object.hasOwn(a,'geometria')?a.geometria:p.geometria}}};p.producto=config.vinculos[p.id].producto;
  }
 }
 // Asociar cantidades existentes a sus artefactos; una llave no sustituye a una transición.
 inventario.asociacionesArtefactos=preparacion.recorridos.map(ruta=>{
  const tramo=ruta.tramos.at(-1),unico=preparacion.recorridos.filter(r=>r.tramos.at(-1)===tramo).length===1;
  const llaves=inventario.fisicas.filter(p=>p.tipo==='llave'&&p.confirmada===true&&!p.conflicto&&p.tramos.length===1&&p.tramos[0]===tramo);
  const cantidad=llaves.reduce((n,p)=>n+p.cantidad,0),llaveId=unico&&cantidad===1&&llaves.length===1?llaves[0].id:null;
  if(llaveId)llaves[0].artefactoAsociado=ruta.artefacto;
  return {artefacto:ruta.artefacto,tramo,llaveId,estado:llaveId?'Llave registrada asociada; tipo exacto pendiente':cantidad===0?'Llave no identificada en este tramo; no se añadió una':'Asociación de llaves ambigua; revisar ubicación sin cambiar cantidades',conexionRequerida:'Transición fusión–rosca',geometria:inventario.fisicas.find(p=>p.necesidadTerminal==='terminal-'+ruta.artefacto)?.geometria||null,medidaRosca:config.terminales?.['terminal-'+ruta.artefacto]?.rosca||null};
 });
 // Una revisión del inventario se conserva solo mientras no cambien red, cantidades o productos.
 const normalizarFirma=f=>{const x=JSON.parse(f);if(x.tees){for(const [id,t]of Object.entries(x.tees)){delete t.propuestaOrientacion;if(!Object.keys(t).length)delete x.tees[id];}if(!Object.keys(x.tees).length)delete x.tees;}x.perfil=Object.fromEntries(['catalogoTecnicoGas','material','sistema','gas'].map(k=>[k,x.perfil?.[k]]));return JSON.stringify(x);};
 const firma=normalizarFirma(JSON.stringify({tramos:tramos.map(t=>({id:t.id,desde:t.desde,hasta:t.hasta,metros:t.metros,detalle:t.detalle})),piezas:inventario.fisicas,ceros:inventario.ceros,vinculos:config.vinculos,terminales:config.terminales,...(config.tees?{tees:config.tees}:{}),perfil}));
 let firmaAnterior=null;try{if(config.revisionInventario?.firma)firmaAnterior=normalizarFirma(config.revisionInventario.firma);}catch(e){/* Un formato desconocido se conserva sin habilitar la revisión. */}
 const revisada=firmaAnterior===firma&&typeof config.revisionInventario?.fuente==='string'&&config.revisionInventario.fuente.trim();
 config.inventarioPerdidasCompleto=!!revisada;config.fuenteInventario=revisada?config.revisionInventario.fuente:null;
 config.firmaInventarioActual=firma;
 if(revisada){
  // Es una declaración de inventario real, nunca la estimación comercial de cuplas.
  inventario.pendientes=inventario.pendientes.filter(t=>!/^Cuplas de /.test(t));
  const L=estadoLargoComercialGas().configurado;
  for(const t of tramos){
   const ps=inventario.fisicas.filter(p=>p.tramos.includes(t.id)),interrupciones=ps.filter(p=>['codo90','codo45','tee','reduccion','llave'].includes(p.tipo)).reduce((n,p)=>n+p.cantidad,0),cuplas=ps.filter(p=>p.tipo==='cupla').reduce((n,p)=>n+p.cantidad,0);
   if(L>0&&Math.max(0,Math.ceil(t.metros/L)-1-interrupciones)>cuplas)inventario.pendientes.push(t.desde+'–'+t.hasta+': las uniones registradas no alcanzan para las longitudes y accesorios declarados; revisar cuplas reales sin usar la estimación de compra como dato confirmado.');
  }
 }
 return {preparacion,perfil,inventario,config};
}
let cacheRegistroAccesoriosSigasGas=null;
function registroAccesoriosSigasGas(){
 if(modulo!=='gas'||CatalogosSistemasGas.identificar(instalacionGas.perfil)!=='sigas')return null;
 const firma=JSON.stringify({ambitoGas,tramos,artefactos,instalacionGas,perfil:perfilTecnicoActualGas(),proyecto:proyectoGasActual()});
 if(cacheRegistroAccesoriosSigasGas?.firma===firma)return cacheRegistroAccesoriosSigasGas.registro;
 const entrada=entradaPreseleccionSigasGas();if(!entrada)return null;
 const calculo=DimensionamientoSigas.resolver(SIGAS_ED15_2025,entrada);
 const piezas=entrada.inventario.fisicas.map(p=>{
  const usos=calculo.recorridos.flatMap(r=>r.aportes.filter(a=>a.piezaId===p.id).map(a=>({...a,recorrido:r.artefacto}))),pendientes=calculo.recorridos.flatMap(r=>r.perdidasPendientes.filter(a=>a.piezaId===p.id)),productos=[...new Set(usos.map(a=>a.nombre.replace(/, flujo (?:a 90º|a través)$/,'')))];
  const candidato=p.tramos.length===1?calculo.filas.find(f=>f.id===p.tramos[0])?.candidato?.exteriorMm:null,rosca=p.necesidadTerminal?entrada.config.terminales?.[p.necesidadTerminal]?.rosca:null;
  const datosFaltantes=[];
  if(p.necesidadTerminal&&pendientes.length){const a=entrada.config.vinculos?.[p.id]?.producto?.atributos||{},atributos=DimensionamientoSigas.deducirTerminal(SIGAS_ED15_2025,{...a,geometria:Object.hasOwn(a,'geometria')?a.geometria:p.geometria},candidato);for(const [k,nombre]of [['geometria','forma de la conexión'],['sexo','sexo de la rosca'],['rosca','medida de rosca']])if(!atributos[k])datosFaltantes.push(nombre);if(!datosFaltantes.length){const opciones=DimensionamientoSigas.opcionesTerminal(SIGAS_ED15_2025,atributos,candidato);if(opciones.length>1)datosFaltantes.push('variante del producto');if(opciones.length===0){const solucion=DimensionamientoSigas.resolverConexion(SIGAS_ED15_2025,atributos,candidato);datosFaltantes.push(...solucion.pendientes);if(solucion.estado==='conjunto')datosFaltantes.push('propuesta de compra sin confirmar: verificar ubicación y pérdidas de las piezas reales');}}}
  return {...p,datosFaltantes,candidatoMm:candidato,roscaRequerida:rosca,usos,pendientes,productoIdentificado:usos.length>0&&pendientes.length===0,nombreCompra:productos.length===1?productos[0]:p.necesidadTerminal?(p.geometria==='recta'?'Transición recta fusión–rosca':'Codo 90° terminal fusión–rosca')+(rosca?' · rosca '+rosca+'″':'')+' · producto pendiente':null};
 });
 for(const a of calculo.recorridos.flatMap(r=>r.aportes).filter(a=>a.conjuntoTee))if(!piezas.some(p=>p.id===a.piezaId))piezas.push({id:a.piezaId,origenId:a.piezaId,tipo:'reduccion',cantidad:1,confirmada:true,tramos:[a.tramoId],identidadesFisicas:[a.piezaId],funcion:'reduccion-confirmada-en-tee',productoIdentificado:true,nombreCompra:a.nombre,candidatoMm:a.medidas[1],medidas:a.medidas,codigoCatalogo:a.codigoCatalogo,usos:[a],pendientes:[],datosFaltantes:[]});
 const propuestasCompra=[],vistas=new Set();
 for(const ruta of calculo.recorridos)for(const solucion of ruta.solucionesTerminales||[])for(const propuesta of solucion.propuestas||[]){
  const clave=JSON.stringify([solucion.piezaId,solucion.diametro,propuesta.componentes.map(c=>c.fila.id)]);if(vistas.has(clave))continue;vistas.add(clave);
  const principal=piezas.find(p=>p.id===solucion.piezaId),tramo=principal?.tramos.map(id=>calculo.filas.find(f=>f.id===id)?.tramo||id).join(', ')||'Ubicación pendiente';
  propuestasCompra.push({id:'propuesta:'+clave,tramo,necesidad:solucion.necesidad,diametroMm:solucion.diametro,rosca:entrada.config.terminales?.[solucion.necesidad]?.rosca||null,estado:'propuesta-sin-confirmar',confirmada:false,afectaCalculo:false,requiereUbicacionEnTee:propuesta.requiereUbicacionEnTee,componentes:propuesta.componentes.map(c=>({productoId:c.fila.id,nombre:c.fila.nombreOriginal,tipo:c.tipo,cantidad:1,reutilizada:c.reutilizada,pagina:c.fila.pagina,coincidencias:c.reutilizada?[solucion.piezaId]:piezas.filter(p=>p.id!==solucion.piezaId&&p.tramos.some(id=>principal?.tramos.includes(id))&&(p.tipo===c.tipo||c.tipo==='niple'&&/niple/i.test(p.tipo)||c.tipo==='transicion'&&/transici/i.test(p.tipo))).map(p=>p.id)}))});
 }
 const registro={version:1,piezas,propuestasCompra,calculo,verificacion:DimensionamientoSigas.verificar(SIGAS_ED15_2025,entrada,calculo),entradaTecnica:entrada,roscasConfirmadas:roscasConfirmadasEjercicioSigasGas()};cacheRegistroAccesoriosSigasGas={firma,registro};return registro;
}
function proyectarRegistroSigasEnMaterialesGas(entrada){
 const registro=registroAccesoriosSigasGas();if(!registro)return entrada;
 const porOrigen=new Map();for(const p of registro.piezas){if(!porOrigen.has(p.origenId))porOrigen.set(p.origenId,[]);porOrigen.get(p.origenId).push(p);}
 entrada.extras=entrada.extras.flatMap(a=>{
  const ps=porOrigen.get(a.idFisico);if(!ps||ps.reduce((n,p)=>n+p.cantidad,0)!==a.cantidad)return [a];
  return ps.map(p=>({...a,idFisico:p.id,cantidad:p.cantidad,nombreMaterialSigas:p.nombreCompra||null,registroSigas:{id:p.id,identidadesFisicas:p.identidadesFisicas,funcion:p.funcion,geometria:p.geometria,productoIdentificado:p.productoIdentificado,productos:[...new Set(p.usos.map(a=>a.id))],candidatoMm:p.candidatoMm,rosca:p.roscaRequerida},medidas:a.medidas?.filter(Boolean).length?a.medidas:(p.candidatoMm?[p.candidatoMm+' mm candidato'+(p.roscaRequerida?' / rosca '+p.roscaRequerida+'″':'')]:[]),medidasEstimadas:!a.medidas?.filter(Boolean).length||a.medidasEstimadas,evidencia:(a.evidencia||'')+' Registro compartido SIGAS: producto y equivalentes según el mismo accesorio; diámetro candidato, no definitivo.'}));
 });
 for(const p of registro.piezas.filter(p=>p.funcion==='reduccion-confirmada-en-tee'))if(!entrada.extras.some(a=>a.idFisico===p.id))entrada.extras.push({idFisico:p.id,tipo:'reduccion',cantidad:1,confirmado:true,tramo:p.tramos[0],ubicacion:p.tramos[0],medidas:p.medidas.map(n=>n+' mm'),medidasEstimadas:true,nombreMaterialSigas:p.nombreCompra,evidencia:'Conjunto de tee confirmado · '+p.codigoCatalogo+'; medidas basadas en diámetros candidatos.'});
 if(entrada.manualDirecto?.ceros)entrada.manualDirecto.ceros=entrada.manualDirecto.ceros.filter(c=>c.tipo!=='reduccion'||!registro.piezas.some(p=>p.funcion==='reduccion-confirmada-en-tee'&&p.tramos.includes(c.ubicacion)));
 entrada.propuestasCompraSigas=registro.propuestasCompra;
 return entrada;
}
function calcularPreseleccionSigasGas(){return registroAccesoriosSigasGas()?.calculo||null;
}
// Formato visual: nunca se utiliza para seleccionar filas o comparar capacidades.
function metrosResultadoSigasGas(n){return Number.isFinite(n)?n.toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2}):'Pendiente';}
// Proyección del resultado existente: sin fórmulas nuevas ni escrituras del proyecto.
function resumenCalculoSencilloGas(){
 if(modulo!=='gas'||CatalogosSistemasGas.identificar(instalacionGas.perfil)!=='sigas'||perfilTecnicoActualGas().gas!=='GN')return null;
 const registro=registroAccesoriosSigasGas(),r=registro.calculo,v=registro.verificacion;
 return {estado:v.estado,consumoTotalKcal:estadoCierreGas().consumoTotalKcal,definitivo:false,filas:r.filas.map(f=>({
  tramo:f.tramo,realM:f.longitudRealM,consumoKcal:f.consumoKcal,caudalM3h:f.caudalM3h,equivalenteConocidoM:f.equivalenteConocidoTramoM,
  longitudCalculoM:f.longitudDefinitivaM,longitudConsultaParcialM:f.longitudConsultaM,recorrido:f.recorridoControl,candidatoMm:f.candidato?.exteriorMm||null,comprobadoPorTabla:f.comprobadoPorTabla,filaM:f.candidato?.longitudFilaM??null,capacidadM3h:f.candidato?.capacidadM3h??null,tabla:f.candidato?.tabla??null,pagina:f.candidato?.pagina??null,
  datosPendientes:datosPendientesTramoSigasGas(f,registro),
  estado:!f.candidato?'Sin candidato':f.comprobadoPorTabla?'Diámetro calculado y comprobado por tabla SIGAS':f.verificacionConsulta?.parcial===false?'Equivalentes completos · verificación técnica pendiente':'Candidato provisional · equivalentes incompletos'
 })),perdidaExactaPa:v.perdidaCalculadaPa,cotaTabularPa:v.cotaTabularPa};
}
function datosPendientesTramoSigasGas(f,registro){
 if(f.comprobadoPorTabla)return [];
 const r=registro.calculo,rutas=r.recorridos.filter(r=>r.tramos.includes(f.id)),mensajes=new Map();
 for(const perdida of rutas.flatMap(r=>r.perdidasPendientes)){
  const pieza=registro.piezas.find(p=>p.id===perdida.piezaId);
  if(!pieza&&registro.piezas.some(p=>p.necesidadTerminal===perdida.piezaId))continue;
  const lugar=(pieza?.tramos||perdida.tramos).map(id=>r.filas.find(f=>f.id===id)?.tramo||id).join(', ')||'Ubicación por identificar';
  const falta=pieza?.datosFaltantes?.length?pieza.datosFaltantes.join('; '):pieza?.tipo==='tee'?(registro.entradaTecnica.config.tees?.[pieza.id]?.viasPorTramo&&Object.values(registro.entradaTecnica.config.tees[pieza.id].viasPorTramo).length===2&&Object.values(registro.entradaTecnica.config.tees[pieza.id].viasPorTramo).every(v=>['directo','giro'].includes(v))?'modelo físico y medidas de la tee compatibles con las vías ya registradas':'configuración y vía directa/giro de la tee compatibles con las tres medidas del cálculo'):pieza?.tipo==='llave'?'tipo/producto de la llave ya registrada':perdida.motivo;
  mensajes.set(pieza?.necesidadTerminal||perdida.piezaId,lugar+': '+falta.replace(/\.+$/,'')+(pieza?.roscaRequerida?' (rosca '+pieza.roscaRequerida+'″ ya registrada)':'')+'.');
 }
 if(!registro.entradaTecnica.config.inventarioPerdidasCompleto||registro.entradaTecnica.inventario.pendientes.some(p=>/^Cuplas de /.test(p)))mensajes.set('inventario','Completar el inventario real de pérdidas, incluidas cuplas reales; la estimación de compra no confirma sus cantidades. No hacen falta posiciones de codos en tramos uniformes.');
 for(const texto of registro.entradaTecnica.inventario.pendientes){
  if(/^Cuplas de |^Tee en .*: identificar vía directa\/giro y configuración reductora\.$|^Tipo real de llave pendiente;/.test(texto))continue;
  mensajes.set('inventario:'+texto,textoMaterialPantallaGas(texto));
 }
 if(!r.convergente)mensajes.set('convergencia','El cálculo no alcanzó una selección estable; revisar trazabilidad.');
 if(!f.candidato)mensajes.set('capacidad',f.pendientes[0]||'Faltan longitud o caudal aplicables a la tabla.');
 return [...mensajes.values()];
}
function renderCalculoSencilloGas(out){
 let r;try{r=resumenCalculoSencilloGas();}catch(e){const p=document.createElement('p');p.textContent='Resultados técnicos no disponibles: '+e.message+'. Los materiales registrados se conservan.';out.append(p);return;}
 if(!r)return;
 const section=document.createElement('section');section.className='gas-calculo-sencillo';
 const h=document.createElement('h3');h.textContent='CÁLCULO SENCILLO · RESULTADOS POR TRAMO';section.append(h);
 const p=document.createElement('p');p.textContent='Consumo conectado: '+(Number.isFinite(r.consumoTotalKcal)?fmt(r.consumoTotalKcal)+' kcal/h':'Pendiente')+'. Se distinguen los diámetros comprobados por tabla de los provisionales. El suministro y la aprobación normativa se verifican por separado.';section.append(p);
 for(const f of r.filas){const card=document.createElement('article');card.className='gas-calculo-tramo';
  const titulo=document.createElement('strong');titulo.textContent=f.tramo+' · '+(f.candidatoMm?f.candidatoMm+' mm '+(f.comprobadoPorTabla?'calculado':'candidato provisional'):'Diámetro pendiente');card.append(titulo);
  const dato=s=>{const n=document.createElement('p');n.textContent=s;card.append(n);};
  dato(metrosResultadoSigasGas(f.realM)+' m reales · '+(Number.isFinite(f.consumoKcal)?fmt(f.consumoKcal)+' kcal/h':'Consumo pendiente'));
  dato('Equivalente conocido del tramo: '+(f.equivalenteConocidoM===null?'Pendiente':metrosResultadoSigasGas(f.equivalenteConocidoM)+' m')+' · recorrido a '+f.recorrido+': '+(f.longitudCalculoM!==null?metrosResultadoSigasGas(f.longitudCalculoM)+' m de cálculo':f.longitudConsultaParcialM!==null?metrosResultadoSigasGas(f.longitudConsultaParcialM)+' m de consulta parcial':'Pendiente')+'.');
  if(f.comprobadoPorTabla){dato(f.estado+'.');dato('Tabla '+f.tabla+' p.'+f.pagina+' · fila '+metrosResultadoSigasGas(f.filaM)+' m · capacidad '+f.capacidadM3h.toLocaleString('es-AR',{maximumFractionDigits:6})+' m³/h ≥ caudal '+f.caudalM3h.toLocaleString('es-AR',{maximumFractionDigits:6})+' m³/h.');}
  else{if(f.filaM!==null)dato('Consulta provisional: fila '+metrosResultadoSigasGas(f.filaM)+' m · capacidad '+f.capacidadM3h.toLocaleString('es-AR',{maximumFractionDigits:6})+' m³/h · requerido '+f.caudalM3h.toLocaleString('es-AR',{maximumFractionDigits:6})+' m³/h.');const d=document.createElement('details'),s=document.createElement('summary');s.textContent='Qué falta para comprobar este tramo';d.append(s);for(const texto of f.datosPendientes){const n=document.createElement('p');n.textContent=texto;d.append(n);}card.append(d);}
  section.append(card);
 }
 if(!r.filas.length){const n=document.createElement('p');n.textContent='Sin candidatos: revisar conexiones, consumos y propiedades del gas en Verificación técnica. Los materiales manuales no se bloquean.';section.append(n);}
 out.append(section);
}
function renderMemoriaCalculoSigasGas(out,r){
 const d=document.createElement('details'),sum=document.createElement('summary');sum.textContent='Ver memoria de cálculo';d.append(sum);
 const nota=document.createElement('p');nota.textContent='Tabla 4 SIGAS p.22 y equivalencias Tabla 3 pp.24–25. La longitud base es el mayor recorrido real alimentado; la consulta final gobierna por real + equivalentes, y puede corresponder a otro recorrido. Equivalentes y total son del recorrido de control, no solo del tramo. Comprobado por tabla no significa aprobación normativa ni pérdida exacta calculada.';d.append(nota);
 const encabezados=['Tramo','Longitud real (m)','Longitud de cálculo por recorridos (m)','Consumo acumulado (m³/h)','Diámetro provisorio (mm)','Equivalente de accesorios (m)','Longitud total de cálculo (m)','Diámetro final verificado por tabla (mm)'];
 const tabla=document.createElement('table');tabla.className='tabla sigas-memoria';const head=document.createElement('thead'),hr=document.createElement('tr');for(const t of encabezados){const th=document.createElement('th');th.textContent=t;hr.append(th);}head.append(hr);tabla.append(head);const body=document.createElement('tbody');
 for(const f of DimensionamientoSigas.memoriaCalculo(r)){
  const tr=document.createElement('tr'),metros=n=>Number.isFinite(n)?metrosResultadoSigasGas(n):'Pendiente';
  const valores=[f.tramo,metros(f.longitudRealM),metros(f.longitudCalculoRealM),Number.isFinite(f.caudalM3h)?f.caudalM3h.toLocaleString('es-AR',{maximumFractionDigits:6}):'Pendiente',f.diametroProvisorioMm??'Pendiente',metros(f.equivalenteRecorridoConocidoM)+(f.equivalenteCompleto?'':' · parcial'),metros(f.longitudTotalConsultaM)+(f.longitudTotalVerificadaM===null?' · parcial':''),f.diametroVerificadoMm??'Pendiente'];
  valores.forEach((valor,i)=>{const td=document.createElement('td');td.setAttribute?.('data-label',encabezados[i]);td.textContent=String(valor);tr.append(td);});body.append(tr);
 }
 tabla.append(body);d.append(tabla);out.append(d);
}
function renderPreseleccionSigasGas(out,plan=null){
 let r;try{r=calcularPreseleccionSigasGas();}catch(e){const p=document.createElement('p');p.textContent='Preselección SIGAS pendiente: '+e.message+'. Los datos guardados se conservaron.';out.append(p);return;}
 if(!r)return;
 const titulo=document.createElement('h3');titulo.textContent=perfilTecnicoActualGas().gas==='GN'?'Diámetros por tramo · SIGAS GN':'Dimensionamiento SIGAS · combustible pendiente de método propio';out.append(titulo);
 const completo=r.filas.length&&r.filas.every(f=>f.verificacionConsulta?.parcial===false);
 const aviso=document.createElement('p');aviso.textContent=r.filas.length?(completo?'Equivalentes completos y capacidades consultadas; la aprobación normativa sigue pendiente.':'Preselección parcial, sin validación de instalación. Pérdidas pendientes no equivalen a cero.'):'No hay preselección: '+r.errores.join(' ');out.append(aviso);
 const tabla=document.createElement('table');tabla.className='tabla sigas-diametros';const head=document.createElement('thead'),hr=document.createElement('tr');for(const s of ['Tramo','Inicial → recalculado · estado tabular']){const th=document.createElement('th');th.textContent=s;hr.append(th);}head.append(hr);tabla.append(head);const body=document.createElement('tbody');
 for(const f of r.filas){const tr=document.createElement('tr');for(const s of [f.tramo,f.candidato?(r.historia[0]?.diametrosExteriorMm[f.id]??'Pendiente')+' → '+f.candidato.exteriorMm+' mm · '+(f.comprobadoPorTabla?'comprobado por tabla':'provisional'):'Sin candidato: '+(f.pendientes[0]||'Revisar conexiones, combustible y poder calorífico')]){const td=document.createElement('td');td.textContent=s;tr.append(td);}body.append(tr);}tabla.append(body);if(r.filas.length)out.append(tabla);
 renderAccesoriosPendientesCompactosSigasGas(out);
 renderMemoriaCalculoSigasGas(out,r);
 const resumen=document.createElement('details'),sr=document.createElement('summary');sr.textContent='Ver caudales, capacidades y recorridos por tramo';resumen.append(sr);
 const lista=document.createElement('div');lista.className='sigas-candidatos';
 for(const f of r.filas){
  const card=document.createElement('details');card.className='sigas-candidato';const h=document.createElement('summary');h.textContent=f.tramo+' · '+(f.candidato?f.candidato.exteriorMm+(f.comprobadoPorTabla?' mm comprobado por tabla':' mm candidato provisional'):'Pendiente')+(f.verificacionConsulta?.parcial===false?' · equivalentes completos':' · pérdidas por verificar');card.append(h);
  const textoCard=s=>{const p=document.createElement('p');p.textContent=s;card.append(p);};
  textoCard('Real: '+metrosResultadoSigasGas(f.longitudRealM)+' m · equivalente conocido del tramo: '+(f.equivalenteConocidoTramoM===null?'Pendiente':metrosResultadoSigasGas(f.equivalenteConocidoTramoM)+' m')+'; equivalente total: '+(f.longitudDefinitivaM===null?'Pendiente de completar pérdidas':'ver detalle de recorrido')+'.');
  textoCard('Longitud de consulta: '+metrosResultadoSigasGas(f.longitudConsultaM)+' m'+(f.longitudDefinitivaM===null?' (parcial; pérdidas pendientes sin valor cero)':'')+' · recorrido de control: '+(f.recorridoControl||'Pendiente')+'.');
  textoCard('Consumo '+(f.consumoKcal??'Pendiente')+' kcal/h · caudal '+(f.caudalM3h===null?'Pendiente':f.caudalM3h.toLocaleString('es-AR',{maximumFractionDigits:6}))+' m³/h.');
  textoCard(f.candidato?(f.comprobadoPorTabla?'Diámetro calculado y comprobado por tabla SIGAS: exterior ':'Candidato condicionado: exterior ')+f.candidato.exteriorMm+' mm · Tabla 4 p.22, fila '+metrosResultadoSigasGas(f.candidato.longitudFilaM)+' m · capacidad '+f.candidato.capacidadM3h+' m³/h'+(f.verificacionConsulta?.parcial===false?'; capacidad cubierta con equivalentes completos; no es aprobación normativa.':'; cubre solo la consulta parcial, no valida el diámetro definitivo.'):'Sin capacidad seleccionada.');
  const pendientes=document.createElement('details'),sp=document.createElement('summary');sp.textContent='Pérdidas que faltan · '+f.perdidasPendientesTramo.length+' piezas o grupos';pendientes.append(sp);
  for(const x of f.perdidasPendientesTramo){const p=document.createElement('p');p.textContent=(Number.isFinite(x.cantidad)?x.cantidad+' × ':'Cantidad no determinada · ')+(x.tipo==='conexion-terminal'?'Conexión terminal (necesidad; no es otra pieza añadida)':x.tipo)+(x.piezaId==='referencia-codo19'?' adicional detrás de la cocina':'')+': '+x.motivo;pendientes.append(p);}
  for(const x of f.perdidasSinUbicacion){const p=document.createElement('p');p.textContent=x.tipo+': '+x.motivo;pendientes.append(p);}
  const nota=document.createElement('p');nota.textContent='También verificar cuplas/continuidad, conexiones del medidor y artefactos, suministro (presiones y densidad) y criterio de recorrido. No se agregaron piezas ni equivalentes por suposición.';pendientes.append(nota);card.append(pendientes);lista.append(card);
 }
 resumen.append(lista);out.append(resumen);
 const detalles=document.createElement('details'),sum=document.createElement('summary');sum.textContent='Ver trazabilidad SIGAS y datos que faltan';detalles.append(sum);
 const texto=s=>{const p=document.createElement('p');p.textContent=s;detalles.append(p);};texto(r.advertencia||'Diámetros definitivos bloqueados.');
 for(const h of r.historia){texto('Iteración '+h.iteracion+' · '+h.fase);for(const ruta of h.recorridos){texto(ruta.artefacto+': '+metrosResultadoSigasGas(ruta.longitudReal)+' m reales; '+(ruta.equivalenteConocidoM===null?'equivalentes pendientes':metrosResultadoSigasGas(ruta.equivalenteConocidoM)+' m equivalentes conocidos')+'; consulta '+metrosResultadoSigasGas(ruta.longitudConsultaM)+' m.');for(const a of ruta.aportes)texto(a.cantidad+' × '+a.nombre+' · Tabla 3 p.'+a.pagina+' · '+metrosResultadoSigasGas(a.equivalenteUnitarioM)+' m/unidad = '+metrosResultadoSigasGas(a.equivalenteTotalM)+' m.');}for(const f of h.filas)for(const q of f.consultas)texto(f.tramo+': exterior '+q.exteriorMm+' mm / fila '+metrosResultadoSigasGas(q.longitudFilaM)+' m / '+q.capacidadM3h+' m³/h · '+(q.cubre?'cubre solo esta consulta':'capacidad insuficiente'));}
 for(const s of [...r.errores,...r.pendientes])texto(s);out.append(detalles);
 renderVerificacionTabularSigasGas(out);
 renderVinculosSigasGas(out,r);
 const nota=document.createElement('p');nota.textContent=textoCuplasSigasGas(plan);out.append(nota);
}
function abrirEjercicioSigas19Gas(){
 if(modulo!=='gas')return false;
 const existente=registrosProyectosGas().find(p=>p.datos.referenciaSigas19===true);
 if(existente){seleccionarAmbitoGas('proyecto:'+existente.id);prepararViasReferenciaTeeGas();guardarDatos();renderTramos();calcularMaterialesManualGas();return true;}
 if(!crearProyectoGas('Referencia SIGAS · 58 m · 19 codos'))return false;
 const filas=[['M','A',15,7,1,0,''],['A','B',5,1,1,0,''],['A','Termo',9,1,0,1,'Termotanque'],['B','Calefactor',16,4,0,1,'Calefactor'],['B','Cocina',13,5,0,1,'Cocina']];
 tramos=filas.map(([desde,hasta,metros,codos,tees,llaves,artefacto])=>({id:'ref-'+desde+'-'+hasta,desde,hasta,metros,artefacto,consumo:null,diametro:null,detalle:{estado:'pendiente',accesorios:tees?[{tipo:'tee',nodo:hasta,idFisico:'referencia-tee-'+hasta}]:[]}}));
 artefactos=[{id:'ref-termo',nombre:'Termotanque',consumo:16000},{id:'ref-calefactor',nombre:'Calefactor',consumo:3000},{id:'ref-cocina',nombre:'Cocina',consumo:10200}];
 instalacionGas={version:1,perfil:{pais:'AR',uso:'domiciliario',gas:'GN',catalogoTecnicoGas:'sigas',material:'Acero-polietileno SIGAS Thermofusión',sistema:'Thermofusión',poderCalorifico:'9300',fuenteGas:'Poder calorífico aportado para el ejercicio por el propietario; suministro real sin verificar',largosDocumentados2026:true},nodos:[]};
 const p=proyectoGasActual();p.referenciaSigas19=true;p.calculoSigas={version:1,vinculos:{},terminales:Object.fromEntries(Object.entries(roscasConfirmadasEjercicioSigasGas()).map(([id,rosca])=>[id,{rosca}]))};p.conteosRapidosGas=Object.fromEntries(filas.map((f,i)=>[tramos[i].id,{codo90:f[3],codo45:0,tee:f[4],reduccion:0,llave:f[5]}]));
 datosPlanGas().opciones.cargaManualDirecta=true;
 datosPlanGas().extras.push({idFisico:'referencia-codo19',tipo:'codo90',cantidad:1,ubicacion:'Codo 19 del ejercicio · ubicación técnica por verificar',medidas:[],confirmado:true,evidencia:'Cantidad confirmada por el propietario, adicional a los 18 declarados en los cinco tramos. Sin inferir orientación ni pérdidas.'});
 prepararViasReferenciaTeeGas();guardarDatos();renderTramos();renderGas();renderAmbitoGas();calcularMaterialesManualGas();return true;
}

function separarProductosSigasGas(piezaId){
 const e=entradaPreseleccionSigasGas(),p=e?.inventario.fisicas.find(p=>p.id===piezaId);
 if(!p||p.grupoOriginal||p.tipo==='tee'||p.cantidad<2||p.cantidad>200)return false;
 const c=proyectoGasActual().calculoSigas||={version:1,vinculos:{}};c.desgloses||={};c.desgloses[p.id]={cantidad:p.cantidad};
 // No copiar un producto común a piezas distintas: conservar el vínculo antiguo como respaldo.
 guardarDatos();renderResumenPrincipalGas();return true;
}
function identificarConexionSigasGas(piezaId,necesidad){
 const e=entradaPreseleccionSigasGas(),p=e?.inventario.fisicas.find(p=>p.id===piezaId);
 if(!p||['llave','tee'].includes(p.tipo)||p.cantidad!==1||necesidad&&!e.inventario.necesidadesTerminales.some(n=>n.id===necesidad&&n.tramos.some(t=>p.tramos.includes(t))))return false;
 const c=proyectoGasActual().calculoSigas||={version:1,vinculos:{}};c.vinculos||={};const v=c.vinculos[piezaId]||={porRecorrido:{}};v.necesidadTerminal=necesidad||null;
 guardarDatos();renderResumenPrincipalGas();return true;
}
// Catálogo SIGAS pp.40–43; códigos y LE corresponden a productos distintos, no a cantidades nuevas.
function codigoVarianteSigasGas(f){
 const n=f.nombreOriginal,D=f.diametroExteriorM*1000,a=DimensionamientoSigas.atributosTerminal(f);
 if(/^Llave Esférica /.test(n))return ({20:'60-161020000',25:'60-161025000',32:'60-161032000',40:'60-161040000',50:'60-161050040',63:'60-161063050'})[D]||null;
 if(/^Codo Normal a 90º /.test(n))return ({20:'60-090090020',25:'60-090090025',32:'60-090090032'})[D]||null;
 if(/^Codo MH a 90°/.test(n))return ({20:'60-092090020',25:'60-092090025',32:'60-092090032'})[D]||null;
 if(a?.geometria==='codo90'&&a.sexo==='hembra'){
  if(a.variante==='base-larga')return ({20:'60-096020015',25:'60-096025015'})[D]||null;
  if(a.variante==='base-extra-larga')return ({20:'60-097020015',25:'60-097025015'})[D]||null;
  return ({'20/1/2':'60-091020015','25/1/2':'60-091025015','25/3/4':'60-091025020','32/3/4':'60-091032020','32/1':'60-091032025'})[D+'/'+a.rosca]||null;
 }
 return null;
}
function opcionesVariantesSigasGas(piezaId,reg=registroAccesoriosSigasGas()){
 if(!reg)return [];
 const p=reg.piezas.find(p=>p.id===piezaId);if(!p||p.cantidad!==1||p.tramos.length!==1)return [];
 const D=reg.calculo.filas.find(f=>f.id===p.tramos[0])?.candidato?.exteriorMm;if(!D)return [];
 let filas=[];
 if(p.necesidadTerminal){
  const v=reg.entradaTecnica.config.vinculos?.[p.id]?.producto?.atributos||{},a=DimensionamientoSigas.deducirTerminal(SIGAS_ED15_2025,{...v,...reg.entradaTecnica.config.terminales?.[p.necesidadTerminal],geometria:p.geometria},D);delete a.variante;
  if(a.geometria!=='codo90'||!a.rosca)return [];
  filas=DimensionamientoSigas.opcionesTerminal(SIGAS_ED15_2025,a,D);
 }else if(p.tipo==='llave')filas=SIGAS_ED15_2025.tablas[3].filas.filter(f=>/^Llave Esférica /.test(f.nombreOriginal)&&f.diametroExteriorM*1000===D);
 else if(p.id==='referencia-codo19')filas=SIGAS_ED15_2025.tablas[3].filas.filter(f=>f.diametroExteriorM*1000===D&&(/^Codo Normal a 90º |^Codo MH a 90°/.test(f.nombreOriginal)||DimensionamientoSigas.atributosTerminal(f)?.geometria==='codo90'));
 return filas.filter(f=>codigoVarianteSigasGas(f)).map(f=>({fila:f,codigo:codigoVarianteSigasGas(f),variante:DimensionamientoSigas.atributosTerminal(f)?.variante||null}));
}
function confirmarVarianteSigasGas(piezaId,productoId){
 const reg=registroAccesoriosSigasGas(),p=reg?.piezas.find(p=>p.id===piezaId),op=opcionesVariantesSigasGas(piezaId,reg).find(o=>o.fila.id===productoId);if(!op)return false;
 const abiertos=Array.from(document.querySelectorAll?.('#resumenPrincipalMaterialesGas details[open]')||[]).map(d=>d.claveTerminalSigas||d.querySelector?.('summary')?.textContent),scroll=window.scrollY;
 if(p.necesidadTerminal){if(!guardarDatoTerminalSigasGas(p.necesidadTerminal,'variante',op.variante))return false;}
 else{const ruta=reg.entradaTecnica.preparacion.recorridos.find(r=>r.tramos.includes(p.tramos[0]));if(!ruta)return false;const familia=DimensionamientoSigas.familiaProducto(op.fila);if(!guardarVinculoSigasGas(p.id,ruta.artefacto,familia?'familia:'+familia:op.fila.id))return false;calcularMaterialesManualGas();}
 for(const d of document.querySelectorAll?.('#resumenPrincipalMaterialesGas details')||[])if(abiertos.includes(d.claveTerminalSigas||d.querySelector?.('summary')?.textContent))d.open=true;
 if(Number.isFinite(scroll))window.scrollTo({top:scroll,behavior:'instant'});return true;
}
// Escenarios efímeros: el mismo motor trabaja sobre una copia, nunca sobre el inventario real.
function opcionesEscenarioAccesoriosSigasGas(reg=registroAccesoriosSigasGas()){
 if(!reg)return [];
 return reg.piezas.filter(p=>!p.productoIdentificado&&p.cantidad===1&&p.tipo!=='tee').map(p=>{
  const opciones=opcionesVariantesSigasGas(p.id,reg);
  const referencia=(p.necesidadTerminal?opciones.find(o=>o.variante==='estandar'):opciones.find(o=>/^Codo Normal/.test(o.fila.nombreOriginal)))||opciones[0]||null;
  return {pieza:p,opciones,referencia,unicaCatalogo:opciones.length===1};
 });
}
function simularAccesoriosSigasGas(cambios={},reg=registroAccesoriosSigasGas()){
 if(!reg)return null;
 const entrada=JSON.parse(JSON.stringify(reg.entradaTecnica)),selecciones=[],sinOpcion=[];
 entrada.config.vinculos||={};
 for(const d of opcionesEscenarioAccesoriosSigasGas(reg)){
  const p=d.pieza,op=Object.hasOwn(cambios,p.id)?d.opciones.find(o=>o.fila.id===cambios[p.id]):d.referencia;
  if(!op){sinOpcion.push({id:p.id,motivo:'Sin opción documentada compatible; pérdida pendiente, nunca cero.'});continue;}
  const anterior=entrada.config.vinculos[p.id]||={},atributos=DimensionamientoSigas.atributosTerminal(op.fila),familia=DimensionamientoSigas.familiaProducto(op.fila);
  let producto;
  if(p.necesidadTerminal)producto={confirmado:true,atributos:{...anterior.producto?.atributos,...entrada.config.terminales?.[p.necesidadTerminal],...atributos}};
  else if(familia)producto={confirmado:true,familia};
  else producto={confirmado:true,tramosDiametro:p.tramos.slice(),productos:{[p.tramos.map(id=>reg.calculo.filas.find(f=>f.id===id)?.candidato?.exteriorMm).join('/')]:op.fila.id}};
  entrada.config.vinculos[p.id]={...anterior,producto};
  selecciones.push({id:p.id,tramos:p.tramos.slice(),cantidad:p.cantidad,nombre:op.fila.nombreOriginal,codigo:op.codigo,productoId:op.fila.id,unicaCatalogo:d.unicaCatalogo,confirmada:false,hipotesis:p.tipo==='llave'?'Tipo esférico propuesto; falta confirmar la llave real.':p.id==='referencia-codo19'?'Tipo de unión del codo adicional no confirmado.':'Variante del terminal no confirmada.'});
 }
 const resultado=DimensionamientoSigas.resolver(SIGAS_ED15_2025,entrada);
 return {simulacion:true,confirmada:false,afectaInventario:false,afectaCompra:false,selecciones,sinOpcion,resultado};
}
function renderEscenarioAccesoriosSigasGas(caja,escenario){
 if(!escenario)return;
 const r=escenario.resultado,nota=document.createElement('p');nota.textContent='NO CONFIRMADA · simulación orientativa, no piezas instaladas ni diámetros definitivos. Se reutiliza el motor SIGAS sobre una copia; no cambia materiales, compra, memoria real ni PDF.';caja.append(nota);
 for(const s of escenario.selecciones){const n=document.createElement('p');n.textContent=s.cantidad+' × '+s.nombre+' · '+s.codigo+' · '+(s.unicaCatalogo?'Única opción del catálogo para simular. ':'Referencia elegida solo para simular. ')+s.hipotesis;caja.append(n);}
 for(const s of escenario.sinOpcion){const n=document.createElement('p');n.textContent=s.motivo;caja.append(n);}
 const rutas=document.createElement('div');
 for(const ruta of r.recorridos){const n=document.createElement('p');n.textContent=ruta.artefacto+': '+metrosResultadoSigasGas(ruta.longitudConsultaM)+' m de cálculo orientativo'+(ruta.perdidasPendientes.length?' · parcial: faltan pérdidas.':' · equivalentes identificados bajo estas hipótesis.');rutas.append(n);}caja.append(rutas);
 for(const f of r.filas){const n=document.createElement('p');n.textContent=f.tramo+': '+(f.candidato?f.candidato.exteriorMm+' mm candidato orientativo · fila '+metrosResultadoSigasGas(f.candidato.longitudFilaM)+' m · capacidad '+f.candidato.capacidadM3h+' m³/h frente a '+Number(f.caudalM3h).toLocaleString('es-AR',{maximumFractionDigits:6})+' m³/h':'Sin candidato tabulado para estos datos')+'.';caja.append(n);}
 const pendientes=document.createElement('details'),sum=document.createElement('summary');sum.textContent='Qué falta para verificar el resultado real';pendientes.append(sum);
 const mensajes=[...escenario.selecciones.map(s=>s.nombre+': '+s.hipotesis),...r.recorridos.flatMap(r=>r.perdidasPendientes.map(p=>r.artefacto+': '+p.motivo)),...r.errores,...r.pendientes];
 for(const mensaje of [...new Set(mensajes)]){const n=document.createElement('p');n.textContent=mensaje;pendientes.append(n);}caja.append(pendientes);
}
function renderSimulacionAccesoriosSigasGas(caja,reg){
 if(!opcionesEscenarioAccesoriosSigasGas(reg).length)return;
 const d=document.createElement('details'),s=document.createElement('summary');s.textContent='Simulación orientativa · NO CONFIRMADA';d.className='sigas-simulacion-accesorios';d.append(s);
 let cargada=false;d.ontoggle=()=>{if(!d.open||cargada)return;cargada=true;const base=simularAccesoriosSigasGas({},reg);renderEscenarioAccesoriosSigasGas(d,base);
  const comparar=document.createElement('details'),sc=document.createElement('summary');sc.textContent='Comparar variantes sin confirmar piezas';comparar.append(sc);
  for(const decision of opcionesEscenarioAccesoriosSigasGas(reg).filter(d=>d.opciones.length>1)){
   const grupo=document.createElement('details'),sg=document.createElement('summary');sg.textContent=(decision.pieza.necesidadTerminal?.replace('terminal-','')||'Codo adicional de Cocina')+' · '+decision.opciones.length+' variantes';grupo.append(sg);
   let listo=false;grupo.ontoggle=()=>{if(!grupo.open||listo)return;listo=true;const aviso=document.createElement('p');aviso.textContent='Se cambia una sola variante; las demás mantienen la referencia del escenario. Ninguna opción se confirma.';grupo.append(aviso);
    for(const o of decision.opciones){const detalle=document.createElement('details'),titulo=document.createElement('summary');titulo.textContent=o.fila.nombreOriginal+' · '+o.codigo+' · '+o.fila.longitudEquivalenteM+' m';detalle.append(titulo);let evaluado=false;detalle.ontoggle=()=>{if(!detalle.open||evaluado)return;evaluado=true;const alternativa=simularAccesoriosSigasGas({[decision.pieza.id]:o.fila.id},reg);for(const ruta of alternativa.resultado.recorridos){const original=base.resultado.recorridos.find(r=>r.artefacto===ruta.artefacto),n=document.createElement('p');n.textContent=ruta.artefacto+' · referencia '+metrosResultadoSigasGas(original?.longitudConsultaM)+' m → variante '+metrosResultadoSigasGas(ruta.longitudConsultaM)+' m';detalle.append(n);}renderEscenarioAccesoriosSigasGas(detalle,alternativa);};grupo.append(detalle);}
   };comparar.append(grupo);
  }d.append(comparar);
 };caja.append(d);
}
// Estado de interfaz derivado de los mismos registros; no crea otro inventario.
function decisionesAccesoriosPendientesSigasGas(reg=registroAccesoriosSigasGas()){
 if(!reg)return [];
 let persistido=null;
 try{persistido=buscarProyectoGas(ambitoGas,JSON.parse(localStorage.getItem(CLAVE)))?.calculoSigas;}catch(e){}
 const actual=reg.entradaTecnica.config;
 return reg.piezas.filter(p=>p.tipo==='tee'||p.tipo==='llave'||p.necesidadTerminal&&p.necesidadTerminal!=='terminal-medidor'||p.id==='referencia-codo19').map(p=>{
  if(p.tipo==='tee')return {pieza:p,...estadoConfirmacionConjuntoTeeGas(p.id,reg)};
  const dato=c=>p.necesidadTerminal?c?.terminales?.[p.necesidadTerminal]:c?.vinculos?.[p.id];
  const a=dato(actual),b=dato(persistido),guardada=!!a&&JSON.stringify(a)===JSON.stringify(b);
  const seleccion=p.necesidadTerminal?!!a?.variante:!!a?.producto;
  const vigente=p.productoIdentificado===true;
  const estado=vigente?(guardada?'vigente':'solo-sesion'):seleccion?'requiere-confirmacion':'pendiente';
  return {pieza:p,estado,guardada,vigente,mensaje:estado==='vigente'?'Identificada y guardada':estado==='solo-sesion'?'Confirmada solo en esta sesión; no pudo guardarse':estado==='requiere-confirmacion'?'Requiere reconfirmación: revisar compatibilidad con el diámetro o la conexión actual.':'Pendiente: confirmar solamente el producto o variante real.'};
 }).filter(d=>d.estado!=='vigente');
}
function renderAccesoriosPendientesCompactosSigasGas(out){
 const reg=registroAccesoriosSigasGas();if(!reg)return;
 const decisiones=decisionesAccesoriosPendientesSigasGas(reg),seccion=document.createElement('details'),titulo=document.createElement('summary');
 seccion.className='sigas-pendientes-compactos';titulo.textContent='Completar accesorios pendientes · '+decisiones.length+' decisiones';seccion.append(titulo);
 const aviso=document.createElement('p');aviso.textContent=decisiones.length?'Solo se identifican piezas ya registradas. Diámetros provisionales; pérdidas desconocidas pendientes, nunca cero.':'Identificaciones guardadas y vigentes. La compatibilidad del suministro y la aprobación normativa se verifican por separado.';seccion.append(aviso);
 renderSimulacionAccesoriosSigasGas(seccion,reg);
 for(const d of decisiones){
  const p=d.pieza,caja=document.createElement('details'),sum=document.createElement('summary');
  const tramo=p.tramos.map(id=>reg.calculo.filas.find(f=>f.id===id)?.tramo||'Tramo pendiente').join(', ');
  caja.className='sigas-decision-pendiente';caja.claveTerminalSigas='pendiente:'+p.id;
  sum.textContent=(p.tipo==='tee'?'Tee '+(p.nodo?.split(':').at(-1)||''):p.tipo==='llave'?'Llave de paso':p.id==='referencia-codo19'?'Codo adicional de Cocina':'Codo terminal')+' · '+tramo+' · '+(d.estado==='solo-sesion'?'Solo en sesión':d.estado==='requiere-confirmacion'?'Requiere reconfirmación':'Pendiente');caja.append(sum);
  const estado=document.createElement('p');estado.setAttribute?.('role','status');estado.textContent=d.mensaje;caja.append(estado);
  if(p.tipo==='tee')renderPropuestaConjuntoTeeGas(caja,p.id);
  else if(!renderVarianteCompactaSigasGas(caja,p)){const n=document.createElement('p');n.textContent=p.pendientes.map(x=>x.motivo).filter((x,i,a)=>a.indexOf(x)===i).join(' ')||'No hay variante documentada compatible con los datos actuales. Revisar la conexión en los detalles existentes.';caja.append(n);}
  if(d.estado==='solo-sesion'){const guardar=document.createElement('button');guardar.type='button';guardar.textContent='Reintentar guardar identificación';guardar.onclick=()=>{guardarDatos();calcularMaterialesManualGas();};caja.append(guardar);}
  seccion.append(caja);
 }
 out.append(seccion);
}
function renderVarianteCompactaSigasGas(caja,p){
 const reg=registroAccesoriosSigasGas(),opciones=opcionesVariantesSigasGas(p.id,reg);if(!opciones.length)return false;
 const pieza=reg.piezas.find(x=>x.id===p.id),destino=p.necesidadTerminal?.replace(/^terminal-/,'')||p.artefactoAsociado||reg.calculo.filas.find(f=>f.id===p.tramos[0])?.tramo||'pieza registrada';
 const nota=document.createElement('p');nota.textContent=p.necesidadTerminal?'Fusión '+pieza.candidatoMm+' mm candidata · rosca '+pieza.roscaRequerida+'″ ya registrada. Elegí solamente la variante del codo existente.':p.tipo==='llave'?'Propuesta de válvula esférica SIGAS para la llave ya registrada; confirmar solo si corresponde a la pieza real.':'Codo adicional detrás de Cocina, separado del codo terminal: confirmar su unión real, sin agregar piezas.';caja.append(nota);
 const l=document.createElement('label'),sel=document.createElement('select');l.textContent=p.tipo==='llave'?'Válvula de '+destino:p.necesidadTerminal?'Variante de '+destino:'Unión del codo adicional de Cocina';sel.ariaLabel=l.textContent;
 const vacio=document.createElement('option');vacio.value='';vacio.textContent='Pendiente · elegir producto real';sel.append(vacio);
 for(const op of opciones){const o=document.createElement('option');o.value=op.fila.id;const tipo=op.variante?({estandar:'Normal con rosca hembra','base-larga':'Base larga','base-extra-larga':'Extra larga'}[op.variante]):/^Codo Normal/.test(op.fila.nombreOriginal)?'Común HH de termofusión':/^Codo MH/.test(op.fila.nombreOriginal)?'MH de termofusión':op.fila.nombreOriginal;o.textContent=tipo+' · '+op.codigo+' · '+op.fila.longitudEquivalenteM+' m';if(!p.necesidadTerminal&&op.variante)o.textContent=op.fila.nombreOriginal+' · '+op.codigo+' · '+op.fila.longitudEquivalenteM+' m';sel.append(o);}
 const id=pieza.usos?.[0]?.id;sel.value=opciones.some(o=>o.fila.id===id)?id:'';l.append(sel);caja.append(l);
 const b=document.createElement('button'),estado=document.createElement('p');b.type='button';b.textContent=p.tipo==='llave'?'Confirmar válvula registrada':'Confirmar variante registrada';b.onclick=()=>{if(!sel.value){estado.textContent='Seleccioná únicamente la variante real; no se asignó pérdida cero.';return;}if(!confirmarVarianteSigasGas(p.id,sel.value))estado.textContent='Cambió el diámetro o la compatibilidad: revisar las opciones actuales.';};caja.append(b,estado);
 if(pieza.productoIdentificado){const d=document.createElement('details'),sum=document.createElement('summary'),borrar=document.createElement('button');sum.textContent='Corregir identificación';d.append(sum);borrar.type='button';borrar.className='alt';borrar.textContent='Dejar producto pendiente';borrar.onclick=()=>{if(p.necesidadTerminal)guardarDatoTerminalSigasGas(p.necesidadTerminal,'variante','');else{const ruta=reg.entradaTecnica.preparacion.recorridos.find(r=>r.tramos.includes(p.tramos[0]));guardarVinculoSigasGas(p.id,ruta.artefacto,'');calcularMaterialesManualGas();}};d.append(borrar);caja.append(d);}
 if(!pieza.productoIdentificado){const n=document.createElement('small');n.textContent='Opciones sin confirmar: aún no añaden pérdidas ni modifican cantidades.';caja.append(n);}
 return true;
}
function guardarDatoTerminalSigasGas(necesidad,campo,valor){
 const e=entradaPreseleccionSigasGas(),n=e?.inventario.necesidadesTerminales.find(n=>n.id===necesidad);if(!n||!['geometria','sexo','rosca','variante','codoBase'].includes(campo)||typeof valor!=='string')return false;
 if(valor&&!(campo==='codoBase'?['HH','MH'].includes(valor):SIGAS_ED15_2025.tablas[3].filas.some(f=>DimensionamientoSigas.atributosTerminal(f)?.[campo]===valor)))return false;
 const abiertos=Array.from(document.querySelectorAll?.('#resumenPrincipalMaterialesGas details[open]')||[]).map(d=>d.claveTerminalSigas||d.querySelector('summary')?.textContent),scrollAnterior=window.scrollY;
 const c=proyectoGasActual().calculoSigas||={version:1,vinculos:{}};c.terminales||={};const a=c.terminales[necesidad]||={};const confirmada=roscasConfirmadasEjercicioSigasGas()[necesidad];if(campo==='rosca'&&confirmada&&valor!==confirmada)return false;if(confirmada){if(a.rosca&&a.rosca!==confirmada){c.historialTerminales||=[];c.historialTerminales.push({necesidad,atributos:{...a}});}a.rosca=confirmada;}if(campo==='geometria'&&a.geometria!==valor){c.historialTerminales||=[];c.historialTerminales.push({necesidad,atributos:{...a}});delete a.variante;}a[campo]=valor;guardarDatos();calcularMaterialesManualGas();for(const d of document.querySelectorAll?.('#resumenPrincipalMaterialesGas details')||[])if(abiertos.includes(d.claveTerminalSigas||d.querySelector('summary')?.textContent))d.open=true;if(Number.isFinite(scrollAnterior))window.scrollTo({top:scrollAnterior,behavior:'instant'});return true;
}
function renderDatosTerminalesSigasGas(caja,p,entrada,vector,avanzado=false){
 if(!avanzado&&renderVarianteCompactaSigasGas(caja,p)){const d=document.createElement('details'),s=document.createElement('summary');s.textContent='Corregir datos de conexión (opcional)';d.append(s);renderDatosTerminalesSigasGas(d,p,entrada,vector,true);caja.append(d);return;}
 const v=entrada.config.vinculos?.[p.id]?.producto,clave=(v?.tramosDiametro||[]).map(id=>vector[id]).join('/'),f=SIGAS_ED15_2025.tablas[3].filas.find(f=>f.id===v?.productos?.[clave]);
 const a={...(v?.atributos||DimensionamientoSigas.atributosTerminal(f||{nombreOriginal:''})||{}),...entrada.config.terminales?.[p.necesidadTerminal]},diametro=p.tramos.length===1?vector[p.tramos[0]]:null;
 const actual=DimensionamientoSigas.deducirTerminal(SIGAS_ED15_2025,{...a,geometria:Object.hasOwn(a,'geometria')?a.geometria:(p.geometria||(['codo90','codo45'].includes(p.tipo)?p.tipo:''))},diametro);
 for(const [campo,titulo]of [['geometria','Forma de la conexión'],['sexo','Rosca de la pieza: macho o hembra'],['rosca','Medida de rosca'],['variante','Variante del producto']]){
  if(campo==='rosca'&&roscasConfirmadasEjercicioSigasGas()[p.necesidadTerminal]){const n=document.createElement('p');n.textContent='Rosca requerida: '+actual.rosca+'″ (confirmada). Fusión: '+(diametro?diametro+' mm del cálculo (ver estado por tramo)':'Pendiente')+'. Son medidas independientes.';caja.append(n);continue;}
  const filtro={...actual};delete filtro[campo];
  const opciones=DimensionamientoSigas.opcionesTerminal(SIGAS_ED15_2025,filtro,diametro),valores=[...new Set(opciones.map(f=>DimensionamientoSigas.atributosTerminal(f)[campo]))];
  if(campo==='sexo')valores.splice(0,valores.length,...new Set(SIGAS_ED15_2025.tablas[3].filas.map(f=>DimensionamientoSigas.atributosTerminal(f)?.sexo).filter(Boolean)));
  if(campo==='geometria'){valores.splice(0,valores.length,'codo90','recta');}
  if(campo==='variante'&&(!actual.sexo||!actual.rosca||valores.length<2))continue;
  if(actual[campo]&&valores.length===1&&campo!=='geometria'){const n=document.createElement('p');n.textContent=titulo+': '+actual[campo]+' · única opción documentada para las medidas conocidas.';caja.append(n);continue;}
  const l=document.createElement('label'),select=document.createElement('select');l.textContent=titulo;select.ariaLabel=titulo;
  for(const v of ['',...valores]){const o=document.createElement('option');o.value=v;o.textContent=v===''?'Pendiente':({codo90:'Codo de 90° ya contabilizado',recta:'Transición recta (conservar los codos declarados)',hembra:'Hembra',macho:'Macho',estandar:'Estándar','base-larga':'Base larga','base-extra-larga':'Base extra larga'}[v]||v+'″');select.append(o);}
  select.value=actual[campo]||'';select.onchange=()=>guardarDatoTerminalSigasGas(p.necesidadTerminal,campo,select.value);l.append(select);caja.append(l);
 }
 const solucion=DimensionamientoSigas.resolverConexion(SIGAS_ED15_2025,actual,diametro);
 if(solucion.propuestas.length){
  {const l=document.createElement('label'),sel=document.createElement('select');l.textContent='Unión del codo existente (no agregar otro)';sel.ariaLabel=l.textContent;for(const [v,t]of [['','Pendiente'],['HH','Común HH (enchufe–enchufe)'],['MH','MH (enchufe–espiga)']]){const o=document.createElement('option');o.value=v;o.textContent=t;sel.append(o);}sel.value=actual.codoBase||'';sel.onchange=()=>guardarDatoTerminalSigasGas(p.necesidadTerminal,'codoBase',sel.value);l.append(sel);caja.append(l);}
  const n=document.createElement('p');n.textContent=solucion.estado==='conjunto'?'Propuesta compatible para compra (sin confirmar; pérdidas no incorporadas): '+solucion.componentes.map(c=>c.fila.nombreOriginal+(c.reutilizada?' (codo existente)':'')).join(' + '):solucion.pendientes.join(' ');caja.append(n);
  if(solucion.estado==='reduccion-pendiente-ubicacion'){const d=document.createElement('details'),t=document.createElement('summary');t.textContent='Ver conjuntos de catálogo pendientes de ubicación';d.append(t);for(const p of solucion.propuestas){const n=document.createElement('p');n.textContent=p.productos.join(' + ')+'. Propuesta de compra sin confirmar: verificar ubicación y pérdidas antes de cerrar el cálculo.';d.append(n);}caja.append(d);}
 }
}
function propuestasConjuntoTeeGas(id,registro=registroAccesoriosSigasGas()){
 if(!registro)return [];
 const p=registro.entradaTecnica.inventario.fisicas.find(p=>p.id===id&&p.tipo==='tee');if(!p)return [];
 const vector=Object.fromEntries(registro.calculo.filas.map(f=>[f.id,f.candidato?.exteriorMm]));
 return DimensionamientoSigas.proponerConjuntosTee(SIGAS_ED15_2025,p,registro.entradaTecnica.preparacion.recorridos,vector,registro.entradaTecnica.config.tees?.[id]);
}
// Estado de persistencia comprobado contra el almacenamiento real, no contra el último intento.
// No forma parte del motor ni agrega campos al respaldo.
function estadoConfirmacionConjuntoTeeGas(id,registro=registroAccesoriosSigasGas()){
 const t=registro?.entradaTecnica.config.tees?.[id],c=t?.conjunto;
 if(!c)return {estado:'propuesta',guardada:false,vigente:false,mensaje:'Propuesta sin confirmar: no añade materiales ni pérdidas.'};
 const vigente=c.confirmado===true&&propuestasConjuntoTeeGas(id,registro).some(o=>o.id===c.opcionId&&o.firma===c.firma);
 let guardada=false;
 try{
  const raiz=JSON.parse(localStorage.getItem(CLAVE)),persistida=buscarProyectoGas(ambitoGas,raiz)?.calculoSigas?.tees?.[id];
  guardada=!!persistida?.conjunto&&JSON.stringify(persistida.conjunto)===JSON.stringify(c)&&JSON.stringify(persistida.viasPorTramo||{})===JSON.stringify(t.viasPorTramo||{});
 }catch(e){/* El dato en memoria permanece utilizable, pero no se afirma que sobrevivirá al cierre. */}
 if(!vigente)return {estado:'requiere-confirmacion',guardada,vigente:false,mensaje:'Requiere nueva confirmación: cambiaron diámetros, vías o compatibilidad. No se aplican las pérdidas del conjunto anterior.'+(guardada?'':' Los cambios solo están en esta sesión.')};
 if(!guardada)return {estado:'solo-sesion',guardada:false,vigente:true,mensaje:'Confirmada solo en esta sesión; no pudo guardarse'};
 return {estado:'vigente',guardada:true,vigente:true,mensaje:'Conjunto confirmado y vigente; guardado en este navegador. Los diámetros siguen sujetos a las pérdidas pendientes.'};
}
function confirmarConjuntoTeeGas(id,opcionId){
 const borrador=editandoAccesorios>=0?Object.fromEntries(tiposRapidosGas.map(([k])=>[k,$('rapidoGas_'+k)?.value])):null;
 const reg=registroAccesoriosSigasGas(),op=propuestasConjuntoTeeGas(id,reg).find(o=>o.id===opcionId);if(!op)return {ok:false,mensaje:'No hay un conjunto documentado compatible con estas vías y diámetros.'};
 const reutilizadas={};
 for(const red of op.reducciones){
  const candidatas=reg.entradaTecnica.inventario.fisicas.filter(p=>p.tipo==='reduccion'&&p.tramos.includes(red.tramoId));
  if(!candidatas.length)continue;
  const compatibles=candidatas.filter(p=>p.cantidad===1&&p.confirmada&&Object.values(reg.entradaTecnica.config.vinculos?.[p.id]?.producto?.productos||{}).includes(red.productoId));
  if(candidatas.length!==1||compatibles.length!==1)return {ok:false,mensaje:'Ya hay una reducción registrada en esta salida. Identificar su producto y vínculo antes de confirmar; no se añade otra.'};
  reutilizadas[red.id]=compatibles[0].id;
 }
 if(!guardarConfiguracionTeeSigasGas(id,{conjunto:{version:1,confirmado:true,opcionId:op.id,firma:op.firma,reutilizadas}}))return {ok:false,guardada:false,mensaje:'No se pudo aplicar la confirmación; revisar la tee registrada.'};
 renderTramos();if(editandoAccesorios>=0){mostrarConteoRapidoGas();for(const [k,v]of Object.entries(borrador||{}))if(v!==undefined&&$('rapidoGas_'+k))$('rapidoGas_'+k).value=v;}const estado=estadoConfirmacionConjuntoTeeGas(id);return {ok:estado.guardada&&estado.vigente,aplicada:true,...estado};
}
function renderPropuestaConjuntoTeeGas(caja,id){
 const reg=registroAccesoriosSigasGas(),opciones=propuestasConjuntoTeeGas(id,reg),estado=estadoConfirmacionConjuntoTeeGas(id,reg);if(!opciones.length){if(estado.estado==='requiere-confirmacion'){const n=document.createElement('p');n.setAttribute?.('role','status');n.textContent=estado.mensaje;caja.append(n);}return;}
 const conf=reg.entradaTecnica.config.tees?.[id]?.conjunto,activa=opciones.find(o=>o.id===conf?.opcionId&&o.firma===conf?.firma&&conf.confirmado);
 const d=document.createElement('details'),sum=document.createElement('summary');sum.textContent=estado.estado==='solo-sesion'?'Confirmada solo en esta sesión; no pudo guardarse':estado.estado==='requiere-confirmacion'?'Requiere nueva confirmación':activa?'Conjunto de tee confirmado y vigente · ver o cambiar':'Propuesta de tee y reducciones · revisar';d.append(sum);
 const sel=document.createElement('select');sel.ariaLabel='Solución documentada de '+id;for(const op of opciones){const o=document.createElement('option');o.value=op.id;o.textContent=op.nombre;sel.append(o);}sel.value=activa?.id||opciones[0].id;d.append(sel);
 const contenido=document.createElement('div'),mensaje=document.createElement('p');mensaje.setAttribute?.('role','status');
 const mostrar=()=>{contenido.replaceChildren();const op=opciones.find(o=>o.id===sel.value);const p=document.createElement('p');p.textContent=op.nombre+' · código '+op.codigoTee+'. La tee existente se reutiliza.';contenido.append(p);for(const r of op.reducciones){const n=document.createElement('p');n.textContent='1 × '+r.nombre+' · '+r.codigo+' · salida '+(reg.calculo.filas.find(f=>f.id===r.tramoId)?.tramo||r.tramoId)+' · '+r.equivalenteM+' m equivalentes.';contenido.append(n);}};sel.onchange=mostrar;mostrar();
 const b=document.createElement('button');b.type='button';b.textContent='Confirmar este conjunto';b.onclick=()=>{const enCarga=$('croquis').classList.contains?.('oculto')===false,r=confirmarConjuntoTeeGas(id,sel.value);mensaje.textContent=r.mensaje;if(enCarga){mostrarVista('croquis');$('tramosRegistradosGas').open=true;}if(!r.ok)window.alert?.(r.mensaje);};
 const aviso=document.createElement('p');aviso.setAttribute?.('role','status');aviso.textContent=estado.mensaje;d.append(contenido,aviso,b,mensaje);caja.append(d);
}
// Orientación independiente del producto físico; el registro técnico existente es la única fuente.
function renderViasManualesTeeGas(cont,tramoId){
 if(modulo!=='gas'||perfilTecnicoActualGas().catalogoTecnicoGas!=='sigas')return;
 let entrada;try{entrada=entradaPreseleccionSigasGas();}catch(e){return;}if(!entrada)return;
 const nombres=id=>entrada.preparacion.porTramo.find(t=>t.id===id)?.nombre||id;
 for(const pieza of entrada.inventario.fisicas.filter(p=>p.tipo==='tee'&&p.tramos.includes(tramoId))){
  const caja=document.createElement('div');caja.className='tee-manual-salidas';
  const t=document.createElement('strong');t.textContent='Circulación de tee '+String(pieza.nodo||nombres(tramoId)).replace(/^nombre:/,'');caja.append(t);
  const ids=pieza.conexionesDiametro||[],rutas=entrada.preparacion.recorridos.map(r=>r.tramos.filter(id=>ids.includes(id))).filter(a=>a.length===2),entradas=[...new Set(rutas.map(a=>a[0]))];
  if(ids.length!==3||entradas.length!==1){const n=document.createElement('p');n.textContent='Falta vincular la entrada y las dos salidas de esta tee. Los materiales se conservan.';caja.append(n);cont.append(caja);continue;}
  const conf=entrada.config.tees?.[pieza.id]||{};
  for(const salida of ids.filter(id=>id!==entradas[0])){
   const l=document.createElement('label'),sel=document.createElement('select');l.textContent='Desde '+nombres(entradas[0])+' hacia '+nombres(salida);sel.ariaLabel=l.textContent;
   for(const [valor,texto]of [['','Pendiente: indicar vía'],['directo','A través (paso directo)'],['giro','A 90° (giro)']]){const o=document.createElement('option');o.value=valor;o.textContent=texto;sel.append(o);}
   sel.value=conf.viasPorTramo?.[salida]||'';sel.onchange=()=>{const borrador=editandoAccesorios>=0?Object.fromEntries(tiposRapidosGas.map(([k])=>[k,$('rapidoGas_'+k)?.value])):null;const enCarga=$('croquis').classList.contains?.('oculto')===false;guardarConfiguracionTeeSigasGas(pieza.id,{modo:'ambas',viasPorTramo:{...(proyectoGasActual().calculoSigas?.tees?.[pieza.id]?.viasPorTramo||{}),[salida]:sel.value},fuenteOrientacion:'manual'});renderTramos();if(editandoAccesorios>=0){mostrarConteoRapidoGas();for(const [k,v]of Object.entries(borrador||{}))if(v!==undefined&&$('rapidoGas_'+k))$('rapidoGas_'+k).value=v;}if(enCarga){mostrarVista('croquis');$('editarTramosGas').open=true;}};l.append(sel);caja.append(l);
   if(!sel.value){const n=document.createElement('p');n.textContent='Tee '+String(pieza.nodo||'').replace(/^nombre:/,'')+' → '+nombres(salida)+': vía pendiente.';caja.append(n);}
  }
  const n=document.createElement('small');n.textContent='La circulación no confirma el modelo físico ni sus reducciones. Las pérdidas se aplican solo con una pieza compatible documentada.';caja.append(n);renderPropuestaConjuntoTeeGas(caja,pieza.id);cont.append(caja);
 }
}
function prepararViasReferenciaTeeGas(){
 const p=proyectoGasActual();if(!p.referenciaSigas19||p.viasReferencia90Confirmadas)return;
 const c=p.calculoSigas||={version:1,vinculos:{}};c.tees||={};
 for(const [id,salidas]of [['tee:nombre:a',['ref-A-B','ref-A-Termo']],['tee:nombre:b',['ref-B-Calefactor','ref-B-Cocina']]]){
  const previo=c.tees[id]||{};c.tees[id]={...previo,modo:'ambas',fuenteOrientacion:'Confirmación del propietario: ejercicio con entrada por ramal y dos giros',viasPorTramo:{...Object.fromEntries(salidas.map(id=>[id,'giro'])),...previo.viasPorTramo}};
 }
 p.viasReferencia90Confirmadas=true;
}
// Futuro croquis: proponer no equivale a confirmar ni a seleccionar un producto.
function guardarPropuestaVectorialTeeGas(id,dibujo){
 const e=entradaPreseleccionSigasGas(),p=e?.inventario.fisicas.find(p=>p.id===id&&p.tipo==='tee');if(!p)return false;
 const ids=p.conexionesDiametro||[],entradas=[...new Set(e.preparacion.recorridos.map(r=>r.tramos.filter(t=>ids.includes(t))).filter(r=>r.length===2).map(r=>r[0]))];
 if(entradas.length!==1||String(dibujo?.nodo?.id).replace(/^nombre:/,'').toLowerCase()!==String(p.nodo).replace(/^nombre:/,'').toLowerCase())return false;
 const propuesta=DimensionamientoSigas.interpretarTeeVectorial(dibujo,entradas[0],ids);
 return guardarConfiguracionTeeSigasGas(id,{propuestaOrientacion:{...propuesta,dibujo,confirmada:false}});
}
function guardarConfiguracionTeeSigasGas(id,cambios){
 const e=entradaPreseleccionSigasGas(),pieza=e?.inventario.fisicas.find(p=>p.id===id&&p.tipo==='tee');if(!pieza)return false;
 const actual=proyectoGasActual().calculoSigas||={version:1,vinculos:{}};actual.tees||={};
 const previo=actual.tees[id]||{},nuevo={...previo,...cambios};
 if(nuevo.modo&&!['ambas','directo','giro'].includes(nuevo.modo)||nuevo.tipo&&!['normal','central','extremo'].includes(nuevo.tipo)||Object.values(nuevo.viasPorTramo||{}).some(v=>!['','directo','giro'].includes(v))||Object.keys(nuevo.viasPorTramo||{}).some(t=>!pieza.conexionesDiametro?.includes(t)))return false;
 const clave=d=>d.claveTerminalSigas||d.claveTeeSigas||d.querySelector?.('summary')?.textContent;
 const abiertos=Array.from(document.querySelectorAll?.('#resumenPrincipalMaterialesGas details[open]')||[]).map(clave),scrollAnterior=window.scrollY;
 actual.tees[id]=nuevo;guardarDatos();calcularMaterialesManualGas();renderTramos();
 for(const d of document.querySelectorAll?.('#resumenPrincipalMaterialesGas details')||[])if(abiertos.includes(clave(d))){d.open=true;if(d.claveTeeSigas===id)for(let padre=d.parentElement;padre&&padre.id!=='resumenPrincipalMaterialesGas';padre=padre.parentElement)if(padre.tagName==='DETAILS')padre.open=true;}
 if(Number.isFinite(scrollAnterior))window.scrollTo({top:scrollAnterior,behavior:'instant'});return true;
}
function renderTeeVisualSigasGas(caja,p,entrada,r){
 const conf=entrada.config.tees?.[p.id]||{},ids=p.conexionesDiametro||[],rutas=entrada.preparacion.recorridos.map(r=>r.tramos.filter(id=>ids.includes(id))).filter(xs=>xs.length===2),entradas=[...new Set(rutas.map(xs=>xs[0]))];
 const texto=s=>{const n=document.createElement('p');n.textContent=s;caja.append(n);},nombre=id=>entrada.preparacion.porTramo.find(t=>t.id===id)?.nombre||id;
 if(ids.length!==3||entradas.length!==1){texto('Falta vincular las tres conexiones de esta tee. No se deducen vías por caudal.');return;}
 const salidas=ids.filter(id=>id!==entradas[0]),vector=r.historia.at(-1)?.diametrosExteriorMm||{},medidas=ids.map(id=>vector[id]),opciones=DimensionamientoSigas.opcionesTee(SIGAS_ED15_2025,medidas),tipos=[...new Set(opciones.map(DimensionamientoSigas.tipoTee))];
 texto('Entrada: '+nombre(entradas[0])+'. Elegí la circulación por cada salida. Esquemas de función, no posiciones del croquis. La misma tee se cuenta una sola vez.');
 const lab=document.createElement('label'),sel=document.createElement('select');lab.textContent='Familia de tee real';sel.ariaLabel='Familia de tee real';for(const [v,t]of [['','Automática si hay una sola opción compatible'],['normal','Tee igual'],['central','Tee con reducción central'],['extremo','Tee con reducción en extremo']]){const o=document.createElement('option');o.value=v;o.textContent=t;sel.append(o);}sel.value=conf.tipo||'';sel.onchange=()=>guardarConfiguracionTeeSigasGas(p.id,{tipo:sel.value});lab.append(sel);caja.append(lab);
 const viasRegistradas=salidas.every(id=>['directo','giro'].includes(conf.viasPorTramo?.[id])),estadoTee=estadoConfirmacionConjuntoTeeGas(p.id),conjuntos=propuestasConjuntoTeeGas(p.id);
 if(viasRegistradas)texto(estadoTee.estado==='propuesta'?'Vías registradas; falta confirmar el conjunto físico':estadoTee.mensaje);
 if(!tipos.length){texto('Tee única sin equivalencia documentada para '+medidas.join('/')+' mm. Esto no descarta un conjunto de piezas documentadas.');if(conjuntos.length)texto(estadoTee.estado==='vigente'?'La solución confirmada utiliza una tee normal más bujes; no una tee única con esas tres medidas.':'Conjunto compatible de tee normal más bujes disponible: revisá la propuesta.');}
 else texto('Opciones compatibles con las medidas del cálculo: '+tipos.map(t=>({normal:'igual',central:'reducción central',extremo:'reducción en extremo'}[t])).join(', ')+'. Se recalculan al cambiar el diámetro.');
 const botones=document.createElement('div'),controles=document.createElement('div');botones.className='sigas-vias-visuales';caja.append(botones,controles);
 let modo=conf.modo||'ambas';
 function mostrar(){
  for(const b of botones.children){b.className=b.modoTee===modo?'alt sigas-via-activa':'alt';b.setAttribute?.('aria-pressed',String(b.modoTee===modo));}
  controles.replaceChildren();
  if(modo==='ambas'){
   for(const salida of salidas){const l=document.createElement('label'),s=document.createElement('select');l.textContent='Vía hacia '+nombre(salida);s.ariaLabel=l.textContent;
    for(const [v,t]of [['','Pendiente'],['directo','→ Paso directo'],['giro','Derivación a 90°']]){const o=document.createElement('option');o.value=v;o.textContent=t;s.append(o);}s.value=conf.viasPorTramo?.[salida]||'';s.onchange=()=>guardarConfiguracionTeeSigasGas(p.id,{modo,viasPorTramo:{...conf.viasPorTramo,[salida]:s.value}});l.append(s);controles.append(l);
   }
  }else{
   const l=document.createElement('label'),s=document.createElement('select');l.textContent=modo==='directo'?'Qué salida continúa recta':'Qué salida gira por la derivación';s.ariaLabel=l.textContent;
   for(const id of ['',...salidas]){const o=document.createElement('option');o.value=id;o.textContent=id?nombre(id):'Elegir salida';s.append(o);}s.value=salidas.find(id=>conf.viasPorTramo?.[id]===modo)||'';s.onchange=()=>{if(s.value)guardarConfiguracionTeeSigasGas(p.id,{modo,viasPorTramo:{...conf.viasPorTramo,[s.value]:modo}});};l.append(s);controles.append(l);
  }
 }
 for(const [valor,titulo,esquema]of [['directo','Paso directo',`→──●──→
   │`],['giro','Salida por derivación',`→──●
   │
   ↓`],['ambas','Ambas vías',`→──●──→
   │
   ↓`]]){
  const b=document.createElement('button'),pre=document.createElement('pre'),t=document.createElement('span');b.type='button';b.className='alt';b.modoTee=valor;b.ariaLabel=titulo;pre.textContent=esquema;pre.setAttribute?.('aria-hidden','true');t.textContent=titulo;b.append(pre,t);b.onclick=()=>{modo=valor;mostrar();};botones.append(b);
 }
 mostrar();
 renderPropuestaConjuntoTeeGas(caja,p.id);
}
function guardarVinculoSigasGas(piezaId,recorrido,productoId,tramoAplicacion=null){
 const entrada=entradaPreseleccionSigasGas();if(!entrada||!entrada.inventario.fisicas.some(p=>p.id===piezaId))return false;
 const r=DimensionamientoSigas.resolver(SIGAS_ED15_2025,entrada),vector=r.historia.at(-1)?.diametrosExteriorMm;
 if(!vector)return false;
 const filas=SIGAS_ED15_2025.tablas[3].filas;const familia=productoId.startsWith('familia:')?productoId.slice(8):null;if(productoId&&!filas.some(f=>f.id===productoId||familia&&DimensionamientoSigas.familiaProducto(f)===familia))return false;
 if(!entrada.preparacion.recorridos.some(r=>r.artefacto===recorrido))return false;
 if(tramoAplicacion!==null&&!entrada.preparacion.porTramo.some(t=>t.id===tramoAplicacion))return false;
 const config=proyectoGasActual().calculoSigas||={version:1,vinculos:{}};config.vinculos||={};
 if(config.tees?.[piezaId]){config.historialTees||=[];config.historialTees.push({id:piezaId,configuracion:config.tees[piezaId]});delete config.tees[piezaId];}
 const v=config.vinculos[piezaId]||={porRecorrido:{}};v.porRecorrido||={};
 if(tramoAplicacion!==null){if(!entrada.preparacion.porTramo.some(t=>t.id===tramoAplicacion))return false;v.tramoAplicacion=tramoAplicacion;}
 const pieza=entrada.inventario.fisicas.find(p=>p.id===piezaId);
 const ids=pieza.tipo==='tee'&&pieza.conexionesDiametro?.length?pieza.conexionesDiametro:pieza.tramos.length?pieza.tramos:tramoAplicacion?[tramoAplicacion]:entrada.preparacion.porTramo.map(t=>t.id),clave=ids.map(id=>vector[id]).join('/');
 const campo=pieza.tipo==='tee'?v.porRecorrido:v,llave=pieza.tipo==='tee'?recorrido:'producto';
 if(familia&&pieza.tipo!=='tee')campo[llave]={confirmado:true,familia};else if(productoId)campo[llave]={confirmado:true,tramosDiametro:ids,productos:{...(campo[llave]?.productos||{}),[clave]:productoId}};else delete campo[llave];
 guardarDatos();renderResumenPrincipalGas();return true;
}
function renderVinculosSigasGas(out,r){
 const registro=registroAccesoriosSigasGas(),entrada=registro?.entradaTecnica;if(!entrada)return;
 const detalles=document.createElement('details'),sum=document.createElement('summary');sum.textContent='Identificar productos SIGAS para las pérdidas (sin repetir cantidades)';detalles.append(sum);
 const aviso=document.createElement('p');aviso.textContent='Las cantidades ya están cargadas. Identificá solo conexiones o variantes pendientes; los grupos comunes siguen el diámetro candidato. Podés corregir la variante si el croquis indica otra pieza.';detalles.append(aviso);
 const patrones={codo90:/^Codo(?: Normal a 90º | MH a 90° | 90º)/,codo45:/^Codo.*45/,tee:/^Te /,llave:/^Llave /,reduccion:/Reduct|Reduc/,cupla:/^(Cupla|Unión Normal) /,niple:/^Niple corto con tope /,transicion:/^Transición /},vector=r.historia.at(-1)?.diametrosExteriorMm;
 if(!vector){out.append(detalles);return;}
 const ids=entrada.preparacion.porTramo.map(t=>t.id),clave=ids.map(id=>vector[id]).join('/');
 const asociaciones=document.createElement('details'),sa=document.createElement('summary');sa.textContent='Conexiones y llaves de los artefactos';asociaciones.append(sa);
 for(const a of entrada.inventario.asociacionesArtefactos){const n=document.createElement('p');const ruta=r.recorridos.find(r=>r.artefacto===a.artefacto),llaveConocida=ruta?.aportes.some(p=>p.piezaId===a.llaveId),conexionPendiente=ruta?.perdidasPendientes.some(p=>p.piezaId==='terminal-'+a.artefacto);n.textContent=a.artefacto+': '+(llaveConocida?'Llave registrada y tipo identificado':a.estado)+'. '+(conexionPendiente?'Transición fusión–rosca'+(a.medidaRosca?' · rosca '+a.medidaRosca+'″ confirmada':'')+': pendiente '+(registro.piezas.find(p=>p.necesidadTerminal==='terminal-'+a.artefacto)?.datosFaltantes.join(', ')||'identificación compatible con los datos de conexión')+'.':'Transición identificada en una pieza ya contabilizada.');asociaciones.append(n);}detalles.append(asociaciones);
 for(const n of entrada.inventario.necesidadesTerminales)if(!entrada.inventario.fisicas.some(p=>p.necesidadTerminal===n.id)){
  const caja=document.createElement('details'),t=document.createElement('summary');caja.claveTerminalSigas=n.id;t.textContent=n.nombre+' · forma y medidas pendientes (no es otra pieza añadida)';caja.append(t);renderDatosTerminalesSigasGas(caja,{tipo:'conexion-terminal',tramos:n.tramos,necesidadTerminal:n.id},entrada,vector);detalles.append(caja);
 }
 const reconocidos=document.createElement('details'),srec=document.createElement('summary');srec.textContent='Accesorios reconocidos · corregir una excepción';reconocidos.append(srec);
 let cantidadResuelta=0,cantidadPendiente=0;
 for(const p of entrada.inventario.fisicas){
  const caja=document.createElement('details');caja.className='sigas-vinculo';if(p.tipo==='tee')caja.claveTeeSigas=p.id;const titulo=document.createElement('summary');titulo.textContent=p.cantidad+' × '+p.tipo+' · '+(p.tramos.map(id=>entrada.preparacion.porTramo.find(t=>t.id===id)?.nombre||id).join(', ')||'ubicación técnica pendiente');caja.append(titulo);
  if(p.clasificacionAutomatica&&!p.automatico){const n=document.createElement('p');n.textContent=['tee','llave'].includes(p.tipo)&&registro.piezas.find(x=>x.id===p.id)?.productoIdentificado?'Producto y vías identificados para los recorridos registrados; cantidad conservada.':p.tipo==='tee'&&Object.values(entrada.config.tees?.[p.id]?.viasPorTramo||{}).length===2&&Object.values(entrada.config.tees[p.id].viasPorTramo).every(v=>['directo','giro'].includes(v))?(estadoConfirmacionConjuntoTeeGas(p.id).estado==='propuesta'?'Vías registradas; falta confirmar el conjunto físico':estadoConfirmacionConjuntoTeeGas(p.id).mensaje):p.clasificacionAutomatica;caja.append(n);}
  if(p.automatico){const n=document.createElement('p');n.textContent=p.automatico+'; corregible si el croquis indica otra variante.';caja.append(n);}
  if(p.grupoOriginal)titulo.textContent+=' · pieza '+p.numeroUnidad+' (cantidad ya registrada)';

  if(p.cantidad===1&&!p.automatico&&!['llave','tee'].includes(p.tipo)){const necesidades=entrada.inventario.necesidadesTerminales.filter(n=>n.tramos.some(id=>p.tramos.includes(id)));if(necesidades.length){const l=document.createElement('label'),sel=document.createElement('select');l.textContent='Función de esta pieza (sin agregar cantidades)';sel.ariaLabel=l.textContent;for(const [id,nombre]of [['','Recorrido o conexión sin identificar'],...necesidades.map(n=>[n.id,n.nombre])]){const o=document.createElement('option');o.value=id;o.textContent=nombre;sel.append(o);}sel.value=p.necesidadTerminal||'';sel.onchange=()=>identificarConexionSigasGas(p.id,sel.value);l.append(sel);caja.append(l);}}

  if(p.tipo==='tee'){renderTeeVisualSigasGas(caja,p,entrada,r);const nota=document.createElement('p');nota.textContent='Las correcciones avanzadas de producto y vía siguen disponibles debajo; reemplazan la selección visual sin duplicar piezas.';caja.append(nota);}
  const v=entrada.config.vinculos?.[p.id]||{};
  const ub=document.createElement('select');for(const [valor,texto]of [['','Ubicación de la pérdida pendiente'],...entrada.preparacion.porTramo.map(t=>[t.id,t.nombre])]){const o=document.createElement('option');o.value=valor;o.textContent=texto;ub.append(o);}ub.value=p.tramos[0]||v.tramoAplicacion||'';
  if(!p.tramos.length){const l=document.createElement('label');l.textContent='Asociar al tramo solo si la pieza pertenece al circuito calculado';l.append(ub);caja.append(l);}
  if(p.necesidadTerminal&&p.automatico){caja.claveTerminalSigas=p.necesidadTerminal;renderDatosTerminalesSigasGas(caja,p,entrada,vector);const aplicada=r.recorridos.some(r=>r.aportes.some(a=>a.piezaId===p.id)),faltante=r.recorridos.some(r=>r.perdidasPendientes.some(a=>a.piezaId===p.id));if(aplicada&&!faltante){reconocidos.append(caja);cantidadResuelta+=p.cantidad;}else{detalles.append(caja);cantidadPendiente+=p.cantidad;}continue;}
  if((p.tipo==='llave'||p.id==='referencia-codo19')&&renderVarianteCompactaSigasGas(caja,p)){
   const aplicada=registro.piezas.find(x=>x.id===p.id)?.productoIdentificado;if(aplicada){reconocidos.append(caja);cantidadResuelta+=p.cantidad;}else{detalles.append(caja);cantidadPendiente+=p.cantidad;}continue;
  }
  const automaticoComun=p.clasificacionAutomatica?.startsWith('Codo común')||p.familiaAutomatica;
  if(automaticoComun&&v.producto?.familia){
   const n=document.createElement('p'),diametro=p.tramos.length===1?vector[p.tramos[0]]:null;
   n.textContent=p.cantidad+' × '+v.producto.familia+(diametro?' · '+diametro+' mm candidato (provisional)':' · diámetro pendiente')+'. Cantidad registrada; sin confirmación adicional. La medida definitiva requiere validación técnica.';caja.append(n);
  }
  const controles=document.createElement('details'),sc=document.createElement('summary');sc.textContent='Corregir una excepción del producto';controles.append(sc);
  if(p.cantidad>1&&p.tipo!=='tee'&&!p.grupoOriginal){const b=document.createElement('button');b.type='button';b.textContent='Identificar las '+p.cantidad+' piezas por separado';b.onclick=()=>separarProductosSigasGas(p.id);controles.append(b);}
  let renderizados=0;for(const ruta of entrada.preparacion.recorridos){
   if(p.tipo!=='tee'&&renderizados)continue;
   if(p.tramos.length&&!p.tramos.some(id=>ruta.tramos.includes(id)))continue;
   const label=document.createElement('label'),select=document.createElement('select');label.textContent=p.automatico&&p.necesidadTerminal?'Medida y variante de la conexión roscada del medidor':p.tipo==='tee'?'Configuración y vía de la tee hacia '+ruta.artefacto:p.tipo==='llave'?'Tipo de llave de paso'+(p.artefactoAsociado?' de '+p.artefactoAsociado:' (ubicación por verificar)'):'Variante del accesorio (medida automática del tramo)';renderizados++;select.ariaLabel=label.textContent;
   const vacio=document.createElement('option');vacio.value='';vacio.textContent='Pendiente: no se asigna pérdida cero';select.append(vacio);
   if(p.tipo!=='tee'){for(const familia of [...new Set(SIGAS_ED15_2025.tablas[3].filas.filter(f=>patrones[p.tipo]?.test(f.nombreOriginal)&&(!p.necesidadTerminal||/rosca|H\.larga|H\.extra/i.test(f.nombreOriginal))).map(DimensionamientoSigas.familiaProducto).filter(Boolean))]){const o=document.createElement('option');o.value='familia:'+familia;o.textContent=familia+' · medida automática del tramo';select.append(o);}}
   for(const f of SIGAS_ED15_2025.tablas[3].filas.filter(f=>!DimensionamientoSigas.familiaProducto(f)&&patrones[p.tipo]?.test(f.nombreOriginal)&&(!p.necesidadTerminal||/rosca|H\.larga|H\.extra/i.test(f.nombreOriginal))&&(p.tipo==='tee'||!p.tramos.length||p.tramos.every(id=>vector[id]===f.diametroExteriorM*1000)))){const o=document.createElement('option');o.value=f.id;o.textContent=f.nombreOriginal+' · '+f.longitudEquivalenteM+' m · p.'+f.pagina;select.append(o);}
   const asignado=p.tipo==='tee'?v.porRecorrido?.[ruta.artefacto]:v.producto,productoGuardado=asignado?.productos?.[(asignado.tramosDiametro||ids).map(id=>vector[id]).join('/')],familiaGuardada=asignado?.familia||(p.tipo!=='tee'&&DimensionamientoSigas.familiaProducto(SIGAS_ED15_2025.tablas[3].filas.find(f=>f.id===productoGuardado)||{nombreOriginal:''}));select.value=familiaGuardada?'familia:'+familiaGuardada:productoGuardado||'';
   select.onchange=()=>{if(!p.tramos.length&&!ub.value){$('matMensaje').textContent='Indicá primero si esta pérdida pertenece a un tramo del circuito; no se inventó su ubicación.';select.value='';return;}guardarVinculoSigasGas(p.id,ruta.artefacto,select.value,p.tramos.length?null:ub.value);};
   label.append(select);(automaticoComun||p.tipo==='tee'?controles:caja).append(label);
  }
  if(automaticoComun||p.tipo==='tee'||controles.children.length>1)caja.append(controles);
  const aplicada=r.recorridos.some(r=>r.aportes.some(a=>a.piezaId===p.id)),faltante=r.recorridos.some(r=>r.perdidasPendientes.some(a=>a.piezaId===p.id));
  if(aplicada&&!faltante){reconocidos.append(caja);cantidadResuelta+=p.cantidad;}else{detalles.append(caja);cantidadPendiente+=p.cantidad;}
 }
 srec.textContent='Accesorios reconocidos · '+cantidadResuelta+' piezas · corregir una excepción';
 if(cantidadResuelta)detalles.append(reconocidos);
 const estado=document.createElement('p');estado.textContent=cantidadResuelta+' piezas registradas con equivalencias conocidas'+(registro.piezas.some(p=>p.generadaPorConjunto)?' y '+registro.piezas.filter(p=>p.generadaPorConjunto).length+' componentes adicionales del conjunto':'')+'; '+cantidadPendiente+' piezas requieren datos concretos. Las conexiones terminales sin identificar siguen pendientes.';detalles.append(estado);
 out.append(detalles);
}

function textoCuplasSigasGas(plan){
 const filas=plan?.filas?.filter(f=>['cupla','cupla-plan'].includes(f.tipo))||[];
 if(!filas.length||filas.some(f=>!Number.isFinite(f.cantidad))||plan.planes?.some(g=>g.hipotesis))return 'Posibles cuplas: pendiente de confirmar. Faltan posiciones o continuidad de caños; los candidatos de diámetro se pueden consultar.';
 return 'Cuplas '+(filas.every(f=>f.cantidadConfirmada&&!f.editado)?'declaradas':'estimadas')+': '+filas.reduce((n,f)=>n+f.cantidad,0)+'. Revisar las uniones propuestas antes de comprar.';
}

function renderPropuestasCompraSigasGas(out,plan){
 const propuestas=plan.propuestasCompraSigas||[];if(!propuestas.length)return;
 const grupo=document.createElement('details'),t=document.createElement('summary');t.textContent='Propuestas de adaptación para compra · sin confirmar';grupo.append(t);
 const aviso=document.createElement('p');aviso.textContent='Estas alternativas no están sumadas a los materiales registrados ni a las pérdidas. No sumar las alternativas entre sí. Si se adopta una, verificar sus piezas, ubicación y equivalencias antes de cerrar el cálculo.';grupo.append(aviso);
 for(const [i,p]of propuestas.entries()){
  const d=document.createElement('details'),s=document.createElement('summary');s.textContent=p.tramo+' · opción '+(i+1)+' · fusión '+p.diametroMm+' mm / rosca '+(p.rosca||'Pendiente')+'″';d.append(s);
  for(const c of p.componentes){const n=document.createElement('p');n.textContent=c.cantidad+' × '+c.nombre+' · '+(c.reutilizada?'codo ya contabilizado; no agregar otro':c.coincidencias.length?'posible coincidencia con pieza registrada: revisar vínculo, no duplicar':'propuesto, no confirmado')+' · Tabla 3 p.'+c.pagina;d.append(n);}
  if(p.requiereUbicacionEnTee){const n=document.createElement('p');n.textContent='Reducción propuesta: ubicación y pérdida pendientes. Manual SIGAS p.28: verificar cambio de diámetro inmediatamente después de una tee y las longitudes por diámetro.';d.append(n);}grupo.append(d);
 }
 out.append(grupo);
}

// Los controles completan el perfil ya existente; no se guardan catálogos o fórmulas en respaldos.
function guardarVerificacionSigasGas(form){
 const campo=id=>form.querySelector('[name="'+id+'"]');
 if(modulo!=='gas'||CatalogosSistemasGas.identificar(instalacionGas.perfil)!=='sigas')return false;
 const p=instalacionGas.perfil,campos={sigasPresion:'presionDisponible',sigasMinima:'presionMinima',sigasPerdida:'perdidaMaxima',sigasUnidad:'unidadPresion',sigasFuente:'fuentePresiones',sigasDensidad:'densidadRelativa',sigasPCS:'poderCalorifico',sigasFuenteGas:'fuenteGas',sigasNorma:'referenciaNormativa',sigasDemanda:'criterioDemanda'};
 const error=campo('sigasVerificacionMensaje');
 for(const id of ['sigasPresion','sigasMinima','sigasPerdida','sigasDensidad','sigasPCS'])if(campo(id).value!==''&&!(Number.isFinite(Number(campo(id).value))&&Number(campo(id).value)>0)){error.textContent='Revisá los valores: deben ser positivos. No se guardaron cambios.';return false;}
 if(!['','Pa','mbar','mmca'].includes(campo('sigasUnidad').value)||!['','placa-total'].includes(campo('sigasDemanda').value)){error.textContent='Unidad o criterio no reconocido. No se guardaron cambios.';return false;}
 if(campo('sigasInventario').checked&&!campo('sigasFuenteInventario').value.trim()){error.textContent='Indicá la fuente de revisión del inventario real. No se guardaron cambios.';return false;}
 for(const [id,k]of Object.entries(campos))p[k]=campo(id).value.trim();
 if(p.poderCalorifico&&p.fuenteGas&&p.densidadRelativa)p.condicionesCombustiblePendientes=false;
 const c=proyectoGasActual().calculoSigas||={version:1,vinculos:{}};
 // Se conserva la declaración legada; el método aplicado no depende de esta casilla.
 const entrada=entradaPreseleccionSigasGas(),fuente=campo('sigasFuenteInventario').value.trim();
 if(campo('sigasInventario').checked&&fuente)c.revisionInventario={firma:entrada.config.firmaInventarioActual,fuente};
 else if(!campo('sigasInventario').checked)c.revisionInventario=null;

 guardarDatos();calcularMaterialesManualGas();return true;
}
function renderVerificacionTabularSigasGas(out){
 const registro=registroAccesoriosSigasGas();if(!registro||registro.entradaTecnica.perfil.gas!=='GN')return;
 const v=registro.verificacion,entrada=registro.entradaTecnica,p=entrada.perfil;
 const d=document.createElement('details'),sum=document.createElement('summary');sum.textContent='Verificar capacidad y límite de caída · SIGAS GN';d.append(sum);
 const texto=s=>{const n=document.createElement('p');n.textContent=s;d.append(n);};
 texto('Capacidad tabular a 10 mmca · GN, densidad de referencia 0,65: '+(v.estado==='comprobacion-tabular-satisfecha'?'comprobada. No es aprobación normativa.':'pendiente de completar recorridos o equivalencias.'));
 texto('Compatibilidad del suministro: '+(v.suministro.estado==='compatible-con-referencia-tabular'?'comprobada con los datos documentados declarados; presión final conservadora al menos '+fmt(v.suministro.presionFinalMinimaPa)+' Pa.':v.suministro.estado==='no-comprobado-con-esta-tabla'?'no comprobada con esta tabla.':'pendiente de datos o de capacidad tabular completa.'));
 texto('Aprobación normativa final: pendiente de revisión profesional independiente.');
 for(const r of v.recorridos)texto(r.artefacto+': '+(r.completa?metrosResultadoSigasGas(r.longitudCalculoM)+' m de cálculo · '+(r.cumpleCapacidad?'capacidades cubiertas a la referencia de tabla':'capacidad insuficiente'):'equivalencias reales incompletas; pérdida total pendiente')+'.');
 texto(v.nota);for(const aviso of v.pendientes)texto(aviso);
 const suministro=document.createElement('details'),ss=document.createElement('summary');ss.textContent='Suministro · datos que faltan';suministro.append(ss);for(const aviso of v.suministro.pendientes){const n=document.createElement('p');n.textContent=aviso;suministro.append(n);}d.append(suministro);
 const form=document.createElement('details'),st=document.createElement('summary');st.textContent='Completar datos una sola vez para este proyecto';form.append(st);
 const campos=[['sigasUnidad','Unidad común de presión','unidadPresion','select',['','Pa','mbar','mmca']],['sigasPresion','Presión disponible a la salida del medidor','presionDisponible','number'],['sigasMinima','Presión mínima más exigente de los artefactos','presionMinima','number'],['sigasPerdida','Pérdida máxima admisible','perdidaMaxima','number'],['sigasFuente','Fuente de presiones y pérdida admisible','fuentePresiones','text'],['sigasDensidad','Densidad relativa del suministro (tabla GN: 0,65)','densidadRelativa','number'],['sigasPCS','Poder calorífico (kcal/m³)','poderCalorifico','number'],['sigasFuenteGas','Fuente de propiedades del gas','fuenteGas','text'],['sigasNorma','Referencia normativa y requisitos de distribuidora','referenciaNormativa','text'],['sigasDemanda','Demanda','criterioDemanda','select',['','placa-total']]];
 for(const [id,nombre,k,tipo,opciones] of campos){const l=document.createElement('label'),i=document.createElement(tipo==='select'?'select':'input');l.textContent=nombre;i.name=id;i.ariaLabel=nombre;if(tipo==='select')for(const val of opciones){const o=document.createElement('option');o.value=val;o.textContent=val==='placa-total'?'Sumar consumos de placa sin simultaneidad':val||'Pendiente';i.append(o);}else{i.type=tipo;i.step='any';if(tipo==='number')i.min='0';else i.maxLength=300;}i.value=p[k]??'';l.append(i);form.append(l);}
 for(const [id,nombre,checked] of [['sigasInventario','Verifiqué que todos los accesorios y cuplas reales del circuito están registrados, incluidas cantidades cero comprobadas. No usar las cuplas estimadas de compra como inventario real.',entrada.config.inventarioPerdidasCompleto]]){const l=document.createElement('label'),i=document.createElement('input');i.type='checkbox';i.style.width='auto';i.name=id;i.checked=checked;l.append(i,document.createTextNode(nombre));form.append(l);}
 const l=document.createElement('label'),f=document.createElement('input');l.textContent='Fuente de revisión del inventario (croquis/listado real revisado)';f.name='sigasFuenteInventario';f.maxLength=300;f.value=entrada.config.revisionInventario?.fuente||'';l.append(f);form.append(l);
 const nota=document.createElement('p');nota.textContent='No hacen falta posiciones dentro de un tramo uniforme. Sí deben conocerse las cantidades reales y el producto de sus uniones. Si faltan cuplas reales, registralas en accesorios; esta revisión no agrega piezas ni cambia estimaciones. Un cambio de red, cantidades o productos deja la revisión anterior pendiente. Completar presiones no obliga a repetir la revisión del inventario.';form.append(nota);
 const b=document.createElement('button');b.type='button';b.textContent='Guardar datos y verificar';b.onclick=()=>guardarVerificacionSigasGas(form);form.append(b);const msg=document.createElement('p');msg.setAttribute?.('name','sigasVerificacionMensaje');msg.setAttribute?.('role','status');form.append(msg);d.append(form);out.append(d);
}

// Resultado educativo completo y efímero. Las hipótesis nunca se guardan como instalación real.
let cacheResultadoEjercicioSigasGas=null;
function resultadoEjercicioSigasGas(){
 try{return construirResultadoEjercicioSigasGas();}catch(e){return modulo==='gas'&&proyectoGasActual().referenciaSigas19?{error:true,bloqueos:['No se pudo ejecutar el cálculo SIGAS. Revisar la disponibilidad del catálogo y los datos técnicos; las cantidades registradas permanecen disponibles.']}:null;}
}
function construirResultadoEjercicioSigasGas(){
 const reg=registroAccesoriosSigasGas();if(!reg||!proyectoGasActual().referenciaSigas19||reg.entradaTecnica.perfil.gas!=='GN'||!revisionMaterialesGas)return null;
 if(cacheResultadoEjercicioSigasGas?.registro===reg)return cacheResultadoEjercicioSigasGas.modelo;
 const entrada=JSON.parse(JSON.stringify(reg.entradaTecnica)),compraBase=prepararCompraActualGas(revisionMaterialesGas.plan),estimacion=compraBase.estimacionCuplas;
 const bloqueos=[],hipotesis=[],cuplas=[];entrada.config.vinculos||={};entrada.config.tees||={};
 entrada.config.inventarioPerdidasCompleto=true;entrada.config.fuenteInventario='Hipótesis explícita del ejercicio: piezas declaradas, conjuntos de tees y uniones estimadas; no certifica el inventario real.';
 hipotesis.push('Inventario cerrado solo para este escenario: no se presuponen otras piezas. Cualquier accesorio real adicional requiere incorporar su equivalencia; no se ha declarado completo el inventario real.');
 for(const t of estimacion.tramos){
  const existentes=entrada.inventario.fisicas.filter(p=>p.tipo==='cupla'&&p.tramos.length===1&&p.tramos[0]===t.id),registradas=existentes.reduce((n,p)=>n+p.cantidad,0),adicional=Math.max(0,t.cantidad-registradas);
  for(const p of existentes)if(!reg.piezas.find(x=>x.id===p.id)?.productoIdentificado)entrada.config.vinculos[p.id]={producto:{confirmado:true,familia:'Unión Normal'}};
  if(adicional){const id='escenario-uniones:'+t.id;entrada.inventario.fisicas.push({id,tipo:'cupla',cantidad:adicional,tramos:[t.id],confirmada:true,identidadesFisicas:Array.from({length:adicional},(_,i)=>id+':'+i)});entrada.config.vinculos[id]={producto:{confirmado:true,familia:'Unión Normal'}};}
  cuplas.push({tramoId:t.id,cantidad:t.cantidad,registradas,estimada:t.orientativo});
 }
 const avisosCuplasSupuestas=new Set(estimacion.tramos.map(t=>'Cuplas de '+(reg.calculo.filas.find(f=>f.id===t.id)?.tramo||t.id)+': segmentos continuos pendientes; largo comercial ya configurado '+compraBase.largoComercial+' m. No se suponen cero uniones.'));
 entrada.inventario.pendientes=entrada.inventario.pendientes.filter(s=>!avisosCuplasSupuestas.has(s));
 hipotesis.push('Cuplas: '+estimacion.total+' uniones normales SIGAS en el escenario, según la estimación comercial por tramo. Su cantidad, tipo y distribución real requieren verificación; no se suponen pérdidas nulas.');
 let vector=reg.calculo.historia.at(-1)?.diametrosExteriorMm||{},escenario=null,estable=false;
 for(let i=0;i<12;i++){
  const temporales=[];
  for(const p of entrada.inventario.fisicas.filter(p=>p.tipo==='tee')){
   const seleccion=entrada.config.tees[p.id]||{},opciones=DimensionamientoSigas.proponerConjuntosTee(SIGAS_ED15_2025,p,entrada.preparacion.recorridos,vector,seleccion),op=opciones.find(o=>o.id===seleccion.conjunto?.opcionId&&o.firma===seleccion.conjunto?.firma)||opciones.find(o=>o.id==='normal-bujes');
   if(!op){temporales.push('No hay conjunto de tee documentado compatible con las vías y medidas actuales en '+(p.nodo?.split(':').at(-1)||'la derivación')+'.');continue;}
   const reutilizadas={};let compatible=true;
   for(const red of op.reducciones){const existentes=entrada.inventario.fisicas.filter(x=>x.tipo==='reduccion'&&x.tramos.includes(red.tramoId));if(existentes.length){const exactas=existentes.filter(x=>x.cantidad===1&&Object.values(entrada.config.vinculos[x.id]?.producto?.productos||{}).includes(red.productoId));if(existentes.length!==1||exactas.length!==1){compatible=false;temporales.push('Reducción ya registrada en una salida: identificar su compatibilidad antes de resolver el conjunto, sin duplicarla.');}else reutilizadas[red.id]=exactas[0].id;}}
   if(compatible)entrada.config.tees[p.id]={...seleccion,conjunto:{version:1,confirmado:true,opcionId:op.id,firma:op.firma,reutilizadas}};
  }
  escenario=simularAccesoriosSigasGas({}, {...reg,entradaTecnica:entrada});const siguiente=escenario.resultado.historia.at(-1)?.diametrosExteriorMm||{};
  if(JSON.stringify(siguiente)===JSON.stringify(vector)){estable=escenario.resultado.convergente;bloqueos.push(...temporales);break;}vector=siguiente;
 }
 if(!estable)bloqueos.push('El escenario no estabilizó todos los diámetros; no se presenta una selección cerrada.');
 const r=escenario.resultado,porTramo=new Map(r.filas.map(f=>[f.id,f.tramo]));
 const nombrePieza=id=>{const p=reg.piezas.find(p=>p.id===id);return p?(p.tipo==='tee'?'Tee '+p.nodo?.split(':').at(-1):p.tipo+' · '+p.tramos.map(id=>porTramo.get(id)||'tramo pendiente').join(', ')):'Accesorio del escenario';};
 for(const ruta of r.recorridos)for(const p of ruta.perdidasPendientes)bloqueos.push(nombrePieza(p.piezaId)+': '+p.motivo);
 bloqueos.push(...entrada.inventario.pendientes.filter(t=>!/^Tee en .*: identificar vía directa\/giro y configuración reductora\.$|^Tipo real de llave pendiente;/.test(t)),...r.errores,...escenario.sinOpcion.map(p=>nombrePieza(p.id)+': '+p.motivo));
 for(const f of r.filas)if(!f.candidato||!f.verificacionConsulta?.cubreConsulta)bloqueos.push(f.tramo+': capacidad tabulada insuficiente o no disponible.');
 if(r.recorridos.some(t=>!t.equivalenteCompleto)&&!bloqueos.length)bloqueos.push('Inventario del escenario incompleto o inconsistente: revisar cantidades e identidades de accesorios antes de cerrar las pérdidas.');
 const limpiar=s=>{let t=String(s);for(const p of reg.piezas)t=t.split(p.id).join(nombrePieza(p.id));for(const [id,n]of porTramo)t=t.split(id).join(n);return t.replace(/presionDisponible/g,'presión disponible').replace(/presionMinima/g,'presión mínima').replace(/perdidaMaxima/g,'pérdida admisible').replace(/tee:nombre:/g,'tee ');};
 const materiales=new Map(),fisicas=new Map();
 for(const ruta of r.recorridos)for(const a of ruta.aportes)if(!fisicas.has(a.piezaId))fisicas.set(a.piezaId,a);
 for(const a of fisicas.values()){const clave=a.tipo+'|'+a.nombre,previa=materiales.get(clave)||{tipo:a.tipo,material:a.nombre,cantidad:0,unidad:'unidad',estado:a.tipo==='cupla'?'Estimación de uniones del escenario':'Pieza del escenario; medidas por verificar'};previa.cantidad+=a.cantidad;materiales.set(clave,previa);}
 for(const p of reg.piezas)if(!fisicas.has(p.id)&&!p.funcion?.startsWith('reduccion-confirmada'))materiales.set('pendiente:'+p.id,{tipo:p.tipo,material:nombrePieza(p.id)+' · producto pendiente',cantidad:p.cantidad,unidad:'unidad',estado:'Cantidad registrada; equivalencia sin resolver'});
 const entradaCompra=entradaManualMaterialesGas(false,true);completarContinuidadCompraGas(entradaCompra);
 const compra=MaterialesGas.prepararCompra(entradaCompra,revisionMaterialesGas.plan,{...opcionesMaterialesGas('proyecto'),cortesCompra:datosPlanGas().cortesCompra||{}},r);compra.estimacionCuplas=MaterialesGas.estimarCuplasCompra(compra);
 const resoluciones=['Recorridos, consumos acumulados y filas de capacidad SIGAS calculados desde los datos del ejercicio.','Tees y bujes compatibles resueltos por escenario, sin confirmar ni duplicar piezas reales.','Variantes terminales normales, válvulas esféricas y codo adicional común: referencias orientativas documentadas.',...hipotesis];
 const validacion=['Confirmar los productos y variantes realmente instalados, incluidas las tees, bujes y uniones.','Verificar cortes, reutilización de sobrantes, continuidad y cantidad exacta de cuplas.','Documentar suministro real: combustible, poder calorífico, densidad, presiones disponible y mínima, y caída admisible.','Verificar aplicabilidad normativa y revisión profesional. No se calculó una pérdida exacta en Pa.'];
 const cortesOrientativos=compra.tramos.map(t=>({tramoId:t.id,piezas:t.segmentos.flatMap(s=>{const n=Math.floor(s.metros/compra.largoComercial),resto=s.metros-n*compra.largoComercial;return [...Array(n).fill(compra.largoComercial),...(resto>1e-9?[resto]:[])];})}));
 const cantidadesDeclaradas=Object.fromEntries(['codo90','tee','llave'].map(tipo=>[tipo,reg.piezas.filter(p=>p.tipo===tipo).reduce((n,p)=>n+p.cantidad,0)]));
 const modelo={simulacion:true,confirmada:false,cantidadesDeclaradas,cortesOrientativos,completo:estable&&bloqueos.length===0&&r.filas.every(f=>f.comprobadoPorTabla),resultado:r,selecciones:escenario.selecciones,cuplas,materiales:[...materiales.values()],compra,memoria:DimensionamientoSigas.memoriaCalculo(r),resoluciones,validacion,bloqueos:[...new Set(bloqueos.map(limpiar))],fuente:'Manual SIGAS ed.15/2025: Tabla 3 pp.24–25; Tabla 4 GN p.22, densidad relativa 0,65 y caída de referencia 10 mmca. PCS 9300 kcal/m³: dato del ejercicio, no valor universal.'};
 cacheResultadoEjercicioSigasGas={registro:reg,modelo};return modelo;
}
function renderResultadoEjercicioSigasGas(out){
 const modelo=resultadoEjercicioSigasGas();if(!modelo)return;
 const caja=document.createElement('section');caja.className='ejercicio-sigas';caja.innerHTML=InformeProyecto.ejercicioSigas(modelo);out.append(caja);
}
