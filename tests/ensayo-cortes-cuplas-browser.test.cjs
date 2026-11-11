const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{chromium}=require('playwright');
test('Móvil: mismo proyecto, cortes ficticios editables, reserva separada, persistencia y SIGAS intacto',async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errores=[];
 p.on('pageerror',e=>errores.push(e.message));p.on('dialog',d=>d.accept());
 try{
  await p.route('https://cortes-ensayo.invalid/**',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('index.html','utf8')}));await p.goto('https://cortes-ensayo.invalid');await p.getByRole('button',{name:'🔥 Gas',exact:true}).tap();await p.getByRole('button',{name:'Cálculo completo y materiales',exact:true}).tap();await p.getByRole('button',{name:'Cargar instalación de prueba',exact:true}).tap();
  await p.locator('#pasoRevisarGas').tap();for(const [i,orden]of [[0,'giro-directo'],[1,'giro-giro']]){await p.locator('#listaTramos').getByRole('button',{name:'Revisar accesorios',exact:true}).nth(i).tap();await p.locator('#viasTeeRapidaGas input[value="'+orden+'"]').check();}
  await p.locator('#calcularCaneriaGas').tap();await p.waitForTimeout(800);
  const estado=()=>p.evaluate(()=>JSON.stringify({tramos,artefactos,instalacionGas,conteos:proyectoGasActual().conteosRapidosGas,config:proyectoGasActual().calculoSigas,r:calcularPreseleccionSigasGas()}));
  const antes=await estado(),id=await p.evaluate(()=>ambitoGas),proyectos=await p.evaluate(()=>registrosProyectosGas().length);
  await p.evaluate(()=>prepararInformeActual());const pdf=await p.locator('#informeImpresion').innerHTML();
  const panel=p.locator('.ensayo-cortes-ideal-gas');assert.equal(await panel.evaluate(e=>e.open),false);await panel.locator(':scope > summary').tap();
  assert.match(await panel.innerText(),/ENSAYO IDEAL/);assert.match(await panel.innerText(),/20,60 m netos · 6 tiras · Cuplas necesarias: 0 · Reserva opcional: 0/);assert.match(await panel.innerText(),/5,00 m netos · 2 tiras · Cuplas necesarias: 1/);
  assert.equal(await panel.getByLabel(/Cortes netos de ensayo/).count(),5);
  await panel.getByText('Ver cortes de 25 mm',{exact:true}).first().tap();assert.match(await panel.innerText(),/M–A/);assert.match(await panel.innerText(),/A–B/);
  await panel.getByRole('heading',{name:'Cinco tramos · cortes de ensayo',exact:true}).scrollIntoViewIfNeeded();await p.screenshot({path:'/tmp/ensayo-cortes-android.png'});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  const largo=panel.getByLabel('Largo comercial del ensayo (m)',{exact:true});await largo.fill('6');await largo.press('Tab');assert.match(await panel.innerText(),/5,00 m netos · 1 tiras · Cuplas necesarias: 0/);
  await largo.fill('4');await largo.press('Tab');const reserva=panel.getByLabel('Reserva opcional de cuplas para compra',{exact:true});await reserva.fill('3');await reserva.press('Tab');assert.match(await panel.innerText(),/20,60 m netos · 6 tiras · Cuplas necesarias: 0 · Reserva opcional: 3/);
  const cortes=panel.getByLabel('Cortes netos de ensayo M–A (m, separados por /)',{exact:true});await cortes.fill('4,20 / 1,50 / 0,90 / 1,80 / 1,10 / 1,40');await cortes.press('Tab');assert.match(await panel.innerText(),/23,60 m netos/);assert.match(await panel.innerText(),/Cambiaste el metraje ficticio/);assert.match(await panel.innerText(),/Cuplas necesarias: 1 · Reserva opcional: 3/);assert.match(await panel.innerText(),/Ensayo guardado/);
  assert.equal(await estado(),antes);assert.equal(await p.evaluate(()=>ambitoGas),id);assert.equal(await p.evaluate(()=>registrosProyectosGas().length),proyectos);
  await p.evaluate(()=>prepararInformeActual());assert.notEqual(await p.locator('#informeImpresion').innerHTML(),pdf);assert.match(await p.locator('#informeImpresion').innerText(),/cortes ficticios no coinciden/);
  const guardado=await p.evaluate(()=>JSON.stringify(proyectoGasActual().ensayoCortesIdealGas));await cortes.fill('incorrecto');await cortes.press('Tab');assert.match(await panel.innerText(),/Revisá el ensayo/);assert.equal(await p.evaluate(()=>JSON.stringify(proyectoGasActual().ensayoCortesIdealGas)),guardado);
  await p.reload();await p.getByRole('button',{name:'🔥 Gas',exact:true}).tap();await p.getByRole('button',{name:'Cálculo completo y materiales',exact:true}).tap();const recuperado=p.locator('.ensayo-cortes-ideal-gas');await recuperado.locator(':scope > summary').tap();assert.equal(await recuperado.getByLabel('Reserva opcional de cuplas para compra',{exact:true}).inputValue(),'3');assert.match(await recuperado.innerText(),/23,60 m netos/);assert.equal(await estado(),antes);assert.deepEqual(errores,[]);
 }finally{await b.close();}
});
