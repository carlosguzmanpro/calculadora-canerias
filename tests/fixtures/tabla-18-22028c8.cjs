/* Coeficientes aportados por mensaje. No se deducen diámetros interiores. */
(function(root){
 const datos={
  tabla:18,titulo:'Longitudes equivalentes de accesorios roscados',unidadDiametro:'m',unidadEquivalente:'m',
  procedencia:{tipo:'mensaje-del-usuario',documentoDeclarado:'NAG-200, Tabla N.º 18',edicion:null,fotografiaDisponible:false,cotejoFotografico:false,vigenciaVerificada:false,aplicabilidadVerificada:false},
  transcripcionCompleta:false,
  diametros:[{nominal:'1/2"',interiorM:null,estado:'pendiente'},{nominal:'3/4"',interiorM:null,estado:'pendiente'},{nominal:'1"',interiorM:null,estado:'pendiente'}],
  accesorios:[
   {tipo:'codo45',factorD:14,base:'diametro-del-accesorio',estado:'declarado-por-usuario'},
   {tipo:'codo90',factorD:30,base:'diametro-del-accesorio',estado:'declarado-por-usuario'},
   {tipo:'curva',factorD:20,base:'diametro-del-accesorio',estado:'declarado-por-usuario'},
   {tipo:'tee-directo',factorD:20,base:'diametro-de-la-via',estado:'declarado-por-usuario'},
   {tipo:'tee-giro90',factorD:60,base:'diametro-de-la-via',estado:'declarado-por-usuario'},
   {tipo:'reduccion',factorD:10,base:'diametro-menor',estado:'declarado-por-usuario'},
   {tipo:'valvula-globo',factorD:333,base:'diametro-del-accesorio',estado:'declarado-por-usuario'},
   {tipo:'valvula-esclusa',factorD:7,base:'diametro-del-accesorio',estado:'declarado-por-usuario'},
   {tipo:'valvula-macho',factorD:100,base:'diametro-del-accesorio',estado:'declarado-por-usuario'}
  ],
  redondeo:{decimales:null,regla:null,verificado:false},
  metodoClase:{reduccionesEnMateriales:true,reduccionesEnEquivalentes:false,politicaCuplas:null,fuentePoliticaCuplas:null},
  pendientes:['Fotografía completa, fuente y edición','Diámetros interiores de la fotografía y sus unidades originales','Celdas de equivalencias y criterio de redondeo','Tratamiento documentado de cuplas','Aplicación de las equivalencias de tees reductoras','Tipo real de cada llave; llave genérica no identifica globo, esclusa ni macho','Compatibilidad comercial de piezas y accesorios del croquis']
 };
 if(typeof module==='object'&&module.exports)module.exports=datos;
 else root.TABLA_NAG200_18=datos;
})(globalThis);
