const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const datos=require('../datos/catalogos/sigas/tablas-ed15-2025.js'),revision=require('../auditoria/cierre-sigas-discrepancias.json'),ejemplo=require('../diagnosticos/cierre-gas-cinco-tramos.json');
test('cierre: 24 discrepancias conservan coordenadas e impresos, sin adjudicar una solución técnica',()=>{
 assert.equal(revision.diferencias24.length,24);assert.equal(revision.transcripcionesCorregidas,0);assert.equal(revision.habilitado,false);const ids=new Set();for(const r of revision.diferencias24){const f=datos.tablas[3].filas.find(f=>f.id===r.id);assert.equal(f.longitudEquivalenteM,r.equivalenteImpresoM);assert.equal(f.numeroDiametros,r.numeroImpreso);assert.equal(f.pagina,r.pagina);assert.equal(f.bloque,r.bloque);assert.equal(f.fila,r.fila);assert.equal(f.longitudEquivalenteM/f.diametroExteriorM,r.cocienteDerivado);assert.match(r.estado,/criterio técnico pendiente/);ids.add(r.id);}assert.equal(ids.size,24);
});
test('cierre: duplicado y tres celdas propano permanecen en el estado de origen documental',()=>{
 assert.deepEqual(revision.reductor7532.valores,[.78698,.75]);assert.equal(revision.propano75.length,3);assert.deepEqual(revision.propano75.map(f=>f.impreso75m),[21.443,32.064,58.311]);assert.equal(revision.contactoFabricanteRealizado,false);assert.ok(revision.fuentesPublicasConsultadas.every(f=>f.url.startsWith('https://www.grupodema.com.ar/')));
});
test('cierre: informes del ejemplo comprueban cantidades, consumos y recorridos sin diámetros',()=>{
 assert.equal(ejemplo.length,2);for(const e of ejemplo){assert.deepEqual([e.metros,e.codos90,e.tees,e.llaves,e.consumoTotalKcal],[58,18,2,3,29200]);assert.equal(e.consumos['M-A'],29200);assert.equal(e.consumos['A-B'],13200);assert.equal(e.consumos['A-TERMO'],16000);assert.equal(e.consumos['B-CALEFACTOR'],3000);assert.equal(e.consumos['B-COCINA'],10200);assert.deepEqual(e.recorridos.map(r=>r.longitudRealM),[36,33,24]);assert.equal(e.diametros,null);assert.equal(e.estadoDiametros,'pendiente-validacion-tecnica');assert.ok(e.faltantes.length);}
});
test('cierre: informes son reproducibles y la fuente SIGAS original se conserva',()=>{
 const anterior=process.argv;try{process.argv=[process.execPath,'verificar','--check'];require('../scripts/auditar-cierre-sigas.cjs');require('../scripts/diagnostico-cierre-gas.cjs');}finally{process.argv=anterior;}assert.equal(crypto.createHash('sha256').update(fs.readFileSync(datos.fuente.archivo)).digest('hex'),datos.fuente.sha256);
});
