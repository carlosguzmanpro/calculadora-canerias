const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{chromium}=require('playwright');
test('GAS móvil: cantidades independientes y variantes sin recorrer diámetros del catálogo',async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route(/^https?:/,r=>r.abort());await page.route('https://inventario.invalid/**',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('index.html','utf8')}));
  await page.goto('https://inventario.invalid/');await page.getByRole('button',{name:'🔥 Gas',exact:true}).tap();
  await page.locator('#ejerciciosGasSeparados > summary').tap();await page.getByRole('button',{name:'Abrir ejercicio SIGAS · 58 m y 19 codos (proyecto separado)',exact:true}).tap();
  const panel=page.locator('#resumenPrincipalMaterialesGas');assert.equal(await page.evaluate(()=>revisionMaterialesGas.plan.longitudInformada),58);
  await panel.getByText('VER DETALLES TÉCNICOS',{exact:true}).tap();
  const links=panel.getByText('Identificar productos SIGAS para las pérdidas (sin repetir cantidades)',{exact:true});await links.tap();await panel.getByText(/^Accesorios reconocidos ·/).tap();
  const grupo=panel.locator('.sigas-vinculo').filter({hasText:'Recorrido de termofusión · 6 codos comunes'});await grupo.locator(':scope > summary').tap();
  assert.match(await grupo.innerText(),/6 × Codo Normal a 90º · 32 mm candidato/);
  assert.equal(await grupo.locator('select:visible').count(),0);
  await grupo.getByText('Corregir una excepción del producto',{exact:true}).tap();
  const opciones=await grupo.locator('select option').allTextContents();assert.ok(opciones.some(s=>s.includes('medida automática del tramo')));assert.ok(!opciones.some(s=>/Codo Normal a 90º (20|25|40|50|63) mm/.test(s)));
  await page.screenshot({path:'/tmp/gas-inventario-independiente-movil.png',fullPage:false});
  await page.evaluate(()=>{DimensionamientoSigas.resolver=()=>{throw Error('Catálogo temporalmente no disponible')};cacheRegistroAccesoriosSigasGas=null;calcularMaterialesManualGas()});
  for(const [tipo,n]of [['codo90',19],['tee',2],['llave',3]])assert.equal(await page.evaluate(tipo=>revisionMaterialesGas.plan.filas.filter(f=>f.tipo===tipo).reduce((n,f)=>n+f.cantidad,0),tipo),n);
  assert.match(await panel.textContent(),/Cantidades registradas conservadas/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.reload();await page.getByRole('button',{name:'🔥 Gas',exact:true}).tap();assert.equal(await page.evaluate(()=>redFisicaManualGas().total),29200);assert.equal(await page.evaluate(()=>calcularPreseleccionSigasGas().definitivo),false);assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});
