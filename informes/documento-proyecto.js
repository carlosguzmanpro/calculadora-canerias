/* Formato de entrega: presentación de datos, sin dimensionar ni dibujar recorridos supuestos. */
(function(root){
 const esc=v=>String(v??'PENDIENTE').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
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
  const dimensiones=d.planilla?tabla('Planilla de dimensionamiento',['TRAMO','REAL (m)','EQUIVALENTE (m)','DEFINITIVO (m)','CONSUMO (m³/h)','DIÁMETRO'],d.planilla.map(t=>[t.tramo,numero(t.real),numero(t.equivalente),numero(t.definitivo),numero(t.consumo),t.diametro])):
   tabla('Tramos',['Tramo','Longitud (m)','Diámetro','Estado'],d.tramos.map(t=>[t.desde+'–'+t.hasta,t.metros,t.diametro||'PENDIENTE',t.detalle?.estado==='pendiente'?'Accesorios pendientes':'Registrado; medidas manuales']));
  const materiales=d.materialesAgrupados?tabla('Materiales para revisión',['Material / accesorio','Diámetro','Cantidad','Unidad','Estado','Ubicación'],d.materialesAgrupados.map(f=>[f.material,f.diametro,f.cantidad,f.unidad,(f.estado==='estimado'?'PROVISIONAL (ESTIMADO)':f.estado.toUpperCase())+' · '+(f.revisado?'Revisado':'Sin revisar'),f.ubicaciones.join('; ')]),gas?'materiales-entrega':''):
   tabla('Materiales para revisión',['Material / accesorio','Diámetro','Cantidad','Unidad','Ubicación','Estado / observaciones'],d.filas.map(f=>[f.material,f.diametro,f.cantidad,f.unidad,f.ubicacion,(f.cantidad==null||/pendiente/i.test(f.diametro)?'PENDIENTE':String(f.estado).toUpperCase())+' · '+(f.revisado?'Revisado':'Sin revisar')+' · '+(f.evidencia||'')+(f.editado?' · Ajuste manual':'')]),gas?'materiales-entrega':'');
  const compra=gas&&d.preparacionCompra,preparacion=compra?tabla('Preparación de compra · ESTIMACIÓN PROVISIONAL',['Tramo / diámetro','Real (m)','Tiras / metros comerciales','Sobrante (m)','Cuplas estimadas'],compra.tramos.map(t=>[t.id+' · '+t.diametros.map(d=>d.valor+' ('+d.estado+')').join(' / '),numero(t.metros),t.tiras+' × '+compra.largoComercial+' m = '+numero(t.metrosComerciales)+' m',numero(t.sobrante),t.cuplas===null?'Pendiente':t.cuplas]))+'<p>Distribución estimada: no sumar estas tiras o cuplas a las filas anteriores como si fueran piezas adicionales. Diámetros y conexiones pendientes; no constituye compra definitiva.</p>'+compra.supuestos.concat(compra.pendientes).map(s=>'<p>'+celda(s)+'</p>').join('')+tabla('Conexiones propuestas · SIN CONFIRMAR',['Ubicación','Propuesta','Medidas'],compra.propuestas.map(p=>[p.ubicacion,p.material,p.diametro])):'';
  return '<h1>CAÑERÍAS · '+esc(d.titulo)+'</h1><p>'+esc(d.ambito)+'</p>'+imagen+dimensiones+
   (d.planilla?.length?'<p>REAL: longitud física del tramo. EQUIVALENTE: accesorios del tramo. DEFINITIVO: longitud total del recorrido de cálculo más desfavorable que lo contiene; no es REAL + EQUIVALENTE de esa fila. Consumo acumulado transportado por el tramo.</p>':'')+
   tabla('Artefactos',['Artefacto','Consumo (kcal/h)'],d.artefactos.map(a=>[a.nombre,a.consumo]))+materiales+preparacion+
   (d.resumen||[]).map(t=>'<p>'+celda(t)+'</p>').join('')+
   (d.observaciones?'<h2>Observaciones</h2><p>'+celda(d.observaciones)+'</p>':'')+
   '<p>'+celda(d.advertencia)+'</p>';
 }
 root.InformeProyecto={documento,agruparMateriales,planilla};if(typeof module!=='undefined')module.exports=root.InformeProyecto;
})(typeof globalThis!=='undefined'?globalThis:this);
