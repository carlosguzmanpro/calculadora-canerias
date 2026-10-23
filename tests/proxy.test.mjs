import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker,{createHandler,buildGeminiBody,validateModelResult,LIMITS} from '../server/gemini-proxy.mjs';
const image={mimeType:'image/png',data:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jXioAAAAASUVORK5CYII='};
const request=(body={consent:true,image},headers={})=>new Request('https://offline.invalid/analizar',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
const result={version:1,tramos:[{campos:{desde:'M'},accesorios:null}]};
const opts={enabled:true,authenticate:async()=>({id:'prueba'}),limit:async()=>true,transport:async()=>({status:200,text:JSON.stringify(result)})};
async function code(handler,req=request()){const r=await handler(req);return [r.status,(await r.json()).error?.code];}
test('entrada por defecto desactivada incluso con variables que sugieran activarla',async()=>{
 assert.deepEqual(await code(worker.fetch),[503,'IA_DESACTIVADA']);
 const r=await worker.fetch(request(),{GEMINI_ENABLED:'true'});assert.equal(r.status,503);
});
test('sin sesión no consume cuota ni llama al transporte',async()=>{
 const h=createHandler({...opts,authenticate:async()=>null,limit:()=>assert.fail('cuota'),transport:()=>assert.fail('red')});
 assert.deepEqual(await code(h),[401,'ACCESO_NO_AUTORIZADO']);
});
test('cuota agotada no llama al proveedor y no activa pagos',async()=>{
 assert.deepEqual(await code(createHandler({...opts,limit:async()=>false,transport:()=>assert.fail('transporte')})),[429,'CUOTA_AGOTADA']);
});
test('exige consentimiento y valida imagen sin exponer secretos',async()=>{
 assert.deepEqual(await code(createHandler(opts),request({consent:false,image})),[400,'CONSENTIMIENTO_REQUERIDO']);
 assert.deepEqual(await code(createHandler(opts),request({consent:true,image:{mimeType:'image/png',data:'YWJj'}})),[400,'IMAGEN_INVALIDA']);
 assert.deepEqual(await code(createHandler(opts),request({consent:true,image:{mimeType:'image/svg+xml',data:'YWJj'}})),[400,'IMAGEN_INVALIDA']);
});
test('limita cuerpos aun sin Content-Length y rechaza formato y método incorrectos',async()=>{
 const h=createHandler(opts);
 assert.deepEqual(await code(h,request({x:'x'.repeat(LIMITS.bodyBytes)})),[413,'IMAGEN_DEMASIADO_GRANDE']);
 assert.deepEqual(await code(h,request({}, {'Content-Type':'text/plain'})),[415,'FORMATO_NO_ADMITIDO']);
 assert.deepEqual(await code(h,new Request('https://offline.invalid')),[405,'METODO_NO_PERMITIDO']);
});
test('no convierte campos ausentes, numéricos en texto o booleanos ausentes a cero',()=>{
 const r=validateModelResult({version:1,tramos:[{campos:{metros:'6',llave:undefined},accesorios:null}]});
 assert.equal(r.tramos[0].campos.metros,null);assert.equal(r.tramos[0].campos.llave,null);assert.equal(r.tramos[0].accesorios,null);assert.equal(r.tramos[0].estadoAccesorios,'pendiente');
});
test('el cuerpo preparado requiere null para dudas y esquema estructurado sin clave',()=>{
 const b=buildGeminiBody(image);assert.ok(b.generationConfig.responseJsonSchema);assert.match(b.systemInstruction.parts[0].text,/null/);
 assert.equal(JSON.stringify(b).includes('apiKey'),false);
});
test('respuesta incompleta válida conserva desconocidos, no confirma y no se cachea',async()=>{
 const r=await createHandler(opts)(request());assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'no-store');
 const data=await r.json();assert.equal(data.tramos[0].campos.metros,null);assert.equal(data.tramos[0].campos.llave,null);assert.equal(data.confirmado,undefined);
});
test('cuota del proveedor, JSON inválido y datos inválidos se manejan sin reintentos',async()=>{
 for(const [transport,esperado] of [
  [async()=>({status:429,text:'secret'}),[429,'CUOTA_AGOTADA']],
  [async()=>({status:500,text:'secret'}),[502,'ERROR_PROVEEDOR']],
  [async()=>({status:200,text:'not json'}),[502,'RESPUESTA_INVALIDA']],
  [async()=>({status:200,text:JSON.stringify({version:1,tramos:[]})}),[502,'RESPUESTA_INVALIDA']],
  [async()=>{throw Error('valor-secreto');},[502,'ERROR_SERVICIO']]]){
  let n=0;const wrapped=async(...args)=>{n++;return transport(...args);};
  assert.deepEqual(await code(createHandler({...opts,transport:wrapped})),esperado);assert.equal(n,1);
 }
});
test('corta espera y limita tamaño de respuesta',async()=>{
 assert.deepEqual(await code(createHandler({...opts,timeoutMs:5,transport:()=>new Promise(()=>{})})),[504,'TIEMPO_AGOTADO']);
 assert.deepEqual(await code(createHandler({...opts,transport:async()=>({status:200,text:'x'.repeat(LIMITS.responseBytes+1)})})),[502,'RESPUESTA_INVALIDA']);
});
