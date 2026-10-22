const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const http=require('node:http');
const fs=require('node:fs');
test('persistencia, consumos, especialidades, impresión y foto local',async()=>{
 const carpeta=fs.mkdtempSync(require('node:path').join(require('node:os').tmpdir(),'canerias-html-solo-'));fs.copyFileSync('index.html',require('node:path').join(carpeta,'index.html'));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(require('node:url').pathToFileURL(require('node:path').join(carpeta,'index.html')).href);await page.evaluate(()=>localStorage.clear());await page.reload();
 await page.getByRole('button',{name:'🔥 Gas',exact:true}).click();
 await page.locator('#duda').fill('Revisar tramo A-B');await page.getByRole('button',{name:'Guardar aclaración',exact:true}).click();
 for(const [id,value] of Object.entries({desde:'A',hasta:'B',metros:'15',consumoTramo:'16000'}))await page.locator('#'+id).fill(value);
 await page.locator('#diametro').selectOption({label:'1/2"'});await page.locator('#llave').check();
 await page.getByRole('button',{name:'+ AGREGAR TRAMO',exact:true}).click();
 await page.getByRole('button',{name:'🧮 CALCULAR MATERIALES',exact:true}).click();
 assert.match(await page.locator('#resultadoMateriales').innerText(),/3 tiras.*18 m a comprar.*2 cuplas/s);
 await page.locator('#galeria').setInputFiles({name:'foto.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jXioAAAAASUVORK5CYII=','base64')});
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('canerias-proyectos-v1')).gas.foto);
 await page.getByRole('button',{name:'Revisar croquis para entrega',exact:true}).click();assert.equal(await page.locator('#visor').isVisible(),true);await page.getByRole('button',{name:'Cerrar imagen',exact:true}).click();
 const confirmar=page.locator('label[for="entregaCroquisConfirmado"]');await confirmar.tap();assert.equal(await page.locator('#entregaCroquisConfirmado').isChecked(),true);assert.match(await page.locator('#entregaEstado').innerText(),/CONFIRMADO:/);
 await confirmar.tap();assert.equal(await page.locator('#entregaCroquisConfirmado').isChecked(),false);await confirmar.tap();
 await page.reload();await page.getByRole('button',{name:'🔥 Gas',exact:true}).click();assert.equal(await page.locator('#entregaCroquisConfirmado').isChecked(),true);await confirmar.tap();assert.equal(await page.locator('#entregaCroquisConfirmado').isChecked(),false);

 await page.getByRole('button',{name:'🧮 Consulta de consumos de gas',exact:true}).click();
 await page.locator('#gp').fill('9300');await page.getByRole('button',{name:'Agregar artefacto',exact:true}).click();
 await page.getByRole('button',{name:'CALCULAR CONSUMO TOTAL',exact:true}).click();assert.match(await page.locator('#resultadoGas').innerText(),/1 m³\/h/);
 await page.locator('#gt').selectOption('22300');assert.match(await page.locator('#resultadoGas').innerText(),/0,42 m³\/h/);
 await page.reload();await page.getByRole('button',{name:'🔥 Gas',exact:true}).click();
 assert.equal(await page.locator('#duda').inputValue(),'Revisar tramo A-B');assert.match(await page.locator('#listaTramos').innerText(),/15 m/);assert.match(await page.locator('#imagen').getAttribute('src'),/^data:image\/png/);
 await page.getByRole('button',{name:'← Cambiar especialidad',exact:true}).click();await page.getByRole('button',{name:'💧 Agua',exact:true}).click();await page.getByRole('button',{name:'Cargar croquis de referencia',exact:true}).click();assert.equal(await page.locator('#formularioGas').isVisible(),false);assert.equal(await page.locator('#duda').inputValue(),'');
 await page.locator('#duda').fill('Agua separada');
 await page.getByRole('button',{name:'← Cambiar especialidad',exact:true}).click();await page.getByRole('button',{name:'🔥 Gas',exact:true}).click();assert.equal(await page.locator('#duda').inputValue(),'Revisar tramo A-B');
 await page.getByRole('button',{name:'🧮 CALCULAR MATERIALES',exact:true}).click();await page.getByRole('button',{name:'Detectar accesorios automáticamente',exact:true}).click();assert.equal(await page.locator('#panelDeteccionGas').isVisible(),true);await page.evaluate(()=>generarPlanGas());assert.ok(await page.locator('.gas-material-card').count()>0);assert.equal(await page.locator('#matResultado table').count(),0);await page.locator('.gas-material-card summary').first().tap();assert.equal(await page.locator('.gas-material-card details').first().evaluate(el=>el.open),true);assert.ok(await page.locator('#matResultado').evaluate(el=>el.scrollWidth<=el.clientWidth+1));await page.locator('.gas-material-card summary').first().tap();const cardMovil=await page.locator('.gas-material-card').first().boundingBox();assert.ok(cardMovil.height<420);const revisar=page.locator('.gas-revision-check').first();const caja=await revisar.boundingBox();assert.ok(caja.height>=48);const estaba=await revisar.locator('input').isChecked();await revisar.tap();assert.equal(await revisar.locator('input').isChecked(),!estaba);await page.screenshot({path:'/tmp/canerias-tarjetas-compactas-movil.png',fullPage:true});await page.setViewportSize({width:1024,height:900});const tarjetas=page.locator('.gas-material-card');if(await tarjetas.count()>1){const primera=await tarjetas.nth(0).boundingBox(),segunda=await tarjetas.nth(1).boundingBox();assert.ok(segunda.x>primera.x);}await page.screenshot({path:'/tmp/canerias-tarjetas-compactas-escritorio.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.evaluate(()=>prepararInformeActual());await page.emulateMedia({media:'print'});assert.equal(await page.locator('#informeImpresion').isVisible(),true);assert.equal(await page.locator('#trabajo').isVisible(),false);assert.match(await page.locator('#informeImpresion').innerText(),/Revisar tramo A-B/);assert.deepEqual(await page.locator('#informeImpresion table').first().locator('thead th').allTextContents(),['TRAMO','REAL (m)','EQUIVALENTE (m)','DEFINITIVO (m)','CONSUMO (m³/h)','DIÁMETRO']);await page.pdf({path:'/tmp/canerias-informe-prueba.pdf',format:'A4',preferCSSPageSize:true});
 assert.deepEqual(errors,[]);
 }finally{await browser.close();fs.rmSync(carpeta,{recursive:true,force:true});}
});
