// Acción de navegación explícita de las pruebas de funciones avanzadas.
module.exports=async function abrirPreliminarGas(page){
 const d=page.locator('#resumenPrincipalMaterialesGas > .gas-calculo-preliminar');
 if(await d.count()&&!await d.evaluate(e=>e.open))await d.locator(':scope > summary').tap();
};
