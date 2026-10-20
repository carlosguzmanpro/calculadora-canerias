# Fuentes, alcance y pendientes de dimensionamiento

Rama experimental `prueba/motor-dimensionamiento-gas`. No hay tablas de producción habilitadas. La ausencia es deliberada: el material y sistema del ejercicio aún no están confirmados.

## Consulta documental

- Listado oficial de normas de instalaciones internas: https://www.enargas.gob.ar/secciones/normativa/normas-tecnicas-items.php?grupo=2 . El listado identifica NAG-200 (1982) y modificaciones; debe consultarse el conjunto aplicable y los requisitos de la distribuidora, no solo un número de tabla.
- Documento encontrado: https://www.enargas.gob.ar/secciones/normativa/pdf/normas-discusion/NAG-200.pdf . Está marcado En consulta pública. NO se adoptó como norma vigente ni se transcribieron sus valores en el programa.
- No se verificaron todavía las Tablas N.º 3 y N.º 18 aportadas por el usuario. Sus títulos/números por sí solos no prueban edición, vigencia ni aplicabilidad al sistema elegido.

## Datos del ejercicio aportados por el usuario

GN. Placas: termotanque 16000, calefactor 3000, cocina 10200 kcal/h. Total: 29200 kcal/h. Tramos y medidas propuestas: M–A 15 m, A–Termotanque 9 m, A–B 8 m, B–Calefactor 6 m, B–Cocina 13 m. El usuario debe confirmar que son medidas de tramo. Si lo son, los recorridos reales completos suman 24, 29 y 36 m. El tramo M–A transporta 29200 y A–B 13200 kcal/h; no se suma el tramo compartido varias veces al inventario.

Referencias de comparación, no entradas del motor: M–A 1", A–Termotanque 3/4", A–B 3/4", B–Calefactor 1/2", B–Cocina 3/4". No se utilizan para generar candidatos ni calibrar una fórmula para que coincida con ellas.

Poder calorífico aproximado del ejercicio: 9300 kcal/m³. Densidad relativa de referencia: 0,65. Tabla N.º 3: caudales por diámetro y longitud, con h=10 mmca; Tabla N.º 18: equivalencias de accesorios roscados. No se interpreta h como presión de suministro del medidor ni se usa el valor aproximado como propiedad comprobada de otra instalación.

## Qué falta para un resultado técnico real

1. Material y sistema exactos, diámetros nominales e interiores reales y productos/accesorios compatibles.
2. Documentos completos, edición, fuentes y verificación de aplicabilidad de capacidades y equivalencias. Recorrido principal y ramal de tees pueden tener pérdidas distintas.
3. Confirmación de longitudes reales y tipo/cantidad/posición de todos los accesorios, incluidas cuplas y llaves; qué cambios se resuelven con una pieza reductora y cuáles requieren una reducción independiente. Las conexiones a artefactos pueden requerir datos adicionales del fabricante; no deben suponerse.
4. Condiciones comprobadas: distribuidora/localidad, GN, densidad, poder calorífico y fuentes; presión disponible, mínima requerida y pérdida admisible en unidades coherentes.
5. Método normativo específico, regla de longitud de cálculo, tratamiento de simultaneidad, rangos y criterio de redondeo. No basta con escribir una referencia normativa en un campo para validarla.
6. Contraste independiente del motor y del catálogo con ejercicios verificados antes de habilitar el resultado en producción.

## Motor implementado y ensayos

El motor evalúa combinaciones de diámetros de menor a mayor diámetro interior. Calcula una sola demanda por tramo físico. Recorre las rutas completas a cada artefacto, añade las equivalencias según las medidas candidatas y exige que el catálogo corresponda al material, sistema y gas. No interpola ni extrapola filas faltantes.

Hay dos adaptadores matemáticos, ambos pendientes de habilitación técnica con un catálogo verificado:

- Pérdida unitaria tabulada por caudal: suma las pérdidas sobre cada ruta con sus longitudes equivalentes. El uso de la relación lineal con longitud solo se admite cuando el catálogo lo verifica para su rango de presión y gas.
- Capacidad por diámetro/longitud: usa la longitud equivalente máxima de la ruta completa que contiene cada tramo, redondeando a una longitud tabulada superior; verifica capacidad y que la caída de referencia esté cubierta por el presupuesto del proyecto. Esa regla solo es aplicable si el método/documento del catálogo la valida. No genera una presión final numérica a partir de una tabla de capacidad.

Se elige la combinación admisible de menor suma de longitud por diámetro interior al cuadrado. Ese criterio de optimización del algoritmo tampoco sustituye las restricciones normativas específicas que deba incluir el catálogo. La búsqueda es exhaustiva y acotada; si supera el límite, no se presenta una solución parcial como definitiva. Si falta información para evaluar algún candidato, se bloquea el resultado aunque otro candidato parezca funcionar.

Las medidas de piezas se generan a partir de los diámetros candidatos. Una tee se cuenta una sola vez con las tres medidas, como igual o reductora. No se agrega una reducción por la diferencia resuelta por esa tee. En una unión recta entre dos tramos se usa cupla o reducción según las medidas; un codo reductor queda como una pieza, si existe en el catálogo. Las piezas no disponibles deben estar declaradas como tales: la ausencia de una fila no equivale a permiso para inventarla.

Los únicos catálogos numéricos incluidos están dentro de `tests/basic.test.cjs`: usan identificadores D-test y valores ficticios, no pulgadas reales, y solo se ejecutan con `modoPrueba`. No se usan en la aplicación, no se guardan en el navegador y están bloqueados en el modo de producción. Son ensayos del algoritmo, no validación normativa ni una demostración de que el ejercicio tenga los diámetros correctos.
