const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
test('Android: crear, calcular, cambiar y renombrar proyectos desde la interfaz',async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errores=[];page.on('pageerror',e=>errores.push(e.message));await page.goto(pathToFileURL(path.resolve('index.html')).href);await page.getByRole('button',{name:'🔥 Gas',exact:true}).tap();
  async function crear(nombre){await page.getByRole('button',{name:'Nuevo proyecto',exact:true}).tap();await page.locator('#nombreProyectoGas').fill(nombre);await page.locator('#guardarNombreProyectoGas').tap();return page.locator('#ambitoGas').inputValue();}
  const a=await crear('Proyecto A');for(const [id,v]of Object.entries({desde:'M',hasta:'A',metros:'6',manualGas_codo90:'2',manualGas_llave:'1'}))await page.locator('#'+id).fill(v);await page.getByRole('button',{name:'CALCULAR CAÑERÍA',exact:true}).first().tap();
  const b=await crear('Proyecto B');assert.notEqual(a,b);assert.equal(await page.evaluate(()=>tramos.length),0);assert.equal(await page.locator('#desde').inputValue(),'');assert.equal(await page.locator('#imagen').isVisible(),false);
  await page.locator('#ambitoGas').selectOption(a);assert.equal(await page.evaluate(()=>revisionMaterialesGas.plan.longitudInformada),6);assert.equal(await page.evaluate(()=>revisionMaterialesGas.plan.filas.filter(f=>f.tipo==='codo90').reduce((n,f)=>n+f.cantidad,0)),2);
  await page.getByRole('button',{name:'Renombrar proyecto',exact:true}).tap();await page.locator('#nombreProyectoGas').fill('Proyecto A renombrado');await page.locator('#guardarNombreProyectoGas').tap();assert.equal(await page.locator('#ambitoGas').inputValue(),a);await page.locator('#ambitoGas').selectOption(b);assert.equal(await page.evaluate(()=>tramos.length),0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errores,[]);await page.screenshot({path:'/tmp/canerias-proyectos-gas-android.png',fullPage:true});
 }finally{await browser.close();}
});
