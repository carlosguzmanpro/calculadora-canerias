/* Sin red ni servicios. Los datos declarados no equivalen a tablas verificadas. */
(function(root){
 const positivo=x=>Number.isFinite(x)&&x>0;
 function validarTablas(t3,t18){
  const errores=[],pendientes=[];
  if(!t3||!t18)return {habilitado:false,errores:['No se cargaron ambos archivos de tablas.'],pendientes:[],capacidades:0,coeficientes:0};
  if(t3.tabla!==3||t18.tabla!==18)errores.push('Identificación de tablas incorrecta.');
  if(t3.unidadLongitud!=='m'||t3.unidadCapacidad!=='L/h'||t18.unidadDiametro!=='m'||t18.unidadEquivalente!=='m')errores.push('Unidades inválidas: se esperan m y L/h, con diámetros y equivalentes normalizados a metros.');
  for(const t of [t3,t18]){
   if(!t.procedencia?.edicion||!t.procedencia?.documentoDeclarado||!t.procedencia?.fotografiaDisponible||!t.procedencia?.cotejoFotografico||!t.procedencia?.aplicabilidadVerificada)pendientes.push('Tabla '+t.tabla+': faltan fotografía, fuente/edición, cotejo y aplicabilidad verificados.');
   if(!t.transcripcionCompleta)pendientes.push('Tabla '+t.tabla+': transcripción parcial.');
  }
  const cols=t3.columnas,filas=t3.filas;
  if(!Array.isArray(cols)||!cols.length||new Set(cols).size!==cols.length||!Array.isArray(filas)||!filas.length)errores.push('Columnas o filas de capacidades inválidas.');
  let capacidades=0,coeficientes=0;
  if(Array.isArray(filas)&&Array.isArray(cols))filas.forEach((f,i)=>{
   if(!positivo(f.longitud)||(i&&f.longitud<=filas[i-1].longitud))errores.push('Longitud inválida, duplicada o desordenada en fila '+i+'.');
   if(!Array.isArray(f.capacidades)||f.capacidades.length!==cols.length){errores.push('Fila incompleta en '+f.longitud+' m.');return;}
   if(f.estado!=='cotejado')pendientes.push('Fila '+f.longitud+' m sin cotejo fotográfico.');
   f.capacidades.forEach((q,j)=>{
    if(q===null){pendientes.push('Capacidad dudosa/ausente en '+f.longitud+' m / '+cols[j]+'.');return;}
    if(!positivo(q)){errores.push('Capacidad inválida en '+f.longitud+' m / '+cols[j]+'.');return;}
    capacidades++;
    if(j&&positivo(f.capacidades[j-1])&&q<f.capacidades[j-1])errores.push('Capacidad decrece al aumentar diámetro en '+f.longitud+' m.');
    const previa=filas[i-1]?.capacidades?.[j];
    if(i&&positivo(previa)&&q>previa)errores.push('Capacidad crece al aumentar longitud para '+cols[j]+'.');
   });
  });
  if(t3.condiciones?.gas!=='GN'||t3.condiciones?.densidadRelativa!==0.65||t3.condiciones?.referenciaH?.valor!==10||t3.condiciones?.referenciaH?.unidad!=='mmca'||!t3.condiciones?.referenciaH?.significadoVerificado)pendientes.push('Condiciones de Tabla 3 sin verificación completa; h no es presión de suministro.');
  if(!t3.ejerciciosValidados)pendientes.push('Comparación numérica con ejercicios de clase pendiente.');
  if(!Array.isArray(t18.diametros)||!t18.diametros.length)errores.push('Faltan columnas de diámetros interiores.');
  else {
   if(new Set(t18.diametros.map(d=>d.nominal)).size!==t18.diametros.length)errores.push('Diámetros nominales duplicados.');
   t18.diametros.forEach((d,i,ds)=>{
    if(!positivo(d.interiorM)||d.estado!=='cotejado')pendientes.push('Diámetro interior pendiente: '+d.nominal+'.');
    if(d.interiorM!==null&&!positivo(d.interiorM))errores.push('Diámetro interior inválido: '+d.nominal+'.');
    if(i&&positivo(d.interiorM)&&positivo(ds[i-1].interiorM)&&d.interiorM<=ds[i-1].interiorM)errores.push('Diámetros interiores inconsistentes.');
   });
   if(Array.isArray(cols)&&cols.some(c=>!t18.diametros.some(d=>d.nominal===c)))pendientes.push('Falta diámetro interior para una columna de Tabla 3.');
  }
  const requeridos=['codo45','codo90','curva','tee-directo','tee-giro90','reduccion','valvula-globo','valvula-esclusa','valvula-macho'];
  if(!Array.isArray(t18.accesorios))errores.push('Lista de accesorios inválida.');
  else{
   if(new Set(t18.accesorios.map(a=>a.tipo)).size!==t18.accesorios.length)errores.push('Accesorios duplicados.');
   for(const tipo of requeridos)if(!t18.accesorios.some(a=>a.tipo===tipo))pendientes.push('Falta coeficiente de '+tipo+'.');
   for(const a of t18.accesorios){if(!positivo(a.factorD))errores.push('Coeficiente inválido: '+a.tipo+'.');else coeficientes++;if(a.estado!=='cotejado')pendientes.push('Coeficiente '+a.tipo+' sin cotejo fotográfico.');}
  }
  if(!t18.redondeo?.verificado||!Number.isInteger(t18.redondeo?.decimales)||t18.redondeo.decimales<0||t18.redondeo.decimales>8||t18.redondeo?.regla!=='mas-cercano')pendientes.push('Criterio de redondeo sin verificar o no soportado.');
  if(!['incluir','excluir-con-fuente'].includes(t18.metodoClase?.politicaCuplas)||!t18.metodoClase?.fuentePoliticaCuplas)pendientes.push('Cuplas: falta criterio documentado.');
  if(t18.metodoClase?.reduccionesEnMateriales!==true||t18.metodoClase?.reduccionesEnEquivalentes!==false)errores.push('El método de clase requiere reducciones en materiales y fuera de equivalentes.');
  pendientes.push(...(t3.pendientes||[]),...(t18.pendientes||[]));
  return {habilitado:errores.length===0&&pendientes.length===0,errores,pendientes:[...new Set(pendientes)],capacidades,coeficientes};
 }
 function consultarCapacidadDeclarada(t,longitud,diametro){
  if(t?.unidadCapacidad!=='L/h'||t.unidadLongitud!=='m'||!positivo(longitud))throw Error('Unidades o longitud inválidas.');
  const col=t.columnas.indexOf(diametro);if(col<0)throw Error('Diámetro no transcrito.');
  const filas=t.filas;
  if(filas.some((f,i)=>!positivo(f.longitud)||(i&&f.longitud<=filas[i-1].longitud)))throw Error('Filas inválidas o desordenadas.');
  const fila=filas.find(f=>f.longitud>=longitud);if(!fila)throw Error('Fuera de tabla: no se extrapola.');
  if(!Array.isArray(fila.capacidades)||fila.capacidades.length!==t.columnas.length||!positivo(fila.capacidades[col]))throw Error('Celda ausente o dudosa: no se interpola ni salta la fila.');
  return {longitudFila:fila.longitud,litrosHora:fila.capacidades[col],metrosCubicosHora:fila.capacidades[col]/1000,estado:'CONSULTA DE DATOS DECLARADOS; NO DIÁMETRO DEFINITIVO'};
 }
 function caudalClaseDesdeKcal(kcalHora){
  if(!positivo(kcalHora))throw Error('Consumo de placa pendiente o inválido.');
  const metrosCubicosHora=kcalHora/9300;
  return {metrosCubicosHora,litrosHora:metrosCubicosHora*1000,poderCalorificoKcalM3:9300};
 }
 const api={validarTablas,consultarCapacidadDeclarada,caudalClaseDesdeKcal};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.ValidacionTablasGas=api;
})(globalThis);
