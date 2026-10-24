const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
test('móvil: diagnóstico de tramos sin diámetros y revisión avanzada plegada',async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errores=[];page.on('pageerror',e=>errores.push(e.message));await page.goto(pathToFileURL(path.resolve('index.html')).href);await page.getByRole('button',{name:'🔥 Gas',exact:true}).tap();
  await page.evaluate(()=>{instalacionGas.perfil.catalogoTecnicoGas='acero-epoxi-roscado-gn';tramos=[{id:'a',desde:'A',hasta:'M',metros:15},{id:'b',desde:'Termo',hasta:'A',metros:9,artefacto:'Termo'}];artefactos=[{nombre:'Termo',consumo:16000}];mostrarVista('dimensionGas');});
  const texto=await page.locator('#preparacionDiametrosGas').innerText();assert.match(texto,/16000/);assert.match(texto,/24 m reales/);assert.match(texto,/diámetro Pendiente/);
  assert.equal(await page.getByText('Revisión avanzada y ejercicios separados (opcional)',{exact:true}).evaluate(e=>e.parentElement.open),false);await page.getByText('Datos técnicos pendientes y tablas disponibles',{exact:true}).tap();assert.match(await page.locator('#preparacionDiametrosGas').innerText(),/441 valores/);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errores,[]);await page.screenshot({path:'/tmp/canerias-preparacion-diametros-movil.png',fullPage:true});
 }finally{await browser.close();}
});
