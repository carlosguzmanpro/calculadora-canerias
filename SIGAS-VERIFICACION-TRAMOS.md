# SIGAS: verificación por tramo

Base: prueba/gas-edicion-materiales-compacta, 596af04.

## Fuente y alcance

Manual SIGAS Thermofusión edición 15/2025, PDF original de 48 páginas conservado en fuentes/sigas-ed15-2025/manual-tecnico.pdf. SHA-256: a7dc5dd90adec7d9db335100407d4748f306281b3917e2e52a8f2b707d35e2b1.
Tabla 4, página 22: capacidades de gas natural en m³/h. Tabla 3, páginas 24–25: equivalencias originales por producto y dimensión. No se modifican las tablas ni se sustituyen sus valores impresos por fórmulas.
La comprobación de extracción confirma 540 capacidades GN, 540 de propano, 202 registros de accesorios y 360 celdas de prolongaciones. Esto no constituye validación normativa ni certificación de una instalación.

## Ejercicio conservado

| Tramo | Real m | Codos 90° | Tees | Llaves | Consumo acumulado kcal/h | Candidato exterior mm condicionado |
|---|---:|---:|---:|---:|---:|---:|
| M–A | 15 | 7 | 1 | 0 | 29200 | 32 |
| A–B | 5 | 1 | 1 | 0 | 13200 | 25 |
| A–Termo | 9 | 1 | 0 | 1 | 16000 | 25 |
| B–Calefactor | 16 | 4 | 0 | 1 | 3000 | 20 |
| B–Cocina | 13 | 6 | 0 | 1 | 10200 | 25 |

Totales físicos: 58 m, 19 codos, 2 tees, 3 llaves, 29200 kcal/h. Conversión del ejercicio: 9300 kcal/m³; no se presenta como poder calorífico verificado del suministro real.
El codo adicional permanece separado y asociado técnicamente a B–Cocina; su producto Normal/MH/roscado permanece pendiente. La proyección técnica no modifica el accesorio original guardado ni duplica materiales.
Los recorridos reales son 24 m al termo, 36 m al calefactor y 33 m a la cocina. Las primeras consultas sin equivalencias completas usan esas longitudes, con fila superior disponible, y son parciales.

## Correcciones

- Trazabilidad local de equivalencias conocidas, pérdidas pendientes, recorrido de control, fila, capacidad y demanda por tramo.
- Recalcular equivalencias por diámetro candidato con los productos explícitamente identificados; conservar iteraciones y bloquear longitudes definitivas si no hay convergencia.
- Una tee normal con dimensiones incompatibles con sus tres conexiones candidatas queda pendiente. No se inventan reducciones ni vías.
- Los vínculos de productos individuales dependen de los diámetros de sus conexiones relevantes, conservando lectura de los vínculos antiguos.
- Las cuplas pendientes y accesorios sin identificar no equivalen a pérdida cero, incluso si se marca el inventario como completo.
- Detalles técnicos plegables dentro del resultado existente; pantalla principal, edición compacta, PDF y plano conservados.

## Comprobación numérica controlada

Una prueba selecciona explícitamente para los siete codos de M–A la familia Codo Normal a 90º. A 32 mm, la equivalencia impresa es 1,191 m por unidad: 8,337 m conocidos, contados una vez por recorrido. El recorrido de control alcanza 44,337 m, consulta fila 46 m y capacidad 4,017 m³/h para M–A. Su diámetro candidato sigue en 32 mm. No es una identificación de los productos reales del proyecto.
Con ese único grupo identificado, las otras consultas son: A–B 44,337 m/fila46/capacidad1,825; A–Termo 32,337 m/fila34/2,123; B–Calefactor 44,337 m/fila46/0,825; B–Cocina 41,337 m/fila42/1,910, en m³/h. Todas siguen condicionadas.

## Pendientes para una comprobación completa

Identificar productos y dimensiones de codos, incluido el adicional de cocina; productos de llaves; geometría y tres medidas de cada tee y vía directa/giro por recorrido; conexiones terminales y del medidor; continuidad/uniones necesarias para cuplas. No se inventan ubicaciones ni piezas.
Confirmar condiciones de suministro (presión, pérdida admisible, densidad y poder calorífico aplicables), simultaneidad y aplicabilidad del criterio de recorrido/fila al método validado. Las discrepancias documentales ya registradas, incluidos redondeos y Reductor Anular 75–32, no se resuelven modificando originales. No se extrapolan tablas EPOXI/FUSIOGAS.
Los candidatos mostrados no son diámetros definitivos ni autorización para ejecutar una instalación.

## Verificación

690 pruebas automáticas aprobadas, sin fallos. Cuatro comprobaciones de navegador aprobadas: trazabilidad nueva en vista móvil, edición compacta, SIGAS y cierre. Se verifica conservación tras recarga, cantidades, ausencia de errores JavaScript y desbordamiento horizontal. Chromium con viewport táctil 390×844; no se dispuso de un dispositivo Android físico. Extracción del PDF, empaquetado autónomo y revisión de espacios del diff correctos.

## Corrección de conexiones y recorridos mixtos

La rama sigas-accesorios-por-tramo parte de 596af04 y conserva las correcciones locales de trazabilidad anteriores. Se reutilizan los conteos guardados, sin volver a ingresarlos.
Se reconocen automáticamente cuatro necesidades terminales independientes: salida roscada del medidor, termo, calefactor y cocina. No son cuatro piezas nuevas ni se suman a materiales. Falta identificar el producto, sus medidas y su correspondencia física con las piezas declaradas; permanecen pendientes y bloquean la completitud, incluso si se confirma una familia para el grupo de siete codos de M–A. Esa selección explícita no identifica la salida del medidor ni implica que el grupo sea homogéneo por defecto.
Una pieza no-tee vinculada ambiguamente a varios tramos de distinto diámetro no acepta un producto fijo por coincidir solamente con uno de los diámetros. Debe individualizarse su ubicación/producto; las cantidades no cambian.
La prueba del recorrido de 36 m M–A–B–Calefactor usa, con productos normales explícitamente confirmados para la prueba, las equivalencias originales correspondientes a 32, 25 y 20 mm respectivamente. Cada contribución registra su tramo y diámetro. Se suman las tres equivalencias locales, no se aplica el diámetro troncal a todo el recorrido. Esta prueba controla aritmética y trazabilidad, no identifica los productos reales de la instalación.
El adicional de B–Cocina sigue sin producto Normal/MH asumido. La identificación de tees, sus vías y medidas, llaves, terminales, cuplas y condiciones reales de suministro sigue pendiente. La fotografía no se interpreta automáticamente.
La pantalla aprobada, materiales, tablas originales, PDF, plano y almacenamiento no se modifican para esta corrección; index.html se regenera con los módulos locales.
Verificación final de esta corrección: 694 pruebas automáticas aprobadas; prueba móvil de trazabilidad y regresión de navegador SIGAS aprobadas. Verificación del PDF fuente y empaquetado correctos. Navegador Chromium con emulación móvil, sin dispositivo Android físico.

## Identificación individual de productos (base 068d3c8)

En «Identificar productos SIGAS para las pérdidas» cada grupo no-tee de varias unidades permite «Identificar las N piezas por separado». El desglose técnico tiene identidades estables y cantidades unitarias derivadas del total existente; no altera ni añade materiales. Las piezas permanecen plegadas y no se inventa su producto. Los vínculos del grupo previo se conservan como respaldo y no se copian automáticamente a piezas individuales.
Cada pieza puede vincularse a la necesidad terminal correspondiente a su tramo. Para el medidor, el selector solo ofrece productos roscados SIGAS; un codo común no cubre esa necesidad. Cuando una única pieza física ya contabilizada está vinculada y su producto/diámetro coincide con el catálogo, su equivalencia se suma una sola vez y cubre esa necesidad terminal. La llave sigue siendo independiente. Si hay vínculos terminales ambiguos, productos desconocidos o dimensiones incompatibles, la conexión sigue pendiente.
Prueba controlada explícita: siete codos de M–A se desglosan en uno SIGAS con rosca hembra 32 x 3/4 (0,543 m impresos, p.24) y seis normales de 32 mm (6 x 1,191 m). Total conocido 7,689 m; no es una identificación automática ni una afirmación sobre el producto real instalado. Se mantienen 58 m, 19 codos, dos tees y tres llaves. Sin productos confirmados no se asignan estas equivalencias al ejercicio.
Se corrige además el filtro que podía confundir un codo de 45° cuyo diámetro fuera 90 mm con un codo de 90°. No se modifica ninguna tabla original.
Los desgloses, vínculos y roles se guardan dentro de calculoSigas, compatible con guardado y respaldo JSON existentes. Si cambia el total declarado, se conserva el desglose anterior y se solicita revisarlo sin aplicar sus equivalencias silenciosamente. Los selectores usan exclusivamente el catálogo SIGAS; al seleccionar epoxi o FUSIOGAS no se transfieren productos ni equivalencias de SIGAS. No se habilitan métodos de otras marcas ni diámetros definitivos.
Pendientes reales: confirmar productos, medidas de las roscas y su posición respecto del medidor, vías y dimensiones de tees, variantes de llaves/codos, el adicional de cocina, continuidad/cupla y condiciones de suministro. El croquis y el PDF no se alteran.
Verificación: 699 pruebas automáticas y dos pruebas de navegador móvil (identificación individual y regresión de trazabilidad), sin Android físico. Se comprueban guardado tras recarga, respaldo JSON, cantidades, ausencia de desbordamiento y errores JavaScript; pantalla 390 x 844.
