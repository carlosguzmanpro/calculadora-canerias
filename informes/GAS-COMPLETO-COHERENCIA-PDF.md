# GAS completo: coherencia de presentación y recuperación del PDF

Base: `00bc776`, rama `prueba/gas-rapido-pantalla-simple`.

## Diagnóstico reproducido

El ejemplo conserva 20,60 m, 21.800 kcal/h, 15 codos, dos tees y tres llaves.
Con las cuatro roscas declaradas y las cuatro vías registradas:

- **Solo piezas identificadas:** Cocina presenta 20 mm provisional, consulta parcial de 21,848 m y dos grupos de pérdidas pendientes en ese tramo. No equivale a una comprobación completa.
- **Escenario con referencias documentadas propuestas:** Cocina resulta 25 mm; consulta 22,749 m, fila 24 m y capacidad 2,526 m³/h. Las propuestas no se confirman como piezas instaladas.
- **M–A, cortes actuales:** cero cuplas adicionales; consulta 23,925 m → fila 24 m → 2,526 m³/h. Demanda interna: 21.800 / 9.300 = 2,344086021505376 m³/h. Margen: 0,181913978494623 m³/h, 7,76055045871558 % de la demanda.
- **Comparación con dos uniones estimadas por metraje:** consulta 24,167 m → fila 26 m → 2,427 m³/h. Margen: 0,082913978494624 m³/h, 3,53715596330275 %. Esta condición reproduce las cifras anteriores; no corresponde al ensayo de cortes actual con cero empalmes adicionales. La reproducción se hace solo en una VM de prueba, sin guardar cambios ni instalar sustituciones del motor.

No son errores de las tablas ni se corrigen alterando sus valores. Había resultados de fuentes/condiciones diferentes presentados sin separación suficiente. La caché existente incluye la firma del ensayo de cortes; no se ha reproducido una pérdida de actualización con los datos actuales.

## Presentación

En el modo completo, la tabla principal y la memoria corresponden al escenario vigente. La consulta sobre piezas identificadas permanece disponible como comparación independiente, indicando cuándo es parcial. Los datos propuestos, registrados y pendientes siguen separados.

Cuatro apartados: resultados, materiales/presupuesto, memoria/verificaciones y PDF. Los cortes continúan disponibles en herramientas avanzadas. No se modifica la presentación del modo rápido.

## PDF

Se reutiliza `imprimirInformeActual()` y su preparación existente. Se recupera un botón visible en el resultado completo. El documento incorpora el escenario, memoria y margen vigentes, las roscas registradas y un anexo claramente identificado para la consulta parcial y los materiales registrados.

Prueba de impresión: Chromium móvil emulado, invocación de `window.print()`, generación A4 y comprobación del texto del archivo. La elección de «Guardar como PDF» en el diálogo nativo de un Android físico requiere comprobación del usuario en la Preview.

No se modifican fórmulas, tablas ni motores de SIGAS, FUSIOGAS o EPOXI. La capacidad tabular a 10 mmca continúa diferenciada del suministro y de la aprobación normativa.
