const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{chromium}=require('playwright');
async function movil(accion){
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errores=[];p.on('pageerror',e=>errores.push(e.message));p.on('dialog',d=>d.accept());
 try{await p.route('https://pcs-ensayo.invalid/**',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('index.html','utf8')}));await p.goto('https://pcs-ensayo.invalid');await p.getByRole('button',{name:'🔥 Gas',exact:true}).tap();await accion(p);assert.deepEqual(errores,[]);}finally{await b.close();}
}
test('Móvil SIGAS: PCS marcado como ensayo, vías persistentes y resultados parciales sin duplicar piezas',()=>movil(async p=>{
 await p.getByRole('button',{name:'Cargar instalación de prueba',exact:true}).tap();await p.locator('#pasoRevisarGas').tap();
 for(const [i,orden]of [[0,'giro-directo'],[1,'giro-giro']]){await p.locator('#listaTramos').getByRole('button',{name:'Revisar accesorios',exact:true}).nth(i).tap();await p.locator('#viasTeeRapidaGas input[value="'+orden+'"]').check();await p.waitForTimeout(350);}
 await p.locator('#calcularCaneriaGas').tap();await p.waitForTimeout(900);
 const informe=p.locator('#resumenPrincipalMaterialesGas > .ejercicio-sigas');
 assert.match(await informe.locator('.pcs-ensayo').innerText(),/EXCLUSIVAMENTE DE ENSAYO.*9\.300/);
 assert.match(await informe.innerText(),/10 mmca/);assert.match(await informe.innerText(),/no tienen pérdida cero|pérdidas aún desconocidas no son cero/);
 const filas=informe.locator('.resultados-tramos tbody tr');assert.equal(await filas.count(),5);
 for(const [i,d]of [25,25,20,25,20].entries())assert.match(await filas.nth(i).innerText(),new RegExp('\\b'+d+' mm\\b'));
 assert.match(await informe.locator('.materiales-conocidos').innerText(),/Codos de 90°\s+15/);assert.match(await informe.locator('.materiales-conocidos').innerText(),/Tees físicas\s+2/);
 const antes=await p.evaluate(()=>({tees:JSON.stringify(proyectoGasActual().calculoSigas.tees),datos:localStorage.getItem('canerias-proyectos-v1')}));
 await informe.getByText('Propuestas SIGAS · no confirmadas',{exact:true}).tap();assert.match(await informe.innerText(),/60-130025000/);assert.match(await informe.innerText(),/60-241025020/);
 assert.equal(await p.evaluate(()=>localStorage.getItem('canerias-proyectos-v1')),antes.datos);
 assert.equal(await p.evaluate(()=>resultadoPreliminarSigasGas().completo),false);
 assert.equal(await p.evaluate(()=>resultadoPreliminarSigasGas().bloqueos.length),4);
 await informe.locator('.resultados-tramos').scrollIntoViewIfNeeded();await p.screenshot({path:'/tmp/sigas-pcs-ensayo-android.png'});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await p.evaluate(()=>prepararInformeActual());assert.match(await p.locator('#informeImpresion').innerText(),/PCS EXCLUSIVAMENTE DE ENSAYO/);assert.equal(await p.locator('#informeImpresion select,#informeImpresion input,#informeImpresion button').count(),0);
 await p.emulateMedia({media:'print'});await p.pdf({path:'/tmp/sigas-pcs-ensayo.pdf',format:'A4',printBackground:true});await p.emulateMedia({media:'screen'});
 await p.reload();await p.getByRole('button',{name:'🔥 Gas',exact:true}).tap();assert.equal(await p.evaluate(()=>JSON.stringify(proyectoGasActual().calculoSigas.tees)),antes.tees);
 assert.deepEqual(await p.evaluate(()=>resultadoPreliminarSigasGas().cantidadesDeclaradas),{codo90:15,tee:2,llave:3});
 assert.deepEqual(await p.evaluate(()=>calcularPreseleccionSigasGas().filas.map(f=>f.consumoKcal)),[21800,15800,6000,11000,4800]);
}));
test('Móvil SIGAS: recuperar PCS propio no lo reemplaza; proyecto real sigue sin PCS automático',()=>movil(async p=>{
 await p.getByRole('button',{name:'Cargar instalación de prueba',exact:true}).tap();
 await p.evaluate(()=>guardarPCSPreliminarSigasGas(9600,'Fuente propia guardada'));await p.reload();await p.getByRole('button',{name:'🔥 Gas',exact:true}).tap();await p.getByRole('button',{name:'Cargar instalación de prueba',exact:true}).tap();
 assert.equal(await p.evaluate(()=>instalacionGas.perfil.poderCalorifico),9600);assert.equal(await p.evaluate(()=>instalacionGas.perfil.fuenteGas),'Fuente propia guardada');
 assert.match(await p.locator('#resumenPrincipalMaterialesGas .pcs-ensayo').innerText(),/PCS guardado del proyecto.*9\.600/);
 await p.getByRole('button',{name:'Nuevo proyecto',exact:true}).tap();await p.locator('#nombreProyectoGas').fill('Proyecto real sin ensayo');await p.locator('#guardarNombreProyectoGas').tap();await p.locator('#catalogoSistemaGas').selectOption('sigas');
 assert.equal(await p.evaluate(()=>instalacionGas.perfil.poderCalorifico),undefined);assert.equal(await p.getByRole('button',{name:'Usar PCS de ensayo: 9.300 kcal/m³',exact:true}).count(),0);
}));
