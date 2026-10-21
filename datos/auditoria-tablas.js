/* Auditoría sin red, sin modificar tablas originales ni habilitar el motor. */
(function(root){
 function auditarTabla3(t,ref){
  const errores=[],alertas=['La referencia congela la transcripción de 1e99313: no prueba exactitud normativa ni sustituye cotejo independiente de cada cifra.'];
  let posiciones=0,coincidencias=0,coincidenciasBase=0;const diferencias=[],correccionesDocumentadas=[];
  if(!t||!ref||!Array.isArray(ref.columnas)||!Array.isArray(ref.longitudes)||!Array.isArray(ref.capacidades))return {integra:false,errores:['Faltan tabla o referencia de integridad.'],alertas,posiciones,coincidencias,diferencias};
  if(t.unidadCapacidad!=='L/h'||t.unidadLongitud!=='m')errores.push('Unidades incorrectas: se esperan L/h y metros.');
  if(!Array.isArray(t.columnas)||JSON.stringify(t.columnas)!==JSON.stringify(ref.columnas))errores.push('Encabezados ausentes, duplicados, incompletos o desordenados.');
  if(!Array.isArray(t.filas))return {integra:false,errores:[...errores,'No hay filas válidas.'],alertas,posiciones,coincidencias,diferencias};
  const vistas=new Set();
  for(const [i,f]of t.filas.entries()){
   if(!f||!Number.isFinite(f.longitud)||f.longitud<=0){errores.push('Fila inválida en posición '+(i+1));continue;}
   if(vistas.has(f.longitud))errores.push('Longitud duplicada: '+f.longitud+' m.');vistas.add(f.longitud);
   if(f.longitud!==ref.longitudes[i])errores.push('Orden/cantidad de filas distinto de la referencia en posición '+(i+1)+'.');
   const ri=ref.longitudes.indexOf(f.longitud);
   if(ri<0){errores.push('Fila no presente en fotografía transcrita: '+f.longitud+' m.');continue;}
   if(!Array.isArray(f.capacidades)||f.capacidades.length!==ref.columnas.length){errores.push('Fila incompleta en '+f.longitud+' m.');continue;}
   for(let j=0;j<ref.columnas.length;j++){
    posiciones++;const valor=f.capacidades[j],esperado=ref.capacidades[ri]?.[j];
    if(!Number.isInteger(valor)||valor<=0)errores.push('Capacidad inválida: '+f.longitud+' m / '+ref.columnas[j]+'.');
    const correccion=ref.correccionesAuditadas?.find(c=>c.longitud===f.longitud&&c.diametro===ref.columnas[j]);
    if(correccion){
     if(correccion.anterior!==esperado||valor!==correccion.corregido)diferencias.push({longitud:f.longitud,diametro:ref.columnas[j],registrado:valor,referencia:correccion.corregido});
     else{coincidencias++;correccionesDocumentadas.push({...correccion});}
    }else if(valor===esperado){coincidencias++;coincidenciasBase++;}else diferencias.push({longitud:f.longitud,diametro:ref.columnas[j],registrado:valor,referencia:esperado});
    if(j&&Number.isFinite(f.capacidades[j-1])&&valor<f.capacidades[j-1])errores.push('Capacidad decreciente con diámetro en '+f.longitud+' m.');
    const anterior=t.filas[i-1]?.capacidades?.[j];
    if(i&&Number.isFinite(anterior)&&valor>anterior)errores.push('Capacidad creciente con longitud en '+ref.columnas[j]+'.');
   }
  }
  for(const l of ref.longitudes)if(!vistas.has(l))errores.push('Falta fila fotografiada de '+l+' m.');
  if(diferencias.length)errores.push(diferencias.length+' capacidades distintas de la referencia; revisar coordenadas, sin corregir automáticamente.');
  if(t.procedencia?.sha256!==ref.fotoSha256)errores.push('Identificador de fotografía distinto de la referencia.');
  return {integra:errores.length===0&&posiciones===441&&coincidencias===441,errores:[...new Set(errores)],alertas,posiciones,coincidencias,coincidenciasBase,correccionesDocumentadas,diferencias};
 }
 function auditarRedondeos(t){
  const filas=[],errores=[];
  if(!t||!Array.isArray(t.complemento)||!Array.isArray(t.diametros)||!Array.isArray(t.accesorios))return {filas,errores:['Falta complemento de Tabla 18.']};
  for(const f of t.complemento){
   const factor=t.accesorios.find(a=>a.tipo===f.tipo)?.factorD;
   if(!Array.isArray(f.equivalentesM))continue;
   for(const [i,impreso]of f.equivalentesM.entries()){
    const d=t.diametros[i]?.diametroTabuladoM;
    if(impreso===null)continue;
    if(!Number.isFinite(impreso)||!Number.isFinite(d)||!Number.isFinite(factor)||!Number.isInteger(f.cantidad)){errores.push('Datos inválidos en '+f.tipo+' / '+f.cantidad);continue;}
    // Aritmética en enteros: los d fotografiados tienen tres decimales.
    const mm=Math.round(d*1000),milimetros=f.cantidad*factor*mm;
    const calculado=milimetros/1000,centimos=Math.round(milimetros/10),redondeado=centimos/100;
    if(Math.abs(impreso-redondeado)<1e-9)continue;
    const truncado=Math.trunc(milimetros/10)/100;
    const explicacion=Math.abs(impreso-truncado)<1e-9?'Compatible con truncamiento a dos decimales en esta celda; hipótesis, no regla confirmada.':'No coincide con truncamiento ni redondeo al centésimo usando d mostrado; posible errata o criterio/d interno diferente, sin evidencia suficiente.';
    filas.push({accesorio:f.tipo,cantidad:f.cantidad,diametro:t.diametros[i].nominal,impreso,calculado,redondeado,diferencia:Number((impreso-calculado).toFixed(6)),diferenciaCentésimo:Number((impreso-redondeado).toFixed(6)),posibleExplicacion:explicacion,estado:'Impreso conservado; criterio técnico pendiente',origenImpreso:'Fotografía Tabla 18',origenCalculado:'cantidad × factor × d tabulado; valor derivado, no leído'});
   }
  }
  return {filas,errores};
 }
 function auditarDudas(t){
  const objetivos=[{tipo:'codo90',cantidad:5,nominal:'2"',factor:30,d:.051,impresoCotejado:7.67},
   {tipo:'tee-directo',cantidad:5,nominal:'3"',factor:20,d:.076,impresoCotejado:7.60}];
  return objetivos.map(c=>{
   const i=t?.diametros?.findIndex(d=>d.nominal===c.nominal),valor=t?.complemento?.find(f=>f.tipo===c.tipo&&f.cantidad===c.cantidad)?.equivalentesM?.[i];
   const calculado=c.cantidad*c.factor*Math.round(c.d*1000)/1000;
   const cotejo=t?.celdasReexaminadas?.find(f=>f.tipo===c.tipo&&f.cantidad===c.cantidad&&f.columna===c.nominal);
   const lecturaConfirmada=valor===c.impresoCotejado&&cotejo?.valorImpreso===valor&&!!cotejo.estadoLectura;
   const diferencia=valor==null?null:Number((valor-calculado).toFixed(6));
   return {...c,valorOriginal:valor??null,calculado,diferencia,lecturaConfirmada,
    estado:!lecturaConfirmada?'Lectura pendiente; no completar por fórmula':diferencia===0?'Impreso cotejado y aritmética coincidente; aplicabilidad técnica pendiente':'Impreso cotejado; divergencia técnica NO resuelta',
    explicacion:!lecturaConfirmada?'Falta lectura cotejada; el producto no confirma la cifra impresa.':diferencia===0?'7,60 coincide con 5 × 20 × 0,076. La lectura anterior 7,61 se descarta.':'Se lee 7,67, pero 5 × 30 × 0,051 = 7,65 exactos; la diferencia de 0,02 m no es redondeo al centésimo. Posible errata o d distinto no documentado; ninguna hipótesis confirmada.'};
  });
 }
 const api={auditarTabla3,auditarRedondeos,auditarDudas};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.AuditoriaFinalTablasGas=api;
})(globalThis);
