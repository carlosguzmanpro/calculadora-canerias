const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
test('Android: formulario único, cantidades, cálculo directo y edición sin conciliación',async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errores=[];page.on('pageerror',e=>errores.push(e.message));await page.goto(pathToFileURL(path.resolve('index.html')).href);await page.getByRole('button',{name:'🔥 Gas',exact:true}).tap();
  for(const [desde,hasta,metros,codos,tee,llave]of [['M','A',15,7,1,0],['A','B',5,1,1,0],['A','Termo',9,1,0,1],['B','Calefactor',16,4,0,1],['B','Cocina',13,5,0,1]]){
   for(const [id,v]of Object.entries({desde,hasta,metros,manualGas_codo90:codos,manualGas_tee:tee,manualGas_llave:llave}))await page.locator('#'+id).fill(String(v));await page.locator('#guardarTramo').tap();
  }
  await page.getByRole('button',{name:'Calcular materiales',exact:true}).first().tap();assert.match(await page.locator('#resumenPrincipalMaterialesGas').innerText(),/58 m/);assert.equal(await page.evaluate(()=>revisionMaterialesGas.plan.filas.filter(f=>f.tipo==='codo90').reduce((s,f)=>s+f.cantidad,0)),18);assert.equal(await page.locator('#conciliacionRapidaGas').evaluate(el=>el.open),false);assert.equal(await page.locator('#ajustesAvanzadosGas').evaluate(el=>el.open),false);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.evaluate(()=>editarTramo(0));await page.locator('#manualGas_codo90').fill('6');await page.locator('#guardarTramo').tap();assert.equal(await page.evaluate(()=>revisionMaterialesGas.plan.filas.filter(f=>f.tipo==='codo90').reduce((s,f)=>s+f.cantidad,0)),17);assert.deepEqual(errores,[]);await page.screenshot({path:'/tmp/canerias-gas-manual-android.png',fullPage:true});
 }finally{await browser.close();}
});
