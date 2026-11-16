# Auditoría integral GAS: cálculo y materiales

Base: `41a69b8`, rama `prueba/gas-ocultar-restante-en-destino`. Rama nueva: `prueba/gas-auditoria-materiales-coherentes`.

## Causas comprobadas antes de corregir

Se reprodujeron 20 tiras para los 20 segmentos positivos del ensayo cuando `reutilizar=false`: 12 tiras de 25 mm y 8 de 20 mm, 80 m comerciales. No era un error en la suma de 20,60 m ni un resultado SIGAS: el criterio de compra abría una barra por pieza sin reaprovechar. Con exactamente los mismos segmentos y reparto por diámetro, el planificador existente obtiene 4 + 2 tiras al habilitar reaprovechamiento compatible.

Se comprobó una segunda divergencia: el registro de accesorios utiliza la etapa identificada parcial (Cocina todavía a 20 mm), mientras el escenario completo selecciona 25 mm. Por eso la lista registrada y compra reproducían tres llaves candidatas de 20 mm, pero el escenario/documento principal mostraba una de 25 mm y dos de 20 mm. La corrección no cambia tablas ni selecciona diámetros para hacerlos coincidir: proyecta el inventario de resultado desde el mismo resultado por tramo y sus aportes físicos.

Se corrigió un aviso que comparaba el consumo propio cero de los tramos de transporte con su consumo acumulado. Cero propio sin artefacto no es una discrepancia; la acumulación existente ya era correcta y no se modificó.

El informe agrupaba además piezas por nombre y tipo y recuperaba su diámetro desde el primer aporte del mismo nombre. Se agregó diámetro/medidas e identidades a la agrupación, evitando depender de un texto comercial. Se encontró también que la caché del resultado no incluía de manera explícita cortes, geometría, opciones de compra y revisiones; ahora los incluye.

## Correcciones y compatibilidad

La propuesta principal optimiza por defecto con el planificador existente, sin exigir volver a configurar un valor legado que antes se guardaba por defecto como falso. El valor original no se borra. El control existente sigue permitiendo desactivar explícitamente el reaprovechamiento; esa decisión se guarda con procedencia y se imprime claramente. Si se elige ese criterio conservador, pueden seguir resultando 20 barras, con su motivo visible. No se fuerza una compra de seis barras: se genera y comprueba la distribución de cada una.

Se conserva material, sistema, diámetro y estado de medida al agrupar cortes. El reparto se propone solo para piezas compatibles y continuidad conocida. Las uniones se calculan por empalmes internos de las rectas, no por compartir una barra ni por cada codo/tee/llave. Las inserciones, merma y montaje no documentados no se completan con cero técnico: se mantienen los cortes geométricos como orientativos y las medidas netas como declaradas para el ensayo.

Se añadió un inventario de escenario por identidad física, compartido por la proyección de resultados, lista de revisión, presupuesto y PDF. Las vistas no confunden candidatos parciales con los del escenario completo. Una medida realmente registrada o un producto confirmado se conserva; si difiere del diámetro de cálculo, se señala la compatibilidad pendiente. No se copian candidatos a los tramos guardados.

Las tarjetas de revisión conservan sus identificadores y funciones de editar cantidad y marcar Revisado. Al proyectar una vista, esos cambios se propagan al registro editable original y siguen persistiendo. Un ajuste de revisión que contradice el inventario físico queda pendiente de conciliación: no cambia silenciosamente el cálculo hidráulico. Las antiguas revisiones de caños se distinguen de la compra vigente para no sumarlas otra vez. Las opciones de compra quedan abiertas al recalcular. La comparación hidráulica parcial sigue accesible y rotulada como tal; no redefine materiales ni presupuesto.

El PDF agrupa caños por diámetro. Se adaptó la prueba anterior de croquis, que buscaba una única fila de 20,60 m, para verificar la suma de todas las filas y exigir 13,95 y 6,65 m por diámetro. No se eliminó la prueba ni sus controles de cámara, recuperación, cuota y PDF con imagen.

## Resultado numérico reproducido

Los segmentos de referencia ya disponibles se cargaron únicamente en proyectos aislados de prueba, como longitudes netas de ensayo. No se modificaron proyectos reales ni se asignaron esas posiciones automáticamente.

| Tramo | Consumo acumulado kcal/h | Caudal m³/h | Candidato mm | Consulta parcial m | Fila SIGAS m | Capacidad m³/h |
|---|---:|---:|---:|---:|---:|---:|
| M–A | 21800 | 2,344086 | 25 | 24,315 | 26 | 2,427 |
| A–B | 15800 | 1,698925 | 25 | 24,315 | 26 | 2,427 |
| A–Calefactor | 6000 | 0,645161 | 20 | 21,767 | 22 | 1,193 |
| B–Cocina | 11000 | 1,182796 | 25 | 23,295 | 24 | 2,526 |
| B–Termo | 4800 | 0,516129 | 20 | 24,315 | 26 | 1,097 |

| Recorrido | Real m | Equivalente conocido/referencias m | Total parcial m |
|---|---:|---:|---:|
| Calefactor | 12,40 | 9,367 | 21,767 |
| Cocina | 13,95 | 9,345 | 23,295 |
| Termo | 13,95 | 10,365 | 24,315 |

Caudal calculado con PCS de ensayo 9300 kcal/m³. Tabla 3 SIGAS pp.24–25 y Tabla 4 GN p.22, referencia de caída 10 mmca y densidad 0,65. Las consultas usan fila igual o superior, no inferior. No se calculó una pérdida exacta real en Pa.

Compra del ensayo: 25 mm, 13,95 m → cuatro barras de 4 m y 2,05 m sobrantes; 20 mm, 6,65 m → dos barras y 1,35 m sobrantes. Total seis barras, 24 m comerciales, 3,40 m sobrantes, cero cuplas adicionales por los segmentos declarados. Con barras de 6 m, el mismo plan requiere cinco y deja 9,40 m. Son resultados del planificador, no constantes de interfaz ni garantías para geometrías diferentes.

Inventario: 15 codos, dos tees físicas y tres llaves. En el escenario, dos llaves esféricas de 20 mm y una de 25 mm, todavía referencias sin confirmar como piezas instaladas. Las tees aparecen cinco veces como aportes a diferentes recorridos, pero son dos piezas en el inventario físico, una por nodo. Las reducciones propuestas permanecen diferenciadas de las confirmadas.

## Pendientes técnicos reales

Las cuatro conexiones terminales requieren identificación del producto/forma/variante y confirmar si reutilizan piezas ya contabilizadas. Las roscas declaradas de ensayo se conservan; no se vuelven a pedir ni se convierten en diámetros de fusión. Las pérdidas desconocidas no se consideran cero y los candidatos anteriores NO se presentan como definitivos. Se conservan aparte compatibilidad del suministro y aprobación normativa profesional. No se sobredimensiona por ampliaciones futuras.

Sin respaldo adjunto de Android, se reprodujo el camino que genera 20 barras y el caso técnico solicitado con las separaciones de ensayo disponibles. La aplicación conserva y utiliza las posiciones realmente recuperadas de cada proyecto: otro reparto puede dar otra compra. Cortes definitivos requieren productos y ajustes de inserción/merma documentados o longitudes netas ya verificadas. El presupuesto es de cantidades; no se inventaron precios.

## Pruebas y archivos

920 pruebas distintas aprobadas: 847 principales, 41 adicionales de sistemas/materiales, 14 del asistente, 11 regresiones móviles previas, seis nuevas lógicas y una nueva móvil integral. Incluyen capacidades suficientes, recorridos completos, identidades únicas por ruta, metraje/cortes por barra, cambio 4/6/4, control de reaprovechamiento, cantidades, longitudes, consumos, diámetros manuales conservados, persistencia, fotos/croquis, JSON y PDF A4. Se comprobó que una medida confirmada diferente no se sobrescriba.

Fuentes modificadas: `materiales/interfaz-gas.js`, `informes/dimensionamiento-sigas.js` (inventario de resultado/caché, no fórmulas), `informes/interfaz-informe.js`, `informes/documento-proyecto.js`, copia empaquetada `index.html`. Pruebas nuevas `gas-auditoria-integral.test.cjs`, `gas-auditoria-integral-browser.test.cjs` y su fixture; prueba de croquis adaptada a agrupación por diámetro.

Script principal de index.html idéntico byte a byte a la base, tablas originales y motores hidráulicos intactos. AGUA y CLOACAS sin cambios. Navegador Chromium móvil 390 × 844; cámara física y diálogo nativo de impresión Android necesitan revisión final en el teléfono.
