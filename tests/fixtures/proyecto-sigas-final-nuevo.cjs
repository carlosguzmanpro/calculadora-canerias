// Proyecto distinto al ejercicio histórico: datos de entrada, nunca resultados precargados.
const app=require('../../diagnosticos/cargar-motor.cjs');
const codigos=["abrir('gas');crearProyectoGas('Taller y vivienda');seleccionarCatalogoSistemaGas('sigas')",`
instalacionGas.perfil={...instalacionGas.perfil,catalogoTecnicoGas:'sigas',gas:'GN',poderCalorifico:9300,fuenteGas:'Referencia declarada para ensayo; no suministro real',largosDocumentados2026:true};
tramos=[{id:'raiz',desde:'M',hasta:'J',metros:14,consumo:null},{id:'horno',desde:'J',hasta:'Horno',metros:6,consumo:18600},{id:'caldera',desde:'J',hasta:'Caldera',metros:8,consumo:9300}].map(t=>({...t,diametro:null}));
artefactos=[{nombre:'Horno',consumo:18600},{nombre:'Caldera',consumo:9300}];
proyectoGasActual().conteosRapidosGas={raiz:{codo90:2,codo45:0,tee:1,llave:0,reduccion:0},horno:{codo90:2,codo45:0,tee:0,llave:1,reduccion:0},caldera:{codo90:3,codo45:0,tee:0,llave:1,reduccion:0}};
proyectoGasActual().calculoSigas={terminales:{'terminal-medidor':{rosca:'3/4'},'terminal-Horno':{rosca:'1/2'},'terminal-Caldera':{rosca:'1/2'}}};guardarDatos();calcularMaterialesManualGas();`];
module.exports=function nuevoProyectoFinal(){const a=app();for(const c of codigos)a.run(c);return a;};
module.exports.codigos=codigos;
