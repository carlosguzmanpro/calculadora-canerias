/* Puente de solo lectura: las cantidades se reutilizan; el resultado técnico no cambia materiales. */
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
 return {preparacion,perfil,inventario,config:proyectoGasActual().calculoSigas||{}};
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
 const aviso=document.createElement('p');aviso.textContent='Elegí solo el producto y vía reales. Las cantidades ya están cargadas. Codos y llaves de familia confirmada siguen el diámetro tabulado. Las tees requieren producto y vía por recorrido, con revisión si cambian las conexiones. Si el grupo contiene productos distintos, identificá las piezas por separado; no asignes una familia común. No confirma normativa ni suministro.';detalles.append(aviso);
 const patrones={codo90:/^Codo.*90/,codo45:/^Codo.*45/,tee:/^Te /,llave:/^Llave /,reduccion:/Reduct|Reduc/,cupla:/Cupla/},vector=r.historia.at(-1)?.diametrosExteriorMm;
 if(!vector){out.append(detalles);return;}
 const ids=entrada.preparacion.porTramo.map(t=>t.id),clave=ids.map(id=>vector[id]).join('/');
 for(const p of entrada.inventario.fisicas){
  const caja=document.createElement('details');caja.className='sigas-vinculo';const titulo=document.createElement('summary');titulo.textContent=p.cantidad+' × '+p.tipo+' · '+(p.tramos.map(id=>entrada.preparacion.porTramo.find(t=>t.id===id)?.nombre||id).join(', ')||'ubicación técnica pendiente');caja.append(titulo);
  if(p.tipo==='tee'){const nota=document.createElement('p');nota.textContent='Falta confirmar la variante real (normal o reductora), las medidas de sus tres conexiones y qué recorrido pasa a través o gira 90°. La red de conexiones sola no determina esa vía. No se asigna una tee por defecto.';caja.append(nota);}
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
   const asignado=p.tipo==='tee'?v.porRecorrido?.[ruta.artefacto]:v.producto;select.value=asignado?.familia?'familia:'+asignado.familia:asignado?.productos?.[(asignado.tramosDiametro||ids).map(id=>vector[id]).join('/')]||'';
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
