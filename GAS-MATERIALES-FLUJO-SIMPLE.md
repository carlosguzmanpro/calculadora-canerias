# GAS: materiales primero, coincidencias claras y plano opcional

Base auditada: prueba/conciliacion-rapida-materiales-gas, 115ba3a.
Nueva rama: prueba/gas-materiales-flujo-simple.

## Auditoría del recorrido previo
El inventario ya nace de los tramos, detalles, cantidades rápidas y sugerencias confirmadas del mismo proyecto. Las fotografías y el documento PDF también usan ese proyecto; no se necesita otro modelo de instalación para un plano.

Se encontraron tres repeticiones que se pueden reducir sin quitar validaciones:
1. Ceros y cantidades exactamente iguales a piezas conocidas requerían seleccionar coincidencias, escribir cero adicional, marcar alcance y confirmar cada tipo por separado.
2. El usuario debía buscar la lista entre los formularios; no había un resumen principal con las referencias compartidas por tramo.
3. Las firmas de revisión incluían distancias y estado geométrico. Completar sólo esos datos podía poner en revisión tanto una sugerencia confirmada como su conciliación, aunque no hubiese cambiado ninguna pieza. Los avisos de detección también agrupaban cantidades y posiciones pendientes bajo la misma explicación.

El detalle, los errores de identidad y los controles técnicos de compra no pueden eliminarse: una cantidad no demuestra ubicación, diámetro, vía de tee ni segmentos continuos. La primera mejora es acotada a este flujo; no reescribe la aplicación ni añade un generador de planos.

## Cambios de uso
- Obtener materiales de mi proyecto es el acceso principal de GAS. Reutiliza datos y genera la lista existente; no exige fotografía ni plano.
- El resumen muestra materiales agrupados por tipo/medida/estado y sus cantidades. Distingue cantidades identificadas de estimadas/ajustadas y pendientes, conservando las tarjetas editables de abajo.
- Ver materiales por tramo muestra asociaciones conocidas. Una tee compartida es una referencia en varios tramos pero se cuenta una vez en el total. Si las barras o cuplas están calculadas conjuntamente y no hay distribución verificable por tramo, no se reparte su cantidad por suposición. Se indican distribución o ubicación pendientes.
- El resumen se limpia o marca desactualizado al cambiar de espacio/firma. Mi proyecto, Demostración y el ejemplo conservan su separación.

## Coincidencias propuestas
Se proponen sólo totales rápidos que coinciden exactamente con las piezas candidatas conocidas del alcance o con ausencia confirmada (0 sin piezas candidatas). Se excluyen contradicciones, ajustes manuales, cambios reductores integrados, piezas sin ubicación suficiente y revisiones anteriores guardadas que pudieran contener decisiones manuales.

La lista de propuestas permite revisar nombres y piezas conocidas y confirmar varias coincidencias con una acción. El clic es una confirmación explícita de esos vínculos y cero adicionales; no hay aceptación silenciosa. Cada propuesta vuelve a comprobar su firma y pasa por el validador existente. Las propuestas que cambiaron se omiten. Repetir el clic no duplica piezas ni historial.

Una tee conocida y compatible con el alcance puede proponerse como la misma pieza compartida; no se agrega otra. Si hay dos posibles tees y sólo una cantidad rápida, la elección sigue siendo manual.

Para el resto se conserva la revisión detallada, los avisos locales y el guardado de borradores. Sin piezas adicionales (0) facilita ese valor sin confirmar nada. Una contradicción entre detalle y conteo pregunta cuál refleja la instalación y ofrece editar las cantidades; no corrige datos automáticamente.

## No repetir cantidades por datos geométricos
Las firmas guardadas permanecen en los respaldos, sin migración ni borrado. Si la firma cambia, una comparación conservadora comprueba si sólo cambiaron distancias entre accesorios, metros finales o el estado geométrico del detalle. El inventario normalizado debe conservar piezas, cantidades, medidas, orden, nodos, alcance, conexiones y ajustes manuales.

Sólo en ese caso se conserva la revisión de cantidad. No se reescribe el sello original de auditoría. Un cambio de tipo, diámetro, nodo físico, conexión, longitud de tramo o cantidad sigue requiriendo revisión. Las cuplas de la detección conservan su comprobación estricta; no se mantienen por esta excepción geométrica.

Los avisos visibles SIN IA distinguen cantidades ya conciliadas de posiciones/curvas o cantidades todavía pendientes. El detector puro no cambia ni se deducen codos nuevos. Las cantidades adicionales sin distancias siguen dejando compra/segmentos/cuplas pendientes según el plan físico existente.

## Plano opcional y evaluación 2D
Agregar plano (opcional) abre una presentación conectada al proyecto actual: reutiliza número de tramos y artefactos, metros registrados, foto y estado de distancias del detalle. No escribe otro proyecto, no pide de nuevo los conteos conciliados y no supone que la foto haya sido interpretada.

Se mantiene el documento de entrega actual con fotografía y planilla. Si las distancias están completas se informa que no hay que repetirlas; si faltan, se señalan como pendientes y se conserva el acceso al editor existente. Las direcciones y posiciones para dibujar deben estar confirmadas antes de representarse.

Se evaluó una futura presentación 2D: requiere geometría/direcciones confirmadas que la fotografía y los nombres de nodos no aportan automáticamente. Esta etapa NO agrega un editor 2D, posiciones ficticias ni 3D. Tampoco agrega un asistente nuevo de direcciones. La siguiente fase podrá completar sólo esos datos del mismo proyecto; no se implementa sin otra etapa de revisión.

## Conservación
Motor normativo, tablas, evaluarTramo, planificador físico, detector puro, persistencia fotográfica, guardado base, PDF de seis columnas, datos guardados, artefactos y consumos, edición, respaldos JSON, CSV y formularios anteriores conservados. La revisión final de la lista/CSV y las contradicciones técnicas no se eliminan. Se siguen bloqueando diámetros definitivos.

AGUA y CLOACAS no tienen cambios de flujo. No hay dependencias nuevas, IA, APIs, pagos, suscripciones, despliegues ni cambios en main.

## Pruebas y límites
419 pruebas automáticas aprobadas: 402 anteriores y 17 nuevas. Se verifican propuestas exactas y ceros, exclusión de ambigüedades y borradores previos, datos cambiados antes de confirmar, idempotencia de lotes, tees compartidas, resumen con 0/pendiente/ajustes, distribución desconocida, nombres parecidos, aislamiento, respaldos y material sin foto/plano.

Se construyó un proyecto de cinco tramos y veinte conteos conciliados: conserva veinte revisiones al recargar, abrir materiales y plano, y completar geometría sin cambios físicos. Mantiene dos tees y tres llaves, foto y PDF. Se prueba además que cambiar diámetro, tipo o un nodo físico sí obliga a revisar. Esto es una prueba automatizada, no inspección de los datos privados del teléfono.

Se agregó e intentó ejecutar tests/flujo-materiales-browser.test.cjs a 390 × 844. Chromium no pudo iniciar: setsockopt: Operation not permitted / SIGTRAP. No se generó captura ni se afirma prueba visual real en Android. Las interacciones de regresión usan el DOM simulado; la revisión táctil queda pendiente.

Limitaciones deliberadas: las propuestas no cubren todos los casos; las decisiones ambiguas siguen manuales. No se reparte una compra conjunta entre tramos sin datos suficientes. No hay editor 2D nuevo. La información normativa pendiente y la revisión final de compra se conservan.

## Probar desde Android
1. Descargar un respaldo completo y conservar la carpeta probada anterior.
2. Extraer el ZIP en otra carpeta y abrir index.html. Recuperar el JSON si Android usa otro almacenamiento, conservando primero los datos actuales.
3. Abrir GAS y tocar Obtener materiales de mi proyecto. Revisar total, estados y el desplegable de referencias por tramo.
4. Abrir Revisar cantidades rápidas para materiales. Si hay coincidencias nuevas claras, revisar la lista propuesta y confirmar el lote. Las veinte ya conciliadas no deben pedirse otra vez.
5. Resolver contradicciones aparte: nunca aumentar el total ni excluir una pieza del mismo tramo para forzar la confirmación. La edición manual completa sigue disponible.
6. Tocar Agregar plano (opcional). Debe usar la misma instalación sin modificar datos, repetir cantidades ni generar recorridos ficticios. La foto y el documento existentes siguen accesibles.
7. Comprobar foto persistente, PDF, CSV y respaldo nuevo. Al completar sólo distancias, las cantidades se conservan si la identidad física no cambia; cualquier cambio de nodo/pieza/medida relevante se mantiene sujeto a revisión.
