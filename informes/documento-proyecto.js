/* Documento estático: solo datos, sin copiar el DOM de la aplicación. */
(function(root){
 const esc=v=>String(v??'PENDIENTE').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function documento(d){
  const tabla=(titulo,cab,filas)=>!filas.length?'':'<h2>'+esc(titulo)+'</h2><table><thead><tr>'+cab.map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+filas.map(f=>'<tr>'+f.map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
  return '<h1>CAÑERÍAS · '+esc(d.titulo)+'</h1><p>'+esc(d.ambito)+'</p>'+
   tabla('Tramos',['Tramo','Longitud (m)','Diámetro','Estado'],d.tramos.map(t=>[t.desde+'–'+t.hasta,t.metros,t.diametro||'PENDIENTE',t.detalle?.estado==='pendiente'?'Accesorios pendientes':'Registrado; medidas manuales']))+
   tabla('Artefactos',['Artefacto','Consumo (kcal/h)'],d.artefactos.map(a=>[a.nombre,a.consumo]))+
   tabla('Materiales para revisión',['Material / accesorio','Diámetro','Cantidad','Unidad','Ubicación','Estado / observaciones'],d.filas.map(f=>[f.material,f.diametro,f.cantidad,f.unidad,f.ubicacion,(f.cantidad==null||/pendiente/i.test(f.diametro)?'PENDIENTE':String(f.estado).toUpperCase())+' · '+(f.revisado?'Revisado':'Sin revisar')+' · '+(f.evidencia||'')+(f.editado?' · Ajuste manual':'')]))+
   (d.resumen||[]).map(t=>'<p>'+esc(t)+'</p>').join('')+
   (d.observaciones?'<h2>Observaciones</h2><p>'+esc(d.observaciones)+'</p>':'')+
   '<p>'+esc(d.advertencia)+'</p>';
 }
 root.InformeProyecto={documento};if(typeof module!=='undefined')module.exports=root.InformeProyecto;
})(typeof globalThis!=='undefined'?globalThis:this);
