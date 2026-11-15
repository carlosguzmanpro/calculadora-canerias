# GAS: recorrido con carga integral por tramo

Base: `269617f` (rama original de ocho pasos). Rama nueva: `prueba/gas-carga-integral-por-tramo`.

Se conservan los controles reales del formulario: origen, destino, metros, consumo propio, artefacto, diámetro opcional y cantidades. Los accesorios aparecen abiertos durante la carga habitual; guardar no cambia de etapa. Cargar otro tramo y Terminé de cargar los tramos permiten continuar deliberadamente. Los campos vacíos siguen pendientes y los ceros se conservan explícitamente.

El recorrido muestra seis etapas: proyecto/sistema (croquis opcional), combustible, tramos completos, revisión de consumos/conexiones, resultados, resumen/PDF. Los identificadores internos de las etapas anteriores se conservan; las antiguas etapas de croquis y accesorios se redirigen a proyecto y tramos sin modificar los datos físicos. El mismo croquis puede consultarse en tramos. Herramientas profesionales y distancias quedan en las opciones avanzadas, sin eliminar el editor anterior.

Los datos documentados del suministro se agrupan en un desplegable. Un botón explícito permite usar PCS 9300 solamente como referencia de ensayo GN; no rellena densidades ni presiones, no funciona para GLP/propano y no sobrescribe propiedades existentes. No habilita una aprobación normativa ni confirma accesorios.

## Conservación

No se modificaron fuentes de motores, tablas, equivalencias, materiales, impresión, fotografía ni respaldo. El script principal de index.html es idéntico byte por byte al de la base. Se regeneraron los 23 scripts locales empaquetados. AGUA y CLOACAS no recibieron cambios.

## Verificación

- Suite `npm test`: 847 aprobadas.
- Nueve archivos de regresiones móviles: 11 pruebas aprobadas (modos, SIGAS, FUSIOGAS/propano, combustibles, croquis normal/cuota/bloqueado, conexiones, cortes, PDF).
- `gas-carga-integral-browser.test.cjs`: 2 pruebas aprobadas; cinco tramos cargados completamente, edición, orientaciones reales de ambas tees, 15 codos y 2 tees, 21800 kcal/h, candidatos 25/25/20/25/20 mm, cambio de modo sin pérdida, recarga, croquis, borrador incompleto y ceros/vacíos diferenciados, PCS previo preservado y PDF A4 generado con identificación y resultados.
- `gas-guiado-ocho-pasos-browser.test.cjs`: 3 regresiones adaptadas al nuevo recorrido aprobadas; proyectos anteriores, foto, cortes, roscas, acceso a AGUA, consumos asociados previos y propiedades propias FUSIOGAS propano.
- Inspección visual Chromium con viewport móvil 390 × 844, sin errores JavaScript ni desborde horizontal. No se dispone de cámara física Android en este entorno: se probaron entradas de archivo y persistencia; la cámara conserva su control original.

Las verificaciones técnicas y accesorios faltantes conservan su alcance: no se declara definitiva una instalación ni se convierten cantidades desconocidas en cero. La prueba de impresión automatizada genera PDF mediante Chromium; guardar/compartir desde el diálogo nativo de Android requiere revisión en el teléfono.
