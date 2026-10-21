# Informe limpio de CAÑERÍAS en Android

Base: `prueba/materiales-gas-revision`, commit `2a85068`.
Nueva rama local: `prueba/informe-limpio-android`.

## Qué se corrigió

La incorporación de un borrador confirmado enviaba también los ejemplos simulados a los mismos arreglos de tramos y artefactos del proyecto. La impresión tomaba el DOM de la pantalla, por lo que podía incluir paneles y grandes bloques que desperdiciaban páginas.

Ahora **Mi proyecto** y **Demostración separada** son espacios independientes. Confirmar un ejemplo guarda la práctica en Demostración, cuyo nombre se ve en el selector y en su informe. Cargar un ejemplo sin confirmarlo sigue siendo solo un borrador. No se analiza ninguna fotografía ni se conecta Gemini.

Al recuperar registros antiguos con procedencia explícita `simulado` o `prueba-gemini`, se conservan en `gas.demostracion`. Los datos originales afectados —incluidos red, borrador y revisión de materiales— quedan además copiados en `gas.copiaAntesSepararDemostraciones`. Los nodos usados por tramos reales no se trasladan. No se decide por nombres como “DEMO”: sin procedencia explícita el registro permanece en su lugar. Las conexiones ambiguas siguen requiriendo revisión; no se inventa una red.

La separación se prepara en memoria al recuperar y se persiste con el guardado normal. Nunca se borra el almacenamiento completo. La copia puede ocupar espacio adicional: si el navegador no permite guardar, se muestra el aviso existente; no se eliminan registros para hacerla caber. Fotografías, aclaraciones, perfiles y revisiones de materiales están separados por espacio y especialidad.

## Documento impreso

El documento independiente incluye únicamente los datos del espacio seleccionado: tramos, longitudes, diámetros manuales o pendientes, artefactos, materiales, cantidades, estados, revisión, supuestos y observaciones. Una cantidad pendiente no se transforma en cero; revisar una estimación no la convierte en confirmada. La lista toma los ajustes manuales vigentes y guardados. La vista previa del ejemplo calefón/cocina nunca sustituye los materiales del proyecto al imprimir.

No se copian botones, formularios, instrucciones de uso ni paneles de Gemini. No se incluye un plano vacío: esta versión no genera planos. AGUA y CLOACAS mantienen sus funciones de foto y aclaración, y sus informes no incluyen datos de GAS. Se conservan edición, guardado y descarga CSV de materiales; la salida desde la revisión de materiales mantiene su requisito de revisar todas las filas. El botón general permite imprimir el informe identificando las filas aún sin revisar.

Se pide A4 con márgenes de 12 mm, encabezados de tabla repetidos y filas protegidas de cortes cuando caben en una página. Las tablas pueden continuar en páginas siguientes. El navegador controla la paginación final: no se garantiza un número de páginas para cualquier volumen de datos.

## Prueba desde el celular

1. Conservá la carpeta y la versión anteriores. Descargá y **extraé todo el ZIP** en una carpeta nueva; no abras solo el HTML dentro del archivo comprimido.
2. Abrí `canerias-informe-limpio-android/index.html` con Chrome o el navegador con el que venías probando la versión local. Los archivos de `informes`, `materiales` y `datos` deben permanecer junto al HTML en sus carpetas.
3. Entrá en **GAS** y seleccioná **Mi proyecto**. Revisá que estén los tramos reales. Si el navegador recupera datos mezclados anteriores, los registros con procedencia simulada estarán en **Demostración separada** y aparecerá un aviso de conservación.
4. Abrí la revisión de materiales con tus tramos, corregí una cantidad y revisá las filas. Guardá la revisión y comprobá también la descarga CSV. No hace falta introducir datos de demostración en el proyecto real.
5. Tocá **Imprimir informe / guardar PDF**. En el diálogo de impresión elegí **Guardar como PDF**, papel **A4**, orientación vertical. Desactivá encabezados y pies del navegador si esa opción aparece. Guardá y abrí el PDF.
6. Comprobá tramos, cantidades editadas, estados y observaciones; ausencia de formularios, botones, Gemini y sección vacía de plano; continuación legible de tablas. Si hay muchos tramos, revisá también la segunda página.
7. Para probar el aislamiento, cargá y confirmá un ejemplo revisado usando **Guardar práctica en Demostración**. El selector cambiará a ese espacio. Volvé a **Mi proyecto**: sus tramos, foto y notas deben seguir separados. Recargá y comprobá nuevamente. La apertura inicial vuelve a Mi proyecto.
8. Entrá en AGUA y CLOACAS, anotá aclaraciones distintas e imprimí: no deben aparecer los materiales de GAS.

El guardado depende del navegador y del origen del archivo. Una carpeta nueva o una aplicación distinta puede no mostrar el almacenamiento de la versión anterior: eso no prueba que los registros se hayan borrado. Conservá el archivo anterior, sus datos y el navegador usado. No borres los datos del navegador para actualizar. El ZIP contiene la aplicación, no los proyectos personales que están guardados en tu celular.

## Pruebas y límites

**229 casos aprobados:** 130 de aplicación, 10 de intermediario sin conexión, 14 de tablas, 16 de fotografías/tablas, 19 de auditoría, 18 del diagnóstico calefón/cocina y 22 del planificador de materiales. Son los 216 casos de base más 13 nuevos. Cuatro expectativas anteriores se adaptaron para exigir separación de simulados, conservando sus casos de confirmación, duplicaciones y recarga.

`npm test` pasa sus siete archivos. La prueba adicional `npm run test:browser` se intentó y no pudo iniciar Chromium: restricción del entorno (`setsockopt: Operation not permitted`, SIGTRAP). No se cuenta como aprobada ni como validación visual del PDF; esa comprobación queda para Android. El caso de navegador fue actualizado para comprobar el documento independiente y generar un PDF cuando pueda ejecutarse.

Se comparó con `2a85068`: sin cambios en `datos/`, el planificador físico ni el bloque completo del motor/diagnósticos de dimensionamiento. No hay habilitación normativa, diámetros definitivos, servicios, claves, publicación ni cambios a main.

Archivos modificados: `index.html`, `materiales/interfaz-gas.js`, `tests/basic.test.cjs`, `tests/app.test.cjs`, `README.md`. Nuevos: `informes/ambitos-gas.js`, `informes/documento-proyecto.js`, `informes/interfaz-informe.js` y este informe.
