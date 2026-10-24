/* Motor tabular SIGAS ed15. Ensayo trazable, separado de la habilitación normativa.
   Desconocido nunca se convierte en pérdida cero. No modifica cantidades ni diámetros guardados. */
(function(root){
 const tecnico=()=>typeof module==='object'&&module.exports?require('./diagnostico-ed15.js'):root.SigasTecnico;
 const positivo=x=>typeof x==='number'&&Number.isFinite(x)&&x>0;
 function familiaProducto(f){
  return /^(Codo Normal a (45º|90º)|Codo MH a (45°|90°) de|Llave Esférica) \d+\s*mm$/i.test(f.nombreOriginal)?f.nombreOriginal.replace(/ \d+\s*mm$/i,''):null;
 }
 function seleccionar(d,longitudM,caudalM3h){
  if(!positivo(longitudM)||!positivo(caudalM3h))return {candidato:null,consultas:[],pendientes:['Longitud o caudal conocido pendiente.']};
  const consultas=[],pendientes=[];
  for(const de of d.tablas[4].exterioresMm){try{const q=tecnico().capacidad(d,4,longitudM,de,{criterio:'superior-diagnostico'});consultas.push({...q,cubre:q.capacidadM3h>=caudalM3h});}catch(e){pendientes.push(e.message);return {candidato:null,consultas,pendientes};}}
  return {candidato:consultas.find(q=>q.cubre)||null,consultas,pendientes:consultas.some(q=>q.cubre)?[]:['El caudal excede todas las capacidades tabuladas.']};
 }
 function consultar(d,{gas,longitudM,caudalM3h}){
  const r=tecnico().validar(d);if(gas!=='GN'||r.errores.length)return {candidato:null,consultas:[],pendientes:gas!=='GN'?['Este motor usa únicamente SIGAS GN Tabla 4; no aplica GN a GLP.']:r.errores};
  return seleccionar(d,longitudM,caudalM3h);
 }
 function resolver(d,{preparacion,perfil,inventario={fisicas:[],pendientes:[]},config={}}){
  const revision=tecnico().validar(d),errores=[...revision.errores,...(preparacion?.errores||[])],pendientes=[];
  const salida={estado:'pendiente',convergente:false,definitivo:false,diametrosDefinitivos:null,filas:[],historia:[],recorridos:[],pendientes,errores,fuente:d?.fuente||null,metodo:'Consulta SIGAS por recorrido completo más desfavorable, con fila superior; aplicación normativa pendiente',semillaAdicionalM:0};
  if(perfil?.catalogoTecnicoGas!=='sigas'||perfil?.gas!=='GN')errores.push('Elegir SIGAS y gas natural; no se utilizarán tablas de otra marca o combustible.');
  if(perfil?.material!=='Acero-polietileno SIGAS Thermofusión'||perfil?.sistema!=='Thermofusión')errores.push('Material/unión guardados no corresponden a SIGAS Thermofusión. Se conservaron sin reinterpretarlos.');
  if(perfil?.densidadRelativa&&Number(perfil.densidadRelativa)!==.65)errores.push('Densidad informada incompatible con SIGAS GN Tabla 4 (0,65).');
  if(!preparacion?.recorridos?.length||!preparacion?.porTramo?.length)errores.push('Recorridos completos desde el medidor pendientes.');
  if(errores.length)return salida;
  pendientes.push(...revision.alertas);
  const ts=preparacion.porTramo,rutas=preparacion.recorridos;
  const pcs=Number(perfil.poderCalorifico),fuentePCS=typeof perfil.fuenteGas==='string'&&perfil.fuenteGas.trim();
  if(!positivo(pcs)||!fuentePCS)pendientes.push('Poder calorífico y su fuente pendientes; no se aplica 9300 por defecto.');
  const presion=Number(perfil.presionDisponible),minima=Number(perfil.presionMinima),perdida=Number(perfil.perdidaMaxima);
  salida.condiciones={gas:perfil.gas,densidadTabla:.65,caidaImpresa:d.tablas[4].caidaPresionImpresa,poderCalorifico:positivo(pcs)&&fuentePCS?pcs:null,fuentePCS:fuentePCS||null,simultaneidad:'Consumos sumados sin reducción; criterio técnico por verificar',presupuestoDisponiblePa:perfil.unidadPresion==='Pa'&&positivo(presion)&&positivo(minima)?presion-minima:null};
  if(perfil.unidadPresion==='Pa'&&positivo(presion)&&positivo(minima)&&positivo(perdida)&&(presion<=minima||perdida>presion-minima))pendientes.push('Presupuesto de presión incompatible con los valores ingresados; preselección no verifica suministro.');
  const piezas=new Map();let inventarioInvalido=false;
  for(const p of inventario.fisicas||[]){
   const previo=piezas.get(p.id);if(!p.id||!Number.isSafeInteger(p.cantidad)||p.cantidad<=0){inventarioInvalido=true;pendientes.push('Identidad o cantidad de accesorio pendiente.');continue;}
   if(previo){if(previo.tipo!==p.tipo||previo.cantidad!==p.cantidad)errores.push('Cantidad/tipo contradictorios de la pieza '+p.id);else previo.tramos=[...new Set([...(previo.tramos||[]),...(p.tramos||[])])];continue;}
   piezas.set(p.id,{...p,tramos:[...(p.tramos||[])]});
  }
  if(errores.length)return salida;
  pendientes.push('Criterio de recorrido/fila superior y simultaneidad: validar con método aplicable. No se añadieron 15 m EPOXI.','Presión disponible, mínima de artefactos y pérdida admisible: confirmar alcance de la tabla; caída impresa 10 mm no es suministro.','Cuplas y otras pérdidas no identificadas permanecen pendientes; no se suponen nulas ni bloquean esta preselección parcial.');
  if(!perfil.densidadRelativa)pendientes.push('Densidad del suministro pendiente de confirmar frente a 0,65 tabulado.');
  for(const k of ['presionDisponible','presionMinima','perdidaMaxima','fuentePresiones'])if(!perfil[k])pendientes.push('Dato de suministro pendiente: '+k+'.');
  const faltantesInventario=(inventario.pendientes||[]).filter(s=>!String(s).startsWith('Cuplas de '));
  pendientes.push(...faltantesInventario);
  const base=new Map(ts.map(t=>[t.id,t])),firma=v=>JSON.stringify(ts.map(t=>v[t.id]??null));let vector={},vistos=new Set(),ultimo=null;
  const max=config.maxIteraciones===undefined?30:config.maxIteraciones;
  if(!Number.isSafeInteger(max)||max<1||max>100){errores.push('Límite de iteraciones inválido.');return salida;}
  for(let iteracion=0;iteracion<max;iteracion++){
   const rutasCalculadas=rutas.map((r,ri)=>{
    const aportes=[],faltantes=[],aplicadas=new Set();
    for(const p of piezas.values()){
     // Una identidad física aporta una sola vez a cada recorrido; nunca suma referencias duplicadas.
     const vinculo=config.vinculos?.[p.id],ubicaciones=p.tramos.length?p.tramos:vinculo?.tramoAplicacion&&base.has(vinculo.tramoAplicacion)?[vinculo.tramoAplicacion]:[],enRuta=ubicaciones.some(id=>r.tramos.includes(id))||(Array.isArray(vinculo?.recorridos)&&vinculo.recorridos.includes(r.artefacto));
     if(!enRuta){if(!ubicaciones.length&&!vinculo?.recorridos)faltantes.push(p.id+': ubicación respecto del recorrido/medidor pendiente.');continue;}
     if(aplicadas.has(p.id))continue;aplicadas.add(p.id);
     if(p.conflicto||p.confirmada!==true){faltantes.push(p.id+': identidad/cantidad por verificar.');continue;}
     const a=vinculo?.porRecorrido?.[r.artefacto]||vinculo?.producto;
     if(!a||a.confirmado!==true||(!a.familia&&(!Array.isArray(a.tramosDiametro)||!a.tramosDiametro.length||a.tramosDiametro.some(id=>!base.has(id))))){faltantes.push(p.id+': producto SIGAS exacto y vía pendientes.');continue;}
     if(iteracion===0){faltantes.push(p.id+': semilla sin equivalentes, no es pérdida cero.');continue;}
     const clave=(a.tramosDiametro||[]).map(id=>vector[id]).join('/'),id=a.productos?.[clave];
     const diametros=[...new Set(ubicaciones.map(id=>vector[id]))];
     const opciones=a.familia&&p.tipo!=='tee'&&diametros.length===1?d.tablas[3].filas.filter(f=>familiaProducto(f)===a.familia&&f.diametroExteriorM*1000===diametros[0]):[];
     const fila=a.familia?(opciones.length===1?opciones[0]:null):d.tablas[3].filas.find(f=>f.id===id);
     const tipoCorrecto=fila&&({codo90:/^Codo.*90/,codo45:/^Codo.*45/,tee:/^Te /,llave:/^Llave /,reduccion:/Reduct|Reduc/,cupla:/Cupla/}[p.tipo]?.test(fila.nombreOriginal));
     if(!tipoCorrecto||!ubicaciones.some(id=>vector[id]===fila.diametroExteriorM*1000)){faltantes.push(p.id+': combinación '+clave+' sin producto/diámetro/vía SIGAS compatible documentado.');continue;}
     try{const x=tecnico().accesorio(d,fila.id,p.cantidad);aportes.push({piezaId:p.id,tipo:p.tipo,...x});}catch(e){faltantes.push(p.id+': '+e.message);}
    }
    const equivalenteConocidoM=aportes.reduce((n,a)=>n+a.equivalenteTotalM,0),completo=!inventarioInvalido&&!faltantes.length&&!faltantesInventario.length&&config.inventarioPerdidasCompleto===true&&config.fuenteInventario;
    return {...r,indice:ri,aportes,faltantes,equivalenteConocidoM:aportes.length||completo?equivalenteConocidoM:null,equivalenteCompleto:!!completo,longitudConsultaM:r.longitudReal+equivalenteConocidoM,longitudDefinitivaM:completo?r.longitudReal+equivalenteConocidoM:null};
   });
   const filas=ts.map(t=>{
    const propias=rutasCalculadas.filter(r=>r.tramos.includes(t.id)),ruta=propias.reduce((a,b)=>!a||b.longitudConsultaM>a.longitudConsultaM?b:a,null);
    const caudal=positivo(pcs)&&fuentePCS&&positivo(t.consumoKcal)?t.consumoKcal/pcs:null;
    const q=ruta?seleccionar(d,ruta.longitudConsultaM,caudal):{candidato:null,consultas:[],pendientes:['Recorrido pendiente.']};
    return {id:t.id,tramo:t.nombre,longitudRealM:t.longitudReal,consumoKcal:t.consumoKcal,caudalM3h:caudal,poderCalorifico:positivo(pcs)&&fuentePCS?pcs:null,fuentePCS:fuentePCS||null,recorridoControl:ruta?.artefacto||null,longitudConsultaM:ruta?.longitudConsultaM??null,equivalenteConocidoRutaM:ruta?.equivalenteConocidoM??null,longitudDefinitivaM:ruta?.longitudDefinitivaM??null,candidato:q.candidato,consultas:q.consultas,diametroDefinitivo:null,pendientes:[...q.pendientes,...propias.flatMap(r=>r.faltantes)],estado:q.candidato?'Preselección condicionada; no diámetro de ejecución':'Pendiente'};
   });
   const nuevo=Object.fromEntries(filas.map(f=>[f.id,f.candidato?.exteriorMm??null]));
   salida.historia.push({iteracion,fase:iteracion===0?'semilla-real-sin-perdidas':'recálculo-equivalentes-identificados',diametrosExteriorMm:nuevo,filas,recorridos:rutasCalculadas});
   ultimo={filas,recorridos:rutasCalculadas};
   if(iteracion>0&&firma(nuevo)===firma(vector)){salida.convergente=filas.every(f=>!!f.candidato);salida.estado=salida.convergente&&rutasCalculadas.every(r=>r.equivalenteCompleto)?'ensayo-tabular-estable':'preseleccion-parcial';break;}
   if(vistos.has(firma(nuevo))){salida.estado='no-convergente';pendientes.push('Los candidatos oscilan; no se presenta una selección estable.');break;}
   vistos.add(firma(nuevo));vector=nuevo;
  }
  Object.assign(salida,ultimo);
  if(salida.estado==='pendiente'){salida.estado='limite-iteraciones';pendientes.push('Límite de iteraciones alcanzado; resultado sin convergencia.');}
  pendientes.push(...salida.filas.flatMap(f=>f.pendientes));salida.pendientes=[...new Set(pendientes)];
  salida.advertencia='PRESELECCIÓN CONDICIONADA. Pérdidas desconocidas no son cero. No acredita presión final, método normativo ni aptitud de instalación. No se asignan diámetros a los tramos guardados.';
  return salida;
 }
 const api={consultar,resolver,familiaProducto};if(typeof module==='object'&&module.exports)module.exports=api;else root.DimensionamientoSigas=api;
})(globalThis);
