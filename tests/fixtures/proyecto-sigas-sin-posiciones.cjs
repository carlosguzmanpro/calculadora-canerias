const app=require('../../diagnosticos/cargar-motor.cjs');
const codigos=["abrir('gas');crearProyectoGas('Obra nueva');seleccionarCatalogoSistemaGas('sigas')",
`instalacionGas.perfil={...instalacionGas.perfil,catalogoTecnicoGas:'sigas',gas:'GN',material:'Acero-polietileno SIGAS Thermofusión',sistema:'Thermofusión',poderCalorifico:9300,fuenteGas:'Dato del ejercicio de ensayo',largosDocumentados2026:true};
tramos=[{id:'ma',desde:'M',hasta:'A',metros:15,consumo:null},{id:'ab',desde:'A',hasta:'B',metros:5,consumo:null},{id:'at',desde:'A',hasta:'Termo',metros:9,consumo:16000},{id:'bc',desde:'B',hasta:'Calefactor',metros:16,consumo:3000},{id:'bo',desde:'B',hasta:'Cocina',metros:13,consumo:10200}].map(t=>({...t,diametro:null}));
artefactos=[{nombre:'Termo',consumo:16000},{nombre:'Calefactor',consumo:3000},{nombre:'Cocina',consumo:10200}];
proyectoGasActual().conteosRapidosGas={ma:{codo90:7,codo45:0,tee:1,llave:0,reduccion:0},ab:{codo90:1,codo45:0,tee:1,llave:0,reduccion:0},at:{codo90:1,codo45:0,tee:0,llave:1,reduccion:0},bc:{codo90:4,codo45:0,tee:0,llave:1,reduccion:0},bo:{codo90:6,codo45:0,tee:0,llave:1,reduccion:0}};
proyectoGasActual().calculoSigas={terminales:{'terminal-medidor':{rosca:'3/4'},'terminal-Termo':{rosca:'1/2'},'terminal-Calefactor':{rosca:'1/2'},'terminal-Cocina':{rosca:'1/2'}}};guardarDatos();calcularMaterialesManualGas();`];
module.exports=function nuevoProyectoSigas(){const a=app();for(const c of codigos)a.run(c);return a;};
module.exports.codigos=codigos;
