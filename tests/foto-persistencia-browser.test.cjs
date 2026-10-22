const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
test('foto Android >1 MB: cerrar proceso, reabrir mismo archivo/perfil y generar PDF con foto',async()=>{
 const carpeta=fs.mkdtempSync(path.join(os.tmpdir(),'canerias-foto-persistente-'));
 const archivo=path.join(carpeta,'index.html');fs.copyFileSync('index.html',archivo);
 const url=pathToFileURL(archivo).href,perfil=path.join(carpeta,'chrome');
 const opciones={executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox'],viewport:{width:390,height:844},isMobile:true,hasTouch:true};
 let navegador;
 try{
  navegador=await chromium.launchPersistentContext(perfil,opciones);let page=await navegador.newPage();await page.goto(url);
  await page.getByRole('button',{name:'🔥 Gas',exact:true}).click();
  await page.evaluate(()=>{tramos=[['M','A',15],['A','B',5],['A','Termo',9],['B','Calefactor',16],['B','Cocina',13]].map(([desde,hasta,metros],i)=>({id:'tramo-prueba-'+i,desde,hasta,metros,diametro:null,consumo:null,detalle:{estado:'pendiente',accesorios:[]}}));guardarDatos();});
  const png=Buffer.concat([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jXioAAAAASUVORK5CYII=','base64'),Buffer.alloc(1100000)]);
  await page.locator('#galeria').setInputFiles({name:'croquis-android.png',mimeType:'image/png',buffer:png});
  await page.waitForFunction(()=>document.getElementById('estadoFoto').textContent.startsWith('Foto guardada'));
  const foto=await page.evaluate(()=>JSON.parse(localStorage.getItem('canerias-proyectos-v1')).gas.foto);assert.ok(foto.length>1024*1024);
  await navegador.close();navegador=null;
  navegador=await chromium.launchPersistentContext(perfil,opciones);page=await navegador.newPage();await page.goto(url);await page.getByRole('button',{name:'🔥 Gas',exact:true}).click();
  assert.equal(await page.evaluate(()=>tramos.length),5);assert.equal(await page.locator('#imagen').getAttribute('src'),foto);
  await page.evaluate(()=>prepararInformeActual());assert.equal(await page.locator('#informeImpresion img').getAttribute('src'),foto);
  await page.locator('#informeImpresion img').evaluate(img=>img.decode());await page.emulateMedia({media:'print'});
  await page.pdf({path:'/tmp/canerias-foto-reabierta.pdf',format:'A4',preferCSSPageSize:true});
 }finally{if(navegador)await navegador.close();fs.rmSync(carpeta,{recursive:true,force:true});}
});
