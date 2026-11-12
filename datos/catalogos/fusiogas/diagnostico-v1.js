/* Datos documentales y escenarios tabulares FUSIOGAS independientes; sin aprobación de instalaciones. */
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
  const revision=validar(d),gas=perfil.gas==='propano-gaseoso'?'GLP':perfil.gas,t=d.tablas[gas],pendientes=[...revision.errores,...revision.alertas];
  if(!t)pendientes.push('Elegir GN o GLP documentado por FUSIOGAS.');
  if(t&&Number(perfil.densidadRelativa)!==t.densidadRelativa)pendientes.push('Densidad del proyecto pendiente/diferente de la tabla seleccionada.');
  const filas=preparacion.porTramo.map(p=>{
   const rutas=preparacion.recorridos.filter(r=>r.tramos.includes(p.id)),longitud=rutas.length?Math.max(...rutas.map(r=>r.longitudReal)):null,consultas=[];
   if(t&&revision.integro&&positivo(longitud)&&positivo(p.caudal))for(const de of t.exterioresMm){try{const q=capacidad(d,gas,longitud,de,{criterio:'superior-diagnostico'});consultas.push({...q,cubreSoloConsulta:q.capacidadM3h>=p.caudal});}catch(e){pendientes.push(e.message);}}
   return {id:p.id,tramo:p.nombre,tabla:t?'FUSIOGAS '+gas:null,pagina:t?.pagina||null,longitudRealRutaMaxM:longitud,diametroDefinitivo:null,consultas};
  });
  return {estado:'diagnostico-documental-fusiogas',habilitado:false,diametros:null,filas,accesoriosConocidos:accesorios.fisicas,pendientes:[...new Set(pendientes)],fuente:d.fuente};
 }
 // Verificación tabular independiente. Las propuestas nunca modifican el inventario.
 function dimensionar(d,entrada){
  const {preparacion:p,red,inventario,perfil,config={}}=entrada;
  const pendientes=new Map(),avisar=(id,texto,grupo='calculo')=>pendientes.set(id,{id,texto,grupo});
  const gas=perfil.gas,tablaGas=gas==='GN'?'GN':['GLP','propano-gaseoso'].includes(gas)?'GLP':null,t=d.tablas[tablaGas];
  const pcs=Number(String(perfil.poderCalorifico??'').replace(',','.')),fuente=String(perfil.fuenteGas||'').trim();
  if(!positivo(pcs)||!fuente)avisar('pcs','Ingresar PCS del combustible seleccionado y su fuente; no se reutiliza el PCS de otro gas.');
  if(!t)avisar('gas','Combustible sin tabla FUSIOGAS aplicable.');
  for(const x of validar(d).errores)avisar('fuente:'+x,x);
  for(const x of p.errores||[])avisar('red:'+x,x);
  const densidad=Number(String(perfil.densidadRelativa??'').replace(',','.'));
  const densidadDiferente=t&&positivo(densidad)&&Math.abs(densidad-t.densidadRelativa)>1e-9;
  if(densidadDiferente)avisar('densidad','La densidad declarada no coincide con '+t.densidadRelativa+' de la tabla FUSIOGAS; no aplicar correcciones inventadas.');
  if(t&&!positivo(densidad))avisar('densidad-real','Verificar densidad real con su fuente frente a la referencia tabular '+t.densidadRelativa+'.','suministro');
  if(tablaGas==='GLP')avisar('composicion','La página 20 se titula GLP (densidad 1,52), no certifica cualquier mezcla ni propano de cualquier suministro. Verificar composición y aplicabilidad.','suministro');
  avisar('suministro','Verificar presiones reales, pérdida admisible y condiciones de los artefactos con documentación del suministro. La caída impresa de 10 mm es una referencia tabular.','suministro');
  avisar('normativa','Aplicabilidad del método, simultaneidad (ensayo: todos los consumos completos) y aprobación normativa: revisión profesional independiente.','informacion');
  avisar('inventario-real','Cotejar productos propuestos, conexiones y uniones reales antes del cierre técnico. Cuplas de compra estimadas no son pérdidas confirmadas.','informacion');
  const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[°º”″"\s]/g,'').toLowerCase();
  function buscar(familia,medida,nombre){
   const productos=d.productos.filter(x=>norm(x.familia)===norm(familia)&&norm(x.medidaOriginal)===norm(medida));
   const eq=d.accesorios.filter(x=>norm(x.nombreOriginal)===norm(nombre));
   return productos.length===1&&eq.length===1?{producto:productos[0],eq:eq[0]}:null;
  }
  const filasBase=p.porTramo.map(f=>({...f,caudal:positivo(pcs)&&fuente&&Number.isFinite(f.consumoKcal)?f.consumoKcal/pcs:null}));
  const terminales=[];
  for(const ruta of p.recorridos){const id='terminal-'+ruta.artefacto;if(!terminales.some(x=>x.id===id))terminales.push({id,tramo:ruta.tramos.at(-1),nombre:ruta.artefacto});}
  const inicios=[...new Set(p.recorridos.map(r=>r.tramos[0]))];
  if(inicios.length===1)terminales.push({id:'terminal-medidor',tramo:inicios[0],nombre:'Medidor'});
  const fijas=new Map();for(const f of filasBase)fijas.set(f.id,t?.exterioresMm[0]||20);
  const basePendientes=()=>new Map(pendientes);
  const pendientesIniciales=basePendientes();
  function evaluar(diametros){
   pendientes.clear();for(const [k,v]of pendientesIniciales)pendientes.set(k,v);
   let desconocidoGlobal=false;
   const piezas=[],porTramo=new Map(filasBase.map(f=>[f.id,[]]));
   const agregar=(identidad,tramo,cantidad,match,propuesta,motivo)=>{
    if(!Number.isSafeInteger(cantidad)||cantidad<1)return;
    const pieza={identidad,tramo,cantidad,producto:match?.producto||null,equivalencia:match?.eq||null,equivalenteM:match?cantidad*match.eq.longitudEquivalenteM:null,propuesta:!!propuesta,motivo:motivo||null};
    piezas.push(pieza);porTramo.get(tramo)?.push(pieza);if(!match)avisar(identidad,(filasBase.find(f=>f.id===tramo)?.nombre||'Conexión')+': '+motivo);
   };
   const reservados=new Map();
   for(const terminal of terminales){
    const a=config.terminales?.[terminal.id]||{},de=diametros.get(terminal.tramo),codos=inventario.fisicas.filter(f=>f.tipo==='codo90'&&f.tramos.length===1&&f.tramos[0]===terminal.tramo);
    const disponible=codos.find(f=>f.cantidad>(reservados.get(f.id)||0));
    // Un codo existente puede representar la terminal SOLO como propuesta explícita.
    const geometria=a.geometria||(disponible?'codo90':null),rosca=a.rosca;
    if(geometria==='codo90'&&disponible){
     reservados.set(disponible.id,(reservados.get(disponible.id)||0)+1);
     const match=rosca&&(!a.sexo||a.sexo==='hembra')?buscar('Codo 90° rosca hembra',de+'x'+rosca,'Codo 90° rosca hembra '+de+'x'+rosca):null;
     agregar(terminal.id,terminal.tramo,1,match,true,!rosca?'Falta medida de rosca de '+terminal.nombre+'.':a.sexo&&a.sexo!=='hembra'?'Conexión terminal sin codo macho documentado: identificar solución real.':'Falta producto terminal compatible '+de+' mm × '+rosca+'″; no cambiar el diámetro para hacerlo coincidir.');
    }else if(geometria==='recta'){
     const sexo=a.sexo,match=rosca&&['hembra','macho'].includes(sexo)?buscar('Transición '+sexo,de+'x'+rosca,'Transición '+sexo+' '+de+'x'+rosca):null;
     agregar(terminal.id,terminal.tramo,1,match,true,'Transición recta: completar rosca/sexo o identificar producto FUSIOGAS compatible.');
    }else agregar(terminal.id,terminal.tramo,1,null,true,'Identificar geometría y rosca de la conexión de '+terminal.nombre+'; no se agregó un codo físico.');
   }
   for(const f of inventario.fisicas){
    if(f.tipo==='tee')continue;
    const id=f.tramos.length===1?f.tramos[0]:null,de=diametros.get(id),cantidad=f.cantidad-(reservados.get(f.id)||0);
    if(!id||f.conflicto){desconocidoGlobal=true;avisar(f.id,'Accesorio registrado: resolver tramo o cantidad contradictoria.');for(const tramo of f.tramos)agregar(f.id,tramo,Math.max(1,cantidad),null,false,'Accesorio sin ubicación técnica inequívoca.');continue;}
    if(cantidad<1)continue;
    const familia={codo90:'Codo 90° fusión',codo45:'Codo 45° fusión',llave:'Llave esférica fusión',cupla:'Cupla fusión'}[f.tipo];
    const nombre=f.tipo==='llave'?'Llave de paso esférica fusión '+de:familia+' '+de;
    agregar(f.id,id,cantidad,familia?buscar(familia,de,nombre):null,true,'Identificar '+f.tipo+' registrado y su equivalencia FUSIOGAS; no se sustituye por cero.');
   }
   const tees=[];
   for(const f of inventario.fisicas.filter(f=>f.tipo==='tee')){
    const entradas=Object.entries(red.orientacion).filter(([,o])=>o.hasta===f.nodo).map(([id])=>id),salidas=Object.entries(red.orientacion).filter(([,o])=>o.desde===f.nodo).map(([id])=>id);
    const conex=[...entradas,...salidas],de=Math.max(...conex.map(id=>diametros.get(id)||0));
    const tee=d.productos.find(x=>norm(x.familia)===norm('Te fusión')&&Number(x.medidaOriginal)===de);
    const item={identidad:f.id,nodo:f.nodo,cantidad:f.cantidad,producto:tee||null,propuesta:true,reducciones:[],vias:[]};tees.push(item);
    if(f.cantidad!==1||entradas.length!==1||salidas.length!==2||!tee){avisar(f.id,'Tee: verificar una entrada, dos salidas y producto físico compatible.');item.incompleta=true;continue;}
    for(const id of conex){const menor=diametros.get(id);if(menor!==de){
     const existentes=inventario.fisicas.filter(p=>p.reductor&&p.tramos.includes(id));
     const match=existentes.length?null:buscar('Cupla reducción fusión',de+'x'+menor,'Cupla reducción fusión '+de+'x'+menor);
     item.reducciones.push({identidad:f.id+':reduccion:'+id,tramo:id,cantidad:1,producto:match?.producto||null,equivalencia:match?.eq||null,equivalenteM:match?.eq.longitudEquivalenteM??null,propuesta:true});
     if(!match)avisar(f.id+':reduccion:'+id,existentes.length?'Reducción ya registrada: identificar su asociación con la tee sin duplicarla.':'Sin cupla reductora FUSIOGAS documentada '+de+' × '+menor+' mm.');
    }}
    for(const salida of salidas){const via=config.tees?.[f.id]?.viasPorTramo?.[salida],nombre='Te fusión '+de+' - flujo '+(via==='directo'?'a través':via==='giro'?'90º':'pendiente');
     const match=['directo','giro'].includes(via)?buscar('Te fusión',de,nombre):null;
     item.vias.push({tramo:salida,via:via||null,equivalencia:match?.eq||null});
     if(!match)avisar(f.id+':via:'+salida,'Tee '+String(f.nodo).replace('nombre:','').toUpperCase()+': indicar paso directo o giro hacia '+(filasBase.find(x=>x.id===salida)?.nombre||'la salida')+'.');
    }
   }
   for(const nodo of new Set(Object.values(red.orientacion).map(o=>o.desde))){if(Object.values(red.orientacion).filter(o=>o.desde===nodo).length>1&&!tees.some(t=>t.nodo===nodo)){desconocidoGlobal=true;avisar('derivacion:'+nodo,'Derivación registrada sin tee física identificada: completar la conexión, sin inventar cantidades.');}}
   const rutas=p.recorridos.map(r=>{
    const aportes=r.tramos.flatMap(id=>porTramo.get(id)||[]),ids=new Set(r.tramos);
    for(const tee of tees){const via=tee.vias.find(v=>ids.has(v.tramo));if(!via&&!tee.incompleta)continue;
     if(tee.incompleta){if(!inventario.fisicas.find(f=>f.id===tee.identidad)?.tramos.some(id=>ids.has(id)))continue;aportes.push({identidad:tee.identidad,cantidad:1,equivalenteM:null});continue;}
     aportes.push({identidad:tee.identidad,cantidad:1,producto:tee.producto,equivalencia:via?.equivalencia||null,equivalenteM:via?.equivalencia?.longitudEquivalenteM??null,via:via?.via,propuesta:true});
     aportes.push(...tee.reducciones.filter(x=>ids.has(x.tramo)));
    }
    const unicos=[...new Map(aportes.map(x=>[x.identidad,x])).values()],conocido=unicos.reduce((s,x)=>s+(x.equivalenteM??0),0),completo=!desconocidoGlobal&&unicos.every(x=>x.equivalenteM!==null);
    return {...r,aportes:unicos,equivalenteConocidoM:conocido,equivalenteM:completo?conocido:null,longitudConsultaM:r.longitudReal+conocido,completo};
   });
   return {piezas,tees,rutas};
  }
  const puede=t&&validar(d).integro&&!p.errores?.length&&positivo(pcs)&&fuente&&!densidadDiferente;
  let ev=evaluar(fijas),convergente=false;const historia=[],vistos=new Set();
  if(puede)for(let paso=0;paso<40;paso++){
   const firma=JSON.stringify([...fijas]);if(vistos.has(firma)){avisar('convergencia','La iteración no converge; diámetros pendientes.');break;}vistos.add(firma);
   const nuevos=new Map();
   for(const f of filasBase){let elegido=null;
    for(let j=0;j<t.exterioresMm.length;j++){const de=t.exterioresMm[j],prueba=new Map(fijas);prueba.set(f.id,de);const e=evaluar(prueba),rutas=e.rutas.filter(r=>r.tramos.includes(f.id)),l=rutas.length?Math.max(...rutas.map(r=>r.longitudConsultaM)):null,fila=t.filas.find(x=>l>0&&x.longitudM>=l);
     if(fila&&Number.isFinite(f.caudal)&&fila.capacidadesM3h[j]>=f.caudal){elegido=de;break;}
    }
    nuevos.set(f.id,elegido);
   }
   historia.push(Object.fromEntries(nuevos));const igual=[...fijas].every(([id,de])=>nuevos.get(id)===de);
   for(const [id,de]of nuevos)fijas.set(id,de);ev=evaluar(fijas);if(igual){convergente=true;break;}
  }
  ev=evaluar(fijas);
  if(puede&&!convergente)avisar('convergencia','No se obtuvo una solución tabular consistente dentro de los límites del manual.');
  if(!puede){pendientes.clear();for(const [k,v]of pendientesIniciales)pendientes.set(k,v);for(const terminal of terminales)if(!config.terminales?.[terminal.id]?.rosca)avisar(terminal.id,'Falta medida de rosca de '+terminal.nombre+'.');for(const ruta of ev.rutas){ruta.aportes=ruta.aportes.map(a=>({...a,equivalencia:null,equivalenteM:null}));ruta.equivalenteConocidoM=null;ruta.equivalenteM=null;ruta.longitudConsultaM=null;ruta.completo=false;}for(const pieza of ev.piezas){pieza.producto=null;pieza.equivalencia=null;pieza.equivalenteM=null;}ev.tees=[];}
  const filas=filasBase.map(f=>{
   const rutas=ev.rutas.filter(r=>r.tramos.includes(f.id)),ruta=rutas.reduce((a,b)=>!a||b.longitudConsultaM>a.longitudConsultaM?b:a,null),de=puede?fijas.get(f.id):null,j=t?.exterioresMm.indexOf(de),fila=t?.filas.find(x=>ruta&&x.longitudM>=ruta.longitudConsultaM),cap=de&&fila?fila.capacidadesM3h[j]:null;
   if(puede&&!cap)avisar('limite:'+f.id,f.nombre+': fuera de filas/capacidades FUSIOGAS disponibles; no extrapolar.');
   const comprobado=!!(convergente&&ruta&&rutas.every(r=>r.completo)&&cap>=f.caudal);
   return {...f,diametroCandidatoMm:de,longitudConsultaM:ruta?.longitudConsultaM??null,recorridoControl:ruta?.artefacto||null,equivalenteConocidoM:ruta?.equivalenteConocidoM??null,equivalenteM:rutas.every(r=>r.completo)?ruta?.equivalenteM??null:null,filaM:cap?fila.longitudM:null,capacidadM3h:cap,pagina:t?.pagina||null,comprobadoBajoPropuestas:comprobado,diametroDefinitivo:null,estado:comprobado?'Capacidad cubierta bajo propuestas FUSIOGAS; instalación real por verificar':'Preliminar; equivalencias o condiciones incompletas'};
  });
  return {estado:'bloqueado',estadoTabular:filas.every(f=>f.comprobadoBajoPropuestas)?'cubierto-bajo-propuestas':'parcial',sistema:'fusiogas',gas,tablaGas,pagina:t?.pagina||null,densidadReferencia:t?.densidadRelativa??null,pcs:positivo(pcs)&&fuente?pcs:null,fuentePCS:fuente,caidaImpresa:t?.caidaPresionImpresa||null,filas,recorridos:ev.rutas,piezas:ev.piezas,tees:ev.tees,convergente,historia,pendientes:[...pendientes.values()],diametrosDefinitivos:null,aprobacionNormativa:false,terminales:terminales.map(x=>({...x,rosca:config.terminales?.[x.id]?.rosca||null})),fuente:d.fuente};
 }

 const api={validar,capacidad,accesorio,producto,adaptador,diagnostico,dimensionar};if(typeof module==='object'&&module.exports)module.exports=api;else root.FusiogasTecnico=api;
})(globalThis);
