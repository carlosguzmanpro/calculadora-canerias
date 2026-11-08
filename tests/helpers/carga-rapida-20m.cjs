// Datos del usuario. Sin PCS ni diámetros; los 16 codos y 3 llaves son totales,
// no una distribución inventada entre tramos. Solo las tees se ubican por la topología confirmada.
const filas=[['M','A','7,9',''],['A','B','3,9',''],['A','Calefactor','4,5','6000'],['B','Cocina','2,15','11000'],['B','Termotanque','2,15','4800']];
module.exports=function crear(a=require('../../diagnosticos/cargar-motor.cjs')()){
 a.elements.get('desde').focus=()=>{};a.run("abrir('gas');crearProyectoGas('Ensayo rápido · 20,60 m');seleccionarCatalogoSistemaGas('sigas')");
 for(const [desde,hasta,metros,consumoTramo]of filas){for(const [id,v]of Object.entries({desde,hasta,metros,consumoTramo}))a.elements.get(id).value=v;a.run('agregarTramo()');}
 a.run("datosPlanGas().extras.push({idFisico:'ensayo-16-codos',tipo:'codo90',cantidad:16,ubicacion:'Instalación · distribución por tramo pendiente',confirmado:true},{idFisico:'ensayo-3-llaves',tipo:'llave',cantidad:3,ubicacion:'Instalación · distribución por tramo pendiente',confirmado:true},{idFisico:'ensayo-tee-A',tipo:'tee',cantidad:1,nodo:'A',ubicacion:tramos[0].id,confirmado:true},{idFisico:'ensayo-tee-B',tipo:'tee',cantidad:1,nodo:'B',ubicacion:tramos[1].id,confirmado:true});guardarDatos();calcularMaterialesManualGas()");return a;
};module.exports.filas=filas;
