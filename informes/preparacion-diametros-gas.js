/* Preparación técnica y elección de familia: no habilita tablas ni modifica fórmulas. */
function sincronizarFamiliaElegidaGas(id,{desdeRespaldo=false}={}){
 const proyecto=proyectoGasActual(),perfil=instalacionGas.perfil,anterior=CatalogosSistemasGas.identificar(perfil);
 const familias={sigas:['Acero-polietileno SIGAS Thermofusión','Thermofusión'],fusiogas:['Acero-polietileno FUSIOGAS Thermofusión','Thermofusión'],'acero-epoxi-roscado-gn':['Acero con revestimiento epoxi','Roscado']};
 if(!familias[id])return false;
 // Recuperar solo la contradicción conocida entre familias canónicas. Los datos personalizados no se migran por suposición.
 if(desdeRespaldo&&!Object.values(familias).some(([m,u])=>perfil.material===m&&perfil.sistema===u))return false;
 const [material,sistema]=familias[id];
 if(perfil.material===material&&perfil.sistema===sistema)return false;
 const previo={catalogo:anterior,material:perfil.material??null,sistema:perfil.sistema??null};
 const historial=proyecto.historialSistemasGas||=[];
 if(!historial.some(h=>JSON.stringify(h)===JSON.stringify(previo)))historial.push(previo);
 if(tramos.length&&proyecto.planCompra?.opciones?.largoComercial===undefined){
  const largo=estadoLargoComercialGas().configurado;
  if(Number.isFinite(largo)&&largo>0){const o=datosPlanGas().opciones;o.largoComercial=largo;o.fuenteLargoComercial='Valor conservado al cambiar sistema; verificar el producto seleccionado';}
 }
 perfil.material=material;perfil.sistema=sistema;return true;
}
function seleccionarCatalogoSistemaGas(id){
 if(modulo!=='gas'||(id&&!Object.values(CatalogosSistemasGas.IDS).includes(id)))return false;
 const proyecto=proyectoGasActual(),perfil=instalacionGas.perfil;
 if(id&&!tramos.length&&!artefactos.length&&!proyecto.planCompra?.revisiones?.proyecto)perfil.largosDocumentados2026=true;
 if(id){sincronizarFamiliaElegidaGas(id);$('redMaterial').value=perfil.material;$('redSistema').value=perfil.sistema;}
 perfil.catalogoTecnicoGas=id;
 guardarDatos();sincronizarSistemaPrincipalGas();renderTramos();try{mostrarPreparacionDiametrosGas();}catch(e){$('estadoCatalogoSistemaGas').textContent='Selección conservada. Diagnóstico técnico pendiente: '+e.message;}renderResumenPrincipalGas();
 const guardado=proyectoGuardadoGas()?.instalacion?.perfil?.catalogoTecnicoGas;
 $('estadoCatalogoSistemaGas').textContent=(id?'Selección conservada para este proyecto.':'Sin selección; los datos de material y unión se conservaron.')+(guardado!==instalacionGas.perfil.catalogoTecnicoGas?' Guardado local no confirmado: conservá un respaldo.':'')+' Los diámetros siguen pendientes de verificación.';
 return true;
}
function inventarioAccesoriosParaMotorGas(red){
 // La tubería de materiales ya resuelve carga rápida/detalle/sugerencias. Reutilizarla sin persistir ni modificar sus opciones.
 const p=proyectoGasActual(),tenia=Object.hasOwn(p,'planCompra'),original=p.planCompra;
 p.planCompra=original?JSON.parse(JSON.stringify(original)):{};
 try{
  const entrada=entradaManualMaterialesGas(false,true);
  const inventario=CatalogosSistemasGas.prepararAccesorios(piezasConciliacionGas(entrada),red,entrada.tramos.map(t=>({...t,desde:tramos.find(o=>o.id===t.id)?.desde||'',hasta:tramos.find(o=>o.id===t.id)?.hasta||''})),entrada.manualDirecto?.ceros||[],entrada.manualDirecto?.pendientes||[],opcionesMaterialesGas('proyecto'));
  // La aclaración del propietario ubica el adicional, sin identificar su producto ni tocar materiales.
  const extra=p.planCompra?.extras?.find(e=>e.idFisico==='referencia-codo19');
  const adicional=inventario.fisicas.find(f=>f.id==='referencia-codo19');
  if(p.referenciaSigas19===true&&adicional&&extra?.ubicacion==='Codo 19 del ejercicio · ubicación técnica por verificar'&&tramos.some(t=>t.id==='ref-B-Cocina'))adicional.tramos=['ref-B-Cocina'];
  for(const pieza of inventario.fisicas)if(pieza.tipo==='tee'&&pieza.nodo){
   const nodo=red.puntos.find(n=>n.id===pieza.nodo||String(n.nombre).trim().toLocaleLowerCase('es')===String(pieza.nodo).trim().toLocaleLowerCase('es'));
   if(nodo)pieza.conexionesDiametro=Object.entries(red.orientacion).filter(([,o])=>o.desde===nodo.id||o.hasta===nodo.id).map(([id])=>id);
  }
  if(inventario.fisicas.filter(f=>f.tipo==='codo90').every(f=>f.tramos.length||tramos.some(t=>t.id===p.calculoSigas?.vinculos?.[f.id]?.tramoAplicacion)))inventario.pendientes=inventario.pendientes.filter(s=>s!=='Ubicación técnica pendiente de codo90; se conserva la cantidad conocida.');
  return inventario;
 }finally{if(tenia)p.planCompra=original;else delete p.planCompra;}
}
function mostrarPreparacionDiametrosGas(){
 if(modulo!=='gas')return null;
 const out=$('preparacionDiametrosGas');out.replaceChildren();renderPreseleccionSigasGas(out);
 const texto=(s,padre=out)=>{const p=document.createElement('p');p.textContent=s;padre.append(p);};
 const redActual=redFisicaManualGas(),r=PreparacionDiametrosGas.prepararRed(redActual,tramos,perfilTecnicoActualGas());
 const catalogo=CatalogosSistemasGas.obtener(CatalogosSistemasGas.identificar(instalacionGas.perfil),TABLA_NAG200_3,TABLA_NAG200_18,SIGAS_ED15_2025,FUSIOGAS_V1_2026);
 $('catalogoSistemaGas').value=catalogo.id||'';
 $('estadoCatalogoSistemaGas').textContent='Catálogo: '+catalogo.nombre+'. Sin diámetros habilitados.';
 let accesorios;try{accesorios=inventarioAccesoriosParaMotorGas(redActual);}catch(e){accesorios={fisicas:[],ceros:[],pendientes:['No se pudo preparar el inventario técnico: '+e.message]};}
 const inventario=catalogo.id===CatalogosSistemasGas.IDS.epoxi?PreparacionDiametrosGas.inventario(catalogo.tablas[0],catalogo.tablas[1],ValidacionTablasGas.validarTablas):catalogo.id===CatalogosSistemasGas.IDS.sigas?{tablas:catalogo.tablas.map(t=>({numero:t.numero,tipoConteo:t.numero===3?'accesorios':'valores',valores:t.numero===3?t.filas.length:t.numero===6?t.filas.reduce((n,f)=>n+f.diametrosMm.filter(x=>x!==null).length,0):t.filas.length*9,archivo:SIGAS_ED15_2025.fuente.archivo+' · '+(t.paginas?'pp.'+t.paginas.join('–'):'p.'+t.pagina),edicion:SIGAS_ED15_2025.fuente.edicion})),errores:[],pendientes:[],otrosSistemas:'Tablas SIGAS del manual identificado; sin equivalencias ni interiores de acero epoxi.'}:catalogo.id==='fusiogas'?{tablas:[...Object.values(FUSIOGAS_V1_2026.tablas).map(t=>({numero:t.gas,tipoConteo:'capacidades',valores:360,archivo:FUSIOGAS_V1_2026.fuente.archivo+' p.'+t.pagina,edicion:'V.1.2026'})),{numero:'equivalencias',tipoConteo:'registros',valores:88,archivo:FUSIOGAS_V1_2026.fuente.archivo+' p.18',edicion:'V.1.2026'}],errores:FusiogasTecnico.validar(FUSIOGAS_V1_2026).errores,pendientes:[],otrosSistemas:'Catálogo FUSIOGAS independiente; no usa tablas de otros fabricantes.'}:{tablas:[],errores:[],pendientes:[],otrosSistemas:'Las tablas de acero epoxi y SIGAS se mantienen separadas. No hay reemplazos automáticos.'};
 if(catalogo.id==='fusiogas'){const dimensionamientoFusiogas=dimensionamientoFusiogasActualGas();renderResultadoFusiogasGas(out);return {red:r,inventario,catalogo,accesorios,diagnosticoSigas:null,diagnosticoFusiogas:FusiogasTecnico.diagnostico(FUSIOGAS_V1_2026,r,accesorios,perfilTecnicoActualGas()),dimensionamientoFusiogas};}
 let diagnosticoSigas=null;
 if(catalogo.id===CatalogosSistemasGas.IDS.sigas){
  diagnosticoSigas=SigasTecnico.diagnostico(SIGAS_ED15_2025,r,accesorios,perfilTecnicoActualGas());
  const paquete=SigasTecnico.adaptador(SIGAS_ED15_2025,perfilTecnicoActualGas().gas);
  const preparada=SigasTecnico.prepararEntradaMotor(redActual,tramos,artefactos,{...instalacionGas,perfil:perfilTecnicoActualGas()});
  diagnosticoSigas.entradaMotor=preparada;
  diagnosticoSigas.pendientes.push(...preparada.faltantes);
  diagnosticoSigas.motor=preparada.entrada?motorDimensionarGas(preparada.entrada.tramos,preparada.entrada.artefactos,preparada.entrada.instalacion,paquete):{estado:'bloqueado',diametros:null,faltantes:preparada.faltantes};
 }
 const diagnosticoFusiogas=catalogo.id==='fusiogas'?FusiogasTecnico.diagnostico(FUSIOGAS_V1_2026,r,accesorios,perfilTecnicoActualGas()):null;
 const fuenteActual=proyectoGasActual().derivadosGas,firma=JSON.stringify({tramos,artefactos,instalacion:instalacionGas,tipoGas:$('gt').value});
 const medidas=CatalogosSistemasGas.resultadoPorTramo(tramos,fuenteActual?.dimensionamiento,firma,fuenteActual?.firma,{catalogoHabilitado:catalogo.habilitado,verificacionTecnica:false});
 texto('Material seleccionado: '+(instalacionGas.perfil.material||'Pendiente')+' · sistema: '+(instalacionGas.perfil.sistema||'Pendiente')+' · gas: '+(instalacionGas.perfil.gas||'Pendiente')+'.');
 texto('DIÁMETROS PENDIENTES · Los materiales y los consumos conocidos se pueden seguir calculando. No necesitás volver a cargar accesorios.');
 for(const t of r.porTramo)texto(t.nombre+' · real '+t.longitudReal+' m · consumo '+(t.consumoKcal===null?'Pendiente':t.consumoKcal+' kcal/h')+' · caudal '+(t.caudal===null?'Pendiente':t.caudal.toLocaleString('es-AR',{maximumFractionDigits:4})+' m³/h')+' · diámetro '+(medidas.find(m=>m.tramo===t.nombre)?.diametro||'Pendiente'));
 for(const recorrido of r.recorridos)texto('Recorrido a '+recorrido.artefacto+': '+recorrido.longitudReal+' m reales. Equivalente y longitud definitiva: Pendiente.');
 const detalles=document.createElement('details'),resumen=document.createElement('summary');resumen.textContent='Datos técnicos pendientes y tablas disponibles';detalles.append(resumen);out.append(detalles);
 texto('Catálogo seleccionado: '+catalogo.nombre+(catalogo.origenConfirmadoPorPropietario?' · origen confirmado por el propietario; verificación técnica pendiente.':'.'),detalles);
 texto('Accesorios: se reutilizan '+accesorios.fisicas.reduce((s,a)=>s+a.cantidad,0)+' piezas identificadas. Esta preparación no añade otra lista de compra ni asigna equivalentes.',detalles);
 if(diagnosticoSigas){
  texto('SIGAS: manual original ed.15, julio 2025, 48 páginas. Tablas 6 (p.21), 4 GN (p.22), 5 propano gaseoso (p.23) y 3 accesorios (pp.24–25).',detalles);
  const numeroTabla=diagnosticoSigas.filas.find(f=>f.tabla)?.tabla;if(numeroTabla){const t=SIGAS_ED15_2025.tablas[numeroTabla];texto('Consulta documental '+t.gas+' · densidad tabulada '+t.densidadRelativa+' · caída impresa 10 mm. No es la presión de suministro del proyecto.',detalles);}
  for(const f of diagnosticoSigas.filas){
   texto(f.tramo+' · Tabla '+(f.tabla||'Pendiente')+' / p.'+(f.pagina||'Pendiente')+' · ruta real máxima '+(f.longitudRealRutaMaxM??'Pendiente')+' m · equivalentes y diámetro definitivo Pendiente.',detalles);
   if(f.consultas.length){const dd=document.createElement('details'),ss=document.createElement('summary');ss.textContent='Consultas por diámetro de '+f.tramo+' (sin pérdidas de accesorios)';dd.append(ss);detalles.append(dd);for(const c of f.consultas)texto('Exterior '+c.exteriorMm+' mm / interior tabulado '+c.interiorTabuladoMm+' mm · fila '+c.longitudFilaM+' m · capacidad '+c.capacidadM3h+' m³/h. '+(c.cubreSoloConsulta?'Cubre solo el caudal consultado; pérdidas pendientes.':'No cubre el caudal consultado.'),dd);}
  }
 }
 if(diagnosticoFusiogas){texto('FUSIOGAS V.1.2026: GN p.19, GLP p.20 (m³/h), equivalencias p.18 (m), catálogo pp.28–30. Caída impresa 10 mm; no es presión de suministro.',detalles);for(const f of diagnosticoFusiogas.filas)texto(f.tramo+' · '+(f.tabla||'Tabla pendiente')+' / p.'+(f.pagina||'Pendiente')+' · recorrido real máximo '+(f.longitudRealRutaMaxM??'Pendiente')+' m · diámetro Pendiente. Consultas documentales: '+f.consultas.length+'.',detalles);}
 for(const t of inventario.tablas)texto('Tabla '+t.numero+': '+t.valores+' '+(t.tipoConteo||'valores')+' transcritos · fuente '+(t.archivo||'Pendiente')+' · edición '+(t.edicion||'Pendiente')+' · aplicabilidad no habilitada.',detalles);
 texto(inventario.otrosSistemas,detalles);
 for(const s of [...new Set([...r.errores,...r.pendientes,...inventario.errores,...inventario.pendientes,...catalogo.pendientes,...CatalogosSistemasGas.compatibilidad(perfilTecnicoActualGas(),catalogo),...accesorios.pendientes.map(s=>['sigas','fusiogas'].includes(catalogo.id)&&s.startsWith('Reducción:')?'Reducciones del sistema seleccionado: identificar producto exacto y su equivalente; no se aplica automáticamente la exclusión del método epoxi.':s),...(diagnosticoSigas?.pendientes||[]),...(diagnosticoFusiogas?.pendientes||[]),...combustibleTecnicoGas().pendientes])])texto(s,detalles);
 if(catalogo.id===CatalogosSistemasGas.IDS.epoxi)texto('Las fotos están conservadas; falta documentar edición y vigencia, fabricante/interiores reales, compatibilidad del sistema, condiciones de suministro y validación independiente. No basta con que pasen las pruebas automáticas.',detalles);
 return {red:r,inventario,catalogo,accesorios,medidas,diagnosticoSigas,diagnosticoFusiogas};
}

// Adaptador de hechos físicos compartidos, sin importar productos/equivalencias SIGAS.
function dimensionamientoFusiogasActualGas(){
 if(modulo!=='gas'||CatalogosSistemasGas.identificar(instalacionGas.perfil)!=='fusiogas')return null;
 const red=redFisicaManualGas(),perfil=perfilTecnicoActualGas(),p=proyectoGasActual(),fisicos=p.calculoSigas||{};
 const config={terminales:{},tees:{}};
 for(const [id,a]of Object.entries(fisicos.terminales||{}))config.terminales[id]={rosca:a.rosca,sexo:a.sexo,geometria:a.geometria};
 for(const [id,a]of Object.entries(fisicos.tees||{}))config.tees[id]={viasPorTramo:{...a.viasPorTramo}};
 return FusiogasTecnico.dimensionar(FUSIOGAS_V1_2026,{red,perfil,config,preparacion:PreparacionDiametrosGas.prepararRed(red,tramos,perfil),inventario:inventarioAccesoriosParaMotorGas(red)});
}
function renderResultadoFusiogasGas(out){
 const r=dimensionamientoFusiogasActualGas();if(!r)return;
 const caja=document.createElement('section');caja.className='resultado-fusiogas';
 caja.innerHTML=InformeProyecto.fusiogas(alcanceRectasSalidaFusiogasGas(r));out.append(caja);
 renderConexionesFusiogasGas(caja);
 if(!r.pcs){const b=document.createElement('button');b.textContent='Completar PCS y fuente';b.className='alt solo-pantalla';b.onclick=()=>{mostrarVista('dimensionGas');const campo=$('dimPCS');for(let n=campo?.parentElement;n;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true;campo?.focus();};caja.append(b);}
}

function renderConexionesFusiogasGas(caja){
 const p=proyectoGasActual(),r=dimensionamientoFusiogasActualGas();if(!r)return;
 const d=document.createElement('details'),s=document.createElement('summary');s.textContent='Conexiones físicas · completar solo los datos conocidos';d.append(s);
 const terminales=destinosRectasSalidaGas();
 for(const {nombre,id} of terminales){const a=p.calculoSigas?.terminales?.[id]||{},l=document.createElement('label'),sel=document.createElement('select');l.textContent=nombre+' · rosca (pulgadas, independiente del diámetro de fusión)';sel.ariaLabel=l.textContent;sel.dataset&&(sel.dataset.terminalRosca=id);
 const medidas=[...new Set(FUSIOGAS_V1_2026.productos.filter(x=>/Transición|Codo 90° rosca/.test(x.familia)).map(x=>x.medidaOriginal.split('x').at(-1).replace(/[”″]/g,'')))];
 for(const v of ['',...medidas]){const o=document.createElement('option');o.value=v;o.textContent=v?v+'″':'Pendiente';sel.append(o);}sel.value=a.rosca||'';sel.onchange=()=>guardarConexionFisicaFusiogasGas(id,'rosca',sel.value);l.append(sel);d.append(l);
 }
 caja.append(d);
}
function guardarConexionFisicaFusiogasGas(id,campo,valor){
 if(CatalogosSistemasGas.identificar(instalacionGas.perfil)!=='fusiogas'||campo!=='rosca'||typeof valor!=='string')return false;
 const r=dimensionamientoFusiogasActualGas(),permitidos=['terminal-medidor',...r.recorridos.map(x=>'terminal-'+x.artefacto)];if(!permitidos.includes(id))return false;
 const medidas=FUSIOGAS_V1_2026.productos.filter(x=>/Transición|Codo 90° rosca/.test(x.familia)).map(x=>x.medidaOriginal.split('x').at(-1).replace(/[”″]/g,''));if(valor&&!medidas.includes(valor))return false;
 const c=proyectoGasActual().calculoSigas||={version:1,vinculos:{}};c.terminales||={};c.terminales[id]||={};c.terminales[id].rosca=valor;
 const desplazamiento=window.scrollY;guardarDatos();calcularMaterialesManualGas();if(Number.isFinite(desplazamiento))window.scrollTo({top:desplazamiento,behavior:'instant'});return true;
}

// Registro físico independiente. Nunca se pasa a conteosRapidosGas ni al planificador de cuplas.
function destinosRectasSalidaGas(){
 if(modulo!=='gas')return [];
 const red=redFisicaManualGas(),out=[],orientacion=Object.entries(red.orientacion),entradas=new Set(orientacion.map(([,o])=>o.hasta)),raices=[...new Set(orientacion.map(([,o])=>o.desde))].filter(id=>!entradas.has(id));
 // La orientación existente parte de un medidor formal o M. No convierte hojas abiertas en artefactos.
 if(red.errores.length)return out;
 if(raices.length===1){const n=red.puntos.find(n=>n.id===raices[0]),ids=orientacion.filter(([,o])=>o.desde===n?.id).map(([id])=>id);if(ids.length===1&&(n.tipo==='medidor'||nombrePuntoManualGas(n.nombre)==='m'))out.push({id:'terminal-medidor',tramo:ids[0],nombre:'Medidor',puntoId:n.id});}
 for(const [id,o]of orientacion){if(orientacion.some(([,v])=>v.desde===o.hasta))continue;const t=tramos.find(t=>t.id===id),n=red.puntos.find(n=>n.id===o.hasta);if(!t||!n)continue;
  const normal=v=>nombrePuntoManualGas(v).normalize('NFD').replace(/[\u0300-\u036f]/g,''),tipo=t.artefacto||reconocerDestinoArtefactoGas(n.nombre).tipo||n.nombre;
  const candidatos=n.artefactoId?artefactos.filter(a=>a.id===n.artefactoId):artefactos.filter(a=>normal(a.nombre)===normal(tipo)||!t.artefacto&&normal(a.nombre)===normal(n.nombre));
  // Respaldo anterior: artefacto y consumo pueden estar registrados expresamente en el propio tramo.
  const legado=!n.artefactoId&&!candidatos.length&&t.artefacto&&Number.isFinite(t.consumo)&&t.consumo>0;if(candidatos.length!==1&&!legado)continue;const art=legado?{nombre:t.artefacto,id:null}:candidatos[0];if(orientacion.filter(([,v])=>red.puntos.find(p=>p.id===v.hasta)?.artefactoId===art.id&&art.id).length>1)continue;
  out.push({id:'terminal-'+n.nombre,tramo:id,nombre:art.identificacion?art.nombre+' · '+art.identificacion:n.nombre,artefactoId:art.id||null,puntoId:n.id});
 }
 return out;
}
// Solo referencias a puntos que ya forman parte del tramo; nunca crea nodos ni geometría de corte.
function puntosEspecialesRectasSalidaGas(tramo){
 const t=tramos.find(t=>t.id===tramo);if(!t)return [];
 const red=redFisicaManualGas(),o=red.orientacion[tramo],terminales=new Set(destinosRectasSalidaGas().filter(n=>n.tramo===tramo).map(n=>n.puntoId)),ids=new Set([o?.desde,o?.hasta,...(t.detalle?.accesorios||[]).map(a=>a.nodo&&red.puntos.find(n=>n.id===a.nodo||n.id==='id:'+a.nodo||nombrePuntoManualGas(n.nombre)===nombrePuntoManualGas(a.nodo))?.id)]);
 return red.puntos.filter(n=>ids.has(n.id)&&!terminales.has(n.id)&&instalacionGas.nodos.some(p=>'id:'+p.id===n.id)).map(n=>({id:'punto:'+n.id,puntoId:n.id,nombre:n.nombre}));
}
function conexionesRectasAnterioresGas(tramo){
 const out=[],p=proyectoGasActual();for(const n of destinosRectasSalidaGas().filter(n=>n.tramo===tramo)){
  const a=p.calculoSigas?.terminales?.[n.id];if(a?.geometria==='recta'||a?.adaptacionRoscada?.registrada)out.push({id:n.id+'::recta',vinculoFisicoId:n.id+'::recta',terminalId:n.id,ubicacion:n.id,nombreUbicacion:n.nombre,anterior:true});
 }
 for(const [indice,a] of (p.planCompra?.extras||[]).entries())if(a.confirmado===true&&/transici[oó]n|conexi[oó]n recta/i.test(a.tipo||'')&&(a.tramo===tramo||a.ubicacion===tramo||String(a.ubicacion||'').startsWith(tramo+' · ')))for(let i=0;i<Math.min(200,Number(a.cantidad)||0);i++){const id=String(a.idFisico||'recta-anterior-'+tramo+'-'+indice)+(a.cantidad>1?'::'+i:'');if(!out.some(u=>u.vinculoFisicoId===id))out.push({id,vinculoFisicoId:id,ubicacion:'anterior',nombreUbicacion:a.ubicacion,anterior:true});}
 return out;
}
function registroRectasSalidaGas(tramo){
 const t=tramos.find(t=>t.id===tramo);if(!t)return null;
 const previo=proyectoGasActual().conexionesRectasSalidaGas?.porTramo?.[tramo],legadas=conexionesRectasAnterioresGas(tramo),cantidad=previo?previo.cantidad:legadas.length||null,guardadas=(previo?.unidades||[]).map(u=>({...u})),unidades=guardadas.filter(u=>u.ubicacion||u.terminalId||u.vinculoFisicoId||Number.isSafeInteger(cantidad)&&cantidad>0),destinos=destinosRectasSalidaGas().filter(n=>n.tramo===tramo),especiales=puntosEspecialesRectasSalidaGas(tramo);
 for(const u of unidades)if(u.asociacion==='deducida'&&!u.vinculoFisicoId){delete u.terminalId;u.ubicacion='';delete u.nombreUbicacion;delete u.asociacion;}
 const disponibles=destinos.filter(n=>!unidades.some(u=>u.terminalId===n.id)),libres=unidades.filter(u=>!u.ubicacion&&!u.terminalId&&!u.vinculoFisicoId);
 if(unidades.length===1&&libres.length===1&&disponibles.length===1&&!especiales.length&&libres[0].asociacion!=='manual')Object.assign(libres[0],{ubicacion:disponibles[0].id,terminalId:disponibles[0].id,nombreUbicacion:disponibles[0].nombre,puntoId:disponibles[0].puntoId,asociacion:'deducida'});
 for(const l of legadas){const u=unidades.find(u=>u.vinculoFisicoId===l.vinculoFisicoId||u.terminalId&&u.terminalId===l.terminalId);if(u)Object.assign(u,{vinculoFisicoId:l.vinculoFisicoId,anterior:true,asociacion:u.asociacion==='deducida'?'vinculada':u.asociacion});else unidades.push(l);}
 const conflicto=Number.isSafeInteger(cantidad)&&unidades.length!==cantidad;
 return {tramo,nombre:t.desde+'–'+t.hasta,cantidad,unidades,explicito:!!previo,conflicto};
}
function guardarCantidadRectasSalidaGas(tramo,valor){
 if(modulo!=='gas')return {ok:false};const r=registroRectasSalidaGas(tramo);if(!r)return {ok:false,mensaje:'Primero guardá un tramo válido.'};
 const s=String(valor??'').trim();if(s&&!/^\d+$/.test(s)||s&&Number(s)>200)return {ok:false,mensaje:'Conexiones rectas de salida: usá una cantidad entera entre 0 y 200; vacío sigue pendiente.'};
 const cantidad=s===''?null:Number(s);let unidades=r.unidades.map(u=>({...u}));if(cantidad!==null){if(cantidad<unidades.length){const actuales=conexionesRectasAnterioresGas(tramo),vinculadas=unidades.filter(u=>!u.terminalId&&(u.ubicacion||u.vinculoFisicoId)||actuales.some(a=>a.terminalId===u.terminalId));unidades=[...vinculadas,...unidades.filter(u=>!vinculadas.includes(u)).slice(0,Math.max(0,cantidad-vinculadas.length))];}while(unidades.length<cantidad)unidades.push({id:idGas('recta-salida'),ubicacion:''});}
 const p=proyectoGasActual();p.conexionesRectasSalidaGas||={version:1,porTramo:{}};p.conexionesRectasSalidaGas.porTramo[tramo]={cantidad,unidades};guardarDatos();const guardada=JSON.stringify(proyectoGuardadoGas()?.conexionesRectasSalidaGas?.porTramo?.[tramo])===JSON.stringify(p.conexionesRectasSalidaGas.porTramo[tramo]);return {ok:true,guardada,mensaje:guardada?'Conexiones declaradas y guardadas.':'Conexiones solo en esta sesión; no pudieron guardarse.'};
}
function guardarUbicacionRectaSalidaGas(tramo,id,ubicacion,datos={}){
 const r=registroRectasSalidaGas(tramo),u=r?.unidades.find(u=>u.id===id);if(!u)return {ok:false,mensaje:'La conexión cambió; revisá su cantidad.'};
 const destino=destinosRectasSalidaGas().find(n=>n.tramo===tramo&&n.id===ubicacion);const especial=puntosEspecialesRectasSalidaGas(tramo).find(n=>n.id===ubicacion);if(!['','inicio','fin','interior','anterior'].includes(ubicacion)&&!destino&&!especial)return {ok:false,mensaje:'Ese destino no pertenece a este tramo.'};
 if(u.anterior&&ubicacion!==u.ubicacion&&ubicacion!==u.terminalId)return {ok:false,mensaje:'Esta pieza ya está vinculada a un registro anterior. Corregí su conexión original; no se creó otra.'};
 if(destino&&r.unidades.some(v=>v.id!==id&&v.terminalId===destino.id))return {ok:false,mensaje:'Ese destino ya tiene una conexión declarada; no se duplicó.'};
 Object.assign(u,{ubicacion,terminalId:destino?.id||null,nombreUbicacion:destino?.nombre||especial?.nombre||null,puntoId:destino?.puntoId||especial?.puntoId||null,asociacion:'manual'});for(const k of ['punto','rosca','sexo','identificacion','fuente'])if(Object.hasOwn(datos,k))u[k]=String(datos[k]??'').trim();
 const p=proyectoGasActual();p.conexionesRectasSalidaGas||={version:1,porTramo:{}};p.conexionesRectasSalidaGas.porTramo[tramo]={cantidad:r.cantidad,unidades:r.unidades};guardarDatos();return {ok:true};
}
function informeRectasSalidaGas(modelo=null){
 if(modulo!=='gas')return {registros:[],pendientes:[],adicionales:[]};
 const proyecto=proyectoGasActual();if(!Object.keys(proyecto.conexionesRectasSalidaGas?.porTramo||{}).length&&!Object.values(proyecto.calculoSigas?.terminales||{}).some(a=>a.geometria==='recta'||a.adaptacionRoscada?.registrada)&&!(proyecto.planCompra?.extras||[]).some(a=>a.confirmado===true&&/transici[oó]n|conexi[oó]n recta/i.test(a.tipo||'')))return {registros:[],pendientes:[],adicionales:[]};const sistema=CatalogosSistemasGas.identificar(instalacionGas.perfil),registros=[],pendientes=[],adicionales=[];
 for(const t of tramos){const r=registroRectasSalidaGas(t.id);if(!r.explicito&&!r.unidades.length)continue;if(r.conflicto)pendientes.push(r.nombre+': cantidad declarada de conexiones rectas incompatible con las piezas vinculadas; revisá el tramo sin duplicarlas.');
  if(r.explicito&&r.cantidad===null)pendientes.push(r.nombre+': cantidad de conexiones rectas sin confirmar; no se convirtió en cero.');
  for(const u of r.unidades){const a=u.terminalId&&proyectoGasActual().calculoSigas?.terminales?.[u.terminalId],fila=a?.confirmacionConexion?.confirmada&&SIGAS_ED15_2025.tablas[3].filas.find(f=>f.id===a.confirmacionConexion.productoId),D=modelo?.resultado?.filas.find(f=>f.id===t.id)?.candidato?.exteriorMm||(r.explicito&&sistema==='sigas'?registroAccesoriosSigasGas()?.calculo.filas.find(f=>f.id===t.id)?.candidato?.exteriorMm:sistema==='fusiogas'?dimensionamientoFusiogasActualGas()?.filas.find(f=>f.id===t.id)?.diametroCandidatoMm:null);
   let estado='Pendiente',motivo='',producto='Conexión recta de salida · producto por identificar';const cubierta=sistema==='sigas'&&(u.terminalId?!!(a?.geometria==='recta'||a?.adaptacionRoscada?.registrada):u.anterior)||sistema==='fusiogas'&&a?.geometria==='recta'&&dimensionamientoFusiogasActualGas()?.piezas.some(p=>p.identidad===u.terminalId);
   if(!u.ubicacion)motivo='Identificar ubicación o destino.';
   else if(u.terminalId&&!destinosRectasSalidaGas().some(n=>n.id===u.terminalId&&n.tramo===t.id))motivo='La ubicación guardada ya no corresponde a un terminal identificado de este tramo. Revisá el punto real sin duplicar piezas.';
   else if(sistema==='sigas'&&u.terminalId==='terminal-medidor'&&conflictoRectaMedidorSigasGas())motivo='Conflicto: conexión recta declarada y codo asignado al mismo medidor. Resolver expresamente sin cambiar cantidades.';
   else if(sistema==='sigas'&&a?.adaptacionRoscada?.registrada){producto='Conexión SIGAS del conjunto terminal';motivo='Adaptación declarada: compatibilidad y pérdida de la reducción roscada pendientes.';}
   else if(u.terminalId&&sistema==='sigas'&&a?.geometria==='recta'&&fila&&registroAccesoriosSigasGas()?.piezas.some(p=>p.necesidadTerminal===u.terminalId&&p.productoConfirmado?.id===fila.id)&&(!D||D===a.confirmacionConexion.diametroMm)){estado='Identificada';producto=fila.nombreOriginal;motivo='Pieza vinculada al registro existente; no sumar nuevamente.';}
   else if(u.terminalId&&sistema==='fusiogas'&&a?.geometria==='recta'&&opcionesRectasSalidaFusiogasGas(t.id,u.id).some(p=>p.codigo===a.identificacionRectaFusiogas?.codigo&&p.familia.toLowerCase().includes(a.sexo))){estado='Identificada para escenario';producto=a.identificacionRectaFusiogas.nombre;motivo='Producto FUSIOGAS propio; suministro y validación real pendientes.';}
   else if(u.terminalId&&sistema!=='acero-epoxi-roscado-gn')motivo=pendientesConexionSalidaGas(u.terminalId,D).join(' ');
   else motivo=u.ubicacion==='interior'?'Conexión interior declarada: identificación técnica y pérdidas pendientes; no integrada al cálculo ni a la geometría de cortes.':'Falta producto y equivalencia documentada aplicable al sistema seleccionado.';
   const dato={...u,diametroMm:D||null,tramo:t.id,tramoNombre:r.nombre,ubicacionNombre:u.nombreUbicacion||({inicio:t.desde,fin:t.hasta,interior:u.punto||'Punto interior pendiente',anterior:u.nombreUbicacion||'Registro anterior'})[u.ubicacion]||'Pendiente',rosca:a?.rosca||u.rosca||null,producto,estado,motivo,cubierta,cantidad:1};registros.push(dato);if(!cubierta)adicionales.push(dato);if(r.explicito&&!estado.startsWith('Identificada'))pendientes.push(r.nombre+' · conexión recta '+(r.unidades.indexOf(u)+1)+': '+motivo);
  }
 }
 return {registros,adicionales,pendientes:[...new Set(pendientes)]};
}
function alcanceRectasSalidaSigasGas(modelo){
 if(!modelo||modelo.error)return modelo;const informe=informeRectasSalidaGas(modelo);if(!informe.pendientes.length)return modelo;
 const piezasPendientes=new Set(informe.registros.filter(u=>u.estado==='Pendiente').map(u=>u.tramo)),afectados=new Set(modelo.resultado.recorridos.filter(r=>r.tramos.some(id=>piezasPendientes.has(id))).flatMap(r=>r.tramos));return {...modelo,completo:false,comprobacionRealPorTramo:Object.fromEntries(Object.entries(modelo.comprobacionRealPorTramo||{}).filter(([id])=>!afectados.has(id))),memoria:modelo.memoria.map(f=>afectados.has(f.id||modelo.resultado.filas.find(x=>x.tramo===f.tramo)?.id)?{...f,diametroVerificadoMm:null}:f),bloqueos:[...new Set([...(modelo.bloqueos||[]),...informe.pendientes])],resultado:{...modelo.resultado,filas:modelo.resultado.filas.map(f=>afectados.has(f.id)?{...f,comprobadoPorTabla:false}:f),recorridos:modelo.resultado.recorridos.map(r=>r.tramos.some(id=>afectados.has(id))?{...r,equivalenteCompleto:false,longitudDefinitivaM:null}:r)}};
}
function opcionesRectasSalidaFusiogasGas(tramo,id){
 if(CatalogosSistemasGas.identificar(instalacionGas.perfil)!=='fusiogas')return [];
 const u=registroRectasSalidaGas(tramo)?.unidades.find(u=>u.id===id),a=u?.terminalId&&proyectoGasActual().calculoSigas?.terminales?.[u.terminalId],r=dimensionamientoFusiogasActualGas(),D=r?.filas.find(f=>f.id===tramo)?.diametroCandidatoMm;
 return a?.rosca&&D?FUSIOGAS_V1_2026.productos.filter(p=>{const m=p.medidaOriginal.replace(/[\s”″"]/g,'').split('x');return /^Transición (hembra|macho)$/.test(p.familia)&&Number(m[0])===D&&m[1]===a.rosca;}):[];
}
function identificarRectaSalidaFusiogasGas(tramo,id,codigo){
 const p=opcionesRectasSalidaFusiogasGas(tramo,id).find(p=>p.codigo===codigo);if(!p)return false;
 const u=registroRectasSalidaGas(tramo).unidades.find(u=>u.id===id),a=proyectoGasActual().calculoSigas.terminales[u.terminalId];
 Object.assign(a,{geometria:'recta',sexo:p.familia.includes('hembra')?'hembra':'macho',identificacionRectaFusiogas:{codigo,nombre:p.familia+' '+p.medidaOriginal}});guardarDatos();calcularMaterialesManualGas();return true;
}
// Alcance de presentación: no altera el resultado numérico del motor FUSIOGAS.
function alcanceRectasSalidaFusiogasGas(r,informe=informeRectasSalidaGas()){
 if(!r||!informe.pendientes.length)return r;
 const tramosPendientes=new Set(informe.registros.filter(u=>u.estado==='Pendiente').map(u=>u.tramo)),afectados=new Set(r.recorridos.filter(x=>x.tramos.some(id=>tramosPendientes.has(id))).flatMap(x=>x.tramos));
 return {...r,completo:false,filas:r.filas.map(f=>afectados.has(f.id)?{...f,estado:'Parcial · conexión recta pendiente'}:f),recorridos:r.recorridos.map(x=>x.tramos.some(id=>afectados.has(id))?{...x,completo:false}:x),pendientes:[...r.pendientes,...informe.pendientes.map(texto=>({grupo:'calculo',texto}))]};
}

function pendientesConexionSalidaGas(terminalId,D){
 const destino=destinosRectasSalidaGas().find(n=>n.id===terminalId),a=proyectoGasActual().calculoSigas?.terminales?.[terminalId]||{},faltas=[],perfil=perfilTecnicoActualGas(),red=redFisicaManualGas();
 if(!destino)return ['La ubicación guardada no corresponde a un terminal identificado: revisá el punto o las conexiones del tramo.'];
 if(!a.rosca)faltas.push('Falta la medida de rosca real; completala aquí, aunque el diámetro esté pendiente.');
 if(!D){if(!artefactos.length)faltas.push('Faltan artefactos y consumos: cargalos en el paso 3 y vinculalos a los tramos del paso 4.');else if(red.faltantes.length)faltas.push('Faltan consumos o vínculos con los artefactos: revisá los pasos 3 y 4.');if(!(numeroDecimalGas(perfil.poderCalorifico)>0)||!String(perfil.fuenteGas||'').trim())faltas.push('Falta PCS válido o su fuente: completalos en Proyecto y sistema.');if(red.errores.length)faltas.push('Falta resolver las conexiones de la red en Tramos y accesorios.');faltas.push('Diámetro calculado pendiente; no se puede filtrar todavía el producto por diámetro.');}
 else if(a.rosca){if(CatalogosSistemasGas.identificar(instalacionGas.perfil)==='sigas'){const opciones=DimensionamientoSigas.opcionesTerminal(SIGAS_ED15_2025,{rosca:a.rosca},D);if(!opciones.some(f=>DimensionamientoSigas.atributosTerminal(f).geometria==='recta'))faltas.push('No hay conexión recta directa documentada para '+D+' mm × '+a.rosca+'″; revisar una adaptación respaldada, sin sustituirla por un codo.');else faltas.push('Falta seleccionar o confirmar la conexión recta compatible documentada.');}else faltas.push('Falta seleccionar el producto compatible del sistema elegido.');}
 if(a.geometria==='codo90')faltas.push('Hay un codo terminal registrado: revisá la alternativa recta sin cambiar los codos declarados.');return faltas;
}
