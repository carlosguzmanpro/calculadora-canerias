// Genera resultados reproducibles del ejemplo separado, sin guardar en la aplicación real.
const fs=require('node:fs');
const cargar=require('../diagnosticos/cargar-motor.cjs');
const {planificarMateriales,planificarCortes}=require('./planificador-gas.js');
const app=cargar();app.run("abrir('gas')");
const entrada=JSON.parse(JSON.stringify(app.run("entradaMaterialesGas('ejemplo')")));
const casos=[['Piezas de cambio pendientes',{}],['Tee reductora integrada (hipótesis)',{uniones:{A:'tee-reductora'}}],['Tee igual más reducción (hipótesis)',{uniones:{A:'tee-igual-reduccion'}}],['Hipótesis por longitud SIN reutilizar',{uniones:{A:'tee-reductora'},hipotesisSinPosiciones:true}],['Hipótesis por longitud CON reutilización',{uniones:{A:'tee-reductora'},hipotesisSinPosiciones:true,reutilizar:true}]];
const resultados=casos.map(([nombre,opciones])=>({nombre,opciones,resultado:planificarMateriales(entrada,opciones)}));
const salida={base:'73cf0ec',dimensionamientoDefinitivo:false,entrada,casos:resultados,demostracionSeparadaDeCortes:{aviso:'Dos segmentos ilustrativos conocidos, NO posiciones del ejercicio',sinReutilizar:planificarCortes([{id:'a',metros:4},{id:'b',metros:2}],{reutilizar:false}),conReutilizar:planificarCortes([{id:'a',metros:4},{id:'b',metros:2}],{reutilizar:true})}};
if(require.main===module){fs.writeFileSync('materiales/resultado-ejercicio.json',JSON.stringify(salida,null,2)+'\n');console.log(JSON.stringify(resultados.map(c=>({nombre:c.nombre,plan:c.resultado.planes.map(p=>({diametro:p.diametro,minimo:p.minimoTeorico,compra:p.compraEstimada,cuplas:p.cuplasPropuestas,hipotesis:p.hipotesis}))})),null,2));}
module.exports=salida;
