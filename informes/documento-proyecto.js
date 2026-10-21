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
  const tabla=(titulo,cab,filas)=>!filas.length?'':'<h2>'+esc(titulo)+'</h2><table><thead><tr>'+cab.map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+filas.map(f=>'<tr>'+f.map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
  const imagen=d.croquis&&/^(data:image\/(?:png|jpeg|webp);base64,|blob:)/.test(d.croquis.url)?'<figure class="croquis-entrega"><h2>Croquis aportado</h2><img src="'+esc(d.croquis.url)+'" alt="Croquis aportado por el usuario"><figcaption>Legibilidad y correspondencia confirmadas por el usuario. Sin escala verificada.</figcaption></figure>':'';
  const dimensiones=d.planilla?tabla('Planilla de dimensionamiento',['TRAMO','REAL (m)','EQUIVALENTE (m)','DEFINITIVO (m)','CONSUMO (m³/h)','DIÁMETRO'],d.planilla.map(t=>[t.tramo,numero(t.real),numero(t.equivalente),numero(t.definitivo),numero(t.consumo),t.diametro])):
   tabla('Tramos',['Tramo','Longitud (m)','Diámetro','Estado'],d.tramos.map(t=>[t.desde+'–'+t.hasta,t.metros,t.diametro||'PENDIENTE',t.detalle?.estado==='pendiente'?'Accesorios pendientes':'Registrado; medidas manuales']));
  const materiales=d.materialesAgrupados?tabla('Materiales para revisión',['Material / accesorio','Diámetro','Cantidad','Unidad','Estado','Ubicación'],d.materialesAgrupados.map(f=>[f.material,f.diametro,f.cantidad,f.unidad,f.estado.toUpperCase()+' · '+(f.revisado?'Revisado':'Sin revisar'),f.ubicaciones.join('; ')])):
   tabla('Materiales para revisión',['Material / accesorio','Diámetro','Cantidad','Unidad','Ubicación','Estado / observaciones'],d.filas.map(f=>[f.material,f.diametro,f.cantidad,f.unidad,f.ubicacion,(f.cantidad==null||/pendiente/i.test(f.diametro)?'PENDIENTE':String(f.estado).toUpperCase())+' · '+(f.revisado?'Revisado':'Sin revisar')+' · '+(f.evidencia||'')+(f.editado?' · Ajuste manual':'')]));
  return '<h1>CAÑERÍAS · '+esc(d.titulo)+'</h1><p>'+esc(d.ambito)+'</p>'+imagen+dimensiones+
   (d.planilla?.length?'<p>REAL: longitud física del tramo. EQUIVALENTE: accesorios del tramo. DEFINITIVO: longitud total del recorrido de cálculo más desfavorable que lo contiene; no es REAL + EQUIVALENTE de esa fila. Consumo acumulado transportado por el tramo.</p>':'')+
   tabla('Artefactos',['Artefacto','Consumo (kcal/h)'],d.artefactos.map(a=>[a.nombre,a.consumo]))+materiales+
   (d.resumen||[]).map(t=>'<p>'+esc(t)+'</p>').join('')+
   (d.observaciones?'<h2>Observaciones</h2><p>'+esc(d.observaciones)+'</p>':'')+
   '<p>'+esc(d.advertencia)+'</p>';
 }
 root.InformeProyecto={documento,agruparMateriales,planilla};if(typeof module!=='undefined')module.exports=root.InformeProyecto;
})(typeof globalThis!=='undefined'?globalThis:this);
