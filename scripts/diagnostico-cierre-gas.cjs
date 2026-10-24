const fs=require('node:fs'),app=require('../diagnosticos/cargar-motor.cjs'),caso=require('../tests/fixtures/cierre-gas-cinco-tramos.cjs');
const resultados=[];
for(const sistema of ['acero-epoxi-roscado-gn','sigas','fusiogas']){
 const a=app();a.ctx.caso=caso(sistema);a.run("abrir('gas');tramos=caso.tramos;artefactos=caso.artefactos;instalacionGas=caso.instalacion;proyectos.gas.conteosRapidosGas=caso.conteos;calcularMaterialesManualGas()");
 const estado=a.run('estadoCierreGas()'),plan=a.run('revisionMaterialesGas.plan'),cantidad=tipo=>plan.filas.filter(f=>f.tipo===tipo).reduce((s,f)=>s+(f.cantidad||0),0);
 resultados.push({sistema,perfil:caso(sistema).instalacion.perfil,metros:plan.longitudInformada,codos90:cantidad('codo90'),tees:cantidad('tee'),llaves:cantidad('llave'),consumoTotalKcal:estado.consumoTotalKcal,consumos:estado.consumos,recorridos:estado.recorridos.map(r=>({artefacto:r.artefacto,tramos:r.tramos,longitudRealM:r.longitudReal,consumoKcal:r.consumoKcal,caudalM3h:r.caudal})),estadoDiametros:estado.estadoDiametros,diametros:estado.diametros,faltantes:estado.faltantes,datosDeUsuarioSinAccesoriosAutomaticos:true});
}
const path='diagnosticos/cierre-gas-cinco-tramos.json',json=JSON.stringify(resultados,null,2)+'\n';
if(process.argv.includes('--check')){if(fs.readFileSync(path,'utf8')!==json)throw Error('Cambió el diagnóstico del ejemplo. Revisar sin forzar resultados.');}else fs.writeFileSync(path,json);
console.log('Tres sistemas: '+resultados.map(r=>[r.metros,r.codos90,r.tees,r.llaves,r.consumoTotalKcal].join('/')).join(' · '));
