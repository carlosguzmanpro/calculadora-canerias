/* Diagnóstico de solo lectura: no alimenta listas de compra ni cambia proyectos. */
function mostrarPreparacionDiametrosGas(){
 if(modulo!=='gas')return null;
 const out=$('preparacionDiametrosGas');out.replaceChildren();
 const texto=(s,padre=out)=>{const p=document.createElement('p');p.textContent=s;padre.append(p);};
 const r=PreparacionDiametrosGas.prepararRed(redFisicaManualGas(),tramos,instalacionGas.perfil);
 const inventario=PreparacionDiametrosGas.inventario(TABLA_NAG200_3,TABLA_NAG200_18,ValidacionTablasGas.validarTablas);
 texto('Material seleccionado: '+(instalacionGas.perfil.material||'Pendiente')+' · sistema: '+(instalacionGas.perfil.sistema||'Pendiente')+' · gas: '+(instalacionGas.perfil.gas||'Pendiente')+'.');
 texto('DIÁMETROS PENDIENTES · Los materiales y los consumos conocidos se pueden seguir calculando. No necesitás volver a cargar accesorios.');
 for(const t of r.porTramo)texto(t.nombre+' · real '+t.longitudReal+' m · consumo '+(t.consumoKcal===null?'Pendiente':t.consumoKcal+' kcal/h')+' · caudal '+(t.caudal===null?'Pendiente':t.caudal.toLocaleString('es-AR',{maximumFractionDigits:4})+' m³/h')+' · diámetro Pendiente');
 for(const recorrido of r.recorridos)texto('Recorrido a '+recorrido.artefacto+': '+recorrido.longitudReal+' m reales. Equivalente y longitud definitiva: Pendiente.');
 const detalles=document.createElement('details'),resumen=document.createElement('summary');resumen.textContent='Datos técnicos pendientes y tablas disponibles';detalles.append(resumen);out.append(detalles);
 for(const t of inventario.tablas)texto('Tabla '+t.numero+': '+t.valores+' valores transcritos · fuente '+(t.archivo||'Pendiente')+' · edición '+(t.edicion||'Pendiente')+' · aplicabilidad no habilitada.',detalles);
 texto(inventario.otrosSistemas,detalles);
 for(const s of [...new Set([...r.errores,...r.pendientes,...inventario.errores,...inventario.pendientes])])texto(s,detalles);
 texto('Las fotos están conservadas; falta documentar edición y vigencia, fabricante/interiores reales, compatibilidad del sistema, condiciones de suministro y validación independiente. No basta con que pasen las pruebas automáticas.',detalles);
 return {red:r,inventario};
}
