/* Consultas documentales exclusivas FUSIOGAS. Nunca habilita diámetros. */
(function(root){
 const SHA='727650ead31bf85522c8bd475bd759fdf6319c2f1a8e6bf1735124f0a93f57ed';
 const positivo=x=>typeof x==='number'&&Number.isFinite(x)&&x>0;
 function validar(d){
  const errores=[],alertas=['Verificar método de cálculo, condiciones de suministro, vigencia y aplicabilidad.','No heredar +15 m, exclusión de reducciones ni equivalencias de EPOXI/SIGAS.','P.18: cuatro diferencias respecto al redondeo usual del número de diámetros; se preservan ambos impresos.','P.20: GLP, 8 m / exterior 50 mm = 24,311 m³/h; no sustituir por 24,301 de SIGAS.','Sobrepasos, bujes y niples: no asignar equivalentes por semejanza. Llaves: confirmar variante/producto, catálogo pp.28–30 y pérdidas p.18 no tienen idéntico alcance.'];
  if(d?.id!=='fusiogas'||d.fuente?.sha256!==SHA||d.fuente?.edicion!=='V.1.2026'||d.fuente?.paginas!==40)errores.push('Fuente FUSIOGAS ausente o diferente.');
  const largos=[...Array.from({length:10},(_,i)=>i+1),...Array.from({length:20},(_,i)=>12+2*i),...Array.from({length:30},(_,i)=>55+5*i)];
  for(const gas of ['GN','GLP']){
   const t=d?.tablas?.[gas];
   if(!t||t.gas!==gas||t.pagina!==(gas==='GN'?19:20)||t.unidadCapacidad!=='m3/h'||t.unidadLongitud!=='m'||t.unidadDiametros!=='mm'||t.densidadRelativa!==(gas==='GN'?.65:1.52)||JSON.stringify(t.exterioresMm)!=='[20,25,32,40,50,63]'||JSON.stringify(t.interioresTabuladosMm)!=='[13.24,18.19,24.94,33,42.8,54.84]'||t.caidaPresionImpresa?.valor!==10||t.caidaPresionImpresa?.unidad!=='mm'||!Array.isArray(t.filas)||t.filas.length!==60){errores.push('Cabeceras o filas incorrectas: '+gas);continue;}
   t.filas.forEach((f,i)=>{
    if(f.longitudM!==largos[i]||f.pagina!==t.pagina||f.capacidadesM3h?.length!==6||f.originales?.length!==6){errores.push('Fila incompleta/desordenada '+gas+' '+i);return;}
    f.capacidadesM3h.forEach((q,j)=>{if(!positivo(q)||Number(f.originales[j].replace(',','.'))!==q||(j&&q<=f.capacidadesM3h[j-1])||(i&&q>t.filas[i-1].capacidadesM3h[j]))errores.push('Capacidad inconsistente '+gas+' '+f.longitudM+' / '+t.exterioresMm[j]);});
   });
  }
  if(d?.accesorios?.length!==88||new Set((d?.accesorios||[]).map(a=>a.id)).size!==88)errores.push('Inventario de equivalencias incompleto o duplicado.');
  for(const a of d?.accesorios||[])if(a.pagina!==18||!a.nombreOriginal||!positivo(a.longitudEquivalenteM)||!positivo(a.diametroExteriorM)||!Number.isInteger(a.numeroDiametros)||a.originales?.length!==3||Number(a.originales[0].replace(',','.'))!==a.longitudEquivalenteM||Number(a.originales[1].replace(',','.'))!==a.diametroExteriorM||Number(a.originales[2])!==a.numeroDiametros)errores.push('Equivalente incoherente '+a.id);
  if(d?.productos?.length!==108||new Set((d?.productos||[]).map(p=>p.codigo)).size!==108)errores.push('Catálogo de productos incompleto o duplicado.');
  for(const p of d?.productos||[])if(!/^020\d{4}$/.test(p.codigo)||![28,29,30].includes(p.pagina)||!p.medidaOriginal||!p.familia||(p.familia==='Tubo'&&p.largoComercialM!==4))errores.push('Producto incoherente '+p.codigo);
  return {integro:errores.length===0,habilitado:false,capacidades:720,equivalencias:88,productos:108,errores:[...new Set(errores)],alertas};
 }
 function capacidad(d,gas,longitudM,exteriorMm,{criterio='exacta'}={}){
  if(!validar(d).integro||!['GN','GLP'].includes(gas)||!positivo(longitudM))throw Error('Fuente, combustible o longitud FUSIOGAS inválidos.');
  const t=d.tablas[gas],j=t.exterioresMm.indexOf(exteriorMm);
  const f=criterio==='exacta'?t.filas.find(f=>f.longitudM===longitudM):criterio==='superior-diagnostico'?t.filas.find(f=>f.longitudM>=longitudM):null;
  if(j<0||!f)throw Error('Sin fila/diámetro FUSIOGAS disponible; no interpolar ni extrapolar.');
  return {sistema:'fusiogas',gas,pagina:t.pagina,longitudFilaM:f.longitudM,exteriorMm,interiorTabuladoMm:t.interioresTabuladosMm[j],capacidadM3h:f.capacidadesM3h[j],original:f.originales[j],estado:'Consulta documental; no diámetro recomendado'};
 }
 function accesorio(d,id,cantidad){
  if(!validar(d).integro||!Number.isSafeInteger(cantidad)||cantidad<0)throw Error('Fuente/cantidad FUSIOGAS inválidas.');
  const a=d.accesorios.find(a=>a.id===id);if(!a)throw Error('Seleccionar producto y vía FUSIOGAS exactos; no usar piezas de otro sistema.');
  return {...a,cantidad,equivalenteTotalM:a.longitudEquivalenteM*cantidad,estado:'Aritmética documental; aplicación pendiente'};
 }
 function producto(d,codigo){
  if(!validar(d).integro)throw Error('Fuente FUSIOGAS inválida.');const p=d.productos.find(p=>p.codigo===codigo);if(!p)throw Error('Código FUSIOGAS no documentado; no se busca en SIGAS/EPOXI.');return {...p,sistema:'fusiogas',estado:'Producto documental; medidas y aplicabilidad por verificar'};
 }
 function adaptador(d,gas){
  if(!validar(d).integro||!['GN','GLP'].includes(gas))return null;
  const t=d.tablas[gas];return {id:'fusiogas-v1-'+gas+'-pendiente',verificado:false,gas,material:'Acero-polietileno FUSIOGAS Thermofusión',sistema:'Thermofusión',fuente:d.fuente.archivo+' p.'+t.pagina,metodo:'longitud-maxima-tabular',reglaLongitud:null,redondeoSuperiorVerificado:false,condiciones:{densidadRelativa:t.densidadRelativa,presionMinPa:null,presionMaxPa:null,caidaPa:null,referenciaImpresa:t.caidaPresionImpresa},candidatos:t.exterioresMm.map((de,j)=>({id:'FUSIOGAS-'+de,exteriorMm:de,interiorMm:t.interioresTabuladosMm[j],filas:t.filas.map(f=>({longitud:f.longitudM,caudal:f.capacidadesM3h[j],pagina:t.pagina}))})),piezas:{},pendientes:['Validar método, suministro y presupuesto de presión; identificar variantes de accesorios y vías de tees.']};
 }
 function diagnostico(d,preparacion,accesorios,perfil){
  const revision=validar(d),gas=perfil.gas,t=d.tablas[gas],pendientes=[...revision.errores,...revision.alertas];
  if(!t)pendientes.push('Elegir GN o GLP documentado por FUSIOGAS.');
  if(t&&Number(perfil.densidadRelativa)!==t.densidadRelativa)pendientes.push('Densidad del proyecto pendiente/diferente de la tabla seleccionada.');
  const filas=preparacion.porTramo.map(p=>{
   const rutas=preparacion.recorridos.filter(r=>r.tramos.includes(p.id)),longitud=rutas.length?Math.max(...rutas.map(r=>r.longitudReal)):null,consultas=[];
   if(t&&revision.integro&&positivo(longitud)&&positivo(p.caudal))for(const de of t.exterioresMm){try{const q=capacidad(d,gas,longitud,de,{criterio:'superior-diagnostico'});consultas.push({...q,cubreSoloConsulta:q.capacidadM3h>=p.caudal});}catch(e){pendientes.push(e.message);}}
   return {id:p.id,tramo:p.nombre,tabla:t?'FUSIOGAS '+gas:null,pagina:t?.pagina||null,longitudRealRutaMaxM:longitud,diametroDefinitivo:null,consultas};
  });
  return {estado:'diagnostico-documental-fusiogas',habilitado:false,diametros:null,filas,accesoriosConocidos:accesorios.fisicas,pendientes:[...new Set(pendientes)],fuente:d.fuente};
 }
 const api={validar,capacidad,accesorio,producto,adaptador,diagnostico};if(typeof module==='object'&&module.exports)module.exports=api;else root.FusiogasTecnico=api;
})(globalThis);
