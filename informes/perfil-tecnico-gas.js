/* Perfil por proyecto: elecciones explícitas; restaurar no migra ni sobrescribe datos. */
function combustibleTecnicoGas(){
 const p=instalacionGas.perfil,g=proyectoGasActual();
 // Un respaldo legado puede conservar dos selectores contradictorios. Bloquear, sin reinterpretar.
 const referencia=g.tipoGas,esperada=p.gas==='GN'?'9300':['GLP','propano-gaseoso'].includes(p.gas)?'22300':null;
 const conflicto=!!(referencia&&esperada&&referencia!==esperada);
 return {gas:conflicto?null:p.gas,conflicto,pendientes:conflicto?['Combustible guardado y referencia de consumo no coinciden. Elegí el combustible para este proyecto; no se aplicaron tablas GN por defecto.']:p.condicionesCombustiblePendientes?['Combustible cambiado: revisar poder calorífico, densidad, suministro y su fuente. Los valores anteriores se conservaron, sin utilizarlos como condiciones del nuevo gas.']:[]};
}
function perfilTecnicoActualGas(){
 const p={...instalacionGas.perfil},e=combustibleTecnicoGas();p.gas=e.gas;
 if(e.conflicto||p.condicionesCombustiblePendientes){p.poderCalorifico='';p.fuenteGas='';p.densidadRelativa='';}
 return p;
}
function seleccionarCombustibleGas(gas){
 if(modulo!=='gas')return false;if(!['GN','GLP','propano-gaseoso'].includes(gas)){sincronizarPerfilTecnicoGas();return false;}
 const p=instalacionGas.perfil;
 if(p.gas!==gas||combustibleTecnicoGas().conflicto){
  const campos=['poderCalorifico','densidadRelativa','fuenteGas','presionDisponible','presionMinima','perdidaMaxima','unidadPresion','fuentePresiones'];
  const historial=Array.isArray(p.condicionesAnterioresCombustible)?p.condicionesAnterioresCombustible:[];
  const previa={gas:p.gas,tipoGas:proyectoGasActual().tipoGas??null,vinculadaAlCombustible:true,pendientes:p.condicionesCombustiblePendientes===true||combustibleTecnicoGas().conflicto};
  for(const k of campos)previa[k]=p[k]??null;
  p.condicionesAnterioresCombustible=[...historial,previa];
  // Solo recuperar datos documentados de ESTE combustible. Los registros legados ambiguos no se reactivan.
  const propia=historial.slice().reverse().find(h=>h?.gas===gas&&h.vinculadaAlCombustible===true&&h.pendientes===false&&Number(h.poderCalorifico)>0&&typeof h.fuenteGas==='string'&&h.fuenteGas.trim());
  for(const k of campos)p[k]=propia?.[k]??'';
  p.condicionesCombustiblePendientes=!propia;
 }
 p.gas=gas;$('gt').value=gas==='GN'?'9300':'22300';proyectoGasActual().tipoGas=$('gt').value;
 const activo=perfilTecnicoActualGas();
 for(const [k,id]of [['poderCalorifico','dimPCS'],['densidadRelativa','dimDensidad'],['fuenteGas','dimFuenteGas'],['presionDisponible','redPresion'],['presionMinima','redMinima'],['perdidaMaxima','redPerdida'],['unidadPresion','redUnidad'],['fuentePresiones','redFuente']])$(id).value=String(activo[k]??'');
 invalidarConsumos();guardarDatos();sincronizarSistemaPrincipalGas();refrescarResultadosCombustibleGas();return true;
}
function refrescarResultadosCombustibleGas(){
 renderTramos();
 try{mostrarPreparacionDiametrosGas();}catch(e){$('estadoCombustibleGas').textContent+=' Diagnóstico técnico pendiente: '+e.message;}
 renderResumenPrincipalGas();
}
function estadoLargoComercialGas(fuente='proyecto'){
 const p=proyectoGasActual(),id=CatalogosSistemasGas.identificar(instalacionGas.perfil),documento=CatalogosSistemasGas.largoDocumentado(id),documentado=documento?.metros||null,o=p.planCompra?.opciones||{};
 const configurado=o.largoComercial??(fuente==='proyecto'&&instalacionGas.perfil.largosDocumentados2026===true&&documentado?documentado:6);
 return {configurado,documentado,pagina:documento?.pagina||null,estado:o.largoComercial!==undefined?'Valor conservado del proyecto':instalacionGas.perfil.largosDocumentados2026?'Valor inicial según sistema':'Valor previo implícito de 6 m conservado',pendiente:!!documentado&&configurado!==documentado};
}
function usarLargoDocumentadoGas(){
 if(modulo!=='gas')return false;const e=estadoLargoComercialGas();if(!e.documentado)return false;
 const o=datosPlanGas().opciones;o.largoComercialAnterior=o.largoComercial??e.configurado;o.largoComercial=e.documentado;o.fuenteLargoComercial=CatalogosSistemasGas.identificar(instalacionGas.perfil)+' p.'+e.pagina;
 guardarDatos();sincronizarSistemaPrincipalGas();renderResumenPrincipalGas();$('matLargo').value=e.documentado;return true;
}
function sincronizarPerfilTecnicoGas(){
 if(modulo!=='gas')return;
 renderCasilleroMedidorGas();
 const c=combustibleTecnicoGas();$('combustibleSistemaGas').value=c.gas||'';if(!c.conflicto&&['GN','GLP','propano-gaseoso'].includes(c.gas))$('gt').value=c.gas==='GN'?'9300':'22300';
 $('estadoCombustibleGas').textContent=c.pendientes.join(' ')||'Combustible del perfil: '+(c.gas||'Pendiente')+'. La referencia de kcal/m³ no confirma condiciones técnicas.';
 actualizarTextoLargoGas();actualizarControlesCompraGas();
 const e=estadoLargoComercialGas();$('estadoLargoComercialGas').textContent='Largo comercial: '+e.configurado+' m. '+e.estado+'.'+(e.documentado?' Manual del sistema: '+e.documentado+' m (p.'+e.pagina+').'+(e.pendiente?' Diferencia pendiente de revisión; no se cambió el proyecto.':''):'');
 $('usarLargoDocumentadoGas').classList.toggle('oculto',!e.pendiente);
}
