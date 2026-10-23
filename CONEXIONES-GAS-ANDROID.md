# Corrección de conexiones GAS en Android

Base: prueba/deteccion-accesorios-sin-ia, c19f8a4.
Rama: prueba/conexiones-estructuradas-gas.

## Causa y corrección
El detector descartaba tramos con Desde/Hasta válidos cuando otro tramo contenía referencias internas `red`. Ahora lee los campos Desde/Hasta de todos los tramos y concilia los IDs opcionales con los nodos por nombre único. Nunca interpreta el nombre visual como una conexión ni modifica los tramos guardados.

Se conservan los controles de referencias contradictorias, nombres ambiguos, conexiones duplicadas, ciclos y puntos de más de tres bocas. Un ID inexistente permite recuperar los extremos guardados, con aviso; una contradicción o ambigüedad mantiene pendiente la conexión y los accesorios de los puntos afectados. No se inventan codos, curvas ni diámetros.

Las sugerencias siguen requiriendo confirmación. Se conservan las ediciones y rechazos; al resolver una pieza previamente identificada por nombre hacia un ID único se conserva su decisión y edición cuando coinciden sus conexiones. Una confirmación afectada queda para revisión y el registro anterior permanece de respaldo. Las piezas manuales ubicadas no se duplican.

## Verificación
326 pruebas automatizadas aprobadas: 319 casos anteriores conservados (dos expectativas adaptadas al nuevo comportamiento) y siete regresiones nuevas. Se comprueban las cinco conexiones del caso M–A 15 m, A–B 5 m, A–Termo 9 m, B–Calefactor 16 m y B–Cocina 13 m; dos tees sugeridas en A y B, pendientes sin invención, ausencia de incorporación sin confirmación, persistencia de decisiones y no duplicación.

Las pruebas existentes cubren fotografía/confirmación, documento sin controles, seis columnas, almacenamiento, respaldos, proyectos/demostración y módulos de agua/cloacas. No se cambiaron tablas ni motor de dimensionamiento; continúa bloqueado el resultado definitivo.

La prueba visual Playwright no pudo iniciar Chromium: `setsockopt: Operation not permitted` (SIGTRAP del entorno). Esto no equivale a una prueba visual aprobada en Android.

## Prueba en el celular
1. Conservar la versión anterior y exportar el respaldo del proyecto antes de abrir otra copia: Android puede asignar almacenamiento distinto a cada archivo local.
2. Extraer el ZIP completo en una carpeta nueva y abrir su index.html con el navegador utilizado en la prueba anterior.
3. Abrir GAS → Mi proyecto. Si no aparecen los datos en esta nueva ubicación, importar el respaldo; no volver a ingresar los tramos ni borrar la copia anterior.
4. Con el caso de cinco tramos, tocar Detectar accesorios automáticamente. Deben aparecer dos tees sugeridas, una en A y otra en B, sin el aviso erróneo de volver a conectar los tramos.
5. Confirmar, editar o rechazar una sugerencia; repetir la detección y guardar/recargar. Comprobar que no se duplique y se conserve la decisión. Las piezas pendientes no deben aparecer como confirmadas.
6. Revisar confirmación de foto y guardar el documento de entrega como PDF mediante la impresión del navegador. Comprobar foto, seis columnas y materiales sin controles.

No se publicó, no se conectó IA ni se activó ningún servicio. main permanece intacta.
