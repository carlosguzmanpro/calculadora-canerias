/* Diagnóstico de solo lectura: no alimenta listas de compra ni cambia proyectos. */
function seleccionarCatalogoSistemaGas(id){
 if(modulo!=='gas'||(id&&!Object.values(CatalogosSistemasGas.IDS).includes(id)))return false;
 // Guardar solo la elección; no sobrescribir material, unión, diámetros ni cantidades heredadas.
 instalacionGas.perfil.catalogoTecnicoGas=id;
 guardarDatos();mostrarPreparacionDiametrosGas();
 const guardado=proyectoGuardadoGas()?.instalacion?.perfil?.catalogoTecnicoGas;
 $('estadoCatalogoSistemaGas').textContent=(id?'Selección conservada para este proyecto.':'Sin selección; los datos de material y unión se conservaron.')+(guardado!==instalacionGas.perfil.catalogoTecnicoGas?' Guardado local no confirmado: conservá un respaldo.':'')+' Los diámetros siguen pendientes de verificación.';
 return true;
}
function inventarioAccesoriosParaMotorGas(red){
 // La tubería de materiales ya resuelve carga rápida/detalle/sugerencias. Reutilizarla sin persistir ni modificar sus opciones.
 const p=proyectoGasActual(),tenia=Object.hasOwn(p,'planCompra'),original=p.planCompra;
 p.planCompra=original?JSON.parse(JSON.stringify(original)):{};
 try{
  const entrada=entradaManualMaterialesGas();
  return CatalogosSistemasGas.prepararAccesorios(piezasConciliacionGas(entrada),red,entrada.tramos.map(t=>({...t,desde:tramos.find(o=>o.id===t.id)?.desde||'',hasta:tramos.find(o=>o.id===t.id)?.hasta||''})),entrada.manualDirecto?.ceros||[],entrada.manualDirecto?.pendientes||[],opcionesMaterialesGas('proyecto'));
 }finally{if(tenia)p.planCompra=original;else delete p.planCompra;}
}
function mostrarPreparacionDiametrosGas(){
 if(modulo!=='gas')return null;
 const out=$('preparacionDiametrosGas');out.replaceChildren();
 const texto=(s,padre=out)=>{const p=document.createElement('p');p.textContent=s;padre.append(p);};
 const redActual=redFisicaManualGas(),r=PreparacionDiametrosGas.prepararRed(redActual,tramos,instalacionGas.perfil);
 const catalogo=CatalogosSistemasGas.obtener(CatalogosSistemasGas.identificar(instalacionGas.perfil),TABLA_NAG200_3,TABLA_NAG200_18);
 $('catalogoSistemaGas').value=catalogo.id||'';
 $('estadoCatalogoSistemaGas').textContent='Catálogo: '+catalogo.nombre+'. Sin diámetros habilitados.';
 let accesorios;try{accesorios=inventarioAccesoriosParaMotorGas(redActual);}catch(e){accesorios={fisicas:[],ceros:[],pendientes:['No se pudo preparar el inventario técnico: '+e.message]};}
 const inventario=catalogo.id===CatalogosSistemasGas.IDS.epoxi?PreparacionDiametrosGas.inventario(catalogo.tablas[0],catalogo.tablas[1],ValidacionTablasGas.validarTablas):{tablas:[],errores:[],pendientes:[],otrosSistemas:'Las tablas de acero epoxi y SIGAS se mantienen separadas. No hay reemplazos automáticos.'};
 const fuenteActual=proyectoGasActual().derivadosGas,firma=JSON.stringify({tramos,artefactos,instalacion:instalacionGas,tipoGas:$('gt').value});
 const medidas=CatalogosSistemasGas.resultadoPorTramo(tramos,fuenteActual?.dimensionamiento,firma,fuenteActual?.firma,{catalogoHabilitado:catalogo.habilitado,verificacionTecnica:false});
 texto('Material seleccionado: '+(instalacionGas.perfil.material||'Pendiente')+' · sistema: '+(instalacionGas.perfil.sistema||'Pendiente')+' · gas: '+(instalacionGas.perfil.gas||'Pendiente')+'.');
 texto('DIÁMETROS PENDIENTES · Los materiales y los consumos conocidos se pueden seguir calculando. No necesitás volver a cargar accesorios.');
 for(const t of r.porTramo)texto(t.nombre+' · real '+t.longitudReal+' m · consumo '+(t.consumoKcal===null?'Pendiente':t.consumoKcal+' kcal/h')+' · caudal '+(t.caudal===null?'Pendiente':t.caudal.toLocaleString('es-AR',{maximumFractionDigits:4})+' m³/h')+' · diámetro '+(medidas.find(m=>m.tramo===t.nombre)?.diametro||'Pendiente'));
 for(const recorrido of r.recorridos)texto('Recorrido a '+recorrido.artefacto+': '+recorrido.longitudReal+' m reales. Equivalente y longitud definitiva: Pendiente.');
 const detalles=document.createElement('details'),resumen=document.createElement('summary');resumen.textContent='Datos técnicos pendientes y tablas disponibles';detalles.append(resumen);out.append(detalles);
 texto('Catálogo seleccionado: '+catalogo.nombre+(catalogo.origenConfirmadoPorPropietario?' · origen confirmado por el propietario; verificación técnica pendiente.':'.'),detalles);
 texto('Accesorios: se reutilizan '+accesorios.fisicas.reduce((s,a)=>s+a.cantidad,0)+' piezas identificadas. Esta preparación no añade otra lista de compra ni asigna equivalentes.',detalles);
 for(const t of inventario.tablas)texto('Tabla '+t.numero+': '+t.valores+' valores transcritos · fuente '+(t.archivo||'Pendiente')+' · edición '+(t.edicion||'Pendiente')+' · aplicabilidad no habilitada.',detalles);
 texto(inventario.otrosSistemas,detalles);
 for(const s of [...new Set([...r.errores,...r.pendientes,...inventario.errores,...inventario.pendientes,...catalogo.pendientes,...CatalogosSistemasGas.compatibilidad(instalacionGas.perfil,catalogo),...accesorios.pendientes])])texto(s,detalles);
 if(catalogo.id===CatalogosSistemasGas.IDS.epoxi)texto('Las fotos están conservadas; falta documentar edición y vigencia, fabricante/interiores reales, compatibilidad del sistema, condiciones de suministro y validación independiente. No basta con que pasen las pruebas automáticas.',detalles);
 return {red:r,inventario,catalogo,accesorios,medidas};
}
