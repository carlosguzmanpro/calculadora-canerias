# Motor SIGAS GN: cálculo tabular trazable, validación técnica pendiente

Rama nueva `prueba/sigas-dimensionamiento-trazable`, basada en `6ff51ef`. Sin modificar main, la rama de producción ni Cloudflare; no se subió ni desplegó esta versión.

## Por qué no había diámetros

El PDF original SIGAS ed.15/2025 está completo: 48 páginas, hash conservado. Están incorporadas Tabla 4 GN p.22 (540 capacidades), Tabla 5 propano p.23 (540), Tabla 3 de accesorios pp.24–25 (202 registros) y Tabla 6 de prolongaciones p.21 (360 valores y 18 vacíos).

El problema no era una ausencia general de tablas. El adaptador tenía `piezas:{}`, regla de longitud sin verificar y condiciones de presión pendientes; el catálogo aprobado permanecía vacío. El motor general rechazaba por esas condiciones antes de seleccionar diámetros. Las cantidades rápidas del inventario no contenían por sí solas variante de producto, vías de tees ni equivalentes aplicables por diámetro.

No se retiraron esos bloqueos del motor definitivo. Se implementó un motor SIGAS independiente para calcular **candidatos condicionados**, con las tablas originales y trazabilidad, sin convertirlos en medidas de ejecución ni escribirlos en los tramos guardados.

## Qué se implementó

- `datos/catalogos/sigas/dimensionamiento.js`: consulta de capacidades GN, selección de menor columna que cubre el caudal consultado, todos los candidatos examinados y sus páginas/filas; recorridos completos y consumo acumulado reutilizados de la red existente; caudal = consumo / poder calorífico del proyecto con fuente. No aplica 9300 automáticamente a proyectos ajenos.
- Semilla con longitudes reales, **sin +15 m EPOXI**. Para la preselección se adopta explícitamente, como hipótesis no normativa, recorrido completo más desfavorable y fila inmediata superior. No interpola ni extrapola. No se presenta esa elección como regla domiciliaria ya verificada del manual.
- Recálculo iterativo de los equivalentes identificados según el vector candidato. Registro de cada iteración, cantidades, productos, páginas, equivalentes conocidos, rutas, longitud consultada, filas y capacidades. Detección de ciclos y límite de iteraciones; falta de convergencia no se presenta como éxito.
- Asignación opcional de producto SIGAS exacto sin volver a cargar cantidades. Codos/llaves se identifican una vez por grupo y se reutilizan en sus recorridos. Las tees admiten vía/producto por recorrido. La pieza física no se duplica por intervenir en varias rutas.
- Cada asignación se vincula al vector de diámetros que se estaba revisando. Si cambia, una combinación sin referencia queda pendiente. Productos de otra marca, tipo o diámetro incompatible se rechazan. No se calculan equivalentes multiplicando automáticamente el N.º de Ø impreso.
- Los equivalentes desconocidos **no se representan como cero**. Se muestran pérdidas conocidas y longitud parcial consultada; la longitud definitiva permanece nula mientras la cobertura no esté confirmada. Que un vector parcial se estabilice no valida las pérdidas faltantes ni la presión.
- Las cuplas y su geometría de compra pueden seguir pendientes sin impedir consultar candidatos. Su pérdida tampoco se presume nula. No se hereda la exclusión de reducciones del método EPOXI.
- Puente/UI `informes/dimensionamiento-sigas.js`: resultados de diámetro candidato primero, tarjetas de una columna en móvil/dos en escritorio, una lista de materiales, trazabilidad/productos en desplegables y recálculo desde el botón habitual. Perfil SIGAS/combustible incompatible no usa GN por defecto.
- Configuración `calculoSigas` por proyecto, conservada por JSON y guardado existentes. Las cantidades, perfiles de otros proyectos, fotos y diámetros originales no se sobrescriben con la preselección.

## Ejercicio listo: no volver a escribir los cinco tramos

Botón **Abrir ejercicio SIGAS · 58 m y 19 codos (proyecto separado)**, dentro de herramientas opcionales. Crea una referencia separada únicamente al pulsarlo. Reabrirla no repone datos ni borra correcciones. Si el nombre ya pertenece a un proyecto del usuario, se detiene sin sobrescribirlo.

El caso contiene 15/5/9/16/13 m, artefactos 16000/3000/10200 kcal/h, 18 codos en los cinco tramos y una pieza adicional declarada como el codo 19. No se inventa su orientación ni posición técnica en el circuito. Las tees A/B conservan sus puntos conocidos. No se añaden reglas para conexiones de artefactos, uniones dobles, entrerroscas ni accesorios del medidor. La regla de casillero de proyectos existentes se mantiene y se coteja para no duplicarla.

Resultado físico: **58 m, 19 codos 90°, 2 tees, 3 llaves, 29200 kcal/h**. Recorridos: 24 m Termo, 36 m Calefactor, 33 m Cocina. No sumar demandas de tramos compartidos para formar la demanda total.

Primera consulta, con **9300 kcal/m³ del ejercicio** y **sin equivalentes aún identificados**:

| Tramo | Demanda kcal/h | Caudal m³/h | Longitud real máxima usada como hipótesis | Fila Tabla4 | Exterior/interior tabulado mm | Capacidad m³/h |
|---|---:|---:|---:|---:|---|---:|
| M–A | 29200 | 3,139785 | 36 m | 36 m | 32 / 24,94 | 4,541 |
| A–B | 13200 | 1,419355 | 36 m | 36 m | 25 / 18,19 | 2,063 |
| A–Termo | 16000 | 1,720430 | 24 m | 24 m | 25 / 18,19 | 2,526 |
| B–Calefactor | 3000 | 0,322581 | 36 m | 36 m | 20 / 13,24 | 0,932 |
| B–Cocina | 10200 | 1,096774 | 33 m | 34 m | 25 / 18,19 | 2,123 |

**Estos cinco números son mínimos de una consulta parcial, NO diámetros calculados para ejecutar esta instalación.** Las pérdidas desconocidas no se han declarado cero. La columna y su capacidad son datos reales de la tabla; las condiciones y el criterio de aplicación a la red no están aprobados todavía. Los números pueden cambiar al completar las pérdidas.

Ejemplo de recálculo comprobado: al identificar los siete codos de M–A como el producto SIGAS normal de 32 mm de la Tabla3 p.24, la aportación conocida es `7 × 1,191 = 8,337 m` para cada recorrido que los atraviesa. El cálculo consulta otra fila (por ejemplo 46 m para la ruta física de 36 m), sin repetir cantidades y conservando pendientes las otras piezas. Es una asignación explícita del usuario, no una inferencia desde la foto ni una afirmación sobre el producto real de ese croquis.

Informe reproducible: `diagnosticos/sigas-cinco-tramos-19.json`; comprobación `npm run verificar:sigas:motor`.

## Validación contra fabricante y pruebas

- Manual pp.26–27: `12,269 + 26,66 = 38,929 m³/h`, fila20m Tabla4: columna50 insuficiente (23,503) y columna63 cubre (43,677). Se reproduce **63 mm**, interior54,84mm. La Tabla6 da40mm para8 medidores/20m, antes de sumar la caldera.
- Tramo de caldera26,66m³/h y20m: se reproduce la columna63mm del ejemplo del fabricante.
- Estos ejemplos son de **prolongaciones**, no una validación independiente del método completo de la red domiciliaria de cinco tramos.
- **665 pruebas automatizadas aprobadas**, 640 anteriores y25 nuevas: 18 unitarias del motor y7 de integración. Incluyen iteración que cambia de diámetro, recálculo de equivalentes, tee compartida con vías distintas, caudal/PCS, tablas/combustibles separados, filas superior/límite, no extrapolación, cantidades/intactas, posiciones desconocidas, presión incompatible, estado parcial, límite de iteraciones, copia de seguridad, ocupación de nombre y conservación de proyectos.
- **Dos pruebas adicionales de Chromium móvil aprobadas**: nueva prueba SIGAS con el ejercicio ya cargado y selección de productos; regresión del cierre anterior para los tres sistemas y regla18/19. Sin errores JS ni desbordamiento. Es emulación390×844, no una prueba en Android físico ni del origen HTTPS.
- Catálogos originales y PDF sin cambios. Continúan las auditorías de datos y los bloqueos de diámetros definitivos. AGUA/CLOACAS, materiales, PDF, CSV, fotos, croquis y respaldos conservan su funcionamiento de regresión.

## Qué falta para dimensionar definitivamente

1. Método aplicable a la red domiciliaria SIGAS, criterio de recorrido/fila superior y simultaneidad. No se importan reglas EPOXI; el texto NAG-200/edición aplicable requiere cotejo independiente.
2. Presión disponible, mínima de los artefactos, pérdida admisible con unidades y fuentes, densidad/poder calorífico del suministro. La tabla imprime caída10mm; no es la presión disponible. No se inventa una pérdida en Pa ni una presión final a partir de las capacidades.
3. Productos reales: variantes de codos y llaves, vía y configuración de las tees, medidas de sus tres conexiones y tratamiento de cambios de diámetro. La cantidad conocida no basta para escoger el producto.
4. Ubicación del codo19 respecto del medidor/regulador y circuito analizado. Contarlo no autoriza asignarle diámetro o pérdida por suposición.
5. Tratamiento de pérdidas de cuplas/reducciones y demás accesorios que correspondan. Posiciones comerciales pendientes no impiden esta consulta parcial, pero tampoco justifican excluir pérdidas del dimensionamiento final.
6. Discrepancias del manual SIGAS conservadas: 24 diferencias entre equivalentes yN.ºØ, reductor75–32 duplicado y capacidades propano75m. No se usa propano en este motor GN, ni valores de FUSIOGAS/EPOXI para resolverlas. Se necesita revisión técnica de las filas utilizadas y comparación completa contra cálculo independiente.

No se anuncia terminado el dimensionamiento definitivo: se entrega un motor numérico condicionado y comprobable, en vez de un bloqueo opaco. Los candidatos no alimentan la compra como diámetros confirmados ni se imprimen como resultado definitivo en el PDF actual.

## Próxima prueba

La rama está solo local: no hay nuevo Preview porque no se autorizó publicación en esta tarea. Al disponer de una copia/vista de esta versión, elegir GAS y abrir la referencia SIGAS desde herramientas opcionales: los cinco tramos ya están cargados. El único botón habitual calcula y muestra candidatos antes de materiales. Abrir la trazabilidad para contrastar fila, capacidad y pendientes; identificar solo productos realmente conocidos, sin volver a ingresar las cantidades. Los proyectos reales existentes se calculan con sus datos actuales, no se reemplazan por el ejemplo.
