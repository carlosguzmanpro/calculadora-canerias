/* Puente de solo lectura: las cantidades se reutilizan; el resultado técnico no cambia materiales. */
function entradaPreseleccionSigasGas(){
 if(modulo!=='gas'||CatalogosSistemasGas.identificar(instalacionGas.perfil)!=='sigas')return null;
 const perfil=perfilTecnicoActualGas(),red=redFisicaManualGas(),preparacion=PreparacionDiametrosGas.prepararRed(red,tramos,perfil);
 const inventario=inventarioAccesoriosParaMotorGas(red);
 // El codo autorizado del casillero se mantiene en inventario; no se supone de qué lado del medidor está.
 const entrada=entradaManualMaterialesGas(),casillero=estadoCodoCasilleroGas(entrada);
 if(casillero.adicional===1&&!inventario.fisicas.some(p=>p.id==='casillero-medidor:codo90'))inventario.fisicas.push({id:'casillero-medidor:codo90',tipo:'codo90',cantidad:1,confirmada:true,tramos:[],equivalenteM:null});
 return {preparacion,perfil,inventario,config:proyectoGasActual().calculoSigas||{}};
}
function calcularPreseleccionSigasGas(){const entrada=entradaPreseleccionSigasGas();return entrada?DimensionamientoSigas.resolver(SIGAS_ED15_2025,entrada):null;
}
function renderPreseleccionSigasGas(out,plan=null,opciones={}){
 let r;try{r=Object.hasOwn(opciones,'resultado')?opciones.resultado:calcularPreseleccionSigasGas();}catch(e){const p=document.createElement('p');p.textContent='Preselección SIGAS pendiente: '+e.message+'. Los datos guardados se conservaron.';out.append(p);return;}
 if(!r)return;
 const titulo=document.createElement('h3');titulo.textContent=perfilTecnicoActualGas().gas==='GN'?'Diámetros por tramo · SIGAS GN':'Dimensionamiento SIGAS · combustible pendiente de método propio';out.append(titulo);
 const aviso=document.createElement('p');aviso.textContent=r.filas.length?'Preselección parcial, sin validación de instalación. Pérdidas pendientes no equivalen a cero.':'No hay preselección: '+r.errores.join(' ');out.append(aviso);
 const tabla=document.createElement('table');tabla.className='tabla sigas-diametros';const head=document.createElement('thead'),hr=document.createElement('tr');for(const s of ['Tramo','Inicial → recalculado (condicionado)']){const th=document.createElement('th');th.textContent=s;hr.append(th);}head.append(hr);tabla.append(head);const body=document.createElement('tbody');
 for(const f of r.filas){const tr=document.createElement('tr');for(const s of [f.tramo,f.candidato?(r.historia[0]?.diametrosExteriorMm[f.id]??'Pendiente')+' → '+f.candidato.exteriorMm+' mm':'Sin candidato: '+(f.pendientes[0]||'Revisar conexiones, combustible y poder calorífico')]){const td=document.createElement('td');td.textContent=s;tr.append(td);}body.append(tr);}tabla.append(body);if(r.filas.length&&!opciones.ocultarTabla)out.append(tabla);
 const resumen=document.createElement('details'),sr=document.createElement('summary');sr.textContent='Ver caudales, capacidades y recorridos por tramo';resumen.append(sr);
 const lista=document.createElement('div');lista.className='sigas-candidatos';
 for(const f of r.filas){const card=document.createElement('article');card.className='sigas-candidato';const h=document.createElement('h4');h.textContent=f.tramo;card.append(h);for(const s of [f.candidato?'Candidato condicionado: exterior '+f.candidato.exteriorMm+' mm · interior '+f.candidato.interiorTabuladoMm+' mm':'Diámetro: Pendiente',f.candidato?'Tabla 4 · p.22 · fila '+f.candidato.longitudFilaM+' m · capacidad '+f.candidato.capacidadM3h+' m³/h':'Sin capacidad seleccionada', 'Consumo '+(f.consumoKcal??'Pendiente')+' kcal/h · caudal '+(f.caudalM3h===null?'Pendiente':f.caudalM3h.toLocaleString('es-AR',{maximumFractionDigits:6}))+' m³/h', 'Tramo real '+f.longitudRealM+' m · recorrido de control: '+(f.recorridoControl||'Pendiente')+' · longitud consultada '+(f.longitudConsultaM??'Pendiente')+' m', 'Equivalente conocido del recorrido: '+(f.equivalenteConocidoRutaM===null?'Pendiente':fmt(f.equivalenteConocidoRutaM)+' m')+' · longitud definitiva: '+(f.longitudDefinitivaM??'Pendiente')]){const p=document.createElement('p');p.textContent=s;card.append(p);}lista.append(card);}
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
 if(existente){seleccionarAmbitoGas('proyecto:'+existente.id);ubicarCodoAdicionalReferenciaGas();guardarDatos();calcularMaterialesManualGas();return true;}
 if(!crearProyectoGas('Referencia SIGAS · 58 m · 19 codos'))return false;
 const filas=[['M','A',15,7,1,0,''],['A','B',5,1,1,0,''],['A','Termo',9,1,0,1,'Termotanque'],['B','Calefactor',16,4,0,1,'Calefactor'],['B','Cocina',13,5,0,1,'Cocina']];
 tramos=filas.map(([desde,hasta,metros,codos,tees,llaves,artefacto])=>({id:'ref-'+desde+'-'+hasta,desde,hasta,metros,artefacto,consumo:null,diametro:null,detalle:{estado:'pendiente',accesorios:tees?[{tipo:'tee',nodo:hasta,idFisico:'referencia-tee-'+hasta}]:[]}}));
 artefactos=[{id:'ref-termo',nombre:'Termotanque',consumo:16000},{id:'ref-calefactor',nombre:'Calefactor',consumo:3000},{id:'ref-cocina',nombre:'Cocina',consumo:10200}];
 instalacionGas={version:1,perfil:{pais:'AR',uso:'domiciliario',gas:'GN',catalogoTecnicoGas:'sigas',material:'Acero-polietileno SIGAS Thermofusión',sistema:'Thermofusión',poderCalorifico:'9300',fuenteGas:'Poder calorífico aportado para el ejercicio por el propietario; suministro real sin verificar',largosDocumentados2026:true},nodos:[]};
 const p=proyectoGasActual();p.referenciaSigas19=true;p.conteosRapidosGas=Object.fromEntries(filas.map((f,i)=>[tramos[i].id,{codo90:f[3],codo45:0,tee:f[4],reduccion:0,llave:f[5]}]));
 datosPlanGas().opciones.cargaManualDirecta=true;
 datosPlanGas().extras.push({idFisico:'referencia-codo19',tipo:'codo90',cantidad:1,ubicacion:'Codo 19 del ejercicio · ubicación técnica por verificar',medidas:[],confirmado:true,evidencia:'Cantidad confirmada por el propietario, adicional a los 18 declarados en los cinco tramos. Sin inferir orientación ni pérdidas.'});
 ubicarCodoAdicionalReferenciaGas();guardarDatos();renderTramos();renderGas();renderAmbitoGas();calcularMaterialesManualGas();return true;
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
 const ids=entrada.preparacion.porTramo.map(t=>t.id),clave=ids.map(id=>vector[id]).join('/');
 const pieza=entrada.inventario.fisicas.find(p=>p.id===piezaId),campo=pieza.tipo==='tee'?v.porRecorrido:v,llave=pieza.tipo==='tee'?recorrido:'producto';
 if(familia&&pieza.tipo!=='tee')campo[llave]={confirmado:true,familia};else if(productoId)campo[llave]={confirmado:true,tramosDiametro:ids,productos:{...(campo[llave]?.productos||{}),[clave]:productoId}};else delete campo[llave];
 guardarDatos();renderResumenPrincipalGas();return true;
}
function renderVinculosSigasGas(out,r){
 const entrada=entradaPreseleccionSigasGas();if(!entrada)return;
 const detalles=document.createElement('details'),sum=document.createElement('summary');sum.textContent='Identificar productos SIGAS para las pérdidas (sin repetir cantidades)';detalles.append(sum);
 const aviso=document.createElement('p');aviso.textContent='Elegí solo el producto y vía reales. Las cantidades ya están cargadas. Codos y llaves de familia confirmada siguen el diámetro tabulado. Las tees requieren producto y vía por recorrido, con revisión si cambian las conexiones. Si el grupo contiene productos distintos, identificá las piezas por separado; no asignes una familia común. No confirma normativa ni suministro.';detalles.append(aviso);
 const patrones={codo90:/^Codo.*90/,codo45:/^Codo.*45/,tee:/^Te /,llave:/^Llave /,reduccion:/Reduct|Reduc/,cupla:/Cupla/},vector=r.historia.at(-1)?.diametrosExteriorMm;
 if(!vector){out.append(detalles);return;}
 const ids=entrada.preparacion.porTramo.map(t=>t.id),clave=ids.map(id=>vector[id]).join('/');
 for(const p of entrada.inventario.fisicas){
  const caja=document.createElement('details');caja.className='sigas-vinculo';const titulo=document.createElement('summary');titulo.textContent=p.cantidad+' × '+p.tipo+' · '+(p.tramos.map(id=>entrada.preparacion.porTramo.find(t=>t.id===id)?.nombre||id).join(', ')||'ubicación técnica pendiente');caja.append(titulo);
  if(p.tipo==='tee'){const nota=document.createElement('p');nota.textContent='Falta confirmar la variante real (normal o reductora), las medidas de sus tres conexiones y qué recorrido pasa a través o gira 90°. La red de conexiones sola no determina esa vía. No se asigna una tee por defecto.';caja.append(nota);}
  if(p.rolConexion==='terminal'&&p.productoConexionId){const nota=document.createElement('p');nota.textContent='Producto terminal identificado en Conexiones terminales e intermedias. Se usa esa pieza una sola vez; modificá su vínculo allí.';caja.append(nota);detalles.append(caja);continue;}
  const v=entrada.config.vinculos?.[p.id]||{};
  const ub=document.createElement('select');for(const [valor,texto]of [['','Ubicación de la pérdida pendiente'],...entrada.preparacion.porTramo.map(t=>[t.id,t.nombre])]){const o=document.createElement('option');o.value=valor;o.textContent=texto;ub.append(o);}ub.value=p.tramos[0]||v.tramoAplicacion||'';
  if(!p.tramos.length){const l=document.createElement('label');l.textContent='Asociar al tramo solo si la pieza pertenece al circuito calculado';l.append(ub);caja.append(l);}
  let renderizados=0;for(const ruta of entrada.preparacion.recorridos){
   if(p.tipo!=='tee'&&renderizados)continue;
   if(p.tramos.length&&!p.tramos.some(id=>ruta.tramos.includes(id)))continue;
   const label=document.createElement('label'),select=document.createElement('select');label.textContent=p.tipo==='tee'?'Producto/vía hacia '+ruta.artefacto:'Producto SIGAS (se reutiliza en los recorridos)';renderizados++;
   const vacio=document.createElement('option');vacio.value='';vacio.textContent='Pendiente: no se asigna pérdida cero';select.append(vacio);
   if(p.tipo!=='tee'){for(const familia of [...new Set(SIGAS_ED15_2025.tablas[3].filas.filter(f=>patrones[p.tipo]?.test(f.nombreOriginal)).map(DimensionamientoSigas.familiaProducto).filter(Boolean))]){const o=document.createElement('option');o.value='familia:'+familia;o.textContent=familia+' · seguir diámetro candidato (confirmar producto real)';select.append(o);}}
   for(const f of SIGAS_ED15_2025.tablas[3].filas.filter(f=>patrones[p.tipo]?.test(f.nombreOriginal))){const o=document.createElement('option');o.value=f.id;o.textContent=f.nombreOriginal+' · '+f.longitudEquivalenteM+' m · p.'+f.pagina;select.append(o);}
   const asignado=p.tipo==='tee'?v.porRecorrido?.[ruta.artefacto]:v.producto;select.value=asignado?.familia?'familia:'+asignado.familia:asignado?.productos?.[clave]||'';
   select.onchange=()=>{if(!p.tramos.length&&!ub.value){$('matMensaje').textContent='Indicá primero si esta pérdida pertenece a un tramo del circuito; no se inventó su ubicación.';select.value='';return;}guardarVinculoSigasGas(p.id,ruta.artefacto,select.value,p.tramos.length?null:ub.value);};
   label.append(select);caja.append(label);
  }
  detalles.append(caja);
 }
 out.append(detalles);
}

function textoCuplasSigasGas(plan){
 const filas=plan?.filas?.filter(f=>['cupla','cupla-plan'].includes(f.tipo))||[];
 if(!filas.length||filas.some(f=>!Number.isFinite(f.cantidad))||plan.planes?.some(g=>g.hipotesis))return 'Posibles cuplas: pendiente de confirmar. Faltan posiciones o continuidad de caños; los candidatos de diámetro se pueden consultar.';
 return 'Cuplas '+(filas.every(f=>f.cantidadConfirmada&&!f.editado)?'declaradas':'estimadas')+': '+filas.reduce((n,f)=>n+f.cantidad,0)+'. Revisar las uniones propuestas antes de comprar.';
}

function guardarConexionTerminalGas(puntoId,piezaId,productoId){
 if(modulo!=='gas')return false;
 const red=redFisicaManualGas(),inventario=inventarioAccesoriosParaMotorGas(red),p=proyectoGasActual(),sistema=CatalogosSistemasGas.identificar(instalacionGas.perfil);
 const registros={...(p.conexionesTerminalesGas||{})};
 if(!piezaId)delete registros[puntoId];else registros[puntoId]={piezaId,productoId:productoId||null,sistema};
 const revision=CatalogosSistemasGas.conexiones(red,tramos,inventario,sistema,registros,SIGAS_ED15_2025,FUSIOGAS_V1_2026),extremo=revision.extremos.find(e=>e.id===puntoId);
 if(!extremo||piezaId&&!['producto identificado','pieza vinculada'].includes(extremo.estado)){$('matMensaje').textContent=extremo?.motivo||'Extremo no disponible en la red actual.';return false;}
 p.conexionesTerminalesGas=registros;guardarDatos();renderResumenPrincipalGas();$('matMensaje').textContent='Conexión vinculada a una pieza existente. Cantidades sin cambios; aplicación técnica pendiente.';return true;
}
function renderConexionesTerminalesGas(out){
 if(modulo!=='gas')return;
 const red=redFisicaManualGas(),inventario=inventarioAccesoriosParaMotorGas(red),r=inventario.conexiones;if(!r?.extremos.length)return;
 const detalle=document.createElement('details'),sum=document.createElement('summary');detalle.className='gas-detalles';sum.textContent='Conexiones terminales e intermedias · revisión técnica';detalle.append(sum);
 const texto=s=>{const p=document.createElement('p');p.textContent=s;detalle.append(p);};
 for(const c of r.clasificacionPorTramo){const p=document.createElement('p');p.className='clasificacion-cantidades-gas';p.textContent=c.tramo+': '+(c.codosTerminalesFusionRosca?c.codosRegistrados+' codos de 90° = 1 terminal fusión–rosca + '+c.codosComunes+' comunes':c.codosRegistrados+' codos de 90° '+c.categoriaCodos)+(c.esTramoArtefacto?' · '+(c.llavePendiente?'Falta contemplar 1 llave de paso (sin agregar)':c.llavesRegistradas+' llave(s) registradas; se reutilizan')+(c.codosRegistrados===0?' · Accesorio terminal por definir, sin inventar codos':''):' · Sin llave de artefacto requerida'+(c.llavesRegistradas?'; se conservan '+c.llavesRegistradas+' declaradas':''))+'. Medidas, productos y pérdidas no verificados siguen pendientes.';detalle.append(p);}
 texto(r.necesidadesRosca+' necesidades de conexión roscada reconocidas automáticamente en medidor y artefactos. En artefactos SIGAS/FUSIOGAS se clasifica un codo terminal dentro del total registrado, sin elegir una pieza física. El medidor mantiene pendiente su pieza exacta. Las llaves de paso son independientes. No se agregan codos ni cantidades por defecto.');
 for(const e of r.extremos){
  const grupo=document.createElement('details'),titulo=document.createElement('summary');grupo.className='conexion-terminal-gas';titulo.textContent=e.nombre+' · '+e.rol+' · '+(e.requiereRosca?'rosca requerida · ':'')+e.estado;grupo.append(titulo);const nota=document.createElement('p');nota.textContent=e.clasificacionAutomatica?.codosTerminalesFusionRosca?'Un codo del total queda clasificado como terminal fusión–rosca por cantidad. No necesitás elegir una pieza física ni repetir cantidades. Medidas, producto y equivalencia exactos requieren respaldo.':e.tipoConexionNecesaria+'. '+e.motivo;grupo.append(nota);
  const avanzado=document.createElement('details'),sa=document.createElement('summary');sa.textContent='Producto documentado · identificación avanzada opcional';avanzado.append(sa);const pieza=document.createElement('select'),producto=document.createElement('select');const lp=document.createElement('label'),lf=document.createElement('label');lp.textContent='Vínculo individual previo (no necesario para la clasificación automática)';lf.textContent='Producto terminal del sistema seleccionado';
  const o=document.createElement('option');o.value='';o.textContent='Producto pendiente: sin pieza individual identificada';pieza.append(o);
  for(const p of inventario.fisicas.filter(p=>e.piezasElegibles.includes(p.id))){const o=document.createElement('option');o.value=p.id;o.textContent=p.tipo+' · '+p.tramos.map(id=>tramos.find(t=>t.id===id)).filter(Boolean).map(t=>t.desde+'–'+t.hasta).join(', ');pieza.append(o);}pieza.value=e.piezaId||'';
  const cargar=()=>{producto.replaceChildren();const o=document.createElement('option');o.value='';o.textContent='Pendiente: tipo, medidas y rosca por identificar';producto.append(o);const p=inventario.fisicas.find(p=>p.id===pieza.value);for(const f of r.productos.filter(f=>CatalogosSistemasGas.tipoProductoCompatible(p,f))){const o=document.createElement('option');o.value=f.id;o.textContent=f.nombreOriginal+' · p.'+f.pagina+' · '+f.longitudEquivalenteM+' m documentales';producto.append(o);}};
  cargar();producto.value=e.producto?.id||'';pieza.onchange=cargar;lp.append(pieza);lf.append(producto);avanzado.append(lp,lf);
  if(e.equivalenteM!==null){const p=document.createElement('p');p.textContent='Equivalente documental de esta pieza: '+e.equivalenteM+' m. Diámetro y aplicación todavía deben verificarse.';grupo.append(p);}
  const guardar=document.createElement('button');guardar.className='alt';guardar.textContent='Guardar identificación sin sumar piezas';guardar.onclick=()=>guardarConexionTerminalGas(e.id,pieza.value,producto.value);avanzado.append(guardar);grupo.append(avanzado);detalle.append(grupo);
 }
 const intermedias=r.piezas.filter(p=>p.rol==='intermedia').length;texto('Piezas intermedias identificadas por nodo: '+intermedias+'. La clasificación automática por cantidades no exige elegir posiciones físicas.');out.append(detalle);
}
function ubicarCodoAdicionalReferenciaGas(){
 const p=proyectoGasActual();if(p.referenciaSigas19!==true||!tramos.some(t=>t.id==='ref-B-Cocina'))return;
 const extra=p.planCompra?.extras?.find(e=>e.idFisico==='referencia-codo19');
 if(extra&&extra.tipo==='codo90'&&extra.cantidad===1&&extra.ubicacion==='Codo 19 del ejercicio · ubicación técnica por verificar'){
  extra.ubicacionAnterior=extra.ubicacion;extra.ubicacion='Codo 19 del ejercicio · B–Cocina (adicional)';extra.tramoTecnicoConfirmado='ref-B-Cocina';extra.evidenciaAnterior=extra.evidencia;extra.evidencia='Ubicación B–Cocina confirmada por el propietario. No confirma posición terminal, variante ni equivalencia.';
 }
}
