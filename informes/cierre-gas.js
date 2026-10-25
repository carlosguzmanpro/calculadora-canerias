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
function renderEstadoCierreGas(out,pendientes,plan=null){
 const estado=estadoCierreGas();if(!estado)return;
 const texto=(padre,s)=>{const p=document.createElement('p');p.textContent=s;padre.append(p);};
 texto(out,'Estado: materiales manuales calculados · consumo total '+(Number.isFinite(estado.consumoTotalKcal)?fmt(estado.consumoTotalKcal)+' kcal/h':'Pendiente de conexiones/consumos')+' · diámetros pendientes de verificación técnica.');
 texto(pendientes,'El bloqueo técnico no impide obtener las cantidades válidas. No se asignaron diámetros orientativos.'+(plan?.casilleroMedidorGas?.adicional===1?' Incluye un codo de 90° dentro del casillero M por entrada lateral/posterior confirmada y declarado no incluido en los tramos.':' Se conservan las cantidades declaradas y el cotejo del casillero M.'));
 const comprobaciones=[...new Set([...(plan?avisosListaManualGas(plan):[]),...estado.faltantes])];const detalle=document.createElement('details'),titulo=document.createElement('summary');detalle.className='gas-detalles';titulo.textContent='Ver comprobaciones técnicas pendientes ('+comprobaciones.length+')';detalle.append(titulo);renderPendientesAgrupadosCompraGas(detalle,comprobaciones);pendientes.append(detalle);
 const boton=document.createElement('button');boton.className='alt solo-pantalla';boton.textContent='Ver tablas y diagnóstico avanzado';boton.onclick=()=>mostrarVista('dimensionGas');pendientes.append(boton);
}
