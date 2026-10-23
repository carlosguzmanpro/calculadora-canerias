/* Datos separados para uso local file://; no contiene lógica de cálculo. */
(function(root){
 const datos={
  tabla:3,titulo:'Capacidades de gas natural',unidadLongitud:'m',unidadCapacidad:'L/h',
  procedencia:{tipo:'mensaje-del-usuario',documentoDeclarado:'NAG-200, Tabla N.º 3',edicion:null,fotografiaDisponible:false,cotejoFotografico:false,vigenciaVerificada:false,aplicabilidadVerificada:false},
  condiciones:{gas:'GN',densidadRelativa:0.65,referenciaH:{valor:10,unidad:'mmca',significadoVerificado:false}},
  transcripcionCompleta:false,ejerciciosValidados:false,
  columnas:['1/2"','3/4"','1"'],
  filas:[
   {longitud:40,capacidades:[800,2210,4525],estado:'declarado-por-usuario'},
   {longitud:50,capacidades:[715,1975,4035],estado:'declarado-por-usuario'},
   {longitud:65,capacidades:[630,1730,3550],estado:'declarado-por-usuario'},
   {longitud:100,capacidades:[505,1400,2865],estado:'declarado-por-usuario'}
  ],
  pendientes:['Fotografía completa con encabezados y notas','Fuente y edición','Resto de filas y diámetros presentes en la fotografía','Condiciones y aplicabilidad al acero roscado epoxi','Cotejo independiente de cada celda y ejercicios de clase']
 };
 if(typeof module==='object'&&module.exports)module.exports=datos;
 else root.TABLA_NAG200_3=datos;
})(globalThis);
