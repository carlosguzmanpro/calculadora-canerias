const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
test('Android: carga rápida táctil, ceros, recarga, nodos, foto y PDF',async()=>{
 const carpeta=fs.mkdtempSync(path.join(os.tmpdir(),'canerias-carga-rapida-'));
 const archivo=path.join(carpeta,'index.html');fs.copyFileSync('index.html',archivo);let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errores=[];page.on('pageerror',e=>errores.push(e.message));
  await page.goto(pathToFileURL(archivo).href);await page.getByRole('button',{name:'🔥 Gas',exact:true}).click();
  await page.evaluate(()=>{tramos=[['M','A',15],['A','B',5],['A','Termo',9],['B','Calefactor',16],['B','Cocina',13]].map(([desde,hasta,metros],i)=>({id:'r'+i,desde,hasta,metros,diametro:null,consumo:null,detalle:{estado:'pendiente',accesorios:[]}}));instalacionGas.nodos=[{id:'m',nombre:'M',tipo:'medidor'},{id:'a',nombre:'A',tipo:'derivacion'}];proyectos.gas.foto='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jXioAAAAASUVORK5CYII=';mostrarFotoLocal();renderTramos();guardarDatos();});
  await page.getByRole('button',{name:'Revisar accesorios',exact:true}).first().tap();
  assert.equal(await page.locator('#camposRapidosGas input').count(),5);
  await page.locator('#rapidoGas_codo90').fill('5');await page.locator('#rapidoGas_codo45').fill('0');
  await page.getByRole('button',{name:'Guardar cantidades rápidas del tramo',exact:true}).tap();assert.match(await page.locator('#mensajeRapidoGas').innerText(),/guardadas/);
  assert.deepEqual(await page.evaluate(()=>proyectos.gas.conteosRapidosGas.r0),{codo90:5,codo45:0});
  await page.reload();await page.getByRole('button',{name:'🔥 Gas',exact:true}).click();await page.getByRole('button',{name:'Revisar accesorios',exact:true}).first().tap();
  assert.equal(await page.locator('#rapidoGas_codo90').inputValue(),'5');assert.equal(await page.locator('#rapidoGas_codo45').inputValue(),'0');assert.equal(await page.locator('#rapidoGas_tee').inputValue(),'');
  assert.equal(await page.evaluate(()=>tramos.length),5);assert.match(await page.locator('#imagen').getAttribute('src'),/^data:image\/png/);
  await page.locator('#rapidoGas_codo90').fill('7');await page.getByRole('button',{name:'Guardar cantidades rápidas del tramo',exact:true}).tap();
  await page.screenshot({path:'/tmp/canerias-carga-rapida-android.png',fullPage:true});
  await page.evaluate(()=>prepararInformeActual());assert.equal(await page.locator('#informeImpresion input').count(),0);assert.equal(await page.locator('#informeImpresion img').count(),1);assert.deepEqual(errores,[]);
 }finally{if(browser)await browser.close();fs.rmSync(carpeta,{recursive:true,force:true});}
});
