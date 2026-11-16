const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{chromium}=require('playwright');
test('Paso 1 móvil: modos persistentes y controles originales reubicados sin duplicación',async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errores=[];p.on('pageerror',e=>errores.push(e.message));p.on('dialog',d=>d.accept());
 await p.route('https://paso1.invalid/**',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('index.html','utf8')}));await p.goto('https://paso1.invalid');await p.getByRole('button',{name:'Nuevo proyecto',exact:true}).tap();await p.getByRole('button',{name:'GAS',exact:true}).tap();
 await p.locator('#nombreProyectoGas').fill('Proyecto pantalla uno');await p.locator('#catalogoSistemaGas').selectOption('sigas');await p.locator('#presentacionGas').selectOption('completo');await p.evaluate(()=>{cambiarModoCargaGas('profesional');guardarEstadoGuiadoGas()});
 for(const id of ['nombreProyectoGas','catalogoSistemaGas','presentacionGas'])assert.equal(await p.locator('#'+id).isVisible(),true);
 assert.equal(await p.locator('#modoCargaGas').isVisible(),false);assert.equal(await p.locator('#presentacionGas option').allTextContents().then(v=>v.join('|')),'Solo diámetros|Diámetros y materiales');assert.equal(await p.getByText('¿Qué querés calcular?',{exact:true}).isVisible(),true);assert.equal(await p.locator('#entradaCasilleroGas').isVisible(),false);assert.equal(await p.locator('#guiadoModo').evaluate(n=>n.closest('.guiado-paso').id),'guiadoPaso1');
 await p.screenshot({path:'/tmp/gas-paso1-selector-unico.png',fullPage:true});await p.locator('#guiadoContinuar').tap();assert.equal(await p.evaluate(()=>modoCargaGas),'profesional');await p.locator('#guiadoAtras').tap();assert.equal(await p.evaluate(()=>modoCargaGas),'profesional');
 await p.reload();await p.getByRole('button',{name:'Mis proyectos',exact:true}).tap();await p.getByRole('button',{name:'Proyecto pantalla uno',exact:true}).tap();assert.equal(await p.evaluate(()=>modoCargaGas),'profesional');
 await p.locator('#guiadoContinuar').tap();await p.locator('#guiadoContinuar').tap();
 assert.equal(await p.locator('#entradaCasilleroGas').evaluate(n=>n.closest('#agregarAccesoriosGas')!==null),true);
 await p.locator('#entradaCasilleroGas').evaluate(n=>n.closest('details').open=true);await p.locator('#entradaCasilleroGas').selectOption('lateral');assert.equal(await p.evaluate(()=>tramos.length),0);assert.equal(await p.locator('#codoCasilleroGas').inputValue(),'pendiente');
 await p.locator('#guiadoConsultaConsumos > summary').tap();assert.equal(await p.locator('#consumos').isVisible(),true);
 assert.equal(await p.locator('#deteccionOpcionalGas').evaluate(n=>n.closest('#guiadoPaso5')!==null),true);assert.equal(await p.locator('#dimensionGas').evaluate(n=>n.closest('#guiadoPaso7')!==null),true);assert.equal(await p.locator('#exportarListaGas').evaluate(n=>n.closest('#guiadoPaso7')!==null),true);
 await p.locator('#guiadoAvanzadas > summary').tap();assert.equal(await p.locator('#respaldosConfiguracionGas > summary').isVisible(),true);assert.equal(await p.locator('#planoOpcionalGas > summary').isVisible(),true);
 for(const id of ['modoCargaGas','entradaCasilleroGas','importarRespaldo','camara','galeria'])assert.equal(await p.locator('#'+id).count(),1);
 await p.getByRole('button',{name:'Abrir la vista anterior del proyecto',exact:true}).tap();assert.equal(await p.locator('#entradaCasilleroGas').evaluate(n=>n.closest('#herramientasGasOpcionales')!==null),true);assert.deepEqual(errores,[]);
 }finally{await b.close();}
});
