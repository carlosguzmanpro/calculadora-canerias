/* Motor tabular SIGAS ed15. Ensayo trazable, separado de la habilitación normativa.
   Desconocido nunca se convierte en pérdida cero. No modifica cantidades ni diámetros guardados. */
(function(root){
 const tecnico=()=>typeof module==='object'&&module.exports?require('./diagnostico-ed15.js'):root.SigasTecnico;
 const positivo=x=>typeof x==='number'&&Number.isFinite(x)&&x>0;
 function familiaProducto(f){
  return /^(Codo Normal a (45º|90º)|Codo MH a (45°|90°) de|Llave Esférica) \d+\s*mm$/i.test(f.nombreOriginal)?f.nombreOriginal.replace(/ \d+\s*mm$/i,''):null;
 }
 function atributosTerminal(f){
  const n=f.nombreOriginal,rosca=n.match(/(\d+\/\d+|\d+(?: \d+\/\d+)?)(?:["”])?(?:\s*ST)?$/i)?.[1];
  if(!rosca)return null;
  if(/^Transición (Hembra|Macho)/i.test(n))return {geometria:'recta',sexo:/Hembra/i.test(n)?'hembra':'macho',rosca,variante:'recta'};
  if(/^Codo 90º (con rosca hembra|C\/base H\.)/i.test(n))return {geometria:'codo90',sexo:'hembra',rosca,variante:/extra/i.test(n)?'base-extra-larga':/base/i.test(n)?'base-larga':'estandar'};
  return null;
 }
 function opcionesTerminal(d,atributos={},diametro){
  return d.tablas[3].filas.filter(f=>{const a=atributosTerminal(f);return a&&(!diametro||f.diametroExteriorM*1000===diametro)&&['geometria','sexo','rosca','variante'].every(k=>!atributos[k]||atributos[k]===a[k]);});
 }
 // Extremos verificados: catálogo pp.40–43; equivalentes originales Tabla3 pp.24–25.
 function puertosProducto(f){
  const n=f.nombreOriginal,a=atributosTerminal(f),D=f.diametroExteriorM*1000;
  const fusion=(sexo,diametro)=>({union:'fusion',sexo,diametro});
  if(/^Codo Normal a 90º /.test(n))return {tipo:'codo90',entrada:fusion('H',D),salida:fusion('H',D),paginas:[40]};
  if(/^Codo MH a 90° de /.test(n))return {tipo:'codo90',entrada:fusion('H',D),salida:fusion('M',D),paginas:[41]};
  if(/^Niple corto con tope /.test(n))return {tipo:'niple',entrada:fusion('M',D),salida:fusion('M',D),paginas:[28,43]};
  if(a?.geometria==='recta')return {tipo:'transicion',entrada:fusion('H',D),salida:{union:'rosca',sexo:a.sexo,medida:a.rosca},paginas:[42]};
  const m=n.match(/^(Buje Reducción(?: MH)?|Cupla Reducción HH|Reductor Anular) (\d+)(?:-| a )(\d+)/);
  if(m)return {tipo:'reduccion',familia:m[1].startsWith('Buje')?'buje':m[1].startsWith('Cupla')?'cupla':'anular',entrada:fusion(m[1].startsWith('Cupla')?'H':'M',Number(m[2])),salida:fusion('H',Number(m[3])),paginas:[28,42,43],requiereUbicacionEnTee:true};
  return null;
 }
 function fusionCompatible(a,b){return a?.union==='fusion'&&b?.union==='fusion'&&a.diametro===b.diametro&&a.sexo!==b.sexo;}
 function resolverConexion(d,atributos={},diametro){
  const resultado={estado:'pendiente',componentes:[],propuestas:[],pendientes:[],fuentes:[24,25,28,40,41,42,43]};
  if(d?.id!=='sigas'||d.fuente?.sha256!=='a7dc5dd90adec7d9db335100407d4748f306281b3917e2e52a8f2b707d35e2b1'){resultado.pendientes.push('Fuente SIGAS verificada pendiente; no se usan otras marcas.');return resultado;}
  if(!Array.isArray(d.tablas?.[3]?.filas)||d.tablas[3].filas.some(f=>!positivo(f.longitudEquivalenteM)||!positivo(f.diametroExteriorM)||f.longitudEquivalenteM!==Number(String(f.originales?.longitudEquivalente).replace(',','.'))||f.diametroExteriorM!==Number(String(f.originales?.diametroExterior).replace(',','.')))){resultado.pendientes.push('Equivalencias o unidades de accesorios sin verificar; no se completan con cero.');return resultado;}
  if(!positivo(diametro)||!atributos.geometria||!atributos.sexo||!atributos.rosca){resultado.pendientes.push('Completar solo diámetro candidato, geometría, sexo o medida de rosca faltantes.');return resultado;}
  if(atributos.codoBase&&!['HH','MH'].includes(atributos.codoBase)||atributos.tipoReduccion&&!['buje','cupla','anular'].includes(atributos.tipoReduccion)){resultado.pendientes.push('Tipo de unión o reducción no identificado en el catálogo.');return resultado;}
  const directas=opcionesTerminal(d,atributos,diametro);
  if(directas.length===1){resultado.estado='directa';resultado.componentes=[{fila:directas[0],tipo:atributos.geometria==='codo90'?'codo90':'transicion',reutilizada:true,rol:'principal'}];return resultado;}
  if(directas.length>1){resultado.pendientes.push('Variante de la pieza directa pendiente; no se elige un conjunto para evitar esa pregunta.');return resultado;}
  if(atributos.geometria!=='codo90'){resultado.pendientes.push('No hay transición recta directa documentada para esta combinación; revisar adaptación y ubicación.');return resultado;}
  if(atributos.variante&&atributos.variante!=='estandar'){resultado.pendientes.push('La variante declarada no permite sustituir su codo por uno común; revisar la pieza existente.');return resultado;}
  const candidatos=d.tablas[3].filas.flatMap(f=>{const puertos=puertosProducto(f);if(!puertos)return [];try{tecnico().accesorio(d,f.id,1);}catch(e){return [];}return [{fila:f,...puertos}];});
  const codos=candidatos.filter(p=>p.tipo==='codo90'&&p.entrada.diametro===diametro&&(!atributos.codoBase||(atributos.codoBase==='HH'?p.salida.sexo==='H':p.salida.sexo==='M')));
  const completos=[];
  function explorar(camino,reducciones){
   const ultimo=camino.at(-1);if(ultimo.salida.union==='rosca'){if(ultimo.salida.sexo===atributos.sexo&&ultimo.salida.medida===atributos.rosca)completos.push(camino);return;}
   if(camino.length>=5)return;
   for(const p of candidatos){if(p.tipo==='codo90'||camino.some(x=>x.fila.id===p.fila.id)||!fusionCompatible(ultimo.salida,p.entrada))continue;if(p.tipo==='reduccion'&&(reducciones||p.salida.diametro>=p.entrada.diametro||atributos.tipoReduccion&&p.familia!==atributos.tipoReduccion))continue;if(p.tipo==='transicion'&&(p.salida.sexo!==atributos.sexo||p.salida.medida!==atributos.rosca))continue;explorar([...camino,p],reducciones+(p.tipo==='reduccion'?1:0));}
  }
  codos.forEach(c=>explorar([c],0));
  const sinReduccion=completos.filter(xs=>!xs.some(x=>x.tipo==='reduccion')),rutas=sinReduccion.length?sinReduccion:completos;
  resultado.propuestas=rutas.map(xs=>({productos:xs.map(x=>x.fila.nombreOriginal),componentes:xs.map((x,i)=>({...x,reutilizada:i===0,rol:i===0?'principal':x.tipo+':'+i})),requiereUbicacionEnTee:xs.some(x=>x.tipo==='reduccion')}));
  if(!rutas.length){resultado.pendientes.push('No existe cadena documentada con fusión y rosca compatibles; verificar productos o condiciones de conexión.');return resultado;}
  if(!atributos.codoBase){resultado.pendientes.push('Tipo del codo existente: confirmar HH común o MH; no se añade otro codo.');return resultado;}
  if(rutas.some(xs=>xs.some(x=>x.tipo==='reduccion'))){resultado.estado='reduccion-pendiente-ubicacion';resultado.pendientes.push('Manual SIGAS p.28: cambios de diámetro inmediatamente después de una tee. Falta ubicar la reducción y modelar la longitud de cada diámetro; no se instala automáticamente una reducción terminal ni se toma pérdida cero.');return resultado;}
  if(rutas.length!==1){resultado.pendientes.push('Hay varios conjuntos documentados: identificar la configuración real sin duplicar piezas.');return resultado;}
  resultado.estado='conjunto';resultado.componentes=resultado.propuestas[0].componentes;return resultado;
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
  const identidades=new Map();
  for(const p of piezas.values())if(Array.isArray(p.identidadesFisicas)){
   if(p.identidadesFisicas.length!==p.cantidad||new Set(p.identidadesFisicas).size!==p.cantidad){p.conflicto=true;inventarioInvalido=true;pendientes.push(p.id+': identidades físicas inconsistentes.');}
   for(const id of p.identidadesFisicas){const previo=identidades.get(id);if(previo&&previo.id!==p.id){previo.conflicto=true;p.conflicto=true;inventarioInvalido=true;pendientes.push('Identidad física compartida por grupos: '+id+'; no se suman ambos.');}else identidades.set(id,p);}
  }
  if(errores.length)return salida;
  pendientes.push('Criterio de recorrido/fila superior y simultaneidad: validar con método aplicable. No se añadieron 15 m EPOXI.','Presión disponible, mínima de artefactos y pérdida admisible: confirmar alcance de la tabla; caída impresa 10 mm no es suministro.','Cuplas y otras pérdidas no identificadas permanecen pendientes; no se suponen nulas ni bloquean esta preselección parcial.');
  if(!perfil.densidadRelativa)pendientes.push('Densidad del suministro pendiente de confirmar frente a 0,65 tabulado.');
  for(const k of ['presionDisponible','presionMinima','perdidaMaxima','fuentePresiones'])if(!perfil[k])pendientes.push('Dato de suministro pendiente: '+k+'.');
  const faltantesInventario=[...(inventario.pendientes||[])];
  pendientes.push(...faltantesInventario);
  const base=new Map(ts.map(t=>[t.id,t])),firma=v=>JSON.stringify(ts.map(t=>v[t.id]??null));let vector={},vistos=new Set(),ultimo=null;
  const max=config.maxIteraciones===undefined?30:config.maxIteraciones;
  if(!Number.isSafeInteger(max)||max<1||max>100){errores.push('Límite de iteraciones inválido.');return salida;}
  for(let iteracion=0;iteracion<max;iteracion++){
   const rutasCalculadas=rutas.map((r,ri)=>{
    const aportes=[],faltantes=[],perdidasPendientes=[],solucionesTerminales=[],aplicadas=new Set();
    const pendiente=(p,motivo)=>{faltantes.push(p.id+': '+motivo);perdidasPendientes.push({piezaId:p.id,tipo:p.tipo,cantidad:p.cantidad,tramos:p.tramos,motivo});};
    for(const p of piezas.values()){
     // Una identidad física aporta una sola vez a cada recorrido; nunca suma referencias duplicadas.
     const vinculo=config.vinculos?.[p.id],ubicaciones=p.tramos.length?p.tramos:vinculo?.tramoAplicacion&&base.has(vinculo.tramoAplicacion)?[vinculo.tramoAplicacion]:[],enRuta=ubicaciones.some(id=>r.tramos.includes(id))||(Array.isArray(vinculo?.recorridos)&&vinculo.recorridos.includes(r.artefacto));
     if(!enRuta){if(!ubicaciones.length&&!vinculo?.recorridos)pendiente({...p,tramos:ubicaciones},'ubicación respecto del recorrido/medidor pendiente.');continue;}
     if(aplicadas.has(p.id))continue;aplicadas.add(p.id);
     if(p.conflicto||p.confirmada!==true){pendiente({...p,tramos:ubicaciones},'identidad/cantidad por verificar.');continue;}
     const a=vinculo?.porRecorrido?.[r.artefacto]||vinculo?.producto;
     if(!a||a.confirmado!==true||(!a.familia&&!a.atributos&&(!Array.isArray(a.tramosDiametro)||!a.tramosDiametro.length||a.tramosDiametro.some(id=>!base.has(id))))){pendiente({...p,tramos:ubicaciones},p.tipo==='tee'?'producto SIGAS, medidas de tres conexiones y vía directa/giro pendientes.':p.tipo==='llave'?'tipo y producto de llave SIGAS pendientes.':'producto SIGAS exacto y vía pendientes.'+(p.tipo==='codo90'?' Confirmar normal, MH o roscado y sus medidas; no se elige una variante por defecto.':''));continue;}
     if(iteracion===0){pendiente({...p,tramos:ubicaciones},'semilla sin equivalentes, no es pérdida cero.');continue;}
     const clave=(a.tramosDiametro||[]).map(id=>vector[id]).join('/'),id=a.productos?.[clave];
     const diametros=[...new Set(ubicaciones.map(id=>vector[id]))];
     if(p.necesidadTerminal&&a.atributos&&diametros.length===1){
      const solucion=resolverConexion(d,a.atributos,diametros[0]);solucionesTerminales.push({piezaId:p.id,necesidad:p.necesidadTerminal,diametro:diametros[0],...solucion});
      if(solucion.estado==='conjunto'){
       const coincide=solucion.componentes.filter(c=>!c.reutilizada).some(c=>[...piezas.values()].some(q=>q.id!==p.id&&q.tramos.some(id=>ubicaciones.includes(id))&&(q.tipo===c.tipo||c.tipo==='niple'&&/niple/i.test(q.tipo)||c.tipo==='transicion'&&/transici/i.test(q.tipo))));
       if(coincide){pendiente({...p,tramos:ubicaciones},'Hay accesorios registrados que podrían pertenecer al conjunto; vincular la coincidencia antes de agregar piezas.');continue;}
       const tramosEnRuta=ubicaciones.filter(id=>r.tramos.includes(id)),tramoId=tramosEnRuta.length===1?tramosEnRuta[0]:null;
       try{const componentes=solucion.componentes.map(c=>{const x=tecnico().accesorio(d,c.fila.id,1),idPieza=c.reutilizada?p.id:p.id+'::conjunto:'+c.rol;return {piezaId:idPieza,conjuntoId:p.id,necesidadTerminal:p.necesidadTerminal,identidadesFisicas:c.reutilizada?p.identidadesFisicas?.slice()||null:[idPieza+'::pieza:0'],tipo:c.tipo,tramoId,diametroExteriorMm:c.fila.diametroExteriorM*1000,generadaPorConjunto:!c.reutilizada,...x};});aportes.push(...componentes);}catch(e){pendiente({...p,tramos:ubicaciones},e.message);}continue;
      }
      if(solucion.estado!=='directa'){pendiente({...p,tramos:ubicaciones},solucion.pendientes.join(' '));continue;}
     }
     const opciones=a.familia&&p.tipo!=='tee'&&diametros.length===1?d.tablas[3].filas.filter(f=>familiaProducto(f)===a.familia&&f.diametroExteriorM*1000===diametros[0]):[];
     const terminales=a.atributos&&diametros.length===1&&a.atributos.geometria&&a.atributos.sexo&&a.atributos.rosca?opcionesTerminal(d,a.atributos,diametros[0]):[];
     const fila=a.atributos?(terminales.length===1?terminales[0]:null):a.familia?(opciones.length===1?opciones[0]:null):d.tablas[3].filas.find(f=>f.id===id);
     if(p.necesidadTerminal&&fila&&!atributosTerminal(fila)){pendiente({...p,tramos:ubicaciones},'conexión terminal: producto roscado compatible pendiente; no se utiliza un codo común.');continue;}
     const tipoCorrecto=fila&&(p.necesidadTerminal?atributosTerminal(fila)?.geometria===(p.geometria||p.tipo):({codo90:/^Codo(?: Normal a 90º | MH a 90° | 90º)/,codo45:/^Codo.*45/,tee:/^Te /,llave:/^Llave /,reduccion:/Reduct|Reduc/,cupla:/Cupla/}[p.tipo]?.test(fila.nombreOriginal)));
     if(!tipoCorrecto||!(p.tipo==='tee'?ubicaciones.some(id=>vector[id]===fila.diametroExteriorM*1000):ubicaciones.every(id=>vector[id]===fila.diametroExteriorM*1000))){pendiente({...p,tramos:ubicaciones},'combinación '+clave+' sin producto/diámetro/vía SIGAS compatible documentado.');continue;}

     if(p.tipo==='tee'&&/^Te Normal /.test(fila.nombreOriginal)&&Array.isArray(p.conexionesDiametro)&&p.conexionesDiametro.some(id=>vector[id]!==fila.diametroExteriorM*1000)){
      pendiente({...p,tramos:ubicaciones},'tee normal incompatible con los diámetros candidatos de sus tres conexiones; identificar configuración y reducciones sin inventarlas.');continue;
     }
     const tramosEnRuta=ubicaciones.filter(id=>r.tramos.includes(id)),tramoId=tramosEnRuta.length===1?tramosEnRuta[0]:null;
     try{const x=tecnico().accesorio(d,fila.id,p.cantidad);aportes.push({piezaId:p.id,identidadesFisicas:p.identidadesFisicas?.slice()||null,tipo:p.tipo,tramoId,diametroExteriorMm:fila.diametroExteriorM*1000,...x});}catch(e){pendiente({...p,tramos:ubicaciones},e.message);}
    }
    // Son necesidades, no piezas adicionales: sin vínculo físico inequívoco no atribuirles cero.
    for(const terminal of inventario.necesidadesTerminales||[])if(terminal.recorridos?.includes(r.artefacto)){
     const vinculadas=[...piezas.values()].filter(p=>p.necesidadTerminal===terminal.id&&p.cantidad===1);
     if(vinculadas.length===1&&aportes.some(a=>a.piezaId===vinculadas[0].id))continue;
     pendiente({id:terminal.id,tipo:'conexion-terminal',cantidad:null,tramos:terminal.tramos},terminal.nombre+': identificar producto, medidas y si está incluido en los accesorios declarados; no se añade un codo ni se supone pérdida cero.');
    }
    const equivalenteConocidoM=aportes.reduce((n,a)=>n+a.equivalenteTotalM,0),completo=!inventarioInvalido&&!faltantes.length&&!faltantesInventario.length&&config.inventarioPerdidasCompleto===true&&config.fuenteInventario;
    return {...r,indice:ri,aportes,faltantes,perdidasPendientes,solucionesTerminales,equivalenteConocidoM:aportes.length||completo?equivalenteConocidoM:null,equivalenteCompleto:!!completo,longitudConsultaM:r.longitudReal+equivalenteConocidoM,longitudDefinitivaM:completo?r.longitudReal+equivalenteConocidoM:null};
   });
   const filas=ts.map(t=>{
    const propias=rutasCalculadas.filter(r=>r.tramos.includes(t.id)),ruta=propias.reduce((a,b)=>!a||b.longitudConsultaM>a.longitudConsultaM?b:a,null);
    const caudal=positivo(pcs)&&fuentePCS&&positivo(t.consumoKcal)?t.consumoKcal/pcs:null;
    const q=ruta?seleccionar(d,ruta.longitudConsultaM,caudal):{candidato:null,consultas:[],pendientes:['Recorrido pendiente.']};
    const locales=propias.flatMap(r=>r.perdidasPendientes.filter(p=>p.tramos.includes(t.id))),sinUbicacion=propias.flatMap(r=>r.perdidasPendientes.filter(p=>!p.tramos.length));
    const unicos=xs=>{const m=new Map();for(const p of xs){const previo=m.get(p.piezaId);if(previo){if(!previo.motivo.includes(p.motivo))previo.motivo+=' / '+p.motivo;}else m.set(p.piezaId,{...p});}return [...m.values()];};
    const aportesLocales=(ruta?.aportes||[]).filter(a=>a.tramoId===t.id),equivalenteConocidoTramoM=aportesLocales.length?aportesLocales.reduce((n,a)=>n+a.equivalenteTotalM,0):ruta?.equivalenteCompleto?0:null;
    const verificacionConsulta=q.candidato?{tabla:4,pagina:22,filaM:q.candidato.longitudFilaM,capacidadM3h:q.candidato.capacidadM3h,demandaM3h:caudal,cubreConsulta:q.candidato.capacidadM3h>=caudal,parcial:!ruta?.equivalenteCompleto,diametroDefinitivo:false}:null;
    const cantidadesRegistradas=Object.fromEntries(['codo90','tee','llave'].map(tipo=>[tipo,[...piezas.values()].filter(p=>p.tipo===tipo&&p.tramos.includes(t.id)).reduce((n,p)=>n+p.cantidad,0)]));
    return {id:t.id,tramo:t.nombre,cantidadesRegistradas,equivalenteConocidoTramoM,aportesLocales,perdidasPendientesTramo:unicos(locales),perdidasSinUbicacion:unicos(sinUbicacion),verificacionConsulta,longitudRealM:t.longitudReal,consumoKcal:t.consumoKcal,caudalM3h:caudal,poderCalorifico:positivo(pcs)&&fuentePCS?pcs:null,fuentePCS:fuentePCS||null,recorridoControl:ruta?.artefacto||null,longitudConsultaM:ruta?.longitudConsultaM??null,equivalenteConocidoRutaM:ruta?.equivalenteConocidoM??null,longitudDefinitivaM:ruta?.longitudDefinitivaM??null,candidato:q.candidato,consultas:q.consultas,diametroDefinitivo:null,pendientes:[...q.pendientes,...propias.flatMap(r=>r.faltantes)],estado:q.candidato?'Preselección condicionada; no diámetro de ejecución':'Pendiente'};
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
  for(const f of salida.filas){if(f.verificacionConsulta){f.verificacionConsulta.convergente=salida.convergente;f.verificacionConsulta.parcial||=!salida.convergente;}if(!salida.convergente)f.longitudDefinitivaM=null;}
  if(!salida.convergente)for(const r of salida.recorridos)r.longitudDefinitivaM=null;
  pendientes.push(...salida.filas.flatMap(f=>f.pendientes));salida.pendientes=[...new Set(pendientes)];
  salida.advertencia='PRESELECCIÓN CONDICIONADA. Pérdidas desconocidas no son cero. No acredita presión final, método normativo ni aptitud de instalación. No se asignan diámetros a los tramos guardados.';
  return salida;
 }
 const api={consultar,resolver,familiaProducto,atributosTerminal,opcionesTerminal,puertosProducto,fusionCompatible,resolverConexion};if(typeof module==='object'&&module.exports)module.exports=api;else root.DimensionamientoSigas=api;
})(globalThis);
