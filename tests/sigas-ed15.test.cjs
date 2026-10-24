const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const d=require('../datos/catalogos/sigas/tablas-ed15-2025.js'),api=require('../datos/catalogos/sigas/diagnostico-ed15.js');
const copia=()=>structuredClone(d);
test('SIGAS: fuente original de 48 páginas con hash y edición identificados',()=>{
 assert.equal(d.fuente.paginas,48);assert.equal(d.fuente.edicion,'15 - 2025');assert.equal(d.fuente.fechaEditorial,'Julio 2025');assert.equal(d.fuente.paginaEdicion,46);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(d.fuente.archivo)).digest('hex'),d.fuente.sha256);assert.equal(d.fuente.validacionNormativa,false);
});
test('SIGAS: integridad completa sin habilitación, 60x9 caudales por gas y 202 accesorios',()=>{
 const r=api.validar(d);assert.deepEqual(r.errores,[]);assert.equal(r.habilitado,false);for(const n of [4,5]){assert.equal(d.tablas[n].filas.length,60);assert.equal(d.tablas[n].filas.flatMap(f=>f.capacidadesM3h).length,540);}assert.equal(d.tablas[3].filas.length,202);
});
test('SIGAS: interiores y exteriores propios, no nominales epoxi',()=>{
 for(const n of [4,5]){assert.deepEqual(d.tablas[n].exterioresMm,[20,25,32,40,50,63,75,90,110]);assert.deepEqual(d.tablas[n].interioresTabuladosMm,[13.24,18.19,24.94,33,42.8,54.84,63,74,94]);}assert.equal(d.tablas[3].tipoDiametro,'exterior (no interior)');
});
test('SIGAS: controles de GN cotejados con p22 y ejemplo p26',()=>{
 assert.equal(api.capacidad(d,4,20,40).capacidadM3h,12.269);assert.equal(api.capacidad(d,4,20,63).capacidadM3h,43.677);assert.equal(api.capacidad(d,4,50,20).capacidadM3h,.791);assert.equal(api.capacidad(d,4,200,110).capacidadM3h,53.129);assert.equal(api.capacidad(d,4,1,20).capacidadM3h,5.594);
});
test('SIGAS: controles de propano y sus condiciones sin confundirse con GN o cualquier GLP',()=>{
 const q=api.capacidad(d,5,20,40);assert.equal(q.capacidadM3h,8.023);assert.equal(q.gas,'propano-gaseoso');assert.equal(q.densidadTabulada,1.52);assert.equal(q.caidaPresionImpresa.valor,10);assert.equal(q.caidaPresionImpresa.unidad,'mm');assert.equal(q.caidaPresionImpresa.presionSuministro,null);assert.equal(api.capacidad(d,5,200,110).capacidadM3h,34.743);assert.notEqual(q.capacidadM3h,api.capacidad(d,4,20,40).capacidadM3h);
});
test('SIGAS: original decimal y magnitud m3/h conservados, sin multiplicar por mil',()=>{
 const f=d.tablas[4].filas.find(f=>f.longitudM===50);assert.equal(f.originales[0],'0,791');assert.equal(f.capacidadesM3h[0],.791);assert.equal(d.tablas[4].unidadCapacidad,'m3/h');assert.throws(()=>api.capacidad(d,4,50,'1/2"'),/exterior no tabulado/);
});
test('SIGAS: no interpola ni extrapola, fila superior es opción diagnóstica explícita',()=>{
 assert.throws(()=>api.capacidad(d,4,51,20),/Fila SIGAS ausente/);assert.equal(api.capacidad(d,4,51,20,{criterio:'superior-diagnostico'}).longitudFilaM,55);assert.throws(()=>api.capacidad(d,4,201,20,{criterio:'superior-diagnostico'}),/ausente/);assert.throws(()=>api.capacidad(d,4,0,20),/inválida/);assert.throws(()=>api.capacidad(d,6,20,40),/inválida/);
});
test('SIGAS: Tabla6 solo prolongaciones, 360 valores y 18 vacíos reales',()=>{
 const ts=d.tablas[6].filas.flatMap(f=>f.diametrosMm);assert.equal(ts.length,378);assert.equal(ts.filter(v=>v===null).length,18);assert.equal(ts.filter(v=>v!==null).length,360);assert.equal(api.prolongacion(d,8,20).diametroTabuladoMm,40);assert.equal(api.prolongacion(d,65,100).diametroTabuladoMm,null);assert.throws(()=>api.prolongacion(d,8,21),/exacta/);assert.throws(()=>api.prolongacion(d,101,20),/exacta/);
});
test('SIGAS: llenar una celda vacía o vaciar una impresa se detecta',()=>{
 let t=copia();t.tablas[6].filas[20].diametrosMm[17]=110;assert.match(api.validar(t).errores.join(' '),/Casillero vacío/);t=copia();t.tablas[6].filas[0].diametrosMm[0]=null;assert.match(api.validar(t).errores.join(' '),/Casillero vacío/);
});
test('SIGAS: accesorios miden equivalentes en metros, sin usar N°Ø como factor epoxi',()=>{
 const p=d.tablas[3].filas.find(f=>f.nombreOriginal==='Codo Normal a 90º 20 mm'),q=api.accesorio(d,p.id,7);assert.equal(q.equivalenteUnitarioM,.953);assert.ok(Math.abs(q.equivalenteTotalM-6.671)<1e-12);assert.equal(q.numeroDiametrosImpreso,48);assert.equal(q.pagina,24);assert.notEqual(q.equivalenteUnitarioM,30*.01324);
});
test('SIGAS: tees de paso directo y giro se conservan como filas diferentes',()=>{
 const filas=d.tablas[3].filas;assert.equal(filas.find(f=>f.nombreOriginal==='Te Normal 20 mm, flujo a 90º').longitudEquivalenteM,.771);assert.equal(filas.find(f=>f.nombreOriginal==='Te Normal 20 mm, flujo a través').longitudEquivalenteM,.392);assert.equal(filas.find(f=>f.nombreOriginal==='Llave Esférica 20 mm').longitudEquivalenteM,.678);
});
test('SIGAS: 24 diferencias de N°Ø se informan sin corregir impresos',()=>{
 const r=api.validar(d);assert.equal(r.diferencias.length,24);assert.equal(r.diferencias.find(f=>f.nombre==='Unión Normal 75 mm').numeroImpreso,3);assert.equal(d.tablas[3].filas.find(f=>f.nombreOriginal==='Unión Normal 75 mm').longitudEquivalenteM,.103);assert.match(r.alertas.join(' '),/No recalcular/);
});
test('SIGAS: reductor 75-32 duplicado no se elige por nombre ni por ID como valor resuelto',()=>{
 const r=api.validar(d);assert.equal(r.duplicados.length,1);assert.deepEqual(r.duplicados[0].valores,[.78698,.750]);for(const id of r.duplicados[0].ids)assert.throws(()=>api.accesorio(d,id,1),/repetido/);
});
test('SIGAS: anomalía de propano 75m se conserva con aviso y página',()=>{
 assert.deepEqual(d.tablas[5].filas.find(f=>f.longitudM===75).capacidadesM3h.slice(6),[21.443,32.064,58.311]);assert.match(api.validar(d).alertas.join(' '),/Tabla 5, 75 m/);
});
test('SIGAS: validación detecta capacidades ausentes, duplicados, unidades y encabezados',()=>{
 for(const mutar of [t=>t.tablas[4].unidadCapacidad='L/h',t=>t.tablas[4].filas.pop(),t=>t.tablas[4].filas[1].longitudM=1,t=>t.tablas[4].filas[0].capacidadesM3h[0]=null,t=>t.tablas[4].exterioresMm.reverse(),t=>t.tablas[5].interioresTabuladosMm[0]=13,t=>t.tablas[3].filas[1].id=t.tablas[3].filas[0].id]){const t=copia();mutar(t);assert.ok(api.validar(t).errores.length);assert.equal(api.validar(t).habilitado,false);}
});
test('SIGAS: falta de fuente correcta bloquea las consultas y el adaptador',()=>{
 assert.ok(api.validar(null).errores.length);const t=copia();t.fuente.sha256='otra';assert.throws(()=>api.capacidad(t,4,20,40));assert.equal(api.adaptador(t,'GN'),null);assert.equal(api.adaptador(d,'GLP'),null);assert.equal(api.adaptador(d,'propano-gaseoso').gas,'propano-gaseoso');assert.equal(api.adaptador(d,'propano-gaseoso').verificado,false);
});
test('SIGAS: adaptador del motor tiene candidatos reales pero siempre permanece no aprobado',()=>{
 const p=api.adaptador(d,'GN');assert.equal(p.verificado,false);assert.equal(p.candidatos[0].interiorMm,13.24);assert.equal(p.candidatos[0].filas.find(f=>f.longitud===50).caudal,.791);assert.equal(p.condiciones.presionMinPa,null);assert.equal(p.condiciones.caidaPa,null);assert.equal(p.reglaLongitud,null);assert.deepEqual(p.piezas,{});assert.equal(p.redondeoSuperiorVerificado,false);
});
test('SIGAS: registro CSV verifica 2064 coordenadas, originales y celdas vacías',()=>{
 const lineas=fs.readFileSync('auditoria/sigas-ed15-coordenadas.csv','utf8').trim().split('\n').slice(1);assert.equal(lineas.length,2064);const claves=new Set();
 for(const l of lineas){const [n,p,b,f,c,longitud,id,campo,o,v]=l.split(';');const t=d.tablas[n];claves.add([n,p,b,f,c,id,campo].join('|'));
  if(n==='4'||n==='5'){const fila=t.filas[+f-1];assert.equal(fila.pagina,+p);assert.equal(fila.bloque,b);assert.equal(fila.longitudM,+longitud);assert.equal(fila.originales[+c-1],o);assert.equal(fila.capacidadesM3h[+c-1],+v);}
  else if(n==='6'){const valor=t.filas[+f-1].diametrosMm[+c-1];assert.equal(valor,v==='null'?null:+v);assert.equal(o,valor===null?'VACIO':String(valor));}
  else{const fila=t.filas.find(f=>f.id===id);const [k,original]=campo==='equivalente_m'?['longitudEquivalenteM','longitudEquivalente']:campo==='exterior_m'?['diametroExteriorM','diametroExterior']:['numeroDiametros','numeroDiametros'];assert.equal(fila[k],+v);assert.equal(fila.originales[original],o);assert.equal(fila.pagina,+p);assert.equal(fila.bloque,b);}
 }assert.equal(claves.size,2064);
});
test('SIGAS: reporte de incidencias reproducible y consultas de solo lectura',()=>{
 const antes=JSON.stringify(d);assert.deepEqual(api.validar(d),JSON.parse(fs.readFileSync('auditoria/sigas-ed15-validacion.json')));api.capacidad(d,4,20,40);api.prolongacion(d,8,20);api.adaptador(d,'GN');assert.equal(JSON.stringify(d),antes);
});
test('SIGAS: ejercicio documental p26 conserva 38,929 m3/h y su intervalo tabulado',()=>{
 const base=api.capacidad(d,4,20,40).capacidadM3h;assert.ok(Math.abs(base+26.66-38.929)<1e-12);assert.ok(api.capacidad(d,4,20,50).capacidadM3h<38.929);assert.ok(api.capacidad(d,4,20,63).capacidadM3h>=38.929);assert.equal(api.prolongacion(d,8,20).diametroTabuladoMm,40);assert.equal(api.validar(d).habilitado,false);
});
