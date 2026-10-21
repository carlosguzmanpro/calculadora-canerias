// Controles de transcripción e integridad. No constituyen validación normativa.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const t3=require('./fixtures/tabla-3-1e99313.cjs'),t18=require('./fixtures/tabla-18-1e99313.cjs');
const {validarTablas,auditarComplemento,consultarCapacidadDeclarada}=require('../datos/validacion-tablas.js');
const clonar=x=>structuredClone(x);
test('foto3: las 49 longitudes y nueve columnas están representadas sin filas inventadas',()=>{
 const longitudes=[2,3,4,5,6,7,8,9,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,55,60,65,70,75,80,85,90,95,100,110,120,130,140,150,160,170,180,190,200];
 assert.deepEqual(t3.filas.map(f=>f.longitud),longitudes);assert.equal(t3.columnas.length,9);assert.equal(t3.filas.flatMap(f=>f.capacidades).length,441);assert.ok(t3.filas.every(f=>f.capacidades.length===9&&f.capacidades.every(Number.isInteger)));
});
test('foto3: controles exactos y 50 m × media pulgada es 715, nunca 775',()=>{
 const controles=[[40,800,2210,4525],[50,715,1975,4035],[65,630,1730,3550],[100,505,1400,2865]];
 for(const [longitud,...q]of controles)assert.deepEqual(t3.filas.find(f=>f.longitud===longitud).capacidades.slice(0,3),q);
 const c=consultarCapacidadDeclarada(t3,50,'1/2"');assert.equal(c.litrosHora,715);assert.equal(c.metrosCubicosHora,.715);assert.notEqual(c.litrosHora,775);
});
test('foto3: columna completa de media pulgada cotejada, incluidas filas intermedias nuevas',()=>{
 const valores=[3580,2925,2535,2265,2070,1915,1790,1690,1600,1460,1355,1265,1195,1130,1080,1035,990,960,925,895,870,845,820,800,780,765,745,730,715,685,655,630,605,585,565,550,535,520,505,485,460,445,430,415,400,390,380,370,360];
 assert.deepEqual(t3.filas.map(f=>f.capacidades[0]),valores);
});
test('foto3: primera y última fila comprueban alineación de las nueve columnas',()=>{
 assert.deepEqual(t3.filas[0].capacidades,[3580,9895,20260,35695,55835,114615,198330,312851,624217]);
 assert.deepEqual(t3.filas.at(-1).capacidades,[360,990,2025,3540,5580,11460,19830,31230,64217]);
});
test('foto3: capacidades decrecen por longitud y crecen por diámetro en todas las celdas',()=>{
 const r=validarTablas(t3,t18);assert.deepEqual(r.errores,[]);assert.equal(r.capacidades,441);
 for(let i=0;i<t3.filas.length;i++)for(let j=0;j<9;j++){
  const q=t3.filas[i].capacidades[j];assert.ok(q>0);
  if(i)assert.ok(q<=t3.filas[i-1].capacidades[j]);if(j)assert.ok(q>=t3.filas[i].capacidades[j-1]);
 }
});
test('foto3: fila superior real disponible, sin saltar 55 o 60 metros ni extrapolar',()=>{
 assert.equal(consultarCapacidadDeclarada(t3,51,'1"').longitudFila,55);assert.equal(consultarCapacidadDeclarada(t3,56,'1"').longitudFila,60);assert.equal(consultarCapacidadDeclarada(t3,65,'1"').longitudFila,65);assert.throws(()=>consultarCapacidadDeclarada(t3,201,'1"'),/no se extrapola/);
});
test('foto18: nueve d del encabezado y nueve coeficientes sin inventar interiores comerciales',()=>{
 assert.deepEqual(t18.diametros.map(d=>d.diametroTabuladoM),[.013,.019,.025,.032,.038,.051,.063,.076,.101]);
 assert.deepEqual(t3.diametrosEncabezadoMm,[13,19,25,32,38,51,63,76,101]);
 assert.ok(t18.diametros.every(d=>d.interiorM===null&&d.estadoEncabezado==='cotejado'));
 assert.deepEqual(t18.accesorios.map(a=>a.factorD),[14,30,20,20,60,10,333,7,100]);
});
test('foto18: 25 filas, 225 posiciones, 223 números y exactamente dos lecturas pendientes',()=>{
 const r=auditarComplemento(t18);assert.equal(r.celdas,225);assert.equal(r.transcritas,223);assert.deepEqual(r.errores,[]);
 assert.deepEqual(r.dudosas,[{tipo:'codo90',cantidad:5,columna:'2"'},{tipo:'tee-directo',cantidad:5,columna:'3"'}]);assert.equal(t18.transcripcionCompleta,false);
});
test('foto18: ejemplo impreso de dos codos 90 de tres cuartos coincide con 1,14 m',()=>{
 const e=t18.ejemploFotografiado;assert.equal(e.cantidad*e.factorD*e.diametroTabuladoM,1.14);assert.equal(e.equivalenteM,1.14);
 assert.equal(t18.complemento.find(f=>f.tipo==='codo90'&&f.cantidad===2).equivalentesM[1],1.14);
});
test('foto18: nueve discrepancias se detectan sin cambiar el impreso ni adoptar redondeo',()=>{
 const r=auditarComplemento(t18);assert.equal(r.discrepancias.length,9);assert.ok(r.discrepancias.every(c=>c.tipo==='codo45'));
 assert.deepEqual(r.discrepancias.map(c=>[c.cantidad,c.columna,c.impreso,c.referenciaCentésimo]),[
  [1,'3/4"',.26,.27],[2,'2"',1.42,1.43],[2,'2 1/2"',1.77,1.76],[3,'1/2"',.54,.55],[3,'3/4"',.79,.80],[3,'1 1/2"',1.59,1.60],[4,'1/2"',.72,.73],[4,'1 1/2"',2.12,2.13],[4,'2"',2.85,2.86]
 ]);assert.equal(t18.redondeo.verificado,false);assert.equal(t18.redondeo.regla,null);
});
test('foto18: un valor dudoso no se completa por factor d ni se transforma en cero',()=>{
 for(const c of t18.celdasDudosas){assert.equal(c.valor,null);const i=t18.diametros.findIndex(d=>d.nominal===c.columna);assert.equal(t18.complemento.find(f=>f.tipo===c.tipo&&f.cantidad===c.cantidad).equivalentesM[i],null);}
 assert.equal(validarTablas(t3,t18).habilitado,false);
});
test('foto18: filas incompletas, repetidas y equivalentes imposibles se detectan',()=>{
 let t=clonar(t18);t.complemento[0].equivalentesM.pop();assert.match(auditarComplemento(t).errores.join(' '),/incompleta/);
 t=clonar(t18);t.complemento.push(clonar(t.complemento[0]));assert.match(auditarComplemento(t).errores.join(' '),/repetida/);
 t=clonar(t18);t.complemento[0].equivalentesM[0]=-1;assert.match(auditarComplemento(t).errores.join(' '),/inválido/);
 t=clonar(t18);t.complemento.shift();assert.match(auditarComplemento(t).errores.join(' '),/Falta fila/);
});
test('foto18: auditoría detecta pérdida de orden por cantidad o diámetro',()=>{
 let t=clonar(t18);t.complemento[1].equivalentesM[0]=.1;assert.match(auditarComplemento(t).errores.join(' '),/aumentar cantidad/);
 t=clonar(t18);t.complemento[0].equivalentesM[1]=.1;assert.match(auditarComplemento(t).errores.join(' '),/aumentar d/);
});
test('fotos: error de conversión mm/m en encabezados impide validación',()=>{
 const t=clonar(t18);t.diametros[0].diametroTabuladoM=13;assert.match(validarTablas(t3,t).errores.join(' '),/mm\/m incompatibles/);assert.equal(validarTablas(t3,t).habilitado,false);
});
test('fotos: integridad exacta de los originales y procedencia registrada, sin atribuir edición',()=>{
 for(const t of [t3,t18]){
  const digest=crypto.createHash('sha256').update(fs.readFileSync(t.procedencia.archivo)).digest('hex');assert.equal(digest,t.procedencia.sha256);assert.equal(t.procedencia.fotografiaDisponible,true);assert.equal(t.procedencia.cotejoFotografico,true);assert.equal(t.procedencia.edicion,null);assert.equal(t.procedencia.vigenciaVerificada,false);assert.equal(t.segundaRevisionIndependiente,false);
 }
});
test('fotos: tablas transcritas no habilitan resultados sin el resto de verificaciones',()=>{
 const r=validarTablas(t3,t18);assert.equal(r.habilitado,false);assert.match(r.pendientes.join(' '),/Celda dudosa/);assert.match(r.pendientes.join(' '),/Redondeo por revisar/);assert.match(r.pendientes.join(' '),/edición/);assert.match(r.pendientes.join(' '),/interior|Interiores|Diámetro/);assert.match(r.pendientes.join(' '),/ejercicios/);
 assert.equal(t18.metodoClase.reduccionesEnMateriales,true);assert.equal(t18.metodoClase.reduccionesEnEquivalentes,false);
});
