/* Formato de entrega: presentación de datos, sin dimensionar ni dibujar recorridos supuestos. */
(function(root){
 const esc=v=>String(v??'PENDIENTE').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const metros=v=>Number.isFinite(v)?v.toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2}):'Pendiente';
 const numero=v=>Number.isFinite(v)?v.toLocaleString('es-AR',{maximumFractionDigits:3}):'Pendiente';
 function agruparMateriales(filas){
  const grupos=new Map();
  for(const f of filas){
   const desconocido=!Number.isFinite(f.cantidad)||f.cantidad<0;
   const estado=desconocido||!f.diametro||/pendiente/i.test(f.diametro)?'pendiente':f.estado==='confirmado'&&!f.editado?'confirmado':'estimado';
   const key=JSON.stringify([f.tipo||f.material,f.material,f.diametro,f.unidad,estado]);
   if(!grupos.has(key))grupos.set(key,{material:f.material,diametro:f.diametro,cantidad:0,unidad:f.unidad,estado,ubicaciones:[],revisado:true});
   const g=grupos.get(key);g.cantidad=desconocido||g.cantidad===null?null:g.cantidad+f.cantidad;
   g.revisado=g.revisado&&!!f.revisado;if(f.ubicacion&&!g.ubicaciones.includes(f.ubicacion))g.ubicaciones.push(f.ubicacion);
  }
  return [...grupos.values()].sort((a,b)=>String(a.material).localeCompare(String(b.material),'es')||String(a.diametro).localeCompare(String(b.diametro),'es')||a.estado.localeCompare(b.estado));
 }
 function planilla(ts,resultado,{caudalAplicable=false}={}){
  return ts.map(t=>{
   const r=resultado?.porTramo?.[t.id];
   // Solo resultados finales convergentes: nunca los +15 m de semilla o una iteración parcial.
   const estable=resultado?.estado==='calculado'&&resultado.convergencia===true&&!resultado.prueba;
   return {tramo:t.desde+'–'+t.hasta,real:t.metros,equivalente:estable?r?.longitudEquivalenteAccesorios:null,
    definitivo:estable?r?.longitudDeCalculo:null,consumo:caudalAplicable?r?.caudal:null,
    diametro:t.diametro?String(t.diametro)+' (manual; no validado)':'Pendiente'};
  });
 }
 function ejercicioSigas(e,imprimir=false){
  if(!e)return '';
  if(e.error)return '<h2>RESULTADO DEL EJERCICIO SIGAS</h2><p>Simulación no disponible.</p>'+e.bloqueos.map(s=>'<p>'+esc(s)+'</p>').join('');
  const r=e.resultado,nombres=new Map(r.filas.map(f=>[f.id,f.tramo])),tabla=(cab,filas)=>'<table class="ejercicio-tabla"><thead><tr>'+cab.map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>'+filas.map(f=>'<tr>'+f.map((v,i)=>'<td data-label="'+esc(cab[i])+'">'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
  const detalle=(titulo,contenido)=>'<details'+(imprimir?' open':'')+'><summary>'+esc(titulo)+'</summary>'+contenido+'</details>',lista=xs=>xs.map(x=>'<p>'+esc(x)+'</p>').join('');
  const total=(tipo)=>e.cantidadesDeclaradas[tipo],metrosTotal=r.filas.reduce((n,f)=>n+f.longitudRealM,0),consumoTotal=r.recorridos.reduce((n,t)=>n+t.consumoKcal,0);
  let html='<h2>'+(e.esEjercicio===false?'RESULTADO PRELIMINAR SIGAS':'RESULTADO DEL EJERCICIO SIGAS')+'</h2><p class="ejercicio-estado">RESULTADO CALCULADO BAJO HIPÓTESIS · NO CONFIRMADO</p><p>'+metros(metrosTotal)+' m · '+numero(total('codo90'))+' codos de 90° · '+numero(total('tee'))+' tees'+(e.propuestasTopologia?.length?' registradas + '+numero(e.propuestasTopologia.length)+' propuestas':'')+' · '+numero(total('llave'))+' llaves · '+numero(consumoTotal)+' kcal/h.</p>';
  const resumenCompra=e.compra.canos.reduce((s,c)=>({tiras:s.tiras+c.tiras,metros:s.metros+c.metrosComerciales,sobrante:s.sobrante+c.sobrante}),{tiras:0,metros:0,sobrante:0}),bujes=e.materiales.filter(m=>m.tipo==='reduccion').reduce((n,m)=>n+m.cantidad,0),cuplas=e.cuplas.reduce((n,c)=>n+c.cantidad,0);
  html+='<p class="ejercicio-estimado"><strong>ESTIMADO · compra orientativa:</strong> '+numero(resumenCompra.tiras)+' tiras de '+metros(e.compra.largoComercial)+' m · '+numero(cuplas)+' cuplas · '+metros(resumenCompra.sobrante)+' m de sobrante. '+numero(bujes)+' bujes en los conjuntos del escenario. No es una lista definitiva de compra.</p>';
  if(e.propuestasTopologia?.length)html+='<p>Topología: '+numero(e.propuestasTopologia.length)+' tee(s) propuestas para el cálculo preliminar, separadas de las cantidades registradas.</p>';
  html+=tabla(['Tramo','Caudal (m³/h)','Diámetro del escenario','Longitud de consulta (m)','Fila SIGAS (m)','Capacidad (m³/h)'],r.filas.map(f=>[f.tramo,numero(f.caudalM3h),f.candidato?f.candidato.exteriorMm+' mm · '+(f.comprobadoPorTabla?'capacidad comprobada bajo hipótesis':'parcial, por verificar'):'Pendiente',metros(f.longitudConsultaM),metros(f.candidato?.longitudFilaM),numero(f.candidato?.capacidadM3h)]));
  html+='<p>'+esc(e.completo?'Escenario tabular estable para el inventario supuesto; pendiente de verificación real.':'Escenario parcial: consultar los bloqueos concretos.')+' No verifica el suministro ni sustituye la revisión profesional.</p>';
  const rutas=r.recorridos.map(t=>[t.artefacto,t.tramos.map(id=>nombres.get(id)||'Tramo pendiente').join(' → '),metros(t.longitudReal),metros(t.equivalenteConocidoM),metros(t.longitudConsultaM)]);
  const memoria=tabla(['Tramo','Real (m)','Recorrido real (m)','Consumo (m³/h)','Diámetro inicial (mm)','Equivalente del recorrido (m)','Total de cálculo (m)','Diámetro del escenario (mm)'],e.memoria.map(f=>[f.tramo,metros(f.longitudRealM),metros(f.longitudCalculoRealM),numero(f.caudalM3h),f.diametroProvisorioMm,metros(f.equivalenteRecorridoConocidoM),metros(f.longitudTotalConsultaM),f.diametroVerificadoMm??'Pendiente']));
  const aportes=r.recorridos.map(t=>'<h3>'+esc(t.artefacto)+'</h3>'+tabla(['Accesorio','Cantidad','Diámetro (mm)','LE unitaria (m)','LE total (m)','Fuente'],t.aportes.map(a=>[a.nombre,a.cantidad,a.diametroExteriorMm,numero(a.equivalenteUnitarioM),numero(a.equivalenteTotalM),'Tabla 3 · p.'+a.pagina]))).join('');
  html+=detalle('Recorridos y memoria de cálculo imprimible',tabla(['Artefacto','Recorrido','Real (m)','Equivalente (m)','Total (m)'],rutas)+memoria+'<p>Los equivalentes de la memoria corresponden al recorrido completo de control; no deben sumarse entre filas compartidas.</p>'+detalle('Desglose de accesorios por recorrido',aportes));
  const compra=e.compra;
  html+=detalle('Materiales y compra del escenario','<h3>Preparación de compra · ESTIMACIÓN PROVISIONAL</h3>'+tabla(['Caño por diámetro','Metros reales','Tiras estimadas','Metros comerciales','Sobrante estimado'],compra.canos.map(c=>[c.diametro,metros(c.metros),c.tiras,metros(c.metrosComerciales),metros(c.sobrante)]))+tabla(['Material del escenario','Cantidad','Unidad','Estado'],e.materiales.map(m=>[m.material,m.cantidad,m.unidad,m.estado]))+'<p>No sumar estos accesorios a los registrados: son las mismas piezas con las variantes del escenario. Los bujes son componentes del conjunto supuesto; las cuplas son estimaciones.</p>'+detalle('Cortes orientativos por tramo',tabla(['Tramo','Longitud (m)','Tiras','Cuplas estimadas · orientativas','Cortes / distribución'],compra.tramos.map(t=>[nombres.get(t.id)||'Tramo pendiente',metros(t.metros),t.tiras,e.cuplas.find(c=>c.tramoId===t.id)?.cantidad??'Pendiente',t.distribucionVigente?'Distribución registrada conservada':'Esquema de metraje: '+e.cortesOrientativos.find(c=>c.tramoId===t.id)?.piezas.map(m=>metros(m)+' m').join(' + ')+'; cortes físicos y posiciones sin verificar.'])))+'<p>Cortes orientativos sin margen supuesto de merma o unión; no representan un plano ni posiciones de accesorios.</p><p>'+esc(compra.estimacionCuplas.criterio)+'</p>');
  html+='<p class="ejercicio-pendiente"><strong>PENDIENTE DE VERIFICAR:</strong> piezas y uniones reales, suministro y requisitos normativos.</p>';
  html+=detalle('Condiciones y verificaciones · tres categorías','<h3>1. Resueltos automáticamente para la simulación</h3>'+lista(e.resoluciones)+'<h3>2. Datos necesarios para verificar una instalación real</h3>'+lista(e.validacion)+'<h3>3. Datos que impiden completar la simulación</h3>'+lista(e.bloqueos.length?e.bloqueos:['Ninguno para el inventario supuesto. Las condiciones reales permanecen sin verificar.']));
  return html+'<p>'+esc(e.fuente)+'</p>';
 }

 function documento(d){
  // Sólo etiquetas del documento. No se modifican modelo, grupos ni cantidades.
  const gas=d.titulo==='GAS',nombres=new Map();
  if(gas){
   for(const t of d.tramos||[])if(t.id&&!/^\d+$/.test(String(t.id))&&t.desde&&t.hasta)nombres.set(String(t.id),t.desde+'–'+t.hasta);
   for(const a of d.artefactos||[])if(a.id&&!/^\d+$/.test(String(a.id))&&a.nombre)nombres.set(String(a.id),a.nombre);
  }
  const escaparRx=x=>Array.from(x,c=>/[a-zA-Z0-9_-]/.test(c)?c:String.fromCharCode(92)+c).join('');
  const rx=nombres.size?new RegExp('(^|[^A-Za-z0-9_-])('+[...nombres.keys()].sort((a,b)=>b.length-a.length).map(escaparRx).join('|')+')(?=$|[^A-Za-z0-9_-])','g'):null;
  const etiqueta=v=>{
   if(!gas||typeof v!=='string')return v;
   let texto=String(v);if(rx)texto=texto.replace(rx,(_,sep,id)=>sep+nombres.get(id));
   return texto.replace(/\btramo-[a-z0-9]+-\d+\b/gi,'Tramo (ubicación pendiente)');
  };
  const celda=v=>esc(etiqueta(v));
  const tabla=(titulo,cab,filas,clase='')=>!filas.length?'':'<h2>'+esc(titulo)+'</h2><table'+(clase?' class="'+clase+'"':'')+'><thead><tr>'+cab.map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+filas.map(f=>'<tr>'+f.map((v,i)=>'<td>'+celda(clase&&i===5&&typeof v==='string'?v.replace(/; /g,';\n'):v)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
  const imagen=d.croquis&&/^(data:image\/(?:png|jpeg|webp);base64,|blob:)/.test(d.croquis.url)?'<figure class="croquis-entrega"><h2>Fotografía original del croquis</h2><img src="'+esc(d.croquis.url)+'" alt="Croquis aportado por el usuario"><figcaption>'+(d.croquis.confirmado?'Legibilidad y correspondencia confirmadas por el usuario.':'Referencia aportada: correspondencia con la red actual pendiente de confirmar.')+' Sin escala verificada.</figcaption></figure>':'';
  const dimensiones=d.planilla?tabla('Planilla de dimensionamiento',['TRAMO','REAL (m)','EQUIVALENTE (m)','DEFINITIVO (m)','CONSUMO (m³/h)','DIÁMETRO'],d.planilla.map(t=>[t.tramo,(gas?metros:numero)(t.real),(gas?metros:numero)(t.equivalente),(gas?metros:numero)(t.definitivo),numero(t.consumo),t.diametro])):
   tabla('Tramos',['Tramo','Longitud (m)','Diámetro','Estado'],d.tramos.map(t=>[t.desde+'–'+t.hasta,t.metros,t.diametro||'PENDIENTE',t.detalle?.estado==='pendiente'?'Accesorios pendientes':'Registrado; medidas manuales']));
  const materiales=d.materialesAgrupados?tabla('Materiales para revisión',['Material / accesorio','Diámetro','Cantidad','Unidad','Estado','Ubicación'],d.materialesAgrupados.map(f=>[f.material,f.diametro,f.cantidad,f.unidad,(f.estado==='estimado'?'PROVISIONAL (ESTIMADO)':f.estado.toUpperCase())+' · '+(f.revisado?'Revisado':'Sin revisar'),f.ubicaciones.join('; ')]),gas?'materiales-entrega':''):
   tabla('Materiales para revisión',['Material / accesorio','Diámetro','Cantidad','Unidad','Ubicación','Estado / observaciones'],d.filas.map(f=>[f.material,f.diametro,f.cantidad,f.unidad,f.ubicacion,(f.cantidad==null||/pendiente/i.test(f.diametro)?'PENDIENTE':String(f.estado).toUpperCase())+' · '+(f.revisado?'Revisado':'Sin revisar')+' · '+(f.evidencia||'')+(f.editado?' · Ajuste manual':'')]),gas?'materiales-entrega':'');
  const compra=gas&&d.preparacionCompra,preparacion=compra?tabla('Preparación de compra · ESTIMACIÓN PROVISIONAL',['Tramo / diámetro','Real (m)','Tiras / metros comerciales','Sobrante (m)','Cuplas estimadas'],compra.tramos.map(t=>[t.id+' · '+t.diametros.map(d=>d.valor+' ('+d.estado+')').join(' / '),numero(t.metros),t.tiras+' × '+compra.largoComercial+' m = '+numero(t.metrosComerciales)+' m',numero(t.sobrante),t.cuplas===null&&compra.estimacionCuplas?compra.estimacionCuplas.tramos.find(e=>e.id===t.id).cantidad+' estimadas · orientativas':t.cuplas===null?(t.cuplasConocidas?t.cuplasConocidas+' calculadas; resto pendiente':'Pendiente'):t.cuplas]))+'<p>Distribución estimada: no sumar estas tiras o cuplas a las filas anteriores como si fueran piezas adicionales. Diámetros y conexiones pendientes; no constituye compra definitiva.</p>'+compra.supuestos.concat(compra.estimacionCuplas?[compra.estimacionCuplas.criterio]:[],compra.tramos.filter(t=>t.cuplas===null&&t.cuplasConocidas>0).map(t=>t.id+': '+t.cuplasConocidas+' calculadas; resto pendiente para cantidad exacta.'),compra.pendientes).map(s=>'<p>'+celda(s)+'</p>').join('')+tabla('Conexiones propuestas · SIN CONFIRMAR',['Ubicación','Propuesta','Medidas'],compra.propuestas.map(p=>[p.ubicacion,p.material,p.diametro])):'';
  return '<h1>CAÑERÍAS · '+esc(d.titulo)+'</h1><p>'+esc(d.ambito)+'</p>'+imagen+ejercicioSigas(d.ejercicioSigas,true)+(d.ejercicioSigas?'<details open class="calculo-preliminar-pdf"><summary>Cálculo preliminar · datos registrados</summary><p>Utiliza los datos e identificaciones confirmadas guardados en el proyecto; no incorpora automáticamente las hipótesis hidráulicas del escenario. Los resultados pendientes pertenecen a este conjunto diferente de datos.</p>':'')+dimensiones+
   (d.planilla?.length?'<p>REAL: longitud física del tramo. EQUIVALENTE: accesorios del tramo. DEFINITIVO: longitud total del recorrido de cálculo más desfavorable que lo contiene; no es REAL + EQUIVALENTE de esa fila. Consumo acumulado transportado por el tramo.</p>':'')+
   tabla('Artefactos',['Artefacto','Consumo (kcal/h)'],d.artefactos.map(a=>[a.nombre,a.consumo]))+materiales+(d.ejercicioSigas?.esEjercicio===true?'':preparacion)+
   (d.ejercicioSigas?(d.ejercicioSigas.esEjercicio===false?(d.resumen||[]).filter(s=>/^(SIGAS GN · capacidad tabular.*: comprobada\.|Compatibilidad del suministro: comprobada|Aprobación normativa final:)/.test(s)):[]):d.resumen||[]).map(t=>'<p>'+celda(t)+'</p>').join('')+
   (d.observaciones?'<h2>Observaciones</h2><p>'+celda(d.observaciones)+'</p>':'')+
   '<p>'+celda(d.advertencia)+'</p>'+(d.ejercicioSigas?'</details>':'');
 }
 root.InformeProyecto={documento,agruparMateriales,planilla,ejercicioSigas};if(typeof module!=='undefined')module.exports=root.InformeProyecto;
})(typeof globalThis!=='undefined'?globalThis:this);
