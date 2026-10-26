/* Estado de GAS: lectura común de red, sin habilitar catálogos ni persistir resultados. */
function sincronizarSistemaPrincipalGas(){
 if(modulo!=='gas')return;
 sincronizarPerfilTecnicoGas();
 const id=CatalogosSistemasGas.identificar(instalacionGas.perfil);
 $('catalogoSistemaGas').value=id||'';
 $('estadoCatalogoSistemaGas').textContent=(id==='sigas'?'SIGAS Thermofusión':id==='fusiogas'?'FUSIOGAS Thermofusión':id?'Acero epoxi':'Elegí el sistema del proyecto')+' · materiales disponibles; diámetros pendientes de verificación técnica.';
}
function estadoCierreGas(){
 if(modulo!=='gas')return null;
 let red=null,preparacion=null,sistema=null;
 try{
  red=redFisicaManualGas();preparacion=PreparacionDiametrosGas.prepararRed(red,tramos,perfilTecnicoActualGas());const id=CatalogosSistemasGas.identificar(instalacionGas.perfil);sistema=id;
  const catalogo=CatalogosSistemasGas.obtener(id,TABLA_NAG200_3,TABLA_NAG200_18,SIGAS_ED15_2025,FUSIOGAS_V1_2026);
  const preparada=PreparacionDiametrosGas.prepararEntradaMotor(red,tramos,artefactos,{...instalacionGas,perfil:perfilTecnicoActualGas()});
  const paquete=id==='sigas'?SigasTecnico.adaptador(SIGAS_ED15_2025,perfilTecnicoActualGas().gas):id==='fusiogas'?FusiogasTecnico.adaptador(FUSIOGAS_V1_2026,perfilTecnicoActualGas().gas):catalogoParaGas({...instalacionGas,perfil:perfilTecnicoActualGas()});
  const motor=preparada.entrada?motorDimensionarGas(preparada.entrada.tramos,preparada.entrada.artefactos,preparada.entrada.instalacion,paquete):{estado:'bloqueado',diametros:null,faltantes:preparada.faltantes};
  const faltantes=[...combustibleTecnicoGas().pendientes,...red.errores,...red.faltantes,...preparacion.pendientes,...catalogo.pendientes,...CatalogosSistemasGas.compatibilidad(perfilTecnicoActualGas(),catalogo),...preparada.faltantes,...(motor.faltantes||[])];
  return {sistema:id,consumoTotalKcal:red.total,consumos:red.porTramo,recorridos:preparacion.recorridos,estadoMateriales:'cantidades-manuales-disponibles',estadoDiametros:'pendiente-validacion-tecnica',diametros:null,entradaMotor:preparada.entrada,motor,faltantes:[...new Set(faltantes)]};
 }catch(e){return {sistema,consumoTotalKcal:red?.total??null,consumos:red?.porTramo||{},recorridos:preparacion?.recorridos||[],estadoMateriales:'cantidades-manuales-disponibles',estadoDiametros:'diagnostico-no-disponible',diametros:null,faltantes:['Diagnóstico técnico no disponible: '+e.message+'. Los materiales manuales siguen disponibles.']};}
}
// Diagnóstico de presentación: no cambia el motor, el inventario ni resultados guardados.
function diagnosticoVisibleGas(plan=null){
 const estado=estadoCierreGas(),grupos={calculo:[],compra:[],informacion:[]},claves=new Set();
 const agregar=(grupo,clave,texto)=>{if(!claves.has(grupo+clave)){claves.add(grupo+clave);grupos[grupo].push({clave,texto});}};
 if(!estado)return {...grupos,candidatos:[],estado:null};
 const perfil=perfilTecnicoActualGas();
 if(estado.sistema!=='sigas'||perfil.gas!=='GN'||estado.estadoDiametros==='diagnostico-no-disponible'){
  for(const texto of estado.faltantes)agregar('calculo',texto.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[.]/g,''),texto);
  return {...grupos,candidatos:[],estado};
 }
 try{
  const registro=registroAccesoriosSigasGas(),r=registro.calculo;
  const red=redFisicaManualGas();
  for(const texto of [...red.errores,...red.faltantes,...r.errores])agregar('calculo',texto,texto);
  const campos=[['densidadRelativa','densidad del suministro (tabla: 0,65)'],['unidadPresion','unidad de presión'],['presionDisponible','presión disponible'],['presionMinima','presión mínima requerida'],['perdidaMaxima','pérdida admisible'],['fuentePresiones','fuente de las presiones']];
  const faltan=campos.filter(([k])=>!perfil[k]).map(([,n])=>n);
  if(faltan.length)agregar('calculo','suministro','Suministro: falta '+faltan.join(', ')+'.');
  if(!r.condiciones?.poderCalorifico)agregar('calculo','pcs','Completar poder calorífico y su fuente.');
  agregar('calculo','metodo','Validar el criterio de recorrido completo, fila superior y demanda/simultaneidad para el suministro y método aplicables.');
  for(const p of registro.piezas){
   if(!p.pendientes.length)continue;
   const donde=p.tramos.map(id=>r.filas.find(f=>f.id===id)?.tramo||id).join(', ');
   if(p.necesidadTerminal){
    const datos=p.datosFaltantes.length?p.datosFaltantes.join('; '):[...new Set(p.pendientes.map(x=>x.motivo))].join('; ');
    agregar('calculo',p.necesidadTerminal,donde+': conexión terminal — '+datos+'.'+(p.roscaRequerida?' Rosca '+p.roscaRequerida+'″ ya registrada.':''));
   }else if(p.tipo==='tee')agregar('calculo',p.id,donde+': tee registrada; verificar configuración/medidas y vía directa o giro por recorrido. No volver a cargar su cantidad.');
   else if(p.tipo==='llave')agregar('calculo','llaves','Llaves registradas y asociadas a sus artefactos: identificar tipo/producto para su equivalencia; no repetir cantidades.');
   else agregar('calculo',p.id,donde+': '+[...new Set(p.pendientes.map(x=>x.motivo))].join('; '));
  }
  // Conservar fallos y excepciones nuevos, sin repetir necesidades terminales ya vinculadas.
  for(const f of r.filas)for(const p of [...f.perdidasPendientesTramo,...f.perdidasSinUbicacion]){
   if(registro.piezas.some(x=>x.id===p.piezaId||x.necesidadTerminal===p.piezaId))continue;
   agregar('calculo',p.piezaId,f.tramo+': '+p.motivo);
  }
  for(const texto of registro.entradaTecnica?.inventario?.pendientes||[]){
   if(/Tee en |Tipo real de llave|Cuplas de /i.test(texto))continue;
   agregar('calculo',texto,texto);
  }
  const excepciones=r.pendientes.filter(t=>/incompatible|inconsisten|contradict|no converge|límite|excede/i.test(t));
  for(const texto of excepciones)agregar('calculo',texto,texto);
  if(!r.convergente&&r.filas.length)agregar('calculo','convergencia','Los diámetros candidatos no convergieron; revisar el detalle del cálculo.');
  const compra=plan?prepararCompraActualGas(plan):null;
  if(compra?.tramos.some(t=>t.cuplas===null))agregar('compra','continuidad','Cuplas exactas: faltan segmentos continuos/posiciones o cotejo de uniones. Esto no impide las tiras y cuplas orientativas ni la preselección parcial de diámetros. Las uniones reales y sus pérdidas deben verificarse antes del cierre técnico.');
  for(const texto of compra?.pendientes||[]){
   if(/Cuplas en |Distancia anterior|Distancia posterior|segmentos continuos|no coincide con los accesorios posicionados|accesorios adicionales sin posiciones/i.test(texto))continue;
   agregar('compra',texto,textoMaterialPantallaGas(texto));
  }
  agregar('informacion','alcance','Los candidatos y capacidades consultadas no son diámetros definitivos ni certificación normativa. La caída tabulada de 10 mm no es la presión de suministro.');
  agregar('informacion','localidad','Localidad, distribuidora y referencia normativa deben verificarse para la aplicación real; no cambian las cantidades manuales del ejercicio.');
  const alertas=SigasTecnico.validar(SIGAS_ED15_2025).alertas;
  if(alertas.length)agregar('informacion','documental','Revisión documental SIGAS: '+alertas.map(t=>/Tabla 5/.test(t)?'[GLP; no afecta directamente esta consulta GN] '+t:t).join(' '));
  return {...grupos,candidatos:r.filas.filter(f=>f.candidato).map(f=>({tramo:f.tramo,exteriorMm:f.candidato.exteriorMm})),estado};
 }catch(e){agregar('calculo','error','Diagnóstico SIGAS no disponible: '+e.message+'. Los materiales manuales siguen disponibles.');return {...grupos,candidatos:[],estado};}
}
function renderEstadoCierreGas(out,pendientes,plan=null){
 const estado=estadoCierreGas();if(!estado)return;
 const texto=(padre,s)=>{const p=document.createElement('p');p.textContent=s;padre.append(p);};
 texto(out,'Estado: materiales manuales calculados · consumo total '+(Number.isFinite(estado.consumoTotalKcal)?fmt(estado.consumoTotalKcal)+' kcal/h':'Pendiente de conexiones/consumos')+' · diámetros pendientes de verificación técnica.');
 const d=diagnosticoVisibleGas(plan);
 if(plan?.casilleroMedidorGas?.adicional===1)texto(pendientes,'Incluye un codo de 90° dentro del casillero M por entrada lateral/posterior confirmada y declarado no incluido en los tramos.');
 texto(pendientes,d.candidatos.length?'Candidatos SIGAS disponibles: '+d.candidatos.map(f=>f.tramo+' '+f.exteriorMm+' mm').join(' · ')+'. Pendientes de verificación; cantidades manuales y estimaciones disponibles.':'Las cantidades válidas siguen disponibles aunque falte completar el cálculo técnico.');
 const detalle=document.createElement('details'),titulo=document.createElement('summary');detalle.className='gas-detalles';titulo.textContent='Ver comprobaciones técnicas pendientes ('+d.calculo.length+')';detalle.append(titulo);
 for(const [clave,nombre] of [['calculo','Diámetros y pérdidas'],['compra','Compra exacta · opcional para estimaciones'],['informacion','Información y verificación normativa']]){
  const seccion=document.createElement('details'),sum=document.createElement('summary');sum.textContent=nombre+' · '+d[clave].length;seccion.append(sum);for(const aviso of d[clave])texto(seccion,aviso.texto);detalle.append(seccion);
 }
 pendientes.append(detalle);
 const boton=document.createElement('button');boton.className='alt solo-pantalla';boton.textContent='Ver tablas y diagnóstico avanzado';boton.onclick=()=>mostrarVista('dimensionGas');pendientes.append(boton);
}
