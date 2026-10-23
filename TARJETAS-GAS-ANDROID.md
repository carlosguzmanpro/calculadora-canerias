# Presentación móvil de materiales GAS

Base: prueba/conexiones-estructuradas-gas, ee4ce1b.
Nueva rama experimental: prueba/tarjetas-materiales-android.

## Cambios exclusivamente de presentación
- La lista de compra se muestra en tarjetas en lugar de una tabla horizontal. Cada material mantiene cantidad editable, unidad, ubicación legible, diámetro, estado y casilla Revisado.
- Los supuestos, planes de corte, sobrantes, observaciones y evidencias permanecen disponibles en «Ver detalles técnicos», cerrado inicialmente. No se eliminó información técnica ni se modificaron sus valores.
- Las sugerencias SIN IA muestran el estado una sola vez, detalles desplegables y botones agrupados. Guardar correcciones, Confirmar sugerencia y Rechazar conservan sus acciones originales. Los bloqueos y diferencias respecto de las correcciones manuales permanecen visibles.
- Objetivos táctiles amplios y textos que se ajustan al ancho disponible, sin tabla horizontal en el plan de revisión.
- PDF e impresión mantienen las tablas completas existentes y no incorporan controles ni desplegables.

No se modificaron cálculos, detección de conexiones/accesorios, tablas normativas, exportación CSV, formato de datos guardados ni motor. No se desbloquearon diámetros. AGUA, CLOACAS, fotografía, confirmación del croquis, respaldos y separación entre proyecto y demostración conservan su funcionamiento anterior.

## Verificación
332 pruebas automatizadas aprobadas: 326 existentes y seis nuevas de presentación. Dos pruebas existentes se adaptaron a la nueva estructura visual conservando sus comprobaciones funcionales.
Las nuevas pruebas verifican los seis datos de cada tarjeta, detalles cerrados, ausencia de mutación al renderizar, edición de cantidades (cero distinto de pendiente), rechazo de negativos, persistencia de revisión, tres acciones de sugerencias y conservación de las tees A/B confirmadas sin duplicación tras recarga. También comprueban tablas del PDF sin controles.

La prueba Playwright móvil se amplió para verificar tarjetas, apertura táctil del desplegable y ancho sin desbordamiento a 390 × 844. No pudo ejecutarse porque Chromium falla al iniciar en este entorno (`setsockopt: Operation not permitted`, SIGTRAP). No se generó captura móvil ni se afirma aprobación visual en Android.

## Probar desde Android
1. Exportar un respaldo desde la versión anterior y conservar esa carpeta.
2. Extraer el ZIP completo en una carpeta nueva y abrir index.html con el navegador habitual.
3. Abrir GAS → Mi proyecto. Si Android no comparte el almacenamiento entre ubicaciones, importar el respaldo; no volver a ingresar ni borrar los tramos.
4. Abrir Plan de compra y revisión de materiales y generar la lista si hace falta. Verificar tarjetas, cantidad, diámetro, unidad, ubicación y estado.
5. Abrir Ver detalles técnicos. Ajustar una cantidad y marcar Revisado; guardar y recargar para comprobar persistencia. Los ajustes siguen siendo estimados.
6. Abrir Accesorios sugeridos · SIN IA. Comprobar las tees A/B confirmadas y las acciones de guardar, confirmar y rechazar, sin confirmar piezas nuevas sólo por probar.
7. Revisar los materiales antes de descargar CSV o imprimir. Guardar PDF desde la impresión del navegador y comprobar las tablas y la foto original cuando esté disponible y confirmada.

No se publicó, no se tocó main y no se activaron IA ni servicios pagos.
