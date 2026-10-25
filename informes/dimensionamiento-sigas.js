/* Puente de solo lectura: las cantidades se reutilizan; el resultado técnico no cambia materiales. */
function transicionesRectasDeclaradasSigasGas(){
 if(modulo!=='gas'||CatalogosSistemasGas.identificar(instalacionGas.perfil)!=='sigas')return [];
 const red=redFisicaManualGas(),preparacion=PreparacionDiametrosGas.prepararRed(red,tramos,perfilTecnicoActualGas()),entradas=new Set(Object.values(red.orientacion).map(o=>o.hasta)),raices=[...new Set(Object.values(red.orientacion).map(o=>o.desde))].filter(id=>!entradas.has(id)),mapa=new Map(preparacion.recorridos.map(r=>['terminal-'+r.artefacto,[r.tramos.at(-1)]]));
 if(raices.length===1)mapa.set('terminal-medidor',Object.entries(red.orientacion).filter(([,o])=>o.desde===raices[0]).map(([id])=>id));
 return Object.entries(proyectoGasActual().calculoSigas?.terminales||{}).filter(([id,a])=>a.geometria==='recta'&&mapa.get(id)?.length===1).map(([id,a])=>({idFisico:id+'::recta',tipo:'Transición recta fusión–rosca',cantidad:1,tramo:mapa.get(id)[0],ubicacion:mapa.get(id)[0],medidas:a.rosca?[a.rosca+'″; extremo de cañería pendiente']:[],medidasEstimadas:true,confirmado:true,evidencia:'Forma recta declarada en conexión terminal; no sustituye ni duplica codos. Diámetro de cañería y validación técnica pendientes.'}));
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
 const entrada=entradaManualMaterialesGas(),casillero=estadoCodoCasilleroGas(entrada);
 if(casillero.adicional===1&&!inventario.fisicas.some(p=>p.id==='casillero-medidor:codo90'))inventario.fisicas.push({id:'casillero-medidor:codo90',tipo:'codo90',cantidad:1,confirmada:true,tramos:[],equivalenteM:null});
 const config=JSON.parse(JSON.stringify(proyectoGasActual().calculoSigas||{}));
 // Aclaración específica del propietario sobre el ejercicio, no una regla universal para cualquier medidor.
 const proyecto=proyectoGasActual(),terminal=inventario.necesidadesTerminales.find(n=>n.id==='terminal-medidor');
 const grupoMedidor=inventario.fisicas.filter(p=>p.tipo==='codo90'&&p.cantidad===7&&p.tramos.length===1&&terminal?.tramos.includes(p.tramos[0]));
 if(proyecto.referenciaSigas19===true&&proyecto.reglaMedidorReferenciaGas!==false&&grupoMedidor.length===1){
  const grupo=grupoMedidor[0];
  if(!config.desgloses?.[grupo.id]){
   inventario.fisicas=inventario.fisicas.flatMap(p=>p.id!==grupo.id?[p]:[
    {...p,id:p.id+'::medidor',cantidad:1,origenId:p.id,cantidadOriginal:p.cantidad,indiceOrigen:0,necesidadTerminal:config.vinculos?.[p.id+'::medidor']?.necesidadTerminal??'terminal-medidor',automatico:'Conexión del medidor · medida de rosca pendiente'},
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
  if(a){config.vinculos||={};config.vinculos[p.id]={...config.vinculos[p.id],producto:{confirmado:true,atributos:{...a,geometria:Object.hasOwn(a,'geometria')?a.geometria:p.geometria}}};p.producto=config.vinculos[p.id].producto;}
 }
 // Asociar cantidades existentes a sus artefactos; una llave no sustituye a una transición.
 inventario.asociacionesArtefactos=preparacion.recorridos.map(ruta=>{
  const tramo=ruta.tramos.at(-1),unico=preparacion.recorridos.filter(r=>r.tramos.at(-1)===tramo).length===1;
  const llaves=inventario.fisicas.filter(p=>p.tipo==='llave'&&p.confirmada===true&&!p.conflicto&&p.tramos.length===1&&p.tramos[0]===tramo);
  const cantidad=llaves.reduce((n,p)=>n+p.cantidad,0),llaveId=unico&&cantidad===1&&llaves.length===1?llaves[0].id:null;
  if(llaveId)llaves[0].artefactoAsociado=ruta.artefacto;
  return {artefacto:ruta.artefacto,tramo,llaveId,estado:llaveId?'Llave registrada asociada; tipo exacto pendiente':cantidad===0?'Llave no identificada en este tramo; no se añadió una':'Asociación de llaves ambigua; revisar ubicación sin cambiar cantidades',conexionRequerida:'Transición fusión–rosca',geometria:null,medidaRosca:null};
 });
 return {preparacion,perfil,inventario,config};
}
function calcularPreseleccionSigasGas(){const entrada=entradaPreseleccionSigasGas();return entrada?DimensionamientoSigas.resolver(SIGAS_ED15_2025,entrada):null;
}
function renderPreseleccionSigasGas(out,plan=null){
 let r;try{r=calcularPreseleccionSigasGas();}catch(e){const p=document.createElement('p');p.textContent='Preselección SIGAS pendiente: '+e.message+'. Los datos guardados se conservaron.';out.append(p);return;}
 if(!r)return;
 const titulo=document.createElement('h3');titulo.textContent=perfilTecnicoActualGas().gas==='GN'?'Diámetros por tramo · SIGAS GN':'Dimensionamiento SIGAS · combustible pendiente de método propio';out.append(titulo);
 const aviso=document.createElement('p');aviso.textContent=r.filas.length?'Preselección parcial, sin validación de instalación. Pérdidas pendientes no equivalen a cero.':'No hay preselección: '+r.errores.join(' ');out.append(aviso);
 const tabla=document.createElement('table');tabla.className='tabla sigas-diametros';const head=document.createElement('thead'),hr=document.createElement('tr');for(const s of ['Tramo','Inicial → recalculado (condicionado)']){const th=document.createElement('th');th.textContent=s;hr.append(th);}head.append(hr);tabla.append(head);const body=document.createElement('tbody');
 for(const f of r.filas){const tr=document.createElement('tr');for(const s of [f.tramo,f.candidato?(r.historia[0]?.diametrosExteriorMm[f.id]??'Pendiente')+' → '+f.candidato.exteriorMm+' mm':'Sin candidato: '+(f.pendientes[0]||'Revisar conexiones, combustible y poder calorífico')]){const td=document.createElement('td');td.textContent=s;tr.append(td);}body.append(tr);}tabla.append(body);if(r.filas.length)out.append(tabla);
 const resumen=document.createElement('details'),sr=document.createElement('summary');sr.textContent='Ver caudales, capacidades y recorridos por tramo';resumen.append(sr);
 const lista=document.createElement('div');lista.className='sigas-candidatos';
 for(const f of r.filas){
  const card=document.createElement('details');card.className='sigas-candidato';const h=document.createElement('summary');h.textContent=f.tramo+' · '+(f.candidato?f.candidato.exteriorMm+' mm candidato':'Pendiente')+' · pérdidas por verificar';card.append(h);
  const textoCard=s=>{const p=document.createElement('p');p.textContent=s;card.append(p);};
  textoCard('Real: '+f.longitudRealM+' m · equivalente conocido del tramo: '+(f.equivalenteConocidoTramoM===null?'Pendiente':f.equivalenteConocidoTramoM.toLocaleString('es-AR',{maximumFractionDigits:3})+' m')+'; equivalente total: '+(f.longitudDefinitivaM===null?'Pendiente de completar pérdidas':'ver detalle de recorrido')+'.');
  textoCard('Longitud de consulta: '+(f.longitudConsultaM??'Pendiente')+' m'+(f.longitudDefinitivaM===null?' (parcial; pérdidas pendientes sin valor cero)':'')+' · recorrido de control: '+(f.recorridoControl||'Pendiente')+'.');
  textoCard('Consumo '+(f.consumoKcal??'Pendiente')+' kcal/h · caudal '+(f.caudalM3h===null?'Pendiente':f.caudalM3h.toLocaleString('es-AR',{maximumFractionDigits:6}))+' m³/h.');
  textoCard(f.candidato?'Candidato condicionado: exterior '+f.candidato.exteriorMm+' mm · Tabla 4 p.22, fila '+f.candidato.longitudFilaM+' m · capacidad '+f.candidato.capacidadM3h+' m³/h; cubre solo la consulta parcial, no valida el diámetro definitivo.':'Sin capacidad seleccionada.');
  const pendientes=document.createElement('details'),sp=document.createElement('summary');sp.textContent='Pérdidas que faltan · '+f.perdidasPendientesTramo.length+' piezas o grupos';pendientes.append(sp);
  for(const x of f.perdidasPendientesTramo){const p=document.createElement('p');p.textContent=x.cantidad+' × '+x.tipo+(x.piezaId==='referencia-codo19'?' adicional detrás de la cocina':'')+': '+x.motivo;pendientes.append(p);}
  for(const x of f.perdidasSinUbicacion){const p=document.createElement('p');p.textContent=x.tipo+': '+x.motivo;pendientes.append(p);}
  const nota=document.createElement('p');nota.textContent='También verificar cuplas/continuidad, conexiones del medidor y artefactos, suministro (presiones y densidad) y criterio de recorrido. No se agregaron piezas ni equivalentes por suposición.';pendientes.append(nota);card.append(pendientes);lista.append(card);
 }
 resumen.append(lista);out.append(resumen);
 const detalles=document.createElement('details'),sum=document.createElement('summary');sum.textContent='Ver trazabilidad SIGAS y datos que faltan';detalles.append(sum);
 const texto=s=>{const p=document.createElement('p');p.textContent=s;detalles.append(p);};texto(r.advertencia||'Diámetros definitivos bloqueados.');
 for(const h of r.historia){texto('Iteración '+h.iteracion+' · '+h.fase);for(const ruta of h.recorridos){texto(ruta.artefacto+': '+ruta.longitudReal+' m reales; '+(ruta.equivalenteConocidoM===null?'equivalentes pendientes':ruta.equivalenteConocidoM+' m equivalentes conocidos')+'; consulta '+ruta.longitudConsultaM+' m.');for(const a of ruta.aportes)texto(a.cantidad+' × '+a.nombre+' · Tabla 3 p.'+a.pagina+' · '+a.equivalenteUnitarioM+' m/unidad = '+a.equivalenteTotalM+' m.');}for(const f of h.filas)for(const q of f.consultas)texto(f.tramo+': exterior '+q.exteriorMm+' mm / fila '+q.longitudFilaM+' m / '+q.capacidadM3h+' m³/h · '+(q.cubre?'cubre solo esta consulta':'capacidad insuficiente'));}
 for(const s of [...r.errores,...r.pendientes])texto(s);out.append(detalles);
 renderVinculosSigasGas(out,r);
 const nota=document.createElement('p');nota.textContent=textoCuplasSigasGas(plan);out.append(nota);
}
function abrirEjercicioSigas19Gas(){
 if(modulo!=='gas')return false;
 const existente=registrosProyectosGas().find(p=>p.datos.referenciaSigas19===true);
 if(existente){seleccionarAmbitoGas('proyecto:'+existente.id);calcularMaterialesManualGas();return true;}
 if(!crearProyectoGas('Referencia SIGAS · 58 m · 19 codos'))return false;
 const filas=[['M','A',15,7,1,0,''],['A','B',5,1,1,0,''],['A','Termo',9,1,0,1,'Termotanque'],['B','Calefactor',16,4,0,1,'Calefactor'],['B','Cocina',13,5,0,1,'Cocina']];
 tramos=filas.map(([desde,hasta,metros,codos,tees,llaves,artefacto])=>({id:'ref-'+desde+'-'+hasta,desde,hasta,metros,artefacto,consumo:null,diametro:null,detalle:{estado:'pendiente',accesorios:tees?[{tipo:'tee',nodo:hasta,idFisico:'referencia-tee-'+hasta}]:[]}}));
 artefactos=[{id:'ref-termo',nombre:'Termotanque',consumo:16000},{id:'ref-calefactor',nombre:'Calefactor',consumo:3000},{id:'ref-cocina',nombre:'Cocina',consumo:10200}];
 instalacionGas={version:1,perfil:{pais:'AR',uso:'domiciliario',gas:'GN',catalogoTecnicoGas:'sigas',material:'Acero-polietileno SIGAS Thermofusión',sistema:'Thermofusión',poderCalorifico:'9300',fuenteGas:'Poder calorífico aportado para el ejercicio por el propietario; suministro real sin verificar',largosDocumentados2026:true},nodos:[]};
 const p=proyectoGasActual();p.referenciaSigas19=true;p.conteosRapidosGas=Object.fromEntries(filas.map((f,i)=>[tramos[i].id,{codo90:f[3],codo45:0,tee:f[4],reduccion:0,llave:f[5]}]));
 datosPlanGas().opciones.cargaManualDirecta=true;
 datosPlanGas().extras.push({idFisico:'referencia-codo19',tipo:'codo90',cantidad:1,ubicacion:'Codo 19 del ejercicio · ubicación técnica por verificar',medidas:[],confirmado:true,evidencia:'Cantidad confirmada por el propietario, adicional a los 18 declarados en los cinco tramos. Sin inferir orientación ni pérdidas.'});
 guardarDatos();renderTramos();renderGas();renderAmbitoGas();calcularMaterialesManualGas();return true;
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
function guardarDatoTerminalSigasGas(necesidad,campo,valor){
 const e=entradaPreseleccionSigasGas(),n=e?.inventario.necesidadesTerminales.find(n=>n.id===necesidad);if(!n||!['geometria','sexo','rosca','variante'].includes(campo)||typeof valor!=='string')return false;
 if(valor&&!SIGAS_ED15_2025.tablas[3].filas.some(f=>DimensionamientoSigas.atributosTerminal(f)?.[campo]===valor))return false;
 const abiertos=Array.from(document.querySelectorAll?.('#resumenPrincipalMaterialesGas details[open]')||[]).map(d=>d.claveTerminalSigas||d.querySelector('summary')?.textContent),scrollAnterior=window.scrollY;
 const c=proyectoGasActual().calculoSigas||={version:1,vinculos:{}};c.terminales||={};const a=c.terminales[necesidad]||={};if(campo==='geometria'&&a.geometria!==valor){c.historialTerminales||=[];c.historialTerminales.push({necesidad,atributos:{...a}});delete a.variante;}a[campo]=valor;guardarDatos();calcularMaterialesManualGas();for(const d of document.querySelectorAll?.('#resumenPrincipalMaterialesGas details')||[])if(abiertos.includes(d.claveTerminalSigas||d.querySelector('summary')?.textContent))d.open=true;if(Number.isFinite(scrollAnterior))window.scrollTo({top:scrollAnterior,behavior:'instant'});return true;
}
function renderDatosTerminalesSigasGas(caja,p,entrada,vector){
 const v=entrada.config.vinculos?.[p.id]?.producto,clave=(v?.tramosDiametro||[]).map(id=>vector[id]).join('/'),f=SIGAS_ED15_2025.tablas[3].filas.find(f=>f.id===v?.productos?.[clave]);
 const a={...(v?.atributos||DimensionamientoSigas.atributosTerminal(f||{nombreOriginal:''})||{}),...entrada.config.terminales?.[p.necesidadTerminal]},diametro=p.tramos.length===1?vector[p.tramos[0]]:null;
 const actual={...a,geometria:Object.hasOwn(a,'geometria')?a.geometria:(p.geometria||(['codo90','codo45'].includes(p.tipo)?p.tipo:''))};
 for(const [campo,titulo]of [['geometria','Forma de la conexión'],['sexo','Rosca de la pieza: macho o hembra'],['rosca','Medida de rosca'],['variante','Variante del producto']]){
  const filtro={...actual};delete filtro[campo];
  const opciones=DimensionamientoSigas.opcionesTerminal(SIGAS_ED15_2025,filtro,diametro),valores=[...new Set(opciones.map(f=>DimensionamientoSigas.atributosTerminal(f)[campo]))];
  if(campo==='geometria'){valores.splice(0,valores.length,'codo90','recta');}
  if(campo==='variante'&&(!actual.sexo||!actual.rosca||valores.length<2))continue;
  const l=document.createElement('label'),select=document.createElement('select');l.textContent=titulo;select.ariaLabel=titulo;
  for(const v of ['',...valores]){const o=document.createElement('option');o.value=v;o.textContent=v===''?'Pendiente':({codo90:'Codo de 90° ya contabilizado',recta:'Transición recta (conservar los codos declarados)',hembra:'Hembra',macho:'Macho',estandar:'Estándar','base-larga':'Base larga','base-extra-larga':'Base extra larga'}[v]||v+'″');select.append(o);}
  select.value=actual[campo]||'';select.onchange=()=>guardarDatoTerminalSigasGas(p.necesidadTerminal,campo,select.value);l.append(select);caja.append(l);
 }
}
function guardarVinculoSigasGas(piezaId,recorrido,productoId,tramoAplicacion=null){
 const entrada=entradaPreseleccionSigasGas();if(!entrada||!entrada.inventario.fisicas.some(p=>p.id===piezaId))return false;
 const r=DimensionamientoSigas.resolver(SIGAS_ED15_2025,entrada),vector=r.historia.at(-1)?.diametrosExteriorMm;
 if(!vector)return false;
 const filas=SIGAS_ED15_2025.tablas[3].filas;const familia=productoId.startsWith('familia:')?productoId.slice(8):null;if(productoId&&!filas.some(f=>f.id===productoId||familia&&DimensionamientoSigas.familiaProducto(f)===familia))return false;
 if(!entrada.preparacion.recorridos.some(r=>r.artefacto===recorrido))return false;
 if(tramoAplicacion!==null&&!entrada.preparacion.porTramo.some(t=>t.id===tramoAplicacion))return false;
 const config=proyectoGasActual().calculoSigas||={version:1,vinculos:{}};config.vinculos||={};
 const v=config.vinculos[piezaId]||={porRecorrido:{}};v.porRecorrido||={};
 if(tramoAplicacion!==null){if(!entrada.preparacion.porTramo.some(t=>t.id===tramoAplicacion))return false;v.tramoAplicacion=tramoAplicacion;}
 const pieza=entrada.inventario.fisicas.find(p=>p.id===piezaId);
 const ids=pieza.tipo==='tee'&&pieza.conexionesDiametro?.length?pieza.conexionesDiametro:pieza.tramos.length?pieza.tramos:tramoAplicacion?[tramoAplicacion]:entrada.preparacion.porTramo.map(t=>t.id),clave=ids.map(id=>vector[id]).join('/');
 const campo=pieza.tipo==='tee'?v.porRecorrido:v,llave=pieza.tipo==='tee'?recorrido:'producto';
 if(familia&&pieza.tipo!=='tee')campo[llave]={confirmado:true,familia};else if(productoId)campo[llave]={confirmado:true,tramosDiametro:ids,productos:{...(campo[llave]?.productos||{}),[clave]:productoId}};else delete campo[llave];
 guardarDatos();renderResumenPrincipalGas();return true;
}
function renderVinculosSigasGas(out,r){
 const entrada=entradaPreseleccionSigasGas();if(!entrada)return;
 const detalles=document.createElement('details'),sum=document.createElement('summary');sum.textContent='Identificar productos SIGAS para las pérdidas (sin repetir cantidades)';detalles.append(sum);
 const aviso=document.createElement('p');aviso.textContent='Las cantidades ya están cargadas. Identificá solo conexiones o variantes pendientes; los grupos comunes siguen el diámetro candidato. Podés corregir la variante si el croquis indica otra pieza.';detalles.append(aviso);
 const patrones={codo90:/^Codo(?: Normal a 90º | MH a 90° | 90º)/,codo45:/^Codo.*45/,tee:/^Te /,llave:/^Llave /,reduccion:/Reduct|Reduc/,cupla:/Cupla/},vector=r.historia.at(-1)?.diametrosExteriorMm;
 if(!vector){out.append(detalles);return;}
 const ids=entrada.preparacion.porTramo.map(t=>t.id),clave=ids.map(id=>vector[id]).join('/');
 const asociaciones=document.createElement('details'),sa=document.createElement('summary');sa.textContent='Conexiones y llaves de los artefactos';asociaciones.append(sa);
 for(const a of entrada.inventario.asociacionesArtefactos){const n=document.createElement('p');const ruta=r.recorridos.find(r=>r.artefacto===a.artefacto),llaveConocida=ruta?.aportes.some(p=>p.piezaId===a.llaveId),conexionPendiente=ruta?.perdidasPendientes.some(p=>p.piezaId==='terminal-'+a.artefacto);n.textContent=a.artefacto+': '+(llaveConocida?'Llave registrada y tipo identificado':a.estado)+'. '+(conexionPendiente?'Transición fusión–rosca requerida: falta identificar forma y medida de la conexión real.':'Transición identificada en una pieza ya contabilizada.');asociaciones.append(n);}detalles.append(asociaciones);
 for(const n of entrada.inventario.necesidadesTerminales)if(!entrada.inventario.fisicas.some(p=>p.necesidadTerminal===n.id)){
  const caja=document.createElement('details'),t=document.createElement('summary');caja.claveTerminalSigas=n.id;t.textContent=n.nombre+' · forma y medidas pendientes (no es otra pieza añadida)';caja.append(t);renderDatosTerminalesSigasGas(caja,{tipo:'conexion-terminal',tramos:n.tramos,necesidadTerminal:n.id},entrada,vector);detalles.append(caja);
 }
 const reconocidos=document.createElement('details'),srec=document.createElement('summary');srec.textContent='Accesorios reconocidos · corregir una excepción';reconocidos.append(srec);
 let cantidadResuelta=0,cantidadPendiente=0;
 for(const p of entrada.inventario.fisicas){
  const caja=document.createElement('details');caja.className='sigas-vinculo';const titulo=document.createElement('summary');titulo.textContent=p.cantidad+' × '+p.tipo+' · '+(p.tramos.map(id=>entrada.preparacion.porTramo.find(t=>t.id===id)?.nombre||id).join(', ')||'ubicación técnica pendiente');caja.append(titulo);
  if(p.clasificacionAutomatica&&!p.automatico){const n=document.createElement('p');n.textContent=p.clasificacionAutomatica;caja.append(n);}
  if(p.automatico){const n=document.createElement('p');n.textContent=p.automatico+'; corregible si el croquis indica otra variante.';caja.append(n);}
  if(p.grupoOriginal)titulo.textContent+=' · pieza '+p.numeroUnidad+' (cantidad ya registrada)';
  if(p.cantidad>1&&p.tipo!=='tee'&&!p.grupoOriginal){const b=document.createElement('button');b.type='button';b.textContent='Identificar las '+p.cantidad+' piezas por separado';b.onclick=()=>separarProductosSigasGas(p.id);caja.append(b);}
  if(p.cantidad===1&&!p.automatico&&!['llave','tee'].includes(p.tipo)){const necesidades=entrada.inventario.necesidadesTerminales.filter(n=>n.tramos.some(id=>p.tramos.includes(id)));if(necesidades.length){const l=document.createElement('label'),sel=document.createElement('select');l.textContent='Función de esta pieza (sin agregar cantidades)';sel.ariaLabel=l.textContent;for(const [id,nombre]of [['','Recorrido o conexión sin identificar'],...necesidades.map(n=>[n.id,n.nombre])]){const o=document.createElement('option');o.value=id;o.textContent=nombre;sel.append(o);}sel.value=p.necesidadTerminal||'';sel.onchange=()=>identificarConexionSigasGas(p.id,sel.value);l.append(sel);caja.append(l);}}

  if(p.tipo==='tee'){const nota=document.createElement('p');nota.textContent='Falta confirmar la variante real (normal o reductora), las medidas de sus tres conexiones y qué recorrido pasa a través o gira 90°. La red de conexiones sola no determina esa vía. No se asigna una tee por defecto.';caja.append(nota);}
  const v=entrada.config.vinculos?.[p.id]||{};
  const ub=document.createElement('select');for(const [valor,texto]of [['','Ubicación de la pérdida pendiente'],...entrada.preparacion.porTramo.map(t=>[t.id,t.nombre])]){const o=document.createElement('option');o.value=valor;o.textContent=texto;ub.append(o);}ub.value=p.tramos[0]||v.tramoAplicacion||'';
  if(!p.tramos.length){const l=document.createElement('label');l.textContent='Asociar al tramo solo si la pieza pertenece al circuito calculado';l.append(ub);caja.append(l);}
  if(p.necesidadTerminal&&p.automatico){caja.claveTerminalSigas=p.necesidadTerminal;renderDatosTerminalesSigasGas(caja,p,entrada,vector);const aplicada=r.recorridos.some(r=>r.aportes.some(a=>a.piezaId===p.id)),faltante=r.recorridos.some(r=>r.perdidasPendientes.some(a=>a.piezaId===p.id));if(aplicada&&!faltante){reconocidos.append(caja);cantidadResuelta+=p.cantidad;}else{detalles.append(caja);cantidadPendiente+=p.cantidad;}continue;}
  let renderizados=0;for(const ruta of entrada.preparacion.recorridos){
   if(p.tipo!=='tee'&&renderizados)continue;
   if(p.tramos.length&&!p.tramos.some(id=>ruta.tramos.includes(id)))continue;
   const label=document.createElement('label'),select=document.createElement('select');label.textContent=p.automatico&&p.necesidadTerminal?'Medida y variante de la conexión roscada del medidor':p.tipo==='tee'?'Configuración y vía de la tee hacia '+ruta.artefacto:p.tipo==='llave'?'Tipo de llave de paso'+(p.artefactoAsociado?' de '+p.artefactoAsociado:' (ubicación por verificar)'):'Producto SIGAS (se reutiliza en los recorridos)';renderizados++;select.ariaLabel=label.textContent;
   const vacio=document.createElement('option');vacio.value='';vacio.textContent='Pendiente: no se asigna pérdida cero';select.append(vacio);
   if(p.tipo!=='tee'){for(const familia of [...new Set(SIGAS_ED15_2025.tablas[3].filas.filter(f=>patrones[p.tipo]?.test(f.nombreOriginal)&&(!p.necesidadTerminal||/rosca|H\.larga|H\.extra/i.test(f.nombreOriginal))).map(DimensionamientoSigas.familiaProducto).filter(Boolean))]){const o=document.createElement('option');o.value='familia:'+familia;o.textContent=familia+' · seguir diámetro candidato (confirmar producto real)';select.append(o);}}
   for(const f of SIGAS_ED15_2025.tablas[3].filas.filter(f=>patrones[p.tipo]?.test(f.nombreOriginal)&&(!p.necesidadTerminal||/rosca|H\.larga|H\.extra/i.test(f.nombreOriginal))&&(!p.automatico||!p.necesidadTerminal||p.tramos.every(id=>vector[id]===f.diametroExteriorM*1000)))){const o=document.createElement('option');o.value=f.id;o.textContent=f.nombreOriginal+' · '+f.longitudEquivalenteM+' m · p.'+f.pagina;select.append(o);}
   const asignado=p.tipo==='tee'?v.porRecorrido?.[ruta.artefacto]:v.producto;select.value=asignado?.familia?'familia:'+asignado.familia:asignado?.productos?.[(asignado.tramosDiametro||ids).map(id=>vector[id]).join('/')]||'';
   select.onchange=()=>{if(!p.tramos.length&&!ub.value){$('matMensaje').textContent='Indicá primero si esta pérdida pertenece a un tramo del circuito; no se inventó su ubicación.';select.value='';return;}guardarVinculoSigasGas(p.id,ruta.artefacto,select.value,p.tramos.length?null:ub.value);};
   label.append(select);caja.append(label);
  }
  const aplicada=r.recorridos.some(r=>r.aportes.some(a=>a.piezaId===p.id)),faltante=r.recorridos.some(r=>r.perdidasPendientes.some(a=>a.piezaId===p.id));
  if(aplicada&&!faltante){reconocidos.append(caja);cantidadResuelta+=p.cantidad;}else{detalles.append(caja);cantidadPendiente+=p.cantidad;}
 }
 srec.textContent='Accesorios reconocidos · '+cantidadResuelta+' piezas · corregir una excepción';
 if(cantidadResuelta)detalles.append(reconocidos);
 const estado=document.createElement('p');estado.textContent=cantidadResuelta+' piezas con equivalencias conocidas; '+cantidadPendiente+' piezas requieren datos concretos. Las conexiones terminales sin identificar siguen pendientes.';detalles.append(estado);
 out.append(detalles);
}

function textoCuplasSigasGas(plan){
 const filas=plan?.filas?.filter(f=>['cupla','cupla-plan'].includes(f.tipo))||[];
 if(!filas.length||filas.some(f=>!Number.isFinite(f.cantidad))||plan.planes?.some(g=>g.hipotesis))return 'Posibles cuplas: pendiente de confirmar. Faltan posiciones o continuidad de caños; los candidatos de diámetro se pueden consultar.';
 return 'Cuplas '+(filas.every(f=>f.cantidadConfirmada&&!f.editado)?'declaradas':'estimadas')+': '+filas.reduce((n,f)=>n+f.cantidad,0)+'. Revisar las uniones propuestas antes de comprar.';
}
