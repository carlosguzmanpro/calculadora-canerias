const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');

async function movil(accion){
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errores=[];p.on('pageerror',e=>errores.push(e.message));p.on('dialog',d=>d.accept());
 try{
  await p.route('https://tees-scroll.invalid/**',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('index.html','utf8')}));
  await p.goto('https://tees-scroll.invalid');await p.getByRole('button',{name:'🔥 Gas',exact:true}).tap();await p.getByRole('button',{name:'Cálculo completo y materiales',exact:true}).tap();
  await p.evaluate(()=>{
   window.saltos=[];
   const vista=mostrarVista;mostrarVista=function(...a){saltos.push(['vista',a[0]]);return vista(...a);};
   const scroll=Element.prototype.scrollIntoView;Element.prototype.scrollIntoView=function(...a){saltos.push(['resultado',this.id]);return scroll.apply(this,a);};
  });
  await accion(p);assert.deepEqual(errores,[]);
 }finally{await b.close();}
}
async function sinSalto(p,control,accion){
 await control.scrollIntoViewIfNeeded();await p.waitForTimeout(550);
 const antes=await control.evaluate(e=>({top:e.getBoundingClientRect().top,y:scrollY}));
 await p.evaluate(()=>saltos=[]);await accion();
 for(const demora of [0,180,900]){
  if(demora)await p.waitForTimeout(demora);
  const despues=await control.evaluate(e=>({top:e.getBoundingClientRect().top,y:scrollY,foco:document.activeElement===e}));
  assert.ok(Math.abs(despues.top-antes.top)<4,JSON.stringify({antes,despues}));
  assert.ok(despues.y>0);assert.equal(despues.foco,true);
  assert.deepEqual(await p.evaluate(()=>saltos),[],'No navegar ni programar desplazamientos al guardar la tee');
 }
}
test('Móvil: selectores A/B guardan sin saltos, también después de animaciones',()=>movil(async p=>{
 await p.getByRole('button',{name:'Cargar instalación de prueba',exact:true}).tap();await p.locator('#pasoRevisarGas').tap();
 for(const [nombre,valor]of [['Desde M–A hacia A–B','giro'],['Desde A–B hacia B–Cocina','giro'],['Desde A–B hacia B–Termotanque','directo']]){
  const c=p.getByLabel(nombre,{exact:true});await sinSalto(p,c,()=>c.selectOption(valor));
  assert.equal(await c.inputValue(),valor);
 }
 await p.reload();await p.getByRole('button',{name:'🔥 Gas',exact:true}).tap();await p.getByRole('button',{name:'Cálculo completo y materiales',exact:true}).tap();await p.locator('#pasoRevisarGas').tap();
 assert.deepEqual(await p.evaluate(()=>{const t=proyectoGasActual().calculoSigas.tees;return [t['tee:nombre:a'].viasPorTramo[tramos[1].id],t['tee:nombre:b'].viasPorTramo[tramos[3].id],t['tee:nombre:b'].viasPorTramo[tramos[4].id]];}),['giro','giro','directo']);
}));
test('Móvil: pregunta vinculada conserva edición, foco y accesorios abiertos; CALCULAR sí desplaza',()=>movil(async p=>{
 await p.getByRole('button',{name:'Cargar instalación de prueba',exact:true}).tap();await p.locator('#pasoRevisarGas').tap();
 await p.locator('#listaTramos').getByRole('button',{name:'Revisar accesorios',exact:true}).first().tap();
 await p.locator('#metros').fill('7,91');
 const c=p.locator('#viasTeeRapidaGas input[value="directo-giro"]');await sinSalto(p,c,()=>c.check());
 assert.equal(await p.locator('#metros').inputValue(),'7.91');
 assert.equal(await p.locator('#agregarAccesoriosGas').evaluate(e=>e.open),true);
 assert.deepEqual(await p.evaluate(()=>[editandoTramo,tramos[0].metros]),[0,7.9]);
 assert.deepEqual(await p.evaluate(()=>[redFisicaManualGas().porTramo[tramos[0].id],redFisicaManualGas().porTramo[tramos[1].id]]),[21800,15800]);
 assert.deepEqual(await p.evaluate(()=>['codo90','tee','llave'].map(tipo=>revisionMaterialesGas.plan.filas.filter(f=>f.tipo===tipo).reduce((n,f)=>n+f.cantidad,0))),[15,2,3]);
 await p.locator('#metros').fill('7,9');await p.locator('#calcularCaneriaGas').tap();await p.waitForTimeout(900);
 assert.ok(await p.evaluate(()=>saltos.some(s=>s[0]==='resultado')),'El cálculo explícito conserva el acceso automático al resultado');
 await p.reload();await p.getByRole('button',{name:'🔥 Gas',exact:true}).tap();await p.getByRole('button',{name:'Cálculo completo y materiales',exact:true}).tap();await p.locator('#pasoRevisarGas').tap();
 await p.locator('#listaTramos').getByRole('button',{name:'Revisar accesorios',exact:true}).first().tap();
 assert.equal(await p.locator('#viasTeeRapidaGas input:checked').inputValue(),'directo-giro');
 await p.locator('#panelTeeRapidaGas').screenshot({path:'/tmp/tees-sin-salto-android.png'});
}));
test('Móvil: tres opciones provisionales sin tramos no desplazan y persisten sin inventar vínculos',()=>movil(async p=>{
 await p.getByRole('button',{name:'Nuevo proyecto',exact:true}).tap();await p.locator('#nombreProyectoGas').fill('Tee provisional sin saltos');await p.locator('#guardarNombreProyectoGas').tap();
 await p.locator('#editarDatosGas').tap();await p.locator('#agregarAccesoriosGas > summary').tap();await p.locator('#manualGas_tee').fill('1');
 for(const valor of ['directo-giro','giro-directo','giro-giro']){
  const c=p.locator('#viasTeeRapidaGas input[value="'+valor+'"]');await sinSalto(p,c,()=>c.check());
 }
 assert.equal(await p.evaluate(()=>tramos.length),0);assert.equal(await p.evaluate(()=>Object.keys(proyectoGasActual().calculoSigas?.tees||{}).length),0);
 await p.reload();await p.getByRole('button',{name:'🔥 Gas',exact:true}).tap();await p.getByRole('button',{name:'Cálculo completo y materiales',exact:true}).tap();await p.locator('#editarDatosGas').tap();
 if(!await p.locator('#agregarAccesoriosGas').evaluate(e=>e.open))await p.locator('#agregarAccesoriosGas > summary').tap();
 assert.equal(await p.locator('#viasTeeRapidaGas input:checked').inputValue(),'giro-giro');
}));
