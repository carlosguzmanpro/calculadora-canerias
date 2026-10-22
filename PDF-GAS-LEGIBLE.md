# PDF GAS: etiquetas legibles y tabla de materiales

Base: prueba/tarjetas-compactas-gas, 86e4a85.
Rama nueva: prueba/pdf-gas-legible.

## Cambios sólo de presentación del PDF
El formateador del documento sustituye IDs de tramos por nombres del proyecto (M–A, A–B, A–Termo, B–Calefactor, B–Cocina cuando esos extremos existen). Esto abarca textos de diámetro pendiente, ubicaciones, observaciones y mensajes. Los IDs siguen en los datos originales; no hay migración ni reescritura. Si aparece un ID generado antiguo sin extremos recuperables, se indica Tramo (ubicación pendiente), sin adivinar su recorrido.

La tabla de materiales tiene anchos diferenciados: material 23%, diámetro 14%, cantidad 9%, unidad 8%, estado 20% y ubicación 26%. Conserva las seis columnas; se mejora espaciado, interlineado y contraste entre filas, con ubicaciones separadas en renglones, cabecera repetida y filas que evitan cortes entre páginas cuando el navegador puede respetarlo. Se conservan las reglas A4 existentes. Las filas excepcionalmente largas siguen sujetas a la paginación del navegador.

La fotografía original, su estado de confirmación, la planilla de seis columnas de dimensionamiento, los artefactos y sus consumos permanecen. Cantidades y diámetros faltantes siguen pendientes. Cero no reemplaza a desconocido.

No se cambiaron el cálculo, la agrupación de materiales, la detección, el almacenamiento, la edición, el CSV, las tarjetas de pantalla ni las tablas técnicas. No se habilitaron resultados definitivos. AGUA y CLOACAS conservan su presentación previa. No se publicó ni modificó main.

## Pruebas realizadas
342 casos automáticos aprobados: 337 anteriores y cinco nuevos. Comprueban traducción de los cinco tramos también en textos anidados, conservación de datos y confirmaciones, foto original y sus URL, seis columnas, consumos, números y cantidades pendientes, seguridad de etiquetas con caracteres especiales, ubicaciones agrupadas por renglón y aislamiento de AGUA/CLOACAS.

La prueba de navegador/PDF Playwright se intentó, pero Chromium no pudo iniciar: setsockopt: Operation not permitted (SIGTRAP del entorno). No se generó ni inspeccionó un PDF real en esta ejecución. La paginación y legibilidad visual quedan para comprobar en Android; las pruebas automáticas verifican el documento HTML que se envía a impresión.

## Probar desde Android
1. Conservar la carpeta anterior y exportar un respaldo del proyecto.
2. Extraer el ZIP completo en otra carpeta y abrir index.html con el navegador habitual.
3. Abrir GAS y Mi proyecto. Si la ubicación nueva no recupera los datos locales, importar el respaldo; no volver a cargar tramos ni borrar la versión anterior.
4. Abrir el Documento de entrega de GAS y usar la impresión del navegador → Guardar como PDF, papel A4.
5. Comprobar foto original y confirmación, las seis columnas, artefactos y consumos, y materiales con ubicaciones legibles en renglones. Verificar ausencia de IDs generados visibles, conservación de Pendiente y cantidades originales.
6. Comparar con el PDF anterior del mismo proyecto. La diferencia debe ser sólo de presentación y nombres legibles, sin cambios de cálculo.
