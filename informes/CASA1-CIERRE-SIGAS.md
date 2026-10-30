# Casa 1 · cierre del ejercicio SIGAS GN

Datos definidos por el propietario para el ejercicio: medidor ¾″; Cocina y Calefón ½″; tee A con paso directo hacia Cocina y giro de 90° hacia Calefón; PCS 9300 kcal/m³ exclusivo del ensayo. Se conservan 26 m, 7 codos de 90°, 1 tee, 2 llaves y 30000 kcal/h. Las reducciones independientes siguen sin declarar, no se transformaron en cero. Estos datos no confirman una instalación real.

## CALCULADO · capacidad tabular del escenario

| Tramo | Real m | Consumo acumulado kcal/h | Caudal m³/h | DE mm | Longitud de consulta m | Fila SIGAS m | Capacidad m³/h |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M–A | 12 | 30.000 | 3,225806 | 32 | 26,275 | 28 | 5,149 |
| A–Cocina | 8 | 10.000 | 1,075269 | 25 | 26,275 | 28 | 2,339 |
| A–Calefón | 6 | 20.000 | 2,150538 | 25 | 24,968 | 26 | 2,427 |

Tabla 4, p.22, Manual SIGAS Thermofusión ed.15/2025: GN, densidad relativa 0,65 y caída de referencia 10 mmca. Todas las capacidades cubren el caudal y se consultó una fila igual o superior, sin interpolación ni extrapolación. El troncal gobierna por el recorrido a Cocina, no por su longitud parcial ni por el mayor consumo del artefacto.

| Recorrido completo | Longitud real m | Equivalente m | Total m |
| --- | --- | --- | --- |
| M–A → A–Cocina | 20 | 6,275 | 26,275 |
| M–A → A–Calefón | 18 | 6,968 | 24,968 |

Las longitudes de consulta de las filas compartidas no deben sumarse entre sí: ya contienen el recorrido completo. Cada accesorio aporta una sola vez a cada recorrido.

### Cocina

| Accesorio del escenario | Cantidad | DE mm | LE unitaria m | LE total m | Tabla 3 página |
| --- | --- | --- | --- | --- | --- |
| Codo 90º con rosca hembra 32 x 3/4 | 1 | 32 | 0,543 | 0,543 | 24 |
| Codo Normal a 90º 32 mm | 2 | 32 | 1,191 | 2,382 | 24 |
| Te Normal 32 mm, flujo a través | 1 | 32 | 0,235 | 0,235 | 25 |
| Buje Reducción 32-25 | 1 | 32 | 0,576 | 0,576 | 24 |
| Codo 90º con rosca hembra 25 x 1/2 | 1 | 25 | 0,398 | 0,398 | 24 |
| Codo Normal a 90º 25 mm | 1 | 25 | 0,856 | 0,856 | 24 |
| Llave Esférica 25 mm | 1 | 25 | 0,227 | 0,227 | 25 |
| Unión Normal 32 mm | 2 | 32 | 0,408 | 0,816 | 24 |
| Unión Normal 25 mm | 1 | 25 | 0,242 | 0,242 | 24 |

### Calefón

| Accesorio del escenario | Cantidad | DE mm | LE unitaria m | LE total m | Tabla 3 página |
| --- | --- | --- | --- | --- | --- |
| Codo 90º con rosca hembra 32 x 3/4 | 1 | 32 | 0,543 | 0,543 | 24 |
| Codo Normal a 90º 32 mm | 2 | 32 | 1,191 | 2,382 | 24 |
| Te Normal 32 mm, flujo a 90º | 1 | 32 | 0,928 | 0,928 | 25 |
| Buje Reducción 32-25 | 1 | 32 | 0,576 | 0,576 | 24 |
| Codo 90º con rosca hembra 25 x 1/2 | 1 | 25 | 0,398 | 0,398 | 24 |
| Codo Normal a 90º 25 mm | 1 | 25 | 0,856 | 0,856 | 24 |
| Llave Esférica 25 mm | 1 | 25 | 0,227 | 0,227 | 25 |
| Unión Normal 32 mm | 2 | 32 | 0,408 | 0,816 | 24 |
| Unión Normal 25 mm | 1 | 25 | 0,242 | 0,242 | 24 |

La tee normal de 32 mm es una sola pieza física: 0,235 m para su vía directa y 0,928 m para su giro. Cada recorrido incorpora solo su propio buje 32→25, de 0,576 m. No se suman los dos bujes a un mismo recorrido. Los tres terminales reutilizan codos ya registrados, sin aumentar los siete codos.

### Iteraciones reales

| Ensayo | Tramo | DE mm | Longitud m | Fila m | Capacidad m³/h | Cubre |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | M–A | 32 | 27,011 | 28 | 5,149 | Sí |
| 1 | A–Cocina | 20 | 27,011 | 28 | 1,057 | No |
| 1 | A–Calefón | 25 | 24,968 | 26 | 2,427 | Sí |
| 2 | M–A | 32 | 26,275 | 28 | 5,149 | Sí |
| 2 | A–Cocina | 25 | 26,275 | 28 | 2,339 | Sí |
| 2 | A–Calefón | 25 | 24,968 | 26 | 2,427 | Sí |

20 mm en Cocina no alcanza para su propia longitud con sus accesorios. El motor sube a 25 mm, recalcula la tee, el buje y las equivalencias de ese diámetro y vuelve a verificar. No fija los valores de salida ni modifica las tablas.

## PRESUPUESTADO · compra por diámetro

| Caño DE | Metros físicos | Tiras de 4 m | Metros comerciales | Sobrante m | Cuplas |
| --- | --- | --- | --- | --- | --- |
| 32 mm | 12 | 3 | 12 | 0 | 2 |
| 25 mm | 14 | 4 | 16 | 2 | 2 |

| Material del escenario | Cantidad | Estado |
| --- | --- | --- |
| Codo 90º con rosca hembra 32 x 3/4 | 1 | Cantidad conservada; producto de referencia |
| Codo Normal a 90º 32 mm | 2 | Cantidad conservada; producto de referencia |
| Tee normal SIGAS 32 mm (una pieza, dos vías) | 1 | Cantidad conservada; producto de referencia |
| Buje Reducción 32-25 | 2 | Buje propuesto del conjunto del ejercicio |
| Codo 90º con rosca hembra 25 x 1/2 | 2 | Cantidad conservada; producto de referencia |
| Codo Normal a 90º 25 mm | 2 | Cantidad conservada; producto de referencia |
| Llave Esférica 25 mm | 2 | Cantidad conservada; producto de referencia |
| Unión Normal 32 mm | 2 | Presupuestado; ajustable |
| Unión Normal 25 mm | 2 | Presupuestado; ajustable |

Total: 7 tiras de 4 m = 28 m comerciales, 2 m de sobrante y 4 cuplas presupuestadas (2 en M–A, 1 hacia Cocina y 1 hacia Calefón). No se reaprovechan sobrantes por suposición ni se exige ubicar codos. Las cuplas orientativas se modelan como uniones normales en este escenario, sin declararlas instaladas. Los dos bujes propuestos no se duplican con reducciones independientes desconocidas. Sin precios no se inventa un importe monetario.

## Alcance y pendientes reales

No falta ningún dato imprescindible para completar el escenario numérico del ejercicio con las referencias documentadas utilizadas. No hay pérdidas desconocidas sustituidas por cero.

Referencias automáticas explícitas, no piezas reales confirmadas: terminales estándar con rosca hembra; codos comunes HH; llaves esféricas; tee normal 32 mm con dos bujes MH 32→25; cuatro uniones normales presupuestadas. Las roscas y vías definidas por el propietario se guardan en sus registros existentes; no se confirma el conjunto como instalado ni se aumenta el inventario.

Para verificar una instalación real: comprobar esas variantes y sus cantidades reales (incluidas uniones y posibles reducciones adicionales), documentar suministro y propiedades del gas y realizar la revisión profesional/normativa. La compatibilidad de suministro y la aprobación normativa permanecen separadas. No se calculó una caída exacta en Pa ni se presenta una instalación aprobada.

## Reproducción

node scripts/informe-casa1-cierre.cjs --check verifica este informe volviendo a ejecutar el motor. La prueba móvil carga los mismos datos mediante formularios y selectores existentes, sin asignar resultados. El JSON adjunto contiene entradas y referencias del ejercicio para la importación existente; no carga automáticamente ejemplos en proyectos de usuarios.
