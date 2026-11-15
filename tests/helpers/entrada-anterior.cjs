// Las regresiones del editor anterior siguen entrando mediante su acceso conservado.
module.exports=async function abrirGasAnterior(page){
 const accesos=page.locator('#accesosAnterioresInicio');
 if(!await accesos.evaluate(e=>e.open))await accesos.locator(':scope > summary').tap();
 await page.getByRole('button',{name:'🔥 Gas',exact:true}).tap();
};
