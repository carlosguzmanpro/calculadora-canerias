/* SIGAS ed.15: consultas documentales y diagnóstico parcial. No habilita dimensionamiento. */
(function(root){
 const SHA='a7dc5dd90adec7d9db335100407d4748f306281b3917e2e52a8f2b707d35e2b1';
 const positivo=x=>Number.isFinite(x)&&x>0;
 const datosValidos=d=>d?.id==='sigas'&&d.fuente?.sha256===SHA&&d.fuente?.edicion==='15 - 2025'&&d.fuente?.paginas===48;
 const numeroOriginal=s=>typeof s==='string'&&/^\d+,\d+$/.test(s)?Number(s.replace(',','.')):NaN;
 function validar(d){
  const errores=[],alertas=[];if(!datosValidos(d))return {habilitado:false,errores:['Fuente SIGAS ausente o diferente del manual identificado.'],alertas};
  for(const [id,gas,densidad]of [[4,'GN',.65],[5,'propano-gaseoso',1.52]]){
   const t=d.tablas[id];
   if(t?.numero!==id||t?.pagina!==id+18||t?.gas!==gas||t?.densidadRelativa!==densidad||t?.unidadCapacidad!=='m3/h'||t?.unidadLongitud!=='m'||t?.unidadDiametros!=='mm')errores.push('Identificación, gas, densidad o unidades incorrectas en Tabla '+id+'.');
   if(JSON.stringify(t?.exterioresMm)!==JSON.stringify([20,25,32,40,50,63,75,90,110])||JSON.stringify(t?.interioresTabuladosMm)!==JSON.stringify([13.24,18.19,24.94,33,42.8,54.84,63,74,94]))errores.push('Encabezados exteriores/interiores SIGAS distintos del manual.');
   if(!Array.isArray(t?.filas)||t.filas.length!==60||t.exterioresMm?.length!==9||t.interioresTabuladosMm?.length!==9){errores.push('Filas o encabezados incompletos en Tabla '+id+'.');continue;}
   const longitudes=[1,2,3,4,5,6,7,8,9,10,...Array.from({length:20},(_,i)=>12+2*i),...Array.from({length:30},(_,i)=>55+5*i)];
   for(const [i,f]of t.filas.entries()){
    if(f.longitudM!==longitudes[i])errores.push('Longitud distinta del original SIGAS.');
    if(!positivo(f.longitudM)||(i&&f.longitudM<=t.filas[i-1].longitudM)||f.pagina!==t.pagina)errores.push('Longitud duplicada/desordenada o página incorrecta en Tabla '+id+'.');
    if(f.capacidadesM3h?.length!==9||f.originales?.length!==9){errores.push('Fila incompleta en Tabla '+id+' / '+f.longitudM+' m.');continue;}
    f.capacidadesM3h.forEach((q,j)=>{if(!positivo(q)||q!==numeroOriginal(f.originales[j]))errores.push('Valor/unidad distintos del original: Tabla '+id+' / '+f.longitudM+' m / '+t.exterioresMm[j]+' mm.');if(j&&q<f.capacidadesM3h[j-1]||i&&q>t.filas[i-1].capacidadesM3h[j])errores.push('Capacidad inconsistente en Tabla '+id+' / '+f.longitudM+' m.');});
   }
  }
  const t6=d.tablas[6];if(t6?.gas!=='GN'||t6?.unidadDiametro!=='mm'||t6?.unidadLongitud!=='m'||t6?.numero!==6||t6?.pagina!==21)errores.push('Tabla6: unidades o alcance incorrectos.');if(t6?.filas?.length!==21||t6.longitudesM?.length!==18)errores.push('Tabla 6 incompleta.');
  else for(const [i,f]of t6.filas.entries()){if(!Array.isArray(f.diametrosMm)){errores.push('Fila de Tabla6 malformada.');continue;}if(f.diametrosMm.some((q,j)=>j<([16,14,13,11][i-17]??18)?q===null:q!==null))errores.push('Casillero vacío distinto del original en Tabla 6.');if(f.pagina!==21||f.diametrosMm?.length!==18||f.diametrosMm.some(q=>q!==null&&![25,32,40,50,63,75,90,110].includes(q)))errores.push('Fila inválida de prolongaciones.');}
  const t3=d.tablas[3],ids=new Set();
  if(t3?.filas?.length!==202||t3.unidadEquivalente!=='m'||t3.unidadDiametro!=='m'||t3.tipoDiametro!=='exterior (no interior)')errores.push('Tabla 3 incompleta o diámetro/unidad incorrectos.');
  for(const f of t3?.filas||[]){if(ids.has(f.id)||![24,25].includes(f.pagina)||!positivo(f.longitudEquivalenteM)||!positivo(f.diametroExteriorM)||!Number.isInteger(f.numeroDiametros)||f.numeroDiametros<=0||f.longitudEquivalenteM!==numeroOriginal(f.originales?.longitudEquivalente)||f.diametroExteriorM!==numeroOriginal(f.originales?.diametroExterior)||f.numeroDiametros!==Number(f.originales?.numeroDiametros))errores.push('Registro de accesorio inválido: '+f.id+'.');ids.add(f.id);}
  const nombres=new Map();for(const f of t3?.filas||[]){const k=f.nombreOriginal.trim().toLowerCase();if(!nombres.has(k))nombres.set(k,[]);nombres.get(k).push(f);}
  const duplicados=[...nombres.values()].filter(xs=>xs.length>1).map(xs=>({nombre:xs[0].nombreOriginal,ids:xs.map(f=>f.id),valores:xs.map(f=>f.longitudEquivalenteM)}));
  if(duplicados.length)alertas.push('Nombres repetidos: no seleccionar por nombre ni resolver por promedio.');
  const diferencias=(t3?.filas||[]).filter(f=>Math.round(f.longitudEquivalenteM/f.diametroExteriorM)!==f.numeroDiametros).map(f=>({id:f.id,pagina:f.pagina,nombre:f.nombreOriginal,equivalenteImpresoM:f.longitudEquivalenteM,diametroExteriorM:f.diametroExteriorM,numeroImpreso:f.numeroDiametros,cocienteDerivado:f.longitudEquivalenteM/f.diametroExteriorM,estado:'Conservar impresos; pedir criterio al fabricante'}));
  if(diferencias.length)alertas.push('Longitud equivalente y Nº de Ø no coinciden por simple redondeo en '+diferencias.length+' accesorios. No recalcular la columna impresa.');
  alertas.push('Tabla 5, 75 m / 75, 90 y 110 mm: descenso distinto del patrón de las otras columnas; cotejado con el PDF, pendiente aclaración del fabricante.','Ejemplos pp.26–27 remiten Tabla 6 a pp.24–25, pero está en p.21. Conservar la referencia literal como discrepancia editorial.','Edición identificada no equivale a condiciones de suministro ni validación normativa vigente.');
  return {habilitado:false,errores,alertas,duplicados,diferencias};
 }
 function capacidad(d,numero,longitudM,exteriorMm,{criterio='exacta'}={}){
  if(!datosValidos(d)||![4,5].includes(numero)||!positivo(longitudM)||!['exacta','superior-diagnostico'].includes(criterio))throw Error('Consulta SIGAS inválida.');
  const t=d.tablas[numero];if(t.unidadCapacidad!=='m3/h'||t.unidadLongitud!=='m')throw Error('Unidades SIGAS incorrectas.');
  const j=t.exterioresMm.indexOf(exteriorMm);if(j<0)throw Error('Diámetro exterior no tabulado SIGAS. No se usan pulgadas epoxi.');
  const f=t.filas.find(f=>criterio==='exacta'?f.longitudM===longitudM:f.longitudM>=longitudM);
  if(!f||!positivo(f.capacidadesM3h[j]))throw Error('Fila SIGAS ausente: no interpolar, extrapolar ni completar.');
  return {tabla:numero,pagina:t.pagina,gas:t.gas,longitudSolicitadaM:longitudM,longitudFilaM:f.longitudM,exteriorMm,interiorTabuladoMm:t.interioresTabuladosMm[j],capacidadM3h:f.capacidadesM3h[j],densidadTabulada:t.densidadRelativa,caidaPresionImpresa:t.caidaPresionImpresa,criterio,estado:'Consulta documental; no diámetro recomendado'};
 }
 function prolongacion(d,medidores,longitudM){
  if(!datosValidos(d)||!Number.isInteger(medidores)||medidores<=0)throw Error('Cantidad de medidores inválida.');
  const t=d.tablas[6],j=t.longitudesM.indexOf(longitudM),f=t.filas.find(f=>medidores>=f.medidoresMin&&medidores<=f.medidoresMax);
  if(j<0||!f)throw Error('Fila/columna exacta de Tabla 6 ausente; no completar.');
  return {tabla:6,pagina:21,diametroTabuladoMm:f.diametrosMm[j],estado:f.diametrosMm[j]===null?'Celda vacía en el original':'Consulta documental de prolongaciones; no dimensiona tramos domiciliarios'};
 }
 function accesorio(d,id,cantidad){
  if(!datosValidos(d)||!Number.isSafeInteger(cantidad)||cantidad<0)throw Error('Accesorio SIGAS o cantidad inválidos.');
  const f=d.tablas[3].filas.find(f=>f.id===id);if(!f)throw Error('Elegir ID y producto exacto SIGAS; un nombre genérico no basta.');
  if(d.tablas[3].filas.some(x=>x.id!==id&&x.nombreOriginal===f.nombreOriginal))throw Error('Nombre de producto repetido en el manual: resolver antes de usar sus equivalentes.');
  return {id,pagina:f.pagina,nombre:f.nombreOriginal,cantidad,equivalenteUnitarioM:f.longitudEquivalenteM,equivalenteTotalM:f.longitudEquivalenteM*cantidad,numeroDiametrosImpreso:f.numeroDiametros,estado:'Aritmética documental; aplicación técnica pendiente'};
 }
 function adaptador(d,gas){
  if(!datosValidos(d)||gas!=='GN')return null;
  const t=d.tablas[4];return {id:'sigas-ed15-gn-pendiente',verificado:false,fuente:d.fuente.archivo+' p.22 y pp.24–25',edicion:d.fuente.edicion,material:'Acero-polietileno SIGAS Thermofusión',sistema:'Thermofusión',gas:'GN',metodo:'longitud-maxima-tabular',reglaLongitud:null,redondeoSuperiorVerificado:false,condiciones:{densidadRelativa:.65,presionMinPa:null,presionMaxPa:null,caidaPa:null,referenciaImpresa:t.caidaPresionImpresa},candidatos:t.exterioresMm.map((de,j)=>({id:'SIGAS-'+de,exteriorMm:de,interiorMm:t.interioresTabuladosMm[j],filas:t.filas.map(f=>({longitud:f.longitudM,caudal:f.capacidadesM3h[j],pagina:22}))})),piezas:{},pendientes:['Método/regla de longitud y condiciones de suministro por verificar.','Asignar productos SIGAS exactos, vías de tees y equivalentes sin duplicar.']};
 }
 function prepararEntradaMotor(red,ts,arts,inst){
  const compartido=typeof module==='object'&&module.exports?require('../../preparacion-diametros-gas.js'):root.PreparacionDiametrosGas;
  return compartido.prepararEntradaMotor(red,ts,arts,inst);
 }
 function diagnostico(d,preparacion,accesorios,perfil){
  const revision=validar(d),tabla=perfil.gas==='GN'?4:perfil.gas==='propano-gaseoso'?5:null,pendientes=[...revision.errores,...revision.alertas];
  if(!tabla)pendientes.push('Identificar GN o propano gaseoso; GLP genérico no selecciona automáticamente Tabla 5.');
  if(tabla&&Number(perfil.densidadRelativa)!==d.tablas[tabla].densidadRelativa)pendientes.push('Densidad del proyecto pendiente o diferente de Tabla '+tabla+'.');
  pendientes.push('No se añadieron 15 m del método epoxi: falta verificar el método SIGAS y su regla de longitud.','Cuplas, reducciones y accesorios reductores requieren su tratamiento SIGAS; no se heredan exclusiones del método de clase epoxi.','Faltan condiciones de suministro, presupuesto de presión y validación técnica independiente.');
  const filas=preparacion.porTramo.map(t=>{
   const rutas=preparacion.recorridos.filter(r=>r.tramos.includes(t.id)),longitud=rutas.length?Math.max(...rutas.map(r=>r.longitudReal)):null;
   const base={id:t.id,tramo:t.nombre,consumoKcal:t.consumoKcal,caudalM3h:t.caudal,longitudRealTramoM:t.longitudReal,longitudRealRutaMaxM:longitud,tabla,pagina:tabla?d.tablas[tabla].pagina:null,longitudEquivalenteM:null,longitudDefinitivaM:null,diametroDefinitivo:null,consultas:[]};
   if(tabla&&revision.errores.length===0&&positivo(longitud)&&positivo(t.caudal))for(const de of d.tablas[tabla].exterioresMm){try{const q=capacidad(d,tabla,longitud,de,{criterio:'superior-diagnostico'});base.consultas.push({...q,cubreSoloConsulta:q.capacidadM3h>=t.caudal});}catch(e){pendientes.push(t.nombre+': '+e.message);}}
   return base;
  });
  return {estado:'diagnostico-documental-sigas',habilitado:false,diametros:null,filas,accesoriosConocidos:accesorios.fisicas,pendientes:[...new Set(pendientes)],fuente:d.fuente};
 }
 const api={datosValidos,validar,capacidad,prolongacion,accesorio,adaptador,prepararEntradaMotor,diagnostico};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.SigasTecnico=api;
})(globalThis);
