const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
test('GAS 390px: tarjetas completas sin desplazamiento horizontal; escritorio conserva tabla',async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errores=[];page.on('pageerror',e=>errores.push(e.message));await page.goto(pathToFileURL(path.resolve('index.html')).href);
  await page.evaluate(()=>{abrir('gas');tramos=[{id:'movil',desde:'M',hasta:'A',metros:15,diametro:null,detalle:{estado:'pendiente',accesorios:[]}}];calcularMateriales();});
  const tabla=page.locator('.gas-calculo-tramos');assert.equal(await tabla.evaluate(el=>getComputedStyle(el).display),'block');assert.equal(await tabla.locator('tbody td').count(),7);
  assert.equal(await tabla.evaluate(el=>el.scrollWidth<=el.clientWidth),true);assert.equal(await tabla.locator('tbody tr').evaluate(el=>getComputedStyle(el,':after').content),'"Provisorio · hay datos pendientes de revisar"');
  await page.evaluate(()=>abrirPlanGas());await page.getByRole('button',{name:'Generar lista de mi proyecto',exact:true}).click();await page.waitForTimeout(700);const y=await page.locator('#resumenPrincipalMaterialesGas').evaluate(el=>el.getBoundingClientRect().top);assert.ok(y>=0&&y<200);
  await page.screenshot({path:'/tmp/canerias-tarjetas-movil.png',fullPage:true});await page.setViewportSize({width:1100,height:900});assert.equal(await tabla.evaluate(el=>getComputedStyle(el).display),'table');assert.deepEqual(errores,[]);
 }finally{await browser.close();}
});
