const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{chromium}=require('playwright');
test('Resultados GAS móvil: materiales visibles primero, catálogo cerrado y revisiones accesibles',async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route(/^https?:/,r=>r.abort());await page.route('https://resultados.invalid/**',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('index.html','utf8')}));
  await page.goto('https://resultados.invalid/');await page.getByRole('button',{name:'🔥 Gas',exact:true}).tap();await page.locator('#ejerciciosGasSeparados > summary').tap();await page.getByRole('button',{name:'Abrir ejercicio SIGAS · 58 m y 19 codos (proyecto separado)',exact:true}).tap();
  const panel=page.locator('#resumenPrincipalMaterialesGas'),technical=panel.locator('#detallesTecnicosResultadoGas'),summary=technical.locator(':scope > summary');
  assert.equal(await panel.locator(':scope > :first-child').innerText(),'MATERIALES DE LA INSTALACIÓN');assert.equal(await technical.evaluate(e=>e.open),false);assert.equal(await panel.locator('select:visible').count(),0);assert.equal(await panel.locator('table:visible').count(),1);
  const materials=panel.locator('.gas-lista-simple');assert.equal(await materials.isVisible(),true);assert.match(await materials.innerText(),/58 m/);assert.match(await materials.innerText(),/19 unidad/);assert.match(await materials.innerText(),/Cuplas\s+Pendiente/);
  assert.equal(await panel.locator('select').evaluateAll(es=>es.every(e=>e.closest('#detallesTecnicosResultadoGas'))),true);
  const antes=await page.evaluate(()=>({pdf:JSON.stringify(modeloInformeActual()),datos:localStorage.getItem('canerias-proyectos-v1'),calculo:JSON.stringify(calcularPreseleccionSigasGas())}));
  await panel.locator(':scope > h3').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/gas-resultados-materiales-movil.png'});
  await summary.tap();assert.equal(await panel.locator('.sigas-diametros').isVisible(),true);assert.match(await technical.innerText(),/condicionado/);
  const identificacion=technical.getByText('Identificar productos SIGAS para las pérdidas (sin repetir cantidades)',{exact:true});await identificacion.tap();await technical.getByText(/^Accesorios reconocidos ·/).tap();const grupo=technical.locator('.sigas-vinculo').filter({hasText:'Recorrido de termofusión · 6 codos comunes'});await grupo.locator(':scope > summary').tap();await grupo.getByText('Corregir una excepción del producto',{exact:true}).tap();assert.ok(await grupo.locator('select:visible').count()>0);
  await summary.tap();assert.equal(await panel.locator('select:visible').count(),0);assert.equal(await materials.isVisible(),true);
  assert.deepEqual(await page.evaluate(()=>({pdf:JSON.stringify(modeloInformeActual()),datos:localStorage.getItem('canerias-proyectos-v1'),calculo:JSON.stringify(calcularPreseleccionSigasGas())})),antes);
  for(const [tipo,n]of [['codo90',19],['tee',2],['llave',3]])assert.equal(await page.evaluate(tipo=>revisionMaterialesGas.plan.filas.filter(f=>f.tipo===tipo).reduce((n,f)=>n+f.cantidad,0),tipo),n);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.reload();await page.getByRole('button',{name:'🔥 Gas',exact:true}).tap();assert.equal(await technical.evaluate(e=>e.open),false);assert.equal(await panel.locator('select:visible').count(),0);assert.equal(await page.evaluate(()=>revisionMaterialesGas.plan.longitudInformada),58);assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});
